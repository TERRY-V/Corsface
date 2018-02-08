/**
 * Created by zhaoj on 2017/10/30. recorrect by ziling on 2018/01/24
 */
var rtsp = [],ids = [], names = [],layout = '1';

jQuery(function($) {
    var time = new Date();
    time = time.getTime();
    $.get('/deepface/camerainfo?TagName=getCameraTree&time='+time, function(data) {
        var msg = data.message;
        var code = data.code;
        if(msg == "success" && code ==0){
            getCamerali(data);
        }
    });


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

    $('#layout1').click(function () {
        $('.monitoring_rtsp_content').addClass('hide');
        $('.rtsp_layout1').removeClass('hide');
        // changeVLC();
        layout = '1';
        for(var i = 0; i < $('.rtsp_layout1 .monitoring_vlc').length; i++) {
            var vlc = $($('.rtsp_layout1 .monitoring_vlc')[i]).find('object')[0];
            $($('.rtsp_layout1 .monitoring_vlc')[i]).attr('data-id', ids[i]);
            $($('.rtsp_layout1 .monitoring_vlc')[i]).find('.monitoring_vlc_title').text(names[i]);
            showVlc($('.rtsp_layout1 .monitoring_vlc')[i]);
            try {
                if(rtsp[i]){
                    var vlcid = vlc.playlist.add(rtsp[i]);
                    vlc.playlist.playItem(vlcid);
                }else {
                    vlc.playlist.stop()
                }
            } catch(e) {
                //TODO handle the exception
            }
            setTimeout(function () {
                $('.rtsp_layout1 .monitoring_vlc').each(function () {
                    isVlcPlay(this)
                })
            },1000)

        }
    });

    $('#layout3').click(function () {
        $('.monitoring_rtsp_content').addClass('hide');
        $('.rtsp_layout12').removeClass('hide');
        // changeVLC();

        layout = '2';
        for(var i = 0; i < $('.rtsp_layout12 .monitoring_vlc').length; i++) {
            var vlc = $($('.rtsp_layout12 .monitoring_vlc')[i]).find('object')[0];
            $($('.rtsp_layout12 .monitoring_vlc')[i]).attr('data-id', ids[i]);
            showVlc($('.rtsp_layout12 .monitoring_vlc')[i]);
            $($('.rtsp_layout12 .monitoring_vlc')[i]).find('.monitoring_vlc_title').text(names[i]);
            // vlc.style.width = '100%';
            // vlc.style.height = '100%';
            // vlc.width = '100%';
            // vlc.height = '100%';
            try {
                if(rtsp[i]){
                    var vlcid = vlc.playlist.add(rtsp[i]);
                    vlc.playlist.playItem(vlcid);
                }else {
                    vlc.playlist.stop()
                }
            } catch(e) {
                //TODO handle the exception
            }

            setTimeout(function () {
                $('.rtsp_layout12 .monitoring_vlc').each(function () {
                    isVlcPlay(this)
                })
            },1000)
        }
    });

    $('#layout4').click(function () {
        $('.monitoring_rtsp_content').addClass('hide');
        $('.rtsp_layout22').removeClass('hide');
        // changeVLC();
        layout = '3';
        for(var i = 0; i < $('.rtsp_layout22 .monitoring_vlc').length; i++) {
            var vlc = $($('.rtsp_layout22 .monitoring_vlc')[i]).find('object')[0];
            $($('.rtsp_layout22 .monitoring_vlc')[i]).attr('data-id', ids[i]);

            $($('.rtsp_layout22 .monitoring_vlc')[i]).find('.monitoring_vlc_title').text(names[i]);
            showVlc($('.rtsp_layout22 .monitoring_vlc')[i]);
            try {
                if(rtsp[i]){
                    var vlcid = vlc.playlist.add(rtsp[i]);
                    vlc.playlist.playItem(vlcid);
                }else {
                    vlc.playlist.stop()
                }
            } catch(e) {
                //TODO handle the exception
            }

            setTimeout(function () {
                $('.rtsp_layout22 .monitoring_vlc').each(function () {
                    isVlcPlay(this)
                })
            },1000)
        }
    });

    $('#layout9').click(function () {
        $('.monitoring_rtsp_content').addClass('hide');
        $('.rtsp_layout23').removeClass('hide');
        // changeVLC();
        layout = '4';
        for(var i = 0; i < $('.rtsp_layout23 .monitoring_vlc').length; i++) {
            var vlc = $($('.rtsp_layout23 .monitoring_vlc')[i]).find('object')[0];
            $($('.rtsp_layout23 .monitoring_vlc')[i]).attr('data-id', ids[i]);
            showVlc($('.rtsp_layout23 .monitoring_vlc')[i]);
            $($('.rtsp_layout23 .monitoring_vlc')[i]).find('.monitoring_vlc_title').text(names[i]);
            try {
                if(rtsp[i]){
                    var vlcid = vlc.playlist.add(rtsp[i]);
                    vlc.playlist.playItem(vlcid);
                }else {
                    vlc.playlist.stop()
                }
            } catch(e) {
                //TODO handle the exception
            }
            setTimeout(function () {
                $('.rtsp_layout23 .monitoring_vlc').each(function () {
                    isVlcPlay(this)
                })
            },1000)
        }
    });


    //点击摄像头分组出现摄像头下拉
    $('.camera_content').on('click', '.camera_change_group_head', function() {
        var parentNode = $(this).parent();
        var target = parentNode.find('ul');
        if(target.hasClass('hide')) {
            $('.camera_content ul').addClass('hide');
            target.removeClass('hide');
        } else {
            target.addClass('hide')
        }
    });
// 关闭
    $('#videoSetting_close').click(function () {
        window.history.go(-1);
    });

//重置
    $("#videoSetting_reset").click(function(){
        $('.monitoring_rtsp_content:not(.hide)').find('.monitoring_vlc').each(function () {
            $(this).attr('data-id', "");
            // $(this).append("<div class='filter' style='width:100%; height:100%'></div>");
            var playlist = $(this).find("object")[0].playlist;
            if(playlist){
                var isPlay = playlist.isPlaying;
                if(isPlay){
                    playlist.stop();
                }
            }
            
       });
        
        $(".monitoring_vlc_title").text("无");
    });

// 保存
    $('#videoSetting_save').click(function () {
        var params = {
            solution : layout,
            cameras : []
        }
       $('.monitoring_rtsp_content:not(.hide)').find('.monitoring_vlc').each(function () {
            var src_id = $(this).attr('data-id');
            if(src_id){
                params.cameras.push(src_id);
            }
       });
       params.cameras = JSON.stringify(params.cameras);

        $.post('/deepface/camerasolution', params, function (data) {
            var code = data.code;
            var msg = data.message;
            if(code == 0 && msg =="success"){
                window.location.href = '/corsface/index';
            }else{
                alert("视频方案保存未成功，请稍后重试");
            }
        });
    });

    var rangArr = [];
    var box;
    //	拖动摄像头放入vlc中
    $('.camera_content').on('mousedown', 'li', function(ev) {
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
            }
        })
        for(var i = 0; i < box.find('.monitoring_vlc').length; i++) {
            var offset = $(box.find('.monitoring_vlc')[i]).offset()
            var rang = {
                "top": offset.top,
                "left": offset.left,
                "bottom": offset.top + $(box.find('.monitoring_vlc')[i]).height(),
                "right": offset.left + $(box.find('.monitoring_vlc')[i]).width()
            }
            rangArr.push(rang)
        }
        $(window).on('mousemove', function(ev) {
            ev = ev || window.event
            if($('#drag').length) {
                ev.preventDefault()
                ev.returnValue = false
                $('#drag').css({
                    'left': ev.clientX + 'px',
                    'top': ev.clientY + 'px'
                })

            }
        })

        $(window).on('mouseup', function(ev) {
            ev = ev || event
            if($('#drag').length) {
                var x = ev.clientX,
                    y = ev.clientY;
                for(var i = 0; i < rangArr.length; i++) {
                    if(ev.clientX >= rangArr[i].left && ev.clientX <= rangArr[i].right && y >= rangArr[i].top && y <= rangArr[i].bottom) {
                        var vlc = $(box.find('.monitoring_vlc')[i]).find('object')[0];
                        $(box.find('.monitoring_vlc')[i]).find('.monitoring_vlc_title').text($('#drag').attr('data-name'));
                        $(box.find('.monitoring_vlc')[i]).attr('data-id', $('#drag').attr('data-id'));
                        showVlc(box.find('.monitoring_vlc')[i]);
                        targetV = box.find('.monitoring_vlc')[i];
                        try {
                            if($('#drag').attr('data-url')){
                                var vlcid = vlc.playlist.add($('#drag').attr('data-url'));
                                vlc.playlist.playItem(vlcid);
                            }else {
                                vlc.playlist.stop()
                            }
                        } catch(e) {
                            //TODO handle the exception
                        }
                        rangArr = [];
                        setTimeout(function () {
                            isVlcPlay(targetV)
                        },1000);
                        break;
                    }
                }
                $('#drag').remove()

            }
        })

    });

    function getCamerali(data) {
        data = data.data;
        var grouphtml = '';
        for(var i = 0; i < data.length; i++) {
            var lihtml = '',count=0,isOpen=true;
            if(data[i].cameras) {
                var child = data[i].cameras;
                for(var j = 0; j < child.length; j++) {
                    var state = '';
                    // if(child[j].comara.state=='0'){
                    //     state = 'noplay';
                    // }
                    lihtml += '<li class="'+ state +'" id="'+ child[j].src_id +'" data-url="' + child[j].capture_url + '" data-name="' + child[j].camera_name + '" title="'+ child[j].capture_url +'">' + child[j].camera_name + '<span class="camera_person">' + "" + '</span><span class="camera_alarm">' + "" + '</span></li>';
                    if(rtsp.length <= 9) {
                        rtsp.push('rtsp://' + child[j].capture_url);
                        names.push(child[j].camera_name);
                        ids.push(child[j].src_id);
                    }
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

            var group = '<div class="camera_change_group"><div class="camera_change_group_head"><em class="cameraHead"></em>' + data[i].group_name + span + '</div>' + lihtml + '</div>';

            grouphtml += group;
        }
        $('.camera_change>*').remove();
        $('.camera_change').append(grouphtml);
        $('.camera_change').on('click', '.camera_change_group_head', function() {
            var url = $(this).attr('data-url');
            $('#iframe').attr('src', url);
        })

        $('.camera_change').on('click', 'li', function() {
            var url = $(this).attr('data-url');
            $('#iframe').attr('src', url);
            $('.camera_change li').removeClass('active');
            $(this).addClass('active')
        })
        $.get('/deepface/camerasolution?&time='+time,function (data) {
            var code = data.code;
            var msg = data.message;
            if(code == 0 && msg =="success"){
                CreateVLC(data.data);
            }
            
        },'json');
    }

    function CreateVLC(data) {
        var Class = '.rtsp_layout1';
        switch (data.solution){
            case 1:
                layout = 1;
                $('.monitoring_rtsp_content').addClass('hide');
                $(Class).removeClass('hide');
                break;
            case 2:
                layout = 2;
                Class = '.rtsp_layout12';
                $('.monitoring_rtsp_content').addClass('hide');
                $(Class).removeClass('hide');
                break;
            case 3:
                layout = 3;
                Class = '.rtsp_layout22';
                $('.monitoring_rtsp_content').addClass('hide');
                $(Class).removeClass('hide');
                break;
            case 4:
                layout = 4;
                $('#layout9').click();
                Class = '.rtsp_layout23';
                $('.monitoring_rtsp_content').addClass('hide');
                $(Class).removeClass('hide');
                break;
            default:
                break;
        }
        setTimeout(function () {
            data = data.cameras;
            for(var j=0;j<data.length;j++){
                var vlc = $($(Class +' .monitoring_vlc')[j]).find('object')[0];
                $($(Class +' .monitoring_vlc')[j]).attr('data-id',data[j].src_id);
                $($(Class +' .monitoring_vlc')[j]).find('.monitoring_vlc_title').text(data[j].camera_name);
                try {
                    if(data[j].display_url){
                        var vlcid = vlc.playlist.add(data[j].display_url);
                        vlc.playlist.playItem(vlcid);
                        console.log(j+":"+new Date())
                    }else {
                        vlc.playlist.stop()
                    }
                } catch(e) {
                    //TODO handle the exception
                }
                setTimeout(function () {
                    $(Class +' .monitoring_vlc').each(function () {
                        isVlcPlay(this);
                    })
                },1000)
            }
        },100)


    };
});

