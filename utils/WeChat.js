/**
 * WeChat Process
 * @freshin.com
 */
var app = getApp();
var MD5 = require("./md5.js");
var fso = require("./FSO.js");
var UTIL = require("./util.js");
var Promise = require("./promise.js");
var apiURI = app.globalData.apiURI;
//请求获取用户登录信息
//用户第一次登录，将会写入数据库，将会员ID写入app.globalData
function login(phoneInfo) {
  console.info('WeChat.login');
  return new Promise(function(resolve, reject) {
    wx.login({
      success: function(res) {
        if (res.code) {
          var sessionCode = res.code;
          var params = {
            'appid': app.globalData.appId,
            'session_code': sessionCode,
            'encryptedData': phoneInfo.encryptedData,
            'iv': phoneInfo.iv,
            'userFromPlatform': app.globalData.userFromPlatform,
            'userFromApp': app.globalData.userFromApp
          }
          //查询数据库判断用户是否存在
          var data = fso.dataForRequest(params);

          app.request()
            .post(apiURI + "/uic_ams/is_agency_exist")
            .send(data)
            .end()
            .then(function(res) {
              var result = res.data;
              console.log('result show', result)
              //用户不存在
              if (result.status == 0) {
                wx.showToast({
                  title: '没有权限登陆',
                  icon: 'none',
                  duration: 2000
                })
                console.log('您没有权限登录本系统！');
                resolve('');
              } else {
                var userInfoExt = result.user;
                console.info("=====login======");
                console.info(userInfoExt);
                if (userInfoExt.user_id != '') {
                  userInfoExt.session_code = sessionCode;
                  //将用户信息写入缓存
                  wx.setStorageSync('userInfoExt', userInfoExt);
                  resolve(userInfoExt.user_id);
                }
              }
            }).catch(function(res) {});
        } else {
          console.log('登录失败ovo！' + res.errMsg)
        }

      } //
    });
  });
}

//用户登录状态检查，每个页面检查
function loginCheck() {
  console.info('loginCheck');
  var userInfoExt = wx.getStorageSync('userInfoExt') || '';
  var targetUrl = getCurrentPages();
  //用户已经授权登录
  if (userInfoExt != '' && userInfoExt.user_id != '') {
    return;
  } else {
    //客户需要授权登录
    wx.redirectTo({
      url: '../index/index?targetUrl=' + targetUrl[targetUrl.length - 1],
    });
  }
}

//用户session_key过期检查，每个需要用到的操作检查，比如支付
function checkSession() {
  wx.checkSession({
    success: function() {
      //session_key 未过期，并且在本生命周期一直有效
    },
    fail: function() {
      console.info('renew session');
      var userInfoExt = wx.getStorageSync('userInfoExt');
      // session_key 已经失效，需要重新执行登录流程
      wx.login({
        success: function(res) {
          var sessionCode = res.code;
          var params = {
            'session_code': sessionCode,
            'userFromPlatform': app.globalData.userFromPlatform,
            'userFromApp': app.globalData.userFromApp
          }
          //查询数据库判断用户是否存在
          var data = fso.dataForRequest(params);
          app.request()
            .get(apiURI + "/uic/renew_session")
            .query(data)
            .end()
            .then(function(res) {
              userInfoExt.session_code = sessionCode;
              userInfoExt.session_key = res.data.session_key;
              //将用户信息写入缓存
              wx.setStorageSync('userInfoExt', userInfoExt);
            }).catch(function(res) {
              showToast();
            });
        }
      })
    }
  });
}

