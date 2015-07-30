var sha1 = require('sha1');
var xml2js = require('xml2js');
var util = require('util');
var events = require('events');
var request = require('request');
var fs = require('fs');

/**
 * @class Weixin
 * 微信类，继承events.EventEmitter类
 */
function Weixin() {
    events.EventEmitter.call(this);
}

util.inherits(Weixin, events.EventEmitter);

// 返回当前时间（以秒为单位）
function now() {
    return Math.round(Date.now() / 1000)
}

/**
 * @method configurate
 * 微信接口配置
 * @param {Object} config
 * @param {String} config.token 微信接口配置token
 * @param {String} config.appid 微信接口appid
 * @param {String} config.secret 微信接口secret
 */
Weixin.prototype.configurate = function (config) {
    var self = this;
    self.config = config;
    self.app = config.app;
    self.token = config.token;
    self.appid = config.appid || '';
    self.secret = config.secret || '';
    var ret = self.getCacheAccessTokenSync();
    self.accessToken = ret.access_token;

    self.init();
};

Weixin.prototype.init = function () {
    var self = this;

    // 接入验证
    self.app.get('/verify', function (req, res) {
        if (self.checkSignature(req)) {
            res.send(200, req.query.echostr);
        } else {
            res.send(200, 'fail');
        }
    });

    // Start
    self.app.post('/verify', function (req, res) {
        self.loop(req, res);
    });

    // 正常情况下access_token有效期为3600秒
    setInterval(function () {
        self.getAccessToken(function (data) {
            var ret = JSON.parse(data);
            if (ret.access_token) {//获取成功
                console.log('access_token获取成功');
                self.saveAccessToken(data);
                self.accessToken = ret.access_token;
            } else {
                console.log("access_token获取失败");
            }
        });
    }, 3600000);

    self.URL_LIST = {
        SEND_CUSTOM_MSG: 'https://api.weixin.qq.com/cgi-bin/message/custom/send'
    };
};


/**
 * @method getCacheAccessToken
 * 从access_token.json文件读取access_token.json值（异步）
 */
Weixin.prototype.getCacheAccessToken = function (callback) {
    fs.readFile(__dirname + '/access_token.json', {
        encoding: 'utf8',
        flag: 'r'
    }, function (err, data) {
        if (err) {
            console.log(err);
        }
        var ret = JSON.parse(data);
        callback(ret);
    });
};

/**
 * @method getCacheAccessTokenSync
 * 从access_token.json文件读取access_token.json值（同步）
 */
Weixin.prototype.getCacheAccessTokenSync = function () {
    var ret = fs.readFileSync(__dirname + '/access_token.json', {
        encoding: 'utf8',
        flag: 'r'
    });
    return JSON.parse(ret);
};

/**
 * @method getAccessToken
 * 从微信服务器获取一个新的access_token
 */
Weixin.prototype.getAccessToken = function (callback) {
    var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + this.appid + "&secret=" + this.secret;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body);
        }
    });
};

/**
 * @method saveAccessToken
 * 将从微信服务器获取到的access_token值保存在access_token.json文件中（异步）
 */
Weixin.prototype.saveAccessToken = function (data, callback) {
    fs.writeFile(__dirname + '/access_token.json', data, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('access_token保存成功');
    });
};

/**
 * @method saveAccessTokenSync
 * 将从微信服务器获取到的access_token值保存在access_token.json文件中（同步）
 */
Weixin.prototype.saveAccessTokenSync = function (data) {
    var ret = fs.writeFileSync(__dirname + '/access_token.json', data);
    return JSON.parse(ret);
};

/**
 * 刷新access_token，上线时调用一次
 */
Weixin.prototype.reflashAccessToken = function () {
    var self = this;
    self.getAccessToken(function (data) {
        var ret = JSON.parse(data);
        if (ret.access_token) {//获取成功
            console.log('access_token获取成功');
            self.saveAccessToken(data);
            self.accessToken = ret.access_token;
        } else {
            console.log("access_token获取失败");
        }
    });
};

/**
 * @method checkSignature
 * 验证消息真实性
 */
