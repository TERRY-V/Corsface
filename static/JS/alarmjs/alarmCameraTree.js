
var setting = {
    check: {
        enable: true,
        chkboxType: { "Y" : "ps", "N" : "ps"}
    },
    view: {
        dblClickExpand:true
    },
    data: {
        simpleData: {
            enable: true
        }
    },
    callback: {
        beforeClick: beforeClick,
        onCheck: onCheck
    }
};

function beforeClick(treeId, treeNode) {
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
    //zTree.checkNode(treeNode, !treeNode.checked, null, true);
    return false;
}


//点击选择摄像头处理
function onCheck(e, treeId, treeNode) {
amCameraId=[];
    var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
        nodes = zTree.getCheckedNodes(true),
        v = "";
    var id = ''
    for (var i=0, l=nodes.length; i<l; i++) {
	if(nodes[i].name!='全部'){
	v += nodes[i].name + ",";
amCameraId.push(nodes[i].id);	
	}
        
    }
    

    /*if(amCameraId.indexOf(treeNode.id) == -1){
        amCameraId.push(treeNode.id)
    }else{
        var arr = amCameraId.indexOf(treeNode.id)
        amCameraId.splice(arr, 1)
    }*/


    $("#citySelName").html(v);
   // document.getElementById('citySelName').title = v;
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
    }
}
