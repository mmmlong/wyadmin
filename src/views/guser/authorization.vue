<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container fr">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="输入名称或code" v-model="listQuery.keyword">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-right:10px;" @click="handleCreate" type="primary" icon="el-icon-edit">新增</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">

      <!-- <el-table-column width="120" align="center" label="权限编号">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
        </template>
      </el-table-column> -->
      <el-table-column  align="center" label="权限名称">
        <template slot-scope="scope">
          <span>{{scope.row.nick}}</span>
        </template>
      </el-table-column>
      
      <el-table-column  align="center" label="权限编号">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="权限真实名称">
        <template slot-scope="scope">
          <span>{{scope.row.realName}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="备注">
        <template slot-scope="scope">
          <span>{{scope.row.remark}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" min-width="130" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.status!='deleted'" size="mini" type="danger" @click="handleDelete(scope.row,'deleted')">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.pageIndex"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <!--dialog 下面是弹出，大小暂时不用管，再写通用-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px">    
    <el-form :rules="rules" ref="dataForm" :model="from" label-position="right" label-width="120px" style='width: 400px; margin-left:50px;margin-top:20px'>
          <el-form-item label="权限编号 ：" prop="code">
            <el-input v-model="from.code" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="权限名称 ：" prop="nick">
            <el-input v-model="from.nick" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="权限类型 ：">
              <el-select v-model="from.type" placeholder="请选择">
                <el-option
                  v-for="item in TType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
          </el-form-item>
          
          <el-form-item label="权限真实名称 ：">
            <el-input v-model="from.realName" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="备注 ：" prop="remark">
            <el-input v-model="from.remark" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="权限组 ：">
              <el-input v-model="from.categoryCode" placeholder="请输入"></el-input>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">创建</el-button>
          <el-button v-else type="primary" @click="updateData">保存</el-button>
        </div>
    </el-dialog>
  </div>
</template>

<script>
// 
import { postajax } from '@/api/ajax'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
export default {
  name: 'authorization',
  directives: {
    waves
  },data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageIndex: 1,
        pageSize: 20
      },
      
      statusOptions: ['published', 'deleted'],
      from: {
        code: undefined,
        title: '',
        status: ''
      },
      TType: [{
        value: 1,
        label: '页面'
      }, {
        value: 2,
        label: '接口'
      }],
      grouplist:[],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '权限管理',
        create: '新建权限'
      },
      rules: {
        code:[{required: true, message: '不能为空', trigger: 'blur'},{pattern: /^\d+$/, message: '只能输入数字' }],
        // type: [{ required: true, message: '类型必须填写', trigger: 'change' }],
        nick: [{ required: true, message: '字段不能为空', trigger: 'blur' }],
        code: [{ required: true, message: '字段不能为空', trigger: 'blur' }]
      }
    }
  },
  filters: {
  },
  created() {
    this.getList()
  },
  methods: {
    getList(){
      this.listLoading = true
      // 权限管理
      postajax('/right/listRight',this.listQuery).then(response => {
        // console.log('list数据',response.object.result)
        this.list = response.object
        this.total = response.page.totle
        this.listLoading = false
      })
    },
    //分页
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.getList()
    },

    handleCurrentChange(val) {
      this.listQuery.pageIndex = val
      this.getList()
    },
    resetTemp() {
      this.from = {
        id: undefined,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: ''
      }
    },
   handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          postajax('/right/addRight',this.from).then(() => {
            this.list.unshift(this.from)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleEdit(row) {
      this.from = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const fromData = Object.assign({}, this.from)
          postajax('/right/editRight',fromData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 搜索
     handleFilter(val) {
      this.listQuery.pageNum = 1;
      // this.listQuery.status = val;
      this.getList();
    },
    // 删除角色
    handleDelete(row) {
      const code = {
        code: row.code
      }
      this.$msgbox.confirm('确认要删除吗？',{
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        postajax('/right/delRight',code).then(() => {
          this.dialogFormVisible = false
          this.getList()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
          // 取消就不执行了哈
      });
    }

  }
}
</script>

