<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <!-- 添加角色 -->
          <el-button type="primary" @click="addDialog = true">添加角色</el-button>

          <!-- 角色列表区 -->
          <el-table :data="rolesList" border stripe>
            <!-- 展开区域 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row
                  :class="['bdbottom',!i1?'bdtop':'','vcenter']"
                  v-for="(item1,i1) in scope.row.children"
                  :key="item1.id"
                >
                  <!-- 一级权限 -->
                  <el-col :span="5">
                    <el-tag closable @close="removeRight(scope.row,item1.id)">{{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 二级、三级权限 -->
                  <el-col :span="19">
                    <el-row
                      :class="[i2?'bdtop':'','bdleft','vcenter']"
                      v-for="(item2,i2) in item1.children"
                      :key="item2.id"
                    >
                      <el-col :span="6">
                        <el-tag
                          type="success"
                          closable
                          @close="removeRight(scope.row,item2.id)"
                        >{{item2.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                      <el-col :span="18" :class="['bdleft']">
                        <el-tag
                          v-for="item3 in item2.children"
                          :key="item3.id"
                          type="warning"
                          closable
                          @close="removeRight(scope.row,item3.id)"
                        >{{item3.authName}}</el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!-- 数据区域 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.id)"
                >编辑</el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="roleDel(scope.row.id)"
                >删除</el-button>
                <!-- 设置按钮 -->
                <el-button
                  type="warning"
                  icon="el-icon-setting"
                  size="mini"
                  @click="setRightsDialog(scope.row)"
                >分配权限</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <!-- 分配权限对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightsDialogVisible"
        width="50%"
        @close="setRightsDialogClosed"
      >
        <el-tree
          :data="rightsList"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 添加角色对话框 -->
      <el-dialog title="添加角色" :visible.sync="addDialog" width="50%" @close="addFormClose">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
          <el-form-item label="角色名" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addrole">确 定</el-button>
          <el-button @click="addDialog = false">取 消</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户对话框 -->
      <el-dialog title="修改用户" :visible.sync="editDialog" width="50%" @close="editFormClose">
        <el-form :model="editForm" ref="editFormRef" label-width="80px">
          <el-form-item label="角色名" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="editrole">确 定</el-button>
          <el-button @click="editDialog = false">取 消</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 数据列表
      rolesList: [],
      editForm: {},
      rightsList: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [],
      // 当前即将分配权限id
      roleId: '',
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [{ required: true, message: '请输入角色名', trigger: 'blur' }]
      },
      // 对话框
      addDialog: false,
      editDialog: false,
      setRightsDialogVisible: false
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    // 删除权限
    async removeRight(roles, rightsId) {
      // 弹窗提示
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${roles.id}/rights/${rightsId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      roles.children = res.data
    },
    // 监听对话框关闭
    addFormClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 新角色添加
    addrole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败!')
        }
        this.$message.success('添加角色成功')
        this.addDialog = false
        this.getRolesList()
      })
    },
    // 编辑对话框获取内容
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败!')
      }
      this.editForm = res.data
      this.editDialog = true
    },
    // 编辑对话框关闭重置
    editFormClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑用户
    editrole() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑用户失败!')
        }
        this.$message.success('编辑用户成功')
        this.editDialog = false
        this.getRolesList()
      })
    },
    // 删除角色
    roleDel(id) {
      this.$confirm('此操作将永久删除角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('删除角色失败!')
          }
          this.$message.success('删除角色成功')
          this.getRolesList()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 展示分配权限对话框
    async setRightsDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightsDialogVisible = true
    },
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框
    setRightsDialogClosed() {
      this.defKeys = []
    },
    // 为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.bdleft {
  border-left: 1px solid #eee;
}
</style>
