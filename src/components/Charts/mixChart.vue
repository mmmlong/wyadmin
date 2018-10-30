<template>
  <div :class="className" :id="id" :style="{height:height,width:width}" 
    :title="title"
    :seriesdata="seriesdata"
    ></div>
</template>

<script>
import echarts from 'echarts'

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100px'
    },
    height: {
      type: String,
      default: '100px'
    },
    title:{
      type:String,
      default:'一个饼图'
    },
    //
    seriesdata:{
      type:Array,
      default:[]
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.initChart()
    this.chart = null
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  watch:{
    seriesdata:function(){
      this.initChart()
    }
  },
  methods: {
    initChart() {
      let _this = this;
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption({
        
        title: {
          text: _this.title,
          left: 'right',
          // x: '30',
          top: '5',
          textStyle: {
            // color: '#66b1ff',
            fontSize: '16'
          },
          subtextStyle: {
            color: '#90979c',
            fontSize: '12'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          orient: 'vertical',
          left: 'right',
          top: '40',
          data: ['合伙人', '联合创始人', '拍档','服务费','分红池']
        },
        series: [{
          name: '数据来源',
          type: 'pie',
          bottom: '10',
          radius : '65%', // 饼图大小
          center: ['50%', '50%'], // 原饼图对齐方向 左 上
          stack: 'total',
          pieMaxWidth: 25,
          pieGap: '10%',
          
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data:_this.seriesdata,
          // data:[
          //   {value:1,name:'合伙人'}
          // ]
        },
      ],
      })
    }
  }
}
</script>
