(function(){(function(a,b){if(typeof define==="function"&&define.amd){return define(function(){return b()})}else{if(typeof exports==="object"){return module.exports=b()}else{return a.ifvisible=b()}}})(this,function(){var f,j,l,m,i,a,h,b,d,n,c,e,g,k;d={};l=document;c=false;e="active";h=60000;a=false;j=(function(){var q,o,t,s,p,r,u;q=function(){return(((1+Math.random())*65536)|0).toString(16).substring(1)};p=function(){return q()+q()+"-"+q()+"-"+q()+"-"+q()+"-"+q()+q()+q()};r={};t="__ceGUID";o=function(w,v,x){w[t]=undefined;if(!w[t]){w[t]="ifvisible.object.event.identifier"}if(!r[w[t]]){r[w[t]]={}}if(!r[w[t]][v]){r[w[t]][v]=[]}return r[w[t]][v].push(x)};s=function(C,B,w){var A,x,v,z,y;if(C[t]&&r[C[t]]&&r[C[t]][B]){z=r[C[t]][B];y=[];for(x=0,v=z.length;x<v;x++){A=z[x];y.push(A(w||{}))}return y}};u=function(B,A,C){var w,y,x,v,z;if(C){if(B[t]&&r[B[t]]&&r[B[t]][A]){z=r[B[t]][A];for(y=x=0,v=z.length;x<v;y=++x){w=z[y];if(w===C){r[B[t]][A].splice(y,1);return w}}}}else{if(B[t]&&r[B[t]]&&r[B[t]][A]){return delete r[B[t]][A]}}};return{add:o,remove:u,fire:s}})();f=(function(){var o;o=false;return function(q,r,p){if(!o){if(q.addEventListener){o=function(t,u,s){return t.addEventListener(u,s,false)}}else{if(q.attachEvent){o=function(t,u,s){return t.attachEvent("on"+u,s,false)}}else{o=function(t,u,s){return t["on"+u]=s}}}}return o(q,r,p)}})();m=function(p,q){var o;if(l.createEventObject){return p.fireEvent("on"+q,o)}else{o=l.createEvent("HTMLEvents");o.initEvent(q,true,true);return !p.dispatchEvent(o)}};b=(function(){var r,o,s,q,p;q=void 0;p=3;s=l.createElement("div");r=s.getElementsByTagName("i");o=function(){return(s.innerHTML="<!--[if gt IE "+(++p)+"]><i></i><![endif]-->",r[0])};while(o()){continue}if(p>4){return p}else{return q}})();i=false;k=void 0;if(typeof l.hidden!=="undefined"){i="hidden";k="visibilitychange"}else{if(typeof l.mozHidden!=="undefined"){i="mozHidden";k="mozvisibilitychange"}else{if(typeof l.msHidden!=="undefined"){i="msHidden";k="msvisibilitychange"}else{if(typeof l.webkitHidden!=="undefined"){i="webkitHidden";k="webkitvisibilitychange"}}}}g=function(){var p,o;p=[];o=function(){p.map(clearTimeout);if(e!=="active"){d.wakeup()}a=+(new Date());return p.push(setTimeout(function(){if(e==="active"){return d.idle()}},h))};o();f(l,"mousemove",o);f(l,"keyup",o);f(l,"touchstart",o);f(window,"scroll",o);d.focus(o);return d.wakeup(o)};n=function(){var o;if(c){return true}if(i===false){o="blur";if(b<9){o="focusout"}f(window,o,function(){return d.blur()});f(window,"focus",function(){return d.focus()})}else{f(l,k,function(){if(l[i]){return d.blur()}else{return d.focus()}},false)}c=true;return g()};d={setIdleDuration:function(o){return h=o*1000},getIdleDuration:function(){return h},getIdleInfo:function(){var o,p;o=+(new Date());p={};if(e==="idle"){p.isIdle=true;p.idleFor=o-a;p.timeLeft=0;p.timeLeftPer=100}else{p.isIdle=false;p.idleFor=o-a;p.timeLeft=(a+h)-o;p.timeLeftPer=(100-(p.timeLeft*100/h)).toFixed(2)}return p},focus:function(o){if(typeof o==="function"){this.on("focus",o)}else{e="active";j.fire(this,"focus");j.fire(this,"wakeup");j.fire(this,"statusChanged",{status:e})}return this},blur:function(o){if(typeof o==="function"){this.on("blur",o)}else{e="hidden";j.fire(this,"blur");j.fire(this,"idle");j.fire(this,"statusChanged",{status:e})}return this},idle:function(o){if(typeof o==="function"){this.on("idle",o)}else{e="idle";j.fire(this,"idle");j.fire(this,"statusChanged",{status:e})}return this},wakeup:function(o){if(typeof o==="function"){this.on("wakeup",o)}else{e="active";j.fire(this,"wakeup");j.fire(this,"statusChanged",{status:e})}return this},on:function(o,p){n();j.add(this,o,p);return this},off:function(o,p){n();j.remove(this,o,p);return this},onEvery:function(q,r){var p,o;n();p=false;if(r){o=setInterval(function(){if(e==="active"&&p===false){return r()}},q*1000)}return{stop:function(){return clearInterval(o)},pause:function(){return p=true},resume:function(){return p=false},code:o,callback:r}},now:function(o){n();return e===(o||"active")}};return d})}).call(this);