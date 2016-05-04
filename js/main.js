//定义对象
var perkin = {};
perkin.timescroll = null; //挂载整屏切换动画的实例
perkin.currentStep = "step1";
perkin.init = function(){
	perkin.resize();//设置每一屏幕的高度和top值
	perkin.events();//设置事件
	perkin.configIntAnimate(); // 配置导航条的动画
	perkin.button3D(".start",".state1",".state2",0.3);//3D翻转效果
	perkin.button3D(".button1",".state1",".state2",0.3);//3D翻转效果
	perkin.button3D(".button2",".state1",".state2",0.3);//3D翻转效果
	//设置每一屏中img的百分比
	perkin.imgWidth($(".scene img"));   
	perkin.configTimeScroll();//配置整屏切换的动画以及每一屏中的小动画

	twoAnimate.init();  //执行第二屏要执行的动画
	threeAnimate.init();  //执行第三屏要执行的动画
	fiveAnimate.init();  //执行第五屏要执行的动画
};

//初始化
$(document).ready(perkin.init);

//设置事件
perkin.events = function(){


	perkin.nav();  //执行导航条鼠标移入移出的动画

	$(window).bind("scroll",scrollFn);

	function scrollFn() {
		$(window).scrollTop(0);
	}
	//计算滚动条滚动的过程中，计算页面中应该到哪一个时间点上去
	$(window).bind("scroll",perkin.scrollStatus);

	//当mousedown的时候，解除scroll事件对应的scrollFn
	$(window).bind("mousedown",function(){
		$(window).unbind("scroll",scrollFn);
	});
	//当mousedown的时候，让当前这一屏到达某个状态
	$(window).bind("mouseup",perkin.mouseupFn);
	//干掉浏览器默认的滚动行为
	$(".wrapper").bind("mousewheel",function(ev){
		if($(window).width()>780) ev.preventDefault();
	});
	$(".wrapper").one("mousewheel",mousewheelFn);

	var timer = null;
	function mousewheelFn(ev,direction) {
		$(window).unbind("scroll",scrollFn);
		if(direction < 1){  //向下滚动
			// console.log("next");
			perkin.changeStep("next");
		}else{    //向上滚动	
			// console.log("prev");
			perkin.changeStep("prev");
		}
		clearTimeout(timer);
		timer = setTimeout(function(){
			if($(window).width()>780){
			$(".wrapper").one("mousewheel",mousewheelFn);
			}
		},1200);
	}
	$(window).resize(perkin.resize);
};
//当mousedown的时候，让当前这一屏到达某个状态
perkin.mouseupFn = function(){
	//在滚动过程中计算出一个比例
	var scale = perkin.scale();
	//得到当前页面到达的某个时间点
	var times = scale*perkin.timescroll.totalDuration();
	//获取到上一个状态和下一个状态
	var prevStep = perkin.timescroll.getLabelBefore(times);
	var nextStep = perkin.timescroll.getLabelAfter(times);

	//获取到上一个状态的时间和下一个状态的时间
	var prevTime = perkin.timescroll.getLabelTime(prevStep);
	var nextTime = perkin.timescroll.getLabelTime(nextStep);
	//计算差值
	var prevDvalue = Math.abs( prevTime - times);
	var nextDvalue = Math.abs( nextTime - times);

	/*
		如果scale为0
			step1
		如果scale为1
			step5	
		如果var prevDvalue < nextDvalue
			prevStep
		如果var prevDvalue > nextDvalue
			nextStep
	 */
	var step = "";	
	if(scale === 0){
		step = "step1";
	}else if(scale === 1){
		step = ".footer";
	}else if(prevDvalue < nextDvalue){
		step = prevStep;
	}else{
		step = nextStep;
	}
	perkin.timescroll.tweenTo(step);
	//-------------当松开鼠标时候，控制滚动条到达某个状态计算出来的距离-------------------
	//获取动画的总时长
	var totalTime = perkin.timescroll.totalDuration();
	//获取到当前要到达的时间
	var afterTime = perkin.timescroll.getLabelTime(step);
	//获取到滚动条能够滚动的最大的高度
	var maxH = $("body").height() - $(window).height();
	//计算出滚动条滚动的距离
	var positionY = afterTime/totalTime * maxH;
	//滚动条滚动的距离的持续时间
	var d = Math.abs(perkin.timescroll.time() - afterTime);
	var scrollAnimate = new TimelineMax();
	scrollAnimate.to("html,body",d,{scrollTop:positionY});
	perkin.currentStep = step;
};

