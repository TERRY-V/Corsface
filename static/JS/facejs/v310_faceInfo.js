var faceTrackImgs = [];
var UUID = "";
var type ="";
var IP = "";
var responseData = "";
//准备facetrack的图片，适用于人物创建。
function create_person_by_track(facetrack_id){
    var person_img = $("#person_img img").attr("src");
    window.location.href="/corsface/personcreate_by_track?facetrack_id=" + facetrack_id +"&person_img="+person_img;
}

function toFaceTrack(UUID, IP, pid){
    var uuid = UUID;
    var url = "/corsface/facetracksearch?facetrack_id=" + uuid;
    parent.layer.closeAll();
    $(window.top.document).find("#001").removeClass("active");
    $(window.top.document).find("#005").addClass("active");
    $(window.top.document).find("#004").removeClass("active");

    $(window.top.document).find("#shadow").addClass("hide");
    $(window.top.document).find(".wrapper").removeClass("blur");
    $(window.top.document).find("#iframe").attr("src", url);
}

//认为该facetrack是相似卡片中的某一个人，点击添加则将该facetrack的图片保存到人物的附件中。

function archive(facetrack_id, person_id, option){
    console.log("ahga");
    option = Number(option);
    var param = {"facetrack_id":facetrack_id, "person_id":person_id, "option":option};
    $.ajax({
        url:"/deepface/facetrack/archive",
        data:param,
        async:true,
        type:"POST",
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                if(code == -3){
                    alert("该track已添加过了");
                }
            }else{
                if(option == 1){
                    alert("添加成功");
                }else{
                    alert("取消添加成功");
                }
            }
            $(".person_i.opening").click();
            setTimeout(function(){
                //设置后重新加载页面。
                window.location.reload();
            }, 2000)
            
        }
    });
    // /deepface/facetrack/archive
}
function clear_match(facetrack_id){
    var param = {"option":3, "facetrack_id":facetrack_id};
    $.ajax({
        url:"/deepface/facetrack/archive",
        type:"POST",
        async:true,
        data:param,
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                alert(msg);
            }
            alert("清除匹配成功");
            $(".person_i.opening").click();
            setTimeout(function(){
                //设置后重新加载页面。
                window.location.reload();
            }, 1000)
        },
        error:function(data){
            alert("服务忙请稍后")
        }
    })
    
}
deepFaceAddTrackToPerson =  function(UUID, personId, IP){
    $.ajax({
        url:"/CorsFace/personSortExecuteEx.action",
        data:{"TagName":"mergePerson", "TrackID":UUID, "PID":personId, "IP":IP, "Percent":""},
        async:false,
        type:"POST",
        success:function(data){
            if(data == "OK"){
                alert("deepface 合并成功");
            }
            console.log("deepFaceAddTracktoPerson: " + data);
        }
    })
}

//设置人工确认的字段，在页面点击添加之后，就认为该条信息被确认。并且修改personId
setPersonConfirm = function(UUID, personId, matchs){
    var obj = [
        {"Filed":"Person_Confirm", "Value":1, "Type":""},
        {"Filed":"PersonId", "Value":personId, "Type":""}

    ];
    var params = {
        "TagName":"SaveData",
        "KeyTable":"b_recognition",
        "KeyParams": "UUID",
        "KeyValue": UUID,
        "Items": JSON.stringify(obj)
    };
    jQuery.post('/CorsFace/formengine.action', params, function(data){
    });
};

function goDetails(id) {
    var tmp = $(".person_i");
    if(tmp.hasClass("opening")){
        //当开启的时候，将开启的窗口关闭。
        tmp.click();
    }

    window.location.href = '/corsface/getpersoninfo?pid=' + id;
}
function imgError(obj) {
    obj.error = "";
    sroundImgAndFaceImg(1);
    return true;
}

