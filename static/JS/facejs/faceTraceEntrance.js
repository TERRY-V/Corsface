/**
 * Created by ziling on 2017/10/20.
 */

function Init_FaceTraceEntrance(){
    $(function(){

        $("#fileupload").fileupload({
            url: "/CorsFace/uploadfile.action",
            autoUpload: true,
            formData:{type:"faceOrVedio"},
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        }).on('fileuploadprocessalways', function (e, data) {
            $("#loadingImg").removeClass("hide")
            var index = data.index,
                file = data.files[index];
            if (file.error) {
                alert(file.error);
            }
        }).on('fileuploadprogressall', function (e, data) {
        	 $("#loadingImg").removeClass("hide")
            $(".progress").attr("display","block");
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css(
                'height',
                progress + '%'
            );

        }).on('fileuploaddone', function (e, data) {
            $('#progress .progress-bar').css(
                'height',
                0 + '%'
            );
            $(".progress").attr("display","none");
            var isVedio = "";
            
            try{
                isVedio = data.result.returnPath[0]['isVedio'];
            }catch(e){
            	console.log("error")
            }
            if(isVedio){
                alert("视频文件解析时间较长，还请耐心等待");
                var IP = data.result.returnPath[0].IP;
                var transactionId = data.result.returnPath[0].transactionId;
                vedioImgParse(IP, transactionId);
            }else{
                addReturnAttrachs(data);return;
            }
        }).on('fileuploadfail', function (e, data) {
            alert("文件上传失败，请稍后重试");
        }).on("fileuploadsend", function(e, data){
            if(compareImg.length ==2){
                alert("比对人物只需要两个人就足够了");return;
            }

        });
    });
}

function vedioImgParse(IP, transactionId){
    var myVar = setInterval(function(){
        var param = {
            IP:IP,
            type:"getfacetrackidinvideoImg",
            transactionId:transactionId
        }
        $.ajax({
            url:"/CorsFace/traceAction.action",
            data:param,
            async:true,
            type:"POST",
            success:function(data){
                var data = JSON.parse(data);
                if(data.code == 0){
                    clearInterval(myVar);
                    var tmp = {"returnPath":data.imgs};
                    var conData = {"result":tmp};
                    //data['result']['']=data.imgs;
                    addReturnAttrachs(conData, 1);return;
                }else if(data.code == 1){
                    clearInterval(myVar);
                    $("#loadingImg").addClass("hide");
                    alert(data.msg);return;
                }
            },
            error:function(){
                clearInterval(myVar);
                alert("服务器连接失败稍后重试");
            }
        })
    }, 1000);
}

