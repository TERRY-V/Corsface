var param = {};
jQuery(function($){
var defaultCount = 7;
var currentPage = 1;//第几页
var totalCount = 1;//数量
var totalPage = 1;//页数
var pagecount = 7;//每页的记录数
//记录checkbox的ids。
var checkList = [];
//查询字段
var name = "";
var id_card = "";
var gender = "";
var id_card = "";
var group_id = "";

//布控状态
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

Init_Person_List = function(id){
    if(id>0){
        group_id = id;

    }else{
        group_id = "";
    }
    currentPage = 1;
    var page_tmp = Util.GetParam("currentPage");
    if(page_tmp){
        currentPage = page_tmp;
    }
    setTable();
}

$(".go_search").click(function(){
    currentPage = 1;
    name = $("#name").val();
    id_card = $("#id_card").val();
    gender = $("select[name='gender']").val();

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
    jQuery(".sel_wrap").change();
    
    //修改分组的设置。
    $("#group_name").val("人物列表");
    $("#treeDemo").find(".curSelectedNode").removeClass("curSelectedNode");
    $(".go_search").click();
})

setTable = function(){
    $(".tbody").empty();
    var param = {
        "page":currentPage,
        "number":pagecount,
        "name":name,
        "id_card":id_card,
        "gender":gender,
        "group_id":group_id
    }
    $.ajax({
        url:"/deepface/person",
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
                totalCount = data.data.persons_total;
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
        if(data[i]){
            name = data[i].name;
            gender = showGender(data[i].gender);
            age = show_age(data[i].birthday);
            family_register = data[i].family_register;
            family_register = set_family_register(family_register);
            group_name = data[i].group_name;
            group_name = group_name?group_name:"";

            id_card = data[i].id_card;
            id_card = id_card?id_card:"";
            
            person_id = data[i].person_id;
            face_image = data[i].face_image;
            checkbox = "<input type='checkbox' name='chklist' id='chklist' value=" + person_id + " onclick='MutiPageMutiSelect(this)'>";

            var deploy_person_id_attr = "deploy_person_id=" + person_id;
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
        html += "<td>" + checkbox + "</td>";
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
        html += "<td>" + age + "</td>";
        html += "<td>" + id_card + "</td>";
        html += "<td>" + family_register + "</td>";
        html += "<td>" + group_name + "</td>";
        html += "<td>";
        if (data[i]) {
            html += "<a class='btn btn-social-icon btn-bitbucket btn-edit' title='编辑' href='/corsface/personform?person_id=" + person_id + "'></a>";
            html += "<a class='btn btn-social-icon btn-bitbucket btn-delete' title='删除' href='javascript:delete_persons(\"" + person_id + "\")'></a>";
            html += "<a class='btn btn-social-icon btn-bitbucket btn-deploy' "+ deploy_person_id_attr +" title='布控' onclick='deploy_person_state(\"" + person_id +"\",\""+ name + "\")'></a>";
            html += "<a class='btn btn-social-icon btn-bitbucket btn-facetrack-view' "+ " title='查看' href='/corsface/persontrack?personid="+ person_id +"&currentPage="+currentPage+"'></a>";
        }
        html += "<td/>";
        html += "</tr>";
    }
    $(".tbody").append(html);
    $("#nowpage").val(currentPage);
    $("#totalPage").text(totalPage);
    $("#numTotal").text("(共"+ totalCount +"条数据)");
}

delete_persons = function(person_id){
    var delete_person_array = [];
    if(person_id){
        delete_person_array.push(person_id);
    }else{
        var length = checkList.length;
        if(length == 0){
            alert("请先选择删除的人物");return;
        }
        delete_person_array = checkList;
    }
    
    layer.confirm("人物删除之后无法恢复，确认是否继续？",
    {"title":"删除确认"}, function(index){
        layer.close(index);
        $.ajax({
            url:"/deepface/person/delete",
            type:"POST",
            data:{person_ids:JSON.stringify(delete_person_array)},
            async:true,
            success:function(data){
                var code = data.code;
                var msg = data.message;
                if(code != 0){
                    alert(msg);
                }else{
                    alert("删除成功");
                }
                checkList = [];
                setTable();
            }
        })
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

set_family_register = function(family_register){
    res = "";
    if(!family_register){
        return res;
    }
    if(family_register.length > 9){
        res = family_register.substr(0,9) + "...";
    }else{
        res = family_register;
    }
    return res;
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

show_age = function (birthday){
    var age = "";
    var birthyear = "";
    if(!birthday){
        return age;
    }
    try{
        birthyear = birthday.split("-");
        birthyear = Number(birthyear[0]);
        var nowyear = new Date();
        age = nowyear.getFullYear() - birthyear +1 ;
    }catch(e){
        return age;
    }
    return age;
}

PersonEdit = function(person_id){
    if(!person_id){
        person_id = "";
    }
    window.location.href = "/corsface/personform?person_id="+ person_id;
}

$("#name, #id_card").bind('keypress', function(event){
    if(event.keyCode == 13){
        // var query = $("#txtGroupInfo").val();
        // q = query.replace(/'/g, "''").replace(/_/g, "\\_");
        $(".go_search").click();
    }
});

$("select[name='gender']").change(function(){
    $(".go_search").click();
});

//人物布控部分的js
deploy_person_state = function(person_id, person_name){
    if(!person_id){
        return;
    }
    $(".iForm").css("display", "block");
    var recognise_servers = get_recognise_servers();
    if(recognise_servers == false){
        alert("识别端未获取，请稍后尝试");
        return;
    }
    set_recognise_sel(recognise_servers);
    get_person_deploy_info(recognise_servers, person_id, person_name);
}
set_recognise_sel = function(recognise_servers){
    $("select[name='recognise']").empty();
    var html = "";
    for(var i = 0; i<recognise_servers.length; i++){
        var single_server = recognise_servers[i];
        var single_server_id = single_server['id'];
        html += "<option " + "value=" + single_server_id + ">";
        html += single_server['server_name'];
        html += "</option>";
    }
    $("select[name='recognise']").append(html);
}
$(".recognise_table .cancle, .layui-layer-ico.layui-layer-close.layui-layer-close1").click(function(){
    $(".iForm").css("display", "none");
});

var deploy_param = {};
add_deploy_person = function(){
    var recognise_id = $("select[name='recognise']").val();
    deploy_param['recognize_id'] = recognise_id;
    deploy_person(deploy_param);
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
get_person_deploy_info = function(recognise_servers, person_id, person_name){
    $.ajax({
        url:"/deepface/person/deploy/info",
        data:{"person_id":person_id},
        async:true,
        type:"POST",
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                alert(msg);
                $(".iForm").css("display", "none");
            }
            var persons = data.data.persons;
            
            set_person_deploy_table(persons, recognise_servers, person_id, person_name);
        },
        error:function(data){
            alert("服务正忙，请稍后重试");
            $(".iForm").css("display", "none");
        }
    })
}

function set_person_deploy_table(persons, recognise_servers, person_id, person_name){
    $(".deploy_body").empty();
    var html = "";
    deploy_param = {
        person_id:person_id,
        option:1
    }
    $(".table_title>p").text(person_name + "布控");
    
    for(var i = 0; i<persons.length; i++){
        var single_server = persons[i];
        var single_server_id = single_server['recognize_id'];
        deploy_param['recognize_id'] = single_server_id;
        var param_str = JSON.stringify(deploy_param);
        var option = "";
        html += "<tr>";

        var state = single_server['status'];
        html += "<td><img src=" + single_server['face_image'] +" />";
        html += "<td>"+ single_server['name'] +"</td>";
        html += "<td>"+ single_server['recognize_name'] +"</td>";
        html += "<td>"+ deploy_state[state] +"</td>";
        if(state == 0){
            option="<a title='同步' href='javascript:person_async(" + param_str + ")'>同步</a>";
            // option = "<a title='布控' disabled='disabled' href='javascript:deploy_person(" + param_str + ")'>布控ing</a>";
        }else if(state == 1){
            option = "<a title='删除' href='javascript:delete_deploy_async(" + param_str + ")'>删除</a>"
        }else if(state == -1){
            option = "<a title='同步' href='javascript:person_async(" + param_str + ")'>同步</a>"
            option +="<a title='删除' href='javascript:delete_deploy_async(" + param_str + ")'>删除</a>";
        }
        html += "<td>"+ option +"</td>";
        
        html +="</tr>";

    }
    $(".deploy_body").append(html);
}

deploy_person = function(param_str){
    //添加布控
    // var p = JSON.parse(param_str);
    $.ajax({
        url:"/deepface/person/deploy",
        type:"POST",
        async:true,
        data:param_str,
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0 && code!= -4){
                alert(msg);
                $(".iForm").css("display", "none");
            }else{
                if(code == -4){
                    alert("该人已添加布控");
                }else{
                    alert("布控添加成功，并同步到识别端");
                }
                
                $(".iForm").css("display", "none");
                setTimeout(function(){
                    var selector = "a[deploy_person_id='"+ param_str['person_id'] +"']";
                    console.log(selector);
                    $(selector).click();
                },100);
            }
        },
        error:function(data){
            alert("服务忙，请稍后尝试");
            $(".iForm").css("display", "none");
        }
    })
}

delete_deploy_async = function(param){
    //人物从deepface删除 并且取消布控。
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
                $(".iForm").css("display", "none");
                setTimeout(function(){
                    var selector = "a[deploy_person_id='"+ param['person_id'] +"']";
                    console.log(selector);
                    $(selector).click();
                },100);
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
                $(".iForm").css("display", "none");
                setTimeout(function(){
                    var selector = "a[deploy_person_id='"+ param['person_id'] +"']";
                    console.log(selector);
                    $(selector).click();
                },100);
            }
        },
        error:function(data){
            alert("人物同步失败");
        }
    })
}
});