//设置场景图及抓拍的人脸图。
function sroundImgAndFaceImg(facetrack){
    var faceImgs = $("#media_images img");
    if(faceImgs.length == 0){
        $("#media_images").empty();
        
        var sroundImgSrc = facetrack.scene_image;
        $("#media_BImg img").attr('src', sroundImgSrc);
        var imgs = facetrack.images;
        imgs = imgs.slice(0,4)
        var str = "";
        for(var i = 0; i < imgs.length; i++){
            str += '<img src="'+ imgs[i]+'" />';
        }
        $("#media_images").append(str);
    }
}

jQuery(function ($) {
    $(".result_info_wrap").empty();
    $.ajaxSetup({
        cache: false
    });
    UUID = Util.GetParam("UUID");
    type = Util.GetParam("type");
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

    $('.person_i').click(function () {
        $('.alarm_media').toggleClass('hide');
        $(this).toggleClass('opening');
        if(!$(this).hasClass('opening')){
            $(parent.document.getElementsByTagName('iframe')).css({'height':'630px'});
            $(parent.document).find('.layui-layer-iframe').css({'height':'630px','top':'88px'})
        }else {
            $(parent.document.getElementsByTagName('iframe')).css({'height':'880px'});
            $(parent.document).find('.layui-layer-iframe').css({'height':'880px','top':'10px'})
        }
    });
    

    //设置是否识别的标志位。如果未是被则为false，其他为true；
    var reg = true;
    $.ajax({
        url:"/deepface/facetrack/getfacetrackinfo",
        data:{"facetrack_id":UUID},
        async:false,
        type:"POST",
        success:function(data){
            var msg = data.message;
            var code = data.code;
            if(!(msg == "success" && code == 0)){
                alert("请稍后重试");return;
            }
            
            facetrack = data.data.facetrack;
            var status = facetrack.status;
            // status == 0为人脸记录， 1为报警记录 2 为归档。
            if(status == 0){
                type =1;
            }else if(status == 1 || status == 2){
                type = 2;
            }
            var person_matched = facetrack.person_matched;
            $("#detail_btn").empty();

            if(type == 1){
                //人脸记录
                $("#detail_btn").append('<input type=button onclick=\"toFaceTrack(\''+UUID+'\',\'' + ""+'\',\''+person_id +'\')\" value=\"轨迹追踪\">');
                $("#detail_btn").append(' <input type="button" onclick="create_person_by_track(\''+ UUID +'\')" value="创建人物">');
            }
            if(type == 2){
                //status facktrack的状态。
                
                var person_id = person_matched.matched_person_id;
                //归档操作 1 为归档，2为取消归档。
                var option = 1;
                var buttonShow = "归档";
                
                if(status == 2){
                    buttonShow = "取消归档";
                    option = 2;
                    $("#detail_btn").append('<input type=button onclick=\"archive(\''+UUID+'\',\'' + person_id+'\',\''+ option +'\')\" value='+buttonShow+'>');
                }else{
                    $("#detail_btn").append('<input type=button onclick=\"archive(\''+UUID+'\',\'' + person_id+'\',\''+ option +'\')\" value='+buttonShow+'>');
                    $("#detail_btn").append("<input type='button' onclick=clear_match('"+ UUID +"') value='清除匹配'/>");
                }
                
                $(".person_i").click();
                $(".faceInfo_result .content_head").text("人物图像");
                setAlarmImg(person_matched.images);
            }
            //当保存了最清晰的一张图片之后，去掉这几条语句就行。
            var camera_name = facetrack.camera_name;
            camera_name = camera_name?camera_name:"";
            var createdate = facetrack.createdate;
            createdate = createdate?createdate:"";
            $("#face_camera").text(camera_name);
            $("#face_time").text(createdate);
            
            //设置抓拍图片的第一张。
            var firstImg ="<img src=\""+ facetrack.images[0] +"\" onerror=\"imgError(this);\"" + ' />';
            $('#person_img').empty();
            $('#person_img').append(firstImg);

            var matchs = "";

            if(person_matched){
                //设置相似度
                matchs = person_matched.matched_score;
                if(matchs<0 || matchs>1){
                    matchs = 0;
                }
                
                matchs = (matchs * 100).toFixed(2);
                if(matchs == 0){
                    matchs = "";
                }else{
                    matchs += "%";
                    matchs = "可信度：" + matchs;
                }
                $('#face_similar').text(matchs);
            }
            if(status == 2){
                $('#face_similar').text("人工已确认");
            }

            //设置性别属性或者姓名
            var sex = "";
            if(!person_matched){
                sex = facetrack.sex=="0"?"性别：男":"性别：女";
                
            }else{
                sex = person_matched.name?person_matched.name:"";
            }
            $('#al_name').text(sex);

            //设置眼镜或者身份证号信息
            var glasses = "";
            if(!person_matched){
                glasses = facetrack.glasses == 1?"戴眼镜":"没有戴眼镜";
            }else{
                glasses = person_matched.id_card?person_matched.id_card:"";
            }
            $('#al_id').text(glasses);

            //设置年龄或者 人物标记信息。
            var age = "";
            if(!person_matched){
                age = facetrack.age?facetrack.age+"岁左右":"";
            }else{
                age = person_matched.group_name?person_matched.group_name:"";
            }
            $('#al_group').text(age);

            var address = "";
            if(person_matched){
                address = person_matched.family_register?person_matched.family_register:"";
                $("#al_address").text(address);
            }

            //设置识别图标，默认是问号。
            // var name = "";
            // var pTag = '<img src="/CorsFace/Themes/Images/ICON/facetrackstatus1.png" style="width: 40px;height: 40px;">';
            // if(data.faceTrankInfo.notRecoginsed == 1){
            //     var idCard = data.faceTrankInfo.Glasses==1?"戴眼镜":"没有戴眼镜";
            //     pTag = '<img src="/CorsFace/Themes/Images/ICON/facetrackstatus3.png" style="width: 40px;height: 40px;">';
            //     $('#al_tag').html(pTag);
            // }
            
            // if(data.faceTrankInfo.recoginsed == 1 || data.faceTrankInfo.Person_Confirm == 1){
                //识别的图标
                //pTag = '<img src="/CorsFace/Themes/Images/ICON/facetrackstatus2.png" style="width: 40px;height: 40px;">';
            // }
            sroundImgAndFaceImg(facetrack);
            if(type == 1){
                //type为1时为人脸记录
                setSimilarPersonInfo(UUID);
            }
            
        }
    });

    function setAlarmImg(imgs){

        str = "";
        for(var i = 0; i<imgs.length; i++){
            img = "<img src="+ imgs[i] +" />"
            str += '<div class="result_card">'+
                '<div class="result_confidence">'+""+'</div>'+
                '<div class="result_img">'+
                img +
                '</div>'+
                '<div class="result_name">'+ "" +'</div>'+
                '<div class="result_id">'+""+'</div>'+
                '<div class="result_btn">'+
                '</div>'+
                '</div>';
        }
        if(imgs.length <3){
            $(".realtime_content_right").addClass("hide");
            $(".realtime_content_left").addClass("hide");
        }
        $(".result_info_wrap").append(str);
    }
    function setSimilarPersonInfo(facetrack_id){
        //facetrack 获取相似人物的信息.
        if(!facetrack_id){
            return;
        }
        $.ajax({
            url:"/deepface/facetrack/matchfacetracktoperson",
            data:{"facetrack_id":facetrack_id},
            async:true,
            type:"POST",
            success:function(data){
                var msg = data.message;
                var code = data.code;
                if(code != 0){
                    alert(msg);
                }
                data = data.data;
                var count = data.count;
                if(count <=3){
                    $(".realtime_content_right").addClass("hide");
                    $(".realtime_content_left").addClass("hide");
                }
                if(count < 1){
                    $(".result_info_wrap").css({'width':'100%','font-size':'18px','color':'white','text-align':'center','line-height':'100px'});
                    $(".result_info_wrap").text('没有相似人物！');
                    $('.realtime_content_right').css('display','none');
                    //当没有匹配的人员时，不设置match值。
                    $('#face_similar').text("");
                    return;
                }
                
                var person_matches = data.person_matches;
                var str = "";
                for(var i = 0; i < person_matches.length; i++){
                    var person = person_matches[i];
                    var matchs = person.score;
                    matchs = (matchs * 100).toFixed(2);
                    if(matchs == 0){
                        matchs = "";
                    }else{
                        matchs = "可信度：" + matchs +"%";
                    }
                    var img = person.face_image;
                    img = "<img src=" + img +" />";
                    var name = person.name;
                    var idCard = person.id_card?person.id_card:"";
                    var br ="";
                    if(!idCard){
                        br = "<br>";
                    }
                    var person_id = person.person_id;
                    str += '<div class="result_card">'+
                    '<div class="result_confidence">'+matchs+'</div>'+
                    '<div class="result_img">'+
                    img +
                    '</div>'+
                    '<div class="result_name">'+ name +'</div>'+
                    '<div class="result_id">'+idCard+'</div>'+
                     br   +
                    '<div class="result_btn">'+
                    '<div class="result_detail" data-id="'+ person_id +'" onclick="goDetails(\''+ person_id +'\')">详情</div>'+
                    '<div class="result_add" data-id="" onclick="archive(\''+UUID+'\', \''+ person_id +'\',\''+ 1+'\')">归档</div>'+
                    '</div>'+
                    '</div>';
                }
                $(".result_info_wrap").append(str);
            }
        });
    }



    //相似人物信息卡填写。
    // 如果有人工确认的信息，则用人工确认的信息。
    function setPersonInfo(matchPersons, Person_Confirm, pid){
        var str = '';
        for(var index = 0; index<matchPersons.length; index++){
            var person = matchPersons[index];
            var personInfo = person.personInfo;
            var attachInfo = person.attachInfo;
            if(!personInfo || personInfo.length <1){
                continue;
            }
            var path = "";
            if(attachInfo && attachInfo.length >=1 ){
                path = attachInfo[0].FPath;
            }
            var img = "";
            if(attachInfo && attachInfo.length >=1){
                img +="<img src=\"/CorsFace"+ attachInfo[0].FPath+ "\""+ " onerror=imgNotFound(this)"+' />';
            }
            var name = personInfo.name?personInfo.name:"";
            var idCard = personInfo.cardNo?personInfo.cardNo:"";
            var br ="";
            if(!idCard){
                br = "<br>";
            }
            idCard = "身份证号: " + idCard;
            var address = personInfo.address?personInfo.address:"";
            var personDB = personInfo.personDB?personInfo.personDB:"";
            address = addbr(address, 14);
            address = "地&emsp;&emsp;址: " + address;

            var matchs = person.matchs;
            matchs = (matchs * 100).toFixed(2);
            if(matchs == 0){
                matchs = "";
            }else{
                matchs = "可信度：" + matchs +"%";
            }

            var pID = personInfo.PID?personInfo.PID:"";
            var pTag = personInfo.PTag?personInfo.PTag:"";


            if(Person_Confirm){
                if(pID == pid){
                    $('#face_similar').text("人工已确认！");
                    $('#al_name').text(name);
                    $('#al_group').text(personDB);
                    $('#al_id').text(idCard);
                    $("#al_address").replaceWith("<p>"+address+"</p>");
                    $('#al_tag').text(pTag);
                }
            }else{
                if(index==0){
                    if(reg){
//                        $('#face_similar').text(matchs+"可信");
                        $('#al_name').text(name);
                        $('#al_group').text(personDB);
                        $('#al_id').text(idCard);
                        $("#al_address").replaceWith("<p>"+address+"</p>");
                        $('#al_tag').text(pTag);
                    }
                }
            }
            
            str += '<div class="result_card">'+
                '<div class="result_confidence">'+matchs+'</div>'+
                '<div class="result_img">'+
                img +
                '</div>'+
                '<div class="result_name">'+ name +'</div>'+
                '<div class="result_id">'+idCard+'</div>'+
                 br   +
                '<div class="result_btn">'+
                '<div class="result_detail" data-id="'+ pID +'" onclick="goDetails(\''+ pID +'\')">详情</div>'+
                '<div class="result_add" data-id="" onclick="merginPic(this, \''+ personInfo.PID +'\')">添加</div>'+
                '</div>'+
                '</div>';
        }

        $(".result_info_wrap").append(str);
        if($('.result_card').length<=3){
            $('.realtime_content_right').css('display','none')
        }


    }
});