//添加识别处理出来的图片信息
function addReturnAttrachs(data, vedio){
    $("#loadingImg").addClass("hide")
    var returnPath = data.result.returnPath;
    if(!returnPath || returnPath.length == 0){
        alert("未识别出人脸");
    }
    if(!vedio){
        //不是vedio的情况，设置原图，后者这个会更加细致的弄。视频的截图。
        setOriganImg(returnPath[0]["OriganImg"], returnPath[0]["SAID"]);
    }

    if(returnPath[0]["msg"]){
    	alert(returnPath[0]["msg"]);return;
    }
    if(returnPath[0]["noFace"] || returnPath.length == 0){
        alert("未发现人脸,请尝试其他图片或者视频");return;
    }
    $.each(returnPath, function(index, attachInfo){
        setOneAttach(attachInfo);
    })
}
function setOneAttach(attachInfo){
    $(".face_edit .imgEdit").remove();
    var origanImgPath = attachInfo['OriganImg'];
    var path = attachInfo['FPath'];
    var attachId = attachInfo['SAID'];
    var attachStr = "";
    if(functionType == "trace" || functionType =="personSearch"){
        attachStr = '<div class="trance">'
            +'<div class="singeleImg">'
            +'<div class="delete"><a class="btn btn-delete" onclick="edit_img_delect(this, \''+attachId+'\')"></a></div>'
            +'<div class="edit"><a class="btn btn-edit"  onclick=showOriganImg(this,\''+origanImgPath+'\')></a></div>'
            +'<img src="/CorsFace'+path+'" >'
            +'</div>'
            +'<div class="addChoise">'
            +'<div style="margin:10%">'
            +'<input type="radio" class="addChoiseInput" name="glass" value="0"> 不带眼镜'
            +'<br>'
            +'<input type="radio" class="addChoiseInput" name="glass" value="1"> 墨镜'
            +'<br>'
            +'<input type="radio" class="addChoiseInput" name="glass" value="2"> 眼镜'
            +'<br>'
            +"<input type=button onclick=\"addPicToTrancePre(this"+",'"+ attachId +"','"+path +"')\" value=添加>"
            +'</div>' +
            '</div>' +
            '</div>';
    }
    if(functionType == "property"){
        var sex = attachInfo['sex'];
        sex = sex?"女":"男";
        var age = attachInfo['age'] + "岁";
        var glasses = attachInfo['glasses'];
        if(glasses ==1){
            glasses = "戴眼镜";
        }else{
            glasses = "未带眼镜";
        }
        attachStr = '<div class="trance">'
            +'<div class="singeleImg">'
            +'<div class="delete"><a class="btn btn-delete" onclick="edit_img_delect(this, \''+attachId+'\')"></a></div>'
            +'<div class="edit"><a class="btn btn-edit"  onclick=showOriganImg(this,\''+origanImgPath+'\')></a></div>'
            +'<img src="/CorsFace'+path+'" >'
            +'</div>'
            +'<div class="addChoise">'
            +'<div style="margin:10%">'
            +'<span>性别：'+sex +'</span>'
            +'<br>'
            +'<span>年龄: '+ age +'</span>'
            +'<br>'
            +'<span>眼镜: '+ glasses +'</span>'
            +'<br>'
            //+'<span>年龄: '+ "30岁" +'</span>'
            //+'<br>'
            +'</div>' +
            '</div>' +
            '</div>';
    }
    if(functionType =="faceCompeare"){
        if(compareImg.length <= 2){
            compareImg.push(attachId);

        }else{
            alert("比对人物只需要两个人就足够了");return;
        }

    }
    console.log(attachStr);
    $(".face_edit").append(attachStr);
}

edit_img_delect = function (obj, attachId) {
    var _this = obj;

    jQuery.post('/CorsFace/personAttach.action', {type:"deleteAttach", attachId: attachId}, function (data) {
        var data = JSON.parse(data)
        if(data && data.errcode == 0){

            $(_this).parent().parent().parent().remove()

        }else{
            alert('删除失败！')
        }
    })
}

function setOriganImg(path, attachId){
    var origanImg = '<div class="origanal" onmouseenter="showMask(this)" onmouseleave="hiddenMask(this)">'
        +'<div class="delete">'
        +'<a class="btn btn-social-icon btn-edit " onclick=showOriganImg(this,\''+path+'\')></a></div>'
        +'<div class="edit"><a class="btn btn-social-icon btn-delete btn-center" onclick="origan_img_delect(this,\''+ attachId+'\')"></a></div>'
        +'</i>'
        +'<div class="img img-mid"><span></span><img attachId="'+attachId+'" src="'+ "/CorsFace"+path+'" /></div>'
        +'</div>';
    $("#imgPrepare").prepend(origanImg);
}
showOriganImg = function(obj, path){
    $("#modifyPic").empty();
    var inner =
        "<img id='OriganImg' style='max-width: 694px; ' src='/CorsFace" + path + "' />"
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
    })

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
    function sendBndbox(){
        var showHeight = $("#OriganImg").height();
        var naturalHeight = document.getElementById("OriganImg").naturalHeight;
        var radio = showHeight / naturalHeight;
        var x = Math.round($('#x1').val()/radio);
        var y = Math.round($('#y1').val()/radio);
        var w = Math.round($('#w').val()/radio);
        var h = Math.round($('#h').val()/radio);
        // 进行判断 是否能够提交
        var param ={
            type:"imgCutFuction",
            OriganImgPath:path,
            x:x,
            y:y,
            w:w,
            h:h
        }
        $.post('/CorsFace/uploadFaceTrackImg.action', param, function(data){
            if(!data){
                alert("参数有误, 请用画线设置");return;
            }
            var attachImgInfo = JSON.parse(data);
            setOneAttach(attachImgInfo)

            layer.close(layerIndex);
            $("#modifyPic").empty();
        })
    }
}
origan_img_delect = function(obj, attachId){
    var _this = obj;
    $(_this).parent().parent().remove();
    for(var i =0; i<faces.length; i++){
        if(faces[i]['attachId'] == attachId){
            faces.splice(i, 1);
        }
    }
    for(var i =0; i<compareImg.length; i++){
        if(compareImg[i] == attachId){
            compareImg.splice(i, 1);
        }
    }
}
showMask = function (obj) {
    var _this = obj;
    $(_this).find('.img_mask').addClass('img_hover');
}
hiddenMask = function (obj) {
    var _this = obj;
    $(_this).find('.img_mask').removeClass('img_hover')
}

