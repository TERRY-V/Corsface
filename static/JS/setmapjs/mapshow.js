var time = new Date();
time = time.getTime();
function DrawImage(ImgD, FitWidth, FitHeight) {
	var image = new Image();
	image.src = ImgD.src;
	if (image.width > 0 && image.height > 0) {
		if (image.width / image.height >= FitWidth / FitHeight) {
			if (image.width > FitWidth) {
				ImgD.width = FitWidth;
				ImgD.height = (image.height * FitWidth) / image.width;
			} else {
				ImgD.width = image.width;
				ImgD.height = image.height;
			}
		} else {
			if (image.height > FitHeight) {
				ImgD.height = FitHeight;
				ImgD.width = (image.width * FitHeight) / image.height;
			} else {
				ImgD.width = image.width;
				ImgD.height = image.height;
			}
		}
	}
}

function Inti_MapShow() {
    $.ajaxSetup({cache:false});
	MapShow();
	$('.monitoring_rtsp').on(
			'click',
			'img',
			function() {
				var id = $(this).attr('id');
				var src= $(this).attr('src');
				if (src.indexOf('maperror.png')<0) {
					$('.sign').removeClass('currentMap');
					$(this).parent().find('.sign').addClass('currentMap');
					$.get('/system/mapcheck?id=' + id,
							function(data) {
							})
				}else if(src.indexOf('maperror.png')>=0){
					alert('该地图图片丢失,无法设置当前地图！');
				}
			});

	

}
MapShow = function() {
		var error="/static/Themes/Images/Other/maperror.png";
	$
			.get(
					"/system/map?time=" + time,
					function(result) {
						var ref=result.data.unline;
						var online = result.data.online;
						for (var i = 0; i < online.length; i++) {
							var ht="";
							var on = online[i];
							if (on.is_used == '1') {
								var current = 'sign currentMap'
							} else {
								var current = 'sign'
							}
							ht+='<div class="Map_PhotoShow" style="height: 300px">';
							ht+='<div class="Map_PhotoShow_Top">';
							ht+='<span class="Map_Photo_Font" style="font-size: 15px;">'+on.name+'</span><br>';
							ht+='<span class="Map_Photo_Font">(在线地图)</span>';
							ht+='</div>';
							ht+='<div class="Map_PhotoShow_Img">';
							ht+='<div class="'+current+'" id="baidu"></div>';
							ht+='<img class="Map_PhotoShow_Img" id="'+on.id+'"';
							ht+='src="'+on.img_path+'"';
							ht+='style="height: 220px; width: 300px;">';
							ht+='</div>';
							ht+='</div>';
							$("#online").append(ht);
						}
						for (var i = 0; i < ref.length; i++) {
							var ht = "";
                            if (!ref[i]["img_path"]) {
								ref[i]["img_path"]=error;
							}
							if (ref[i]["is_used"] == '1') {
								var current = 'sign currentMap'
							} else {
								var current = 'sign'
							}
							ht += "<div class='"
							ht += "Map_PhotoShow";
							ht += "'>";
							ht += "<div class='";
							ht += "Map_PhotoShow_Top";
							ht += "'>";
							ht += "<span class='";
							ht += "Map_Photo_Font";
							ht += "'style='font-size:15px;'>"
									+ ref[i].name + "</span><br>";
							ht += "<span class='";
							ht += "Map_Photo_Font' ";
							ht += ">(已经标注" + (ref[i]["num"])
									+ "个摄像头)</span>";
							ht += "</div >";
							ht += "<div class='";
							ht += "Map_PhotoShow_Img";
							ht += "'><div class='" + current + "'></div>";
							ht += "<img";
							ht += " class = 'Map_PhotoShow_Img' id='"
									+ ref[i].id + "'";
							ht += " src='" + ref[i].img_path;
							ht += "' style='height:220px;width:300px;'";
							ht += "  onerror='javascript:this.src="+error+";'>";
							ht += "<div class='button-group'>";
							ht += "<button type='button' da class='button  button-rounded button-look' id='"
									+ ref[i].id + "'";
							ht += "	style='background-color: transparent;' data-path='"+ref[i].img_path+"' onclick='javaScript:openMapPreview(this);'>";
							ht += "</button>";
							ht += "<button type='button' class='button  button-rounded button-edit'";
							ht += "	style='background-color: transparent;' name='"
									+ ref[i].id
									+ "' id='"
									+ ref[i].img_path
									+ "' onclick='javaScript:openMapChoose(this.name,this.id);'>";
							ht += "</button>";
							ht += "<button type='button' class='button  button-rounded button-delete' name='"
									+ ref[i].id + "'";
							ht += "	style='background-color: transparent;' onclick='deleteMap(this.name);'>";
							ht += "</button>";

							ht += "</div>";
							ht += "<span style='text_align:center;' class='MNotes' title='"+ref[i].remark+"'>"+ref[i].remark+"</span>"
							ht += "</div>";
							ht += "</div>";
							$(".Map_Photoup").before(ht);
						}
						
						
					});

}


