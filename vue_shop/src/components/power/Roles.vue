<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <!-- 添加角色 -->
          <el-button type="primary">添加角色</el-button>

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
                  @click="userDel(scope.row.id)"
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
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 数据列表
      rolesList: [],
      setRightsDialogVisible: false,
      rightsList: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [],
      // 当前即将分配权限id
      roleId: ''
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
