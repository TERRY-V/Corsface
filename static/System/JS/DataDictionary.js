/**
 * Created by zhaoj on 2017/9/21.
 */
var table = new ListTable();

var unShow = [];
var objParams;
var form = new FormEngine();

Init_Dictionary = function(){
    var con="";
    try{
        did = Util.GetParam("pid");
    }catch(e){
        //TODO handle the exception
        did = '0'
    }
    if(did){
        con = "pid='" + did + "'";
        $('#form_Back').removeClass('hide')
		$('#form_Back').click(function () {
			window.history.go(-1)
		})
    }else {
        con = ''
    }
    objParams = {Contain:"divListTable",XmlPath:"../Xml/V30_DataDictionary_List.xml",Query:con, UnDisField : unShow};
    table.init(objParams);
    $('#form_Add').click(function () {

        var objFParams ={Contain:"divForm",XmlPath:"../Xml/V30_DataDictionary_Form.xml",Pid:did};

        LayerForm(objFParams)

    })
    $('#form_Del').click(function () {
    	table.Delete();
    })

}

GetOperator = function(did){
    var href = "<a class='btn btn-social-icon btn-bitbucket btn-edit' title='编辑' href='javascript:DataDictionaryEdit(\"" + did + "\")'></a>";
    href += "&nbsp;<a class='btn btn-social-icon btn-submenu btn-use' title='子菜单' href='V30_DataDictionary.html?pid=" + did + "'></a>";
    return href;
}

DataDictionaryEdit = function (did) {
    var objFParams ={Contain:"divForm",XmlPath:"../Xml/V30_DataDictionary_Form.xml",KeyValue:did};
    LayerForm(objFParams)

}

function LayerForm(objFParams) {
    $('#divForm>*').remove();

    form.init(objFParams);

    var pa = {type: 1,
        title: '编辑数据字典',
        area: ['700px', '420px'],
        content: $('#divForm'),
        btn: ['确定', '取消']
        ,yes: function(index, layero){
            //按钮【按钮一】的回调
            form.Save();

            $('#divForm').empty();
            layer.close(index)
            table.Refresh();
        }
        ,btn2: function(index, layero){
            //按钮【按钮二】的回调
            $('#divForm').empty();

            //return false 开启该代码可禁止点击该按钮关闭
        },cancel: function(){
            //右上角关闭回调
            $('#divForm').empty();
        }
    };
    layer.open(pa);
    $('.layui-layer-content').css('overflow','hidden')
}

$(document).ready(function () {
    $('#table_refresh').click(function () {
        listTable.Refresh();
    });
    
    //lwh 20171212 add list delete    
    $('#form_Delete').click(function () {
    	table.Delete();
    	//table.Refresh();
    });
    
    $('#table_filtrate').click(function () {
        $('#table_filtrate_li').toggleClass('hide')
    })
})

CheckList = function (a) {
    if($(this).hasClass('checked')){
        unShow.push(a);
        $(this).removeClass('checked');
        $(this).addClass('unchecked');
        $('#divListTable').empty();
        $('#table_filtrate_li').empty();
        objParams.UnDisField = unShow;
        table.init(objParams);
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
        table.init(objParams);
    }
}