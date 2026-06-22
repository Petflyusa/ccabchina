$(function () {
	

var _ww = $(window).width();
        if (_ww > 1024) { 
    //banner
        $('.banner').slick(
                {
                        autoplay: true,
                        dots: false,
                        arrows: false,
                        slidesToShow: 1,
                        autoplaySpeed: 6000,
                        pauseOnHover: false,
                        speed: 1000,
                        cssEase: 'linear',
                        lazyLoad: 'ondemand',
                        customPaging: function (slider, i) {
                                return '<button>' + 0 + (i + 1) + '</button>' + '<span></span>';
                        }
                });
        $('.banner').slick('slickGoTo', 0);
        $('.banner .slick-current').addClass('img_scale');
        $('.banner').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                $('.banner .slick-current').removeClass('img_scale');
        })
        $('.banner').on('afterChange', function (event, slick, currentSlide) {
                $('.banner .slick-current').addClass('img_scale');
        });
        var slickFun = function (e) {
            $('.banner').slick('slickPause');
            if ($(this).find('.slick-current video').length > 0) {
                var $slide = this;
                $(this).find('video').each(function () {
                    this.pause();
                });
                $(this).find('.slick-current video')[0].play();
                $(this).find('.slick-current video').on('ended', function () {
                    $($slide).slick('slickNext');
                });
            } else {
                $(this).slick('slickPlay');
            }
        }
        $('.banner').on('afterChange', slickFun);
        $('.banner').each(slickFun);
        } else {
                for (var i = 0; i < $(".banner>div").length; i++) {
            if ($(".banner>div").eq(i).find("video").length > 0) {
                $(".banner>div").eq(i).remove();
            }
                }
                
                $('.banner').slick(
                {
                        autoplay: true,
                        dots: false,
                        arrows: false,
                        slidesToShow: 1,
                        autoplaySpeed: 6000,
                        pauseOnHover: false,
                        speed: 1000,
                        cssEase: 'linear',
                        lazyLoad: 'ondemand',
                        customPaging: function (slider, i) {
                                return '<button>' + 0 + (i + 1) + '</button>' + '<span></span>';
                        }
                        });
                $('.banner').slick('slickGoTo', 0);
        $('.banner .slick-current').addClass('img_scale');
        $('.banner').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                $('.banner .slick-current').removeClass('img_scale');
        })
        $('.banner').on('afterChange', function (event, slick, currentSlide) {
                $('.banner .slick-current').addClass('img_scale');
        });
            
        }




//ban_tz
$('.ban_tz>dl').slick({
 autoplay:true,
dots:false,
arrows:false,
vertical:true,
})



	// 焦点图
	$('.s1-l>ul').slick({
		// autoplay: true,
		dots: true,
		arrows: false,
	});
	$('.s1-r>ul').slick({
		// autoplay: true,
		dots: true,
		arrows: false,
	});
	$('.s4-r>ul').slick({
		// autoplay: true,
		dots: true,
		arrows: false,
	});


	var docWidth = $(document).width();
	if (docWidth > 1024) {
		$(".s2-c ul li").mouseenter(function () {
			$(this).addClass("on").siblings().removeClass("on");
		});
	} else {
		$(".s2-c ul li").removeClass("on");
	};

	// 侧栏导航
	$(window).scroll(function () {
		//获取窗口的滚动条的垂直位置
		var h = $(window).height() / 3;
		var s = $(window).scrollTop();
		//当窗口的滚动条的垂直位置大于页面的最小高度时，让返回顶部元素渐现，否则渐隐
		if (s > h) {
			$("#asideNav").show();
		} else {
			$("#asideNav").hide();
		};
	});

	/*回到顶部*/
	$('.goTop').click(function () {

		$('body,html').stop().animate({ scrollTop: 0 });

		return false;

	});



});