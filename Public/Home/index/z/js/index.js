function CurrencyFormatted(e){var f,d=parseFloat(e);return isNaN(d)&&(d=0),f="",0>d&&(f="-"),d=Math.abs(d),d=parseInt(100*(d+0.005)),d/=100,s=new String(d),s.indexOf(".")<0&&(s+=".00"),s.indexOf(".")==s.length-2&&(s+="0"),s=f+s}$(function(){zb.index.init(),$("body").bind("keyup",function(b){"13"==b.keyCode&&$("#doLogins").trigger("click")})}),zb.index={init:function(){zb.user.isLogin()&&($("#login-reg").hide(),$("#enter-admin").show(),$("#myLoginUserName").text($.cookie(zb.cookiKeys.uname)),zb.user.balance())},doLogin:function(){var b=this.formToStr();null!=b&&$.getJSON(zb.vipDomain+"/user/doLogin?callback=?",b,function(d){var c=d.des;d.isSuc?Redirect(c):"验证码错误，请重新输入。"==c||c.indexOf("手机")>=0?Redirect(zb.vipDomain+"/user/login"):Alert(c)})},formToStr:function(){var b="";return $("#nick").val().length<2||$("#nick").val().length>50||"用户名/邮箱"==$("#nick").val()?($("#nick").focus(),null):(b+="&nike="+encodeURIComponent($("#nick").val()),$("#pwd").val().length<6||$("#pwd").val().length>50||"请输入密码"==$("#pwd").val()?($("#pwd").focus(),null):(b+="&pwd="+encodeURIComponent($("#pwd").val()),b+="&remember="+encodeURIComponent($("#remember").val()),b.substring(1,b.length)))},tofocus:function(b){$("#"+b).focus(),Close()},errorTo:function(b){zb.form.error=b}};function myBrowser(){var b=navigator.userAgent;var a=b.indexOf("Opera")>-1;if(a){return"Opera"}if(b.indexOf("Firefox")>-1){return"FF"}if(b.indexOf("Chrome")>-1){return"Chrome"}if(b.indexOf("Safari")>-1){return"Safari"}if(b.indexOf("compatible")>-1&&b.indexOf("MSIE")>-1&&!a){return"IE"}}var mb=myBrowser();var canvas,ctx,width,height,size,lines,tick;function line(){this.path=[];this.speed=rand(10,20);this.count=randInt(10,30);this.x=width/2,+1;this.y=height/2+1;this.target={x:width/2,y:height/2};this.dist=0;this.angle=0;this.hue=tick/5;this.life=1;this.updateAngle();this.updateDist()}line.prototype.step=function(a){this.x+=Math.cos(this.angle)*this.speed;this.y+=Math.sin(this.angle)*this.speed;this.updateDist();if(this.dist<this.speed){this.x=this.target.x;this.y=this.target.y;this.changeTarget()}this.path.push({x:this.x,y:this.y});if(this.path.length>this.count){this.path.shift()}this.life-=0.001;if(this.life<=0){this.path=null;lines.splice(a,1)}};line.prototype.updateDist=function(){var b=this.target.x-this.x,a=this.target.y-this.y;this.dist=Math.sqrt(b*b+a*a)};line.prototype.updateAngle=function(){var b=this.target.x-this.x,a=this.target.y-this.y;this.angle=Math.atan2(a,b)};line.prototype.changeTarget=function(){var a=randInt(0,3);switch(a){case 0:this.target.y=this.y-size;break;case 1:this.target.x=this.x+size;break;case 2:this.target.y=this.y+size;break;case 3:this.target.x=this.x-size}this.updateAngle()};line.prototype.draw=function(b){ctx.beginPath();var d=rand(0,10);for(var a=0,c=this.path.length;a<c;a++){ctx[(a===0)?"moveTo":"lineTo"](this.path[a].x+rand(-d,d),this.path[a].y+rand(-d,d))}ctx.strokeStyle="hsla("+rand(this.hue,this.hue+30)+", 80%, 100%, "+(this.life/3)+")";ctx.lineWidth=rand(0.1,2);ctx.stroke()};function rand(b,a){return Math.random()*(a-b)+b}function randInt(b,a){return Math.floor(b+Math.random()*(a-b+1))}function init(){canvas=document.getElementById("canvas-qcash");ctx=canvas.getContext("2d");size=30;lines=[];reset();loop()}function reset(){width=Math.ceil(window.innerWidth/2)*2;height=Math.ceil(window.innerHeight/2)*2;tick=0;lines.length=0;canvas.width=width;canvas.height=height}function create(){if(tick%10===0){lines.push(new line())}}function step(){var a=lines.length;while(a--){lines[a].step(a)}}function clear(){ctx.globalCompositeOperation="destination-out";ctx.fillStyle="hsla(0, 0%, 0%, 0.1";ctx.fillRect(0,0,width,height);ctx.globalCompositeOperation="lighter"}function draw(){ctx.save();ctx.translate(width/2,height/2);ctx.rotate(tick*0.001);var b=0.8+Math.cos(tick*0.02)*0.2;ctx.scale(b,b);ctx.translate(-width/2,-height/2);var a=lines.length;while(a--){lines[a].draw(a)}ctx.restore()}function loop(){requestAnimationFrame(loop);create();step();clear();draw();tick++}function onresize(){reset()}if("FF"==mb||"Chrome"==mb||"Safari"==mb){};