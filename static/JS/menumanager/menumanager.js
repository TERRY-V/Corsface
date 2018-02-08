var page=1;
var number=1;
var pagenumber=1;
var count=13;
var pid=0;
var oldpid=0;
var date = new Date();
var time = date.getTime();
var params={
	"pageno":1,
	"pagesize":count,
	"pid":pid,
	"time":time
};
var chackList=[];
Init_MenuMge=function(params){
	chklistIds=[];
	 $(".tbody").empty();
	 $("#check_th").empty();
	$.get("/system/menulist",params,function(res){
			number=res.allnum;
			pagenumber=Math.floor((number%count)>0?(number/count)+1:(number/count));
			$('#number').empty();
			$('#pagenumber').empty();
			$('#number').text(res.allnum);
			$('#pagenumber').html(pagenumber==0?1:pagenumber);
		if (res.data.length>0) {
			setTbodyHtml(res.data,res.code);
		}
	});
}
setTbodyHtml=function(data,code){
	var html = "";
	for (var i = 0; i <count; i++) {
		var name="";
		var url="";
		var index="";
		var pids="";
		var id="";
		var checkbox="";
		
		if (data[i]) {
			pid=data[i].pid;
			name=data[i].name;
			url=data[i].url;
			index=data[i].index;
			pids=data[i].pid;
			id=data[i].id;
			checkbox="<input type='checkbox' name='chklist' id='chklist' value="+id+" onclick='MutiPageMutiSelect(this)'>";
			if (pids==0) {
				$("#form_Back").addClass("hide");
			}
		}
		html+="<tr class='tbod'>";
		html+="<td>"+checkbox+"</td>";
		html+="<td>"+name+"</td>";
		html+="<td>"+url+"</td>";
		html+="<td>"+index+"</td>";
		html+="<td>";
		if (data[i]) {
			html+="<a class='btn btn-social-icon btn-bitbucket btn-edit' title='编辑' href='javascript:MenuEdit("+id+")'></a>";
			html+="<a class='btn btn-social-icon btn-submenu btn-submenu' data-pid='"+id+"' data-name='"+name+"' title='子菜单' onclick='setnewmenu(this,"+id+")'></a>";
		}
		html+="<td/>";
		html+="</tr>";
	}
	$(".tbody").append(html);
	$("#check_th").append('<input type="checkbox" onclick="CheckAll(this)">');
	$("#nowpage").val(page);
}
initPageButton=function(data){
	if (data=='start') {
		page=1;
	}else if (data=='last') {
		if (page>1) {
			page--;
		}
	}else if (data=='next') {
		if (page<pagenumber) {
			page++;
		}
	}else if (data=='end') {
		page=pagenumber;
	}
	params.pageno=page;
	Init_MenuMge(params);
}
setnewmenu=function(obj,newpid){
	var pname=obj.dataset.name;
	var pids=obj.dataset.pid;
	$("#bg_header_3").append("<span class='cur' id='"+pids+"' onclick='bypid(this)'>&nbsp;>"+pname+"&nbsp;</span>");
	pid=newpid;

	params.pid=newpid;
	Init_MenuMge(params);
	$("#form_Back").removeClass("hide");
}

bypid=function(obj){
	var paid=obj.id;
	if(paid==pid)
		return;
	var param={
		"pageno":1,
		"pagesize":count,
		"pid":paid,
		"time":time
	};
	
	var oj=$("#bg_header_3")[0].children;
	for (var i = oj.length; i > 0 ; i--) {
		var iii=oj[i-1].id;
		
		if(iii===paid){
			break;
		}
		$(oj[i-1]).remove();

	}
	Init_MenuMge(param);

}



form_Add=function(){
	$("#hidden").val("0");
	$("#menuname").val("");
	$("#menuaddress").val("");
	$("#menuno").val("");
	$(".nr").css("display","block");
}
function t_num(number){
	var reg = /^\+?[1-9][0-9]*$/;
	if(!reg.test(number)){
		alert("排序中请输入正整数");
		return false;
	}
	return true;
}
newform=function(){
	var name = $("#menuname").val();
	if(!name){
		alert("请填写菜单名称");
		return;
	}
	var url = $("#menuaddress").val();
	var index=$("#menuno").val();
	if (!t_num(index)) {
		return false;
	}
	var id=$("#hidden").val();
	var newparam={"id":id,"pid":pid,"name":name,"url":url,"index":index};
	$.post("/system/savemenu",newparam,function(res){
		if(res.code!=0){
			alert("添加失败");
		}
		$(".nr").css("display","none");
		Init_MenuMge(params);
	});

	
}
MenuEdit=function(id){
	$.get("/system/savemenu",{id:id},function(res){
		if(res.data.length>0){
			$("#hidden").val(res.data[0].id);
			$("#menuname").val(res.data[0].name);
			$("#menuaddress").val(res.data[0].url);
			$("#menuno").val(res.data[0].index);
			$(".nr").css("display","block");
		}
	});
}
closeform=function(){
	console.log(2);
	$(".nr").css("display","none");
	$("#menuname").val("");
	$("#menuaddress").val("");
	$("#menuno").val("");
}



function splieChkListIds(chklistIds){
	console.log(chklistIds)
	var chkString = "";
	for (var i =0; i<chklistIds.length; i++) {
		if (i==0) {
			chkString+=chklistIds[i];
			continue;
		}
		chkString+=","+chklistIds[i];
	}
	return chkString;
}

$(document).ready(function () { 
	$('#nowpage').bind('keypress',function(event){ 
         var inputpage= $('#nowpage').val();
         if(event.keyCode == 13){  
             if(inputpage<=page&&inputpage>0){
             	page=Math.floor(inputpage);
             	Init_MenuMge(params);
             }
         }  
     });
    $('#form_Delete').click(function () {
    	 var chklist=splieChkListIds(chklistIds);
    	console.log(chklist);
    	if(chklistIds.length<=0){
            alert("未选择角色");
            return;
        }
	layer.confirm("是否删除选中菜单？", {title: "删除确认"}, function (index) {
            layer.close(index);
           $.post("/system/menudel",{id:chklist},function(res){
    		if (res.code==-1) {
    			alert(res.message);
			return;
    		}
			alert('删除成功');
    		 Init_MenuMge(params);
    		});
        });	

    	
    });
    $("#form_Back").click(function(){
    	params.pageno=1;
		params.pagesize=count;
		params.pid=0;
		pid=0;
		Init_MenuMge(params);
		
		$("#bg_header_3").empty();
		$("#nowpage").val(1);
		$("#form_Back").addClass("hide");
    });
})