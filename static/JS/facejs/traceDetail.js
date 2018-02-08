/**
 * Created by ziling on 2017/10/26.
 */

var ipAndfacetrackId = "";
$(document).ready(function(){
	// 图片栏滑动
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
	
    $(".result_info_wrap").empty()
    var attachIds =[]
    var info = sessionStorage.getItem("imgsForTraceDetail");
    if(!info){return}
    info = JSON.parse(info);
    if(!info['attachInfo']|| info['attachInfo'].size ==0){
        return;
    }
    //set media img and the img for faceTrack;
    $("#media_BImg img").attr("src", info.sourceImg);
    var str = ""
    for(var i = 0; i < info.attachInfo.length; i++){
        attachIds.push(info.attachInfo[i].attachId)
        str += '<img src="/CorsFace' + info.attachInfo[i].path+ '">';
    }
    $("#media_images").append(str);

    //加载相似的人物
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
//            $("#detail_btn").append('<input type="button" id="directTrace" value="直接追踪">');
            //添加直接追踪的点击事件
            $("document").ready(function(){
                $("#directTrace").click(function(){
                    sessionStorage.removeItem("ipAndfacetrackId");
                    sessionStorage.setItem("ipAndfacetrackId", JSON.stringify(ipAndfacetrackId));
                    var url = '/CorsFace/Business/FaceInfo/Html/FaceTrace.html?direct=' + 1 +"&type=trace";
                    parent.window.location.href=url;
                    return;
                })
            })
            data = JSON.parse(data)
            var code = data['errcode']
            if(code != 0){
                alert(data['msg']);return;
            }
            //在这里需要在每个服务器中创建一个facetrack，对于人物匹配来说只需要在一个服务器中获取匹配的人物就行。
            //对于直接追踪来说，需要在每个服务器中访问数据。
            ipAndfacetrackId = data['createInfo'];
            var matchInfo = data['matchPersonInfo']
            if(!(matchInfo && matchInfo.length>0)){
                alert("未匹配到人物");return;
            }
            setSimilarCard(matchInfo);
        }
    })

    //拖拽实时记录
    var dragFlag = false;
    var nowLeft = 0;
    $('.realtime_content_left').click(function() {
        if(dragFlag) {
            return;
        }
        dragFlag = true;
        $('.realtime_content_right').addClass('rightIcon');
        var width = $('.result_content').width();
        var left = nowLeft + (width - 184);
        if(left >= 0) {
            left = 0;
            $('.realtime_content_left').removeClass('leftIcon');

        }
        var now = nowLeft;
        var speed = (left - nowLeft) / 10;
        var a = 0;
        var time = setInterval(function() {
            a++;
            now += speed;
            $('.result_info_wrap').css('left', now + 'px')
            if(a >= 10) {
                clearInterval(time);
                dragFlag = false;
            }
        }, 50);
        nowLeft = left;
    });
    $('.realtime_content_right').click(function() {
        if(dragFlag) {
            return;
        }
        dragFlag = true;
        $('.realtime_content_left').addClass('leftIcon');
        var width = $('.result_content').width();
        var left = nowLeft - (width - 184);
        if(left <= -(1224 - width)) {
            left = -(1224 - width);
            $('.realtime_content_right').removeClass('rightIcon');

        }
        var now = nowLeft;
        var speed = (left - nowLeft) / 10;

        var a = 0;

        var time = setInterval(function() {

            a++;
            now += speed;

            $('.result_info_wrap').css('left', now + 'px')
            if(a >= 10) {
                clearInterval(time);
                dragFlag = false;
            }
        }, 50);
        nowLeft = left;
    });

})

