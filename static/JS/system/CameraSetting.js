$(function ($) {
    $.ajax({
        url: "/deepface/cameragroup",
        data: {},
        async: true,
        type: "POST",
        success: function (data) {
            console.log(data);
            var option_str = '<option value="0" selected="">请选择</option>';
            if (data.code == 0) {
                data = data.data;
                for (var i = 0; i < data.length; i++) {
                    option_str = option_str + '<option value="' + data[i]['id'] + '">' + data[i]['group_name'] + '</option>';
                }
            }
            $('#CSID').html(option_str)
            // data = {0, "imgUrl"}, {1, "imgBase64"};
        }
    });
    $.ajax({
        url: "/deepface/cameracapture",
        data: {},
        async: true,
        type: "POST",
        success: function (data) {
            console.log(data);
            var option_str = '<option value="0" selected="">请选择</option>';
            if (data.code == 0) {
                data = data.data;
                for (var i = 0; i < data.length; i++) {
                    option_str = option_str + '<option value="' + data[i]['id'] + '">' + data[i]['server_name'] + '</option>';
                }
            }
            $('#GID').html(option_str)
            // data = {0, "imgUrl"}, {1, "imgBase64"};
        }
    });

// 后退
    $('#form_close').click(function () {
        window.history.go(-1)
    });
    // 保持配置
    $('#form_Add').click(function () {

        var CAName = $("#CAName").val();
        var CSID = $('#CSID').val();
        var IpAddress = $('#IpAddress').val();
        var GID = $('#GID').val();
        var IpAddressDebug = $('#IpAddressDebug').val();
        var IpAddressShow = $('#IpAddressShow').val();
        var Longitude = $('#Longitude').val();
        var Latitude = $('#Latitude').val();
        var CANote = $('#CANote').val();

        if (CAName == '' || CSID == 0 || IpAddress == '' || GID == 0 || IpAddressDebug == '' ||
            IpAddressShow == '' || Longitude == '' || Latitude == '') {
            alert('请完善信息');
            return false;
        }
        if (CAName == '' || CSID == 0 || IpAddress == '' || GID == 0 || IpAddressDebug == '' ||
            IpAddressShow == '' || Longitude == '' || Latitude == '') {
            alert('请完善信息');
            return false;
        }
        // var pattern = /^[1-9]\d*.\d*|0.\d*[1-9]\d*$/;
        // if (!pattern.test(Longitude) || !pattern.test(Latitude)) {
        //     alert('经纬度格式错误');
        //     return false;
        // }

        // var pattern = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/g; //匹配IP地址的正则表达式
        // if (!pattern.test(IpAddress)) {
        //     alert('IP格式错误');
        //     return false;
        // }
        $.ajax({
            url: "/deepface/camerasave",
            data: {
                'camera_name': CAName,
                'group_id': CSID,
                'capture_url': IpAddress,
                'debug_url': IpAddressDebug,
                'display_url': IpAddressShow,
                'longitude': Longitude,
                'latitude': Latitude,
                'capture_id': GID,
                'remark': CANote
            },
            async: true,
            type: "POST",
            success: function (data) {
                if (data.code == 0) {
                    alert('操作成功');
                    window.history.go(-1)
                } else {
                    alert('操作失败，请检查信息后重新提交');
                }

            }
        });


    });
});
