var uid
var listTable = new ListTable();
var unShow = [];
var objParams;

var pageno=1;
var pagesize=13;
var number;
var pagenumber;
var init_params={
    "pageno":pageno,
    "pagesize":pagesize
};
 var html="";
 html+='<tr id="pwd_again_tr"><td style="width: 150px;">密码验证：</td>'+
          '<td style="text-align: left;width: 300px;height: 40px;">'+
          '<input style="width:100%;" type="text" id="password_again" placeholder="请再次输入密码(必填)" maxlength="12" onfocus="this.type=\'password\'"></td></tr>';


GetOperator = function(uid){
    var href = "<a class='btn btn-social-icon btn-edit' href='javascript:UserEdit(\"" + uid + "\")'></a>";
    return href;
};

Init_User = function (init_params) {
    $("#tbody").empty();
    chklistIds=[];
    $.post("/usercenter/userlist",init_params,function(res){
        var data;
            number=res.allnum;
            pagenumber=Math.floor((number%pagesize)>0?(number/pagesize)+1:(number/pagesize));
            data=res.data;
            $('#number').empty();
            $('#pagenumber').empty();
            $('#number').text(res.allnum);
            $('#pagenumber').html(pagenumber==0?1:pagenumber);
        init_tbody(data);
    });
};

init_tbody=function(results){

    var html="";
    for (var i = 0; i < pagesize; i++) {
        var username=results[i]?results[i].username:"";
        var uname=results[i]?results[i].u_name:"";
        var email=results[i]?results[i].email:"";
        var role_name=results[i]?results[i].role_name:"";
        var checked = results[i]?"<input type='checkbox' name='chklist' id='chklist' value="+results[i].id+" onclick='MutiPageMutiSelect(this)'>":"";
        var href= results[i]?"<a class='btn btn-social-icon btn-edit' href='javascript:UserEdit(\"" + results[i].id + "\")'></a>":"";
        html+="<tr>";
        html+="<td>"+checked+"</td>";
        html+="<td>"+username+"</td>";
        html+="<td>"+uname+"</td>";
        html+="<td>"+email+"</td>";
        html+="<td>"+role_name+"</td>";
        html+="<td>"+href+"</td>";
        html+="</tr>";
    }
    $("#tbody").append(html);
    $("#nowpage").val(pageno);
};

var form;
AddUser = function () {
    var title = 0;
    window.location.href = '/corsface/usermanagerform?title=' + title
};


UserEdit = function (uid) {
    var title = 1
    if(!uid){
        uid = '';
    }
    window.location.href = '/corsface/usermanagerform?uid=' + uid + '&title=' + title
}

delUser=function(){
    var chklist=splieChkListIds(chklistIds);
    if(chklistIds.length<=0){
            alert("未选择用户");
            return;
        }
	layer.confirm("是否删除选中用户？", {title: "删除确认"}, function (index) {
            layer.close(index);
            $.post("/usercenter/userdel",{id:chklist},function(res){
		if(res.code==0){
			alert('删除成功');
			Init_User(init_params);
			return;
		}
			alert(res.message);
            
        });
        });
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
                Init_User(init_params);
             }
         }  
     });

    $('#user_password').blur(function(){
        var title = Util.GetParam("title");
       
        if(title!=0){
            if(!$('#user_password').val()){
                 $("#pwd_again_tr").remove();
            }else{
                 if(jQuery('#password_again')[0]){
                        return;
                    }
                $("#pwd_befor").before(html);
            }
        }
    });

})

Init_User_Edit = function(){
   
    var uid = Util.GetParam("uid");
    var title = Util.GetParam("title");
    if(title == 0) {
        title = '新增用户'
        $("#pwd_befor").before(html);
    }else{
        title = '编辑用户';
        document.getElementById("user_username").readOnly="readonly";
        $('#user_password').prop('placeholder','如需修改密码,请重新输入以更改');
    }
    $('.FormTitle').html(title)
    if(!uid)
        uid = "";
    setrole(uid);
    
}
setrole=function(uid){
     jQuery.post("/usercenter/rolelist",{pageno:1,pagesize:999},function(res){
        var html="";
        var data = res.data;
        for (var i = 0; i < data.length; i++) {
            html+="<option value="+data[i].id+">"+data[i].role_name+"</option>";
        }
        jQuery("#roleid").html(html);
         if(uid){
        setuserinfo(uid)
    }
    });
    
}
setuserinfo=function(uid){
     $.get("/usercenter/usersave",{id:uid},function(res){
        $("#user_username").val(res.data[0].username);
         $("#user_password").val(res.data[0].password);
          $("#uname").val(res.data[0].u_name);
           $("#phone").val(res.data[0].phone);
           $("#email").val(res.data[0].email);
            $("#intro").val(res.data[0].intro);
            var sex = res.data[0].sex;
            if (sex==1) {
                $("#sex_man").prop('checked',true);
                $("#sex_woman").prop('checked',false);
            }else if(sex==0){
                $("#sex_man").prop('checked',false);
                $("#sex_woman").prop('checked',true);
            }
            document.getElementById('roleid').value=res.data[0].role_id;
     });
}
function isPhotoID(phoneId){
	if(!(/^1[34578]\d{9}$/.test(phoneId))){ 
        alert("请输入正确的手机号码！");  
        return false; 
    }
	return true;
}

Form_Cancel = function() {
    window.location.href = '/corsface/usermanagerlist'
    
}

verflyinfo=function(){
    var title = Util.GetParam("title");
    if (!$("#user_username").val()){
        alert("请输入登陆账号");
        return false;
    }
    if(title==0){
        if (!$("#user_password").val()){
        alert("请输入密码");
        return false;
     }
    }
    var obj=$('#password_again');
    if (obj[0]) {
        var pwd_old=$("#user_password").val();
        var pwd_new=$("#password_again").val();
        if(pwd_new===pwd_old){

        }else{
            alert('两次密码输入不一致,请重新输入！');
            return false;
        }
    }
    
    if (!$("#uname").val()){
        alert("请输入用户名");
        return false;
    }

    var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
    if ($("#email").val()) {
        if (!reg.test($("#email").val())) {
            alert("请输入正确的邮箱格式");
            return false;
        }
    }
    return true;
}

Form_Save = function(){
    if(!verflyinfo()){
        return;
    }

	var phoneId = $("#phone").val();
    if(phoneId){
        if(!isPhotoID(phoneId)){
    		return;
    	}
    }

    var params={};

    if(Util.GetParam("title")>0){
        params.id= Util.GetParam("uid");
    }
    params.username=$("#user_username").val();
    params.password=$("#user_password").val();
    params.sex=$("input[name='sex']:checked").val();
    params.phone=$("#phone").val();
    params.intro=$("#intro").val();
    params.uname=$("#uname").val();
    params.email=$("#email").val();
    params.roleid=$("#roleid").val();
    $.post("/usercenter/usersave",params,function(data){
        console.log(data);
        if(data.code==-1){
            alert("保存失败："+data.message);
        }else{
            window.location.href = '/corsface/usermanagerlist'
        }
        
    })
    
}


initPageButton=function(data){
    if (data=='start') {
        pageno=1;
    }else if (data=='last') {
        if (pageno>1) {
            pageno--;
        }
    }else if (data=='next') {
        if (pageno<pagenumber) {
            pageno++;
        }
    }else if (data=='end') {
        pageno=pagenumber;
    }
    init_params.pageno=pageno;

    Init_User(init_params);
}