setSimilarCard = function(data){

    $.each(data, function(index, person){
        var score = person['score'];
        var matchs = getDouble(score);

        var name = person['Name'] ? person['Name']:"";
        var idCard = person['CardNo']?person['CardNo']:""
        var br = "";
        if(!idCard){
            br="<br>";
        }
        idCard = "身份证号：" + idCard;
        var pID = person['PID']?person['PID']:""


        var img ='<img  src="/CorsFace'+ person['FPath']+'"'+'>';
        var str = '<div class="result_card">'+
            '<div class="result_confidence">可信度：'+matchs+'</div>'+
            '<div class="result_img">'+
            img +
            '</div>'+
            '<div class="result_name">'+ name +'</div>'+
            '<div class="result_id">'+idCard+'</div>'+
                br+
            '<div class="result_btn">'+
            '<div class="result_detail" data-id="'+ pID +'" onclick="goDetails(\''+ pID +'\')">详情</div>'+
            "<div class='result_add' data-id='' attachid ="+ person['SAID'] + " onclick=toTrace(this)>追踪</div>"+
            '</div>'+
            '</div>';
        $(".result_info_wrap").append(str);
    })

}

function getDouble(matchs){
    if(!matchs){
        return "0%"
    }
    matchs = matchs*100;
    matchs = matchs.toString().split(".")
    matchs = matchs[0] + "." + matchs[1].substr(0,2)
    return matchs + "%";
}


function goDetails(id) {
    window.location.href = '/CorsFace/Business/FaceInfo/Html/V31_PersonDetail.html?pid=' + id;
    return;
    console.log($("#iframe"));
    var url = '/CorsFace/Business/Person/Html/V30_Person_Form.html?type=f&pid=' + id;
    parent.window.location.href=url;
    console.log(obj);
    console.log(parent.document);
    console.log(url);
    return;
	window.location.href = '/CorsFace/Business/Person/Html/V30_Person_Form.html?type=f&pid=' + id;return;
    window.open('/CorsFace/Business/Person/Html/V30_Person_Form.html?pid=' + id);return;
    parent.window.location.href = '/CorsFace/Business/Person/Html/V30_Person_Form.html?pid=' + id;
}

toTrace = function(obj){
    var that = $(obj);
    var attachIds =[];
    var attachId=that.attr("attachid");
    attachIds.push(attachId);
    var param ={
        "type":"createTranceByImgSync",
        "attachIds":attachIds.join("','")
    }
    var attachInfo = [];
    var path = that.parent().parent().find("img").attr("src");
    if(path){
        path = path.substr(9);
    }
    var faces = []
    faces.push({"path":path});
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
                "sourceImg":that.parent().parent().find("img").attr("src"),//获取其中一个原图片即可
                "attachInfo":faces
            }
            sessionStorage.setItem("imgsForTraceDetail", JSON.stringify(info));

            //在这里需要在每个服务器中创建一个facetrack，对于人物匹配来说只需要在一个服务器中获取匹配的人物就行。
            //对于直接追踪来说，需要在每个服务器中访问数据。
            ipAndfacetrackId = data['createInfo'];
            //添加直接追踪的点击事件
            sessionStorage.removeItem("ipAndfacetrackId");
            sessionStorage.setItem("ipAndfacetrackId", JSON.stringify(ipAndfacetrackId));
            parent.layer.closeAll();
            $(window.top.document).find("#001").removeClass("active");
            $(window.top.document).find("#005").addClass("active");
            $(window.top.document).find("#004").removeClass("active");

            $(window.top.document).find("#shadow").addClass("hide");
            $(window.top.document).find(".wrapper").removeClass("blur");
            var url = '/CorsFace/Business/FaceInfo/Html/FaceTrace.html?direct=' + 1 +"&type=trace";
            $(window.top.document).find("#iframe").attr("src", url);

            //window.location.href=url;
            return;
        }
    })
    //var url = '/CorsFace/Business/FaceInfo/Html/FaceTrace.html?pid=' + id +"&type=trace";
    //parent.window.location.href=url;
    
    return;
    window.open('/CorsFace/Business/FaceInfo/Html/FaceTrace.html?pid=' + id +"&type=trace");return;
    parent.window.location.href = '/CorsFace/Business/FaceInfo/Html/FaceTrace.html?pid=' + id+"&type=trace";
}

