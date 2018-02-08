function personDetails () {
    var pid = Util.GetParam("pid");
    console.log(pid)
    $.post('/CorsFace/formengine.action', {TagName:'GetData',KeyTable:'C_Person',KeyParams:'PID',KeyValue:pid}, function (data) {
        var data = JSON.parse(data);

        //处理性别
        var sex = data[0].Sex == 0 ? '男' : '女';

        //处理生日
        var birthday = data[0].Birthday;
        if(birthday){
            birthday = birthday.split(' ');
            birthday = birthday[0];
        }else{
            birthday = "";
        }

        data[0].Address = data[0].Address?data[0].Address:"";

        //处理识别上下限
        
        var spot = new Number(data[0].MinSpot *100).toFixed(1) + "%-" + new Number(data[0].MaxSpot*100).toFixed(1) + "%";
        
        //处理备注信息
        var remark = data[0].Remark ? data[0].Remark : "";
        data[0].National = data[0].National?data[0].National:"";
        data[0].Phone = data[0].Phone?data[0].Phone:"";
        data[0].CardNo = data[0].CardNo?data[0].CardNo:"";
        data[0].Name = data[0].Name?data[0].Name:"";
        data[0].PersonDB = data[0].PersonDB?data[0].PersonDB:"";
        data[0].PTag = data[0].PTag?data[0].PTag:"暂无分组";
        
        //生成基本信息
        var pm_msg = '<div class="clearfix">' +
            '                <p class="left">姓名：<span>' + data[0].Name + '</span></p>' +
            '                <p class="left">性别：<span>' + sex + '</span></p>' +
            '            </div>' +
            '            <div class="clearfix">\n' +
            
            '                <p class="left">出生日期：<span>' + birthday + '</span></p>' +
            '                <p class="left">民族：<span>' + data[0].National + '</span></p>' +
            '            </div>' +
            '            <p>手机号：<span>' + data[0].Phone + '</span></p>' +
            '            <p>身份证号：<span>' + data[0].CardNo + '</span></p>' +
            '            <p>地址：<span>' + data[0].Address + '</span></p>';

        var add_msg = '<div class="clearfix">' +
            '                <p class="left">人物库：<span>' + data[0].PersonDB + '</span></p>' +
            '                <p class="left">分类：<span>' + data[0].PTag + '</span></p>' +
            '            </div>' +
            '            <p>识别阈值：<span>' + spot + '</span></p>' +
            '            <p>备注信息：<span>' + remark + '</span></p>';


        $('#pm_msg').append(pm_msg);
        $('#add_msg').append(add_msg);

    })

    $.post('/CorsFace/personAttach.action', {type:'getOnePersonAttaches',personId:pid}, function (data) {
        var data = JSON.parse(data);
        console.log(data);
        var pm_img = '<img src="/CorsFace' + data[0].FPath + '">';

        $('#pm_img').append(pm_img);
        var pm_ft_wrapper = '';
        for(var i = 0; i < data.length; i++){
            pm_ft_wrapper += '<div class="pm_ft_img left">' +
                '                    <img src="/CorsFace' + data[i].FPath + '">' +
                '                </div>';
        }

        $('#pm_ft_wrapper').append(pm_ft_wrapper);

    })
}
function goBack() {
    window.history.go(-1)
}