//计算滚动条在滚动过程中的比例
perkin.scale = function() {
	var scrollT = $(window).scrollTop();
	var MaxH = $("body").height() - $(window).height();
	var s = scrollT/MaxH;
	return s;
};
//计算滚动条滚动的过程中，计算页面中应该到哪一个时间点上去
perkin.scrollStatus = function() {
	var times = perkin.scale() * perkin.timescroll.totalDuration();
	//当滚动条在滚动的过程中，让页面中的动画到达某个时间点
	perkin.timescroll.seek(times,false);
};
//切换整屏并且计算滚动条的距离
perkin.changeStep = function(value){
	if(value === "next"){//向下切换
		//获取当前的时间
		var currentTime = perkin.timescroll.getLabelTime(perkin.currentStep);

		//获取到下一个状态的字符串
		var afterStep = perkin.timescroll.getLabelAfter(currentTime);
		if( !afterStep ) return;

		//获取动画的总时长
		var totalTime = perkin.timescroll.totalDuration();
		//获取到下一个状态的时间
		var afterTime = perkin.timescroll.getLabelTime(afterStep);
		//获取到滚动条能够滚动的最大的高度
		var maxH = $("body").height() - $(window).height();
		//计算出滚动条滚动的距离
		var positionY = afterTime/totalTime * maxH;
		//滚动条滚动的距离的持续时间
		var d = Math.abs(perkin.timescroll.time() - afterTime);
		var scrollAnimate = new TimelineMax();
		scrollAnimate.to("html,body",d,{scrollTop:positionY});

		//运动到下一个状态
		// perkin.timescroll.tweenTo(afterStep);
		//记录当前的状态为下一个状态:方便继续切换到下一个状态上
		perkin.currentStep = afterStep;

	}else{//向上切换
		//获取当前的时间
		var currentTime = perkin.timescroll.getLabelTime(perkin.currentStep);

		//获取到上一个状态的字符串
		var beforeStep = perkin.timescroll.getLabelBefore(currentTime);
		if(!beforeStep)  return;
		//获取动画的总时长
		var totalTime = perkin.timescroll.totalDuration();
		//获取到下一个状态的时间
		var beforeTime = perkin.timescroll.getLabelTime(beforeStep);
		//获取到滚动条能够滚动的最大的高度
		var maxH = $("body").height() - $(window).height();
		//计算出滚动条滚动的距离
		var positionY = beforeTime/totalTime * maxH;
		//滚动条滚动的距离的持续时间
		var d = Math.abs(perkin.timescroll.time() - beforeTime);
		var scrollAnimate = new TimelineMax();
		scrollAnimate.to("html,body",d,{scrollTop:positionY});

		//运动到上一个状态
		// perkin.timescroll.tweenTo(beforeStep);
		//记录当前的状态为上一个状态:方便继续切换到上一个状态上
		perkin.currentStep = beforeStep;

	}
};

