$(function() {

	var data = {
		toUserName : 'gh_6716c73fdcbe',
		fromUserName : 'ojim5txO8ivc0Ff2LKW1nlUJ9hM4',
		createTime : '1400726466',
		msgType : 'voice',
		mediaId : 'LJH6WzbKmSx9Nh0FVBgiGyQFM2cW7VwpFTt3r8ZNWVfoDW6yP6PkCWhPz6CuQ3om',
		format : 'amr',
		msgId : '6016074362111655936',
		recognition : '操你吗'
	};

	var data2 = {
		toUserName : 'gh_6716c73fdcbe',
		fromUserName : 'ojim5txO8ivc0Ff2LKW1nlUJ9hM4',
		createTime : '1400724853',
		msgType : 'event',
		event : 'unsubscribe',
		eventKey : [{}]
	}

	weixin.on('textMsg', function(data) {
		console.log('>>>>>>>>> textMsg emit >>>>>>>>>');
		console.log(data);
		switch (data.content) {
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
			var msg = {
				toUserName : data.fromUserName,
				fromUserName : data.toUserName,
				msgType : 'news',
				articles : articles
			};
			break;
		}
		weixin.sendMsg(msg);
	});

});
