<template>
  <div id="Home">
    <h1>1123123</h1>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>
<script>
export default {
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('./login')
      this.$message.error('退出成功')
    },
  },
}
</script>
<style lang="less" scoped>
</style>