Weixin.prototype.checkSignature = function (req) {
    var signature = req.param('signature');
    var timestamp = req.param('timestamp');
    var nonce = req.param('nonce');
    var echostr = req.param('echostr');
    // 1. 将token、timestamp、nonce三个参数进行字典序排序
    var arr = [this.token, timestamp, nonce];
    arr.sort();
    // 2. 将三个参数字符串拼接成一个字符串进行sha1加密
    var str = sha1(arr.join(""));
    // 3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (str == signature) {
        return true;
    } else {
        return false;
    }
};

// Loop
Weixin.prototype.loop = function (req, res) {
    this.res = res;
    var self = this;
    // 获取XML内容
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        buf += chunk;
    });

    // 内容接收完毕
    req.on('end', function () {
        xml2js.parseString(buf, function (err, json) {
            if (err) {
                err.status = 400;
            } else {
                req.body = json;
            }
        });

        self.data = req.body.xml;
        self.parse(self.data);
    });
}
// 解析
Weixin.prototype.parse = function (data) {
    var msgType = data.MsgType[0] ? data.MsgType[0] : 'text';
    switch (msgType) {
        case 'text':
            this.parseTextMsg(data);
            break;
        case 'image':
            this.parseImageMsg(data);
            break;
        case 'voice':
            this.parseVoiceMsg(data);
            break;
        case 'video':
            this.parseVideoMsg(data);
            break;
        case 'location':
            this.parseLocationMsg(data);
            break;
        case 'link':
            this.parseLinkMsg(data);
            break;
        case 'event' :
            this.parseEventMsg(data);
            break;
        default:
            break;
    }
};

/**
 * @method parseTextMsg
 * 文本消息
 * toUserName    开发者微信号
 * fromUserName    发送方帐号（一个OpenID）
 * createTime    消息创建时间 （整型）
 * msgType        text
 * content        文本消息内容
 * msgId        消息id，64位整型
 */
Weixin.prototype.parseTextMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "content": data.Content[0],
        "msgId": data.MsgId[0]
    };
    this.emit("textMsg", msg);
    return this;
};

/**
 * @method parseImageMsg
 * 图片消息
 * toUserName    开发者微信号
 * fromUserName    发送方帐号（一个OpenID）
 * createTime    消息创建时间 （整型）
 * msgType        image
 * picUrl        图片链接
 * mediaId        图片消息媒体id，可以调用多媒体文件下载接口拉取数据。
 * msgId        消息id，64位整型
 */
Weixin.prototype.parseImageMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "picUrl": data.PicUrl[0],
        "msgId": data.MsgId[0],
        "mediaId": data.MediaId[0]
    };
    this.emit('imageMsg', msg);
    return this;
};

/*
 * @method parseVoiceMsg
 * 语音消息
 * toUserName	开发者微信号
 * fromUserName	发送方帐号（一个OpenID）
 * createTime	消息创建时间 （整型）
 * msgType		语音为voice
 * mediaId	 	语音消息媒体id，可以调用多媒体文件下载接口拉取数据。
 * format	 	语音格式，如amr，speex等
 * msgID	 	消息id，64位整型
 *
 * 开通语音识别功能，用户每次发送语音给公众号时，微信会在推送的语音消息XML数据包中，增加一个Recongnition字段。
 * 注：由于客户端缓存，开发者开启或者关闭语音识别功能，对新关注者立刻生效，对已关注用户需要24小时生效。开发者可以重新关注此帐号进行测试。
 * recognition	 语音识别结果，UTF8编码
 */
Weixin.prototype.parseVoiceMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "mediaId": data.MediaId[0],
        "format": data.Format[0],
        "msgId": data.MsgId[0],
        "recognition": data.Recognition ? data.Recognition[0] : '未开通语音识别功能'
    };
    this.emit('voiceMsg', msg);
    return this;
};

/**
 * @method parseVideoMsg
 * 视频消息
 * toUserName    开发者微信号
 * fromUserName    发送方帐号（一个OpenID）
 * createTime    消息创建时间 （整型）
 * msgType        视频为video
 * mediaId        视频消息媒体id，可以调用多媒体文件下载接口拉取数据。
 * thumbMediaId    视频消息缩略图的媒体id，可以调用多媒体文件下载接口拉取数据。
 * msgId        消息id，64位整型
 */
