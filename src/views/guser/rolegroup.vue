<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container fr">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="输入关键字" v-model="listQuery.name">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-right:10px;" @click="handleCreate" type="primary" icon="el-icon-edit">新增</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">

      <el-table-column width="120" align="center" label="角色组编号">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="角色组名称">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="创建人">
        <template slot-scope="scope">
          <span>{{scope.row.createBy}}</span>
        </template>
      </el-table-column>
      
      <el-table-column align="center" label="提交时间">
        <template slot-scope="scope">
          <span>{{scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
          
     
      <el-table-column align="center" label="操作" min-width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" style="width:80px" type="primary" @click="handleEdit(scope.row)">编辑角色</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.pageNum"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <!--dialog 下面是弹出，大小暂时不用管，再写通用-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px">    
    <el-form :rules="rules" ref="dataForm" :model="from" label-position="right" label-width="120px" style='margin:20px 50px;'>   
      <el-form-item label="角色组名称 ：" prop="name">
        <el-input v-model.number="from.name" style="width:350px" placeholder="请输入"></el-input>
      </el-form-item>
      
        <el-form-item v-if="roleCodeList" label="角色 ：">
        <el-checkbox-group v-model="rolelist" @change="handleCheckedNameChange">
          <el-checkbox v-for="items in roleoptions" :label="items.code" :key="items.code">{{items.name}}</el-checkbox>
        </el-checkbox-group>
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
  name: 'account',
  directives: {
    waves
  },data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      roleCodeList:false,
      listQuery: {
        pageNum: 1,
        pageSize: 20
      },
      listUser: {
        pageNum:1,
        pageSize:100
      },
      statusOptions: ['published', 'deleted'],
      from: {
        // rolelist: []  //自己已有的角色
      },
      // 权限多选
      checkAll: false,
      rolelist: [],  //自己已有的角色  
      roleoptions: [], // 所有角色
      isIndeterminate: true,
      //
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '角色组管理',
        create: '新建角色组'
      },
      rules: {
        name:[{required: true, message: '不能为空', trigger: 'blur'}],
        createBy: [{ required: true, message: '字段不能为空', trigger: 'blur' }],
        ModifyName: [{ required: true, message: '字段不能为空', trigger: 'blur' }],
        
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
      // 角色组列表
      postajax('/tRoleGroup/roleGroupList',this.listQuery).then(response => {
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
    // 角色选择
    handleCheckedNameChange(value) {
      console.log(value)
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.roleoptions.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.roleoptions.length;
    },
    // 
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    resetTemp() {
      this.from = {name:''}
      rolelist:[]
    },
    resetrole(){
      roleoptions:[]
    },
    // 创建角色组
   handleCreate() {
      this.resetTemp() // 创建时清空from内容
      this.dialogStatus = 'create'
      this.roleCodeList = false
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // this.from.author = 'admins'
          postajax('/tRoleGroup/opeTRoleGroup',this.from).then(() => {
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '创建角色组成功',
              type: 'success',
              duration: 3000
            })
          })
        }
      })
    },
    // 获取角色
    getrole(code){
        //先查询所有的角色，如果自己的角色为空的话 走else
        postajax('/role/listRoles',this.listUser).then(response => {
            this.roleoptions = response.object
            console.log('获取所有角色',response) 
        }) 
    },
    // 编辑角色组
    handleEdit(row) {
      this.resetrole() // 清空角色
      this.getrole(row.code) //所有角色
      const myUser= {
        pageNum:1,
        pageSize:100,
        code:row.code
      }
      this.roleCodeList = true
      this.from = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
       // 传code 查询自己的角色
      postajax('/tRoleGroup/queryRoleGroupInfo',myUser).then(response => {
          // 这里要取出数组中的rights的对应roleCode,
          const arights = []
          for (const v of response.object) {
            arights.push(v.roleCode)
          }
          console.log(arights)
          this.rolelist = arights          
      }) 
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.from.rolelist = this.rolelist
      // 提交from数据
      postajax('/tRoleGroup/opeTRoleGroup',this.from).then(() => {
        this.list.unshift(this.from)
        // 角色单独提交
        this.from.codeGroup = this.from.code
        this.from.roleCodeList = this.rolelist        
        postajax('/tRoleGroup/editTRoleAndGroup',this.from).then(() => {
          //
          this.dialogFormVisible = false
          this.getList()
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
          //
        })
        
      })
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
        postajax('/tRoleGroup/deleteRoleGroup',code).then(() => {
          this.dialogFormVisible = false
          this.getList()
          this.$notify({
            title: '成功',
            message: '角色组删除成功',
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
          // 取消就不执行了哈
      });
    },
    // 搜索
    handleFilter(val) {
    // this.listQuery.pageNum = 1;
    // this.listQuery.status = val;
    this.getList();
  }
  }
}
</script>

<style scoped>
.el-checkbox+.el-checkbox{margin-left:10px}
</style>