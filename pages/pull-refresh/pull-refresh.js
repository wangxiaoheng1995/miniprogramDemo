// pages/pull-refresh/pull-refresh.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop:50
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

  },

  /**
   * 下拉刷新
   */
  pullRefresh () {
    this.setData({isRefresh:true});
  },
  viewScrollHandle (e) {
    this.setData({ scrollTop: e.detail.scrollTop });
  },
  touchendHandle () {
    if(this.data.scrollTop<50){
      if (this.data.scrollTop < 30){
        wx.showToast({
          title: '刷新'
        })
      }
      this.setData({scrollTop:50});
    }
  }
})