Weixin.prototype.parseVideoMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "mediaId": data.MediaId[0],
        "thumbMediaId": data.ThumbMediaId[0],
        "msgId": data.MsgId[0]
    };
    this.emit('videoMsg', msg);
    return this;
};

/**
 * @method parseLocationMsg
 * 地理位置消息
 * toUserName    开发者微信号
 * fromUserName     发送方帐号（一个OpenID）
 * createTime     消息创建时间 （整型）
 * msgType        location
 * location_X     地理位置维度
 * location_Y     地理位置经度
 * scale        地图缩放大小
 * label        地理位置信息
 * msgId        消息id，64位整型
 */
Weixin.prototype.parseLocationMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "location_X": data.Location_X[0],
        "location_Y": data.Location_Y[0],
        "scale": data.Scale[0],
        "label": data.Label[0],
        "msgId": data.MsgId[0]
    };
    this.emit('locationMsg', msg);
    return this;
};

/**
 * @method parseLinkMsg
 * 链接消息
 * toUserName     接收方微信号
 * fromUserName     发送方微信号，若为普通用户，则是一个OpenID
 * createTime     消息创建时间
 * msgType        消息类型，link
 * title        消息标题
 * description    消息描述
 * url            消息链接
 * msgId        消息id，64位整型
 */
Weixin.prototype.parseLinkMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "title": data.Title[0],
        "description": data.Description[0],
        "url": data.Url[0],
        "msgId": data.MsgId[0]
    };
    this.emit('linkMsg', msg);
    return this;
};

/**
 * @method parseEventMsg
 * 接收事件推送
 */
Weixin.prototype.parseEventMsg = function (data) {
    var event = data.Event[0];
    switch (event) {
        case 'subscribe':
            this.parseSubscribeEventMsg(data);
            break;
        case 'unsubscribe':
            this.parseUnsubscribeEventMsg(data);
            break;
        case 'SCAN':
            this.parseScanEventMsg(data);
            break;
        case 'LOCATION':
            this.parseLocationEventMsg(data);
            break;
        case 'CLICK':
            this.parseClickEventMsg(data);
            break;
        case 'VIEW':
            this.parseViewEventMsg(data);
            break;
        default:
            break;
    }
};

/**
 * @method parseSubscribeEventMsg
 * 关注事件
 * toUserName    开发者微信号
 * fromUserName    发送方帐号（一个OpenID）
 * createTime    消息创建时间 （整型）
 * msgType        消息类型，event
 * event        事件类型，subscribe(订阅)
 * eventKey        事件KEY值，qrscene_为前缀，后面为二维码的参数值
 * ticket        二维码的ticket，可用来换取二维码图片
 */
Weixin.prototype.parseSubscribeEventMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "event": data.Event[0],
        "eventKey": data.EventKey[0],
        "ticket": data.Ticket ? data.Ticket[0] : '没有Ticket属性'
    };
    this.emit('subscribeEventMsg', msg);
    return this;
};

/**
 * @method parseUnsubscribeEventMsg
 * 取消关注事件
 * toUserName    开发者微信号
 * fromUserName    发送方帐号（一个OpenID）
 * createTime    消息创建时间 （整型）
 * msgType        消息类型，event
 * event        事件类型，unsubscribe(取消订阅)
 */
Weixin.prototype.parseUnsubscribeEventMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "event": data.Event[0],
        "eventKey": data.EventKey
    };
    this.emit('unsubscribeEventMsg', msg);
    return this;
};

/**
 * @method parseScanEventMsg
 * 扫描带参数二维码事件
 * 用户已关注时的事件推送
 * toUserName    开发者微信号
 * fromUserName    发送方帐号（一个OpenID）
 * createTime    消息创建时间 （整型）
 * msgType        消息类型，event
 * event        事件类型，SCAN
 * eventKey        事件KEY值，是一个32位无符号整数，即创建二维码时的二维码scene_id
 * ticket        二维码的ticket，可用来换取二维码图片
 */
