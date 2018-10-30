<template>
  <div class="app-container calendar-list-container">
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
      style="width: 100%"  @selection-change="handleSelectionChange" ref="multipleTable" >
      <el-table-column type="selection" align="center"  width="40"></el-table-column>
      <el-table-column align="center" label="订单编号">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单类型">
        <template slot-scope="scope">
          <span>{{scope.row.order_type | ticheStatus}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="意向车型">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.brand+scope.row.series+scope.row.Models+scope.row.Year+scope.row.GuidingPrice+'万'" placement="top-start">
          <span :title='scope.row.brand+" "+scope.row.series+" "+scope.row.Models+" "+scope.row.Year+" "+scope.row.GuidingPrice+"万"' class="wenzi">{{scope.row.brand}} {{scope.row.series}} {{scope.row.Models}} {{scope.row.Year}} {{scope.row.GuidingPrice}}万</span>
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
          <el-button v-if="scope.row.status > 7" size="mini" @click="handleUpdate(scope.row)">查看</el-button>
          <el-button v-else type="primary" size="mini" @click="handleUpdate(scope.row)">审核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[20,50,100, 150]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
<!--dialog 下面是弹出-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="1200px">
      
      <div class="inquiry-order">
          <div class="Inquiry-reply">提车信息</div>
         
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="grid-content">
              
              <table class="table table-bordered" border="1" width="95%" style="border:1px solid #ccc;margin-top:20px">
                 
                  <tr>
                    <td style="text-align:center;color:#76838F">车主姓名</td>
                    <td style="padding-left:5px">{{from.car_owner_name}}</td>
                      
                  </tr>
                  <tr>
                    <td style="text-align:center;color:#76838F">车主联系方式</td>
                    <td style="padding-left:5px">{{from.car_owner_phone}}</td>
                      
                  </tr>
                  <tr>
                    <td style="text-align:center;color:#76838F">4S店名称</td>
                    <td style="padding-left:5px">{{from.vehicle_source_name}}</td>
                      
                  </tr>
                  <tr>
                    <td width="20%" style="text-align:center;color:#76838F">尾款结算方式</td>
                    <td width="30%" style="padding-left:5px">{{from.retainage_settlement | ticheStatus}}</td>
                  </tr>
                  <tr>
                    <td style="text-align:center;color:#76838F">保险公司</td>
                    <td style="padding-left:5px">{{from.insurance_agent | ticheStatus}}</td>
                  </tr>
                  <tr>
                    <td style="text-align:center;color:#76838F">提车方式</td>
                    <td style="padding-left:5px">{{from.pickthecar_mode | ticheStatus}}</td>
                  </tr>
                  <tr>
                    <td style="text-align:center;color:#76838F">运输方式</td>
                    <td style="padding-left:5px">{{from.transit_mode | ticheStatus}}</td>
                  </tr>
              </table>
          </div>
          </el-col>
        <el-col :span="12">
          <div class="grid-content">
              <table class="table table-bordered" border="1" width="90%" style="border:1px solid #ccc;margin-top:20px">
                  <tr>
                      <td style="text-align:center;color:#76838F">订单编号</td>
                      <td style="padding-left:5px"><a href="#">{{from.code}}</a></td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">订单类型</td>
                      <td style="padding-left:5px">{{from.order_type | ticheStatus}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">车型</td>
                      <td style="padding-left:5px">{{from.brand}} {{from.series}} {{from.Models}} {{from.Year}} {{from.GuidingPrice}}万</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">颜色</td>
                      <td style="padding-left:5px">{{from.body_color}} | {{from.interior_color}}</td>
                  </tr>
                  <tr>
                      <td width="15%" style="text-align:center;color:#76838F">提交人</td>
                      <td width="45%" style="padding-left:5px">{{from.name}} {{from.login_name}}</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;color:#76838F">客户</td>
                      <td style="padding-left:5px">{{from.tcname}} {{from.phone}}</td>
                  </tr>
              </table>
          </div>
          
        </el-col>
          <el-col>
            <div class="card">
              
              <p>身份证件照</p>
              <img v-if="from.idCard_front_path" :src="from.idCard_front_path | imgUrl" alt="" v-image-preview>
              <img v-else src="/static/img/pathimg.jpg">               
            </div>
            <div class="buy-car">
              <p>购车发票</p>
              <img v-if="from.car_invoice_path" :src="from.car_invoice_path | imgUrl"  alt="" v-image-preview>
              <img v-else src="/static/img/pathimg.jpg">              
            </div>
            <div class="car">
              <p>汽车铭牌</p>
              <img v-if="from.nameplate_path" :src="from.nameplate_path | imgUrl" alt="" v-image-preview>
              <img v-else src="/static/img/pathimg.jpg"> 
            </div>
          </el-col>
      </el-row>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="from.status=='7'" type="primary" @click="updateData(from.code,from.status)">审核通过</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { postajax } from "@/api/ajax";
import waves from "@/directive/waves"; // 水波纹指令
export default {
  name: "provincialList",
  directives: {
    waves
  },
  data() {
    return {
      form:{
        region: '',
      },
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        title: undefined,
        type: undefined,
        status: '7'
      },

      sortOptions: [{ label: '全部', key: '' },{ label: '待审核', key: '7' }, { label: '已审核', key: '8' }, { label: '已完成', key: '10' }],
      multipleSelection: [],
      from: {
        code: undefined,
        remark: "",
        timestamp: new Date(),
        title: "",
        type: ""
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "省长审核",
        create: "Create"
      },
      downloadLoading: false
    };
  },
  filters: {
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      postajax('/tBookingCar/showGovernoReviewList',this.listQuery).then(response => {
        // console.log('list数据',response.object.result)
        this.list = response.object.result;
        this.total = response.object.total;
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
    handleUpdate(row) {
      this.from = Object.assign({}, row); // copy obj
      this.from.timestamp = new Date(this.from.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
      //   this.$refs["dataForm"].clearValidate();
      });
    },
   
    // 审核通过
    updateData(code,status) {
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
            message: "审核成功",
            type: "success",
            duration: 2000
          });
        });
    },
    // 导出数据
    handleDownload() {
      // 如果没搜索的话就全部导出
      if(this.listQuery.status == '' && this.multipleSelection.length == 0){
        // console.log(this.multipleSelection.length)
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
    // toggleSelection(rows) {
    //     if (rows) {
    //       rows.forEach(row => {
    //         this.$refs.multipleTable.toggleRowSelection(row);
    //       });
    //     } else {
    //       this.$refs.multipleTable.clearSelection();
    //     }
    //   },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    }
  }
};
</script>
<style scoped>
.inquiry-order {
  width: 100%;
  height: 50px;
  background-color: #f3f8fe;
  font-size: 18px;
  line-height: 50px;
}
table,
tr,
td {
  border: #e5e9f2 1px solid;
}
tr {
  display: table-row;
  vertical-align: inherit;
  border-color: inherit;
  line-height: 35px;
}
table {
  background-color: transparent;
  border-spacing: 0;
  border-collapse: collapse;
  display: table;
  box-sizing: border-box;
}
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
.img {
  line-height: 100px;
  width: 150px;
  height: 100px;
  background-color: #f2f2f2;
}
img{
  width: 170px;
  height: 150px;
}
.card {
  text-align: center;
  float: left;
}
.buy-car {
  text-align: center;
  float: left;
  margin-left: 5%;
}
.car {
  text-align: center;
  float: left;
  margin-left: 5%;
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