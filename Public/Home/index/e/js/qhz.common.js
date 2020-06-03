
(function ($) {
    $.fn.extend({
        "iePlaceholder": function (options) {
            options = $.extend({
                placeholderColor: '#999',
                isUseSpan: true,
                onInput: true
            }, options);

            $(this).each(function () {
                var _this = this;
                var supportPlaceholder = 'placeholder' in document.createElement('input');
                if (!supportPlaceholder) {
                    var defaultValue = $(_this).attr('placeholder');
                    var defaultColor = $(_this).css('color');
                    if (options.isUseSpan == false) {
                        $(_this).focus(function () {
                            var pattern = new RegExp("^" + defaultValue + "$|^$");
                            pattern.test($(_this).val()) && $(_this).val('').css('color', defaultColor);
                        }).blur(function () {
                            if ($(_this).val() == defaultValue) {
                                $(_this).css('color', defaultColor);
                            } else if ($(_this).val().length == 0) {
                                $(_this).val(defaultValue).css('color', options.placeholderColor)
                            }
                        }).trigger('blur');
                    } else {
                        var $imitate = $('<span class="wrap-placeholder" style="position:absolute; height: 40px!important; display:inline-block; overflow:hidden; color:' + options.placeholderColor + '; width:' + $(_this).width() + 'px; ">' + (defaultValue == undefined ? "" : defaultValue) + '</span>');

                        $imitate.css({
                            'margin-left': $(_this).css('margin-left'),
                            'margin-top': $(_this).css('margin-top'),
                            'text-align': 'left',
                            'font-size': $(_this).css('font-size'),
                            'font-family': $(_this).css('font-family'),
                            'font-weight': $(_this).css('font-weight'),
                            'padding-left': parseInt($(_this).css('padding-left')) + 2 + 'px',
                            'line-height': _this.nodeName.toLowerCase() == 'textarea' ? $(_this).css('line-weight') : $(_this).outerHeight() + 'px',
                            'padding-top': _this.nodeName.toLowerCase() == 'textarea' ? parseInt($(_this).css('padding-top')) + 2 : 0
                        });
                        $(_this).before($imitate.click(function () {
                            $(_this).trigger('focus');
                        }));

                        $(_this).val().length != 0 && $imitate.hide();

                        if (options.onInput) {
                            var inputChangeEvent = typeof (_this.oninput) == 'object' ? 'input' : 'propertychange';
                            $(_this).bind(inputChangeEvent, function () {
                                $imitate[0].style.display = $(_this).val().length != 0 ? 'none' : 'inline-block';
                            });
                        } else {
                            $(_this).focus(function () {
                                $imitate.hide();
                            }).blur(function () {
                                /^$/.test($(_this).val()) && $imitate.show();
                            });
                        }
                    }
                }
            });
            return this;
        }
    });
})(jQuery);
var qhz = qhz || {};
qhz.ua = {
    ie6: !-[1] && !window.XMLHttpRequest,
    ie678: !-[1]
}, $.fn.goToTop = function (obj) {
    var defaultObj = {
        fn: function () {
        },
        "static": !1,
        ele: document.body.scrollTop ? $(document.body) : $(document.documentElement),
        eletop: 0
    },
            options = $.extend({}, obj, defaultObj);
    $(this).click(function () {
        options.ele = document.body.scrollTop ? $(document.body) : $(document.documentElement),
                options.ele.animate({scrollTop: 0},
                        {
                            easing: "swing",
                            duration: 600,
                            complete: function () {
                                options.static = !1;
                            },
                            step: function (num) {
                                options.static = !0,
                                        options.eletop = num
                            }
                        }),
                options.fn()
    }),
            $(window).scroll(function () {
        1 == options.static && options.ele.scrollTop() > options.eletop && options.ele.stop();
    })
}, $.fn.showTime = function (time_distance) {
    var timer = this;
    if (isNaN(time_distance)) {
        time_distance = timer.attr("distance");
    }
    this.distance = time_distance || 0;
    var str_time;
    var int_day, int_hour, int_minute, int_second;
    var distance = this.distance;
    this.distance = this.distance - 1000;
    if (distance > 0) {
        int_day = Math.floor(distance / 86400000);
        distance -= int_day * 86400000;
        int_hour = Math.floor(distance / 3600000);
        distance -= int_hour * 3600000;
        int_minute = Math.floor(distance / 60000);
        distance -= int_minute * 60000;
        int_second = Math.floor(distance / 1000);
        if (int_hour < 10)
            int_hour = "0" + int_hour;
        if (int_minute < 10)
            int_minute = "0" + int_minute;
        if (int_second < 10)
            int_second = "0" + int_second;
        str_time = int_day + "天" + int_hour + "小时" + int_minute + "分钟" + int_second + "秒";
        timer.text(str_time);
        setTimeout(function () {
            timer.showTime(timer.distance);
        }, 1000);
    } else if (distance == -1000) {
        timer.text("项目未开始");
        return;
    } else {
        timer.text("项目已结束");
        return;
    }
}, qhz.riskTip = function () {
    $("#riskTip").hover(function () {
        $(".moquu_risk").show("linear").animate({opacity: "1"},
                {
                    duration: 500,
                    queue: !1,
                    specialEasing: {
                        marginLeft: "easeOutCubic"
                    }
                }),
                $(this).addClass("cur"),
                qhz.ua.ie6 && $(".moquu_risk").show()
    }, function () {
        $(".moquu_risk").hide().animate({opacity: "0"},
                {
                    duration: 500,
                    queue: !1,
                    specialEasing: {
                        marginLeft: "easeOutCubic"
                    }
                }),
                qhz.ua.ie6 && $(".moquu_risk").hide()
    });
}, qhz.kefu = function () {
    $("#pinglun").click(function () {

    });
}, qhz.weiXin = function () {
    $("#xiangguan").hover(function () {
        $(".moquu_wxinh").show("linear").animate({opacity: "1"},
                {
                    duration: 500,
                    queue: !1,
                    specialEasing: {
                        marginLeft: "easeOutCubic"
                    }
                }),
                $(this).addClass("cur"),
                qhz.ua.ie6 && $(".moquu_wxinh").show()
    }, function () {
        $(".moquu_wxinh").hide().animate({opacity: "0"},
                {
                    duration: 500,
                    queue: !1,
                    specialEasing: {
                        marginLeft: "easeOutCubic"
                    }
                }),
                qhz.ua.ie6 && $(".moquu_wxinh").hide()
    });
}, qhz.qianzhu = function () {
    $("#yyqz").hover(function () {
        $(".moquu_qzy").show("linear").animate({opacity: "1"},
                {
                    duration: 500,
                    queue: !1,
                    specialEasing: {
                        marginLeft: "easeOutCubic"
                    }
                }),
                $(this).addClass("cur"),
                qhz.ua.ie6 && $(".moquu_qzy").show()
    }, function () {
        $(".moquu_qzy").hide().animate({opacity: "0"},
                {
                    duration: 500,
                    queue: !1,
                    specialEasing: {
                        marginLeft: "easeOutCubic"
                    }
                }),
                qhz.ua.ie6 && $(".moquu_qzy").hide()
    });
}, qhz.topheader = function () {
    $(window).scroll(function () {
        var header = $('#fh5co-header'),
                scrlTop = $(this).scrollTop();
        if (scrlTop > 41) {
            header.addClass('navbar-fixed-top');
        } else {
            if (header.hasClass('navbar-fixed-top')) {
                header.removeClass('navbar-fixed-top');
            }
        }
    });
}, qhz.feedback = function () {
    var toolbars_goback = $(".back-to-top"),
            toolBarFun = function (arg) {
                var top = document.body.scrollTop || document.documentElement.scrollTop;
                top >= arg ? toolbars_goback.fadeIn(200) : toolbars_goback.fadeOut(200)
            },
            init = function () {
                toolBarFun(180);
            };
    $(window).scroll(function () {
        init()
    }),
            toolbars_goback.goToTop(),
            init()
}, qhz.headerico = function () {
    //头部图标
    $(".hover-weixin").hover(function () {
        $(this).find(".popover").show();
    }, function () {
        $(this).find(".popover").hide();
    });
    $(".hover-qq").hover(function () {
        $(this).find(".popover").show();
    }, function () {
        $(this).find(".popover").hide();
    });
}, qhz.loginsuccess = function (data) {
    if (data && data.ticketInfo != false) {
        $("#showSendTicket").show();
        $("#jxTicket").text(data.ticketInfo || "一张卡券");
        setTimeout(function () {
            $("#showSendTicket").hide();
            if (data.url && data.url != false && data.url != "") {
                window.location.href = data.url;
            } else {
                window.location.href = "/Account/index.html";
            }
        }, 3000);
    } else {
        if (data && data != false && data.url && data.url != false && data.url != "") {
            window.location.href = data.url;
        } else {
            var path = window.location.pathname;
            if (path.length > 3) {
                window.location.reload();
            } else {
                window.location.href = "/Account/index.html";
            }
        }
    }
}, qhz.headloginajax = function () {
    var emp = new Object();
    emp.password = $('#headPassword').encrypt($("#headimgCode").val());
    emp.phone = $("#headPhone").val();
    emp.verifyCode = $("#headimgCode").val();
    $.ajax({
        type: "post",
        url: "/User/loginHeadUser",
        data: {'Par': emp},
        dataType: "json",
        beforeSend: function () {
            $("#butheadLogin").attr('disabled', "true");
        },
        success: function (context, textStatus) {
            if (context.status == 1) {
                qhz.loginsuccess(context.data);
            } else {
                $('#CaptchaImageHead').attr('src', '/Common/captchaImage/' + Math.random());
                $("#butheadLogin").removeAttr("disabled");
                var $msg = '<div class="login_failure"><i class="icon"></i>' + context.msg + '</div>';
                $(".errorUnderDialog").html($msg);
            }
        },
        complete: function (XMLHttpRequest, textStatus) {
            $("#butheadLogin").removeAttr("disabled");
        },
        error: function () {
            $("#butheadLogin").removeAttr("disabled");
        }
    });
},
qhz.headSmsloginajax = function () {
    var emp = new Object();
    emp.phone = $("#headSmsPhone").val(); 
    emp.smsCode = $("#txtphoneCode").val();
    $.ajax({
        type: "post",
        url: "/User/smsLogin",
        data: {'Par': emp},
        dataType: "json",
        beforeSend: function () {
            $("#butheadSmsLogin").attr('disabled', "true");
        },
        success: function (context, textStatus) {
            if (context.status == 1) {
                qhz.loginsuccess(context.data);
            } else {
                $('#CaptchaSmsImageHead').attr('src', '/Common/captchaImage/' + Math.random());
                $("#headSmsPhone").removeAttr("disabled");
                var $msg = '<div class="login_failure"><i class="icon"></i>' + context.msg + '</div>';
                $(".errorUnderDialog").html($msg);
            }
        },
        complete: function (XMLHttpRequest, textStatus) {
            $("#butheadSmsLogin").removeAttr("disabled");
        },
        error: function () {
            $("#butheadSmsLogin").removeAttr("disabled");
        }
    });
},qhz.sendCode = function () {
    var data = {};
    data.phone = $("#headSmsPhone").val();
    data.code = $("#headSmsimgCode").val();
    var emp = new Object();
    emp.phone = $("#headSmsPhone").val(); 
    emp.smsCode = $("#txtphoneCode").val();
    $.ajax({
        type: "post",
        url: "/User/loginPhoneCode/",
        data: {'par': data},
        dataType: "json",
        success: function (data) {
           if (data.status == 1) {
             qhz.jstimer(120);
            } else {
                $("#CaptchaSmsImageHead").attr("src", '/Common/captchaImage/' + Math.random());
                layer.alert(data.msg);
            }
        },
        complete: function () {
            $("#butheadSmsLogin").removeAttr("disabled");
        },
        error: function () {
            $("#butheadSmsLogin").removeAttr("disabled");
        }
    });
},qhz.jstimer=function(step){
  step = step <= 120 && step >= 0 ? step : 120;
    $(".butSmsPhone").val(step-- + " S").attr("disabled", true);
    if (step < 0) {
        $(".butSmsPhone").val("免费获取").removeAttr("disabled");
    } else {
        window.setTimeout("qhz.jstimer(" + step + ")", 1000);
    }
}
  qhz.headerlogin = function () {
    $('.theme-popover').fadeOut();
    //弹出登录框
    $('.theme-login').click(function () {
        $("#CaptchaImageHead").click();
        $('.theme-popover-mask').fadeIn(100);
        $('.theme-popover').fadeIn(100);
    });
    $('.theme-poptit .close').click(function () {
        $('.theme-popover').fadeOut(100);
        $('.theme-popover-mask').fadeOut(100);
        $("input[type=reset]").trigger("click");
    });

    $("#headName").focus(function () {
        $(".errorUnderDialog").html("");
    });
    $("#headPassword").focus(function () {
        $(".errorUnderDialog").html("");
    });
    $("#headimgCode").focus(function () {
        $(".errorUnderDialog").html("");
    });

    $("#butSmsPhone").click(function() {
     var checkPhone = $("#headSmsPhone").valid();
     var checkCode = $("#headSmsimgCode").valid();
     if (checkPhone && checkCode) {
         qhz.sendCode();
     }
    });

    $("#butheadLogin").click(function () {
        var isOK = $("#login_headform").valid();
        if (isOK) {
            qhz.headloginajax();
        }
    });
    $("#login_headform").keydown(function (event) {
        var e = event || window.event;
        var k = e.keyCode || e.which;
        if (k == 13) {
            $("#butheadLogin").click();
        }
    });
    $("input[type=reset]").click(function () {
        validator.resetForm();
    });
     $("#butheadSmsLogin").click(function () {
        var isOK = $("#login_smsheadform").valid();
        if (isOK) {
            qhz.headSmsloginajax();
        }
    }); 
    $("#login_smsheadform").keydown(function (event) {
        var e = event || window.event;
        var k = e.keyCode || e.which;
        if (k == 13) {
            $("#butheadSmsLogin").click();
        }
    });
    $(".loginType").click(function() {
        var type = $(this).attr("data");
        if (parseInt(type) * 1 == 1) {
            $("#CaptchaSmsImageHead").attr("src", '/Common/captchaImage/' + Math.random());
            $("#loginType").val("2");
            $("#accountLogin").hide();
            $("#smsLogin").show();
        } else {
            $("#CaptchaImageHead").attr("src", '/Common/captchaImage/' + Math.random());
            $("#loginType").val("1");
            $("#smsLogin").hide();
            $("#accountLogin").show();
        }
    });
    
}, qhz.showlogin = function () {
    $('.theme-popover-mask').fadeIn(100);
    $('.theme-popover').fadeIn(100);
}, qhz.init = function () {
    this.topheader(),
            this.feedback(),
            this.riskTip(),
            this.kefu(),
            this.weiXin(),
            this.qianzhu(),
            this.headerico(),
            this.headerlogin()
}, $(function () {
    qhz.init();
    /*调用方式： textarea需要田间onInput=false属性*/
    $('input[placeholder], textarea[placeholder]').each(function () {
        $(this).is('input') ? $(this).iePlaceholder() : $(this).iePlaceholder({onInput: false});
    });
});
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD (Register as an anonymous module)
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            // If we can't parse the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
            return config.json ? JSON.parse(s) : s;
        } catch (e) {
        }
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }

    var config = $.cookie = function (key, value, options) {

        // Write

        if (arguments.length > 1 && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setMilliseconds(t.getMilliseconds() + days * 864e+5);
            }

            return (document.cookie = [
                encode(key), '=', stringifyCookieValue(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        // Read

        var result = key ? undefined : {},
                // To prevent the for loop in the first place assign an empty array
                // in case there are no cookies at all. Also prevents odd result when
                // calling $.cookie().
                cookies = document.cookie ? document.cookie.split('; ') : [],
                i = 0,
                l = cookies.length;

        for (; i < l; i++) {
            var parts = cookies[i].split('='),
                    name = decode(parts.shift()),
                    cookie = parts.join('=');

            if (key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }

            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }

        return result;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        // Must not alter options, thus extending a fresh object...
        $.cookie(key, '', $.extend({}, options, {expires: -1}));
        return !$.cookie(key);
    };

}));
