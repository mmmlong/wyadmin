<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container fr">
      <el-button class="filter-item fr" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
    </div>
    <tree-table :data="data" :evalArgs="args" border>
          <el-table-column label="组织名称">
            <template slot-scope="scope">
              <span style="color:sandybrown">{{scope.row.name}}</span>
            </template>
          </el-table-column>
          <el-table-column label="负责人">
            <template slot-scope="scope">
                <div class="processContainer">
                  yy
                </div>
            </template>
          </el-table-column>
          <el-table-column label="描述">
            <template slot-scope="scope">
                <div class="processContainer">
                  abc
                </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <!-- <el-button type="text" @click="addstore(scope.row)">添加</el-button> -->
                <el-button type="text" icon="el-icon-plus" @click="addstore(scope.row)">添加</el-button>
              <el-button type="text" icon="el-icon-edit" @click="editstore(scope.row)">编辑</el-button>
              <!-- <el-button type="text" @click="editstore(scope.row)">删除</el-button> -->

            </template>
          </el-table-column>
    </tree-table>

    <!--dialog 下面是弹出，大小暂时不用管，再写通用-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px">
      <div class="grid-content">
        <el-form :rules="rules" ref="dataForm" :model="from" label-position="right" label-width="120px" style='width: 400px; margin-left:50px;margin-top:20px'>
          <el-form-item label="组织名称 ：">
            <el-input v-model="from.departName" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="负责人 ：">
            <el-input v-model.number="from.leader" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item label="描述 ：">
            <el-input v-model="from.description" placeholder="请输入"></el-input>
          </el-form-item>

        </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
          <el-button v-else type="primary" @click="updateData">保存</el-button>
        </div>
    </el-dialog>  
    <!-- <el-tree
      :data="data4"
      :props="defaultProps"
      show-checkbox
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      :render-content="renderContent">
    </el-tree> -->
  </div>
</template>

<script>
import { postajax } from '@/api/ajax'
import treeTable from '@/components/TreeTable'
//let id = 1000
export default {
  name: 'organization',
  components: { 
    treeTable 
  },data() {
    return {
      dialogFormVisible: false,
      dialogStatus: '',
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageIndex: 1,
        pageSize: 10,
        code:0
      },
      from: {
        code: '',
        title: ''
      },
      textMap: {
        update: '编辑组织',
        create: '新增组织'
      },
      rules: {
        title:[{required: true, message: '不能为空', trigger: 'blur'}]       
      },
      data: [{
        code: 1,
        name: '一级 1',
        children: [{
          code: 4,
          name: '二级 1-1',
          children: [{
            code: 9,
            name: '三级 1-1-1'
          }, {
            code: 10,
            name: '三级 1-1-2'
          }]
        }]
      }, {
        code: 2,
        name: '一级 2',
        children: [{
          code: 5,
          name: '二级 2-1'
        }, {
          code: 6,
          name: '二级 2-2'
        }]
      }, {
        code: 3,
        name: '一级 3',
        children: [{
          code: 7,
          name: '二级 3-1'
        }, {
          code: 8,
          name: '二级 3-2'
        }]
      }],
      args: [null, null, true]
    }
  },
  filters: {

  },
  created() {
     // this.getList()
  },
  
  methods: {
    // getList(){
    //   this.listLoading = true
    //   // 组织管理
    //   postajax('/orgin/listOrgin',this.listQuery).then(response => {
    //     console.log('list数据',response.object.result)
    //     this.list = response.object.result
    //     this.total = response.object.total
    //     this.listLoading = false
    //   })
    // },
    resetTemp() {
      this.from = {
        parentCode:'0',
        departName: '',
        leader:'',
        description: ''
      } 
    },
    handleCreate(){
      this.resetTemp()
      this.dialogStatus='create'
      this.dialogFormVisible=true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    append(row) {
        const newChild = { id: row.id++, name: '测试的门店', children: [] };
        if (!row.children) {
          this.$set(row, 'children', []);
        }
        row.children.push(newChild);
    },
    addstore(row) {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      // this.append(row)
      console.log(row)
      this.$message.info(row.name)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const fromData = Object.assign({}, this.from)
          console.log(fromData)
          postajax('/tStaff/updateStaff',fromData).then(() => {
            this.dialogFormVisible = false
            // 成功之后插入到当前节点中
            this.append(row) //
            //
            this.$notify({
              title: '成功',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    editstore(row) {
      this.from = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    }
    // append(data) {
    //     const newChild = { id: id++, label: 'testtest', children: [] };
    //     if (!data.children) {
    //       this.$set(data, 'children', []);
    //     }
    //     data.children.push(newChild);
    //   },

    // remove(node, data) {
    //   const parent = node.parent;
    //   const children = parent.data.children || parent.data;
    //   const index = children.findIndex(d => d.id === data.id);
    //   this.$msgbox.confirm('删除有风险，你确认要删除吗？',{
    //     confirmButtonText: '确认',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //       this.dialogFormVisible = false
    //       children.splice(index, 1);
    //       this.$notify({
    //         title: '成功',
    //         message: '删除成功',
    //         type: 'success',
    //         duration: 2000
    //       })
    //   }).catch(() => {
    //       // 取消就不执行了哈
    //   });
    // },

      // renderContent(h, { node, data, store }) {
      //   return (
      //     <span style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
      //       <span>
      //         <span>{node.label}</span>
      //       </span>
      //       <span>
      //         <el-button style="font-size: 12px;" type="text" on-click={ () => this.append(data) }>新增下级</el-button>
      //         <el-button style="font-size: 12px;" type="text" on-click={ () => this.remove(node, data) }>删除</el-button>
      //       </span>
      //     </span>);
      // }
  }
}
</script>
<style scoped>
.el-tree-node>div{height:44px!important;}
</style>
