function BrowserType() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器
    var isEdge = userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1 && !isIE; //判断是否IE的Edge浏览器

    if (isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if (fIEVersion < 10) {
            alert("浏览器版本过低，请升级或更换浏览器（谷歌、火狐等）")
            return false;
        } //IE版本过低
    }
    if (isEdge) {
        alert("浏览器版本过低，请升级或更换浏览器（谷歌、火狐等）")
        return false;
    }
}
BrowserType() // 浏览器是否为ie



$(function () {
    $(".pc").removeClass("show");
    
    //头部
    head_scroll()

    function head_scroll() {
        if ($(window).scrollTop() > 1) {
            $(".pc").stop().addClass("on");
        } else {
            $(".pc").stop().removeClass("on");
        }
    }
    $(window).scroll(function () {
        head_scroll()
    })

    //搜索
    $(".search-con button").click(function () {
        $(".yc-search").stop().fadeIn();
        $("html").css("overflow", "hidden");
    })
    $(".yc-search-bg").click(function () {
        $(".yc-search").stop().fadeOut();
        $("html").css("overflow-y", "visible");
    })

    // 移动端导航
    $(".menu").click(function () {
        $(".m-nav").animate({
            "right": "0"
        }, 300);
        $(this).hide()
        $(".close-menu").fadeIn();
        $("html").css("overflow", "hidden");
    })
    $(".close-menu").click(function () {
        $(".close-menu").fadeOut()
        $(".m-nav").animate({
            "right": "-100%"
        }, 300);
        $(".menu").fadeIn();
        $("html").css("overflow", "visible");
    })
    $(".m-nav>ul>li>span").click(function () {
        $(this).toggleClass("on").parent().siblings("li").find("span").removeClass("on")
        $(this).siblings("ul").slideToggle().parent().siblings("li").find("ul").slideUp()
    })


    //  移动端导航 二级导航展开关闭 
            $(".leftNav div h2 span").click(function () {
                $(this).toggleClass("on");
                $(".leftNav>ul").stop().slideToggle();
            })

 
            // 二级页面 移动端左侧三级导航 展示
            var docWidth = $(document).width();
            if (docWidth < 1025) {
                
                $(document).on("click",".leftNav>ul>li>span",function(){
                    $(this).parent().stop().toggleClass("on").siblings("li").removeClass("on");
                    $(this).siblings("ul").stop().slideToggle(300).parent().siblings().find("ul").stop().slideUp();
                })
            }

})