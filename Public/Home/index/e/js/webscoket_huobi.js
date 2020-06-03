var nowTime = Date.parse(new Date());//用于生成websocket的send方法中的ID
var websocketurl = "wss://hb.bao.top/ws";
//var websocketurl = "wss://api.huobipro.com/ws";
var selfwebsocketurl = "wss://www.bao.top/vct-ws/webSocket";
//var selfwebsocketurl = "ws://47.52.255.59:8083/vct-ws/webSocket";
//var selfwebsocketurl = "ws://192.168.1.53:8083/vct-ws/webSocket";

var marketObj = new Object();
marketObj["usdtusdt"] = 1;
var coinDataArr = new Array();

var transformMap = new Map(); //bcxusdt:bcxbtc
var transformMap1 = new Map(); //bcxusdt:btcusdt

//创建数组(用于存储交换币种的行情等信息)
var transformCoinArr = new Array();
//创建数组(用于存储KLine数据信息)
var KlineData = new Array();
//创建数组(用于存储是否使用自己报价系统等信息)
var coinArr = new Array();
var currencyListData;
$.ajax({
    xhrFields: {
        withCredentials: true
    },
    url: window.bibaourl+'/api/coin/currency_lists',
    type: 'get',
    dataType: 'json',
    async:false,
    success: function (data) {
        if(data.code == "0000"){
            currencyListData = data;
            $.each(data.data.btb_coin,function (index,n) {
                $.each(n.coins,function(i,itme){

                    var coinObj = new Object();
                    //用于存储交换币种的行情等信息
                    var transformCoinObj = new Object();
                    coinObj.symbol = (itme.coin_name.trim()+n.coin_name.trim()).toLowerCase();
                    coinObj.isSelf = itme.is_self;
                    coinObj.transformCoin = itme.transform_coin;
                    //判断transform_coin是否存在
                    if(itme.transform_coin.trim().toLowerCase()!='usdt'){
                        transformCoinObj.symbol = (itme.transform_coin.trim()+n.coin_name.trim()).toLowerCase();
                    }
                    if(coinObj.symbol!=null&&!isExist(coinArr,coinObj.symbol)){//如果不存在这个交易对，则添加
                        coinArr.push(coinObj);
                    }
                    if(transformCoinObj.symbol!=null&&!isExist(transformCoinArr,transformCoinObj.symbol)){//如果不存在这个交易对，则添加
                        transformCoinArr.push(transformCoinObj);
                    }

                    if(itme.is_self = '0' && itme.transform_coin != 'usdt'){
                        transformMap.set((itme.coin_name.trim()+n.coin_name.trim()).toLowerCase(),(itme.coin_name.trim()+itme.transform_coin).toLowerCase())
                        transformMap1.set((itme.coin_name+n.coin_name).toLowerCase(),(itme.transform_coin+n.coin_name).toLowerCase())
                    }

                    var coinDataObj = new Object();
                    coinDataObj.symbol = (itme.coin_name.trim()+n.coin_name.trim()).toLowerCase();
                    coinDataObj.transformSymbol = (itme.coin_name.trim()+itme.transform_coin.trim()).toLowerCase();
                    coinDataObj.transformMarket  = (itme.transform_coin.trim()+'usdt').toLowerCase();
                    if(coinDataObj.symbol!=null&&!isExist(coinDataArr,coinDataObj.symbol)){
                        coinDataArr.push(coinDataObj);
                    }
                })
            })
        }
    },
    error: function () {
        console.log("获取当前使用的websocket数据异常！")
    }
});

var socketOpen = false;
var socket = new WebSocket(websocketurl);
socket.connectionTimeout = 3000;
socket.binaryType = "arraybuffer";
socket.onerror = function () {
    socketOpen = false;
    console.log("error");
    console.log(arguments);
};
socket.onclose = function (event) {
    socketOpen = false;
    console.log("WebSocket close at time: " + new Date());
};
socket.onopen = function (event) {
    socketOpen = true;
    // socket.binaryType = "arraybuffer";
    console.log("WebSocket onopen at time: " + new Date());
};
socket.onmessage = function (event) {
    var raw_data = event.data;
    var json = pako.inflate(raw_data, { to: "string" });
    scMessage(socket,json);
}
//----------------------------------------
var selfSocketOpen = false;
var selfSocket = new WebSocket(selfwebsocketurl);
selfSocket.connectionTimeout = 3000;
selfSocket.binaryType = "arraybuffer";
selfSocket.onerror = function () {
    selfSocketOpen = false;
    console.log("error");
    console.log(arguments);
};
selfSocket.onclose = function (event) {
    selfSocketOpen = false;
    console.log("WebSocket close at time: " + new Date()+"self");
};
selfSocket.onopen = function (event) {
    selfSocketOpen = true;
    console.log("WebSocket onopen at time: " + new Date()+"self");
};
selfSocket.onmessage = function (event) {
    var raw_data = event.data;
    var json = pako.inflate(raw_data, { to: "string" });
    scMessage(selfSocket,json);
}

