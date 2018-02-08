/**
 * Created by ziling on 2017/12/21.
 */

jQuery(function ($) {
    var IP = Util.GetParam("IP");
    var uuid = Util.GetParam("uuid");
    setSenceImg(IP, uuid);
    setFaceImg(IP, uuid);

    if(document.addEventListener){
        $('#media_images')[0].addEventListener('DOMMouseScroll',scrollFunc,false);
    }//W3C
    $('#media_images')[0].onmousewheel=scrollFunc;//IE/Opera/Chrome

    var transFT = 0;
    function scrollFunc(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        ev.returnValue = false;
        var max = $('.media_images_wrap').height() - $('#media_images').height();
        if(max>0){
            max = 0
        }
        console.log(max)
        if(ev.wheelDelta>0 || ev.detail<0){
            // 向上滚
            var top = transFT + 20;
            if(top>0){
                top = 0
            }
            $('#media_images').css('top',top+'px')
        }else {
            var top = transFT - 20;
            if(top<max){
                top = max
            }
            $('#media_images').css('top',top+'px')
        }
        transFT = top;
    }
})
function setFaceImg(IP, uuid){
    var facePic = {
        "TagName": "GetFacesInTrack",
        "IP":IP,
        "UUID":uuid
    }
    //获取facetrack的所有图片
    $.ajax({
        url:"/CorsFace/faceTrack.action",
        data:facePic,
        async:true,
        type:"POST",
        success:function(data){
            var data = eval(data);
            if(!data[0]){
                return;
            }
            for(var i = 0; i<data.length; i++){
                if(data[i] == null || data[i].length == 0 || data[i]=="null"){
                    $("#media_BImg img").attr('src', "/CorsFace/Attach/icon/imgNotFound355.png");
                }else{
                    $('#media_images').append('<img src="data:image/jpeg;base64,'+ data[i]+'"/>');
                }
            }
        }
    });

}

function setSenceImg(IP, uuid){
    var facePic = {
        "TagName": "GetSourceImage",
        "IP":IP,
        "UUID":uuid
    }
    //获取场景图
    $.ajax({
        url:"/CorsFace/faceTrack.action",
        data:facePic,
        async:true,
        type:"POST",
        success:function(data){
            var data = eval(data);
            if(!data[0]){
                return;
            }
            if(data[0] == null || data[0].length == 0 || data[0]=="null"){
                $("#media_BImg img").attr('src', "/CorsFace/Attach/icon/imgNotFound355.png");
            }else{
                $("#media_BImg img").attr('src', "data:image/jpeg;base64,"+data[0]);
            }

        }
    });
}