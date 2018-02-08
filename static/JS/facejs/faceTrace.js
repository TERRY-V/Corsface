function initMap(params) {
	console.log(params);
	// 百度地图API功能
	var sContent = [];
	var pointStr = [];
	var polylinePoint = [];
	for(x in params) {
		var sTxt = "<p style='margin:0;line-height:1.5;font-size:13px;'>" + params[x].time + "</p></div>";
		var pointS = params[x].location;
		if(pointS){
			sContent.push(sTxt);
			pointStr.push(pointS);
		}
	}
	if(pointStr.length == 0){
		alert("无在线地图位置信息");return;
	}
	var map = new BMap.Map("FaceTraceMap");
	map.setMapStyle({
		style: 'bluish'
	});
	map.enableScrollWheelZoom(); //启用地图滚轮放大缩小
	map.enableKeyboard(); //启用键盘上下左右键移动地图
	var marker = [];
	var infoWindow = []; // 创建信息窗口对象
	var point = new BMap.Point(pointStr[0][0], pointStr[0][1]); //创建地图坐标
	map.centerAndZoom(point, 19); //创建地图添加中心点坐标并确定地图缩放比例
	for(i in sContent) {
		var point = new BMap.Point(pointStr[i][0], pointStr[i][1]); //创建坐标
		if(pointStr[i][0] && pointStr[i][1]) {
			polylinePoint.push(point);
			marker[i] = new BMap.Marker(point); //创建点
			infoWindow[i] = new BMap.InfoWindow(sContent[i]) //创建信息窗口对象
			map.addOverlay(marker[i]); //添加点到地图
			marker[i].addEventListener("click", clic.bind(marker[i], i)); //为点绑定点击事件
		}

	}

	var polyline = new BMap.Polyline(polylinePoint, {
		strokeColor: "blue",
		strokeWeight: 3,
		strokeOpacity: 0.5
	}); //定义折线
	map.addOverlay(polyline); //添加折线到地图上
	function clic(i) {
		this.openInfoWindow(infoWindow[i]);
		//图片加载完毕重绘infowindow
	}
}

//设置顶部的场景图和facetrack图片内容。
function setFaceTrackInfo(IP, uuid, content) {
	if(!IP || !uuid) {
		return;
	}
	var facePic = {
		"TagName": "GetSourceImage",
		"IP": IP,
		"UUID": uuid
	}
	$.ajax({
		url: "/CorsFace/faceTrack.action",
		data: facePic,
		async: true,
		type: "POST",
		success: function(data) {
			var data = eval(data);
			$(".media_BImg img").attr('src', "data:image/jpeg;base64," + data[0]);
		}
	});

	facePic['TagName'] = "GetFaceImages";
	facePic['Imgs'] = JSON.stringify(content);
	$.ajax({
		url: "/CorsFace/faceTrack.action",
		data: facePic,
		async: true,
		type: "POST",
		success: function(data) {
			var data = eval('(' + data + ')');
			if(!data) {
				return;
			}
			$("#pcontent_main_imgs").empty();

			for(var i = 0; i < data.length; i++) {
				var str = '<img src="data:image/jpeg;base64,' + data[i] + '"/>';
				$(".media_images").append(str);
			}

		}
	});

}

var pageNo = 1;
var dataGetAll = false;
var pageSize = 19;
var totalPages = 0;
var pid = "";
var UUID = "";
var amCameraId = [];
var searchKey = "";
var direct = "";
var params = [];
var time = new Date();
time = time.getTime();

