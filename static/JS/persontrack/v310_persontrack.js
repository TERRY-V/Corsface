/**
 * Created by zhaoj on 2018/2/6.
 */
var init_params = {
    page:1,
    number:6,
    is_processed:2,
    pid:'',
    sort:2
};
var currentPage = '',amCameraId=[];
var pagnation = new Pagnation();


$(function ($) {
    init_params.pid = GetQueryString('personid');
    currentPage = GetQueryString('currentPage');

    $.post('/deepface/person/getpersoninfo',{person_id:init_params.pid},function (data) {
        if(data.code=='0'){
            $('#personName').text(data.data.person.name)
        }else {
            console.log(data);
        }
    });
    $.get('/deepface/devicelist',function (data) {
        if(data.code=='0'){
            var data = data.data.recognize;
            for(var i in data){
                $('#recognizeA').append('<option value="'+data[i].id+'">'+data[i].server_name+'</option>')
            }
            getTrack(init_params);
            $('#recognizeA').change(function () {
                init_params.page = 1;
                getTrack(init_params);
            })
        }else {
            alert('获取识别端错误')
        }
    });

    $.get('/deepface/camerainfo?TagName=getCameraTree',function (res) {
        if(res.code=='0'){
            getCameraSYNCN(res);
        }else {
            console.log(res);
        }
    });
    laydate.render({
        elem: '#startTime',
        type: 'datetime',
        value: "",
        done: function(date) {
            init_params.startTime = date;
            setTimeout(function () {
                getTrack(init_params);
            },200)
        }
    });
    laydate.render({
        elem: '#endTime',
        type: 'datetime',
        value: "",
        done: function(date) {
            init_params.endTime = date;
            setTimeout(function () {
                getTrack(init_params);
            },200)
        }
    });

    $('.back').click(function () {
        window.location.href = '/corsface/personlist?currentPage='+currentPage;
    });

    $('.content_select_title h3').click(function () {
        if($(this).hasClass('act')){
            return false;
        }
        $('.content_select_title h3').removeClass('act');
        $(this).addClass('act');
        if(this.id == 'personSearch'){
            init_params.is_processed = 2;
            $('#like_filter').addClass('hide')
        }else {
            init_params.is_processed =1 ;
            $('#like_filter').removeClass('hide')
        }
        init_params.page = 1;
        getTrack(init_params);
    });
    $('#startTime').change(function () {
        getTrack(init_params);
    });
    $('#endTime').change(function () {
        getTrack(init_params);
    });
    $('#select_time1').click(function () {
        init_params.sort = 2;
        changeSelect(this);
        getTrack(init_params);

    });
    $('#select_time2').click(function () {
        init_params.sort = 1;
        changeSelect(this);
        getTrack(init_params);

    });
    $('#select_score1').click(function () {
        init_params.sort = 4;
        changeSelect(this);
        getTrack(init_params);

    });
    $('#select_score2').click(function () {
        init_params.sort = 3;
        changeSelect(this);
        getTrack(init_params);
    });


});
function getTrack(params) {
    var recognize_id = Number($('#recognizeA').val());
    var camID = amCameraId;
    var startT = $('#startTime').val();
    var endT = $('#endTime').val();
    var cams = '';
    for(i in camID){
        cams+=camID[i]+','
    }
    cams = cams.substr(0,cams.length-1);
    var dataParams = {};
    if(params.is_processed=='2'){
        dataParams = {page:params.page,number:params.number,is_processed:params.is_processed,person_id:params.pid,recognize_id:recognize_id}
    }else {
        dataParams = {page:params.page,number:params.number,is_processed:params.is_processed,person_id:params.pid,recognize_id:recognize_id,src_ids:cams,start_time:startT,end_time:endT,sort:params.sort}
    }

    $.post('/deepface/person/getpersonfacetrack',dataParams,function (data) {
        if(data.code=="0"){
            console.log(data.data);
            createFaceTrack(data.data)
        }else {
            console.log(data)
        }
    })
}
function changeSelect(obj) {
    $('.radio_bg').removeClass('act');
    $(obj).prev('span').addClass('act');
}
// 插入facetrack
function createFaceTrack(data) {
    $('#face_track_head').empty();
    if(init_params.is_processed=='1'){
        $('#face_track_head').append('<div class="img_head" >序列图片</div><div class="cam_head" >摄像头</div><div class="score_head" >相似度</div><div class="time_head" >抓拍时间</div>')
    }else {
        $('#face_track_head').append('<div class="img_head" >序列图片</div><div class="cam_head" >摄像头</div><div class="time_head" >抓拍时间</div>')
    }
    if(data.facetracks.length<1){
        $('#face_tack').empty();
        $('#page_wrap').empty();
        $('#face_tack').append('<p>没有匹配结果！</p>');
        return false;
    }
    $('#face_tack').empty();
    var tracks = data.facetracks;
    var thtml = '';
    for(var i=0;i<tracks.length;i++){
        var imags ='';
        var len = tracks[i].images.length>5?5:tracks[i].images.length;
        for(var x=0;x<len;x++){
            imags += '<img class="trackImg" src="'+ tracks[i].images[x].path +'" alt=""> '
        }
        var btn,trm;

        var score = tracks[i].matched_score?tracks[i].matched_score:0;
        score = Math.ceil(score*100);
        var caname = tracks[i].camera_name?tracks[i].camera_name:'未知摄像头';
        if(caname.length>10){
            caname = caname.substr(0,7)+'...'
        }
        if(init_params.is_processed=='1'){
            btn = '<input type="button" value="添加" onclick="archiveTrack(\''+ tracks[i].facetrack_id +'\')"> ';
            trm = '<div class="trackM">'+score+'</div> '
        }else {
            btn = '<input type="button" value="删除" onclick="deleteTrack(\''+ tracks[i].facetrack_id +'\')"> ';
            trm = '';
        }
        var trackHtml = '<div class="faceTrack"> ' +
            '<div class="trackOperate"> ' +btn +
            '<input class="faceTrack_show_imgs" type="button" value="查看场景" onclick="showSImg(this,\''+ tracks[i].scene_image +'\')"> ' +
            '</div> ' +
            '<div class="trackImgs"> <div class="trackImgWrap">' +imags +
            '</div></div> ' +
            '<div class="trackInfo"> ' +
            '<div class="trackCAName">'+caname+'</div> ' + trm +
            '<div class="trackTime">'+ tracks[i].createdate +'</div> ' +
            '</div> ' +
            '</div>';
        thtml += trackHtml;
    }


    $('#face_tack').append(thtml);

    $('.faceTrack_show_imgs').each(function (i) {
        $(this).attr('data-imgs',JSON.stringify(tracks[i].images));
    })

    var count = data.facetracks_total,pages = Math.ceil(count/init_params.number);

    var pageHtml =  pagnation.init(init_params.page, pages, 'getTrack(init_params)', count);
    $('#page_wrap').empty();
    $('#page_wrap').append(pageHtml);

}
function deleteTrack(id) {
    $.post('/deepface/facetrack/archive',{facetrack_id:id,person_id:init_params.pid,option:2},function (data) {
        if(data.message=='success'){
            alert('删除成功');
            getTrack(init_params);
        }
    })
}
function archiveTrack(id) {
    $.post('/deepface/facetrack/archive',{facetrack_id:id,person_id:init_params.pid,option:1},function (data) {
        if(data.message=='success'){
            alert('添加成功');
            getTrack(init_params);
        }
    })
}
function showSImg(th,src) {
    var Fimgs = JSON.parse($(th).attr('data-imgs'));
    $('#media_BImg img')[0].src = src;
    $('#media_images').empty();
    for(var i in Fimgs){
        $('#media_images').append('<img src="'+ Fimgs[i].path +'" />')
    }
    //iframe窗
    layer.open({
        type: 1,
        title: '序列图',
        shade: [0.4],
        area: ['760px', '300px'],
        content: $('#showFaceTrack') //iframe的url，no代表不显示滚动条
    });
}
// 获取url中参数
function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  decodeURI(r[2]);return null;
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
function showMenu() {
    var cityObj = $("#citySel");
    var cityOffset = $("#citySel").offset();
    $("#menuContent").css({left:cityOffset.left + "px", top:cityOffset.top + cityObj.outerHeight() + "px"}).slideDown("fast");
    $("body").bind("mousedown", onBodyDown);
}
function hideMenu() {
    $("#menuContent").fadeOut("fast");
    $("body").unbind("mousedown", onBodyDown);
}
function onBodyDown(event) {
    if (!(event.target.id == "menuBtn" || event.target.id == "citySel" || event.target.id == "menuContent" || $(event.target).parents("#menuContent").length>0)) {
        hideMenu();
        getTrack(init_params);
    }
}