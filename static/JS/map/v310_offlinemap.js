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
var time = new Date();
time = time.getTime();
jQuery(function($) {
    $.ajaxSetup({
        cache: false
    });
    var imgSize ={};
    var params = {
        obj: "mainMap",
        cameras: []
    };
// 初始化摄像头列表
    $.get('alarmRecordExecuteEx.action?TagName=getCameraTree&time='+time, function(data) {
        getCamerali(data)
    });

    // 获取地图id
    var mcid = Util.GetParam("MCID");
    // 通过地图id获取地图信息
    $.get('mapChoose.action?operation=getMapPoint&MCID=' + mcid+'&time='+time,
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
                var mkName = marker.CAName?marker.CAName:'未知摄像头';
                if(PLeft != null) {
                    var markerI = '<div class="marker_icon '+ marker.CSID +'" data-location="' +
                        marker.PLeft + ',' +
                        marker.PTop + '" data-url="'+
                        marker.IpAddress +'" id="' +
                        marker.CAID + '" style="left: calc(' +
                        marker.PLeft * 100 + '% - 10px);top: calc(' +
                        marker.PTop * 100 + '% - 40px);">' +
                        mkName + '</div>';
                    $('.monitoring_rtsp_photo').append(markerI);
                }
            }
            $('#map_img').load(function () {
                imgSize = GetImgSize('map_img');
                var width = imgSize.width*0.5;
                if(width < $('.monitoring_rtsp').width()){
                    width = $('.monitoring_rtsp').width()
                }
                $(this).css('width',width+'px')
            });
        });
    // 地图放大缩小
    if(document.addEventListener){
        $('#map_img')[0].addEventListener('DOMMouseScroll',scrollFunc,false);
    }//W3C
    $('#map_img')[0].onmousewheel=scrollFunc;//IE/Opera/Chrome
    function scrollFunc(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        console.log(imgSize.width);
        var centerX = ev.clientX;
        var centerY = ev.clientY;
        var offsetWrap = $('.monitoring_rtsp').offset();
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
            if($('#map_img').width()>=imgSize.width*1.5){
                return;
            }
            var wid = $('#map_img').width() + imgSize.width*0.1;
            if(wid>(imgSize.width*1.5)){
                wid = imgSize.width*1.5;
            }
            $('#map_img').css('width',wid + 'px');
            left = -(leS*$('#map_img').width()-le);
            top = -(toS*$('#map_img').height()-to);
        }else {
            if($('#map_img').width()<=$('.monitoring_rtsp').width()){
                return;
            }
            var wid = $('#map_img').width() - imgSize.width*0.1;
            if(wid<$('.monitoring_rtsp').width()){
                wid = $('.monitoring_rtsp').width();
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
        if(left < ($('.monitoring_rtsp').width() - $('#map_img').width())){
            left = ($('.monitoring_rtsp').width() - $('#map_img').width())
        }
        if(top < ($('.monitoring_rtsp').height() - $('#map_img').height())){
            top = ($('.monitoring_rtsp').height() - $('#map_img').height())
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
        var x = ev.clientX;
        var y = ev.clientY;

        var offs = $('#mainMap').offset();
        console.log(offs);
        var offWidth = $('#mainMap').width();
        var offHeight = $('#mainMap').height();

        if($('.marker_vlc').length>0){
            $('.marker_vlc').remove();
        }else {
            $(this).append('<div class="marker_vlc">' +
                '<object width="200" height="120" type="application/x-vlc-plugin" pluginspage="http://www.videola.org" id="vlc1" events="false" style="width:200px;height:120px"><param name="mrl" value="rtsp://admin:bjoffice001@192.168.1.64">' +
                '<param name="volume" value="50">' +
                '<param name="autoplay" value="true">' +
                '<param name="loop" value="false">' +
                '<param name="fullscreen" value="false">' +
                '<param name="controls" value="false">' +
                '<param name="branding" value="false">' +
                '</object></div>');
            var vlc = $('#vlc1')[0];
            try{
                vlc.width = "200";
                vlc.height="120";
                vlc.style.width="200px";
                vlc.style.height="120px";
                var vlcid = vlc.playlist.add($(this).attr('data-url'));
                //var vlc= document.getElementById("")
                vlc.playlist.playItem(vlcid);
            }catch (e){

            }
            var left = 30;
            var bottom = -126;
            if(ev.clientX>=(offs.left + offWidth - 220)){
                left = -220;
            }
            if(ev.clientY>=(offs.top + offHeight - 140)){
                bottom = 20;
            }
            $('.marker_vlc').css({'bottom':bottom+'px','left':left+'px'});
        }

    });
// 地图拖动
    var markerFlag = false;
    var Photoflag = false;
    // 地图拖动
    var transformX = 0;
    var transformY = 0;
    $('#map_img').on('mousedown',function(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        Photoflag = true;
        flag = true;
        var oldX = ev.clientX;
        var oldY = ev.clientY;
        var top;
        var left;
        $(window).on('mousemove', function(ev) {
                    ev = ev || window.event;
                    ev.preventDefault();
                    ev.returnValue = false;
                    if(Photoflag && !markerFlag && flag) {
                        flag = false;
                        var x = ev.clientX,
                            y = ev.clientY,
                            widthR = $('.monitoring_rtsp').width(),
                            heightR = $('.monitoring_rtsp').height(),
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
                        // console.log(left);
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

    // // 图片栏滑动
    if(document.addEventListener){
        $('.warning_content')[0].addEventListener('DOMMouseScroll',scrollFuncW,false);
    }//W3C
    $('.warning_content')[0].onmousewheel=scrollFuncW;//IE/Opera/Chrome

    var transFT = 0;

    function scrollFuncW(ev) {
        ev = ev || window.event;
        ev.preventDefault();
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

    //	摄像头列表切换列表与地图模式
    $('.pattern').click(function() {
        window.location.href = '/CorsFace/Index.html'
    });
    // 初始化警报与实时记录
    $.ajax({
        url: "/CorsFace/frameAction.action",
        data: {
            "TagName": "GetInitFace",
            "Num": RTInitNum
        },
        async: true,
        type: "POST",
        success: function(data) {
            initRealTime(data)
        }
    });
    $.ajax({
        url: "/CorsFace/frameAction.action",
        data: {
            "TagName": "GetInitAlarm",
            "Num": ARInitNum
        },
        async: true,
        type: "POST",
        success: function(data) {
            initWarning(data);
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
        $('.marker_icon').removeClass('hide');
        $('.camera_change_group_head span:not(.check)').each(function() {
            cameraId = $(this).attr('data-id');
            $('.'+cameraId).addClass('hide');
        })
    });
    //	进入详情页
    $('.main').on('click', '.realtime_content .realtime_info', function() {

        var url = '/CorsFace/Business/FaceInfo/Html/V31_FaceInfo.html?UUID=' + $(this).attr('id');
        layerShadow(url,1,'660px','660px',2);
        $(parent.document).find('.wrapper').addClass('blur');

    });
    // 报警详情
    $('.main').on('click', '.warning_content .warning_info', function() {

        var url = '/CorsFace/Business/Alarm/Html/V31_alarmInfo.html?UUID=' + $(this).attr('aid');
        layerShadow(url,2,'720px','740px',2);
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
// 获取图片原始大小
    function GetImgSize(id) {
        // var src = $('#'+id).attr('src');
        // var image = new Image();
        // image.src = src;
            var size = {};
            size.width = $('#'+id)[0].width;
            size.height = $('#'+id)[0].height;
            return size
    }

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
        var imgs = [];
        var data = JSON.parse(data);
        var faceHtml = '';

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
            var age = face.GAge;
            var sex = face.GSex;
            // switch(sex) {
            //     case 0:
            //         if(age <= 20) {
            //             personT = '青春男孩';
            //         } else if(age <= 35) {
            //             personT = '年轻有为';
            //         } else if(age < 70) {
            //             personT = '成熟大叔';
            //         } else {
            //             personT = '暮年老人';
            //         }
            //         break;
            //     case 1:
            //         if(age <= 20) {
            //             personT = '漂亮女孩';
            //         } else if(age <= 35) {
            //             personT = '靓丽少女';
            //         } else if(age < 70) {
            //             personT = '中年妇女';
            //         } else {
            //             personT = '暮年老人';
            //         }
            //         break;
            //     default:
            //         break;
            // }
            if(age <= 20) {
                personT = '青春年少';
            } else if(age <= 35) {
                personT = '风华正茂';
            } else if(age < 70) {
                personT = '成熟稳重';
            } else {
                personT = '花甲之年';
            }
            var content = JSON.parse(face.Content);
            var imgP = {
                uuid : face.UUID,
                ip : face.IP,
                imgs : JSON.stringify(content[0].results.imgs)
            };

            imgs.push(imgP);
            if(iconNum!='3'){
                var ptag = face.PTag ? face.PTag : '未知身份';
                var pDB = face.PSName ? face.PSName : personT;
            }else {
                var ptag = '未知身份';
                var pDB =  personT;
            }
            var cnode = face.CAName ? face.CAName : '&nbsp;';
            var faceTxt = '<div class="realtime_info initRealTime" id="' + face.UUID + '"><div class="face_ptag">' + ptag +
                '</div><div class="face_sort">' + pDB +
                '</div><div class="face_image"><img src=""/></div><div class="face_location">' + cnode +
                '</div><div class="face_location">' + face.BRID +
                '</div><div class="face_location">' + face.CTime +
                '</div><div class="face_icon faceIcon1" style="background-image: url(/CorsFace/Themes/Images/ICON/facetrackstatus' + iconNum + '.png);"></div></div>';
            faceHtml += faceTxt;
        }
        $('.realtime_content_Rwrap').empty();
        $('.realtime_content_Rwrap').prepend(faceHtml);
        $('.initRealTime .face_image>img').each(function (i) {
            var that = $(this);
            $.ajax({
                url:"/CorsFace/faceTrack.action",
                data:{TagName: 'GetOneFaceImg',
                    IP: imgs[i].ip,
                    UUID:imgs[i].uuid,
                    Imgs:imgs[i].imgs},
                async:true,
                type:"POST",
                success:function(data){
                    var data = eval(data);
                    that.attr('src','data:image/jpeg;base64,'+data[0])
                }
            })

        })
        $('img').on('error' ,function () {
            this.src = "/CorsFace/Attach/icon/imgNotFound144.png";
        })
    }
    //初始化报警信息
    function initWarning(data) {
        var data = eval(data);
        var alarmHtml = '';
        for(var i = 0; i < data.length; i++) {
            var alarm = data[i];
            var CAname = alarm.CAName?alarm.CAName:'';
            var alarmTxt = '<div class="warning_info" aid="' + alarm.UUID + '"><div class="warning_info_content">' +
                '<div class="warning_info_content_left"><div class="warning_info_content_img"><img src="/CorsFace' + alarm.facImg + '" /></div>' +
                '</div><div class="warning_info_content_right">' +
                '<div class="warning_info_content_alarmIcon" style="background-image: url(/CorsFace' + alarm.DCode + ');"></div>' +
                '<div class="warning_info_content_surImg initSurImg" data-url="/CorsFace' + alarm.surImg + '"></div>' +
                '<div class="warning_surImg hide"><img src="/CorsFace' + alarm.surImg + '" />' +
                '</div></div><div class="warning_info_content_mid"><div class="warning_info_content_name">' + alarm.Name +
                '</div><div class="warning_info_content_location">' + alarm.AID +
                '</div><div class="warning_info_content_location">' + CAname +
                '</div><div class="warning_info_content_time" style="font-size: 12px;">' + alarm.ATime +
                '</div></div></div></div>';
            alarmHtml += alarmTxt;
        }
        $('.warning_content').empty();
        $('.warning_content').prepend(alarmHtml);
        $('img').on('error' ,function () {
            this.src = "/CorsFace/Attach/icon/imgNotFound144.png";
        })
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
        };
        var data = JSON.parse(data);
        var rtsp = [];
        var grouphtml = '';
        for(var i = 0; i < data.length; i++) {
            var lihtml = '';

            if(data[i].childNode) {
                var child = data[i].childNode;
                for(var j = 0; j < child.length; j++) {
                    var camera = {
                        'name': child[j].comara.CAName,
                        'location': [child[j].comara.longitude, child[j].comara.latitude],
                        'id': child[j].comara.CAID
                    };
                    params.cameras.push(camera);
                }
            }
            var group = '<div class="camera_change_group_head"><span class="check" data-id="' + data[i].MUID + '"></span>' + data[i].MUName + '</div>';
            grouphtml += group;
        }
        $('.camera_change>*').remove();
        $('.camera_change').append(grouphtml);
    }
});

//使用Pushlet获取推送的消息
try {
    //		Listener(showData)
    PL._init();
    PL.joinListen('PushletBroad');

    function onData(event) {
        var d = event.get("key");
        try {
            var data = eval("(" + d + ")");
            handle(data);
        } catch(e) {
            console.log(d);
        }
    }
} catch(e) {
    //TODO handle the exception

}

var TrackData = [];

function handle(data) {
    var face = data.Person;
    var id = data.UUID;

    if(data.Type == 'T') {
        var trackdata = {
            id: data.UUID,
            time: data.Track.CTime,
            Cname: data.Track.CAName,
            img: data.Track.Imgs[0]
        }
        //		未识别
        if(TrackData.length > 12) {
            TrackData.push(trackdata);
            TrackData.shift();
        } else {
            TrackData.push(trackdata)
        }
        var personT = '&nbsp;';
        var age = data.Track.Age;
        var sex = data.Track.Sex;
        // switch(sex) {
        //     case 0:
        //         if(age <= 20) {
        //             personT = '青春男孩';
        //         } else if(age <= 35) {
        //             personT = '年轻有为';
        //         } else if(age < 70) {
        //             personT = '成熟大叔';
        //         } else {
        //             personT = '暮年老人';
        //         }
        //         break;
        //     case 1:
        //         if(age <= 20) {
        //             personT = '漂亮女孩';
        //         } else if(age <= 35) {
        //             personT = '靓丽少女';
        //         } else if(age < 70) {
        //             personT = '中年妇女';
        //         } else {
        //             personT = '暮年老人';
        //         }
        //         break;
        //     default:
        //         break;
        // }
        if(age <= 20) {
            personT = '青春年少';
        } else if(age <= 35) {
            personT = '风华正茂';
        } else if(age < 70) {
            personT = '成熟稳重';
        } else {
            personT = '花甲之年';
        }
        var brid =  data.Track.BRID? data.Track.BRID:' ';
        var CAName = data.Track.CAName?data.Track.CAName:'&nbsp;';
        var faceHtml = '<div class="realtime_info" id="' + data.UUID + '"><div class="face_ptag">' + '未知身份' +
            '</div><div class="face_sort">' + personT +
            '</div><div class="face_image"><img src="data:image/jpeg;base64,' + data.Track.imgBase64 +
            '"/></div><div class="face_location">' + CAName +
            '</div><div class="face_location">' + brid +
            '</div><div class="face_location">' + data.Track.CTime +
            '</div><div class="face_icon faceIcon1" style="background-image: url(/CorsFace/Themes/Images/ICON/facetrackstatus3.png);"></div></div>';

        if($('.realtime_info').length>=RTMaxNum){
            $('.realtime_info:last').remove();
        }
        $('.realtime_content_Rwrap').prepend(faceHtml);

    } else {
        if(data.Alerm == 1 && data.AlermInfo.RName) {
            //				报警
            var facePic = {
                "TagName": "GetAlarmInfo",
                "UUID": id
            }
            var imgs = '';
            var time = '';
            var cname = '';
            var surImg = '';

            $.ajax({
                url: "/CorsFace/faceTrack.action",
                data: facePic,
                async: false,
                type: "POST",
                success: function(ret) {
                    var data = eval(ret);
                    if(data.length>0){
                        data = data[0];
                        imgs = '/CorsFace' + data.FImag;
                        time = data.CTime;
                        cname = data.CName;
                        surImg = data.SurImg;
                    }else{
                        imgs = $('#'+id).find("img").attr("src");
                        time = $('#'+id).find(".face_location")[1].innerText;
                        cname = $('#'+id).find(".face_location")[0].innerText;
                    }
                }
            });

            var alarm = data.AlermInfo;
            playMp3(alarm.Music);
            var alarmHtml = '<div class="warning_info" aid="' + data.UUID + '"><div class="warning_info_content">' +
                '<div class="warning_info_content_left"><div class="warning_info_content_img"><img src="' + imgs + '" /></div>' +
                '</div><div class="warning_info_content_right">' +
                '<div class="warning_info_content_alarmIcon" style="background-image: url(/CorsFace' + alarm.ICON + ');"></div>' +
                '<div class="warning_info_content_surImg" onclick="getSurImg(\''+ id.trim() +'\')"></div>' +
                '<div class="warning_surImg hide"><img id="SI_' + id.trim() + '"  src="/CorsFace' + surImg + '" style="background: url(/CorsFace/Themes/Images/ICON/loading.gif) no-repeat center" />' +
                '</div></div><div class="warning_info_content_mid"><div class="warning_info_content_name">' + face.Name +
                '</div><div class="warning_info_content_location">' + aid +
                '</div><div class="warning_info_content_location">' + cname +
                '</div><div class="warning_info_content_time" style="font-size: 12px;">' + time +
                '</div></div></div></div>';
            //判断报警模块数量，不能超过一定数量
            if($(".warning_info").length>=ARMaxNum){
                $(".warning_info:last").remove();
            }
            $('.warning_content').prepend(alarmHtml);

        } //else {
        //				识别后修改未识别的内容
        var minS = face.MinSpot?face.MinSpot:minDefaultSpot,maxS = face.MaxSpot?face.MaxSpot:maxDefaultSpot;
        if(face.PersonId!=null){
            if(face.Matchs >maxS) {
                var iconNum = '2';
            } else if(face.Matchs <minS) {
                var iconNum = '3';
                return;
            } else {
                var iconNum = '1';
            }
        }else {
            var iconNum = '3';
        }
        if(face.PTag=='null'||!face.PTag){
            var ptag = '未知身份'
        }else {
            var ptag = face.PTag
        }

        if(!face.Sort || face.Sort == 'null') {
            var sort = '未分组'
        } else {
            var sort = face.Sort
        }
        // if(iconNum!='3'){
        //     if($('#' + id).length > 0) {
        //         $('#' + id).find('.face_ptag').text(ptag);
        //         $('#' + id).find('.face_icon').css('background-image', 'url(/CorsFace/Themes/Images/ICON/facetrackstatus' + iconNum + '.png)');
        //     }
        // }
    }
    $('img').on('error' ,function () {
        this.src = "/CorsFace/Attach/icon/imgNotFound144.png";
    })
}
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