import request from '@/utils/request'

// axios 请求 url data
export function postajax (url,query) {
  return request({
    url: url,
    method: 'post',
    data: query
  })
}

export function getajax (url,query) {
  return request({
    url: url,
    method: 'get',
    data: query
  })
}