//message內部方法
function scMessage(socket,json) {
    var data = JSON.parse(json);
    if (data.ch && data.ch.indexOf("kline.1day") > -1) {//k线
        var tick = data.tick
        var symbol = data.ch.split('.')[1]
        dealMarket(symbol,tick)
    }else if(data.rep && data.rep.indexOf("kline.1day") > -1){ //K线请求
        var kreq = data.data
        var symbol = data.rep.split('.')[1]
        var tick = kreq[kreq.length-1]
        dealMarket(symbol,tick)

    }else if(data.rep && data.rep.indexOf("trade.detail") > -1){//实时交易请求
        dealTradeDetail(data,1)
    }else if(data.ch && data.ch.indexOf("trade.detail") > -1){//实时交易订阅
        dealTradeDetail(data,2)
    }else if(data.ch && data.ch.indexOf("depth") > -1){//深度
        var symbol = traddingCoin+marketCoin
        if(transformMap1.has(symbol)) {
            var marketClose = marketObj[transformMap1.get(symbol)]
        }
        if(transformMap.has(symbol)){
            symbol = transformMap.get(symbol)
            for(var asks of data.tick.asks){
                asks[0] = toFixed(asks[0],marketClose,"*")
                asks[1] = toFixed(asks[1],marketClose,"/")
            }
            for(var bids of data.tick.bids){
                bids[0] = toFixed(bids[0],marketClose,"*")
                bids[1] = toFixed(bids[1],marketClose,"/")
            }
        }
        if(data.ch.indexOf(symbol) > -1){
            dealTradeDepth(data)
        }
    }else if(data.rep && data.rep.indexOf(".detail") > -1 && data.rep.indexOf("trade.detail") <= -1){ //24小时信息请求
        var symbol = data.rep.split('.')[1];
        deal24Hour(symbol,data.data)
    }else if(data.ch && data.ch.indexOf(".detail") > -1 && data.ch.indexOf("trade.detail") <= -1){ //24小时信息订阅
        var symbol = data.ch.split('.')[1]
        deal24Hour(symbol,data.tick)
    }

    if (data.rep && data.rep.indexOf(".kline."+localStorage.initResolution) > -1) {//k线请求数据
        KlineData = json;
        var symbol = data.rep.split('.')[1]
        for(var key of transformMap){
            if(key[1] == symbol){
                symbol = key[0]
                if(transformMap1.has(symbol)){
                    var marketClose = marketObj[transformMap1.get(symbol)]
                    for(var tick in data.data){
                        tick.open = toFixed(tick.open,marketClose,"*")
                        tick.close = toFixed(tick.close,marketClose,"*")
                        tick.high = toFixed(tick.high,marketClose,"*")
                        tick.low = toFixed(tick.low,marketClose,"*")
                        tick.amount = toFixed(tick.amount,marketClose,"/")
                    }
                }
            }
        }
        initMarket1(symbol, tick)
    }

    var ps = data.ping;
    if(ps !=null){
        socket.send(JSON.stringify({"pong":ps}))
    }
}

function deal24Hour(symbol,tick) {
    for(var key of transformMap){
        if(key[1] == symbol){
            symbol = key[0]
            if(transformMap1.has(symbol)){
                var marketClose = marketObj[transformMap1.get(symbol)]
                tick.amount = toFixed(tick.amount,marketClose,"/")
            }
        }
    }
    init24Amount(symbol,tick);
}

