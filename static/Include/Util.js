/**lwh 20170913
 * 基础定义的操作类
 */
Util = function() {};
var UserInfo = {
    UName : '',
    LName : '',
	UID : ''
};

var SysConfig = {
		SCLogo : '',
		SCMinSpot : '',
		SCMaxSpot : '',
		RTInitNum : '',
		RTMaxNum : '',
		RTIsDisPType : '',
		RTIsDisCode : '',
		RTDisConfig : '',
		MapIsUse : '',
		MapType : '',
		ARInitNum : '',
		ARMaxNum : '',
		ARIsDisANum : ''
	};

Util.GetUserInfo = function() {
	jQuery.ajaxSetup({
		async: false
	});

	$.post(
		"isLogin.action",
		//params, //需要发送的Json数据
		function(data) {
			if(data[0]){
                UserInfo.UName = data[0].UName;
                UserInfo.LName = data[0].LName;
                UserInfo.UID = data[0].UID;
                SysConfig.SCLogo = data[0].SCLogo;
                SysConfig.SCMinSpot = data[0].SCMinSpot;
                SysConfig.SCMaxSpot = data[0].SCMaxSpot;
                SysConfig.RTInitNum = data[0].RTInitNum;
                SysConfig.RTMaxNum = data[0].RTMaxNum;
                SysConfig.RTIsDisPType = data[0].RTIsDisPType;
                SysConfig.RTIsDisCode = data[0].RTIsDisCode;
                SysConfig.RTDisConfig = data[0].RTDisConfig;
                SysConfig.MapIsUse = data[0].MapIsUse;
                SysConfig.MapType = data[0].MapType;
                SysConfig.ARInitNum = data[0].ARInitNum;
                SysConfig.ARMaxNum = data[0].ARMaxNum;
                SysConfig.ARIsDisANum = data[0].ARIsDisANum;

                if($('.header_logo').length>0&&SysConfig.SCLogo){
                    $('.header_logo img').attr({'src':SysConfig.SCLogo,'onerror':'javascript:this.src="Themes/Images/Default/logo.png"'})
				}
			}

		},
		"json"
	);
	return UserInfo;
};

//去除空格
String.prototype.trim=function(){
     return this.replace(/(^\s*)|(\s*$)/g, "");
};

//字符串截取
String.prototype.limit=function(len){
	var str = "",tempStr = this;
	if(tempStr.length>len){
        str = tempStr.substring(0,len);
        str = "<span title=\"" + tempStr + "\">" + str + "..</span>";
        return str
    }
	return str = "<span title=\"" + tempStr + "\">" + tempStr + "</span>";
};

//调用方法Util.GetParam("参数名1")
Util.GetParam=function(name){
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]); return null;
};

//引入JS文件
function include(path){ 
    var a=document.createElement("script");
    a.type = "text/javascript"; 
    a.src=path; 
    var head=document.getElementsByTagName("head")[0];
    head.appendChild(a);
}
//引入JS文件
//include("Include/layer/layer.js");

Util.PopWindow = function(){
		var screenwidth,screenheight,mytop,getPosLeft,getPosTop;
		screenwidth = $(window).width();	//屏幕宽度
		screenheight = $(window).height();	//屏幕高度

		mytop = $(document).scrollTop();

		getPosLeft = screenwidth/2 - 260;
		getPosTop = screenheight/2 - 150;

		$("#box").css({"left":getPosLeft,"top":getPosTop});

		$(window).resize(function(){
			screenwidth = $(window).width();	
			screenheight = $(window).height();	
			mytop = $(document).scrollTop();
	
			getPosLeft = screenwidth/2 - 260;	
			getPosTop = screenheight/2 - 150;	
			$("#box").css({"left":getPosLeft,"top":getPosTop+mytop});
		});

		$(window).scroll(function(){
			screenwidth = $(window).width();	
			screenheight = $(window).height();
	
			mytop = $(document).scrollTop();
	
			getPosLeft = screenwidth/2 - 260;	
			getPosTop = screenheight/2 - 150;
	
			$("#box").css({"left":getPosLeft,"top":getPosTop+mytop});
		});

		$("#popup").click(function(){
			$("#box").fadeIn("fast");	
			$("body").append("<div id='greybackground'></div>");
	
			var documentheight = $(document).height();	
			$("#greybackground").css({"opacity":"0.5","height":documentheight});
			
			return false;
		});

		$("#closeBtn").click(function()	{
			$("#box").hide();	
			$("#greybackground").remove();
	
			return false;
		});
};

