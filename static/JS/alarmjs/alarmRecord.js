
var init_params = {
    number: 12,
    page: 1,
};

getp=function(){
   var init_param={number: 12,page:init_params.page};
        var starttime = $('#startTime').val();
        var endTime = $('#endTime').val();
        if (starttime) {
            init_param.start_time=starttime;
        }
        if(endTime){
            init_param.end_time=endTime;
        }
        
        if(endTime.trim()==""){
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            var strHours = date.getHours();
            var strMinutes = date.getMinutes();
            var strSeconds = date.getSeconds();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            if (strHours >= 0 && strHours <= 9) {
                strHours = "0" + strHours;
            }
            if (strMinutes >= 0 && strMinutes <= 9) {
                strMinutes = "0" + strMinutes;
            }
            if (strSeconds >= 0 && strSeconds <= 9) {
                strSeconds = "0" + strSeconds;
            }
            endTime = date.getFullYear() + seperator1 + month + seperator1 + strDate
                + " " + strHours + seperator2 + strMinutes
                + seperator2 + strSeconds;
                
            init_param.end_time=endTime;
        }
       
        var src_id='';
         if(amCameraId.length > 0) {
              for (var x = 0; x < amCameraId.length; x++) {
                   if (x==0) {
                    src_id += amCameraId[x];
                   }else{
                    src_id+=",";
                    src_id+=amCameraId[x];
                   }
                }
            
        }
        
        var is_processed =$('.filtrate_input_radio :radio:checked').val();

        var name =$("#name").val();
        if (name) {
            init_param.name=name;
        }
        var gender = $("#gender").val();
        if (gender) {
            init_param.gender=gender;
        }
        var id_card = $("#id_card").val();
        if (id_card) {
            init_param.id_card=id_card;
        }
        var group_id=$("#person_sort").val();
        if (group_id) {
            init_param.group_id=group_id;
        }
        var alarm_level=$("#alarm_level").val();
        if (alarm_level) {
            init_param.alarm_level=alarm_level;
        }
        if(src_id){
            init_param.src_ids=src_id; 
        }
        if (is_processed) {
            init_param.is_processed=is_processed;
        }
        return init_param;

}

var startTime = '2015-12-31 00:00:00';
var endTime = '';
var flag = true;
var currentpage; //??ǰҳ?
var page; //?ҳ?
var count; //????
var amCameraId = [];
var zNodes = [];

var deleteAlarm = 0;

var Duuid = Util.GetParam('UUID');

var time = new Date();
time = time.getTime();

