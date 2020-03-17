// pages/custom-navigation/custom-navigation.js
import { $wuxDialog } from "../../miniprogram_npm/wux-weapp/index.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    wx.getSystemInfo({
      success: function(res) {
        _this.setData({statusBarHeight:res.statusBarHeight});
      },
    })
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
  navBack() {
    $wuxDialog().open({
      resetOnClose: true,
      title: '取消评论',
      content: '是否取消评论返回？',
      buttons: [{
        text: '取消',
      },
      {
        text: '确定',
        type: 'primary',
        onTap(e) {
          wx.navigateBack({
            
          })
        },
      },
      ],
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