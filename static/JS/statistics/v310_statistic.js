/**
 * Created by zhaoj on 2018/1/30.
 */
/**
 * Created by zhaoj on 2017/11/24.
 */

var amCameraId = [];
var flag = false;
var Camera = [];
var nowTime = '今日';
var nowTimeParam = 'today';
var Chart,ChartZ,ChartA,ChartP;

jQuery(function ($) {
    Chart = echarts.init(document.getElementById('statistic_charts'));
    ChartZ = echarts.init(document.getElementById('statistic_charts_z'));
    ChartA = echarts.init(document.getElementById('statistic_charts_a'));
    ChartP = echarts.init(document.getElementById('statistic_charts_p'));

    $.get('/deepface/camerainfo?TagName=getCameraTree',function (res) {
        if(res.code=='0'){
            getCameraSYNCN(res);
        }else {
            console.log(res);
        }
    });

    $.get('/analysis/facetrackstatscount',function (res) {
        if(res.code=='0'){
            createTable(res.data);
        }else {
            console.log(res);
        }
    });

    search();

    $('#select_week').click(function () {
        nowTime = '最近7天';
        nowTimeParam = 'week';
        changeSelect(this);
        search()
    });
    $('#select_month').click(function () {
        nowTime = '最近30天';
        nowTimeParam = 'month';
        changeSelect(this);
        search()
    });
    $('#select_lastday').click(function () {
        nowTime = '昨日';
        nowTimeParam = 'yesterday';
        changeSelect(this);
        search()
    });
    $('#select_today').click(function () {
        nowTime = '今日';
        nowTimeParam = 'today';
        changeSelect(this);
        search()
    });
    $('#S_search').click(function () {
        search()
    });

});
function toThousands(num) {
    var num = (num || 0).toString(), result = '';
    while (num.length > 3) {
        result = ',' + num.slice(-3) + result;
        num = num.slice(0, num.length - 3);
    }
    if (num) { result = num + result; }
    return result;
}
function createTable(data) {
    var tableHtml = '';
    if(data){
        tableHtml = '<tr><td style="text-align: left;text-indent: 1em">昨日</td><td>'+data.yesterdayStats+'</td><td>'+data.yesterdayAlarmStats+'</td></tr>'+
            '<tr><td style="text-align: left;text-indent: 1em">最近7天</td><td>'+data.weekStats+'</td><td>'+data.weekAlarmStats+'</td></tr>'+
            '<tr><td style="text-align: left;text-indent: 1em">最近30天</td><td>'+data.monthStats+'</td><td>'+data.monthAlarmStats+'</td></tr>'+
            '<tr><td style="text-align: left;text-indent: 1em">历史总计</td><td>'+data.totalStats+'</td><td>'+data.totalAlarmStats+'</td></tr>';
        $('#table_statistics').append(tableHtml);

        var todayStats = toThousands(data.todayStats);
        var todayStatsA = toThousands(data.todayAlarmStats);

        $('#num_z').text(todayStats);
        $('#num_p').text(todayStatsA);
    }
}
function changeSelect(obj) {
    $('.radio_bg').removeClass('act');
    $(obj).prev('span').addClass('act');
}

