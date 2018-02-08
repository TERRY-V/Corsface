
var rightValue = [];
var unShow = [];
var objParams;
var listTable = new ListTable();

var role_key_id;
SetRight = function(rid) {
	var zNodes = [];
	var right = [];
	var date = new Date();
	var time = date.getTime();
	$.get(
		"/system/menuall",{time:time}, 
		function(data) {
			if(data.data){
				var re= data.data;
				for (var i=0;i<re.length;i++) {
					var inner_item={
						id:re[i].id,
						pId:re[i].pid,
						name:re[i].name
					}
					zNodes.push(inner_item);
				}
			}else {
				parent.window.location.Init_Rolehref = '/corsface/';
			}

			$.get('/usercenter/rolemenusave', {roleid: rid,time:time}, function (data) {
		console.log(data);
		data=data.data[0];
		
		if(data){
			role_key_id=data.id;
			data=data.menu_id_str.split(',');
            for (x in data) {
                right.push(data[x])
            }

            rightValue = right

            for (y in right) {
                for (z in zNodes) {
                    if (right[y] == zNodes[z].id) {
                        zNodes[z].checked = true
                    }
                }
            }
        }else{
			rightValue = []
			role_key_id='';
		}
        var setting = {
            check: {
                enable: true,
                chkboxType: {
                    "Y": "ps",
                    "N": "ps"
                },
                chkStyle: "checkbox"
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                onCheck: rightCheck
            }
        };
        
        var t = $("#tree");
        t = $.fn.zTree.init(t, setting, zNodes);

    })
		}
	);
	




	var pa = {
		type: 1,
		title: '设置角色权限',
		area: ['270px', '500px'],
		content: $('#rightTree'),
		btn: ['确定', '取消'],
		yes: function(index, layero) {
			$('#tree').empty()
			var treeObj=$.fn.zTree.getZTreeObj("tree");
            var nodes=treeObj.getCheckedNodes(true);
            var rightValue="";
            for(var i=0;i<nodes.length;i++){
            	if(i>0)
            		rightValue+=",";
            	rightValue+=nodes[i].id;
            }
            var aram={role_id:rid,menu_id_str:rightValue};
            if(role_key_id){
            	aram.id=role_key_id;
            }

			jQuery.post('/usercenter/rolemenusave', aram, function (data) {

            })
			layer.close(index)
		},
		btn2: function(index, layero) {

			$('#tree').empty()

		},
		cancel: function() {
			$('#tree').empty()

		}
	};
	layer.open(pa);
}
var count=13;
var page=1;
var pagenumber=1;
var params={
	"pageno":page,
	"pagesize":count
};
var role_id;
var rid;
Init_Role = function(params) {
	$('#tbody').empty();
	chklistIds=[];
	$("#nowpage").val(page);
	var con = "";

	try {
		rid = Util.GetParam("rid");
	} catch(e) {
		rid = 0;
	}
	$.post("/usercenter/rolelist",params,function(res){
		number=res.allnum;
		pagenumber=Math.floor((number%count)>0?(number/count)+1:(number/count));
		
		 $('#number').empty();
         $('#pagenumber').empty();
         $('#number').text(res.allnum);
         $('#pagenumber').html(pagenumber==0?1:pagenumber);
		setroleinfo(res.data);
	})

	
}

setroleinfo=function(res){
	var html="";
	for (var i = 0; i < 13; i++) {
		var id = res[i]?res[i].id:"";
		var remark = res[i]?res[i].remark:"";
		var e_name = res[i]?res[i].e_name:"";
		var role_name = res[i]?res[i].role_name:"";
		var username = res[i]?res[i].username:"";
		var check = res[i]?	"<input type='checkbox' name='chklist' id='chklist' value="+res[i].id+" onclick='MutiPageMutiSelect(this)'>":"";
		var href=res[i]?"<a class='btn btn-social-icon btn-bitbucket btn-edit' onclick='new_role(\"" + id + "\")' style='' title='编辑'></a>"
						+"&nbsp;<a class='btn btn-social-icon btn-bitbucket btn-use' onclick='personselect(\"" + id + "\")'  title='选择人员'></a>"
						+"&nbsp;<a class='btn btn-social-icon btn-bitbucket btn-setright' onclick='SetRight(\"" + id + "\")' title='设置权限'></a>":"";
		html+="<tr>";
		html+="<td>"+check+"</td>";
		html+="<td>"+role_name+"</td>";
		html+="<td>"+e_name+"</td>";
		html+="<td>"+remark+"</td>";
		html+="<td>"+href+"</td>"
		html+="</tr>";
	}
	 $("#tbody").append(html);
}
new_role=function(id){
	$(".iFrom").css("display","block");
	if (id<0) {
		$("#iFrom_Top").empty();
		$("#iFrom_Top").append("&nbsp;&nbsp;&nbsp;新&nbsp;建");
	}else{
		$("#iFrom_Top").empty();
		$("#iFrom_Top").append("&nbsp;&nbsp;&nbsp;编&nbsp;辑");
		$.get("/usercenter/rolesave",{id:id},function(res){
			var data = res.data;
			$("#role_name").val(data[0].role_name);
			$("#e_name").val(data[0].e_name);
			$("#remark").val(data[0].remark);
			$("#hidden").val(data[0].id);
		});
	}
}	
personselect=function(id){
	role_id=id;
	
	$("#info_left").empty();
	$("#info_right").empty();
	$.post("/usercenter/userlist",{pageno:1,pagesize:500},
		function(result){
			addleft(result.data,id);
			$.post("/usercenter/userlist",{pageno:1,pagesize:501,roleid:id},
				function(result){
				addright(result.data,id);
				$(".select_role").css("display","block");
			});
		});


	
}
addleft=function(data,id){
	var html="";
	for (var i = 0; i < data.length; i++) {
		var tit=data[i].username+(data[i].role_name?"<"+data[i].role_name+">":"");
		html+="<p id='"+data[i].id+"' ondblclick='add(this,"+data[i].id+")' title='"+tit+"'>"+tit+"</p>";
	}
	$("#info_left").append(html);
	
}
addright=function(data,id){
	var right=[];
	var html="";
	for (var i = 0; i < data.length; i++) {
		right.push(data[i].id);
		html+="<p id='"+data[i].id+"' ondblclick='rit_rmove(this,this.id)'>"+data[i].username+"</p>";
	}
	$("#info_right").append(html);
	del_from_left(right);
}