addPicToTrancePre = function(obj, attachId, path){
    $(".createAndtrace .imgEdit").remove();
    var _this = obj;
    var glass = $(_this).parent().find("input[name='glass']:checked").val();
    var hair = $(_this).parent().find("input[name='hair']:checked").val();

    glass = glass?glass:0;
    hair = hair?hair:0;
    if(glass ==0 && hair==0){
        addOnePicToTrance(path, attachId);return;
    }
    var param ={
        type:"addGlassHair",
        imgPath:path,
        glassType:glass,
        hairType:hair,
    }
    $.post('/CorsFace/uploadFaceTrackImg.action', param, function(data){
        if(!data){
            alert("参数有误");return;
        }
        var attachImgInfo = JSON.parse(data);
        addOnePicToTrance(attachImgInfo['FPath'], attachImgInfo['SAID']);

    })
    // add function then;
}

addOnePicToTrance = function(path, attachId){
    var trance = '';
    trance +='<div class="singeleImg">'
        +"<div class=delete><a class='btn btn-delete' onclick=\"origan_img_delect(this" +",'"+attachId +"')\"></a></div>"
        +'<img src="/CorsFace'+ path+'">'
        +'</div>';
    var tmp ={"attachId":attachId, "path":path};
    faces.push(tmp);

    $(".imgContainer").append(trance);
}

