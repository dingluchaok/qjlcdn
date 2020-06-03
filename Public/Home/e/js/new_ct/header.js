// 渲染BTC&ETH市场
$(function(){
  function startWbsocket(w) {
    w.onopen = function(evt){
      for (var i = 0; i < _w_.toolBarInfo.length; i++) {
        var keys = _w_.toolBarInfo[i].key
        // top_ws.send(JSON.stringify({
        //   "event":"sub",
        //   "params":{
        //       "channel":"market_"+ keys +"_ticker",
        //       "cb_id":keys
        //     }
        // }));
      }
    }
  }
  var toobarDom = '';
  // for (var x=0; x < _w_.toolBarInfo.length; x++) {
  //   if(x == 2 || x==4){
  //     }else {
  //         toobarDom = toobarDom+'<span class="toolbar-transaction" name="'+ _w_.toolBarInfo[x].key +'">'+ _w_.toolBarInfo[x].name +'&nbsp;:&nbsp;<em>--</em><span class="indexcash" name="'+_w_.toolBarInfo[x].key +'cash-close"></span></span>'
  //     }
  // }
  //
  // $('.toolbar').append(toobarDom);
  // 渲染结构结束
  // 连接ws服务
  if ("WebSocket" in window){
    // var top_ws = new WebSocket(_w_.wsUrl);
    // top_ws.binaryType = "arraybuffer";
  }else{
    alert('浏览器不支持，请升级')
  }
    // 全局判断nem改成xem
    window.GlobalNemTOXem =  function () {
        var list =  document.getElementsByTagName('*');
        for(var i = 1; i< list.length-1; i++) {
            if(
                list[i].tagName == "SCRIPT"
                || list[i].tagName == "LINK"
                || list[i].tagName == "HEAD"
                || list[i].tagName == "META"
                || list[i].tagName == "TITLE"
                || list[i].tagName == "BODY"
                || list[i].tagName == "IMG"
            ) {}else {
                var c =  $(list[i]).text()

                if( c.indexOf('NEM') == '-1') {
                    if( c.indexOf('nem') == '-1') {
                    }else {
                        if(
                            !$(list[i]).is(':has(div)')
                            &&!$(list[i]).is(':has(td)')
                            &&!$(list[i]).is(':has(a)')
                            &&!$(list[i]).is(':has(span)')
                            &&!$(list[i]).is(':has(th)')
                            &&! $(list[i]).is(':has(option)')
                        ){
                            var d =  $(list[i]).text()
                            $(list[i]).text( d.replace(/nem/g,'xem'))
                        }
                    }
                }else {
                    if(
                        !$(list[i]).is(':has(div)')
                        &&! $(list[i]).is(':has(td)')
                        &&! $(list[i]).is(':has(a)')
                        &&! $(list[i]).is(':has(span)')
                        &&! $(list[i]).is(':has(th)')
                        &&! $(list[i]).is(':has(option)')
                        &&! $(list[i]).is(':has(style)')
                    ){
                        var d =  $(list[i]).text()
                        $(list[i]).text(d.replace(/NEM/,'XEM') )
                    }
                }
            }
        }
    }
    GlobalNemTOXem()
    //点击关闭保存一下
    var otcGuideSet = sessionStorage.getItem("otcGuide");
    if(!otcGuideSet)
    {
        $('#otcGuide').show();
    }
    // if(!otcGuideSet) {//如果没有点击就让显示
        // var  googleSet = sessionStorage.getItem("googleSet");
        // var url = window.location.href;
        // if(googleSet) {
        //     if(
        //         url.indexOf('index') != '-1' //在主页
        //     ){
        //         $('#otcGuide').show()
        //     }else if(url.indexOf('trade_center') != '-1'){//在交易
        //         $('#otcGuide').show()
        //     }else if(url.indexOf('account_balance') != '-1')//在资金
        //     {
        //         $('#otcGuide').show()
        //     }
        // }else {
        //     if(
        //         url.indexOf('index') != '-1' && $('#User').length<1
        //     ){//没登录
        //         $('#otcGuide').show()
        //     }else if(url.indexOf('trade_center') != '-1'){//在交易
        //         $('#otcGuide').show()
        //     }else if(url.indexOf('account_balance') != '-1')//在资金
        //     {
        //         $('#otcGuide').show()
        //     }
        //}
    // }
    $('#otcGuideClose').click(function() {
        $('#otcGuide').hide()
        sessionStorage.setItem("otcGuide",'set');
    })
})