//配置整屏切换的动画以及每一屏中的小动画
perkin.configTimeScroll = function(){
	var time = perkin.timescroll?perkin.timescroll.time():0;
	if(perkin.timescroll) perkin.timescroll.clear();
	perkin.timescroll = new TimelineMax();
	//当从第二屏切换到第一屏的时候，让第二屏里面的动画时间点重归为0
	perkin.timescroll.to(".scene1",0,{onReverseComplete:function(){
		twoAnimate.timeline.seek(0,false);
	}});

	perkin.timescroll.to(".footer",0,{top:"100%"});
	perkin.timescroll.add("step1");
	perkin.timescroll.to(".scene2",0.8,{top:0,ease:Cubic.easeInOut});
	perkin.timescroll.to({},0.1,{onComplete:function(){
		menu.changeMenu("menu_state2");   //切换到第二屏调用的函数，同时传入导航条背景颜色变化的class名字
	},onReverseComplete:function(){
		menu.changeMenu("menu_state1");
	}},"-=0.2");
	//当切换到第二屏上的时候，翻转第二屏上的第一个动画
	perkin.timescroll.to({},0,{onComplete:function(){
		twoAnimate.timeline.tweenTo("state1");
	}},"-=0.2");
	perkin.timescroll.add("step2");
	//---主动画中配置第二屏的小动画start---
	perkin.timescroll.to({},0,{onComplete:function(){
		twoAnimate.timeline.tweenTo("state2");
	},onReverseComplete:function(){
		twoAnimate.timeline.tweenTo("state1");
	}});

	perkin.timescroll.to({},0.4,{});
	perkin.timescroll.add("point1");

	perkin.timescroll.to({},0,{onComplete:function(){
		twoAnimate.timeline.tweenTo("state3");
	},onReverseComplete:function(){
		twoAnimate.timeline.tweenTo("state2");
	}});

	perkin.timescroll.to({},0.4,{});
	perkin.timescroll.add("point2");

	perkin.timescroll.to({},0,{onComplete:function(){
		twoAnimate.timeline.tweenTo("state4");
	},onReverseComplete:function(){
		twoAnimate.timeline.tweenTo("state3");
	}});

	perkin.timescroll.to({},0.4,{});
	perkin.timescroll.add("point3");
	//---主动画中配置第二屏的小动画end---
	perkin.timescroll.to(".scene3",0.8,{top:0,ease:Cubic.easeInOut});
	perkin.timescroll.to({},0.1,{onComplete:function(){
		menu.changeMenu("menu_state3");   //切换到第二屏调用的函数，同时传入导航条背景颜色变化的class名字
	},onReverseComplete:function(){
		menu.changeMenu("menu_state2");
	}},"-=0.2");

	perkin.timescroll.to({},0.1,{onComplete:function(){
	threeAnimate.timeline.tweenTo("threeSate1");
	}},"-=0.2");
		perkin.timescroll.add("step3");
   // --- 主动画中配置第三屏的小动画 start

	perkin.timescroll.to({},0,{onComplete:function(){
		threeAnimate.timeline.tweenTo("threeSate2");
	},onReverseComplete:function(){
		threeAnimate.timeline.tweenTo("threeSate1");
	}});

	perkin.timescroll.to({},0.4,{});

	perkin.timescroll.add("threeSate");
	// --- 主动画中配置第三屏的小动画 end
	
	perkin.timescroll.to(".scene4",0.8,{top:0,ease:Cubic.easeInOut});
	
	perkin.timescroll.add("step4");

	//滚动到第五屏的时候，要让第四屏滚出屏幕外
	perkin.timescroll.to(".scene4",0.8,{top:-$(window).height(),ease:Cubic.easeInOut});
	//当可是区域大于950，那么就让导航条隐藏起来
	if($(window).width()>950){
		perkin.timescroll.to(".menu_wrapper",0.8,{top:-110,ease:Cubic.easeInOut},"-=0.8");
	}else{
		$(".menu_wrapper").css("top",0);
	}

	perkin.timescroll.to(".scene5",0.8,{top:0,ease:Cubic.easeInOut,onReverseComplete:function(){
		fiveAnimate.timeline.seek(0,false);
	}},"-=0.8");
	perkin.timescroll.to({},0.1,{onComplete:function(){
		fiveAnimate.timeline.tweenTo("fiveState");
	}},"-=0.2");

	perkin.timescroll.add("step5");
	perkin.timescroll.to(".scene5",0.5,{top:-$(".footer").height(),ease:Cubic.easeInOut});
	perkin.timescroll.to(".footer",0.5,{top:$(window).height()-$(".footer").height(),ease:Cubic.easeInOut},"-=0.5");
	perkin.timescroll.add("footer");
	perkin.timescroll.stop();
	//当改变浏览器的大小时，就让动画走到之前已经到达的时间点
	perkin.timescroll.seek(time);
};