//字段对应的id；data传入的数据；stype类型S：单选、M：多选；sVal选中的值
CreateCheck = function(id,data,stype,sVal){
	var strHtml = "",pVal="";
	if(sVal || sVal==0)
		pVal = sVal;
	else
		pVal = "";
	//var objCheckList = $("<span class='imgCheckCon'>");
	strHtml+= "<span id='chk_" + id + "'  class='imgCheckCon'>";//总包
	//SQL:sql语句   FUNC:函数名称    PARA:参数名称    CURR:date,user JSON:[{value:0,text:''},{value:0,text:''}]     DICT:pcode
	var arr = data.split(":");
	if(arr.length>1){
		if(sVal || sVal==0)
			sVal = "," + sVal + ","
		switch(arr[0]){
			case "JSON":
				var json = eval(data.substring(5));
				for(i=0;i<json.length;i++){
					strHtml+= "<span class='imgCheckCon' style='width:150px'>";//每个包
					var cls = "imgUncheck"
					if(sVal && sVal.indexOf("," +json[i].value + ",")>-1)
						cls = "imgChecked";
					strHtml+= "<span class='" + cls + "' value='" + json[i].value + "' onclick=CheckClick(this,'" + id + "','" + stype + "')></span>";//图片
					strHtml+= "<span class='imgCheckCon'>" + json[i].text + "</span>";//内容
					strHtml+= "</span>"; //结束
				}
				break;
			case "DICT":
				var code = arr[1];
		    	 $.post(
		                 "frameAction.action",
		                 {TagName:'GetDictory',CODE:code}, //需要发送的Json数据
		                 function (data) {
		                 	if(data && data!=""){
			                       //alert(data);
			                	 var json = eval(data);
			                	 for(m=0;m<json.length;m++){
			     					strHtml+= "<span class='imgCheckCon' style='width:150px'>";//每个包
			    					var cls = "imgUncheck";
			    					if(sVal && sVal.indexOf("," +json[m].DValue + ",")>-1)
			    						cls = "imgChecked";
			    					strHtml+= "<span class='" + cls + "' value='" + json[m].DValue + "' onclick='CheckClick(this,\"" + id + "\",\"" + stype + "\")'></span>";//图片
			    					strHtml+= "<span class='imgCheckCon'>" + json[m].DName + "</span>";//内容
			    					strHtml+= "</span>"; //结束		                		 
			                	 }
		                	}
		                 },
		                 "text"
		           );
				break;
		}
		strHtml+= "<input type='hidden' id='" + id +"' value='" + pVal + "' />";		
	}
	strHtml += "</span>"; //结束	
	
	return strHtml;
}

//按钮的单击事件
CheckClick = function(obj,id,stype){
	if(stype=="S"){//单选
		$('#chk_' + id + ' .imgChecked').attr('class','imgUncheck');
		// console.log($('#chk_' + id + '>span>span'));
		var selVal = obj.getAttribute("value");
		obj.className = "imgChecked";
		$('#' + id).val(selVal);
	}else{//多选
		var allVal = $('#' + id).val();
		var selVal = obj.getAttribute("value");
		if(obj.className == "imgChecked"){ //已选中
			obj.className = "imgUncheck";
			allVal = "," + allVal + ",";
			selVal = "," + selVal + ",";
			allVal = allVal.replace(selVal,"");
			allVal = allVal.substring(1,allVal.length-1);
		}else{//未选中
			allVal +="," + selVal;
			obj.className = "imgChecked";
		}
		$('#' + id).val(allVal);
	}
};

//通过屏幕高度定义group_content的自适应
AutoGCHeight = function(){
	if($('.group_content')){
			var hgt = $(window).height();
			var heigh = parseInt(hgt)-40-2;
			$('.group_content').css("height",heigh);
	}
}

window.alert =function(msg){
	 try{
         layer.msg(msg);
     }catch(e){

	 }
};
//AutoGCHeight();
SelectUser = function (usrs, rid) {
    var url = '/corsface/commonuserdelect?usrs=' + escape(usrs) + '&rid=' + rid;
    var pa = {
        type: 2,
        title: '选择人员',
        area: ["740px", "450px"],
        content: url,
        resize: false

    };
    layer.open(pa);
}

//created by ziling @2017/10/30

Util.generateUUID = function(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};
//created by ziling @2017/11/06  日期格式化
Date.prototype.pattern=function(fmt) {
	var o = {
		"M+" : this.getMonth()+1, //月份
		"d+" : this.getDate(), //日
		"h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
		"H+" : this.getHours(), //小时
		"m+" : this.getMinutes(), //分
		"s+" : this.getSeconds(), //秒
		"q+" : Math.floor((this.getMonth()+3)/3), //季度
		"S" : this.getMilliseconds() //毫秒
	};
	var week = {
		"0" : "/u65e5",
		"1" : "/u4e00",
		"2" : "/u4e8c",
		"3" : "/u4e09",
		"4" : "/u56db",
		"5" : "/u4e94",
		"6" : "/u516d"
	};
	if(/(y+)/.test(fmt)){
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}
	if(/(E+)/.test(fmt)){
		fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);
	}
	for(var k in o){
		if(new RegExp("("+ k +")").test(fmt)){
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
		}
	}
	return fmt;
}

function showSurImg(src) {
    var url = encodeURI('./BurImgShow.html?src='+ src);
    $(parent.document).find('#shadow')
        .attr('src',url)
        .removeClass('hide');
}

function layerShadow(url,title,width,height,type){
	var url = encodeURI('/corsface/details?URL='+url+'&width='+width+'&height='+height+'&type='+type+'&title='+title);
    $(parent.document).find('#shadow')
        .attr('src',url)
        .removeClass('hide');
}
function getBlur() {
    $(parent.document).find('.wrapper').toggleClass('blur');
}
function isVlcPlay(obj) {
	var vlc = $(obj).find('object')[0];
    $(obj).find('.filler').remove();
	try{
        if(!vlc.input.hasVout){
            $(vlc).addClass('hide');
            $(obj).prepend('<div class="filler" style="width: 100%;height: 100%;"></div>')
        }else {
            $(obj).find('.filler').remove();
            $(vlc).removeClass('hide')
        }
	}catch (e){
        $(vlc).addClass('hide');
        $(obj).prepend('<div class="filler" style="width: 100%;height: 100%;font-size: 18px;color: whitesmoke;box-sizing: border-box">' +
			'<span style="display: inline-block;height: 100%;"></span><p style="display: inline-block;vertical-align: middle">浏览器不支持此插件！</p>' +
			'</div>')
	}

}
function showVlc(obj) {
    var vlc = $(obj).find('object')[0];
    $(obj).find('.filler').remove();
    $(vlc).removeClass('hide')
}