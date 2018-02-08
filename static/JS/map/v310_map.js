
var minDefaultSpot = 0.3,maxDefaultSpot=0.5,RTInitNum=15,RTMaxNum=15,ARInitNum=5,ARMaxNum=10,ARIsDisANum=1;
if(parent){
    minDefaultSpot = parent.SysConfig.SCMinSpot?parent.SysConfig.SCMinSpot/100:0.3;
    maxDefaultSpot=parent.SysConfig.SCMaxSpot?parent.SysConfig.SCMaxSpot/100:0.5;
    RTInitNum = parent.SysConfig.RTInitNum?parent.SysConfig.RTInitNum:15;
    RTMaxNum = parent.SysConfig.RTMaxNum?parent.SysConfig.RTMaxNum:15;
    ARInitNum = parent.SysConfig.ARInitNum?parent.SysConfig.ARInitNum:5;
    ARMaxNum = parent.SysConfig.ARMaxNum?parent.SysConfig.ARMaxNum:10;
    ARIsDisANum = parent.SysConfig.ARIsDisANum == '0'?0:1;
}
jQuery(function($) {
    $.ajaxSetup({
        cache: false
    });
	var params = {
		obj: "mainMap",
		cameras: []
	};
    //一次就拿了所有的cameraInfo。
    var cameraInfo="";
	var baidumap = new baiduMap();

		// setTimeout(CreateMap.bind(this,params),2000)
	$.get('/deepface/camerainfo', function(data) {
		var msg = data.message;
        var code = data.code;
        if(code ==0){
            cameraInfo = data.data;
            getCamerali(data);
        }else{
            alert(msg);return;
        }
	})
	//拖拽实时记录
	var dragFlag = false;
	var nowLeft = 0;
	$('.realtime_content_left').click(function() {
		if(dragFlag) {
			return;
		}
		dragFlag = true;
		$('.realtime_content_right').addClass('rightIcon');
		var width = $('.realtime_content').width();
		var left = nowLeft + 348;
		if(left >= 0) {
			left = 0;
			$('.realtime_content_left').removeClass('leftIcon');

		}
		var now = nowLeft;
		var speed = (left - nowLeft) / 10;
		var a = 0;
		var time = setInterval(function() {

			a++;

			now += speed;
			$('.realtime_content_Rwrap').css('left', now + 'px')
			if(a >= 10) {
				clearInterval(time);
				dragFlag = false;

			}
		}, 50)
		nowLeft = left;
	})
	$('.realtime_content_right').click(function() {
		if(dragFlag) {
			return;
		}
		dragFlag = true;
        var maxW = $('.realtime_content_Rwrap').width() + 60;

        $('.realtime_content_left').addClass('leftIcon');
		var width = $('.realtime_content').width();
		var left = nowLeft - 348;
		if(left <= -(maxW - width)) {
			left = -(maxW - width);
			$('.realtime_content_right').removeClass('rightIcon');

		}
		var now = nowLeft;
		var speed = (left - nowLeft) / 10;

		var a = 0;

		var time = setInterval(function() {

			a++;
			now += speed;

			$('.realtime_content_Rwrap').css('left', now + 'px')
			if(a >= 10) {
				clearInterval(time);
				dragFlag = false;
			}
		}, 50)
		nowLeft = left;
	})

	//	摄像头列表切换列表与地图模式
	$('.pattern').click(function() {
		window.location.href = '/corsface/index'
	});
	$.ajax({
		url: "/deepface/facetrack",
        data: {
            "page": 1,
            "number": 15
        },
        async: true,
        type: "POST",
        success: function(data) {
            var msg = data.message;
            var code = data.code;
            if(code == 0 && msg=="success"){
                initRealTime(data);
            }
        }
	})
	$.ajax({
		//右侧报警记录初始化。
        url: "/deepface/facetrack/alarm",
        data: {
            "page":1,
            "number":6
        },
        async: true,
        type: "POST",
        success: function(data) {
            var msg = data.message;
            var code = data.code;
            if(msg == "success" && code == 0){
                initWarning(data);
            }
        }
	});
	// 缩小放大摄像头分组列表
	$('.close_camera').click(function() {
		$('.main_camera').toggleClass('clo');
	});
	//	点击摄像头组，换地图标点
	$('.camera_content').on('click', '.camera_change_group_head', function() {
		$(this).find('span').toggleClass('check');
		var cameraId = '';
		$('.camera_change_group_head .check').each(function() {
			cameraId += $(this).attr('data-id') + ',';
		});
		cameraId = cameraId.substr(0, cameraId.length - 1);
		getMarker(cameraId);
		$('#alarm_alert').addClass('hide');
	});

    // 图片栏滑动
    if(document.addEventListener){
        $('.warning_content')[0].addEventListener('DOMMouseScroll',scrollFunc,false);
    }//W3C
    $('.warning_content')[0].onmousewheel=scrollFunc;//IE/Opera/Chrome

    var transFT = 0;

    function scrollFunc(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        ev.returnValue = false;
        var max = $('.warning_content_wrap').height() - $('.warning_content').height() + 30;
        if(max>0){
            return
        }
        if(ev.wheelDelta>0 || ev.detail<0){
            // 向上滚
            var top = transFT + 20;
            if(top>20){
                top = 20
            }
            $('.warning_content').css('top',top+'px')
        }else {
            var top = transFT - 20;
            if(top<max){
                top = max
            }
            $('.warning_content').css('top',top+'px')
        }
        transFT = top;
    }

	//	进入详情页
    $('.main').on('click', '.realtime_content .realtime_info', function() {

        var url = '/corsface/trackdetail?UUID=' + $(this).attr('id');
        layerShadow(url,1,'660px','660px',2);
        $(parent.document).find('.wrapper').addClass('blur');
    });
    // 报警详情
    $('.main').on('click', '.warning_content .warning_info', function() {

        var url = '/corsface/trackdetail?UUID=' + $(this).attr('aid');
        layerShadow(url,2,'660px','660px',2);
        $(parent.document).find('.wrapper').addClass('blur');
    });
    $('.main').on('click', '.warning_content .warning_info_content_surImg', function(ev) {
        ev = ev || window.event;
        ev.stopPropagation();
        if($('#SurImg').hasClass('hide')){
            var x = $(window).width() - 395;
            var y = ev.clientY + 5 + $(window).scrollTop();

            var parent = $(this).parent();
            var src = parent.find('.warning_surImg>img').attr('src');

            $('#SurImg').css({'top':y+'px','left':x+'px'}).removeClass('hide').find('img').attr('src',src)
        }else {
            if($(ev.target).attr('id')=='SurImg'||$(ev.target).parent().attr('id')=='SurImg'){
                return;
            }else {
                $('#SurImg').addClass('hide')
            }
        }
    });
    
	function changeAlert(face, track, alarm, imgs) {

		var htmlStr = '<div class="warning_info_alert">' +
			'<div class="warning_info_alert_level" style="background-image: url(' + alarm.ICON + ');">' + alarm.Level + '</div>' +
			'<div class="warning_info_alert_img"><img src="' + imgs + '" /></div>' +
			'<div class="warning_info_alert_name">' + face.Name + '</div>' +
			'<div class="warning_info_alert_name">' + face.Sort + '</div>' +
			'</div>'
		$('#alarm_alert').html(htmlStr);
		var wit = $('.main_monitoring').width();
		$('#alarm_alert').css('left', (wit / 2 + 20) + 'px');
		$('#alarm_alert').removeClass('hide');
		setTimeout(function() {
			$('#alarm_alert').addClass('hide');
		}, 5000)
	}

	//初始化实时记录
    function initRealTime(data) {
        data = data.data;
        var imgs = [];
        var faceHtml = '';
        // $('#TodayTrack').text(data.facetracks_total);
        data = data.facetracks;
        for(var i = 0; i < data.length; i++) {
            var face = data[i];
            if(face.notRecoginsed=='1') {
                var iconNum = '3';
            } else if(face.recoginsed == '1') {
                var iconNum = '2';
            } else {
                var iconNum = '1';
            }
            var personT = '&nbsp;';
            var age = face.age;
            var sex = face.gender;
            
            if(age <= 20) {
                personT = '青春年少';
            } else if(age <= 35) {
                personT = '风华正茂';
            } else if(age < 70) {
                personT = '成熟稳重';
            } else {
                personT = '花甲之年';
            }
           
            if(iconNum!='3'){
                var ptag = face.PTag ? face.PTag : '未知身份';
                //var pDB = face.PSName ? face.PSName : personT;
                var pDB = personT;
            }else {
                var ptag = '未知身份';
                var pDB =  personT;
            }
            var person_matched = face.person_matched;
            if(person_matched){
                ptag = person_matched.name?person_matched.name:"未知身份";
            }
            var cnode = face.camera_name ? face.camera_name : '&nbsp;';
            var faceTxt = '<div class="realtime_info initRealTime" id="' + face.facetrack_id + '"><div class="face_ptag">' + ptag +
                '</div><div class="face_sort">' + pDB +
                '</div><div class="face_image"><img src="'+ face.image +'"/></div><div class="face_location">' + cnode +
                // '</div><div class="face_location">' + face.BRID +
                '</div><div class="face_location">' + face.createdate +
                '</div><div class="face_icon faceIcon1" style="background-image: url(/static/Themes/Images/ICON/facetrackstatus' + iconNum + '.png);"></div></div>';
            faceHtml += faceTxt;
        }
        
        $('.realtime_content_Rwrap').empty();
        $('.realtime_content_Rwrap').prepend(faceHtml);
        $('img').on('error' ,function () {
            this.src = "/static/Themes/Attach/icon/imgNotFound144.png";
        })
    }
	//初始化报警信息
    function initWarning(data) {
        
        var alarmHtml = '';
        // var alarmNum = data.data.facetracks_total;
        // $('.warning_header .bg_header_3').append('<span>今日报警数：<i id="todayAlarm" style="font-size: 15px;color: #f48008;font-weight: bold">'+alarmNum+'</i></span>')
        var data = data.data.facetracks;
        for(var i = 0; i < data.length; i++) {
            var alarm = data[i];
            var person_matched = alarm.person_matched;
            var adres = person_matched.family_register?person_matched.family_register:"未知";
            var group_name = person_matched.group_name?person_matched.group_name:"";
            var mcs = Math.floor(person_matched.matched_score*100);
            var acard = person_matched.id_card?person_matched.id_card:'未知';
            var alarm_level = person_matched.alarm_level;
            var CAname = alarm.camera_name?alarm.camera_name:'',aName=person_matched.name?person_matched.name:'未知',errImg="/static/Themes/Attach/icon/imgNotFound144.png";
            var alarmTxt = '<div class="warning_info" aid="' + alarm.facetrack_id + '" ><div class="warning_info_content">' +
                '<div class="warning_info_content_left"><div class="warning_info_content_img"><img src="' + alarm.image + '"/></div>' +
                '<div class="warning_Matchs">'+ mcs +'</div>' +
                '<div class="warning_info_content_img personImg"><img src="' + person_matched.face_image + '"/></div>' +
                '</div><div class="warning_info_content_right">' +
                '<div class="warning_info_content_alarmIcon" style="background-image: url(/static/Themes/Images/ICON/alarm'+ alarm_level+'.png);"></div>' +
                '<div class="warning_info_content_surImg initSurImg" data-url="' + alarm.scene_image + '"></div>' +
                '<div class="warning_surImg hide"><img src="' + alarm.scene_image + '" />' +
                '</div></div><div class="warning_info_content_mid"><div class="warning_info_content_name">' + aName +
                // '</div><div class="warning_info_content_location">' + alarm.AID +
                '</div><div class="warning_info_content_pid">' + group_name +
                // '</div><div class="warning_info_content_address">人物分组：' + group_name +
                '</div><div class="warning_info_content_location">' + CAname +
                '</div><div class="warning_info_content_time" style="font-size: 12px;">' + alarm.createdate +
                '</div></div></div></div>';
            alarmHtml += alarmTxt;
        }
        $('.warning_content').empty();
        $('.warning_content').prepend(alarmHtml);
        //配置图片错误问题，后面要回复 2018/1/23
        // $('img').on('error' ,function () {
        //     this.src = "/static/Themes/Attach/icon/imgNotFound144.png";
        // })
    }

	function playMp3(url) {
		var audio = '<embed id="mp3" autoplay="true" src="' + url + '"  width="0" height="0" />';
		$('body').append(audio);
		setTimeout(function() {
			$('#mp3').remove();
		}, 1000)
	}
	//初始化摄像头列表
	function getCamerali(data) {
		params = {
			obj: "mainMap",
			cameras: []
		}
		var data = data.data;
		var rtsp = [];
		var grouphtml = '';
		for(var i = 0; i < data.length; i++) {
			var lihtml = '';

			if(data[i].cameras) {
				var child = data[i].cameras;
				for(var j = 0; j < child.length; j++) {
					var camera = {
						'name': child[j].camera_name,
						'location': [child[j].longitude, child[j].latitude],
						'rtsp': 'rtsp://' + child[j].capture_url,
						'icon': 1,
						'id': child[j].src_id
					}
					params.cameras.push(camera);
				}
			}

			var group = '<div class="camera_change_group_head"><span class="check" data-id="' + data[i].group_id + '"></span>' + data[i].group_name + '</div>';

			grouphtml += group;
		}
		baidumap.init(params);

		$('.camera_change>*').remove();
		$('.camera_change').append(grouphtml);
	}

//离线地图点
	function getMarker(groupid) {
        params = {
            obj: "mainMap",
            cameras: []
        }
        if(!groupid){
            baidumap.init(params);
            return;
        }
        var group_ids = groupid.split(",");
		params = {
			obj: "mainMap",
			cameras: []
		}
        data = cameraInfo;
		
		for(var i = 0; i < data.length; i++) {
            var group_id = data[i].group_id;
            var group_id = group_id + "";
            if(group_ids.indexOf(group_id) == -1){
                continue;
            }
			if(data[i].cameras) {
				var child = data[i].cameras
				for(var j = 0; j < child.length; j++) {
                    var name = child[j].camera_name?child[j].camera_name:"";

					var location = [child[j].longitude?child[j].longitude:0,
                                    child[j].latitude?child[j].latitude:0
                     ];
                    var camera = {
						'name': name,
						'location': location,
						'rtsp': 'rtsp://' + child[j].display_url,
						'icon': 1,
						'id': child[j].src_id
					}
					params.cameras.push(camera);
				}
			}
		}
		baidumap.init(params);
	}
})

