/**
 * 收益——查看更多数据
 * @freshin.com
 */
var sliderWidth = 96;
var wxCharts = require('../../utils/wxcharts.js');
var lineChart = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ['今日', '昨日', '近7日', '近30日'],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 3,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });

    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    var simulationData = this.createSimulationData();
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: simulationData.categories,
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '昨日',
        data: simulationData.data,
        format: function (val, name) {
          return val.toFixed(2) + '万';
        }
      }, {
        name: '上周',
        data: [2, 0, 0, null,3, 1, 4, 0, 0,5],
        format: function (val, name) {
          return val.toFixed(2) + '万';
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '成交金额 (万元)',
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });

    // lineChart = new wxCharts({
    //   canvasId: 'lineCanvas1',
    //   type: 'line',
    //   categories: simulationData.categories,
    //   animation: true,
    //   // background: '#f5f5f5',
    //   series: [{
    //     name: '昨日',
    //     data: simulationData.data,
    //     format: function (val, name) {
    //       return val.toFixed(2) + '万';
    //     }
    //   }, {
    //     name: '上周',
    //     data: [2, 0, 0, null, 3, 1, 4, 0, 0, 5],
    //     format: function (val, name) {
    //       return val.toFixed(2) + '万';
    //     }
    //   }],
    //   xAxis: {
    //     disableGrid: true
    //   },
    //   yAxis: {
    //     title: '成交金额 (万元)',
    //     format: function (val) {
    //       return val.toFixed(2);
    //     },
    //     min: 0
    //   },
    //   width: windowWidth,
    //   height: 200,
    //   dataLabel: false,
    //   dataPointShape: true,
    //   extra: {
    //     lineStyle: 'curve'
    //   }
    // });

    // lineChart = new wxCharts({
    //   canvasId: 'lineCanvas2',
    //   type: 'line',
    //   categories: simulationData.categories,
    //   animation: true,
    //   // background: '#f5f5f5',
    //   series: [{
    //     name: '昨日',
    //     data: simulationData.data,
    //     format: function (val, name) {
    //       return val.toFixed(2) + '万';
    //     }
    //   }, {
    //     name: '上周',
    //     data: [2, 0, 0, null, 3, 1, 4, 0, 0, 5],
    //     format: function (val, name) {
    //       return val.toFixed(2) + '万';
    //     }
    //   }],
    //   xAxis: {
    //     disableGrid: true
    //   },
    //   yAxis: {
    //     title: '成交金额 (万元)',
    //     format: function (val) {
    //       return val.toFixed(2);
    //     },
    //     min: 0
    //   },
    //   width: windowWidth,
    //   height: 200,
    //   dataLabel: false,
    //   dataPointShape: true,
    //   extra: {
    //     lineStyle: 'curve'
    //   }
    // });

    // lineChart = new wxCharts({
    //   canvasId: 'lineCanvas3',
    //   type: 'line',
    //   categories: simulationData.categories,
    //   animation: true,
    //   // background: '#f5f5f5',
    //   series: [{
    //     name: '昨日',
    //     data: simulationData.data,
    //     format: function (val, name) {
    //       return val.toFixed(2) + '万';
    //     }
    //   }, {
    //     name: '上周',
    //     data: [2, 0, 0, null, 3, 1, 4, 0, 0, 5],
    //     format: function (val, name) {
    //       return val.toFixed(2) + '万';
    //     }
    //   }],
    //   xAxis: {
    //     disableGrid: true
    //   },
    //   yAxis: {
    //     title: '成交金额 (万元)',
    //     format: function (val) {
    //       return val.toFixed(2);
    //     },
    //     min: 0
    //   },
    //   width: windowWidth,
    //   height: 200,
    //   dataLabel: false,
    //   dataPointShape: true,
    //   extra: {
    //     lineStyle: 'curve'
    //   }
    // });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  tabClick: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  radioChange: function(e) {
    console.log('radiobox发生change事件，携带value值为：', e.detail.value)
  },

  touchHandler: function (e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  createSimulationData: function () {
    var categories = [];
    // var categories = ['0:00','3:00','6:00','9:00','12:00','15:00','18:00','21:00','24:00'];
    var data = [];
    for (var i = 0; i < 10; i++) {
    categories.push('2016-' + (i + 1));
    data.push(Math.random() * (20 - 10) + 10);
    }
    // data[4] = null;
    return {
      categories: categories,
      data: data
    }
  },
  updateData: function () {
    var simulationData = this.createSimulationData();
    var series = [{
      name: '成交量1',
      data: simulationData.data,
      format: function (val, name) {
        return val.toFixed(2) + '万';
      }
    },
    {
      name: '成交量2',
      data: simulationData.data,
      format: function (val, name) {
        return val.toFixed(2) + '万';
      }
    }
    ];
    lineChart.updateData({
      categories: simulationData.categories,
      series: series
    });
  },
})