//初始化信息
Init_FaceTrace = function() {


	UUID = Util.GetParam("UUID");
	var type = Util.GetParam("type");
	direct = Util.GetParam("direct")
	if(type == "trace" && !UUID ){
		var info = sessionStorage.getItem("imgsForTraceDetail");
		if(!info){return}
		info = JSON.parse(info);
		$(".media_BImg img").attr('src', info.sourceImg);
		$(".media_images").empty();
		for(var i = 0; i < info.attachInfo.length; i++) {
			var str = '<img src="/CorsFace' + info.attachInfo[i].path+ '">';
			$(".media_images").append(str);
		}
	}

	//对于从人脸记录过来的追踪，其包括uuid和ip；
	if(UUID){
		$.ajax({
			url: "/CorsFace/faceRecognition.action",
			data: {
				"UUID": UUID,
				"recognizeStyle": "recognitionDetail"
			},
			async: true,
			type: "POST",
			success: function(data) {
				data = JSON.parse(data);
				data = data[0];
				var content = data.faceTrankInfo.Content;
				content = JSON.parse(content);
				var imgs = content[0].results.imgs;
				$(".media_images").empty();
				setFaceTrackInfo(data.faceTrankInfo.IP, data.faceTrankInfo.UUID, imgs);
			}
		});

	}

	laydate.render({
		elem: '#startTime',
		type: 'datetime',
		value: "",
		done: function(date) {
			//init_params.startTime = date
		}
	});
	laydate.render({
		elem: '#endTime',
		type: 'datetime',
		value: "",
		done: function(date) {
			//init_params.endTime = date
		}
	});

	if(direct){
		var ipAndfacetrackId = sessionStorage.getItem("ipAndfacetrackId");
		if(!ipAndfacetrackId){
			$('.loading').addClass('hide');
			return;
		}
		$.ajax({
			url:"/CorsFace/traceAction.action",
			data:{
				"type":"getTrackToTrackTransactionId",
				allTrack:ipAndfacetrackId
			},
			async:true,
			type:"POST",
			success:function(data){
				data = JSON.parse(data);
				searchKey = data.searchKey;
				var param ={
					"type":"getTrackToTrackInfo",
					searchKey:searchKey,
					pageNo:1,
					pageSize:pageSize,
					matchs:0
				}
				setTranceTreeDirect(param);
			},
			error:function(data){
				$('.loading').addClass('hide');
				$("#searchNoResult").removeClass("hide");
				$("#fTraceTree").addClass("hide");
			}
		})
	}
}

//根据param的值去请求数据，并加载tree
setTranceTree = function(param){

	$.ajax({
		url:"/CorsFace/faceRecognition.action",
		data:param,
		type:"post",
		async:true,
		success:function(data) {
			$('.loading').addClass('hide');
			parserDataAndSetTreeData(data)

		}
	})
}
parserDataAndSetTreeData = function(data){
	var jsn = JSON.parse(data);
	totalPages = jsn[0]['pageCount'];
	var totalCount = jsn[0]['totalCount'];
	if(totalPages == 0 && totalCount ==0){
		$("#searchNoResult").removeClass("hide");
		$("#fTraceTree").addClass("hide");
	}else{
		$("#searchNoResult").addClass("hide");
		$("#fTraceTree").removeClass("hide");
	}
	if(pageNo > jsn[0]['pageCount']){
		return;
	}

	jsn = jsn[0]['results'];
    var live = true;
    var idPre = Math.round(Math.random()*10000) + "";
    
    for(var i =0; i<jsn.length; i++){
    	var id = idPre + i;
    	var singleData = jsn[i];
    	var CAID = singleData['CAID'] ? singleData['CAID'] : "";
    	var CAName = singleData['CAName'] ? singleData['CAName'] : "";
		var similarity = singleData['score']?singleData['score']:"";
		//保留一位小数
		similarity = (similarity*100).toFixed(1);
		var time = singleData['CTime']?singleData['CTime']:"";
		var IP = singleData['IP'];
		var uuid = singleData['uuid'];
		if(!time){
			time = singleData['createdate']?singleData['createdate']:"";
		}
		// if(CAID&&$('#'+CAID).length>0){
         //    $('#'+CAID).find('.marker_vlc').prepend(time+'<br>')
		// }
		live = true;
		for(x in params){
			if(params[x].location[0] == singleData.Longitude&&params[x].location[1] == singleData.Latitude){
				live = false;
				params[x].time += '<br>'+time;
				break;
			}
		}
		if(live){
			var param = {
				'id' : CAID,
				'time': time,
				'location': [singleData.Longitude, singleData.Latitude]
			}
			if(singleData.Longitude)
				params.push(param);
		}
		var spnTxt = "<span class='spnTxt'>";
		spnTxt += "<span class='spnSingTxt'>" + time + "</span>"; //时间
		spnTxt += "<span class='spnSingTxt'>" + CAName + "</span>"; //摄像头名称
		spnTxt += "<span class='spnSingTxt'>" + "可信度："+similarity +"%" +"</span>";//相似度
		spnTxt += "<span class='spnSingTxt'><input type='button' style='width:50px' onclick=NotMatch(this,'"+ singleData.UUID +"') value='不匹配'></span>"; //按钮
		spnTxt += "</span>";
		var spnFace = "<span class='spnFace'>";
		spnFace +="<img onclick='getSenceImg(this)' IP ="+IP + " uuid="+uuid +" id="+id+">"
		spnFace += "</span>";

		var strHtml = "<span class='spnCon'>";
		if(jsn.length == 1){
			strHtml += spnTxt + spnFace + "</span>";
			$('#leftTraceTree').append(strHtml);
			continue;
		}else{
			if(i % 2 == 1) { //left
				strHtml += spnTxt + spnFace + "</span>";
				$('#leftTraceTree').append(strHtml);
			} else {
				strHtml += spnFace + spnTxt + "</span>";
				$('#rightTraceTree').append(strHtml);
			}
		}
    }
    
	$.each(jsn, function(index, singleData){
		
		var content = singleData.Content;
		if(content){
			content = JSON.parse(content);
			var imgs = content[0].results.imgs;
		}else{
			imgs = singleData['imgs']
		}

		imgs = JSON.stringify(imgs);
		$.ajax({
			url:"/CorsFace/faceTrack.action",
			data:{
				TagName: "GetOneFaceImg",
				IP: singleData.IP,
				UUID: singleData.UUID,
				Imgs: imgs
			},
			type:"POST",
			async:true,
			success:function(imgData) {
				var imgJson = eval(imgData);
				var id = idPre + index;
				$("#"+ id).attr("src", "data:image/jpeg;base64,"+imgJson[0]);
			}
		})
	});
    $.get('mapChoose.action?operation=getMapType&time=' + time,function (data) {
        if(data[0]){
            $('#FaceTraceMap').addClass('hide');
            $('#FaceTraceLocalMap').removeClass('hide');
            createLocalMap(data[0].MCID,params)
        }else {
            initMap(params);
            $('.loading').addClass('hide');
		}
    },'json');

}
function getSenceImg(obj){
	var obj = $(obj);
	var IP =obj.attr("IP");
	var uuid = obj.attr("uuid");
	var url = '/CorsFace/Business/FaceInfo/Html/V31_SenceImg.html?UUID=' + uuid + '&IP='+IP;
	//iframe窗
	layer.open({
		type: 2,
		title: '场景图',
		shade: [0.4],
		area: ['660px', '360px'],
		//			time: 2000, //2秒后自动关闭
		anim: 2,
		content: [url] //iframe的url，no代表不显示滚动条
	});
}

