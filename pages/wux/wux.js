// pages/wux/wux.js
import { $wuxCalendar } from 'wux-weapp'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    raterVlaue: { rater1: 5, rater2: 5, rater3: 5},
    date:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },
  raterChange (e) {
    var rater=this.data.raterVlaue;
    rater[e.currentTarget.dataset.key] = e.detail.value
    this.setData({ raterVlaue: rater});
    console.log(this.data.raterVlaue)
  },
  openCalendar() {
    $wuxCalendar().open({
      value: this.data.date,
      onChange: (values, displayValues) => {
        console.log('onChange', values, displayValues)
        this.setData({
          date: displayValues,
        })
      },
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})