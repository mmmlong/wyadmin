import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie

NProgress.configure({ showSpinner: false })// NProgress Configuration

// permissiom judge function
function hasPermission (roles, permissionRoles) {
  if (roles.indexOf('admin') >= 0) return true // 直接通过管理员权限
  if (!permissionRoles) return true
  return roles.some(role => permissionRoles.indexOf(role) >= 0)
}

const whiteList = ['/login', '/authredirect']// 没有重定向的白名单

// 拦截路由
router.beforeEach((to, from, next) => {
  // to 获取菜单配置 meta fullPath等，
  NProgress.start() // start progress bar

  if (getToken()) { // 判断是否有toekn
    /* 如果有 token */
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // 页面不会自动触发，所以手动处理
    } else {
      // console.log()
      if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetUserInfo').then(res => { // 拉取user_info
          // console.log('获取权限roles',res.object.permissionList)
          // 判断下如果账号里面没权限，弹出提示
          if (res.object.permissionList == null) {
            store.dispatch('FedLogOut').then(() => {
              Message.error('你没有权限，请先联系管理员开通！')
              next({ path: '/login' })
            })
          }
          const roles = res.object.permissionList// note: 角色必须是数组: ['editor','develop']
          // const roles = ['2000','2001','2002','4000','1000','1001','1002','3000','5000','5001','5002','5003','5004','5005','5006','5007']// 权限先不放，等线上权限开通了，这里再获取res.object.permissionList的权限，然后生成对应的菜单
          store.dispatch('GenerateRoutes', { roles }).then(() => { // 根据roles权限生成可访问的路由表
            router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,这样导航就不会留下历史记录。
          })
        }).catch(() => {
          store.dispatch('FedLogOut').then(() => {
            Message.error('亲，请先登录哦~')
            next({ path: '/login' })
          })
        })
      } else {
        // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
        /*
        if (hasPermission(store.getters.roles, to.meta.roles)) {
          next()//
        } else {
          next({path: '/401', replace: true, query: { noGoBack: true }})
        }
        */
        next()
        // 可删 ↑
      }
    }
  } else {
    /* has no token */
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next('/login') // 否则全部重定向到登录页
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
