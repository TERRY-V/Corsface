// 正在播放的摄像头
var playingCA = [],todayAl = 0;


function addAalam_PersonNum(obj){
        //传递的为ul；
        //在摄像头列表第一次展开时获取该摄像头的报警记录和人脸记录的数目。
        var that = obj;
        var lis = that.find("li");
        lis.each(function(index){
            var li_that = $(lis[index]);
            var camera_person = li_that.find(".camera_person");
            var src_id = li_that.attr("id");
            // src_id = src_id.split("_")[1];
            if(camera_person.length == 0){
                
                $.post("/deepface/camerastatstoday", {"src_id":src_id}, function(data){
                    var code = data.code;
                    var msg = data.message;
                    if(code == 0 && msg == "success"){
                        var facetracks_today = data.data.facetracks_today;
                        facetracks_today = facetracks_today?facetracks_today:0;
                        var facetracks_alarm_today = data.data.facetracks_alarm_today;
                        facetracks_alarm_today = facetracks_alarm_today?facetracks_alarm_today:0;
                        var str = '<span class="camera_person">' + facetracks_today + '</span><span class="camera_alarm">' + facetracks_alarm_today + '</span>';
                        $("#"+src_id).append(str);
                    }
                });
            }
        });
    }

// 获取当前时间戳
var time = new Date();
time = time.getTime();
jQuery(function($) {
    $.ajaxSetup({
        cache: false
    });
    // 初始化摄像头列表
	$.get('/deepface/camerainfo?&time='+time, function(data) {
        var msg = data.message;
        var code = data.code;
        if(msg == "success" && code ==0){
            getCamerali(data);
        }
	});
    $.ajax({
        url:"/system/mapsystem?" +'time='+time,
        type:"GET",
        sync:true,
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                return;
            }
            var type = data.data.type;
            if(type == 0){
                //离线地图
                $('.main_camera .pattern').attr('data-url','/corsface/offline_map');
                $('.main_camera .pattern').removeClass("hide");
            }
            if(type == 1){
                //在线地图
                $('.main_camera .pattern').attr('data-url','/corsface/map');
                $('.main_camera .pattern').removeClass("hide");
            }
            if(type == -1){
                //禁用
                // $('.main_camera .pattern').addClass("hide");
            }
            
        }
    })

    //页面的配置方案
    $.get('/deepface/camerasolution?time=' + time,function (data) {
        var code = data.code;
        var msg = data.message;
        if(code == 0 && msg =="success"){
            CreateVLC(data.data);
        }
    },'json');
    //后面会删除该行。
    // shrinkVideo();

    $('.main_monitoring .pattern ').click(function (ev) {
        ev = ev || window.event;
        ev.stopPropagation();
		window.location.href = '/corsface/vediosetting';
    });
    
    //拖拽实时记录
	var dragFlag = false;
	var nowLeft = 0;
	$('.main').on('click','.realtime_content_left',function() {
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
		}, 35);
		nowLeft = left;

	});
	$('.main').on('click','.realtime_content_right',function() {
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
		}, 35);
		nowLeft = left;
	});

	// 切换摄像头列表形态
    $('#shrinkSwitch').click(function () {
        $(this).toggleClass('switch');
        $('.main_camera').toggleClass('switch');
        $('.main_monitoring').toggleClass('switch');
    });
	//	摄像头列表切换列表与地图模式
	$('.camera_header span').mousedown(function() {
		window.location.href = $(this).attr('data-url')
	});

	$.ajax({
        //生成下面的facetrack初始化。
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
	});

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

    

	//点击摄像头分组出现摄像头下拉
	$('.main').on('click', '.camera_content .camera_change_group_head', function() {
		var parentNode = $(this).parent();
		var target = parentNode.find('ul');
		target.toggleClass('hide');
		$(this).find('span').toggleClass('cl');
        addAalam_PersonNum(target);
	});

	//	点击图标出现场景图片
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

    // 最小化摄像头列表
	function minCA() {
        $('.main_camera').addClass('hide');
        $('.main_monitoring').css('margin','0 500px 0 50px');
    }

    var rangArr = [];
    var box;
    //	拖动摄像头放入vlc中. firefox兼容处理！！！
    $('.main').on('mousedown', '.camera_content li', function(ev) {
        ev = ev || window.event;
        if($(this).hasClass('noplay')){
            return;
        }
        var text = $(this).text();
        var name = $(this).attr('data-name');
        var url = $(this).attr('data-url');
        text = '<span id="drag" data-id="'+ $(this).attr('id') +'" data-name="' + name + '" data-url="' + url + '" style="position:absolute;top:' + ev.clientY + 'px;left:' + ev.clientX + 'px;">' + text + '</span>'
        $('.main').append(text);
        rangArr = [];
        $('.monitoring_rtsp_content').each(function () {
            if(!$(this).hasClass('hide')){
                box = $(this);
                console.log(box[0])
            }
        });
        for(var i = 0; i < box.find('.monitoring_vlc').length; i++) {
            var offset = $(box.find('.monitoring_vlc')[i]).offset()
            var rang = {
                "top": offset.top,
                "left": offset.left,
                "bottom": offset.top + $(box.find('.monitoring_vlc')[i]).height(),
                "right": offset.left + $(box.find('.monitoring_vlc')[i]).width()
            };
            rangArr.push(rang)
        }
        $(window).on('mousemove', function(ev) {
            ev = ev || window.event;
            if($('#drag').length) {
                ev.preventDefault();
                ev.returnValue = false;
                $('#drag').css({
                    'left': ev.clientX + 'px',
                    'top': ev.clientY + 'px'
                })
            }
        });

        $(window).on('mouseup', function(ev) {
            ev = ev || event;
            if($('#drag').length) {
                var x = ev.clientX,
                    y = ev.clientY;
                for(var i = 0; i < rangArr.length; i++) {
                    if(ev.clientX >= rangArr[i].left && ev.clientX <= rangArr[i].right && y >= rangArr[i].top && y <= rangArr[i].bottom) {
                        var vlc = $(box.find('.monitoring_vlc')[i]).find('object')[0];
                        $(box.find('.monitoring_vlc')[i]).find('.monitoring_vlc_title').text($('#drag').attr('data-name'));
                        $('#'+$(vlc).attr('data-id')).removeClass('playing');
                        $(vlc).attr('data-id', $('#drag').attr('data-id'));
                        $('#'+$('#drag').attr('data-id')).addClass('playing');
                        var ta = box.find('.monitoring_vlc')[i];
                        
                        var data_url = $('#drag').attr('data-url');
                        var vlc = $(ta).find("object")[0];
                        if(vlc){
                            $(vlc).attr("data-url", data_url);
                        }
                        showVlc(ta);
                        try {
                            var vlcid = vlc.playlist.add($('#drag').attr('data-url'));
                            vlc.playlist.playItem(vlcid);

                        } catch(e) {
                            //TODO handle the exception
                        }

                        setTimeout(function () {
                            isVlcPlay(ta);
                        },500);
                        rangArr = [];
                        break;
                    }
                }
                $('#drag').remove();
                saveNowPlaying()
            }
        })
    });
    // 图片栏滑动

    if($('.warning_content')[0]){
        $('.warning_content')[0].onmousewheel=scrollFunc;//IE/Opera/Chrome
        if(document.addEventListener){
            $('.warning_content')[0].addEventListener('DOMMouseScroll',scrollFunc,false);
        }//W3C
    }

    var transFT = 0;

    function scrollFunc(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        ev.returnValue = false;
        var max = $('.warning_content_wrap').height() - $('.warning_content').height()+20;
        if(max>0) {
            return
        }
        if(ev.wheelDelta>0 || ev.detail<0){
            // 向上滚
            var top = transFT + 20;
            if(top>10){
                top = 10
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

// 人脸详情
	$('.main').on('click', '.realtime_content .realtime_info', function() {
        var url = '/corsface/trackdetail?UUID=' + $(this).attr('id');
        hideVLC();
        layerShadow(url,1,'660px','660px',2);
        $(parent.document).find('.wrapper').addClass('blur');
	});

	// 报警详情
	$('.main').on('click', '.warning_content .warning_info', function() {
		var url = '/corsface/trackdetail?UUID=' + $(this).attr('aid');
        hideVLC();
        layerShadow(url,2,'660px','660px',2);
        $(parent.document).find('.wrapper').addClass('blur');
    });
    
    
	//{Type:'P',UUID:'ca56a623-a4a4-43db-b1ab-6b5e381dbc48',IP:'192.168.1.142',Person:{PersonId:'8cf42be9-5162-425f-a1c1-23b383924383',Matchs:0.7781102061271667,Percent:0.9791588187217712,N:0}}
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
        // $('img').on('error' ,function () {
        //     this.src = "/static/Themes/Attach/icon/imgNotFound144.png";
        // })
	}

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
            var CAname = alarm.camera_name?alarm.camera_name:'',aName=person_matched.name?person_matched.name:'未知';
			var alarmTxt = '<div class="warning_info" aid="' + alarm.facetrack_id + '" ><div class="warning_info_content">' +
				'<div class="warning_info_content_left"><div class="warning_info_content_img"><img src="' + alarm.image + '"/></div>' +
                '<div class="warning_Matchs">'+ mcs +'</div>' +
                '<div class="warning_info_content_img personImg"><img src="' + person_matched.face_image + '"/></div>' +
				'</div><div class="warning_info_content_right">' +
				'<div class="warning_info_content_alarmIcon" style="background-image: url(/static/Themes/Images/ICON/alarm'+ alarm_level+'.png);"></div>' +
				'<div class="warning_info_content_surImg initSurImg" data-url="' + alarm.scene_image + '"></div>' +
				'<div class="warning_surImg hide"><img src="' + alarm.scene_image + '" />' +
				'</div></div><div class="warning_info_content_mid"><div class="warning_info_content_name">' + aName +
				'</div><div class="warning_info_content_location">' + group_name +
                // '</div><div class="warning_info_content_pid">' + acard +
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

    // 出现删除按钮
	$('.main').on('mouseenter','.realtime_info',function () {

		var id = $(this).attr('id');
		if(!id){
			id = $(this).attr('aid')
		}
		$(window).keydown(function (e) {
			if(e.keyCode=='17'){
                if($('.info_delete').length>0){
					return;
                }
				$('#'+id).append('<div class="info_delete">X</div>')
			}
        });
        $(window).keyup(function (e) {
			$('.info_delete').remove()
        })
    })
    $('.main').on('mouseleave','.realtime_info',function () {
    	$(this).find('.info_delete').remove();
		$(window).off('keydown');
        $(window).off('keyup')
    })
    $('.main').on('mouseenter','.warning_info',function () {

		var id = $(this).attr('aid');
        $(window).keydown(function (e) {
            if(e.keyCode=='17'){
            	$('.warning_info').each(function () {
					if($(this).attr('aid')==id){
                        $(this).append('<div class="info_delete">X</div>')
                    }
                })
            }
        });
        $(window).keyup(function (e) {
            $('.info_delete').remove()
        })
    })
    $('.main').on('mouseleave','.warning_info',function () {
        $(this).find('.info_delete').remove();
        $(window).off('keydown');
        $(window).off('keyup')
    })
    $('.main').on('mousedown','.info_delete',function () {
        var id = $(this).parents(".realtime_info").attr('id');
        if(id){
            var trackNum = Number($("#TodayTrack").text());
            trackNum--;
            $("#TodayTrack").text(trackNum);
        }else{
            var alarmNum = Number($("#todayAlarm").text());
            alarmNum--;
            $("#todayAlarm").text(alarmNum);
        }
        $(this).parents('.realtime_info,.warning_info').remove();
    })
    var updatecameraAlarmAndCapNum = setInterval(function(){
        var cl = $(".camera_change_group_head .cl");
        $(cl).each(function(){
            var openUl = $(this).parent().parent().find("ul");
            console.log("定时刷新摄像头的报警和人脸记录数据");
            addAalam_PersonNum(openUl);
        })
    }, 3600*1000);

    //页面初始化时设置今日报警抓拍记录
    setTotalTodayAlamCaptureNum();
    var updateAlarmAndCapTotalNum = setInterval(function(){
        //每一个小时单独更新一次。
        setTotalTodayAlamCaptureNum();
    }, 3600*1000);
});

