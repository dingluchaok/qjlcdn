// 渲染BTC&ETH市场
$(function(){
    $('#market-search').on('input propertychange',function(e){
        var thisTarget = $(e.target);
        var key = thisTarget.val()
        var textDom = $('#btcList .symbolListIconParent')
        var btcList = $('#bitcny .symbolListIconParent')
        var collection = $('.collection .symbolListIconParent')
        !textDom && (textDom = [{}]);
        !btcList && (btcList = [{}]);
        !collection && (collection = [{}]);
        textDom =  Array.prototype.slice.call(textDom,0);
        btcList =  Array.prototype.slice.call(btcList,0);
        collection =  Array.prototype.slice.call(collection,0);
        var list = textDom .concat(btcList,collection)
        setSearchHide(list,key)
    })

    var flag = true;

    $('#sortName').on('click',function(){
        sort($('#btcList'),null,0)
        var self = this;
        remoClassSort(self)
        flag = !flag
    })
    $('#sortPrice').on('click',function(){
        var number = 1;
        sort($('#btcList'),number,1)
        var self = this;
        remoClassSort(self)
        flag = !flag
    })
    $('#sortPriceChange').on('click',function(){
        var number = 1;
        sort($('#btcList'),number,2)
        var self = this;
        remoClassSort(self)
        flag = !flag
    })
    $('#sortVolume').on('click',function(){
        var number = 1;
        sort($('#btcList'),number,5)
        var self = this;
        remoClassSort(self)
        flag = !flag
    })
    function remoClassSort(self){
        $(self).siblings().find('i').removeClass('asc').removeClass('desc')
        if(flag){
            $(self).find('i').removeClass('asc').addClass('desc')
        }else {
            $(self).find('i').addClass('asc').removeClass('desc')
        }
    }
    function sort(obj,number,num){
        var $trs = obj.children('tr');
        if(number){
            if(flag) {
                $trs.sort(function(a,b){
                    var valveNumOfa = $(a).find('td:eq('+num+')').text();
                    var valveNumOfb = $(b).find('td:eq('+num+')').text();
                    if( parseFloat(valveNumOfa) <parseFloat(valveNumOfb) ) return -1;
                    else return 1;
                });
            }else {
                $trs.sort(function(a,b){
                    var valveNumOfa = $(a).find('td:eq('+num+')').text();
                    var valveNumOfb = $(b).find('td:eq('+num+')').text();
                    if( parseFloat(valveNumOfa) >parseFloat(valveNumOfb) ) return -1;
                    else return 1;
                });
            }
        }else {
            if(flag) {
                $trs.sort(function(a,b){
                    var valveNumOfa = $(a).find('td:eq('+num+')').text();
                    var valveNumOfb = $(b).find('td:eq('+num+')').text();
                    if(valveNumOfa < valveNumOfb) return -1;
                    else return 1;
                });
            }else {
                $trs.sort(function(a,b){
                    var valveNumOfa = $(a).find('td:eq('+num+')').text();
                    var valveNumOfb = $(b).find('td:eq('+num+')').text();
                    if(valveNumOfa > valveNumOfb) return -1;
                    else return 1;
                });
            }
        }
        obj.append($trs)

    }

})
//写个方法 数组 搜索值
function setSearchHide(list,key) {
    var key = key.toUpperCase();
    for (var i = list.length - 1; i >= 0; i--) {
        var text = $(list[i]).text()
        if(text.indexOf(key)=== -1)
        {
            $(list[i]).parents('tr').hide()
        }else {
            $(list[i]).parents('tr').show()
        }
    }
}