//使用websocketc获取推送数据
try {
    // var socket = new WebSocketClient();
    // socket.open("ws://" + window.location.host + "/facetrack/websocket");
    var socket = "";
    socket = new ReconnectingWebSocket("ws://" + window.location.host + "/facetrack/websocket");
    
    socket.onmessage = function(e) {
        //处理推送消息。
        try{
            data = JSON.parse(e.data);
            handleCapcherAlarmInfo(data);
        }catch(e){
            console.log(e);
        }
        
    }
    socket.onopen = function() {
        // socket = new WebSocket("ws://" + window.location.host + "/facetrack/websocket");
        // socket.send("Hello world");
    }
    socket.onclose = function(){
        console.log("WebSocketClosed!");
    }
    socket.onerror = function(){
        console.log("WebSocket error!");
        socket = new WebSocket("ws://" + window.location.host + "/facetrack/websocket");
    }
    if (socket.readyState == WebSocket.OPEN) {
        socket.onopen();
    }
}catch(e){
    console.log(e);
}

function handleCapcherAlarmInfo(data){
    //处理逻辑, data中包还抓拍部分和报警数据-- 如有person_matched部分。
    //1、 处理抓拍数量（和摄像头抓拍数量）
    //3、 处理报警数量（和摄像头报警数量）
    //2、 抓拍卡片
    //4、 报警卡片
    
    var src_id = data.src_id;
    //1
    var todayT = $("#TodayTrack").text();
    todayT = Number(todayT) +1;
    $("#TodayTrack").text(todayT);
    // 对应摄像头facetrack+1;
    var selector = "#" + src_id +" .camera_person"; 
    var face_track_num = $(selector).text();
    face_track_num =Number(face_track_num) + 1; 
    $(selector).text(face_track_num);

    //2
    var personT = '&nbsp;';
    var age = data.age;
    if(age <= 20) {
        personT = '青春年少';
    } else if(age <= 35) {
        personT = '风华正茂';
    } else if(age < 70) {
        personT = '成熟稳重';
    } else {
        personT = '花甲之年';
    }
    var pTag = "";
    if(data.person_matched){
        pTag = data.person_matched.name;
    }
    pTag = pTag?pTag:"未知身份";
    var brid =  data.facetrack_id? data.facetrack_id:' ';
    var CAName = data.camera_name?data.camera_name:'&nbsp;';
    var faceHtml = '<div class="realtime_info" id="' + data.facetrack_id + '"><div class="face_ptag">' + pTag +
        '</div><div class="face_sort">' + personT +
        '</div><div class="face_image"><img src="' + data.image +
        '" /></div><div class="face_location">' + CAName +
        // '</div><div class="face_location">' + brid +
        '</div><div class="face_location">' + data.createdate +
        '</div><div class="face_icon faceIcon1" style="background-image: url(/static/Themes/Images/ICON/facetrackstatus3.png);"></div></div>';
    if($('.realtime_info').length>=15){
        $('.realtime_info:last').remove();
    }
    $('.realtime_content_Rwrap').prepend(faceHtml);

    //判断是否报警
    if(!data.person_matched){
        return;
    }
    //3
    var todayAl = $("#todayAlarm").text();
    todayAl = Number(todayAl) + 1;
    $('#todayAlarm').text(todayAl);

    //对应摄像头报警数+1
    var selector = "#" + src_id +" .camera_alarm"; 
    var face_alarm_num = $(selector).text();
    face_alarm_num =Number(face_alarm_num) + 1; 
    $(selector).text(face_alarm_num);
    
    //4 处理报警卡片
    var matchInfo = data.person_matched;
    var face_image = matchInfo.face_image;
    var mcs = matchInfo.matched_score?matchInfo.matched_score:0;
    mcs = Math.floor(mcs*100);
    var track_image = data.image;
    var acard = matchInfo.id_card;
    var alarm_level = matchInfo.alarm_level;
    var adres = matchInfo.family_register;
    var group_name = matchInfo.group_name?matchInfo.group_name:"";
    var CAName = data.camera_name;
    var pName = matchInfo.name;
    var time = data['createdate']?data['createdate']:"";
    var alarmHtml = '<div class="warning_info" aid="' + data.facetrack_id + '"><div class="warning_info_content">' +
                '<div class="warning_info_content_left"><div class="warning_info_content_img"><img src="' + track_image + '" /></div>' +
                '<div class="warning_Matchs">'+ mcs +'</div>' +
                '<div class="warning_info_content_img personImg"><img src="' + face_image + '"/></div>' +
                '</div><div class="warning_info_content_right">' +
                '<div class="warning_info_content_alarmIcon" style="background-image: url(/static/Themes/Images/ICON/alarm'+alarm_level+'.png);"></div>' +
                '<div class="warning_info_content_surImg initSurImg" data-url="' + data.scene_image + '"></div>' +
                '<div class="warning_surImg hide"><img src="' + data.scene_image + '" />' +
                '</div></div><div class="warning_info_content_mid"><div class="warning_info_content_name">' + pName +
                // '</div><div class="warning_info_content_location">' + "" +
                '</div><div class="warning_info_content_pid">' + group_name +
                // '</div><div class="warning_info_content_address">人物分组：' + group_name +
                '</div><div class="warning_info_content_location">' + CAName +
                '</div><div class="warning_info_content_time" style="font-size: 12px;">' + time +
                '</div></div></div></div>';
            //判断报警模块数量，不能超过一定数量
            if($(".warning_info").length>=6){
                $(".warning_info:last").remove();
            }
            $('.warning_content').prepend(alarmHtml);
}

