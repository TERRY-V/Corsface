 page = 1;//第几页
 number = 1;//数量
 pagenumber = 1;//页数
 count = 11;//每页的记录数
 quest = '';
 group = 0;

 chackList = [];
//初始化
Init_ServerCapture = function () {
    chackList = [];
    chklistIds = [];
    $(".tbody").empty();
    var params = {
        "pageno": page,
        "pagesize": count,
        "quest": quest,
        "group": group

    };


    $.post("/deepface/capturelist", params, function (res) {
        if (res.data.length > 0) {
            number = res.allnum;
            pagenumber = Math.floor((number % count) > 0 ? (number / count) + 1 : (number / count));
            setTbodyHtml(res.data, res.code);

        }
    });

    $.post("/deepface/recognizeall", params, function (res) {
        if (res.code == 0) {
            var data = res.data;
            var option_str = '<option value="0">请选择</option>';
            var option_str_group = '<option value="0">选择识别端</option>';

            for (var i = 0; i < data.length; i++) {
                option_str = option_str + '<option value="' + data[i]['id'] + '">' + data[i]['server_name'] + '</option>';
                option_str_group = option_str_group + '<option value="' + data[i]['id'] + '">' + data[i]['server_name'] + '</option>';
            }
            $("#recogniseServer").html(option_str);
            $("#group").html(option_str_group);
            $("#group").val(group);

        }
    });
    $.post("/deepface/captureversion", params, function (res) {
        if (res.code == 0) {
            var data = res.data;
            var option_str = '<option value="0">请选择</option>';
            for (var i = 0; i < data.length; i++) {
                option_str = option_str + '<option value="' + data[i]['id'] + '">' + data[i]['version'] + '</option>';
            }
            $("#SVersion").html(option_str);
        }
    });
};
//加载页面tbody
setTbodyHtml = function (data, code) {
    var html = "";
    for (var i = 0; i < count; i++) {
        var id = "";

        var server_name = "";
        var server_ip = "";
        var server_flag = "";
        var recogize = "";

        if (data[i]) {
            server_name = data[i].server_name;
            server_ip = data[i].server_ip;
            server_flag = data[i].server_flag;
            id = data[i].id;
            recogize = data[i].recogize;
        }
        html += "<tr class='tbod'>";
        html += "<td>" + server_name + "</td>";
        html += "<td>" + server_flag + "</td>";
        html += "<td>" + recogize + "</td>";
        html += "<td>" + server_ip + "</td>";
        html += "<td>";
        if (data[i]) {
            html += "<a class='btn btn-social-icon btn-bitbucket btn-edit' title='编辑' href='javascript:MenuEdit(" + id + ")'></a>";
            html += "<a class='btn btn-social-icon btn-bitbucket btn-delete' title='删除' href='javascript:capdelete(" + id + ")'></a>";

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


//新加
newform = function () {
    var newparam = {
        "id": $("#id").val(),
        "server_name": $("#GName").val(),
        "server_ip": $("#IPAddress").val(),
        "server_flag": $("#VSName").val(),
        "remark": $("#VSNode").val(),
        "version_id": $("#SVersion").val(),
        "recognize_id": $("#recogniseServer").val()
    };
    if (newparam['server_name'] == '' || newparam['server_ip'] == '' ||
        newparam['server_flag'] == '' || newparam['version_id'] == 0 || newparam['recognize_id'] == 0) {
        alert('请完善信息');
        return false;
    }

    $.post("/deepface/capturesave", newparam, function (res) {
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
    $.get("/deepface/capturesave", {id: id}, function (res) {

        if (res.data.length > 0) {
            $("#id").val(res.data[0].id);
            $("#GName").val(res.data[0].server_name);
            $("#IPAddress").val(res.data[0].server_ip);
            $("#VSName").val(res.data[0].server_flag);
            $("#VSNode").val(res.data[0].remark);
            $("#SVersion").val(res.data[0].version_id);
            $("#recogniseServer").val(res.data[0].recognize_id);
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

function capdelete(id) {
    layer.confirm("数据删除后将无法恢复，确认是否继续？", {title: "删除确认"}, function (index) {
        layer.close(index);
        $.post('/deepface/capturedel', {
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
            // quest =$('#search_server').val();// val.replace(/'/g, "''").replace(/_/g, "\\_");
            group = $("#group").val();

            Init_ServerCapture();
        });


});

