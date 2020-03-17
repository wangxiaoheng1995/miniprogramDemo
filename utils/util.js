var app = getApp();

var Crypto = require("../crypto-js/index.js").Crypto;

var _KEY = "12345678900000001234567890000000";//32位
var _IV = "1234567890000000";//16位

/*
Encrypt by AES
 */
function encryptByAES (str) {
  var ciphertext = Crypto.AES.encrypt(str, 'secret key 123').toString();
  return ciphertext;
}

/*
Decrypt by AES
*/
function decryptByAES (str) {
  var bytes = Crypto.AES.decrypt(str, 'secret key 123');
  var originalText = bytes.toString(Crypto.AES.enc.Utf8);
  return originalText;
}

//格式化为日期格式YYYYMMDDHHMISSMMM
function getFormatDate() {
  var date = new Date();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentDate = date.getFullYear() + month + strDate
    + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
  return currentDate;
}

//将ip地址转换为整数
function ipToNumber(ip) {
  var num = 0;
  if (ip == "") {
    return num;
  }
  var aNum = ip.split(".");
  if (aNum.length != 4) {
    return num;
  }
  num += parseInt(aNum[0]) << 24;
  num += parseInt(aNum[1]) << 16;
  num += parseInt(aNum[2]) << 8;
  num += parseInt(aNum[3]) << 0;
  num = num >>> 0;//这个很关键，不然可能会出现负数的情况
  return num;
}   

//获得9位随机数
function randomNumber() {
  var start = 100000000;
  var end = 1000000000;
  return start + Math.floor(Math.random() * (end - start));
}

//9位数字前面补零
function addPreZero(num) {
  return ('000000000' + num).slice(-9);
}

/*** 
 * 去掉字符串中的特殊字符 
 */
function removeSpecialStr (s) {
  console.log('start:' + s);
  // 去掉转义字符  
  s = s.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
  // 去掉特殊字符  
  s = s.replace(/[\-\_\,\!\|\~\`\(\)\#\$\@\%\^\&\*\{\}\:\;\"\L\<\>\?]/g, ''); 
  console.log('end:' + s);
  return s;  
};  

/* 随机数 */
function randomString() {
  var chars = app.globalData.randomStr; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  var maxPos = chars.length;
  var pwd = '';
  for (var i = 0; i < 32; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

function encodeUTF8(s) {
  var i, r = [], c, x;
  for (i = 0; i < s.length; i++)
    if ((c = s.charCodeAt(i)) < 0x80) r.push(c);
    else if (c < 0x800) r.push(0xC0 + (c >> 6 & 0x1F), 0x80 + (c & 0x3F));
    else {
      if ((x = c ^ 0xD800) >> 10 == 0) //对四字节UTF-16转换为Unicode
        c = (x << 10) + (s.charCodeAt(++i) ^ 0xDC00) + 0x10000,
          r.push(0xF0 + (c >> 18 & 0x7), 0x80 + (c >> 12 & 0x3F));
      else r.push(0xE0 + (c >> 12 & 0xF));
      r.push(0x80 + (c >> 6 & 0x3F), 0x80 + (c & 0x3F));
    };
  return r;
};

// 字符串加密成 hex 字符串
function sha1(s) {
  var data = new Uint8Array(encodeUTF8(s))
  var i, j, t;
  var l = ((data.length + 8) >>> 6 << 4) + 16, s = new Uint8Array(l << 2);
  s.set(new Uint8Array(data.buffer)), s = new Uint32Array(s.buffer);
  for (t = new DataView(s.buffer), i = 0; i < l; i++)s[i] = t.getUint32(i << 2);
  s[data.length >> 2] |= 0x80 << (24 - (data.length & 3) * 8);
  s[l - 1] = data.length << 3;
  var w = [], f = [
    function () { return m[1] & m[2] | ~m[1] & m[3]; },
    function () { return m[1] ^ m[2] ^ m[3]; },
    function () { return m[1] & m[2] | m[1] & m[3] | m[2] & m[3]; },
    function () { return m[1] ^ m[2] ^ m[3]; }
  ], rol = function (n, c) { return n << c | n >>> (32 - c); },
    k = [1518500249, 1859775393, -1894007588, -899497514],
    m = [1732584193, -271733879, null, null, -1009589776];
  m[2] = ~m[0], m[3] = ~m[1];
  for (i = 0; i < s.length; i += 16) {
    var o = m.slice(0);
    for (j = 0; j < 80; j++)
      w[j] = j < 16 ? s[i + j] : rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1),
        t = rol(m[0], 5) + f[j / 20 | 0]() + m[4] + w[j] + k[j / 20 | 0] | 0,
        m[1] = rol(m[1], 30), m.pop(), m.unshift(t);
    for (j = 0; j < 5; j++)m[j] = m[j] + o[j] | 0;
  };
  t = new DataView(new Uint32Array(m).buffer);
  for (var i = 0; i < 5; i++)m[i] = t.getUint32(i << 2);

  var hex = Array.prototype.map.call(new Uint8Array(new Uint32Array(m).buffer), function (e) {
    return (e < 16 ? "0" : "") + e.toString(16);
  }).join("");

  return hex;
};

function getUTC8Time() {
  var date = new Date();
  var y = date.getUTCFullYear();
  var m = date.getUTCMonth();
  var d = date.getUTCDate();
  var h = date.getUTCHours();
  var M = date.getUTCMinutes();
  var s = date.getUTCSeconds();
  var utc = Date.UTC(y, m, d, h, M, s);
  // console.log('UTC:' + utc);
  return parseInt(utc / 1000);
}

//设置第几周，星期几的日期
function getPeriodWeekDate(period, weekday) {
  var today = new Date();
  var firstDay = new Date(today.getFullYear(), 0, 1);
  var dayOfWeek = firstDay.getDay();
  var spendDay = 1;
  if (dayOfWeek != 0) {
    spendDay = 7 - dayOfWeek + 1;
  }
  firstDay = new Date(today.getFullYear(), 0, 1 + spendDay);
  var d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000);
  var weekNum = Math.ceil(d / 7);//获得当前日期是第几周
  if (today.getDay() < weekday) {
    weekNum-=1;
  }
  
  //period:未来第几周，week:星期几
  // if (/^([1-4]?\d|5[12])$/.test(period) && /^[0-6]$/.test(week)) {
  firstDay.setDate(1 + (weekNum + period) * 7 - firstDay.getDay() + weekday);
    return firstDay.getFullYear() + "-" + (firstDay.getMonth() + 1) + "-" + firstDay.getDate();
  // } else {
  //   return 0;
  // }
}

module.exports = {
  getFormatDate: getFormatDate,
  ipToNumber: ipToNumber,
  addPreZero: addPreZero,
  randomNumber: randomNumber,
  randomString: randomString,
  getUTC8Time: getUTC8Time,
  getPeriodWeekDate: getPeriodWeekDate,
  removeSpecialStr: removeSpecialStr,
  sha1: sha1,
  encryptByAES: encryptByAES,
  decryptByAES: decryptByAES
}
