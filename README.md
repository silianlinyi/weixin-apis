## 微信 API For Nodejs

### 交流

欢迎大家加入QQ群：172342609 《微信 API For Nodejs》专用交流群

## API

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
