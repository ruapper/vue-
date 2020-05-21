<template>
  <div class='login_containter'>
    <div class='login_box'>
      <!-- 头像区 -->
      <div class='avatar_box'>
        <img src='../assets/logo1.jpg' alt />
      </div>
      <!-- 登录表单区 -->
      <!-- username -->
      <el-form ref="loginFormRef" label-width='0px' class='login_form' :model='loginForm' :rules='rules'>
        <el-form-item prop='username'>
          <el-input prefix-icon='iconfont icon-user' v-model='loginForm.username'></el-input>
        </el-form-item>
        <!-- password -->
        <el-form-item prop='password'>
          <el-input prefix-icon='iconfont icon-3702mima' v-model='loginForm.password' type='password'></el-input>
        </el-form-item>
        <!-- button -->
        <el-form-item class='btns'>
          <el-button type='primary' @click="login">登录</el-button>
          <el-button type='info' @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请收入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async valis => {
        if (!valis) return false
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang='less' scoped>
.login_containter {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 350px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  height: 130px;
  width: 130px;
  border-radius: 50%;
  border: 1px solid #eee;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
