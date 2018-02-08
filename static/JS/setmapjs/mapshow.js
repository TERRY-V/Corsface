var time = new Date();
time = time.getTime();

// 图片等比例缩放
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
    $.ajaxSetup({cache: false});
    // 加载所有图片
    MapShow();
    // 改变当前使用的地图
    $('.monitoring_rtsp').on(
        'click',
        'img',
        function () {
            var id = $(this).attr('id');
            var src = $(this).attr('src');
            if (src.indexOf('maperror.png') < 0) {
                $('.sign').removeClass('currentMap');
                $(this).parent().find('.sign').addClass('currentMap');
                $.get('/system/mapcheck?id=' + id,
                    function (data) {
                        //console.log(data);
                    })
            } else if (src.indexOf('maperror.png') >= 0) {
                alert('该地图图片丢失,无法设置当前地图！');
            }
        });


}

// 加载图片
MapShow = function () {
    var error = "/static/Themes/Images/Other/maperror.png";
    $
        .get(
            "/system/map?time=" + time,
            function (result) {
                var ref = result.data.unline;
                var online = result.data.online;
                for (var i = 0; i < online.length; i++) {
                    var ht = "";
                    var on = online[i];
                    if (on.is_used == '1') {
                        var current = 'sign currentMap'
                    } else {
                        var current = 'sign'
                    }
                    ht += '<div class="Map_PhotoShow" style="height: 300px">';
                    ht += '<div class="Map_PhotoShow_Top">';
                    ht += '<span class="Map_Photo_Font" style="font-size: 15px;">' + on.name + '</span><br>';
                    ht += '<span class="Map_Photo_Font">(在线地图)</span>';
                    ht += '</div>';
                    ht += '<div class="Map_PhotoShow_Img">';
                    ht += '<div class="' + current + '" id="baidu"></div>';
                    ht += '<img class="Map_PhotoShow_Img" id="' + on.id + '"';
                    ht += 'src="' + on.img_path + '"';
                    ht += 'style="height: 220px; width: 300px;">';
                    ht += '</div>';
                    ht += '</div>';
                    $("#online").append(ht);
                }
                for (var i = 0; i < ref.length; i++) {
                    var ht = "";
                    if (!ref[i]["img_path"]) {
                        ref[i]["img_path"] = error;
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
                        + ref[i].name + "</span><br>";// 地图名
                    ht += "<span class='";
                    ht += "Map_Photo_Font' ";
                    ht += ">(已标注" + (ref[i]["num"])
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
                    ht += "  onerror='javascript:this.src=" + error + ";'>";
                    ht += "<div class='button-group'>";
                    ht += "<button type='button' da class='button  button-rounded button-look' id='"
                        + ref[i].id + "'";
                    ht += "	style='background-color: transparent;' data-path='" + ref[i].img_path + "' onclick='javaScript:openMapPreview(this);'>";
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
                    ht += "<span style='text_align:center;' class='MNotes' title='" + ref[i].remark + "'>" + ref[i].remark + "</span>"
                    ht += "</div>";
                    ht += "</div>";
                    $(".Map_Photoup").before(ht);
                }
                var maptype = result.data.type;
                console.log(maptype);
                $("input[name='setmaptype'][value=" + maptype + "]").attr("checked", true);
                /*if ($('.currentMap').length < 1) {
                    $('#baidu').addClass('currentMap')
                }*/
            });

}


String.prototype.limit = function (len) {
    var str = "", tempStr = this;
    if (tempStr.length > len) {
        str = tempStr.substring(0, len);
        str = "<span title=\"" + tempStr + "\">" + str + "..</span>";
        return str
    }
    return str = "<span title=\"" + tempStr + "\">" + tempStr + "</span>";
    ;
}

// 删除map及其相关表数据
function deleteMap(SAID) {
    var data = SAID;
    layer.confirm("是否删除该地图？", {title: "删除确认"}, function (index) {
        layer.close(index);
        $.post("/system/mapdel", {
            id: data
        }, function (data) {
            if (data.code == -1) {
                alert("请先删除该地图上摄像头再试");
            } else {
                location.reload();
            }
        });
    });
}

// 打开弹窗 获取MCID 根据MCID查询出坐标以及地图 打开地图预览
function openMapPreview(obj) {
    //var MCID = MCID;
    var MCID = obj.id;
    var mapPath = $(obj).attr('data-path');
    if (mapPath.indexOf('maperror.png') >= 0) {
        alert('该地图图片丢失，无法预览!');
        return;
    }
    $.get('/system/mappoint', {id: MCID, time: time},
        function (data) {
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
        type: 1,
        title: '地图预览',
        area: ['800px', '600px'],
        btn: ['确定', '取消'],
        content: $('#mapShow'),

        cancel: function () {
            // 右上角关闭回调

        }
    });
}

// 打开MapChooseHtml
function openMapChoose(MCID, FPath) {
    if (FPath.indexOf('maperror.png') >= 0) {
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

// 表单验证
function check() {
    if ($("#AddressName").val() == "") {
        alert("请输入地图名称")
        return false;
    }
    if ($("#SAID").val() == "") {
        alert("请选择上传的图片");
        return false;
    }
    if ($("#MNotes").val() == "") {
        alert("请填写描述信息")
        return false;
    }
    var params = {
        "name": $("#AddressName").val(),
        "img_path": $("#SAID").val(),
        "remark": $("#MNotes").val()
    };
    $.post("/system/mapsave", params, function (data) {
        if (data.code == 0) {
            location.reload();
        }
    });
    return true;

}

function setmaptype(type) {
    var params = {
        "type": type
    };
    $.post("/system/setmaptype", params, function (data) {
        if (data.code == 0) {
            if (type) {
                alert('启用成功');
            } else {
                alert('禁用成功');
            }
        }
    });
    return true;

}

//\
$(function () {
    $("#file").fileupload({
        url: "/system/mapupload",
        autoUpload: true,
        //formData:{type:"person"},
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
        //console.log(data.result.returnPath[0].OriganImg);
        $('#photo').attr("src", data.result.img_url);
        document.getElementById("SAID").value = data.result.img_url;
        return;
        console.log(data);
    }).on('fileuploadfail', function (e, data) {
        $("#loadingImg").addClass("hide")
        alert("文件上传失败，请稍后重试");
    })
});

// 上传图片格式验证
function primg(imgFile, imgId, targetId) {
    //console.log(imgId);
    var path = imgFile.value;
    var filepath = imgFile.value;
    var extStart = filepath.lastIndexOf(".");
    var ext = filepath.substring(extStart, filepath.length).toUpperCase();
    if (ext != ".BMP" && ext != ".PNG" && ext != ".GIF" && ext != ".JPG"
        && ext != ".JPEG" && ext != ".SVG") {
        alert("图片限于BMP,png,gif,jpeg,jpg,svg格式");
        return false;
    }
//	SCLogo = imgFile.files;
//	var re = new FileReader;
//	re.readAsDataURL(SCLogo);
//	re.onload=function(evt){
//		$("#photo").src=evt.target.result;
//	}
//	var im = imgFile.files[0];
//	var reader
    //var url = getFileUrl(imgId);

    /*var imgPre = document.getElementById(targetId);
    imgPre.src = path;
    var data = getBase64Image(imgPre);
    console.log("base64-->"+data);
    imgPre.src=data;
    document.body.appendChild(imgPre);
    return true;*/
    // 上传图片
    $("#file").fileupload({
        url: "/system/mapupload",
        autoUpload: true,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png|bmp|svg)$/i
    }).on('fileuploadprocessalways', function (e, data) {
    }).on('fileuploadprogressall', function (e, data) {

    }).on('fileuploaddone', function (e, data) {
        //if(!data.result.returnPath[0]){
        //  alert('图片保存失败！');
        //   return;
        // }
        //    console.log(data.result.returnPath[0]);
        $('#photo').attr("src", data.result.img_url);
        document.getElementById("SAID").value = data.result.img_url;
        return;
//	        SCLogo = data.result.returnPath[0].SAID;
    }).on('fileuploadfail', function (e, data) {
        alert("文件上传失败，请稍后重试");
    });
}

function getFileUrl(sourceId) {
    var url;
    if (navigator.userAgent.indexOf("Chrome") > 0) { // IE
        url = window.URL
            .createObjectURL(document.getElementById(sourceId).files
                .item(0));
        //console.log('Curl=' + url);
    } else if (navigator.userAgent.indexOf("Firefox") > 0) { // Firefox
        url = window.URL
            .createObjectURL(document.getElementById(sourceId).files
                .item(0));
        //console.log('Furl=' + url);
    } else if (!!window.ActiveXObject || "ActiveXObject" in window) { // Chrome
        url = document.getElementById(sourceId).value;
        //console.log('IEurl' + url);
    }
    return url;
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/jpeg");
    return dataURL
    // return dataURL.replace("data:image/png;base64,", "");
}