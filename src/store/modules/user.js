import { loginByUsername, logout, getUserInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
// import $ from 'jquery'

// 先模拟了用户信息
const user = {
  state: {
    user: '',
    status: '',
    code: '',
    token: getToken(),
    name: '',
    loginName: '',
    avatar: '/static/img/ulogo.png',
    introduction: '',
    permissionList: [],
    setting: {
      articlePlatform: []
    }
  },
  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_LOGINNAME: (state, loginName) => {
      state.loginName = loginName
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, permissionList) => {
      state.permissionList = [permissionList]
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername ({ commit }, userInfo) {
      const loginName = userInfo.loginName.trim()
      // console.log('获取用户信新',loginName)
      return new Promise((resolve, reject) => {
        loginByUsername(loginName, userInfo.password).then(response => {
          // console.log('获取用户信新222',response)
          const data = response.object.tokenInfo
          commit('SET_TOKEN', data.token)
          setToken(data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息,登录的同时获取用户信息
    GetUserInfo ({ commit, state }) {
      // console.log('获取getUserInfo', state)
      const utoken = {
        token: state.token
      }
      return new Promise((resolve, reject) => {
        getUserInfo(utoken).then(response => {
          // console.log('getUserInfo数据',response)
          if (!response.object) { // 
            reject ('error')
          }
          // console.log(response) // 这里按照服务器传回的数组写入
          const data = response.object
          // console.log('获取用户信息返回的data', data)
          commit('SET_ROLES', data.permissionList) // 权限code        
          commit('SET_NAME', data.name)
          commit('SET_LOGINNAME', data.loginName)
          commit('SET_INTRODUCTION', data.storeName)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut ({ commit, state }) {
      const fdata = ({
        loginName: state.loginName
      })
      // 暂时先放前面，点击退出清空token
      // commit('SET_TOKEN', '')
      // commit('SET_ROLES', [])      
      removeToken() 
      // resolve() 
      // 暂时先放前面，点击退出清空token
      // return new Promise((resolve, reject) => {
      //   logout(fdata).then(() => {
      //     commit('SET_TOKEN', '')
      //     commit('SET_ROLES', [])
      //     removeToken()
      //     resolve()
      //   }).catch(error => {
      //     reject(error)
      //   })
      // })
    },

    // 前端 登出
    FedLogOut ({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },

    // 动态修改权限
    ChangeRoles ({ commit }, role) {
      return new Promise(resolve => {
        commit('SET_TOKEN', role)
        setToken(role)
        getUserInfo(role).then(response => {
          const data = response.data
          commit('SET_ROLES', data.permissionList)
          commit('SET_NAME', data.name)
          commit('SET_LOGINNAME', data.loginName)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.storeName)
          resolve()
        })
      })
    }
  }
}

export default user
