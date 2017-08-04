/*	
	xmsInet.js文件中，该方法中，包含的是O2O的业务代码。
	
	主要基于jQuery.js和xmsCore.js文件。
	
	创建时间：2015-10-10
	
	该方法中，定义一个全局变量，xmsInet对象，所有的对外公开的属性和方法，都定义到该对象上面。
	
	在对应的需要使用的页面调用。
*/
(function(window){
	//$和xmsCore这两个属性是在xmsCore中，做的处理
	var xmsCore = window.xmsCore,
		ajaxHost = "";

	window.xmsInet = {};
	$.fn.extend({
		//联动的一个模块
		linkAge:function(options){
			$.linkAge($(this),options);
		},
		scrollIntoView:function(obj){
			var src = obj;
			if(!$.xmsIsjQuery(obj)){
				src = $(src);
			}
			if(!src.size()){
				return false;
			}
			
			var parent = src.parent(),
				height = parent.height(),
				srcTop = src.position().top,
				srcHeight = src.outerHeight(),
				scrollTop = parent.scrollTop();
			
			parent.scrollTop(scrollTop + srcTop - height + srcHeight);
			
			return this;
		}
	});
	$.extend({
		//联动的模块
		linkAge:function(obj,options){
			new linkAge(obj,options);
			return this;
		},
		
		//把字符串中的换行符变化成'<br>'的样式，然后保存到数据库
		trimReqStr:function(str){
			if(!str){
				return "";
			}
			
			return str.replace(/(\n|\r|%0A|%0D)+/g,"%0A");
		}
	});
	

	function XMSSelectBox(options){
		/**
			options内容的属性包括如下方法
			obj，必须，绑定该方法的input框对象，可以使jQuery对象和id
				最好不是class，因为会多个出现问题
				obj对象上，要有一个data-name属性，用于创建隐藏的input的名称
			hiddenInput，隐藏的input对象
			
			src，目标的元素框，如果有，则定位该框，如果没有，则生成该框
			    最好是确定的jQuery对象，或者是以id为目标的元素
			type，支持两个属性，ajax属性，或者为空，默认为空
				当值为ajax时，可以先加载一个空的loadding画面
			url，字符串（固定），如果是ajax的话，需要提供url，并且返回的数据必须为指定格式，格式定为：[{name:"",value:"",pinyin:""},{name:"",value:"",pinyin:""}];
			dataFn，在ajax提交时，可能是有额外数据的，所以通过dataFn的回调处理数据，如果没有该方法
				
			data，保存初始化时数据，用于非ajax的下拉框数据的初始化，下拉框的数据，是一个数组
				[{name:"name1",value:"value1"},{name:"name2",value:"value2"}]
			template，自定义的li的格式内容，传入的值是个人规定，为ajax返回的数据
			parentClass,容器框的class名称，
			childClass,内部元素的class名称
			//上述的两个class的名称，是在需要创建容器时，使用
			//如果没有这两个元素，则按照默认的样式显示
			width,设置容器的宽度，如果是单纯的数字，则按照该倍数显示
				默认值为1，表示，按照input输入框的宽度显示
				px，其他只支持以像素为单位的宽度设置
		*/
		
		if(!(this instanceof XMSSelectBox)){
			return new XMSSelectBox(options);
		}
		
		this.options = options;

		var obj = options.obj,
			src = options.src || "",
			prevThis = null;
			
		obj = $.xmsIsjQuery(obj)?obj:$(obj);
		
		if(!obj.size()){
			alert("使用XMSSelectBox方法时，对象中必须包含有效的obj属性！");
			return null;
		}
		obj = obj.eq(0);
		options.obj = obj;
		
		prevThis = obj.prop("data-XMSSelectBox") || "";
		if(prevThis){
			//表示该对象已经添加过这个方法了，则退出
			//那么把之前的实例返回
			return prevThis;
		}
		
		obj.attr("autocomplete","off");
		obj.prop("data-XMSSelectBox",this);
		
		//支持把url写在obj的data-url上
		options.url = options.url || obj.attr("data-url") || "";
		
		if(options.type == "ajax" && !options.url){
			alert("当您使用ajax获取数据时，必须包含url地址，请确认！");
			return null;
		}
		
		this.initOptions();
		
		if(!src){
			src = this.createBox();
		}else if(src && !(src = $.xmsIsjQuery(src)?src:$(src)).size()){
			//如果src本就存在，则不创建新的src对象，如果不存在，则新建，并且放在obj的后面
			alert("您输入的src无法找到对应的目标元素，请确认！");
			return null;
		}
		src = src.eq(0);
		options.src = src;
		
		if(!src.find("li:not('.loadding')").size()){
			src.html(this.getBoxHtml(options.data));
		}
		
		hiddenInput = options.hiddenInput || "";
		if(!hiddenInput){
			hiddenInput = this.initHiddenInput();
		}else if(hiddenInput && !(hiddenInput = $.xmsIsjQuery(hiddenInput)?hiddenInput:$(hiddenInput)).size()){
			//如果src本就存在，则不创建新的src对象，如果不存在，则新建，并且放在obj的后面
			alert("您输入的hiddenInput无法找到对应的目标元素，请确认！");
			return null;
		}
		options.hiddenInput = hiddenInput.eq(0);
		
		options.width = options.width || 1;
		options.cacheData = {};
		//cacheData用于缓存已经存在的数据，在ajax状态下有效
		
		this.initHiddenInputValue();
		this.initBoxPos();
		this.initEvent();
	}
	/* 
		初始化options中部分参数，后面可直接使用。
		实例化XMSSelectBox后只执行一次initOptions方法，
		随后将initOptions置空
	*/
	XMSSelectBox.prototype.initOptions = function(){
		var options = this.options;
		
		options.loading = "<li class = 'loadding' style = 'list-style:none;'><img src = 'http://s1.95171.cn/adentity/images/o_loading.gif' style = 'text-align:center;padding:5px 10px;'/></li>";
		
		options.noData = $("<li class = 'loadding p5' style = 'list-style:none;'>暂无数据</li>");
		
		options.parentCssText = {"display":"none","position":"absolute","z-index":2,"list-style":"none","max-height":"200px","overflow-x":"hidden","overflow-y":"auto","margin-left":"0px","padding-left":"0px","text-align":"left","border":"1px solid #aaa"};
		
		options.childCssText = {"list-style":"none","padding":"4px","border-bottom":"1px solid #ccc","cursor":"pointer"};
		
		this.initOptions = null;
		//清理该方法，每次实例化时，只运行一次
	}
	/* 
		创建obj对应的隐藏input,并将该input放置在obj之后
		该input:
			1、type = "hidden" 
			2、name = obj.attr("data-name") || (obj.attr("name") || "XMSSelectBox")+"Value"
			3、value = obj.attr("data-value") || ""
		实例化XMSSelectBox后只执行一次initHiddenInput方法，
		随后将initHiddenInput置空
	*/
	XMSSelectBox.prototype.initHiddenInput = function(){
		var options = this.options,
			obj = options.obj,
			inputName = obj.attr("data-name") || (obj.attr("name") || "XMSSelectBox")+"Value",
			inputValue = obj.attr("data-value") || "",
			hiddenInput = $('<input type = "hidden" name = "'+inputName+'" value = "'+inputValue+'"/>');
			
			
		obj.after(hiddenInput);
		
		this.initHiddenInput = null;
		//清理该方法，每次实例化时，只运行一次
		
		return hiddenInput;
	};
	/*
		实例化XMSSelectBox时设置下拉列表中初始值，
		该值为隐藏输入框中的内容
		实例化XMSSelectBox后只执行一次initHiddenInputValue方法，
		随后将initHiddenInputValue置空
	*/
	XMSSelectBox.prototype.initHiddenInputValue = function(){
		var options = this.options,
			obj = options.obj,
			src = options.src,
			hiddenInput = options.hiddenInput,
			text = src.find("li[data-value="+(hiddenInput.val() || "")+"]");
		
		if(text.length){
			obj.val(text.text());
		}
		
		this.initHiddenInputValue = null;
		//清理该方法，每次实例化时，只运行一次
	};
	/*
		若没有下拉列表时创建下拉列表，并为其设置class和style(见initOptions)
		实例化XMSSelectBox后只执行一次createBox方法，
		随后将createBox置空
	*/
	XMSSelectBox.prototype.createBox = function(){
		var options = this.options,
			obj = options.obj,
			parentClass = options.parentClass || "",
			parentCssText = options.parentCssText,
			src = $('<ul></ul>');
		
		obj.after(src);
		
		if(parentClass){
			src.addClass(parentClass);
		}else{
			src.css(parentCssText);
		}
		
		this.createBox = null;
		//该方法，只能被调用一次。
		return src;
	};
	
	//li的默认格式部分
	XMSSelectBox.prototype.template = function(data){
		var options = this.options,
			obj = options.obj,
			// src = options.src,
			hiddenInput = options.hiddenInput,
			objSele = hiddenInput.attr("data-selected"),
			i=0,
			len = data.length,
			one = null,
			html = "",
			name = "",
			value = "",
			flag = "";
		
		for(;i<len;i++){
			one = data[i];
			name = one.name;
			value = one.value;
			flag = "";
			if(objSele && objSele == value){
				obj.val(name);
				hiddenInput.val(value);
				flag = "class='active'";
			}
			html += "<li class='selectBoxItem' data-value = '"+value+"' data-pinyin = '"+(one.pinyin || "")+"'"+flag+">"+name+"</li>";
		}
		
		return html;
	}
	/*
		整理ajax请求返回的结果，
		返回jquery对象
	*/
	XMSSelectBox.prototype.getBoxHtml = function(data){
		var options = this.options,
			data = data || [],
			len = data.length,
			html = "",
			htmlLen = 0,
			one = null,
			template = null,
			activeEle = null,
			childClass = options.childClass || "",
			childCssText = options.childCssText;
		
		if(!len){
			html = options.noData;
		}else{
			template = options.template;
			html = ( typeof template == "function" ) ? $(template(data)).addClass("child-has-a") : $(this.template(data));
			htmlLen = html.length;
			for(var i=0;i<htmlLen;i++){
				one = $(html[i]);
				if(one.hasClass("active")){
					activeEle = one;
				}
			}
			if(activeEle && activeEle.length){
				activeEle.trigger("click");
			}
		}
		
		if(childClass){
			html.addClass(childClass).filter(":last").css({"border":"none"});
		}else{
			html.css(childCssText).filter(":last").css({"border":"none"});
		}
		
		return html;
	}
	/*
		若type为ajax则提交输入框及dataFn中内容
	*/
	XMSSelectBox.prototype.ajaxGetHtml = function(objValue){
		var that = this,
			options = this.options,
			obj = options.obj,
			src = options.src,
			hiddenInput = options.hiddenInput,
			url = options.url || "",
			cacheData = options.cacheData,
			dataFn = options.dataFn || "",
			data = typeof dataFn == "function"?dataFn():dataFn;

		//如果获取ajax时，则把之前的hidden的值清空。
		hiddenInput.val("");
		if(objValue && (cacheData[objValue] instanceof Array)){
			// 有缓存值
			src.html(that.getBoxHtml(cacheData[objValue]));
			
		}else{
			// 首次提交请求
			src.html(options.loading);
			if(objValue.indexOf("=") != -1){
				data = data == ""?objValue:objValue+"&"+data;
			}
			$.ajax({
				url:url,
				data:data,
				type:"post",
				dataType:"json",
				success:function(data){
					data = typeof data == "string"?$.parseJSON(data):data;
					var value = "";
					if(data instanceof Array){
						value = data;
					}else if(data instanceof Object){
						if(data.succ){
							value = data.value;
						}else{
							if(data.msg){
								alert(data.msg);
								return false;
							}
						}
					}
					if(value instanceof Array){
						src.html(that.getBoxHtml(value));
						cacheData[objValue] = value;
					}
				},
				error:function(){
					alert("由于网络的原因，您刚才的操作没有成功。");
				}
			});
		}
		//src.show();
	};
	/*
		设置下拉列表的样式
	*/
	XMSSelectBox.prototype.initBoxPos = function(){
		var options = this.options,
			width = ""+options.width,//将options.width类型转换为字符串
			obj = options.obj,
			src = options.src,
			position = obj.position();
		
		width = width.replace(/^\d+(\.\d*)?(px)?$/,function($1,$2,$3){
			if(!$3){
				// 只传入数字，默认为比例
				return width*obj.outerWidth(); 
			}else{
				return width;
			}
		});
		
		src.css({
			"width":width,
			"left":position.left,
			"top":(position.top-1+obj.outerHeight())
		});
		
	};
	/*
		下拉列表的定位
	*/
	XMSSelectBox.prototype.reFixBoxPos = function(){
		var options = this.options,
			obj = options.obj,
			src = options.src,
			position = obj.position();
		
		src.css({
			"left":position.left,
			"top":(position.top-1+obj.outerHeight())
		});
		
	};
	/*
		绑定事件
	*/
	XMSSelectBox.prototype.initEvent = function(){
		var options = this.options,
			obj = options.obj,
			src = options.src,
			hiddenInput = options.hiddenInput,
			type = options.type || "",
			timer = null,
			timeSec = 300,
			that = this,
			inputType = "oninput" in obj[0]?"input":"keydown";
		
		this.initEvent = null;
		//清理该方法，每次实例化时，只运行一次
		
		function srcShow(){
			that.reFixBoxPos();
			//以防有其他元素被添加或者删除，重新计算下拉框的位置。
			var childs = src.children("li"), activeEle = childs.filter(".active");
			changeBg.removeBg(childs.not(".special"));
			src.show();
			changeBg.addBg(activeEle);
			activeEle.scrollIntoView();
		}
		
		function srcHide(){
			changeBg.removeBg(src.children("li").not(".special"));
			src.hide();
		}

		function changeOptions(){
			var defaultValue = "&nbsp;",
				oldValue = obj.prop("data-oldValue") || defaultValue,
				newValue = $.trim(obj.val()),
				keyWords = "",
				justFirst = false,
				childs = src.children("li");
			if(oldValue == newValue){
				return "";
			}
			/*
				若输入框为空则显示下拉列表，清空输入框"data-oldValue"属性，
				触发objempty事件，并将隐藏输入框值清空，结束调用
			*/
			if(!newValue){
				childs.show();
				obj.prop("data-oldValue",defaultValue);
				obj.trigger("objempty");
				//留接口，obj可以添加objempty的监听事件
				//objempty的事件，在XMSSelectBoxMulti构造函数内部使用
				//千万不要给删掉了。
				hiddenInput.val("");
				return "";
			}
			
			obj.prop("data-oldValue",newValue);
			
			if(type == "ajax"){
				// ajax请求，设置下拉列表中内容
				that.ajaxGetHtml(obj.attr("name")+"="+$.trim(obj.val()));
				return false;
			}
			
			if(newValue.length == 1){
				justFirst = true;
			}
			
			keyWords = newValue.split(/\s+/g);//\s 匹配任何空白字符，包括空格、制表符、换页符等等
			childShow();
			
			function childShow(){
				// 隐藏没有关键字的li
				childs.each(function(){
					var li = $(this),
						text = li.text()+ (li.attr("data-pinyin") || ""),
						i,
						len = keyWords.length,
						flag = 0;
					
					for(i=0;i<len;i++){
						if(text.indexOf(keyWords[i]) == -1){
							flag = 1;
							break;
						}
					}
					
					if(flag){
						li.hide();
					}else{
						li.show();
					}
				});
				var visChild = childs.filter(":visible");
				// 只输入一个字时隐藏与之匹配的li
				visChild.each(function(){
					var li = $(this),
						text = li.text(),
						i,
						len = keyWords.length,
						flag = 0;
						
					for(i=0;i<len;i++){
						if(justFirst && text.indexOf(keyWords[i]) != 0){
							flag = 1;
							break;
						}
					}
					
					if(flag){
						li.hide();
					}else{
						li.show();
					}
				});
				
				if(!childs.filter(":visible").size()){
					visChild.show();
				}
			}
		}
		
		var changeBg = {
			liBg:function(curLi,nextLi){
				this.removeBg(curLi);
				this.addBg(nextLi);
				//滚动到nextLi处
				nextLi.scrollIntoView();
			},
			removeBg:function(curLi){
				// 删除隐藏输入框中值以外的curLi中li的active样式，并设置背景色为白色
				curLi.filter(function(){
					return $(this).attr("data-value") != hiddenInput.val();
				}).removeClass("active").css("background-color","#fff");
			},
			addBg:function(nextLi){
				// nextLi高亮
				nextLi.addClass("active").css("background-color","#ddd");
			}
		};
		
		function choiceValue(li){
			var curLi = src.children("li").filter(".active,.special");
			changeBg.liBg(curLi,li);
			obj.val(li.text());
			hiddenInput.val(li.attr("data-value") || "");
			srcHide();
			hiddenInput.trigger("change");
		}
		
		obj.on("focus",srcShow);
		
		obj.on(inputType,function(){
			clearTimeout(timer);
			timer = setTimeout(changeOptions,timeSec);
		});
		
		obj.on("click",srcShow);
		
		obj.on("click","a",function(){
			obj.trigger("click");
		});
		
		obj.on("dblclick",function(){
			// 全选输入框中内容
			obj.select();
		});
		
		src.on("click","li:not('.loadding,.child-has-a')",function(){
			choiceValue($(this));
		});
		
		src.on("mouseenter","li:not('.loadding,.special')",function(){
			changeBg.addBg($(this));
		}).on("mouseleave","li:not('.loadding,.special')",function(){
			changeBg.removeBg($(this));
		});
		
		obj.on("keydown",function(event){
			var c = event.keyCode || event.which,
				curLi = null,
				nextLi = null,
				showChild = null,
				childs = null;

			if(c == 40 || c == 38 || c== 13){
				childs = src.children("li");
				childs.removeClass(".active");
				showChild = childs.filter(":visible:not('.special')");
				curLi = showChild.filter(".active");
				curLi = curLi.length > 1?curLi.filter(function(){
					return $(this).attr("data-value") != hiddenInput.val();
				}):curLi;
			}
			
			if(c == 40){
				//表示按下向下的按钮
				srcShow();
				nextLi = curLi.nextAll("li:visible:not('.special')");
				nextLi = nextLi.size()?nextLi.eq(0):showChild.eq(0);
				changeBg.liBg(curLi,nextLi);
				return false;

			}else if(c == 38){
				//表示按下向上的按钮
				srcShow();
				nextLi = curLi.prevAll("li:visible:not('.special')");
				nextLi = nextLi.size()?nextLi.eq(0):showChild.filter(":last");
				changeBg.liBg(curLi,nextLi);
				return false;

			}else if(c == 13){
				//表示按下回车
				var alink = curLi.find("a");
				if(alink.size()){
					alink.eq(0).trigger("click");
				}else{
					curLi.trigger("click");
				}
				return false;
			}
		});
		
		$(document).on("click",function(e){
			var target = $(e.target);
			if(!target.closest(obj).size() && !target.closest(src).size()){
				srcHide();
			}
		});
		
	};
	xmsInet.XMSSelectBox = XMSSelectBox;
	function XMSSelectBoxMulti(options,multiType){
		/*
			options为需要联动的下拉框的元素，
			arr:数组元素，内部为object对象，
				每个对象的支持属性，格式和XMSSelectBox的属性相同。
			还可以添加一些默认属性，格式与XMSSelectBox的格式相同
			如果arr数组中的对象，没有设置该处设置的属性，那么给其设置。
			width:如果在options中设置该属性，那么所有arr中，没有width的对象，都会继承该属性
		*/
		
		if(!(this instanceof XMSSelectBoxMulti)){
			return new XMSSelectBoxMulti(options,multiType);
		}
		
		if(typeof options != "object"){
			//options必须为一个对象
			return null;
		}
		
		var arr = null;
		
		//是多级联动，还是单级联动
		//true时，表示后面所有的都会ajax的请求
		this.multiType = multiType == true?true:false;
		
		if(options instanceof Array){
			arr = options;
			this.options = {};
		}else{
			arr = options.arr || [];
			this.options = options;
		}
		
		this.initUrl(arr);
		//使用jQuery的部分
		this.getjQueryArr(options,arr);
		
		
		if(arr.length > 1){
			/*有多个下拉列表时，只给第一个下拉列表初始化数据*/
			var data = options.data || [];
			arr[0].data = data;
			delete options.data;
		}
		
		var multis = this.initMultis(arr);
		
		if(multis.length > 1){
			this.initEvent(multis);
		}
	}
	/*
		获取所有输入框obj的属性"data-url"，并设置为该数组的属性url
		实例化XMSSelectBoxMulti后只执行一次initUrl方法，
		随后将initUrl置空
	*/
	XMSSelectBoxMulti.prototype.initUrl = function(arr){
		if(arr instanceof Array){
			var i=0, len = arr.length, obj = null,
				url = "";
			for(i=0;i<len;i++){
				obj = arr[i];
				url = $.xmsIsjQuery(obj.obj)?(obj.obj.attr("data-url") || ""):"";
				if(url){
					obj.url = url;
				}
			}
		}
		this.initUrl = null;
	};
	/*
		将参数options中传入的下拉列表格式化后赋值给arr
		实例化XMSSelectBoxMulti后只执行一次getjQueryArr方法，
		随后将getjQueryArr置空
	*/
	XMSSelectBoxMulti.prototype.getjQueryArr = function(options,arr){
		var obj = options.obj || "",
			src = options.src || "",
			hiddenInput = options.hiddenInput || "",
			data = options.data || [],
			objLen = 0,
			srcLen = 0,
			inputLen = 0,
			i=0,
			one = null,
			url = "";
		
		delete options.obj;
		delete options.src;
		delete options.hiddenInput;
		delete options.arr;
		//删除这些数据，以防影响XMSSelectBox实例化时，obj继承默认的width属性的情况
		
		this.getjQueryArr = null;
		//每个实例中，只能使用一次getjQueryArr方法
		//delete this.getjQueryArr;
		
		if(!obj){
			return null;
		}
		
		obj = $.xmsIsjQuery(obj)?obj:$(obj);
		src = $.xmsIsjQuery(src)?src:$(src);
		hiddenInput = $.xmsIsjQuery(hiddenInput)?hiddenInput:$(hiddenInput);
		
		objLen = obj.size();
		srcLen = src.size();
		inputLen = hiddenInput.size();
		
		if(objLen >= srcLen && objLen >= inputLen){
			for(i=0;i<objLen;i++){
				one = obj.eq(i);
				url = one.attr("data-url") || "";
				oneObj = {
					obj:one
				};
				if(i<srcLen){
					oneObj.src = src.eq(i);
				}
				if(i<inputLen){
					oneObj.hiddenInput = hiddenInput.eq(i);
				}
				
				arr.push(oneObj);
			}
		}
	};
	/*
		为每个下拉列表实例化XMSSelectBox
		实例化XMSSelectBoxMulti后只执行一次initMultis方法，
		随后将initMultis置空
	*/
	XMSSelectBoxMulti.prototype.initMultis = function(arr){
		/*if(!(arr instanceof Array)){
			return [];
			//arr必须为数组
		}*/
		
		this.initMultis = null;
		//每个实例中，只能使用一次initMultis方法
		//delete this.initMultis;
		
		var options = this.options,
			i,len=arr.length,res = [],
			item = null,
			selectOption = null;
		
		for(i=0;i<len;i++){
			/* 合并options数据到数组arr的每个元素中 */
			item = $.extend({},options,arr[i]);
			//继承一些默认的属性
			
			if(item.obj.prop("data-XMSSelectBox") != "true"){
				//表示该方法，还没有添加过，则添加，否则不进行添加
				
				item = new XMSSelectBox(item);
				//XMSSelectBox实例化
				selectOption = item.options;
				item.obj = selectOption.obj;
				item.hiddenInput = selectOption.hiddenInput;
				item.src = selectOption.src;
				//给每一个item添加一些默认的属性
				res.push(item);
			}
		}
		
		return res;
	};
	/*
		绑定事件，最后一个下拉列表不需要绑定事件
	*/
	XMSSelectBoxMulti.prototype.initEvent = function(arr){
		/*if(!(arr instanceof Array)){
			return null;
			//arr必须为数组
		}*/
		this.initEvent = null;
		//每个实例中，只能使用一次initEvent方法
		//delete this.initEvent;
		
		var i = 0,
			len = arr.length-1;
			//因为最后一个联动框，不需要添加这个方法的。
		
		for(i=0;i<len;i++){
			this.lineEventInit(arr,i);
		}
		
	}
	/*
		为每个下拉列表绑定事件
	*/
	XMSSelectBoxMulti.prototype.lineEventInit = function(arr,index){
		
		if(!(arr instanceof Array)){
			return null;
			//arr必须为数组
		}
		
		var item = arr[index],
			src = item.src,
			multiType = this.multiType;
			
		if(!src.size()){
			return false;
		}
		/*
			为下拉列表绑定自定义事件objempty，
			用于清空该下拉列表后所有下拉列表的数据，
			用obj.trigger("objempty")触发该事件
		*/
		item.obj.on("objempty",function(){
			//当前面的input清空时，后面所有联动的数据清除
			var i = index+1,
				len = arr.length,
				item = null;
				
			for(i;i<len;i++){
				//清空后续的联动框的数据
				item = arr[i];
				item.obj.val("");
				item.src.html(item.options.noData);
				item.hiddenInput.val("");
			}
		});
		/*
			选择下拉列表选项
		*/
		src.on("click","li:not('.loadding')",function(){
			var i = 0,
				len = arr.length,
				item = null,
				itemHiddenInput = null,
				reqObj = null,
				reqData = [],
				next = 0;
			if((index - len >= 0) || (index - 0 < 0 )){
				//如果位置出错，则不做处理
				return "";
			}
			/*
				获取所选下拉列表之前所有下拉列表的值，并存入reqData
			*/
			for(i=0;i<=index;i++){
				item = arr[i];
				reqObj = item.hiddenInput;
				if(reqObj.size()){
					reqData.push(reqObj.attr("name")+"="+reqObj.val());
				}
			}
			//获取之前的所有的数据之和
			reqData = reqData.join("&");

			/* 是否联动 */
			next = multiType?len:i;

			for(i;i<len;i++){
				item = arr[i];
				itemHiddenInput = item.hiddenInput;
				item.obj.val("");
				itemHiddenInput.attr("data-selected",itemHiddenInput.val()).val("");
				item.src.html(item.options.loading);
				if(multiType || next == i){
					item.ajaxGetHtml(reqData);
				}
			}
		});
	}
	xmsInet.XMSSelectBoxMulti = XMSSelectBoxMulti;
	function Mesbox(options){
		/*
			//options中包含的一些信息
			//title表示title的名称
			//id，表示生成的div的id名称
			//type，表示弹出框的类型，
				分为：alert，单纯提示信息
					confirm，选择
					ajax，会有ajax的请求类型的
					
			//getContent，可以是一个回调函数，返回的内容会被显示。
				或者一段需要显示的文本，表示生成的的内容部分的结构
				
			//applyName，确认按钮的名称
			//applyFn，点击确认按钮时，会触发的功能函数
			//cancelName，取消按钮的名称
			//cancelFn，点击取消按钮时，会触发的函数。
			//closeBtn，是否有右上角关闭按钮，默认为无~~~false
			//size，模态框大小：modal-lg表示显示大模态框，默认为小
			//confirmType，confirm点击确认之后，接下来的动作，
				如果取值为ajax，则确认之后，触发applyFn函数，
				applyFn函数内是继续type = "ajax"的模态框方法
				
			//ajaxOptions，如果type=ajax时，ajax的请求，按照该对象的内容处理
				{
					url:请求地址
					type:ajax请求类型，get或者post
					data:参数
					dataType:返回类型，默认为json类型
					success:成功之后的回调
					showResultType:回调成功之后，信息的显示模式
					//取值暂时只有"alert"，回调成功之后，以alert的形式展示信息
					//如果不设置该值，那么需要自己在success函数内部，自行处理
				}
		*/
		var loadingImg = "http://s1.95171.cn/adentity/images/o_loading.gif";
		
		if(options.id && $(options.id).size() != 0){
			alert("您的在调用Mbox时，设置了重复id="+options.id+"，请确修改！");
			return false;
		}
		
		options.doc = options.doc || document;
		options.title = options.title || "信息提示";
		options.type = options.type || "alert";
		options.size = options.size || "";

		options.loaddingDiv = "<div style = 'padding-top:10px;padding-bottom:10px;text-align:center;'><img src = '"+loadingImg+"' /></div>";
		options.applyName = options.applyName || "Apply";
		options.cancelName = options.cancelName || "Close";
		
		//缓存一下使用function生成的文本的结构，如果使用相同的function生成的话，
		//直接读取缓存，降低时间
		options.contentsCache = {
			num:0,
		};
		this.options = options;

		this.doc = $(options.doc);

		this.createBox();
	}
	
	Mesbox.prototype.createBox = function(){
		var options = this.options,
			doc = this.doc,
			html = '<div class="modal fade" id = "'+(options.id || "")+'">'+
				'<div class="modal-dialog '+options.size+'">'+
					'<div class="modal-content">'+
						'<div class="modal-header">';
						
			if(options.closeBtn === true){
				html += '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>';
			}
			
			html += '<h4 class="modal-title">'+options.title+'</h4>'+
						'</div>'+
						'<div class="modal-body"></div>'+
						'<div class="modal-footer">'+
							'<button type="button" class="btn btn-primary applyMbox"></button>'+
							'<button type="button" class="btn btn-default closeMbox" style = "margin-left:20px;" data-dismiss="modal"></button>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</div>';
			
		this.Mbox = $(html);
		
		var Mbox = this.Mbox;
		
		$(document.body).append(Mbox);
		
		if(!options.container){
			options.header = Mbox.find(".modal-header");
			options.titler = Mbox.find(".modal-title");
			options.container = Mbox.find(".modal-body");
			options.footer = Mbox.find(".modal-footer");
			options.apply = Mbox.find(".applyMbox");
			options.close = Mbox.find(".closeMbox");
		}
	};
	
	Mesbox.prototype.showMbox = function(){
		this.Mbox.modal({show:true,backdrop:"static"});
	};
	
	Mesbox.prototype.hideMbox = function(){
		this.Mbox.modal('hide');
	}
	
	Mesbox.prototype.reDefineMbox = function(option){
		/**
			*option的值，和Mesbox时的类型相同
			如果这时有option的输入，则后面的输入使用option，
			如果没有，则使用this.options
		*/
		var options = this.options;
		option = option || options || "";

		if(!option){
			//如果为空，则提示错误
			this.reDefineMbox({
				type:"alert",
				getContent:"您调用reDefineMbox方法时，出现错误，请确认"
			});
			return false;
		}
		//更换title的显示
		this.initTitle(option.title);
		
		//更新content部分
		this.initContent(option);
		
		//初始化footer部分的显示
		this.initfooter(option);
		//事件的绑定处理
		this.btnFn(option);
			
		//显示模态框
		this.showMbox();
	}
	
	Mesbox.prototype.initTitle = function(title){
		//初始化title
		title = title || "";
		var options = this.options;
		
		if(title){
			options.titler.html(title);
		}
	}
	
	Mesbox.prototype.initContent = function(option){
		//初始化内容的模块显示部分
		option = option || {};
		var options = this.options,
			contentsCache = null,
			getContent = option.getContent || options.getContent,
			content = "",
			mboxNum = 0;
			
		if(typeof getContent == "function"){
			//如果有getContent，并且为function，则使用function返回的作为html结构
			contentsCache = options.contentsCache;
			if(getContent.mboxNum){
				mboxNum = getContent.mboxNum;
				content = contentsCache[mboxNum];
			}
			if(!content){
				content = getContent.call(this.Mbox);
				if(mboxNum){
					contentsCache[mboxNum] = content;
				}else{
					mboxNum = "C"+contentsCache.num;
					contentsCache.num++;
					contentsCache[mboxNum] = content;
					getContent.mboxNum = mboxNum;
				}
			}
			options.container.html(content);	
		}else{
			options.container.html(getContent);
		}
	}
	
	Mesbox.prototype.initfooter = function(option){
		//初始化footer部分，并且该部分的提交的点击事件
		option = option || {};
		var options = this.options,
			type = option.type || options.type,
			Mbox = this.Mbox,
			apply = options.apply,
			cancel = options.close,
			applyName = option.applyName || options.applyName,
			cancelName = option.cancelName || options.cancelName;
			
		options.footer.show();
		cancel.text(cancelName).removeClass("btn-primary");
		apply.text(applyName).show();
		
		if(type == "alert"){
			//只有当显示为alert显示时，才会更改
			apply.hide();
			cancel.text("确认").addClass("btn-primary");
		}
	};
	
	Mesbox.prototype.btnFn = function(option){
		//给确认按钮添加点击事件
		option = option || {};
		var options = this.options,
			type = option.type || options.type;

		switch(type){
			case "alert":this.alertFn(option);break;
			case "confirm":this.confirmFn(option);break;
			case "ajax":this.ajaxFn(option);break;
			default:break;
		}
	}
	
	Mesbox.prototype.alertFn = function(option){
		//调用类似alert的模态框
		option = option || this.option || {};
		var options = this.options,
			cancel = options.close,
			that = this,
			applyFn = option.applyFn
			that = this,
			confirmType = option.confirmType || "";

		cancel.off("click");
		cancel.one("click",function(){
			if(typeof applyFn == "function"){
				applyFn.call(that.Mbox);
			}
			
			if(confirmType != "ajax"){
				//如果这个confirm之后，跟的不是ajax请求，就隐藏该模态框
				//如果接下来是ajax请求，则直接进行ajax的请求
				that.hideMbox();
			}
			
		});
	};
	
	Mesbox.prototype.confirmFn = function(option){
		//调用类似confirm的模态框
		option = option || this.option || {};
		var options = this.options,
			apply = options.apply,
			cancel = options.close,
			that = this,
			applyFn = option.applyFn,
			cancelFn = option.cancelFn,
			confirmType = option.confirmType || "";
			
		apply.off("click");
		apply.on("click",function(){
			if(typeof applyFn == "function"){
				applyFn.call(that.Mbox);
			}
			if(confirmType != "ajax"){
				//如果这个confirm之后，跟的不是ajax请求，就隐藏该模态框
				//如果接下来是ajax请求，则直接进行ajax的请求
				that.hideMbox();
			}
		});
		
		//取消按钮
		cancel.off("click");
		cancel.one("click",function(){
			var flag = "";
			if(typeof cancelFn == "function"){
				flag = cancelFn.call(that.Mbox);
				return flag;
			}
		});
	}
	
	Mesbox.prototype.ajaxFn = function(option){
		var options = this.options,
			ajaxOptions = option.ajaxOptions || options.ajaxOptions || {};
			
		this.ajax(this,ajaxOptions);
	}
	
	Mesbox.prototype.ajax = function(obj,option){
		var that = this;
		
		if(!(option.url || "")){
			this.reDefineMbox({
				title:"信息错误",
				type:"alert",
				getContent:"您的ajax请求的url为空！"
			});
			return false;
		}
		
		//如果可以提交，则转成正在提交的图标
		var showResultType = option.showResultType || "";
		
		this.loading();
		option.dataType = option.dataType || "json";
		$.ajax({
			url: option.url,
			type: option.type || "POST",
			data: $.trimReqStr(option.data),
			dataType: option.dataType,
			success: function(json){
				var needCallBack = true,
					msg = "";
					
				if(option.dataType == "json"){
					json = typeof json == "string"?$.parseJSON(json):json;
					msg = json.msg;
					if(showResultType == "alert" && msg){
						needCallBack = false;
						that.reDefineMbox({
							title:"操作结果",
							type:"alert",
							getContent:msg,
							applyFn:function(){
								if(typeof option.success == "function"){
									option.success.call(obj,json);
								}
							}
						});
					}else{
						//that.hideMbox();
					}
				}else if(option.dataType == "html"){
					//如果是请求的html代码，则直接显示返回的html代码
					that.reDefineMbox({
						type:"alert",
						getContent:json,
						applyFn:function(){
							if(typeof option.success == "function"){
								option.success.call(obj,json);
							}
						}
					});
				}
				
				if(needCallBack && typeof option.success == "function"){
					option.success.call(obj,json);
				}
			},
			error: function() {
				that.reDefineMbox({
					title:"提交失败",
					type:"alert",
					getContent:"由于网络的原因，您刚才的操作没有成功。"
				});
			}
		});
	};
	
	Mesbox.prototype.loading = function(){
		var options = this.options;
		options.footer.hide();
		options.container.html(options.loaddingDiv);
	}
	xmsInet.Mesbox = Mesbox;

	function FixBox(obj,options){
		//该模块用于悬浮在页面某处的一个悬浮框的一个构造函数
		//obj为需要添加悬浮框的元素，默认为为document的body元素下添加
		/*
			options的对象，包含以下方法：
			* className 可有可无，如果需要按照自定义的处理，则需要添加该方法
			  如果需要按自定义的方法，进行添加一个className的属性
			* id 可有可无
			* position 如果不需要自定义的位置，则需要按需使用该值
				"lt":左上角
				"lm":靠左居中
				"lb":左下角
				"ct":顶部居中
				"cm":上下左右居中
				"cb":底部居中
				"rt":右上角
				"rm":右侧居中
				"rb":右下角
			* canClose:true/false，该模块是否可以关闭，默认是false，不可关闭
			* title:模块的头部显示内容
			* footers:模块底部
			* content:模块的内容显示部分
		*/
		var loadingImg = "img/o_loading.gif";
		var defaultOptions = {
			className:"",
			id:"",
			position:"rb",
			canClose:false,
			title:"",
			footers:"",
			content:""
		};
		obj = obj || document.body;
		
		options = $.extend({},defaultOptions,options);
		options.loadding = "<div style = 'padding:10px;text-align:center;'><img src = '"+loadingImg+"' />正在加载数据...</div>";
		this.options = options;
		this.root = $.xmsIsjQuery(obj)?obj:$(obj);
		
		this.createBox();
		
		this.adjustPosition();
		
		if(options.canClose){
			this.closeBox();
		}
	}
	
	FixBox.prototype.createBox = function(){
		var options = this.options,
			root = this.root,
			className = options.className,
			html = '<div class = "fixBox '+(className?className:("fixBox-"+options.position))+'">'+
				'<div class="fixBoxContainer">';
		
		if(options.canClose){
			html += '<button type="button" class="close mr5 mt5">&times;</button>';
		}
		
		if(options.title){
			html += '<div class = "fixBox-padding fixBox-header">'+options.title+'</div>';
		}
		html += '<div class = "fixBox-padding fixBox-container scrollbar">'+(options.content || options.loadding)+'</div>';
		
		if(options.footers){
			html += '<div class = "fixBox-padding fixBox-footer">'+options.footers+'</div>';
		}
		html += "</div></div>";
		
		this.fixBox = $(html);
		
		var fixBox = this.fixBox;
		
		root.append(fixBox);
		
		if(!options.container){
			options.header = fixBox.find(".fixBox-header");
			options.container = fixBox.find(".fixBox-container");
			options.footer = fixBox.find(".fixBox-footer");
			options.closer = fixBox.find(".close");
		}
	};
	
	FixBox.prototype.adjustPosition = function(){
		var options = this.options;
		if(options.className){
			return false;
		}
		
		var fixBox = this.fixBox,
			pos = options.position,
			cssStyle = {},
			width = fixBox.width(),
			height = fixBox.height();
		
		switch(pos){
			case "lm":fixBox.css("margin-top",-(height/2));break;
			case "ct":fixBox.css("margin-left",(-width/2));break;
			case "cm":fixBox.css({"margin-top":(-height/2),"margin-left":(-width/2)});break;
			case "cb":fixBox.css("margin-left",(-width/2));break;
			case "rm":fixBox.css("margin-top",-(height/2));break;
			default:break;
		}
	};
	
	FixBox.prototype.addContent = function(html,type){
		//把html插入到FixBox的container部分去
		//type的值分为next，prev，表示插入是在最上部还是最下部
		var options = this.options,
			container = options.container;
		html = $(html);
		if(container.find("img").size()){
			container.empty();
		}
		
		if(type == "prev"){
			container.prepend(html);
		}else{
			container.append(html);
		}
		this.adjustPosition();
	};
	
	FixBox.prototype.setContent = function(html){
		var options = this.options,
			container = options.container;
		if(container.html){
			container.html(html);
		}
	};
	
	FixBox.prototype.closeBox = function(){
		var options = this.options,
			closeBtn = options.closer,
			that = this;
		if(!closeBtn.size()){
			return false;
		}
		
		closeBtn.on("click",function(){
			that.hideBox();
		});
	};
	
	FixBox.prototype.hideBox = function(){
		var fixBox = this.fixBox;
		fixBox && fixBox.hide();
	};
	
	FixBox.prototype.showBox = function(){
		var fixBox = this.fixBox;
		fixBox && fixBox.show();
	};

	function linkAge(obj,options){
		//属于联动的一个功能模块
		/*
			* obj 必须 表示基础元素，可以使id，class，或者jQuery对象
				也是触发该次功能的元素，比如点击之后，会有什么动作
			* options的内部，所需要的一些属性及要求
			* src，当存在该元素时，表示使用的是事件委托的方式
			  obj为父元素，src为子元素，在src中，触发该功能
			* dataAttr 非必须，表示与该事件联动的元素集合。
			* dataType 表示obj与目标的关系，字符串，取值分为：
				all，所有能匹配的元素，默认取值
				prev，next ：表示与obj同级的兄弟元素
				child，所有的子元素
				parent，所有的父元素
				closest，最近的一个父元素，不包含其本身
				只支持一对一联动，如果获取到多个可联动目标，取第一个有效
			* type 表示事件类型，
				暂时支持的值为：click，表示click时对应切换N多个回调的函数
				mouse：分别切换两个回调函数，第一个为mouseover时回调，第二个为mouseout时回调
				focus：切换两个回调函数，第一个为focus时回调，第二个为blur时回调,
				hover: 切换两个函数，前一个时hover时，后一个是离开是触发回调
			* callbacks，一个数组，表示
		*/
		
		if(!$.xmsIsjQuery(obj)){
			obj = $(obj);
		}
		var src = options.dataAttr || "";
		

		if(!obj.size()){
			alert("使用linkAge时，第一个参数必须对应有效的元素，请确认");
			return false;
		}
		
		var type = options.type || "click",
			dataType = options.dataType || "all",
			callbacks = (options.callbacks instanceof Array)?options.callbacks : [options.callbacks];

		if(type == "click"){
			this.clickFn(obj,options.src,src,callbacks,dataType);
		}else if(type == "mouse"){
			//this.mouseFn(obj,srcObj,src,callbacks,dataType);
		}else if(type == "focus"){
			//this.focusFn(obj,srcObj,src,callbacks,dataType);
		}
	}

	linkAge.prototype.getSrc = function(obj,src,dataType){
		//根据样式，获取目标元素
		if(!src){
			return obj;
		}
		
		switch(dataType){
			case "all":return $(src).eq(0);break;
			case "prev": return obj.prev(src);break;
			case "next": return obj.next(src);break;
			case "child": return obj.children(src).eq(0);break;
			case "parent": return obj.parent(src);break;
			case "closest": return obj.closest(src);break;
			default:return $(src);break;
		}
	}

	linkAge.prototype.clickFn = function(obj,srcStr,src,callbacks,dataType){
		var len = callbacks.length,
			that = this;
		
		function callback(){
			var _this = $(this),
				srcObj = that.getSrc(_this,_this.attr(src),dataType),
				num = _this.prop("data-callNum") || 0,
				fn = callbacks[num];
				
			if(typeof fn == "function"){
				fn.call(this,srcObj);
			}
			
			if(len - num == 1){
				num = 0;
			}else{
				num++;
			}
			
			_this.prop("data-callNum",num);
			return false;
		}
		
		if(!srcStr){
			obj.on("click",callback);
			obj.prop("data-callNum",0);
		}else{
			obj.on("click",srcStr,callback);
			$(srcStr).prop("data-callNum",0);
		}
	};

	function unloadFn(msg,fn){
		
		if(typeof msg == "function"){
			fn = msg;
			msg = "";
		}
		
		msg = msg || "您的操作会导致本页的数据丢失，请确认！";
		fn = typeof fn == "function"?fn : "";
			
		window.onbeforeunload = function(e){
			var evt = e ? e : (window.event ? window.event : null);        //此方法为了在firefox中的兼容
			if(evt.clientX > document.body.clientWidth && evt.clientY < 0 || evt.altKey){
	    			evt.returnValue = msg;
	    		}else {
	    			evt.returnValue = msg;
	    		}
  		};
		
		if(fn){
			$(window).on("unload",fn);
		}
	}

	var callTypeFlag = $("#callTypeForm").attr("data-flag") || false;

	// 修改下单页导航
	function _changeNav(){
		var callTypeFormEle = $("#callTypeForm"),
			subTitleEle = $(".sub-title");
		if(callTypeFormEle.length){
			callTypeFormEle.find(".cont_panel").remove();
			callTypeFormEle.find("[type='submit']").remove();
			if(subTitleEle.length){
				subTitleEle.text("导航");
			}
			callTypeFlag = true;
		}
	}
	// 转接弹框
	function _transferModal(){
		var Transfer = $(this),
			option = {
				title: "<span class='text-primary mr10'>餐厅电话</span><span class='mr10'>"+$("[name='TransferModalDisplayName']").val()+"</span>",
		        size: "big",
		        apply:"",
		        cancel:"",
		        afterShow: openSucc
			};

		// 打开模态框
		Transfer.on("click", openMBox);

		function openMBox(){
			var obj = $(this);

			option.content = '<div class="get-content" data-url="'+obj.attr("data-url")+'">正在加载数据，请稍后....</div>';

			mBox.custom(option);
		}
		
		function openSucc(){
			//打开显示之后，初始化信息，load需要显示的信息
	    	$(this).find(".get-content").xmsLoadHtml({
	    		succ: loadSucc
	    	});
	    }
	    function loadSucc(){
	    	var sendMsgBox = $(".sendMsgBox"),
				timestamp =	$(".timestamp"),
	    		selBox1Ele = $("#selBox1"),
	    		MsgForm = $("#MsgForm"),
	    		transferForm = $("#transferForm");

	    	// 转接原因下拉列表	可能存在不需要转接原因的情况
	    	if(selBox1Ele.length){
	    		new xmsCore.XMSSelectModalMulti({
				    arr:[{
					        container : selBox1Ele
					    },{
					        container : $("#selBox2")
					    }]
				});
	    	}
	    	// 发送短信，显示客户手机表单
	    	$(".transfrSendMsg").on("click",function(){
	    		var obj = $(this), tr = obj.closest("tr"),
	    			name = tr.find(".name"), mobile = tr.find(".mobile");

	    		MsgForm.attr("data-name",name.text());
	    		MsgForm.attr("data-mobile",mobile.text());
	    		_changeTemplate();
				MsgForm.attr("action",$(this).attr("data-url")).show();
			});
			var timer = 0;
			$(".msgPhone").on("input",function(){
				var obj = $(this);

				clearTimeout(timer);
				timer = setTimeout(function(){
					if(xmsCore.basic_method.allpass("",obj)){
						_changeTemplate();
					}
				},1000);
			});
			function _changeTemplate(){
				var obj = $(this),
					textArea = MsgForm.find(".msgTextarea"),
	    			template = textArea.attr("data-template");

	    		textArea.val(xmsCore.xmsTmplete(template,{
	    			Mobile: MsgForm.find(".msgPhone").val(),
	    			Phone: MsgForm.attr("data-name"),
	    			Name: MsgForm.attr("data-mobile")
	    		}));
			}
			MsgForm.xmsFormSubmit(function(json){
				if(json.msg){
					alert(json.msg);
				}
				if(json.succ){
					MsgForm.hide();
				}
			});
			transferForm.xmsFormSubmit({
				"beforeFn": function(){
					timestamp.val((new Date()).getTime());
					return true;
				},
				"success": transferSucc
			})
	    }
	    function transferSucc(json){
	    	var flag = $(".ajaxTransfr[data-flag='true'],.ajaxCallOut[data-flag='true']");

	    	if(json.msg && json.succ){
				mBox.alert(json.msg,_subSucc)
			}
			if(json.msg){
				mBox.alert(json.msg)
			}
	    }
	    function _subSucc(){
	    	_changeNav();
			if(flag.length){
				mBox.hide();
			}
	    }
	}
	var callbackFn = {
		_modifyText: function(json){
			// 目标元素替换为文本
			// 若有json.text则目标元素替换为该值，若无则删除目标元素
			$(this).replaceWith(json.text || "");
		},
		_cancelBooker: function (){
			// 弹屏页退订
			var obj = $(this), pEle = obj.closest("tr"), 
				target = pEle.find(obj.attr("data-target"));
			// 修改文字
			target.html(obj.attr("data-text"));

			// 删除按钮
			pEle.find(".comfirmAjax").remove();
			obj.remove();
		},
		_solveRreceive: function(json){
			// 呼叫中心问题处理-领取问题
			if(confirm("领取成功是否现在去处理？")){
				window.open(json.url);
				callbackFn._reload();
			}
		},
		_reload: function(){
			// 刷新页面
			location.reload();
		},
		_close: function(){
			// 关闭页面
			window.close();
		}
	};
	function ajaxSubmit(){
		var docEle = $(document);

		var objTmp = $("#Content");
		// 转接
		docEle.on("click",".ajaxTransfr",function(){
			var obj = $(this), phoneNum = $.trim(obj.attr("data-phone")), 
				param = $.trim(obj.attr("data-param")) || "";
			obj.attr("data-flag","true");
			Transfr(phoneNum,param);
		});
		// 外呼
		docEle.on("click",".ajaxCallOut",function(){
			var obj = $(this), phoneNum = $.trim(obj.attr("data-phone")), 
				param = $.trim(obj.attr("data-param")) || "";
			obj.attr("data-flag","true");
			CallOut(phoneNum,param);
		});
		// 提示后，发送ajax
		docEle.on("click",".comfirmAjax",function(){
		    var obj = $(this), tip = obj.attr("data-tip") || "确定提交！",
		    	callback = obj.attr("data-callback");
		    if(confirm(tip)){
		        obj.ajaxFn({
		            url: obj.attr("data-url"),
		            success:function(json){
		                if(json.succ){
		                    if(callback || typeof callbackFn[callback] == "function"){
		                    	callbackFn[callback].call(obj,json);
		                    }
		                }
		                if(json.msg){
		                	alert(json.msg)
		                }
		            }
		        });
		    }
		});
		// 直接发送ajax
		docEle.on("click",".ajaxOperate",function(){
			var obj = $(this), url = obj.attr("data-url");
			obj.ajaxFn({
				url:url,
				success:function(json){
					if(json.msg){
						alert(json.msg);
					}
				}
			});
		});
	}
	xmsInet.ajaxSubmit = ajaxSubmit;

	// 投诉弹框
	function _complaintModal(options){
		var complaint = $(this),
			callback = options && options.callback,
			data = options && options.data,
			url = complaint.attr("data-url");

		if(typeof data == "string" && data){
			url = xmsCore.xmsQueryUrl({
			    url: url,
			    fn: data
			});
		}
		var option = {
				title: "创建问题",
		        apply:"",
		        cancel:"",
		        afterShow: openSucc
			};

		// 打开模态框
		complaint.on("click", openMBox);
		function openMBox(){
			var obj = $(this);

			option.content = '<div class="get-content" data-url="'+url+'">正在加载数据，请稍后....</div>';

			mBox.custom(option);
		}
		function openSucc(){
	    	$(".get-content").xmsLoadHtml({
	    		succ: loadSucc
	    	});
	    }
	    function loadSucc(){
	    	var complaintFormEle = $("#complaintForm"),
				submitTimeEle = $("input[name='submitTime']"),
				sourceTypeEle = $(".sourceType");

			new xmsInet.XMSSelectBox({
				obj:$("#rest"),
				hiddenInput:$("#restValue"),
				src:$("#restBox"),
				width:1
			});
			complaintFormEle.xmsFormSubmit({
				beforeFn: function(){
					var date = new Date();
					submitTimeEle.val(date.getTime());
					if(sourceTypeEle.filter(":checked").length == 0){
						xmsCore.basic_method.errorTip(sourceTypeEle.eq(0),"请选择问题类型！");
						return false;
					}
					return true;
				},	
				callback: function(json){
					if(json.msg){
						alert(json.msg);
					}
					if(json.succ){
						mBox.hide();
						if(typeof callback == "function"){
							callback.call(this);
						}
					}
				}
			});
	    }
		
		return false;
	}

	function _o2oSearchMember(bookertelEle,callInfoFormEle,callback){
		var obj = $(this),
			phoneNum = $.trim(bookertelEle.val()) || "";
		
		if(!phoneNum){
			// 清空会员信息
			xmsCore.basic_method.errorTip(bookertelEle,"请输入"+bookertelEle.attr("data-remind"));
			return false;
		}
		obj.ajaxFn({
			url: obj.attr("data-url"),
			data: "tel=" + phoneNum + "",
            success:function(json){
                if (json.d != null) {
                	xmsCore.xmsFillInfos(callInfoFormEle,json);
				}else {
					alert("未查询到相关结果");
				}
				if(typeof callback == "function"){
					callback.call(this)
				}
				
            }
		});
	}
	// 来电信息
	function _callInfoFn(){
		var searchMemberEle = $(".searchMember"),
			bookertelEle = $("#bookertel"),
			bookernameEle = $("#bookername"),
			sexAllEle = $("[name='memberSex']"),
			memberRemarkEle = $("#memberRemark"),
			memberCityEle = $("#memberCity"),
			callInfoFormEle = $("#callInfoForm"),
			listTabEle = $(".listTab");

		// 点击“查询”
		searchMemberEle.on("click",function(){
			_o2oSearchMember.call(this,bookertelEle,callInfoFormEle,function(){
				if(listTabEle.length){
					_refreshTabList(listTabEle,bookertelEle);
				}
			});
		});

		// 手机号输入框回车查询
		$("#bookertel").on("keydown",function(event){
			var c = event.keyCode || event.which;

			if(c == 13){
				_o2oSearchMember.call(searchMemberEle,bookertelEle,callInfoFormEle,function(){
					if(listTabEle.length){
						_refreshTabList(listTabEle,bookertelEle);
					}
				});
			}
		});

		//	保存表单
		callInfoFormEle.formSubmit(function(data){
			if(data.msg){
        		alert(data.msg);
        	}
	    });
	}

	function _refreshTabList(listTabEle,bookertelEle){
		var activeEle = listTabEle.find(".active a"),
			listTabAllEle = listTabEle.find("a[role='tab']");

		$.each(listTabAllEle,function(index,ele){
			var obj = $(ele), href = obj.attr("data-url");
			obj.attr("data-flag","false");
			href = xmsCore.changeUrl(href,bookertelEle.attr("name")+"="+$.trim(bookertelEle.val()));
			obj.attr("data-url",href);
		});

		activeEle.trigger("click");
	}

	/* 待办事项 */
	function _toDoFn(){
		var toDoFormEle = $("#toDoForm"),
			callInfoFormEle = $("#callInfoForm");

		// 待办事项提交时同时带入会员信息
		toDoFormEle.on("click","[type='submit']",function(){
			var data = "", url = toDoFormEle.attr("action");

			if(!xmsCore.basic_method.allpass(toDoFormEle)||!xmsCore.basic_method.allpass(callInfoFormEle)){
				return false;
			}
			data = toDoFormEle.serialize() + "&" + callInfoFormEle.serialize();

			toDoFormEle.ajaxFn({
				url:url,
				data:data,
				success:function(json){
					if(json.msg){
						alert(json.msg);
					}
				}
			})
		});
	}
	
	function _showWeekCalendar(src){
		var xmsCalendar = xmsCore.xmsCalendar,
			xmsDateBox = $("#xmsDateBox"),
	    	options = {
	    		"containter": xmsDateBox,
	    		"src": src,
	    		"succ": function(year,month,date){
	    			var obj = $(this),
	    				value = year+"/"+month+"/"+date;
	    				
	    			obj.val(xmsCore.xmsDateFormat({
	    				time: value,
	    				format: "yyyy-mm-dd"
	    			})+" "+xmsCalendar.week(new Date(value),true));
	    		}
	    	};
	    if(!xmsDateBox.length){
	    	xmsDateBox = $('<div id="xmsDateBox" class="xms_date_box"></div>');
	    	$("body").append(xmsDateBox);
	    	options.containter = xmsDateBox;
	    }
	    xmsCalendar(options);
	}

	// 选择时间
	function _selTime(operaTimeEle){
		// var operaTimeEle = $("#operaTime"),
		var	timeSelEle = operaTimeEle.next(".timeSel");
		
		// 隐藏显示时间
		$(document).on("click",function(event){
			var targetEle = $(event.target);

			if(targetEle.attr("id") == operaTimeEle.attr("id")){
				timeSelEle.show();
			}else if(timeSelEle.is(":visible")){
				timeSelEle.hide();
			}
		});

		// 选择时间
		timeSelEle.on("click","td",function(){
			var obj = $(this), value = obj.text();
			if(obj.hasClass("disabled")){
				return false;
			}
			operaTimeEle.val(value);
			timeSelEle.hide();
		});
	}

	//阻止时间显示框的输入动作。
	function preventDefault(e){
		e.preventDefault();
	}

	// 从缓存读取待办事项
	function sessionToDo(){

		var href = location.href,
			BigBrand = "",
			phone = "",
			BigBrandIdEle = $("[name='BigBrandId']");

		if(!sessionStorage){
			// 不支持 sessionStorage
			return false;
		}

		href = href.indexOf("?") < 0 ? "" : xmsCore.xmsStrToObj(href.slice(href.indexOf("?")+1));
		phone = typeof href == "object" ? href.customnum || href.CustomNum || href.phone || href.p : "";
		BigBrand = BigBrandIdEle.val();

		var timer = 0;
		$(".toDoInfo").on("input",function(){
			clearTimeout(timer);
			timer = setTimeout(setSession,500);
		});
		$("#questionType").on("change",setSession);

		function setSession(){
			var sessionResult = {};

			if(!BigBrand || !phone){
				sessionResult = {};
			}else{
				sessionResult.BigBrand = BigBrand;
				sessionResult.phone = phone;
				sessionResult.ToDo = $(".toDoInfo").val();
				sessionResult.Type = $("#questionType").val();
			}

			if(sessionStorage){
				sessionStorage.todo = JSON.stringify(sessionResult);
			}
		}
		return (function(){
			var todo = {};

			if(sessionStorage.todo){
				todo = JSON.parse(sessionStorage.todo);
			}
			if(BigBrand == todo.BigBrand && phone == todo.phone){
				$("#questionType").val(todo.Type);
				$(".toDoInfo").val(todo.ToDo);
			}
		})();
	}

	function popover(){
		// 鼠标放置显示隐藏内容
		var docEle = $(document),
			popoverTimer = 0;

		// 鼠标放置显示隐藏内容
		var popoverTimer = 0;
		docEle.on("mouseenter","[data-content]",function(){
			var obj = $(this);
			clearTimeout(popoverTimer);
			popoverTimer = setTimeout(function(){
				obj.popover("show");
			}, 200);
		});
		docEle.on("mouseleave","[data-content]",function(){
			clearTimeout(popoverTimer);
			$(this).popover('hide');
		});
	}

	// 发送短信函数
	function _sendMsgModal(data){
		var obj = $(this),
			url = obj.attr("data-url"),
			option = {
				title: "发送短信",
		        apply:"",
		        cancel:"",
		        afterShow: openSucc
			};	

		if(!url){
			return false;
		}
		if(typeof data == "string" && data){
			url = xmsCore.xmsQueryUrl({
			    url: url,
			    fn: data
			});
		}
		// 打开模态框
		obj.on("click", openMBox);
		function openMBox(){

			option.content = '<div class="get-content" data-url="'+url+'">正在加载数据，请稍后....</div>';

			mBox.custom(option);
		}
		function openSucc(){
	    	$(".get-content").xmsLoadHtml({
	    		succ: loadSucc
	    	});
	    }

	    function loadSucc(){
	    	var msgTypeEle = $(".msgType"), 
				sendMsgFormEle = $("#sendMsgForm");

			msgTypeEle.on("change",_changeMsgInfo);
			sendMsgFormEle.xmsFormSubmit(function(json){
				if(json.msg){
					mBox.alert(json.msg);
				}
			});
			_changeMsgInfo.call(msgTypeEle.filter(":checked"));
	    }
		function _changeMsgInfo(){
			var obj = $(this), 
				value = obj.val(),
				msgInfoEle = $("#msgInfo"),
				msg = msgInfo && msgInfo["msgInfo"+value];
			
			msgInfoEle.val(msg);
		}
	}

	function _removeWeekGetDate(date){
		if(date){
			date = date.match(/\d{4}(-|\/)\d{1,2}(-|\/)\d{1,2}/);
			if(date){
				date = new Date(date[0]);
			}else{
				date = new Date();
			}
			return xmsCore.xmsDateFormat({
    				format:"yyyy-mm-dd",
    				time: new Date(date)
    			});
		}
		return "";
	}

	function _o2oCallInfo(callScreen){
		var callTypeEle = $("#callType"),
			callTypeFormEle = $("#callTypeForm"),
			subTitleEle =  callTypeFormEle.prev(".sub-title");

		if(callScreen){
			new xmsCore.XMSSelectModal({
			    container: $("#callRest"),
			    width:1
			});
		}
		
		// 展开
		$(".tabSwitch .head_panel").xmsTabSwitch({
		    classAdd: "abs-in"
		});
		// 导航
		$(".callNav").on("click",function(){
			var obj = $(this), id = obj.attr("data-id");
			if(!id){
				return false;
			}
			_scroll(id);
		});

		var bookertelEle = $("#bookertel");
		callTypeFormEle.find("[type='submit']").on("click",function(){
			var checkbox = callTypeFormEle.find("[type='checkbox']:checked"),
				radio = callTypeFormEle.find("[type='radio']:checked"),
				tip = xmsCore.basic_method.validRegExp(bookertelEle);

			if(tip != true || !bookertelEle.val()){
	        	xmsCore.basic_method.errorTip(bookertelEle,"请输入来电号码！");
	        	return false;
	        }
	        if(checkbox.length + radio.length == 0){
	            // 来电类型必选
				xmsCore.basic_method.errorTip(subTitleEle,"请选择一种来电类型！");
	            return false;
	        }
			_o2oSendCallType();
		});

		
	}
	function _o2oSendCallType(){
		var callTypeFormEle = $("#callTypeForm"),
			bookertelEle = $("#bookertel"),
			callTypeEle = $("#callType"),
			url = callTypeFormEle.attr("action"), 
			data = "timestamp="+(new Date()).getTime()+"&"+callTypeFormEle.serialize()+"&"+bookertelEle.attr("name")+"="+bookertelEle.val();

        callTypeFormEle.ajaxFn({
			url: url,
			data: data,
			success:function(data){
				if(data.msg){
	        		alert(data.msg);
	        	}

		        if(data.succ){
		        	if(callScreen){
		        		callTypeEle.remove();
		        	}else{
		        		_changeNav();
		        	}
		        }
		        
		        callTypeFlag = true;
			}
		});
		return false;
	}
	// 弹屏页
	var callScreen = function(){
		// 初始化模态框-全局变量
		window.mBox = new xmsCore.XMSMesBox({
			obj: $("#o2oModal")
		});
		
		function _init(){
			var winEle = $(window), 
				vipBrand = $(".vip-brand"),
				headerEle = $(".new-header"),
				height = winEle.outerHeight(),
				leftColumnEle = $("#leftColumn"),
				rightColumnEle = $("#rightColumn"),
				centerColumnEle = $(".new-center-column"),
				headerHeight = headerEle.outerHeight() + 2,
				contHeight = height - headerHeight,
				css = {
					"height" :contHeight + "px", 
					"top" : headerHeight + "px"
				};
			// 特殊品牌 弹屏页四边有绿色的框
			if(vipBrand.length){
				headerHeight += 10;
				css = {
					"height" : (contHeight - 20) + "px", 
					"top" : headerHeight + "px"
				};
			}
			leftColumnEle.css(css);
			rightColumnEle.css(css);
			centerColumnEle.css({"margin-top":headerHeight + "px"});	

			$("form").on("submit",function(){
				return false;
			});
			unloadFn("您还没有选择来电类型，是否确认关闭/刷新当前页面？",function(){
				if(window.onbeforeunload){
					//因为如果在之前已经发送过该请求，则不再发送ajax请求
					$("#callTypeForm").find("button[type=reset]").trigger("click");
					_o2oSendCallType();
				}
			});
			popover();
			ajaxSubmit();

			sessionToDo();
			
			//合作加盟部分的短信模块
			_sendMessage();

			//投诉模态框
			_complaintModal.call($(".Complaint"));
			
			// 转接
			_transferModal.call($(".Transfer"));
			
			/* 来电信息 */
			_callInfoFn();
			
			/* 待办事项 */
			_toDoFn();

			_o2oCallInfo(true);
		}
		_init();
		
		function _sendMessage(){
			//合作加盟部分的，短信模块
			
			var msgForm = _getContent(),
				sendMesOption = {
					title : "当前需要确认的操作",
					content : msgForm,
					apply : "发送",
					cancel : "取消",
					applyCb : _beginAjax,
					afterShow : _bindEvent
				},
				template = "发送手机号：\'{{Mobile}}\'，短信内容为：\'{{Phone}}{{Name}}\'，确定要发送短信吗？",
				msgPhone = msgForm.find(".msgPhone"),
				msgTextarea = msgForm.find(".msgTextarea");
			
			function _getContent(){
				var html = '<form action = "" class="form-horizontal">';
				
				//客户手机
				html += '<div class="form-group">';
				html += '<label for="" class="col-sm-3 control-label">客户手机：</label>';
				html += '<div class="col-sm-5">';
				html += ' <input type="text" class="form-control input-sm msgPhone" name="msgPhone" placeholder="" value="" />';
				html += '</div>';
				html += '</div>';
				
				//短信内容：
				html += '<div class="form-group">';
				html += '<label for="" class="col-sm-3 control-label">短信内容：</label>';
				html += '<div class="col-sm-6">';
				html += '<textarea class="form-control input-sm msgTextarea" rows="4" id="" name="msg" placeholder="" requir data-remind="短信内容"></textarea>';
				html += '</div>';
				html += '</div>';
				
				//结束form
				html += '</form>';
				
				return $(html);
			}
			
			$("#cooperationToJoin").on("click",".sendMessage",function(){
				var obj = $(this), 
					tr = obj.closest("tr"),
	    			name = tr.find(".name"), 
					mobile = tr.find(".mobile");

	    		msgForm.attr("data-name",name.text()).attr("data-mobile",mobile.text());
	    		msgPhone.val(obj.attr("data-phone"));
				
	    		_changeTemplate();
				msgForm.attr("action",obj.attr("data-url"));
				
				mBox.custom(sendMesOption);
			});
			
			function _beginAjax(){
				
				var url = msgForm.attr("action"),
					data = _getData();
				
				if(data === false){
					return false;
				}
				
				msgForm.ajaxFn({
					url:url,
					data: data,
					success:_ajaxSucc
				});
			}
			
			//ajax提交成功
			function _ajaxSucc(json){
				var msg = json.msg;
				if(msg){
					mBox.alert(msg);
				}
			}
			
			function _bindEvent(){
				//输入时的变更
				var timer = 0;
				
				msgPhone = msgForm.find(".msgPhone");
				msgTextarea = msgForm.find(".msgTextarea");
				msgPhone.on("input",function(){
					var obj = $(this);
					
					clearTimeout(timer);
					timer = setTimeout(_preView,1000);
				});
				
			}
			
			//验证手机号
			function _checkPhone(){
				var v = msgPhone.val();
				if(!v){
					alert("请输入客户手机！");
					return false;
				}
				
				if(!/^1[\d]{10}$/.test(v)){
					alert("您输入的手机号码格式不正确！");
					return false;
				}
				
				return true;
			}
			
			//更新预览
			function _preView(){
				if(!_checkPhone()){
					return false;
				}
				_changeTemplate();
			}
			
			//根据手机号，重写短信的预览
			function _changeTemplate(){
				msgTextarea.val(xmsCore.xmsTmplete(template,{
					Mobile: msgPhone.val(),
					Phone: msgForm.attr("data-name"),
					Name: msgForm.attr("data-mobile")
				}));
			}
			
			//获取提交的数据
			function _getData(){
				
				//验证手机号
				if(!_checkPhone()){
					return false;
				}
				
				return msgForm.serialize();
				
			}
		}
		// 筛选餐厅
		(function(){
			// 筛选条件隐藏显示餐厅
			var filterListEle = $(".filterList"),
				brandListEle = $(".brandList"),
				cityListEle = $(".cityList"),
				businessAreaListEle = $(".businessAreaList"),
				catlogClickEle = $(".catlogClick"),
				operaDateEle = $("#operaDate"),
				operaRestNameEle = $("#operaRestName"),
				restDataSearchEle = $(".restDataSearch"),
				restDataFormEle = $("#restDataForm"),
				restResultListEle = $("#restResultList"),
				cityDefault = "",
				businessDefault = "",
				cityCache = {},
				businessCache = {}, 
				mapFlag = false;
			
			/*
				时间
			*/
			function _dateInit(){
				// 日历
				_showWeekCalendar(operaDateEle);
				operaDateEle.on("keydown",preventDefault);

				// 选择时间
				var operaTime = $("#operaTime");
				_selTime(operaTime);
				operaTime.on("keydown",preventDefault);
			}

			_dateInit();
			// 通过子品牌加载城市
			function _loadCity(id){
				var data = "brandId=" + ( id || "all" ), 
					cityActive = cityListEle.find(".active");

				cityDefault = cityActive.attr("data-id") || "";
				// 清空上次查询数据
				_cityHtml("");
				// 查看是否有缓存
				if(cityCache[id || "all"]){
					_cityHtml(cityCache[id || "all"]);
					_filterRest();
					return false;
				}
				// 无缓存请求
				cityListEle.ajaxFn({
					url: cityListEle.attr("data-url"),
					data:data,
					success: function(json){
						if(json.length){
							_cityHtml(json);
							cityCache[id] = json;
						}
					}
				});
				// DOM添加城市html
				function _cityHtml(data){
					var one,html = "",data = data || [], checked = "", flag = false;

					for(var i=0;i<data.length;i++){
						one = data[i];
						checked = "";
						if(typeof one == "object"){
							if(cityDefault == one.cityId){
								checked = "active";
								flag = true;
							}
							html += '<li class="l mr10 '+checked+'" data-filt="city" data-id="'+one.cityId+'" >'+one.cityName+' ('+one.cityNum+')</li>';
						}
					}
					cityListEle.html(html);
					_filterRest();
				}
			}
			// 通过城市加载商圈
			function _loadBusiness(id){
				var data = "cityId=" + id, 
					businessActive = businessAreaListEle.find(".active");
				_businessHtml("");
				if(!id){
					return false;
				}

				businessDefault = businessActive.attr("data-id") || "";

				if(businessCache[id]){
					_businessHtml(businessCache[id]);
					_filterRest();
					return false;
				}

				businessAreaListEle.ajaxFn({
					url: businessAreaListEle.attr("data-url"),
					data:data,
					success: function(json){
						if(json.length){
							_businessHtml(json);
							businessCache[id] = json;
						}
					}
				});

				function _businessHtml(data){
					var one,html = "",data = data || [], checked = "", flag = false;

					for(var i=0;i<data.length;i++){
						one = data[i];
						checked = "";
						if(typeof one == "object"){
							if(businessDefault == one.id){
								checked = "active";
								flag = true;
							}
							html += '<li class="l mr10 '+checked+'" data-business="'+one.id+'" data-id="'+one.id+'" data-filt="business">'+one.name+'</li>';
						}
					}
					businessAreaListEle.html(html);
					_filterRest();
				}
			}
			// 首次进入加载所有城市
			_loadCity("all");


			// 根据筛选条件显示隐藏餐厅
			function _filterRest(){
				var filter = [], 
					value = operaRestNameEle.val(),
					showEle = catlogClickEle;

				catlogClickEle.hide();

				$.each(filterListEle.find(".active"),function(index,ele){
					var _obj = $(ele);
					filter.push("[data-"+_obj.attr("data-filt")+"="+_obj.attr("data-id")+"]");
				});
				// 筛选条件
				if(filter.length){
					showEle = restResultListEle.find(filter.join(""));
				}
				// 支持餐厅名中文、拼音、简拼；餐厅地址中文等信息搜索；
				if(value){
					$.each(showEle,function(index,ele){
						var _obj = $(ele), text = ( _obj.attr("data-simple-pinyin")|| "") + ( _obj.attr("data-pinyin")|| "") + ( _obj.find(".title").text()|| "")+ ( _obj.find(".addr").text()|| "") + ( _obj.attr("data-content")|| ""), keys = value.split(/\s+/g);

						for(var i=0;i<keys.length;i++){
							if(text.indexOf(keys[i]) != -1){
								_obj.show();
							}
						}
						
					});
					return false;
				}else if(showEle.length){
					showEle.show();
				}
			}
			// 地图
			(function(){
				var iframeEle = $("#mapRestList iframe");
				// 地图
				$(".mapRestList").on("click",function(){
					var src = iframeEle.attr("src"), 
						newSrc = xmsCore.changeUrl(mapHref, restDataFormEle.serialize());
					if(callTypeFlag){
						newSrc += "&call=1";
					}else{
						newSrc += "&call=2";
					}
					if(!src || newSrc != src){
				    	iframeEle.attr("src",newSrc);
					}
				});
			})();

			var filterListTime = "";
			filterListEle.on("click","li",function(){
				var obj = $(this);
				clearTimeout(filterListTime);
				filterListTime = setTimeout(function(){
					var parents = obj.closest("ul"), activeEle = "";
					if(obj.hasClass("active")){
						obj.removeClass("active");
					}else{
						parents.find("li").removeClass("active");
						obj.addClass("active");
					}
					activeEle = parents.find("li.active");
					if(obj.closest(".brandList").length){
						_loadCity(activeEle.attr("data-id"));
						return false;
					}
					if(obj.closest(".cityList").length){
						_loadBusiness(activeEle.attr("data-id"));
						return false;
					}
					_filterRest();
				},200);
			});

			restDataSearchEle.on("click",_filterRest);

			operaRestNameEle.on("keydown",function(event){
				var c = event.keyCode || event.which;
				if(c == 13){
					_filterRest();
				}
			});

			/* 
				新需求：所有状态的页面均新开下单页
			 */
			catlogClickEle.on("click","a",function(event){
				event.preventDefault();
				event.stopPropagation();
				var obj = $(this), href = obj.attr("href");

				if(!href){
					alert("缺少下单页链接地址");
					return false;
				}
				// 去下单
				href = xmsCore.xmsQueryUrl({
						url: href,
						fn: restDataFormEle.xmsSerialize()
					});

				href = xmsCore.xmsQueryUrl({
						url: href,
						fn: operaDateEle.attr("name")+"="+_removeWeekGetDate(operaDateEle.val())
					});
				/*  call=1为已选择来电类型
					call=2为未选择来电类型
				 */
				if(callTypeFlag){
					href += "&call=1";
				}else{
					href += "&call=2";
				}

				window.open(decodeURIComponent(href));
				return false;
			});
		})();
		// 头部选项卡
		(function(){
			// 选项卡
			var listTabEle = $(".listTab");
			listTabEle.on("click", "a", function (event) {
			    var obj = $(this),
			        url = obj.tab().attr("data-url"),
			        target = $(obj.attr("href")),
			        flag = obj.attr("data-flag");

			    if(flag != "true"){
			        obj.attr("data-flag","true");
			        target.load(url);
			    }
			});
			// 历史订单
			listTabEle.find(".active a").trigger("click");
		})();

	};
	xmsInet.callScreen = callScreen;

	// 下单页
	// 滚动条滚动到指定
	function _scroll(id){
		var obj = $(id), top = 0,
			headerEle = $(".new-header");

		if(!obj.length){
			return false;
		}
		top = obj.offset().top - headerEle.outerHeight() - 10;

		$(window).scrollTop(top);
	}
	// bootstrap按钮选中状态
	function _radioBtn(cancel){
		var obj = $(this), 
			thisInput = obj.find("input[type='radio']"),
			p = obj.closest(".btn-group[data-toggle='buttons']"),
			allBtn = null,
			allInput = null;

		if(!p.length || !thisInput.length){
			return false;
		}
		allBtn = p.children("label.btn"),
		allInput = allBtn.find("input[type='radio']")
		cancel = cancel || false;

		if(obj.hasClass("active") && cancel){
			obj.removeClass("active");
			thisInput.prop("checked",false);
		}else{
			allBtn.removeClass("active");
			allInput.prop("checked",false);
			obj.addClass("active");
			thisInput.prop("checked",true);
		}
	}
	var order = function(){
		var headerEle = $(".new-header");

		_init();
		function _init(){
			var docEle = $(document);
			
			//定位
			_setPosition();
			
			if(typeof SayBusy == "function"){
				SayBusy();
			}
			popover();
			
			ajaxSubmit();
			// 初始化待办事项
			sessionToDo();
			// 来电信息
			_o2oCallInfo();
			// 初始化模态框-全局变量
			window.mBox = new xmsCore.XMSMesBox({
		        obj: $("#o2oModal")
		    });
		    // 投诉
			(function(){
				var restEle = $("#callRest"), 
					restValueEle = $("#ResId"),
					data = "";

				if(restEle.length && restValueEle.length){
					data += "&"+restEle.attr("name")+"="+encodeURIComponent(restEle.val());
					data += "&"+restValueEle.attr("name")+"="+encodeURIComponent(restValueEle.val());
				}
				_complaintModal.call($(".Complaint"),{
					data : data,
					callback: function(){
						var complaintFormEle = $("#complaintForm"),
							callTypeEle = $("#callType"),
							callTypeFormEle = $("#callTypeForm");

						if(!callTypeFlag){
							complaintFormEle.ajaxFn({
								url: complaintFormEle.attr("data-url"),
								data: complaintFormEle.xmsSerialize()+"&timestamp="+(new Date()).getTime(),
								success:function(data){
									if(data.msg){
										alert(data.msg);
									}
									if(data.succ){
										if(callTypeEle.length){
											callTypeEle.remove();
										}else{
											callTypeFormEle.find(".cont_panel").remove();
											callTypeFormEle.find("[type='submit']").remove();
											$(".sub-title").text("导航");
										}
										callTypeFlag = true;
									}
								}
							});
						}
					}
				});
			})();

			// 转接
			_transferModal.call($(".Transfer"));

			// 返回头部
			$(".toTop").on("click",function(){
				_scroll("body");
			});

			// 点击“查询”
			var bookertelEle = $("#bookertel"),
				callInfoFormEle = $("#callInfoForm");

			$(".searchMember").on("click",function(){
				_o2oSearchMember.call(this,bookertelEle,callInfoFormEle);
			});
			_toDoFn();
		}
		
		function _setPosition(){
			var leftColumnEle = $("#leftColumn"),
				rightColumnEle = $("#rightColumn"),
				centerColumnEle = $(".new-center-column"),
				timer = 0,
				i = 0;
			
			function _set(){
				var headerHeight = headerEle.outerHeight() + 2;
				
				if(headerHeight < 150){
					clearTimeout(timer);
				}
				//如果第二次计算，还是计算失败，那么直接设置一个可允许的范围
				if( i === 1 && headerHeight >= 150){
					headerHeight = 150;
				}
				
				i++;
				
				leftColumnEle.css("top",headerHeight + "px");
				rightColumnEle.css("top",headerHeight + "px");
				centerColumnEle.css("margin-top",headerHeight + "px");
				
			}
			
			timer = setTimeout(_set,300);
			_set();	
		}

		// 订餐位
		(function(){
			var operaDateEle = $("#operaDate"),
				operaDateValue = operaDateEle.val(),
				operaNumEle = $("#operaNum"),
				restDataFormEle = $("#restDataForm"),
				timeTypeEle = $(".timeType"),
				oldDate = "",
				oldTimeType = false;

			// 附近分店	
			var nearStoreListEle = $(".nearStoreList");
					
			// 设置餐位
			var bookSeatEle = $("#bookSeat");

			// 可选时间
			var selTimeAndStoreEle = $(".selTimeAndStore"),
				selTimeListEle = $(".selTimeList");

			//	市别
			var timeTypeBtnEle = restDataFormEle.find(".btn-group .btn");

			//预排位提交按钮
			var reg_space = /\s+/g,
				table_catlogs = $("#table_catlogs"),
				catlogs_header = $(".catlogs_header"),
				catlogs = $(".catlogs li"),
				catlogs_list = $("#catlogs_list"),
				choiced_table = $("#choiced_table"),
				change_tables = $("#change_tables"),
				changed_content = change_tables.find(".can_changed"),
				precise_tables_catlogs = $("#precise_tables_catlogs"),
				tableSpecialName = $("#tableSpecialName").val() || "",
				isModefiyTables = choiced_table.find("a").size()?true:false;

			function _init(){
				// 日历
				_showWeekCalendar(operaDateEle);
				if(operaDateValue){
					_changeDate.call(operaDateEle,true);
				}
				operaDateEle.on("keydown",preventDefault);
				unloadFn("您选定的餐位还未提交，当前操作会导致已选餐位失效，是否继续？",function(e){
					selectTableFn.unbind(selectTableFn.getAllSelectTable().join(","));
				});
			}
			_init();

			// 选择就餐日期
			function _changeDate(firstLoad){
				var obj = $(this), value = obj.val();

				if(!value){
					return false;
				}

				// 首次加载页面不清空
				if(!firstLoad){
					// 清空已有可选时间
					_emptySelTime();
					// 清空已有可选餐位
					_emptySelSeat();
					// 清空已选餐位
					_emptyCheckedSeat();
					// 清空已有附近分店
					_emptyNearStoreList();	
				}

				// 选择就餐日期，提交请求获取就餐时间
				operaDateEle.ajaxFn({
					url: operaDateEle.attr("data-url"),
					data: xmsCore.xmsQueryParam({
							"data": restDataFormEle.xmsSerialize(),
			    			"replace": operaDateEle.attr("name")+"="+_removeWeekGetDate(value)
			    			}),
					success: function(data){
						if(data){
							// 显示就餐时间
							_showRestBookerDate(data,firstLoad);
							
							// 修改餐厅信息
							_changeRestInfo();
							_setBookerInfo();
						}
					}
				});
				return false;
			}
			
			operaDateEle.on('changeDate',function(){
				_changeDate.call(this);
			});

			// 餐厅信息
			function _changeRestInfo(){
				var restAjaxInfoEle = $(".restAjaxInfo"),
					restBusinessTimeEle = $(".restBusinessTime"),
					restBookTimeEle = $(".restBookTime"),
					restInfoNumEle = $(".restInfoNum");

				restAjaxInfoEle.ajaxFn({
					url:restAjaxInfoEle.attr("data-url"),
					data:operaDateEle.attr("name")+"="+_removeWeekGetDate(operaDateEle.val()),
					success:function(data){
						if(data.succ){
							restBusinessTimeEle.html(data.time);
							restBookTimeEle.html(data.book);
							restInfoNumEle.html(data.num);
						}
					}
				});
			}

			// 选择就餐时间
			var bookerTimeInputEle = $(".bookerTimeInput");
			function _changeTime(event,firstLoad){
				var obj = $(this),
					timeType = obj.attr("data-type"),
					timeTypeEle = $(".timeType[value="+timeType+"]"),
					checkedEle = null;

				if(!obj.is(":visible")){
					return false;
				}
				// 首次加载不清空
				if(!firstLoad){
					// 清空可选餐位
					_emptySelSeat();
					// 清空已选餐位
					_emptyCheckedSeat();
					// 清空已有附近分店
					_emptyNearStoreList();
					checkedEle = $(".sel-time.active");
					if(checkedEle.length){
						checkedEle.removeClass("active");
						checkedEle.find(".operaTime").prop("checked",false);
					}
				}

				obj.addClass("active");
				obj.find(".operaTime").prop("checked",true);

				_radioBtn.call(timeTypeEle.closest("label.btn"),false)
				_showHideTime(timeType);

				// 请求加载餐位
				nearStoreListEle.removeClass("ajaxNewFn_please_wait").html("");
				nearStoreListEle.ajaxFn({
					url: nearStoreListEle.attr("data-url"),
					data: xmsCore.xmsQueryParam({
							"data": restDataFormEle.xmsSerialize()+"&"+selTimeAndStoreEle.xmsSerialize(),
			    			"replace": operaDateEle.attr("name")+"="+_removeWeekGetDate(operaDateEle.val())
						}),
					success: function(data){
						_setNearStore(data);
					}
				});
				if(obj.hasClass("unable")){
					return false;
				}
				_loadSeat.call(obj);
			}

			// 请求加载餐位
			function _customChangeTime(){
				var hour = nearStoreListEle.find(".newByHour").val(),
					min = nearStoreListEle.find(".newByMin").val(),
					value = 0,
					reqData = "";
				
				if(hour === "" || min === ""){
					return "";
				}
				
				value = hour*3600+min*60;
				
				if(isNaN(value)){
					return "";
				}
				
				reqData = xmsCore.xmsStrToObj(restDataFormEle.xmsSerialize()+"&"+selTimeAndStoreEle.xmsSerialize());
				
				reqData.operaTime = value;
				reqData = xmsCore.xmsObjToStr(reqData);
				nearStoreListEle.prop("selectTime",hour+":"+min);
				
				nearStoreListEle.ajaxFn({
					url: nearStoreListEle.attr("data-url"),
					data: xmsCore.xmsQueryParam({
							"data": reqData,
			    			"replace": operaDateEle.attr("name")+"="+_removeWeekGetDate(operaDateEle.val())
						}),
					success: _setNearStore
				});
				
			}
			nearStoreListEle.on("change",".newByHour,.newByMin",_customChangeTime);
			/*
				后台返回json格式
				[{
					"typeName":"早市1",  // 市别名称
					"typeId":"1", // 市别id
					"timeList":[{  // 该市别下所有时间
						"timeType":1, // 属于午市还是晚市
						"time":"14:00", // 
						"unable":false, // 是否不可预订
						"msg":"" // 不可预订原因
					}]
				}]
			*/
			// 设置可选时间
			function _showRestBookerDate(data,firstLoad){
				var ableFlag = false,
					oldTime = bookerTimeInputEle.val(),
					checkedFlag = "",
					msg = "",
					len = data.length,
					result = {};

				if(!len){
					selTimeListEle.html("<div class='c-red'>没有可供订座时间</div>");
					return false;
				}
				result = _bookerDateHtml(data);
				checkedFlag = result.checkedFlag;

				selTimeListEle.html(result.html);
				if(checkedFlag){
					_changeTime.call($(".operaTime[value="+checkedFlag+"]").closest(".sel-time"),firstLoad);
				}else{
					// 自动筛选所选市别
					timeTypeEle.filter(":checked").closest(".btn").trigger("click");
				}
			}

			// 合成可预订时间html
			function _bookerDateHtml(data){
				var html = "", len = data.length,
					oldTime = bookerTimeInputEle.val(),
					checkedFlag, len1, one, timeList, time, typeHtml, timeHtml;

				for(var i=0;i<len;i++){
					typeHtml = "";
					timeHtml = "";
					one = data[i];
					timeList = one.timeList;
					len1 = timeList.length;

					// 市别名称
					typeHtml = '<div class="sel-time-type" data-id="'+one.typeId+'">'+one.typeName+'</div>';

					for(var j=0;j<len1;j++){
						time = timeList[j];
						ableFlag = time.unable?"unable":"";
						if(oldTime==time.time && ableFlag!="unable"){
							checkedFlag = time.timeId;
						}
						msg = time.msg ? "data-placement='top' data-content='"+time.msg+"'":"";

						timeHtml += '<span class="sel-time '+ableFlag+'" '+msg+' data-type="'+time.timeType+'" >'+time.time+'<input type="radio" name="operaTime" class="dn operaTime" value="'+time.timeId+'" data-uid="'+time.uid+'"/></span>';
						
					}
					if(timeHtml){
						timeHtml = '<div class="sel-time-type-cont">'+timeHtml+'</div>';

						html += '<li>'+typeHtml+timeHtml+'</li>';
					}
				}
				return {html: html,checkedFlag: checkedFlag};
			}

			// 订单信息
			var bookerDateEle = $(".bookerDate"),
				bookerTimeEle = $(".bookerTime"),
				bookerNumEle = $(".bookerNum"),
				bookerDateInputEle = $(".bookerDateInput"),
				bookerNumInputEle = $(".bookerNumInput");

			function _setBookerInfo(){
				var date = operaDateEle.val() || "",
					time = selTimeListEle.find(".sel-time.active").filter(":visible").text() || "",
					num = operaNumEle.val() || "";

				bookerDateEle.html(date);
				bookerTimeEle.html(time);
				bookerNumEle.html(num);

				bookerDateInputEle.val(_removeWeekGetDate(date));
				bookerTimeInputEle.val(time);
				bookerNumInputEle.val(num);
			}

			// 选择市别, 隐藏显示可选时间
			function _selTimeType(event,firstLoad){
				var obj = $(this), 
					inputEle = obj.find(".timeType"),
					timeActive = selTimeListEle.find(".sel-time").filter(".active");

				if(!obj.length){
					return false;
				}

				_radioBtn.call(this,true);
				_showHideTime(timeTypeEle.filter(":checked").val() || "");
				
				// 首次加载不清空
				if(!firstLoad){
					// 清空时间、餐位、附近分店
					timeActive.removeClass("active");
					timeActive.find(".operaTime").prop("checked",false);
					_emptySelSeat();
					_emptyNearStoreList();
					_emptyCheckedSeat();
					_setBookerInfo();
				}
				return false;
			}
			function _showHideTime(type){
				var li = selTimeListEle.find("li"),
					timeArr = selTimeListEle.find(".sel-time");

					
				if(!type){
					// 没有选择任一市别
					li.show();
					timeArr.show();
				}else{
					// 选择某一市别
					li.hide();
					timeArr.hide();	
					timeArr.filter("[data-type='"+type+"']").show();
					// 某一市别所有时间均不符合条件时隐藏该市别
					$.each(li,function(index,ele){
						var _obj = $(ele);
						if(_obj.find("[data-type='"+type+"']").length){
							_obj.show();
						}
					});
				}
			}

			// 验证是否选择日期、时间
			function _validBooker(){
				if(!operaDateEle.val()){
					xmsCore.basic_method.errorTip(operaDateEle,"请选择订座日期！");
					return false;
				}
				if(!$(".operaTime:checked").length){
					xmsCore.basic_method.errorTip(selTimeListEle,"请选择订座时间！");
					return false;
				}
				return true;
			}

			// 加载餐位
			function _loadSeat(){
				var obj = $(this), data = "",url = catlogs_list.attr("data-url"),timeEle = $(".operaTime:checked");

				if(_validBooker() && obj.length){
					selectTableFn.uid = timeEle.attr("data-uid");
					data = xmsCore.xmsQueryParam({
						"data": restDataFormEle.serialize()+"&"+timeEle.attr("name")+"="+timeEle.val(),
		    			"replace": operaDateEle.attr("name")+"="+_removeWeekGetDate(operaDateEle.val())
					});

					catlogs_list.xmsLoadHtml({
						fn: data,
						succ: search_callback["table_search"]
					});
					_setBookerInfo();
				}
			}

			//监控当前选中的餐位变化，用于锁定对应的餐位
			var selectTableFn = {
				curSelectTables:[],
				
				selectTableTimer:null,
				//保存uid，uid只有在bind时，才会进行更改
				//确切的说，只有在两次查找餐位时，才会修改uid的值。
				uid:"",
				
				url:choiced_table.attr("data-url"),
				
				ajaxBindTable:function (tableId,type,fn){
					/*
						type=bind/unbind分别表示为锁定座位，和解除锁定座位
						tableId为需要锁定和解锁的餐位，字符串
						fn为绑定或者解绑成功后的回调函数
					*/
					var reqArr = [],
						uid = selectTableFn.uid || (isModefiyTables?$(".operaTime:checked").attr("data-uid"):"");
						//uid优先获取保存到selectTableFn属性上的uid，如果没有则直接去获取
						//operaMinu.attr("data-uid") || "";
						
					if(!uid){
						alert("锁定餐位时，时间UID未获取到，请联系技术，关键字：ajaxBindTable！");
						return false;
					}
					reqArr.push(xmsCore.xmsQueryParam({
						"data": restDataFormEle.serialize(),
		    			"replace": operaDateEle.attr("name")+"="+_removeWeekGetDate(operaDateEle.val())
					}));
					reqArr.push(selTimeAndStoreEle.serialize());
					reqArr.push("action="+type+"&tableId="+tableId+"&uid="+uid);

					choiced_table.removeClass("ajaxNewFn_please_wait");
					choiced_table.ajaxFn({
						url:selectTableFn.url,
						data:reqArr.join("&"),
						success:fn
					});
				},
				
				getAllSelectTable:function(){
					var allLink = choiced_table.children("a"),
						newSelectTable = [];
					
					allLink.each(function(){
						newSelectTable.push($(this).attr("data-id"));
					});
					
					return newSelectTable;
				},
				
				modefiSelectedTable:function(e){
				
					var newSelectTable = selectTableFn.getAllSelectTable(),
						newAdd = [],
						newDel = [],
						delStr = ','+selectTableFn.curSelectTables.join(",,")+',',
						i = 0,len = 0,one = "";
					
					for(i=0,len = newSelectTable.length;i<len;i++){
						one = ','+newSelectTable[i]+",";
						if(delStr.indexOf(one) != -1){
							//存在，则在delStr字符串中删掉该数据
							delStr = delStr.replace(one,"");
						}else{
							//不存在，则表示为新添加数据
							newAdd.push(newSelectTable[i]);
						}
						
					}
					delStr = delStr.substring(1,(delStr.length-1));
					newDel = delStr.replace(/,+/g,",");
					newAdd = newAdd.join(",");
					
					selectTableFn.curSelectTables = newSelectTable;
					
					if(newDel){
						selectTableFn.unbind(newDel);
					}
					if(newAdd){
						//selectTableFn.bind(newAdd);
						//bind餐位，放在每次bind的具体部分去
					}
				},
				
				bind:function(tableId,fn){
					selectTableFn.ajaxBindTable(tableId,"bind",fn);
				},
				
				unbind:function(tableId){
					selectTableFn.ajaxBindTable(tableId,"unbind");
				},
				
				isbind:function(tableId,fn){
					selectTableFn.ajaxBindTable(tableId,"isbind",fn);
				},
				
				changeIds:function(ids,id){
					ids = ","+ids+",";
					id = ","+id+",";
					
					if(ids.indexOf(id) != -1){
						ids = ids.replace(id,",");
					}
					return ids == ","?"":ids.substring(1,(ids.length-1));
				},
				init: function(){
					var allLink = choiced_table.children("a");
					catlogs_list.unbind("loadHtmlSucc");
					allLink.each(function(){
						var obj = $(this), num = obj.attr("data-num"), 
							id = obj.attr("data-id"),
							liEle = catlogs_list.find("li[data-num='"+num+"']"),
							ids = "";

						selectTableFn.curSelectTables.push(id);
						if(liEle.length){
							ids = liEle.attr("data-ids");
							ids += ids ? "," + id : id;

							liEle.attr("data-ids",ids);
						}
					});
				}
			};

			// 修改订单时
			catlogs_list.on("loadHtmlSucc",selectTableFn.init);

			choiced_table.on("DOMSubtreeModified",function(e){
				clearTimeout(selectTableFn.selectTableTimer);
				var that = this;
				selectTableFn.selectTableTimer = setTimeout(function(){
					selectTableFn.modefiSelectedTable.call(that,e);
				},50);
			});

			//根据标签，刷新餐位数量的计算模块
			function reflashNums(obj){
				var objLi = obj.closest("li"),
					objNum = objLi.find("span[data-type=num]"),
					objTags = objLi.find(".tag.active"),
					tagsLen = objTags.size(),
					allRooms = objLi.attr("data-ids") || "",
					addRoomsArr = allRooms?allRooms.replace(/\s+/g,"").split(","):[],
					selectedD = objNum.attr("data-selected"),
					selectedRooms = selectedD?","+selectedD+",":"",
					roomsObj = {},
					i,
					resArr = [];
				
				
				if(tagsLen == 0){
					//如果选中的标签数为0，则显示可选的座位，并结束该逻辑
					for(i=0,len=addRoomsArr.length;i<len;i++){
						roomsObj[addRoomsArr[i]] = 1;
					}
				}
				
				objTags.each(function(){
					var obj = $(this),
						roomsString = obj.attr("data-ids") || "",
						rooms = roomsString?roomsString.replace(reg_space,"").split(","):[],
						i=0,len = rooms.length,curNum = 0;
					
					for(;i<len;i++){
						curNum = roomsObj[rooms[i]];
						if(!curNum){
							roomsObj[rooms[i]] = 1;
						}else{
							roomsObj[rooms[i]] = ++curNum;
						}
					}
				});

				for(i in roomsObj){
					if((selectedRooms.indexOf(","+i+",") == -1) && (roomsObj[i] >= tagsLen)){
						if(i){
							resArr.push(i);
						}
					}
				}
				
				objNum.attr("data-ids",resArr.join(","));
				objNum.text(resArr.length);
				return false;
			}

			function changeSelectTables(obj,oldId,newId){
				if(!obj.size() || !oldId){
					//如果这两个值，有一个为无效值，则不进行下面的处理
					return false;
				}
				
				var list_obj_num = obj.find("span[data-type=num]"),
					i=0,len=0,oldIds = null,
					unSelectedStr = list_obj_num.attr("data-ids"),
					selectedStr = list_obj_num.attr("data-selected");
				if(newId){
					//如果有可更新的值，则为更换
					unSelectedStr = replaceFromStr(unSelectedStr,newId,",",oldId);
					selectedStr = replaceFromStr(selectedStr,oldId,",",newId);
				}else{
					//如果newId为空，则表示把oldId删掉
					oldIds = oldId.split(",");
					for(len = oldIds.length;i<len;i++){
						unSelectedStr = replaceFromStr(unSelectedStr,oldIds[i]);
						selectedStr = replaceFromStr(selectedStr,oldIds[i]);
					}
					var allIds = obj.attr("data-ids");
					if(allIds){
						allIds = selectedStr?allIds+","+selectedStr:allIds;
					}
					obj.attr("data-ids",allIds);
				}
				list_obj_num.attr("data-ids",unSelectedStr).attr("data-selected",selectedStr);
				
				//如果更改餐位，则需要刷新数量
			}

			function replaceFromStr(str,key,sep,newKey){
				sep = sep || ",";
				newKey = newKey || "";
				
				if(str == key || !str){
					return newKey?newKey:"";
				}
				var douSep = sep+sep,
					str = sep+str.split(sep).join(douSep)+sep,
					key = sep+key+sep;
					
				str = str.replace(key,"");
				if(newKey && str.indexOf(","+newKey+",") == -1){
					str += ","+newKey+",";
				}
				str = str?str.substring(1,str.length-1).split(douSep).join(sep):"";
				return str;
			}
			
			//平面图部分的相关代码。
			var pingmiantuFn = function (){
				
				var pingmian = catlogs.find(".pingmiantu"),
					cur_floor = "",
					eleWidth = catlogs_list.width(),
					floor = "",
					floors = "",
					tables = "",
					myModalInfo = null,
					loadImg = xmsCore.loadImg;
				
				//切换楼层的事件处理
				table_catlogs.on("click",".floor",function(){
					var obj = $(this);
					
					if(obj.hasClass("a_active")){
						return false;
					}
					
					floor.removeClass("a_active");
					
					changeData(storeFloor(obj));
					
					return false;
				});
				
				//点击选中，或者取消的事件
				table_catlogs.on("click",".table_item",function(){
					var _obj = $(this),
						tableId = _obj.attr("data-tableId"),
						tableObj = tables["t"+tableId],
						table = tableObj.table,
						item = table.item || "";
					
					if(_obj.hasClass("table_disabled")){
						alert("该餐位属于自留餐位，不可选择！");
						return false;
					}else if(_obj.hasClass("table_ordered")){
						alert("该餐位已经被预订，不可重复选择！");
						return false;
					}
					
					if(tableObj.hasClass("table_active")){
						//如果有，则点击时，再删除选中
						tableObj.removeClass("table_active");
						
						if(item instanceof $){
							item.remove();
						}
					}else{
						//否则，执行选中操作
						if(myModalInfo == null){
							myModalInfo = initMyModal();
						}
						
						myModalInfo.setContent(table);
						myModalInfo.setCallback(function(){
							selectTableFn.bind(tableId,function(data){
								if(data.bindTables === tableId){
									tableObj.addClass("table_active");
									var item = table.item,
										tableName = "",
										detail = "";
										
									if(!item){
										tableName = table.tableName;
										detail = table.detail;
										detail += detail? " ":""; 
										item = $('<a href="javascript:void(0);" class="icon_item catlogs_alike_btn mb5 rel" style="padding-right:18px;" data-id="'+tableId+'" data-maxnum = "'+(table.maxnum || "")+'" data-minnum = "'+(table.minnum || "")+'">'+detail+tableName+'<span class = "glyphicon glyphicon-remove remove_icon_item" data-id="'+tableId+'"></span></a>');
										
										table.item = item;
									}
									
									choiced_table.append(item);
									//bindTables有值，表示锁定成功。
									//锁定成功，不需要再进行额外的处理。
									//精确定位时，如果定位的餐桌，与需要绑定的餐桌不同，则~~~
								}else{
									//如果锁定失败，则处理掉，并把对应的元素删除
									var bindMsg = data.bindMsg || "锁定餐位失败，请重新操作";
									if(bindMsg){
										alert(bindMsg);
										//如果有失败原因，则提示
									}
									if(data.orderTables == tableId){
										tableObj.hide();
										//如果该餐位已经被预定出去，
										//则把该餐位隐藏，不可再被选择
									}
								}
							});
							myModalInfo.hide();
						});
						
						myModalInfo.show(_obj.position());
					}
				});
				
				//给删除按钮，添加一个点击事件
				choiced_table.on("click",".remove_icon_item",function(){
					
					var tableId = $(this).attr("data-id"),
						tableObj = tables["t"+tableId],
						table = tableObj.table,
						item = table.item || "";
					
					if(confirm("确认要删除"+table.tableName+"餐位吗？")){
						
						if(tableObj instanceof $){
							tableObj.removeClass("table_active");
						}
						item.remove();
					}
				});
				
				function init(html){
					//如果获取的内容为空时，则直接隐藏平面图的入口
					//http://jira2.10105757.com/browse/BC-2051
					if(html == ""){
						pingmian.hide();
						return false;
					}
					pingmian.show();
					cur_floor = $(".cur_floor").eq(0);
					floor = $(".floor").removeClass("table_active");
					floors = {};
					tables = {};
					if(floor.size()){
						cur_floor.show();
						changeData(storeFloor(floor.eq(0)));
					}else{
						cur_floor.hide();
					}
				}
				
				function initMyModal(){
					var _myModal = $("#tableInfoList"),
						closeBtn = _myModal.find(".table_info_list_close"),
						content = _myModal.find(".table_info_detail"),
						applyBtn = _myModal.find(".table_info_select"),
						callback = null,
						infoTemp = content.html(),
						parentWidth = table_catlogs.width();
					
					function creatHtml(obj){
						var html = infoTemp.replace(/\{([^\}]+)\}/g,function(p1,p2){
							var value = "&nbsp;";
							
							if(p2 in obj){
								value = obj[p2];
							}
							
							return value;
						});
						
						return html;
					}
					
					function _setContent(obj){
						var html = "",
							objType = typeof obj;
						if(objType == "string"){
							html = obj;
						}else if(objType == "object"){
							html = creatHtml(obj);
						}
						
						content.html(html);
					}
					
					function _setCallback(fn){
						callback = fn || "";
					}
					
					function _show(css){
						var width = _myModal.width();
							
						if( (css.left + width - parentWidth) > 0 ){
							css.left = parentWidth - width - 10;
							css.top = css.top + 10;
						}
						
						_myModal.css(css).show();
						
					}
					
					function _hide(){
						_myModal.hide()
					}
					
					applyBtn.on("click",function(){
						if(typeof callback == "function"){
							callback.call(_myModal);
						}
					});
					
					closeBtn.on("click",_hide);
					
					$(document).on("click",function(e){
						var target = $(e.target).closest("#tableInfoList,.table_item");
						
						if(!target.size()){
							_hide();
						}
						
					});
					
					return {
						setContent:_setContent,
						setCallback:_setCallback,
						show:_show,
						hide:_hide
					}
				}
				
				function storeFloor(floor){
					var floorStr = "f"+floor.attr("data-floor"),
						data = floors[floorStr] || "";
					
					//把楼层的信息，缓存到floor对象中去
					if(!data){
						data = floor.attr("data-tabledata") || "";
						try{
							data = typeof data == "object"?data:$.parseJSON(data);
							floors[floorStr] = data;
						}catch(e){
							throw new TypeError(e.message);
						}
					}
					
					floor.addClass("a_active");
					
					return data;
				}
				
				function changeData(data){
					//data格式
					/*{
						floorId:1,
						img:"img/bg.jpg",
						tables:[{
							tableId:"A101",
							tableName:"A101name",
							x:"446",
							y:"300",
							detail:"对于该餐位的描述",
							tableType:"table_disabled/tabled_userful/table_ordered",
							imgs:["img/banner1.jpg"]
						},{
							tableId:"A102",
							tableName:"A102name",
							x:"21",
							y:"11",
							detail:"对于该餐位的描述2",
							imgs:[]
						},{
							tableId:"A103",
							tableName:"A103name",
							x:"803",
							y:"311",
							detail:"对于该餐位的描述3",
							imgs:[]
						}]
					}*/
					data = data || "";
					
					if(!data){
						return "";
					}
					
					data = typeof data == "object"?data:$.parseJSON(data);
					
					var src = data.img || "";
					
					if(src){
						cur_floor.css({
							"height":"auto",
							"background-image":"none"
						}).html('<span class = "p10">正在加载餐位图...</span>');
						
						loadImg(src,function(){
							var imgWidth = this.width,
								imgHeight = this.height,
								scale = imgWidth/eleWidth,
								css = {"background-image":"url("+this.src+")"};
							
							css.height = Math.ceil(imgHeight/scale);
							
							//设置样式，并且生成html代码
							cur_floor.css(css).empty();
							addTables(data.tables,scale,{imgX:imgWidth,imgY:imgHeight});
						});
					}else{
						//如果没有平面图
						cur_floor.css({
							"height":"auto",
							"background-image":"none"
						}).html('<span class = "p10">暂无平面图...</span>');
					}
				}
				
				//创建table的元素
				function addTables(tableArr,scale,img){
					tableArr = tableArr instanceof Array?tableArr:[];
					img = img instanceof Object?img:{};
					
					var i = 0,
						len = tableArr.length,
						one = null,
						tableId = "",
						tableStr = ""
						html = "",
						imgX = img.imgX  || 1,
						imgY = img.imgY  || 1;
						
					for(i;i<len;i++){
						one = tableArr[i];
						tableId = one.tableId;
						tableStr = "t"+tableId;
						html = tables["t"+tableId] || "";
						
						if(!html){
							html = $('<span class = "table_item '+(one.tableType || "")+'" style = "left:'+one.x*imgX/scale+'px;top:'+one.y*imgY/scale+'px;" data-tableId = "'+tableId+'" ></span>');
							html.table = one;
							tables[tableStr] = html;
						}
						
						cur_floor.append(html);
					}
					
				}
				
				function load(){
					$(".floors_list").loadHtml("",init);
				}
				return {
					load:load
				}
			}();

			//精确查找时，处理的选中与取消的模块
			var precise_tables_catlogs = $("#precise_tables_catlogs"),
				precise_Table_num = $("#precise_Table_num"),
				catlogs_more = $(".catlogs_more");
				// table_catlogs = $(".table_catlogs");

			var search_callback = {
				clickFirstTag:function (){
					//触发全部的点击按钮
					catlogs.eq(0).trigger("click");
				},
				removeListContent:function(){
					catlogs_list.html("");
				},
				removePreciseContent:function(){
					precise_tables_catlogs.html("");
				},
				table_search:function(html){
					if(!html){
						html = '<div class="tc red" style="line-height:70px;">没有合适的餐位</div>';
						catlogs_list.html(html);
					}
					precise_Table_num.val("");
					catlogs.attr("data-to","catlogs_list");
					precise_tables_catlogs.parent().slideUp(search_callback.removePreciseContent);
					catlogs_list.parent().slideDown();
					search_callback.changeNav(catlogs_list);
					
					if(pingmiantuFn && typeof pingmiantuFn.load == "function"){
						setTimeout(pingmiantuFn.load,100);
					}
				},
				precise_table_search:function(html){
					html = html || '<div class="tc red" style="line-height:70px;">没有合适的餐位</div>';
					precise_tables_catlogs.html(html);
					
					catlogs.attr("data-to","precise_tables_catlogs");
					precise_tables_catlogs.parent().slideDown();
					catlogs_list.parent().slideUp(search_callback.removeListContent);

					$(".pingmiantu").closest("li[role='presentation']").hide();
					catlogs.filter(".active").removeClass("active");
					// catlogs.filter("[data-catlog='0']").show().removeClass("active");
					// catlogs.filter("[data-catlog='pingmiantu']").show().removeClass("active");
					// search_callback.changeNav(precise_tables_catlogs);
				},
				changeNav:function(dataTo){
					//改变对应的nav的显示和隐藏
					//dataTo为目标的元素框
					catlogs.each(function(index,item){
						if(index == 0){
							return true;
						}
						
						var obj = $(this),
							catlogType = obj.attr("data-catlog"),
							findObj = dataTo.find("[data-catlog="+catlogType+"]");

						if(findObj.size() > 0){
							obj.show();
						}else{
							obj.hide();
						}
					});
				}
			};

			var bookertelEle = $("#bookertel");
			function setPreciseTable(){
				var obj = $(this), value = obj.val(), data = "", timeEle = null,url = precise_tables_catlogs.attr("data-url");
				if(!_validBooker()){
					return false;
				}
				timeEle = $(".operaTime:checked");
				data = restDataFormEle.serialize()+"&"+selTimeAndStoreEle.serialize()+"&"+bookertelEle.attr("name")+"="+bookertelEle.val()+"&"+obj.attr("name")+"="+value+"&"+"uid="+timeEle.attr("data-uid");

				data = xmsCore.xmsQueryParam({
					"data": data,
	    			"replace": operaDateEle.attr("name")+"="+_removeWeekGetDate(operaDateEle.val())
				});
				_emptyCheckedSeat();
				obj.ajaxFn({
					url:url,
					dataType:"html",
					data:data,
					success:search_callback["precise_table_search"]
				});
				return false;
			}
			// 精确选位 - 下单
			precise_tables_catlogs.on("click","a[data-id]",function(){
				//精确查找时，点击会执行选中或者取消
				var obj = $(this),
					tableId = obj.attr("data-id"),
					choicedIdObj = choiced_table.find("a[data-id="+tableId+"]"),
					newAObj = null;
				
				if(obj.hasClass("disabled")){
					return false;
				}
				
				if(choicedIdObj.size() == 0){
					
					//此时表示需要选中，那么执行bind操作
					selectTableFn.bind(tableId,function(data){
						var type = obj.find(".table_type"),
							num = obj.find(".table_num");
						if(type.length){
							type = type.text();
						}else{
							type = "";
						}
						if(num.length){
							num = num.text();
						}else{
							num = "";
						}
						if(data.bindTables === tableId){
							obj.addClass("a-red");
							choiced_table.append('<a href="javascript:void(0);" class="precise_choiced_item catlogs_alike_btn mb5 rel" style="padding-right:18px;" data-id="'+tableId+'" data-maxNum = "'+obj.attr("data-maxNum")+'">'+type+' '+num+'<span class = "glyphicon glyphicon-remove remove_choiced_item"></span></a>');
							//bindTables有值，表示锁定成功。
							//锁定成功，不需要再进行额外的处理。
							//精确定位时，如果定位的餐桌，与需要绑定的餐桌不同，则~~~
						}else{
							//如果锁定失败，则处理掉，并把对应的元素删除
							var bindMsg = data.bindMsg || "锁定餐位失败，请重新操作";
							if(bindMsg){
								alert(bindMsg);
								//如果有失败原因，则提示
							}
							if(data.orderTables == tableId){
								obj.addClass("disabled");
								//如果该餐位已经被预定出去，
								//则把该餐位禁止再选
							}
						}
					});
					
				}else{
					obj.removeClass("a-red");
					choicedIdObj.remove();
				}
				
				return false;
			});
			// 精确选位输入框 回车
			precise_Table_num.on("keydown",function(event){
				var c = event.keyCode || event.which
				if(c == 13){
					setPreciseTable.call(this);
				}
			});

			//精确查找时，处理更多按钮的动作
			catlogs_more.eq(1).on("click",preciseSearchMore);
			
			function preciseSearchMore(){
				//计算需要显示的模块
				var lists = precise_tables_catlogs.find("li"),
					activeType = $("ul.catlogs li.active").attr("data-catlog");
				
				if(activeType == 0){
					lists.show();
				}else{
					lists.hide();
					precise_tables_catlogs.find("li[data-catlog="+activeType+"]").show();
				}
			}
			function tablesShows(){
				var lists = catlogs_list.find(".catlogs_list");
				lists.each(function(){
					var obj = $(this);
					obj.show();
					if(obj.find("li:visible").size() == 0){
						obj.hide();
					}
				});
			}
			
			// 提交下单信息
			(function(){
				var operaNum = $(".bookerNumInput"),
					//输入的就餐人数的元素
					orderTableIds = $(".orderTableIds"),
					//最后的订单总量的隐藏元素，保存餐位的id信息
					orderSubmit = $("#bookInfoForm"),
					callInfoFormEle = $("#callInfoForm"),
					//表单提交的form元素的id
					memberSex = $(".memberSex"),
					//性别，必须要选择的
					name = $("#bookername"),
					// 餐厅id
					// ResId = $(".ResId"),
					optAllSubmit = $(".optAllSubmit"),
					//表单提交的按钮
					operaTime = $(".bookerTimeInput"),
					orderSubmitTimer = null,
					// preBookOrder = $(".preBookOrder"),
					//预排位提交按钮
					choiced_table = $("#choiced_table"),
					// timeInputAuto = $(".timeInputAuto"),
					inputDate = $(".bookerDateInput"),
					operaTel = $("#bookertel"),
					confirmorderskill = $("#confirmorderskill"),
					callTypeFormEle = $("#callTypeForm");
				
				function orderSubmitCallback(json){
					//json = typeof json == "string"?$.parseJSON(json):json;
					//clearTimeout(orderSubmitTimer);
					if(json.succ == true){
						window.close();
					}
				}
				
				var mbox = new Mesbox({
					title:"提交订单",
					applyName:"提交",
					cancelName:"取消"
				});
				var mboxHeader = mbox.options.header;
				function submitForm(url){
					var url = url || orderSubmit.attr("action"),
						type = orderSubmit.attr("method") || "post",
						sourceEle = $(".sourceRemark").find("input:checked"),
						data = orderSubmit.serialize()+"&"+callInfoFormEle.serialize();
					if(sourceEle.length){
						data += "&"+sourceEle.attr("name")+"="+sourceEle.val();
					}
					if(!url){
						alert("when submitForm function, need URL!");
						return false;
					}

					mbox.reDefineMbox({
						type:"ajax",
						title:"提交订单",
						ajaxOptions:{
							url:url,
							type:type,
							data:data,
							success:function(data){
								data = typeof data == "string"?$.parseJSON(data):data;
								var title = "",
									msg = "";
								if(data.succ){
									title = "操作成功";
									msg = data.msg;
								}else{
									title = "<span style = 'color:#f00;'>操作失败</span>";
									msg = "<span class = 'icon-remove' style = 'color:#f00;font-size:2em;'></span><span style = 'color:#f00;font-size:2em;font-weight:blod;padding-left:5px'>"+data.msg+"</span>";
								}
								
								if(data.msg){
									mbox.reDefineMbox({
										title:title,
										type:"alert",
										getContent:msg,
										applyFn:function(){
											if(data.succ){
												/*  原始需求 下单成功后修改订单状态、删除下单按钮 
													新需求   下单成功后关闭下单页
												*/
												
												// 下单成功后修改状态
												/*$(".bookerStatus").text("已下单");
												optAllSubmit.remove();
												orderInfoEle = $("#orderInfo");
												orderInfoEle.addClass("rel").append("<div style='position:absolute;top:0;bottom:0;left:0;right:0;z-index:3;'>&nbsp;</div>");*/

												// 如果没选择来电类型，默认来电类型为预订成功
												var submitEle = callTypeFormEle.find("[type='submit']");
												if(submitEle.length){
													callTypeFormEle.find("[type='checkbox'],[type='radio']").prop("checked",false);
													callTypeFormEle.find("[type='radio'][value='14']").prop("checked",true);
													submitEle.trigger("click");
												}
												// 关闭页面
												window.onbeforeunload = null;
												// 修改为空闲状态
												if(typeof SayFree == "function"){
													SayFree();
												}
												setTimeout(function(){
													window.close();
												},500);
											}
										}
									});
								}
							}
						}
					});
				}
				
					
				function ajaxCheck(obj){
					var url = callInfoFormEle.attr("action"),
						arr = [],
						time = inputDate.val().split("-");

					function getContent(){
						var tablesMsg = [],
							confirmorderskillStr = confirmorderskill.val();
						choiced_table.find(".choiced_item").each(function(){
							tablesMsg.push($(this).text());
						});
						
						if(confirmorderskillStr){
							
							confirmorderskillStr = "<br /><span>"+confirmorderskillStr+"</span>";
						}

						var resMsg = '<span style = "font-size:18px;font-weight:bold;">'+name.val()+memberSex.find("option:selected").text()+"（"+operaTel.val()+"），最后和您核对下：</span><br />"+"您预订了&nbsp;"+time[0]+"&nbsp;年&nbsp;"+time[1]+"&nbsp;月&nbsp;"+time[2]+"&nbsp;日&nbsp;"+operaTime.val()+"&nbsp;&nbsp;"+$("#sResName").val()+"&nbsp;&nbsp;"+operaNum.val()+"人&nbsp;&nbsp;“"+tablesMsg.join("&nbsp;,&nbsp;")+"”"+confirmorderskillStr+"<br /><span style = 'font-size:16px;font-weight:bold;'>请评话术：</span><br/><span style = 'font-size:18px;font-weight:bold;color:red'>请问还有什么可以帮您？</span><br/><span style = 'font-size:18px;font-weight:bold;color:red'>请对我的服务做一个评价，谢谢！</span>";
						
						return '<div style = "line-height:30px;">'+resMsg+'</div>';
					}
					var dataArr = [];
					dataArr.push(inputDate.attr("name")+"="+inputDate.val());
					dataArr.push(operaTime.attr("name")+"="+operaTime.val());
					dataArr.push(operaTel.attr("name")+"="+operaTel.val());
					
					mboxHeader.removeClass("bgc_fbbaaa");
					mbox.reDefineMbox({
						type:"confirm",
						title:"确认订单信息",
						applyName:"确认",
						cancelName:"取消",
						getContent:getContent,
						applyFn:function(){
							mbox.reDefineMbox({
								type:"ajax",
								title:"信息展示框",
								ajaxOptions:{
									url:url,
									data:dataArr.join("&"),
									success:function(data){
										if(data.succ && data.msg){
											mbox.reDefineMbox({
												type:"confirm",
												title:"信息展示框",
												getContent:data.msg,
												applyFn:submitForm,
												confirmType:"ajax"
											});
										}else{
											submitForm();
										}
									}
								}
							});
						},
						confirmType:"ajax"
					});
					
				}
				function formCheck(obj){
					//防止重复提交的问题。
					if(obj.hasClass("btn-waiting")){
						alert("您提交的速度太快了，请稍等提交！");
						return false;
					}
					
					if(!xmsCore.basic_method.allpass(orderSubmit) || !xmsCore.basic_method.allpass(callInfoFormEle)){
						//如果有格式错误的，则停止执行
						return false;
					}
					if(!memberSex.filter(":checked").length){
						xmsCore.basic_method.errorTip(memberSex.closest("div"),"请选择用餐人性别！");
						return false;
					}
					return true;
				}
				
				var reserveTableIds = $("#reserveTableIds"),
					//在只选中一个餐位时，该元素中，包含可选择的其他餐位
					table_catlogs = $("#table_catlogs");
				
				function setReserveTable(obj){
					var num = obj.attr("data-num") || "",
						span = table_catlogs.find("li[data-num='"+num+"']").find("[data-type='num']"),
						tableId = span.attr("data-ids") || "";
						
					reserveTableIds.val(tableId);
				}
				
				optAllSubmit.on("click",function(){
					//表单提交的部分
					
					if(false === formCheck(optAllSubmit)){
						//表示验证出错，提示并结束
						return false;
					};
					
					var allSelectedTables = choiced_table.find("a.catlogs_alike_btn"),
						canMaxNums = 0,
						canMinNums = 0,
						operaNums = operaNum.val()-0 || 0,
						selectedIds = [];

					if(!inputDate.val()){
						xmsCore.basic_method.errorTip(operaDateEle,"请选择就餐日期",1500);
						return false;
					}
					if(!operaTime.val()){
						xmsCore.basic_method.errorTip(selTimeListEle,"请选择就餐时间",1500);
						return false;
					}
					if(allSelectedTables.size() == 0){
						//如果没有选择餐位，则直接返回
						xmsCore.basic_method.errorTip(table_catlogs,"您还没有选择餐位，请先选择餐位",1500);
						return false;
					}
					
					if(allSelectedTables.size() === 1){
						//如果选中的餐位个数为1个，则要携带其他可选择的餐位
						setReserveTable(allSelectedTables.eq(0));
					}else{
						//清空，以防后台因为受该属性影响
						reserveTableIds.val("");
					}
					
					allSelectedTables.each(function(){
						var obj = $(this),
							maxNums = (obj.attr("data-maxNum") || 1)-0,
							minNums = (obj.attr("data-minNum") || 1)-0;
							
						if(maxNums){
							canMaxNums += maxNums;
						}
						if(minNums){
							canMinNums += minNums;
						}
						selectedIds.push(obj.attr("data-id"));
					});
					
					var choiced_item_tables = allSelectedTables.filter(".choiced_item,.icon_item").size();
					if(operaNums == 0){
						xmsCore.basic_method.errorTip(operaNumEle,"您忘了输入就餐人数!");
						return false;
					}
					if(operaNums - canMinNums < 0 && choiced_item_tables){
						xmsCore.basic_method.errorTip(operaNumEle,"您选择的餐位最小起订人数是："+canMinNums+"人，但您输入的就餐人数是："+operaNums+"人，不能提交订单，请修改！",1500);
						return false;
					}
					
					if(operaNums > canMaxNums && choiced_item_tables){
						xmsCore.basic_method.errorTip(bookerNumEle,"您选择的餐位容纳的最大人数是："+canMaxNums+"人，但您输入的就餐人数是"+operaNums+"，无法提交？",1500);
						return false;
					}
					
					//把所有的选中的餐位id进行拼接，然后赋值到orderTableIds的元素中
					orderTableIds.val(selectedIds.join(","));
					
					ajaxCheck($(this));
					
					return false;
				});
				$(".cancelOrder").on("click",function(){
					var obj = $(this), url = obj.attr("data-url");
					if(confirm("您确定要取消订单吗？")){
						obj.ajaxFn({
							url: url,
							success:function(data){
								if(data.msg){
					        		alert(data.msg);
					        	}
						        if(data.succ){
						        	// 关闭页面
									window.onbeforeunload = null;
									// 修改为空闲状态
									if(typeof SayFree == "function"){
										SayFree();
									}
									setTimeout(function(){
										window.close();
									},500);
						        }
							}
						})
					}
				});
			})();
			//删除已选中的餐位
			choiced_table.on("click",".remove_choiced_item",function(){
				var obj = $(this),
					objA = obj.parent(),
					tableName = objA.text(),
					dataNum = objA.attr("data-num") || 0,
					dataId = objA.attr("data-id"),
					changeObj = null,
					objNum = null,
					str = "",
					arr = [];
					
				if(!confirm("确认要删除“ "+tableName+" ”餐位吗？")){
					return false;
				}
				if(dataNum){
					//非精确查找部分
					changeObj = catlogs_list.find("li[data-num="+dataNum+"]");
					if(changeObj.length != 0){
						objNum = changeObj.find("span[data-type=num]");
						str = objNum.attr("data-ids") || "";
						if(str){
							arr = str.split(",");
						}else{
							arr = [];
						}
						
						arr.push(dataId);
						objNum.text(arr.length);
						objNum.attr("data-ids",arr.join(","));

						str = ","+objNum.attr("data-selected").split(",").join(",,")+",";
						str = str.replace(","+dataId+",","").slice(1,-1);
						objNum.attr("data-selected",str.split(",,").join(","));
					}
				}else{
					//精确查找部分
					changeObj = precise_tables_catlogs.find("a[data-id="+dataId+"]");
					changeObj.removeClass("a-red");
				}
				
				objA.remove();
				return false;
			});

			catlogs.on("click",function(e){
				//选项卡的点击事件处理部分
				var obj = $(this),
					objTo = obj.attr("data-to"),
					catlogsType = obj.attr("data-catlog"),
					list = null,
					exceptCatlog = "",
					exceptStr = "",
					pingmiantu = obj.find(".pingmiantu").size()?true:false;

				list = catlogs_list;	
				/*if(objTo == "catlogs_list"){
					list = catlogs_list;
				}else if(objTo == "precise_tables_catlogs"){
					list = precise_tables_catlogs;
				}else{
					alert("error!");
					return false;
				}*/
				//把所有的隐藏，然后把对应的显示
				list.find("li[data-catlog]").show();
				//平面图部分，很恶心的东西
				if(pingmiantu){
					catlogs_header.hide();
				}else{
					catlogs_header.show();
				}
				
				if(catlogsType != 0){
					//当选择不是全部时，则进行该部分处理
					list.find("li[data-catlog!="+catlogsType+"]").hide();
				}else{
					exceptCatlog = obj.attr("data-exceptcatlog") || "";
					if(exceptCatlog){
						exceptCatlog = ","+exceptCatlog.split(",").join(",,")+",";
						exceptCatlog = exceptCatlog.replace(/,([^\,]+),/g,function(p1,p2){
							list.find("li[data-catlog='"+p2+"']").hide();
						});
					}
				}
				
				//对应的标签元素的切换
				catlogs.removeClass("active");
				obj.addClass("active");
				if(objTo == "catlogs_list"){
					tablesShows();
				}else if(objTo == "precise_tables_catlogs"){
					preciseSearchMore("open");
				}
				
				//保证不再冒泡，不执行默认动作
				//return false;
				e.preventDefault();
			});
			catlogs.eq(0).on("click",function(event){
				var obj = $(this), activeEle = $(".sel-time.active");
				if(activeEle.length && obj.attr("data-to")!="catlogs_list"){
					_emptyCheckedSeat();
					//_loadSeat($(".sel-time.active"));
					_loadSeat(activeEle);
				}
				event.stopPropagation();
				event.preventDefault();
			});

			// 点击服务标签
			catlogs_list.on("click",".catlogs_list_details .tags a",function(){
				var obj = $(this);
				if(obj.hasClass("disable")){
					//如果含有disable属性，则不能被选择
					//不做处理，直接退出逻辑
					return false;
				}
				//更改标签的显示样式
				obj.toggleClass("active");
				reflashNums(obj);
				
				return false;
			});

			//标签部分，点击更多时的处理
			catlogs_list.on("click",".more",function(){
				var obj = $(this),
					objParent = obj.parent(),
					type = obj.attr("data-type"),
					showNum = 10,
					content = {
						"close":"展开↓",
						"open":"收起↑"
					};
					
				if(type == "close"){
					obj.attr("data-type","open");
					objParent.find(".tag:gt(9)").hide();
				}else{
					obj.attr("data-type","close");
					objParent.find(".tag").show();
				}
				
				obj.text(content[type]);
				return false;
			});

			//点击选中时，进行处理。
			catlogs_list.on("click",".select_btn",function(){
				var obj = $(this),
					objLi = obj.closest("li"),
					objNum = objLi.find("span[data-type=num]"),
					selected = objNum.attr("data-selected") || "",
					tables = objNum.attr("data-ids") || "",
					selectedArr = selected?selected.replace(reg_space,"").split(",") : [],
					tablesArr = tables?tables.replace(reg_space,"").split(",") : [],
					choicedTable = null,
					tablesObj = $.parseJSON(objLi.attr("data-tables"));

				//获取选中的餐位号，选取数组的最初的一个
				while(!choicedTable && tablesArr.length > 0){
					//防止有空元素，导致出错。
					choicedTable = tablesArr.shift();
				}

				if(!choicedTable){
					alert("已经没有餐位可选，请换其他系列餐位！");
					return false;
				}
				
				selectedArr.push(choicedTable);
				tables = tablesArr.join(",");
				
				//此时表示需要锁定，那么执行bind操作
				var changed_num = choicedTable;
				if(tables){
					changed_num += ":"+tables;
				}
				selectTableFn.bind(changed_num,function(data){
					var bindTables = data.bindTables;
					
					//表示锁定失败，或者锁定的餐位不是传入的餐位
					if(bindTables){
						//如果有餐位，则更换
						changeSelectTables(objLi,choicedTable,bindTables);
						choiced_table.append('<a href="javascript:void(0);" class="choiced_item catlogs_alike_btn mb5 rel" style="padding-right:18px;" data-num = "'+objLi.attr("data-num")+'" data-id = "'+bindTables+'" data-maxNum = "'+objLi.attr("data-maxNum")+'" data-minNum = "'+objLi.attr("data-minNum")+'">'+objLi.attr("data-details")+" "+(tableSpecialName || tablesObj[bindTables])+'<span class = "glyphicon glyphicon-remove remove_choiced_item"></span></a>');
					}else{
						//objAlink.remove();
						//如果锁定失败，则处理掉，并把对应的元素删除
						if(data.bindMsg){
							alert(data.bindMsg);
							//如果有失败原因，则提示
						}
					}
					
					if(data.orderTables){
						changeSelectTables(objLi,data.orderTables);
						//如果有些餐位已经被预定出去，
						//则更新当前缓存的餐位信息
					}
					
					reflashNums(objNum);
				});
				
				return false;
			});
			
			choiced_table.on("click",".choiced_item",function(){
				//快速修改选中餐位的点击模块
				var obj = $(this),
					objLi = catlogs_list.find("li[data-num="+obj.attr("data-num")+"]"),
					objNum =  objLi.find("span[data-type=num]"),
					tablesStr = objNum.attr("data-ids") || "",
					tablesArr = tablesStr?tablesStr.replace(reg_space,"").split(","):[],
					html = "",
					i,
					len = tablesArr.length,
					tablesObj = null;
				
				if(len == 0){
					alert("该类型餐位已经被选取完毕，无餐位可换！");
					return false;
				}
				
				//该部分，作为一个处理模块，
				//记录是点击哪个选项，弹出的更换餐位的模块
				choiced_table.find(".choiced_item.active").removeClass("active");
				obj.addClass("active");
				
				tablesObj = $.parseJSON(objLi.attr("data-tables"));

				for(i=0;i<len;i++){
					if($.trim(tablesArr[i])){
						html += '<a href="javascript:void(0)" class="change_table_item catlogs_alike_btn" data-id = "'+tablesArr[i]+'">'+tablesObj[tablesArr[i]]+'</a>';
					}
				}
				changed_content.html(html);
				change_tables.show();
				//
				return false;
			});
			
			change_tables.on("click",".change_table_item",function(){
				//弹出的更换餐位模块，餐位选择的更换显示模块
				var obj = $(this);
				
				if(obj.hasClass("disabled")){
					alert("该餐位已经被预定，不可选！");
					return false;
				}
				
				change_tables.find(".change_table_item").removeClass("active");
				
				selectTableFn.isbind(obj.attr("data-id"),function(data){
					if(!data.succ){
						return "";
					}
					
					if(data.isOrdered){
						//如果该餐位已经被下单，那么移除该餐位
						obj.remove();
						var objLi = catlogs_list.find("li[data-num="+choiced_table.find(".choiced_item.active").attr("data-num")+"]");
						changeSelectTables(objLi,obj.attr("data-id"));
						reflashNums(objLi.find("span"));
						return false;
					}
					
					if(data.isbind){
						alert(data.bindMsg);
					}else{
						obj.addClass("active");
					}
				});
				
				return false;
			});
			
			change_tables.on("click","a.btn",function(){
				//更换餐位模块，点击确认和取消
				var obj = $(this),
					choice_obj = choiced_table.find(".choiced_item.active"),
					//choice_obj是待更换的餐位显示对应的元素
					changed_obj = null,
					//changed_obj为更换餐位时，弹出模块中，选中的新餐位的模块
					list_obj = null,
					//list_obj为更换时，需要更新信息的对应的餐厅展示部分
					//也是所有餐厅餐位选择部分的每一行的展示部分
					list_obj_num = null,
					//list的li下，存放num数据的目标元素
					str = "",
					changed_num = "",
					old_num = "";
				
				if(obj.hasClass("cancel")){
					//点击取消按钮
					changed_content.html("");
				}else if(obj.hasClass("apply")){
					//点击确定按钮，确认更改
					changed_obj = changed_content.find(".change_table_item.active");
					if(changed_obj.size()){
						//只有选择了更换时，才会做处理
						changed_num = changed_obj.attr("data-id");
						old_num = choice_obj.attr("data-id");
						
						list_obj = catlogs_list.find("li[data-num="+choice_obj.attr("data-num")+"]");
						
						//下面这个是更新num上，可供选择，和已经被选择的餐桌
						changeSelectTables(list_obj,old_num,changed_num);
						
						//下面继续更新，已选择部分的显示
						str = list_obj.attr("data-details") + " " + (tableSpecialName || changed_obj.text()) + '<span class="glyphicon glyphicon-remove remove_choiced_item"></span>';
						
						choice_obj.html(str);
						choice_obj.attr("data-id",changed_num);
						
						//此时表示需要锁定，那么执行bind操作
						selectTableFn.bind(changed_num,function(data){
							if(data.bindTables){
								//bindTables有值，表示锁定成功。
								//锁定成功，不需要再进行额外的处理。
								
							}else{
								choice_obj.remove();
								//如果锁定失败，则处理掉，并把对应的元素删除
								if(data.bindMsg){
									alert(data.bindMsg);
									//如果有失败原因，则提示
								}
								if(data.orderTables){
									changeSelectTables(list_obj,data.orderTables);
									//如果该餐位已经被预定出去，
									//那么，把该餐位给刷新出去，
									//使得该餐位不能再被选择
								}
							}
						});
					}
				}
				
				//去掉之前记录的东西
				choice_obj.removeClass("active");
				change_tables.hide();
				
				return false;
			});
			// 设置附近分店
			var nearStore = $(".near-store");
			
			function _addSelectTime(){
				var html = "<li class='tc pt5 pb5'>",
					i = 0,
					hour = 24,
					min = 4,
					defalutTime = nearStoreListEle.prop("selectTime") || "",
					dHour = "",
					dMin = "";
				
				if(!defalutTime){
					defalutTime = selTimeAndStoreEle.find("[name=operaTime]:checked").val();
					
					dHour = Math.floor(defalutTime/3600) || 0;
					defalutTime = defalutTime%3600;
					dMin = Math.floor(defalutTime/60) || 0;
				}else if(defalutTime){
					defalutTime = defalutTime.split(":");
					dHour = defalutTime[0] - 0;
					dMin = defalutTime[1] - 0;
					nearStoreListEle.prop("selectTime","");
				}
				
				html += '<select class = "newByHour mr5 form-control input-sm w70 dib p5">';
				html += '<option value = "">请选择</option>';
				for(;i<hour;i++){
					if(dHour === i){
						html += '<option value = "'+i+'" selected>'+i+'时</option>';
					}else{
						html += '<option value = "'+i+'">'+i+'时</option>';
					}
				}
				html += '</select>';
				
				html += '<select class = "newByMin ml5 form-control input-sm w70 dib p5">';
				html += '<option value = "">请选择</option>';
				for(i=0;i<min;i++){
					if(dMin === i*15){
						html += '<option value = "'+i*15+'" selected>'+i*15+'分</option>';
					}else{
						html += '<option value = "'+i*15+'">'+i*15+'分</option>';
					}
					
				}
				html += '</select>';
				
				html += "</li>";
				
				return html;
			}
			
			function _setNearStore(store){
				/*store = [
					{
						type:"nearby-error",
						msg:"错误信息"
					},
					{
						name:"有匹配的餐位",
						type:"nearby-useful",
						value:[{
							href:"http://www.baidu.com",
							resname:"餐厅名",
							resid:"餐厅id",
							distance:"1.4KM",
							tags:"大厅，卡座，包房",
							status:"有餐位"
						}]
					},
					{
						name:"其他",
						type:"nearby-useless",
						value:[{
							href:"http://www.baidu.com",
							resname:"餐厅名",
							resid:"餐厅id",
							distance:"1.4KM",
							tags:"大厅，卡座，包房",
							status:"已满"
						}]
					}
				];
				*/
				var html = "", len = store.length, one;

				html = _addSelectTime();
				
				if(!len){
					html += "<li class='nearby-error tc'>附近无分店</li>";
					nearStoreListEle.html(html);
					nearStore.show();
					return false;
				}
				for(var i=0;i<len;i++){
					one = store[i];
					type = one.type;
					if(type == "nearby-error"){
						return "<li class = 'tc sub-title "+type+"'>"+one.msg+"</li>";
					}
					
					if(one.ResInfo.length){
						//只有数据列表不为空时，才添加。
						html += _getHtml(one);
					}
				}
				nearStoreListEle.html(html);
				nearStore.show();

				function _getHtml(data){
					var html = "",
						i = 0,
						one = null,
						value = data.ResInfo,
						len = 0,
						name = data.name || "",
						type = data.type,
						href = "",
						resName = "",
						distance = "",
						
					value = ( value instanceof Array ) ? value : [];
					len = value.length;
					
					if(name){
						html += "<li class = 'tc sub-title "+type+"'>"+name+"</li>";
					}
					for(;i<len;i++){
						one = value[i];
						href = one.href || "javascript:void(0);";
						ResName = one.ResName;
						distance = one.distance || "";

						html += '<li class="near-store-list '+type+'"><a href="'+href+'" target="_blank"><div class="clearfix"><span class="nearStoreName l">'+ResName+'</span><div class="nearStoreDistance r c-blue">'+distance+'</div></div><div class="nearStoreInfo c-green">'+(one.tags || one.status || "")+'</div></a></li>';
					}
					
					return html;
				}
			}
			var callInfoFormEle = $("#callInfoForm");
			nearStoreListEle.on("click",".near-store-list",function(){
				var obj = $(this), aEle = obj.children("a"), 
					href = aEle.attr("href"), 
					timeEle = $(".operaTime:checked");

				href = xmsCore.xmsQueryUrl({
					url:href,
					fn: restDataFormEle.xmsSerialize()
				});
				href = xmsCore.xmsQueryUrl({
					url:href,
					fn: callInfoFormEle.xmsSerialize()
				});
				href = xmsCore.xmsQueryUrl({
					url:href,
					fn: operaDateEle.attr("name")+"="+_removeWeekGetDate(operaDateEle.val())
				});
				window.open(decodeURIComponent(href+"&"+timeEle.attr("name")+"="+timeEle.closest(".sel-time").text()));
				return false;
			});
			// 选择时间
			selTimeAndStoreEle.on("click", ".sel-time", _changeTime);

			// 就餐人数 - 回车
			var searchBtnSubmit = restDataFormEle.find("[type=submit]"), numTimer = 0;

			searchBtnSubmit.on("click",function(){
				var value = $.trim(operaNumEle.val());
				
				_setBookerInfo();
				
				if(!operaDateEle.val()){
					xmsCore.basic_method.errorTip(operaDateEle,"日期不能为空！");
					return false;
				}
				_changeTime.call($(".sel-time.active"));
				operaNumEle.blur();
				return false;
			});
			operaNumEle.on("input",function(){
				clearTimeout(numTimer);
				setTimeout(function(){
					_setBookerInfo();
				},500);
			});
			//回车的触发事件的
			xmsCore.xmsEnterTrigger({
				obj : operaNumEle,
				src : searchBtnSubmit,
				type : "click"
			});

			timeTypeBtnEle.on("click",_selTimeType);

			// 清空可供时间
			function _emptySelTime(){
				selTimeListEle.html("");
			}
			// 清空可供订座餐位
			function _emptySelSeat(){
				search_callback.removeListContent();
				search_callback.removePreciseContent();
				search_callback.clickFirstTag();
				catlogs.hide();
				catlogs.eq(0).show();
				table_catlogs.show();
			}
			var selSeat = {};
			$.each(choiced_table.find(".choiced_item"),function(index,ele){
				var obj = $(ele);
				selSeat[obj.attr("data-id")] = obj.clone();
			});
			function _emptyCheckedSeat(){
				choiced_table.empty();
				change_tables.hide();
				changed_content.html("");
				catlogs_list.on("loadHtmlSucc",function(){
					var obj = $(this), sel = [], len = 0, thisSel = "",
						result = []; 
						
					$.each(obj.find("li:visible"),function(index,ele){
						var _obj = $(ele), selEle = _obj.find("[data-type='num']"),
							selected = "";

						if(selEle.length && (selected = selEle.attr("data-selected"))){
							sel = sel.concat(selected.split(","));
						}
					});
					len = sel.length;
					for(var i=0;i<len;i++){
						thisSel = selSeat[sel[i]];
						if(thisSel){
							result.push(thisSel);
						}
					}
					if(result.length){
						choiced_table.append(result)
					}
				})
			}
			// 清空附近分店
			function _emptyNearStoreList(){
				nearStoreListEle.html("");
				nearStore.hide();
			}
		})();

		// 异步加载  个性化服务、餐厅信息、促销优惠、疑难问答
		(function(){
			var promotionalOfferEle = $("#promotionalOffer"),
				difficultQuestionEle = $("#difficultQuestion"),
				LoadModularEle = $(".LoadModular"),
				searchTopAnswerEle = $(".searchTopAnswer"),
				answerTopEle = $("#answerTop"),
				groupPurchaseEle = null,
				saleActivityEle = null,
				memberCenterEle = null,
				answerFormEle = null,
				answerKeyEle = null,
				searchAnswerEle = null,
				groupInfoEleArr = {},
				initFn = {
					personalService:function(){
						// 个性化服务初始化
						var bookertelEle = $("#bookertel"),
							memberRemarkEle = $("#memberRemark");

						// 发送短信弹窗
						_sendMsgModal.call($(".sendMsg"),bookertelEle.attr("name")+"="+bookertelEle.val());

						$(".customRemark").on("click",function(){
							var obj = $(this), text = obj.text(), remark = memberRemarkEle.val();
							if(obj.hasClass("active")){
								obj.removeClass("active");
								return false;
							}
							remark += remark ? "，" + text : text;
							memberRemarkEle.val(remark);
							obj.addClass("active");
						});
						var sourceRemarkEle = $(".sourceRemark"), sourceInputEle = sourceRemarkEle.find("input");
						sourceRemarkEle.on("click",function(){
							var obj = $(this), text = obj.text(), remark = memberRemarkEle.val();

							sourceInputEle.prop("checked",false);
							if(obj.hasClass("active")){
								obj.removeClass("active");
								return false;
							}
							sourceRemarkEle.removeClass("active");
							remark += remark ? "，" + text : text;
							memberRemarkEle.val(remark);
							obj.addClass("active");
							obj.find("input").prop("checked",true);
						});
					},
					promotionalOffer:function(){
						// 促销优惠初始化
						// 变量
						groupPurchaseEle = $("#groupPurchase");
						saleActivityEle = $("#saleActivity");
						memberCenterEle = $("#memberCenter");
						groupInfoListEle = $(".group-info-list");

						new xmsCore.XMSSelectModal({
							    container: $("#saleActivitySel"),
							    width: "250px"
							});
						new xmsCore.XMSSelectModal({
							    container: $("#memberCenterSel"),
							    width: "250px"
							});

						$.each($("[role='tab']"),function(index,ele){
							var obj = $(ele), id = obj.attr("href"), idEle = $(id);
							groupInfoEleArr[id.slice(1)] = idEle.find(".groupInfo");
						});
						if(!groupInfoListEle.find("li").length){
							groupInfoListEle.css("min-height","100px");
							return false;
						}
						$.each(groupInfoEleArr,function(key,value){
							
							if(value.length){
								value.filter(".show-details").eq(0).trigger("click");
							}
						});
					},
					difficultQuestion:function(){
						// 疑难问答初始化
						answerFormEle = $("#answerForm");
						answerKeyEle = $("#answerKey");
						searchAnswerEle = $(".searchAnswer");
						// 门店联动下拉列表
						new xmsCore.XMSSelectModalMulti({
						    arr:[{
						        container : $("#answerStore1")
						    },{
						        container : $("#answerStore2")
						    },{
						        container : $("#answerStore3")
						    }]
						});

						$(".answer-title").xmsTabSwitch({
						    classAdd: "abs-in",
						    callback: function(){
						    	var obj = $(this);
						    	if(obj.hasClass("abs-in")){
						    		obj.ajaxFn({
						    			url: obj.attr("data-url")
						    		});
						    	}
						    }
						});
					}
				};
			// 疑难问答更新问题
			function _filterAnswer(){
				var url = difficultQuestionEle.attr("data-url");
				url = xmsCore.changeUrl(url,answerFormEle.serialize());

				difficultQuestionEle.load(url,function(){
					initFn.difficultQuestion();
					_scroll("#difficultQuestion");
				});
			}
			// _促销活动筛选
			function _saleActivityFilter(btnSel,boxS){
				var inputValue = boxS.find(".xms-select-input").val() || "",
					groupInfo = boxS.find(".groupInfo"),
					type = "",
					titleEle = null,
					sel = null;

				if(!groupInfo.length || !btnSel.length){
					return false;
				}
				// 隐藏所有
				groupInfo.hide();
				boxS.find(".groupInfoShow").hide();

				type = btnSel.val();
				
				// 筛选为全部
				if(type == 0){
					sel = groupInfo;
				}else{
					// 筛选某类
					sel = groupInfo.filter("[data-type='"+type+"']");
				}

				if(!sel.length){
					return false;
				}
				if(inputValue){
					// 筛选条件与输入框同时搜索
					titleEle = sel.find(".group-title:contains('"+inputValue+"')");
				
					if(!titleEle.length){
						return false;
					}
					
					sel = titleEle.closest(".groupInfo");
					if(!sel.length){
						return false;
					}
				}
				sel.show();
				sel.eq(0).trigger("click");
			}

			$.each(LoadModularEle,function(index,ele){
			    var obj = $(ele), url = obj.attr("data-url"), id = obj.attr("id");
			    if(!url){
			    	return false;
			    }
			    obj.load(url,initFn[id]);
			});

			// 团购优惠、促销活动、会员中心下类型筛选
			promotionalOfferEle.on("click",".filterBtn",function(){
				var obj = $(this), 
					p = obj.closest(".btn-group"),
					filterBtnS = p.find(".filterBtn"),
					radioS = p.find("[type='radio']"),
					input = obj.find("input[type='radio']"),
					type = input.val(), 
					id = obj.closest("[role='tabpanel']").attr("id"),
					showEle = groupInfoEle = groupInfoEleArr[id];

				if(obj.hasClass("active")){
					return false;
				}
				filterBtnS.removeClass("active");
				radioS.prop("checked",false);
				obj.addClass("active");
				input.prop("checked",true);

				if(id == "saleActivity" || id == "memberCenter"){
					// 促销活动、会员中心
					_saleActivityFilter(input, $("#"+id));
				}else{
					// 团购优惠
					groupInfoEle.hide();
					if(type != 0){
						showEle = groupInfoEle.filter("[data-type='"+type+"']");
					}
					if(showEle.length){
						showEle.show();
						showEle.eq(0).trigger("click");
					}else{
						$("#"+id).find(".groupInfoShow").hide();
					}
				}
				return false;
			});

			// 团购优惠显示“购买须知”
			promotionalOfferEle.on("click",".groupInfo",function(event){
				var obj = $(this), target = event.target, 
					id = obj.closest("[role='tabpanel']").attr("id"),
					groupInfoEle = groupInfoEleArr[id], 
					groupInfoShowEle = $("#"+id).find(".groupInfoShow"),
					cloneEle = obj.find(".group-info-intro").html() || "";

				if(target.tagName != "A"){
					groupInfoEle.filter(".show-details").removeClass("show-details");
					
					obj.addClass("show-details");
					groupInfoShowEle.html(cloneEle);
					if(cloneEle){
						groupInfoShowEle.show();
					}
				}
			});

			// 促销活动筛选
			promotionalOfferEle.on("click",".inputSeach",function(){
				var obj = $(this), p = obj.closest(".tab-pane");

				if(!p.length){
					return false;
				}
				_saleActivityFilter(p.find(".filterBtn [type='radio']:checked"),p);
			});

			// 疑难问答 选择 - 门店
			difficultQuestionEle.on("click","#answerStore3 .xms-select-item",_filterAnswer);

			answerTopEle.on("keydown",function(){
				var c = event.keyCode || event.which;

				if(c == 13){
					searchTopAnswerEle.trigger("click");
				}
			});

			searchTopAnswerEle.on("click",function(){
				var value = answerTopEle.val(), answerKeyEle = $("#answerKey");
				if(!value){
					xmsCore.basic_method.errorTip(answerTopEle,"输入问题关键字！");
					return false;
				}
				if(!answerKeyEle.length){
					return false;
				}
				answerKeyEle.val(value);
				searchAnswerEle.trigger("click");
			});

			// 疑难问答 关键词搜索
			difficultQuestionEle.on("click",".searchAnswer",function(){
				var value = answerKeyEle.val();
				if(!value){
					xmsCore.basic_method.errorTip(answerKeyEle,"输入问题关键字！");
					return false;
				}
				answerTopEle.val(value);
				_filterAnswer();
			});

			// 疑难问答 关键词回车
			difficultQuestionEle.on("keydown","#answerKey",function(event){
				var c = event.keyCode || event.which;

				if(c == 13){
					searchAnswerEle.trigger("click");
				}
			});

			// 疑难问答 选择 - 标签
			difficultQuestionEle.on("click",".filterBtn",function(){
				var obj = $(this), raidoEle = obj.find("[type='radio']"),
					diffFilterBtn = obj.siblings(".filterBtn"),
					diffFilterInput = diffFilterBtn.find("[type='radio']");

				if(obj.hasClass("active")){
					obj.removeClass("active");
					raidoEle.prop("checked",false);
				}else{
					diffFilterBtn.removeClass("active");
					diffFilterInput.prop("checked",false);
					obj.addClass("active");
					raidoEle.prop("checked",true);
				}
				_filterAnswer();
				return false;
			});

			// 疑难问答 报错
			difficultQuestionEle.on("click",".answerError",function(){
				var obj = $(this), url = obj.attr("data-url");
				if(confirm("确定要报错？")){
					obj.ajaxFn({
						url: url,
						success: function(json){
							if(json.msg){
								alert(json.msg)
							}
						}
					});
				}
			});

			// 疑难问答 选择 - 点击热度、更新时间
			difficultQuestionEle.on("click",".nav li",function(){
				var obj = $(this);
				if(obj.hasClass("active")){
					return false;
				}
				obj.find(".rankType").prop("checked",true);
				_filterAnswer();
			});

			// 疑难问答 选择 - 分页
			var onePage = 10;
			difficultQuestionEle.on("click",".pagination li",function(){
				var obj = $(this), 
					inputEle = obj.find(".page"), 
					value = inputEle.val(),
					paginationEle = $(".pagination"),
					answerListEle = $(".answer-list"),
					maxPage = paginationEle.find("li").length-2,
					activeEle = paginationEle.find(".active"),
					nowPage = activeEle.find(".page").val(),
					PreviousEle = paginationEle.find("[aria-label='Previous']").closest("li"),
					NextEle = paginationEle.find("[aria-label='Next']").closest("li");

				if(obj.hasClass("active") || obj.hasClass("disabled") ){
					return false;
				}
				if(value == "Previous"){
					// 向前一页
					if(nowPage == 1){
						PreviousEle.addClass("disabled");
						return false;
					}
					activeEle.removeClass("active");
					activeEle = activeEle.prev("li");
				}else if(value == "Next"){
					if(nowPage == maxPage){
					NextEle.closest("li").addClass("disabled");
						return false;
					}
					activeEle.removeClass("active");
					activeEle = activeEle.next("li");
				}else{
					activeEle.removeClass("active");
					activeEle = obj.closest("li");
				}
				activeEle.addClass("active");
				nowPage = activeEle.find(".page").val();
				if(nowPage == 1){
					PreviousEle.addClass("disabled");
					NextEle.removeClass("disabled");
				}else if(nowPage == maxPage){
					NextEle.addClass("disabled");
					PreviousEle.removeClass("disabled");
				}else{
					PreviousEle.removeClass("disabled");
					NextEle.removeClass("disabled");
				}
				answerListEle.hide();
				for(var i = (nowPage-1)*onePage;i<=onePage*nowPage-1;i++){
					answerListEle.eq(i).show();
				}
				_scroll("#difficultQuestion");
				return false;
			});
		})();
	};
	xmsInet.order = order;

	// 57 弹屏
	var fivesCallScreen = function(){
		var docEle = $(document), myModal = $("#myModal"),
			fivesCallTabInfo = $(".fivesCallTabInfo"),
			fivesCallTabs = fivesCallTabInfo.find("[role='tab']"),
			modifyOrder = fivesCallScreen.modifyOrder,
			modifyOrderData = $("#fivesModifyOrder").attr("data-data");

		function init(){
	        var operaDateEle = $("#operaDate");

			// 日历
		    _showWeekCalendar(operaDateEle);
			_selTime($("#operaTime"));
	        popover();
	        $("#fivesSearchRestList").css("top",$("#formSub1").outerHeight()+$("#formSub2").outerHeight()+$("#formSub3").outerHeight()+"px");
	        window.mBox = new xmsCore.XMSMesBox({obj:$("#fivesModal")});

	    }
	    init();
	    
	    docEle.on("click", ".callTypeBtn", function(){
	    	_fivesCallType.call(this);
	    });
	    var baiduMap = $("#baiduMap");
	    fivesCallTabs.on("click", function(event,data){
	        var obj = $(this), data1 = "";
	        // 判断该tab是否加载过
	        if(obj.attr("data-flag") != "true"){
	        	data1 = xmsCore.xmsQueryParam({
					"data":fivesCallTabInfo.attr("data-data"),
					"replace": fivesCallTabInfo.attr("data-form")
				});
	        	data = xmsCore.xmsQueryParam({
					"data": data1,
					"replace": data
				});
	            _fivesTabRefresh(obj,data);
	        }
	        if(obj.attr("href") === "#baiduMap"){
            	baiduMap.css("visibility","visible");
            }else{
            	baiduMap.css("visibility","hidden");
            }
	    });
	    if(modifyOrder){
	    	// 修改订单 只需加载餐厅信息
	    	fivesCallTabs.filter("[href='#restInfo']").trigger("click",fivesCallTabInfo.attr("data-data"));
	    	_fivesOrder(fivesCallTabInfo.attr("data-data"));
	    }else{
	    	// 下订单
	    	fivesCallTabs.filter("[href='#customerInfo']").trigger("click",fivesCallTabInfo.attr("data-data"));
			_fivesTabRefresh(fivesCallTabs.filter("[href='#baiduMap']"));

			//餐厅搜索
	    	_fivesRestSeach();

	    	//菜谱频道，相关JS逻辑代码
			_fivesMenuChannel();
			
			//客户信息的模块
			_fivesUserInfo();

			//百度地图
		    _fivesBaiduMap();
	    }
	    //57餐厅信息的模块代码
		_fivesRestInfo();
	}
	xmsInet.fivesCallScreen = fivesCallScreen;

	function _fivesTabRefresh(obj, data){
		var form = $(".fivesCallTabInfo").attr("data-form");

       	if(!obj.length){
       		return false;
       	}
       	if(data){
       		data = data ? xmsCore.xmsQueryParam({"data": form,"replace": data}) : form;
       	}

        $(obj.attr("href")).xmsLoadHtml({
            fn: data,
            succ: function(){
                obj.attr("data-flag","true");
            }
        });
	}
	// 57来电类型
	function _fivesCallType(){
		var obj = $(this),
			callTypes = $(".callTypes"),
			callTypeForm = $("#callTypeForm"),
			callTypeBtn = $(".callTypeBtn"),
			url = callTypeForm.attr("action"),
			types = [
				["其他","账号&注册","APP操作","追单呼入","断线"],
				["","预订","咨询","投诉"],
				["","预订","咨询","投诉"],
				["","客户","企业"],
				["","抽查人","客户","餐厅"],
			];

        if(!callTypeBtn.length){
			return false;
		}	

		function changeHtml(index){
			var html = '<option value = "">请选择</option>',
				list = types[index] || [],
				i=0,
				len = list.length,
				first = "",
				branId = $("#branId");
				
			if(index === "" || !len || branId.val() === ""){
				return '<option value = "">无可选项</option>';
			}
			
			first = list[0];
			for(i=1;i<len;i++){
				html += '<option value = "'+list[i]+'">'+list[i]+'</option>';
			}
			if(first){
				//把“其他”选项放在最后
				html += '<option value = "'+first+'">'+first+'</option>';
			}
			return html;
		}
		
		(function(){
			var branId = $("#branId"),
				bigType = $("#bigType"),
				subType = $("#subType"),
				mains = $(".toMains"),
				others = $(".toOther"),
				otherBigType = $("#otherBigType");
				
			branId.on("change",function(){
				var _obj = $(this),
					index = _obj.find("option:selected").attr("data-type") || "";

				if(index === ""){
					bigType.val("").trigger("change");
				}else if(index === "0"){
					others.show();
					mains.hide();
				}else{
					mains.show();
					others.hide();
					bigType.trigger("change");
				}
			});	
			
			bigType.on("change",function(){
				var _obj = $(this),
					index = _obj.find("option:selected").attr("data-type") || "";
				
				subType.html(changeHtml(index));
				subType.val("");
			});	
			// 提交来电类型
			callTypeForm.on("click","[type='submit']",function(){
				var branIdValue = branId.val(),	
					bigTypeValue = "",
					subTypeValue = "",
	                index = branId.find("option:selected").attr("data-type") || "";
					
				if(index != 0){
					bigTypeValue = bigType.val();
					subTypeValue = subType.val();
				}else{
					bigTypeValue = otherBigType.val();
				}

				callTypeForm.ajaxFn({
					url: url,
					data: "BranId="+branIdValue+"&BigType="+bigTypeValue+
						"&SubType="+subTypeValue+"&Remark="+($("remark").val() || ""),
					success: function(json){
						if(json.msg){
							alert(json.msg);
						}
						if(json.succ){
							obj.remove();
							callTypes.remove();
							_fivesCallType = null;
						}
					}
				});
			});
			callTypeForm.on("click","[type='reset']",function(){
				callTypes.hide();
			});
		})();
		function _show(){
			callTypes.show();
		}
		_fivesCallType = _show;
		_fivesCallType();
	}
	// 餐厅搜索
	function _fivesRestSeach(){
		var fivesCallTabInfo = $(".fivesCallTabInfo"),
			fivesCallAllTabs = fivesCallTabInfo.find("[role='tab']"),
	    	fivesCallTabs = fivesCallAllTabs.not("[href='#customerInfo'],[href='#baiduMap']"),
	    	baiduMapTab = fivesCallAllTabs.filter("[href='#baiduMap']"),
	    	restInfoTab = fivesCallAllTabs.filter("[href='#restInfo']"),
	    	conditionFilter = $(".conditionFilter"),
	    	formSub1 = $("#formSub1"),
	    	formSub2 = $("#formSub2"),
	    	formSub3 = $("#formSub3");

		_conditionFilter();
	    _specialRequir();
		_fivesSeachRest();
		_city();
		// 切换城市
		function _city(){
			var operaCity = $("#operaCity"),
				arr = $(".changeCityParam"),
				labels = $(".condition-filter-label"),
				fivesSearchRestList = $("#fivesSearchRestList"),
				fivesWeddingBook = $(".fives-wedding-book"),
				fivesWeddingBookAlink = fivesWeddingBook.find("a"),
				showWeed = [200000,100000,310000,510000,210000,610000,518000,430000,110000,266000,360000,710000];

			operaCity.on("change",function(){
				var obj = $(this),
					name = obj.attr("name"),
					value = obj.val(),
					str = name+"="+value,
					fivesSelLocation = $(".fivesSelLocation");

				$.each(arr,function(index, ele){
					var one = $(ele),
						url = one.attr("data-url");

					one.attr("data-url",xmsCore.xmsQueryUrl({
						"url": url,
    					"fn": str
					})).attr("data-flag",false);
				});
				if(fivesSelLocation.length){
					fivesSelLocation.find(".fivesSelRemove").trigger("click",true);
				}
				labels.eq(0).trigger("click");
				fivesSearchRestList.html("");
				_wedding(name,value);
			});
			function _wedding(name,city){
				var href = fivesWeddingBookAlink.attr("href");

				if(showWeed.indexOf(city*1) == -1){
					fivesWeddingBook.hide();
				}else{
					fivesWeddingBook.show();
					fivesWeddingBookAlink.attr("href",xmsCore.xmsQueryUrl({
						"url": href,
    					"fn": name+"="+city
					}));
				}
			}
		}
		// 条件筛选-菜系、商圈、地标、地铁...
	    function _conditionFilter(){
	    	var filterLocation = $(".filterLocation"),
	    		conditionFilterLabel = $(".condition-filter-label"),
	    		fivesSelCondition = $(".fivesSelCondition"),
	    		fivesSearchRestList = $("#fivesSearchRestList"),
	    		filterBusinessBox = $(".filterBusiness .xms-select-box"),
	    		operaCity = $("#operaCity");

	    	function _ajaxHtml(obj,url,box){
	    		obj.ajaxFn({
					url: url,
					success: function(json){
						obj.html(box.getBoxHtml(json));
					}
				})
	    	}
	    	// 选项切换
	    	conditionFilterLabel.on("click",function(){
	    		var obj = $(this), target = obj.attr("data-target"),
	    			targetEle = $(target),
	    			flag = obj.attr("data-flag");

	    		if(!targetEle.length || obj.hasClass("active")){
	    			return false;
	    		}

	    		conditionFilterLabel.removeClass("active");
	    		obj.addClass("active");
	    		conditionFilter.hide();
	    		targetEle.show();
	    		if(flag != "true"){
	    			switch(target){
	    				case ".filterBusiness":
							var box = new xmsCore.XMSSelectModal({
								    container: $(target),
								    width: 1
								});
							_ajaxHtml(filterBusinessBox,obj.attr("data-url"),box);
							obj.attr("data-flag","true");
							break;
						case ".filterLandmark": 
						case ".filterSubway": 
						case ".filterCrossing": 
							new xmsCore.XMSSelectModal({
								    container: $(target),
								    width: 1,
								    type: "ajax",
								    dataFn: function(){
										return operaCity.attr("name")+"="+operaCity.val()
									} 
								});
							obj.attr("data-flag","true");
							break;
	    			}
	    		}
	    	});

	    	// 下拉列表 菜系
			new xmsCore.XMSSelectModal({
			    container: $(".filterDish"),
			    width: 1
			});
			function _selectFilter(className,value,text){
				var obj = $(this),
					p = obj.closest(".conditionFilter"),
					firstInput = p.find("input:first"),
					selCondition = $('<div class="fives-sel-condition" data-target="'+className+'">'+text+'<input type="checkbox" class="dn" name="selCondition" value="'+firstInput.attr("name")+"="+value+'" checked><span class="glyphicon glyphicon-remove fivesSelRemove"></span></div>');

				if(!value){
					return false;
				}
				if(p.hasClass("filterDish")){
					// 菜系多选
					// 判断是否已选过改菜系
					if(fivesSelCondition.find(".fivesSelDish").find("[value="+value+"]").length){
						return false;
					}
					selCondition.addClass("fivesSelDish");
				}else{
					// 商圈、地标、地铁站、交叉路口四选一

					// 清空其他选项的下拉列表
					_emptyInput(filterLocation,className);

					fivesSelCondition.find(".fivesSelLocation").remove();
					selCondition.addClass("fivesSelLocation");
				}
				fivesSelCondition.append(selCondition);
				_setSearchRestListTop();
			}
			// 回车添加已选择的条件
			conditionFilter.find("input:first").on("keydown",function(event){
				var c = event.keyCode || event.which,
					obj = $(this),
					p = obj.closest(".conditionFilter"),
					text = obj.val(),
					className = p.attr("data-class") || "";

				if(c == 13 && text){
					_selectFilter.call(this,className,text,text);
				}
			})
			// 选择条件
			conditionFilter.on("click",".xms-select-item",function(){
				var obj = $(this), 
					p = obj.closest(".conditionFilter"),
					value = obj.attr("data-value"),
					text = obj.text(),
					className = p.attr("data-class") || "";

				if(!fivesSelCondition.length){
					alert("页面缺少fivesSelCondition");
					return false;
				}
				_selectFilter.call(this,className,value,text);
			});

			fivesSelCondition.on("click",".fivesSelRemove",function(flag){
				var obj = $(this), p = obj.closest(".fives-sel-condition"),
					target = null, fivesSelDish = null;
				if(!p.length){
					return false;
				}
				if(flag || confirm("确定要删除"+p.text()+"?")){
					p.remove();

					if(p.hasClass("fivesSelLocation")){
						// 商圈、地标、地铁站、交叉路口
						_emptyInput(filterLocation);
					}else{
						fivesSelDish = fivesSelCondition.find(".fivesSelDish:last");
						target = $(".filterDish");
						if(!fivesSelDish.length){
							_emptyInput(target);
							return false;
						}
						target.find("#dishSel").val(fivesSelDish.text());
						target.find("#dishSelValue").val(fivesSelDish.find("input").val());
					}
				}
			});
			var selConditionTimer = 0,
				selDistance = $(".selDistance");

			fivesSelCondition.on("DOMSubtreeModified",function(e){
				clearTimeout(selConditionTimer);
				selConditionTimer = setTimeout(function(){
					var fivesSelLocation = fivesSelCondition.find(".fivesSelLocation");

					if(fivesSelLocation.length == 0 || (fivesSelLocation.attr("data-target") === "filterBusiness")){
						// 商圈 或 只有菜系时不显示距离
						selDistance.find("option").eq(0).prop("selected",true);
						selDistance.hide();
					}else{
						selDistance.val(1000);
						selDistance.show();
					}
				},50);
			});

			// 修改搜索结果处高度
			function _setSearchRestListTop(){
				fivesSearchRestList.css("top",formSub1.outerHeight()+formSub2.outerHeight()+formSub3.outerHeight()+"px");
				_fivesSetRestResultThead();
			}
	    }
	    // 清空条件筛选-菜系、商圈、地标、地铁...
		function _emptyInput(obj,className){
			obj.filter(function(){
				var _this = $(this);
				if(_this.hasClass(className)){
					return false;
				}
				_this.find("input").val("");
			});
		}
	    // 特殊要求
	    function _specialRequir(){
	    	var specialRequirBox = $(".special-requir-box"),
	    		specialRequir = $(".specialRequir"),
	    		specialText = specialRequir.find(".text"),
	    		specialIcon = specialRequir.find(".glyphicon"),
	    		xmsOverlay = xmsCore.xmsOverlay;

	    	// 展开、隐藏特殊要求弹框
	    	specialRequir.on("click",function(){
	    		var obj = $(this), flag = obj.attr("data-flag");
	    		if(flag == "close"){
	    			specialText.text("收起");
	    			specialIcon.removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
	    			specialRequirBox.show();
	    			obj.attr("data-flag","open");
	    		}else{
	    			specialText.text("展开");
	    			specialIcon.removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
	    			specialRequirBox.hide();
	    			obj.attr("data-flag","close");
	    		}
	    	});
	    }
	    // 搜索餐厅
	    function _fivesSeachRest(){
	    	var fivesSelCondition = $(".fivesSelCondition"),
	    		fivesSearchRestList = $("#fivesSearchRestList"),
	    		fivesRestTbody = null,
	    		restInfo = $("#restInfo");
	    	
		    formSub2.on("submit",function(){
		    	return false;
		    });

	    	// 清除	只清空表单3
	    	formSub3.find("[type='reset']").on("click",function(){
	    		fivesSelCondition.html("");
	    		fivesSearchRestList.html("");
	    		_emptyInput(conditionFilter);
	    		fivesCallTabInfo.attr("data-form","");
	    	});

			formSub3.on("keydown","#AvrgLow, #AvrgHigh",function(event){
				var c = event.keyCode || event.which;

				if(c == 13){
		    		return false;
		    	}
		    });
	    	// 搜索
	    	formSub3.on("click","[type='submit']",function(){
	    		var fivesSelLocation = fivesSelCondition.find(".fivesSelLocation"),
	    			target = fivesSelLocation.attr("data-target"),
	    			formInfo = xmsCore.xmsQueryParam({
		    			"data":formSub2.xmsSerialize(),
		    			"replace": formSub3.xmsSerialize()
		    		});

	    		fivesSearchRestList.css("top",formSub1.outerHeight()+formSub2.outerHeight()+formSub3.outerHeight()+"px");
	    		_fivesRefreshRestList(fivesSearchRestList,formInfo);
	    		formInfo = xmsCore.xmsQueryParam({
	    			"data": fivesCallTabInfo.attr("data-form"),
	    			"replace": formInfo
	    		});
	    		fivesCallTabInfo.attr("data-form",formInfo);

	    		fivesCallTabs.attr("data-flag","false");
	    		// 如果选择了地标、地铁站、交叉路口右侧定位到百度地图
	    		if(target && (target.indexOf("filterLandmark")!=1 || target.indexOf("filterSubway")!=1 ||  target.indexOf("filterCrossing")!=1)){
	    			baiduMapTab.trigger("click");
	    		}
	    		return false;
	    	});
	    	// 排序
	    	fivesSearchRestList.on("click",".fivesRestSort",function(){
	    		var obj = $(this), 
	    			type = obj.attr("data-type"),
	    			sort = obj.attr("data-sort"),
	    			sortArrow = obj.find(".sortArrow"),
	    			listArr = null, 
	    			fivesRestSort = $(".fivesRestSort"),
	    			result = "";

	    		fivesRestTbody = $(".fivesRestTbody");
	    		listArr = fivesRestTbody.find(".fives-rest").remove();

	    		if(!type){
	    			alert("缺少data-type属性");
	    			return false;
	    		}

	    		type = "data-" + type;
	    		
	    		fivesRestSort.removeClass("c-red");
	    		obj.addClass("c-red");
	    		if(sort == "down"){
					obj.attr("data-sort","up");
					sortArrow.text("↑");
				}else if(sort == "up"){
					obj.attr("data-sort","down");
					sortArrow.text("↓");
				}

				// 排序
	    		listArr.sort(function(x,y){
	    			var xValue = $(x).attr(type),
	    				yValue = $(y).attr(type);
	    			if(sort == "down"){
	    				// 降序
	    				return xValue - yValue;
	    			}else if(sort == "up"){
	    				// 升序
	    				return yValue - xValue;
		    		}
	    		});
	    		fivesRestTbody.append(listArr);
	    	});
			// 选择餐厅
			fivesSearchRestList.on("click",".fives-rest",function(){
				var obj = $(this), 
					data = "", 
					activeTab = fivesCallTabInfo.find(".active a"),
					tabHref = activeTab.attr("href");

				fivesSearchRestList.find(".fives-rest.active").removeClass("active");
				obj.addClass("active");
				data = xmsCore.xmsQueryParam({
	    			"data": fivesCallTabInfo.attr("data-form"),
	    			"replace": "resId="+(obj.attr("data-id")||"")+"&longitue="+(obj.attr("data-longitue")||"")+"&latitude="+(obj.attr("data-latitude")||"")+"&zpcy="+(obj.attr("data-zpcy")||"")
	    		});
	    		data = xmsCore.xmsQueryParam({
	    			"data": data,
	    			"replace": formSub1.xmsSerialize()
	    		});
	    		fivesCallTabInfo.attr("data-form",data);
				fivesCallTabs.attr("data-flag","false");
				// 如果右侧不在餐厅信息或者百度地图，则定位到餐厅信息
				if(tabHref != "#restInfo" && tabHref != "#baiduMap"){
					restInfoTab.trigger("click");
				}else{
					// 餐厅信息时刷新
					_fivesTabRefresh(restInfoTab,data);
				}
			});
	    }
	}
	// 设置头部单元格宽度
	function _fivesSetRestResultThead(){
		var fivesRestThead = $(".fivesRestThead"),
			fivesRestTbody = $(".fivesRestTbody"),
			clone = $(".fivesRestThead.clone"),
			offset = fivesRestThead.offset(),
			thArr = clone.find("th");

		if(!fivesRestThead.length || !fivesRestTbody.find("tr:not(.noRest)").length){
			return false;
		}	
		if(!clone.length){
			clone = fivesRestThead.clone(true);
			thArr = clone.find("th");
			clone.addClass("clone");
			fivesRestThead.css("visibility","hidden");
		}
		clone.css({
			"width": fivesRestThead.outerWidth()+1+"px",
			"height": fivesRestThead.outerHeight()+"px",
			"position": "fixed",
			"top": offset.top,
			"left": offset.left,
			"visibility": "visible"
		});
		$.each(fivesRestTbody.find(".fives-rest").eq(0).find("td"),function(index,ele){
			var one = thArr.eq(index);
			if(!one.length){
				return false;
			}
			one.css("width",$(ele).outerWidth()+"px");
		});
		fivesRestTbody.css("margin-top", fivesRestThead.outerHeight()+"px");
		fivesRestTbody.before(clone);
		clone.show();
	}
	// 餐厅列表刷新
	function _fivesRefreshRestList(obj,data){
		if(!obj.length){
			return false;
		}
		obj.xmsLoadHtml({
			fn:decodeURIComponent(data)
		});

    	obj.on("loadHtmlSucc",function(){
    		fivesRestTbody = $(".fivesRestTbody");
    		_fivesSetRestResultThead();
    	});
	}
	xmsInet.fivesRefreshRestList = _fivesRefreshRestList;
	
	// 57打开下单弹层
	function _fivesOrder(data){
		var containter = $("#fivesOrderBox"),
			fivesCallTabInfo = $(".fivesCallTabInfo"),
			formSub1 = $("#formSub1"),
			basic_method = xmsCore.basic_method,
			allpass = basic_method.allpass,
			errorTip = basic_method.errorTip,
			userInfo = null,
			smokeInfo = null,
			orderMiniExpense = null,
			orderOrderNameInput = null,
			BookerSex = null,
			orderDinnerNameInput = null,
			orderDate = null,
			orderTime = null,
			InvitationType = null,
			InvitationInfo = null,
			discountSMS = null,
			seatType = null,
			fivesCardHide = null,
			fivesCardPeoples = null,
			options = {
		        title:"信息确认提示",
		        apply:"确定",
		        cancel:"取消",
		        applyCb:"",
		        afterShow: modalOpenSucc
		    },
		    fivesCancelObj = null,
			modifyOrder = fivesCallScreen.modifyOrder;

		if(!containter.length){
			alert("缺少#fivesOrderBox");
			return false;
		}
		function _load(data){
			if(!data){
				data = xmsCore.xmsQueryParam({
					"data": fivesCallTabInfo.attr("data-data")||"",
					"replace": fivesCallTabInfo.attr("data-form")||""
				});
				data = xmsCore.xmsQueryParam({
					"data": data,
					"replace": formSub1.xmsSerialize()
				});
			}

			containter.xmsLoadHtml({
				fn: data
			});
		}
		containter.on("loadHtmlSucc", _loadContainter);
		// 关闭下单窗口
		containter.on("click","#fivesCloseOrder",function(){
			containter.css({
				"left":"-10000px"
			});
		});
		
		containter.on("click", ".searchMember", _searchMember);
		containter.on("change", "#seatType", _seatTypeChange);
		containter.on("click", ".InvitationType", function(){
			_InvitationType.call(this,true);
		});
		var inputTimer = 0;
		containter.on("changeDate", "#orderDate", function(){
			_refreshConfirmInfoUrl.call(this);
			_refreshRestInfo.call(this);
		});
		containter.on("input", "#orderDate",  function(){
			_refreshConfirmInfoUrl.call(this);
			_refreshRestInfo.call(this);
		});
		function _refreshConfirmInfoUrl(){
			var obj = $(this), 
				submit = userInfo.find("[type='submit']"),
				url = submit.attr("data-url");	
			submit.attr("data-url", xmsCore.xmsQueryUrl({
				url: url,
				fn: obj.attr("name")+"="+_removeWeekGetDate(obj.val())
			}));
		}
		function _refreshRestInfo(){
			var obj = $(this);

			fivesCallTabInfo.attr("data-form",xmsCore.xmsQueryParam({
				"data": fivesCallTabInfo.attr("data-form"),
    			"replace": obj.attr("name")+"="+_removeWeekGetDate(obj.val())
			}));

			fivesCallTabInfo.find("[href='#restInfo']").attr("data-flag",false).trigger("click");
			_InvitationTypeFn();
		}
		function _InvitationTypeFn(){
			clearTimeout(inputTimer);
			setTimeout(function(){
				_InvitationType.call($(".InvitationType:checked"));
			}, 500);
		}
		containter.on("input", "#orderOrderNameInput,#orderDinnerNameInput,#orderDate",_InvitationTypeFn);
		containter.on("click", ".BookerSex",_InvitationTypeFn);
		containter.on("change","#orderTime",_InvitationTypeFn);
		containter.on("click",".timeSel td",_InvitationTypeFn);

		// 关联
		containter.on("click", ".fivesRelative", function(){
			var obj = $(this);
			fivesCancelObj = null;

			options.title = "订单关联";
			options.content = '<div class="get-content" data-url="'+obj.attr("data-url")+'">正在加载数据，请稍后....</div>';
			options.applyCb = modalApplyCb;
			mBox.custom(options);
		});
		// 退订
		containter.on("click", ".fivesCancel", function(){
			var obj = $(this);
			fivesCancelObj = obj;

			options.title = "订单退订";
			options.content = '<div class="get-content" data-url="'+obj.attr("data-url")+'">正在加载数据，请稍后....</div>';
			options.applyCb = modalApplyCb;
			mBox.custom(options);
		});
		// 复制
		containter.on("click", ".fivesCopy", function(){
			var obj = $(this), p = obj, over = "";
			obj.ajaxFn({
				success: function(json){
					while(p = p.parent()){
						over = p.css("overflow-y");
						if(over == "auto" || over == "scroll"){
							p.scrollTop(0);
							break;
						}
					}
					xmsCore.xmsFillInfos(containter.find("#userInfo"),json);
					_setCardPeoples(json.InvitationMobiles);				
				}
			});
		});
		containter.on("click", "#userInfo [type='submit']", _orderValid);
		
		_fivesOrder = _load;
		_fivesOrder(data);
		// 折扣
		containter.on("click", ".discount", setDiscountHidden);
		
		containter.on("hidden.bs.tooltip", "#orderMiniExpense", function(){
			var obj = $(this);
			obj.tooltip('show');
		});

		function _loadContainter(){
			userInfo = $("#userInfo");
			seatType = $("#seatType");
			smokeInfo = $(".smokeInfo");
			orderMiniExpense = $("#orderMiniExpense");
			orderOrderNameInput = $("#orderOrderNameInput");
			orderDinnerNameInput = $("#orderDinnerNameInput");
			BookerSex = $(".BookerSex");
			orderDate = $("#orderDate");
			orderTime = $("#orderTime");
			InvitationType = $(".InvitationType"),
			InvitationInfo = $(".InvitationInfo");
			discountSMS = $(".discountSMS");
			fivesCardPeoples = $(".fivesCardPeoples");

			if(!modifyOrder){
				containter.css({
					"left":"10px"
				});
			}
			// 选择时间
			_selTime(orderTime);

			// 请柬相关
			_fivesInvitationCard();

			// 初始化餐位类型
			_seatTypeChange.call(seatType);

	        xmsInet.ajaxSubmit();
			// 日历
			setTimeout(function(){
				var arr = [],
					operaDate = $("#operaDate"),
					orderDate = $("#orderDate");
				if(operaDate.length){
					arr.push(operaDate);
				}
				if(orderDate.length){
					arr.push(orderDate);
				}
				_showWeekCalendar(arr);
			},1000);
			setDiscountHidden.call($(".discount:checked"));
			_InvitationTypeFn();
	    	return false;
		}
		function setDiscountHidden(){
			var obj = $(this);
			discountSMS.val($.trim(obj.closest("label").text()))
		}
		function modalOpenSucc(){
			var content = $(".get-content");

	    	content.xmsLoadHtml({
	    		fn: content.attr("data-data")
	    	});
	    }
	    function modalApplyCb(){
	    	var obj = $(this), formSub = $("#formSub");

	    	obj.ajaxFn({
	    		url: formSub.attr("action"),
	    		data: formSub.xmsSerialize(),
	    		success: function(json){
	    			if(json.msg){
	    				mBox.alert(json.msg);
	    			}
	    			if(json.succ && fivesCancelObj.length){
	    				fivesCancelObj.remove();
	    			}
	    		}
	    	});
	    }
	    // 表单验证
		function _orderValid(){
			var obj = $(this),
				data = "";

			if(!BookerSex.filter(":checked").length){
				errorTip(BookerSex.eq(0),"请选择订餐人性别！");
				return false;
			}
			if(!allpass(userInfo)){
				return false;
			}
			data = xmsCore.xmsQueryParam({
				"data": userInfo.xmsSerialize(),
    			"replace": orderDate.attr("name")+"="+_removeWeekGetDate(orderDate.val())
			});

			// 获取重要提醒
			obj.ajaxFn({
				success:function(json){
					var confirmInfo = encodeURIComponent(json.confirmInfo);

					data = confirmInfo ? xmsCore.xmsQueryParam({
						"data": data,
		    			"replace": "confirmInfo="+confirmInfo
					}) : data;

					_validOrderOpenTip(data);
				}
			});
		}
		// 下单
		function _validOrderOpenTip(data){
			var dataObj = xmsCore.xmsStrToObj(decodeURIComponent(data)),
				name = dataObj.custName || "",
				sex = dataObj.custSex || "", 
				num = dataObj.DingNum || "" 
				tel = dataObj.custTel || "",
				date = dataObj.orderDate || "",
				time = dataObj.orderTime || "",
				rest = dataObj.ResName || "",
				need = dataObj.BookNeed || "",
				seat = seatType.find("option[value='"+dataObj.seatType+"']").text() || "",
				smoke = smokeInfo.filter("[value='"+dataObj.smoke+"']"),
				park = dataObj.park==1?"需要停车":"",
				confirm = dataObj.confirmInfo || ""
				userInfoStr = "",
				orderInfo = "",
				orderRequire = "",
				tip = "",
				html = "";

			smoke = smoke.length?smoke.closest("label").text():"";
			if(dataObj.seatType == 0 || dataObj.seatType == 2){
				smoke = "烟区信息 无烟";
			}else{
				smoke = smoke?"烟区信息 "+smoke:"";
			}
			num += num?"人":"";
			date = date? _removeWeekGetDate(date):"";

			userInfoStr = '<div class="b">'+name+sex+'('+tel+')，最后和您核对下：</div>';

			orderRequire = smoke||park||need? '订餐要求：'+smoke+' '+park+' '+need : "";
			orderInfo = '<div class="mt10">您预定了'+date+' '+time+' '+num+' '+xmsCore.xmsTmplete(rest,{"nbsp" : " "})+' '+seat+'<br/>'+orderRequire+'</div>';
			tip = confirm ? '<div class="mt10">另外需要提醒您：<br/><span class="c-red">'+xmsCore.xmsTmplete(confirm,{"Br" : "<br/>"})+'</span></div>':"";
			html = userInfoStr+orderInfo+tip;

			if(html){
				options.content = html;
				options.title = "订单确认";
				options.applyCb = _submitOrder;
				mBox.custom(options);
			}else{
				options.title = "错误提示";
				mBox.alert(options.content);
			}
		}
		function _submitOrder(){
			var obj = $(this), 
				orderSub = $(".orderSub");

			obj.ajaxFn({
				url: userInfo.attr("action"),
				data: xmsCore.xmsQueryParam({
						"data": userInfo.xmsSerialize(),
		    			"replace": orderDate.attr("name")+"="+_removeWeekGetDate(orderDate.val())
					}),
				success: function(json){
					if(json.msg){
						mBox.alert(json.msg, function(){
							// 下单成功后跳转页面
							if(json.succ && json.url){
								location.href = json.url;
							}else{
								mBox.hide();
							}
						});
					}
				}
			});
		}
		// 选择请柬类型，必选输入订餐人或就餐人姓名、性别、日期、时间
		/*
			
			//以下为请柬处理规则
	        //① 当给请柬类别赋值时 若订餐人姓名 或性别  为空 则不赋值 请柬内容也不赋值
	        //② 点击请柬类别时 当 请柬人姓名为空 或性别为空 提醒并把请柬类型和内容清空
	        //③ 当修改订餐人姓名时 当 请柬类型选中且不为不发请柬，此时检查 就餐人和就餐性别 是否都不为空 ，若不是就修改 请柬中的 姓名为当前订餐人姓名 
	        //④ 当手动清空订餐人框时 提醒 订餐人姓名不能为空 并清空 请柬类型 和请柬内容
	        //⑤ 修改就餐人 且 就餐人性别不为空时 且请柬类型 选中且不为不发请柬， 修改请柬内容姓名为 就餐人
	        //⑥ 当手动清空就餐人框时 且请柬类型 选中且不为不发请柬，修改请柬内容姓名为 订餐人
	        //⑦ 当选择订餐人性别时 若就餐人 姓名不为空  且请柬类型 选中且不为不发请柬 修改请柬内容姓名为 就餐人
		*/
		function _InvitationTypeValid(){
			// this为选中的请柬类型
			var name = orderOrderNameInput.val() || orderDinnerNameInput.val(),
				BookerSexChecked = BookerSex.filter(":checked"),
				sex = BookerSexChecked.length ? BookerSexChecked.val() : "",
				date = orderDate.val(),
				time = orderTime.val();

			// 姓名、性别、日期、时间必查
			if(!name){
				return {
					"obj": orderOrderNameInput,
					"tip": "请输入"+orderOrderNameInput.attr("data-remind")+"!"
				}
			}
			if(!sex){
				return {
					"obj": BookerSex.eq(0),
					"tip": "请选择订餐人性别！"
				}
			}
			if(!date){
				return {
					"obj": orderDate,
					"tip": "请输入"+orderDate.attr("data-remind")+"!"
				}
			}

			if(!time){
				return {
					"obj": orderTime,
					"tip": "请输入"+orderTime.attr("data-remind")+"!"
				}
			}
			return {
				"Name": name,
				"Sex": sex,
				"Date": _removeWeekGetDate(date),
				"Time": time
			};
		}
		function _InvitationType(flag){
			var obj = $(this),
				valid = null,
				msg = obj.attr("data-msg");

			if(!obj.length){
				return false;
			}
			// 选择不发时，不做任何操作
			if(obj.val() == "NotNeed"){
				return true;
			}
			valid = _InvitationTypeValid();
			if(valid){
				if(valid.obj){
					if(flag){
						errorTip(valid.obj, valid.tip);
					}
					InvitationType.filter(":checked").prop("checked",false);
					InvitationInfo.val("");
					return false;
				}else if(valid.Name){
					InvitationInfo.val(xmsCore.xmsTmplete(msg,valid));
				}
			}
		}

		// 餐位信息修改
		function _seatTypeChange(){
			var obj = $(this), 
				value = obj.val(),
				popOption = {
					"placement":"right",
					"title": "请输入客户能够接受的最低消费"
				};

			if(!smokeInfo.length || !orderMiniExpense.length){
				return false;
			}
			switch(value){
				case "0":
					// 选项为大厅时：烟区为无烟并设置为不可修改；低销设置为只读
					smokeInfo.filter("[value='1']").prop("checked",true);
					smokeInfo.attr("disabled","disabled");
					orderMiniExpense.attr("readonly","readonly").removeAttr("requir").tooltip('destroy');
					break;
				case "1":
					// 选项为包房时：烟区为无所谓并设置为可修改；低销取消只读
					smokeInfo.filter("[value='0']").prop("checked",true);
					smokeInfo.removeAttr("disabled");
					orderMiniExpense.removeAttr("readonly").attr("requir","");
    				orderMiniExpense.tooltip(popOption);
					orderMiniExpense.tooltip('show');
					break;
				case "2":
					// 选项为先厅后包时：烟区为无烟并设置为不可修改,低销取消只读
					smokeInfo.filter("[value='1']").prop("checked",true);
					smokeInfo.attr("disabled","disabled");
					orderMiniExpense.removeAttr("readonly").attr("requir","");
    				orderMiniExpense.tooltip(popOption);
					orderMiniExpense.tooltip('show');
					break;
				case "3":
					// 选项为先包后厅时：烟区为无所谓并设置为可修改,低销取消只读
					smokeInfo.filter("[value='0']").prop("checked",true);
					smokeInfo.removeAttr("disabled");
					orderMiniExpense.removeAttr("readonly").attr("requir","");
    				orderMiniExpense.tooltip(popOption);
					orderMiniExpense.tooltip('show');
					break;
			}
		}
		// 查询订餐人信息
		function _searchMember(flag){
			var obj = $(this),
				flag = flag===false?false:true,
				_phone = containter.find("#orderOrderTelInput");
			
			if(flag && !allpass("",_phone)){
				return "";
			}

			obj.ajaxFn({
				data: _phone.attr("name")+"="+_phone.val(),
				success: function(json){
					if(flag && !json.custName){
						alert("未查到手机号为"+json.custPhone+"的会员信息，该客户可能不是会员！");
					}
					xmsCore.xmsFillInfos(containter.find(".fivesUserInfos"),json);
				}
			});
		}
		// 添加请柬接受人
		function _fivesInvitationCard(){
			var fivesAddUser = $(".fives-add-user"),
				userPhoneEle = $(".userPhone"),
				userNameEle = $(".userName"),
				addUserBtn = $(".add-user-btn"),
				fivesCardPeople = $(".fives-card-people");


			containter.on("click",".add-user-btn",function(){
				var obj = $(this);
				obj.hide();
				fivesAddUser.show();
				return false;
			});
			containter.on("click",".addUser",function(){
				var userPhone = userPhoneEle.val() || "",
					userName = userNameEle.val() || "",
					people = null,
					html = "";

				if(userPhone && xmsCore.basic_method.allpass("",userPhoneEle)==true){

					people = _validRepeat(userPhone);
					html = $(_cardHtml(userPhone,userName));
					if(people.length){
						// 替换
						people.before(html).remove();
					}else{
						// 添加
						fivesCardPeoples.append(html);
					}
				}
				addUserBtn.show();
				fivesAddUser.hide();
				return false;
			});
			function _validRepeat(phone){
				return $(".fives-card-people").filter("[data-phone='"+phone+"']");
			}
			// 删除请柬接受人
			containter.on("click",".deleteCardPeople",function(){
				var obj = $(this),
					p = obj.closest(".fives-card-people"),
					input = obj.next("input");

				if(!p.length || !input.length){
					return false;
				}
				if(confirm("确定要删除接受人"+input.val()+"!")){
					p.remove();
				}
			});
		}
		function _setCardPeoples(peoples){
			var peopleArr = peoples.split(";"),
				one = "",
				html = "",
				reg = /(\d{11})(?:\(([^\s]+)\))?/g;

			for(var i=0,len=peopleArr.length;i<len;i++){
				one = peopleArr[i];
				html += one.replace(reg,_replace);
			}
			fivesCardPeoples.html(html)
		}
		function _replace(p1,p2,p3){
			return _cardHtml(p2,p3);
		}
		// 请柬接受人html
		function _cardHtml(userPhone,userName){
			userPhone = userPhone || "";
			userName = userName ? '('+userName+')' : "";

			html = '<div class="fives-card-people" data-phone="'+userPhone+'">'+userPhone+userName+'<i class="glyphicon glyphicon-remove deleteCardPeople"></i><input type="checkbox" class="dn" name="inviter" value="'+userPhone+userName+'"/></div>';
			return html;
		}
	}
	xmsInet.fivesOrder = _fivesOrder;

	// 57餐厅信息的模块代码
	function _fivesRestInfo(){
		var containter = $("#restInfo"),
			formSub1 = $("#formSub1"),
	    	fivesCallTabInfo = $(".fivesCallTabInfo");
			fivesSearchRestList = $("#fivesSearchRestList");

		if(!containter.length){
			alert("缺少#restInfo！");
			return false;
		}
		
		containter.on("loadHtmlSucc",_loadContainter);
		
		function _loadContainter(){
			var fivesResImpress = containter.find(".fivesResImpress"),
				restDiscount = containter.find(".fives-rest-discount"),
	    		restFestival = containter.find(".fives-rest-festival");

	    	fivesResImpressFn(fivesResImpress);
    		function popoverShow(){
    			var obj = $(this), 
    				targetEle = $(obj.attr("data-target")),
    				html = targetEle.html(),
    				option = {
    					"placement":"bottom",
    					"html":true
    				};
    			if(html){
    				option.content = html;
	    			obj.popover(option);
	    			obj.popover('show');
    			}
    		}
    		function popoverHide(){
    			$(this).popover('destroy');
    		}
	    	// 折扣、节日
	    	if(restDiscount.length){
	    		restDiscount.on("mouseover",popoverShow);
	    		restDiscount.on("mouseleave",popoverHide);
	    	}
	    	if(restFestival.length){
	    		restFestival.on("mouseover",popoverShow);
	    		restFestival.on("mouseleave",popoverHide);
	    	}

		    // 信息反馈
		    var infoFeedback = $(".infoFeedback");
		    if(infoFeedback.length){
				_complaintModal.call(infoFeedback, {
					data : xmsCore.xmsQueryParam({
			    			"data": fivesCallTabInfo.attr("data-form"),
			    			"replace": fivesCallTabInfo.attr("data-data")
			    		})
				});
			}

    		// 发送短信
    		var sendMsg = $(".sendMsg");
    		if(sendMsg.length){
    			_sendMsgModal.call(sendMsg, xmsCore.xmsQueryParam({
	    			"data":fivesCallTabInfo.attr("data-form"),
	    			"replace": fivesCallTabInfo.attr("data-data")
	    		}));
    		}
    		

	    	//否则，会一直被子元素的loadHtmlSucc冒泡的
			fivesResImpress.on("loadHtmlSucc",_preventDefault);
	    	return false;
		}
		function _preventDefault(){
			return false;
		}

		// 展开更多
	    containter.on("click",".openBtn",function(){
	    	var obj = $(this), type = obj.attr("data-type") || "false",
	    		openContEle = obj.siblings(".openCont");

	    	if(openContEle.length){
	    		if(type=="false"){
	    			openContEle.slideDown();
	    			obj.text("收起");
	    			obj.attr("data-type","true");
	    		}else if(type=="true"){
	    			openContEle.slideUp();
	    			obj.text("展开详情");
	    			obj.attr("data-type","false");
	    		}
	    	}
	    });

	    // 57下单
	    containter.on("click",".fivesOrder", function(){
	    	var fivesUserInfos = $(".fives-user-infos"), 
	    		data = data = xmsCore.xmsQueryParam({
					"data": fivesCallTabInfo.attr("data-data"),
					"replace": fivesCallTabInfo.attr("data-form")
				});

	    	data = xmsCore.xmsQueryParam({
    			"data": data,
    			"replace": formSub1.xmsSerialize()
    		});
	    	if(fivesUserInfos.length){
	    		data = xmsCore.xmsQueryParam({
					"data": data,
					"replace": fivesUserInfos.xmsSerialize()
				});
	    	}
    		fivesCallTabInfo.attr("data-form",data);
	    	_fivesOrder();
	    });

	    // o2o下单
	    containter.on("click",".o2oOrder", function(){
	    	var obj = $(this), url = obj.attr("href"), 
	    		data = fivesCallTabInfo.attr("data-form");
	    	if(!url){
	    		alert("缺少O2O下单链接！");
	    		return false;
	    	}
	    	data = xmsCore.xmsQueryParam({
    			"data": data,
    			"replace": formSub1.xmsSerialize()
    		});
    		fivesCallTabInfo.attr("data-form",data);
    		obj.attr("href",xmsCore.xmsQueryUrl({
    			url: url,
    			fn: data
    		}));
	    });

	    // 相似餐厅
	    containter.on("click",".similarRest", function(){
	    	var obj = $(this),
	    		data = obj.attr("data-data");
	    	if(!data){
	    		alert("缺少resid");
	    		return false;
	    	}
	    	data = "Action=Similar&"+data;
	    	$("#formSub2").find("[type='reset']").trigger("click");
	    	_fivesRefreshRestList(fivesSearchRestList,data);
	    });

	    // 印象
	    function fivesResImpressFn(resImpress){
	    	var impressFormEle = $("#impressForm");
	    	if(!resImpress.length){
	    		return false;
	    	}

		    // 餐厅印象加载
		    function fivesResImpressLoad(data){
				resImpress.html("");
		    	resImpress.xmsLoadHtml({
					fn: data
		    	});
		    }
		    function fivesResImpressSub(data){
		    	var obj = $(this);
		    	obj.ajaxFn({
		    		url: impressFormEle.attr("action"),
		    		data: data,
		    		success: function(json){
		    			if(json.msg){
		    				alert(json.msg);
		    			}
		    			if(json.succ){
		    				fivesResImpressLoad(data);
		    			}
		    		}
		    	});
		    }
		    fivesResImpressLoad();
		    // 发布
		    impressFormEle.xmsFormSubmit(function(json){
    			if(json.msg){
    				alert(json.msg);
    			}
		    	if(json.succ){
		    		fivesResImpressLoad();
		    	}
		    });
		    /*impressFormEle.on("click","[type='submit']",function(){
		    	fivesResImpressLoad(impressFormEle.serialize());
		    });*/
		    // 添加/删除 印象
		    var timer1 = 0, timer2 = 0;
		    resImpress.on("click",".int_impr",function(event){
				event.stopPropagation();
				event.preventDefault();
		    	var obj = $(this), data = obj.attr("data-data");
		    	clearTimeout(timer1);
		    	timer1 = setTimeout(function(){
		    		fivesResImpressSub.call(obj,data);
		    	},500);
		    });
		    // 点赞
		    resImpress.on("click",".impTipTrigger",function(){
		    	var obj = $(this), data = obj.attr("data-data");
		    	clearTimeout(timer2);
		    	timer2 = setTimeout(function(){
		    		if(confirm("确认赞同此印象？")){fivesResImpressSub.call(obj,data);
		    		}
		    	},500);
		    });
	    }
	    
	}
	xmsInet.fivesRestInfo = _fivesRestInfo;
	//57客户信息的模块代码
	function _fivesUserInfo(){
		var customerInfo = $("#customerInfo"),
			fivesCallTabInfo = $(".fivesCallTabInfo"),
			xmsFillInfos = xmsCore.xmsFillInfos,
			xmsLoadHtml = xmsCore.xmsLoadHtml,
			allpass = xmsCore.basic_method.allpass;
			
		customerInfo.on("click",".searchMember",_searchMember);
		
		//点击搜索之后，触发的回调函数
		function _searchMember(){
			var _obj = $(this),
				orderList = customerInfo.find(".fives-user-order-list"),
				_phone = customerInfo.find("#custTel"),
				value = _phone.val(),
				data = "",
				custInfBtn = $("#custInfBtn"),
				form = fivesCallTabInfo.attr("data-data") || "";
			
			if(!allpass("",_phone)){
				return "";
			}
			
			data = _phone.attr("name")+"="+value;
			_obj.ajaxFn({
				data:data,
				success:_searchMemberSucc
			});
			
			form = xmsCore.xmsQueryParam({
    			"data":form,
    			"replace": data
    		});
			orderList.xmsLoadHtml({
				fn:form
			});
    		fivesCallTabInfo.attr("data-data",form);
    		custInfBtn.attr("href",xmsCore.xmsQueryUrl({
    			"url":custInfBtn.attr("href"),
    			"fn": "Mobile="+value
    		}));
		}
		
		//自动填充请求数据
		function _searchMemberSucc(json){
			if(!json.custName){
				alert("未查到手机号为"+json.custPhone+"的会员信息，该客户可能不是会员！");
			}
			xmsFillInfos(customerInfo.find(".fives-user-infos"),json);
		}
	}
	//57百度地图的模块代码
	function _fivesBaiduMap(){
		var containter = $("#baiduMap"),
			fivesCallTabInfo = $(".fivesCallTabInfo"),
			formSub1 = $("#formSub1");

		containter.on("loadHtmlSucc",_loadContainter);
		function _loadContainter(){
			var iframe = containter.find("iframe"), data = "";
			iframe.css({
				"width":containter.outerWidth()+"px",
				"height":containter.outerHeight()+"px"
			});

			data = xmsCore.changeUrl(iframe.attr("data-src"),fivesCallTabInfo.attr("data-form"));
			iframe.attr("src",data);
			containter.css({
				"display": "block",
				"visibility": "hidden"
			})
		}
		containter.on("click","#mapOrder",function(){
			var obj = $(this),
				fivesUserInfos = $(".fives-user-infos"), 
	    		data = xmsCore.xmsQueryParam({
					"data": fivesCallTabInfo.attr("data-data"),
					"replace": fivesCallTabInfo.attr("data-form")
				});

	    	data = xmsCore.xmsQueryParam({
    			"data": data,
    			"replace": formSub1.xmsSerialize()
    		});	
	    	if(fivesUserInfos.length){
	    		data = xmsCore.xmsQueryParam({
					"data": data,
					"replace": fivesUserInfos.xmsSerialize()
				});
	    	}
    		fivesCallTabInfo.attr("data-form",data);
			_fivesOrder(data);
		});
	}
	//57菜单频道的代码
	function _fivesMenuChannel(){
		var containter = $("#menuChannel");

		containter.on("loadHtmlSucc",_loadContainter);
		function _loadContainter(){
			var items = containter.find(".menu-channel-item"),
				activeItem = items.filter(".active");

			if(activeItem.size()){
				_reflashDishList();
			}else{
				items.eq(0).trigger("click");
			}
			
			//否则，会一直被子元素的loadHtmlSucc冒泡的
			containter.find(".menu-detail-items").on("loadHtmlSucc",_preventDefault);
			
			return false;
		}
		
		function _preventDefault(){
			return false;
		}
		
		//获取额外的数据
		function _getExtraData(){
			var activeItem = containter.find(".menu-channel-item.active");
			
			if(!activeItem.size()){
				return "";
			}else{
				return activeItem.attr("data-name")+"="+activeItem.attr("data-value");
			}
		}
		
		containter.on("click",".menu-channel-item",_channelItemCb);
		function _channelItemCb(){
			var _obj = $(this);
				
			if(_obj.hasClass("active")){
				return;
			}
			
			_obj.parent().find(".menu-channel-item").removeClass("active");
			_obj.addClass("active");
			
			_reflashDishList();
			
		}
		
		//根据条件，更新菜单
		function _reflashDishList(pageIndex){
			var content = containter.find(".menu-detail-items"),
				reqData = "pageIndex=",
				extraData = _getExtraData();
			
			if(!isNaN(pageIndex)){
				reqData = reqData + pageIndex;
			}
			
			if(extraData){
				reqData += "&" + extraData
			}
			
			content.xmsLoadHtml({
				fn:reqData,
				succ:_reflashSucc,
				err:_reflashError
			});
		}
		
		//菜品更新成功后，执行的操作
		function _reflashSucc(){
			var pagination = containter.find(".pages"),
				_obj = $(this);
			
			if(pagination.size()){
				xmsCore.xmsPage(pagination,_reflashDishList);
			}
			
			//滚动到头部去。
			_obj.scrollTop(0);
		}
		
		//菜单更新成功之后，执行的操作
		function _reflashError(){
			alert("菜单刷新失败，请重新尝试");
			content.html("");
		}
	}
	function taskList(ajaxUrl,time,objCon){
		//任务列表的模块
		objCon = $(objCon || "");
		var Box = null,
			fixBox = null,
			//fixBox是对应的div的jquery对象
			taskOpenClose = null,
			taskNum = null,
			objConLen = objCon.size(),
			taskId = 0,
			hasNewTask = false,
			header = null,
			timer = null,
			importantTask = [],
			//重要的任务列表
			noTaskHtml = '<div class = "task-empty">'+
						'<p class = "tl">暂时无任务</p>'+
					'</div>';
			
		if(!objConLen){
			Box = new FixBox("",{title:"任务列表",position:"lb"});
		}else{
			Box = new FixBox(objCon,{title:"最新任务<a href = '#' class = 'r ml5 taskOpenClose'>展开↓</a><span class = 'r ml5'>共有<span id = 'taskNum' class = 'red' >0</span>条</span>",className:"new_order_task"});
		}
		
		header = Box.options.header;
		fixBox = Box.fixBox;
		taskOpenClose = fixBox.find(".taskOpenClose");
		taskNum = fixBox.find("#taskNum"),
		taskListObj = {
			//当前显示对象的个数
			length : 0,
			//当前正在处理的对象，处理完之后，执行添加
			cur : null,
		};
		//根据任务ID，进行缓存
		
		var bookertelEle = $("#bookertel");
		function refreshTask(){
			
			$.ajax({
				url:ajaxUrl,
				data: bookertelEle.attr("name")+"="+bookertelEle.val(),
				type:"post",
				dataType:"json",
				success:function(json){
					createContent(json);
				}
			});
			timer = setTimeout(refreshTask,time);
		}
		
		function getHTML(obj){
			//生成的html的结构
			var details = obj.details || "",
				resName = $.trim(obj.ResName) || "",
				mobile = obj.Mobile || "",
				url = obj.url || "",
				html = "";
				
			if(!details && !url){
				return "";
			}
			
			html = '<div class = "task-list">';
			if(resName){
				html += '<p class = "tl task-resname">'+resName+'</p>';
			}
			
			if(mobile){
				html += '<div class = "tl task-mobile"><span class = "task-name-tag">电话</span>：'+mobile+'</div>';
			}
			
			//富文本编辑部分，出现解码出错的情况，这里进行一个处理
			//该部分处理占时没有时间研究富文本的部分，所以使用这个笨方法
			//details的部分使用replace方法处的处理。
			html += '<div class = "tl mb5 ovh"><span class = "task-name-tag l">任务：</span><div style = "margin-left:35px;">'+details+'</div></div>'+
						'<button type="button" class="btn btn-primary btn-sm confirmTask" data-url = "'+url+'" data-id = "'+(obj.Id || "")+'">详情</button>'+
					'</div>';
			return html;
		}
			
		function createContent(json){
			json = typeof json == "string"?$.parseJSON(decodeURIComponent(json)):json;
			
			var html = "",
				i = 0,
				len = json.length,
				len2 = 0,
				hasNewTask = false,
				importantLen = 0,
				one = null,
				idNum = 0;
			
			for(i;i<len;i++){
				one = json[i];
				
				//id为缓存的key值，会根据该id，来判断
				idNum = one.Id;
				
				//判断是否为现在已有的任务，如果有，那么不做处理
				if(!(idNum in taskListObj)){
					//如果没有，那么把它显示到待显示的列表中去
					importantTask.push(one);
				}
			}
			
			importantLen = importantTask.length;
			
			//如果在任务列表中，任务为0，那么就直接显示无任务。
			if(taskListObj.length == 0){
				if(!html){
					html = noTaskHtml;	
				}
				//header.removeClass("task-new-header-bg");
				//有新任务时，会添加这个className
				html = $(html);
				Box.setContent(html);
			}
			
			if(importantLen){
				importantTaskFn(importantTask);
			}
			
		}
		
		var confirmOption = {
			title : "当前需要确认的操作",
			content : "",
			apply : "确认",
			applyCb : null
		};
		//在列表中，点击查看详情时，弹出的信息提示
		function _showDetail(){
			clearTimeout(timer);
			var _obj = $(this),
				id = _obj.attr("data-id"),
				thisTask = taskListObj[id];
				
			if(!thisTask || (typeof thisTask !== "object")){
				return false;
			}
			
			confirmOption.content = thisTask.details;
			confirmOption.applyCb = _showDetailBtn;
			mBox.custom(confirmOption);
			
		}
		
		//查看详情时，确认按钮的回调
		function _showDetailBtn(){
			//隐藏，并重新开始计时
			mBox.hide();
			timer = setTimeout(refreshTask,time);
		}
		
		function initEvent(){
			//对于新生成的悬浮框部分，添加一个事件
			
			fixBox.on("click","button.confirmTask",_showDetail);
			
			var resDetails = $(".resDetails");
			//展开部分，使用联动的处理
			if(objConLen && resDetails.size()){

				resDetails.linkAge({
					src:".taskOpenClose",
					type:"click",
					dataAttr:"data-rel",
					callbacks:[function(obj){
						fixBox.find(".task-list").show();
						$(this).attr("data-open",1).html("收起↑");
					},function(obj){
						//obj.slideUp();
						fixBox.find(".task-list").not(":first").hide();
						$(this).attr("data-open",0).html("展开↓");
					}]
				});
			}
		}
		
		function showOpenClose(len){
			if(len<=1){
				taskOpenClose.hide();
			}else{
				taskOpenClose.show();
			}
		}
		
		function importantTaskFn(){
			//重要的任务提醒
			clearTimeout(timer);
			
			var thisTask = null;
			
			if(!importantTask.length){
				//如果没有需要显示的任务了，则开始继续轮询任务
				mBox.hide();
				timer = setTimeout(refreshTask,time);
				return "";
			}
			
			//获取第一条重要任务
			thisTask = importantTask.shift();
			taskListObj.cur = thisTask;
			
			confirmOption.content = thisTask.details;
			confirmOption.applyCb = _taskItemMakeTrue;
			mBox.custom(confirmOption);
			
		}
		
		function _taskItemMakeTrue(){
			var curInfo = taskListObj.cur,
				len = 0
				firstItems = fixBox.find(".task-list").eq(0),
				html = "",
				isOpen = 0;
			
			if(!curInfo){
				//继续循环下一条
				importantTaskFn();
				return "";
			}
			
			if(curInfo.Id in taskListObj){
				//表示在taskListObj中，已经保存了该方法，
				//那么就直接结束
				return false;
			}
			
			html = $(getHTML(curInfo));
			
			//把当前已经点击确认的，直接保存到缓存对象上去
			len = taskListObj.length+1;
			taskListObj.length = len;
			taskListObj[curInfo.Id] = curInfo;
			
			//更改显示的个数
			taskNum.text(len);
			showOpenClose(len);
				
			isOpen = taskOpenClose.attr("data-open") || 0;
			
			fixBox.prev().css("bottom",fixBox.outerHeight()-0+5);
				
			if(isOpen != 1){
				firstItems.hide();
			}
			
			if(len == 1){
				Box.setContent(html);
			}else{
				firstItems.before(html);
			}
			//继续循环下一条
			importantTaskFn();
		}
		
		//开始循环加载信息
		refreshTask();
		initEvent();
		
	}
	xmsInet.taskList = taskList;

	function triggerTask(ajaxUrl){
		//ajaxUrl为目标的ajax请求地址
		//一些元素，会触发新的任务模式
		
		var operaDate = $("#operaDate"),
			// operaDateHideEle = $(".operaDateHide"),
			operaDateName = operaDate.attr("name"),
			oldDate = _removeWeekGetDate(operaDate.val()) || "",

			operaNum = $("#operaNum"),
			operaNumName = operaNum.attr("name"),

			operaTel = $("#bookertel"),
			operaTelName = operaTel.attr("name"),

			selTimeList = $(".selTimeList"),
			operaTime = null,
			operaTimeInput = null,
			operaTimeName = "",
			oldTime = "",

			intMapDateBox = $("#intMapDateBox"),
			bookSeat = $("#bookSeat"),
			timer = {
				time:null,
				count:null,
				deleteS:null,
				date:null
			},
			catlogs_list = $("#catlogs_list"),
			triggerTask = $(".triggerTask");
		
		function getDate(){
			var phoneNum = $.trim(operaTel.val()) || "", arr = [], checked = $(".operaTime:checked");
			$.each(triggerTask,function(index,ele){
				var obj = $(ele);
				arr.push(obj.attr("name")+"="+obj.val());
			});

			return operaDateName+"="+_removeWeekGetDate(operaDate.val())+"&"+$(".operaTime").eq(0).attr("name")+"="+checked.val()+"&"+"uid="+checked.attr("data-uid")+"&"+operaTelName+"="+phoneNum+"&"+operaNum.attr("name")+"="+operaNum.val()+"&"+arr.join("&");
		}
		// 修改日期
		function initDate(){
			operaDate.on("changeDate",function(){
				var obj = $(this),value = "";
				setTimeout(function(){
					value = $.trim(operaDate.val());
					if(oldDate == value){
						return false;
					}
					oldDate = value;
					ajaxDate.call(operaDate);
				})
			});
			
			function ajaxDate(){
				var obj = $(this);
				clearTimeout(timer.date);
				timer.date = setTimeout(function(){
					var triggerType = obj.attr("data-triggerType") || "",
						data = "triggerType="+triggerType+"&"+getDate();
					ajaxFn(obj,data);
				},100);
			}
			
			if(oldDate){
				ajaxDate.call(operaDate);
			}
		}
		// 修改人数
		function initCount(){
			operaNum.on("input",function(){
				clearTimeout(timer.count);
				timer.count = setTimeout(function(){
					var triggerType = operaNum.attr("data-triggerType") || "",
						data = "triggerType="+triggerType+"&"+getDate();
					ajaxFn(operaNum,data);
				},300);
			});
		}
		// 选择餐位
		function initSelect(){
			catlogs_list.on("click",".select_btn",function(){
				var obj = $(this),
					catlogLi = obj.closest("li[data-catlog]"),
					catlogNum = catlogLi.find("[data-type=num]").text(),
					catlog = "",
					data = "",
					triggerType = "";
				
				if(!(catlogNum-0)){
					return "";
				}
				triggerType = obj.attr("data-triggerType") || "",
				catlog = catlogLi.attr("data-catlog");
				data = "triggerType="+triggerType+"&"+"catlog="+catlog+"&"+getDate();
				
				ajaxFn(obj,data);
			});
		}
		
		function deleSelect(){
			//删除已选的餐位时，执行的处理
		}
		// 修改时间，同时触发时间与查询餐位
		function initTime(){
			var inputEle = null;
			selTimeList.on("click",".sel-time",function(){
				var obj = $(this);
				if(!operaTimeName){
					inputEle = obj.find(".operaTime");
					operaTimeName = inputEle.attr("name")
				}
				clearTimeout(timer.time);
				timer.time = setTimeout(function(){
					var value = $.trim($(".operaTime").filter(":checked").val());
					if(oldTime == value){
						return false;
					}
					oldTime = value;

					var triggerSearch = bookSeat.attr("data-triggerType") || "",

						dataSearch = "triggerType="+triggerSearch+"&"+getDate(),

						triggerTime = selTimeList.attr("data-triggerType") || "",
						dataTime = "triggerType="+triggerTime+"&"+getDate();
	
					ajaxFn(inputEle,dataTime);

					ajaxFn(bookSeat,dataSearch);
				},300);	
			});
		}
		
		function ajaxFn(obj,data){
			obj.removeClass("ajaxNewFn_please_wait");

			xmsCore.ajaxFn(obj,{
				url:ajaxUrl,
				data:data
			});
		}
		
		initDate();
		initCount();
		initSelect();
		initTime();
	}
	xmsInet.triggerTask = triggerTask;
	
})(window);