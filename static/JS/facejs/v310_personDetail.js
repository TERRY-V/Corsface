function personDetails () {
    var pid = Util.GetParam("pid");
    console.log(pid)
    $.post('/deepface/person/getpersoninfo', 
        {"person_id":pid},
    function (data) {
        var code = data.code;
        var msg = data.message;
        if(code != 0){
            alert(msg);
            return;
        }
        var person = data.data.person;
        //处理性别
        var sex = person.gender == 2 ? '男' : '女';

        //处理生日
        var birthday = person.birthday;
        if(birthday){
            birthday = birthday.split(' ');
            birthday = birthday[0];
        }else{
            birthday = "";
        }

        address = person.family_register?person.family_register:"";

        //处理识别上下限
        
        var spot = new Number(person.MinSpot *100).toFixed(1) + "%-" + new Number(person.MaxSpot*100).toFixed(1) + "%";
        
        //处理备注信息
        // var remark = person.Remark ? person.Remark : "";
        person.nation = person.nation?person.nation:"";
        // person.Phone = person.Phone?person.Phone:"";
        person.id_card = person.id_card?person.id_card:"";
        person.name = person.name?person.name:"";
        person.group_name = person.group_name?person.group_name:"";
        // person.PTag = person.PTag?person.PTag:"暂无分组";
        
        //生成基本信息
        var pm_msg = '<div class="clearfix">' +
            '                <p class="left">姓名：<span>' + person.name + '</span></p>' +
            '                <p class="left">性别：<span>' + sex + '</span></p>' +
            '            </div>' +
            '            <div class="clearfix">\n' +
            
            '                <p class="left">出生日期：<span>' + birthday + '</span></p>' +
            '                <p class="left">民族：<span>' + person.nation + '</span></p>' +
            '            </div>' +
            // '            <p>手机号：<span>' + person.Phone + '</span></p>' +
            '            <p>身份证号：<span>' + person.id_card + '</span></p>' +
            '            <p>地址：<span>' + address + '</span></p>';

        var add_msg = '<div class="clearfix">' +
            '                <p class="left">人物库：<span>' + person.group_name + '</span></p>' +
            // '                <p class="left">分类：<span>' + person.PTag + '</span></p>' +
            '            </div>' +
            '            <p>识别阈值：<span>' + "" + '</span></p>' +
            '            <p>备注信息：<span>' + "" + '</span></p>';


        $('#pm_msg').append(pm_msg);
        $('#add_msg').append(add_msg);

        var images = person.images;
        var pm_img = '<img src="' + person.face_image + '">';

        $('#pm_img').append(pm_img);
        var pm_ft_wrapper = '';
        for(var i = 0; i < images.length; i++){
            pm_ft_wrapper += '<div class="pm_ft_img left">' +
                '                    <img src="' + images[i].face_image + '">' +
                '                </div>';
        }

        $('#pm_ft_wrapper').append(pm_ft_wrapper);
    })
}
function goBack() {
    window.history.go(-1)
}