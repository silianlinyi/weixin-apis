## 微信 API For Nodejs

### 交流

欢迎大家加入QQ群：172342609 《微信 API For Nodejs》专用交流群

### 快速开发

**第一步** 新建一个express项目

```
D:\Dcloud\workspace>express -s -e weixin-api

   create : weixin-api
   create : weixin-api/package.json
   create : weixin-api/app.js
   create : weixin-api/public/javascripts
   create : weixin-api/public
   create : weixin-api/routes
   create : weixin-api/routes/index.js
   create : weixin-api/routes/user.js
   create : weixin-api/views
   create : weixin-api/views/index.ejs
   create : weixin-api/public/images
   create : weixin-api/public/stylesheets
   create : weixin-api/public/stylesheets/style.css

   install dependencies:
     $ cd weixin-api && npm install

   run the app:
     $ node app
```

**第二步** 安装weixin-apis模块

> 注意这里这里是weixin-apis，不是weixin-api，因为npmjs.org网站已经有weixin-api项目，所以我就在后面加了一个s。

（1）方式一 

在项目根目录下的package.json文件添加声明：

```
"dependencies": {
	"express": "3.4.2",
	"ejs": "*",
	"weixin-apis": "*"
}
```

进入项目根目录，运行命令 `npm install`，对于国内用户，经常安装失败，至于为什么，你懂得~

在这里推荐使用`cnpm`，关于`cnpm`可以查看http://cnpmjs.org/。

通过cnpm安装weixin-apis，运行命令`cnpm install`

（2）方式二

进入项目根目录，运行命令 `npm install weixin-apis --save`或者`cnpm install weixin-apis --save`

**第三步** 修改app.js文件，如下所示：