add=function(obj,id){
	remove(obj);
	var obj=$("#info_right");
	var right_arr=obj[0].children;
	for (var i = 0; i < right_arr.length; i++) {
		if(right_arr[i].id==id){
			return;
		}
	}
	addInRight(id);
}

rit_rmove=function(obj,id){
	remove(obj);
	$.get("/usercenter/usersave",{id:id},function(result){
		var data=result.data[0];
		var tit=data.username+(data.role_name?"<"+data.role_name+">":"");
		$("#info_left").append("<p id='"+data.id+"' ondblclick='add(this,"+data.id+")' title='"+tit+"'>"+tit+"</p>");
	});
}

remove=function(obj){
	$(obj).remove();
}

addInRight=function(id){
	$.get("/usercenter/usersave",{id:id},function(result){
		var data=result.data[0];
		$("#info_right").append("<p id='"+data.id+"' ondblclick='rit_rmove(this,this.id)' tit='"+data.username+"'>"+data.username+"</p>");
	});
}


add_role=function(){
	var obj=$("#info_right");
	var arr=[];
	var right_arr=obj[0].children;
	for (var i = 0; i < right_arr.length; i++) {
		arr.push(right_arr[i].id);
	}
	var userid = arr.join(',');
	var param={roleid:role_id,userid_str:userid};
	$.post("/usercenter/roleuser",param,function(data){
		if(data.code!=0){
			alert(data.message);
		}else{
			$(".select_role").css("display","none");
			
		}
	})
	
}

cancel=function(){
	$(".select_role").css("display","none");
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

del_from_left=function(ids){
	var r_ids=ids;
	var obj_arr=[];
	var left_obj=$('#info_left');
	var left_obj_cl=left_obj[0].children;
	if(left_obj_cl.length>0){
		for (var i = 0; i < left_obj_cl.length; i++) {
			var q_obj = left_obj_cl[i];
			for (var j = 0; j < r_ids.length; j++) {
				if(q_obj.id===JSON.stringify(r_ids[j])){
					obj_arr.push(q_obj);
					break;
				}
			}
		}
	}
	for (var i = 0; i < obj_arr.length; i++) {
		$(obj_arr[i]).remove();
	}
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
	Init_Role(params);
}

$(document).ready(function(){ 

	$('#nowpage').bind('keypress',function(event){ 
         var inputpage= $('#nowpage').val();
         if(event.keyCode == 13){  
             if(inputpage<=page&&inputpage>0){
             	page=Math.floor(inputpage);
             	Init_Role(params);
             }
         }  
     });


	$('#close_role').click(function () {
    	$(".iFrom").css("display","none");
		$("#role_name").val("");
		$("#e_name").val("");
		$("#remark").val("");
		$("#hidden").val("0");
    });
    $("#save_role").click(function(){
    	var role_name=$("#role_name").val();
		var e_name=$("#e_name").val();
		if(!role_name){
			alert("请输入角色名称！");
			return;
		}
		if (e_name) {
			if(!(/^[A-Za-z]+$/.test(e_name))){
				alert("英文名称格式错误");
				return;
			}
		}
		
		
		var remark=$("#remark").val();
		var id=$("#hidden").val();
		var params={
			"id":id,
			"remark":remark,
			"e_name":e_name,
			"role_name":role_name
		}
		$.post("/usercenter/rolesave",params,function(res){
			if(res.code!=0){
				alert("保存失败");
			}
			Init_Role(params);
		
		});
		$(".iFrom").css("display","none");
		$("#role_name").val("");
		$("#e_name").val("");
		$("#remark").val("");
		$("#hidden").val("0");
		
    });
    $("#listDelete").click(function(){
		var chklist=splieChkListIds(chklistIds);
		if(chklistIds.length<=0){
            alert("未选择角色");
            return;
        }
		layer.confirm("是否删除选中角色", {title: "删除确认"}, function (index) {
          		  layer.close(index);
           			$.post("/usercenter/roledel",{id:chklist},function(result){
				if(result.code==0){
					Init_Role(params);
					alert('删除成功');
				}else{
					alert(result.message);
					console.log(result.message);
				}
			});
       		 });
		
		
    });
})


goBack = function() {
	window.location.href = 'V30_Role_List.html'
}


personSelect = function (obj,rid){
       var usrs = obj.parentElement.parentElement.cells[4].children[0].getAttribute("title");
       SelectUser(usrs, rid);
}


$(document).ready(function () {

	del_role = function() {
		listTable.Delete();
		listTable.Refresh();
	}
	
	rightCheck = function (event, treeId, treeNode) {

		if(rightValue.indexOf(treeNode.id) == -1){
            rightValue.push(treeNode.id)

		}else{
			var arr = rightValue.indexOf(treeNode.id)
            rightValue.splice(arr, 1)

		}
      return false
    }

    $('#table_refresh').click(function () {
        listTable.Refresh();
    })
    $('#table_filtrate').click(function () {
        $('#table_filtrate_li').toggleClass('hide')
    })
})


