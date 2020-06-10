<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 搜索添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" min-width="4"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" min-width="52"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" min-width="10"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" min-width="7"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" min-width="8">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="12">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.goods_id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="goodsDel(scope.row.goods_id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 20, 50]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>

      <!-- 修改用户对话框 -->
      <el-dialog title="修改商品" :visible.sync="editDialog" width="50%" @close="editFormClose">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="120px">
          <el-form-item label="商品名" prop="goods_name">
            <el-input v-model="editForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格(元)" prop="goods_price">
            <el-input v-model="editForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="editForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editForm.goods_weight"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="edituser">确 定</el-button>
          <el-button @click="editDialog = false">取 消</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 部分参数需要数值格式
    var checkNumber = (rule, value, cb) => {
      const regNumber = /^\/d+$/

      if (regNumber.test(value)) {
        return cb()
      }

      cb(new Error('需输入数字'))
    }
    return {
      // 用户信息参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 编辑表单的验证规则
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ]
      },
      goodslist: [],
      total: 0,
      editDialog: false,
      editForm: {}
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听page改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    editFormClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 跳转至添加商品界面
    goAddPage() {
      this.$router.push('/goods/add')
    },
    // 编辑对话框获取内容
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败!')
      }
      this.editForm = res.data
      this.editDialog = true
    },
    // 编辑商品
    edituser() {},
    // 删除用户
    async goodsDel(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      this.$message.success('删除用户成功')
      this.getGoodsList()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