//初始化摄像头列表
var cameraI = true;
function getCamerali(data) {
	var data = data.data;
	if(cameraI){
        cameraI = false;
        var rtsp = [],names = [],grouphtml = '',count=0,isOpen=true;
        for(var i = 0; i < data.length; i++) {
            var lihtml = '';
            if(data[i].cameras) {
                var child = data[i].cameras;
                for(var j = 0; j < child.length; j++) {
                	var state = '';
					var text = child[j].camera_name?child[j].camera_name:'未知摄像头';
                	if(text.length>10){
                	    text = text.substr(0,8)+'...'
                    }
                        lihtml += '<li class="'+ state +'" id="'+ child[j].src_id +'" data-url="' + child[j].capture_url + '" data-name="' + child[j].camera_name + '" title="'+ child[j].camera_name +'&nbsp;&nbsp;&nbsp;'+ child[j].capture_url +'">'
                        + text +'</li>';
                        //报警人数和人脸记录人数的设置。
                        
                    if(rtsp.length) {
                        rtsp.push('rtsp://' + child[j].capture_url);
                    }
                    if(names.length) {
                        names.push(child[j].camera_name);
                    }
                    count++;
                }
            }
            var span = '<span></span>';
            if(data[i].usable!='0'&&isOpen) {
                lihtml = '<ul>' + lihtml + '</ul>';
                span = '<span class="cl"></span>';
                isOpen = false;
            } else {
                lihtml = '<ul class="hide">' + lihtml + '</ul>';
            }

            //group 的信息
            //var group = '<div class="camera_change_group"><div class="camera_change_group_head">' + data[i].camera_name+ ' <i>('+ data[i].usable+ '/' + data[i].num + ')</i>' + span + '</div>' + lihtml + '</div>';
            var group = '<div class="camera_change_group"><div class="camera_change_group_head">' + data[i].group_name+ ' <i>('+ data[i].cameras.length + ')</i>' + span + '</div>' + lihtml + '</div>';

            grouphtml += group;
        }

        $('.camera_header .bg_header_3 i').text('('+count+')');
        $('.camera_change>*').remove();
        $('.camera_change').append(grouphtml);
        $('.main').on('click', '.camera_change .camera_change_group_head', function() {
            var url = $(this).attr('data-url');
            $('#iframe').attr('src', url);
        })

        $('.main').on('click', '.camera_change li', function() {
            var url = $(this).attr('data-url');
            $('#iframe').attr('src', url);
            $('.camera_change li').removeClass('active');
            $(this).addClass('active')
        })
        //第一次的只执行第一次。
        addAalam_PersonNum($(".camera_change_group ul:not(.hide)"));
	}

}
function setTotalTodayAlamCaptureNum (){
    $.ajax({
        //今日报警数目, 抓拍数目 设置。
        url: "/deepface/camerastatstoday",
        data: {
            "src_id": ""
        },
        async: true,
        type: "POST",
        success: function(data) {
            var msg = data.message;
            var code = data.code;
            data = data.data;
            todayAlaNum = 0;
            todayCapNum = 0;
            if(msg == "success" && code == 0){
                todayAlaNum = data.facetracks_alarm_today;
                todayCapNum = data.facetracks_today;
                var alarmNum = $("#todayAlarm");
                if(alarmNum && alarmNum.length == 1){
                    $("#todayAlarm").text(todayAlaNum);
                }else{
                    $('.warning_header .bg_header_3').append('<span>今日报警数：<i id="todayAlarm" style="font-size: 15px;color: #f48008;font-weight: bold">'+todayAlaNum+'</i></span>');
                }
                $("#TodayTrack").text(todayCapNum);
            }
        }
    });
}
//使用websocketc获取推送数据
try {
    // var socket = new WebSocketClient();
    // socket.open("ws://" + window.location.host + "/facetrack/websocket");
    var socket = "";
    //
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
    var adres = matchInfo.family_register;
    var group_name = matchInfo.group_name?matchInfo.group_name:"";
    var alarm_level = matchInfo.alarm_level;
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
                '</div><div class="warning_info_content_location">' + group_name +
                // '</div><div class="warning_info_content_pid">' + acard +
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


function saveNowPlaying() {
    var layout = 0;
    if($('.monitoring_rtsp_content').hasClass('rtsp_layout1')){
        layout = 1;
    }
    if($('.monitoring_rtsp_content').hasClass('rtsp_layout12')){
        layout = 2;
    }
    if($('.monitoring_rtsp_content').hasClass('rtsp_layout22')){
        layout = 3;
    }
    if($('.monitoring_rtsp_content').hasClass('rtsp_layout23')){
        layout = 4;
    }
    var params = {
        type : layout,
        cameras : []
    }
    $('.monitoring_rtsp_content').find('object').each(function () {
        params.cameras.push($(this).attr('data-id'));
    });
}
function playMp3(url) {
	var audio = '<embed id="mp3" autoplay="true" src="/CorsFace' + url + '"  width="0" height="0" />';
	$('body').append(audio);
	setTimeout(function() {
		$('#mp3').remove();
	}, 1000)
}

function CreateVLC(data) {
		var number = 1;
		var vlcHtml = '';
		var Class = '';
		switch (data.solution){
			case 1:
				number = 1;
				Class = 'rtsp_layout1';
				break;
			case 2:
				number = 3;
				Class = 'rtsp_layout12';
				break;
			case 3:
				number = 4;
				Class = 'rtsp_layout22';
				break;
			case 4:
				number = 6;
				Class = 'rtsp_layout23';
				break;
			default:
                number = 1;
                Class = 'rtsp_layout1';
				break;
		}
        //ondblclick="vlc_dbclick(this)"
		for(var i=0;i<number;i++){
			vlcHtml += '<div class="monitoring_vlc" ><span></span>' +
				'<object type="application/x-vlc-plugin" pluginspage="http://www.videola.org" id="vlc1" events="false" width="60%" height="100%">' +
				'<param name="mrl" value="" />' +
				'<param name="volume" value="50" />' +
				'<param name="autoplay" value="true" />' +
				'<param name="loop" value="false" />' +
				'<param name="fullscreen" value="true" />' +
				'<param name="controls" value="false" />' +
				'<param name="branding" value="false" />' +
                '<param name="bgcolor" value="black" />' +
                '</object>' +
				'<div class="monitoring_vlc_title">无</div>' +
				'</div>';
		}
		$('.monitoring_rtsp_content').empty().append(vlcHtml);
    	$('.monitoring_rtsp_content').attr('class','monitoring_rtsp_content '+Class);
        data = data.cameras;
		for(var j=0;j<data.length;j++){
            var vlc = $($('.monitoring_vlc')[j]).find('object')[0];
            $(vlc).attr('data-id',data[j].src_id);
            $(vlc).attr('data-url', data[j].display_url);
            playingCA.push(data[j].src_id);
            var Caname = data[j].camera_name?data[j].camera_name:'';
            $($('.monitoring_vlc')[j]).find('.monitoring_vlc_title').text(Caname);
            console.log(data[j].display_url);

            try {
            	vlc.style.width = '100%';
            	vlc.style.height = '100%';
                var vlcid = vlc.playlist.add(data[j].display_url);
                vlc.playlist.playItem(vlcid);
                vlc.ondblclick = function () {
                    this.video.toggleFullscreen();
                }
            } catch(e) {
                //TODO handle the exception
            }
		}
		for(var i in playingCA){
            $('#'+playingCA[i]).addClass('playing')
		}
        setTimeout(function () {
            $('.monitoring_vlc').each(function () {
                isVlcPlay(this);
            })
        },1000);
}
function shrinkVideo() {
    $('.main_monitoring').addClass('shrink');
    $('.main_warning').addClass('switch');
    $('#shrinkSwitch').addClass('hide');
}
function commenVideo() {
    $('.main_monitoring').removeClass('shrink');
    if(!$('.main_monitoring').hasClass('switch')){
        $('.main_warning').removeClass('switch');
    }
}
function changeVLC() {
    $('.monitoring_vlc').not('.hide').each(function () {
        var width =Math.floor( $(this).width())-6;
        var height = Math.floor($(this).height());
        if(width>height*16/9){
            width = Math.floor(height*16/9)
        }else {
            height = Math.floor(width*9/16)
        }
        $(this).find('object').css({'width':width+'px','height':height+'px'})
    })
}
function hideVLC(){
    $('.monitoring_vlc object').each(function (){
        if(this.playlist){
            var isPlay = this.playlist.isPlaying;
            if(isPlay){
                $(this).addClass("hide");
                $(this).attr("isPlay", "true");
            }
        }
    })
}
vlc_dbclick = function(obj){
    console.log("full screen click");
    var that = obj;
    var obj = $(that).find("object")[0];
    console.log(obj);
    obj.video.toggleFullscreen();
    // that.video.toggleFullscreen();
}