<template>
<!-- <title>sss</title> -->
<div class="root">
<div class="adminlogin">
<div class="login login-container">
    <el-form class="login-form" autoComplete="on" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left">  
      <div class="login-top">
          <h1 class="title">智选买车后台管理</h1>           
            <!-- <lang-select class="set-language"></lang-select> -->
              <el-form-item prop="loginName">
                <el-input name="loginName" type="text" v-model="loginForm.loginName" autoComplete="on" placeholder="输入用户名" />
              </el-form-item>

                <el-form-item prop="password">
                <el-input name="password" :type="passwordType" @keyup.enter.native="handleLogin" v-model="loginForm.password" autoComplete="on" placeholder="输入密码" />
              </el-form-item>
      </div>
      <div class="clear"></div>
      <div class="login-bottom">
          <el-button class="loginsub" :loading="loading" @click.native.prevent="handleLogin">{{$t('login.logIn')}}</el-button>
      </div>
      <!---->
    </el-form>
     <!---->
</div>
</div> 
</div> 
</template>

<script>
import { isvalidUsername } from '@/utils/validate' //全局公用方法
// import axios from 'axios'
export default {
  name: 'login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('用户名不能为空'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('密码不能为空'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        loginName: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      loading: false,
      showDialog: false
    }
  },
  
  methods: {
    // 提交登录
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          // console.log(this.loginForm);
          this.loading = true
          // store/modules/user.js //登入 登出获取权限
          this.$store.dispatch('LoginByUsername', this.loginForm).then(res => {
            this.loading = false
            this.$router.push({ path: '/' })
          }).catch(() => {
            this.loading = false
          })
        } else {
          // console.log('登录失败！')
          return false
        }
      })
    },
    afterQRScan() {
    }
  },
  mounted: function () {
    //
  },
  created() {
    // window.addEventListener('hashchange', this.afterQRScan)
  },
  destroyed() {
    // window.removeEventListener('hashchange', this.afterQRScan)
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.root{background:url(/static/img/login-bg.jpg);height:100%; background-size:100%; padding:100px 0px 30px 0px;font-size:100%;font-family:'Open Sans',sans-serif;background-size:cover;-webkit-background-size:cover;-moz-background-size:cover;-o-background-size:cover}
.adminlogin .login{width:32%;margin:0 auto}
.adminlogin .login-top{background:rgba(225,225,225,0.1);border-radius:15px 15px 0px 0px;padding:40px 60px;margin-top:15%;text-align:center}
.adminlogin .login-top h1{text-align:center;font-size:27px;font-weight:500;color:#83afca;font-weight:bold;margin:0px 0px 20px 0px}
.adminlogin .login-top input{outline:none;font-size:15px;font-weight:500;color:#fff;padding:15px 20px;background:rgba(10,23,44,0.7);border:1px solid #0f1b31;border-radius:6px;margin:0px 0px 12px 0px;width:88%;-webkit-appearance:none}
.adminlogin .login-bottom button{background:rgba(37, 54, 76,0.9);width:100%;display:block;padding:25px 0 25px 0;border:1px solid #091a2d;border-radius:0px 0px 15px 15px;text-align:center;cursor:pointer;font-size:30px;color:#FFF;border-top:2px solid #091a2d}
.adminlogin .login-bottom button:hover{background:#091a2d;transition:0.5s all;-webkit-transition:0.5s all;-moz-transition:0.5s all;-o-transition:0.5s all}
</style>