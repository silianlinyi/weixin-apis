## 微信 API For Nodejs

### 交流

欢迎大家加入QQ群：172342609 《微信 API For Nodejs》专用交流群

### 快速开发


**第一步** 加载模块

```
var weixin = require('weixin');
```

**第二部** 设置配置参数

```
weixin.configurate({
	token : 'xihumaker',
	appid : 'wxc2d82aa2e44a2faa',
	secret : '9ef7661014dd0dbd098b483fee803d58'
});
```

**第三步** 接入微信验证

```
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
```

**第四步** 监听消息

```
// 监听文本消息
weixin.on('textMsg', function(data) {
	console.log('>>>>>>>>> textMsg emit >>>>>>>>>');
	console.log(data);
	var msg = {
		toUserName : data.fromUserName,
		fromUserName : data.toUserName,
		msgType : 'text',
		content : data.content
	};
	weixin.sendMsg(msg);
});
```

### API

#### weixin.configurate 微信接入配置

```
weixin.configurate({
	token : '这是你的token',
	appid : '这是你的appid',
	secret : '这是你的secret'
});
```

#### weixin.checkSignature 验证消息真实性

```
// 接入验证
app.get('/verify', function(req, res) {
	if (weixin.checkSignature(req)) {
		res.send(200, req.query.echostr);
	} else {
		res.send(200, 'fail');
	}
});
```

#### 监听文本消息

```
weixin.on('textMsg', function(data) {
	console.log('>>>>>>>>> textMsg emit >>>>>>>>>');
	console.log(data);
	// TODO
});
```

#### 监听图片消息

```
weixin.on('imageMsg', function(data) {
	console.log('>>>>>>>>> imageMsg emit >>>>>>>>>');
	console.log(data);
	// TODO
});
```

#### 监听语音消息

```
weixin.on('voiceMsg', function(data) {
	console.log('>>>>>>>>> voiceMsg emit >>>>>>>>>');
	console.log(data);
	// TODO
});
```

#### 监听视频消息

```
weixin.on('videoMsg', function(data) {
	console.log('>>>>>>>>> videoMsg emit >>>>>>>>>');
	console.log(data);
	// TODO
});
```

#### 监听地理位置消息

```
weixin.on('locationMsg', function(data) {
	console.log('>>>>>>>>> locationMsg emit >>>>>>>>>');
	console.log(data);
	// TODO
});
```

#### 监听链接消息

```
weixin.on('linkMsg', function(data) {
	console.log('>>>>>>>>> linkMsg emit >>>>>>>>>');
	console.log(data);
	// TODO
});
```


#### 监听关注事件

```
weixin.on('subscribeEventMsg', function(data) {
	console.log('>>>>>>>>> subscribeEventMsg emit >>>>>>>>>');
	console.log(data);
	// TODO
});
```

#### 监听取消关注事件

```
weixin.on('unsubscribeEventMsg', function(data) {
	console.log('>>>>>>>>> unsubscribeEventMsg emit >>>>>>>>>');
	console.log(data);
	// TODO
});
```

#### 监听上报地理位置事件

```
weixin.on('locationEventMsg', function(data) {
	console.log('>>>>>>>>> locationEventMsg emit >>>>>>>>>');
	console.log(data);
	// TODO
});
```

#### 监听点击菜单拉取消息时的事件推送

```
weixin.on('clickEventMsg', function(data) {
	console.log('>>>>>>>>> clickEventMsg emit >>>>>>>>>');
	console.log(data);
	// TODO
});
```

#### 监听点击菜单跳转链接时的事件推送

```
weixin.on('viewEventMsg', function(data) {
	console.log('>>>>>>>>> viewEventMsg emit >>>>>>>>>');
	console.log(data);
	// TODO
});
```



















