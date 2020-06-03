if("https:" == document.location.protocol)
    window.bibaourl = "https://www.bao.top/vct";
else
    window.bibaourl = "http://www.bao.top/vct";
window.appid = "rtwAgyHQ9FIniyBUtF7iEBvo-gzGzoHsz";
window.appkey = "htHuSwxIIJGdA0HcT9551xco";
//window.imgurl = "http://os1k2lqfd.bkt.clouddn.com/";
window.imgurl = "https://img.bibaovip.com/";//犀牛云路径
var GV = {
    baoUrl: "https://www.bibaovip.com"
};
/**
 * Created by Administrator on 2018-01-17.
 */

//获得get请求参数
function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}
 //判断两个数的是否为整数倍(能否整除),返回true或者false
 function mod0(arg1, arg2) {
     if (
         arg1.toString().split(".").length > 1 ||
         arg2.toString().split(".").length > 1
     ) {
         bei = Math.pow(
             10,
             Math.min(arg1, arg2)
                 .toString()
                 .split(".")[1].length
         );
         return (arg1 * bei) % (arg2 * bei) == 0;
     } else {
         return arg1 % arg2 == 0;
     }
 }
//通过token 获取用户信息
function getUserinfo(token){
	$.ajax({
        /*headers: {
            'XX-Token': token,
            'XX-Device-Type': 'pc',
            'sessionID': localStorage.sessionID
        },*/
        type: 'POST',
        url: bibaourl+'/api/Bibao/getUserInfo',
        dataType: "json",
        data: {"token":token},
        async: false,
        success: function (data) {
            //debugger;
          if (data.data&&data.data.responseCode == 0) {
          	//赋值
            localStorage.userinfo = JSON.stringify(data.data.result);

          }else if(data.code=="405"){
              msg = data.msg;
              layer.msg(msg);
              /*
              localStorage.clear();
              location.href = "login.html";*/
              logout2();
          }
        }
      });
}
/*退出*/
//$("#login_out").click(function () {
function logout() {
    //询问框
    layer.confirm('您确定要退出吗？', {
        btn:['确定'] //按钮
    }, function(index){
        $.ajax({
            /* headers: {
             'XX-Token': localStorage.token,
             'XX-Device-Type': 'pc',
             'sessionID': localStorage.sessionID
             },*/
            type: 'POST',
            url: bibaourl + "/api/user/logOut",
            xhrFields: {
                withCredentials: true
            },
            data: 'memberToken=' + localStorage.token,
            dataType: "json",
            // async: false,
            success: function (res) {
//                    debugger;
                localStorage.clear();
                location.href = "login.html";

                /* if (res.code == -1) {
                 localStorage.removeItem("token");
                 localStorage.removeItem("userinfo");
                 localStorage.removeItem("sessionID");
                 location.href = "login.html";

                 }
                 if (res.code == 405 || res.data.responseCode == -2) {
                 //
                 //token 无效
                 localStorage.removeItem("token");
                 localStorage.removeItem("userinfo");
                 localStorage.removeItem("sessionID");
                 location.href = "login.html";
                 }
                 if (res.data.responseCode == 1) {
                 localStorage.removeItem("token");
                 localStorage.removeItem("userinfo");
                 localStorage.removeItem("sessionID");
                 window.location.href = "login.html";
                 } else {
                 layer.msg(res.msg);
                 return false;
                 }*/
            }
        });
        layer.close(index);
    });
}

 /*内页退出*/
function logout2() {
        $.ajax({
            type: 'POST',
            url: bibaourl + "/api/user/logOut",
            xhrFields: {
                withCredentials: true
            },
            data: 'memberToken=' + localStorage.token,
            dataType: "json",
            success: function (res) {
//                    debugger;
                localStorage.clear();
                location.href = "login.html";
            }
        });
}

//时间转化js正常格式
function GetCreateTime(time) {
    //格式话化时间
    var times = new Date(time);
    var year = times.getFullYear();
    var month = times.getMonth()+1;
    month = month < 10 ? ('0' + month) : month;
    var day = times.getDate();
    day = day < 10 ? ('0' + day) : day;
    var hours = times.getHours();
    hours = hours < 10 ? ('0' + hours) : hours;
    var min = times.getMinutes();
    min = min < 10 ? ('0' + min) : min;
    var ss = times.getSeconds();
    ss = ss < 10 ? ('0' + ss) : ss;
    var newTime = year + "-" + month + "-" + day + " " + hours + ":" + min + ":" + ss;
    return newTime;

    // console.log(d);
    // var datetime =
    //     d.getFullYear() +
    //     "-" +
    //     (d.getMonth() + 1) +
    //     "-" +
    //     d.getDate() +
    //     "" +
    //     " " +
    //     d.getHours() +
    //     ":" +
    //     d.getMinutes() +
    //     ":" +
    //     d.getSeconds();
}

 function transForm(date) {
     var datetime = new Date(date);
     var result = datetime.getFullYear()
         + "-"// "年"
         + ((datetime.getMonth() + 1) >= 10 ? (datetime.getMonth() + 1) : "0"
             + (datetime.getMonth() + 1))
         + "-"// "月"
         + (datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime
             .getDate())
         + " "
         + (datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime
             .getHours())
         + ":"
         + (datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime
             .getMinutes())
         + ":"
         + (datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime
             .getSeconds());
     return result;
 }

//浮点数的精度解决
function toFixed(num1, num2, type) {
    if(num1 == undefined || num2 == undefined ){
        return null;
    }
    var num1_length =
        num1.toString().indexOf(".") > -1 &&
        num1.toString().split(".")[1].length > 1
            ? num1.toString().split(".")[1].length
            : num1.toString().indexOf("-") > -1
            ? parseInt(num1.toString().split("-")[1])
            : 2;
    var num2_length =
        num2.toString().indexOf(".") > -1 &&
        num2.toString().split(".")[1].length > 1
            ? num2.toString().split(".")[1].length
            : num2.toString().indexOf("-") > -1
            ? parseInt(num2.toString().split("-")[1])
            : 2;
    var minnum = Math.max(num1_length, num2_length);
    if (type == "*") {
        minnum = num1_length + num2_length;
    }
    if (type == "/") {
        minnum = 8;
    }
    var fixedNum = minnum;
    var beishu = Math.pow(10, fixedNum);
    var retNum = 0;
    switch (type) {
        case "+":
            if (num2 == 0) {
                return num1;
            }
            retNum = Math.round((num1 + num2) * beishu) / beishu;
            break;
        case "-":
            if (num2 == 0) {
                return num1;
            }
            retNum = Math.round((num1 - num2) * beishu) / beishu;
            break;
        case "*":
            retNum = Math.round(num1 * num2 * beishu) / beishu;
            break;
        case "/":
            retNum = Math.round(num1 / num2 * beishu) / beishu;
            break;
    }
    return retNum;
}

