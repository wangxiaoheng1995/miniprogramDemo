// pages/card-to-top/card-to-top.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**
     * @cardList array 列表数据
     * @animationReady boolean 动画锁
     */
    cardList: [],
    animationReady: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /**
     * @toTopAnimationData object 动画数据
     */
    var cardArr = [];
    for(var i=1;i <= 10;i++){
      cardArr.push({ val:i, toTopAnimationData:{}});
    }
    this.setData({ cardList: cardArr});
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
   * @cardToTop 动画结束回调，用于动画结束后置顶数组项
   */
  cardToTop(index) {
    let cardList = this.data.cardList;
    let topItem = cardList.splice(index, 1);
    let doTopArr = topItem.concat(cardList);
    this.setData({ cardList: doTopArr});
    setTimeout(() => {
      this.setData({ animationReady: true});
    },200);
  },
  /**
   * @toTopAnimation 动画函数，用于模拟界面置顶动画
   */
  toTopAnimation(e) {
    let cardList =  this.data.cardList;
    let index = e.currentTarget.dataset.index * 1;
    if (!index || !this.data.animationReady){
      return false;
    }
    this.setData({animationReady:false});
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    cardList.map(function(item,itemIndex,arr) {
      if (index == itemIndex){
        animation.left(- index * 620 + "rpx").step();
        return item.toTopAnimationData = animation.export();
      }else{
        if(index >= itemIndex){
          animation.left( "620rpx").step();
          return item.toTopAnimationData = animation.export();
        }
      }
    });
    this.setData({ cardList: cardList});
    setTimeout(() => {
      cardList.map(function (item, itemIndex, arr) {
        animation.left(0).step({ duration: 0 })
        return item.toTopAnimationData = animation.export();
      });
      this.cardToTop(index);
    },1000);
  }
})