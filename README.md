## 微信 API For Nodejs

### 交流

这只是一个简单的示例，后续我会写一个详细的例子。

欢迎大家加入QQ群：172342609 《微信 API For Nodejs》专用交流群

如果在使用过程中有任何疑问，可以发邮件给我，邮箱：244098979@qq.com

### 最简单的一个示例
```
var express = require('express');
var weixin = require('weixin-apis');
var app = express();

weixin.configurate({
	app: app,
	token : '你的token',
	appid : '你的appid（可选）',
	secret : '你的secret（可选）'
});

weixin.on('textMsg', function(data) {
	var msg = {
		toUserName : data.fromUserName,
		fromUserName : data.toUserName,
		msgType : 'text',
		content : data.content
	};
	weixin.sendMsg(msg);
})

app.listen(80);

```


### 第一步 新建一个express项目

在控制台下运行命令express -e weixin_demo，如下所示：

```
D:\Dcloud\workspace>express -e weixin_demo

   create : weixin_demo
   create : weixin_demo/package.json
   create : weixin_demo/app.js
   create : weixin_demo/public
   create : weixin_demo/public/javascripts
   create : weixin_demo/public/images
   create : weixin_demo/public/stylesheets
   create : weixin_demo/public/stylesheets/style.css
   create : weixin_demo/routes
   create : weixin_demo/routes/index.js
   create : weixin_demo/routes/users.js
   create : weixin_demo/views
   create : weixin_demo/views/index.ejs
   create : weixin_demo/views/error.ejs
   create : weixin_demo/bin
   create : weixin_demo/bin/www

   install dependencies:
     $ cd weixin_demo && npm install

   run the app:
     $ DEBUG=weixin_demo ./bin/www
```

### 第二步 安装weixin-apis模块

**（1）安装方式一**

在项目根目录下的package.json文件添加依赖声明：

![](http://silianlinyi.github.io/weixin-apis/img/01.png)

打开控制台，进入项目根目录，运行命令：npm install，对于国内用户，经常安装失败，至于为什么，你懂得~

在这里推荐使用cnpm，关于cnpm，可以查看[http://cnpmjs.org/](http://cnpmjs.org/)

通过cnpm安装weixin-apis，运行命令cnpm install

**（2）安装方式二**

进入项目根目录，运行命令npm install weixin-apis --save或者cnpm install weixin-apis --save

### 第三步 修改app.js文件：

```
var express = require('express');
var path = require('path');
var weixin = require('weixin-apis');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.send('hi');
});

// 微信接入配置
weixin.configurate({
	app: app,
	token : '你的token',
	appid : '你的appid',
	secret : '你的srcret'
});
//weixin.reflashAccessToken();

var TEST_DATA = {
	IMAGE_MEDIAID:'I5iGvZYycXfeaiNGdATej61tXAsEQx0ANLepzfl7ie59stvmDatIqOW2JB_mO5qw',
	VOICE_MEDIAID: 'f2VP_PmJMfKBjIClno8LUFZYlmVJ9jXD3azO3t6FMc0zITeE6pxyRAFrBpaQwxlq',
	VIDEO_MEDIAID: 'FuEuAXn-o9FI0zXF7Lb-UHfBFV0VP0fKMc99amuNLl5ksJr0fVlw0x7IbdJMzWuA',
	THUMB_MEDIA_ID: 'I5iGvZYycXfeaiNGdATej61tXAsEQx0ANLepzfl7ie59stvmDatIqOW2JB_mO5qw',
	MUSIC_URL: 'http://xihumaker.jios.org/music/test.mp3',
	TOUSERNAME: 'ojim5txO8ivc0Ff2LKW1nlUJ9hM4'
};

// 监听文本消息
weixin.on('textMsg', function(data) {
	console.log('>>>>>>>>> textMsg emit >>>>>>>>>');
	console.log(data);
	var content = data.content;
	var msg;
	switch(content) {
		case '文本':
			msg = {
				toUserName : data.fromUserName,
				fromUserName : data.toUserName,
				msgType : 'text',
				content : '这是一段文本'
			};
			break;
		case '图片':
			msg = {
				toUserName : data.fromUserName,
				fromUserName : data.toUserName,
				msgType : 'image',
				mediaId : TEST_DATA.IMAGE_MEDIAID
			};
			break;
		case '语音':
			msg = {
				toUserName: data.fromUserName,
				fromUserName: data.toUserName,
				msgType: 'voice',
				mediaId: TEST_DATA.VOICE_MEDIAID
			};
			break;
		case '视频':
			msg = {
				toUserName: data.fromUserName,
				fromUserName: data.toUserName,
				msgType: 'video',
				mediaId: TEST_DATA.VIDEO_MEDIAID
			};
			break;
		case '音乐':
			msg = {
				toUserName: data.fromUserName,
				fromUserName: data.toUserName,
				msgType: 'music',
				musicUrl: TEST_DATA.MUSIC_URL,
				HQMusicUrl: TEST_DATA.MUSIC_URL,
				thumbMediaId: TEST_DATA.THUMB_MEDIA_ID
			};
			break;
		case '图文':
			msg = {
				toUserName: data.fromUserName,
				fromUserName: data.toUserName,
				msgType: 'news',
				articles: [{
					title: '从Objective-C到Swift',
					description: '2014年WWDC大会，苹果在毫无预兆的情况下发布了Swift语言。Swift背后的概念大多与Objective-C类似，但更为简洁、自然，也吸收了很多其他语言的语法。本文将对Swift的语法、特点及改进进行全面介绍。',
					picUrl: 'http://images.csdn.net/20140709/swift_%E5%89%AF%E6%9C%AC_%E5%89%AF%E6%9C%AC.jpg',
					url: 'http://www.csdn.net/article/2014-07-08/2820568'
				}, {
					title: '三款开源工具让你的演示脱颖而出',
					description: '这些年，用来创建幻灯片的演示框架数目激增，这些框架充分发挥了HTML5、CSS3和JavaScript的优势，只需要一个普通的浏览器就可以创建属于你的幻灯片。',
					picUrl: 'http://cms.csdnimg.cn/article/201407/09/53bca9b695af3.jpg',
					url: 'http://code.csdn.net/news/2820582'
				}]
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
	console.log(msg);
	weixin.sendMsg(msg);
});

// 监听图片消息
weixin.on('imageMsg', function(data) {
	console.log('>>>>>>>>> imageMsg emit >>>>>>>>>');
	console.log(data);
});

// 监听语音消息
weixin.on('voiceMsg', function(data) {
	console.log('>>>>>>>>> voiceMsg emit >>>>>>>>>');
	console.log(data);
});

// 监听视频消息
weixin.on('videoMsg', function(data) {
	console.log('>>>>>>>>> videoMsg emit >>>>>>>>>');
	console.log(data);
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

// 扫描带参数二维码事件
// 2. 用户已关注时的事件推送
weixin.on("scanEventMsg", function(data) {
	console.log('>>>>>>>>> scanEventMsg emit >>>>>>>>>');
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

app.listen(80); 
```

更多API请参考：[API Document](http://silianlinyi.github.io/weixin-apis/index.html)


