var TrackData = [];


    function getSurImg(ev,id) {
        var ev = ev || window.event;
        ev.stopPropagation();
        var uid = id;
        var facePic = {
            "TagName": "GetAlarmInfo",
            "UUID": id
        };
        // $('#SI_' + uid).parent().toggleClass('hide');
        if($('#SI_' + uid)[0].src=="http://" + window.location.host + "/CorsFace"){
            $.ajax({
                url: "/CorsFace/faceTrack.action",
                data: facePic,
                async: false,
                type: "POST",
                success: function(ret) {
                    var data = eval(ret);
                    data = data[0];
                    if(data){
                        //surImg = data.SurImg;
                        var x = $(window).width() - 395;
                        var y = ev.clientY + 5 + $(window).scrollTop();
                        $('#SI_' + uid)[0].src = "/CorsFace" + data.SurImg;
                        $('#SurImg').css({'top':y+'px','left':x+'px'}).removeClass('hide').find('img').attr('src',"/CorsFace" + data.SurImg)
                    }else
                    // $('#SI_' + uid)[0].src = "/CorsFace/Themes/Images/ICON/loading.gif";
                        setTimeout('getSurImg('+ev+',"'+ id +'")',500);
                }
            });
        }

    }
function playMp3(url) {
	var audio = '<embed id="mp3" autoplay="true" src="/CosFace/' + url + '"  width="0" height="0" />';
	$('body').append(audio);
	setTimeout(function() {
		$('#mp3').remove();
	}, 1000)
}