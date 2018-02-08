jQuery(function($){
var facetrack_id = Util.GetParam("facetrack_id");
var href = window.location.href;
var person_img = href.split("person_img=")[1];
// var person_img = Util.GetParam("person_img");

var default_card_img = "/static/Themes/Images/ICON/no_id_card_img.png";
Init_Person_create = function(){
    InitDate();
    set_group();
    set_alarm_level();
    console.log(person_img);
    if(person_img){
        $("#card_img").attr("src", person_img);
    }else{
        $("#card_img").attr("src", default_card_img);
    }
}

InitDate = function(){
    var date = new Date();  
    var now = date.pattern("yyyy-MM-dd");
    laydate.render({
          elem: '#birthday',
          format: 'yyyy-MM-dd',
          max:now
        });
}

function set_group(group_id){
    //设置group_id的信息，放在选项框中。
    var default_group_id = 1;
    if(group_id){
        default_group_id = group_id;
    }
    $.ajax({
        url:"/deepface/person/group",
        sync:false,
        type:"GET",
        success:function(data){
            var code = data.code;
            var msg = data.messgae;
            if(code != 0){
                alert(msg);return;
            }
            var groups = data.data.groups;
            var info = "";

            for(x in groups){
                var sel = "";
                if(default_group_id == groups[x].id){
                    sel = " selected "
                }
                info += "<option value='" + groups[x].id +"' " + sel +">" + groups[x].name +"</option>";
            }
            $("select[name='group_id']").empty();
            $("select[name='group_id']").append(info);
        }
    })
}

set_alarm_level = function(alarm_level){
    var sel = " selected ";
    var str1 = str2 = str3 = str4 = "";
    if(alarm_level){
        if(alarm_level == 1){
            str1 = sel;
        }
        if(alarm_level == 2){
            str2 = sel;
        }
        if(alarm_level == 3){
            str3 = sel;
        }
        if(alarm_level == 4){
            str4 = sel;
        }
    }
    alarm = '<option value="1" '+str1 +'>一级报警</option>'
    +'<option value="2" '+ str2 +'>二级报警</option>'
    +'<option value="3" '+ str3 +'>三级报警</option>'
    +'<option value="4" '+ str4 +'>四级报警</option>';
    $("select[name='alarm_level']").empty();
    $("select[name='alarm_level']").append(alarm);
}

Form_Save = function(){
    var param = get_person_param();
    var url = "/deepface/person/createfromfacetrack";
    if(param == -1){
        return;
    }
    $.ajax({
        url:url,
        sync:false,
        data:param,
        type:"POST",
        success:function(data){
            var code = data.code;
            var msg = data.message;
            //操作成功后 附件数据置空。
            if(code != 0){
                alert(msg);return;
            }

            returnToList();
            // setTimeout(function(){
            //     //设置后重新加载页面。
            //     window.location.reload();
            // }, 1000)
        },
        error:function(data){
            alert("请稍后重试");
        }
    })
}
returnToList = function(){
    window.history.go(-1);return;
}
get_person_param = function(){
    var param = {};
    //name
    param['facetrack_id'] = facetrack_id;
    var name = $("#name").val();
    if(!name){
        alert("请填写名称");
        return -1;
    }
    param["name"] = name;

    //性别
    var gender = $("#chk_Sex .imgChecked").attr("value");
    if( typeof(gender)=="undefined" ){
        alert("请选择性别");
        return -1;
    }
    param["gender"] = gender;

    //民族
    var nation = $("#nation").val();
    nation = nation?nation:"";
    param["nation"] = nation;

    //生日
    var birthday = $("#birthday").val();
    birthday = birthday?birthday:"";
    param['birthday'] = birthday;

    //证件号码
    var id_card = $("#id_card").val();
    var id_card = id_card?id_card:"";
    param['id_card'] = id_card;
    
    //家庭住址
    var family_register = $("#family_register").val();
    family_register = family_register?family_register:"";
    param['family_register'] = family_register;

    //手机号
    var phone = $("#phone").val();
    if(phone){
        phone = set_phone(phone);
        if(!phone){
            return -1;
        }
    }
    param['phone'] = phone;


    var group_id = $("select[name='group_id']").val();
    var alarm_level = $("select[name='alarm_level']").val();
    param['group_id'] = Number(group_id);
    param['alarm_level'] = Number(alarm_level);

    var remark = $("#remark").val();
    param['remark'] = remark;

    if(person_img){
        param['face_image'] = person_img;
    }
    
    return param;
}
function set_phone(phone){
    var res = "";
    if(!phone){
        return res;
    }
    if(!(/^1[34578]\d{9}$/.test(phone))){ 
        alert("请输入正确的手机号码！");  
        return -1; 
    }
    return phone;
}

});