Weixin.prototype.parseScanEventMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "event": data.Event[0],
        "eventKey": data.EventKey[0],
        "ticket": data.Ticket[0]
    };
    this.emit('scanEventMsg', msg);
    return this;
};

/**
 * @method parseLocationEventMsg
 * 上报地理位置事件
 * 用户同意上报地理位置后，每次进入公众号会话时，都会在进入时上报地理位置，或在进入会话后每5秒上报一次地理位置，
 * 公众号可以在公众平台网站中修改以上设置。上报地理位置时，微信会将上报地理位置事件推送到开发者填写的URL。
 * toUserName    开发者微信号
 * fromUserName    发送方帐号（一个OpenID）
 * createTime    消息创建时间 （整型）
 * msgType        消息类型，event
 * event        事件类型，LOCATION
 * latitude        地理位置纬度
 * longitude    地理位置经度
 * precision    地理位置精度
 */
Weixin.prototype.parseLocationEventMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "event": data.Event[0],
        "latitude": data.Latitude[0],
        "longitude": data.Longitude[0],
        "precision": data.Precision[0]
    };
    this.emit('locationEventMsg', msg);
    return this;
};

/**
 * @method parseClickEventMsg
 * 点击菜单拉取消息时的事件推送
 * toUserName    开发者微信号
 * fromUserName    发送方帐号（一个OpenID）
 * createTime    消息创建时间 （整型）
 * msgType        消息类型，event
 * event        事件类型，CLICK
 * eventKey        事件KEY值，与自定义菜单接口中KEY值对应
 */
Weixin.prototype.parseClickEventMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "event": data.Event[0],
        "eventKey": data.EventKey[0]
    };
    this.emit('clickEventMsg', msg);
    return this;
};

/**
 * @method parseViewEventMsg
 * 点击菜单跳转链接时的事件推送
 * toUserName    开发者微信号
 * fromUserName    发送方帐号（一个OpenID）
 * createTime    消息创建时间 （整型）
 * msgType        消息类型，event
 * event        事件类型，VIEW
 * eventKey        事件KEY值，设置的跳转URL
 */
Weixin.prototype.parseViewEventMsg = function (data) {
    var msg = {
        "toUserName": data.ToUserName[0],
        "fromUserName": data.FromUserName[0],
        "createTime": data.CreateTime[0],
        "msgType": data.MsgType[0],
        "event": data.Event[0],
        "eventKey": data.EventKey[0]
    };
    this.emit('viewEventMsg', msg);
    return this;
};

/**
 * @method sendMsg
 * 发送消息
 */
Weixin.prototype.sendMsg = function (msg) {
    switch (msg.msgType) {
        case 'text':
            this.sendTextMsg(msg);
            break;
        case 'image':
            this.sendImageMsg(msg);
            break;
        case 'voice':
            this.sendVoiceMsg(msg);
            break;
        case 'video':
            this.sendVideoMsg(msg);
            break;
        case 'music':
            this.sendMusicMsg(msg);
            break;
        case 'news':
            this.sendNewsMsg(msg);
            break;
        default:
            break;
    }
};

/**
 * @method sendTextMsg
 * 回复文本消息
 * 参数            是否必须    描述
 * ToUserName    是        接收方帐号（收到的OpenID）
 * FromUserName    是        开发者微信号
 * CreateTime    是        消息创建时间 （整型）
 * MsgType        是        text
 * Content        是        回复的消息内容（换行：在content中能够换行，微信客户端就支持换行显示）
 */
Weixin.prototype.sendTextMsg = function (msg) {
    var createTime = Math.round(Date.now() / 1000);
    var out = "<xml>" +
        "<ToUserName><![CDATA[" + msg.toUserName + "]]></ToUserName>" +
        "<FromUserName><![CDATA[" + msg.fromUserName + "]]></FromUserName>" +
        "<CreateTime>" + createTime + "</CreateTime>" +
        "<MsgType><![CDATA[text]]></MsgType>" +
        "<Content><![CDATA[" + msg.content + "]]></Content>" +
        "</xml>";
    this.res.type('xml');
    this.res.send(out);
    return this;
};