// 配置导航条的动画
perkin.configIntAnimate = function() {
	var initAnimate = new TimelineMax();
	initAnimate.to(".menu",0.5,{opacity:1});
	initAnimate.to(".menu",0.5,{left:22},'-=0.3');
	initAnimate.to(".nav",0.5,{opacity:1});

	//设置首屏的动画
	initAnimate.to(".scene1_logo",0.5,{opacity:1});
	initAnimate.staggerTo(".scene1_1 img",2,{opacity:1,rotationX:0,ease:Elastic.easeOut},'0.2s');
	initAnimate.to(".light_left",0.7,{rotationZ:0,ease:Cubic.easeOut},"-=2");
	initAnimate.to(".light_right",0.7,{rotationZ:0,ease:Cubic.easeOut},"-=2");
	initAnimate.to(".controls",0.5,{bottom:20,opacity:1},"-=0.7");

	initAnimate.to("body",0,{"overflow-y":"scroll"});
};

//导航条中的动画
perkin.nav = function(){

	var navAnimate = new TimelineMax();
	$(".nav a").bind("mouseenter",function(){
		var w = $(this).width();
		var l = $(this).offset().left;
		navAnimate.clear();
		navAnimate.to(".line",0.4,{opacity:1,left:l,width:w});
	});
	$(".nav a").bind("mouseleave",function(){
		navAnimate.clear();
		navAnimate.to(".line",0.4,{opacity:0});
	});

	//鼠标移入language要显示dropdown
	var languageAnimate = new TimelineMax();
	$(".language").bind("mouseenter",function(){
		languageAnimate.clear();
		languageAnimate.to(".dropdown",0.5,{opacity:1,"display":"block"});
	});

	$(".language").bind("mouseleave",function(){
	languageAnimate.clear();
	languageAnimate.to(".dropdown",0.5,{opacity:0,"display":"none"});
	});

	//调出左侧的导航条
	$(".btn_mobile").click(function(){
		var m_animate = new TimelineMax();
		m_animate.to(".left_nav",0.5,{left:0});
	});

	$(".l_close").click(function(){
		var l_animate = new TimelineMax();
		l_animate.to(".left_nav",0.5,{left:-300});
	});
};

//3D翻转效果
perkin.button3D = function (obj,element1,element2,d) {
	var button3DAnimate = new TimelineMax();

	button3DAnimate.to( $(obj).find(element1),0,{rotationX:0,transformPerspective:600,transformOrigin:"center bottom"},0);
	button3DAnimate.to( $(obj).find(element2),0,{rotationX:-90,transformPerspective:600,transformOrigin:"top center"},0);

	$(obj).bind("mouseenter",function(){
		var enterAnimate = new TimelineMax();

		var ele1 = $(this).find(element1);
		var ele2 = $(this).find(element2);

		enterAnimate.to(ele1,d,{rotationX:90,top:-ele1.height(),ease:Cubic.easeInOut},0)
		enterAnimate.to(ele2,d,{rotationX:0,top:0,ease:Cubic.easeInOut},0)
	});
	$(obj).bind("mouseleave",function(){
	var leaveAinimate = new TimelineMax();

	var ele1 = $(this).find(element1);
	var ele2 = $(this).find(element2);

	leaveAinimate.to(ele1,d,{rotationX:0,top:0,ease:Cubic.easeInOut},0);
	leaveAinimate.to(ele2,d,{rotationX:-90,top:ele2.height(),ease:Cubic.easeInOut},0);
	});
};