function createChartA(data) {
    var arr = [],arrN = [];
    if(data){
        for(var i in data){
            arr.push(i);
            arrN.push(data[i])
        }
    }

    optionZ = {
        title: {
            text:'摄像头TOP10',
            textStyle: {
                fontWeight: 'normal',              //标题颜色
                color: '#83cce4',
                fontSize: 17
            }
        },
        color: ['#3398DB'],
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
                type : 'category',
                data : arr,
                axisTick: {
                    alignWithLabel: true
                },
                axisLine:{
                    lineStyle:{
                        color:'white',
                        width:1
                    }
                }

            }
        ],
        yAxis : [
            {
                type : 'value',
                axisLine:{
                    lineStyle:{
                        color:'white',
                        width:1
                    }
                },
                splitLine:{ lineStyle: {
                    // 使用深浅的间隔色
                    color: ['#014664']
                }}//去除网格线
            }
        ],
        series : [
            {
                name:'人脸数量',
                type:'bar',
                barWidth: '60%',
                data:arrN
            }

        ]
    };
    ChartA.setOption(optionZ,true);
}
function createChartP(data) {
    var sexData = [];
    var ageData = [];
    if(data){
        sexData = [
            {value:data.gender.male, name:'男'},
            {value:data.gender.female, name:'女',selected:true}
        ];
        ageData = [
            {value:data.age.z2twenty, name:'0-20岁'},
            {value:data.age.t2fourty, name:'20-30岁'},
            {value:data.age.t2thirty, name:'30-40岁'},
            {value:data.age.f2sixty, name:'40-60岁'},
            {value:data.age.older, name:'60岁以上'}
        ]
    }
    option = {
        color:['#39c8b0','#fa7bcf','#f495b0','#2daff3','#f0df98','#765beb','#faa45e'],
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
            title: {
                text:'性别、年龄分布图',
                textStyle: {
                    fontWeight: 'normal',              //标题颜色
                    color: '#83cce4',
                    fontSize: 17
                }
            },
        series: [
            {
                name:'性别比例',
                type:'pie',
                selectedMode: 'single',
                radius: [0, '30%'],

                label: {
                    normal: {
                        position: 'inner'
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data:sexData
            },
            {
                name:'年龄比例',
                type:'pie',
                radius: ['40%', '55%'],
                data:ageData
            }
        ]
    };
    ChartP.setOption(option,true);

}

function createChart(data,obj,type,color) {
    var data = data.data;
    if(!color){
        var color = 'red'
    }
    var xArr = [],yArr = [];
    for(var i in data){
        xArr.push(i);
        yArr.push(data[i])
    }
    var optionA = {
        color:[color],
        title: {
            text: type + '量',
            textStyle: {
                fontWeight: 'normal',              //标题颜色
                color: '#83cce4',
                fontSize: 17
            }
        },
        tooltip: {
            trigger: 'axis',
            textStyle: {
                fontWeight: 'normal',              //标题颜色
                color: 'whitesmoke'
            }
        },
        legend: {
            data:['抓拍人数'],
            textStyle: {
                fontWeight: 'normal',              //标题颜色
                color: 'whitesmoke'
            }
        },
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                dataView: {readOnly: false},
                magicType: {type: ['line', 'bar']},
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis:  {
            type: 'category',
            boundaryGap: false,
            data: xArr,
            axisLine:{
                lineStyle:{
                    color:'white',
                    width:1
                }
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} 人'
            },
            axisLine:{
                lineStyle:{
                    color:'white',
                    width:1
                }
            },
            splitLine:{ lineStyle: {
                // 使用深浅的间隔色
                color: ['#014664']
            }}//去除网格线
        },
        series: [
            {
                name:'抓拍数',
                type:'line',
                data: yArr,
                markPoint: {
                    data: [
                        {type: 'max', name: '最大值'},
                        {type: 'min', name: '最小值'}
                    ]
                },
                markLine: {
                    data: [
                        {type: 'average', name: '平均值'}
                    ]
                }}
        ]
    };
    obj.setOption(optionA,true);
}
function search() {
    var cameraIds = '';
    chartNum = 0;
    if(amCameraId.length > 0) {
        cameraIds = "" + amCameraId.join(",") + "";
    }
    if(Camera.length>0){
        cameraIds += "" + Camera.join(",") + "";
    }
    if(!cameraIds){
        cameraIds = '0'
    }
    $.get('/analysis/facetrackalarmstats/?days='+nowTimeParam+'&src_ids='+cameraIds,function (data) {
        if(data.code=='0'){
            createChart(data,Chart,'报警','red');
        }
    });
    $.get('/analysis/facetrackstats/?days='+nowTimeParam+'&src_ids='+cameraIds,function (data) {
        if(data.code=='0'){
            createChart(data,ChartZ,'抓拍','#3398DB');
        }
    });
    $.get('/analysis/sexagestats?days='+nowTimeParam+'&src_ids='+cameraIds,function (data) {
        if(data.code=='0'){
            createChartP(data.data);
        }
    });
    $.get('/analysis/cameracount?days='+nowTimeParam+'&src_ids='+cameraIds,function (data) {
        if(data.code=='0'){
            createChartA(data.data.stats_camera);
        }
    })
}

function getCameraSYNCN(results){
    var zNodes = [];
    // jQuery.get('/deepface/camerainfo', {TagName: "getCameraTree"}, function (results) {
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
    // });
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
        search()
    }
}