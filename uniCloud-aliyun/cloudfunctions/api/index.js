'use strict';
const response = require('response')
const homeModel = require('./models/home')
const getOpenId = require('./models/openid')

function howLong(time1, time2){
	time1 = time1.getTime();
	time2 = time2.getTime();
	var cha     = time1 > time2 ? time1 - time2 : time2 - time1;
	var day     = Math.floor(cha / (24 * 3600 * 1000));
	var hours   = Math.floor(cha % (24 * 3600 * 1000) / (3600 * 1000));
	var minutes = Math.floor(cha % (24 * 3600 * 1000) % (3600 * 1000) / (60 * 1000));
	var seconds = Math.floor(cha % (24 * 3600 * 1000) % (3600 * 1000) % (60 * 1000) / 1000);
	return {
		day: day,
		hours: hours,
		minutes: minutes,
		seconds: seconds
	};
};

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	var resp = {}
	//简单路由判断
	switch (event.path) {
		//首页
		case '/home':
			var homeModelTabs = await homeModel.tabs()
			resp.homeList = homeModelTabs.data
			console.log(resp)
			return response.success(resp)
			break;
		case '/openid':
			var openid = await getOpenId(event.queryStringParameters.jsCode)
			resp.openid = openid
			return response.success(resp)
			break;
		default:

	}
	//返回数据给客户端
	return response.success()
};
