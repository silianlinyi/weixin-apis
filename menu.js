var request = require('request');

module.exports = function(Weixin) {
	
	/************************************************************
	 * 自定义菜单
	 * 自定义菜单创建接口
	 * 自定义菜单查询接口
	 * 自定义菜单删除接口
	 ************************************************************/
	/**
	 * @method createMenu
	 * 自定义菜单 - 自定义菜单创建接口
	 */
	Weixin.prototype.createMenu = function(menuObj, callback) {
		callback = callback || function(data) {
			console.log('>>> createMenu >>> default callback function invoked.');
			console.log(data);
		}
	
		var options = {
			url : 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + this.accessToken,
			method : 'post',
			body : JSON.stringify(menuObj)
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
	 * @method getMenu
	 * 自定义菜单 - 自定义菜单查询接口
	 */
	Weixin.prototype.getMenu = function(callback) {
		callback = callback || function(data) {
			console.log('>>> getMenu >>> default callback function invoked.');
			console.log(data);
		}
	
		var url = 'https://api.weixin.qq.com/cgi-bin/menu/get?access_token=' + this.accessToken;
		request(url, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				callback(JSON.parse(body));
			} else {
				console.log(err);
			}
		});
	};
	
	/**
	 * @method deleteMenu
	 * 自定义菜单 - 自定义菜单删除接口
	 * 使用接口创建自定义菜单后，开发者还可使用接口删除当前使用的自定义菜单。
	 */
	Weixin.prototype.deleteMenu = function(callback) {
		callback = callback || function(data) {
			console.log('>>> deleteMenu >>> default callback function invoked.');
			console.log(data);
		}
	
		var url = 'https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=' + this.accessToken;
		request(url, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				callback(JSON.parse(body));
			} else {
				console.log(err);
			}
		});
	};
	
};