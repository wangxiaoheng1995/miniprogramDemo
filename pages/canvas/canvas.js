// pages/canvas/canvas.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

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
    var context = wx.createCanvasContext('canvas')
    context.beginPath();
    context.moveTo(50,50);
    context.arcTo(375 - 25, 50, 375 - 25, 75, 12.5);
    context.arcTo(375 - 25, 550, 375 - 50, 550, 12.5);
    context.arcTo(25, 550, 25, 525, 12.5);
    context.arcTo(25, 50, 50, 50, 12.5);
    context.closePath();
    // context.stroke();
    context.fill();
    context.draw();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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