//设置每一屏幕的高度和top值
perkin.resize = function(){
	//获取元素
	$(".scene").height($(window).height());  //设置每一屏的高度
	$(".scene:not(':first')").css('top',$(window).height());
	perkin.configTimeScroll();

	if($(window).width()<=780){
		$(".wrapper").unbind();
		$(window).unbind("mousewheel");
		$(window).unbind("scroll");
		$(window).unbind("mousedown");
		$(window).unbind("mouseup");

		$("body").css("height","auto");
		$("body").addClass("r780 r950").css("overflow-y","scroll");
		$(".menu").css("top",0);
		$(".menu").css("transform","none");
		$("menu_wrapper").css("top",0);
		$(".menu").removeClass("menu_state2");
		$(".menu").removeClass("menu_state3");
	}else if( $(window).width()<=950){
		$("body").css("height",8500);
		$("body").removeClass("r780").addClass("r950");
		$(".menu").css("top",0);
		$(".menu").css("transform","none");
	}else{
		$("body").removeClass("r780 r950");
		$("body").css("height",8500);
		$("body").removeClass("r950");
		$(".menu").css("top",22);
		$(".left_nav").css("left",-300);
	}
};
//设置img的百分比
perkin.imgWidth = function(elementImg){
	elementImg.each(function(){
		$(this).load(function(){
			Width = $(this).width();
			$(this).css({
				width:"100%",
				"max-width":Width,
				height:"auto"
			});
		});
	});
};

