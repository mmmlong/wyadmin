<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container" style="text-align:right">
      <el-select @change='handleFilter(listQuery.status)' style="width: 140px" class="filter-item" v-model="listQuery.status">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="输入客户姓名或手机" v-model="listQuery.keyWord">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row  @selection-change="handleSelectionChange" ref="multipleTable" style="width: 100%">
      <el-table-column type="selection" align="center"  width="40"></el-table-column>

      <el-table-column align="center" label="询价订单">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="意向车型">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.brand+scope.row.series+scope.row.Models+scope.row.Year+scope.row.GuidingPrice+'万'" placement="top-start">
          <span class="wenzi">{{scope.row.brand}} {{scope.row.series}} {{scope.row.Models}} {{scope.row.Year}} {{scope.row.GuidingPrice}}万</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" label="提交人">
        <template slot-scope="scope">
          <span>{{scope.row.name}}<br>{{scope.row.login_name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="客户">
        <template slot-scope="scope">
          <span>{{scope.row.tcname}}<br>{{scope.row.phone}}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{scope.row.status | inquiryStatus}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="提交时间">
        <template slot-scope="scope">
          <span>{{scope.row.create_time | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="更新时间">
        <template slot-scope="scope">
         <span>{{scope.row.update_time | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      
      <el-table-column align="center" label="操作" width="90" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status > 1" size="mini" @click="handleView(scope.row)">查看</el-button>
          <el-button v-else type="primary" size="mini" @click="handleUpdate(scope.row)">回复</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[20,50,100, 150]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
<!--dialog 下面是弹出，大小暂时不用管，再写通用-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px">
       <template>
       <el-row :gutter="20">
        <el-col :span="24">
          <div class="Inquiry-reply">
          <span style="margin-left:10px;font-size:16px;color:#666;margin-right:20px;">询价编号 ：{{from.code}}</span> 
          <el-tag type="from.status | statusFilter">{{from.status | inquiryStatus}}</el-tag> 
          <span style="margin-left:10px;font-size:16px;color:#666;">指导价 ：{{from.GuidingPrice}}万</span>
          </div>
          <div class="grid-content">
              <table class="table table-bordered" border="1" width="100%" style="border:1px solid #ccc;margin-top:20px">
                  <tr>
                      <td width="15%" style="text-align:center" prop="title">车型</td>
                      <td class="black" width="45%" style="padding-left:5px">{{from.brand}} {{from.series}} {{from.Models}} {{from.Year}} {{from.GuidingPrice}}万</td>
                  </tr>
                  <tr>
                      <td style="text-align:center">颜色</td>
                      <td class="black" style="padding-left:5px">{{from.body_color}} | {{from.interior_color}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center">提交人</td>
                      <td class="black" style="padding-left:5px">{{from.name}} {{from.login_name}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center">客户</td>
                      <td class="black" style="padding-left:5px">{{from.tcname}} {{from.phone}}</td>
                  </tr>
              </table>
          </div>
          </el-col>
      </el-row>
      
      <el-form style="margin:10px 0">
        <el-checkbox v-if="(from.isSP == 1)" v-model="checked1" style="margin-left:5%" disabled>上牌</el-checkbox>
        <el-checkbox v-else v-model="checked" style="margin-left:5%" disabled>上牌</el-checkbox>
        
        <el-checkbox v-if="(from.isFQ == 1)" v-model="checked1" style="margin-left:5%" disabled>分期</el-checkbox>
        <el-checkbox v-else v-model="checked" style="margin-left:5%" disabled>分期</el-checkbox>

        <el-checkbox v-if="(from.isBX == 1)" v-model="checked1" style="margin-left:5%" disabled>保险</el-checkbox>
        <el-checkbox v-else v-model="checked" style="margin-left:5%" disabled>保险</el-checkbox>


        <el-checkbox v-if="(from.isDY == 1)" v-model="checked1" style="margin-left:5%" disabled>抵押公证</el-checkbox>
        <el-checkbox v-else v-model="checked" style="margin-left:5%" disabled>抵押公证</el-checkbox>
      </el-form>

            
      <el-form v-if="from.status == 1" :rules="rules" ref="dataForm" :model="from" status-icon label-position="left" label-width="100px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="裸车利润：" prop="bareCarProfit">
          <el-input v-model="from.bareCarProfit" placeholder="单位：(/元)"></el-input>
        </el-form-item>
        <el-form-item label="保险利润 ：" prop="bxProfit">
          <el-input v-model="from.bxProfit" placeholder="单位：(/元)"></el-input>
        </el-form-item>
        <el-form-item label="其他利润：" prop="otherProfit">
          <el-input v-model="from.otherProfit" class="filter-item" placeholder="单位：(/元)"></el-input>
        </el-form-item>
        <el-form-item label="分期利润：" prop="stagingProfit">
          <el-input v-model="from.stagingProfit" class="filter-item" placeholder="单位：(/元)"></el-input>
        </el-form-item>
        <el-form-item label="成交总价：" prop="finalCostAll">
          <el-input v-model="from.finalCostAll"  class="filter-item" placeholder="裸车、上牌、分期、抵押公证、保险等"></el-input>
        </el-form-item>
      </el-form>
      <div class="grid-content" v-else>
          <table class="table table-bordered" border="1" width="100%" style="border:1px solid #ccc;margin-top:20px">
              <tr>
                  <td width="15%" style="text-align:center" prop="title">裸车利润</td>
                  <td class="black" width="45%" style="padding-left:5px">{{from.bare_car_profit}}</td>
              </tr>
              <tr>
                  <td style="text-align:center">保险利润</td>
                  <td class="black" style="padding-left:5px">{{from.bx_profit}}</td>
              </tr>
              <tr>
                  <td style="text-align:center">其他利润</td>
                  <td class="black" style="padding-left:5px">{{from.other_profit}}</td>
              </tr>
              <tr>
                  <td style="text-align:center">分期利润</td>
                  <td class="black" style="padding-left:5px">{{from.staging_profit}}</td>
              </tr>
              <tr>
                  <td style="text-align:center">成交总价</td>
                  <td class="black" style="padding-left:5px">{{from.final_cost_all}}</td>
              </tr>
          </table>
           <div class='chart-container' style="height:350px ">
              <chart height='100%' width='100%'
                :title='"利润分配"'
                :seriesdata="detail.seriesdata"
              ></chart>
            </div>
      </div>
      <div slot="footer" v-if="from.status == 1 " class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="reinquirySub">确定提交</el-button>
      </div>
       </template>
    </el-dialog>
  </div>
</template>

<script>
import { postajax } from '@/api/ajax'
import { Message, MessageBox } from 'element-ui'
import waves from "@/directive/waves"; // 水波纹指令
import Chart from '@/components/Charts/mixChart'

export default {
  name: "inquiryList",
  directives: {
    waves
  },
  name: 'mixChart',
  components: { Chart },
  
  data() {
     var checkAge = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('裸车利润不能为空'));
        }
        setTimeout(() => {
            if (value > 99999999) {
              callback(new Error('裸车利润不超过99999999'));
            } else {
              callback();
            }
        }, 300);
      };
      var validatePass = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('保险利润不能为空'));
        }
        setTimeout(() => {
            if (value > 99999999) {
              callback(new Error('保险利润不超过99999999'));
            } else {
              callback();
            }
        }, 300);
      };
      var validatePass1 = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('其他利润不能为空'));
        }
        setTimeout(() => {
            if (value > 99999999) {
              callback(new Error('其他利润不超过99999999'));
            } else {
              callback();
            }
        }, 300);
      };
      var validatePass2 = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('分期利润不能为空'));
        }
        setTimeout(() => {
            if (value > 99999999) {
              callback(new Error('分期利润不超过99999999'));
            } else {
              callback();
            }
        }, 300);
      };
      var validatePass3 = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('成交总价不能为空'));
        }
        setTimeout(() => {
            if (value > 99999999) {
              callback(new Error('成交总价不超过99999999'));
            } else if(value<0){
              callback(new Error('成交总价不能为负值'));
            }else {
              callback();
            }
        }, 300);
      };

    return {
      form:{
        region: '',
        bareCarProfit:'',
        bxProfit:'',
        otherProfit:'',
        stagingProfit:'',
        finalCostAll:''
      },
      tableKey: 0,
      list: null,
      info: null,
      total: null,
      listLoading: true,
      // 列表
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        status: '1'
      },
      sortOptions: [{ label: '全部', key: '' },{ label: '待答复', key: '1' }, { label: '已答复', key: '2' }],
      checked1:true,
      checked:false,
      from: {
        code: undefined,
        bareCarProfit: "", //finalCostAll
        bxProfit: "", //保险利润
        otherProfit: "", //成本总价
        stagingProfit:"",
        finalCostAll: "",
        status: ""
        
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "询价答复",
        create: "Create"
      },
      multipleSelection: [],
      rules: {
        bareCarProfit: [{required: true, validator: checkAge,  trigger: 'blur' },{pattern: /^[-]?\d+$/, message: '只能输入数字' }],
        bxProfit: [{ required: true,validator: validatePass, trigger: 'blur' },{pattern: /^[-]?\d+$/, message: '只能输入数字' }],
        otherProfit: [{required: true, validator: validatePass1, trigger: 'blur' },{pattern: /^[-]?\d+$/, message: '只能输入数字' }],
        stagingProfit: [{required: true, validator: validatePass2, trigger: 'blur' },{pattern: /^[-]?\d+$/, message: '只能输入数字' }],
        finalCostAll: [{required: true, validator: validatePass3, trigger: 'blur' },{pattern: /^[-]?\d+$/, message: '只能输入数字' }]
      },
      detail:{
        seriesdata:[
          {value:'partner_profit',name:''}
          // {value:1,name:'合伙人'}
        ],
      },
      downloadLoading: false
    };
  },
  created() {
    this.getList();
  },

  methods: {
    //表单校验
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
    getList() {  // 询价列表
      this.listLoading = true;
      postajax('/tInquiry/tInquiryList',this.listQuery).then(response => {
        // console.log('list数据',response.object.result)
        this.list = response.object.result;
        this.total = response.object.total;
        this.listLoading = false;
      });
    },
    getdetails(code){
      let _this = this;
      // this.listLoading = true
      const InfoQuery = {
        'code':code,
        'codestr':code
      }
      // 天猫出账详情
      postajax('/answerTInquiry/shareProfit',InfoQuery).then(response => {
        _this.detail = response.object;
        if(response.object){
            this.detail.seriesdata = [
              {value:response.object.partner_profit, name:'合伙人'},
              {value:response.object.union_profit, name:'联合创始人'},
              {value:response.object.agent_profit, name:'拍档'},
              {value:response.object.role_company_profit, name:'服务费'},
              {value:response.object.dividends_profit, name:'分红池'}
            ]
        }
        
        this.listLoading = false
      })
    },
    getinquiryinfo(code,status) {  // 询价详情
      this.listLoading = true;
      // 查看详情 要传的值
      const Codeinfo =({
        code: code,
        status: status, 
      })
      postajax('/tInquiry/tInquiryStatus',Codeinfo).then(response => {
        this.infoview = response.object;
        this.listLoading = false;
      });
    },
    handleFilter(val) {
      this.listQuery.pageNum = 1;
      // this.listQuery.status = val;
      this.getList();
    },
    //分页
    handleSizeChange(val) {
      this.listQuery.pageSize = val;
      this.getList();
    },
    // 当前页值
    handleCurrentChange(val) {
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "回复成功",
        type: "success"
      });
      row.status = status;
    },
    handleView(row) {
      this.from = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.getdetails(row.code)
    },
    handleUpdate(row) {
      this.from = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.getdetails(row.code)
    },
    // 询价答复提交
    reinquirySub() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          console.log(typeof this.from.bareCarProfit)
          if(this.from.bareCarProfit * 1 + this.from.bxProfit * 1 + this.from.otherProfit * 1 + this.from.stagingProfit * 1 < 0){
            Message({
              message: '裸车利润、保险利润、分期利润、其他利润之和不能为负值',
              type: 'error',
              duration: 2 * 1000
            })
            return;
          }
          const fromData = Object.assign({}, this.from);
          // console.log('询价答复提交',fromData)
          fromData.timestamp = +new Date(fromData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          postajax('/answerTInquiry/saveNewTInquiryData',fromData).then(() => {
            this.getList();
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "回复成功",
              type: "success",
              duration: 2000
            });
            
          });
        }
      });
    },   
  //
    // toggleSelection(rows) {
    //     if (rows) {
    //       rows.forEach(row => {
    //         this.$refs.multipleTable.toggleRowSelection(row);
    //       });
    //     } else {
    //       this.$refs.multipleTable.clearSelection();
    //     }
    // },
    // 选择数据
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 导出数据
    handleDownload() {
      // 如果没搜索的话就全部导出
      if(this.listQuery.status == '' && this.multipleSelection.length == 0){
        this.downloadLoading = true
        postajax('/region/regionList',this.listQuery).then(() => {
            this.downloadLoading = false         
        });
      }else {
        if(this.multipleSelection.length){
          this.downloadLoading = true
          const list = this.multipleSelection
          var clist = [];
          for(var i=0;i<list.length;i++){
            const arrcode=list[i].code;
            clist.push(arrcode)
          }
          const newcode = {
            code:clist.join(',')
          }
          console.log('输出的数组：',newcode)
          // const data = this.formatJson(filterVal, list)
          postajax('/region/regionList',newcode).then(() => {
              this.$refs.multipleTable.clearSelection()
              this.downloadLoading = false         
          });
        } else {
          console.log(this.listQuery.status)
          this.$message({
            message: '请选择要导出的信息',
            type: 'warning'
          })
        }
      }
    },
    // 选中的数据转换下json
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    }
    //
    }
};
</script>


<style scoped>

.Inquiry-reply {
  margin-bottom: 10px;
}
.Inquiry-info {
  float: right;
  margin-right: 5%;
}
table.table,.table .tr,.table td{border: #e5e9f2 1px solid}
.table tr { display: table-row;vertical-align: inherit;border-color: inherit;line-height:35px;}
table.table {background-color: transparent;border-spacing: 0;border-collapse: collapse;display: table;box-sizing: border-box;}

.el-row {
  margin-bottom: 20px;
}
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
 .chart-container{
  position: relative;
  padding: 20px;
  width: 100%;
  height:85vh;
}
.wenzi{
  width: 100%;
  overflow: hidden;
  text-overflow:ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  white-space:inherit;
  height: 40px;
  display: -moz-box;
  -moz-line-clamp: 2;
  -moz-box-orient: vertical;
}
</style>