function dealMarket(symbol,tick){
    for(var key of transformMap){
        if(key[1] == symbol){
            symbol = key[0]
            if(transformMap1.has(symbol)){
                var marketClose = marketObj[transformMap1.get(symbol)]
                tick.open = toFixed(tick.open,marketClose,"*")
                tick.close = toFixed(tick.close,marketClose,"*")
                tick.high = toFixed(tick.high,marketClose,"*")
                tick.low = toFixed(tick.low,marketClose,"*")
                tick.amount = toFixed(tick.amount,marketClose,"/")
            }
        }
    }
    initMarket(symbol, tick)
    $.each(transformCoinArr,function(index,item){
        if(symbol==item.symbol){
            marketObj[item.symbol] = tick.close;
        }
    })
}

symbolsInfo()
var symbolsInfo
//获取交易对信息
function symbolsInfo() {
    $.ajax({
        type: "get",
        url: window.bibaourl+"/api/coin/symbolsInfo",
        headers: {
            'XX-Token': localStorage.token,
            'XX-Device-Type': 'pc',
            'sessionID': localStorage.sessionID
        },
        data: [],
        async:false,
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        success: function (obj) {
            if (obj.code && obj.code == "0000") {
                symbolsInfo = obj.data
            }
        }
    });
}

function getDecimals(symbol) {
    var decimal
    for(var i in symbolsInfo){
        var n = symbolsInfo[i]
        if((n.coin_name+n.quote_name) == symbol){
            decimal = n.decimals;
            break;
        }
    }
    return isNaN(decimal) ? 6 : decimal
}

//判断对象是否已存在
function isExist(arr,obj){
    var j = false;
    for(var i=0;i<arr.length;i++){
        if(arr[i].symbol==obj){
            j = true;
        }
    }
    return j;
}
//通过交易对，获取是否使用自己的报价系统【0：火币，1：尔谷科技】
function isUseSelf(arr,obj){
    for(var i=0;i<arr.length;i++){
        if(arr[i].symbol==obj){
            return arr[i].isSelf;
        }
    }
}

//用于转换币种的结果处理
function getResult(coinDataArr,marketObj,symbol){
    var result = {};
    for(var i=0;i<coinDataArr.length;i++){
        if(symbol==coinDataArr[i].transformSymbol){
            result.a = coinDataArr[i].symbol;
            result.b = marketObj[coinDataArr[i].transformMarket];
        }
    }
    return result;
}
//用于转换币种的结果处理
function dealTransformCoin(coinDataArr,symbol){
    var a = "";
    for(var i=0;i<coinDataArr.length;i++){
        if(symbol==coinDataArr[i].symbol){
            a = coinDataArr[i].transformSymbol;
        }
    }
    return a;
}

//发送需要转换的币种交易对
ininData();
function ininData() {
    if (!socketOpen) {
        setTimeout(function () {
            ininData();
        }, 100);
        return;
    }
    $.each(transformCoinArr,function(index,item){
        marketObj[item.symbol] = 1;
        //请求
        socket.send(
            JSON.stringify({
                    req: "market."+item.symbol+".kline.1day",
                    id: nowTime,
                    from:parseInt((nowTime.valueOf())/1000) - 86400,
                    to:parseInt((nowTime.valueOf())/1000)
                }
            ))
        //订阅
        socket.send(
            JSON.stringify({
                    sub: "market."+item.symbol+".kline.1day",
                    id: nowTime
                }
            ))
    })
}

function formatDateTime(inputTime) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return h+':'+minute+':'+second;
}

function toDecimal(x,n) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return false;
    }
    var f = Math.round(x*Math.pow(10,n))/Math.pow(10,n);
    var s = f.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + n) {
        s += '0';
    }
    return s;
}

//发送24小时请求订阅参数
function subDetail(symbol) {
    var isSelfVaL = isUseSelf(coinArr,symbol.toLowerCase());
    var currentScoket = isSelfVaL == 0 ? socket : selfSocket
    var isopen = isSelfVaL == 0 ? socketOpen : selfSocketOpen
    if (!isopen) {
        setTimeout(function () {
            subDetail(symbol);
        }, 100);
        return;
    }
    if(transformMap.has(symbol)){
        symbol = transformMap.get(symbol)
    }
    currentScoket.send( //K线请求
        JSON.stringify({
                req: 'market.' + symbol + '.detail',
                id: nowTime
            }
        ))
    currentScoket.send( //k线订阅
        JSON.stringify({
            sub: 'market.' + symbol + '.detail',
            id: nowTime
        })
    );
}

