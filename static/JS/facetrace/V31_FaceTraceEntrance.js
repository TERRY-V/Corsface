/**
 * Created by ziling on 2017/10/20.
 */
var attach_url=[],amCameraId=[],allCamera = [],init_params={};
function Init_FaceTraceEntrance(){
    laydate.render({
        elem: '#startTime',
        type: 'datetime',
        value: "",
        done: function(date) {
            init_params.startTime = date
        }
    });
    laydate.render({
        elem: '#endTime',
        type: 'datetime',
        value: "",
        done: function(date) {
            init_params.endTime = date
        }
    });

    $.get('/deepface/person/group',function (data) {
        if(data.code=='0'){
            var data = data.data;
            for(var i in data.groups){
                $('#personGroup').append('<option value="'+data.groups[i].uuid+'">'+data.groups[i].name+'</option>')
            }
        }
    });
    $.get('/deepface/devicelist',function (data) {
        if(data.code=='0'){
            var data = data.data.recognize;
            for(var i in data){
                $('#recognize').append('<option value="'+data[i].id+'">'+data[i].server_name+'</option>');
                $('#recognizeT').append('<option value="'+data[i].id+'">'+data[i].server_name+'</option>')
                $('#recognizeA').append('<option value="'+data[i].id+'">'+data[i].server_name+'</option>')
            }
        }
    });
    $.get('/deepface/camerainfo?TagName=getCameraTree',function (res) {
        if(res.code=='0'){
            getCameraSYNCN(res);
        }else {
            console.log(res);
        }
    });
    $('#getAttr').click(function () {
        if(attach_url.length<1){
            alert('请添加图片');
            return;
        }
        showLoading();
        var photo_path = $(this).attr('data-img');
        var param = {"option":2, photo_path:photo_path};
        $.ajax({
            url:"/deepface/cropface",
            data:param,
            type:"POST",
            sync:true,
            success:function(res){
                if(res.code=='0'){
                    createTableLi(res.data)
                }else {
                    console.log(res);
                }
            }})
    });
    $('#getPerson').click(function () {
        if(attach_url.length<1){
            alert('请添加图片');
            return;
        }
        showLoading();
        var recognize_id = $('#recognize').val(),groupId = $('#personGroup').val()?[$('#personGroup').val()]:[];
        $.post('/analysis/searchperson',{crop_path:JSON.stringify(attach_url),recognize_id:recognize_id,group_ids:JSON.stringify(groupId)},function (res) {
            if(res.code=='0'){
                createPerson(res.data.matches)
            }else {
                console.log(res);
            }
        });
    });
    $('#getTrace').click(function () {
        if(attach_url.length<1){
            alert('请添加图片');
            return;
        }
        showLoading();
        var camID = amCameraId;
        var startT = $('#startTime').val();
        var endT = $('#endTime').val();

        var recognize_id = $('#recognizeT').val();
        $.post('/analysis/searchfacetrack',{crop_path:JSON.stringify(attach_url),recognize_id:recognize_id,src_ids:JSON.stringify(camID),datetime_begin:startT,datetime_end:endT},function (res) {
            if(res.code=='0'){

                var resData = res.data.matches.slice(0,12);
                var rData = resData.sort(function (a, b) {
                    var at = a.time,bt = b.time;
                    at = at.replace('-','/'),bt = bt.replace('-','/');
                    at = new Date(at),bt = new Date(bt);
                    return bt.getTime() -at.getTime()
                });
                createTrace(rData)
            }else {
                console.log(res);
            }
        });
    });


    $('.content_select_title h3').click(function () {
        if($(this).hasClass('act')){
            return;
        }
        $('.content_select_title h3').removeClass('act');
        $(this).addClass('act');
        $('.createAndtrace').addClass('hide');
        $('.face_filter').removeClass('act');
        if(this.id=='personSearch'){
            $('#personFilter').removeClass('hide');
            $('#face_filter').addClass('act')
        }else if(this.id == 'personAttribute'){
            $('#attrFilter').removeClass('hide');
            $('#attr_filter').addClass('act')
        }else {
            $('#traceFilter').removeClass('hide');
            $('#trace_filter').addClass('act')
        }
    })
        //图片处理与上传。
        $("#fileupload").change(function(){
            //先完成单张图片的。
            showLoading();
            var files = this.files;
            // if(files.length <= 0){
            //     alert("请选择图片");
            //     return false;
            // }
            var file = this.files[0];
            // 限制图片大于2兆
            if(file.size/1024/1024 > 1 ) {
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
            reader.onload = function(e){
                temp = this.result;
                var base64_img = "";
                if(temp){
                    base64_img = temp.split(",")[1];
                }
                // file_base64.push(temp);
                var param = {"image":base64_img};
                send_base64_img(param);
            };
            this.value = ''
        })
    // 上传图片获取url
        send_base64_img = function(param){
            $("#loadingImg").removeClass("hide");
            $.ajax({
                url:"/deepface/uploadimage",
                data:param,
                type:"POST",
                sync:true,
                success:function(data){
                    var code = data.code;
                    var msg = data.message;
                    $("#loadingImg").addClass("hide");
                    if(code == 0){
                        //图片上传成功后再次去做crop工作;
                        var photo_path = data.data.photo_path;
                        var param = {"option":2, photo_path:photo_path};
                        $('#getAttr').attr('data-img',photo_path);
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
        };
        // 获取剪切图片
    crop_face = function(param){
        $.ajax({
            url:"/deepface/cropface",
            data:param,
            type:"POST",
            sync:true,
            success:function(data){
                var code = data.code;
                var msg = data.message;
                if(code == 0){
                    data = data.data;
                    setOriganImg(data.crop_path,param.photo_path);
                    attach_url.push(data.crop_path);
                }else if(code == -3){
                    alert("图片没有发现人脸，请尝试截图获取");
                    // setOriganImg(param.photo_path);
                    // attach_url.push(param.photo_path);
                    // addSingleAttachImg(param.photo_path, param.photo_path, "", "no_face");
                }
            }
        })
    }
}

function createTrace(data) {
    $('.trace_wrap_top').empty();
    $('.trace_line').empty();
    $('.trace_wrap_bottom').empty();
    if(data.length<1){
        $('.trace_wrap_top').append('<p style="text-align: center;font-size: 18px;position: absolute;top:40px;left: 100px">没有匹配结果！</p>');
    }
    for(var i in data){
        var maches = Math.ceil(data[i].score*10000)/100,name=data[i].name?data[i].name:'未知',caname=data[i].src_name?data[i].src_name:'未知摄像头',ctime = data[i].time? data[i].time:'未知时间';

        if(caname.length>10){
            caname = caname.substr(0,8) + '...'
        }

        var html = '<div class="facetrace_module" > ' +
            '<div class="facetrace_module_info"> ' +
            '<div class="facetrace_module_camera">'+caname+'</div> ' +
            '<div class="facetrace_module_maches">可信度：'+maches+'%</div> ' +
            '<div class="facetrace_module_time">'+ctime+'</div> ' +
            '</div> ' +
            '<div class="facetrace_module_img" onclick="getFaceTrack(\''+data[i].id_facetrack+'\')"> ' +
            '<img src="'+ data[i].image +'" alt=""> ' +
            '</div> ' +
            '</div>';
        if(i%2=='0'){
            $('.trace_wrap_top').append(html)
        }else {
            $('.trace_wrap_bottom').append(html)
        }
        if(i>=1){
            $('.trace_line').append('<div></div>')
        }
    }
    $('.trace_line').append('<div></div>');
    removeLoading()
}
function createPerson(data) {
    $('#personFilter').empty();
    if(data.length<1){
        $('#personFilter').append('<p style="text-align: center;margin-top: 40px;font-size: 18px">没有匹配结果！</p>');
    }
    for(var i in data){
        if(i>=14){
            break;
        }
        var maches = Math.ceil(data[i].score*10000)/100,name=data[i].name?data[i].name:'未知',cid = data[i].id_card?data[i].id_card:' ';
        var html = '<div class="result_card"> ' +
            '<div class="result_confidence">可信度：'+maches+'%</div> ' +
            '<div class="result_img"> ' +
            '<img src="'+ data[i].face_image +'" > ' +
            '</div> ' +
            '<div class="result_name">'+name+'</div> ' +
            '<div class="result_id">'+cid+'</div> ' +
            '<div class="result_btn">' +
            '<div class="result_detail" data-id="acb993be-8a0f-40d9-aeab-f8e40d1f63a0" onclick="goDetails(\''+data[i].id_person+'\')">详情</div>' +
        // '<div class="result_add" data-id="" onclick="merginPic(this, \''+data[i].id_person+'\')">添加</div>' +
        '</div> ' +
        '</div>';
        $('#personFilter').append(html)
    }
    removeLoading()
}
function imgNotFound(obj){
    // obj.getAttribute('onerror') = "";
    // obj.src = "/CorsFace/Attach/icon/imgNotFound144.png";
    // return true;
}
function goDetails(id) {
    var url ='/corsface/getpersoninfo?pid=' + id;
    var pa = {
        type: 2,
        title: '人物详情',
        area: ["600px", "800px"],
        content: url,
        resize: false

    };
    layer.open(pa);
    $('iframe')[0].onload = function () {
        var ifdom = $('iframe')[0].contentDocument;
        $(ifdom).find('#goBack').remove();
    }
}

function createTableLi(data) {
var age = data.age>0?data.age+'岁':'--',sex,glasses;
    if(data.sex=='0'){
        sex = '男'
    }else if(data.sex=='1'){
        sex = '女'
    }else {
        sex = "--"
    }
    if(data.glasses=='1'){
        glasses = '有'
    }else if(data.glasses=='2'){
        glasses = '无'
    }else {
        glasses = "--"
    }
    $('#attributeA').empty();
    var date = new Date();
    var d = date.getDate()>=10?date.getDate():'0'+date.getDate();
    var M = (date.getMonth() + 1)>=10?(date.getMonth() + 1):'0'+date.getDate();;
    var y = date.getFullYear();
    var s = date.getSeconds()>=10?date.getSeconds():'0'+date.getSeconds();
    var h = date.getHours()>=10?date.getHours():'0'+date.getHours();
    var m = date.getMinutes()>=10?date.getMinutes():'0'+date.getMinutes();
    var nowTime = y+'-'+M+'-'+d+' '+h+':'+m+':'+s;
    var html  = '<tr><td style="width: 160px">年龄</td><td>'+age+'</td></tr> ' +
        '<tr><td>性别</td><td>'+sex+'</td></tr> ' +
        '<tr><td>民族</td><td>--</td></tr> ' +
        '<tr><td>眼镜</td><td>'+glasses+'</td></tr> ' +
        '<tr><td>表情</td><td>--</td></tr> ' +
        '<tr><td>分析时间</td><td>'+nowTime+'</td></tr>';
    $('#attributeA').append(html);
    removeLoading();
}

function getFaceTrack(id){

    $.post('/deepface/facetrack/getfacetrackinfo',{facetrack_id:id},function (data) {
        $('#media_BImg img')[0].src = data.data.facetrack.scene_image;
        $('#media_images').empty();
        for(var i in data.data.facetrack.images){
            $('#media_images').append('<img src="'+ data.data.facetrack.images[i] +'" />')
        }
    });

    //iframe窗
    layer.open({
        type: 1,
        title: '场景图',
        shade: [0.4],
        area: ['740px', '300px'],
        //			time: 2000, //2秒后自动关闭
        anim: 1,
        content: $('#showFaceTrack') //iframe的url，no代表不显示滚动条
    });
}

// 上传后创建图片
function setOriganImg(path,oPath){
    var origanImg = '<div class="origanal" onmouseenter="showMask(this)" onmouseleave="hiddenMask(this)">'
        +'<div class="delete">'
        +'<a class="btn btn-social-icon btn-edit " onclick=showOriganImg(this,\''+oPath+'\',\''+path+'\')></a></div>'
        +'<div class="edit"><a class="btn btn-social-icon btn-delete btn-center" onclick="origan_img_delect(this,\''+ path+'\')"></a></div>'
        +'</i>'
        +'<div class="img img-mid"><span></span><img src="'+path+'" /></div>'
        +'</div>';
    $(".scroll_x").prepend(origanImg);
    removeLoading();
    createClickSlide($(".scroll_x")[0]);
}
// 编辑图片
showOriganImg = function(obj, path,cpath){
    $("#modifyPic").empty();
    var inner =
        "<img id='OriganImg' style='max-width: 694px;max-height: 505px ' src='" + path + "' />"
    inner += '<div id="coords"><label>X1 <input type="text" size="4" id="x1" name="x1" /></label>'
        +'<label>Y1 <input type="text" size="4" id="y1" name="y1" /></label>'
        +'<label>X2 <input type="text" size="4" id="x2" name="x2" /></label>'
        +'<label>Y2 <input type="text" size="4" id="y2" name="y2" /></label>'
        +'<label>W <input type="text" size="4" id="w" name="w" /></label>'
        +'<label>H <input type="text" size="4" id="h" name="h" /></label>';
    inner += '<input type="button" id="OriganImgSub" value="提交"></input>';
    inner +='</div>';
    $('#modifyPic').append(inner);
    $('#reduceImgWidth').click(function(){
        var width = $("#OriganImg").width();
        width = 0.9 * width;
        $("#OriganImg").css("width", width+"px");
    });
    var imgObj = $(obj).parent().parent().find('img')[0];

    var op = {
        type: 1,
        title:"图片剪切",
        content: $('#modifyPic'),
        area: ['700px', '600px'],
        btn: ['确定', '取消'],
        yes: function(index){
            sendBndbox(imgObj);
            $('#modifyPic').find('*').remove();
            layer.close(layerIndex)
        },
        cancel: function(){
            //右上角关闭回调
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
        onRelease:  clearCoords
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
    function sendBndbox(obj){
        var showHeight = $("#OriganImg").height();
        var showPWidth = $("#modifyPic").width();
        var showPHeight = $("#modifyPic").height();

        var naturalHeight = document.getElementById("OriganImg").naturalHeight;
        var radio = showHeight / naturalHeight;
        var x = $('#x1').val()/showPWidth;
        var y = $('#y1').val()/showPHeight;
        var w = $('#w').val()/showPWidth;
        var h = $('#h').val()/showPHeight;
        // 进行判断 是否能够提交
        var param ={
            option:1,
            photo_path:path,
            x:x,
            y:y,
            w:w,
            h:h
        };
        $.post('/deepface/cropface', param, function(data){
            if(!data){
                alert("参数有误, 请用画线设置");return;
            }
            var attachImgInfo = data.data;
            var cPath = $('.origanal img').attr('src');
            for(var i in attach_url){
                if(attach_url[i]==cPath){
                    attach_url.splice(i,1)
                }
            }
            attach_url.push(attachImgInfo.crop_path);
            setOneAttach(attachImgInfo,obj);
            layer.close(layerIndex);
            $("#modifyPic").empty();
        })
    }
};
// function vedioImgParse(IP, transactionId){
//     var myVar = setInterval(function(){
//         var param = {
//             IP:IP,
//             type:"getfacetrackidinvideoImg",
//             transactionId:transactionId
//         }
//         $.ajax({
//             url:"/CorsFace/traceAction.action",
//             data:param,
//             async:true,
//             type:"POST",
//             success:function(data){
//                 var data = JSON.parse(data);
//                 if(data.code == 0){
//                     clearInterval(myVar);
//                     var tmp = {"returnPath":data.imgs};
//                     var conData = {"result":tmp};
//                     //data['result']['']=data.imgs;
//                     addReturnAttrachs(conData, 1);return;
//                 }else if(data.code == 1){
//                     clearInterval(myVar);
//                     $("#loadingImg").addClass("hide");
//                     alert(data.msg);return;
//                 }
//             },
//             error:function(){
//                 clearInterval(myVar);
//                 alert("服务器连接失败稍后重试");
//             }
//         })
//     }, 1000);
// }
//
// //添加识别处理出来的图片信息
// function addReturnAttrachs(data, vedio){
//     $("#loadingImg").addClass("hide");
//     var returnPath = data.result.returnPath;
//     if(!returnPath || returnPath.length == 0){
//         alert("未识别出人脸");
//     }
//     if(!vedio){
//         //不是vedio的情况，设置原图，后者这个会更加细致的弄。视频的截图。
//         setOriganImg(returnPath[0]["OriganImg"], returnPath[0]["SAID"]);
//     }
//
//     if(returnPath[0]["msg"]){
//     	alert(returnPath[0]["msg"]);return;
//     }
//     if(returnPath[0]["noFace"] || returnPath.length == 0){
//         alert("未发现人脸,请尝试其他图片或者视频");return;
//     }
//     $.each(returnPath, function(index, attachInfo){
//         setOneAttach(attachInfo);
//     })
// }
function setOneAttach(attachInfo,obj){
    obj.src = attachInfo.crop_path;
    $(obj).parent().parent().find('.edit>a').attr('onclick','origan_img_delect(this,"'+ attachInfo.crop_path +'")')
}

edit_img_delect = function (obj, attachId) {
    var _this = obj;

    jQuery.post('/CorsFace/personAttach.action', {type:"deleteAttach", attachId: attachId}, function (data) {
        var data = JSON.parse(data);
        if(data && data.errcode == 0){
            $(_this).parent().parent().parent().remove()
        }else{
            alert('删除失败！')
        }
    })
};


origan_img_delect = function(obj, path){
    var _this = obj;
    for(var i in attach_url){
        if(attach_url[i]==path){
            attach_url.splice(i,1)
        }
    }
    $(_this).parent().parent().remove();
    createClickSlide($('.scroll_x')[0])
};
showMask = function (obj) {
    var _this = obj;
    $(_this).find('.img_mask').addClass('img_hover');
}
hiddenMask = function (obj) {
    var _this = obj;
    $(_this).find('.img_mask').removeClass('img_hover')
}


function getCameraSYNCN(results){
    var zNodes = [];
    try {

        var rel = results.data;

        for (var i = 0; i < rel.length; i++) {
            var item = {id: rel[i].group_name, pId: '0', name: rel[i].group_name, open: false, nocheck: true};
            for (var j = 0; j < rel[i].cameras.length; j++) {
                var inner_item = {
                    id: rel[i].cameras[j].src_id,
                    pId: rel[i].group_name,
                    name: rel[i].cameras[j].camera_name
                };
                zNodes.push(inner_item);
                allCamera.push(rel[i].cameras[j].src_id)
            }
            zNodes.push(item)
        }
        zNodes.push({
            id: '0',
            pId: '-1',
            name: '全部',
            open: false
        })
    }catch (e){
        console.log(e)
    }
    zNodes = zNodes.reverse();
    $.fn.zTree.init($("#treeDemo"), setting, zNodes);
    return zNodes
}

function showLoading() {
    $('#loading').remove();
    var loading = document.createElement('img');
    loading.id = 'loading';
    loading.src = '/static/Themes/Images/ICON/loading.gif';
    $('body').append(loading)
}
function removeLoading() {
    $('#loading').remove();
}
function createClickSlide(obj) {
    var width = $(obj).width()+30,
        parentObj = $(obj).parent(),
        parentWidth = $(obj).parent().width(),maxL = parentWidth - width;
    $(obj).find('#goLeft').remove();
    $(obj).find('#goRight').remove();
    if(maxL>=0){
        $(obj).css({'padding':'0','left':'0'});
        return false;
    }
    $(obj).css('padding','0 15px');
    parentObj.append('<span id="goLeft" style="position: absolute;cursor:pointer;top: 0;left: 0;display: block;width: 15px;height: 100%;z-index: 100;background: #002c40 url(/static/Themes/Images/ICON/goleft.png) no-repeat center;background-size: 15px 30px"></span>' +
        '<span id="goRight" style="position: absolute;top: 0;cursor:pointer;right: 0;display: block;width: 15px;height: 100%;z-index: 100;background: #002c40 url(/static/Themes/Images/ICON/goright.png) no-repeat center;background-size: 15px 30px"></span>')

    $('#goLeft').click(function () {
        var transX = $(obj).css('left'),a=1;
        transX = Number(transX.replace('px',''));

        if(transX>=0){
            return false;
        }
       var slideInterval = setInterval(function () {
           transX = transX+20;
           a++;
           if(transX>=0){
               transX = 0;
               clearInterval(slideInterval)
           }
           if(a>=10){
               clearInterval(slideInterval)
           }
           $(obj).css('left',transX+'px');
       },40)

    })
    $('#goRight').click(function () {
        var transX = $(obj).css('left'),a=1;
        transX = Number(transX.replace('px',''));
        if(transX<=maxL){
            return false;
        }
        var slideInterval = setInterval(function () {
            transX = transX-20;
            a++;
            if(transX<=maxL){
                transX = maxL;
                clearInterval(slideInterval)
            }
            if(a>=10){
                clearInterval(slideInterval)
            }
            $(obj).css('left',transX+'px');
        },40)

    })


}