function pluralize (time, label) {
  if (time === 1) {
    return time + label
  }
  return time + label + 's'
}

export function timeAgo (time) {
  const between = Date.now() / 1000 - Number(time)
  if (between < 3600) {
    return pluralize(~~(between / 60), ' minute')
  } else if (between < 86400) {
    return pluralize(~~(between / 3600), ' hour')
  } else {
    return pluralize(~~(between / 86400), ' day')
  }
}
// 图片全局路径
export function imgUrl (value) {
  // value = "http://res.weyoo-inc.com:8099/img/" + value //线上图片地址
  value = "http://192.168.1.77:8092/img/" + value
  return value
}
// 定义二网询价状态-及财务管理-省长审核
export function inquiryStatus (status) {
  const statusMaps = {
    1: '待答复',
    2: '已答复',
    3: '待确认',
    4: '已确认',
    5: '其他',
    6: '其他',
    7: '待审核',
    8: '待出账',
    10: '已出账'
  }
  // console.log(statusMaps)
  return statusMaps[status]
}
// 定义询价订单状态
export function inquiryOrderStatus (status) {
  const statusMaps = {
    1: '待提车',
    7: '待审核',
    8: '待出账',
    10: '已出账'
  }
  // console.log(statusMaps)
  return statusMaps[status]
}
// 定义身份类型
export function idetype (status) {
  const statusMaps = {
    1: '省长',
    2: '创始人'
  }
  // console.log(statusMaps)
  return statusMaps[status]
}
// 定义账户类型
export function usertype (status) {
  const statusMaps = {
    1: '公司职员',
    2: '外部客户'
  }
  // console.log(statusMaps)
  return statusMaps[status]
}
// 定义状态颜色
export function statusFilter (status) {
  const statusMap = {
    1: 'danger',
    2: 'info',
    3: 'blue',
    4: 'info',
    7: 'success',
    8: 'warning',
    10: 'info'
  }
  return statusMap[status]
}

// 提车，结算方式等状态
export function ticheStatus (status) {
  const statusMapst = {
    1: '询价',   // 订单类型
    2: '拼团',
    1601: '现金',   // 尾款结算方式
    1602: '刷卡',
    1603: '手机支付',
    2901: '4S店提车',   // 提车方式
    2902: '二网提车',
    3001: '板车',   // 运输方式
    3002: '地跑',
    3101: '中国人寿',   // 保险公司
    3102: '中国平安',
    3103: '太平洋保险',
    3104: '中国人保',
    3105: '中国太平',
    3106: '友邦保险',
    3107: '新华保险',
    3108: '泰康保险',
    3109: '阳光保险',
    3110: '大地保险',
    3111: '其他'
  }
  // console.log(statusMapst)
  return statusMapst[status]
}

export function parseTime (time, cFormat) {
  if (arguments.length === 0) {
    return null
  }

  if ((time + '').length === 10) {
    time = +time * 1000
  }

  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    date = new Date(parseInt(time))
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

export function formatTime (time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) { // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
  }
}

/* 数字 格式化 */
export function nFormatter (num, digits) {
  const si = [
    { value: 1E18, symbol: 'E' },
    { value: 1E15, symbol: 'P' },
    { value: 1E12, symbol: 'T' },
    { value: 1E9, symbol: 'G' },
    { value: 1E6, symbol: 'M' },
    { value: 1E3, symbol: 'k' }
  ]
  for (let i = 0; i < si.length; i++) {
    if (num >= si[i].value) {
      return (num / si[i].value + 0.1).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[i].symbol
    }
  }
  return num.toString()
}

export function html2Text (val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

export function toThousandslsFilter (num) {
  return (+num || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}
