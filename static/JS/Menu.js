var form = new FormEngine();

var listTable = new ListTable();
var unShow = [];
var objParams;
//操作
GetOperator = function(muid) {
	var href = "<a class='btn btn-social-icon btn-bitbucket btn-edit' title='编辑' href='javascript:MenuEdit(\"" + muid + "\")'></a>";
	href += "&nbsp;<a class='btn btn-social-icon btn-submenu btn-submenu' title='子菜单' href='V30_Menu_Manager.html?pid=" + muid + "'></a>";
	return href;
}
var pid;
Init_MenuMge = function() {
	var con = "";
	try {
		pid = Util.GetParam("pid");
	} catch(e) {
		//TODO handle the exception
		pid = '0'
	}

	if(pid) {
		con = "pid='" + pid + "'";
		$('#form_Back').removeClass('hide')
		$('#form_Back').click(function() {
			window.history.go(-1)
		})
	}

    objParams = {
		Contain: "divListTable",
		XmlPath: "../Xml/V30_Menu_List.xml",
		Query: con,
        UnDisField : unShow
	};

	listTable.init(objParams);

	$('#form_Add').click(function() {

		var objFParams = {
			Contain: "divForm",
			XmlPath: "../Xml/V30_Menu_Form.xml",
			Pid: pid
		};

		LayerForm(objFParams)

	})
	$('#form_Del').click(function() {
		listTable.Delete();
	})

};

//form.save();
MenuEdit = function(muid) {

	var objFParams = {
		Contain: "divForm",
		XmlPath: "../Xml/V30_Menu_Form.xml",
		KeyValue: muid
	};

	LayerForm(objFParams)

}

function LayerForm(objFParams) {
	$('#divForm>*').remove();

	form.init(objFParams);

	ChangeImage();

	var pa = {
		type: 1,
		title: '编辑菜单',
		area: ['700px', '400px'],
		content: $('#divForm'),
		btn: ['确定', '取消'],
		yes: function(index, layero) {
			//按钮【按钮一】的回调
			form.Save();
			$('#divForm').empty();
			layer.close(index)
			listTable.Refresh();
		},
		btn2: function(index, layero) {
			//按钮【按钮二】的回调
			$('#divForm').empty();

			//return false 开启该代码可禁止点击该按钮关闭
		},
		cancel: function() {
			//右上角关闭回调
			$('#divForm').empty();
		}
	};
	layer.open(pa);
}

GetRuleType = function(ITYPE) {
	var result = '';
	//switch (ITYPE){
	//	case 0:
	//		result = ''
	//}
	result = ITYPE;
	return result;
}

// 改变上传文件按钮
ChangeImage = function() {
	jQuery('input[type="file"]').each(function() {
		var width = jQuery(this).width();
		jQuery(this).css('opacity', '0');
		jQuery(this).parent().prepend('<input type="button" style="width: ' + (width) + 'px;margin: 0 ' + (-width) + 'px 0 0;" value="上传文件"/>')
	})
};
$(document).ready(function () {
    $('#table_refresh').click(function () {
        listTable.Refresh();
    })
    $('#table_filtrate').click(function () {
        $('#table_filtrate_li').toggleClass('hide')
    });

    //lwh 20171212 add list delete
    $('#form_Delete').click(function () {
    	listTable.Delete();
    	//table.Refresh();
    });
})

CheckList = function (a) {
    if($(this).hasClass('checked')){
        unShow.push(a);
        $(this).removeClass('checked');
        $(this).addClass('unchecked');
        $('#divListTable').empty();
        $('#table_filtrate_li').empty();
        objParams.UnDisField = unShow;
        listTable.init(objParams);
    }else {
        $(this).addClass('checked');
        $(this).removeClass('unchecked');
        var newUnShow = [];
        for(var i=0;i<unShow.length;i++){
            if(unShow[i] != a){
                newUnShow.push(unShow[i])
            }
        }
        unShow = newUnShow;
        objParams.UnDisField = unShow;
        $('#divListTable').empty();
        $('#table_filtrate_li').empty();
        listTable.init(objParams);
    }
}
