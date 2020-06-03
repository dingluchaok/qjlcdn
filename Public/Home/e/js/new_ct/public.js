
    function cancelBubble(e) {
        var evt = e ? e : window.event;
        if (evt.stopPropagation) {        //W3C
            evt.stopPropagation();
        }else {       //IE
            evt.cancelBubble = true;
        }
    }
	function setSave(e,obj){
        cancelBubble()
        if( $(obj).parent().parent().index() % 2 == 0){
            $(obj).toggleClass('save4')
        }else {
            $(obj).toggleClass('save3')
        }
        //,'------------基数是深色save3 偶素是浅色-save4')
        if($(obj).hasClass('save1')){
            $.ajax({
                type : 'post',
                url : base+'/api/collection',
                data: 'symbolName='+e,
                success:function (datas){
                    if(datas.code == 0){
                        if($(obj).hasClass('save3')){
                            $(obj).removeClass('save3')
                        }
                        if($(obj).hasClass('save4')){
                            $(obj).removeClass('save4')
                        }
                        $(obj).toggleClass('save1')
                        $(obj).toggleClass('save2')
                    }else if(datas.code == 3){
                        // myalert("请登录","","<@spring.message code='common.friendly.reminder'/>","<@spring.message code='common.confirm'/>");
                    }
                },
                error: function(e) {
                    myalert(e.msg,"","<@spring.message code='common.friendly.reminder'/>","<@spring.message code='common.confirm'/>");
                }
            })
        }else if($(obj).hasClass('save2')){
            $.ajax({
                type : 'delete',
                url : base+'/api/collection?symbolName='+e,
                success:function (datas){
                    if(datas.code == 0){//解除绑定的时候
                        if($(obj).hasClass('save3')){
                            $(obj).removeClass('save3')
                        }
                        if($(obj).hasClass('save4')){
    