setTranceTreeDirect = function(param){

	$.ajax({
		url:"/CorsFace/traceAction.action",
		data:param,
		async:true,
		type:"POST",
		success:function(data){
			$('.loading').addClass('hide');
			parserDataAndSetTreeData(data)
		}
	})
}

NotMatch = function(obj, uuid) {
	var info = "";
	var params = {
		"TagName": "SaveData",
		"KeyTable": "b_recognition",
		"KeyParams": "UUID",
		"KeyValue": uuid,
		"Items": JSON.stringify([{
			"Filed": "NotMatch",
			"Value": 0,
			"Type": ""
		}])
	}
	jQuery.post('/CorsFace/formengine.action', params, function(data) {
		if(data != "2:操作失败！") {
			return;
		}
	});
	var obj = $(obj);
	obj.parent().parent().parent().remove();
}

//获取页面的参数并生成请求的param。
getParam = function(){
	var startTime = $("#startTime").val();
	var endTime = $("#endTime").val();
	var matchs = $("input[name='Matchs']").val()
	var conditions = " r.PersonId = '" + pid + "'";
	if(startTime){
		conditions += " and r.CTime >= '" + startTime +"'"
	}
	if(endTime){
		conditions += " and r.CTime <= '" + endTime + "'"
	}
	if(matchs){
		conditions += " and r.Matchs >= " + matchs;
	}
	var amCameraIdStr = "";
	if(amCameraId && amCameraId.length >0){
		conditions += " and r.CAID in ('" + amCameraId.join("','") + "')"
	}
	if(conditions.indexOf("全部")>=0){
		amCameraIdStr = ""
	}else{
		amCameraIdStr = amCameraId.join(",");
	}

	var param = {
		recognizeStyle:"faceDetailTrace",
		pageNo: pageNo,
		pageSize: pageSize,
		condition: conditions
	}

	if(direct){
		//sort 1: 按照时间倒排
		//sort 2：按照可信度倒排
		var sort = $("select[name='similarity']").val();
		param = {
			"type":"getTrackToTrackInfo",
			searchKey:searchKey,
			pageNo:pageNo,
			pageSize:pageSize,
			startTime:startTime,
			endTime:endTime,
			camearIds:amCameraIdStr,
			matchs:matchs,
			sort:sort
		}
	}
	return param
}
$(document).ready(function(){

	getCameraSYNCN();

	function getCameraSYNCN(){
		var zNodes = [];
		$.ajax({
			url: "alarmRecordExecuteEx.action",
			data: {
				TagName: "getCameraTree"
			},
			async: true,
			type: "POST",
			success: function(data) {
				var Ctext = $('#citySel').val();
				var Carr = Ctext.split(',');
				var res = JSON.parse(data)

				for(var i = 0; i < res.length; i++) {
					var item = {
						id: res[i].MUID,
						pId: '-1',
						name: res[i].MUName,
						open: false,
						nocheck: true
					};
					for(var j = 0; j < res[i].childNode.length; j++) {
						var inner_item = {
							id: res[i].childNode[j].comara.CAID,
							pId: res[i].MUID,
							name: res[i].childNode[j].comara.CAName
						};
						zNodes.push(inner_item);
					}
					zNodes.push(item)
				}
				var allC = false;
				for(var s=0;s<Carr.length;s++){
					if(Carr[s]=='所有'){
						allC = true;
					}
				}
				zNodes.push({
					id: '0',
					pId: '-1',
					name: '全部',
					open: false,
					nocheck: true
				});
				zNodes.push({
					id: '全部',
					pId: '0',
					name: '全部',
					checked: allC
				});

				zNodes = zNodes.reverse()
				$.fn.zTree.init($("#treeDemo"), setting, zNodes);
			}
		});
	}
	$("#search").click(function(){
		$("#leftTraceTree").empty();
		$("#rightTraceTree").empty();
		params=[];
		pageNo = 1;
		dataGetAll= false;
		totalPages = 0;
		var param = getParam();
		if(direct){
			setTranceTreeDirect(param);
		}else{
			setTranceTree(param);
		}
	})

	$(".faceTrace_tree").scroll(function() {
		console.log("to bottom");
		//根据treeBottom距离页面顶部的距离来判断是否是到了底部。
		var treeToTop = $(".treeBottom").offset().top
		if(treeToTop < 1000 && dataGetAll === false){
			if(pageNo < totalPages){
				console.log("add again");
				pageNo++;
				//如果已经没有加载数据了，就不让继续去请求了。
				if(direct){
					setTranceTreeDirect(getParam())
				}else{
					setTranceTree(getParam())
				}

			}
		}else{
			return;
		}
	});
});
function createLocalMap(mcid,params) {
    var imgSize ={};
    var markerFlag = false;
    var Photoflag = false;
    // 地图拖动
    var transformX = 0;
    var transformY = 0;
    $.get('mapChoose.action?operation=getMapPoint&MCID=' + mcid,
        function(data) {
            var data = JSON.parse(data);
            var mapPath = '';
            for(var i = 0; i < data.length; i++) {
                var marker = data[i];
                if(!mapPath) {
                    mapPath = '/CorsFace' + marker.FPath;
                    $('#map_img').attr({'src': mapPath,'onerror':'javascript:alert("图片丢失！");$(".marker_icon").addClass("hide")'});
                }
                var PLeft = marker.PLeft;
                if(PLeft != null) {
                    var markerI = '<div class="marker_icon '+ marker.CSID +'" data-location="' +
                        marker.PLeft + ',' +
                        marker.PTop + '" data-url="'+
                        marker.IpAddress +'" id="' +
                        marker.CAID + '" style="left: calc(' +
                        marker.PLeft * 100 + '% - 10px);top: calc(' +
                        marker.PTop * 100 + '% - 40px);">' +
                        marker.CAName + '</div>';
                    $('.monitoring_rtsp_photo').append(markerI);
                }
            }
            $('#map_img').load(function () {
                imgSize = GetImgSize('map_img');
                console.log(imgSize);
                var width = imgSize.width*0.5;
                if(width < $('#mainMap').width()){
                    width = $('#mainMap').width()
                }
                console.log(width);
                console.log(this);
                $(this).css('width',width+'px')
            });

            $('#map_img').load(function () {
                if($('.monitoring_rtsp_photo').width()>$('#map_img').width()){
                    $('.monitoring_rtsp_photo').css('width',$('#map_img').width()+'px');
                }
                if($('#mainMap').width()>$('#map_img').width()){
                    $('.monitoring_rtsp_photo').css('width',$('#mainMap').width()+'px');
                    $('#map_img').css('width',$('#mainMap').width()+'px');
                }
            })
        });
    // 地图放大缩小
    if(document.addEventListener){
        $('#map_img')[0].addEventListener('DOMMouseScroll',scrollFunc,false);
    }//W3C
    $('#map_img')[0].onmousewheel=scrollFunc;//IE/Opera/Chrome
    function scrollFunc(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        ev.returnValue = false;
        console.log(imgSize.width);
        var centerX = ev.clientX;
        var centerY = ev.clientY;
        var offsetWrap = $('#mainMap').offset();
        var offsetImg = $('#map_img').offset();
        console.log(offsetWrap);
        var le = (centerX - offsetWrap.left);
        var leS = (centerX - offsetImg.left)/$('#map_img').width();
        var to = (centerY - offsetWrap.top);
        var toS = (centerY - offsetImg.top)/$('#map_img').height();
        var left = -(leS*$('#map_img').width()-le);
        var top = -(toS*$('#map_img').height()-to);
        console.log('le='+le+'les='+leS);
        if(ev.wheelDelta>0 || ev.detail<0){
            // 向上滚
            if($('#map_img').width()>=imgSize.width){
                return;
            }
            var wid = $('#map_img').width() + imgSize.width*0.1;
            if(wid>imgSize.width){
                wid = imgSize.width;
            }
            $('#map_img').css('width',wid + 'px');
            left = -(leS*$('#map_img').width()-le);
            top = -(toS*$('#map_img').height()-to);
        }else {
            if($('#map_img').width()<=$('#mainMap').width()){
                return;
            }
            var wid = $('#map_img').width() - imgSize.width*0.1;
            if(wid<$('#mainMap').width()){
                wid = $('#mainMap').width();
            }
            $('#map_img').css('width',wid + 'px');
            left = -(leS*$('#map_img').width()-le);
            top = -(toS*$('#map_img').height()-to);
        }
        if(left>0){
            left = 0;
        }
        if(top>0){
            top = 0;
        }
        if(left < ($('#mainMap').width() - $('#map_img').width())){
            left = ($('#mainMap').width() - $('#map_img').width())
        }
        if(top < ($('#mainMap').height() - $('#map_img').height())){
            top = ($('#mainMap').height() - $('#map_img').height())
        }
        $('.monitoring_rtsp_photo').css('left',left + 'px');
        $('.monitoring_rtsp_photo').css('top',top + 'px');
        transformX = left;
        transformY = top;
    }
// 弹出vlc
    $('.monitoring_rtsp_photo').on('mousedown', '.marker_icon', function(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        ev.returnValue = false;
        if($('.marker_vlc').length>0){
            $('.marker_vlc').remove();
        }else {
        	var text = '';
        	var mid = $(this).attr('id');
        	for(var i in params){
        		if(params[i].id==mid){
        			text = params[i].time + '<br>' + text;
				}
			}
			if(!text.trim()){
        		text = '无'
			}
            $(this).append('<div class="marker_vlc">' + text +
                '</div>');
        }
    });
// 地图拖动

    $('#map_img').on('mousedown',function(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        ev.returnValue = false;
        Photoflag = true;
        flag = true;
        var oldX = ev.clientX;
        var oldY = ev.clientY;
        var top;
        var left;
        $(window)
            .on(
                'mousemove',
                function(ev) {
                    ev = ev || window.event;
                    ev.preventDefault();
                    ev.returnValue = false;
                    if(Photoflag && !markerFlag && flag) {
                        flag = false;
                        var x = ev.clientX,
                            y = ev.clientY,
                            widthR = $('#mainMap').width(),
                            heightR = $('#mainMap').height(),
                            widthP = $('.monitoring_rtsp_photo').width(),
                            heightP = $('.monitoring_rtsp_photo').height();
                        var maxL = Math.abs(widthP - widthR);
                        var maxT = Math.abs(heightP - heightR);

                        if(widthP > widthR) {
                            maxL = maxL;
                            left = x - oldX + transformX;
                            left = left < -maxL ? -maxL : left;
                            left = left > 0 ? 0 : left;
                        } else {
                            maxL = 0;
                            left = 0;
                        }
                        if(heightP > heightR) {
                            maxT = maxT;
                            top = y - oldY + transformY;
                            top = top < -maxT ? -maxT :
                                top;
                            top = top > 0 ? 0 : top;
                        } else {
                            maxT = 0;
                            top = 0;
                        }
                        $('.monitoring_rtsp_photo')
                            .css({
                                "left": left + "px",
                                "top": top + "px"
                            });

                        setTimeout(function() {
                            flag = true;
                        }, 50)
                    }
                });
        $(window).on('mouseup', function(ev) {
            ev = ev || event;
            if(Photoflag && !markerFlag) {
                Photoflag = false;
                flag = false;
                transformY =parseInt($('.monitoring_rtsp_photo').css('left').replace('px',''));
                transformX = parseInt($('.monitoring_rtsp_photo').css('top').replace('px',''));
                transformY = top;
                transformX = left;
                $(window).off('mousemove');
                $(window).off('mouseup');
            }
        })
    });
    // 获取图片原始大小
    function GetImgSize(id) {
        var src = $('#'+id).attr('src');
        var image = new Image();
        image.src = src;
        var size = {};
        size.width = image.width;
        size.height = image.height;
        return size
    }
}