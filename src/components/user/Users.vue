<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!--用户列表数据 -->
      <el-table style="width: 100%" :data="usersList" border>
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column label="姓名" prop="username"> </el-table-column>
        <el-table-column label="邮箱" prop="email"> </el-table-column>
        <el-table-column label="电话" prop="mobile"> </el-table-column>
        <el-table-column label="角色" prop="role_name"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="usersStateChanged(scope.row)"
            >
              {{ scope.row }}
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="username" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              @click="editUser(scope.row.id)"
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <!-- 删除 -->
            <el-button
              @click="delUser(scope.row.id)"
              type="danger"
              icon="el-icon-delete"
              size="mini"
            ></el-button>
            <!-- 分配 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                @click="UserSs(scope.row)"
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 对话框 --><el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="45%"
      @close="addDialog"
    >
      <el-form
        :model="addFrom"
        :rules="addFromRules"
        ref="addFromRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addFrom.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addFrom.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addFrom.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框-->
    <el-dialog title="修改用户" :visible.sync="ediDdialogVisible" width="45%">
      <el-form
        :model="editFrom"
        :rules="editFromRules"
        ref="editFromRef"
        label-width="70px"
        @close="edutDialogClose"
      >
        <el-form-item label="用户名">
          <el-input v-model="editFrom.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="editFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="ediDdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="aditUsreInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击弹出分配角色框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="assigningdialogVisible"
      width="30%"
      @close="setRoleDialogClose"
    >
      <div>
        <p>当前用户：{{ usersInfo.username }}</p>
        <p>当前角色：{{ usersInfo.role_name }}</p>
        <p>
          分配新角色：<el-select v-model="selectRoleid" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assigningdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //获取用户列表参数对象
      //搜索关键字
      queryInfo: {
        query: '',
        //当前的页数
        pagenum: 1,
        //当前每一页现实多少条数据
        pagesize: 10,
      },
      //用户列表数据
      usersList: [],
      //添加用户表单
      addFrom: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      editFrom: {},
      //添加用户表单验证规则
      addFromRules: {
        //用户名的验证规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '用户名长度在3~15个字符之间',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '密码长度在3~15个字符之间',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '邮箱长度在3~15个字符之间',
            trigger: 'blur',
          },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '手机号长度在3~15个字符之间',
            trigger: 'blur',
          },
        ],
      },
      //修改用户数据表单验证规则
      editFromRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '邮箱长度在3~15个字符之间',
            trigger: 'blur',
          },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '手机号长度在3~15个字符之间',
            trigger: 'blur',
          },
        ],
      },
      //
      total: 0,
      //添加用户开关
      dialogVisible: false,
      //修改用户开关
      ediDdialogVisible: false,
      //分配角色开关
      assigningdialogVisible: false,
      //渲染角色分配页面的基础数据
      usersInfo: {},
      //角色详情
      rolesList: [],
      //已选中的值
      selectRoleid: '',
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      console.log('444')
      console.log(res.data)
      this.usersList = res.data.users
      this.total = res.data.total
    },
    //监听pagesize改变事件
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    //监页码值改变事件
    handleCurrentChange(newpage) {
      console.log(newpage)
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },
    //监听开关状态
    async usersStateChanged(userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    //展示修改对话框
    async editUser(id) {
      console.log(id)
      this.ediDdialogVisible = true
      const { data: res } = await this.$http.get(`users/${id}`)
      console.log(111)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.editFrom = res.data
    },

    //监听修改框
    edutDialogClose() {
      this.$refs.editFrom.resetFields()
    },
    //监听添加用户对话框的关闭事件
    addDialog() {
      this.$refs.addFromRef.resetFields()
    },
    //点击按钮添加新用户
    addUser() {
      this.$refs.addFromRef.validate(async (valid) => {
        console.log(this.addFrom.passwrod)
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addFrom)
        console.log(res.meta.status)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        //隐藏添加的用户对话框
        this.dialogVisible = false
        //重新获取用户列表数据
        this.getUserList()
      })
    },
    //修改用户信息
    aditUsreInfo() {
      this.$refs.editFromRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'users/' + this.editFrom.id,
          {
            email: this.editFrom.email,
            mobile: this.editFrom.mobile,
          }
        )
        console.log(res.meta.status)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

        //隐藏添加的用户对话框
        this.ediDdialogVisible = false
        //重新获取用户列表数据
        this.getUserList()
        this.$message.success(res.meta.msg)
      })
    },
    //删除
    async delUser(id) {
      const confirmRes = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      //如果用户取消了删除.则返回值为字符串cancel
      //如果用户确定了删除.则返回值位字符串confirm
      if (confirmRes !== 'confirm') return this.$message.info('取消了删除')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      //重新获取用户列表数据
      this.getUserList()
      this.$message.success(res.meta.msg)
    },
    //分配权限
    async UserSs(user) {
      this.usersInfo = user
      //在展示对话框之前获取角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.rolesList = res.data
      this.assigningdialogVisible = true
    },
    //提交分配请求
    async saveRoleInfo() {
      if (!this.selectRoleid) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(
        `users/${this.usersInfo.id}/role`,
        {
          rid: this.selectRoleid,
        }
      )
      console.log(222333)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getUserList()
      this.assigningdialogVisible = false
    },
    //重置分配得值
    setRoleDialogClose() {
      this.selectRoleid=''
      this.usersInfo={}
    },
  },
}
</script>