var faces=[];
var functionType = "trace";
var compareImg=[];
$(document).ready(function() {
    $("#faceCompeare").click(function(){
        var length = compareImg.length;
        if(length <2){
            alert("人员比对需要两个人,请再次上传图片");
            return;
        }
        if(length >2){
            alert("上传图片多于两个，将比较最新两个人");
        }

        var tmpComImg = compareImg.slice(compareImg.length -2, compareImg.length);
        $.ajax({
            url:"/CorsFace/faceTrack.action",
            data:{"TagName":"faceCompare", "attachIds":tmpComImg.join("','")},
            async:true,
            type:"POST",
            success:function(data){
                if(data == "传入参数TagName为null。"){
                    alert("参数传输错误");
                }
                data = JSON.parse(data);
                if(data.code == 0) {
                    $(".face_edit").empty();
                    var path1 = "/CorsFace" + data['path1'];
                    var path2 = "/CorsFace" + data['path2'];
                    var score = data['score']*100;
                    var pmatchs = score.toFixed(0);
                    var compareImg = "";
                    compareImg = "<div class='compareImg'>"
                                +"<img src=" +path1+ " />"
                                +"<div class='warning_Matchs'>"+pmatchs+"</div>"
                                +"<img src=" +path2+ " />"
                                +"</div>";
                    $(".face_edit").append(compareImg);
                }else{
                    alert(data.msg);
                }
            },
            error:function(data){
                alert("服务暂时不可用，请稍后尝试。")
            }
        })
    })
    //功能转换内容
        $(".trace_nav_link").click(function(){
        	//进行页面的初始化。
        	faces = [];
        	compareImg=[];
        	$(".origanal").remove();
        	$(".trance").remove();
        	$(".face_edit").empty();
        	$(".face_edit").append('<div class="imgEdit">无人脸图片</div>');
        	$(".imgContainer").empty();
            var i = $(".createAndtrace .imgEdit");
            if(!i || i.length == 0){
                $(".createAndtrace").append('<div class="imgEdit">未添加人脸</div>');
            }

            $(".trace_nav_link").removeClass("active");
            $(this).addClass("active");
            functionType = $(this).attr("value");
            if(functionType == "property"){
            	//属性分析
            	$(".createAndtrace").parent().addClass("hide");
            	$("#faceCompeare").addClass("hide");
            	$(".face_edit").css("min-height", "545px");
            	
            }
            
            if(functionType =="personSearch"){
            	$("#trancePerson").addClass("hide");
            	$("#personCheck").removeClass("hide");
            	//
            	$(".createAndtrace").parent().removeClass("hide");
            	$("#faceCompeare").addClass("hide");
            	$(".face_edit").css("min-height", "259px");
            }
            
            if(functionType == "trace"){
            	$("#personCheck").addClass("hide");
            	$("#trancePerson").removeClass("hide");
            	//人物追踪
            	$(".createAndtrace").parent().removeClass("hide");
            	$("#faceCompeare").addClass("hide");
            	$(".face_edit").css("min-height", "259px");
            }
            if(functionType =="faceCompeare"){
            	//人脸对比
            	$(".createAndtrace").parent().addClass("hide");
            	$("#faceCompeare").removeClass("hide");
            	$(".face_edit").css("min-height", "545px");
            }
        })
		$("#createPerson").click(function(){
			if(faces == null || faces.length <1){
				alert("无人脸数据");
				return;
			}
			sessionStorage.removeItem("createPersonByImg")
            sessionStorage.setItem("createPersonByImg", JSON.stringify(faces));
			var url = '/CorsFace/Business/Person/Html/V30_Person_Form.html?type=createPersonByImg';
			layer.open({
                type: 2,
                title: '创建人物',
                shade: [0],
                area: ['860px', '800px'],
                //			time: 2000, //2秒后自动关闭
                anim: 2,
                content: [url] //iframe的url，no代表不显示滚动条
            });
		})

        $("#personCheck").click(function(){
        	if(faces == null || faces.length <1){
				alert("无人脸数据");
				return;
			}
            sessionStorage.removeItem("imgsForTraceDetail");
            var info = {
                "sourceImg":$(".origanal img").attr("src"),//获取其中一个原图片即可
                "attachInfo":faces
            }
            sessionStorage.setItem("imgsForTraceDetail", JSON.stringify(info));
            var url = '/CorsFace/Business/FaceInfo/Html/V31_TraceDetail.html';
            //iframe窗
            layer.open({
                type: 2,
                title: '人物检索',
                shade: [0],
                area: ['660px', '650px'],
                //			time: 2000, //2秒后自动关闭
                anim: 2,
                content: [url] //iframe的url，no代表不显示滚动条
            });
        });
		
		 $("#trancePerson").click(function(){
			 if(faces == null || faces.length <1){
				alert("无人脸数据");
				return;
			}
             var attachIds =[];
             for(var i = 0; i < faces.length; i++) {
                 attachIds.push(faces[i].attachId);
             }
             var param ={
                 "type":"createTranceByImgSync",
                 "attachIds":attachIds.join("','")
             }
             $.ajax({
                 url:"/CorsFace/traceAction.action",
                 data:param,
                 async:true,
                 type:"POST",
                 success:function(data){
                     data = JSON.parse(data)
                     var code = data['errcode']
                     if(code != 0){
                         alert(data['msg']);return;
                     }
                     //保存person图片
                     sessionStorage.removeItem("imgsForTraceDetail");
                     var info = {
                         "sourceImg":$(".origanal img").attr("src"),//获取其中一个原图片即可
                         "attachInfo":faces
                     }
                     sessionStorage.setItem("imgsForTraceDetail", JSON.stringify(info));

                     //在这里需要在每个服务器中创建一个facetrack，对于人物匹配来说只需要在一个服务器中获取匹配的人物就行。
                     //对于直接追踪来说，需要在每个服务器中访问数据。
                     ipAndfacetrackId = data['createInfo'];
                     //添加直接追踪的点击事件
                     sessionStorage.removeItem("ipAndfacetrackId");
                     sessionStorage.setItem("ipAndfacetrackId", JSON.stringify(ipAndfacetrackId));
                     var url = '/CorsFace/Business/FaceInfo/Html/FaceTrace.html?direct=' + 1 +"&type=trace";
                     window.location.href=url;
                     return;
                 }
             })
		 });
    })
