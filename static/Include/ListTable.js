;
var ListTable = function(obj, xmlPath) {
	//	获取xml的地址
	this.xmlPath = xmlPath;
	//	table创建所在元素
	this.obj = obj;
	//	存放xml里数据的数组
	this.fieldArr = [];
	//	Field字符串集合
	this.fieldStr = '';
	//	表头html
	this.thhtml = '';
	//	表单主体html
	this.tbodyhtml = '';
	//	表单底部html
	this.tfoot = '';
	//	表单整体html
	this.tablehtml = '';
	//	表单搜索部分html
	this.searchHtml = '';

	this.Fields = '';
	//	表格的行数
	this.rowsNum = 0;
	//	表格当前的页数
	this.page = 1;
	//	表格的总页数
	this.pageNum = 8;
	//	总条数 //lwh 20171101 add for page show total number
	this.totalNum = 0;
	//	分页部分dhtml
	this.pageHtml = '';
	// 传入的参数query
	this.Query = '';
	this.UnDisField;
	this.IsShowPage = true;
	this.IsShowSearch = false;
	this.Condition = '';
	this.Order = '';
	this.TableName = '';
	this.TagName = '';
	this.keyTable = '';
	this.sortField = '';
}

//刷新对象内的数据
ListTable.prototype.init = function(params) {
    //	获取xml的地址
    this.xmlPath = '';
    //	table创建所在元素
    this.obj = obj;
    //	存放xml里数据的数组
    this.fieldArr = [];
    //	Field字符串集合
    this.fieldStr = '';
    //	表头html
    this.thhtml = '';
    //	表单主体html
    this.tbodyhtml = '';
    //	表单底部html
    this.tfoot = '';
    //	表单整体html
    this.tablehtml = '';
    //	表单搜索部分html
    this.searchHtml = '';

    this.params = params;

    //	{Contain:"",XmlPath:"",Query:con,UnDisField:["入库日期","操作"],IsShowPage:false,IsShowSearch:true}
	if(typeof params.Contain === 'string') {
		var obj = document.getElementById(params.Contain);
	} else {
		var obj = params.Contain;
	}
	this.Query = params.Query;
	this.UnDisField = params.UnDisField;
	this.IsShowPage = params.IsShowPage;
	this.IsShowSearch = params.IsShowSearch;
	this.page = params.NowPage?params.NowPage:1;
	this.obj = obj;
	this.xmlPath = params.XmlPath;
	if(params.changeTableName){
		this.TableName = params.changeTableName;
	}
	this.createTh();
	var re = this.createTd();
	this.createTable();
    SelectHasSelected();
	return re;
}

