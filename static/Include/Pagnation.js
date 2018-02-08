
var resPage = '';
var current;
var pageTotal;
var bar = '';
var sort = 0;
Pagnation = function (page, total) {
    this.page = page;
    this.total = total;

}
Pagnation.prototype.init = function (page, total, func, count) {
    bar = func;
    var ulhtml = '';
    current = page;
    pageTotal = total

    if(pageTotal < 8 ) {
        for (var i = 0; i < total; i++) {
            if (i == page - 1) {
                ulhtml += '<li class="active" onClick="changePage(this)">' + (i + 1) + '</li>'

            } else {
                ulhtml += '<li onClick="changePage(this)">' + (i + 1) + '</li>'
            }
        }
    }else {
        for (var i = 0; i < total; i++) {
            if (page >= 5 && page <= pageTotal - 4) {
                if (i == page - 1) {
                     ulhtml += '<li class="active" onClick="changePage(this)">' + (i + 1) + '</li>'

                } else if (i == page) {

                    ulhtml += '<li onClick="changePage(this)">' + (i + 1) + '</li>'
                    ulhtml += '<li onClick="changePage(this)">' + (i + 2) + '</li>'
                    ulhtml += '<li>...</li>'
                } else if (i == page - 2) {
                    ulhtml += '<li>...</li>'
                    ulhtml += '<li onClick="changePage(this)">' + (i) + '</li>'
                    ulhtml += '<li onClick="changePage(this)">' + (i + 1) + '</li>'

                } else if (i == 0){
                    ulhtml += '<li onClick="changePage(this)">' + (i + 1) + '</li>'
                } else if (i == pageTotal - 1){
                    ulhtml += '<li onClick="changePage(this)">' + (i + 1) + '</li>'
                }
            }else if (page > pageTotal - 4){
                if (i == page - 1) {

                    ulhtml += '<li class="active" onClick="changePage(this)">' + (i + 1) + '</li>'

                } else if(i >= pageTotal - 5) {

                    ulhtml += '<li onClick="changePage(this)">' + (i + 1) + '</li>'
                } else if(i == 0) {
                    sort = 0
                    ulhtml += '<li onClick="changePage(this)">' + (i + 1) + '</li>'
                } else {
                    if(sort == 0) {
                        ulhtml += '<li>...</li>'
                        sort++;
                        continue
                    }
                    continue
                }
            }else{
                for (var i = 0; i < total; i++) {

                    if (i == page - 1) {
                        ulhtml += '<li class="active" onClick="changePage(this)">' + (i + 1) + '</li>'

                    } else if(i < 5) {
                        sort = 0
                        ulhtml += '<li onClick="changePage(this)">' + (i + 1) + '</li>'
                    } else if(i == pageTotal - 1) {
                        ulhtml += '<li onClick="changePage(this)">' + (i + 1) + '</li>'
                    } else {
                        if(sort == 0) {
                            ulhtml += '<li>...</li>'
                            sort++;
                            continue
                        }
                        continue
                    }
                }
            }
        }
    }


    var pageHtml = '<div id="pageManage" class="clearfix">' +
        '<div class="pageManage">' +
        '<div class="firstPage" onclick="firstPage()">首页</div>' +
        '<div class="prePage" onclick="prePage()">上一页</div>' +
        '<ul class="pageList">' + ulhtml +
        '</ul>' +
        '<div class="nextPage" onclick="nextPage()">下一页</div>' +
        '<div class="lastPage" onclick="lastPage()">尾页</div>' +
        '<div class="changePage">第<input onkeypress="goPage(event)" style="width: 30px!important;" type="text" name="" class="pageNow" value="" />页/共<span class="pageCount">' + pageTotal + '</span>页&nbsp;&nbsp;共<span>' + count + '</span>条数据</div></div></div>';

    return pageHtml

}


function changePage(obj) {
    init_params.page = $(obj).html() - 0 ;
    eval(bar)

}
function firstPage() {
    init_params.page = 1;
    // Init_Alarm_Record(init_params)
    eval(bar)
}
function lastPage() {
    init_params.page = pageTotal;
    eval(bar)

}
function nextPage() {

    if(pageTotal == current) {
        return;
    } else {
        init_params.page = parseInt(current,10) + 1;
        eval(bar)
    }

}
function prePage() {
    if(current == 1) {
        return;
    } else {
        init_params.page = parseInt(current,10) - 1;
        eval(bar)
    }

}
function goPage(event) {

    var targetpage = jQuery(event.target).val();
    if(event.keyCode == "13") {
        targetpage = Number(targetpage);
        if(1 <= targetpage && targetpage <= pageTotal) {
            pageTotal = targetpage;
            init_params.page = targetpage;
            eval(bar)

        }
        jQuery(this).val('');
    }
}
