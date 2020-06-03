		$('.containt .news .news-img .more').hover(function(){
			
			$(this).attr('src','images/more.png');
		},function(){
			$(this).attr('src','images/graymore.png')
		})
		
		
		//边框效果--移入
		function biankuang(obj){
		    $(obj).find('.biankuang_1').stop(true).animate({height:'297px'},300)
		    $(obj).find('.biankuang_2').stop(true).delay(300).animate({width:'242px'},300)
		    $(obj).find('.biankuang_3').stop(true).animate({ height:'297px'},300)
		    $(obj).find('.biankuang_4').stop(true).delay(300).animate({width:'242px'},300)
		}
		//边框效果--移出
		function biankuang1(obj){
		
		    $(obj).find('.biankuang_1').stop(true).delay(100).animate({height:'0px'},100)
		    $(obj).find('.biankuang_2').stop(true).animate({width:'0px'},100)
		    $(obj).find('.biankuang_3').stop(true).delay(100).animate({height:'0px'},100)
		    $(obj).find('.biankuang_4').stop(true).animate({width:'0px'},100)
		}
		//触发
		$('.containt .pingtai .box').hover(
			function () {
			  var obj = $(this);
				biankuang(obj);
			},
			function () {
			  var obj = $(this);
				biankuang1(obj);
			}
		); 
		$('.containt .layui-tab-title li').on('click',function(){
			$(this).addClass('on').siblings().removeClass('on');
			
		})
