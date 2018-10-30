<template>
  <div class="app-container">
    <div class="filter-container fr">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="addstore(null)">新增门店</el-button>
    </div>
    <!---->
    <tree-table 
    :data="list" 
    :evalFunc="func" 
    :evalArgs="args"
    :expandAll="expands"
    border>
      <el-table-column label="" width="35">
        <template slot-scope="scope">
          <span  @click="handleLoadHandle(scope.row)">
            <i v-if="!scope.row._expanded" class="el-icon-plus"></i>
            <i v-else class="el-icon-minus"></i>
          </span>
        </template>
      </el-table-column>
      
      <el-table-column label="门店">
        <template slot-scope="scope">
          <span style="color:sandybrown">{{scope.row.storeName}}</span>
        </template>
      </el-table-column>
      
      <!-- <el-table-column label="门店">
        <template slot-scope="scope">
          <span @click="handleLoadHandle(scope.row)">
            <i v-if="!scope.row.isLeaf" class="el-icon-plus"></i> -->
            <!-- <i v-else class="el-icon-minus"></i> -->
            <!-- <i v-else style="width:15px;display:inline-block" class=""></i>
          </span>
          <span v-for="space in scope.row._level" style="width:15px;display:inline-block" :key="space"></span>
          <span style="color:sandybrown">{{scope.row.storeName}}</span>
        </template>
      </el-table-column>-->
      
      <el-table-column label="地址">
        <template slot-scope="scope">
            <div class="processContainer">
              {{scope.row.address}}
            </div>
        </template>
      </el-table-column>
      <el-table-column label="联系人">
        <template slot-scope="scope">
            <div class="processContainer">
              {{scope.row.contactPerson}}
            </div>
        </template>
      </el-table-column>
      <el-table-column label="联系电话">
        <template slot-scope="scope">
            <div class="processContainer">
              {{scope.row.contactNumber}}
            </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="addstore(scope.row)"></el-button>
          <el-button type="primary" size="mini" icon="el-icon-edit"  @click="editstore(scope.row)"></el-button>
          <el-button v-if="scope.row.isLeaf==1" size="mini" icon="el-icon-delete" type="danger"  @click="deletestore(scope.row)"></el-button>
          <!-- <el-button type="text" @click="deletestore(scope.row)">删除</el-button> -->
        </template>
      </el-table-column>
    </tree-table>
    <!---->
    <!--dialog 下面是弹出，大小暂时不用管，再写通用-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px">
      <div class="grid-content">
        <el-form :rules="rules" ref="dataForm" :model="from" label-position="right" label-width="120px" style='width: 400px; margin-left:50px;margin-top:20px'>
          <el-form-item label="门店名称 ：" prop="storeName">
            <el-input v-model="from.storeName" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="联系姓名 ：" prop="contactPerson">
            <el-input v-model="from.contactPerson" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="联系电话：" prop="contactNumber">
            <el-input v-model="from.contactNumber" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="门店地址：" prop="address">
            <el-input v-model="from.address" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="门店描述：">
            <el-input v-model="from.description" placeholder="请输入"></el-input>
          </el-form-item>
          
          <el-form-item label="门店类型：" prop="type">
              <el-select v-model="from.type" placeholder="请选择">
                <el-option
                  v-for="item in storeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
          </el-form-item>

          <el-form-item label="门店范围：" prop="companyType">
              <el-select v-model="from.companyType" placeholder="请选择">
                <el-option
                  v-for="item in companyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
          </el-form-item>

          <el-form-item label="省市区镇：">
            <el-cascader
              ref="cascader"
              v-model="from.cityoption"
              :options="cityoption"
              change-on-select
              @change="handleItemChange"
              :props="props"
            ></el-cascader>
          </el-form-item>

          <el-form-item label="门店设置：">
            <el-switch v-model="switchStauts" @change="changeSwitch" active-text="启用" inactive-text="禁用">
            </el-switch>
          </el-form-item>
        </el-form>
        </div>
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
import treeTable from '@/components/TreeTable'
import treeToArray from './storeEval'  //
export default {
  name: 'wystore',
  components: { 
    treeTable 
  },data() {
    return {
      func: treeToArray,
      dialogFormVisible: false,
      dialogStatus: '',
      from: {},
      update:{},
      parentData:{},
      list: [],
      total: null,
      listLoading: true,
      listQuery: {
        pageIndex: 1,
        pageSize: 20,
        code:0
      },
      textMap: {
        update: '编辑店面',
        create: '新增店面'
      },
      // cityoption: [{
      //   label: '江苏',
      //   cities: []
      // }, {
      //   label: '浙江',
      //   cities: []
      // }],
      parentOption:null,
      cityoption:[{
        label:'',
        value:'',
        cities:[]
      }],
      props:{
        value:'value',
        label:'label',
        children:'cities'
      },
      tmpcode:[],
      // city end
      rules: {
        storeName:[{required: true, message: '不能为空', trigger: 'blur'}] ,
        contactPerson:  [{required: true, message: '不能为空', trigger: 'blur'}] ,
        contactNumber:[{required: true, message: '不能为空', trigger: 'blur'}],
        address:[{required: true, message: '不能为空', trigger: 'blur'}],
        type:[
          {required: true, message: '类型必须选择', trigger: 'change' }
        ],
        companyType:[
          {required: true, message: '类型必须选择', trigger: 'change' }
        ]
      },
      storeOptions :[{
          value: 1,
          label:'直营'
        }, {
        value: 2,
        label:'加盟'
        }],    
      companyOptions :[{
          value: 1,
          label:'内部'}, 
    {value: 2,
    label:'门店'}],      
      switchStauts:true,
      args: [null, null, true],
      expands:true,
      selectOptions:[]
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
      // 店面管理
      postajax('/tStore/list',this.listQuery).then(response => {
        console.log('查询数据',response.object)
        // for(const v of response.object){
        //   this.$set(v, '_expanded', false);
        // }
        this.list = response.object
        this.total = response.object.length
        this.listLoading = false
      })
    },
    changeSwitch(val){
      console.log("val",val)
      if (val) {
        this.from.operateStatus=1
      }else{
        this.from.operateStatus=0
      }
    },
    handleLoadHandle(row){
      this.listLoading = true
      // 店面管理
      const para=Object.assign(this.listQuery,{code:row.code})
      if (this.tmpcode.indexOf(row.code)==-1) {
        this.tmpcode.push(row.code)
        // 如果没有数据 查询
        postajax('/tStore/list',para).then(response => {
          console.log('点击行查询数据',response.object)
          console.log('icon',row._expanded)
          for(const v of response.object){
            this.handleLook(this.list,row.code,v)
          }
          row._expanded = !row._expanded
          this.listLoading = false
          
        })
      }
      row._expanded = !row._expanded
      console.log('row._expanded11',row._expanded)
    },
    getRegionList(row){
      // 省市区镇
      console.log('rowss',row)
      const fromData = {code:0}
      postajax('/region/regionList',fromData).then(response => {
        const data=response.object
        this.cityoption=data.map(v=>{
          return {
            label:v.city,
            value:v.code,
            parentCode:v.parentCode,
            level:v.level,
            cities:[]
          }
        })
        // const options=[]
        // for (const v of response.object) {
        //   const optionData=Object.assign({}, {label:v.city,value:v.code,parentCode:v.parentCode,level:v.level,cities:[]})
        //   options.push(optionData)
        // }
        // this.cityoption=options
      })
    },
    //省市区级联递归查找父选项
    handleSearch(response,code){
       // console.log('5',response)
        for (var i =0;i< response.length; i++) {
        if (response[i].value==code) {
           // console.log('6',response[i])
            this.parentOption=response[i]
          }else if(response[i].hasOwnProperty("cities")){
            // console.log('7',response[i])
            this.handleSearch(response[i].cities,code)
          }
        }
    },
    // 动态加载次级
    handleItemChange(val) {
      // this.selectOptions=[]
      // this.selectOptions=val
      console.log('active1:', val)
      // console.log('selectOptions:', this.selectOptions)
      const handleItemStartCode=val[0]
      const handleItemCode=val[val.length-1]
      const Municipality=["1","2","3","4","23","32","84","52993"]
      // console.log('active21:', handleItemStartCode)
      // console.log('active31:', handleItemCode)
      setTimeout(_ => {
        const para={code:handleItemCode}
         // console.log('2',this.cityoption)
         // console.log('3',handleItemStartCode)
        // console.log('3',this.parentOption)
        const list = this.cityoption.filter(v=>v.value==handleItemStartCode)
        console.log('4',list)
        this.handleSearch(list,handleItemCode)
        postajax('/region/regionList',para).then(response=>{
          console.log('动态加载次级选项',response.object)
          if (response.object.length>0) { 
            const options=[]
            for (const v of response.object) {
              if (v.level=="4"||v.level==3&&Municipality.indexOf(handleItemStartCode)>-1) {
              //最后一级不动态加载 直辖市就是3级
                  var optionData=Object.assign({}, {label:v.city,value:v.code,parentCode:v.parentCode,level:v.level})
              }else{
                var optionData=Object.assign({}, {label:v.city,value:v.code,parentCode:v.parentCode,level:v.level,cities:[]})
              }
              options.push(optionData)
            }
            if(handleItemCode.indexOf(this.parentOption.value)>-1&&!this.parentOption.cities.length){
                this.parentOption.cities=options
            }
          }else{
            delete this.parentOption.cities
            console.log('last',this.parentOption)
            console.log('all',this.cityoption)
          }
        })
      }, 300);
    },
    resetTemp() {
      this.from = {
        storeName:'',
        contactPerson:'',
        contactNumber:'',
        address:'',
        description:'',
        operateStatus:'',
        type:'',
        companyType:'',
        provinceCode:'',
        cityCode:'',
        areaCode:'',
        townCode:'',
        operateStatus:'1'
      }
    },
    //树表格递归查找父节点 并动态添加子节点
    handleLook(rowdata,rowcode,newChild){
      for(var v of rowdata){
        if (v.code==rowcode) {
          if (!v.children) {
              this.$set(v, 'children', [])
            }
            v.isLeaf=0 //创建子节点后 当前节点设置为非叶子节点
            v.children.push(newChild)           
            break;
        }else if(v.hasOwnProperty("children")){
          this.handleLook(v.children,rowcode,newChild)
        }
      }
    },
    append(newcode,row) {
      console.log('当前行数据',this.parentData)
      console.log('插入的数据',row)
      const newChild = Object.assign({code:newcode,isLeaf:1}, row)//默认添加的都是叶子节点
      // const newChild = { code: 121, storeName: '测试门店121', address:'测试地址121'};
      console.log('newchild',newChild)
      if (this.parentData.code) {
        this.handleLook(this.list,this.parentData.code,newChild)
      }else{
        this.list.push(newChild)
      }
      console.log('data值是否动态修改',this.list)
    },
    //树表格递归查找父节点 并动态删除子节点
    deleteRow(rowdata,code,parentCode){
      for(var v of rowdata){
        if (v.code==parentCode) {
          var rowindex=v.children.indexOf(code)
          v.children.splice(rowindex,1)
          v.isLeaf=1      
          break;
        }else if (v.hasOwnProperty("children")) {
          this.deleteRow(v.children,code,parentCode)
        }
      }
    },
    addstore(row) {
      this.parentData = Object.assign({}, row) // copy obj
      console.log('111',row)
      this.resetTemp()
      console.log('this.from.operateStatus',this.from.operateStatus)
      this.switchStauts=true
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.getRegionList(row) //获取省市区
      // this.$message.info(row.storeName)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    editstore(row) {  
      // this.resetTemp()
      console.log('operateStatus',row.operateStatus)
      this.from =row// copy obj}
      if (row.operateStatus=="1") {
        this.switchStauts=true
      }else if (row.operateStatus=="0") {
        this.switchStauts=false
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.getRegionList(row) //获取省市区
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    deletestore(row){
      // 删除角色
      const code = {
        code: row.code
      }
      this.$msgbox.confirm('确认要删除吗？',{
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        postajax('/tStore/deleteStore',code).then(() => {
          this.dialogFormVisible = false
          console.log('del',row.parentCode)
          if (row.parentCode!=0) {//如果删除节点不是根节点 动态手动删除
            this.deleteRow(this.list,row.code,row.parentCode)
          }else{
            this.getList()
          }
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
          // 取消就不执行了哈
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) { 
          console.log('fr',this.parentData.code)
          if (this.parentData.code) {
            var fromData = Object.assign({parentCode:this.parentData.code}, this.from)
          }else{
            var fromData = Object.assign({parentCode:0}, this.from)
          }
          
          console.log('新增数据',fromData)
          postajax('/tStore/opeStore',fromData).then(response => {
            // this.list.unshift(fromData)
            console.log('新增成功后返回的code',response.object)
            this.dialogFormVisible = false
            this.append(response.object,fromData)
            // this.getList()
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
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          //this.resetTemp()
          const formatstr=["_expanded","_level","_width","_show","_marginLeft","parent"]
          for (var v in this.from) {
            if(formatstr.indexOf(v)>-1){
              delete this.from[v]
            }
          }
          // console.log('from.cityoption',this.from.cityoption)
          // const codelist=["provinceCode","cityCode","areaCode","townCode"]
          // for(var i=0;i<this.from.cityoption.length;i++){//绑定联动选择的值
          //   var codefrom=codelist[i]
          //   this.from[codefrom]=this.from.cityoption[i]
          // }
          // console.log('from',this.from)
          postajax('/tStore/opeStore',this.from).then(response => {
            console.log('999',response)
            this.dialogFormVisible = false
            // 成功之后插入到当前节点中
            //this.append(response.object,fromData)
            //this.getList()
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    }
    //
  }
}
</script>