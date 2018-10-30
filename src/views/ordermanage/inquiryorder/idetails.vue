<template>
    <!---->
     <div class="app-container calendar-list-container" v-loading="listLoading">
      <el-row>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span class="fr"><b>订单编号：{{infoa.code}}</b></span> 询价订单
        </div>
        <div style="margin-bottom:50px; padding-bottom:50px">
          <!--步骤-->
          <el-steps :active="this.$route.params.status | stepstatus" finish-status="success">

            <el-step title="客户已付款"></el-step>
            <el-step v-if="this.$route.params.status == 1"  title="等待提车" icon="el-icon-time"></el-step>
            <el-step v-else title="已提车"></el-step>

            <el-step v-if="this.$route.params.status <= 7" title="等待审核" icon="el-icon-time"></el-step>
            <el-step v-else title="已审核"></el-step>

            <el-step v-if="this.$route.params.status <= 8" title="等待出账" icon="el-icon-time"></el-step>
            <el-step v-else title="已出账"></el-step>
            
          </el-steps>
          <div class="grid-content">
              <table class="table table-bordered" border="1" width="90%" style="border:1px solid #ccc;margin-top:20px">
                  <tr>
                      <td class="title-color" style="text-align:center;color:#6495ED;font-weight:700">商品信息</td>
                      <td></td>
                  </tr>
                  <tr>
                      <td width="15%" style="text-align:center;color:#76838F">车型</td>
                      <td width="45%" style="padding-left:5px">{{infoa.brand}} {{infoa.series}} {{infoa.Models}} {{infoa.Year}} {{infoa.GuidingPrice}}万</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">颜色</td>
                      <td style="padding-left:5px">{{infoa.body_color}} {{infoa.interior_color}}</td>
                  </tr>
              </table>
              <table class="table table-bordered" border="1" width="90%" style="border:1px solid #ccc;margin-top:20px">
                  <tr>
                      <td class="title-color" style="text-align:center;color:#6495ED;font-weight:700">联系信息</td>
                      <td></td>
                  </tr>
                  <tr>
                      <td width="15%" style="text-align:center;color:#76838F">提交人</td>
                      <td v-if="this.$route.params.type == 3" width="45%" style="padding-left:5px">{{infob.partnername}}{{infob.partnerphone}}</td>
                      <td v-else width="45%" style="padding-left:5px">{{infob.name}}{{infob.tuphone}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">客户</td>
                      <td style="padding-left:5px" >{{infob.tcname}} {{infob.phone}}</td>
                  </tr>
                  
                  <tr>
                      <td style="text-align:center;color:#76838F">联合创始人</td>
                      <td v-if="this.$route.params.type == 3" style="padding-left:5px">{{infob.unionname}} {{infob.unionphone}}</td>
                      <td v-else style="padding-left:5px">{{infob.parentname}} {{infob.parenttuphone}}</td>

                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">门店名称</td>
                      <td style="padding-left:5px">{{infob.store_name}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">门店所在地</td>
                      <td style="padding-left:5px">{{infob.address}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">拍档</td>
                      <td v-if="this.$route.params.type == 3" style="padding-left:5px">{{infob.agentname}} {{infob.agentphone}}</td>
                      <td v-else style="padding-left:5px"></td>
                  </tr>
              </table>
              
              <table class="table table-bordered" border="1" width="90%" style="border:1px solid #ccc;margin-top:20px">
                  <tr>
                      <td class="title-color" style="text-align:center;color:#6495ED;font-weight:700">财务确认进账</td>
                      <td></td>
                  </tr>
                  <tr>
                      <td width="15%" style="text-align:center;color:#76838F">已付定金</td>
                      <td width="45%" style="padding-left:5px">{{infoa.deposit}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">天猫订单编号</td>
                      <td style="padding-left:5px">{{infoa.tianmao_code}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">支付宝流水号</td>
                      <td style="padding-left:5px">{{infoa.alipay_code}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">进账备注</td>
                      <td style="padding-left:5px">{{infoa.remarks}}</td>
                  </tr>
              </table>
              <table class="table table-bordered" border="1" width="90%" style="border:1px solid #ccc;margin-top:20px">
                  <tr>
                      <td width="20%" class="title-color" style="text-align:center;color:#6495ED;font-weight:700">提车信息</td>
                      <td width="30%"></td>
                      <td width="20%" style="text-align:center;color:#76838F">尾款结算方式</td>
                      <td width="30%" style="padding-left:5px">{{infoa.retainage_settlement | ticheStatus}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">车主姓名</td>
                      <td style="padding-left:5px">{{infoa.car_owner_name}}</td>
                      <td style="text-align:center;color:#76838F">保险公司</td>
                      <td style="padding-left:5px">{{infoa.insurance_agent | ticheStatus}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">车主联系方式</td>
                      <td style="padding-left:5px">{{infoa.car_owner_phone}}</td>
                      <td style="text-align:center;color:#76838F">提车方式</td>
                      <td style="padding-left:5px">{{infoa.pickthecar_mode | ticheStatus}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">4S店名称</td>
                      <td style="padding-left:5px">{{infoa.vehicle_source_name}}</td>
                      <td style="text-align:center;color:#76838F">运输方式</td>
                      <td style="padding-left:5px">{{infoa.transit_mode | ticheStatus}}</td>
                  </tr>
              </table>
          </div>

          <div class="grid-content">
              <table class="table table-bordered" border="1" width="90%" style="border:1px solid #ccc;margin-top:20px">
                  <tr>
                      <td class="title-color" style="text-align:center;color:#6495ED;font-weight:700">询价信息</td>
                      <td></td>
                  </tr>
                  <tr>
                      <td width="15%" style="text-align:center;color:#76838F">裸车利润</td>
                      <td width="45%" style="padding-left:5px">{{infoa.bare_car_profit}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">保险利润</td>
                      <td style="padding-left:5px">{{infoa.bx_profit}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">其他利润</td>
                      <td style="padding-left:5px">{{infoa.other_profit}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">成交总价</td>
                      <td style="padding-left:5px">{{infoa.final_cost_all}}</td>
                  </tr>
              </table>
              <div class='chart-container' style="height:300px;">
                <chart height='250px' width='80%'
                  :title='"利润分配图表:"'
                  :seriesdata="detailts.seriesdata"
                ></chart>
              </div>
              <!-- 图片点击放大用法：在img中加入 v-image-preview 即可-->
              <div class="fileimg" style="padding-bottom:80px;margin-bottom:40px;">
                <div class="card">
                  <p>身份证件照</p>
                  <img v-if="infoa.idCard_front_path" v-image-preview :src="infoa.idCard_front_path | imgUrl" alt="">
                  <img v-else src="/static/img/pathimg.jpg">
                </div>
                <div class="buy-car">
                  <p>购车发票</p>
                  <img v-if="infoa.car_invoice_path" :src="infoa.car_invoice_path | imgUrl" alt=""  v-image-preview>
                  <img v-else src="/static/img/pathimg.jpg">
                </div>
                <div class="car">
                  <p>汽车铭牌</p>
                  <img v-if="infoa.nameplate_path" :src="infoa.nameplate_path | imgUrl" alt="" v-image-preview>
                  <img v-else src="/static/img/pathimg.jpg">                  
                </div>
              </div>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="updateData">提交</el-button>
        </div>
        
    </el-card>
      </el-row>
      
    </div>
    
    
</template>
<script>
import { postajax } from '@/api/ajax'
// 询价订单详情
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
import chart from '@/components/Charts/mixChart'  // 饼图

export default {
  name: 'idetails',
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
      tableKey: 0,
      infoa: {},
      infob: {
        user_type: '',
        tuphone: '',
        name:'',
        parentname:'',
        agentname: '',
        agentphone:''
      },
      listLoading: true,
      InfoQuery: {
         code: this.$route.params.code,
         status: this.$route.params.status,
         type: this.$route.params.type
      },
      detailts:{
        seriesdata:[
          // {value:1,name:'合伙人'}
        ],
      },
    }
  },
  filters: {
    stepstatus: function (status) {
      const statusMaps = {
        1: 1,
        7: 2,
        8: 3,
        10: 4
      }
      return statusMaps[status]
    }
  },
  // 页面创建的生命周期函数
  created() {
    this.getinfo();
    this.getdetails(this.$route.params.code);
    
  },
  methods: {
    getinfo() {  // 订单详情
      this.listLoading = true;
      postajax('/tBookingCar/showNewOrderPageByCode',this.InfoQuery).then(response => {
        console.log('详情',response)
        if(response.object){
          this.infoa = response.object[0] || {};  // 其余部分
          this.infob = response.object[1] || {};  // 联系信息部分
          console.log('询价列表',response.object)
        }else{
          this.$notify({
            title: '没数据',
            message: '这个页面没数据',
            type: 'error',
            duration: 2000
          })
        }
        
        // this.infob = response.object[1];
        this.listLoading = false;
      });
    },
    getdetails(code){
      // this.listLoading = true
      const InfoQuery = {
        'code':code,
        'codestr':code
      }
      postajax('/answerTInquiry/shareProfit',InfoQuery).then(response => {
        console.log('饼图',response.object)
        this.detailts.seriesdata = [
          {value:response.object.partner_profit, name:'合伙人'},
          {value:response.object.union_profit, name:'联合创始人'},
          {value:response.object.agent_profit, name:'拍档'},
          {value:response.object.role_company_profit, name:'服务费'},
          {value:response.object.dividends_profit, name:'分红池'}
        ]
        this.listLoading = false
      })
    },
    //提交
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const fromData = Object.assign({}, this.infoa)
          fromData.timestamp = +new Date(fromData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          postajax('',fromData).then(() => {
            for (const v of this.list) {
              if (v.id === this.tefrommp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.infoa)
                break
              }
            }
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
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }


/* 上传缩略图 */
.fileimg img{
  width: 170px;
  height: 150px;
}
.card{
  text-align: center;
  float: left;
}
.buy-car{
  text-align: center;
  float: left;
  margin-left: 5%;
}
.car{
  text-align: center;
  float: left;
  margin-left: 5%;
}
 .chart-container{
  position: relative;
  padding: 10px;
  width: 100%;
}
</style>