function vipCheck() {
  console.info("=======vipCheck======");
  var userInfoExt = wx.getStorageSync('userInfoExt') || '';
  //获取客户收费会员状态
  var params = {
    'user_id': userInfoExt.user_id
  };
  var data = fso.dataForRequest(params);
  app.request()
    .get(apiURI + "/uic/member_card/default")
    .query(data)
    .end()
    .then(function(res) {
      var memberCard = res.data;
      console.info("=======memberCard======");
      console.info(memberCard);
      userInfoExt.card_points = memberCard.card_points;
      // console.info(userInfoExt.card_points)
      if (memberCard.card_expiring_date != null) {
        userInfoExt.vipStatus = true;
        userInfoExt.vipExpirtingDate = memberCard.card_expiring_date;
        console.info(userInfoExt);
        wx.setStorageSync('userInfoExt', userInfoExt);
      } else {
        userInfoExt.vipStatus = false;
        console.info(userInfoExt);
        wx.setStorageSync('userInfoExt', userInfoExt);
      }
    });
}

//微信支付-批量购买商品——我的订单>立即付款
function repay(tradeObject) {
  return new Promise(function(resolve, reject) {
    // console.info(tradeObject);

    //检查会话是否过期，如果过期重新登录
    checkSession();
    var userInfoExt = wx.getStorageSync('userInfoExt') || '';
    console.info("======userInfoExt======");
    console.info(userInfoExt);
    var ordersObject = tradeObject.TC_Orders;
    console.info("======ordersObject======");
    console.info(ordersObject);

    //统一支付签名
    var appid = app.globalData.appId; //appid 
    var mch_id = app.globalData.mchId; //商户号  
    var nonce_str = UTIL.randomString(); //随机字符串，不长于32位。 
    var outTradeNo = tradeObject.trade_number; //交易单号
    //商品描述
    var body = ordersObject[0]['sku_title'] + ',' + ordersObject[0]['sku_properties'];
    if (ordersObject.length > 1) {
      body = '购物车多件商品组合';
    }
    console.info('body:' + body);
    // var detail = payProduct['product_title'] + ',' + payProduct['product_sku_property'] +
    // ',单价' + payProduct['product_sku_price'] + ' x' + payProduct['product_sku_count'];
    //外部订单号
    var total_fee = 1;
    // var total_fee = parseFloat(tradeObject.receipt_price * 100).toFixed(0);
    console.info('total_fee:' + total_fee);
    var spbill_create_ip = app.globalData.clientIp; //终端ip
    var notify_url = apiURI + '/wechat/pay/notify'; //通知地址
    var trade_type = "JSAPI";
    var openid = userInfoExt.openid; //openid
    var apikey = app.globalData.apiKey;
    var user_id = userInfoExt.user_id;
    //拼接加密参数
    var unifiedPayment = 'appid=' + appid + '&body=' + body + '&mch_id=' + mch_id +
      '&nonce_str=' + nonce_str + '&notify_url=' + notify_url +
      '&openid=' + openid + '&out_trade_no=' + outTradeNo +
      '&spbill_create_ip=' + spbill_create_ip + '&total_fee=' + total_fee +
      '&trade_type=' + trade_type + '&key=' + apikey;
    var sign = MD5.md5(unifiedPayment).toUpperCase();
    console.info('获取加密参数：' + unifiedPayment);
    console.info('获取sign：' + sign);

    //封装统一支付xml参数
    var formData = "<xml>";
    formData += "<appid>" + appid + "</appid>";
    formData += "<mch_id>" + mch_id + "</mch_id>";
    // formData += "<detail><![CDATA[" + detail + "]]></detail>";
    formData += "<nonce_str>" + nonce_str + "</nonce_str>";
    formData += "<body>" + body + "</body>";
    formData += "<out_trade_no>" + outTradeNo + "</out_trade_no>";
    formData += "<total_fee>" + total_fee + "</total_fee>";
    formData += "<spbill_create_ip>" + spbill_create_ip + "</spbill_create_ip>";
    formData += "<notify_url>" + notify_url + "</notify_url>";
    formData += "<trade_type>" + trade_type + "</trade_type>";
    formData += "<openid>" + openid + "</openid>";
    formData += "<sign>" + sign + "</sign>";
    formData += "</xml>";

    //统一支付
    wx.request({
      url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
      method: 'POST',
      head: 'application/x-www-form-urlencoded',
      data: formData, // 设置请求的 header
      success: function(res) {
        console.info('预支付结果：' + res.data);

        var result_code = getXMLNodeValue('result_code', res.data.toString("utf-8"));
        var resultCode = result_code.split('[')[2].split(']')[0];
        console.info('resultCode：' + resultCode);
        if (resultCode == 'FAIL') {
          var err_code_des = getXMLNodeValue('err_code_des', res.data.toString("utf-8"));
          var errDes = err_code_des.split('[')[2].split(']')[0];
          wx.navigateBack({
            delta: 1, // 回退前 delta(默认为1) 页面
            success: function(res) {
              wx.showToast({
                title: errDes,
                icon: 'success',
                duration: 2000
              })
            },
          })
        } else {
          //发起支付
          var prepay_id = getXMLNodeValue('prepay_id', res.data.toString("utf-8"));
          var tmp = prepay_id.split('[');
          var tmp1 = tmp[2].split(']');
          console.info('prepay_id：' + prepay_id);
          console.info('tmp1' + tmp1);
          //签名  
          var timeStamp = createTimeStamp();
          var stringSignTemp = 'appId=' + appid + '&nonceStr=' + nonce_str +
            '&package=prepay_id=' + tmp1[0] + '&signType=MD5&timeStamp=' + timeStamp +
            '&key=' + apikey;
          console.info('再次签名字符串：' + stringSignTemp);
          var sign = MD5.md5(stringSignTemp).toUpperCase();
          console.info(sign);
          //提交支付请求
          wx.requestPayment({
            timeStamp: timeStamp,
            nonceStr: nonce_str,
            package: 'prepay_id=' + tmp1[0],
            signType: "MD5",
            paySign: sign,
            success: function(res) {
              //支付成功
              console.info(res);
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000
              });
              //根据user_id，trade_number查询交易信息，并且修改状态为2已付款
              var params = {
                "user_id": user_id,
                "tradeObject": tradeObject,
                "status": 'have_paid' //已付款状态
              };
              var data = fso.dataForRequest(params);
              // console.info(data);
              app.request()
                .post(apiURI + "/trade/update")
                .send(data)
                .end()
                .then(function(res) {
                  //更新完成返回trade_id
                  resolve(res.data.trade_id);
                  //跳转到已支付订单界面

                }).catch(function(res) {
                  console.info(res);
                });
            },
            fail: function() {
              // fail
              console.info("支付失败")
            },
            complete: function() {
              // complete
              console.info("pay complete")
            }
          })
        }
      },
    });
  });
}

