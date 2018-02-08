//var params = {
//	obj: "mainMap",
//	cameras: [{
//		'name': '摄像头001',
//		'location': [114.337594, 30.353685],
//		'rtsp': 'rtsp://admin:bjoffice001@192.168.1.64',
//		'icon': 1
//	}, {
//		'name': '摄像头002',
//		'location': [114.337594, 30.363685],
//		'rtsp': 'rtsp://admin:bjoffice001@192.168.1.64',
//		'icon': 2
//	}]
//}
baiduMap = function () {
	this.obj = '';
	this.map;
}

baiduMap.prototype.init = function(params) {
	var obj = params.obj;
	var cas = params.cameras;
	var sContent = [];
	var pointStr = [];
	var icons = [];
	var rtsps = [];
	var ips = [];
	var names = [];
	for(var i = 0; i < cas.length; i++) {
		var ca = cas[i];
		sContent.push("<h4 style='margin:0 0 5px 0;padding:0.2em 0;color:#999;'>" + ca.name + "</h4>" +
			"<p style='margin:0;'><object type='application/x-vlc-plugin' pluginspage='http://www.videola.org' id='vlc1' events='false' width='200px' height='120px'>" +
			"<param name='mrl' value='rtsp://admin:bjoffice001@192.168.1.64' />" +
			"<param name='volume' value='50' />" +
			"<param name='autoplay' value='true' />" +
			"<param name='loop' value='false' />" +
			"<param name='fullscreen' value='false' />" +
			"<param name='controls' value='false' />" +
			"<param name='branding' value='false' />" +
			"</object></p>" +
			"</div>");
		if(!ca.location || ca.location.length == 0){
			continue;
		}
		pointStr.push(ca.location);
		icons.push(ca.icon);
		rtsps.push(ca.rtsp);
		ips.push(ca.id);
		names.push(ca.name);
	}

	// 百度地图API功能

	var map = new BMap.Map(obj);
	this.map = map;
	map.setMapStyle({style:'bluish'});
	map.enableScrollWheelZoom(); //启用地图滚轮放大缩小
	map.enableKeyboard(); //启用键盘上下左右键移动地图
	var marker = [];
	var infoWindow = []; // 创建信息窗口对象

	var point = new BMap.Point(pointStr[0][0], pointStr[0][1]); //创建地图坐标
	map.centerAndZoom(point, 19); //创建地图添加中心点坐标并确定地图缩放比例
	var myIcon0 = new BMap.Icon("/static/Themes/Images/ICON/camera_map.png", new BMap.Size(32, 32));
	var myIcon1 = new BMap.Icon("cmr1.png", new BMap.Size(40, 40));
	for(i in sContent) {

		var point = new BMap.Point(pointStr[i][0], pointStr[i][1]); //创建坐标
		var label = new BMap.Label(ips[i], {
			offset: new BMap.Size(20, -10)
		});
		if(icons[i] == 1) {
			marker[i] = new BMap.Marker(point, {
				icon: myIcon0,
				title: names[i]
			}); //创建点
		} else {
			marker[i] = new BMap.Marker(point, {
				icon: myIcon1,
				title: names[i]
			}); //创建点
		}
		marker[i].setLabel(label)
		infoWindow[i] = new BMap.InfoWindow(sContent[i]) //创建信息窗口对象
		map.addOverlay(marker[i]); //添加点到地图
		marker[i].addEventListener("click", clic.bind(marker[i], i, rtsps[i])); //为点绑定点击事件
	}
	

	function clic(i, rtsp) {
		this.openInfoWindow(infoWindow[i]);
		var vlc = $('#vlc1')[0];
		try {
			var vlcid = vlc.playlist.add(rtsp);
			vlc.playlist.playItem(vlcid);
		} catch(e) {
			//TODO handle the exception
		}
		//图片加载完毕重绘infowindow
//		document.getElementById('imgDemo').onload = function() {
//			infoWindow[i].redraw(); //防止在网速较慢，图片未加载时，生成的信息框高度比图片的总高度小，导致图片部分被隐藏
//			var vlc = $('#vlc1')[0];
//			try {
//				var vlcid = vlc.playlist.add(rtsp);
//				vlc.playlist.playItem(vlcid);
//			} catch(e) {
//				//TODO handle the exception
//			}
//		}
	}

	
}
baiduMap.prototype.showPoint = function(id) {
		var map = this.map;
		console.log(id);
		var allOverlay = map.getOverlays();
		for(var i = 0; i < allOverlay.length; i++) {
			console.log(allOverlay[i].getLabel().content);
			if(allOverlay[i].getLabel().content == id) {
			
				var p = allOverlay[i].getPosition(); //获取marker的位置
				alert("marker的位置是" + p.lng + "," + p.lat);
				var point = new BMap.Point(p.lng, p.lat);
				map.centerAndZoom(point, 19);
				return false;
			}
		}
	}