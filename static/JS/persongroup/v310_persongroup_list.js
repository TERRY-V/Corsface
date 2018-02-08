jQuery(function($) {
var defaultCount = 12;
var currentPage = 1;//第几页
var totalCount = 1;//数量
var totalPage = 1;//页数
var pagecount = 12;//每页的记录数
var q = '';

var checkList = [];

//初始化
setTable = function () {
    $(".tbody").empty();
    var params = {
        "page": currentPage,
        "number": pagecount,
        "q": q
    };
    $.get("/deepface/person/group", params, function (res) {
        var code = res.code;
        var msg = res.message;
        if(code != 0 ){
            alert(msg);return;
        }
        var groups = res.data.groups;
        if (groups.length >= 0) {
            totalCount = res.data.count;
            totalPage = Math.floor((totalCount % pagecount) > 0 ? (totalCount / pagecount) + 1 : (totalCount / pagecount));
            setTbodyHtml(groups);
        }
    });
}

jQuery(".sel_wrap").on("change", function() {
    var o;
    var opt = jQuery(this).find('option');
    opt.each(function(i) {
        if(opt[i].selected == true) {
            o = opt[i].innerHTML;
        }
    })
    jQuery(this).find('label').html(o);
}).trigger('change');

//加载页面tbody
setTbodyHtml = function (data) {
    var html = "";
    for (var i = 0; i < data.length || i< defaultCount; i++) {
        var id = "";

        var name = "";
        var id = "";
        var count = "";
        var checkbox = "";
        var remark = "";
        if (data[i]) {
            name = data[i].name;
            id = data[i].id;
            count = data[i].count;
            remark = data[i].remark?data[i].remark:"";
            deploy_group_id_attr = "";
            // checkbox = "<input type='checkbox' name='chklist' id='chklist' value=" + id + " onclick='MutiPageMutiSelect(this)'>";
        }else{
            name = "";
            id = "";
            count = "";
            checkbox = "";
            remark = "";
        }
        html += "<tr class='tbod'>";
        // html += "<td>" + checkbox + "</td>";
        html += "<td>" + id + "</td>";
        html += "<td>" + name + "</td>";
        html += "<td>" + remark + "</td>";
        html += "<td>" + count + "</td>";
        html += "<td>";
        if (data[i]) {
            var param ={"id":id, "name":name, "remark":remark}
            var str = JSON.stringify(param);
            html += "<a class='btn btn-social-icon btn-bitbucket btn-edit' title='编辑' href='javascript:add_persongroup(" + str + ")'></a>";
            html += "<a class='btn btn-social-icon btn-bitbucket btn-delete' title='删除' href='javascript:delete_persongroup(" + id + ")'></a>";
            html += "<a class='btn btn-social-icon btn-bitbucket btn-deploy' "+ deploy_group_id_attr +" title='布控' href='javascript:deploy_group_state(\"" + id +"\",\""+ name + "\")'></a>";
            // html += "<a class='btn btn-social-icon btn-bitbucket btn-setright' title='分组人物' href='/corsface/groupperson?group_id='"+ id +"></a>";
        }
        html += "<td/>";
        html += "</tr>";
    }
    $(".tbody").append(html);
    $("#nowpage").val(currentPage);
    $("#totalPage").text(totalPage);
    $("#numTotal").text("(共"+ totalCount +"条数据)");
};
//生成翻页button
initPageButton = function (data) {
    if (data == 'start') {
        currentPage = 1;
    } else if (data == 'last') {
        if (currentPage > 1) {
            currentPage--;
        }
    } else if (data == 'next') {
        if (currentPage < totalPage) {
            currentPage++;
        }
    } else if (data == 'end') {
        currentPage = totalPage;
    }
    setTable();
};


add_persongroup = function(param){

    var name = "";
    var remark = "";
    var id = "";
    if(param){
        id = param.id;
        // param = JSON.parse(param);
        name = param.name;
        remark = param.remark;
    }
    var str='<div id="divForm" class="comclass">'+
                '<table>'+
                    '<tbody>'+
                        '<tr>'+
                            '<td style="width:150px;">'+
                                '分组名称'+
                                '<span style="color:red;">*</span>'+
                            '</td>'+
                            '<td style="text-align:left;">'+
                                '<input type="text" id="name" style="width:60%" maxlength="30" value="'+name+'">'+
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td style="width:150px;">'+
                                '分组备注'+
                            '</td>'+
                            '<td style="text-align:left;">'+
                                '<input type="text" id="remark" style="width:60%" maxlength="40" value="'+ remark +'">'+
                            '</td>'+
                        '</tr>'+
                    '</tbody>'+
                '</table>'+
            '</div>';
    $('#addPersonGroup').append(str);
    var pa = {
        type: 1,
        title: '编辑分组',
        area: ['700px', '230px'],
        content: $('#addPersonGroup'),
        btn: ['确定', '取消'],
        yes: function(index, layero) {
            //按钮【按钮一】的回调
            var res = save(id);
            if(res == false){
                return;
            }
            $('#addPersonGroup').empty();
            layer.close(index)
            setTable();
        },
        btn2: function(index, layero) {
            //按钮【按钮二】的回调
            $('#addPersonGroup').empty();

            //return false 开启该代码可禁止点击该按钮关闭
        },
        cancel: function() {
            //右上角关闭回调
            $('#addPersonGroup').empty();
        }
    };
    layer.open(pa);
}

save = function(id){
    var name = $("#name").val();
    if(!name){
        alert("分组名称不能为空");
        return false;
    }
    if(name.length>30){
        alert("分组名称过长");
        return false;
    }
    var remark = $("#remark").val();
    if(!remark){
        alert("分组备注不能为空");
        return false;
    }
    var param = {
            "group_name": name,
            "remark": remark
        };
    var url = "/deepface/person/group/create";
    if(id){
        param['group_id']= id;
        url = "/deepface/person/group/change";
    }
    $.ajax({
        //生成下面的facetrack初始化。
        url: url,
        data: param,
        async: false,
        type: "POST",
        success: function(data) {
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                alert(msg);
                return false;
            }
            if(id){
                alert("分组更新成功");
            }else{
                alert("分组创建成功");
            }
            return true;
        }
    });
}

delete_persongroup = function(id){

    layer.confirm("分组删除后将无法恢复，确认是否继续？", {title: "删除确认"}, function (index) {
            layer.close(index);
            $.post('/deepface/person/group/delete', {
                "group_id": id
            }, function (data) {
                if (data.code == 0) {
                    alert("删除成功！");
                    setTable();
                } else {
                    if(data.code == -2){
                        alert("请先删除该分组与人物的关系");
                    }else{
                        alert(data.message);
                    }
                    
                    setTable();
                }
            });
        });

}

MutiPageMutiSelect = function(obj){
    var checked = $(obj).is(":checked");
    var id = $(obj).val();
    if(checked){
        checkList.push(id);
    }else{
        for(var i = 0; i<checkList.length; i++){
            if(id == checkList[i]){
                checkList.splice(i);
                break;
            }
        }
    }
}

$("#txtGroupInfo").bind('keypress', function(event){
    if(event.keyCode == 13){
        var query = $("#txtGroupInfo").val();
        q = query.replace(/'/g, "''").replace(/_/g, "\\_");
        setTable();
    }
});
//第几页
$('#nowpage').bind('keypress', function (event) {
        var inputpage = $('#nowpage').val();
        if (event.keyCode == 13) {
            if (inputpage <= totalPage && inputpage > 0) {
                currentPage = Math.floor(inputpage);
                setTable();
            }
        }
    });

//布控操作相关
$(".recognise_table .cancle, .layui-layer-ico.layui-layer-close.layui-layer-close1").click(function(){
    $(".iForm").css("display", "none");
});

deploy_group_state = function(id, name){
    if(!id){
        return;
    }
    $(".iForm").css("display", "block");
    var recognise_servers = get_recognise_servers();
    if(recognise_servers == false){
        alert("识别端未获取，请稍后尝试");
        return;
    }

    set_group_deploy_table(id, name, recognise_servers);
}
add_deploy_group = function(){
    var recognise_id = $("select[name='recognise']").val();
    deploy_param['recognize_id'] = recognise_id;
    deploy_person(deploy_param);
}

var deploy_param = {};
set_group_deploy_table = function(id, name, recognise_servers){
    $(".table_title>p").text(name + "布控");
    $("select[name='recognise']").empty();
    var html = "";
    deploy_param = {
        group_id:id,
        option:2
    }
    for(var i = 0; i<recognise_servers.length; i++){
        var single_server = recognise_servers[i];
        var single_server_id = single_server['id'];
        // param['recognize_id'] = single_server_id;
        // var param_str = JSON.stringify(param);
        html += "<option " + "value=" + single_server_id + ">";
        html += single_server['server_name'];
        html += "</option>";
    }
    $("select[name='recognise']").append(html);
}

get_recognise_servers = function(){
    var res = "";
    $.ajax({
        url:"/deepface/recognizeall",
        async:false,
        type:"POST",
        data:{pageno:1, pagesize:14},
        success:function(data){
            var code = data.code;
            var msg = data.message;
            res = data.data;
        },
        error:function(data){
            res = false;
        }
    });
    return res;
}

deploy_person = function(param_str){
    // var p = JSON.parse(param_str);
    $.ajax({
        url:"/deepface/person/deploy",
        type:"POST",
        async:true,
        data:param_str,
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                alert(msg);
                $(".iForm").css("display", "none");
            }else{
                var already_deployed = data.data.already_deployed;
                already_deployed = already_deployed?already_deployed:0;
                var newly_deployed = data.data.newly_deployed;
                newly_deployed = newly_deployed?newly_deployed:0;
                msg = "新增布控：" + newly_deployed +"人";
                msg += "<br>已有布控：" +  already_deployed +"人";
                layer.msg(msg);
                // $(".iForm").css("display", "none");
                // setTimeout(function(){
                //     var selector = "a[deploy_person_id='"+ param_str['person_id'] +"']";
                //     $(selector).click();
                // },100);
            }
        },
        error:function(data){

            alert("服务忙，请稍后尝试");
            $(".iForm").css("display", "none");
        }
    })
}
});