//发送K线参数
function submarketkline(symbol) {
    var isSelfVaL = isUseSelf(coinArr,symbol.toLowerCase());
    if(isSelfVaL==0){
        if (!socketOpen) {
            setTimeout(function () {
                submarketkline(symbol);
            }, 100);
            return;
        }
        if(transformMap.has(symbol)){
            symbol = transformMap.get(symbol)
        }
        socket.send( //K线请求
            JSON.stringify({
                    req: 'market.' + symbol + '.kline.1day',
                    id: nowTime
                }
            ))
        socket.send( //k线订阅
            JSON.stringify({
                sub: 'market.' + symbol + '.kline.1day',
                id: nowTime
            })
        );
    }else if(isSelfVaL==1){
        if (!selfSocketOpen) {
            setTimeout(function () {
                submarketkline(symbol);
            }, 100);
            return;
        }
        selfSocket.send( //K线请求
            JSON.stringify({
                    req: 'market.' + symbol + '.kline.1day',
                    id: nowTime
                }
            ))
        selfSocket.send( //k线订阅
            JSON.stringify({
                sub: 'market.' + symbol + '.kline.1day',
                id: nowTime
            })
        );
    }
}
localStorage.setItem("initResolution","1min");
var configurationData = {//SymbolInfo
    "name": (localStorage.traddingCoin.toUpperCase()+"/"+localStorage.marketCoin.toUpperCase()),//商品名称。
    "exchange-traded": "NasdaqNM",
    "exchange-listed": "",//信息在左上角展示
    "timezone": "Asia/Shanghai",//时区
    "minmov": 1,
    "pointvalue": 1,
    "has_daily": !0,
    "has_weekly_and_monthly": !0,
    "session":  "24x7",//ssession
    "has_intraday": true,//布尔值显示商品是否具有日内（分钟）历史数据。(重要参数)
    "has_no_volume": false,//布尔表示商品是否拥有成交量数据(false:显示)
    "description": (localStorage.traddingCoin.toUpperCase()+"/"+localStorage.marketCoin.toUpperCase()),//商品说明。这个商品说明将被打印在图表的标题栏中。
    "type": "stock",
    "supported_resolutions":  ["1", "5", "15", "30", "60", "1D","5D", "1W", "1M"],
    "pricescale": 1000000,//右侧精度
    "ticker": (localStorage.traddingCoin+localStorage.marketCoin),//它是您的商品代码体系中此商品的唯一标识符。如果您指定此属性，则其值将用于所有数据请求，ticker	如果未明确指定，则被视为等于	 symbol
    "volume_precision":5//成交量精度
};

