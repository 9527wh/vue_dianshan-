<template>
  <div class="boxd">
    <div class="bnt">
      <div class="toux">
        <img src="../assets/logo.png" alt="" />
      </div>
      <el-form
        ref="loginFromRef"
        :model="loginFrom"
        class="login_from"
        :rules="rulesLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginFrom.username"
            prefix-icon="el-icon-search"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="loginFrom.password"
            prefix-icon="el-icon-search"
          ></el-input>
        </el-form-item>
        <el-form-item class="bnts">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="init" @click="resteLoginFrom">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loginFrom: {
        username: 'admin',
        password: '123456',
      },
      //验证规则
      rulesLogin: {
        //账号
        name: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        //密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 5,
            max: 15,
            message: '长度在 5 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    //点击重置按钮，重置登录表单
    resteLoginFrom() {
      this.$refs.loginFromRef.resetFields()
    },
    login() {
      this.$refs.loginFromRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginFrom)
        console.log(res)
        if (res.meta.status == 200) {
          this.$message.success('登录成功')
        } else {
          this.$message.error('用户不存在或者密码错误')
        }
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('./home')
      })
    },
  },
}
</script>
<style  lang='less'  scoped>
.boxd {
  background-color: #2b4b6b;
  height: 100%;
  position: relative;
}
.bnt {
  width: 400px;
  height: 400px;
  background-color: #fff;
  position: absolute;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  margin: auto;
  border-radius: 20px;
}
.toux {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}
img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}
.bnts {
  display: flex;
  justify-content: flex-end;
}
.login_from {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}
</style>
