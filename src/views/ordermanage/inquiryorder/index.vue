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
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column type="selection" align="center"  width="40"></el-table-column>

      <el-table-column align="center" label="订单编号">
        <template slot-scope="scope">
          <span>{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="意向车型">
        <template slot-scope="scope">
          <span :title='scope.row.brand+" "+scope.row.series+" "+scope.row.Models+" "+scope.row.Year+" "+scope.row.GuidingPrice+"万"' class="wenzi">{{scope.row.brand}} {{scope.row.series}} {{scope.row.Models}} {{scope.row.Year}} {{scope.row.GuidingPrice}}万</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="提交人">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="85" label="客户">
        <template slot-scope="scope">
          <span>{{scope.row.tcname}} {{scope.row.phone}}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{scope.row.status | inquiryOrderStatus}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="提交时间">
        <template slot-scope="scope">
          <span>{{scope.row.create_time | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="更新时间">
        <template slot-scope="scope">
         <span>{{scope.row.update_time | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      
      <el-table-column align="center" label="操作" width="90" class-name="small-padding fixed-width">
        <template slot-scope="scope">

          <router-link :to="'idetails/'+scope.row.code+'/'+scope.row.status+'/'+scope.row.type">
          <el-button  size="mini" @click="handleUpdate(scope.row)">查看</el-button>

          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30,50]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>
<script>
// 询价订单列表
import { postajax } from '@/api/ajax'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
export default {
  name: 'inquiryorder',
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize:20,
        status: ''
      },
      sortOptions: [{ label: '全部', key: '' },{ label: '待提车', key: '1' }, { label: '待审核', key: '7' },{ label: '待出账', key: '8'},{ label: '已出账', key: '10' }]
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
      // 询价订单列表
      postajax('/tBookingCar/tBookingCarList',this.listQuery).then(response => {
        // console.log('list数据',response.object.result)
        this.list = response.object.result
        this.total = response.object.total
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
      handleUpdate(row) {
      this.$store.state.inquiryCode = row.code;
      this.from = Object.assign({}, row); // copy obj
      this.from.timestamp = new Date(this.from.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
      //   this.$refs["dataForm"].clearValidate();
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
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }


/* 上传缩略图 */
.img{
  line-height: 100px;
  width: 150px;
  height: 100px;
  background-color: #F2F2F2;
}
img{
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