/**
 * @method sendImageMsg
 * 回复图片消息
 * 参数            是否必须    描述
 * ToUserName    是        接收方帐号（收到的OpenID）
 * FromUserName    是        开发者微信号
 * CreateTime    是        消息创建时间 （整型）
 * MsgType        是        image
 * MediaId        是        通过上传多媒体文件，得到的id。
 */
Weixin.prototype.sendImageMsg = function (msg) {
    var createTime = Math.round(Date.now() / 1000);
    var out = "<xml>" +
        "<ToUserName><![CDATA[" + msg.toUserName + "]]></ToUserName>" +
        "<FromUserName><![CDATA[" + msg.fromUserName + "]]></FromUserName>" +
        "<CreateTime>" + createTime + "</CreateTime>" +
        "<MsgType><![CDATA[image]]></MsgType>" +
        "<Image>" +
        "<MediaId><![CDATA[" + msg.mediaId + "]]></MediaId>" +
        "</Image>" +
        "</xml>";
    this.res.type('xml');
    this.res.send(out);
    return this;
};

/**
 * @method sendVoiceMsg
 * 回复语音消息
 * 参数            是否必须    描述
 * ToUserName    是        接收方帐号（收到的OpenID）
 * FromUserName    是        开发者微信号
 * CreateTime    是        消息创建时间 （整型）
 * MsgType        是        语音，voice
 * MediaId        是        通过上传多媒体文件，得到的id
 */
Weixin.prototype.sendVoiceMsg = function (msg) {
    var createTime = Math.round(Date.now() / 1000);
    var out = "<xml>" +
        "<ToUserName><![CDATA[" + msg.toUserName + "]]></ToUserName>" +
        "<FromUserName><![CDATA[" + msg.fromUserName + "]]></FromUserName>" +
        "<CreateTime>" + createTime + "</CreateTime>" +
        "<MsgType><![CDATA[voice]]></MsgType>" +
        "<Voice>" +
        "<MediaId><![CDATA[" + msg.mediaId + "]]></MediaId>" +
        "</Voice>" +
        "</xml>";
    this.res.type('xml');
    this.res.send(out);
    return this;
};

/**
 * @method sendVideoMsg
 * 回复视频消息
 * 参数            是否必须    描述
 * ToUserName    是        接收方帐号（收到的OpenID）
 * FromUserName    是        开发者微信号
 * CreateTime    是        消息创建时间 （整型）
 * MsgType        是        video
 * MediaId        是        通过上传多媒体文件，得到的id
 * Title        否        视频消息的标题
 * Description     否        视频消息的描述
 */
Weixin.prototype.sendVideoMsg = function (msg) {
    var createTime = Math.round(Date.now() / 1000);
    var title = msg.title || "默认的视频标题";
    var description = msg.description || "默认的视频描述";
    var out = "<xml>" +
        "<ToUserName><![CDATA[" + msg.toUserName + "]]></ToUserName>" +
        "<FromUserName><![CDATA[" + msg.fromUserName + "]]></FromUserName>" +
        "<CreateTime>" + createTime + "</CreateTime>" +
        "<MsgType><![CDATA[video]]></MsgType>" +
        "<Video>" +
        "<MediaId><![CDATA[" + msg.mediaId + "]]></MediaId>" +
        "<Title><![CDATA[" + title + "]]></Title>" +
        "<Description><![CDATA[" + description + "]]></Description>" +
        "</Video>" +
        "</xml>";
    this.res.type('xml');
    this.res.send(out);
    return this;
};

/**
 * @method sendMusicMsg
 * 回复音乐消息
 * 参数            是否必须    描述
 * ToUserName    是        接收方帐号（收到的OpenID）
 * FromUserName    是        开发者微信号
 * CreateTime    是        消息创建时间 （整型）
 * MsgType        是        music
 * Title        否        音乐标题
 * Description    否        音乐描述
 * MusicURL        否        音乐链接
 * HQMusicUrl    否        高质量音乐链接，WIFI环境优先使用该链接播放音乐
 * ThumbMediaId    是        缩略图的媒体id，通过上传多媒体文件，得到的id
 */