//配置第二屏的动画
var twoAnimate = {};
twoAnimate.timeline = new TimelineMax();
//具体的第二屏里面动画要实现的细节
twoAnimate.init = function(){
	twoAnimate.timeline.staggerTo(".scene2_1 img",1.5,{opacity:1,rotationX:0,ease:Elastic.easeOut},0.2);
	twoAnimate.timeline.to(".points",0.2,{bottom:20},"-=1");

	//初始化第一个按钮
	twoAnimate.timeline.to(".scene2 .point0 .text",0.1,{opacity:1});
	twoAnimate.timeline.to(".scene2 .point0 .point_icon",0,{"background-position":"right top"});
	
	twoAnimate.timeline.add("state1");
	twoAnimate.timeline.staggerTo(".scene2_1 img",0.2,{opacity:0,rotationX:90},0);
	twoAnimate.timeline.to(".scene2_2 .left",0.4,{opacity:1});
	twoAnimate.timeline.staggerTo(".scene2_2 .right img",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4");
	//初始化第二个按钮
	twoAnimate.timeline.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point1 .text",0.1,{opacity:1});
	twoAnimate.timeline.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point1 .point_icon",0,{"background-position":"right top"},"-=0.4");

	twoAnimate.timeline.add("state2");

	twoAnimate.timeline.to(".scene2_2 .left",0.4,{opacity:0});
	twoAnimate.timeline.staggerTo(".scene2_2 .right img",0.3,{opacity:0,rotationX:90,ease:Cubic.easeInOut},0,"-=0.4");
	twoAnimate.timeline.to(".scene2_3 .left",0.4,{opacity:1});
	twoAnimate.timeline.staggerTo(".scene2_3 .right img",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4");
	//初始化第三个按钮
	twoAnimate.timeline.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point2 .text",0.1,{opacity:1});
	twoAnimate.timeline.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point2 .point_icon",0,{"background-position":"right top"},"-=0.4");

	twoAnimate.timeline.add("state3");

	twoAnimate.timeline.to(".scene2_3 .left",0.4,{opacity:0});
	twoAnimate.timeline.staggerTo(".scene2_3 .right img",0.3,{opacity:0,rotationX:90,ease:Cubic.easeInOut},0,"-=0.4");
	twoAnimate.timeline.to(".scene2_4 .left",0.4,{opacity:1});
	twoAnimate.timeline.staggerTo(".scene2_4 .right img",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4");
	//初始化第四个按钮
	twoAnimate.timeline.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point3 .text",0.1,{opacity:1});
	twoAnimate.timeline.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point3 .point_icon",0,{"background-position":"right top"},"-=0.4");

	twoAnimate.timeline.add("state4");

	twoAnimate.timeline.stop();
};
//配置第三屏动画
var threeAnimate = {};

threeAnimate.timeline = new TimelineMax();
threeAnimate.init = function(){
	//把第三屏里面的所有的图片翻转-90，透明度设为0
	threeAnimate.timeline.to(".scene3 .step img",0,{rotationX:-90,opacity:0,transformPerspective:600,transformOrigin:"center center"});

	threeAnimate.timeline.staggerTo(".step3_1 img",0.2,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0.1);

	threeAnimate.timeline.add("threeSate1");

	threeAnimate.timeline.to(".step3_1 img",0.3,{opacity:0,rotationX:-90,ease:Cubic.easeInOut});
	threeAnimate.timeline.to(".step3_2 img",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut});

	threeAnimate.timeline.add("threeSate2");

	threeAnimate.timeline.stop();
};

//配置第五屏动画
var fiveAnimate = {};
fiveAnimate.timeline = new TimelineMax();

fiveAnimate.init = function(){
//把所有图片和button翻转-90，透明度变为0，scene5_img的top初始为-220

	fiveAnimate.timeline.to(".scene5 .area_content img, .scene5 .button1,.scene5 .button2",0,{rotationX:-90,transformPerspective:600,transformOrigin:"center center"});
	fiveAnimate.timeline.to(".scene5 .scene5_img",0,{top:-220});

	fiveAnimate.timeline.to(".scene5 .scene5_img",0.5,{top:0,ease:Cubic.easeInOut});
	fiveAnimate.timeline.staggerTo( ".scene5 .button1,.scene5 .button2,.scene5 .area_content img",1.2,{opacity:1,rotationX:0,ease:Elastic.easeOut},0.2 );

	fiveAnimate.timeline.to(".scene5 .lines",0.5,{opacity:1});
		fiveAnimate.timeline.add("fiveState");

	fiveAnimate.timeline.stop();
};
//实现导航条3D翻转动画
var menu = {};
//每滚动一屏的时候，就调用这个函数，函数里面是3D翻转的具体实现细节
menu.changeMenu = function(stateClass) {  //参数的作用：切换到某一屏的时候，要传入的class名字
	//具体实现3D翻转效果
	var oldMenu = $(".menu");
	var newMenu = oldMenu.clone();
	newMenu.removeClass("menu_state1").removeClass("menu_state2").removeClass("menu_state3");
	newMenu.addClass(stateClass);
	$(".menu_wrapper").append(newMenu);

	oldMenu.addClass("removeClass");
	perkin.nav();
	perkin.button3D(".start",".state1",".state2",0.3);//3D翻转效果

	var menuAnimate = new TimelineMax();
	if($(window).height() >950){
	menuAnimate.to(newMenu,0,{top:100,rotationX:-90,transformPerspective:600,transformOrigin:"top center"});
	menuAnimate.to(oldMenu,0,{rotationX:0,top:22,transformPerspective:600,transformOrigin:"center bottom"});

	menuAnimate.to(oldMenu,0.3,{rotationX:90,top:-55,ease:Cubic.easeInOut,onComplete:function(){
		$(".removeClass").remove();
	}});

	menuAnimate.to(newMenu,0.3,{rotationX:0,top:22,ease:Cubic.easeInOut},"-=0.3");
	}
};