//通过解析xml文件拼写列表头的html代码
ListTable.prototype.createTh = function() {
	jQuery.ajaxSetup({
		async: false
	});
	var tabObj = this;
	var xmlPath = this.xmlPath ? this.xmlPath : './V21_Input_List.xml';
	jQuery.get(xmlPath, function(xmlfile) {

		var $xml = jQuery(xmlfile);
		var $rs = $xml.children(':first').children(':nth-child(2)');
		tabObj.rowsNum = $rs.attr('RowsNumber');
		if(!tabObj.TableName){
            tabObj.TableName = $rs.attr('TableName');
        }
		tabObj.Order = $rs.attr('Order');
		tabObj.Condition = $rs.attr('Condition');
		tabObj.keyTable = $rs.attr('KeyTable');
		tabObj.sortField = $rs.attr('SortField');
		var $z = $xml.children(':first').children(':nth-child(2)').children()

		$z.each(function(index) {

			if(jQuery(this).attr('IsShowing').toLowerCase() == 'true' && jQuery.inArray(jQuery(this).attr('FieldAlias'),tabObj.UnDisField) == '-1') {
				try {
                    if(index!='0'){
                        jQuery('#table_filtrate_li').append('<li class="checked" onclick="CheckList.call(this,'+ "'" +jQuery(this).attr('FieldAlias')+ "'" +')">'+jQuery(this).attr('FieldAlias')+'</li>');
                    }
				}catch (e){
								}
				var fieldObj = {
					Field: jQuery(this).attr('Field'),
					FieldAlias: jQuery(this).attr('FieldAlias'),
					Align: jQuery(this).attr('Align'),
					IsShowing: jQuery(this).attr('IsShowing'),
					IsSequence: jQuery(this).attr('IsSequence'),
					DataType: jQuery(this).attr('DataType'),
					FieldWidth: jQuery(this).attr('FieldWidth'),
					DataTypeCode: jQuery(this).attr('DataTypeCode'),
					IsQuery: jQuery(this).attr('IsQuery'),
					ISEdit: jQuery(this).attr('ISEdit'),
					DisplayType: jQuery(this).attr('DisplayType'),
					DisplayValue: jQuery(this).attr('DisplayValue')
				};
				tabObj.fieldArr.push(fieldObj);
				if(jQuery(this).attr('Field')) {
					if(tabObj.fieldStr) {
						tabObj.fieldStr += ',' + jQuery(this).attr('Field')
					} else {
						tabObj.fieldStr += jQuery(this).attr('Field')
					}
				}
				var tdhtml = '<th style="width:' + jQuery(this).attr('FieldWidth') + ';text-align:' + jQuery(this).attr('Align') + ';">' + jQuery(this).attr('FieldAlias') + '</th>';
				tabObj.thhtml += tdhtml;
				if(jQuery(this).attr('IsQuery').toLowerCase() == 'true') {
					tabObj.searchHtml += '<div>' + jQuery(this).attr('FieldAlias') + ':<input type="text" width="80px" /></div>'
				}
			} else {
				try {
                    if(index!='0'&&jQuery(this).attr('IsShowing').toLowerCase() == 'true') {
                        jQuery('#table_filtrate_li').append('<li class="unchecked" onclick="CheckList.call(this,'+ "'" + jQuery(this).attr('FieldAlias') + "'" +')">' + jQuery(this).attr('FieldAlias') + '</li>');
                    }
				}catch (e){
							}
				if(jQuery(this).attr('Field')) {
					if(tabObj.fieldStr) {
						tabObj.fieldStr += ',' + jQuery(this).attr('Field')
					} else {
						tabObj.fieldStr += jQuery(this).attr('Field')
					}
				}
			}
		});
		tabObj.searchHtml = '<div class="search_wrap">' + tabObj.searchHtml + '</div>';
		tabObj.tfoot = '<tfoot><tr>' + tabObj.thhtml + '</tr></tfoot>';
		tabObj.thhtml = '<thead><tr>' + tabObj.thhtml + '</tr></thead>';
	})
};
//通过解析xml文件拼写列表内容的html代码
ListTable.prototype.createTd = function(page) {
	jQuery.ajaxSetup({
		async: false
	});
	var tabObj = this;

	var res;

		var Condition = this.Condition;
	// if(Condition != "" && this.Query != "") {
	// 	Condition += " And (" + this.Query + ")";
	// } else if(Condition == "" && this.Query != "")
	// 	Condition = this.Query;
	if(this.Query) {
		Condition = this.Query;
	}
	//debugger;
	var postParams = {
		'TagName': "GetTableList",
		'Fields': this.fieldStr,
		'TableName': this.TableName,
		'Condition': Condition,
		'Order': this.Order,
		'PageNo': this.page,
		'PageSize': this.rowsNum
	};
	jQuery.post('/CorsFace/listTable.action', postParams, function(data) {
		if(!data) {
			return
		}
		res = data;
		var data = JSON.parse(data);
		// 获取返回的数据为table
		var $table = data[0].results;
		tabObj.pageNum = data[0].totalPages == 0 ? 1 : data[0].totalPages;
		tabObj.totalNum = data[0].totalCount;
		// 循环每页的行数
		for(var i = 0; i < tabObj.rowsNum; i++) {
			var trhtml = '';
			// 循环每行的列
			for(var j = 0; j < tabObj.fieldArr.length; j++) {
				var $tab = $table[i];
				var val = "";
				if($table[i]) {
					var valueType = tabObj.fieldArr[j].DisplayType;
					var disValue = tabObj.fieldArr[j].DisplayValue;
					for(x in $tab) {

						if(disValue) {
							var val = $tab[x];
							if(!val)
								val = "";
							disValue = disValue.replace("{" + x + "}", val);

						}
					}
					if(valueType == 'Function') {
						val = "";
						try{
							val = eval(disValue);
						}catch (err){
							console.log(err)
						}

					} else {
						for(x in $tab) {
							if(x === disValue) {
								var val = $tab[x];
								if(!val)
									val = "";
								disValue = val;
							}
						}
						val = disValue;
					}
				} else {
					val = '&nbsp'
				}
				if(!val) {
					val = '&nbsp';
				}
				trhtml += '<td align="' + tabObj.fieldArr[j].Align + '">' + val + '</td>'
			}
			trhtml = '<tr>' + trhtml + '</tr>';
			tabObj.tbodyhtml += trhtml
		}
		tabObj.tbodyhtml = '<tbody>' + tabObj.tbodyhtml + '</tbody>';
		tabObj.tablehtml = tabObj.thhtml + tabObj.tbodyhtml
	});
	return res;
};
//创建列表
ListTable.prototype.createTable = function() {
	jQuery(this.obj).prepend('<table class="col-sm-12 dataTable table-bordered" cellspacing="0">' + this.tablehtml + '</table>')
	this.createSearch(this.obj)
};
//重新获取xml并更新列表内容
ListTable.prototype.updateTable = function() {
	jQuery(this.obj).find('tbody,tfoot').remove();
	
	this.tbodyhtml = '';
	this.createTd();
	jQuery(this.obj).find('table').append(this.tbodyhtml);
	changeCurrent(this);
	function changeCurrent(a) {
		var firstLiNum = parseInt(jQuery('.pageList>li:first').text());
		var lastLiNum = parseInt(jQuery('.pageList>li:last').text());
				jQuery('.pageList>li').removeClass('active');

		if(a.page >= lastLiNum && lastLiNum < a.pageNum) {
			jQuery('.pageList>li').each(function() {
				this.innerText = this.innerText - 0 + 1
			})
		} else if(a.page <= firstLiNum && firstLiNum != 1) {
			jQuery('.pageList>li').each(function() {
				this.innerText = this.innerText - 1
			})
		}
		jQuery('.pageList>li').each(function() {
			if(this.innerText == a.page) {
				jQuery(this).addClass('active')
			}
		})
	}
};

