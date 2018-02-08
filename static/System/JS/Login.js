/**lwh 20170913
 * 用户登录
 */

Focus = function () {


		$("#password").focus()
		return false;


}

Login = function(){
	var uname = $("#username").val();
	var pwd = $("#password").val();
//	debugger;
	//非空验证
	if(!uname.trim()||!pwd.trim()){
		$('#error').text('用户名和密码不能为空！');
		//lwh add for focus
		if(uname.trim()=="")
			$("#username").focus();
		else if(pwd.trim()=="")
			$("#password").focus();
		
		return;
	}
	
    var params = {  
            username : uname,  
            password : pwd 
        } ;    
    $.post(
            "/usercenter/logincheck",
            params, //需要发送的Json数据
            function (data) {
                data = JSON.parse(data);
                var status = data["status"];
            if(status == 0){
                var result = findGetParam("next");
                if(result){
                    location.replace(result);
                }else
                    window.location.href = "/corsface"
            }else{
                    $('#error').text("用户名或密码不正确！");
                }
            },
            "text"
      );
}
function findGetParam(param) {
	var result = null;
	var temp = [];
	location.search
		.substr(1)
		.split("&")
		.forEach(function (item) {
			temp = item.split("=");
			if(temp[0] == param)
				result = decodeURIComponent(temp[1]);
		});
	return result;
}
//初始化页面
InitLogin = function(){
	$("#username").focus();
/*	$('#login').click(function () {
		Login();
	})	*/
}