Weixin.prototype.sendMusicMsg = function (msg) {
    var createTime = now();
    var title = msg.title || "音乐标题";
    var description = msg.description || "音乐描述";
    var musicUrl = msg.musicUrl || "";
    var HQMusicUrl = msg.HQMusicUrl || "";

    var out = "<xml>" +
        "<ToUserName><![CDATA[" + msg.toUserName + "]]></ToUserName>" +
        "<FromUserName><![CDATA[" + msg.fromUserName + "]]></FromUserName>" +
        "<CreateTime>" + createTime + "</CreateTime>" +
        "<MsgType><![CDATA[music]]></MsgType>" +
        "<Music>" +
        "<Title><![CDATA[" + title + "]]></Title>" +
        "<Description><![CDATA[" + description + "]]></Description>" +
        "<MusicUrl><![CDATA[" + musicUrl + "]]></MusicUrl>" +
        "<HQMusicUrl><![CDATA[" + HQMusicUrl + "]]></HQMusicUrl>" +
        "<ThumbMediaId><![CDATA[" + msg.thumbMediaId + "]]></ThumbMediaId>" +
        "</Music>" +
        "</xml>";
    this.res.type('xml');
    this.res.send(out);
    return this;
};

/**
 * @method sendNewsMsg
 * 回复图文消息
 * 参数            是否必须    描述
 * ToUserName    是        接收方帐号（收到的OpenID）
 * FromUserName    是        开发者微信号
 * CreateTime    是        news
 * ArticleCount    是        图文消息个数，限制为10条以内
 * Articles        是        多条图文消息信息，默认第一个item为大图,注意，如果图文数超过10，则将会无响应
 * Title        否        图文消息标题
 * Description    否        图文消息描述
 * PicUrl        否        图片链接，支持JPG、PNG格式，较好的效果为大图360*200，小图200*200
 * Url            否        点击图文消息跳转链接
 */
Weixin.prototype.sendNewsMsg = function (msg) {
    var createTime = now();
    var articles = msg.articles;
    var articleCount = articles.length;
    var out = "";
    var article;

    out += "<xml>" +
        "<ToUserName><![CDATA[" + msg.toUserName + "]]></ToUserName>" +
        "<FromUserName><![CDATA[" + msg.fromUserName + "]]></FromUserName>" +
        "<CreateTime>" + createTime + "</CreateTime>" +
        "<MsgType><![CDATA[news]]></MsgType>" +
        "<ArticleCount>" + articleCount + "</ArticleCount>" +
        "<Articles>";
    for (var i = 0; i < articleCount; i++) {
        article = articles[i];
        out += "<item>" + "<Title><![CDATA[" + article.title + "]]></Title>" +
            "<Description><![CDATA[" + article.description + "]]></Description>" +
            "<PicUrl><![CDATA[" + article.picUrl + "]]></PicUrl>" +
            "<Url><![CDATA[" + article.url + "]]></Url>" +
            "</item>";
    }
    out += "</Articles></xml>";

    this.res.type('xml');
    this.res.send(out);
    return this;
};

/************************************************************
 * 发送消息 - 发送客服消息
 * 当用户主动发消息给公众号的时候（包括发送信息、点击自定义菜单、订阅事件、扫描二维码事件、
 * 支付成功事件、用户维权），微信将会把消息数据推送给开发者，开发者在一段时间内（目前修改
 * 为48小时）可以调用客服消息接口，通过POST一个JSON数据包来发送消息给普通用户，在48小时内
 * 不限制发送次数。此接口主要用于客服等有人工消息处理环节的功能，方便开发者为用户提供更加
 * 优质的服务。
 * 1.发送文本消息
 * 2.发送图片消息
 * 3.发送语音消息
 * 4.发送视频消息
 * 5.发送音乐消息
 * 6.发送图文消息
 ************************************************************/

/**
 * 发送客服消息
 */
