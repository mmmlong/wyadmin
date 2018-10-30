import request from '@/utils/request'

export function fetchList (query) {
  return request({
    url: 'http://localhost:803/json/list.json',
    method: 'get',
    params: query
  })
}

export function fetchArticle () {
  return request({
    url: 'http://localhost:803/json/list.json',
    method: 'get'
  })
}

export function fetchPv (pv) {
  return request({
    url: 'http://localhost:803/json/pvData.json',
    method: 'get',
    params: { pv }
  })
}

export function createArticle (data) {
  return request({
    url: 'http://localhost:803/json/datav.json',
    method: 'post',
    data
  })
}

export function updateArticle (data) {
  return request({
    url: 'http://localhost:803/json/datav.json',
    method: 'post',
    data
  })
}
