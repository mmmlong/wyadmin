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
      <el-table-column  align="center" label="登录账号">
        <template slot-scope="scope">
          <span>{{scope.row.loginName}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="姓名">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      
      <el-table-column  align="center" label="账户类型">
        <template slot-scope="scope">
          <span>{{scope.row.type | usertype}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="门店">
        <template slot-scope="scope">
          <span>{{scope.row.storeName}}</span>
        </template>
      </el-table-column>
     
      <el-table-column width="140" align="center" label="提交时间">
        <template slot-scope="scope">
          <span>{{scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
     
      <el-table-column align="center" label="操作" min-width="130" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.status!='deleted'" size="mini" type="danger" @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.pageIndex"
        :page-sizes="[20,50,100, 150]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <!--dialog 下面是弹出，大小暂时不用管，再写通用-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px">    
    <el-form :rules="rules" ref="dataForm" :model="from" label-position="right" label-width="120px" style='margin:20px 50px;'>
          <el-form-item label="账号 ：" style="width:350px" prop="loginName">
            <el-input v-model="from.loginName" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="账号密码 ：" style="width:350px">
            <el-input type="password" v-model="from.password" placeholder="请输入"></el-input>
          </el-form-item>
      
          <el-form-item label="账号类型 ：">
              <el-select v-model="from.type" placeholder="请选择">
                <el-option
                  v-for="item in utype"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
          </el-form-item>

          <el-form-item label="选择用户 ：">
              <el-select v-model="from.infoCode" filterable value-key="name" placeholder="输入姓名筛选">
                <el-option
                  v-for="item in userdata"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.phone }}</span>
                </el-option>
              </el-select>
          </el-form-item>

          <el-form-item  v-if="from.type != 1" label="店面 ：">
            <el-select v-model="from.storeName" filterable placeholder="输入店面筛选">
              <el-option
                v-for="item in storeNames"
                :key="item.value"
                :label="item.storeName"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="身份类型 ：" prop="userType">
            <el-select v-model="from.userType" placeholder="请选择">
              <el-option
                v-for="item in userType"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>

            <el-select style="margin-top:5px" v-if="from.userType == 2" v-model="from.parentCode" filterable placeholder="请选择省长">
              <el-option
                v-for="item in parentCode"
                :key="item.value"
                :label="item.name"
                :value="item.code">
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.loginName }}</span>
              </el-option>
            </el-select>
         </el-form-item>

          <el-form-item label="角色组 ：">
            <el-checkbox-group align="left" v-model="glist" @change="handleCheckedAuthChange">
              <el-checkbox v-for="item in authoptions" :label="item.code" :key="item.code">{{item.name}}</el-checkbox>
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
      listQuery: {
        pageIndex: 1,
        pageSize: 20
      },
      userType: [{
          value: 1,
          label: '省长'
        }, {
          value: 2,
          label: '创始人'
        }, {
          value: 0,
          label: '其他'
        }],
      utype :[{
          value: 1,
          label: '公司职员'
        }, {
        value: 2,
        label: '外部客户'
        }],
      // 店面选择
      storeNames:[],
      // 角色组多选
      // 权限多选
      glist: [],
      checkAll: false,
      authoptions: [],
      isIndeterminate: true,

      // 选择用户
      userdata:[],
      infoCode:'',
      // 省长
      parentCode: [],
      //
      from: {
        code: undefined
        
      },
      listUser: {
          pageIndex: 1,
          pageSize: 1000
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑账户',
        create: '新建账户'
      },
      rules: {
        password:[
          {required: true, message: '不能为空', trigger: 'blur'}
          //{pattern: /^\d+$/, message: '只能输入数字' }
        ],
        userType:[
          {required: true, message: '类型必须选择', trigger: 'change' }
        ],
        // type: [{ required: true, message: '类型必须填写', trigger: 'change' }],
        loginName: [{ required: true, message: '字段不能为空', trigger: 'blur' }]
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
      // 账户管理列表
      postajax('/user/listUser',this.listQuery).then(response => {
        this.list = response.object
        this.total = response.page.totle
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
    // 获取用户
    seachuser(value) {
        postajax('/tStaff/staffList',this.listUser).then(response => {
          console.log('获取用户',response)          
          this.userdata = response.object.result
        })
    },
    // 选择角色组
    handleCheckedAuthChange (value) {
      console.log(value)
      let checkedCount = value.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.authoptions.length;
    },
    // 获取角色组
    getgloptions(){
        const postur = {
            pageNum: 1,
            pageSize: 500
        }
        postajax('/tRoleGroup/roleGroupList',postur).then(response => {
          console.log('获取角色组2',response)
          this.authoptions = response.object
        })
    },
    // 获取省长  userType=1:省长 2:创始人 3:合伙人 4:拍档 5:客户
    seachgover(){
        this.listUser.userType = 1 //
        postajax('/user/listUser',this.listUser).then(response => {
          console.log('获取省长',response)
          this.parentCode = response.object
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
    // 删除账户
    
    handleDelete(row) {
      const subfrom = {
        loginName: row.loginName,
        code: row.code
      }
      this.$msgbox.confirm('确认要删除此账号吗？',{
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        postajax('/user/delUser',subfrom).then(response => {
          this.parentCode = response.object
        })
        this.getList()
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      }).catch(() => {
          // 取消就不执行了哈
      });
    },
    resetTemp() {
      this.from = {
        loginName: '',
        password: '',
        mailbox: '',
        infoCode: '',
        storeName:'',
        createTime: '',
        type: '',
        userType: ''
      }
      // 创建的时候清空glist
      this.glist =[]
    },
   handleCreate() {
      this.resetTemp()
      this.seachuser() // 获取用户
      this.getstore() // 获取店面，在点击创建的时候，应该在选择select时触发    
      this.getgloptions() // 获取角色
      this.seachgover() // 获取省长
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
        //  this.from.author = 'admin'
          this.from.glist = this.glist
          postajax('/user/addUser',this.from).then(() => {
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
    handleEdit(row) {
      this.from = Object.assign({}, row) // copy obj
      this.seachuser() // 获取用户
      this.getstore() // 获取店面，在点击创建的时候，应该在选择select时触发    
      this.getgloptions() // 获取角色组
      this.seachgover() // 获取省长
      // 这里要取出数组中的rights的对应rightCode,
      const arights = []
      console.log(this.from.rgList)
      for (const v of this.from.rgList) {
        arights.push(v.groupCode)
      }
      // console.log('arights',arights)
      this.glist = arights
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.from.glist = this.glist
          const from = Object.assign({}, this.from)
          postajax('/user/editUser',this.from).then(() => {
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
    handleFilter(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.loginName = this.listQuery.name;
      this.getList();
    }
    //
  }
}
</script>

<style scoped>
.el-checkbox+.el-checkbox{margin-left:10px}
</style>