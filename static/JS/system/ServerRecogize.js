 page = 1;//第几页
 number = 1;//数量
 pagenumber = 1;//页数
 count = 11;//每页的记录数
 quest = '';
 chackList = [];
//初始化
Init_ServerCapture = function () {
    chackList = [];
    chklistIds = [];

    $(".tbody").empty();
    var params = {
        "pageno": page,
        "pagesize": count,
        "quest": quest
    };
    $.post("/deepface/recognizeversion", function (res) {
        if (res.code == 0) {
            var data = res.data;
            var option_str = '<option value="0">请选择</option>';
            for (var i = 0; i < data.length; i++) {
                option_str = option_str + '<option value="' + data[i]['id'] + '">' + data[i]['version'] + '</option>';
            }
            $("#SVersion").html(option_str);
        }
    });
    $.post("/deepface/recognizelist", params, function (res) {
        if (res.data.length > 0) {
            number = res.allnum;
            pagenumber = Math.floor((number % count) > 0 ? (number / count) + 1 : (number / count));
            setTbodyHtml(res.data, res.code);

        }
    });
};
//加载页面tbody
setTbodyHtml = function (data, code) {
    var html = "";
    for (var i = 0; i < count; i++) {
        var id = "";

        var server_name = "";
        var deepface_url = "";
        var appkey = "";
        var is_enabled = '';
        if (data[i]) {
            server_name = data[i].server_name;
            deepface_url = data[i].deepface_url;
            appkey = data[i].appkey;
            id = data[i].id;
            if (data[i].is_enabled == 1) {
                is_enabled = "<img src=\"/static/Themes/Images/Other/start_state.png\" onclick=\"setEnable(" + id + "," + data[i].is_enabled + ")\" style=\"width:60px;height:25px\">"
            } else {
                is_enabled = "<img src=\"/static/Themes/Images/Other/ban_state.png\" onclick=\"setEnable(" + id + "," + data[i].is_enabled + ")\" style=\"width:60px;height:25px\">"

            }
        }
        html += "<tr class='tbod'>";
        html += "<td>" + server_name + "</td>";
        html += "<td>" + deepface_url + "</td>";
        html += "<td>" + appkey + "</td>";
        html += "<td>" + is_enabled + "</td>";
        html += "<td>";
        if (data[i]) {
            html += "<a class='btn btn-social-icon btn-bitbucket btn-edit' title='编辑' href='javascript:MenuEdit(" + id + ")'></a>";
            html += "<a class='btn btn-social-icon btn-bitbucket  btn-sync ' title='同步' href='javascript:Sync(" + id + ")'></a>";
            html += "<a class='btn btn-social-icon btn-bitbucket  btn-delete ' title='删除' href='javascript:regdelete(" + id + ")'></a>";


        }
        html += "<td/>";
        html += "</tr>";
    }
    $(".tbody").append(html);
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
    Init_ServerCapture();
};


//点击新建
form_Add = function () {
    $("#id").val("0");
    $("#list").css("display", "none");
    $("#nr").css("display", "block");

};
//新加
newform = function () {
    var newparam = {
        "id": $("#id").val(),
        "server_name": $("#GName").val(),
        "deepfaceurl": $("#deepfaceurl").val(),
        "keycode": $("#keycode").val(),
        "remark": $("#VSNode").val(),
        "version_id": $("#SVersion").val()
    };
    if (newparam['server_name'] == '' || newparam['deepfaceurl'] == '' || newparam['keycode'] == '' ||
        newparam['version_id'] == 0) {
        alert('请完善信息');
        return false;
    }

    $.post("/deepface/recognizesave", newparam, function (res) {
        if (res.code == 0) {
            alert("保存成功");
            closeform();
            Init_ServerCapture();
        } else {
            alert("保存失败,重新提交");
        }
    });
};
//修改
MenuEdit = function (id) {
    $.get("/deepface/recognizesave", {id: id}, function (res) {
        if (res.data.length > 0) {
            $("#id").val(res.data[0].id);
            $("#GName").val(res.data[0].server_name);
            $("#deepfaceurl").val(res.data[0].deepface_url);
            $("#keycode").val(res.data[0].appkey);
            $("#VSNode").val(res.data[0].remark);
            $("#SVersion").val(res.data[0].version_id);
            $("#nr").css("display", "block");
            $("#list").css("display", "none");

        }
    });
};

//关闭

function closeform() {
    $("#list").css("display", "block");
    $("#nr").css("display", "none");
}


//切割chklistIds
function splieChkListIds(chklistIds) {
    console.log(chklistIds)
    var chkString = "";
    for (var i = 0; i < chklistIds.length; i++) {
        if (i == 0) {
            chkString += chklistIds[i];
            continue;
        }
        chkString += "," + chklistIds[i];
    }
    return chkString;
}


$(document).ready(function () {
    //回车
    $('#nowpage').bind('keypress', function (event) {
        var inputpage = $('#nowpage').val();
        if (event.keyCode == 13) {
            if (inputpage <= page && inputpage > 0) {
                page = Math.floor(inputpage);
                Init_ServerCapture();
            }
        }
    });
    //返回
    $("#form_Back").click(function () {
        params.pageno = page;
        params.pagesize = count;
        params.pid = oldpid;
        Init_ServerCapture();

        $("#form_Back").addClass("hide");

    });
    $('#go_search').click(
        function () {
            quest = $('#search_server').val();
            // quest = val.replace(/'/g, "''").replace(/_/g, "\\_");
            Init_ServerCapture();
        });
});



function regdelete(id)
{
    layer.confirm("数据删除后将无法恢复，确认是否继续？", {title: "删除确认"}, function (index) {
        layer.close(index);
        $.post('/deepface/recognizedel', {
            "TagName": "deleteCameras",
            "id": id
        }, function (data) {
            if (data.code == 0) {
                chklistIds = [];
                alert("删除成功");
                Init_ServerCapture();
            } else {
                alert(data.message);
            }
        });
    });
}
function Sync(id) {
    layer.confirm("确定同步信息吗？", {title: "同步信息确认"}, function (index) {
        layer.close(index);
        $.post('/deepface/recognizesync', {
            "id": id
        }, function (data) {
            if (data.code == 0) {
                alert("同步成功");
                Init_ServerCapture();

            } else {
                alert(data.message);
            }
        });
    });
}

function setEnable(id, state) {
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
                Init_ServerCapture();
            } else {
                alert(data.message);
            }
        });
    });


}