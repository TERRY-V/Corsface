var time = new Date();
time = time.getTime();
//图片等比例缩放
function DrawImage(ImgD, FitWidth, FitHeight) {
    var image = new Image();
    image.src = ImgD.src;
    if(image.width > 0 && image.height > 0) {
        if(image.width / image.height >= FitWidth / FitHeight) {
            if(image.width > FitWidth) {
                ImgD.width = FitWidth;
                ImgD.height = (image.height * FitWidth) / image.width;
            } else {
                ImgD.width = image.width;
                ImgD.height = image.height;
            }
        } else {
            if(image.height > FitHeight) {
                ImgD.height = FitHeight;
                ImgD.width = (image.width * FitHeight) / image.height;
            } else {
                ImgD.width = image.width;
                ImgD.height = image.height;
            }
        }
    }
}

// 初始化摄像头列表
function getCamerali(data) {
    var rtsp = [];
    var names = [];
    var grouphtml = '';
    var imgSize = {};
    for(var i = 0; i < data.length; i++) {
        var lihtml = '';
        if(data[i].group_name) {
            var child = data[i].cam;
            for(var j = 0; j < child.length; j++) {
                var text = child[j].camera_name?child[j].camera_name:'未知摄像头';
                if(text.length>15){
                    text = text.substr(0,12)+'...'
                }
                lihtml += '<li data-url="' + child[j].id +
                    '" data-name="' + child[j].camera_name +
                    '" data-id="' + child[j].id + '"title="'+ child[j].camera_name +'&nbsp;&nbsp;'+ child[j].id  +'">' +
                    text + '</li>';
                if(rtsp.length <= 4) {
                    rtsp.push(child[j].id);
                }
                if(names.length <= 4) {
                    names.push(child[j].id);
                }
            }
        }
        var span = '<span></span>'
        if(grouphtml) {
            lihtml = '<ul class="hide">' + lihtml + '</ul>';
        } else {
            lihtml = '<ul>' + lihtml + '</ul>';
            span = '<span class="cl"></span>'
        }

        var group = '<div class="camera_change_group"><div class="camera_change_group_head">' +
            data[i].group_name + span + '</div>' + lihtml + '</div>';

        grouphtml += group;
    }
    for(var i = 0; i < $('.monitoring_vlc').length; i++) {
        var vlc = $($('.monitoring_vlc')[i]).find('object')[0];
        $($('.monitoring_vlc')[i]).find('.monitoring_vlc_title').text(names[i]);
        try {
            var vlcid = vlc.playlist.add(rtsp[i]);
            vlc.playlist.playItem(vlcid);
        } catch(e) {
            // TODO handle the exception
        }
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
}

$(function() {
    // 获取地图id
    var mcid = Util.GetParam("MCID");
    console.log(mcid);
    // 通过地图id获取地图信息
    $.get('/system/mappoint?id=' + mcid+'&time='+time,
        function(res) {
            var mapPath = Util.GetParam("FPath");
                    $('#map_img').attr('src', mapPath);
            var data = res.data;
            var mapPath = '';
            for(var i = 0; i < data.length; i++) {
                var marker = data[i];
                   
                if(marker) {
                    var markerI = '<div class="marker_icon" data-location="' +
                        marker.point_left + ',' +
                        marker.point_top + '" id="' +
                        marker.c_id + '" style="left: calc(' +
                        marker.point_left * 100 + '% - 10px);top: calc(' +
                        marker.point_top * 100 + '% - 40px);">' +
                        marker.camera_name + '</div>';
                    $('.monitoring_rtsp_photo').append(markerI);
                }
            }
        });
    // 初始化摄像头列表
    $.get('/system/mapcamera?TagName=getCameraTree&time='+time, function(data) {
        getCamerali(data.data)
    });
    try {
        var mcid = Util.GetParam("MCID");

    } catch(e) {
        var mcid = 0;
    }

    // 点击摄像头分组出现摄像头下拉
    $('.camera_content').on('click', '.camera_change_group_head', function() {
        var parentNode = $(this).parent();
        var target = parentNode.find('ul');
        target.toggleClass('hide');
        $(this).find('span').toggleClass('cl');
    });
    // 点击图标出现场景图片
    $('.warning_content').on('click', '.warning_info_content_surImg',
        function() {
            var parent = $(this).parent();
            parent.find('.warning_surImg').toggleClass('hide');
        });
    // 调整坐标点位置
    var that;
    var markerFlag = false;
    var Photoflag = false;

    $('.monitoring_rtsp_photo').on(
        'mousedown',
        '.marker_icon',
        function(ev) {
            ev = ev || window.event;
            ev.preventDefault();
            ev.returnValue = false;
            if(3 == ev.which) {
                return;
            }
            console.log(this);
            that = this;
            markerFlag = true;
            var offset = $('#map_img').offset();
            var rang = {
                "top": offset.top,
                "left": offset.left,
                "bottom": offset.top + $('#map_img').height(),
                "right": offset.left + $('#map_img').width()
            };
            var offsetWrap = $('.monitoring_rtsp_photo').offset();
            var rangWrap = {
                "top": offsetWrap.top,
                "left": offsetWrap.left,
                "bottom": offsetWrap.top +
                    $('.monitoring_rtsp_photo').height(),
                "right": offsetWrap.left +
                    $('.monitoring_rtsp_photo').width()
            };
            $(window).on(
                'mousemove',
                function(ev) {
                    ev = ev || window.event;
                    ev.preventDefault();
                    ev.returnValue = false;
                    if(markerFlag && !Photoflag) {
                        var x = ev.clientX,
                            y = ev.clientY;
                        if(y >= rang.top && y <= rang.bottom &&
                            x >= rang.left && x <= rang.right) {
                            var left = (x - rangWrap.left) /
                                $('#map_img').width();
                            var top = (y - rangWrap.top) /
                                $('#map_img').height();
                            $(that).css({
                                "left": "calc(" + left * 100 +
                                    "% - 10px)",
                                "top": "calc(" + top * 100 +
                                    "% - 40px)"
                            });
                        }
                    }
                });
            $(window)
                .on(
                    'mouseup',
                    function(ev) {
                        ev = ev || event;
                        if(markerFlag && !Photoflag) {
                            ev.preventDefault();
                            ev.returnValue = false;
                            var x = ev.clientX,
                                y = ev.clientY;
                            if(y >= rang.top && y <= rang.bottom &&
                                x >= rang.left &&
                                x <= rang.right) {
                                var left = (x - rangWrap.left) /
                                    $('#map_img').width();
                                var top = (y - rangWrap.top) /
                                    $('#map_img').height();
                                x = (x - rang.left) /
                                    $('#map_img').width();
                                y = (y - rang.top) /
                                    $('#map_img').height();
                                $(that).css({
                                    "left": "calc(" + left *
                                        100 +
                                        "% - 10px)",
                                    "top": "calc(" + top *
                                        100 +
                                        "% - 40px)"
                                });
                                $(that).attr('data-location',
                                    x + ',' + y);
                            }
                            markerFlag = false;
                            $(window).off('mousemove');
                            $(window).off('mouseup');
                        }
                    })
        });

    // 拖动摄像头放入地图中
    var flag = false;
    $('.camera_content')
        .on(
            'mousedown',
            'li',
            function(ev) {
                ev = ev || window.event;
                ev.preventDefault();
                ev.returnValue = false;
                flag = true;
                var text = $(this).text();
                var url = $(this).attr('data-url');
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                text = '<span id="drag" data-name="' + name +
                    '" data-id="' + id + '" data-url="' + url +
                    '" style="position:absolute;top:' +
                    ev.clientY + 'px;left:' + ev.clientX +
                    'px;">' + text + '</span>';
                $('.main').append(text);

                var offset = $('#map_img').offset();
                var rang = {
                    "top": offset.top,
                    "left": offset.left,
                    "bottom": offset.top + $('#map_img').height(),
                    "right": offset.left + $('#map_img').width()
                };
                var offsetWrap = $('.monitoring_rtsp_photo').offset();
                var rangWrap = {
                    "top": offsetWrap.top,
                    "left": offsetWrap.left,
                    "bottom": offsetWrap.top +
                        $('.monitoring_rtsp_photo').height(),
                    "right": offsetWrap.left +
                        $('.monitoring_rtsp_photo').width()
                }
                $(window).on('mousemove', function(ev) {
                    ev = ev || window.event;
                    ev.preventDefault();
                    ev.returnValue = false;
                    if($('#drag').length) {

                        $('#drag').css({
                            'left': ev.clientX + 'px',
                            'top': ev.clientY + 'px'
                        });
                        flag = false;
                    }
                });
                $(window).on('mouseup', function(ev) {
                        ev = ev || event;
                        if($('#drag').length) {
                            var x = ev.clientX,
                                y = ev.clientY,
                                id = $('#drag').attr('data-id'),
                                name = $('#drag').attr('data-name');
                            if(y >= rang.top &&
                                y <= rang.bottom &&
                                x >= rang.left &&
                                x <= rang.right) {
                                var left = (x - rangWrap.left) / $('#map_img').width();
                                var top = (y - rangWrap.top) / $('#map_img').height();
                                x = (x - rang.left) / $('#map_img').width();
                                y = (y - rang.top) / $('#map_img').height();
                                console.log('x=' + x + ' y=' + y);
                                var marker = '<div class="marker_icon" data-location="' +
                                    x +
                                    ',' +
                                    y +
                                    '" id="' +
                                    id +
                                    '" style="left: calc(' +
                                    left *
                                    100 +
                                    '% - 10px);top: calc(' +
                                    top *
                                    100 +
                                    '% - 40px);">' +
                                    name + '</div>';
                                $('#' + id).remove();
                                $('.monitoring_rtsp_photo')
                                    .append(marker);
                            }
                            $('#drag').remove();
                            $(window).off('mousemove');
                            $(window).off('mouseup');
                        }
                    })
            });
    // 地图拖动
    var transformX = 0;
    var transformY = 0;
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
    // 消除浏览器默认的右键点击事件
    document.oncontextmenu = function() {
        return false;
    };
    // 右键点击标点出现删除等操作
    $('.monitoring_rtsp_photo').on('mousedown', '.marker_icon', function(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        ev.returnValue = false;
        if(3 == ev.which) {
            $(this).append('<div class="delete">删除</div>')
        }
    });
    //删除标点
    $('.monitoring_rtsp_photo').on('mousedown', '.delete', function(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        ev.returnValue = false;
        console.log(1);
        var parent = $(this).parent();
        parent.remove()
    });
    //保存地图
    $('#save_map').click(function() {
        var info = [];
        var params = {
            'map_id': mcid,
            'info': []
        };
        $('.marker_icon').each(function() {
            var pointinfo = $(this).attr('data-location');
            alert(pointinfo.split(","));
            var camera = {
            };
            camera.c_id=$(this).attr('id');
            camera.map_id=mcid;
              camera.point_left=pointinfo.split(",")[0];
              camera.point_top=pointinfo.split(",")[1];
            info.push(camera);
        });
        params.info=JSON.stringify(info);
        console.log(params);
        /*
         * $.post('mapChoose.action?operation=save_map',params,function (data) { })
         */
        $.post("/system/mappointsave",params, function(data) {

            window.location.href = "/corsface/mapshow";
        });
    });
    // 清空地图
    $('#clear_map').click(function() {
        $('.marker_icon').remove();
    });
    // 地图放大缩小
    if(document.addEventListener&&$('#map_img')[0]){
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
            if($('#map_img').width()>=imgSize.width){
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

    $('#map_img').load(function () {
        imgSize = GetImgSize('map_img');
        console.log(imgSize);
        var width = imgSize.width*0.5;
        if(width < $('.monitoring_rtsp').width()){
            width = $('.monitoring_rtsp').width()
        }
        console.log(width);
        console.log(this);
        $(this).css('width',width+'px')
    });

    // 获取地图的原始大小
    function GetImgSize(id) {
        var src = $('#'+id).attr('src');
        var image = new Image();
        image.src = src;
        var size = {};
        size.width = image.width;
        size.height = image.height;
        console.log(image);
        console.log(size);

        return size
    }
})