import request from '@/utils/request'
// import qs from 'qs' // 引入格式化json
export function loginByUsername (loginName, password) {
  const data = {
    loginName,
    password
  }
  return request({
    url: '/login/userLogin',
    method: 'post',
    data: data
  })
}

export function logout (query) {
  return request({
    url: '/login/loginOut',
    method: 'post',
    data: query
  })
}

export function getUserInfo (token) {
  return request({
    url: '/login/getUserInfo',
    // url: 'http://localhost:8888/json/userinfo.json',
    method: 'post',
    data: token
  })
}