function webSocketSent(resolutionVal){
    var isSelfVaL = isUseSelf(coinArr,(localStorage.traddingCoin+localStorage.marketCoin).toLowerCase());
    if(isSelfVaL==0){//火币
        if (!socketOpen) {
            setTimeout(function () {
                webSocketSent(resolutionVal);
            }, 100);
            return;
        }
        socket.send(JSON.stringify({
            "req": "market."+dealTransformCoin(coinDataArr,(localStorage.traddingCoin+localStorage.marketCoin))+".kline."+resolutionVal,//resolutionVal分辨率(默认：1min)
            "id": nowTime
        }));
    }else if(isSelfVaL==1){//尔谷
        if (!selfSocketOpen) {
            setTimeout(function () {
                webSocketSent(resolutionVal);
            }, 100);
            return;
        }
        selfSocket.send(JSON.stringify({
            "req": "market."+dealTransformCoin(coinDataArr,(localStorage.traddingCoin+localStorage.marketCoin))+".kline."+resolutionVal,//resolutionVal分辨率(默认：1min)
            "id": nowTime
        }));
    }
}
//防止数据为空的
function initMarket1(symbol, tick){
    if(KlineData==""){
        setTimeout(function(){
            if(KlineData!=""){
                initTradingView();
            }
        },1000);
    }else{
        initTradingView();
    }
};
// -----------------websocket 结束-------------------------------------------------------------------

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function initTradingView(){
    var i18nLanguage = getCookie("userLanguage");
    var languageVal = 'zh';//默认中文
    //国际化
    if(i18nLanguage=="zh-CN"){
        languageVal = 'zh';
    }else if(i18nLanguage=="en"){
        languageVal = 'en';
    }

    var widget = window.tvWidget = new TradingView.widget({
        fullscreen: true,
        symbol: (localStorage.traddingCoin+localStorage.marketCoin),//商品名
        interval: 'D',
        container_id: "tv_chart_container",
        datafeed: new Datafeeds.UDFCompatibleDatafeed(KlineData,configurationData,localStorage.getItem("initResolution")),
        library_path: "charting_library/",
        locale: getParameterByName('lang') || languageVal,//国际化
        drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
        disabled_features:selfHideButton(),//隐藏
        enabled_features: selfShowButton(),// 添加study_templates，显示左上指标线按钮右侧的向下按钮
        charts_storage_api_version: "1.1",
        "timezone": "Asia/Shanghai",//时区
        time_frames: [],
        widgetbar: {
            datawindow: !1,
            details: !1,
            watchlist: !1,
            watchlist_settings: {
                default_symbols: []
            }
        },
        overrides: {
            "paneProperties.background": "#ffffff",//中间背景
            "paneProperties.vertGridProperties.color": "#f7f8fa",//网格属性
            "paneProperties.horzGridProperties.color": "#f7f8fa",//网格属性
            "symbolWatermarkProperties.transparency": 90,// 透明
            "scalesProperties.textColor" : "#589065",//文字颜色
            "paneProperties.legendProperties.showLegend":false,//是否展示Legend
            "mainSeriesProperties.candleStyle.borderUpColor": "#03c087",//烛线边框
            "mainSeriesProperties.candleStyle.borderDownColor": "#d75442"//烛线边框
        },
        studies_overrides:{},
        toolbar_bg:"#ffffff",//工具栏背景
        toggle_header:true,//图表头显示/隐藏
        width: '100%',
        height: '500px',
        fullscreen:false//布尔值显示图表是否占用窗口中所有可用的空间。
    });

    widget.onChartReady(function() {
        //国际化
        var timeButton = ["1min","5min","15min","30min","1hour","4hour","1day","1week","1mon"];//"5day",
        var timeButton2 = ["1分","5分","15分","30分","1小时","4小时","1天","1周","1月"];
        if(i18nLanguage=="zh-CN"){
            timeButton2 = ["1分","5分","15分","30分","1小时","4小时","1天","1周","1月"];
        }else if(i18nLanguage=="en"){
            timeButton2 = ["1min","5min","15min","30min","1hour","4hour","1day","1week","1mon"];
        }

        for(var i in timeButton){
            widget.createButton({align:"left"})
                .attr('title', timeButton[i])
                .css("background",localStorage.getItem('initResolution')==timeButton[i]?"#9194a4":"#ffffff")
                .css("border","#ffff22")
                .on('click', function (e) {
                    // alert("点击触发的事件!"+this.title);
                    // if(this.title!='分时'){//按钮为！='分时'时，才触发此事件
                    //     localStorage.setItem("initResolution",this.title);
                    //     webSocketSent(this.title);
                    // }
                    localStorage.setItem("initResolution",this.title);

                    if(this.title=="1hour"){
                        this.title='60min';
                    }
                    webSocketSent(this.title);
                })
                .append($('<span id="'+this.title+'">'+timeButton2[i]+'</span>'));
        }

        //指标线
        var lineColor = ["#965fc4", "#84aad5", "#55b263", "#b7248a"];
        var lineResolutions = [5, 10, 30, 60];
        for(var i=0;i<4;i++){
            widget.chart().createStudy('Moving Average',false,true,[lineResolutions[i]],null,{'plot.color.0':lineColor[i]});
        }
    });
}

function selfHideButton(){
    return ["use_localstorage_for_settings",
        "volume_force_overlay",
        "header_compare",
        "header_screenshot",
        "header_resolutions",
        "header_bars_style",
        "header_fullscreen",
        "header_bars_style",
        "header_symbol_search",
        "header_undo_redo",
        "header_saveload",
        "header_chart_type",
        "show_hide_button_in_legend"
    ];
}

function selfShowButton(){// 添加study_templates，显示左上指标线按钮右侧的向下按钮
    return [
        "move_logo_to_main_pane",//logo移动到中间
        "dont_show_boolean_study_arguments"//隐藏‘（）’中的true/false
    ];
}