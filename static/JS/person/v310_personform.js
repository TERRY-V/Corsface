jQuery(function($){
var person_id = "";
//保存附件的url，用map保存，在手动截图时会有url改变的情况。
var attach_url = {};
var temp="";
var Maxsize = 1;
var default_card_img = "/static/Themes/Images/ICON/no_id_card_img.png";
person_id = Util.GetParam("person_id");
// var today_date = Date.pattern();
// console.log(today_date);
Init_Person_Edit = function(){
    // 填充分组信息。
    InitDate();
    if(person_id){
        set_person_info(person_id);
    }else{
        set_group();
        set_alarm_level();
        $("#card_img").attr("src", default_card_img);
    }
}

InitDate = function(){
    var date = new Date();  
    var now = date.pattern("yyyy-MM-dd");
    laydate.render({
          elem: '#birthday',
          format: 'yyyy-MM-dd',
          max: now
        });
}


returnList = function(){
    window.history.go(-1);return;
}

Form_Save = function(){
    var param = get_person_param();
    var url = "/deepface/person/create";
    if(person_id){
        url = "/deepface/person/change";
        param['person_id'] = person_id;
    }
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
            attach_url={};
            if(code != 0){
                alert(msg);return;
            }

            returnList();
        }
    })
}
set_person_info = function(person_id){
    $.ajax({
        url:"/deepface/person/getpersoninfo",
        data:{'person_id':person_id},
        sync:true,
        type:"POST",
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                alert(msg);return;
            }
            var person = data.data.person;
            var name = person.name;
            $("#name").val(name);

            //设置性别
            var gender = person.gender;
            var selector = "#chk_Sex span [value='" + gender +"']";
            $(selector).click();

            //设置民族
            var nation = person.nation;
            nation = nation?nation:"";
            $("#nation").val(nation);

            //出生日期
            var birthday = person.birthday;
            if(birthday){
                $("#birthday").val(birthday);
            }

            //证件号码
            var id_card = person.id_card;
            if(id_card){
                $("#id_card").val(id_card);
            }
            //手机号
            var phone = person.phone;
            if(phone){
                $("#phone").val(phone);
            }

            var family_register = person.family_register;
            if(family_register){
                $("#family_register").val(family_register);
            }

            var group_id = person.group_id;
            set_group(group_id);

            var alarm_level = person.alarm_level;
            set_alarm_level(alarm_level);
            
            var remark = person.remark;
            if(remark){
                $("#remark").val(remark);
            }

            //设置证件照片。
            var face_image = person.face_image;
            if(face_image){
                $("#card_img").attr("src", face_image);
            }else{
                $("#card_img").attr("src", "/static/Themes/Images/ICON/no_id_card_img.png")
                // if(person.images[0]){
                //     $("#card_img").attr("src", face_image);
                // }
            }

            //展示全部的图片。
            var images = person.images;
            show_person_images(images);
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
get_person_param = function(){
    var param = {};
    //name
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

    //获取证件图片
    var id_card_img = $("#card_img").attr("src");
    if(id_card_img){
        param['face_image'] = id_card_img;
    }
    //获取新增图片
    if(attach_url){
        var array_img = [];
        for(var x in attach_url){
            array_img.push(attach_url[x]);
        }
        if(array_img.length > 0){
            param['images'] = JSON.stringify(array_img);
        }
    }
    return param;
}

function show_person_images(images){
    if(!images || images.length == 0){
        return;
    }
    for(var i = 0; i < images.length; i++){
        addSingleAttachImg(images[i].face_image, "", images[i].image_id, "true");
    }
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

addSingleAttachImg = function(img_path, origan_img, img_id, exist, no_face){
   //exist 图片是否是附件。
    var str = "";
    var OriganImgStr = "";
    if(origan_img){
        OriganImgStr = '<a class="btn btn-social-icon btn-edit btn-left-bottom" title="裁剪图片" onclick="showOriganImg(this,\''+origan_img+"','"+"" +'\')"></a>';
    }

    str += '<div class="img_item left" onmouseenter="showMask(this)" onmouseleave="hiddenMask(this)">'
    +'<div class="img_type hide"> '+
    '<div class="three_part1"></div> <div class="three_part2"></div> <div class="three_part3"></div>' 
    + '</div>'
           +'<i class="img_mask">'
           +'<a class="btn btn-social-icon btn-delete btn-right-bottom" title="删除图片" onclick="img_delete(this,\''+img_id+'\',\''+ origan_img +'\')"></a>'
            +'<a class="btn btn-social-icon btn-totop btn-center-bottom" title="设为证件照"  onclick="img_to_top(this,\''+img_path
             + '\')"></a>'
           + OriganImgStr 
           +'</i>'
           +'<img osrc="'+ origan_img +'" img_exist='+ exist +' src="'+img_path+'" />' 
           // +'<p class="name">' + attachImgInfo.SAID + '</p>' 
           +'</div>';

    $("#imgAdd").before(str);
};

//图片删除操作。
img_delete = function(obj, img_id, origan_img){
    var _that = obj;
    var img_exist = $(_that).parent().parent().find("img").attr("img_exist");
    if(img_exist == "true"){
        $.ajax({
            url:"/deepface/person/image/delete",
            data:{'image_id': img_id, "person_id":person_id},
            type:"POST",
            sync:true,
            success:function(data){
                var code = data.code;
                var msg = data.message;
                if(code != 0){
                    alert(msg + " 删除失败,请稍后尝试");
                }else{
                    alert("删除成功");
                }
                $(_that).parent().parent().remove();
            }
        })
    }else{
        $(_that).parent().parent().remove();
        //删除 attach_url中的地址;
        console.log(origan_img);
        console.log(attach_url[origan_img]);
        delete attach_url[origan_img];
    }
}
returnToList = function(){
    window.history.go(-1);return;
}
img_to_top = function(obj, img_path){
    //设置证件照图片。
    $("#card_img").attr("src", img_path);
}
//上传完毕一张照片如果证件照片是默认证件照 则把照片替换。
set_card_img_auto = function(crop_path){
    var id_card_img = $("#card_img").attr("src");
    if(id_card_img == default_card_img){
        $("#card_img").attr("src", crop_path);
    }
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

function isCardNo(card)  
{  
   // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
   var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  
   if(reg.test(card) === false)  
   {  
       alert("身份证输入不合法");  
       return  false;  
   }  
   return true;
}
showMask = function (obj) {
    var _this = obj;
    // $(_this).find('img').addClass('img_border');
    $(_this).find('.img_mask').addClass('img_hover');
    $(_this).find('.img_type').removeClass("hide");
}
hiddenMask = function (obj) {
    var _this = obj;
    // $(_this).find('img').addClass('img_border');
    $(_this).find('.img_mask').removeClass('img_hover');
    $(_this).find('.img_type').addClass("hide");
}
//图片处理与上传。
$("#fileupload").change(function(){
    var that = this;
    console.log("change");
    //先完成单张图片的。
    var files = this.files;
    if(files.length <= 0){
        alert("请选择图片");
        return false;
    }
    var file = this.files[0];
    // 限制图片大于2兆
    if(file.size/1024/1024 > Maxsize ) {
        alert('最大支持1M的图片');
        return false;
    }
    //这里我们判断下类型如果不是图片就返回 去掉就可以上传任意文件 
    if(!/image\/\w+/.test(file.type)){
        alert('请确保文件为图像类型');
        $("#fileupload").val('');
        return false;
    }

    var reader = new FileReader();
    reader.readAsDataURL(file);
    //获取完成file之后将file放置空。避免再次传同一文件失效的情况。
    // this.files = new FileList();
    reader.onload = function(e){
        temp = this.result;
        var base64_img = "";
        if(temp){
            base64_img = temp.split(",")[1];
        }
        // file_base64.push(temp);
        var param = {"image":base64_img};
        send_base64_img(param, that);
    }
});
send_base64_img = function(param, that){
    $("#loadingImg").removeClass("hide");
    $.ajax({
        url:"/deepface/uploadimage",
        data:param,
        type:"POST",
        sync:true,
        success:function(data){
            that.value = "";
            var code = data.code;
            var msg = data.message;
            
            if(code == 0){
                //图片上传成功后再次去做crop工作;
                var photo_path = data.data.photo_path;
                var param = {"option":2, photo_path:photo_path};
                crop_face(param);
            }else{
                //解析失败的情况提示。也应该把图片返回。用于截图。
                alert(msg);
            }
        },
        error:function(data){
            console.log(data);
            $("#loadingImg").addClass("hide");
            alert("上传失败，请稍后尝试");
        }
    })
}

crop_face = function(param){
    $.ajax({
        url:"/deepface/cropface",
        data:param,
        type:"POST",
        sync:true,
        success:function(data){
            $("#loadingImg").addClass("hide");
            var code = data.code;
            var msg = data.message;
            if(code == 0){
                data = data.data;
                //添加人物证件照片。
                set_card_img_auto(data.crop_path);

                addSingleAttachImg(data.crop_path, param.photo_path);
                attach_url[param.photo_path] = data.crop_path;
                // attach_url.push(data.crop_path);
            }else if(code == -3){
                alert("图片没有发现人脸，请尝试截图获取");
                addSingleAttachImg(param.photo_path, param.photo_path, "", "no_face");
            }
        },
        error:function(data){
            $("#loadingImg").addClass("hide");
            alert("截图失败请稍后尝试");
        }
    })
}
showOriganImg = function(obj, path, type){
    $("#modifyPic").empty();
    //<div id='OriganImg_wrap'><span id='origanImgSpan'></span>
    var inner = 
            "<img id='OriganImg' src='" + path + "' />";
    inner += '<div id="coords"><label>X1 <input type="text" size="4" id="x1" name="x1" /></label>'
             +'<label>Y1 <input type="text" size="4" id="y1" name="y1" /></label>'
             +'<label>X2 <input type="text" size="4" id="x2" name="x2" /></label>'
             +'<label>Y2 <input type="text" size="4" id="y2" name="y2" /></label>'
             +'<label>W <input type="text" size="4" id="w" name="w" /></label>'
             +'<label>H <input type="text" size="4" id="h" name="h" /></label>';
    inner += '<input type="button" id="OriganImgSub" value="提交">';
    inner +='</div>';
    $('#modifyPic').append(inner);
    // $('#reduceImgWidth').click(function(){
    //     var width = $("#OriganImg").width();
    //     width = 0.9 * width;
    //     $("#OriganImg").css("width", width+"px");
    // })
    
    var op = {
        type: 1,
        title:"图片剪切",
        content: $('#modifyPic'),
        area: ['700px', '600px'],
        btn: ['确定', '取消'],
        yes: function(index){
            sendBndbox();
            $('#modifyPic').find('*').remove();
            layer.close(layerIndex)
        },
        cancel: function(){ 
            // 右上角关闭回调
            $('#modifyPic').find('*').remove();
            layer.close(layerIndex)
        },
        btn2:function(){
            $('#modifyPic').find('*').remove();
            layer.close(layerIndex)
        }
        
    }
    var layerIndex = layer.open(op)
    
    var jcrop_api;
    $('#OriganImg').Jcrop({
        onChange:   showCoords,
        onSelect:   showCoords,
        onRelease:  clearCoords,
        aspectRatio:1/1
    }, function(){
        jcrop_api = this;
    });
    
    function showCoords(c)
      {
        $('#x1').val(c.x);
        $('#y1').val(c.y);
        $('#x2').val(c.x2);
        $('#y2').val(c.y2);
        $('#w').val(c.w);
        $('#h').val(c.h);
      };
      
      function clearCoords()
      {
        $('#coords input').val('');
      };
      function sendBndbox(){
          var showHeight = $("#OriganImg").height();
          var naturalHeight = document.getElementById("OriganImg").naturalHeight;
          var naturalWidth = document.getElementById("OriganImg").naturalWidth;
          //图片的缩放比例。
          var radio = showHeight / naturalHeight;
          var x = Math.round($('#x1').val()/radio)/naturalWidth;
          var y = Math.round($('#y1').val()/radio)/naturalHeight;
          var w = Math.round($('#w').val()/radio)/naturalWidth;
          var h = Math.round($('#h').val()/radio)/naturalHeight;
          // 进行判断 是否能够提交
          var param ={
                  option:1,
                  photo_path:path,
                  x:x,
                  y:y,
                  w:w,
                  h:h
          }
          $.ajax({
            url:"/deepface/cropface",
            data:param,
            type:"POST",
            sync:true,
            success:function(data){
                var code = data.code;
                var msg = data.message;
                if(code != 0){
                    alert(msg);
                }else{
                    var data = data.data;
                    //将attach中的路径也替换。
                    attach_url[path] = data.crop_path;
                    //替换原图片.
                    replace_organ_img(data.crop_path, path);

                    //替换证件照。
                    set_card_img_auto(data.crop_path);
                    // addSingleAttachImg(data.crop_path, data.photo_path);
                }
                layer.close(layerIndex);
                $("#modifyPic").empty();
            },
            error:function(data){
                alert("请稍后尝试");
            }
          })
          
      }
}

replace_organ_img = function(crop_path, photo_path){
    //截图获取得到的图片把原来的图片替换掉。
    var selector = "#imgContainer img[osrc='"+ photo_path +"']";
    console.log(selector);
    $(selector).attr("src", crop_path);
}
});