//  初始化/刷新  AlarmRecord.html
Init_Alarm_Record = function (params) {
    $.ajaxSetup({cache:false});

    jQuery('#AlarmRecord').html('');
    jQuery('#AlarmRecord').addClass('loading');


    jQuery.post('/deepface/facetrack/alarm', params, function (data) {

        $('.alarm_content_wrap').find('#pageManage').remove();
       
        data=data.data;
        var detailState = ['','/static/Themes/Images/Other/noDetail.png','/static/Themes/Images/Other/detailed.png']
        var alarmimg=["","/static/Themes/Images/ICON/alarm1.png","/static/Themes/Images/ICON/alarm2.png","/static/Themes/Images/ICON/alarm3.png","/static/Themes/Images/ICON/alarm4.png"];
        currentpage = params.page;
        count = data.facetracks_total;
        page=Math.floor((count%12)>0?(count/12)+1:(count/12));
        var results=data.facetracks;
        //生成分页
        var pagnation = new Pagnation();
        var pageHtml =  pagnation.init(currentpage, page,'Init_Alarm_Record(getp())', count );

        //动态生成报警记录卡片
        if(results.length > 0){
            for( x in results ){
                var gender = results[x].person_matched.gender;
                if (gender==0) {
                    gender="未知";
                }else if(gender==1){
                    gender="女";
                }else{
                    gender="男";
                }
                var alarmCard = '',
                address=results[x].person_matched.family_register?results[x].person_matched.family_register:"未知住址",
                aName = results[x].person_matched.name?results[x].person_matched.name:'未知',
                aPSort=results[x].person_matched.group_name?results[x].person_matched.group_name:'未知分组',
                    aCname = results[x].camera_name?results[x].camera_name:'未知',
                    im=results[x].status,
                    Matchs =results[x].person_matched.matched_score?parseInt((results[x].person_matched.matched_score)*100) + '':' ';
                alarmCard ='<div class="alarm_card" id="'+results[x].facetrak_id+'" onclick="personDetails(\''+results[x].facetrack_id+'\')">' +
                    '<div class="detail_state">' +
                    '<img class="state_img" src="' + detailState[im] +'" alt="">' +
                    '</div>'+
                    '<div class="alarm_msg clearfix">'+
                   // '<P class="arid_num">' + results[x].facetrak_id + '</P>' +
                    '<div class="alarm_face_img left">' +
                    '<img style="width: 100%" src="' + results[x].image + '" alt="">' +
                    '</div>' +
                    '<div class="alarm_camera_pImg" data-id="'+ results[x].person_matched.matched_person_id +'">' +
                    ' <img src="'+results[x].person_matched.face_image+'" alt=""> ' +
                    '<p class="Ptime">' + results[x].createdate + '</p>' +'<div class="Pmatches">'+ Matchs +'</div>'+
                    '</div>'+
                    '<div class="alarm_msg_mid">'+
                    '<div class="alarm_msg_constent left">'+
                    '<p class="PName" style="font-size: 18px">' + aName + '</p>' +
                    '<br/>'+
                    '<p>' + aPSort + '</p><br/>' +
                    '<p>' + results[x].person_matched.id_card  + '</p><br/>' +
                    '<p>' + address+ '</p>' +
                    '</div>' +
                    '<div class="alarm_camera_time">' +
                    '<p> <span class="alarm_snapImg_btn" onclick="snapClick(event, this)"></span>' + aCname + '</p>' +
                    '</div>' +
                    '</div>' +

                '<div class="snapImg" onclick="snapImgClick(event)">' +
                '<img style="width: 100%; height: 100%" src="' + results[x].scene_image + '" alt="">' +
                '</div></div>' +
                '<div class="alarm_msg_right">' +
                '<img style=" width: 25px; margin-left: 16px;" src="' + alarmimg[results[x].person_matched.alarm_level] + '" alt="">'+
                '</div>' +
                '</div>';
                jQuery('#AlarmRecord').append(alarmCard);
            }
            $('img').error(function () {
                this.src = '/static/Themes/Attach/icon/imgNotFound144.png';
            })
        }

        jQuery('#AlarmRecord').removeClass('loading');

        $('.alarm_content_wrap').append(pageHtml);

        $('.alarm_camera_pImg').each(function () {
            var pid = $(this).attr('data-id');
            var _this = this;
            /*$.post('personSortExecuteEx.action',{TagName:'getPersonImg',PID:pid,time:time},function (data) {
                $(_this).find('img').attr('src','/CorsFace'+data)
            })*/
        })
    });

    if(flag) {
        
        //获取人物分组下拉
       jQuery.get('/deepface/person/group', function (results) {
            var selectHtml = '';
            var res = results.data.groups;
            try {
                for (x in res) {
                    selectHtml += '<option value="' + res[x].id + '">' + res[x].name + '</option>'
                }
            }catch (e){
                console.log(e)
            }
            jQuery('#person_sort').append(selectHtml)
        });
        
        //获取摄像头规则下拉
        jQuery.get('/deepface/camerainfo', {TagName: "getCameraTree"}, function (results) {
            var selectHtml = '';
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
        });
        var chartsData = [];
        var chartsName = [];
        var alarmName=["一级报警","二级报警","三级报警","四级报警"];
       //生成echarts
       ///deepface/facetrackstatstoday
        jQuery.get('/deepface/facetrack/alarm/statstoday',{}, function (data) {
            try {
                
                for( i=0; i< alarmName.length; i++ ){
                    chartsName.push(alarmName[i]);
                    chartsData.push(data.data[JSON.stringify(i+1)]);
                }
             
            }catch (e){
            
            }
            var myChart = echarts.init(document.getElementById('statistic_charts'));
            option = {
                color: ['#3398DB'],
                label:{
                    normal:{
                        show: true,
                        position: 'inside'
                    }
                },
                textStyle: {
                    color: '#fff'
                },
                tooltip : {

                    trigger: 'axis',
                    axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                        type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis : [
                    {
                        splitLine:{show: false},//去除网格线
                        type : 'category',
                        data : chartsName,
                        axisTick: {
                            show: false,
                            alignWithLabel: true

                        },
                        axisLine: {
                            lineStyle: {
                                color: '#00ace4'
                            }
                        },
                        axisLabel: {
                            fontSize: '16'
                        }
                    }
                ],
                yAxis : [

                    {
                        axisTick: {
                            show: false
                        },
                        axisLine: {show: false},
                        splitLine:{show: false},//去除网格线
                        nameTextStyle: {
                            fontSize: '20px'
                        },
                        axisLabel: {
                            color:'#002c40'
                        }
                    }
                ],
                series : [
                    {
                        name:'报警数量',
                        type:'bar',
                        barWidth: '60%',
                        data:chartsData,
                        itemStyle: {
                            //柱形图圆角，鼠标移上去效果
                            emphasis: {
                                barBorderRadius: 30
                            },

                            normal: {
                                //柱形图圆角，初始化效果
                                barBorderRadius: [10, 10, 0, 0] ,
                                color: new echarts.graphic.LinearGradient(
                                    0, 1, 1, 1,
                                    [
                                        {offset: 0, color: '#0c87c3'},
                                        {offset: 0.15, color: '#005982'},
                                        {offset: 0.85, color: '#005982'},
                                        {offset: 1, color: '#0c87c3'}
                                    ]
                                ),
                                label: {
                                    show: true,//是否展示
                                    textStyle: {
                                        fontWeight:'bolder',
                                        fontSize : '16',
                                        fontFamily : '微软雅黑',
                                        color: '#b3cfc4'
                                    }
                                }
                            }
                        },
                    }
                ]
            };
            myChart.setOption(option);

        } )
    }

    flag = false;

    // 控制下拉
    jQuery(".sel_wrap").on("change", function() {
        var o;
        var opt = jQuery(this).find('option');
        opt.each(function(i) {
            if(opt[i].selected == true) {
                o = opt[i].innerHTML;
            }
        });
        jQuery(this).find('label').html(o);
    }).trigger('change');


};

//出发弹窗
personDetails = function (UUID) {
    var url = '/corsface/trackdetail?UUID=' + UUID+'&type=2';
    layerShadow(url,2,'660px','660px',2);
};


// 点击图标显示预览图
snapClick = function (event, obj) {
    $('.snapImg').attr('class','snapImg');
    var _this = obj;
    var e = event || window.event;
    e.stopPropagation();
    var x = e.clientX;
    var y = e.clientY;
    var width = $(window).width() - 400;
    var height = $(window).height() - 275;
    if(x>width&&y>height){
        $(_this).parent().parent().parent().parent().find('.snapImg').toggleClass('brOpen')
    }else if(x>width){
        $(_this).parent().parent().parent().parent().find('.snapImg').toggleClass('trOpen')
    }else if(y>height){
        $(_this).parent().parent().parent().parent().find('.snapImg').toggleClass('blOpen')
    }else {
        $(_this).parent().parent().parent().parent().find('.snapImg').toggleClass('open')
    }
};

// 清楚预览图点击冒泡
snapImgClick = function (event) {
    var e = event || window.event;
    e.stopPropagation();
    $('.snapImg').attr('class','snapImg');
    return false;
};

// document绑定事件，关闭预览图
$(document).click(function () {
    $('.snapImg').attr('class','snapImg');
});


$(document).ready(function () {
    //清除筛选项
    jQuery("#clear_btn").click(function(){
        $('#aid').val("");
        $('#alarm_rules').val("");
        $('#alarm_level').val("");
        $('#person_group').val("");
        $("input[name='deal']").get(0).checked = true;
        $('#amMinMatch').val("0");
        $('#amMaxMatch').val("100");
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
        amCameraId = [];
        $("#citySelName").html('全部');
        $('#citySel').val("全部");
        $("#timeSelect").val(0);
        $('#startTime').val('');
        $('#endTime').val('');
        $.fn.zTree.destroy("treeDemo");
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
        jQuery(".sel_wrap").change();
    });
    $('.alarm_content_wrap').css('height',$(window).height() - 290 +'px');

    //筛选项点击确认查询
    jQuery('#submit_btn').on('click', function () {
    	var ini={number: 12,page: 1,};
    	var starttime = $('#startTime').val();
    	var endTime = $('#endTime').val();
    	if (starttime) {
    		ini.start_time=starttime;
    	}
    	if(endTime){
    		ini.end_time=endTime;
    	}
        
        if(endTime.trim()==""){
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
	        var month = date.getMonth() + 1;
	        var strDate = date.getDate();
	        var strHours = date.getHours();
	        var strMinutes = date.getMinutes();
	        var strSeconds = date.getSeconds();
	        if (month >= 1 && month <= 9) {
	            month = "0" + month;
	        }
	        if (strDate >= 0 && strDate <= 9) {
	            strDate = "0" + strDate;
	        }
	        if (strHours >= 0 && strHours <= 9) {
	            strHours = "0" + strHours;
	        }
	        if (strMinutes >= 0 && strMinutes <= 9) {
	            strMinutes = "0" + strMinutes;
	        }
	        if (strSeconds >= 0 && strSeconds <= 9) {
	            strSeconds = "0" + strSeconds;
	        }
	        endTime = date.getFullYear() + seperator1 + month + seperator1 + strDate
	            + " " + strHours + seperator2 + strMinutes
	            + seperator2 + strSeconds;
	            
    		ini.end_time=endTime;
        }
       
        var src_id='';
         if(amCameraId.length > 0) {
              for (var x = 0; x < amCameraId.length; x++) {
                   if (x==0) {
                   	src_id += amCameraId[x];
                   }else{
                   	src_id+=",";
                   	src_id+=amCameraId[x];
                   }
                }
            
        }
        
        var is_processed =$('.filtrate_input_radio :radio:checked').val();

        var name =$("#name").val();
        if (name) {
        	ini.name=name;
        }
        var gender = $("#gender").val();
        if (gender) {
        	ini.gender=gender;
        }
        var id_card = $("#id_card").val();
        if (id_card) {
        	ini.id_card=id_card;
        }
        var group_id=$("#person_sort").val();
        if (group_id) {
        	ini.group_id=group_id;
        }
        var alarm_level=$("#alarm_level").val();
        if (alarm_level) {
        	ini.alarm_level=alarm_level;
        }
        if(src_id){
        	ini.src_ids=src_id;	
        }
        if (is_processed) {
        	ini.is_processed=is_processed;
        }

        ini.page = 1;
        Init_Alarm_Record(ini);
    });


    //获取时间组件
    var date = new Date();
    var now = date.pattern("yyyy-MM-dd");
    laydate.render({
        elem: '#startTime',
        type: 'datetime',
        theme: '#393D49',
        value:'',
        done: function (date) {
            startTime = date;
        }
    });
    laydate.render({
        elem: '#endTime',
        type: 'datetime',
        theme: '#393D49',
        value: '',
        done: function (date) {
            endTime = date;
        }
    });

    $("#timeSelect").change(function(){
        var val = $("#timeSelect").val();
        var nowTime = date.pattern("yyyy-MM-dd HH:mm:ss")
        var startTime = "";
        var endTime = nowTime;
        if(val >= 0){
            startTime = new Date(date.getTime() -1000 * 3600*val * 1);
            startTime = startTime.pattern("yyyy-MM-dd HH:mm:ss")
            if(val==0){
                startTime ="";
                $("#startTime").val(startTime);
            }
            //$("#startTime").val(startTime);
            laydate.render({
                elem: '#startTime',
                type: 'datetime',
                theme: '#393D49',
                value: startTime,
                done: function (date) {
                    startTime = date;
                }
            });
            laydate.render({
                elem: '#endTime',
                type: 'datetime',
                theme: '#393D49',
                value: endTime,
                done: function (date) {
                    endTime = date;
                }
            });
            //$("#endTime").val(nowTime);

        }
       

    })
});

