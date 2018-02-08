// init tree 

var curMenu = null, zTree_Menu = null;
var setting = {
    check: {
        enable: true,
        chkboxType: {"Y":"", "N":""}
    },
    view: {
        showLine: false,
        showIcon: false,
        selectedMulti: false,
        dblClickExpand: false,
        addDiyDom: addDiyDom
    },
    data: {
        simpleData: {
            enable: true
        }
    },
    callback: {
        onClick: onClick
        //onReName:
    }
};


function addDiyDom(treeId, treeNode) {
    var spaceWidth = 5;
    var switchObj = $("#" + treeNode.tId + "_switch"),
        icoObj = $("#" + treeNode.tId + "_ico");
    switchObj.remove();
    icoObj.before(switchObj);

    if (treeNode.level > 1) {
        var spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level)+ "px'></span>";
        switchObj.before(spaceStr);
    }
}

function onClick(event, treeId, treeNode) {

	var group_id= treeNode.id;
    var groupName = treeNode.name;
    groupName = groupName.split("(");
    jQuery('#group_name').html(groupName[0]);
    
    Init_Person_List(group_id);
}

$(document).ready(function(){
	//生成左侧分组树

    $.fn.zTree.init($("#treeDemo"), setting, getGroup());
   function getGroup() {
        var zNodes = [];
        $.ajaxSetup({
            async : false
        });
        jQuery.get('/deepface/person/group', 
            {}, 
            function (data) {
            var code = data.code;
            var msg = data.message;
            if(code != 0){
                return;
            }
            var res = data.data.groups;
            // var res = JSON.parse(data);
            totalCount =0;
            for(var i = 0; i<res.length; i++){
                totalCount += res[i].count;
            }
            res.push({"id":-1, "name":"全部组", "count":totalCount});
            // jQuery('#group_name').html(res[0].name);
            var deleteListHtml = '',editListHtml = '';

            for( var i=0; i<res.length; i++ ){
                var item;
                if(res[i].id == -1){
                    item = {id: res[i].id, pId: 0, name: res[i].name + '(' + res[i].count + ')', open: true};
                    zNodes.push(item);
                    continue;
                }else {
                    deleteListHtml += '<li id="'+ res[i].id +'">'+ res[i].name +'</li>';
                    editListHtml += '<li id="EDIT'+ res[i].id +'">'+ res[i].name +': <input type="text" data-id="'+ res[i].id +'" value="'+ res[i].name +'"/></li>'
                }
                item = {id: res[i].id, pId: -1 + '', name: res[i].name + '(' + res[i].count + ')'};
                zNodes.push(item)
            }
            $('#delete_person_list ul').empty();
            $('#delete_person_list ul').append(deleteListHtml);
            $('#edit_person_list ul').empty();
            $('#edit_person_list ul').append(editListHtml)
        })
        return zNodes
    }
    function onCheck(e,treeId,treeNode){
        var treeObj=$.fn.zTree.getZTreeObj("treeDemo"),
            nodes=treeObj.getSelectedNodes(true),
            v="";
        for(var i=0;i<nodes.length;i++){
            v+=nodes[i].name + ",";
            alert(nodes[i].id); //获取选中节点的值
        }
    }


    $("#treeDemo").hover(function () {
        if (!$("#treeDemo").hasClass("showIcon")) {
            $("#treeDemo").addClass("showIcon");
        }
    }, function() {
        $("#treeDemo").removeClass("showIcon");
    });

});