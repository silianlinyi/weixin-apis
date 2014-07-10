var request = require('request');

module.exports = function(Weixin) {
	
	/************************************************************
	 * 推广支持
	 * 生成带参数的二维码
	 ************************************************************/
	/**
	 * @method createQrcode
	 * 生成带参数的二维码
	 */
	Weixin.prototype.createQrcode = function(config, callback) {
		callback = callback || function(data) {
			console.log('>>> createQrcode >>> default callback function invoked.');
			console.log(data);
		}
	
		var options = {
			url : 'https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=' + this.accessToken,
			method : 'post',
			body : JSON.stringify(config)
		};
		request(options, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				callback(JSON.parse(body));
			} else {
				console.log(err);
			}
		});
	};
	
}