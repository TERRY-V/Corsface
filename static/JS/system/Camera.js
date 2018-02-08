page = 1;//第几页
number = 1;//数量
pagenumber = 1;//页数
count = 11;//每页的记录数
quest = '';
group = 0;

chackList = [];
//初始化
Init_Camera = function () {
    chackList = [];
    chklistIds = [];

    $(".tbody").empty();
    var params = {
        "pageno": page,
        "pagesize": count,
        "quest": quest,
        "group": group
    };
    $.post("/deepface/cameragroup", params, function (res) {
        if (res.code == 0) {
            var data = res.data;
            var option_str = '<option value="0">选择摄像头分组</option>';
            for (var i = 0; i < data.length; i++) {
                option_str = option_str + '<option value="' + data[i]['id'] + '">' + data[i]['group_name'] + '</option>';
            }
            $("#group").html(option_str);
            $("#group").val(group);

        }
    });
    $.post("/deepface/cameralist", params, function (res) {
        if (res.data.length > 0) {
            number = res.allnum;
            pagenumber = Math.floor((number % count) > 0 ? (number / count) + 1 : (number / count));
            setTbodyHtml(res.data, res.code);

        }
    });
//加载页面tbody
    setTbodyHtml = function (data, code) {
        var html = "";
        for (var i = 0; i < count; i++) {
            var camera_name = "";
            var capture_url = "";
            var group_name = "";
            var id = "";
            var is_enabled = "";
            var server_name = "";
            var img='';
            if (data[i]) {
                camera_name = data[i].camera_name;
                capture_url=data[i].capture_url;
                img="<a class='btn btn-social-icon btn-bitbucket btn-see'  title='查看' href=\"javascript:PlayVideo('"+ data[i].capture_url + "')\"></a>";

                group_name = data[i].group_name;
                id = data[i].id;
                if (data[i].is_enabled) {
                    is_enabled = "<img src=\"/static/Themes/Images/Other/start_state.png\" onclick=\"setEnable(" + id + "," + data[i].is_enabled + ")\" style=\"width:60px;height:25px\">"
                } else {
                    is_enabled = "<img src=\"/static/Themes/Images/Other/ban_state.png\" onclick=\"setEnable(" + id + "," + data[i].is_enabled + ")\" style=\"width:60px;height:25px\">"

                }
                server_name = data[i].server_name;
            }
            html += "<tr class='tbod'>";
            html += "<td>" + camera_name + "</td>";
            html += "<td>" + group_name + "</td>";
            html += "<td class='capture_url'>"+ capture_url  + img + "</td>";
            html += "<td>" + server_name + "</td>";
            html += "<td>" + is_enabled + "</td>";
            html += "<td>";
            if (data[i]) {
                html += "<a class='btn btn-social-icon btn-bitbucket btn-edit' title='编辑' href='javascript:CameraEdit(" + id + ")'></a>";
                html += "<a class='btn btn-social-icon btn-bitbucket btn-delete' title='删除' href='javascript:CameraDelete(" + id + ")'></a>";

            }
            html += "<td/>";
            html += "</tr>";
        }
        $(".tbody").html(html);
        $("#nowpage").val(page);
        $("#number").html(number);
    };
//生成翻页button
    initPageButton = function (data) {
        if (data == 'start') {
            page = 1;
        } else if (data == 'last') {
            if (page > 1) {
                page--;
            }
        } else if (data == 'next') {
            if (page < pagenumber) {
                page++;
            }
        } else if (data == 'end') {
            page = pagenumber;
        }
        Init_Camera();
    };
};

function CameraDelete(id) {
    layer.confirm("数据删除后将无法恢复，确认是否继续？", {title: "删除确认"}, function (index) {
        layer.close(index);
        $.post('/deepface/cameradel', {
            "TagName": "deleteCameras",
            "id": id
        }, function (data) {
            if (data.code == 0) {
                chklistIds = [];
                alert("删除成功");
                Init_Camera();
            } else {
                alert(data.message);
            }
        });
    });
}

$(document).ready(function () {
    $('#go_search').click(
        function () {
            quest = $('#search_camera').val();
            // quest = val.replace(/'/g, "''").replace(/_/g, "\\_");
            group = $("#group").val();
            Init_Camera();
        });


    $('#table_refresh').click(function () {
        table.Refresh();
    });

    $('#table_filtrate').click(function () {
        $('#table_filtrate_li').toggleClass('hide');
    });

    $('#addCamera').click(function () {
        window.location.href = '/corsface/camerasetting'
    });


    $('#nowpage').bind('keypress', function (event) {
        var inputpage = $('#nowpage').val();
        if (event.keyCode == 13) {
            if (inputpage <= pagenumber && inputpage > 0) {
                page = Math.floor(inputpage);
                Init_Camera();
            }
        }
    });
});

//关闭
closeform = function () {
    $(".nr").css("display", "none");
};
PlayVideo = function (url) {
    var vlc = $('#vlc1')[0];
    $('#camera_vlc_wrap').css('display', 'block');
    try {
        vlc.width = '100%';
        vlc.height = '100%';
        var vlcid = vlc.playlist.add(url);
        vlc.playlist.playItem(vlcid);
    } catch (e) {
        //TODO handle the exception
    }
};
// 关闭vlc播放
closevlc = function () {
    $('#camera_vlc_wrap').css('display', 'none');

};


function setEnable(id, state) {
    var confirm = '确定启用吗？';
    if (state == 1)
        confirm = '确定停用吗？';


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
                Init_Camera();
            } else {
                alert(data.message);
            }
        });
    });


}

function CameraEdit(id) {
    window.location.href = '/corsface/camerasave/id=' + id;
}