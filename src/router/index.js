import Vue from 'vue'
import Router from 'vue-router'
const _import = require('./_import_' + process.env.NODE_ENV)
// 在开发环境不使用延迟加载，因为懒加载页面太多会造成WebPACK热更新太慢。所以只能在上线中使用延迟加载；
Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'
/**
* hidden: true                  默认为false
* redirect: noredirect           如果`redirect:noredirect` 不会在面包屑中
* name:'router-name'            <keep-alive>  这个名称必须设置 
*/
export const constantRouterMap = [
  { path: '/login', component: _import('login/index'), hidden: true },
  { path: '/authredirect', component: _import('login/authredirect'), hidden: true },
  { path: '/404', component: _import('errorPage/404'), hidden: true },
  { path: '/401', component: _import('errorPage/401'), hidden: true },
  // 订单询价详情页
  { path: '/ordermanage', component: Layout, redirect: 'noredirect', hidden: true, children: [{ path: 'idetails/:code/:status/:type', component: _import('ordermanage/inquiryorder/idetails'), name: 'idetails', meta: { title: '订单详情', icon: 'dashboard', roles: ['2002'] } }] },
  //
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [{
      path: 'dashboard',
      component: _import('dashboard/index'),
      name: 'dashboard', // 首页
      meta: { title: '首页', icon: 'home', noCache: true }
    }]
  }
]
// 实例化vue的时候只挂载constantRouter
export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

// 异步挂载的路由
// 动态需要根据权限加载的路由表
export const asyncRouterMap = [
  {
    path: '/inquiry',
    component: Layout,
    redirect: 'dashboard',
    meta: { roles: ['4000'] },
    children: [{
      path: 'inquiry',
      component: _import('inquiry/inquiryList'),
      name: 'inquiryList', // 二网询价
      meta: { title: '二网询价', icon: 'xunjia' }
    }]
  },
  {
    path: '/provincial',
    component: Layout,
    redirect: 'dashboard',
    meta: { roles: ['3000'] }, 
    children: [{
      path: 'provincial',
      component: _import('provincial/provincialacc/provincialList'),
      name: 'provincialList', // 省长审核
      meta: { title: '省长审核', icon: 'shenhe' }
    }]
  },
  {
    path: '/ordermanage',
    component: Layout,
    redirect: 'noredirect',
    name: 'ordermanage',
    meta: {
      title: '订单管理',
      icon: 'order',
      roles: ['2000']
    },
    children: [
      {path: 'gbuyorder', component: _import('ordermanage/gbuyorder/index'), name: 'gbuyorder', meta: { title: '拼团订单', roles: ['2001'], noCache: true }},
      {path: 'inquiryorder', component: _import('ordermanage/inquiryorder/index'), name: 'inquiryorder', meta: { title: '询价订单', roles: ['2002'], noCache: true }}
    ]
  },
  {
    path: '/financial',
    component: Layout,
    redirect: 'noredirect',
    name: 'financial',
    meta: {
      title: '财务管理',
      icon: 'caiwu',
      roles: ['1000']
    },
    children: [
      {path: 'tmallacc', component: _import('financial/tmallacc/index'), name: 'tmallacc', meta: { title: '确认进账', roles: ['1001'], noCache: true }},
      {path: 'orderacc', component: _import('financial/orderacc/index'), name: 'orderacc', meta: { title: '确认出账', roles: ['1002'], noCache: true }}
    ]
  },
  {
    path: '/guser',
    component: Layout,
    redirect: 'noredirect',
    name: 'guser',
    meta: {
      title: '账户管理',
      icon: 'peoples',
      // roles: ['5000']
    },
    children: [
      {path: 'account', component: _import('guser/account'), name: 'account', meta: { title: '账户管理', roles: ['5001'], noCache: true }},
      {path: 'user', component: _import('guser/user'), name: 'user', meta: { title: '用户管理', roles: ['5002'], noCache: true }},
      {path: 'authrole', component: _import('guser/authrole'), name: 'authrole', meta: { title: '角色管理', roles: ['5003'], noCache: true }},
      {path: 'rolegroup', component: _import('guser/rolegroup'), name: 'rolegroup', meta: { title: '角色组管理', roles: ['5004'], noCache: true }},
      {path: 'authorization', component: _import('guser/authorization'), name: 'authorization', meta: { title: '权限管理', roles: ['5005'], noCache: true }},
      {path: 'organization', component: _import('guser/organization'), name: 'organization', meta: { title: '组织管理', roles: ['5006'], noCache: true }}
    ]
  },
  {
    path: '/other',
    component: Layout,
    redirect: 'noredirect',
    name: 'other',
    meta: {
      title: '设置',
      icon: 'set',
      roles: ['5000']
    },
    children: [
      {path: 'wystore', component: _import('other/wystore'), name: 'wystore', meta: { title: '店面管理' }},
      {path: 'constant', component: _import('other/constant'), name: 'constant', meta: { title: '常量管理', roles: ['5007'], noCache: true }}
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]
