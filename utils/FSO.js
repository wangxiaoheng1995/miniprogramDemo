var app = getApp()
var MD5 = require("./md5.js");

var signSecret = "+ZW47gsSXKOVUykRrlbGjBf4SmZrGkJ1xlUOfs4SKW0wNFq3gMmmuio";

var getPreSignString = function (params) {

  var keys = Object.keys(params).sort();
  var result = []
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    result.push(key + "=" + params[key]);
  }

  return MD5.md5(result.join("&"));

}

var dataForRequest = function (params) {

  params["timestamp"] = new Date().getTime();
  params["_prestring"] = getPreSignString(params);
  params["sign"] = MD5.md5(signSecret + params["_prestring"] + signSecret);
  return params;

}

module.exports = {
  dataForRequest: dataForRequest
}