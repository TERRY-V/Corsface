(function ($) {
    $.fn.extend({
        MultDropList: function (options) {
            var op = $.extend({ wraperClass: "wraper", height: "200px", data: "", selected: "" }, options);
            return this.each(function () {
                var $this = $(this); //指向TextBox
                var $hf = $(this).next(); //指向隐藏控件存
                var conSelector = "#" + $this.attr("id") + ",#" + $hf.attr("id");
                var $wraper = $(conSelector).wrapAll("<div><div></div></div>").parent().parent().addClass(op.wraperClass);

                var $list = $('<div class="list"></div>').appendTo($wraper);
                $list.css({ "width": $this.css("width"), "height": op.height });
                //控制弹出页面的显示与隐藏
                $this.click(function (e) {
                    $(".list").hide();
                    $list.toggle();
                    e.stopPropagation();
                });

                $(document).click(function () {
                    $list.hide();
                });

                $list.filter("*").click(function (e) {
                    e.stopPropagation();
                });
                //加载默认数据
                $list.append('<ul><li><input type="checkbox" class="selectAll" value="-1" /><span>全部</span></li></ul>');
                var $ul = $list.find("ul");

                //加载json数据
                var listArr = op.data.split("|");
                var jsonData;
                for (var i = 0; i < listArr.length; i++) {
                    jsonData = eval("(" + listArr[i] + ")");
                    $ul.append('<li><input type="checkbox" value="' + jsonData.k + '" /><span>' + jsonData.v + '</span></li>');
                }

                //加载勾选项
                var seledArr;
                if (op.selected.length > 0) {
                    seledArr = op.selected.split(",");
                }
                else {
                    seledArr = $hf.val().split(",");
                }
                var vArr = new Array();
                $.each(seledArr, function (index) {
                    $("li input[value='" + seledArr[index] + "']", $ul).attr("checked", "checked");

                    vArr[index] = $("li input[value='" + seledArr[index] + "']", $ul).next().text();
                    //vArr[index] = $(this).next().text();
                    //$("input[class!='selectAll']:checked", $ul>li).each(function (index) {
                    //    vArr[index] = $(this).next().text();
                    //});
                    $this.val(vArr.join(","));
                });
                //全部选择或全不选
                $("li:first input", $ul).click(function () {
                    if ($(this).attr("checked")) {
                        $("li input", $ul).removeAttr("checked");

                    }
                    else {
                        $("li input", $ul).attr("checked", "checked");

                    }
                });
                //点击其它复选框时，更新隐藏控件值,文本框的值
                $("input", $ul).click(function () {
                    var kArr = new Array();
                    var vArr = new Array();
                    $("input[class!='selectAll']:checked", $ul).each(function (index) {
                        kArr[index] = $(this).val();
                        vArr[index] = $(this).next().text();
                    });
                    $hf.val(kArr.join(","));
                    $this.val(vArr.join(","));
                });
            });
        }
    });
})(jQuery);