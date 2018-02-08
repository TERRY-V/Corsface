;
var FormEngine = function() {
	this.formXmlPath = '',
		this.obj,
		this.formHtml = '',
		this.dataArr = [],
		this.inputHtmlArr = [],
		this.valid = [],
		this.TagName = '',
		this.KeyTable = '',
		this.keyParams = '',
		this.Fields = [],
		this.Pid = '',
		this.KeyValue;
}
FormEngine.prototype.init = function(params) {
	this.formXmlPath = '',
		this.obj,
		this.formHtml = '',
		this.dataArr = [],
		this.inputHtmlArr = [],
		this.valid = [],
		this.TagName = '',
		this.KeyTable = '',
		this.keyParams = '',
		this.Fields = [],
		this.KeyValue;
	console.log('FormInit');
	var obj = params.Contain;
	var url = params.XmlPath;
	var KeyValue = params.KeyValue;
	if(params.Pid) {
		var pid = params.Pid;
	} else {
		var pid = '0';
	}
	if(typeof obj === 'string') {
		this.obj = document.getElementById(obj);
	} else {
		this.obj = obj
	}
	this.Pid = pid;
	this.formXmlPath = url;
	this.KeyValue = KeyValue;
	$(this.obj).children().remove()

	this.createHtml(KeyValue)
	try {
		if(!$("#PID").val()){
			$('#PID').val(this.Pid);
		}
	} catch(e) {
		//TODO handle the exception
	}

}
//创建表单
FormEngine.prototype.createHtml = function(KeyValue) {
	console.log(KeyValue)
	jQuery.ajaxSetup({
		async: false
	});
	var fmObj = this;
	var xmlPath = this.formXmlPath ? this.formXmlPath : './V21_Input_Form.xml';

	jQuery.get(xmlPath, function(xmlfile) {

		var $xml = jQuery(xmlfile),
			$g = $xml.find('Grid'),
			$RowItem = $xml.find('RowItem'),
			$form = $xml.find('Form');
		var LabelWidth = $g.attr('LabelWidth');
		fmObj.TagName = $form.attr('TagName');
		fmObj.KeyTable = $form.attr('KeyTable');
		fmObj.KeyParams = $form.attr('KeyParam');
        if(!$xml){
            return;
        }
		var isVal = false;
		var jsonFData;
		if(fmObj.KeyValue) {
			var formData = fmObj.GetData(fmObj.KeyValue);
			jsonFData = JSON.parse(formData)[0];
			isVal = true;
		}
		$g.each(function() {
			$RowItem = $(this).find('RowItem');
			var tbhtml = ''
			var title = $(this).attr('Title');
			if(title) {
				title = '<div class="form_title"><h3>' + title + '</h3></div>'

			} else {
				title = ''
			}
			$RowItem.each(function() {
				var $ColItem = jQuery(this).find('ColItem');
				var trhead = '<tr class="formRow">',
					trfoot = '</tr>',
					tbody = '';

				$ColItem.each(function() {

					var $th = jQuery(this);

					var field = $th.attr('DataBind');
					var fieldValue = "";
					if(isVal)
						fieldValue = (jsonFData[field] || jsonFData[field]=='0')?jsonFData[field]:'';
					if(!field || field == "")
						field = $th.attr('Label');

					//			提取需要提交的信息的id
					if($th.attr('DataBind')) {
						fmObj.valid.push($th.attr('DataBind'))
					}


					var validate = '';
                    var arrValidate = $th.attr('Validate').split(';');
					for(x in arrValidate){
                        var arrTemp = arrValidate[x].split(':');
                        if(!(arrTemp.length<2)){
                            validate += ' ' + arrTemp[0] +  '= "' + arrTemp[1] + '"';
						}
					}
                    //
					// var valueN = $th.attr('Validate').replace(';', '').split(':')[0].toLowerCase(),
					// 	valueV = $th.attr('Validate').replace(';', '').split(':')[1];

					var inputText = '',
						inphtml = '',
						inputValue = [],
						inputTx = [],
						must = '',
						display = '',
						click = '',
						label = '',
						Cwidth = '',
						Cheight = '',
						mustSpan = '',
						placeholder = '';
					//			提示信息
					if($th.attr('Notes')) {
						placeholder = 'placeholder="' + $th.attr('Notes') + '"'
					} else {
						placeholder = ''
					}

					var initData = [];
					//			获取初始值
					if($th.attr('Init').indexOf('FUNC') > -1) {
						var func = $th.attr('Init').split(':')[1];
						var strArr = eval(func);
						if(strArr.indexOf("|") > 0) {
							var arr = strArr.split("|");
							inputValue.push(arr[0]);
							initData = eval(arr[0]);
							fieldValue = arr[1];
						} else {
							initData = strArr;
							inputValue.push(eval(func));
						}

					} else if($th.attr('Init').indexOf('JSON') > -1) {
						var jsonstr = $th.attr('Init').replace('JSON:', '')
						initData = eval(jsonstr);
					} else if($th.attr('Init').indexOf('DICT') > -1) {
						var code = $th.attr('Init').split(":")[1];
						$.post(
							"frameAction.action", {
								TagName: 'GetDictory',
								CODE: code
							}, //需要发送的Json数据
							function(data) {
								if(data) {
									console.log('===>>>>', data)
									data = data.replace(/DValue/g, "value");
									data = data.replace(/DName/g, "text");
									initData = eval(data);
								}
							},
							"text"
						);

					} else if($th.attr('Init').indexOf('CURR') > -1) {
						var data = $th.attr('Init').split(':')[1];
						if(data == 'user') {
							inputValue.push('user');
						} else if(data == 'date') {
							inputValue.push(new Date());
						} else {
							inputValue.push('');
						}
					} else {
						inputValue.push($th.attr('Init'));
					}

					//			是否必填
					if($th.attr('IsMust') == 'true') {
						must = 'required';
						mustSpan = '<span style="color:red;">*</span>'
					} else {
						must = '';
					}
					//			是否显示
					if($th.attr('IsHidden') == 'true') {
						display = 'style="display:none;"'
					} else {
						display = ''
					}
					//			是否有绑定事件
					if($th.attr('Event')) {
						click = $th.attr('Event').split(':')[0] + '="' + $th.attr('Event').split(':')[1] + '"';
					} else {
						click = ''
					}
					//				是否有label
					if($th.attr('Label')) {
						label = '<label>' + $th.attr('Label') + mustSpan + '</label>'
					}
					//				宽度
					if($th.attr('ControlWidth') && $th.attr('ControlWidth').trim() != "") {
						Cwidth = 'width:' + $th.attr('ControlWidth') + ';'
					}
					if($th.attr('ControlHeight') && $th.attr('ControlHeight').trim() != "") {
						Cheight = 'height:' + $th.attr('ControlHeight') + ';'
					}

                    // if($th.attr('DataBind')=='CParams'){
						// console.log(fieldValue)
						// fieldValue = fieldValue.replace(/"/g,"\"");
                    //     console.log(fieldValue)
                    //
                    // }

					//判断标签种类
					switch($th.attr('ControlType')) {
						case 'input':
						{
							inputText = '<input type="text" id="' + field + '" style="width:100%;' + Cheight + '" ' +
									//valueN + '="' + valueV + '" value="' + inputValue[0] + '" ' + must + ' ' + click + ' ' + placeholder + ' />';
                                validate + ' value="' + fieldValue + '" ' + must + ' ' + click + ' ' + placeholder + ' />';
							inphtml = '<td ' + display + ' style="width:' + LabelWidth + ';">' + label + '</td>' +
								'<td ' + display + ' style="text-align:left;' + Cwidth + Cheight + '">' + inputText + '</td>';
							tbody += inphtml
							break;
						}
						case 'select':
						{
							var optionhtml = '<option value="" selected>请选择</option>';
                            if(typeof(initData) != 'object'){
                                break;
                            }
							if(initData.length > 0) {
								for(m = 0; m < initData.length; m++) {
									var cls = ""
									if(fieldValue && fieldValue.indexOf(initData[m].value) > -1)
										cls = "selected";
									var strHtml = "<option " + cls + " value='" + initData[m].value + "' >" + initData[m].text + "</span>"; //图片
									optionhtml += strHtml;
								}
							}
							inputText = '<select id="' + field + '" style="width:100%;' + Cheight + '" ' + must +
								click + ' val="' + fieldValue + '">' + optionhtml + '</select>';
							inphtml = '<td ' + display + '  style="width:' + LabelWidth + ';">' + label + '</td>' +
								'<td ' + display + ' style="text-align:left;' + Cwidth + Cheight + '">' + inputText + '</td>';
							tbody += inphtml;
							break;
						}
						case 'mselect':
						{
							var params = "";
							initData = eval(initData);
							if(typeof(initData) != 'object'){
								break;
							}
							if(initData.length > 0) {
								for(m = 0; m < initData.length; m++) {
									if(m > 0)
										params += "|";
									params += "{k:'" + initData[m].value + "',v:'" + initData[m].text + "'}";
								}
							}
							inputText = '<input type="text" id="msel_' + field + '" style="width:100%;' + Cheight + '" ' +
                                validate + ' ' + click + ' ' + placeholder + ' />';
							inputText += '<input id="' + field + '" type="hidden" value="' + fieldValue + '" ' + must + '/>';
							inputText += '<script>';
							inputText += 'objParam={data:"' + params + '",selected:"' + fieldValue + '"};console.log("' + field + '");';
							inputText += '$("#msel_' + field + '").MultDropList(objParam);';
							inputText += '</script>';
							inphtml = '<td ' + display + ' style="width:' + LabelWidth + ';">' + label + '</td>' +
								'<td ' + display + ' style="text-align:left;' + Cwidth + Cheight + '">' + inputText + '</td>';
							tbody += inphtml
							break;
						}
						case 'textarea':
						{
							inputText = '<textarea id="' + field + '" style="width:100%;height:100%;resize:none;" ' +
									//valueN + '="' + valueV + '" ' + must + '  ' + click + '  ' + placeholder + '  >' + inputValue[0] + '</textarea>';
                                validate + ' ' + must + '  ' + click + '  ' + placeholder + '  >' + fieldValue + '</textarea>';
							inphtml = '<td ' + display + '  style="width:' + LabelWidth + ';">' + label + '</td>' +
								'<td ' + display + ' style="text-align:left;' + Cwidth + Cheight + '">' + inputText + '</td>';
							tbody += inphtml;
							break;
						}
						case 'checkbox':
						{
							var inputText = CreateCheck(field, $th.attr('Init'), "M", fieldValue);
							inphtml = '<td ' + display + '  style="width:' + LabelWidth + ';">' + label + '</td>' +
								'<td ' + display + ' style="text-align:left;' + Cwidth + Cheight + '">' + inputText + '</td>';
							tbody += inphtml;
							break;
						}
						case 'radio':
						{
							var inputText = CreateCheck(field, $th.attr('Init'), "S", fieldValue);
							inphtml = '<td ' + display + '  style="width:' + LabelWidth + ';">' + label + '</td>' +
								'<td ' + display + ' style="text-align:left;' + Cwidth + Cheight + '">' + inputText + '</td>';
							tbody += inphtml;
							break;
						}
						case 'reqradio': //？
						{
							var radiotext = '';
							radiotext = inputValue[0]
							inputText = '<form id="' + field + '" style="width:100%;' + Cheight + '" ' + click + ' >' + radiotext + '</form>';
							inphtml = '<td ' + display + '  style="width:' + LabelWidth + ';">' + label + '</td>' +
								'<td ' + display + ' style="text-align:left;' + Cwidth + Cheight + '">' + inputText + '</td>';
							tbody += inphtml;
							break;
						}
						case 'password':
						{
							inputText = '<input type="password" id="' + field + '" style="width:100%;' + Cheight + '" ' +
                                validate + ' value="' + fieldValue + '" ' + must + ' ' + click + ' ' + placeholder + ' />';
							inphtml = '<td ' + display + '  style="width:' + LabelWidth + ';">' + label + '</td>' +
								'<td ' + display + ' style="text-align:left;' + Cwidth + Cheight + '">' + inputText + '</td>';
							tbody += inphtml;
							break;
						}
						case 'image': //？
						{
							inputText = '<input type="file" accept="image/*" id="' + field + '" style="width:100%;' + Cheight + '" ' +
                                validate + ' value="' + inputValue[0] + '" ' + must + ' ' + click + ' ' + placeholder + ' />';
							inphtml = '<td ' + display + '  style="width:' + LabelWidth + ';">' + label + '</td>' +
								'<td ' + display + ' style="text-align:left;' + Cwidth + Cheight + '">' + inputText + '</td>';
							tbody += inphtml;
							break;
						}
						case 'button':
						{
							inputText = '<input type="button" id="' + field + '" style="width:100%;' + Cheight + '" ' +
                                validate + ' value="' + inputValue[0] + '" ' + must + ' ' + click + ' ' + placeholder + ' />';
							inphtml = '<td ' + display + ' style="text-align:left;' + Cwidth + Cheight + '">' + inputText + '</td>';
							tbody += inphtml;
							break;
						}
						default:
							break;
					}

				})
				tbhtml += trhead + tbody + trfoot;
			})
			tbhtml = '<table>' + tbhtml + '</table>';
			fmObj.formHtml += title + tbhtml;
		})

		fmObj.formHtml = fmObj.formHtml;
		jQuery(fmObj.obj).append(fmObj.formHtml)
	})

}