ListTable.prototype.Refresh = function() {
    jQuery(this.obj).empty();
	this.init(this.params);
};

ListTable.prototype.Delete = function() {
    var DeleteArr = '';
	jQuery(this.obj).find('input[name="chklist"]:checked').each(function() {
		var val = $(this).val();
		if(val.indexOf('.')>-1){
			val = val.split('.')[1];
		}
		DeleteArr += val + ',';
        chklistIds.push(val);
	});
	if(DeleteArr.length==0){
		alert("删除时至少选择一项进行删除！");
		return;
	}
	
	DeleteArr = DeleteArr.substr(0, DeleteArr.length - 1);
	var params = {
    		TagName: 'DeleteTableList',
    		KeyValues: DeleteArr,
    		KeyTable: this.keyTable,
    		KeyParam: this.sortField
    };
	
	var listObj = this;
	
	layer.confirm("确认要删除吗，删除后不能恢复", { title: "删除确认" }, function (index) {  
        layer.close(index);

    	jQuery.post('listTable.action', params, function(data) {
    		if(data=="OK"){
    			alert("删除成功！");
    			listObj.Refresh();
    		}
    		else
    			alert("删除失败！" + data);
        })        
    });  
	
	
};
ListTable.prototype.DeleteSingle = function(id) {
    var DeleteArr = id;
    var params = {
        TagName: 'DeleteTableList',
        KeyValues: DeleteArr,
        KeyTable: this.keyTable,
        KeyParam: this.sortField
    };

    var listObj = this;

    layer.confirm("确认要删除吗，删除后不能恢复", { title: "删除确认" }, function (index) {
        layer.close(index);

        jQuery.post('listTable.action', params, function(data) {
            if(data=="OK"){
                alert("删除成功！");
                listObj.Refresh();
            }
            else
                alert("删除失败！" + data);
        })
    });


};
//创建列表上方搜索框与列表下方换页按钮
ListTable.prototype.createSearch = function(obj) {
	var ulhtml = '';
	var len = this.pageNum <= 7 ? this.pageNum : 7;
	var listTable = this;
	for(var i = 0; i < len; i++) {
		if(i == 0) {
			ulhtml += '<li class="active">' + (i + 1) + '</li>'

		} else {
			ulhtml += '<li>' + (i + 1) + '</li>'

		}
	}
	ulhtml = '<ul class="pageList">' + ulhtml + '</ul>';

	function changePage(ev) {
				if(typeof(parseInt(ev.target.innerText)) == "number") {
			this.page = parseInt(ev.target.innerText);
			this.updateTable(obj);
			SelectHasSelected();
		}
	}
    function show_confirm() {
        var DeleteArr = '';
        jQuery(this.obj).find('input[name="chklist"]:checked').each(function() {

            var val = $(this).val();
            if(val.indexOf('.')>-1){
                val = val.split('.')[1];
            }
            DeleteArr += val + ',';
        })
		if(DeleteArr == ''){
			alert('请至少选择一项!');
			return false;
		}
        var conf = confirm("您的操作可能引起数据变化，请确认是否删除？")
        if(conf){
            listTable.Delete();
            listTable.Refresh();
        }else{
        	return false
		}
    }
	this.pageHtml = '<div class="pageWrap clearfix"><a class="delectList" >删除</a><div class="pageManage"><div class="firstPage">首页</div><div class="prePage">上一页</div>' + ulhtml +
		'<div class="nextPage">下一页</div><div class="lastPage">尾页</div>' +
		'<div class="changePage">第<input type="text" name="" class="pageNow" value="" />页&nbsp;&nbsp;&nbsp;共<span class="pageCount">' + this.totalNum + '</span>条</div></div></div>';

	//	jQuery(obj).prepend(this.searchHtml)
	jQuery(obj).append(this.pageHtml)
	jQuery(obj).find('.pageList>li').click(changePage.bind(this))
	jQuery(obj).find('.delectList').click(show_confirm.bind(this))

	jQuery(obj).find('.firstPage').click(firstPage.bind(this))

	function firstPage() {
		this.page = 1;
		this.updateTable(obj);
		SelectHasSelected();

    }
	jQuery(obj).find('.lastPage').click(lastPage.bind(this))

	function lastPage() {
		this.page = this.pageNum;
		this.updateTable(obj);
		SelectHasSelected();

    }
	jQuery(obj).find('.prePage').click(prePage.bind(this));

	function nextPage() {
		if(this.page == this.pageNum) {
			return;
		} else {
			this.page += 1;
		}
		this.updateTable(obj);
		SelectHasSelected();
	}
	jQuery(obj).find('.nextPage').click(nextPage.bind(this));

	function prePage() {
		if(this.page == 1) {
			return;
		} else {
			this.page -= 1;
		}
		this.updateTable(obj);

		SelectHasSelected();

    }

	jQuery(obj).find('.pageNow').on('keypress', goPage.bind(this));

	function goPage(event) {
		if(event.keyCode == "13") {
			var targetpage = jQuery('.pageNow').val();
            targetpage = Number(targetpage);
			if(1 <= targetpage && targetpage <= this.pageNum) {
				this.page = targetpage;
				this.updateTable(obj)
			}
			jQuery('.pageNow').val('');
		}
		SelectHasSelected();

    }
}
/*
 * 多页多选 checkBox 选中状态保存
 * 	在xml配置中   生成checkbox时 在input 添加onclick事件: MutiPageMutiSelect(this)
 * */
var chklistIds = [];
SelectHasSelected = function() {
    var isAll = true;

    $('input[name="chklist"]').each(function(value, index) {
		if(chklistIds.indexOf($(this).val()) !== -1) {
			$(this)[0].checked = true;
		}else {
            isAll = false
		}
	});
    if($('th input[type="checkbox"]')[0]){
    	if(isAll){
    		$('th input[type="checkbox"]')[0].checked = true;
    	}else {
    		$('th input[type="checkbox"]')[0].checked = false;
    	}
    }
};

MutiPageMutiSelect = function(obj) {
	var _this = obj;
	
	if(chklistIds.indexOf($(_this).val()) === -1) {
		chklistIds.push($(_this).val())
			} else {
		var arr = chklistIds.indexOf($(_this).val())
		chklistIds.splice(arr, 1)
		
	}

};
CheckAll = function(t) {
	if(t.checked) {
		$('input[name="chklist"]').each(function() {
			if(!this.checked) {
				this.click();
			}
		})
	} else {
		$('input[name="chklist"]').each(function() {
			if(this.checked) {
				this.click();
			}
		})
	}
};
