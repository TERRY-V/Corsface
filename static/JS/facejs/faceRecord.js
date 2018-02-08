/**
 * Created by ziling on 2017/9/25.

 */
var	currentpage;
var	 totalCount;
var	 page;
var zNodes = [];

// 控制下拉
var init_params = {
		"page":1
}
var amCameraId = [];
getParams = function(){
	var recogniseState = $("#recogniseState input[name='reg']:checked").val();
	recogniseState = recogniseState?recogniseState:"";
	var src_id = "";
	
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

    page = init_params['page'];
	init_params={
			
	};
	
	if (recogniseState) {
		this.init_params.is_processed=recogniseState;
	}
	if($("#startTime").val()){
		this.init_params.start_time=$("#startTime").val();
	}
	if($("#endTime").val()){
		this.init_params.end_time=$("#endTime").val();
	}
	if($("#name").val()){
		this.init_params.name=$("#name").val();
	}
	if($("#id_card").val()){
		this.init_params.id_card=$("#id_card").val();
	}
	if($("#gender").val()){
		this.init_params.gender=$("#gender").val();
	}
	if($("#person_group").val()){
		this.init_params.group_id=$("#person_group").val();
	}
	if(src_id){
		this.init_params.src_ids=src_id;
	}
	this.init_params.page = page;
	this.init_params.number=18;
	return init_params;
}
var flag = false;

var typeFlag = false;
function Init_face_Record(params){
	page = params.page;
	
   
		$.post("/deepface/facetrack", getParams(), function(data, status){
			
			  $('.record_content').empty();
	          total = data.totalCount;
	          
	          
		
			      var date = new Date();  
			  	var now = date.pattern("yyyy-MM-dd");
			  		laydate.render({
			  		  elem: '#startTime',
			  		  type: 'datetime',
			  		  value: "",
			  		  done:function(date){
			  			   init_params.start_time = date
			  		  }
			  		});
			  		laydate.render({
			  		  elem: '#endTime',
			  		  type: 'datetime',
			  		  value: "",
			  		  done:function(date){
			  			  init_params.end_time = date
			  		  }
			  		});
			  		
		      	currentpage =params.page;
		      	totalCount = data.data.facetracks_total;
		      	page=(totalCount%18)>0?(totalCount/18)+1:(totalCount/18);
		        //生成分页
		        var pagnation = new Pagnation();
		        var pageHtml =  pagnation.init(currentpage, Math.floor(page), 'Init_face_Record(init_params)', totalCount);
		        $('#pageManage').empty();
		        $('#pageManage').append(pageHtml);
		        
		        setFaceRecord(data);
		  });
		
};
getSexInfo = function(sex){
		if (sex<20) {
			return "青春活力";
		}else if (sex<40) {
			return "年轻有为";
		}else if (sex<70) {
			return "成熟中年";
		}else{
			return "暮年老人";
		}


}

setform=function(){
	var chalist=[];
        var test = [];
        var time = new Date();
		jQuery.get("/deepface/facetrack/statstoday",{time:time},function(res){
			var r = res.data;
			var date = new Date();

			for (var i = 0; i < date.getHours()+1; i++) {
				chalist.push(r[i]);
			}
		
		
		var myChart = echarts.init(document.getElementById('statistic_chart'));
        var colors = ['#5793f3', '#d14a61', '#675bba'];
		option = {
			calcubable:true,
			    xAxis: {
			    	name: '小时',
			    	splitLine:{show: false},//去除网格线
			    	boundaryGap:false,
			        type: 'category',
			        data: ['0','1', '2', '3', '4', '5', '6', '7','8', '9', '10', '11', '12', '13', '14','15', '16', '17', '18', '19', '20', '21','22', '23'],
			        axisLabel:{
			        	show:true,
			        	textStyle:{
			        		color:'white'
			        	}
			        },
			        axisLine:{
                 		 lineStyle:{
                   			 color:'white'
                		}
                	}/*,
			        splitArea : {show : true}//保留网格区域*/
			    },
			    yAxis: {
			    	name:'数量',
			    	splitLine:{show: false},//去除网格线
			        type: 'value',
			        axisLabel:{
			        	textStyle:{
			        		color:'white'
			        	}
			        },
			        axisLine:{
                 		 lineStyle:{
                   			 color:'white'
                		}
                	}/*,
			        splitArea : {show : true}//保留网格区域*/
			    },
			    series: [{
			        data:chalist,
			        color: 'red',
			        type: 'line',
			        itemStyle:{
			        	normal:{
			        		color:'#00ace4',
			        		lineStyle:{
			        			color:'#00ace4'
			        		},
				        		label:{
				        			show:true
			        		}
			        	}
			        }
			    }]
			};

		myChart.setOption(option);
		});
}

