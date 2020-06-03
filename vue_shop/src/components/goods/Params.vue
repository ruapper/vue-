<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告框 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cate_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            @change="handleChange"
            :props="cascaderProps"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialog = true"
          >添加属性</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(scope.row,i)"
                >{{item}}</el-tag>
                <el-input
                  class="inputNewTag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <!-- 编辑按钮 -->
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialog = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(scope.row,i)"
                >{{item}}</el-tag>
                <el-input
                  class="inputNewTag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <!-- 编辑按钮 -->
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数/属性对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialog" width="50%" @close="addFormClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addParams">确 定</el-button>
        <el-button @click="addDialog = false">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数/属性对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialog"
      width="50%"
      @close="editFormClose"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editParams">确 定</el-button>
        <el-button @click="editDialog = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选择分类的id数组
      selectedKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      // 表单区域
      addDialog: false,
      editDialog: false,
      addForm: {},
      editForm: {},
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      tagAry: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类失败!')
      }
      this.cateList = res.data
    },
    // 选择项发生变化
    handleChange() {
      this.getParamsData()
    },
    // 标签页点击事件
    handleTabClick() {
      this.getParamsData()
    },
    // 获取参数列表
    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return false
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败!')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 重置表单
    addFormClose() {
      this.$refs.addFormRef.resetFields()
    },
    editFormClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败!')
        }
        this.$message.success('添加参数成功')
        this.addDialog = false
        this.getParamsData()
      })
    },
    // 修改参数
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败!')
        }
        this.$message.success('修改参数成功')
        this.editDialog = false
        this.getParamsData()
      })
    },
    async showEditDialog(attrId) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败!')
      }
      this.editForm = res.data
      this.editDialog = true
    },
    // 删除参数
    async deleteParams(attrId) {
      this.$confirm('此操作将永久删除参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.cateId}/attributes/${attrId}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除参数失败!')
          }
          this.$message.success('删除参数成功')
          this.getParamsData()
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
    async handleClose(Form, i) {
      Form.attr_vals.splice(i, 1)
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${Form.attr_id}`,
        {
          attr_name: Form.attr_name,
          attr_sel: Form.attr_sel,
          attr_vals: Form.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败!')
      }
    },

    showInput(row) {
      row.inputVisible = true
      // $nextTick：当前页面元素被重新渲染后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async handleInputConfirm(Form) {
      const inputValue = Form.inputValue
      if (inputValue.trim().length === 0) {
        Form.inputVisible = false
        Form.inputValue = ''
        return false
      }
      if (inputValue) {
        Form.attr_vals.push(inputValue.trim())
      }
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${Form.attr_id}`,
        {
          attr_name: Form.attr_name,
          attr_sel: Form.attr_sel,
          attr_vals: Form.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败!')
      }
      Form.inputVisible = false
      Form.inputValue = ''
    }
  },
  computed: {
    // 禁用按钮判断，true为禁用
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return false
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cate_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 8px;
}
.inputNewTag {
  width: 150px;
}
</style>
