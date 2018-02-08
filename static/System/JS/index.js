/**
 * Created by zhaoj on 2017/10/26.
 */
jQuery(function($) {
    // 初始化摄像头列表
    $.get('alarmRecordExecuteEx.action?TagName=getCameraTree', function(data) {
        getCamerali(data)
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
        var left = nowLeft + 400;
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
    $('.realtime_content_right').click(function() {
        if(dragFlag) {
            return;
        }
        dragFlag = true;
        $('.realtime_content_left').addClass('leftIcon');
        var width = $('.realtime_content').width();
        var left = nowLeft - 400;
        if(left <= -(2612 - width)) {
            left = -(2612 - width);
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

    //	摄像头列表切换列表与地图模式
    $('.camera_header span').click(function() {
        window.location.href = '/CorsFace/Business/Map/Html/Map.html'
    });
    $.ajax({
        url: "/CorsFace/frameAction.action",
        data: {
            "TagName": "GetInitFace",
            "Num": 15
        },
        async: true,
        type: "POST",
        success: function(data) {
            initRealTime(data)
        }
    })
    $.ajax({
        url: "/CorsFace/frameAction.action",
        data: {
            "TagName": "GetInitAlarm",
            "Num": 5
        },
        async: true,
        type: "POST",
        success: function(data) {
            initWarning(data);
        }
    })
    //点击摄像头分组出现摄像头下拉
    $('.camera_content').on('click', '.camera_change_group_head', function() {
        var parentNode = $(this).parent();
        var target = parentNode.find('ul');
        target.toggleClass('hide');
        $(this).find('span').toggleClass('cl');
    })
    //	点击图标出现场景图片
    $('.warning_content').on('click', '.warning_info_content_surImg', function() {
        var parent = $(this).parent();
        parent.find('.warning_surImg').toggleClass('hide');
    })

    //	拖动摄像头放入vlc中
    $('.camera_content').on('mousedown', 'li', function(ev) {
        ev = ev || window.event
        var text = $(this).text();
        var url = $(this).attr('data-url');
        var name = $(this).attr('data-name');
        text = '<span id="drag" data-name="' + name + '" data-url="' + url + '" style="position:absolute;top:' + ev.clientY + 'px;left:' + ev.clientX + 'px;">' + text + '</span>'
        $('.main').append(text);
        var rangArr = []
        for(var i = 0; i < $('.monitoring_vlc').length; i++) {
            var offset = $($('.monitoring_vlc')[i]).offset()
            var rang = {
                "top": offset.top,
                "left": offset.left,
                "bottom": offset.top + $($('.monitoring_vlc')[i]).height(),
                "right": offset.left + $($('.monitoring_vlc')[i]).width()
            }
            rangArr.push(rang)
        }

        $(window).on('mousemove', function(ev) {
            ev = ev || window.event
            if($('#drag').length) {
                ev.preventDefault()
                ev.returnValue = false;
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
                        var vlc = $($('.monitoring_vlc')[i]).find('object')[0];
                        $($('.monitoring_vlc')[i]).find('.monitoring_vlc_title').text(name);
                        try {
                            var vlcid = vlc.playlist.add($('#drag').attr('data-url'));
                            vlc.playlist.playItem(vlcid);
                        } catch(e) {
                            //TODO handle the exception
                        }
                    }
                }
                $('#drag').remove()

            }
        })

    });
    //老版数据推送
    function aa() {
        //	将推送的数据进行处理
        //	function showData(data) {
        //		console.log(data);
        //		var temp = data;
        //		while(temp.indexOf("}{") > 0) {
        //
        //			sdata = temp.substr(0, temp.indexOf("}{") + 1);
        //			showDataImg(sdata);
        //			temp = temp.substr(temp.indexOf("}{") + 1);
        //		}
        //		showDataImg(temp);
        //	}

        //	function showDataImg(sdata) {
        //		var data = eval("(" + sdata + ")");
        //		var face = data.Person;
        //		var track = data.Track;
        //		var alarm = data.AlermInfo;
        //		var sex = track.Sex ? '女' : '男';
        //		var glass = track.Glasses == 2 ? '有眼镜' : '无眼镜';
        //		var personType = '';
        //		var id = data.UUID;
        //
        //		if(data.Alerm == 1) {
        //
        //			playMp3(alarm.Music);
        //			var facePic = {
        //				"TagName": "GetFaceImages",
        //				"IP": track.IP,
        //				"UUID": id
        //			}
        //			var surImg = '';
        //			$.ajax({
        //				url: "/CorsFace/faceTrack.action",
        //				data: facePic,
        //				async: false,
        //				type: "POST",
        //				success: function(data) {
        //					var data = eval(data);
        //					surImg = data[0];
        //				}
        //			});
        //			var alarmHtml = '<div class="warning_info" data-id="' + face.UUID + '"><div class="warning_info_content">' +
        //				'<div class="warning_info_content_left"><div class="warning_info_content_name alarmIcon" style="background-image: url(' + alarm.ICON + ');">' + alarm.Level +
        //				'</div><div class="warning_info_content_name">' + track.CAName +
        //				'</div><div class="warning_info_content_time" style="font-size: 12px;">' + track.CTime +
        //				'</div></div><div class="warning_info_content_right"><div class="warning_info_img"><img src="data:image/jpeg;base64,' + surImg +
        //				'" /></div><div class="warning_info_content_person"><div class="warning_info_content_img"><img src="data:image/jpeg;base64,' + data.FaceImg +
        //				'" /></div><div class="warning_info_content_name">' + face.Name +
        //				'</div><div class="warning_info_content_name">' + face.Sort +
        //				'</div></div></div></div></div>'
        //			//判断报警模块数量，不能超过一定数量
        //			if($('.warning_info').length > 4) {
        //				$(".warning_info:last").remove();
        //				$('.warning_content').prepend(alarmHtml);
        //			} else {
        //				$('.warning_content').prepend(alarmHtml);
        //			}
        //
        //		} else {
        //			//非报警根据uuid将实时抓拍中的模块处理状态改变
        //			if(face.Matchs > 0.5) {
        //				//				$('.realtime_info').each(function() {
        //				//					if($(this).attr('data-id') == id) {
        //				//						$(this).find('.face_icon').css('background-image', 'url(/CorsFace/Themes/Images/ICON/facetrackstatus2.png)');
        //				//					}
        //				//				})
        //				var iconNum = '2';
        //
        //			} else {
        //				//				$('.realtime_info').each(function() {
        //				//					if($(this).attr('data-id') == id) {
        //				//						$(this).find('.face_icon').css('background-image', 'url(/CorsFace/Themes/Images/ICON/facetrackstatus3.png)');
        //				//					}
        //				//				})
        //				var iconNum = '3';
        //
        //			}
        //			var faceHtml = '<div class="realtime_info" data-id="' + face.UUID + '"><div class="face_time">' + face.PTag +
        //				'</div><div class="face_location">' + face.Sort +
        //				'</div><div class="face_image"><img src="data:image/jpeg;base64,' + data.FaceImg +
        //				'"/></div><div class="face_location">' + track.CAName +
        //				'</div><div class="face_location">' + track.CTime +
        //				'</div><div class="face_icon faceIcon1" style="background-image: url(/CorsFace/Themes/Images/ICON/facetrackstatus' + iconNum + '.png);"></div></div>';
        //			if($('.realtime_info').length > 12) {
        //				$('.realtime_info:last').remove();
        //				$('.realtime_content_Rwrap').prepend(faceHtml);
        //			} else {
        //				$('.realtime_content_Rwrap').prepend(faceHtml);
        //			}
        //
        //		}
        //
        //	}
    }

    $('.realtime_content').on('dblclick', '.realtime_info', function() {
        var url = '/CorsFace/Business/FaceInfo/Html/V31_FaceInfo.html?UUID=' + $(this).attr('id');
        //iframe窗
        layer.open({
            type: 2,
            title: '人脸详情',
            shade: [0],
            area: ['660px', '800px'],
            title: false, //不显示标题
            //			time: 2000, //2秒后自动关闭
            anim: 2,
            content: [url] //iframe的url，no代表不显示滚动条
        });
    })
    $('.warning_content').on('dblclick', '.warning_info', function() {
        var url = '/CorsFace/Business/Alarm/Html/V31_AlarmInfo.html?UUID=' + $(this).attr('id');
        //iframe窗
        layer.open({
            type: 2,
            title: '人脸详情',
            title: false, //不显示标题
            shade: [0],
            area: ['660px', '800px'],
            //			time: 2000, //2秒后自动关闭
            anim: 2,
            content: [url] //iframe的url，no代表不显示滚动条
        });
    })
    //{Type:'P',UUID:'ca56a623-a4a4-43db-b1ab-6b5e381dbc48',IP:'192.168.1.142',Person:{PersonId:'8cf42be9-5162-425f-a1c1-23b383924383',Matchs:0.7781102061271667,Percent:0.9791588187217712,N:0}}
    function initRealTime(data) {
        console.log('initRealTime')

        var data = JSON.parse(data);
        var faceHtml = '';

        for(var i = 0; i < data.length; i++) {
            var face = data[i];
            if(face.Matchs > .5) {
                var iconNum = '2';
            } else if(face.Matchs < .1) {
                var iconNum = '3';
            } else {
                var iconNum = '1';
            }
            var personT = '&nbsp;';
            var age = face.GAge;
            var sex = face.GSex;
            switch(sex) {
                case 0:
                    if(age <= 20) {
                        personT = '青春男孩';
                    } else if(age <= 35) {
                        personT = '年轻有为';
                    } else if(age < 70) {
                        personT = '成熟大叔';
                    } else {
                        personT = '暮年老人';
                    }
                    break;
                case 1:
                    if(age <= 20) {
                        personT = '漂亮女孩';
                    } else if(age <= 35) {
                        personT = '靓丽少女';
                    } else if(age < 70) {
                        personT = '中年妇女';
                    } else {
                        personT = '暮年老人';
                    }
                    break;
                default:
                    break;
            }
            var ptag = face.PTag ? face.PTag : '未知身份';
            var pDB = face.PSName ? face.PSName : personT;
            var cnode = face.CANote ? face.CANote : '&nbsp;';
            var faceTxt = '<div class="realtime_info" id="' + face.UUID + '"><div class="face_ptag">' + ptag +
                '</div><div class="face_sort">' + pDB +
                '</div><div class="face_image"><img src="data:image/jpeg;base64,' + face.imgBase64 +
                '"/></div><div class="face_location">' + cnode +
                '</div><div class="face_location">' + face.CTime +
                '</div><div class="face_icon faceIcon1" style="background-image: url(/CorsFace/Themes/Images/ICON/facetrackstatus' + iconNum + '.png);"></div></div>';
            faceHtml += faceTxt;
        }
        $('.realtime_content_Rwrap').empty();
        $('.realtime_content_Rwrap').prepend(faceHtml);
    }

    function initWarning(data) {
        console.log('initWarning')
        var data = eval(data);
        var alarmHtml = '';
        for(var i = 0; i < data.length; i++) {
            var alarm = data[i];

            var alarmTxt = '<div class="warning_info" id="' + alarm.UUID + '"><div class="warning_info_content">' +
                '<div class="warning_info_content_left"><div class="warning_info_content_img"><img src="/CorsFace' + alarm.facImg + '" /></div>' +
                '</div><div class="warning_info_content_right">' +
                '<div class="warning_info_content_alarmIcon" style="background-image: url(/CorsFace' + alarm.DCode + ');"></div>' +
                '<div class="warning_info_content_surImg"></div>' +
                '<div class="warning_surImg hide"><img src="/CorsFace' + alarm.surImg + '" />' +
                '</div></div><div class="warning_info_content_mid"><div class="warning_info_content_name">' + alarm.Name +
                '</div><div class="warning_info_content_location">' + alarm.CAName +
                '</div><div class="warning_info_content_time" style="font-size: 12px;">' + alarm.ATime +
                '</div></div></div></div>'
            alarmHtml += alarmTxt;
        }
        $('.warning_content').empty();
        $('.warning_content').prepend(alarmHtml);
    }

});

//初始化摄像头列表
function getCamerali(data) {
    var data = JSON.parse(data);
    var rtsp = [];
    var names = [];
    var grouphtml = '';
    for(var i = 0; i < data.length; i++) {
        var lihtml = '';

        if(data[i].childNode) {
            var child = data[i].childNode
            for(var j = 0; j < child.length; j++) {
                lihtml += '<li data-url="rtsp://' + child[j].comara.ipAddress + '" data-name="' + child[j].comara.CAName + '">' + child[j].comara.CAName + '<span class="camera_person">' + child[j].matchTotal + '</span><span class="camera_alarm">' + child[j].alarmTotal + '</span></li>'
                if(rtsp.length <= 4) {
                    rtsp.push('rtsp://' + child[j].comara.ipAddress);
                }
                if(names.length <= 4) {
                    names.push(child[j].comara.CAName);
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

        var group = '<div class="camera_change_group"><div class="camera_change_group_head">' + data[i].MUName + span + '</div>' + lihtml + '</div>';

        grouphtml += group;
    }
    for(var i = 0; i < $('.monitoring_vlc').length; i++) {
        var vlc = $($('.monitoring_vlc')[i]).find('object')[0];
        $($('.monitoring_vlc')[i]).find('.monitoring_vlc_title').text(names[i]);
        try {
            var vlcid = vlc.playlist.add(rtsp[i]);
            vlc.playlist.playItem(vlcid);
        } catch(e) {
            //TODO handle the exception
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
//使用Pushlet获取推送的消息
try {
    		Listener(handle);
/*    PL._init();
    PL.joinListen('PushletBroad');

    function onData(event) {
        var d = event.get("key");
        try {
            var data = eval("(" + d + ")");
            handle(data);
            $.get('alarmRecordExecuteEx.action?TagName=getCameraTree', function(data) {
                getCamerali(data)
            })
        } catch(e) {
            console.log(d);
        }
    }*/

} catch(e) {
    //TODO handle the exception
    console.log(e)
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
            TrackData.push(trackdata)
            TrackData.shift();
        } else {
            TrackData.push(trackdata)
        }
        var personT = '&nbsp;';
        var age = data.Track.Age;
        var sex = data.Track.Sex;
        switch(sex) {
            case 0:
                if(age <= 20) {
                    personT = '青春男孩';
                } else if(age <= 35) {
                    personT = '年轻有为';
                } else if(age < 70) {
                    personT = '成熟大叔';
                } else {
                    personT = '暮年老人';
                }
                break;
            case 1:
                if(age <= 20) {
                    personT = '漂亮女孩';
                } else if(age <= 35) {
                    personT = '靓丽少女';
                } else if(age < 70) {
                    personT = '中年妇女';
                } else {
                    personT = '暮年老人';
                }
                break;
            default:
                break;
        }

        var faceHtml = '<div class="realtime_info" id="' + data.UUID + '"><div class="face_ptag">' + '未知身份' +
            '</div><div class="face_sort">' + personT +
            '</div><div class="face_image"><img src="data:image/jpeg;base64,' + data.Track.imgBase64 +
            '"/></div><div class="face_location">' + data.Track.CAName +
            '</div><div class="face_location">' + data.Track.CTime +
            '</div><div class="face_icon faceIcon1" style="background-image: url(/CorsFace/Themes/Images/ICON/facetrackstatus3.png);"></div></div>';

        $('.realtime_info:last').remove();
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
            $.ajax({
                url: "/CorsFace/faceTrack.action",
                data: facePic,
                async: false,
                type: "POST",
                success: function(ret) {
                    var data = eval(ret);
                    data = data[0];
                    imgs = data.FImag;
                    time = data.CTime;
                    cname = data.CName
                }
            });

            var alarm = data.AlermInfo;
            playMp3(alarm.Music);

            //			var alarmHtml = '<div class="warning_info" id="' + data.UUID + '"><div class="warning_info_content">' +
            //				'<div class="warning_info_content_left"><div class="warning_info_content_name alarmIcon" style="background-image: url(/CorsFace/' + alarm.ICON + ');">' + alarm.Level +
            //				'</div><div class="warning_info_content_name">' + cname +
            //				'</div><div class="warning_info_content_time" style="font-size: 12px;">' + time +
            //				'</div></div><div class="warning_info_content_right"><div class="warning_info_img"><img src="data:image/jpeg;base64,' + data.SurImg +
            //				'" /></div><div class="warning_info_content_person"><div class="warning_info_content_img"><img src="/CorsFace/' + imgs +
            //				'" /></div><div class="warning_info_content_name">' + face.Name +
            //				'</div><div class="warning_info_content_name">' + face.Sort +
            //				'</div></div></div></div></div>';
            var alarmHtml = '<div class="warning_info" id="' + alarm.UUID + '"><div class="warning_info_content">' +
                '<div class="warning_info_content_left"><div class="warning_info_content_img"><img src="/CorsFace' + imgs + '" /></div>' +
                '</div><div class="warning_info_content_right">' +
                '<div class="warning_info_content_alarmIcon" style="background-image: url(/CorsFace' + alarm.ICON + ');"></div>' +
                '<div class="warning_info_content_surImg"></div>' +
                '<div class="warning_surImg hide"><img src="data:image/jpeg;base64,' + data.SurImg + '" />' +
                '</div></div><div class="warning_info_content_mid"><div class="warning_info_content_name">' + face.Name +
                '</div><div class="warning_info_content_location">' + cname +
                '</div><div class="warning_info_content_time" style="font-size: 12px;">' + time +
                '</div></div></div></div>';
            //判断报警模块数量，不能超过一定数量

            $(".warning_info:last").remove();
            $('.warning_content').prepend(alarmHtml);

        } //else {
        //
        // 			识别
        if(face.Matchs > .5) {
            var iconNum = '2';
        } else if(face.Matchs < .2) {
            return;
        } else {
            var iconNum = '1';
        }
        if(!face.Sort || face.Sort == 'null') {
            var sort = '未分组'
        } else {
            var sort = face.Sort
        }
        if($('#' + id).length > 0) {
            $('#' + id).find('.face_ptag').text(face.PTag);
            $('#' + id).find('.face_sort').text(sort);
            $('#' + id).find('.face_icon').css('background-image', 'url(/CorsFace/Themes/Images/ICON/facetrackstatus' + iconNum + '.png)');
        }
    }
}

function playMp3(url) {
    var audio = '<embed id="mp3" autoplay="true" src="/CorsFace/' + url + '"  width="0" height="0" />';
    $('body').append(audio);
    setTimeout(function() {
        $('#mp3').remove();
    }, 1000)
}