setFaceRecord = function(data){
	$('.record_content').empty();
	var faceList = data.data.facetracks;
	for(var i = 0; i<faceList.length; i++){
		var face = faceList[i];
		
		var statusarr=["static/Themes/Images/ICON/facetrackstatus3.png","static/Themes/Images/ICON/facetrackstatus1.png","static/Themes/Images/ICON/facetrackstatus2.png"];
		var person_name="未知身份";
		var person_type="未知年龄";
		var person_group="未知分组";
		if (face.person_matched) {
			person_name=face.person_matched.name;
			person_type=getSexInfo(face.person_matched.gender);
			person_group=face.person_matched.group_name;
		}else{
			person_type=getSexInfo(face.age);
		}
		var statusimg ;
		
			if (face.status<0) {
				statusimg=0;
			}else{
				statusimg=face.status;
			}
		
		var id = "faceRcord"+i;
		var faceHtml = '<div class="faceinfo_wrap" data-id="' + face.facetrack_id +'">'+
			'<div class="person_info">'+
			'<p class="person_name">' + person_name + '</p>'+
			'<p class="person_type">'+person_type+'</p>'+
			'<p class="person_group">'+person_group+'</p>'+
			'<p class="alarm_icon"><img src="/'+ statusarr[statusimg] +'"/></p>'+
			'<div class="face_location">' + face.camera_name +'</div>'+
			'<div class="face_time">' + face.createdate +'</div>'+
			'</div>'+
			'<div class="face_info">'+
			'<p class="face_BRid">' + '' +'</p><p></p>'+
			'<div class="person_img"><img src='+face.image+' class="imgface"></div>'+
			'</div>'+
			'</div>';
		$('.record_content').append(faceHtml);
	};
    $('.record_content').removeClass('loading');
	
};

$(document).ready(function(){
	var info={"page":"1","number":"18"}
	 Init_face_Record(info);
	 setform();
    $.ajaxSetup({
        cache: false
    });
    $('.main_record').on('click', '.faceinfo_wrap', function() {
        var url = '/corsface/trackdetail?UUID=' + $(this).attr('data-id')+'&type=1';
        // layerShadow(url,1,'660px','660px',2);
        //iframe窗
        layer.open({
            type: 2,
            title: '人脸详情',
            shade: [0.4],
            area: ['660px', '660px'],
            //			time: 2000, //2秒后自动关闭
            anim: 2,
            content: [url] //iframe的url，no代表不显示滚动条
        });
    });

     jQuery.get('/deepface/person/group', function (results) {
            var selectHtml = '';
            var res = results.data.groups;
            try {
                for (x in res) {
                    selectHtml += '<option value="' + res[x].id + '">' + res[x].name + '</option>'
                }
            }catch (e){
            }
            jQuery('#person_group').append(selectHtml)
        });

    $("#remove").click(function(){
        $("#name").val("");
        $('#citySel').val('');
        $('#person_group').val('');
        $('#startTime').val('');
        $('#endTime').val('');
        $("select[name='personGroup']").val("");
        $("#gender").val('');
        $("#id_card").val('');
        $("input[name='reg']").get(0).checked = true;
        $("#name").val("");
		$("#timeSelect").val(0);
        $.fn.zTree.destroy("treeDemo");
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
        jQuery(".sel_wrap").change();
    });
	  
	  $("#submit_btn").click(function(){
		  var pa = getParams();
		  pa.page = 1;
          $('.record_content').addClass('loading');
          $('.record_content').empty();
		  Init_face_Record(pa);
	  });
	
    
	$("#timeSelect").change(function(){
		var val = $("#timeSelect").val();
		var date = new Date();
		var nowTime = date.pattern("yyyy-MM-dd HH:mm:ss")
		var startTime = "";
		var endTime = nowTime;
		if(val >= 0){
			startTime = new Date(date.getTime() -1000 * 3600*val * 24);
			startTime = startTime.pattern("yyyy-MM-dd HH:mm:ss")
			if(val == '0'){
                startTime = '2017-10-01 00:00:00'
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

	});
	getCameraSYNCN();

	function getCameraSYNCN(){

		$.ajax({
			url: "/deepface/camerainfo",
			data: {
				TagName: "getCameraTree"
			},
			async: true,
			type: "GET",
			success: function(data) {
				//alert(data.data);
				var Ctext = $('#citySel').val();
				var Carr = Ctext.split(',');
				var res = data.data;
				for(var i = 0; i < res.length; i++) {
					var item = {
						id: res[i].group_name,
						pId: '0',
						name: res[i].group_name,
						open: false,
						nocheck: true
					};
					for(var j = 0; j < res[i].cameras.length; j++) {
						var check = false;
						for(var x=0;x<Carr.length;x++){
							if(Carr[x]==res[i].cameras[j].camera_name){
								check = true;
							}
						}
						var inner_item = {
							id: res[i].cameras[j].src_id,
							pId: res[i].group_name,
							name: res[i].cameras[j].camera_name,
                            checked: check
						};
						zNodes.push(inner_item);
					}
					zNodes.push(item)
				}
				var allC = false;
                for(var s=0;s<Carr.length;s++){
                    if(Carr[s]=='全部'){
                        allC = true;
                    }
                }
                zNodes.push({
                    id: '0',
                    pId: '-1',
                    name: '全部',
                    open: false
                });
				zNodes = zNodes.reverse();
				
				$.fn.zTree.init($("#treeDemo"), setting, zNodes);
               
			}
		});
	}
	  
	});



	
function selected(id, groupId){
	var str = "";
	if(id == groupId){
		str = 'selected="selected"';
	}
	return str;
}

	


