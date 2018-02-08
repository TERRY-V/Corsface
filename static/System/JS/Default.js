/**default
 */

GetMenu = function (pid) {
    var json;
    if (!pid) {
        pid = 0;
    }else{
        pid=pid.replace(/\b(0+)/gi,"")
    }

    $.post(
        "/system/menusystem?pid=" + pid,
        // params, //需要发送的Json数据
        function (data) {
            if (!data) {
                window.location.href = '/';
                return;
            }
            getmenuli(data);

            function getmenuli(da) {
                // var data = JSON.parse(da.data);
                var data = da.data;
                var grouphtml = '';
                for (var i = 0; i < data.length; i++) {
                    var lihtml = '';
                    if (data[i].childNode) {
                        
                        var child = data[i].childNode;
                        for (var j = 0; j < child.length; j++) {
                            lihtml += '<li data-url="' + child[j].url + '">' + child[j].name + '</li>'
                        }
                    }
                    var group = '<div class="setting_list_group"><div class="setting_list_header" data-url="' + data[i].url + '">' + data[i].name + '</div>' + lihtml + '</div>'
                    grouphtml += group;
                }
                $('.setting_list>*').remove();
                $('.setting_list').append(grouphtml);
                $('.setting_list').on('click', '.setting_list_header', function () {
                    var url = $(this).attr('data-url');
                    if(url){
                        $('#iframe').attr('src', url);
                    }
                    // $('.setting_list li').removeClass('act');
                })

                //这里定位系统设置侧边url。
                $('.setting_list').on('click', 'li', function () {
                    
                    var url = $(this).attr('data-url');
                    $('#iframe').attr('src', url);
                    $('.setting_list li').removeClass('act');
                    $(this).addClass('act');
                    changeHash(url, "sidebar");
                })
            }
        }
    );
};


InitDefualt = function () {
    $.get(
        "/system/menu?pid=0",
        function (data) {
            var msg = data.message;
            var code = data.code;
            if (code != 0 || msg != "success") {
                return;
            }
            var nav = data.data;
            var navHtml = '';
            for (i in nav) {
                var textHtml = '<span class="nav_link" id="00' + nav[i].id + '" url="' + nav[i].url + '" onclick="changeHash(\'' + nav[i].url + '\')">' + nav[i].name + '</span>';
                navHtml += textHtml;
            }
            $('.header_nav>div').remove();
            $('.header_nav').append(navHtml);
            $('#001').addClass('active');
            $('.nav_link').click(function () {
                var url = $(this).attr('url');
                var pid = $(this).attr('id');
                $('#iframe').attr('src', url);
                $('.nav_link').removeClass('active');
                $(this).addClass('active');

                if ($(this).attr('id') != "006") {
                    $('.setting_list').addClass('hide');
                    $('#iframe_warp').removeClass('iframe_min');

                } else {
                    GetMenu(pid);
                    $('.setting_list').removeClass('hide');
                    $('#iframe_warp').addClass('iframe_min');
                }
            });
            hashChange();
            //set menu acitve;
            var setInteval = setInterval(function(){
                set_side_menu_act(setInteval);
            }, 500)
        },
        "json"
    );
};

function set_side_menu_act(interval_index){
    var menus = $(".setting_list li");
    if(menus.length == 0){
        return;
    }
    var hash = window.location.href;
    if (!hash) {
        return;
    }
    //分解页面hash
    var nav = hash.split('#');
    if(nav.length != 3){
        return;
    }
    $(".setting_list li").each(function(){
        var menu_url = $(this).attr("data-url");
        if(menu_url){
            if(menu_url == nav[2]){
                $(this).addClass("act");
                window.clearInterval(interval_index);
            }
        }
    })
}
function hashChange() {
    //是顶层的导航展示时
    // if(nav){

    // }
    var hash = window.location.href;
    if (!hash) {
        return;
    }
    //分解页面hash
    var nav = hash.split('#');
    var pid;
    if(nav[1]){
        $('#iframe').attr('src', nav[1]);
    }
    try{
        if(nav[2]){
            $("#iframe").attr('src', nav[2]);
        }
        
    }catch(e){

    }
    if(nav.length > 1){
        $('.nav_link').removeClass('active');
    }
    

    $('.nav_link').each(function () {
        if ($(this).attr('url') == nav[1]) {
            $(this).addClass('active');
            pid = $(this).attr('id');
        }
    })
    if(pid == "006"){
        GetMenu(pid);
        $('.setting_list').removeClass('hide');
        $('#iframe_warp').addClass('iframe_min');
    }
}

function changeHash(url, type) {

    if(type == "sidebar"){
        var href = window.location.href;
        var hashs = href.split("#");
        var currentUrl = "";
        try{
            currentUrl = hashs[2];
        }catch(e){
            
        }
        
        if( currentUrl == url){
            window.location.href = href;
        }else{
            window.location.href = hashs[0] +"#"+hashs[1] +"#" + url;
        }
        
    }else{
        window.location.hash = '#' + url;
    }
    
}

$(function ($) {
    setYearAndDate();
    function setYearAndDate(){
        var date = new Date();
        var strDate = date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日";
        var day = date.getDay(); //注:0-6对应为星期日到星期六
        var week;
        switch (day) {
            case 0:
                week = "星期日";
                break;
            case 1:
                week = "星期一";
                break;
            case 2:
                week = "星期二";
                break;
            case 3:
                week = "星期三";
                break;
            case 4:
                week = "星期四";
                break;
            case 5:
                week = "星期五";
                break;
            case 6:
                week = "星期六";
                break;
            default:
                week = "系统错误！"
        }

        $('.loginbar_bottom').html(strDate + "&nbsp;&nbsp;&nbsp;&nbsp;" + week);
        
    }
    //定时更新时间日期页面。
    setInterval(setYearAndDate, 3600*1000);
    setInterval(getNowTime, 1000);

    function getNowTime() {
        var date = new Date();
        var min = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes();
        var sec = date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds();
        var time = date.getHours() + ':' + min + ':' + sec;
        $('.loginbar_mid').html(time);
    }

    InitDefualt();
    // hashChange()
    cssBG();

    hashChange();
    //  窗口大小发生变化的时候css适应变化
    window.onresize = cssBG;

    $("#logout").click(function () {
        $.ajax({
            type: "POST",
            url: "/usercenter/logoutcheck",
            success: function (data) {
                window.location.href = "/corsface";
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.responseText);
            }
        });
    });

    function cssBG() {
        var height = $('.wrapper').height();
        var width = $('.wrapper').width();
        var mainHeight = height - 140;
        var mainWidth = width - 100;
        $('#iframe_warp').height(mainHeight);
        //      $('iframe').width(mainWidth);
        $('.setting_list').height(mainHeight)
        $('.wrapper_2').height(height - 90)
        $('.wrapper_2_2').height(height - 90 - 46 - 542)
        $('.wrapper_3').width(width - 70 - 68)
        $('.wrapper_4').height(height - 90)
    }
})
