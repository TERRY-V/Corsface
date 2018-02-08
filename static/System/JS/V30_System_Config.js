/**
 * Created by zhaoj on 2017/12/7.
 */
var SCLogo = '', SCMinSpot = '', SCMaxSpot = '', RTKeepDay = '', RTInitNum = '', RTMaxNum = '', RTIsDisPType = 0, RTIsDisCode = 0, RTDisConfig = 0, MapIsUse = 0, MapType = '', ARInitNum = '', Indx = '', AlermLevel = '', IsIndex = 0, ARMaxNum = '', ARIsDisANum = 0, IsAutoPerson = 0;

jQuery(function($) {
	$.ajaxSetup({
		cache : false
	});

	$("#fileupload").fileupload({
		url : "/CorsFace/uploadfile.action",
		autoUpload : true,
		acceptFileTypes : /(\.|\/)(gif|jpe?g|png)$/i
	}).on('fileuploadprocessalways', function(e, data) {
	}).on('fileuploadprogressall', function(e, data) {

	}).on('fileuploaddone', function(e, data) {
		if (!data.result.returnPath[0]) {
			alert('图片保存失败！');
			return;
		}
		console.log(data.result.returnPath[0]);
		$('#showLoge')[0].src = '/CorsFace/' + data.result.returnPath[0].FPath;
		SCLogo = data.result.returnPath[0].FPath;
	}).on('fileuploadfail', function(e, data) {
		alert("文件上传失败，请稍后重试");
	});

	// $('#SCLogo').change(function () {
	// console.log(this.files[0]);
	// SCLogo = this.files[0];
	// if(window.FileReader){
	// var re = new FileReader();
	// re.readAsDataURL(SCLogo);
	// re.onload = function (evt) {
	// $('#showLoge')[0].src = evt.target.result;
	// }}else {
	// $('#showLoge').attr('style',"filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=\''
	// + fileInput.value + '\)\';");
	// }
	// });
	$('#RTIsDisPType').click(
			function() {
				if (RTIsDisPType) {
					RTIsDisPType = 0;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/ban_state.png')

				} else {
					RTIsDisPType = 1;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/start_state.png')
				}
			});

	$('#RTIsDisCode').click(
			function() {
				if (RTIsDisCode) {
					RTIsDisCode = 0;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/ban_state.png')
				} else {
					RTIsDisCode = 1;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/start_state.png')
				}
			});
	$('#MapIsUse').click(
			function() {
				if (MapIsUse) {
					MapIsUse = 0;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/ban_state.png')

				} else {
					MapIsUse = 1;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/start_state.png')

				}
			});
	$('#ARIsDisANum').click(
			function() {
				if (ARIsDisANum) {
					ARIsDisANum = 0;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/ban_state.png')

				} else {
					ARIsDisANum = 1;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/start_state.png')
				}
			});
	$('#IsIndex').click(
			function() {
				if (IsIndex) {
					IsIndex = 0;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/ban_state.png')

				} else {
					IsIndex = 1;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/start_state.png')
				}
			});
	$('#IsAutoPerson').click(
			function() {
				if (IsAutoPerson) {
					IsAutoPerson = 0;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/ban_state.png');
				} else {
					IsAutoPerson = 1;
					$(this).attr('src',
							'/CorsFace/Themes/Images/Other/start_state.png')
							$('#IsAutoPersonHref').toggleClass('hide')
				}

			});
	// ChangeValue=function(obj){
	// var val = obj.getAttribute("value");
	// if(val && val=="0"){
	// val.src = "/CorsFace/Themes/Images/Other/start_state.png";
	// obj.setAttribute("value","1");
	// }
	// else{
	// val.src = "/CorsFace/Themes/Images/Other/ban_state.png";
	// obj.setAttribute("value","0");
	// }
	// };
	function getFormData() {
		// SCMinSpot = $('#SCMinSpot').val();
		// Indx = $('#Indx').val();
		// AlermLevel = $('#AlermLevel').val();
		// SCMaxSpot = $('#MaxSpot').val();
		// RTKeepDay = $('#RTKeepDay').val();
		// RTInitNum = $('#RTInitNum').val();
		// RTMaxNum = $('#RTMaxNum').val();
		// RTDisConfig = $('#RTDisConfig').val();
		// MapType = $('#MapType').val();
		// ARInitNum = $('#ARInitNum').val();
		// ARMaxNum = $('#ARMaxNum').val();
		// Indx = $('#Indx').val();
		// AlermLevel = $('#AlermLevel').val();
		// IsIndex = $('#IsIndex').val();

		SCLogo = $('#SCLogo').val();
		SCMinSpot = $('#SCMinSpot').val();
		SCMaxSpot = $('#SCMaxSpot').val();
		RTKeepDay = $('#RTKeepDay').val();
		RTInitNum = $('#RTInitNum').val();
		RTMaxNum = $('#RTMaxNum').val();
		// RTIsDisPType =$('#RTIsDisPType').val();
		// RTIsDisCode=$('#RTIsDisCode').val();
		 RTDisConfig=$('#RTDisConfig').val();
		// MapIsUse=$('#MapIsUse').val();
		MapType = $('#MapType').val();
		ARInitNum = $('#ARInitNum').val();
		ARMaxNum = $('#ARMaxNum').val();
		Indx = $('#Indx').val();
		AlermLevel = $('#AlermLevel').val();
		// IsAutoPerson = $('#IsAutoPerson').val();
		// IsIndex = $('#IsIndex').val();
		// ARIsDisANum=$('#ARIsDisANum').val();
	}
	$('#saveSysConfig').click(function() {
		console.log("jellyTest");
		getFormData();
		$.post('frameAction.action', {
			TagName : "SaveSysData",
			SCLogo : SCLogo,
			SCMinSpot : SCMinSpot,
			SCMaxSpot : SCMaxSpot,
			RTKeepDay : RTKeepDay,
			RTInitNum : RTInitNum,
			RTMaxNum : RTMaxNum,
			RTIsDisPType : RTIsDisPType,
			RTIsDisCode : RTIsDisCode,
			RTDisConfig : RTDisConfig,
			MapIsUse : MapIsUse,
			MapType : MapType,
			ARInitNum : ARInitNum,
			ARMaxNum : ARMaxNum,
			Indx : Indx,
			AlermLevel : AlermLevel,
			IsIndex : IsIndex,
			ARIsDisANum : ARIsDisANum,
			IsAutoPerson : IsAutoPerson
		}, function(data) {
			if (data == "SUCC") {
				window.location.reload();
				if (top) {
					top.Util.GetUserInfo();
				}
			} else {
				alert("保存失败");
			}
		})
	})
});
function changeValue(val) {
	if (val) {
		val = 0;
		$(this).attr('src', '/CorsFace/Themes/Images/Other/ban_state.png')
	} else {
		val = 1;
		$(this).attr('src', '/CorsFace/Themes/Images/Other/start_state.png')
	}
}
initData = function() {
	$.post("frameAction.action", {
		TagName : "getSysData"
	}, function(data) {
		var res = JSON.parse(data);
		if (res[0]["SCLogo"]) {
			$('#showLoge')[0].src = '/CorsFace/' + res[0]["SCLogo"];
		}
		$('#SCMinSpot').val(res[0]["SCMinSpot"]);
		SCMinSpot = res[0]["SCMinSpot"];
		$('#SCMaxSpot').val(res[0]["SCMaxSpot"]);
		SCMaxSpot = res[0]["SCMaxSpot"];
		$('#RTKeepDay').val(res[0]["RTKeepDay"]);
		RTKeepDay = res[0]["RTKeepDay"];
		$('#RTInitNum').val(res[0]["RTInitNum"]);
		RTInitNum = res[0]["RTInitNum"];
		$('#RTMaxNum').val(res[0]["RTMaxNum"]);
		RTMaxNum = res[0]["RTMaxNum"];
		$('#RTDisConfig').val(res[0]["RTDisConfig"]);
		RTDisConfig = res[0]["RTDisConfig"];
		$('#RTIsDisPType').val(res[0]["RTIsDisPType"]);
		RTIsDisPType = res[0]["RTIsDisPType"];
		$('#RTIsDisCode').val(res[0]["RTIsDisCode"]);
		RTIsDisCode = res[0]["RTIsDisCode"];
		$('#MapIsUse').val(res[0]["MapIsUse"]);
		MapIsUse = res[0]["MapIsUse"];
		$('#MapType').val(res[0]["MapType"]);
		MapType = res[0]["MapType"];
		$('#ARInitNum').val(res[0]["ARInitNum"]);
		ARInitNum = res[0]["ARInitNum"];
		$('#ARMaxNum').val(res[0]["ARMaxNum"]);
		ARMaxNum = res[0]["ARMaxNum"];
		$('#ARIsDisANum').val(res[0]["ARIsDisANum"]);
		ARIsDisANum = res[0]["ARIsDisANum"];
		$('#AlermLevel').val(res[0]["AlermLevel"]);
		AlermLevel = res[0]["AlermLevel"];
		$('#IsIndex').val(res[0]["IsIndex"]);
		IsIndex = res[0]["IsIndex"];
		$('#Indx').val(res[0]["Indx"]);
		Indx = res[0]["Indx"];
		$('#IsAutoPerson').val(res[0]["IsAutoPerson"]);
		IsAutoPerson = res[0]["IsAutoPerson"];

		if (RTIsDisPType) {
			if (RTIsDisPType == 1) {
				$("#RTIsDisPType").attr('src',
						'/CorsFace/Themes/Images/Other/start_state.png');
			} else {
				$("#RTIsDisPType").attr('src',
						'/CorsFace/Themes/Images/Other/ban_state.png');
			}
		}
		if (IsAutoPerson) {
			if (IsAutoPerson == 1) {
				$("#IsAutoPerson").attr('src',
						'/CorsFace/Themes/Images/Other/start_state.png');
			} else {
				$("#IsAutoPerson").attr('src',
						'/CorsFace/Themes/Images/Other/ban_state.png');
				$('#IsAutoPersonHref').addClass('hide')
			}
		}
		// console.log("--->"+RTIsDisPType);
		if (RTIsDisCode) {
			if (RTIsDisCode == 1) {
				$("#RTIsDisCode").attr('src',
						'/CorsFace/Themes/Images/Other/start_state.png');
			} else {
				$("#RTIsDisCode").attr('src',
						'/CorsFace/Themes/Images/Other/ban_state.png');
			}
		}
		if (MapIsUse) {
			if (MapIsUse == 1) {
				$("#MapIsUse").attr('src',
						'/CorsFace/Themes/Images/Other/start_state.png');
			} else {
				$("#MapIsUse").attr('src',
						'/CorsFace/Themes/Images/Other/ban_state.png');
			}
		}
		if (ARIsDisANum) {
			if (ARIsDisANum == 1) {
				$("#ARIsDisANum").attr('src',
						'/CorsFace/Themes/Images/Other/start_state.png');
			} else {
				$("#ARIsDisANum").attr('src',
						'/CorsFace/Themes/Images/Other/ban_state.png');
			}
		}
		if (IsIndex) {
			if (IsIndex == 1) {
				$("#IsIndex").attr('src',
						'/CorsFace/Themes/Images/Other/start_state.png');
			} else {
				$("#IsIndex").attr('src',
						'/CorsFace/Themes/Images/Other/ban_state.png');
			}
		}
	});
}