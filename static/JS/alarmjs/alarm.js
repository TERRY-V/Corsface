/**
 * Created by zhaoj on 2017/12/25.
 */
var params = {
    TagName:'getPageData',
    fields: "AID,date_format(ATime,'%Y-%c-%d %H:%i:%s') as ATime,PSort,IP,UUID,State,Matchs,surImg,facImg,PID,`Name`,Sex,CardNo,National,Birthday,PTag,Address,PersonDB,MinSpot,MaxSpot,RName,DValue,ALevel,AComtent,CAName,DName,DCode",
    tableName: 'v_alarminfo v',
    condition:" ",
    order: 'v.ATime DESC',
    pageSize: 16,
    pageNo: 1
};
$(function ($) {
    $.ajaxSetup({cache:false});

    jQuery('#AlarmRecord').html('');
    jQuery('#AlarmRecord').addClass('loading');
    jQuery.post('alarmRecordExecuteEx.action', params, function (data) {

        var data = JSON.parse(data);
        var detailState = ['/static/Themes/Images/Other/noDetail.png', '/static/Themes/Images/Other/detailed.png', '/static/Themes/Images/Other/errAlarm.png']

        currentpage = data[0].pageNo;
        page = data[0].totalPages;
        count = data[0].totalCount;

        //动态生成报警记录卡片
        if(data[0].results.length > 0){
            for( x in data[0].results ){
                var alarmCard = '',aName = data[0].results[x].Name?data[0].results[x].Name:'未知',aPSort=data[0].results[x].PSort?data[0].results[x].PSort:'未知分组',
                    aBD=data[0].results[x].PersonDB?data[0].results[x].PersonDB:'未知',aAddr=data[0].results[x].Address?data[0].results[x].Address:'未知住址',
                    aCname = data[0].results[x].CAName?data[0].results[x].CAName:'未知摄像头',Matchs =data[0].results[x].Matchs?parseInt(data[0].results[x].Matchs*100) + '%':' ';
                alarmCard ='<div class="alarm_card" id="'+data[0].results[x].UUID+'" onclick="personDetails(\''+data[0].results[x].UUID+'\', \'' + data[0].results[x].AID + '\')">' +
                    '<div class="detail_state">' +
                    '<img class="state_img" src="' + detailState[data[0].results[x].State] +'" alt="">' +
                    '</div>'+
                    '<div class="alarm_msg clearfix">'+
                    '<P class="arid_num">' + data[0].results[x].AID + '</P>' +
                    '<div class="alarm_face_img left">' +
                    '<img style="width: 100%" src="/CorsFace' + data[0].results[x].facImg + '" alt="">' +
                    '</div>' +
                    '<div class="alarm_camera_pImg" data-id="'+ data[0].results[x].PID +'">' +
                    ' <img src="" alt=""> ' +
                    '<p class="Ptime">' + data[0].results[x].ATime + '</p>' +'<div class="Pmatches">'+ Matchs +'</div>'+
                    '</div>'+
                    '<div class="alarm_msg_mid">'+
                    '<div class="alarm_msg_constent left">'+
                    '<p class="PName" style="font-size: 18px">' + aName + '</p>' +
                    '<br/>'+
                    '<p>' + aPSort + '</p><br/>' +
                    '<p>' + aBD + '</p><br/>' +
                    '<p>' + aAddr + '</p>' +
                    '</div>' +
                    '<div class="alarm_camera_time">' +
                    '<p> <span class="alarm_snapImg_btn" onclick="snapClick(event, this)"></span>' + aCname + '</p>' +
                    '</div>' +
                    '</div>' +

                    '<div class="snapImg" onclick="snapImgClick(event)">' +
                    '<img style="width: 100%; height: 100%" src="/CorsFace' + data[0].results[x].surImg + '" alt="">' +
                    '</div></div>' +
                    '<div class="alarm_msg_right">' +
                    '<img style=" width: 25px; margin-left: 16px;" src="/CorsFace' + data[0].results[x].DCode + '" alt="">'+
                    '</div>' +
                    '</div>';
                jQuery('#AlarmRecord').append(alarmCard);
            }
            $('img').error(function () {
                this.src = '/static/Themes/Attach/icon/imgNotFound144.png';
            })
        }

        jQuery('#AlarmRecord').removeClass('loading');

        $('.alarm_camera_pImg').each(function () {
            var pid = $(this).attr('data-id');
            var _this = this;
            $.post('personSortExecuteEx.action',{TagName:'getPersonImg',PID:pid},function (data) {
                $(_this).find('img').attr('src','/CorsFace'+data)
            })
        })
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
                var time = new Date();
                time = time.getTime();
                $.get('alarmRecordExecuteEx.action?TagName=getCameraTree&time='+time, function(data) {
                    getCamerali(data)
                })
            } catch(e) {
                console.log(e);
                console.log(d);
            }
        }
    } catch(e) {
        //TODO handle the exception
        console.log(e)
    }

});
// 点击图标显示预览图
snapClick = function (event, obj) {

    var _this = obj;
    var e = event || window.event;
    e.stopPropagation();
    var x = e.clientX;
    var y = e.clientY;
    var width = $(window).width() - 400;
    var height = $(window).height() - 275;
    if(x>width&&y>height){
        $(_this).parent().parent().parent().parent().find('.snapImg').toggleClass('brOpen')
    }else if(x>width){
        $(_this).parent().parent().parent().parent().find('.snapImg').toggleClass('trOpen')
    }else if(y>height){
        $(_this).parent().parent().parent().parent().find('.snapImg').toggleClass('blOpen')
    }else {
        $(_this).parent().parent().parent().parent().find('.snapImg').toggleClass('open')
    }
};

