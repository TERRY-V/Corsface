jQuery(function($){
var defaultCount = 7;
var currentPage = 1;//第几页
var totalCount = 1;//数量
var totalPage = 1;//页数
var pagecount = 7;//每页的记录数
//查询字段
var name = "";
var id_card = "";
var gender = "";
var id_card = "";
var group_id = "";
var recognize_id = "";
var status = "";
var deploy_state = {
    "0":"待同步",
    "1":'已同步',
    "-1":"同步失败"
}
AutoGCHeight();
$(window).resize(function(){
    AutoGCHeight();
});
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
Init_deploy_list = function(){
setTable();
setRecoginse();
set_group_sel();
}
set_group_sel = function(){
    $.ajax({
        url:"/deepface/person/group",
        async:true,
        type:'GET',
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                alert(msg);return;
            }
            var groups = data.data.groups;
            var sel = "";
            sel += "<option value=''>全部</option>";
            for(var i = 0; i<groups.length; i++){
                sel += "<option value= "+ groups[i].id +">" + groups[i].name +"</option>";
            }
            $("select[name='person_group']").empty();
            $("select[name='person_group']").append(sel);
        }
    })
}
setRecoginse = function(){
    $.ajax({
        url:"/deepface/recognizeall",
        async:false,
        type:"POST",
        data:{pageno:1, pagesize:14},
        success:function(data){
            var code = data.code;
            var msg = data.message;
            res = data.data;
            var reco_html = "";
            for(var i = 0; i<res.length; i++){
                var reco_id = res[i].id;
                var name = res[i].server_name;
                reco_html += "<option value="+ reco_id +">"+ name +"</option>"
            }
            $("select[name='recognise']").append(reco_html);
        },
        error:function(data){
            res = false;
        }
    });
}
setTable = function(){
    $(".tbody").empty();
    var param = {
        "page":currentPage,
        "number":pagecount,
        "name":name,
        "id_card":id_card,
        "gender":gender,
        "group_id":group_id,
        "recognize_id":recognize_id,
        "status":status
    }
    $.ajax({
        url:"/deepface/person/deploy/search",
        async:true,
        data:param,
        type:"POST",
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                alert(msg);return;
            }
            var persons = data.data.persons;
            if(persons.length >= 0){
                totalCount = data.data.total;
                totalPage = Math.floor((totalCount % pagecount) > 0 ? (totalCount / pagecount) + 1 : (totalCount / pagecount));
                setTbodyHtml(persons);
            }
        }
    })
}
setTbodyHtml = function(data){
    var html = "";
    for(var i = 0; i<data.length || i<defaultCount; i++){
        var id_card = "";
        var name = "";
        var gender = "";
        var birthday = "";
        var family_register="";

        var person_id = "";
        var alarm_level = "";
        var face_image ="";
        var group_name = "";
        var age = "";
        var status = "";
        var status_show = "";

        var recognize_name = "";

        var param = {};
        if(data[i]){

            name = data[i].name;
            gender = showGender(data[i].gender);
            // age = show_age(data[i].birthday);
            family_register = data[i].family_register;
            // family_register = set_family_register(family_register);
            group_name = data[i].group_name;
            group_name = group_name?group_name:"";

            id_card = data[i].id_card;
            id_card = id_card?id_card:"";
            
            person_id = data[i].person_id;
            face_image = data[i].face_image;
            checkbox = "<input type='checkbox' name='chklist' id='chklist' value=" + person_id + " onclick='MutiPageMutiSelect(this)'>";

            var deploy_person_id_attr = "deploy_person_id=" + person_id;
            recognize_name = data[i].recognize_name;
            status = data[i]['status'];
            status_show = deploy_state[status];
            param['person_id'] = person_id;
            param['recognize_id'] = data[i]['recognize_id'];
        }else{
            id_card = "";
            name = "";
            gender = "";
            birthday = "";
            age = "";
            
            person_id = "";
            alarm_level = "";
            face_image ="";
            group_name = "";
            checkbox = "";
        }

        html +="<tr class='tbod'>";
        // html += "<td>" + checkbox + "</td>";
        if(face_image){
            html += "<td><img src=" + face_image + " /></td>";
        }else{
            if(i >= data.length){
                html += "<td></td>";
            }else{
                html += "<td><img src=/static/Themes/Images/ICON/no_id_card_img.png"+" /></td>";
            }
            
        }
        html += "<td>" + name + "</td>";
        html += "<td>" + gender + "</td>";
        html += "<td>" + id_card + "</td>";
        html += "<td>" + recognize_name + "</td>";
        // html += "<td>" + age + "</td>";
        // html += "<td>" + family_register + "</td>";
        html += "<td>" + group_name + "</td>";
        html += "<td>" + status_show + "</td>";
        
        if (data[i]) {
            html += "<td>";
            // html += "<a class='btn btn-social-icon btn-bitbucket btn-edit' title='编辑' href='/corsface/personform?person_id=" + person_id + "'></a>";
            html += "<a class='btn btn-social-icon btn-bitbucket btn-delete' title='删除' href='javascript:delete_deploy_async("+ JSON.stringify(param) +")'></a>";
            if(status == 0 || status == -1){
                html += "<a class='btn btn-social-icon btn-bitbucket btn-sync' "+ deploy_person_id_attr +" title='同步' href='javascript:person_async("+ JSON.stringify(param) +")'></a>";
            }
            html += "<td/>";
        }
        html += "</tr>";
    }
    $(".tbody").append(html);
    $("#nowpage").val(currentPage);
    $("#totalPage").text(totalPage);
    $("#numTotal").text("(共"+ totalCount +"条数据)");
}
showGender = function(gender){
    var res = "男";
    if(gender == 2){

    }else if(gender == 1){
        res = "女";
    }else if(gender == -1){
        res = "未知";
    }
    return res;
}
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