function addbr(str, len){
    //行数长度换行，给出要换行的str， 然后给出换行的长度.
    var ret = "";
    if(str){
        var br = "<br>";
        var count = str.length/len;
        for(var i = 0; i<count; i++){
            if(i>0){
                ret +="&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;";
            }
            ret += str.substr(i*len, (i+1)*len) + br;

        }
    }
    return ret;
}

function imgNotFound(obj){
    obj.error = "";
    obj.src = "/CorsFace/Attach/icon/imgNotFound144.png";
    return true;
}

//设置抓取记录中的facktrack图片及场景图。并设置faceTrackImgs的图片。
// tag 1为最上面的图片加载时请情况， 2为点击向下看时加载的情况
function setFaceTrackInfo(IP, uuid, content, tag){
    if(!IP || !uuid){
        return;
    }
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

    facePic['TagName'] = "GetFacesInTrack";
    facePic['UUID'] = uuid;
    facePic['IP'] = IP;
    //facePic['Imgs'] = JSON.stringify(content);
    var asyncS = true;
    if(tag == 3){
        asyncS= false;
    }
    //获取图片
    $.ajax({
        url:"/CorsFace/faceTrack.action",
        data:facePic,
        async:asyncS,
        type:"POST",
        success:function(data){
            if(!data){
                return;
            }
            var data = eval('(' + data + ')');
            faceTrackImgs = data;
            if(!data || data.length == 0){
                //当数据为空时，也将最上边的图片设置未找到状态
                if(tag == 1){
                    $('#person_img').empty();
                    $('#person_img').append('<img src="/CorsFace/Attach/icon/imgNotFound144.png"/>');
                }
            }
            $("#media_images").empty();
            var str = "";
            for(var i = 0; i< data.length; i++){
                if(i=='0' && tag == 1){
                    $('#person_img').empty();
                    if(data[0] == null || data[0].length == 0 || data[0]=="null"){
                        $('#person_img').append('<img src="/CorsFace/Attach/icon/imgNotFound144.png"/>');
                    }else{
                        $('#person_img').append('<img src="data:image/jpeg;base64,'+ data[0]+'"/>');
                    }
                }
                if(data[i] == null || data[i].length == 0 || data[0]=="null"){
                    str += '<img src="/CorsFace/Attach/icon/imgNotFound144.png"/>';
                }else{
                    str += '<img src="data:image/jpeg;base64,'+ data[i]+'"/>';
                }
            }
            $("#media_images").append(str);
        },
        error:function(){
            if(tag == 1){
                $('#person_img').empty();
                $('#person_img').append('<img src="/CorsFace/Attach/icon/imgNotFound144.png"/>');
            }
        }
    });

}
//重新匹配的逻辑
function reMatch(uuid, IP){
    //进入deepface调用重新匹配， 然后刷新当前页面。
    var param = {
        IP:IP,
        type:"reMatchSimilarPerson",
        uuid:uuid
    };
    $.ajax({
        url:"/CorsFace/traceAction.action",
        data:param,
        async:true,
        type:"POST",
        success:function(data){
            var data = JSON.parse(data);
            if(data.code == 0){
                window.location.reload();
            }else if(data.code == 1){
                alert(data.msg);
                window.location.reload();
            }
            $(parent.document.getElementsByTagName('iframe')).css({'height':'630px'});
            $(parent.document).find('.layui-layer-iframe').css({'height':'630px','top':'88px'})
        },
        error:function(){
            alert("服务器连接失败稍后重试");
            window.location.reload();
        }
    })
    

}