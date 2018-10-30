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

      <el-table-column width="120" align="center" label="编号">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="角色名称">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="角色备注">
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
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <!--dialog 下面是弹出，大小暂时不用管，再写通用-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="1100px">    
        <el-form :rules="rules" ref="dataForm" :model="from" label-position="right" label-width="120px" style='margin:20px 50px;'>
          <el-form-item label="角色名称 ：" prop="name">
            <el-input style="width:300px" v-model="from.name" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="角色备注 ：" prop="remark">
            <el-input style="width:300px" v-model="from.remark" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="添加权限 ：">
          </el-form-item>

            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            <div style="margin: 5px 0;"></div>
            <el-checkbox-group v-model="from.rights" @change="handleCheckedAuthChange">
              <el-checkbox v-for="item in authoptions" :label="item.code" :key="item.code">{{item.nick}}</el-checkbox>
            </el-checkbox-group>

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
      listQuery: {
        pageNum: 1,
        pageSize: 20
      },
      listPage: {
        pageIndex: 1,
        pageSize: 200
      },
      // 权限多选
      rolelist: [],
      checkAll: false,
      authoptions: [],
      isIndeterminate: true,
      activeNames: ['1'],

      statusOptions: ['published', 'deleted'],
      from: {
        code: undefined,
        rights: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '角色管理',
        create: '新建角色'
      },
      rules: {
        name:[{required: true, message: '不能为空', trigger: 'blur'}],
        // type: [{ required: true, message: '类型必须填写', trigger: 'change' }],
        remark: [{ required: true, message: '字段不能为空', trigger: 'blur' }]
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
      // 角色管理
      postajax('/role/listRoles',this.listQuery).then(response => {
        // console.log('list数据',response)
        this.list = response.object
        this.total = response.object.total
        this.listLoading = false
      })
    },
    
    //权限全选
    handleCheckAllChange(val) {
      console.log(val)
      this.from.rights = val ? this.authoptions : [];
      this.isIndeterminate = false;
    },
    handleCheckedAuthChange (value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.authoptions.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.authoptions.length;
    },
    // 获取所有权限列表
    getauthlist() {
      postajax('/right/listRight',this.listPage).then(response => {
        this.authoptions = response.object
        this.listLoading = false
      })
    },
    //分页
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.getList()
    },

    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
     handleFilter(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.status = val;
      this.getList();
    },
    resetTemp() {
      this.from = {
        remark: '',
        name: '',
        rights: []
      }
      
    },
   handleCreate() {
      this.resetTemp()
      this.getauthlist() // 获取权限列表数据
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
          // this.from.author = 'admin'
          postajax('/role/addRole',this.from).then(() => {
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
    // 编辑角色
    handleEdit(row) {
      this.getauthlist() // 获取权限列表数据      
      this.from = Object.assign({}, row) // copy obj
      // 这里要取出数组中的rights的对应rightCode,
      const arights = []
      for (const v of this.from.rights) {
        arights.push(v.rightCode)
      }
      // console.log('arights',arights)
      this.from.rights = arights
      console.log(this.from.rights)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 保存角色
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const fromData = Object.assign({}, this.from)
          postajax('/role/editRole',fromData).then(() => {
            this.dialogFormVisible = false
            this.getList()
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
        postajax('/role/delRole',code).then(() => {
          this.dialogFormVisible = false
          this.getList()
          this.$notify({
            title: '成功',
            message: '角色删除成功',
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
    this.listQuery.pageNum = 1;
    // this.listQuery.status = val;
    this.getList();
  }
  }
}
</script>

