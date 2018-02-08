/**
 * Created by zhaoj on 2017/12/7.
 */
var site_logo = '', site_name = '', version = '', alert_weight = '', map_is_use = 0, map_type = '', copyright = '';

jQuery(function ($) {
    jQuery('#o').empty();
    if(jQuery('#map_type').val()==1){
        jQuery('#o').html("（仅支持百度地图，摄像头显示需配置其经纬度）");
    }else if(jQuery('#map_type').val()==0){
        jQuery('#o').text("（支持上传地图图片，可直接标注摄像头的位置）");
    }
    jQuery('#map_type').change(function(){
        var va = jQuery('#map_type').val();
        jQuery('#o').empty();
        if(va==1){
            jQuery('#o').html("（仅支持百度地图，摄像头显示需配置其经纬度）");
        }else if(va==0){
            jQuery('#o').text("（支持上传地图图片，可直接标注摄像头的位置）");
        }
    });
    $.ajaxSetup({
        headers: {"X-CSRFToken": getCookie("csrftoken")},
        cache: false
    });

    function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

        if (arr = document.cookie.match(reg))

            return unescape(arr[2]);
        else
            return null;
    }

    $("#fileupload").change(
        function () {
            var file = this.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(file);//调用自带方法进行转换
            reader.onload = function (e) {
                $("#showLoge").attr("src", this.result);//将转换后的编码存入src完成预览
                $("#img_upload_base").val(this.result);
            }
        });

    $('#map_is_use').click(
        function () {
            map_is_use = $("#mapisuse").val();
            if (map_is_use * 1) {

                $("#mapisuse").val(0);
                $(this).attr('src',
                    '/static/Themes/Images/Other/ban_state.png')
            } else {
                $("#mapisuse").val(1);
                $(this).attr('src',
                    '/static/Themes/Images/Other/start_state.png')

            }
        });

    function getFormData() {
        site_logo = $('#img_upload_base').val();
        site_name = $('#site_name').val();
        version = $('#version').val();
        map_is_use = $('#mapisuse').val();
        alert_weight = $('#alert_weight').val();
        copyright = $('#copy_right').val();
    }

    $('#saveSysConfig').click(function () {
        console.log("jellyTest");
        getFormData();
        $.post('/system/SaveSysData', {
            TagName: "SaveSysData",
            site_logo: site_logo,
            site_name: site_name,
            version: version,
            map_is_use: map_is_use,
            alert_weight: alert_weight,
            copyright: copyright

        }, function (data) {
            if (data.code==0) {
                alert('保存成功！');
                window.location.reload();
            } else {
                alert('保存失败！');
            }
        })
    })
});


