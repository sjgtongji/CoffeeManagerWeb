 /*------------------------------------------------- implement (工具)-----------------------------------------------*/
//字符串相关工具
String.implement({
	cnEncode: function() {
		return encodeURIComponent(this);
	},
	cnDecode: function() {
		return decodeURIComponent(this);
	},
	trimHTML: function() {
		var mach = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;'	
		}, expr = /[&<>"]/g;
		return this.replace(expr, function(o) { return mach[o]; });
	},
	stripHTML: function() {
		return this.replace(/<(?:.|\s)*?>/g, "");
	},
	trimSearch: function() {
		return DBC2SBC(this.trim()).replace(/[^a-zA-Z0-9\u4E00-\u9FA5 \-\_，\']/g, "").slice(0, 50);
	},
	temp: function(obj) {
		// HTML模板匹配	
		return this.replace(/\$\w+\$/gi, function(matchs) {
			var returns = obj[matchs.replace(/\$/g, "")];		
			return (returns + "") == "undefined"? "": returns;
		});
	},
	query: function(key, value) {
		var arrSplitHash = this.split("#"), arrSplitAsk = arrSplitHash[0].split("?"), hash = new Hash({}), queryResult = '';
		if (arrSplitAsk.length === 2) {
			arrSplitAsk[1].split("&").forEach(function(keyValue) {
				if (/=/.test(keyValue)) {
					hash[keyValue.split("=")[0]] = (keyValue.split("=")[1] || "");
				}	
			});
			hash[key] = value;
			// 重组
			queryResult = arrSplitAsk[0] + "?" + hash.toQueryString();
		} else {
			queryResult = arrSplitHash[0] + "?" + key + "=" + value;
		}
		if (arrSplitHash[1]) queryResult = queryResult + "#" + arrSplitHash[1];
		return queryResult;
	}
});

//元素相关方法
Element.implement({
	//装载HTML内容,此方法用来装载HTML片段字符串，如果要直接装载节点，请使用inject()方法
	appendHTML: function(html, where) {
		if ($type(html) != 'string') return false;
		where = where || 'bottom';
		var temp = new Element('div');
		temp.set('html', html);
		var data = (where == 'bottom' || where == 'before') ? $A(temp.childNodes) : $A(temp.childNodes).reverse();
		data.each(function(node) {
			if ($type(node) == 'element') $(node).inject(this, where);
		}, this);
		return this;
	},
	//将mootools默认的setStyle以及setStyles方法转化为与jQuery类似的css()形式
	css: function(key, value) {
		if ($type(key) == 'object') {
			for (var p in key) this.css(p, key[p]);
			return this;
		}
		if(!$chk(value)){
			return this.getStyle(key);
		}
		this.setStyle(key, value);
		return this;
	},
	//将mootools默认的setProperty以及setProperties方法转化为与jQuery类似的attr()形式
	attr: function(key, value) {
		if ($type(key) == 'object') {
			for (var p in key){
				this.attr(p, key[p]);
			}
			return this;
		}
		if(!$chk(value)){
			if (value === "") {
				return this.removeProperty(key);
			}
			return this.getProperty(key);
		}
		this.setProperty(key, value);
		return this;
	},
	//val方法
	val: function (v) {
		if ($chk(v) || v == "") {
			return this.set("value", v);
		} else {
			return this.get("value");	
		}
	},
	//宽度高度方法,width/height的命名在有问题，与img等元素的width属性冲突。故w/h代替
	w: function (v) {
		if ($chk(v)) {
			return this.css("width", v);
		} else {
			return this.getWidth();	
		}
	},
	h: function (v) {
		if ($chk(v)) {
			return this.css("height", v);
		} else {
			return this.getHeight();	
		}
	},
	//html, text方法 ， 命名text会出错，txt代替
	html: function(v) {
		if ($chk(v) || v == "") {
			return	this.set("html", v);
		} else {
			return this.get("html");	
		}
	},
	txt: function(v) {
		if ($chk(v) || v == "") {
			return	this.set("text", v);
		} else {
			return this.get("text");	
		}
	},
	//元素是否隐藏，如果显示，返回true，否则false
	isDisplayed: function(completecover) {
		return completecover? (this.type != 'hidden' && this.getStyle('display') != 'none' && this.getStyle('visibility') != 'hidden') : (this.getStyle('display') != 'none');
	},
	toggle: function() {
		return this[this.isDisplayed() ? 'hide' : 'show']();
	},
	hide: function() {
		return this.css('display', 'none');
	},
	show: function(display) {
		return this.css('display', display ||  'block');
	},
	visible: function() {
		return this.css('visibility', 'visible');
	},
	invisible: function() {
		return this.css('visibility', 'hidden');
	},
	out: function() {
		return this.css({
			position: 'absolute',
			top: '-9999px',
			left: '-9999px'
		});
	},
	into: function() {
		return this.css('position', 'static');
	},
	swapClass: function(remove, add) {
		return this.removeClass(remove).addClass(add);
	}
});

/*------------------------------------------------- public function (公共方法)-----------------------------------------------*/

/*------------------------ validate (一些验证)------------------------------*/

var $isFun = function (o) {
	return $type(o) === "function";
}, $isEle = function(o) {
	return $type(o) === "element";	
}, $isObj = function(o) {
	return $type(o) === "object";	
}, $isArr = function(o) {
	return $type(o) === "array";	
}, $isStr = function(o) {
	return $type(o) === "string";
}, $isNum = function(o) {
	return $type(o) === "number";
}, $isIe6 = function() {
	return window.XMLHttpRequest? false : true;
}();



// 全角半角转换
var DBC2SBC = function(str){
 var result = '', i, code;
 for (i=0 ; i<str.length; i++){
  code = str.charCodeAt(i);
  if (code >= 65281 && code <= 65373){
	result += String.fromCharCode(str.charCodeAt(i) - 65248);
  }else if (code == 12288) {
	result += String.fromCharCode(str.charCodeAt(i) - 12288 + 32);
  }else {
   result += str.charAt(i);
  }
 }
 return result;
};

//返回正则匹配判断
var $isRegex = function(ele, regex, params) {
	// 原始值和处理值
	var inputValue = $(ele).get("value"), dealValue = inputValue, type = ele.getAttribute("type");
	if (type !== "password") {
		// 密码不trim前后空格，以及全半角转换
		dealValue = DBC2SBC(inputValue.trim());
		//  文本框值改变，重新赋值
		dealValue !== inputValue && $(ele).set("value", dealValue);
	}
	
	// 正则获取，pattern属性获取优先，然后通过type类型匹配。注意，不处理为空的情况
	regex = regex || $(ele).getProperty("pattern") || (function() {
		// 文本框类型处理，可能有管道符——多类型重叠
		return type && type.split("|").map(function(typeSplit) {
			var matchRegex = $isRegex[typeSplit.toUpperCase()];
			if (matchRegex) return matchRegex;
		}).join("|");	
	})();
	
	if (dealValue === "" || !regex) return true;
	
	// multiple多数据的处理
	var isMultiple = ele.getAttribute("multiple") !== null;
	if (isMultiple && !/^number|range$/i.test(type)) {
		var isAllPass = true;
		dealValue.split(",").each(function(partValue) {
			partValue = partValue.trim();	
			if (isAllPass && !partValue.test(regex, params || 'i')) {
				isAllPass = false;
			}
		});
		return isAllPass;
	} else {
		return dealValue.test(regex, params || 'i');	
	}
}
// 数值大小，字符长度是否溢出的判断
, $isOverflow = function(ele) {
	ele = ele && $(ele);
	if (!ele) return false;
	//  大小限制
	var attrMin = ele.attr("min"), attrMax = ele.attr("max"), attrStep
		// 长度限制
		, attrDataMin, attrDataMax
		// 值
		value = ele.value;
		
	if (!attrMin && !attrMin) {
		attrDataMin = ele.attr("data-min"), attrDataMax = ele.attr("data-max");
		if (attrDataMin && value.length < attrDataMin) {
			$testRemind(ele, "至少输入" + attrDataMin + "个字符", true);
			ele.focus();
		} else if (attrDataMax && value.length > attrDataMax) {
			$testRemind(ele, "最多输入" + attrDataMax + "个字符", true);
			//ele.focus();
			ele.selectRange(attrDataMax, value.length);
		} else {
			return false;	
		}
	} else {
		// 数值大小限制
		value = Number(value);
		attrStep = Number($(ele).attr("step")) || 1;

		if (attrMin && value < attrMin) {
			$testRemind(ele, "值必须大于或等于" + attrMin, true);	
		} else if (attrMax && value > attrMax) {
			$testRemind(ele, "值必须小于或等于" + attrMax, true);	
		} else if (attrStep && !/^\d+$/.test((value - attrMin || 0) / attrStep)) {
			$testRemind(ele, "值无效", true);	
		} else {
			return false;	
		}
		ele.focus();
		ele.select();
	}
	return true;
}
// 为空判断
, $isEmpty = function(ele, value) {
	value = value || $(ele).getProperty("placeholder");
	var trimValue = $(ele).get("value").trim();
	if (trimValue === "" || trimValue === value) return true;	
	return false;	
};
$isRegex.extend({
    EMAIL:"^[a-z0-9._%-]+@([a-z0-9-]+\\.)+[a-z]{2,4}$",
	NUMBER: "^\\d+(\\.\\d+)?$",
    URL:"^(http|https|ftp)\\:\\/\\/[a-z0-9\\-\\.]+\\.[a-z]{2,3}(:[a-z0-9]*)?\\/?([a-z0-9\\-\\._\\?\\,\\'\\/\\\\\\+&amp;%\\$#\\=~])*$",
    TEL:"^1\\d{10}$",
    ZIPCODE:"^\\d{6}$",
	"prompt": {
		radio: "请选择一个选项",
		checkbox: "如果要继续，请选中此框",
		"select": "请选择列表中的一项",
		email: "请输入电子邮件地址",
		url: "请输入网站地址",
		tel: "请输入手机号码",
		date: "请输入日期",
		number: "请输入数值",
		price: "请输入数值",
		pattern: "内容格式不符合要求",
		empty: "请填写此字段",
		multiple: "多条数据使用逗号分隔"
	}
});


Element.implement({
	getOffsetParent: function() {
		var body = this.getDocument().body;
		if (this == body) return null;
		if (!Browser.Engine.trident) return $(this.offsetParent);
		var el = this;
		while ((el = el.parentNode)){
			if (el == body || Element.getComputedStyle(el, 'position') != 'static') return $(el);
		}
		return null;
	},

	getCaretPosition: function() {
		if (!Browser.Engine.trident) return this.selectionStart;
		this.focus();
		var work = document.selection.createRange();
		var all = this.createTextRange();
		work.setEndPoint('StartToStart', all);
		return work.text.length;
	},
	
	// 文本框中元素选中, Autocompleter组件中有使用
	selectRange: function(start, end) {
		if (Browser.Engine.trident) {
			var range = this.createTextRange();
			range.collapse(true);
			range.moveEnd('character', end);
			range.moveStart('character', start);
			range.select();
		} else {
			this.focus();
			this.setSelectionRange(start, end);
		}
		return this;
	},

	validate: function(elements) {
		var allpass = true, remind = function(control, type, tag) {
			var key = control.attr("data-key"), placeholder = control.attr("placeholder"), text= '';
			$$("label[for='"+ control.id +"']").each(function(eleLabel) {
				var txtLabel = eleLabel.txt();
				if (txtLabel !== placeholder) text += txtLabel.replace(/\*|:|：/g, "").trim();
			});
			// 如果元素完全显示
			if (control.isDisplayed(true)) {
				if (type == "radio" || type == "checkbox") {
					$testRemind(control, $isRegex.prompt[type]);
					control.focus();
				} else if (tag == "select" || tag == "empty") {
					// 下拉值为空或文本框文本域等为空
					$testRemind(control, (tag == "empty" && text)? "您尚未输入"+ text : $isRegex.prompt[tag], true);
					control.focus();
				} else if (/^range|number$/i.test(type) && Number(control.val())) {
					// 整数值与数值的特殊提示
					$testRemind(control, "值无效", true);
					control.focus();
					control.select();
				} else {
					// 文本框文本域格式不准确
					// 提示文字的获取	
					var finalText = $isRegex.prompt[type] || $isRegex.prompt["pattern"];
					if (text) {
						finalText = "您输入的"+ text +"格式不准确";
					}
					
					if (type != "number" && control.getAttribute("multiple") !== null) {
						finalText += "，" + $isRegex.prompt["multiple"];
					}
					$testRemind(control, finalText, true);
					control.focus();
					control.select();	
				}			
			} else {
				// 元素隐藏，寻找关联提示元素, 并走label提示流
				var target = $(control.attr("data-target") + "");
				var customTxt = "您尚未" + (key || (tag == "empty"? "输入": "选择")) + ((!/^radio|checkbox$/i.test(type) && text) ||"该项内容");
				if (target) {
					if (target.getPosition().y < window.getScroll().y) {  window.scrollTo(0, target.getPosition().y - 50); }
					$testRemind(target, customTxt, true);
				} else {
					Mbox.alert(customTxt);	
				}
			}
			return false;
		};

		elements = elements || this.getElements('input, select, textarea');
		
		elements.each(function(el){
			var type = (el.getAttribute("type") + "").toLowerCase(), tag = el.get('tag'), isRequired = el.attr("required") !== null; 
			if (allpass == false || el.disabled || type == 'submit' || type == 'reset' || type == 'file' || type == 'image') return;
			// 需要验证的有
			// input文本框, type, required, pattern, max, min以及自定义个数限制data-min, data-max
			// radio, checkbox
			// select
			// textarea
			// 先从特殊的下手，如单复选框	
			if (type == "radio" && isRequired) {
				// 单选框，只需验证是否必选，同一name单选组只有要一个设置required即可
				var eleRadios = el.name? $$("input[type='radio'][name='"+ el.name +"']"): [el]
					, radiopass = false;
					
				eleRadios.each(function(radio) {
					if (radiopass == false && radio.attr("checked")) {
						radiopass = true;
					}
				});
				
				if (radiopass == false) {
					allpass = remind(eleRadios[0], type, tag);
				}
			} else if (type == "checkbox" && isRequired && !el.attr("checked")) {
				// 复选框是，只有要required就验证，木有就不管
				allpass = remind(el, type, tag);
			} else if (tag == "select" && isRequired && !el.value) {
				// 下拉框只要关心值
				allpass = remind(el, type, tag);
			} else if ((isRequired && $isEmpty(el)) || !(allpass = $isRegex(el))) {
				// 各种类型文本框以及文本域
				// allpass为true表示是为空，为false表示验证不通过
				allpass? remind(el, type, "empty"): remind(el, type, tag);
				allpass = false;
			} else if ($isOverflow(el)) {
				// 最大值最小值, 个数是否超出的验证
				allpass = false;
			}
		});
		
		return allpass;
	}
});

var $pageFresh = function(param) {
	if ($isStr(param)) {
		location.href = param;
	} else if ($isEle(param)) {
		// 元素值改变与页面刷新
		param.addEvent("change", function() {
			$pageFresh(this.value);	
		});	
	} else if (param + "" === "undefined") {
		location.href = location.href.split("#")[0];
	}
};

/*----------------------------------组件方法-----------------------------------------*/
//Ajax方法
 var AjaxReq = new Class({
 	Implements: [Options, Events],
 	options: {
 		url: null,
 		method: 'get',
 		data: null,
 		headers: {},
 		async: true,
 		evalScripts: true,
 		secure: false,
 		update: false,
 		//custom options
 		callType: 'json',
 		timeOut: 30000,
 		onRequest: $empty,
 		onSuccess: $empty,
 		onError: $empty

 	},

 	initialize: function(options) {
 		this.setOptions(options);
 		var requestOptions = {
 			url: this.options.url,
 			method: this.options.method,
 			data: this.options.data,
 			headers: this.options.headers,
 			async: this.options.async,
 			evalScripts: this.options.evalScripts,
 			secure: this.options.secure,
 			update: this.options.update
 		};
 		requestOptions.onRequest = this.request.bind(this);
 		requestOptions.onSuccess = this.success.bind(this);
 		requestOptions.onFailure = requestOptions.onException = requestOptions.onCancel = this.error.bind(this);

 		switch (this.options.callType) {
 			case 'html': {
				this.ajax = new Request.HTML(requestOptions);
				break;
			}
 			case 'json': {
				this.ajax = new Request.JSON(requestOptions);
				//this.ajax.headers.extend({ 'Accept': 'application/json, */*' });
				break;
			}
 		}
 		return this;
 	},
 	error: function() {
 		if (this.options.timeOut) $clear(this.options.timeOut);
 		this.fireEvent('error');
 		return this;
 	},
 	success: function(a, b, c, d) {
 		if (this.options.timeOut) $clear(this.options.timeOut);
 		if (this.options.callType == 'html') {
 			if (this.$events.success) {
 				this.fireEvent('success', [a, b, c, d]);
 			}
 		} else {
 			if (this.$events.success) {
 				this.fireEvent('success', [a, b]);
 			}
 		}
 		return this;
 	},
 	request: function() {
 		this.fireEvent('request');
 		return this;
 	},
 	send: function(options) {
 		this.options.timeOut = setTimeout(function() { this.ajax.cancel(); }.bind(this), this.options.timeOut);
 		this.ajax.send(options);
 	}
 });
 
 //overlay class, 这个就是弹出框的黑色半透明背景层
var Overlay = new Class({
	Implements: [Options, Events],
	getOptions: function() {
		return {
			name:'',
			duration: 200,
			colour: '#000',
			opacity: 0.35,
			zIndex: 99,
			container: document.body,
			onClick: $empty
		};
	},

	initialize: function(options) {
		this.isAndroidPad = Browser.Platform.android;
		
		if (this.isAndroidPad) return this;
		
		this.setOptions(this.getOptions(), options);
		this.options.container = $(this.options.container);

		this.container = new Element('div').setProperty('id', this.options.name+'_overlay').setStyles({
			position: 'absolute',
			left: '0px',
			top: '0px',
			width: '100%',
			height: '100%',
			backgroundColor: this.options.colour,
			zIndex: this.options.zIndex,
			opacity: this.options.opacity
		}).inject(this.options.container);

		this.container.setStyle('display', 'none');

		this.container.addEvent('click', function() {
			this.fireEvent('click');
			return false;
		}.bind(this));

		window.addEvent('resize', this.position.bind(this));
		return this;
	},

	position: function() {
		if (this.isAndroidPad) return this;
		if (this.options.container == document.body) {
			var h = window.getScrollHeight() + 'px';
			this.container.setStyles({ height: h });
		} else {
			var myCoords = this.options.container.getCoordinates();
			this.container.setStyles({
				top: myCoords.top + 'px',
				height: myCoords.height + 'px',
				left: myCoords.left + 'px',
				width: myCoords.width + 'px'
			});
		}
		return this;
	},
	//调用此方法可以直接显示黑色半透明的覆盖层，默认层级99，opacity为0.35
	show: function() { 
		if (this.isAndroidPad) return this;
		this.container.setStyle('display', '');
		return this.position();
	},

	hide: function(dispose) {
		if (this.isAndroidPad) return this;
		this.container.setStyle('display', 'none');
		if (dispose) this.dispose();
		return this;
	},

	dispose: function() {
		if (this.isAndroidPad) return this;
		this.container.dispose();
	}
});

/**
* Class Mbox 
*
* Mbox.open(options, from) -> {type,url}
* Mbox.alert() | Mbox.remind() | Mbox.confirm()
**/

var Mbox = {
	presets: {
		marginImage: { x: 50, y: 75 },
		width: 'auto',
		height: 'auto',
		
		url: false, //可以是元素，字符串
		type: 'ele', //ajax, string, iframe, image
		ajax: false,
		ajaxAttr: "href",
		ajaxOptions: {},
		
		title: '提示框',
		ensure: '确定',
		cancel: '取消',
		clostxt: '×',
		loadimg: 'http://s1.95171.cn/adentity/images/o_loading.gif',

		overlay: true,
		opacity: 0.35,
		overlayClosable: false,
		
		reposition: true,
		
		//关闭按钮显示
		closable: true,
		titleable: true,
		optable: false,
		dragable: true,
		zIndex: 199,
		
		//延时关闭
		time: 0,

		useFx: false,
		resizeFx: {},

		onShow: $empty,
		onClose: $empty
	},	
	//初始化
	initialize: function(presets) {
		this.options = {};
		this.setOptions(this.presets, presets || {});
		this.build();
		this.bound = {
			window: this.reposition.bind(this, [null]),
			close: this.close.bind(this),
			key: this.onKey.bind(this)
		};
		
		this.isOpen = this.elementObj = false;
		this.ie6 = (window.XMLHttpRequest) ? false: true;
		
		this.time = this.options.time.toInt();
	
		return this;
	},
	//构建
	build: function() {
		if (!this.overlay) {
			this.overlay = new Overlay({ name: 'mbox', opacity: this.options.opacity, onClick: (this.options.overlayClosable) ? this.close.bind(this) : null, zIndex: this.options.zIndex - 1});	
		}
		if (!$("mboxWindow")) {
			//页面上无mbox元素
			var boxConstr = '<div class="mbox_top"></div>' + 
					'<div id="mboxBar" class="mbox_bar"><div class="mbox_bar_top"></div>' +
					'<div id="mboxTitle" class="mbox_title">'+this.options.title+'</div>' +
				'</div>' +
				'<div class="mbox_close_box" style="-webkit-user-select:none;"><a href="javascript:;" id="mboxBtnClose" class="mbox_close" title="关闭">'+this.options.clostxt+'</a></div>' +
				'<div id="mboxContent" class="mbox_cont"></div>' + 
				'<div id="mboxOperate" class="mbox_operate" style="display:none;"></div>' + 
				'<div class="mbox_bottom"></div>';
				
			this.win = new Element('div', {
				id: 'mboxWindow',
				'class': 'mbox_win',
				styles: {
					position: 'absolute',
					zIndex: this.options.zIndex + 2,
					visibility: 'hidden'
				}
			}).set("html", boxConstr);
			
			document.body.adopt(this.win);
		}
		
		this.bar = $("mboxBar");
		this.title = $("mboxTitle");
		this.closbtn = $("mboxBtnClose");
		this.cont = $("mboxContent");
		this.opt = $("mboxOperate");
		
		return this;
	},
	
	assign: function(to, options) {
		to.addEvent('click', function(e) {
			//例如阻止链接的默认行为
			if (e) { new Event(e).stop(); }
			var params = {
				url: this.attr("data-url"),
				ajax: true,
				type: "ajax"	
			};
			if (this.title) { params.title = this.title; }
			// 打开对于弹框
			Mbox.open($extend(params , options || {}), this);
		});
	},
	
	open: function(options, from) {
		options  = options || {},
		this.initialize(options);
		
		if ($isEle(from)) {
			this.element = $(from);
			this.options.url = this.options.url || this.element.attr(this.options.ajaxAttr);
		}
		this.getContent();
	},
	remind: function(message, options) {
		if (message) {
			//参数还原
			this.initParams();
			options = options || {};
			this.initialize(options);
			this.getContent('<div class="mbox_remind">'+message+'</div>');
			this.closbtn.invisible();
			this.bar.hide();
			this.opt.hide();
			if (this.time > 0) {
				this.close.delay(this.time, this);
			}
		}
		return this;
	},
	alert: function(message, surecall, options) {
		if (!message) {
			return this;	
		}
		//参数还原
		this.initParams();
		
		options = options || {};
		this.initialize(options);
		this.getContent('<div class="mbox_alert">'+message+'</div>');
		this.opt.show();
		this.bar.show();
		
		this.AlertBtnOk = new Element('input', {
			'id': 'mboxAlertOk',
			'class': 'mbox_btn_sure',
			'type': 'submit',
			'value': this.options.ensure
		});
		this.AlertBtnOk.addEvent('click', function() {
			if ($type(surecall) === 'function') {
				surecall.call(this);	
			}
			this.close();
		} .bind(this));
		
		this.opt.empty().adopt(this.AlertBtnOk);
		
		
		if (this.AlertBtnOk && this.AlertBtnOk.isDisplayed()) {
			this.AlertBtnOk.focus();
		}
		if (this.time > 0) {
			this.close.delay(this.time, this);
		}
	},
	confirm: function(message, surecall, cancelcall, options) {
		if (!message) {
			return this;	
		}
		//参数还原
		this.initParams();
		
		options = options || {};
		this.initialize(options);
		this.getContent('<div class="mbox_alert">'+message+'</div>');
		this.opt.show();
		this.bar.show();
		
		this.ConfirmBtnOk = new Element('input', {
			'id': 'mboxConfirmOk',
			'class': 'mbox_btn_sure',
			'type': 'submit',
			'value': this.options.ensure
		});
		this.ConfirmBtnCancel = new Element('input', {
			'id': 'mboxConfirmCancel',
			'class': 'mbox_btn_cancel',
			'type': 'button',
			'value': this.options.cancel
		});
		this.opt.empty().adopt(this.ConfirmBtnOk, this.ConfirmBtnCancel);
		this.ConfirmBtnOk.addEvent('click', function() {
			if ($type(surecall) === 'function') {
				surecall.call(this);	
			}
		}.bind(this));
		this.ConfirmBtnCancel.addEvent('click', function() {
			if ($type(cancelcall) === 'function') {
				cancelcall.call(this);
			}
			this.close();	
		} .bind(this));
		
		if (this.ConfirmBtnOk && this.ConfirmBtnOk.isDisplayed()) {
			this.ConfirmBtnOk.focus();
		}
	},
	loading: function(message) {
		this.initialize({});
		message = message || '<div class="mbox_loading"><img src="'+this.options.loadimg+'" class="mbox_loading_image" />加载中...</div>';
		this.getContent(message);
		this.closbtn.invisible();
		this.bar.hide();
		this.opt.hide();
		return this;
	},
	
	close: function() {
		if (this.isOpen) {
			this.isOpen = false;

			//透明背景层
			if (this.overlay && this.options.overlay) {
				this.overlay.dispose();
				this.overlay = null;
			}
			//IE6下拉框
			this.ie6 && $$("select").visible();
			
			//保护装载元素
			if (this.elementObj) {
				document.body.adopt(this.elementObj.hide());
			}
			//内容清空
			this.cont.empty();
			this.opt.empty();
			this.win.invisible();
			this.closbtn.invisible();
			
			if (this.element) {
				this.element = null;
			}
			
			//执行关闭回调
			if ($isFun(this.options.onClose)) {
				this.options.onClose.call(this);	
			}
			
			//参数还原
			this.initParams();
			//移除事件
			this.toggleListeners();
			
			this.options.onShow = $empty;
			this.options.onClose = $empty;

			//清除动画
			if (this.fx) {
				this.fx = null;	
			}	
		}
		return false;
	},
	initParams: function() {
		//参数还原
		this.options = {};
		this.setOptions(this.presets);
	},
	
	toggleListeners: function(state) {
		var fn = (state) ? 'addEvent' : 'removeEvent';
		this.closbtn[fn]('click', this.bound.close);
		document[fn]('keydown', this.bound.key);
		if (this.options.reposition) {
			window[fn]('resize', this.bound.window);
			if ($isIe6) {
				 window[fn]('scroll', this.bound.window);
			}
		}
	},
	
	getContent: function(content) {
		this.toggleListeners(true);
		if (content) {
			return this.applyContent(content);	
		}
		var type = this.options.type, url = this.options.url, cacheOption = this.options;
		
		if (!url) {
			return false;	
		}
		if (this.options.ajax) {
			this.loading();
			//参数还原
			this.options = cacheOption;
			var x = this.options.width.toInt() || 600, y = this.options.height.toInt() || 400;
			
			//页面外元素
			switch (type) {
				case 'image': {
					var tempImage = new Image(), imgsrc = url;
					tempImage.onload = function() {
						//图片与浏览器窗口大小比对显示
						var box = document.getSize(), size;
						box.x -= this.options.marginImage.x;
						box.y -= this.options.marginImage.y;
						size = { x: tempImage.width, y: tempImage.height };
	
						for (var i = 2; i--; ) {
							if (size.x > box.x) {
								size.y *= box.x / size.x;
								size.x = box.x;
							} else if (size.y > box.y) {
								size.x *= box.y / size.y;
								size.y = box.y;
							}
						}
						size.x = size.x.toInt();
						size.y = size.y.toInt();
						this.applyContent('<img class="mbox_ajax_image" src="'+imgsrc+'" width="'+size.x+'" height="'+size.y+'" />');
					}.bind(this);
					tempImage.onerror = function() {
						this.alert("图片加载没有成功！");
					}.bind(this);
					tempImage.src = imgsrc;
					break;
				}
				case 'iframe': {
					var iframeOptions = {
						src: url,
						styles: {
							width: x,
							height: y,
							background: 'url('+this.options.loadimg+') no-repeat center',
							border: 0
						},
						'class': 'mbox_ajax_iframe',
						frameborder: 0
					};
					this.applyContent(new IFrame(iframeOptions));
					break;	
				}
				case 'ajax': {
					var self = this;
					new Request.HTML($merge({
						method: 'get'
					}, $extend({ evalScripts: false }, this.options.ajaxOptions))).addEvents({
						onFailure: this.onError.bind(this),
						onComplete: function(a, b, c, d) {
							self.applyContent(c, d);
						}
					}).send({ 'url': url });	
					break;
				}
				/*case 'swf': {
					var swfHtml = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="'+x+'" height="'+y+'" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"><param name="quality" value="high" /><param name="src" value="'+url+'" /><param name="wmode" value="transparent" /><embed type="application/x-shockwave-flash" wmode="transparent" width="'+x+'" height="'+y+'" src="'+url+'" quality="high"></embed></object>';
					this.options.height = "auto";
					this.applyContent(swfHtml);
					break;
				}*/
				default: {
					return this.applyContent(url);	
				}
			}
		} else {
			//页面上元素
			if ($isStr(url)) {
				url = url.replace(/^#/, "");
				if ($(url)) {
					url = $(url);	
				}
			}
			return this.applyContent(url);	
		}
	},
	
	applyContent: function(content, js) {
		var position = this.cont.css("position");	
		if ($isStr(content)) {
			this.cont.set("html", content).css("position", "absolute");	
		} else if ($type(content) === "element") {
			this.elementObj = content;
			this.cont.empty().adopt(content.show()).css("position", "absolute");;
		} else {
			return this;	
		}
		this.winsize = this.cont.getSize();
		this.cont.setStyle("position", position);

		this.title.set("html", this.options.title);
		this.closbtn.set("html", this.options.clostxt);
		
		this.showControl();
		this.reposition();	
		this.win.visible();
		this.isOpen = true;
		if (this.ie6) {
			$$("select").invisible();	
			// 弹框内展开
			this.win.getElements("select").visible();
		}
		if (js) { eval(js); }
		//执行显示回调
		if ($isFun(this.options.onShow)) {
			this.options.onShow.call(this);	
		}
		
		return this;
	},
	
	showControl: function() {
		//是否显示关闭按钮
		if (this.options.closable) {
			this.closbtn.visible();
		} else {
			this.closbtn.invisible();
		}
		//半透明背景层
		if (this.overlay && this.options.overlay) {
			this.overlay.show();
		}
		//是否显示标题栏，默认显示
		if (this.options.titleable) {
			this.bar.show();
		} else {
			this.bar.hide();
		}
		//是否显示按钮，默认不显示
		if (this.options.optable) {
			this.opt.show();
		} else {
			this.opt.hide();
		}
		
		//是否可拖拽
		if (this.options.dragable) {
			$startDrag(this.title, this.win);	
		}
	},
	//定位
	reposition: function(fx) {
		var winx = this.winsize? this.winsize.x : this.win.w(), winy = this.win.h(), 
			windowx = window.getSize().x, windowy = window.getSize().y, 
			docsc = document.getScroll().y, 
			c = winy < windowy, 
			posl, post, 
			width = this.options.width.toInt(), height = this.options.height.toInt();
			
		winy = height || winy, winx = width || winx;
		//高度定值，避免IE下动画报错
		this.win.setStyle("height", winy);
		
		posl = (windowx - winx) / 2;
		post = (windowy - winy) / 2 + docsc;
		
		if (this.ie6 || !this.options.reposition) {
			//高度不正常
			this.win.setStyle("position", "absolute");
			post = c? ((windowy - winy) / 2 + docsc) : (50 + docsc);
		} else {
			post = c? ((windowy - winy) / 2) : 50;	
			this.win.setStyle("position", "fixed");
		}
		
		var to = {
			width: winx,
			height: winy,
			left: posl,
			top: post		
		};	
		
		if (this.options.useFx || fx === true) {
			this.fx = {
				win: new Fx.Morph(this.win, $merge({
					duration: 750,
					transition: Fx.Transitions.Quint.easeOut,
					link: 'cancel',
					unit: 'px',
					onComplete: function() {
						if (!height) {
							this.win.setStyle("height", "auto");		
						}
					}.bind(this)
				}, this.options.resizeFx))
			};
		}
		
		//IE6下动画效果不佳，拜拜的说
		if (this.fx && !this.ie6) {
			this.fx.win.cancel().start(to);
		} else {
			this.win.setStyles(to);
			if (!height) {
				this.win.setStyle("height", "auto");		
			}
		}
		
	},
	
	onError: function() {
		this.alert('加载出了点小问题。');
	},
	onKey: function(e) {
		switch (e.key) {
			case 'esc': if (this.closbtn.css("visibility") === "visible") { this.close(e); }
			case 'up': case 'down': return false;
		}
	},
	extend: function(properties) {
		return $extend(this, properties);
	}
};
Mbox.extend(new Options);


/**
* Class Calendar
*
* 
*
**/

var Calendar = new Class({
	Implements: [Options, Events],
	options: {
		initDate: new Date(),
		specialDate: [],
		monthText: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		weekText: ['日', '一', '二', '三', '四', '五', '六'],
		range: [new Date(1949, 0, 1), new Date(2015, 0, 1)],
		column: false,
		display: true,
		onSelect: $empty
	},
	initialize: function(cal, options) {
		this.setOptions(options);
		this.initDate = this.options.initDate;
		this.container = $(cal).store("date", this.initDate.getTime());
		if (!this.options.column) {
			this.init(this.container, this.initDate);
		} else {
			this.thisMonth = new Element("div").addClass("mcalendar_this");
			this.nextMonth = new Element("div").addClass("mcalendar_next");
			this.container.adopt(this.thisMonth, this.nextMonth);
			this.initDouble(this.initDate);
		}
		this.display = this.options.display;
		(this.display) ? this.show() : this.hide();
	},
	init: function(cal, date) {
		var arrSpecialDate = this.options.specialDate;
		cal.set('html', '');
		var month = this.MonthInfo(date.getFullYear(), date.getMonth());
		cal.addClass("mcalendar");

		var yearStr = [];
		yearStr.push("<li class='mcalendar_logo'></li>");
		if (this.options.column) {
			yearStr.push("<li class='mcalendar_year'><span>" + date.getFullYear() + "年</span></li>");
			yearStr.push("<li class='mcalendar_month'><span>" + this.options.monthText[date.getMonth()] + "</span></li>");
		} else {
			yearStr.push("<li class='mcalendar_year'><a href='javascript:' cal='year' year='" + date.getFullYear() + "'>" + date.getFullYear() + "年</a></li>");
			yearStr.push("<li class='mcalendar_month'><a href='javascript:' cal='month' month='" + date.getMonth() + "'>" + this.options.monthText[date.getMonth()] + "</a></li>");
		}
		var year = new Element('ul').set('html', yearStr.join('')).addClass("mcalendar_top");


		var todayStr = [];
		if (!this.options.column) {
			todayStr.push("<li class='mcalendar_preyear'><a href='javascript:' cal='preyear' title='上一年'> << </a></li>");
		}
		todayStr.push("<li class='mcalendar_preweek'><a href='javascript:' cal='preweek' title='上一月'> < </a></li>");
		if (!this.options.column) {
			todayStr.push("<li class='mcalendar_today'><a href='javascript:' cal='today'>今天</a></li>");
		}
		todayStr.push("<li class='mcalendar_nextweek'><a href='javascript:' cal='nextweek' title='下一月'> > </a></li>");
		if (!this.options.column) {
			todayStr.push("<li class='mcalendar_nextyear'><a href='javascript:' cal='nextyear' title='下一年'> >> </a></li>");
		}
		var today = new Element('ul').set('html', todayStr.join('')).addClass("mcalendar_switch");


		var weekStr = []
		for (i = 0; i < 7; i++) {
			weekStr.push("<li class='mcalendar_week"+ (i==0 || i==6? " mcalendar_weekend": "") +"'>" + this.options.weekText[i] + "</li>");
		}
		var week = new Element('ul').set('html', weekStr.join('')).addClass("mcalendar_weekx");
		cal.adopt(year, today, week);
		
		//添加特殊日期
		if ($type(this.options.specialDate) === "function") {
			arrSpecialDate = this.options.specialDate.bind(date)();
		}
		
		for (i = 0; i < 6; i++) {
			var days = new Element('ul').addClass("mcalendar_dayx");

			for (var j = 0; j < 7; j++) {
				var d = 7 * i - month.firstDay + j + 1;
				//var css = (d == date.getDate()) ? "mcalendar_selected" : "";
				if (d > 0 && d <= month.days) {
					var y = date.getFullYear(), m = date.getMonth();
					var curd = new Date(y, m, d);
					if (curd >= this.options.range[0] && curd <= this.options.range[1]) {
						var cl = "", css = "";
						if ($type(arrSpecialDate) === "array") {
							arrSpecialDate.each(function(str) {
								var arrMatch = str.match(/\d+/g);
								if (!cl && arrMatch && arrMatch.length === 3 && arrMatch[0].toInt() === y && (arrMatch[1].toInt() === m + 1) && arrMatch[2].toInt() === d) {
									cl = " mcalendar_special";
								}
							});
						}
						if (d == new Date(this.container.retrieve("date")).getDate() && m == new Date(this.container.retrieve("date")).getMonth()) {							
							css = "mcalendar_selected";
						}
						days.grab(new Element('li').set('html', "<a href='javascript:' class='" + css + cl + "' year='" + y + "' month='" + m + "' date='" + d + "'>" + d + "</a>"));
					} else {
						days.grab(new Element('li').addClass('mcalendar_outrange').set('html', d));
					}
				} else {
					days.grab(new Element('li').addClass('mcalendar_invalid').set('html', '&nbsp;'));
				}
			}

			cal.adopt(days);
		};

		cal.getElements("a").addEvent('focus', function() { this.blur() });

		cal.getElements("a").addEvent('click', function(e) {
			var self = new Event(e).target;
			if ($(self).getProperty("cal") == "today") {
				this.init(cal, new Date());
				this.fireEvent('select', [new Date()]);

			} else if ($(self).getProperty("cal") == "preyear") {
				date.setFullYear(date.getFullYear() - 1);
				this.init(cal, date);
			} else if ($(self).getProperty("cal") == "nextyear") {
				date.setFullYear(date.getFullYear() + 1);
				this.init(cal, date);
			} else if ($(self).getProperty("cal") == "preweek") {
				if (this.options.column) {
					date.setMonth(date.getMonth() - 2);
					this.initDouble(date);
				} else {
					date.setMonth(date.getMonth() - 1);
					this.init(cal, date);
				}
			} else if ($(self).getProperty("cal") == "nextweek") {
				if (this.options.column) {
					this.initDouble(date);
				} else {
					date.setMonth(date.getMonth() + 1);
					this.init(cal, date);
				}
			} else if ($(self).getProperty("cal") == "year") {
				var year = new Element('select').setStyle('width',  '52px').setStyle('height',  '20px');
				var selected = $(self).getProperty('year');
				for (var i = this.options.range[0].getFullYear(); i <= this.options.range[1].getFullYear(); i++) {

					year.grab(new Element('option').setProperty('value', i).set('html', i));
				}
				year.addEvent('change', function(e) {
					var self = new Event(e).target;
					date.setFullYear(self.value);
					this.init(cal, date);
				} .bind(this));
				year.setProperty('value', selected);
				year.replaces($(self));

			} else if ($(self).getProperty("cal") == "month") {
				var mon = new Element('select').setStyle('width', '46px').setStyle('height',  '20px');
				var selected = $(self).getProperty('month');
				for (i = 0; i < 12; i++) {
					mon.grab(new Element('option').setProperty('value', i).set('html', this.options.monthText[i]));
				}
				mon.addEvent('change', function(e) {
					var self = new Event(e).target;
					date.setMonth(self.value);
					this.init(cal, date);
				} .bind(this));

				mon.setProperty('value', selected);
				mon.replaces($(self));

			} else {
				var eleSelected = this.container.getElements(".mcalendar_selected"),
					fireDate = new Date($(self).getProperty("year"), $(self).getProperty("month"), $(self).getProperty("date"));
					
				if (eleSelected) {
					eleSelected.removeClass("mcalendar_selected");
				}
				self.className = "mcalendar_selected";
				this.container.store("date", fireDate.getTime());
				
				this.fireEvent('select', [fireDate]);

			}
			return false;
		} .bind(this));
	},
	initDouble: function(date) {
		//双栏, by zhangxinxu 2012-02-02
		this.init(this.thisMonth, date);
		date.setDate(1);
		date.setMonth(date.getMonth() + 1);
		this.init(this.nextMonth, date);
	},
	MonthInfo: function(y, m) {
		var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var d = (new Date(y, m, 1));
		d.setDate(1);
		if (d.getDate() == 2) d.setDate(0);
		y += 1900;
		return {
			days: m == 1 ? (((y % 4 == 0) && (y % 100 != 0)) || (y % 400 == 0) ? 29 : 28) : monthDays[m],
			firstDay: d.getDay()
		};
	},
	show: function() {
		this.display = true;
		this.container.setStyle('display', '');
	},
	hide: function() {
		this.display = false;
		this.container.setStyle('display', 'none');
	},
	dispose: function() {
		this.container.empty();
	}
});

/**
* Class datepicker
*
* 
*
**/

var Datepicker = new Class({
	Implements: [Options],
	options: {
		initDate: "",
		specialDate: [],
		column: false,
		monthText: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
		weekText: ["日", "一", "二", "三", "四", "五", "六"],
		range: [new Date(1970, 0, 1), new Date(2045, 0, 1)],
		splitChar: "-", //
		onSelect: $empty
	},
	initialize: function(ele, dateinput, options) {
		this.setOptions(options);
		this.calendar = null;
		this.container = null;
		this.ele = $(ele);
		this.ele.addEvent('click', function(e) {			
			if (this.calendar) { this.calendar.display ? this.calendar.hide() : this.calendar.show(); return; }
			var self = this.ele;
			if (!this.container) this.container = new Element('div').setProperty('id', $time() + '_date');

			var offset = $(self).getCoordinates();
			
			this.container.setStyles({
				position: "absolute",
				left: offset.left,
				top: offset.bottom
			});
			$(document.body).grab(this.container);

			var initdate = this.options.initDate || new Date();
			var dateMatch = dateinput.val().match(/\d+/g), dateNow = new Date();
			if (dateMatch && dateMatch.length === 3) {
				initdate = new Date(Date.parse([dateMatch[1], dateMatch[2], dateMatch[0]].join("/")));
				dateinput.store("date", initdate);
			}

			this.calendar = new Calendar(this.container, {
				initDate: initdate,
				specialDate: this.options.specialDate,
				range: this.options.range,
				monthText: this.options.monthText,
				weekText: this.options.weekText,
				column: this.options.column,
				onSelect: function(date) {
					var year = date.getFullYear(), month = (date.getMonth() + 1), day = date.getDate();
					if (month < 10) { month = "0" + month; }
					if (day < 10) { day = "0" + day; }
					if (this.options.splitChar) {
						dateinput.value = year + this.options.splitChar + month + this.options.splitChar + day;
					} else {
						dateinput.value = year + "年" + month + "月" + day + "日" + (this.options.splitChar === false? " 星期" + this.options.weekText[date.getDay()]: "");
					}	
					this.calendar.hide();
					this.options.onSelect.call(dateinput, date);
				}.bind(this)
			});			
		}.bind(this));

		document.addEvent('mousedown', this.insideSelector.bind(this));

	},
	insideSelector: function(e) {
		if (e && $(e.target).getParents && $(e.target).getParents('.mcalendar').length === 0 && e.target !== this.ele && this.calendar) {
			this.calendar.hide();
		}
	},

	dispose: function() {
		if (this.calendar) this.calendar.dispose();
	}
});


/**
* Class Autocompleter
*
* required （Observer）
*
**/
var Autocompleter = new Class({

	Implements: [Options, Events],

	options: {
		enable: true,
		minLength: 1,
		width: 'inherit',
		height: 'auto',
		adjust: { x: 0, y: 0 },
		maxChoices: 10,
		className: 'autocompleter',
		selectClass: 'ac_select',
		closeClass: 'ac_close',
		moreClass: "ac_more",
		zIndex: 999,
		delay: 200,
		observerOptions: {},
		fxOptions: {},
		extraParams: {},
		autoSubmit: true,
		autoTrim: true,
		autoClose: true,
		filter: null,
		parser: null,
		selectMode: true,
		wordSync: true,
		multiple: false,
		separatorSplit: ',',
		filterSubset: false,
		filterCase: false,
		listCloseBtn: true,
		onSelection: $empty,
		onShow: $empty,
		onHide: $empty,
		onBlur: $empty,
		onFocus: $empty
	},

	initialize: function(element, url, options) {
		this.element = $(element);
		this.setOptions(options);
		this.build();
		this.observer = new Observer(this.element, this.fetch.bind(this), $merge({
			'delay': this.options.delay
		}, this.options.observerOptions));
		this.queryValue = null;
		if (this.options.filter) this.filter = this.options.filter.bind(this);
		this.selectMode = this.options.selectMode;
		this.enable = this.options.enable;
		this.extraParams = this.options.extraParams;
		($type(url) === 'array') ? this.remote = false : this.remote = true;
		this.cached = false;
		this.cacheStatus = 'loading';
		this.url = url;

	},

	build: function() {

		this.choices = new Element('ul', {
			'class': this.options.className,
			'styles': {
				'zIndex': this.options.zIndex,
				'position': 'absolute',
				top: "-99em"
			}
		}).inject(document.body);

		this.fx = (!this.options.fxOptions) ? null : new Fx.Tween(this.choices, $merge({
			'property': 'opacity',
			'link': 'cancel',
			'duration': 200
		}, this.options.fxOptions)).addEvent('onStart', Chain.prototype.clearChain).set(0);

		this.element.setProperty('autocomplete', 'off')
			.addEvent('keyup', this.onCommand.bind(this))
			.addEvent('focus', this.toggleFocus.create({ bind: this, arguments: true, event: true }))
			.addEvent('blur', this.toggleFocus.create({ bind: this, arguments: false, event: true }));

		this.choices.onmousedown = function() {
			return false;
		};
	},

	destroy: function() {
		if (this.fix) this.fix.dispose();
		this.choices = this.selected = this.choices.destroy();
	},

	toggleFocus: function(e, state) {
		e.stop();
		this.focussed = state;
		if (!this.focussed) {
			if (this.options.autoClose) this.hideChoices(true);
		} else {
			this.prefetch();
		}
		this.fireEvent((state) ? 'onFocus' : 'onBlur', [this.element]);
	},

	onCommand: function(e) {
		if (e && e.key && !e.shift) {
			switch (e.key) {
				case 'enter':
					e.stop();
					if (this.element.value != this.opted) return true;
					if (this.selected && this.visible) {
						this.choiceSelect(this.selected);
						return !!(this.options.autoSubmit);
					}
					break;
				case 'up': case 'down':
					if (this.visible && this.queryValue !== null) {
						var up = (e.key == 'up');
						//set close button
						if (this.selected && this.selected.getNext() && this.selected.getNext().hasClass(this.options.closeClass)) {
								up ? this.choiceOver(this.selected.getPrevious(), true) : this.choiceOver(this.choices.getFirst(), true);
						} else {//end
							this.choiceOver((this.selected || this.choices)[
							        (this.selected) ? ((up) ? 'getPrevious' : 'getNext') : ((up) ? 'getLast' : 'getFirst')
						        ](), true);
						}

					}
					return false;
				case 'esc': case 'tab':
					this.hideChoices(true);
					break;
			}
		}
		return true;
	},

	prefetch: function() {
		if (this.cacheStatus == 'loaded') return true;
		if (!this.remote) {

			this.cached = this.url;
			this.cacheStatus = 'loaded';
		} else {
			this.ajaxReq= new AjaxReq({url:this.url,callType:'json',onSuccess:function(a,b){
				this.cached= a;
			    this.update(this.cached.msg.shop);
			}.bind(this)});

			this.cached = [];
			this.cacheStatus = 'loaded';
		}
	},

	fetch: function() {
		if (!this.enable) return false;
		if (this.cacheStatus != 'loaded') return false;
		var value = this.element.value, query = value, index = 0;
		if (this.options.multiple) {
			var split = this.options.separatorSplit;
			var values = value.split(split);
			index = this.element.getCaretPosition();
			var toIndex = value.substr(0, index).split(split);
			var last = toIndex.length - 1;
			index -= toIndex[last].length;
			query = values[last];
		}

		if (query.length < this.options.minLength) {
			this.hideChoices();
		} else {
			this.queryIndex = index;
			if ((JSON.encode(this.extraParams) === this.queryExtraParams && query === this.queryValue) || (this.visible && query == this.selectedValue)) {
				if (this.visible) return false;
				this.showChoices();
			} else {
				this.queryExtraParams = JSON.encode(this.extraParams);
				this.queryValue = query;
				if (this.remote) {
					//this.makeUrl();
					new AjaxReq({
						url: this.makeUrl(),
						callType: 'json',
						onSuccess: function(a, b) {
							this.cached = a;
							var parserData = this.options.parser(this.cached);
							if ($type(parserData) == "array") {
								this.update(parserData);
							} else if ($type(parserData.data) == "array" && parserData.more) {
								this.update(parserData.data, parserData.more);
							}
						} .bind(this)
					}).send();
				} else {
					this.update(this.filter(this.cached));
				}

			}
		}
		return true;
	},

	makeUrl: function() {
		var url = this.url + "?fgsearchq=" + this.queryValue.cnEncode();
		for (var i in this.extraParams) {
			url =  url + "&" + i + "=" + this.extraParams[i].cnEncode();
		}
		return url;
	},

	filter: function(tokens) {
		var regex = new RegExp(((this.options.filterSubset) ? '' : '^') + this.queryValue.escapeRegExp(), (this.options.filterCase) ? '' : 'i');
		var result = [];
		(tokens || this.tokens).each(function(item) {
			if (regex.test(item)) result.push(item);
		}, this);
		return result;
	},


	setSelection: function(finish) {
		var input = this.selectedValue, value = input;
		if (!input) return false;
		var start = this.queryValue.length, end = input.length;

		if (input.substr(0, start).toLowerCase() != this.queryValue.toLowerCase()) start = 0;
		if (this.options.multiple) {
			var split = this.options.separatorSplit;
			value = this.element.value;
			start += this.queryIndex;
			end += this.queryIndex;
			var old = value.substr(this.queryIndex).split(split, 1)[0];

			value = value.substr(0, this.queryIndex) + input + value.substr(this.queryIndex + old.length);
			if (finish) {
				var space = /[^\s,]+/;

				var tokens = [];
				value.split(this.options.separatorSplit).each(function(item) {
					if (space.test(item)) tokens.push(item);
				}, this);

				var sep = this.options.separatorSplit;
				value = tokens.join(sep) + sep;
				end = value.length;
			}
		}

		if (this.options.wordSync) this.observer.setValue(value);
		this.opted = value;

		if (finish) start = end;
		this.element.selectRange(start, end);
		//fix autoSubmit
		var selIndex = 0;
		if(this.selected.getElement('span')){
			selIndex = this.selected.getElement('span').get('html');
		}
		var selText = value;
		if (this.options.autoSubmit && finish) this.fireEvent('onSelection', [this.element, this.selected, selIndex, selText]);
	},

	showChoices: function() {
		var first = this.choices.getFirst(), last = this.choices.getLast(), styles;
		if (!first || this.visible) return;
		var pos = this.element.getCoordinates(), width = this.options.width || 'auto';


		if ($type(this.options.height) === 'number') {
			(last.getCoordinates(this.choices).bottom > this.options.height) ? styles = { 'overflow-y': 'scroll', 'height': this.options.height} : styles = { 'overflow-y': 'hidden', 'height': this.options.height };
		} else {
			styles = { 'overflow-y': 'hidden', 'height': this.options.height };
		}
		styles = $merge(styles, {
			'left': pos.left + this.options.adjust.x,
			'top': pos.bottom + this.options.adjust.y,
			'width': (width === true || width == 'inherit') ? (pos.width - 2) : width,
			'visibility': 'visible'
		});

		if (!this.visible) {
			this.visible = true;
			this.choices.setStyles(styles);
			if (this.fx) { this.fx.start(1); }
			if (this.fix) { this.fix.show(); }
			this.fireEvent('onShow', [this.element, this.choices]);
		}

	},

	hideChoices: function(clear) {
		if (!this.visible) return;
		if (clear) {
			var value = this.element.value;
			if (this.options.autoTrim) {
				value = value.split(this.options.separatorSplit).filter($arguments(0)).join(this.options.separatorSplit);
			}
			this.observer.setValue(value);
		}
		this.visible = false;
		this.observer.clear();
		var hide = function() {
			this.choices.setStyle('visibility', 'hidden');
			if (this.fix) this.fix.hide();
		} .bind(this);
		this.fx ? this.fx.start(0).chain(hide) : hide();
		this.fireEvent('onHide', [this.element, this.choices]);
	},

	update: function(tokens, more) {
		this.choices.empty();
		if (this.selected) this.selected = this.selectedValue = null;

		if (!tokens || !tokens.length) {
			this.hideChoices();
		} else {
			if (this.options.maxChoices < tokens.length){
				tokens.length = this.options.maxChoices;
			}
			tokens.each(function(token) {
				var item = token.split('|');
				var choice = new Element('li', { 'html': this.markQueryValue(item) });
				choice.inputValue = item[0].stripHTML();
				this.addChoiceEvents(choice);
				choice.inject(this.choices);
			}, this);
			
			//more
			if (more && more.text && more.link) {
				var moreBtn = new Element('a').addClass("ac_more_a").setProperty('href', more.link).set('html', more.text);
				var moreLi = new Element('li').addClass(this.options.moreClass);
				moreLi.grab(moreBtn);
				moreLi.inject(this.choices);
			}
			
			//set close button
			if (this.options.listCloseBtn) {
				var closeBtn = new Element('a').addClass("ac_close_a").setStyle('margin-left', '8px').setProperty('href', 'javascript:;').set('html', '关闭').addEvent('click', function() { this.hideChoices(true); return false; }.bind(this));
				var closeLi = new Element('li').addClass(this.options.closeClass);
				closeLi.grab(closeBtn);
				closeLi.inject(this.choices);
			}
			//end
			this.showChoices();
		}
	},
	markQueryValue: function(item) {
		//return (item.length == 1) ? item[0] : '<span style="float:right;display:none;">' + item[1] + '</span>' + item[0];
	
		if (item.length === 1) {
			return item[0];
		} else if (item.length === 2) {
			return '<span class="r dn">' + item[1] + '</span>' + item[0];
		} else {
			return '<span class="r dn">' + item[1] + '</span><span class="ac_add r">' + item[2] + '</span>' + item[0];
		}
	},

	addChoiceEvents: function(el) {
		return el.addEvents({
			'mouseover': this.choiceOver.bind(this, el),
			'click': this.choiceSelect.bind(this, el)
		});
	},
	choiceOver: function(choice, selection) {
		if (!choice || choice == this.selected) return;
		if (this.selected) {
			this.selected.removeClass(this.options.selectClass);
		}
		this.selected = choice.addClass(this.options.selectClass);

		this.fireEvent('onSelect', [this.element, this.selected, selection]);
		if (!selection) return;
		if (this.selectMode) {
			this.selectedValue = this.selected.inputValue;
			this.setSelection();
		}

	},

	choiceSelect: function(choice) {
		if (choice) this.choiceOver(choice);
		this.selectedValue = this.selected.inputValue;
		this.setSelection(true);
		this.queryValue = null;
		this.hideChoices();
	}

});

//延迟处理，如果时间范围内同样方法不执行
var Observer = new Class({

	Implements: [Options, Events],

	options: {
		periodical: false,
		delay: 1000
	},

	initialize: function(el, onFired, options){
		this.setOptions(options);
		this.addEvent('onFired', onFired);
		this.element = $(el) || $$(el);
		this.boundChange = this.changed.bind(this);
		this.resume();
	},

	changed: function() {
		var value = this.element.get('value');	
		if ((this.value == value || JSON.encode(this.value) == JSON.encode(value))) return;
		this.clear();
		this.value = value;
		this.timeout = this.onFired.delay(this.options.delay, this);
	},

	setValue: function(value) {
		this.value = value;
		this.element.set('value', value);
		return this.clear();
	},

	onFired: function() {
		this.fireEvent('onFired', [this.value, this.element]);
	},

	clear: function() {
		$clear(this.timeout || null);
		return this;
	},
	pause: function(){
		$clear(this.timeout);
		$clear(this.timer);
		this.element.removeEvent('keyup', this.boundChange);
		return this;
	},
	resume: function(){
		this.value = this.element.get('value');
		if (this.options.periodical) this.timer = this.changed.periodical(this.options.periodical, this);
		else this.element.addEvent('keyup', this.boundChange);
		return this;
	}
});


/*-------------------------------------------常用方法------------------------------------------*/

//样式切换
var $classToggle = function(elements, options) {
	var def = {
		addClass: "",
		removeClass: "",
		eventType: "hover",
		inCall: $empty,
		outCall: $empty
	};
	var s = $extend(def, options || {});
	if ($isStr(s.removeClass) && $isStr(s.addClass)) {
		if ($isEle(elements)) {
			elements = [elements];	
		}
		if ($isArr(elements)) {
			elements.each(function(items) {
				if ($isEle(items)) {
					if (s.eventType === "hover") {
						items.addEvents({
							mouseenter: function() {
								this.swapClass(s.removeClass, s.addClass);
								if ($isFun(s.inCall)) {
									s.inCall.call(this);	
								}
							},
							mouseleave: function() {
								this.swapClass(s.addClass, s.removeClass);
								if ($isFun(s.outCall)) {
									s.outCall.call(this);	
								}
							}
						});
					} else if (s.eventType === "click") {
						items.addEvents({
							mousedown: function() {
								this.swapClass(s.removeClass, s.addClass);
								if ($isFun(s.inCall)) {
									s.inCall.call(this);	
								}
							},
							mouseup: function() {
								this.swapClass(s.addClass, s.removeClass);
								if ($isFun(s.outCall)) {
									s.outCall.call(this);	
								}
							}
						});
					} else if (s.eventType === "focus") {
						items.addEvents({
							focus: function() {
								this.swapClass(s.removeClass, s.addClass);
								if ($isFun(s.inCall)) {
									s.inCall.call(this);	
								}
							},
							blur: function() {
								this.swapClass(s.addClass, s.removeClass);
								if ($isFun(s.outCall)) {
									s.outCall.call(this);	
								}
							}
						});	
					}
				}
			});	
		}
	}
};

//类似更多隐藏显示切换
var $visibleToggle = function(elements, options) {
	var defaults = {
		attribute: "data-rel",
		eventType: "click",
		property: "position",
		display: false,
		showCall: $empty,
		hideCall: $empty	
	};
	var s = $extend(defaults, options ||{}), target;
	if ($isEle(elements)) {
		elements = [elements];	
	}
	if ($isArr(elements)) {
		elements.each(function(items) {
			items.store("display", s.display).addEvent(s.eventType, function() {
				var target = $(this.attr(s.attribute)) || $$("." + this.attr(s.attribute));
				if (this.retrieve("display")) {
					//显示，则隐藏
					if (s.property === "position") {
						target.out();
					} else if (s.property === "display") {
						target.hide();
					} else if (s.property === "visibility") {
						target.invisible();
					}
					items.store("display", false);
					if ($isFun(s.hideCall)) {
						s.hideCall.call(this, target);	
					}
				} else {
					if (s.property === "position") {
						target.into();
					} else if (s.property === "display") {
						target.show();
					} else if (s.property === "visibility") {
						target.visible();
					}
					items.store("display", true);
					if ($isFun(s.showCall)) {
						s.showCall.call(this, target);
					}
				}
				if (this.get("tag") === "a") {
					return false;
				}
			});	
		});
	}
};

//选项卡切换，无动画效果
var $tabSwitch = function(elements, options) {
	var defaults = {
		eventType: "click", //点击事件，还是鼠标经过事件，其他可选参数："hover"
		classAdd: "", //添加的类名
		classRemove: "", //移除的类名
		property: "position", //其他可选"display"
		targetAttr: "data-rel", //切换的对象
		timeDelay: 100, //此参数仅当eventType为hover时有效，如果值为自然数，则鼠标经过延迟
		timePlay: 0, //此参数仅当eventType为hover时有效，如果值为自然数，则选项卡内容自动播放
		switchCall: $empty
	};
	var pms = $extend(defaults, options || {}),
		length, timerDelay, timerPlay, timerPlayTrigger,
		numDelayTime = pms.timeDelay.toInt(),
		numPlayTime = pms.timePlay.toInt();
		
	pms.elementCache = null;
	pms.indexCache = -1;
	
	var funSwitch = function(ele, pmsIndex) {
		//params为当前选项卡元素或是索引值
		var cache = pms.elementCache, eleOld, eleNew;
		if (pms.eventType === "hover") {
			if ($isNum(pmsIndex)) {
				pms.indexCache = pmsIndex;
			} else {
				//定时器
				if (numPlayTime > 0) {
					pms.indexCache = (pms.indexCache === length - 1) ? 0: pms.indexCache + 1;
					timerPlay = funSwitch.delay(numPlayTime);
				}
			}
		}
		
		ele = ele || elements[pms.indexCache];
		
		if ($isEle(ele)) {
			//当前元素样式变换，目标对象显示
			ele.swapClass(pms.classRemove, pms.classAdd);
			if (eleNew = $(ele.attr(pms.targetAttr))) {
				if (pms.property === "position") {
					eleNew.into();	
				} else if (pms.property === "display") {
					eleNew.show();
				}
			}
			pms.elementCache = ele;
		} else {
			return;	
		}
		
		if ($isEle(cache) && cache !== ele) {
			cache.swapClass(pms.classAdd, pms.classRemove);
			//目标对象隐藏
			if (eleOld = $(cache.attr(pms.targetAttr))) {
				if (pms.property === "position") {
					eleOld.out();
				} else if (pms.property === "display") {
					eleOld.hide();
				}	
			}
		}

		//回调
		if ($isFun(pms.switchCall)) {
			pms.switchCall.call(ele, eleNew, cache, eleOld);	
		}
	};
	
	if ($isArr(elements) && (length = elements.length)) {
		if (!pms.classAdd) {
			pms.elementCache = elements[0];
			pms.indexCache = 0;	
		}
		elements.each(function(term, index) {
			if (pms.classAdd && term.hasClass(pms.classAdd)) {
				pms.elementCache = term;
				pms.indexCache = index;	
			}
			
			switch (pms.eventType) {
				case "click": {
					term.addEvent("click", function() {
						if (!this.hasClass(pms.classAdd)) {
							funSwitch(this);
						}
						if (this.get("tag") === "a") {
							return false;
						}
					});
					break;	
				}
				case "hover": {
					term.addEvents({
						mouseenter: function() {
							//如果是自动播放，清除自动播放定时器
							if (numPlayTime > 0) {
								$clear(timerPlayTrigger);
								$clear(timerPlay);
							}
							if (!this.hasClass(pms.classAdd)) {
								//是否延时
								if (numDelayTime > 0) {
									timerDelay = funSwitch.pass([this, index]).delay(numDelayTime);
								} else {
									pms.indexCache = index;
									funSwitch(this);	
								}
							}
						},
						mouseleave: function() {
							//如果定时播放，启动定时器
							$clear(timerDelay);
							if (numPlayTime > 0) {
								timerPlayTrigger = funSwitch.delay(numPlayTime);
							}
						}
					});	
				}
			}
		});	
		if ($chk(numPlayTime) && pms.eventType === "hover") {
			timerPlayTrigger = funSwitch.delay(numPlayTime);
		}
	}
};

//万能浮动层
var $powerFloat = function(eleTrigger, options) {
	if ($isEle(eleTrigger)) {
		eleTrigger = [eleTrigger];	
	}
	if (!$isArr(eleTrigger)) { return false; }
	var defaults  = {
		width: "auto", //可选参数：inherit，数值(px)
		offsets: {
			x: 0,
			y: 0	
		},
		zIndex: 19,
		
		eventType: "hover", //事件类型，其他可选参数有：click, focus
		
		showDelay: 0, //鼠标hover显示延迟
		hideDelay: 0, //鼠标移出隐藏延时
		
		hoverHold: true,
		
		targetMode: "common", //浮动层的类型，其他可选参数有：ajax, list, remind
		target: null, //target对象获取来源，优先获取，如果为null，则从targetAttr中获取。
		targetAttr: "data-rel", //target对象获取来源，当targetMode为list时无效
		
		container: null, //转载target的容器，可以使用"plugin"关键字，则表示使用插件自带容器类型
		reverseSharp: false, //是否反向小三角的显示，默认ajax, remind是显示三角的，其他如list和自定义形式是不显示的
		
		position: "4-1", //trigger-target
		edgeAdjust: true, //边缘位置自动调整
		
		showCall: $empty,
		hideCall: $empty

	};
	
	var o = {
		targetGet: function() {
			//一切显示的触发来源
			if (!this.trigger) { return this; }
			var attr = this.trigger.attr(this.s.targetAttr), target = this.trigger.retrieve("powerFloatTarget") || this.s.target;
			
			switch (this.s.targetMode) {
				case "common": {
					if (target) {
						if ($isEle(target)) {
							o.target = target;
						} else if ($isArr(target) && $isEle(target[0])) {
							o.target = target[0];
						} else if ($isStr(target) && $(target)) {
							o.target = $(target);
						}
					} else {
						if (attr && $(attr)) {
							o.target = $(attr);
						}
					}
					if (o.target) {
						o.targetShow();
					}
					return this;
					break;
				}
				case "ajax": {
					//ajax元素，如图片，页面地址
					var url = target || attr;
					
					this.targetProtect = false;
					if (/(\.jpg|\.png|\.gif|\.bmp|\.jpeg)$/i.test(url)) {
						var tempImage = new Image();
						o.loading();
						tempImage.onload = function() {
							var w = tempImage.width, h = tempImage.height;
							var winw = $(window).getWidth(), winh = $(window).getHeight();
							var imgScale = w / h, winScale = winw / winh;
							if (imgScale > winScale) {
								//图片的宽高比大于显示屏幕
								if (w > winw / 2) {
									w = winw / 2;
									h = w / imgScale;	
								}
							} else {
								//图片高度较高
								if (h > winh / 2) {
									h = winh / 2;
									w = h * imgScale;
								}
							}
							var eleImage = new Element("img").attr({
								width: w,
								height: h,
								src: url,
								"class": "float_ajax_image"	
							});
							o.target = eleImage;
							o.targetShow();
						};
						tempImage.onerror = function() {
							o.target = new Element("div").addClass("float_ajax_error").html("图片加载失败！");
							o.targetShow();
						};
						tempImage.src = url;	
					} else {
						if (url) {
							o.loading();
							new Request.HTML({
								method: "get",
								url: url,
								onComplete: function(tree, ele, html, js) { //element, arr, string, string
									o.target = new Element("div").addClass("float_ajax_data").html(html);
									o.targetShow();
								},
								onFailure: function() {
									o.target = new Element("div").addClass("float_ajax_error").html("数据没有加载成功。");
									o.targetShow();
								}
							}).send();
						}
					}
					break;
				}
				case "list": {
					//下拉列表
					var eleList = new Element("ul").addClass("float_list_ul"), targetHtml = "", arrLength;
					if ($isArr(target) && (arrLength = target.length)) {
						target.each(function(obj, i) {
							var list = "", strClass = "", text, href;
							if (i === 0) {
								strClass = ' class="float_list_li_first"';
							}
							if (i === arrLength - 1) {
								strClass = ' class="float_list_li_last"';	
							}
							if ($isObj(obj) && (text = obj.text.toString())) {
								if (href = (obj.href || "javascript:")) {
									list = '<a href="' + href + '" class="float_list_a'+ (obj.selected? " float_list_a_on": "") +'">' + text + '</a>';	
								} else {
									list = text;	
								}
							} else if (obj && $isStr(obj)) {
								list = obj;
							}
							if (list) {
								targetHtml += '<li' + strClass + '>' + list + '</li>';	
							}
						});
					} else {
						targetHtml += '<li class="float_list_null">列表无数据。</li>';	
					}
					o.target = eleList.html(targetHtml);
					this.targetProtect = false;	
					o.targetShow();	
					break;	
				}
				case "remind": {
					//内容均是字符串
					var strRemind = target || attr;
					this.targetProtect = false;	
					if ($isStr(strRemind)) {
						o.target = new Element("span").html(strRemind);
						o.targetShow();	
					}
					break;
				}
				default: {
					var objOther = target || attr;
					if (objOther) {
						if ($isStr(objOther)) {
							if ($$(objOther).length) {
								//元素
								o.target = $$(objOther)[0];
								this.targetProtect = true;	
							} else {
								o.target = new Element("div").html(objOther);	
							}
						} else if ($isEle(objOther)) {
							o.target = objOther;
						} else if ($isArr(objOther) && $isEle(objOther[0])) {
							o.target = objOther[0];
						}
						o.targetShow();	
					}
				}
			}
			return this;
		},
		container: function() {
			//容器(如果有)重装target
			var cont = this.s.container, mode = this.s.targetMode || "mode";
			if (mode === "ajax" || mode === "remind") {
				//显示三角
				this.s.sharpAngle = true;	
			} else {
				this.s.sharpAngle = false;
			}
			//是否反向
			if (this.s.reverseSharp) {
				this.s.sharpAngle = !this.s.sharpAngle;	
			}
			
			if (mode !== "common") {
				//common模式无新容器装载
				if (cont === null) {
					cont = "plugin";	
				} 
				if ( cont === "plugin" ) {
					if (!$("floatBox_" + mode)) {
						new Element("div").attr("id", "floatBox_" + mode).addClass("float_" + mode + "_box").out().inject(document.body);
					}
					cont = $("floatBox_" + mode);	
				} 
				
				if (cont && !$isStr(cont)) {
					if (this.targetProtect) {
						o.target.show().into();
					}
					o.target = cont.empty().adopt(o.target);
				}
			}
			return this;
		},
		setWidth: function() {
			var w = this.s.width;
			if (w === "auto") {
				if (this.target.style.width) {
					this.target.css("width", "auto");	
				}
			} else if (w === "inherit") {
				this.target.w(this.trigger.w());
			} else {
				this.target.css("width", w);	
			}
			return this;
		},
		position: function() {
			var pos = this.trigger.getPosition(),
				tri_h = 0, tri_w = 0, cor_w = 0, cor_h = 0,
				tri_l, tri_t, tar_l, tar_t, cor_l, cor_t,
				tar_h = this.target.h(), tar_w = this.target.w(),
				st = window.getScroll().y,
				off_x = this.s.offsets.x.toInt() || 0, off_y = this.s.offsets.y.toInt() || 0,
			
			tri_h = this.trigger.h();
			tri_w = this.trigger.w();
			tri_l = pos.x;
			tri_t = pos.y;
			
			var arrLegalPos = ["4-1", "1-4", "5-7", "2-3", "2-1", "6-8", "3-4", "4-3", "8-6", "1-2", "7-5", "3-2"],
				align = this.s.position, strDirect;
				
			if (arrLegalPos.indexOf(align) === -1) {
				align = "4-1";
			}
			
			var funDirect = function(a) {
				var dir = "bottom";
				//确定方向
				switch (a) {
					case "1-4": case "5-7": case "2-3": {
						dir = "top";
						break;
					}
					case "2-1": case "6-8": case "3-4": {
						dir = "right";
						break;
					}
					case "1-2": case "8-6": case "4-3": {
						dir = "left";
						break;
					}
					case "4-1": case "7-5": case "3-2": {
						dir = "bottom";
						break;
					}
				}
				return dir;
			}, funCenterJudge = function(a) {
				return ["5-7", "6-8", "8-6", "7-5"].indexOf(a) !== -1;
			};
			
			var funJudge = function(dir) {
				var totalHeight = 0, totalWidth = 0, flagCorner = (o.s.sharpAngle && o.corner) ? true: false;
				if (dir === "right") {
					totalWidth = tri_l + tri_w + tar_w + off_x;
					if (flagCorner) {
						totalWidth += o.corner.w();
					}	
					if (totalWidth > $(window).getWidth()) {
						return false;	
					}
				} else if (dir === "bottom") {
					totalHeight = tri_t + tri_h + tar_h + off_y;
					if (flagCorner) {
						totalHeight += 	o.corner.h();
					}
					if (totalHeight > st + $(window).getHeight()) {
						return false;	
					}
				} else if (dir === "top") {
					totalHeight = tar_h + off_y;
					if (flagCorner) {
						totalHeight += o.corner.h();
					}
					if (totalHeight > tri_t - st) {
						return false;	
					} 
				} else if (dir === "left") {
					totalWidth = tar_w + off_x;
					if (flagCorner) {
						totalWidth += o.corner.w();
					}
					if (totalWidth > tri_l) {
						return false;	
					}
				}
				return true;
			};
			
			//此时的方向
			strDirect = funDirect(align);

			if (this.s.sharpAngle) {
				//创建尖角
				this.createSharp(strDirect);
			}
			
			//边缘过界判断
			if (this.s.edgeAdjust) {
				//根据位置是否溢出显示界面重新判定定位
				if (funJudge(strDirect)) {
					//该方向不溢出
					(function() {
						if (funCenterJudge(align)) { return; }
						
						var obj = {
							top: {
								right: "2-3",
								left: "1-4"	
							},
							right: {
								top: "2-1",
								bottom: "3-4"
							},
							bottom: {
								right: "3-2",
								left: "4-1"
							},
							left: {
								top: "1-2",
								bottom: "4-3"	
							}
						};
						var o = obj[strDirect], name;
						if (o) {
							for (name in o) {
								if (!funJudge(name)) {
									align = o[name];
								}
							}
						}
					})();
				} else {
					//该方向溢出
					(function() {
						if (funCenterJudge(align)) { 
							var center = {
								"5-7": "7-5",
								"7-5": "5-7",
								"6-8": "8-6",
								"8-6": "6-8"
							};
							align = center[align];
						} else {
							var obj = {
								top: {
									left: "3-2",
									right: "4-1"	
								},
								right: {
									bottom: "1-2",
									top: "4-3"
								},
								bottom: {
									left: "2-3",
									right: "1-4"
								},
								left: {
									bottom: "2-1",
									top: "3-4"
								}
							};
							var o = obj[strDirect], arr = [];
							for (name in o) {
								arr.push(name);
							}
							if (funJudge(arr[0]) || !funJudge(arr[1])) {
								align = o[arr[0]];
							} else {
								align = o[arr[1]];	
							}
						}
					})();
				}
			}
			
			//已确定的尖角
			var strNewDirect = funDirect(align), strFirst = align.split("-")[0];
			if (this.s.sharpAngle) {
				//创建尖角
				this.createSharp(strNewDirect);
				cor_w = this.corner.w(), cor_h = this.corner.h();
			}
			
			//确定left, top值
			switch (strNewDirect) {
				case "top": {
					tar_t = tri_t - off_y - tar_h - cor_h;
					if (strFirst == "1") {
						tar_l = tri_l - off_x;	
					} else if (strFirst === "5") {
						tar_l = tri_l - (tar_w - tri_w) / 2 - off_x;
					} else {
						tar_l = tri_l - (tar_w - tri_w) - off_x;
					}
					cor_t = tri_t - cor_h - off_y - 1;
					cor_l = tri_l - (cor_w - tri_w) / 2;
					break;
				}
				case "right": {
					tar_l = tri_l + tri_w + off_x + cor_w;
					if (strFirst == "2") {
						tar_t = tri_t + off_y;	
					} else if (strFirst === "6") {
						tar_t = tri_t - (tar_h - tri_h) / 2 + off_y;
					} else {
						tar_t = tri_t - (tar_h - tri_h) - off_y;
					}
					cor_l = tri_l + tri_w + off_x + 1;
					cor_t = tri_t - (cor_h - tri_h) / 2;
					break;
				}
				case "bottom": {
					tar_t = tri_t + tri_h + off_y + cor_h;
					if (strFirst == "4") {
						tar_l = tri_l + off_x;	
					} else if (strFirst === "7") {
						tar_l = tri_l - (tar_w - tri_w) / 2 + off_x;
					} else {
						tar_l = tri_l - (tar_w - tri_w) + off_x;
					}
					cor_t = tri_t + tri_h + off_y + 1;
					cor_l = tri_l - (cor_w - tri_w) / 2;
					break;
				}
				case "left": {
					tar_l = tri_l - tar_w - off_x - cor_w;
					if (strFirst == "2") {
						tar_t = tri_t - off_y;	
					} else if (strFirst === "8") {
						tar_t = tri_t - (tar_h - tri_h) / 2 - off_y;
					} else {
						tar_t = tri_t - (tar_h - tri_h) - off_y;
					}
					cor_l = tri_l - cor_w - off_x - 1;
					cor_t = tri_t - (cor_h - tri_h) / 2;
					break;
				}
			}
			//尖角的显示
			if (cor_h && cor_w && this.corner) {
				this.corner.css({
					left: cor_l,
					top: cor_t,
					zIndex: this.s.zIndex + 1	
				});
			}
			//浮动框显示
			this.target.css({
				position: "absolute",
				left: tar_l,
				top: tar_t,
				zIndex: this.s.zIndex
			});
			return this;
		},
		createSharp: function(dir) {
			var bgColor, bdColor, color1 = "", color2 = "";
			var objReverse = {
				left: "right",
				right: "left",
				bottom: "top",
				top: "bottom"	
			}, dirReverse = objReverse[dir] || "top";
			
			this.cornerClear();
			
			if (this.target) {
				bgColor = this.target.css("background-color");
				if (this.target.css("border-" + dirReverse + "-width").toInt() > 0) {
					bdColor = this.target.css("border-" + dirReverse + "-color");
				} 
				
				if (bdColor &&  bdColor !== "transparent") {
					color1 = 'style="color:' + bdColor + ';"';
				} else {
					color1 = 'style="display:none;"';
				}
				if (bgColor && bgColor !== "transparent") {
					color2 = 'style="color:' + bgColor + ';"';	
				}else {
					color2 = 'style="display:none;"';
				}
			}
			
			var htmlCorner = '<span class="corner corner_1" ' + color1 + '>◆</span><span class="corner corner_2" ' + color2 + '>◆</span>';
			var eleCorner = new Element("div").attr("id", "floatCorner_" + dir).addClass("float_corner float_corner_" + dir).html(htmlCorner);
			
			if (!$("floatCorner_" + dir)) {
				eleCorner.inject(document.body);	
			}
			this.corner = $("floatCorner_" + dir);
			return this;
		},
		targetHold: function() {
			if (this.s.hoverHold) {
				var delay = this.s.hideDelay.toInt() || 200;
				if (this.target) {
					this.target.addEvents({
						mouseenter: function() {
							this.flagDisplay = true;
						}.bind(this),
						mouseleave: function() {
							this.flagDisplay = false;
							this.displayDetect();
						}.bind(this)
					});
					//鼠标移出检测是否hover trigger，以决定其显示与否
					o.timerHold = this.displayDetect.delay(delay, this);
				}
			} else {
				o.displayDetect();	
			}
			return this;
		},
		loading: function() {
			this.target = new Element("div").addClass("float_loading");
			this.targetShow();
			return this;
		},
		displayDetect: function() {
			//显示与否检测与触发
			if (!this.flagDisplay) {
				this.targetHide();
			}
			return this;
		},
		targetShow: function() {
			o.cornerClear();
			this.container().setWidth().position();
			this.target.show();
			if ($isFun(this.s.showCall)) {
				this.s.showCall.call(this.trigger, this.target);	
			}
			//全局隐藏浮动层方法
			window.powerFloatHide = function() {
				o.targetHide();	
			};
			this.display = true;
			return this;
		},
		targetHide: function() {	
			this.targetClear();
			this.cornerClear();
			if ($isFun(this.s.hideCall)) {
				this.s.hideCall.call(this.trigger);	
			}
			this.target = null;
			this.trigger = null;
			this.s = {};
			this.targetProtect = false;
			this.display = false;
			return this;
		},
		targetClear: function() {
			if (this.target) {
				if (this.targetProtect) {
					//保护孩子
					this.target.getFirst().out().inject(document.body);
				} 
				this.target.out();
			}
		},
		cornerClear: function() {
			if (this.corner) {
				//使用remove避免潜在的尖角颜色冲突问题
				this.corner.dispose();
			}
		},
		target: null,
		trigger: null,
		s: {},
		cacheData: {},
		targetProtect: false
	};
	var documentEvent = function(e) {
		if (!o.display) { return false;}
		var px = e.page.x, py = e.page.y, off = o.target.getPosition(), tarw = o.target.w(), tarh = o.target.h();
		if (o.s.eventType === "click" && e.target != o.trigger) {
			if (!(px > off.x && px < off.x + tarw && py > off.y && py < off.y + tarh)) {
				o.flagDisplay = false;	
				o.displayDetect();
				document.removeEvent("mouseup", documentEvent);
			}
		}
		return false;
	}, hoverTimer;
	
	var s = $extend(defaults, options || {});
	var init = function(pms, trigger) {
		if (o.target && o.display) {
			o.targetHide();
		}
		o.s = pms;
		o.trigger = trigger;	
	};
	
	eleTrigger.each(function(items) {
		switch (s.eventType) {
			case "hover": {
				items.addEvents({
					mouseenter: function() {					
						if (o.timerHold) {
							$clear(o.timerHold);	
						}			
						var numShowDelay = s.showDelay.toInt();
						
						init(s, this);	
	
						//鼠标hover延时
						if (numShowDelay) {
							if (hoverTimer) {
								$clear(hoverTimer);
							}
							hoverTimer = o.targetGet.delay(numShowDelay, o);
						} else {
							o.targetGet();	
						}
					},
					mouseleave: function() {
						if (hoverTimer) {
							$clear(hoverTimer);
						}
						o.flagDisplay = false;
						o.targetHold();
					}
				});
				break;	
			}
			case "click": {
				items.addEvent("click", function(e) {
					if (o.display && e.target === o.trigger) {
						o.flagDisplay = false;	
						o.displayDetect();
					} else {
						init(s, this);		
						o.targetGet();
					}
					document[o.display? "addEvent" : "removeEvent"]("mouseup", documentEvent);
					return false;
				});
				break;
			}
			case "focus": {
				items.addEvents({
					focus: function() {
						setTimeout(function() {
							init(s, this);
							o.targetGet();	
						}.bind(this), 200);
					},
					blur: function() {
						o.flagDisplay = false;
						setTimeout(function() {
							o.displayDetect();	
						}, 190);
					}
				});
				break;
			}
			default: {
				init(s, items);
				o.targetGet();
			}
		}
	});
};
$powerFloat.extend({
	hide: function() {
		if (window.powerFloatHide) {
			powerFloatHide();
		}
	}
});


//元素拖拽
var $startDrag = function(bar, target) {
	var params = {
		left: 0,
		top: 0,
		currentX: 0,
		currentY: 0,
		flag: false
	};
	//o是移动对象
	bar.addEvent("mousedown", function(e) {
		params.flag = true;
		params.left = target.getPosition().x;
		params.top = target.getPosition().y;
		params.currentX = e.page.x;
		params.currentY = e.page.y;
	});
	bar.onselectstart = function() {
		return false;
	};
	bar.style.WebkitUserSelect = "none";
	bar.style.MozUserSelect = "none";
	bar.style.OUserSelect = "none";
	document.addEvents({
		mouseup: function() {
			params.flag = false;
		},
		mousemove: function(e) {
			if(params.flag){
				var nowX = e.page.x, nowY = e.page.y;
				var disX = nowX - params.currentX, disY = nowY - params.currentY;
				target.css({
					left: params.left + disX,
					top: params.top + disY
				});
			}
		}
	});
};

//滚动加载
var $lazyLoading = function(elements, options) {
	var defaults = {
		attr: "data-url",
		container: window, //滚动容器
		callback: $empty
	};
	var params = $extend(defaults, options || {});
	params.cache = [];
	if (params.container != window && !$isEle(params.container)) {
		params.container = window;
	}
	if ($isEle(elements)) {
		elements = [elements];	
	}
	elements.each(function(ele) {
		var node = ele.get("tag"), url = ele.attr(params["attr"]) || "";
		//重组
		var data = {
			obj: ele,
			tag: node,
			url: url
		};
		params.cache.push(data);
	});	

	//动态显示数据
	var loading = function() {
		var scrollTop = params.container.getScroll().y, scrollLeft = params.container.getScroll().x,
			scrollTopWithHeight = scrollTop + params.container.getHeight(),
			scrollLeftWithWidth = scrollLeft + params.container.getWidth();
			
		params.cache.each(function(data) {
			var o = data.obj, tag = data.tag, url = data.url, postionTop, positionBottom, positionLeft, positionRight;

			if (o) {
				if (params.container === window) {
					postionTop = o.getPosition().y;
					positionLeft = o.getPosition().x;
				} else {
					postionTop = o.getPosition(params.container).y;
					positionLeft = o.getPosition(params.container).x;
				}
				positionBottom = postionTop + o.h();
				positionRight = positionLeft + o.w();
				if ((
						(postionTop > scrollTop && postionTop < scrollTopWithHeight) || (positionBottom > scrollTop && positionBottom < scrollTopWithHeight)
					) && (
						(positionLeft > scrollLeft && positionLeft < scrollLeftWithWidth) || (positionRight > scrollLeft && positionRight < scrollLeftWithWidth)
				)) {
					if (url) {
						//在浏览器窗口内
						if (tag === "img") {
							//图片，改变src
							o.attr("src", url);	
							params.callback.call(o);
						} else {
							o.set("load", {
								onSuccess: function() {
									params.callback.call(o);
								}
							});
							o.load(url);
						}	
					} else {
						//无地址，直接触发回调
						params.callback.call(o);
					}
					data.obj = null;		
				}
			}
		});		
		return false;	
	};
	
	//事件触发
	//加载完毕即执行
	loading();
	//滚动执行
	params.container.addEvent("scroll", loading);
};

//随屏滚动
var $scrollFollow = function(element, maxbottom) {
	var top = element && element.getPosition().y, flag = false;
	maxbottom = maxbottom || 0;
	var funScroll = function() {
		if (!flag || !$chk(top)) { return; }
		var scrollTop = window.getScroll().y, tops = scrollTop - top
			, maxTop = window.getScrollSize().y - element.h() - maxbottom - top;
			
		if (tops > maxTop) tops = maxTop;
		element.tween("top", tops > 0? tops: 0);	
		flag = false;
	};
	//定位
	funScroll.periodical(400);
	window.addEvent("scroll", function() { flag = true; });
};

//智能随屏浮动
var $smartFloat = function(elements, options) {
	var params = $extend({
		ie6: true,
		fixedCall: $empty,
		normalCall: $empty,
		maxBottom: 0,
		zIndex: 10
	}, options || {});
	
	if (!params.ie6 && $isIe6) { return; }
	
    var position = function(element) {
        var top = element.getPosition().y, objPos = element.getStyles("position", "top", "zIndex");
		
        window.addEvent("scroll", function() {
            var scrolls = this.getScroll().y, maxTop = window.getScrollSize().y - element.h() - params.maxBottom;
            if (scrolls > top) {
				var overflow = scrolls>maxTop;
                if (!$isIe6) {
                    element.css({
                        position: "fixed",
                        top: overflow? maxTop-scrolls: 0,
						zIndex: params.zIndex
                    });
                } else {
                    element.css({
						position: "absolute",
						top: scrolls>maxTop? maxTop: scrolls,
						zIndex: params.zIndex
					});
                }
				params.fixedCall.call(element);
            } else {
                element.setStyles(objPos);
				params.normalCall.call(element);
            }
        });
    };
    
	return $splat(elements).each(function(items) {
		position(items);
	});
    
};

//列表元素平滑切换脚本
var $smoothSlide = function(container, elements, options) {
	if (!container || !elements)  { return; }
	var defaults = {
		direct: "left", //其他可选值为"top", "right", "bottom"
		duration: "normal",
		size: "auto",  // 列表元素的尺寸，或宽度或高度，用在等宽或等高列表，避免DOM尺寸的计算，提高性能
		index: 0, //当前第一个列表索引值
		visible: 1, //当前显示的列表个数
		loop: 1, //每次移动的数目
		name: "", //产生两个,
		autoTime: 0, //自动播放时间
		prev: null,
		next: null,
		prevCall: $empty,
		nextCall: $empty
	};
	var params = $extend(defaults, options || {});
	var posHash = new Hash(), initPos = 0;
	
	elements = $splat(elements); //数组化
	params.length = elements.length;
	
	if (params.length < params.visible) { return; }
	
	elements.each(function(list, index) {
		posHash[index] = -1 * initPos;
		
		if (params.size === "auto" || !$chk(params.size.toInt())) {
			if (params.direct === "left" || params.direct === "right") {
				initPos += list.w();
			} else if (params.direct === "top" || params.direct === "bottom") {
				initPos += list.h();
			}
		} else {
			initPos += params.size.toInt();
		}
	});
	
	
	container.set("tween",  { duration: params.duration }).css(params.direct, posHash[params.index]).store("autoTime", params.autoTime);
	var funTween = function(position) {
		container.tween(params.direct, position);
	}, hrefToggle = function(element, display) {
		if (element.get("tag") === "a") {
			display? element.setProperty("href", "javascript:"): element.removeProperty("href");
		}
	};
	
	var funBtnState = function() {
		var prevClass = params.name? params.name + "_prev_disable": "disabled", nextClass =  params.name? params.name + "_next_disable": "disabled";
		if (params.prev) {
			if (params.index <= 0) {
				hrefToggle(params.prev.addClass(prevClass).store("disable", true).setProperty("title", ""));
				params.index = 0;
			} else {
				hrefToggle(params.prev.removeClass(prevClass).store("disable", false).setProperty("title", params.prev.retrieve("title")), true);
			}
		}
		if (params.next) {
			if (params.index >= (params.length - params.visible)) {
				hrefToggle(params.next.addClass(nextClass).store("disable", true).setProperty("title", ""));
				params.index = params.length - params.visible;
			} else {
				hrefToggle(params.next.removeClass(nextClass).store("disable", false).setProperty("title", params.next.retrieve("title")), true);
			}
		}
	};
	
	//事件绑定
	if (params.prev) {
		params.prev.addEvent("click", function() {
			if (!this.retrieve("disable")) {
				params.index -= params.loop;
				funBtnState();
				funTween(posHash[params.index]);
				if ($isFun(params.prevCall)) {
					params.prevCall.call(this, container, params.index);
				}
			} else {
				this.blur();	
			}
			return false;
		}).store("title", params.prev.getProperty("title"));	
	}
	if (params.next) {
		params.next.addEvent("click", function() {
			if (!this.retrieve("disable")) {
				params.index += params.loop;
				funBtnState();
				funTween(posHash[params.index]);
				if ($isFun(params.nextCall)) {
					params.nextCall.call(this, container, params.index);
				}
			} else {
				this.blur();	
			}
			return false;
		}).store("title", params.next.getProperty("title") || "");
	}
	
	
	//前后按钮状态初始化
	funBtnState();
	
	
	//自动播放
	if (params.autoTime.toInt() > 0) {
		var currentTarget = params.next;
		setInterval(function() {
			// container作为全局变量，通过存储"autoTime"值来决定是否应当中断当前自动滑动效果
			if (container.retrieve("autoTime")) {
				currentTarget.fireEvent("click");
				if (currentTarget.retrieve("disable")) {
					if (currentTarget == params.next) {
						currentTarget = params.prev;
					} else {
						currentTarget = params.next;
					}
				}
			}
		}, params.autoTime);
	}
};

//元素上文字提示
var $testRemind = function(target, content, center) {
	if ($isEle(target) && content) {
		$testRemind.bind();
		$powerFloat(target, {
			eventType: null,
			targetMode: "remind",
			offsets: { x: center? 0: 10, y: 0 },
			target: content,
			zIndex: 202,
			position: (center? "5-7": "1-4" )
		});
	}
};
$testRemind.extend({
	hide: function() {
		var eleRemind = $("floatBox_remind");
		if (eleRemind) {
			eleRemind.dispose();
			$$(".float_corner").dispose();	
			// 事件清除
			document.removeEvent("mousedown", $testRemind.mousedown).removeEvent("keydown", $testRemind.keydown);
			window.removeEvent("resize", $testRemind.resize);
		}	
	},
	bind: function() {
		document.addEvent("mousedown", $testRemind.mousedown).addEvent("keydown", $testRemind.keydown);	
		window.addEvent("resize", $testRemind.resize);
	},
	mousedown: function(e) {
		if (e && e.target.getParents && e.target.getParents("#floatBox_remind").length === 0) {
			$testRemind.hide();	
		}		
	},
	keydown: function(e) {
		if (!e || !e.target.get) return;
		if (e.target && e.target.get("tag") !== "body") {
			$testRemind.hide();	
		}
	},
	resize: function() {
		$testRemind.hide();		
	}
});

//JavaScript无阻塞加载
var $loadScript = function(url, callback, id) {
	id = id || $time();
	callback = callback || function() {};
	var script = new Element("script", {
		type: "text/javascript",
		id: id	
	});
	if (script.readyState) {
		//IE
		script.onreadystatechange = function() {
			if (script.readyState === "loaded" || script.readyState === "complete") {
				script.onreadystatechange = null;
				callback.call(this, script.destroy());
			} 
		}.bind(this); 
	} else {
		//other
		script.onload = function() {
			callback.call(this, script.destroy());
		}.bind(this);
	}	
	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);	
};

//控件文字自动提示
var $autoRemind = function(trigger, options) {
	var params = $extend({
		label: true	
	}, options || {});
	
	var initvalue = $isEle(trigger) && trigger.attr("placeholder"), inputval = initvalue && trigger.val().trim();
	var isPlaceholderSupport = "placeholder" in document.createElement("input"), eleLabel = null;
	
	if (!initvalue || isPlaceholderSupport)  return;
	
	
	if (params.label == false) {
		//value形式的占位符效果
		$classToggle(trigger, {
			eventType: "focus",
			inCall: function() {
				if (this.val().trim() === initvalue) {
					//获取焦点，如果文本框或文本域中的值与placeholder值相等，则内部值清空
					this.val("");
				}
				this.style.color = "";
			},
			outCall: function() {
				if (this.val().trim() === "") {
					this.css("color", "graytext").val(initvalue);
				}
			}
		});
		
		if (!inputval || inputval === initvalue) {
			//如果默认进来没有文字内容，置灰并显示placeholder值
			trigger.css("color", "graytext").val(initvalue);	
		} else {
			trigger.style.color = "";
		}
	} else {
		var idTrigger = trigger.id || "labelRemind"+ (Math.random() + "").split(".")[1];	
		/^label/.test(idTrigger) && trigger.attr("id", idTrigger);
		
		var padding = trigger.getStyle("padding"), margin = trigger.getStyle("margin"), borderWidth = trigger.getStyle("borderWidth").split(" ");
		margin = margin.split(" ").map(function(margin, index) {
			if (/px$/.test(margin) && (index === 0 || index === 3) ) {
				return 	margin.toInt() + (borderWidth[index].toInt() || 0) + "px"
			}
		}).join(" ");
		var eleLabel = new Element("label", {
			"class": "label_remind",
			styles: {
				color: "graytext",
				fontSize: trigger.getStyle("fontSize"),
				padding: padding,
				margin: margin,
				position: "absolute"
			},
			"for": idTrigger
		}).inject(trigger, "before");
		
		// 百分比padding的兼容处理
		if (/%/.test(padding)) trigger.getParent().addClass("rel");

		//label形式的占位符效果
		$classToggle(trigger, {
			eventType: "focus",
			inCall: function() {
				eleLabel.txt("");
			},
			outCall: function() {
				if (this.val().trim() === "") {
					eleLabel.txt(initvalue);
				}
			}
		});
		
		//初始化
		if (!inputval || inputval === initvalue) {
			trigger.val("");
			eleLabel.txt(initvalue);	
		}
	}
};

//后台返回JSON公共处理方法
var $jsonHandle = function(json, s) {
	s = s || {};
	s.delay = (s.delay || 0) && s.delay.toInt(); 
	if ($isObj(json)) {
		var funUrl = function() {
			setTimeout(function() {
				if (json["url"]) {
					$pageFresh(json["url"]);
				} else {
					if (json["refresh"]) {
						$pageFresh();
					}
				}	
			}, s.delay || 15);
		};
		
		if (json["msg"]) {
			if (s.remind && $(s.remind)) {
				if (json["succ"]) {
					$(s.remind).html(json["msg"]).swapClass("co", "cg");
				} else {
					$(s.remind).html(json["msg"]).swapClass("cg", "co");
				}
				if (s.delay > 0) {
					setTimeout(function() {
						$(s.remind).empty();
					}, s.delay);
				}
			} else {
				if (Mbox.isOpen) { Mbox.close(); }
				Mbox.alert(json["msg"], null, {
					time: s.delay || json.delay || 0,
					onShow: function() {
						$testRemind.hide();
					},
					onClose: function() {
						if (json.sync) { funUrl(); }		
					}
				});
			}
		}
		
		if (!json.sync) {
			//不是同步
			funUrl();
		}
		
		if (json.js) {
			eval(json.js);	
		}
	} else {
		$jsonHandle({
			succ: false,
			msg: "抱歉，返回的内容有异常，刚才的操作可能并未受理。"
		}, s);
	}
};

//Ajax POST操作
var AjaxPost = new Class({
	Implements: [Options],
	options: {
		url: "",
		remind: null,
		text: "",
		eleText: null, //ajax文字提示元素，默认为触发按钮
		delay: 0,
		data: {},
		callback: $empty
	},
	initialize: function(ele, options) {
		this.setOptions(options);
		this.ele = $(ele);
		this.options.url = this.options.url || this.ele.attr("data-url");
	},
	assign: function() {
		this.ele.addEvent("click", function() {
			this.send();
			return false;
		}.bind(this));
	},
	send: function() {
		var s = this.options, trigger = this.ele, eleText = s.eleText || trigger,
			method = eleText.get("tag") === "input"? "val": "txt", text = eleText[method]();

		if (trigger && s.url && trigger.retrieve("ajax") != false) {
			//禁止二次点击
			trigger.store("ajax", false);
			s.text && eleText[method](s.text);
			
			new AjaxReq({
				url: s.url,
				data: s.data,
				method: "post",
				onSuccess: function(json) {
					// ajax请求中标志量还原
					trigger.store("ajax", true);						
					// json返回数据处理
					$jsonHandle(json, s);
					// 提示文字还原（如果有）
					s.text && eleText[method](text);					
					// 执行回调
					$isFun(s.callback) && s.callback(json);
					return false;
				},
				onError: function() {
					trigger.store("ajax", true);
					var json = {
						succ: false,
						msg: "抱歉，由于系统的原因，刚才的操作没有成功，您可以稍后重试。"
					};
					$jsonHandle(json, s);
					s.text && eleText[method](text);
					return false;
				}
			}).send();
		}
	}
});

var $formSubmit = function(formCollect, options) {
	if ($isEle(formCollect)) formCollect = [formCollect];
	var defaults = {
		ajax: false,
		novalidate: true,
		enabled: true,
		validate: function() { return true; } // 额外的验证
	};
	options = $extend(defaults, options || {});
	
	formCollect.each(function(form) {
		options.enabled && form.getElements("input[disabled]").each(function(eleDisabled) {
			if (/submit|image/i.test(eleDisabled.type)) eleDisabled.removeProperty("disabled");
		});
		if (options.novalidate && history.pushState) {
			form.attr("novalidate", "novalidate");
		}			
		form.addEvent("submit", function(e) {
			e && e.stop();
			if (this.validate() && options.validate()) {
				var eleTrigger = this, eleSubmit = null;
				if (options.ajax || this.attr("data-ajax")) {
					eleSubmit = this.getElement("input[type='submit']") || this.getElement("input[type='image']");
					// 检测是该提交按钮被label关联
					if (eleSubmit) {
						eleTrigger = $$("label[for="+ eleSubmit.id +"]")[0] || eleSubmit;
					}
					new AjaxPost(eleTrigger, $extend({
						url: this.action,
						data: this.toQueryString(),
						text: eleTrigger != this ? "处理中...": ""
					}, options)).send();	
				} else {
					this.submit();	
				}
			}
			return false;
		});
	});
};

// 渐隐渐显轮播
var $fadeSwitch = function(ele, eleIndex, options) {
	if(!ele || !eleIndex) return;
	var defaults = {
		eventType: "hover",
		indexClass: "res_fade_index_a",
		activeClass: "res_fade_index_aon",
		autoTime: 5000
	}
	options = $extend(defaults, options || {});
	if(options.eventType == "hover") options.eventType = "mouseover";
	var eleLi = ele.getElements("li"),
		eleLiLength = eleLi.length,
		indexHtml = "";
	for(i=0; i<eleLiLength; i++) {
		indexHtml = indexHtml + "<a href='javascript:' class='" + options.indexClass + "'>●</a>";
	};
	eleIndex.html(indexHtml);
	var eleIndexA = eleIndex.getElements("a");
	eleIndexA.each(function(ele, index) {		
		ele.addEvent(options.eventType, function() {
			if (ele.hasClass(options.activeClass)) return;
			eleLi.fade("out")
			setTimeout(function() {				
				eleLi.hide();
				eleLi[index].show().fade("in");
				eleIndexA.removeClass(options.activeClass);
				eleIndexA[index].addClass(options.activeClass);
				eleIndexA.visible();			
			}, 300);
		});
	});
	eleIndexA[0].fireEvent(options.eventType);
	// 定时翻滚
	var eleAIndex = 1;
    setInterval(function() {
        if(eleAIndex >= eleLiLength) eleAIndex = 0;
        eleIndexA[eleAIndex].fireEvent(options.eventType);
        eleAIndex += 1
    }, options.autoTime);
}



