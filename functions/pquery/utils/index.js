const CryptoJS = require("crypto-js");
const MD5 = require("crypto-js/md5");

// 拼多多应用client_secret
const PDD_SECRET = "38962f5895f4**********021d3354";
// 拼多多应用client_id
const PDD_CLIENTID = "de13d**********7951a0";
// 拼多多推广位PID
const PDD_PID = "13***715_1****6766";
// custom_parameters: "sunjackson",
const PDD_CUSTOM_PARA = "CUSTOM_PARA";
// 淘宝应用client_secret
const TB_SECRET = "**********";
// 淘宝应用APPKEY
const TB_APPKEY = "******";
// 淘宝推广位PID，mm_123_456_274398237498 最后一位
const TB_PID = "274398237498";

function pddSign(params) {
  var sorted = Object.keys(params).sort();
  var basestring = PDD_SECRET;
  for (var i = 0, l = sorted.length; i < l; i++) {
    var k = sorted[i];
    basestring += k + params[k];
  }
  // console.log(params)
  basestring += PDD_SECRET;
  console.log("basestring ==>", basestring);
  return md5(basestring).toUpperCase();
}

function tbSign(params) {
  var sorted = Object.keys(params).sort();
  var basestring = this.TB_SECRET;
  for (var i = 0, l = sorted.length; i < l; i++) {
      var k = sorted[i];
      basestring += k + params[k];
  }
  basestring += this.TB_APPKEY;
  return md5(basestring).toUpperCase();
}

function timestamp() {
  return parseInt(new Date().getTime() / 1000);
}

function md5(s) {
  return MD5(s).toString(CryptoJS.enc.Hex);
}

function YYYYMMDDHHmmss(d, options) {
  d = d || new Date();
  if (!(d instanceof Date)) {
    d = new Date(d);
  }

  var dateSep = "-";
  var timeSep = ":";
  if (options) {
    if (options.dateSep) {
      dateSep = options.dateSep;
    }
    if (options.timeSep) {
      timeSep = options.timeSep;
    }
  }
  var date = d.getDate();
  if (date < 10) {
    date = "0" + date;
  }
  var month = d.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  var hours = d.getHours();
  if (hours < 10) {
    hours = "0" + hours;
  }
  var mintues = d.getMinutes();
  if (mintues < 10) {
    mintues = "0" + mintues;
  }
  var seconds = d.getSeconds();
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return (
    d.getFullYear() +
    dateSep +
    month +
    dateSep +
    date +
    " " +
    hours +
    timeSep +
    mintues +
    timeSep +
    seconds
  );
}

module.exports = {
  md5,
  YYYYMMDDHHmmss,
  pddSign,
  tbSign,
  timestamp,
  PDD_SECRET,
  PDD_CLIENTID,
  PDD_PID,
  PDD_CUSTOM_PARA,
  TB_APPKEY,
  TB_PID,
  TB_SECRET,
};