//微信支付-购买多个商品
function bulkPay(outTradeNo, tradeObject, cartItems) {
  return new Promise(function(resolve, reject) {
    console.info(outTradeNo);
    console.info(tradeObject);
    console.info(cartItems);
    //检查会话是否过期，如果过期重新登录
    checkSession();
    var userInfoExt = wx.getStorageSync('userInfoExt') || '';
    console.info("======userInfoExt======");
    console.info(userInfoExt);
    //统一支付签名
    var appid = app.globalData.appId; //appid 
    var mch_id = app.globalData.mchId; //商户号  
    var nonce_str = UTIL.randomString(); //随机字符串，不长于32位。 
    //商品描述
    var body = '购物车多件商品组合';
    // var detail = payProduct['product_title'] + ',' + payProduct['product_sku_property'] +
    // ',单价' + payProduct['product_sku_price'] + ' x' + payProduct['product_sku_count'];
    //外部订单号
    var total_fee = 1;
    // var total_fee = parseFloat(tradeObject.receipt_price * 100).toFixed(0);
    var spbill_create_ip = app.globalData.clientIp; //终端ip
    var notify_url = apiURI + '/wechat/pay/notify'; //通知地址
    var trade_type = "JSAPI";
    var openid = userInfoExt.openid; //openid
    var apikey = app.globalData.apiKey;
    var user_id = userInfoExt.user_id;
    //拼接加密参数
    var unifiedPayment = 'appid=' + appid + '&body=' + body + '&mch_id=' + mch_id +
      '&nonce_str=' + nonce_str + '&notify_url=' + notify_url +
      '&openid=' + openid + '&out_trade_no=' + outTradeNo +
      '&spbill_create_ip=' + spbill_create_ip + '&total_fee=' + total_fee +
      '&trade_type=' + trade_type + '&key=' + apikey;
    var sign = MD5.md5(unifiedPayment).toUpperCase();
    console.info('获取加密参数：' + unifiedPayment);
    console.info('获取sign：' + sign);

    //封装统一支付xml参数
    var formData = "<xml>";
    formData += "<appid>" + appid + "</appid>";
    formData += "<mch_id>" + mch_id + "</mch_id>";
    // formData += "<detail><![CDATA[" + detail + "]]></detail>";
    formData += "<nonce_str>" + nonce_str + "</nonce_str>";
    formData += "<body>" + body + "</body>";
    formData += "<out_trade_no>" + outTradeNo + "</out_trade_no>";
    formData += "<total_fee>" + total_fee + "</total_fee>";
    formData += "<spbill_create_ip>" + spbill_create_ip + "</spbill_create_ip>";
    formData += "<notify_url>" + notify_url + "</notify_url>";
    formData += "<trade_type>" + trade_type + "</trade_type>";
    formData += "<openid>" + openid + "</openid>";
    formData += "<sign>" + sign + "</sign>";
    formData += "</xml>";

    //统一支付
    wx.request({
      url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
      method: 'POST',
      head: 'application/x-www-form-urlencoded',
      data: formData, // 设置请求的 header
      success: function(res) {
        console.info('预支付结果：' + res.data);

        var result_code = getXMLNodeValue('result_code', res.data.toString("utf-8"));
        var resultCode = result_code.split('[')[2].split(']')[0];
        console.info('resultCode：' + resultCode);
        if (resultCode == 'FAIL') {
          var err_code_des = getXMLNodeValue('err_code_des', res.data.toString("utf-8"));
          var errDes = err_code_des.split('[')[2].split(']')[0];
          wx.navigateBack({
            delta: 1, // 回退前 delta(默认为1) 页面
            success: function(res) {
              wx.showToast({
                title: errDes,
                icon: 'success',
                duration: 2000
              })
            },
          })
        } else {
          //发起支付
          var prepay_id = getXMLNodeValue('prepay_id', res.data.toString("utf-8"));
          var tmp = prepay_id.split('[');
          var tmp1 = tmp[2].split(']');
          console.info('prepay_id：' + prepay_id);
          console.info('tmp1' + tmp1);
          //签名  
          var timeStamp = createTimeStamp();
          var stringSignTemp = 'appId=' + appid + '&nonceStr=' + nonce_str +
            '&package=prepay_id=' + tmp1[0] + '&signType=MD5&timeStamp=' + timeStamp +
            '&key=' + apikey;
          console.info('再次签名字符串：' + stringSignTemp);
          var sign = MD5.md5(stringSignTemp).toUpperCase();
          console.info(sign);
          //提交支付请求
          wx.requestPayment({
            timeStamp: timeStamp,
            nonceStr: nonce_str,
            package: 'prepay_id=' + tmp1[0],
            signType: "MD5",
            paySign: sign,
            success: function(res) {
              //支付成功
              console.info(res);
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000
              });
              //根据user_id，trade_number查询交易信息，并且修改状态为2已付款
              var params = {
                "user_id": user_id,
                "tradeObject": tradeObject,
                "status": 'have_paid' //已付款状态
              };
              var data = fso.dataForRequest(params);
              // console.info(data);
              app.request()
                .post(apiURI + "/trade/update")
                .send(data)
                .end()
                .then(function(res) {
                  //更新完成返回trade_id
                  resolve(res.data.trade_id);

                }).catch(function(res) {
                  console.info(res);
                });
            },
            fail: function() {
              // fail
              console.info("支付失败")
              wx.redirectTo({
                url: '../myOrder/myOrder?count=1',
              })
            },
            complete: function() {
              // complete
              console.info("pay complete")
            }
          })
        }
      },
    });
  });
}

