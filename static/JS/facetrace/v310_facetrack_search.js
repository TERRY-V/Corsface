jQuery(function($){
var allCamera = [], amCameraId=[];
var facetrack_id = Util.GetParam("facetrack_id");
Init_facetrack_search = function(){
    set_camera();
    set_date_init();
    set_facetrack_info(facetrack_id);
    facetrack_search();
}
$('#getTrace').click(function () {
    facetrack_search();
});

/*$(".back").click(function(){
    // parent.history.go(-1);return;
    // window.location.reload();
    // var a = parent.document;
    // $("#001").addClass("active");
    $(window.top.document).find("#005").removeClass("active");
    $(window.top.document).find("#001").addClass("active");
    $(window.top.document).find("#004").removeClass("active");
    // parent.location.reload();
    $(window.top.document).find("#iframe").attr("src", "/corsface/index");
    var URL = "/corsface/trackdetail?UUID=" + facetrack_id + "&type=1";
    layer.open({
            type: 1,
            title: "人脸详情",
            shade: [0.4],
            area: [660, 660],
            //          time: 2000, //2秒后自动关闭
            content: [URL], //iframe的url，no代表不显示滚动条
            cancel: function(index, layero){
                layer.close(index);
                $(parent.document).find('#shadow').addClass('hide').attr('src','');
                var deleteA = $('iframe')[0].contentWindow.deleteAlarm;
                var uuid = $('iframe')[0].contentWindow.Duuid;
                $(parent.document).find('.wrapper').removeClass('blur');
                if(deleteA){
                    // deleteAlarm(uuid)
                }
                // showVlc()
            }
        });
    // parent.location.replace(parent.document.referrer);
    // location.replace(document.referrer);
});*/
facetrack_search = function(){
    showLoading();
    var camID = amCameraId;
    var startT = $('#startTime').val();
    var endT = $('#endTime').val();

    var recognize_id = $('#recognizeT').val();
    var param = {
        src_ids:JSON.stringify(camID),
        datetime_begin:startT,
        datetime_end:endT,
        facetrack_id:facetrack_id,
        recognize_id:""
    };
    $.ajax({
        url:"/analysis/matchfacetrack2facetrack",
        data:param,
        type:"POST",
        async:true,
        success:function(data){
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                alert(msg);return;
            }

            var resData = data.data.matches.slice(0,16);
            /*
            //展示16个图像            
             var tmpData= [];
            for(var i = 0; i<16; i++){
                tmpData.push(resData[0]);
            }
            resData = tmpData;*/
            var rData = resData.sort(function (a, b) {
                var at = a.time,bt = b.time;
                at = at.replace('-','/'),bt = bt.replace('-','/');
                at = new Date(at),bt = new Date(bt);
                return bt.getTime() -at.getTime()
            });
            createTrace(rData)
        },
        error:function(data){
            alert("服务忙，请稍后重试");
        }
    })
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
set_facetrack_info = function(facetrack_id){
    $.ajax({
        url:"/deepface/facetrack/getfacetrackinfo",
        data:{"facetrack_id":facetrack_id},
        async:false,
        type:"POST",
        success:function(data){
            var msg = data.message;
            var code = data.code;
            if(code != 0){
                alert(msg + " 请稍后重试");return;
            }
            
            facetrack = data.data.facetrack;
            sroundImgAndFaceImg(facetrack);
        },
        error:function(data){
            alert("服务忙，请稍后重试");
        }
    })
}
//设置场景图及抓拍的人脸图。
function sroundImgAndFaceImg(facetrack){
    var faceImgs = $("#media_images img");
    $("#media_images").empty();
    
    var sroundImgSrc = facetrack.scene_image;
    $(".facetrack_media_BImg img").attr('src', sroundImgSrc);
    var imgs = facetrack.images;
    imgs = imgs.slice(0,4)
    var str = "";
    for(var i = 0; i < imgs.length; i++){
        str += '<img src="'+ imgs[i]+'" />';
    }
    $(".facetrack_media_images").empty();
    $(".facetrack_media_images").append(str);
}
set_date_init = function(){
    laydate.render({
        elem: '#startTime',
        type: 'datetime',

    });
    laydate.render({
        elem: '#endTime',
        type: 'datetime',
    });
}
getFaceTrack = function(id){

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
        //          time: 2000, //2秒后自动关闭
        anim: 1,
        content: $('#showFaceTrack') //iframe的url，no代表不显示滚动条
    });
}
set_camera = function(){
    $.get('/deepface/camerainfo?TagName=getCameraTree',function (res) {
        if(res.code=='0'){
            getCameraSYNCN(res);
        }else {
            console.log(res);
        }
    });
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
})