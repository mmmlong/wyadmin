<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container fr">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="输入关键字" v-model="listQuery.keyWord">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-right:10px;" @click="handleCreate" type="primary" icon="el-icon-edit">新增</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">

      <el-table-column width="120" align="center" label="职员编号">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="职员名称">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="职员手机">
        <template slot-scope="scope">
          <span>{{scope.row.phone}}</span>
        </template>
      </el-table-column>
      
      <el-table-column  align="center" label="电子邮箱">
        <template slot-scope="scope">
          <span>{{scope.row.email}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="店面">
        <template slot-scope="scope">
          <span>{{scope.row.storeName}}</span>
        </template>
      </el-table-column>
     
     
      <el-table-column align="center" label="操作" min-width="100" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.status!='deleted'" size="mini" type="danger" @click="handleDelete(scope.row,'deleted')">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.pageNum"
        :page-sizes="[20,50,100, 150]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <!--dialog 下面是弹出，大小暂时不用管，再写通用-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px">    
    <el-form :rules="rules" ref="dataForm" :model="from" label-position="right" label-width="120px" style='width: 400px; margin-left:50px;margin-top:20px'>
          <el-form-item label="职员名称 ：" prop="name">
            <el-input v-model="from.name" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="职员手机 ：" prop="phone">
            <el-input v-model.number="from.phone" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="电子邮箱 ：">
            <el-input v-model="from.email" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="职员等级编号：">
            <el-input v-model="from.staffgradeCode" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="门店编号 ：">
              <el-select v-model="from.storeCode" placeholder="请选择类型">
                <el-option label="公司职员" value="1"></el-option>
                <el-option label="外部客户" value="2"></el-option>
              </el-select>
          </el-form-item>

          <el-form-item label="店面 ：" prop="storeName" :rules="[{ required: true, message: '请选择店面', trigger: 'change'}]">
            <el-select v-model="from.storeName"  filterable placeholder="输入名称筛选">
              <el-option
                v-for="item in storeNames"
                :key="item.value"
                :label="item.storeName"
                :value="item.code">
              </el-option>
            </el-select>
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
import { Message } from 'element-ui'
export default {
  name: 'account',
  directives: {
    waves
  },data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      // 店面选择
      storeNames:[],
      listQuery: {
        pageNum: 1,
        pageSize: 20
      },
      statusOptions: ['published', 'deleted'],
      from: {
        code: '',
        title: '',
        zfb:'',
        money:'',
        status: ''
      },
      grouplist:[],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '用户管理',
        create: '新建用户'
      },
      rules: {
        name:[{required: true, message: '不能为空', trigger: 'blur'}],
        code: [{ required: true, message: '字段不能为空', trigger: 'blur' },{pattern: /^\d+$/, message: '只能输入数字' }],
        phone: [{ required: true, message: '字段不能为空', trigger: 'blur' },{pattern: /^\d+$/, message: '只能输入数字' }],
        email: [{ required: true, message: '邮箱不能为空'}]        
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
      // 用户管理
      postajax('/tStaff/staffList',this.listQuery).then(response => {
        // console.log('list数据',response.object)
        this.list = response.object.result
        this.total = response.object.total
        this.listLoading = false
      })
    },
    // 获取店面
    getstore(){
      postajax('/tStore/storeList',this.listQuery).then(response => {
        console.log('获取店面',response)        
        this.storeNames = response.object.result
      })
    },
    //分页
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.getList()
    },

    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
     handleFilter(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.status = val;
      this.getList();
    },
    // 删除
    handleDelete(row, status) {
      const code ={
        code : row.code
      }
      this.$msgbox.confirm('确认要删除 '+row.name+' 吗？',{
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
         postajax('/tStaff/deleteStaff',code).then(response => {
          this.getList()
        })
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      }).catch(() => {
          // 取消就不执行了哈
      });
    },
    resetFrom() {
      this.from = {
        id: undefined,
        importance: 1,
        remark: '',
        type: ''
      }
    },
   handleCreate() {
      this.resetFrom()
      this.getstore()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // this.from.id = parseInt(Math.random() * 100) + 1024 // mock a id
          // this.temp.author = 'admins'
          postajax('/tStaff/addStaff',this.from).then(() => {
            this.list.unshift(this.from)
            this.dialogFormVisible = false
            this.getList()
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
    // 编辑
    handleUpdate(row) {
      this.from = Object.assign({}, row) // copy obj
      this.getstore()
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
          console.log(fromData)
          postajax('/tStaff/updateStaff',fromData).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '操作成功',
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
  }
  }
}
</script>