//微信支付-购买单品商品
function pay(outTradeNo, tradeObject) {
  return new Promise(function(resolve, reject) {
    console.info(outTradeNo);
    console.info(tradeObject);
    //检查会话是否过期，如果过期重新登录
    checkSession();
    var userInfoExt = wx.getStorageSync('userInfoExt') || '';
    console.info("======userInfoExt======");
    console.info(userInfoExt);
    //统一支付签名
    var appid = app.globalData.appId; //appid 
    var mch_id = app.globalData.mchId; //商户号  
    var nonce_str = UTIL.randomString(); //随机字符串，不长于32位。
    var orderObject = tradeObject.TC_Order;
    //商品描述
    var body = orderObject.sku_title + ',' + orderObject.sku_properties;
    var detail = orderObject.sku_title + ',' + orderObject.sku_properties +
      ',单价' + orderObject.sku_price + ' x' + orderObject.amount;
    //外部订单号
    var total_fee = 1;
    // var total_fee = parseFloat(tradeObject.receipt_price * 100).toFixed(0);
    console.log("total_fee:" + total_fee);
    var spbill_create_ip = app.globalData.clientIp; //终端ip
    var notify_url = apiURI + '/wechat/pay/notify'; //通知地址
    var trade_type = "JSAPI";
    var openid = userInfoExt.openid; //openid
    var apikey = app.globalData.apiKey;
    var user_id = userInfoExt.user_id;
    //拼接加密参数
    var unifiedPayment = 'appid=' + appid + '&body=' + body + '&detail=' + detail +
      '&mch_id=' + mch_id + '&nonce_str=' + nonce_str + '&notify_url=' + notify_url +
      '&openid=' + openid + '&out_trade_no=' + outTradeNo +
      '&spbill_create_ip=' + spbill_create_ip + '&total_fee=' + total_fee +
      '&trade_type=' + trade_type + '&key=' + apikey;
    var sign = MD5.md5(unifiedPayment).toUpperCase();
    console.info('获取加密参数：' + unifiedPayment);
    console.info('获取sign：' + sign);

    //封装统一支付xml参数
    var formData = "<xml>";
    formData += "<appid>" + appid + "</appid>";
    formData += "<mch_id>" + mch_id + "</mch_id>";
    formData += "<detail><![CDATA[" + detail + "]]></detail>";
    formData += "<nonce_str>" + nonce_str + "</nonce_str>";
    formData += "<body>" + body + "</body>";
    formData += "<out_trade_no>" + outTradeNo + "</out_trade_no>";
    formData += "<total_fee>" + total_fee + "</total_fee>";
    formData += "<spbill_create_ip>" + spbill_create_ip + "</spbill_create_ip>";
    formData += "<notify_url>" + notify_url + "</notify_url>";
    formData += "<trade_type>" + trade_type + "</trade_type>";
    formData += "<openid>" + openid + "</openid>";
    formData += "<sign>" + sign + "</sign>";
    formData += "</xml>";

    //统一支付
    wx.request({
      url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
      method: 'POST',
      head: 'application/x-www-form-urlencoded',
      data: formData, // 设置请求的 header
      success: function(res) {
        console.info('预支付结果：' + res.data);

        var result_code = getXMLNodeValue('result_code', res.data.toString("utf-8"));
        var resultCode = result_code.split('[')[2].split(']')[0];
        console.info('resultCode：' + resultCode);
        if (resultCode == 'FAIL') {
          var err_code_des = getXMLNodeValue('err_code_des', res.data.toString("utf-8"));
          var errDes = err_code_des.split('[')[2].split(']')[0];
          wx.navigateBack({
            delta: 1, // 回退前 delta(默认为1) 页面
            success: function(res) {
              wx.showToast({
                title: errDes,
                icon: 'success',
                duration: 2000
              })
            },
          })
        } else {
          //发起支付
          var prepay_id = getXMLNodeValue('prepay_id', res.data.toString("utf-8"));
          var tmp = prepay_id.split('[');
          var tmp1 = tmp[2].split(']');
          console.info('prepay_id：' + prepay_id);
          console.info('tmp1' + tmp1);
          //签名  
          var timeStamp = createTimeStamp();
          var stringSignTemp = 'appId=' + appid + '&nonceStr=' + nonce_str +
            '&package=prepay_id=' + tmp1[0] + '&signType=MD5&timeStamp=' + timeStamp +
            '&key=' + apikey;
          console.info('再次签名字符串：' + stringSignTemp);
          var sign = MD5.md5(stringSignTemp).toUpperCase();
          console.info(sign);
          //提交支付请求
          wx.requestPayment({
            timeStamp: timeStamp,
            nonceStr: nonce_str,
            package: 'prepay_id=' + tmp1[0],
            signType: "MD5",
            paySign: sign,
            success: function(res) {
              //支付成功
              console.info(res);
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000
              });
              //根据user_id，trade_number查询交易信息，并且修改状态为2已付款
              var params = {
                "user_id": user_id,
                "tradeObject": tradeObject,
                "status": 'have_paid' //已付款状态
              };
              var data = fso.dataForRequest(params);
              // console.info(data);
              app.request()
                .post(apiURI + "/trade/update")
                .send(data)
                .end()
                .then(function(res) {
                  //更新完成返回trade_id
                  resolve(res.data.trade_id);

                }).catch(function(res) {
                  console.info(res);
                });
            },
            fail: function() {
              // fail
              console.info("支付失败")
              wx.redirectTo({
                url: '../myOrder/myOrder?count=1',
              })
            },
            complete: function() {
              // complete
              console.info("pay complete")
            }
          })
        }
      },
    });
  });
}