String.prototype.limit=function(len){
	var str = "",tempStr = this;
	if(tempStr.length>len){
        str = tempStr.substring(0,len);
        str = "<span title=\"" + tempStr + "\">" + str + "..</span>";
        return str
    }
	return str = "<span title=\"" + tempStr + "\">" + tempStr + "</span>";;
}

function deleteMap(SAID) {
	var data = SAID;
	layer.confirm("是否删除该地图？", {title: "删除确认"}, function (index) {
            layer.close(index);
            $.post("/system/mapdel", {
            id:data
        }, function(data) {
            if (data.code == -1) {
                alert("请先删除该地图上摄像头再试");
            } else {
                location.reload();
                alert("请先删除该地图上摄像头再试");
            }
        });
        });
}
function openMapPreview(obj) {
	var MCID=obj.id;
	var mapPath=$(obj).attr('data-path');
	if (mapPath.indexOf('maperror.png')>=0) {
		alert('该地图图片丢失，无法预览!');
		return;
	}
	$.get('/system/mappoint',{id:MCID,time:time},
					function(data) {
						$('.marker_icon').remove();
						if (mapPath) {
								$('#map_img').attr('src', mapPath);
							}
						for (var i = 0; i < data.data.length; i++) {
							var marker = data.data[i];
							var PLeft = marker.point_left;
							if (PLeft != null) {
								var markerI = '<div class="marker_icon" data-location="'
										+ marker.point_left
										+ ','
										+ marker.point_top
										+ '" id="'
										+ marker.c_id
										+ '" style="left: calc('
										+ marker.point_left
										* 100
										+ '% - 10px);top: calc('
										+ marker.point_top
										* 100
										+ '% - 40px);">'
										+ marker.camera_name + '</div>';
								$('.showMapPreview').append(markerI);
							}
						}
					});
	layer.open({
		type : 1,
		title : '地图预览',
		area : [ '800px', '600px' ],
		btn : [ '确定', '取消' ],
		content : $('#mapShow'),

		cancel : function() {

		}
	});
}
function openMapChoose(MCID, FPath) {
	if (FPath.indexOf('maperror.png')>=0) {
		alert('该地图图片丢失，无法编辑!');
		return;
	}
	window.location.href = "/corsface/mapchoose?MCID=" + MCID + "&FPath=" + FPath;
}
function show(tag) {
	var light = document.getElementById(tag);
	light.style.display = 'block';
}
function hide(tag) {
	var light = document.getElementById(tag);
	light.style.display = 'none';
}
function check() {
	if ($("#AddressName").val() == "") {
		alert("请输入地图名称")
		return false;
	}
	if ($("#SAID").val()=="") {
		alert("请选择上传的图片");
		return false;
	}
	if($("#MNotes").val()==""){
		alert("请填写描述信息")
		return false;
	}
	var params = {
			"name":$("#AddressName").val(),
			"img_path":$("#SAID").val(),
			"remark":$("#MNotes").val()
		};
	$.post("/system/mapsave",params,function(data){
		if(data.code==0){
			location.reload();
		}
	});
	return true;

}

function setmaptype() {
	var params = {
			"type":$("#setmaptype").val()
		};
	$.post("/system/setmaptype",params,function(data){
		if(data.code==0){
			location.reload();
		}
	});
	return true;

}
$(function(){
    $("#file").fileupload({
        url: "/system/mapupload",
        autoUpload: true,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png|svg|bmp)$/i
    }).on('fileuploadprocessalways', function (e, data) {
        $("#loadingImg").removeClass("hide")
        var index = data.index,
            file = data.files[index];
        if (file.error) {
            alert(file.error);
        }
    }).on('fileuploadprogressall', function (e, data) {
        $("#loadingImg").removeClass("hide")
    }).on('fileuploaddone', function (e, data) {
        
        $('#photo').attr("src",data.result.img_url);
        document.getElementById("SAID").value=data.result.img_url;
        return;
        console.log(data);
    }).on('fileuploadfail', function (e, data) {
        $("#loadingImg").addClass("hide")
        alert("文件上传失败，请稍后重试");
    })
});

function primg(imgFile, imgId, targetId) {
	var path = imgFile.value;
	var filepath = imgFile.value;
	var extStart = filepath.lastIndexOf(".");
	var ext = filepath.substring(extStart, filepath.length).toUpperCase();
	if (ext != ".BMP" && ext != ".PNG" && ext != ".GIF" && ext != ".JPG"
			&& ext != ".JPEG" && ext != ".SVG") {
		alert("图片限于BMP,png,gif,jpeg,jpg,svg格式");
		return false;
	}

	 $("#file").fileupload({
	        url: "/system/mapupload",
	        autoUpload: true,
	        acceptFileTypes: /(\.|\/)(gif|jpe?g|png|bmp|svg)$/i
	    }).on('fileuploadprocessalways', function (e, data) {
	    }).on('fileuploadprogressall', function (e, data) {

	    }).on('fileuploaddone', function (e, data) {
	        
	        $('#photo').attr("src",data.result.img_url);
    	    document.getElementById("SAID").value=data.result.img_url;
       		 return;
	    }).on('fileuploadfail', function (e, data) {
	        alert("文件上传失败，请稍后重试");
	    });
}
