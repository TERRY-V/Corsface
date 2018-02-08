re_id = '';
Init_Device = function () {
    AutoGCHeight();
    $(window).resize(function () {
        AutoGCHeight();
    });
    jQuery
        .get(
            "/deepface/devicelist",
            {
                TagName: 'getDeviceData'
            },
            function (data) {
                if (data.code != 0) {
                    alert(data.message);
                    return false;
                }
                var data = data.data;
                var div_ify = jQuery(".identifys");
                div_ify.html('');
                var div_cjd = jQuery(".acquisitions");
                div_cjd.html('');
                var div = jQuery(".camera");
                div.html('');
                // 识别端
                getcapture(data.recognize[0].id);
                for (k in data.recognize) {
                    var id = data.recognize[k].id;
                    var name = data.recognize[k].server_name;
                    var state = data.recognize[k].is_enabled;
                    var ip = data.recognize[k].server_ip?data.recognize[k].server_ip:'192.168.1.1';
                    var a = '';
                    if (state == 1) {// 0-正常 1-禁用
                        a = "<div class='hang' ><img src=\"/static/Themes/Images/ICON/shibie1.png\" "
                            + "onclick='getcapture(" + id + ")'><br><br>"
                            + "<span>"
                            + name
                            + "</span>&nbsp&nbsp&nbsp"
                            + "<br><span>"
                            + ip
                            + "</span>&nbsp&nbsp"
                            + "<br><img src=\"/static/Themes/Images/Other/start_state.png\" style=\"width: 50px; height: 20px;\" onclick='startreg("+id+",1)'></div>";
                    }
                    if (state == 0) {
                        a = "<div class='hang'><img src=\"/static/Themes/Images/ICON/shibie2.png\" "
                            + "onclick='getcapture(" + id + ")'><br><br>"
                            + "<span>"
                            + name
                            + "</span>&nbsp&nbsp&nbsp"
                            + "<br><span>"
                            + ip
                            + "</span>&nbsp&nbsp"
                            + "<br><img src=\"/static/Themes/Images/Other/stop.png\" style=\"width: 50px; height: 20px;\" onclick='startreg("+id+",0)'></div>";
                    }

                    div_ify.append(a);
                }
            });
};
// 启用停用采集端
function startreg(id,state){
     var confirm = '确定启用吗？';
    if (state)
        confirm = '确定停用吗？';
    layer.confirm(confirm, {title: confirm}, function (index) {
        layer.close(index);
        $.post('/deepface/recognizeenable', {
            "id": id,
            "state": state
        }, function (data) {
            if (data.code == 0) {
                if (state) {
                    alert("停用成功");
                } else {
                    alert("启用成功");
                }
                Init_Device();
            } else {
                alert(data.message);
            }
        });
    });
}

// 采集端
function getcapture(id) {

    var div_cjd = jQuery(".acquisitions");
    div_cjd.html('');
     var div = jQuery(".camera");
    div.html('');
    $.post("/deepface/getcapture", {
        're_id': id
    }, function (res) {
        if (res.code == 0) {
            if (res.data[0].id) {
                getcamera(res.data[0].id);
            } else {
                getcamera(0);
            }
            for (k in res.data) {
                var id = res.data[k].id;
                var name = res.data[k].server_name;
                var ip = res.data[k].server_ip?res.data[k].server_ip:'192.168.1.1';

                var a = "<div class='hang' \"><img src=\"/static/Themes/Images/ICON/caiji1.png\" onclick='getcamera(" +
                    id
                    + ")'><br><br>"
                    + "<span>"
                    + name
                    + "&nbsp&nbsp&nbsp"
                    + "<br>"
                    + ip
                    + "</span></div>";
                div_cjd.append(a);
            }

        }
    });
}

// 摄像头
function getcamera(id) {
    var div = jQuery(".camera");
    div.html('');
    $.post("/deepface/getcamera", {
        'ca_id': id
    }, function (res) {
        if (res.code == 0) {
            for (k in res.data) {
                var cameraId = res.data[k].id;
                var name = res.data[k].camera_name;
                var state = res.data[k].is_enabled;
                var a = '';
                if (state == 1) {// 0-正常 1-禁用 2-异常 3-维修
                    a = "<div  class='hang'><img src=\"/static/Themes/Images/ICON/camera1.png\"><br><br>"
                        + "<span >"
                        + name
                        + "&nbsp&nbsp"
                        + "<br><img src=\"/static/Themes/Images/Other/start_state.png\" style=\"width: 50px; height: 20px;\" onclick='startcamera("+cameraId+",1,"+id+")'></div>";
                }
                if (state == 0) {
                    a = "<div class='hang'><img src=\"/static/Themes/Images/ICON/camera2.png\"><br><br>"
                        + "<span >"
                        + name
                        + "&nbsp&nbsp"
                        + "<br><img src=\"/static/Themes/Images/Other/stop.png\" style=\"width: 50px; height: 20px;\" onclick='startcamera("+cameraId+",0,"+id+")'></span></div>";
                }
                div.append(a);
            }

        }
    });
}


function startcamera(id,state,cap_id) {
    var confirm='确定启用吗？';
    if(state==1)
        confirm='确定停用吗？';
    layer.confirm(confirm, {title: confirm}, function (index) {
        layer.close(index);
        $.post('/deepface/cameraenable', {
            "id": id,
            "state": state
        }, function (data) {
            if (data.code == 0) {
                if (state) {
                    alert("停用成功");
                } else {
                    alert("启用成功");
                }
                getcamera(cap_id);
            } else {
                alert(data.message);
            }
        });
    });
}



AutoGCHeight = function () {
    if ($('.dgd')) {
        var hgt = $(window).height();
        var heigh = parseInt(hgt) - 42;
        $('.dgd').css("height", heigh);
    }
};