Weixin.prototype.sendCustomMsg = function (msg, callback) {
    var msgType = msg.msgType;
    switch (msgType) {
        case 'text':
            this.sendCustomTextMsg(msg, callback);
            break;
        case 'image':
            this.sendCustomImageMsg(msg, callback);
            break;
        case 'voice':
            this.sendCustomVoiceMsg(msg, callback);
            break;
        case 'video':
            this.sendCustomVideoMsg(msg, callback);
            break;
        case 'music':
            this.sendCustomMusicMsg(msg, callback);
            break;
        case 'news':
            this.sendCustomNewsMsg(msg, callback);
            break;
        default:
            break;
    }
};

/**
 * @method sendCustomTextMsg
 * 发送客服消息 - 文本消息
 * @param {object} msg
 * @param {function} [callback] 回调函数，可选
 */
Weixin.prototype.sendCustomTextMsg = function (msg, callback) {
    callback = callback || function (data) {
            console.log('>>> sendCustomTextMsg >>> default callback function invoked.');
            console.log(data);
        };

    var options = {
        url: this.URL_LIST.SEND_CUSTOM_MSG + '?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            "touser": msg.toUserName,
            "msgtype": "text",
            "text": {
                "content": msg.content
            }
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};

/**
 * @method sendCustomImageMsg
 * 发送客服消息 - 图片消息
 */
Weixin.prototype.sendCustomImageMsg = function (msg, callback) {
    callback = callback || function (data) {
            console.log('>>> sendCustomImageMsg >>> default callback function invoked.');
            console.log(data);
        };

    var options = {
        url: this.URL_LIST.SEND_CUSTOM_MSG + '?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            "touser": msg.toUserName,
            "msgtype": "image",
            "image": {
                "media_id": msg.mediaId
            }
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};

/**
 * @method sendCustomVoiceMsg
 * 发送客服消息 - 语音消息
 */
Weixin.prototype.sendCustomVoiceMsg = function (msg, callback) {
    callback = callback || function (data) {
            console.log('>>> sendCustomVoiceMsg >>> default callback function invoked.');
            console.log(data);
        };

    var options = {
        url: this.URL_LIST.SEND_CUSTOM_MSG + '?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            "touser": msg.toUserName,
            "msgtype": "voice",
            "voice": {
                "media_id": msg.mediaId
            }
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};

/**
 * @method sendCustomVideoMsg
 * 发送客服消息 - 视频消息
 */
Weixin.prototype.sendCustomVideoMsg = function (msg, callback) {
    callback = callback || function (data) {
            console.log('>>> sendCustomVideoMsg >>> default callback function invoked.');
            console.log(data);
        }

    var options = {
        url: this.URL_LIST.SEND_CUSTOM_MSG + '?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            "touser": msg.toUserName,
            "msgtype": "video",
            "video": {
                "media_id": msg.mediaId,
                "title": msg.title || '视频消息的标题',
                "description": msg.description || '视频消息的描述'
            }
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};

/**
 * @method sendCustomMusicMsg
 * 发送客服消息 - 音乐消息
 */
Weixin.prototype.sendCustomMusicMsg = function (msg, callback) {
    callback = callback || function (data) {
            console.log('>>> sendCustomMusicMsg >>> default callback function invoked.');
            console.log(data);
        }

    var options = {
        url: this.URL_LIST.SEND_CUSTOM_MSG + '?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            "touser": msg.toUserName,
            "msgtype": "music",
            "music": {
                "title": msg.title || '音乐标题',
                "description": msg.description || '音乐描述',
                "musicurl": msg.musicUrl,
                "hqmusicurl": msg.HQMusicUrl,
                "thumb_media_id": msg.IMAGE_MEDIAID
            }
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};

/**
 * @method sendCustomNewsMsg
 * 发送客服消息 - 图文消息
 * 图文消息条数限制在10条以内，注意，如果图文数超过10，则将会无响应。
 */
Weixin.prototype.sendCustomNewsMsg = function (msg, callback) {
    callback = callback || function (data) {
            console.log('>>> sendCustomNewsMsg >>> default callback function invoked.');
            console.log(data);
        }

    var options = {
        url: this.URL_LIST.SEND_CUSTOM_MSG + '?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            "touser": msg.toUserName,
            "msgtype": "news",
            "news": {
                "articles": msg.articles
            }
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};

/************************************************************
 * 发送消息 - 高级群发接口
 * 1 上传图文消息素材
 * 2 根据分组进行群发
 * 3 根据OpenID列表群发
 * 4 删除群发
 * 5 事件推送群发结果
 ************************************************************/
/**
 * @method uploadNews
 * 上传图文消息素材
 */
Weixin.prototype.uploadNews = function (msg, callback) {
    callback = callback || function (data) {
            console.log('>>> uploadNews >>> default callback function invoked.');
            console.log(data);
        }

    var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/media/uploadnews?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            articles: msg.articles
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};

/**
 * 根据分组进行群发
 */
// https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token=ACCESS_TOKEN
Weixin.prototype.sendAllByGroup = function () {

};

/**
 * 根据OpenID列表群发
 */
Weixin.prototype.sendByOpenIdList = function (msg, callback) {
    var msgType = msg.msgType;
    switch (msgType) {
        case 'news':
            this.sendNewsByOpenIdList(msg, callback);
            break;
        case 'text':
            this.sendTextByOpenIdList(msg, callback);
            break;
        case 'voice':
            this.sendVoiceByOpenIdList(msg, callback);
            break;
        case 'image':
            this.sendImageByOpenIdList(msg, callback);
            break;
        case 'video':
            this.sendVideoByOpenIdList(msg, callback);
            break;
        default:
            break;
    }
};

/**
 * @method sendNewsByOpenIdList
 * 根据OpenID列表群发 - 图文消息
 */
Weixin.prototype.sendNewsByOpenIdList = function (msg, callback) {
    callback = callback || function (data) {
            console.log('>>> sendNewsByOpenIdList >>> default callback function invoked.');
            console.log(data);
        }

    var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            touser: msg.touser,
            mpnews: {
                media_id: msg.mediaId
            },
            msgtype: 'mpnews'
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};

/**
 * @method sendTextByOpenIdList
 * 根据OpenID列表群发 - 文本消息
 */
Weixin.prototype.sendTextByOpenIdList = function (msg, callback) {
    callback = callback || function (data) {
            console.log('>>> sendTextByOpenIdList >>> default callback function invoked.');
            console.log(data);
        }

    var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            touser: msg.touser,
            msgtype: 'text',
            text: {
                content: msg.content
            }
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};

/**
 * @method sendVoiceByOpenIdList
 * 根据OpenID列表群发 - 语音消息
 */
Weixin.prototype.sendVoiceByOpenIdList = function (msg, callback) {
    callback = callback || function (data) {
            console.log('>>> sendVoiceByOpenIdList >>> default callback function invoked.');
            console.log(data);
        }

    var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            touser: msg.touser,
            msgtype: 'voice',
            voice: {
                media_id: msg.mediaId
            }
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};

/**
 * @method sendImageByOpenIdList
 * 根据OpenID列表群发 - 图片消息
 */
Weixin.prototype.sendImageByOpenIdList = function (msg, callback) {
    callback = callback || function (data) {
            console.log('>>> sendImageByOpenIdList >>> default callback function invoked.');
            console.log(data);
        }

    var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            touser: msg.touser,
            msgtype: 'image',
            image: {
                media_id: msg.mediaId
            }
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};

/**
 * @method sendVideoByOpenIdList
 * 根据OpenID列表群发 - 视频消息
 */
Weixin.prototype.sendVideoByOpenIdList = function (msg, callback) {

};


/**
 * @method deleteMass
 * 删除群发
 */
Weixin.prototype.deleteMass = function () {
    callback = callback || function (data) {
            console.log('>>> deleteMass >>> default callback function invoked.');
            console.log(data);
        }

    var options = {
        url: 'https://api.weixin.qq.com//cgi-bin/message/mass/delete?access_token=' + this.accessToken,
        method: 'post',
        body: JSON.stringify({
            msgid: msg.msgid
        })
    };
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log(err);
        }
    });
};


require('./user')(Weixin);
require('./menu')(Weixin);
require('./qrcode')(Weixin);


module.exports = new Weixin();
