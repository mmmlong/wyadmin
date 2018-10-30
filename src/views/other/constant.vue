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

      <el-table-column width="120" align="center" label="序号">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="常量类型">
        <template slot-scope="scope">
          <span>{{scope.row.typeName}}</span>
        </template>
      </el-table-column>
      
      <el-table-column  align="center" label="常量信息">
        <template slot-scope="scope">
          <span>{{scope.row.value}}</span>
        </template>
      </el-table-column>
      <el-table-column width="140" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      <el-table-column width="140" align="center" label="更新时间">
        <template slot-scope="scope">
          <span>{{scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
     
      <el-table-column align="center" label="操作" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
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
    <!--dialog 弹出-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px">
      <el-form :rules="rules" ref="dataForm" :model="from" label-position="left" label-width="100px" style='width: 400px; margin-left:50px;margin-top:20px'>
          <el-form-item label="常量编号 ：" prop="code">
            <el-input v-model="from.code" placeholder="请输入">
            </el-input>
          </el-form-item>


        <el-form-item label="常量类型 ：">
        <el-col :span="24"> 
        <el-autocomplete popper-class="my-autocomplete" v-model="from.typeName" :fetch-suggestions="querySearch" placeholder="请输入内容" @select="handleSelect">
          <i class="el-icon-edit el-input__icon" slot="suffix" @click="handleIconClick"> </i>
          <template slot-scope="props">
            <div class="name">{{ props.item.type_name }}</div>
          </template>
        </el-autocomplete>
        </el-col>
      </el-form-item>    
          
      <el-form-item label="常量信息 ：" prop="value">
        <el-input v-model="from.value" placeholder="请输入">
        </el-input>
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
  name: 'constant',
  directives: {
    waves
  },data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20
      },
      // 输入联想
      restaurants: [],
      typeName: '',
      // 
      from: {},
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑常量',
        create: '添加常量'
      },
      rules: {
        code: [{ required: true, message: '不为空', trigger: 'change' }],
        // typeName: [{ required: true, message: '不为空', trigger: 'change' }],        
        value: [{ required: true, message: '不为空', trigger: 'change' }]
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
      // 常量管理列表
      this.getloadAll()  //  加载常量类型下拉
      postajax('/constantConfigure/getConstantConfigureList',this.listQuery).then(response => {
        // console.log('list数据',response.object)
        this.list = response.object.result
        this.total = response.object.total
        this.listLoading = false
      })
    },
    // select 下拉列表的数据 联想
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // 调用 callback 返回建议列表的数据
      // console.log('返回results',results)
      cb(results);
    },
    // input输入的值
    createFilter(queryString) {
      // console.log(queryString)
      return (restaurant) => {
        return (restaurant.type_name.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    // 常量 加载下拉的类型
    getloadAll() {
      postajax('/constantConfigure/getConstantTypeList',this.listQuery).then(res => {
        this.restaurants = res.object;
      })
    },
    // 变量类型下拉选择的option值
    handleSelect(item) {
      this.from.typeName = item.type_name
    },
    handleIconClick(ev) {
      console.log(ev);
    },
    // 下拉联想结束
    
    // 每页显示多少条
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.getList()
    },
    // 跳转到当前页
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
     handleFilter(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.status = val;
      this.getList();
    },
    resetTemp() {
      this.from = {
        code:'',
        value:'',
        typeName:''
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
    //新增常量
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
        // this.from.id = parseInt(Math.random() * 100) + 1024 // mock a id
        //  this.from.author = 'admin'
          postajax('/constantConfigure/insertConstantConfigure',this.from).then(() => {
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
    // 删除常量
    handleDelete(row) {
      const code = {
        code: row.code
      }
      this.$msgbox.confirm('确认要删除吗？',{
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        postajax('/constantConfigure/deleteConstantConfigure',code).then(() => {
           this.dialogFormVisible = false
          this.getList()
          this.$notify({
            title: '成功',
            message: '常量删除成功',
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
          // 取消就不执行了哈
      });
    },
    //编辑常量
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
          postajax('/constantConfigure/updateConstantConfigure',fromData).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '编辑成功',
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
