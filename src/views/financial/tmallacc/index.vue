<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container" style="text-align:right">
      <el-select @change='handleFilter(listQuery.status)' style="width: 140px" class="filter-item" v-model="listQuery.status">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="输入关键字" v-model="listQuery.keyWord">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('table.search')}}</el-button>
      <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column type="selection" align="center"  width="40"></el-table-column>

      <el-table-column align="center" label="询价单号">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="业务类型">
        <template slot-scope="scope">
          <span>询价</span>
          
        </template>
      </el-table-column>
      <el-table-column align="center" label="天猫定金">
        <template slot-scope="scope">
          <span>{{scope.row.deposit}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="客户">
        <template slot-scope="scope">
          <span>{{scope.row.name}}<br>{{scope.row.phone}}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{scope.row.status | inquiryStatus}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="更新时间">
        <template slot-scope="scope">
         <span>{{scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      
      <el-table-column align="center" label="操作" min-width="90" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status == 3" type="primary" size="mini" @click="handleView(scope.row)">回复</el-button>
          <el-button v-else size="mini" @click="handleView(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.pageNum"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <!--dialog 下面是弹出，大小暂时不用管，再写通用-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="900px">
      <div class="grid-content">
      <div class="inquiry-order">
            
          <div class="Inquiry-reply" style="padding:0 10px"><span style="color:#FF6600;font-weight:800;font-size:18px;float:right">天猫定金 ：￥{{detail.deposit}}</span>确认进账  </div>       
      </div>
      
      <el-row :gutter="20">
        <el-col :span="24">
          
              <table class="table table-bordered" border="1" width="100%" style="border:1px solid #ccc;margin-top:20px">                 
                  <tr>
                      <td width="15%" style="text-align:right;color:#76838F">业务类型：</td>
                      <td width="45%" style="padding-left:5px">询价：</td>
                      <td width="15%" style="text-align:right;color:#76838F">业务编号：</td>
                      <td width="45%" style="padding-left:5px">{{detail.tinquirycode}}</td>
                  </tr>
                   <tr>
                      <td style="text-align:right;color:#76838F">车型：</td>
                      <td style="padding-left:5px">{{detail.cartype}}</td>
                      <td style="text-align:right;color:#76838F">提交人：</td>
                      <td style="padding-left:5px">{{detail.name}} {{detail.phone}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:right;color:#76838F">颜色：</td>
                      <td style="padding-left:5px">{{detail.carcorlor}}</td>
                      <td style="text-align:right;color:#76838F">客户：</td>

                      <td style="padding-left:5px">{{detail.cusName}} {{detail.cusPhone}}</td>
                  </tr> 
                           
              </table>

        <div v-if="(fromtt.status == 3)" :span="12">
           <el-form :rules="rules" ref="dataForm" :model="fromtt" status-icon label-position="left" label-width="130px" style='width: 400px;margin-top:20px; margin-left:50px;'>

            <el-form-item label="天猫订单编号 ：" prop="tianmaoCode">
              <el-input v-model="fromtt.tianmaoCode"  placeholder="请输入">
              </el-input>
            </el-form-item>
            <el-form-item label="支付宝流水号 ：" prop="alipayCode">
              <el-input v-model="fromtt.alipayCode" placeholder="请输入">
              </el-input>
            </el-form-item>
            <el-form-item label="实际入账金额 ：" prop="admissionAmount">
              <el-input v-model="fromtt.admissionAmount" class="filter-item" placeholder="请输入">
              </el-input>
            </el-form-item>
             <input v-model="detail.tinquirycode" class="filter-item" v-show="false">
            <el-form-item label=" 备注 ：">
              <el-input v-model="fromtt.remarks" type="textarea" name="remarks" :autosize="{ minRows: 2, maxRows: 4}">
              </el-input>
            </el-form-item>
          </el-form>
          
               <div slot="footer" class="dialog-footer" style="text-align:right">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary" @click="updateData">确认提交</el-button>
              </div>
          
      </div>
      <div class="" v-else>
        <table class="table table-bordered" border="1" width="100%" style="border:1px solid #ccc;margin-top:20px">                 
            <tr>
                <td width="15%" style="text-align:right;color:#76838F">天猫定金：</td>
                <td width="45%" style="padding-left:5px">{{detail.deposit}}</td>
                <td width="15%" style="text-align:right;color:#76838F">支付宝流水号：</td>
                <td width="45%" style="padding-left:5px">{{detail.alipayCode}}</td>
            </tr>
              <tr>
                <td style="text-align:right;color:#76838F">实际入账金额：</td>
                <td style="padding-left:5px">{{detail.admissionAmount}}</td>
                <td style="text-align:right;color:#76838F">备注：</td>
                <td style="padding-left:5px">{{detail.remarks}}</td>
            </tr>  
        </table>
      </div>
          </el-col>
      </el-row>
    </div>
    </el-dialog>
  </div>
</template>

<script>
// 天猫入账列表
import { postajax } from '@/api/ajax'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'

export default {
  name: 'tmallacc',
  directives: {
    waves
  },
  data() {
    var checkAge = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('实际入账金额不能为空'));
        }
        setTimeout(() => {
            if (value > 99999999) {
              callback(new Error('实际入账金额不超过99999999'));
            } else if(value<0){
              callback(new Error('实际入账金额不能为负值'));
            }else {
              callback();
            }
        }, 300);
      };
    return {
      form:{
        region: '',
      },
      fromtt: {
          tianmaoCode:'',
          alipayCode:'',
          admissionAmount: '',
          remarks:'',
        },
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        status: '3'
      },
      sortOptions: [{ label: '全部', key: '' },{ label: '待确认', key: '3' }, { label: '已确认', key: '4' }],
      statusOptions: ['published', 'deleted'],
      detail: {}, // 
      fromt: {},
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '',
        create: 'Create'
      },
      rules: {
        tianmaoCode: [{ required: true, message: '请输入订单编号', trigger: 'blur' },{pattern: /^[-]?\d+$/, message: '只能输入数字' }],
        alipayCode: [{ required: true, message: '请输入支付宝流水号', trigger: 'blur' },{pattern: /^[-]?\d+$/, message: '只能输入数字' }],
        admissionAmount: [{required: true, validator: checkAge,  trigger: 'blur' },{pattern: /^[-]?\d+$/, message: '只能输入数字' }]
      },
      downloadLoading: false
    }
  },
  filters: {
  },
  created() {
    this.getList()
  },
  
  methods: {
    submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            alert('submit!');
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
    getList(){
      this.listLoading = true
      // 天猫入账
      postajax('/Finance/queryList',this.listQuery).then(response => {
        // console.log('list数据',response.object.result)
        this.list = response.object.result
        this.total = response.object.total
        this.listLoading = false
      })
    },
    getdetails(code){
      // this.listLoading = true
      const InfoQuery = {
        codestr:code
      }
      // 天猫入账详情详情
      postajax('/Finance/modify',InfoQuery).then(response => {
        this.detail = response.object.result[0]
        this.listLoading = false
      })
    },
    handleFilter(val) {
      this.listQuery.pageNum = 1
      // this.listQuery.status = val;
      this.getList()
      
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
    handleModifyStatus(row, status) {
      this.$message({
        message: '回复成功',
        type: 'success'
      })
      row.status = status
    },
    handleView(row) {
      this.fromtt = Object.assign({}, row); // copy obj
      // this.fromtt.timestamp = new Date(this.fromtt.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        // this.$refs['dataForm'].clearValidate()
      })
      this.getdetails(row.code)
    },
    // 确认提交
    updateData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          const fromData = Object.assign({},this.fromtt);
          console.log('确认进账提交',fromData)
          postajax('/Finance/confirmFinanceManager',fromData).then(() => {
            this.getList();
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "操作成功",
              type: "success",
              duration: 2000
            });
            
          });
        }
      });
    },
    // 导出数据
    handleDownload() {
      this.downloadLoading = true
      this.$notify.info({
          title: '提示',
          message: '亲，导出还未做~'
        });
      this.downloadLoading = false
    },
    toggleSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row);
          });
        } else {
          this.$refs.multipleTable.clearSelection();
        }
      },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    }
  }
}
</script>

<style scoped>
 .inquiry-order {
  width: 100%;
  height: 50px;
  background-color: #F3F8FE;
  font-size: 18px;
  line-height: 50px;
}
  table,tr,td{border: #e5e9f2 1px solid}
  tr { display: table-row;vertical-align: inherit;border-color: inherit;line-height:35px;}
  table{background-color: transparent;border-spacing: 0;border-collapse: collapse;display: table;box-sizing: border-box;}
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }

</style>