/**
 * 收益
 * @freshin.com
 */
var sliderWidth = 96;
var WeChat = require("../../utils/WeChat.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTabIndex:0,
    sliderOffset: 0,
    sliderLeft: 0,

    hd_tabs:[
      {
        title:'实时数据',
      },
      {
        title: '历史统计',
      }
    ],
    putForward:10.00,
    tabs:['今日','昨日','近7日','近30日'],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    loadidngHidden:true,

    grids:[
      {
        id:0,
        key:'点击数',
        value:10
      },
      {
        id:1,
        key:'付款订单（笔）',
        value:22
      },
      {
        id:3,
        key:'付款预估收入（元）',
        value:100.00
      },
      {
        id:4,
        key:'结算预估收入（元）',
        value:55.50
      }
    ],
    settlement:[
      {
        title:'累计总收益（元)',
        data:400,
        status:'待结算',
        url:''
      },
      {
        title: '上月收益（元)',
        data: 200,
        status: '待结算',
        url: ''
      },
      {
        title: '本月销售额（元）',
        data: 300,
        status: '待结算',
        url:'../income-details/income-details'
      },
      {
        title: '本月收益（元）',
        data: 200,
        status: '待结算',
        url: ''
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.hd_tabs.length - sliderWidth) / 3,
          sliderOffset: res.windowWidth / that.data.hd_tabs.length * that.data.topTabIndex
        });
      }
    });

    wx.showShareMenu()
    // wx.hideShareMenu()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that=this;
    const query = wx.createSelectorQuery()
    query.select('.page-hd-tab-item.active').boundingClientRect();
    query.exec(function (res) {
      that.setData({sliderOffset:res[0].left})
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  topTabClick:function(e){
    var that = this;
    that.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      topTabIndex: e.currentTarget.dataset.id
    });
    console.log(e.currentTarget.dataset.id)
    console.log(that.data.topTabIndex)
  },

  tabClick: function (e) {
    this.setData({
      activeIndex: e.currentTarget.id
    });
  },
})