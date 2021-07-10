<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-button slot="append" icon="el-icon-search"></el-button>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色区域列表 -->
      <el-table :data="rightslist" border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeId(scope.row, item1.id)">{{
                  item1.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限 三级权限-->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeId(scope.row, item2.id)"
                      type="success"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--  三级权限-->
                  <el-col :span="18">
                    <el-tag
                      closable
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      @close="removeId(scope.row, item3.id)"
                    >
                      {{ item3.authName }}{{ i3 }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              @click="dad(scope.row)"
              type="primary"
              icon="el-icon-edit"
              size="mini"
              >编辑</el-button
            >
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
              >删除</el-button
            >
            <!-- 分配 -->

            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 展示分配权限对话框 -->
    <el-dialog
      title="提示"
      @cloes="setDefKeys"
      :visible.sync="setRightDialogVisible"
      width="60%"
    >
      <el-tree
        :data="editRightsList"
        :props="treesProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //控制分配规划框的现实与隐藏
      setRightDialogVisible: false,
      rightslist: [],
      editRightsList: [],
      treesProps: {
        children: 'children',
        label: 'authName',
      },
      //默认选中的权限
      defKeys: [],
      //当前角色id
      roleId: '',
    }
  },
  created() {
    this.getRightslList()
  },
  methods: {
    //获取所有角色的列表
    async getRightslList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status != 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rightslist = res.data
    },
    // 根据ID删除对应的权限
    async removeId(role, rightId) {
      const confirmRes = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
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
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      //重新获取用户列表数据
      this.getRightslList()
      role.children = res.data
    },
    //展示分配选取的对话框
    async showDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status != 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editRightsList = res.data
      //递归获取三级节点
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    //通过递归的形式，获取角色下所有三级权限
    getLeafKeys(node, arr) {
      //如果当前节点不包含children属性 证明是3级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    //监听分配权限对话框的关闭事件
    setDefKeys() {
      //重新复制 清空上一次保存的数组
      this.defKeys = []
    },
    //分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      console.log(keys)
      this.$message.success(res.meta.msg)
      this.getRightslList()
      this.setRightDialogVisible = false
    },
  },
}
</script>