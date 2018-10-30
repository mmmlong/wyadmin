<template>
  <div class="app-container calendar-list-container" >
    <div class="filter-container" style="text-align:right">
      <el-select @change='handleFilter(listQuery.status)' style="width: 140px" class="filter-item" v-model="listQuery.status">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="输入关键字" v-model="listQuery.keyWord">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column type="selection" align="center"  width="40"></el-table-column>

      <el-table-column align="center" label="订单编号">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单类型">
        <template slot-scope="scope">
          <span>{{scope.row.orderType | ticheStatus}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="客户">
        <template slot-scope="scope">
          <span>{{scope.row.name}} {{scope.row.phone}}</span>
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
          <el-button v-if="scope.row.status == 8" type="primary" size="mini" @click="handleView(scope.row)">回复</el-button>
          <el-button v-else size="mini" @click="handleView(scope.row)">查看</el-button>
          
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.pageNum"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="1100px">
      
      <div class="inquiry-order">
          <div class="Inquiry-reply">确认出账</div>
      </div>
      <div class="">
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="grid-content">
              <table class="table table-bordered" border="1" width="100%" style="border:1px solid #ccc;margin-top:20px">                 
                  <tr>
                      <td width="15%" style="text-align:right;color:#76838F">订单类型：</td>
                      <td width="45%" style="padding-left:5px">{{detail.order_type | ticheStatus}}</td>
                      <td width="15%" style="text-align:right;color:#76838F">订单编号：</td>
                      <td width="45%" style="padding-left:5px">{{detail.order}}</td>
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
                  <div style="color:#FF6600;font-weight:800;margin-top:30px;font-size:20px">总利润 ：￥{{detail.deposit}}</div>
              
          </div>
    </el-col>
      </el-row>
        <div class='chart-container'>
              <chart height='250px' width='90%'
                :title='"利润分配"'
                :seriesdata="detailts.seriesdata"
              ></chart>
        </div>
        <div slot="footer" v-if="detail.status == 8" class="dialog-footer" style="text-align:right;">
          <el-button @click="dialogFormVisible = false">取消</el-button>          
          <el-button type="primary" @click="updateData(detail.order,detail.status)">确认出账</el-button>
        </div>

        </div>
        
    </el-dialog>
  </div>
</template>
<script>
// 订单出账列表
import { postajax } from '@/api/ajax'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
import chart from '@/components/Charts/mixChart'  // 饼图

export default {
  name: 'orderacc',
  directives: {
    waves
  },
 //饼图
  name: 'mixChart',
  components: { 
    chart
  },
  data() {
    return {
      form:{
        region: '',
      },
      tableKey: 0,
      list: null,
      detail:{},
      detailts:{
        seriesdata:[
          // {value:1,name:'合伙人'}
        ],
      },
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1, // 页码
        pageSize: 20, // 页数
        title: undefined,
        type: undefined,
        status: '8'
      },
      sortOptions: [{ label: '全部', key: '' },{ label: '待出账', key: '8' }, { label: '已出账', key: '10' }],
      from: {
        code: undefined,
        status: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '',
        create: 'Create'
      },
      rules: {
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
    getList(){
      this.listLoading = true
      //订单出账
      postajax('/Finance/queryOrderList',this.listQuery).then(response => {
        this.list = response.object.result
        this.total = response.object.total
        this.listLoading = false
      })
    },
    getdetails(code){
      let _this = this;
      // this.listLoading = true
      const InfoQuery = {
        'code':code,
        'codestr':code
      }
      // 天猫出账详情
      //answerTInquiry/shareProfit
      postajax('/Finance/viewOrdermodify',InfoQuery).then(response => {
        this.detail = response.object
      })
      //饼图
      postajax('/answerTInquiry/shareProfit',InfoQuery).then(response => {
        const data = response.object
        this.detailts.seriesdata = [
          {value:data.partner_profit, name:'合伙人'},
          {value:data.union_profit, name:'联合创始人'},
          {value:data.agent_profit, name:'拍档'},
          {value:data.role_company_profit, name:'服务费'},
          {value:data.dividends_profit, name:'分红池'}
        ]
      })
      this.listLoading = false
    },
    handleFilter(val) {
      this.listQuery.pageNum = 1
      // this.listQuery.status = val
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
      this.fromt = Object.assign({}, row) // copy obj
      // this.from.timestamp = new Date(this.from.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        // this.$refs['dataForm'].clearValidate()
      })
      this.getdetails(row.code)
    },
    // 审核通过
    updateData(code,status) {
      // console.log(code)
        const codestaus = {
          code : code,
          status : status
        }
        postajax('/tBookingCar/confirmByCode',codestaus).then(response => {
          // console.log(response)
          this.getList();
          this.dialogFormVisible = false;
          this.$notify({
            title: "成功",
            message: "提交成功",
            type: "success",
            duration: 2000
          });
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
 .chart-container{
  position: relative;
  padding: 20px;
  width: 100%;
}
</style>