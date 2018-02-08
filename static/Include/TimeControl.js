/**
 * Created by zhaoj on 2017/11/22.
 */

var sdDate = '';

function TimeControl() {

}
TimeControl.prototype.init = function (obj,type,now) {
    if(typeof(obj) == 'string'){
        this.obj = $('#'+obj)
    }else {
        this.obj = obj;
    }
    this.type = type?type:'D';
    this.now = 1;
    console.log(this.obj);
    this.Create();
    if(now){
        sdDate = now;

    }else {
        sdDate = '';
    }

    this.time = getTime(this.type,0);

    var time = this.time;
    var start = time.y + '-' + time.M + '-' + time.d + ' 00:00:00';
    var end = time.y + '-' + time.M + '-' + time.d + ' ' + time.h + ':'+time.m+':'+time.s;
    if(sdDate){
        end = time.y + '-' + time.M + '-' + time.d + ' 23:59:59';
    }
    switch (this.type){
        case 'D':
            start = time.y + '-' + time.M + '-' + time.d + ' 00:00:00';
            if(sdDate){
                end = time.y + '-' + time.M + '-' + time.d + ' 23:59:59';
            }
            break;
        case 'H':
            start = time.y + '-' + time.M + '-' + time.d + ' ' + time.h + ':00:00';
            if(sdDate){
                end = time.y + '-' + time.M + '-' + time.d + ' ' + time.h + ':59:59';
            }
            break;
        case 'M':
            if(time.M=='1'||time.M=='3'||time.M=='5'||time.M=='7'||time.M=='8'||time.M=='10'||time.M=='12'){
                start = time.y + '-' + time.M + '-01 00:00:00';
                if(sdDate){
                    end = time.y + '-' + time.M + '-31 23:59:59';
                }
            }else if(time.M == '2'){
                if((time.y%4)=='0'){
                    start = time.y + '-' + time.M + '-01 00:00:00';
                    if(sdDate){
                        end = time.y + '-' + time.M + '-29 23:59:59';
                    }
                }else {
                    start = time.y + '-' + time.M + '-01 00:00:00';
                    if(sdDate){
                        end = time.y + '-' + time.M + '-28 23:59:59';
                    }
                }
            }else {
                start = time.y + '-' + time.M + '-01 00:00:00';
                if(sdDate){
                    end = time.y + '-' + time.M + '-30 23:59:59';
                }
            }
            break;
        case 'Y':
            start = time.y + '-01-01 00:00:00';
            if(sdDate){
                end = time.y + '-12-31 23:59:59';
            }
            break;
        default:
            start = time.y + '-' + time.M + '-' + time.d + ' 00:00:00';
            if(sdDate){
                end = time.y + '-' + time.M + '-' + time.d + ' 23:59:59';
            }
            break;
    }
    $('#selectTime').text(start + ' ~ ' + end);
    this.startT = start;
    return this.time;
};
TimeControl.prototype.Create = function () {
    var TC = this;
    var type = this.type;
    var preT = '上一天';
    var nextT = '下一天';
    switch (type){
        case 'D':
            preT = '上一天';
            nextT = '下一天';
            break;
        case 'H':
            preT = '上一小时';
            nextT = '下一小时';
            break;
        case 'M':
            preT = '上一月';
            nextT = '下一月';
            break;
        case 'Y':
            preT = '上一年';
            nextT = '下一年';
            break;
        default:
            break;
    }
    var timeHtml = '<div class="timeControl">'+
        '<input type="button" id="preTime" onclick="preTime()" value="'+ preT +'">'+
        // '<select name="timeType" id="timeType" onchange="changeType()">'+
        // '<option value="d">天</option>'+
        // '<option value="h">小时</option>'+
        // '<option value="m">月</option>'+
        // '<option value="y">年</option>'+
        // '</select>'+
        '<input type="button" id="nextTime" onclick="nextTime()" value="'+ nextT +'">'+
        '<span id="selectTime" style="display: none"></span>'+
        // '<input type="button" id="changeTime" value="指定时间">'+
        '<div class="timePlug hide">'+
        '<div id="startTime"></div> ~ <div id="endTime"></div>'+
        '<input id="timeSearch" type="button" onclick="timeSearch()" value="确认">'+
        '</div>'+
        '</div>';
    this.obj.html(timeHtml);
    var date = new Date();
    var now = date.pattern("yyyy-MM-dd");
    laydate.render({
        elem: '#startTime',
        type: 'datetime',
        value: now+" 00:00:00",
        done:function(date){
        }
    });
    laydate.render({
        elem: '#endTime',
        type: 'datetime',
        value: now+" 23:59:59",
        done:function(date){
        }
    });

    $('#selectTime').click(changeTime);
    // $('#timeType').change(changeType);
};
TimeControl.prototype.preTime = function () {
    var type = this.type;
    var start = '';
    var end = '';
    var time = getTime(type,this.now);
    switch (type){
        case 'D':
            start = time.y + '-' + time.M + '-' + time.d + ' 00:00:00';
            end = time.y + '-' + time.M + '-' + time.d + ' 23:59:59';
            break;
        case 'H':
            start = time.y + '-' + time.M + '-' + time.d + ' ' + time.h + ':00:00';
            end = time.y + '-' + time.M + '-' + time.d + ' ' + time.h + ':59:59';
            break;
        case 'M':
            if(time.M=='1'||time.M=='3'||time.M=='5'||time.M=='7'||time.M=='8'||time.M=='10'||time.M=='12'){
                start = time.y + '-' + time.M + '-01 00:00:00';
                end = time.y + '-' + time.M + '-31 23:59:59';
            }else if(time.M == '2'){
                if((time.y%4)=='0'){
                    start = time.y + '-' + time.M + '-01 00:00:00';
                    end = time.y + '-' + time.M + '-28 23:59:59';
                }else {
                    start = time.y + '-' + time.M + '-01 00:00:00';
                    end = time.y + '-' + time.M + '-29 23:59:59';
                }
            }else {
                start = time.y + '-' + time.M + '-01 00:00:00';
                end = time.y + '-' + time.M + '-30 23:59:59';
            }
            break;
        case 'Y':
            start = time.y + '-01-01 00:00:00';
            end = time.y + '-12-31 23:59:59';
            break;
        default:
            start = time.y + '-' + time.M + '-' + time.d + ' 00:00:00';
            end = time.y + '-' + time.M + '-' + time.d + ' 23:59:59';
            break;
    }
    this.now++;
    $('#selectTime').text(start + ' ~ ' + end);
    this.startT = start;
    return start + ',' + end;
};
TimeControl.prototype.changeType = function () {
    var type = $('#timeType').val();
    switch (type){
        case 'D':
            $('#preTime').val('上一天');
            $('#nextTime').val('下一天');
            break;
        case 'H':
            $('#preTime').val('上一小时');
            $('#nextTime').val('下一小时');
            break;
        case 'M':
            $('#preTime').val('上一月');
            $('#nextTime').val('下一月');
            break;
        case 'Y':
            $('#preTime').val('上一年');
            $('#nextTime').val('下一年');
            break;
        default:
            break;
    }
    this.now = 1;
    var end = getTime();
    var start = getTime(type,this.now);
    $('#selectTime').text(start + ' ~ ' + end);
    this.startT = start;
    return start + ',' + end;
};
TimeControl.prototype.nextTime = function () {
    var type = this.type;
    var start = '';
    var end = '';
    // if(this.now>1){
    //     this.now--;
    // }
    this.now--;
    var time = getTime(type,(this.now-1));
    switch (type){
        case 'D':
            start = time.y + '-' + time.M + '-' + time.d + ' 00:00:00';
            end = time.y + '-' + time.M + '-' + time.d + ' 23:59:59';
            break;
        case 'H':
            start = time.y + '-' + time.M + '-' + time.d + ' ' + time.h + ':00:00';
            end = time.y + '-' + time.M + '-' + time.d + ' ' + time.h + ':59:59';
            break;
        case 'M':
            if(time.M=='1'||time.M=='3'||time.M=='5'||time.M=='7'||time.M=='8'||time.M=='10'||time.M=='12'){
                start = time.y + '-' + time.M + '-01 00:00:00';
                end = time.y + '-' + time.M + '-31 23:59:59';
            }else if(time.M == '2'){
                if((time.y%4)=='0'){
                    start = time.y + '-' + time.M + '-01 00:00:00';
                    end = time.y + '-' + time.M + '-28 23:59:59';
                }else {
                    start = time.y + '-' + time.M + '-01 00:00:00';
                    end = time.y + '-' + time.M + '-29 23:59:59';
                }
            }else {
                start = time.y + '-' + time.M + '-01 00:00:00';
                end = time.y + '-' + time.M + '-30 23:59:59';
            }
            break;
        case 'Y':
            start = time.y + '-01-01 00:00:00';
            end = time.y + '-12-31 23:59:59';
            break;
        default:
            start = time.y + '-' + time.M + '-' + time.d + ' 00:00:00';
            end = time.y + '-' + time.M + '-' + time.d + ' 23:59:59';
            break;
    }
    $('#selectTime').text(start + ' ~ ' + end);
    return start + ',' + end;
};
TimeControl.prototype.timeSearch = function () {
    var end = $('#endTime').text();
    var start = $('#startTime').text();
    $('#selectTime').text(start + ' ~ ' + end);
    this.startT = start;
    $('.timePlug').toggleClass('hide');
    return start + ',' + end;
};
function changeTime() {
    $('.timePlug').toggleClass('hide')
}
function getTime(type,num) {
    if(num){
        switch (type){
            case 'H':
                var date = new Date(new Date()-num*60*60*1000);
                if(sdDate){
                    date = new Date(new Date(sdDate)-num*60*60*1000);
                }
                break;
            case 'D':
                var date = new Date(new Date()-num*24*60*60*1000);
                if(sdDate){
                    date = new Date(new Date(sdDate)-num*24*60*60*1000);
                }
                break;
            default:
                // var date = new Date(new Date()-num*24*60*60*1000);
                // if(sdDate){
                //     date = new Date(new Date(sdDate)-num*24*60*60*1000);
                // }
                var date = new Date();
                if(sdDate){
                    date = new Date(sdDate);
                }
                break;
        }
    }else {
        var date = new Date();
        if(sdDate){
            date = new Date(sdDate);
        }
    }

    var d = date.getDate()>=10?date.getDate():'0'+date.getDate();
    var M = (date.getMonth() + 1);
    var y = date.getFullYear();
    var s = date.getSeconds()>=10?date.getSeconds():'0'+date.getSeconds();
    var h = date.getHours()>=10?date.getHours():'0'+date.getHours();
    var m = date.getMinutes()>=10?date.getMinutes():'0'+date.getMinutes();
    if(num){
        if(type=='Y'){
            y = y - num;
        }
        if(type=='M'){
            if(num<0){
                y = y - Math.ceil(num/12);
            }else {
                y = y - Math.floor(num/12);
            }
            M = M - num%12;
            if(M<=0){
                y --;
                M = M + 12;
            }else if(M>12){
                y++;
                M = M-12;

            }
            M = M>=10?M:'0'+M;
        }
    }
    var result = {
        'y':y,
        'M':M,
        'd':d,
        'h':h,
        'm':m,
        's':s
    };
    return result;
};