//微信支付-会员卡
function memberCardPay(outTradeNo, tradeObject, skuObject) {
  return new Promise(function(resolve, reject) {
    console.info(outTradeNo);
    console.info(tradeObject);
    console.info(skuObject);
    //检查会话是否过期，如果过期重新登录
    checkSession();
    var userInfoExt = wx.getStorageSync('userInfoExt') || '';
    console.info("======userInfoExt======");
    console.info(userInfoExt);
    //统一支付签名
    var appid = app.globalData.appId; //appid 
    var mch_id = app.globalData.mchId; //商户号  
    var nonce_str = UTIL.randomString(); //随机字符串，不长于32位。 
    //商品描述
    var body = skuObject.sku_title + ',' + skuObject.sku_properties;
    //外部订单号
    var total_fee = 1;
    // var total_fee = parseFloat(skuObject.sku_price * 100).toFixed(0);
    var spbill_create_ip = app.globalData.clientIp; //终端ip
    var notify_url = apiURI + '/wechat/pay/notify'; //通知地址
    var trade_type = "JSAPI";
    var openid = userInfoExt.openid; //openid
    var apikey = app.globalData.apiKey;
    var user_id = userInfoExt.user_id;
    //拼接加密参数
    var unifiedPayment = 'appid=' + appid + '&body=' + body + '&mch_id=' + mch_id +
      '&nonce_str=' + nonce_str + '&notify_url=' + notify_url +
      '&openid=' + openid + '&out_trade_no=' + outTradeNo +
      '&spbill_create_ip=' + spbill_create_ip + '&total_fee=' + total_fee +
      '&trade_type=' + trade_type + '&key=' + apikey;
    var sign = MD5.md5(unifiedPayment).toUpperCase();
    console.info('获取加密参数：' + unifiedPayment);
    console.info('获取sign：' + sign);

    //封装统一支付xml参数
    var formData = "<xml>";
    formData += "<appid>" + appid + "</appid>";
    formData += "<mch_id>" + mch_id + "</mch_id>";
    formData += "<nonce_str>" + nonce_str + "</nonce_str>";
    formData += "<body>" + body + "</body>";
    formData += "<out_trade_no>" + outTradeNo + "</out_trade_no>";
    formData += "<total_fee>" + total_fee + "</total_fee>";
    formData += "<spbill_create_ip>" + spbill_create_ip + "</spbill_create_ip>";
    formData += "<notify_url>" + notify_url + "</notify_url>";
    formData += "<trade_type>" + trade_type + "</trade_type>";
    formData += "<openid>" + openid + "</openid>";
    formData += "<sign>" + sign + "</sign>";
    formData += "</xml>";

    //统一支付
    wx.request({
      url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
      method: 'POST',
      head: 'application/x-www-form-urlencoded',
      data: formData, // 设置请求的 header
      success: function(res) {
        console.info('预支付结果：' + res.data);

        var result_code = getXMLNodeValue('result_code', res.data.toString("utf-8"));
        var resultCode = result_code.split('[')[2].split(']')[0];
        console.info('resultCode：' + resultCode);
        if (resultCode == 'FAIL') {
          var err_code_des = getXMLNodeValue('err_code_des', res.data.toString("utf-8"));
          var errDes = err_code_des.split('[')[2].split(']')[0];
          wx.navigateBack({
            delta: 1, // 回退前 delta(默认为1) 页面
            success: function(res) {
              wx.showToast({
                title: errDes,
                icon: 'success',
                duration: 2000
              })
            },
          })
        } else {
          //发起支付
          var prepay_id = getXMLNodeValue('prepay_id', res.data.toString("utf-8"));
          var tmp = prepay_id.split('[');
          var tmp1 = tmp[2].split(']');
          console.info('prepay_id：' + prepay_id);
          console.info('tmp1' + tmp1);
          //签名  
          var timeStamp = createTimeStamp();
          var stringSignTemp = 'appId=' + appid + '&nonceStr=' + nonce_str +
            '&package=prepay_id=' + tmp1[0] + '&signType=MD5&timeStamp=' + timeStamp +
            '&key=' + apikey;
          console.info('再次签名字符串：' + stringSignTemp);
          var sign = MD5.md5(stringSignTemp).toUpperCase();
          console.info(sign);
          //提交支付请求
          wx.requestPayment({
            timeStamp: timeStamp,
            nonceStr: nonce_str,
            package: 'prepay_id=' + tmp1[0],
            signType: "MD5",
            paySign: sign,
            success: function(res) {
              //支付成功
              console.info(res);
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000
              });
              //根据user_id，trade_number查询交易信息，并且修改状态为2已付款
              var params = {
                "user_id": user_id,
                "tradeObject": tradeObject,
                "status": 'finished' //已完成状态
              };
              var data = fso.dataForRequest(params);
              // console.info(data);
              app.request()
                .post(apiURI + "/trade/member_card/update")
                .send(data)
                .end()
                .then(function(res) {
                  //更新完成返回trade_id
                  resolve(res.data.memberCard);

                }).catch(function(res) {
                  console.info(res);
                });
            },
            fail: function() {
              // fail
              console.info("支付失败")
              wx.redirectTo({
                url: '../myOrder/myOrder?count=1',
              })
            },
            complete: function() {
              // complete
              console.info("pay complete")
            }
          })
        }
      },
    });
  });
}

// 显示toast弹窗
function showToast(content = '登录失败，请稍后再试') {
  wx.showToast({
    title: content,
    icon: 'none'
  })
}

/* 获取prepay_id */
function getXMLNodeValue(node_name, xml) {
  var tmp = xml.split("<" + node_name + ">");
  var _tmp = tmp[1].split("</" + node_name + ">");
  return _tmp[0];
}

/* 时间戳产生函数   */
function createTimeStamp() {
  return parseInt(new Date().getTime() / 1000) + '';
}

module.exports = {
  loginCheck: loginCheck,
  checkSession: checkSession,
  pay: pay,
  bulkPay: bulkPay,
  memberCardPay: memberCardPay,
  repay: repay,
  login: login,
  vipCheck: vipCheck
}