```
var express = require('express');
var weixin = require('weixin-apis');

var app = express();

// 微信接入配置
weixin.configurate({
	token : '这是你的token',
	appid : '这是你的appid',
	secret : '这是你的secret'
});

// 接入验证
app.get('/verify', function(req, res) {
	if (weixin.checkSignature(req)) {
		res.send(200, req.query.echostr);
	} else {
		res.send(200, 'fail');
	}
});
// Start
app.post('/verify', function(req, res) {
	weixin.loop(req, res);
});

// 监听文本消息
weixin.on('textMsg', function(data) {
	console.log('>>>>>>>>> textMsg emit >>>>>>>>>');
	console.log(data);
	var msg;
	switch (data.content) {
		case '文本':
			msg = {
				toUserName : data.fromUserName,
				fromUserName : data.toUserName,
				msgType : 'text',
				content : '回复的消息内容（换行：在content中能够换行，微信客户端就支持换行显示）'
			};
			break;
		case '图片':
			msg = {
				toUserName : data.fromUserName,
				fromUserName : data.toUserName,
				msgType : 'image',
				mediaId : '通过上传图片文件，得到的id'
			};
			break;
		case '语音':
			msg = {
				toUserName : data.fromUserName,
				fromUserName : data.toUserName,
				msgType : 'voice',
				mediaId : '通过上传语音文件，得到的id'
			};
			break;
		case '视频':
			msg = {
				toUserName : data.fromUserName,
				fromUserName : data.toUserName,
				msgType : 'video',
				title : '视频消息的标题',
				description : '视频消息的描述',
				mediaId : '通过上传视频文件，得到的id'
			};
			break;
		case '音乐':
			msg = {
				toUserName : data.fromUserName,
				fromUserName : data.toUserName,
				msgType : 'music',
				title : "音乐标题",
				description : "音乐描述",
				musicUrl : '音乐链接',
				thumbMediaId : '缩略图的媒体id，通过上传多媒体文件，得到的id'
			};
			break;
		case '图文':
			var articles = [];
			articles[0] = {
				title : "每个Web开发者必备的9个软技能",
				description : "每个Web开发者除了精通技术，还应必备以下9个软技能：交流、倾听、适应、合作、积极的态度、有职业道德、判断/辨别、批判性思维和自负管理等",
				picUrl : "http://cms.csdnimg.cn/article/201404/01/5339fcde7d200.jpg",
				url : "http://www.csdn.net/article/2014-04-01/2819079-9-soft-skills-every-web-developer-should-master"
			};
			articles[1] = {
				title : "轻松打造品牌轻应用：实时Web App开发框架Clouda",
				description : "Clouda是百度历时两年共同研发的开源App技术框架，基于Node.js，简单易用，完美结合BAE，具备跨终端、云端统一、随动反馈和全实时等新一代技术能力。许多传统企业产品都通过Clouda开发品牌轻应用实现互联网化转型。",
				picUrl : "http://cms.csdnimg.cn/article/201403/07/53196741f0a1d_middle.jpg",
				url : "http://www.csdn.net/article/2014-03-07/2818676-baidu-clouda"
			};
			msg = {
				toUserName : data.fromUserName,
				fromUserName : data.toUserName,
				msgType : 'news',
				articles : articles
			};
			break;
		default:
			msg = {
				toUserName : data.fromUserName,
				fromUserName : data.toUserName,
				msgType : 'text',
				content : data.content
			};
			break;
	}
	weixin.sendMsg(msg);
});

// 监听图片消息
weixin.on('imageMsg', function(data) {
	console.log('>>>>>>>>> imageMsg emit >>>>>>>>>');
	console.log(data);
	var msg = {
		toUserName : data.fromUserName,
		fromUserName : data.toUserName,
		msgType : 'image',
		mediaId : data.mediaId
	};
	weixin.sendMsg(msg);
});

// 监听语音消息
weixin.on('voiceMsg', function(data) {
	console.log('>>>>>>>>> voiceMsg emit >>>>>>>>>');
	console.log(data);
	var msg = {
		toUserName : data.fromUserName,
		fromUserName : data.toUserName,
		msgType : 'voice',
		mediaId : data.mediaId
	};
	weixin.sendMsg(msg);
});

// 监听视频消息
weixin.on('videoMsg', function(data) {
	console.log('>>>>>>>>> videoMsg emit >>>>>>>>>');
	console.log(data);
	var msg = {
		toUserName : data.fromUserName,
		fromUserName : data.toUserName,
		msgType : 'video',
		mediaId : '-jI7RharH0_mhI9cN0gLDLrkXZYPbkzCTGcNQzuaRcT4PP2klByRb0RfaagZj_Ob'
	};
	weixin.sendMsg(msg);
});

// 监听地理位置消息
weixin.on('locationMsg', function(data) {
	console.log('>>>>>>>>> locationMsg emit >>>>>>>>>');
	console.log(data);
});

// 监听链接消息
weixin.on('linkMsg', function(data) {
	console.log('>>>>>>>>> linkMsg emit >>>>>>>>>');
	console.log(data);
});

// 监听关注事件
weixin.on('subscribeEventMsg', function(data) {
	console.log('>>>>>>>>> subscribeEventMsg emit >>>>>>>>>');
	console.log(data);
});

// 监听取消关注事件
weixin.on('unsubscribeEventMsg', function(data) {
	console.log('>>>>>>>>> unsubscribeEventMsg emit >>>>>>>>>');
	console.log(data);
});

// 监听上报地理位置事件
weixin.on('locationEventMsg', function(data) {
	console.log('>>>>>>>>> locationEventMsg emit >>>>>>>>>');
	console.log(data);
});

// 监听点击菜单拉取消息时的事件推送
weixin.on('clickEventMsg', function(data) {
	console.log('>>>>>>>>> clickEventMsg emit >>>>>>>>>');
	console.log(data);
});

// 监听点击菜单跳转链接时的事件推送
weixin.on('viewEventMsg', function(data) {
	console.log('>>>>>>>>> viewEventMsg emit >>>>>>>>>');
	console.log(data);
});

// 客服消息 - 文本
//weixin.sendCustomMsg({
//	toUserName : 'ojim5txO8ivc0Ff2LKW1nlUJ9hM4',
//	msgType : 'text',
//	content : "这是一段文本"
//}, function(err, res, body) {// 回调函数，可选
//	console.log(body);
//});

// 客服消息 - 图片
//weixin.sendCustomMsg({
//	toUserName: 'ojim5txO8ivc0Ff2LKW1nlUJ9hM4',
//	msgType: 'image',
//	mediaId: 'QMzNj-GD7BI_VGiAqc5ONW2CnTDGfRmem1hVdK_nR1p-WEQEb_2W4jfARp5nFn1K'
//}, function(err, res, body) {
//	console.log(body);
//});

// 客服消息 - 语音
//weixin.sendCustomMsg({
//	toUserName : 'ojim5txO8ivc0Ff2LKW1nlUJ9hM4',
//	msgType : 'voice',
//	mediaId : '6XL3LGUAhcw9MEYbCzQq-k90j-9B_jxCD24M3uMqexqUljJlzJ7_w4BrjlQDwT3B'
//}, function(err, res, body) {
//	console.log(body);
//});

// 客服消息 - 视频
//weixin.sendCustomMsg({
//	toUserName : 'ojim5txO8ivc0Ff2LKW1nlUJ9hM4',
//	msgType : 'video',
//	title: '这是视频标题',
//	description: '这是视频描述',
//	mediaId : '-jI7RharH0_mhI9cN0gLDLrkXZYPbkzCTGcNQzuaRcT4PP2klByRb0RfaagZj_Ob'
//}, function(err, res, body) {
//	console.log(body);
//});

// 客服消息 - 音乐
//weixin.sendCustomMsg({
//	toUserName : 'ojim5txO8ivc0Ff2LKW1nlUJ9hM4',
//	msgType : 'music',
//	title : "this is title",
//	description : "this is description",
//	musicUrl : "http://xihumaker.jios.org/voice/welcome.mp3",
//	HQMusicUrl : "",
//	thumbMediaId : "QMzNj-GD7BI_VGiAqc5ONW2CnTDGfRmem1hVdK_nR1p-WEQEb_2W4jfARp5nFn1K"
//}, function(err, res, body) {
//	console.log(body);
//});

// 客服消息 - 图文
//weixin.sendCustomMsg({
//	toUserName : 'ojim5txO8ivc0Ff2LKW1nlUJ9hM4',
//	msgType : 'news',
//
//	articles : [{
//		title : "每个Web开发者必备的9个软技能",
//		description : "每个Web开发者除了精通技术，还应必备以下9个软技能：交流、倾听、适应、合作、积极的态度、有职业道德、判断/辨别、批判性思维和自负管理等",
//		picurl : "http://cms.csdnimg.cn/article/201404/01/5339fcde7d200.jpg",
//		url : "http://www.csdn.net/article/2014-04-01/2819079-9-soft-skills-every-web-developer-should-master"
//	}, {
//		title : "轻松打造品牌轻应用：实时Web App开发框架Clouda",
//		description : "Clouda是百度历时两年共同研发的开源App技术框架，基于Node.js，简单易用，完美结合BAE，具备跨终端、云端统一、随动反馈和全实时等新一代技术能力。许多传统企业产品都通过Clouda开发品牌轻应用实现互联网化转型。",
//		picurl : "http://cms.csdnimg.cn/article/201403/07/53196741f0a1d_middle.jpg",
//		url : "http://www.csdn.net/article/2014-03-07/2818676-baidu-clouda"
//	}]
//
//}, function(err, res, body) {
//	console.log(body);
//});

app.listen(80);

```



