//出发弹窗
personDetails = function (UUID, AID) {
    var url = 'V31_alarmInfo.html?UUID=' + UUID;
    var pa = {
        type: 2,
        title: '报警详情-' + AID,
        content: url,
        area: ['720px', '740px'],
        // offset: ['70px', '500px'],
        cancel: function(index) {
            layer.close(index);
            var deleteAlarm = $('iframe')[0].contentWindow.deleteAlarm;
            if(deleteAlarm==1){
                $('#'+UUID).find('.state_img').attr('src','/stataic/Themes/Images/Other/detailed.png')
            }else if(deleteAlarm==2){
                $('#'+UUID).find('.state_img').attr('src','/static/Themes/Images/Other/errAlarm.png')
            }else {
                $('#'+UUID).find('.state_img').attr('src','/static/Themes/Images/Other/noDetail.png')
            }
            // Init_Alarm_Record(init_params);
        }
    };
    layer.open(pa);
};



var TrackData = [];
// 处理推送的数据
function handle(data) {
    if(data.Type == 'P' && data.Alerm == 1 && data.AlermInfo.RName) {
        var face = data.Person;
        var id = data.UUID;

        //报警
        // $('#todayAlarm').text('今日报警'+todayAl+'条');
        var facePic = {
            "TagName": "GetAlarmInfo",
            "UUID": id
        }
        var imgs = '/static/Themes/Attach/icon/imgNotFound144.png';
        var time = '';
        var cname = '';
        var surImg = '/static/Themes/Attach/icon/imgNotFound144.png';
        var pImg = '/static/Themes/Attach/icon/imgNotFound144.png';

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
                    cname = data.CName?data.CName:'';
                    surImg = data.SurImg;
                    pImg = data.PImage;
                }else{
                    imgs = $('#'+id).find("img").attr("src");
                    time = $('#'+id).find(".face_location")[1].innerText;
                    cname = $('#'+id).find(".face_location")[0].innerText?$('#'+id).find(".face_location")[0].innerText:'';
                }
            }
        });
        var aid =  data.AID ? data.AID :' ';
        var alarm = data.AlermInfo;
        var fName = face.Name?face.Name:'未知人员';
        var mcs = Math.floor(face.Matchs*100);
        playMp3(alarm.Music);
        var alarmHtml = '<div class="warning_info" aid="' + data.UUID + '"><div class="warning_info_content">' +
            '<div class="warning_info_content_left"><div class="warning_info_content_img"><img src="' + imgs + '" /></div>' +
            '<div class="warning_Matchs">'+ mcs +'%</div>' +
            '<div class="warning_info_content_img personImg"><img src="/CorsFace' + pImg + '"/></div>' +
            '</div><div class="warning_info_content_right">' +
            '<div class="warning_info_content_alarmIcon" style="background-image: url(/CorsFace' + alarm.ICON + ');"></div>' +
            '<div class="warning_info_content_surImg" onclick="getSurImg(\''+ id.trim() +'\')"></div>' +
            '<div class="warning_surImg hide"><img id="SI_' + id.trim() + '"  src="/CorsFace' + surImg + '" style="background: url(/CorsFace/Themes/Images/ICON/loading.gif) no-repeat center" />' +
            '</div></div><div class="warning_info_content_mid"><div class="warning_info_content_name">' + fName +
            '</div><div class="warning_info_content_location">' + aid +
            '</div><div class="warning_info_content_pid">证件号：' + face.CardNo +
            '</div><div class="warning_info_content_address">地&nbsp;&nbsp;址：' + face.Address +
            '</div><div class="warning_info_content_location">' + cname +
            '</div><div class="warning_info_content_time" style="font-size: 12px;">' + time +
            '</div></div></div></div>';
        var alarmCard = '',aName = data[0].results[x].Name?data[0].results[x].Name:'未知',aPSort=data[0].results[x].PSort?data[0].results[x].PSort:'未知分组',
            aBD=data[0].results[x].PersonDB?data[0].results[x].PersonDB:'未知',aAddr=data[0].results[x].Address?data[0].results[x].Address:'未知住址',
            aCname = data[0].results[x].CAName?data[0].results[x].CAName:'未知摄像头',Matchs =data[0].results[x].Matchs?parseInt(data[0].results[x].Matchs*100) + '%':' ';
        alarmCard ='<div class="alarm_card" id="'+data.UUID+'" onclick="personDetails(\''+data.UUID+'\', \'' + aid + '\')">' +
            '<div class="detail_state">' +
            '<img class="state_img" src="" alt="">' +  //状态图标
            '</div>'+
            '<div class="alarm_msg clearfix">'+
            '<P class="arid_num">' + aid + '</P>' +
            '<div class="alarm_face_img left">' +
            '<img style="width: 100%" src="/CorsFace' + data[0].results[x].facImg + '" alt="">' +
            '</div>' +
            '<div class="alarm_camera_pImg" data-id="'+ data[0].results[x].PID +'">' +
            ' <img src="" alt=""> ' +
            '<p class="Ptime">' + time + '</p>' +'<div class="Pmatches">'+ mcs +'</div>'+
            '</div>'+
            '<div class="alarm_msg_mid">'+
            '<div class="alarm_msg_constent left">'+
            '<p class="PName" style="font-size: 18px">' + fName + '</p>' +
            '<br/>'+
            '<p>' + aPSort + '</p><br/>' +
            '<p>' + aBD + '</p><br/>' +
            '<p>' + face.Address + '</p>' +
            '</div>' +
            '<div class="alarm_camera_time">' +
            '<p> <span class="alarm_snapImg_btn" onclick="snapClick(event, this)"></span>' + cname + '</p>' +
            '</div>' +
            '</div>' +

            '<div class="snapImg" onclick="snapImgClick(event)">' +
            '<img style="width: 100%; height: 100%" src="/CorsFace' + data[0].results[x].surImg + '" alt="">' +
            '</div></div>' +
            '<div class="alarm_msg_right">' +
            '<img style=" width: 25px; margin-left: 16px;" src="/CorsFace' + data[0].results[x].DCode + '" alt="">'+
            '</div>' +
            '</div>';
        jQuery('#AlarmRecord').append(alarmCard);
        //判断报警模块数量，不能超过一定数量
        if($(".warning_info").length>=ARMaxNum){
            $(".warning_info:last").remove();
        }
        $('.warning_content').prepend(alarmHtml);
    }
}
function playMp3(url) {
    var audio = '<embed id="mp3" autoplay="true" src="/CorsFace' + url + '"  width="0" height="0" />';
    $('body').append(audio);
    setTimeout(function() {
        $('#mp3').remove();
    }, 1000)
}
