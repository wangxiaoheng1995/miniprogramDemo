// pages/royalpay/royalpay.js
import crypto from "../../crypto-js/index.js"
import fso from "../../utils/FSO.js"
const app =getApp();
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
    console.log(crypto)
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
  test: function () {
    var that = this;
    var description = "测试订单";
    var price = 10;
    var currency = 'CNY';
    var channel = 'miniprogram'; //支付渠道
    var operator = 'worker123'; //操作人员标识
    var order_id = 'wx-2';
    var partner_code = 'HAH8'; //商户编码
    var time = new Date().getTime();
    var nonce_str = 'FRESHINAUPowerdByFreshin'; // 随机字符串
    var credential_code = 'rLbQu1GtwdMcSNegWh6ssTLc8hVMA4Yk'; //系统为商户分配的开发校验码
    var valid_string = partner_code + "&" + time + "&" + nonce_str + "&" + credential_code;
    // var sign = CryptoJS.SHA256(valid_string).toString(CryptoJS.enc.Hex);
    var sign = crypto.SHA256(valid_string).toString(); //使用SHA256进行签名，并转为Hex小写字符串
    var str = "time=" + time + "&nonce_str=" + nonce_str + "&sign=" + sign;
    console.log('str', str)

    var data = {
      description: description,
      price: price,
      currency: currency,
      operator: operator,
      appid: "wxdda9297fb2ccbff5",
      customer_id: "o0fyu4hpUWAqqLJFNsDTNwGh2xZE"
    };

    var params = fso.dataForRequest(data || {});
    console.log('params', params)
    var creaturl = 'https://mpay.royalpay.com.au/api/v1.0/gateway/partners/' + partner_code + '/microapp_orders/' +
      order_id + '?' + str;

    wx.request({
      url: creaturl, //仅为示例，并非真实的接口地址
      method: "PUT",
      data: params,
      success(res) {
        console.log(res.data)
        if (res.data.return_code === 'SUCCESS' && res.data.sdk_params){
          wx.requestPayment({
            timeStamp: res.data.sdk_params.timeStamp,
            nonceStr: res.data.sdk_params.nonceStr,
            package: res.data.sdk_params.package,
            signType: res.data.sdk_params.signType,
            paySign: res.data.sdk_params.paySign,
            success(res) {
              console.log(res);
            },
            fail(res) {
              console.log(res);
            }
          })
        }
      }
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