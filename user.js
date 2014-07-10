var request = require('request');

module.exports = function(Weixin) {
	
	/************************************************************
	 * 用户管理 - 分组管理接口
	 * 开发者可以使用接口，对公众平台的分组进行查询、创建、修改操作，也可以使用接口在需要时移动用户到某个分组。
	 * 1.创建分组
	 * 2.查询所有分组
	 * 3.查询用户所在分组
	 * 4.修改分组名
	 * 5.移动用户分组
	 ************************************************************/
	
	/**
	 * @method createGroup
	 * 创建分组
	 */
	Weixin.prototype.createGroup = function(group, callback) {
		callback = callback || function(data) {
			console.log('>>> createGroup >>> default callback function invoked.');
			console.log(data);
		}

		var options = {
			url : 'https://api.weixin.qq.com/cgi-bin/groups/create?access_token=' + this.accessToken,
			method : 'post',
			body : JSON.stringify({
				"group" : group
			})
		};
		request(options, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				callback(JSON.parse(body));
			} else {
				console.log(err);
			}
		});
	};
	
	/**
	 * @method getGroups
	 * 查询所有分组
	 */
	Weixin.prototype.getGroups = function(callback) {
		callback = callback || function(data) {
			console.log('>>> getGroups >>> default callback function invoked.');
			console.log(data);
		}
	
		var url = "https://api.weixin.qq.com/cgi-bin/groups/get?access_token=" + this.accessToken;
		request(url, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				callback(JSON.parse(body));
			} else {
				console.log(err);
			}
		});
	};
	
	/**
	 * @method getGroupId
	 * 查询用户所在分组
	 * 通过用户的OpenID查询其所在的GroupID。
	 * @param {String} openid 用户的OpenID
	 * @param {Function} callback
	 */
	Weixin.prototype.getGroupId = function(openid, callback) {
		callback = callback || function(data) {
			console.log('>>> getGroupId >>> default callback function invoked.');
			console.log(data);
		}
	
		var options = {
			url : 'https://api.weixin.qq.com/cgi-bin/groups/getid?access_token=' + this.accessToken,
			method : 'post',
			body : JSON.stringify({
				"openid" : openid
			})
		};
		request(options, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				callback(JSON.parse(body));
			} else {
				console.log(err);
			}
		});
	};
	
	/**
	 * @method updateGroup
	 * 修改分组名
	 * @param {String} groupId 分组id，由微信分配
	 * @param {String} name 分组名字（30个字符以内）
	 */
	Weixin.prototype.updateGroup = function(config, callback) {
		callback = callback || function(data) {
			console.log('>>> updateGroup >>> default callback function invoked.');
			console.log(data);
		}
	
		var options = {
			url : 'https://api.weixin.qq.com/cgi-bin/groups/update?access_token=' + this.accessToken,
			method : 'post',
			body : JSON.stringify({
				"group" : {
					"id": config.id,
					"name": config.name
				}
			})
		};
		request(options, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				callback(JSON.parse(body));
			} else {
				console.log(err);
			}
		});
	};
	
	/**
	 * @method updateMemberGroup
	 * 移动用户分组
	 * @param {String} openid 用户唯一标识符
	 * @param {String} to_groupid 分组id
	 */
	Weixin.prototype.updateMemberGroup = function(config, callback) {
		callback = callback || function(data) {
			console.log('>>> updateMemberGroup >>> default callback function invoked.');
			console.log(data);
		}
	
		var options = {
			url : 'https://api.weixin.qq.com/cgi-bin/groups/members/update?access_token=' + this.accessToken,
			method : 'post',
			body : JSON.stringify({
				"openid" : config.openid,
				"to_groupid" : config.toGroupid
			})
		};
		request(options, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				callback(JSON.parse(body));
			} else {
				console.log(err);
			}
		});
	};
	
	
	/************************************************************
	 * 用户管理 - 获取用户基本信息
	 * 在关注者与公众号产生消息交互后，公众号可获得关注者的OpenID（加密后的微信号，
	 * 每个用户对每个公众号的OpenID是唯一的。对于不同公众号，同一用户的openid不同）。
	 * 公众号可通过本接口来根据OpenID获取用户基本信息，包括昵称、头像、性别、所在城市、语言和关注时间。
	 ************************************************************/
	/**
	 * @method getUserInfo
	 * 获取用户基本信息
	 * 开发者可通过OpenID来获取用户基本信息。
	 */
	Weixin.prototype.getUserInfo = function(config, callback) {
		callback = callback || function(data) {
			console.log('>>> getUserInfo >>> default callback function invoked.');
			console.log(data);
		}
	
		var openid = config.openid;
		var lang = config.lang || "zh_CN";
		var url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + this.accessToken + "&openid=" + openid + "&lang=" + lang;
		request(url, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				callback(JSON.parse(body));
			} else {
				console.log(err);
			}
		});
	};
	
	/************************************************************
	 * 用户管理 - 获取关注者列表
	 * 公众号可通过本接口来获取帐号的关注者列表，关注者列表由一串OpenID（加密后的微信号，
	 * 每个用户对每个公众号的OpenID是唯一的）组成。一次拉取调用最多拉取10000个关注者的OpenID，
	 * 可以通过多次拉取的方式来满足需求。
	 ************************************************************/
	/**
	 * @method getUsers
	 * 获取关注者列表
	 * 公众号可通过本接口来获取帐号的关注者列表，关注者列表由一串OpenID（加密后的微信号，每个用户对每个公众号的OpenID是唯一的）组成。
	 * 一次拉取调用最多拉取10000个关注者的OpenID，可以通过多次拉取的方式来满足需求。
	 * @param {String} nextOpenid 第一个拉取的OPENID，不填默认从头开始拉取
	 * @param {Function} callback
	 */
	Weixin.prototype.getUsers = function(nextOpenid, callback) {
		callback = callback || function(data) {
			console.log('>>> getUsers >>> default callback function invoked.');
			console.log(data);
		}
	
		var url = "https://api.weixin.qq.com/cgi-bin/user/get?access_token=" + this.accessToken + "&next_openid=" + nextOpenid;
		request(url, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				callback(JSON.parse(body));
			} else {
				console.log(err);
			}
		});
	};
	
	
	
	// TODO
	/************************************************************
	 * 用户管理 - 网页授权获取用户基本信息
	 * 1.第一步：用户同意授权，获取code
	 * 2.第二步：通过code换取网页授权access_token
	 * 3.第三步：刷新access_token（如果需要）
	 * 4.第四步：拉取用户信息(需scope为 snsapi_userinfo)
	 ************************************************************/
	/**
	 * @method getOauth2AccessToken
	 * 第二步：通过code换取网页授权access_token
	 * @param {String} code 填写第一步获取的code参数
	 */
	Weixin.prototype.getOauth2AccessToken = function(code, callback) {
		callback = callback ||
		function(err, res, body) {
			console.log('default callback function invoked.');
			console.log(body);
		}
	
		var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + this.appid + '&secret=' + this.secret + '&code=' + code + '&grant_type=authorization_code';
	
		request(url, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				callback(error, response, body);
			}
		});
	};
	
	/**
	 * @method getOauth2RefreshToken
	 * 第三步：刷新access_token（如果需要）
	 *
	 */
	Weixin.prototype.getOauth2RefreshToken = function(refresh_token, callback) {
		callback = callback ||
		function(err, res, body) {
			console.log('default callback function invoked.');
			console.log(body);
		}
	
		var url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=' + this.appid + '&grant_type=refresh_token&refresh_token=' + refresh_token;
	
		request(url, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				callback(error, response, body);
			}
		});
	};
	
	/**
	 * @method getUserinfo
	 * 第四步：拉取用户信息(需scope为 snsapi_userinfo)
	 * @param {String} access_token 网页授权接口调用凭证,注意：此access_token与基础支持的access_token不同
	 * @param {String} openid 用户的唯一标识
	 * @param {String} lang 返回国家地区语言版本，zh_CN 简体，zh_TW 繁体，en 英语
	 */
	//Weixin.prototype.getUserinfo = function(access_token, openid, lang, callback) {
	//	callback = callback ||
	//	function(err, res, body) {
	//		console.log('default callback function invoked.');
	//		console.log(body);
	//	}
	//
	//	var url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN';
	//
	//	request(url, function(error, response, body) {
	//		if (!error && response.statusCode == 200) {
	//			callback(error, response, body);
	//		}
	//	});
	//};
	
	
	
	

}
