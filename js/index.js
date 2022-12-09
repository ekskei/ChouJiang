//抽奖人员名单
var allPerson = [];

//未中奖人员名单
var remainPerson = [];

//中奖人员名单
var luckyMan = [];

var timer;//定时器
var times = 1;//抽奖次数
$(function () {
    readNames();

    iconAnimation();
    
    //开始抽奖
    $("#btnStart").on("click", function () {
        
        //判断是开始还是结束
        if ($("#btnStart").text() === "开始") {
            if (allPerson.length == 0) {
                showDialog("请选择人员名单Excel文件");
                return false;
            }
            if (!$("#txtNum").val()) {
                showDialog("请输入中奖人数");
                return false;
            }
            if ($("#txtNum").val() > 49) {
                showDialog("一次最多只能输入49人");
                return false;
            }
            if ($("#txtNum").val() > remainPerson.length) {
                showDialog("当前抽奖人数大于奖池总人数<br>当前抽奖人数：<b>" + $("#txtNum").val() + "</b>人,奖池人数：<b>" + remainPerson.length + "</b>人");
                return false;
            }
            $("#result").fadeOut();
            //显示动画框，隐藏中奖框
            $("#luckyDrawing").show().next().addClass("hide");
            move();
            $("#btnStart").text("停止");
            $("#bgLuckyDrawEnd").removeClass("bg");
        }
        else {
            $("#btnStart").text("开始");//设置按钮文本为开始
            var luckyDrawNum = $("#txtNum").val();
            startLuckDraw();//抽奖开始

            $("#luckyDrawing").fadeOut();
            clearInterval(timer);//停止输入框动画展示
            $("#luckyDrawing").val(luckyMan[luckyMan.length - 1]);//输入框显示最后一个中奖名字
            $("#result").fadeIn().find("div").removeClass().addClass("p" + luckyDrawNum);//隐藏输入框，显示中奖框
            $("#bgLuckyDrawEnd").addClass("bg");//添加中奖背景光辉
            $("#txtNum").attr("placeholder", "请输入中奖人数 (剩余" + remainPerson.length + ")");
        }
    });

    $("#btnReset").on("click", function() {
        //确认重置对话框
        var confirmReset = false;
        showConfirm("确认重置吗？所有已中奖的人会重新回到抽奖池！", function () {
            //熏置未中奖人员名单
            remainPerson = allPerson;

            $("#txtNum").attr("placeholder", "请输入中奖人数 (剩余" + remainPerson.length + ")");

            //中奖人数框置空
            $("#showName").val("");
            //隐藏中奖名单,然后显示抽奖框
            $("#result").fadeOut();
            $("#bgLuckyDrawEnd").removeClass("bg");//移除背景光辉
            times++;
            console.log(times);

        });
    });
});

//抽奖主程序
function startLuckDraw() {
    //抽奖人数
    var luckyDrawNum = $("#txtNum").val();
    if (luckyDrawNum > remainPerson.length) {
        alert("抽奖人数大于奖池人数！请修改人数。或者点重置开始将新一轮抽奖！");
        return false;
    }
    //随机中奖人
    var randomPerson = getRandomArrayElements(remainPerson, luckyDrawNum);
    var tempHtml = "";
    $.each(randomPerson, function (i, person) {
        var sizeStyle = "";
        if (person.length > 3) {
            sizeStyle = " style=font-size:" + 3 / person.length + "em";
        }

        tempHtml += "<span><span " + sizeStyle + ">" + person + "</span></span>";
    });
    $("#result>div").html(tempHtml);
    //剩余人数剔除已中奖名单
    remainPerson = remainPerson.delete(randomPerson);
    //中奖人员
    luckyMan = luckyMan.concat(randomPerson);
    //设置抽奖人数框数字为空
    $("#txtNum").val("");
}

//跳动的数字
function move() {
    var $showName = $("#showName"); //显示内容的input的ID
    var interTime = 30;//设置间隔时间
    timer = setInterval(function () {
        var i = GetRandomNum(0, remainPerson.length);
        $showName.val(remainPerson[i]);//输入框赋值
    }, interTime);
}

//顶上的小图标，随机动画
function iconAnimation() {
    var interTime = 200;//设置间隔时间
    var $icon = $("#iconDiv>span");
    var arrAnimatoin = ["bounce", "flash", "pulse", "rubberBand", "shake", "swing", "wobble", "tada"];
    setInterval(function () {
        var i = GetRandomNum(0, $icon.length);
        var j = GetRandomNum(0, arrAnimatoin.length);
        $($icon[i]).removeClass().stop().addClass("animated " + arrAnimatoin[j]);
    }, interTime);

}

function readNames() {
    $('#excelFile').change(function (e) {
        var files = e.target.files;
        var fileReader = new FileReader();
        fileReader.onload = function(ev) {
            try {
                var data = ev.target.result
                var workbook = XLSX.read(data, {
                    type: 'binary'
                }) // 以二进制流方式读取得到整份excel表格对象
                var persons = []; // 存储获取到的数据
            } catch (e) {
                console.log('文件类型不正确');
                return;
            }

            allPerson = [];

            for (var sheet in workbook.Sheets) {
                if (workbook.Sheets.hasOwnProperty(sheet)) {
                    persons = persons.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                    break;
                }
            }

            for (let index = 0; index < persons.length; index++) {
                const element = persons[index].name;
                allPerson.push(element)
            }

            remainPerson = allPerson;
            $("#txtNum").show();
            $("#btnStart").show();
            $("#btnReset").show();
            $("#txtNum").attr("placeholder", "请输入中奖人数 (剩余" + remainPerson.length + ")");
            showDialog("名单总人数为" + allPerson.length + ", 请输入中奖人数, 然后点击开始");
        };
        // 以二进制方式打开文件
        fileReader.readAsBinaryString(files[0]);

        e.target.value = '';
    });
}