$(".go_search").click(function(){
    currentPage = 1;
    name = $("#name").val();
    id_card = $("#id_card").val();
    gender = $("select[name='gender']").val();
    recognize_id = $("select[name='recognise']").val();
    status = $("select[name='status']").val();
    group_id = $("select[name='person_group']").val();
    setTable();
});

$("#remove").click(function(){
    id_card = "";
    gender = "";
    name = "";
    group_id = "";
    $("#id_card").val("");
    $("#name").val("");
    $("select[name='gender']").val("");
    $("select[name='recognise']").val("");
    $("select[name='status']").val("");
    $("select[name='person_group']").val("");
    jQuery(".sel_wrap").change();
    
    //修改分组的设置。
    // $("#group_name").val("人物列表");
    // $("#treeDemo").find(".curSelectedNode").removeClass("curSelectedNode");
    $(".go_search").click();
});

$("#name, #id_card").bind('keypress', function(event){
    if(event.keyCode == 13){
        // var query = $("#txtGroupInfo").val();
        // q = query.replace(/'/g, "''").replace(/_/g, "\\_");
        $(".go_search").click();
    }
})

$("#one_key_async").click(function(){
    $.ajax({
        url:"/listener/synchronize",
        type:"POST",
        data:{option:1},
        async:true,
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                alert("同步指令发送失败，请稍后尝试");
            }else{
                alert("同步指令发送成功，请稍候");
            }
        }
    })
});
delete_deploy_async = function(param){
    $.ajax({
        url:"/deepface/person/deploy/delete",
        type:"POST",
        async:true,
        data:param,
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                alert("删除失败 " + msg);
            }else{
                alert("删除成功");
                setTable();
            }
        },
        error:function(data){
            alert("删除失败");
        }
    })
}

person_async = function(param){
    //人物同步接口
    $.ajax({
        url:"/deepface/person/deploy/synchronize",
        type:"POST",
        data:param,
        async:true,
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                alert("人物同步失败 " + msg);
            }else{
                alert("人物同步成功");
                setTable();
            }
        },
        error:function(data){
            alert("人物同步失败");
        }
    })
}
});