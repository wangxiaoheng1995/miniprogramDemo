// pages/floot/floot.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    targetPosArray: [],
    currentIndex: 0,
    scrollTop: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    var self = this;
    var query = wx.createSelectorQuery();
    var floots = query.selectAll(".floot-page").boundingClientRect(function(rect) {
      var array = [];
      for (var i in rect) {
        array.push({
          top: rect[i].top,
          bottom: rect[i].bottom
        })
      }
      self.setData({
        targetPosArray: array
      })
    });
    query.exec();
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
  scorllViewOnScroll: function(e) {
    var self = this;
    var scrollTop = e.detail.scrollTop;
    var targetPosArray = self.data.targetPosArray;
    var currentIndex = self.data.currentIndex;
    for (var i in targetPosArray) {
      if (scrollTop >= targetPosArray[i].top - 50 && scrollTop < targetPosArray[i].bottom - 50) {
        self.setData({
          currentIndex: i
        });
        break;
      }
    }
  },
  scrollInto:function(e){
    var self=this;
    var targetPosArray=self.data.targetPosArray;
    var index=e.currentTarget.dataset.index;
    self.setData({ scrollTop: targetPosArray[index].top});
  }
})