FormEngine.prototype.GetData = function(va) {
	var fmobj = this;
	var params = {
		"TagName": "GetData",
		"KeyTable": fmobj.KeyTable,
		"KeyParams": fmobj.KeyParams,
		"KeyValue": va
	}

	var formData = "";
	//	params = JSON.stringify(params)
	$.post('/CorsFace/formengine.action', params, function(data) {
		if(data)
			formData = data;
	});

	return formData;
}

//提交信息
FormEngine.prototype.Save = function(ownKey, keyName) {
	var idarr = this.valid;
	var field = this.Fields;
	var fmobj = this;
	field = [];

	for(x in idarr) {

		var ida = jQuery('#' + idarr[x])
		var value = '';
		if(ida.attr('required') && (ida.val().trim() == '')) {
			ida.focus();
			alert('值不能为空！');
			return -1;
		}

		if(ida.find(':radio').length > 0) {
			try {
				value = ida.find('input:checked')[0].value
			} catch(e) {
				//TODO handle the exception
			}
		} else if(ida.attr('type') == 'file') {
			value = ida[0].files[0];
			if(!value)
				value = "";

		}else if(ida[0].tagName=='TEXTAREA'){
            if(ida.attr('jsonv')){
                value = ida.text();
			}else {
                value = ida.val();
            }
            value = value.trim();
        } else {
			value = ida[0].value;
			value = value.trim();
		}
        if(!ida.attr('jsonv')){
            value = value.replace(/"/g,'&quot;');
            value = value.replace(/'/g,"''");
		}

		if(ida.attr('type') == 'password') {
			var type = 'password';
		} else {
			var type = '';
		}
        if(!value){
            value = 'null'
        }

		var fie = {
			"Filed": idarr[x],
			"Value": value,
			"Type": type
		};

		field.push(fie);

	}
	if(!ownKey){
		for(var i = 0; i<field.length; i++){
			var temObj = field[i];
			if(temObj['Filed'] == keyName){
				field.splice(i, 1);
			}
		}
	}

	field = JSON.stringify(field)
	var params = {
		"TagName": "SaveData",
		"Items": field
	};
	if(!ownKey){
		if(fmobj.KeyParams || fmobj.KeyParams == '0') {
			params["KeyParams"] = fmobj.KeyParams;
		}

		if(fmobj.KeyValue || fmobj.KeyValue == '0') {
			params["KeyValue"] = fmobj.KeyValue;
		}
	}else{

	}
	if(fmobj.KeyTable || fmobj.KeyTable == '0') {
		params["KeyTable"] = fmobj.KeyTable;
	}
	jQuery.ajaxSetup({
		async: false
	});
	var da = '';
	//	params = JSON.stringify(params);
	jQuery.post('/CorsFace/formengine.action', params, function(data) {
		console.log(data);
		da = data;
	})
	return da;

}