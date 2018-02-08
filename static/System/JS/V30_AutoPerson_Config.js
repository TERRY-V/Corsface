/**
 * Created by zhaoj on 2017/12/26.
 */

var MinSpot,CImagesNum,CMean,MaxSpot,AImagesNum,AMean,AMaxNum;

function initData() {
    $.ajaxSetup({cache:false});

    $.post("frameAction.action",
        {TagName:"getAutoPerson"},
        function(data) {
            try{
                var res = JSON.parse(data);
            }catch(e){
                console.log(e)
            }
            $('#MinSpot').val(res[0]["MinSpot"]);
            $('#CImagesNum').val(res[0]["CImagesNum"]);
            $('#CMean').val(res[0]["CMean"]);
            $('#MaxSpot').val(res[0]["MaxSpot"]);
            $('#AImagesNum').val(res[0]["AImagesNum"]);
            $('#AMean').val(res[0]["AMean"]);
            $('#AMaxNum').val(res[0]["AMaxNum"]);
        });

    function getFormData() {
        MinSpot = $('#MinSpot').val();
        CImagesNum = $('#CImagesNum').val();
        CMean =$('#CMean').val();
        MaxSpot =$('#MaxSpot').val();
        AImagesNum =$('#AImagesNum').val();
        AMean=$('#AMean').val();
        AMaxNum=$('#AMaxNum').val();
    }

    $('#saveSysConfig').click(function () {
        getFormData();
        $.post('frameAction.action',{
            TagName : "SaveAutoData",
            MinSpot : MinSpot,
            CImagesNum : CImagesNum,
            CMean : CMean,
            MaxSpot : MaxSpot,
            AImagesNum : AImagesNum,
            AMean:AMean,
            AMaxNum :AMaxNum
        },function (data) {
            if(data=="SUCC"){
                window.location.reload();
            }else{
                alert("保存失败");
            }
        })
    })
}