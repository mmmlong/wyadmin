import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
// create an axios instance
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 5000 // 请求超时时间
})
// POST传参序列化(添加请求拦截器)
service.interceptors.request.use(config => {
  if (store.getters.token) {
  // if (getToken) {
    config.headers['token'] = getToken() // 让每个请求在headers携带token
  }
  return config
}, error => {
  // 请求错误的话执行
  console.log(error) // for debug
  return Promise.reject(error)
})
// 反应器
service.interceptors.response.use(
// 有修改，增加了返回结果判断 2.24
  response => {
    /**
    * 下面的注释为通过response自定义code来标示请求状态，当code返回如下情况为权限有问题，登出并返回到登录页
    * 如通过xmlhttprequest 状态码标识 逻辑可写在下面error中
    */
    const res = response.data // 返回数据
    // console.log('返回数据',res.successCode)// for debug
    if (res.successCode !== 0) {
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })
      // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
      if (res.successCode === -99) {
        MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        }).catch(() => {
          // 取消就不执行了哈
        })
      }
      if (res.successCode === -88) {
        Message({
          message: '权限受限，请联系管理员',
          type: 'error',
          duration: 5 * 1000
        })
      }
      if (res.successCode === -100) {
        Message({
          message: '登录失败，请重新登录',
          type: 'error',
          duration: 5 * 1000
        })
      }
      return Promise.reject(error)
    } else {
      // console.log('返回res',res)
      return res
    }
  },
  error => {
    console.log('err' + error)// for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
export default service
