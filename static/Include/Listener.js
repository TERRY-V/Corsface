/**lwh 20170930 
 * add for Listen Server Publish Message
 */

Listener = function(callback){
	$(function () {
	    
	    (function longPolling() {
	    
	        $.ajax({
	            url: "msgTrack.action",
	            data: {"timed": new Date().getTime()},
	            dataType: "text",
	            timeout: 10000,
	            error: function (XMLHttpRequest, textStatus, errorThrown) {
	                $("#state").append("[state: " + textStatus + ", error: " + errorThrown + " ]<br/>");
	                if (textStatus == "timeout") { // 请求超时
	                        longPolling(); // 递归调用
	                    
	                    // 其他错误，如网络错误等
	                    } else if(textStatus != "error"){ 
	                        longPolling();
	                    }
	                },
	            success: function (data, textStatus) {
	            	if(data && data!=""){
		            	//alert(data);
	            		callback(data);	 
	            		//longPolling();
	            	}
	                if (textStatus == "success") { // 请求成功
	                	setTimeout(longPolling,2000);
	                }
	            }
	        });
	    })();
	    
	});
}