var customEidtSMS=(function name() {
    
    //模态的alert显示
	function _smsAlert(str, callback) {
		
		if(!str){
			xmsCore.xmsBox.hide();
		}
		
		var alertOption = {
			"title": '<div class = "tc"><span class = "pad-header-text">信息提示框</span></div><i class = "pad-header-small-line"></i>',
			"text": '<div class = "tc mt10 mb10 pt20 pb20">' + str + '</div>',
			"applyText": '<div class="pad-footer-apply">确认</div>',
			"applyCb": callback,
			"type": "small"
		};

		_smsConfirm(alertOption);

	}
    
    //大弹层模块
	function _smsConfirm(options) {
		/*
			结构如下
			{
				title : "",
				text : "",
				type : "",//big/small，默认big
				className : "",
				applyText : "",
				applyCb : null,
				cancelText : "",
				cancelCb : null,
				afterShow : null
				//表示，当显示后，执行的初始化信息
			}
		*/

		var xmsBox = xmsCore.xmsBox,
			afterShow = null,
			className =
			overlay = $(".xms-overlay"),
			bigClass = "xms-overlay";

		//初始化弹层的显示大小
		function _initOverlay(className, type) {
			var typeClass = "";

			if (type == "small") {
				typeClass = "pad-sms-xmsbox-small";
			} else {
				typeClass = "pad-sms-xmsbox-big";
			}

			overlay.attr("class", bigClass + " " + typeClass);

			//修改
			if (className) {
				overlay.addClass(className);
			}

		}

		function _customConfirm(options) {
			//设置初始值
			var option = {},
				btn = {};

			option.title = options.title || "";
			option.text = options.text || "";
			option.btn = btn,
				className = options.className;

			_initOverlay(className, options.type);

			if (options.cancelText) {
				btn.cancel = {
					"text": options.cancelText || "",
					"fn": options.cancelCb || null
				};
			}

			if (options.applyText) {
				btn.apply = {
					"text": options.applyText || "",
					"fn": options.applyCb || null
				};
			}

			xmsBox.alert(option);

			//加载初始化信息
			if (typeof afterShow == "function") {
				afterShow.call(overlay);
			}

		}

		function _set(options) {

			if (!options || (typeof options != "object")) {
				return "";
			}

			//如果是同一个afterShow，那么不做处理
			if (afterShow && afterShow !== options.afterShow) {
				if (typeof afterShow.removeEvent == "function") {
					afterShow.removeEvent();
				}
			}
			afterShow = options.afterShow;

			_customConfirm(options);

		}

		//惰性载入函数
		_smsConfirm = _set;
		_smsConfirm(options);

	}
    
    //方法扩展到$.fn对象上去
	$.fn.extend({
		padSelectBox: function(options) {
			options = options || {};
			$.each($(this), function() {
				var option = $.extend({}, options);

				option.obj = $(this);
				_padSelectBox(option);
			});

			return this;
		}
	});

	function _padSelectBox(options) {
		/*
			obj为container
			callback : "function"
			//表示，当点击按钮之后，执行的动作
			//如果这里有设置回调函数的话
			//那么默认处理，如果设置了回调
			//那么会执行回调，内部this指向obj，传入input和value的
		*/
		var obj = null,
			input = null,
			items = null,
			item = null,
			content = null,
			name = null,
			cb = null;

		try {
			obj = options.obj;
			if (!obj.size()) {
				throw new Error("error");
			}
		} catch (e) {
			throw new TypeError("在初始化padSelectBox时，传入的参数有误！");
		}

		obj = obj.eq(0);
		cb = options.callback;

		//如果已经给该方法，
		if (obj.prop("padSelectBox") === true) {
			return ""
		}

		content = obj.find(".pad-select-content");
		name = obj.find(".pad-selected-name");
		input = obj.find(".pad-select-input");
		items = obj.find(".pad-select-items");
		item = obj.find(".pad-select-item");

		//点击显示可选下拉框
		content.on("click", _showSelectBox);

		function _showSelectBox() {
			items.show();
		}

		//选中可选项时的操作逻辑
		items.on("click", ".pad-select-item", _selectItems);

		function _selectItems() {
			var _obj = $(this),
				value = "";

			if (_obj.hasClass("active")) {
				//表示没有更换选中
				items.hide();
				return "";
			}

			item.removeClass("active");
			_obj.addClass("active");

			value = _obj.attr("data-value") || "";

			if (typeof cb == "function") {
				cb.call(_obj, input, value);
			} else {
				//更新显示的数据
				if (value != input.val()) {
					input.val(value);
					input.trigger("change");
				}

				name.html(_obj.text() || "请选择");
			}

			//隐藏弹出框
			items.hide();

		}

		//定义一个额外的init事件，用于把当前的input的值
		//作用到选项中去
		obj.on("init", _init);

		function _init(e) {
			var v = input.val() || "";
			if (!v) {
				//bzw 注释掉，因为默认的需要选中
				//				item.removeClass("active");
				return "";
			}

			//设置选中的项
			$.each(item, function() {
				var _obj = $(this);

				if ((_obj.attr("data-value") || "") == v) {
					_obj.addClass("active");
					name.html(_obj.text() || "请选择");
				}

			});

			if (e) {
				e.stopPropagation();
			}
		}

		//如果要卸载该方法的话
		obj.on("destory", _destory);

		function _destory() {
			//卸载所有之前绑定的事件
			items.off("click", ".pad-select-item", _selectItems);
			content.off("click", _showSelectBox);
			obj.off("destory", _destory);
			obj.prop("padSelectBox", false);
			doc.off("click", _hideSelectBox);
		}

		//当点击其他区域时，隐藏该部分的弹出框
		var doc = $(document),
			dateSec = (new Date()).getTime();

		obj.prop("timestamp", dateSec);
		doc.on("click", _hideSelectBox);

		function _hideSelectBox(e) {
			var target = $(e.target),
				p = target.closest(".pad-sms-select-box");

			if (!p.size() || p.prop("timestamp") != dateSec) {
				items.hide();
			}
		}

		//根据最初的值，初始化一下新鲜
		_init();

		//防止对于一个，进行多次绑定的情况
		obj.prop("padSelectBox", true);
	}
    
    
    //自定义模板页面，编辑已有的模板
    function _editTriggerDetail(p,newAddOption) {
		
		if(!(newAddOption instanceof Array) || !newAddOption.length){
			alert("error!");
		}
		
        var xmsBox = xmsCore.xmsBox,
            radio = p.find(".xms-radio").xmsRadio(),
            editTmplete = $(".pad-sms-edit-model-lists"),
            createBtn = $('.pad-sms-custom-sms-btn'),
            xmsQueryUrl = xmsCore.xmsQueryUrl,
            smsTmpModify = null,
            tmpOptions = {
                "className": "pad-edit-content",
                "applyText": '<div class = "pad-footer-apply">确定</div>',
                "applyCb": _applyCb,
                "cancelText": '<div class = "pad-footer-cancel">取消</div>',
                "cancelCb": '',
                "afterShow": _afterShow
            },
            submitOption = {
                "success": _submitSucc,
                "error": _submitErr,
                "beforeFn": _beforeSubmit
            },
            activeItem = null,
			selectedHTML = _createTypeSelect();
        
		createBtn.on("click",_showEdit);
        
        function _showEdit() {
            var _obj = $(this),
                option = _obj.attr("data-option") || "";

            //保存当前点击的数据，以供后面更新数据
            activeItem = _obj;

            if (!option) {
                return "";
            }

            option = JSON.parse(option);
            _setTitle(option.triggerName);
            _setContent(option);
            _smsConfirm(tmpOptions);
        }

        function _setTitle(str) {
            tmpOptions.title = '<div class = "tc"><span class = "pad-header-text">' + str + '消息设置</span></div><i class = "pad-header-small-line"></i>';
        }
		
		function _createTypeSelect(){
			var html = "";
			var i = 1,
				len = newAddOption.length,
				one = newAddOption[0];
				
			html += '<div class="pad-sms-form-item pad-trigger-event">';
			
			html += '<label class="pad-sms-form-label">短信类型：</label>';
			
			html += '<div class="pad-sms-form-content">';
			html += '<div class="pad-sms-select-box mr10 ml20" style="line-height: 40px;">';
			
			html += '<div class="pad-select-content">';
			html += '<span class="pad-selected-name">'+one.name+'</span>';
			html += '<i class="icon-arrow-blank pad-select-arrow"></i>';
			html += '</div>';
			
			html += '<input class="pad-select-input" type="hidden" id="triggerType" name="triggerType" value="'+one.value+'">';
			
			html += '<ul class="pad-select-items" style="display: none;">';
			
			html += '<li class="pad-select-item active" data-value="'+one.value+'">'+one.name+'<i class="pad-arrow-outer pad-select-box-arrow"><em class="pad-arrow-inner"></em></i></li>'
			
			for(i;i<len;i++){
				one = newAddOption[i];
				html += '<li class="pad-select-item" data-value="'+one.value+'">'+one.name+'</li>';
			}
			
			html += '</ul>';
			html += '</div>';
			html += '</div>';
			html += '</div>';
			
			return html;
		}

        function _setContent(option) {
            var html = '';
            
            if(option.modifyUrl){
                html += '<form class = "pl10" id = "smsTmpModify" action = "' + option.modifyUrl + ' " method = "post">';
                //错误提示
                html += '<div id = "padErrorTip" class="pad-sms-form-item pad-error-tip"></div>'
            }else if(option.createUrl){
                html += '<form class = "pl10" id = "smsTmpModify" action = "' + option.createUrl + ' " method = "post">';
                //错误提示
                html += '<div id = "padErrorTip" class="pad-sms-form-item pad-error-tip"></div>'
                
                html += selectedHTML;
            }
            

            html += '</div>';
            html += '</div>';

            //编辑模块
            html += '<div class="pad-sms-form-item">';
            html += '<div>发送内容：</div>'

            html += '<div class="pad-sms-edit-content">';

            html += '<div class="pad-sms-edit-model-input m10 p5 mt10" style="line-height:50px;">';
            html += '<input class="pad-sms-input pad-sms-edit-name" id = "padSmsEditName" type="text" name="smsName" value="' + option.tmpleteName + '" placeholder="请输入新建短信标题">';
            html += '</div>';

            //
            html += '<div class="pad-sms-edit-model-input m10 p5">';
            html += '<textarea class="pad-sms-input pad-sms-edit-area" id = "padSmsEditArea"  type="text" name="smsContent" rows="10">' + option.tmpleteContent + '</textarea>';
            html += '</div>';

            //
            html += '<div class="pad-sms-edit-preview m10">';
            html += '<label class="l">短信预览：</label>';
            html += '<div class="pad-sms-edit-preview-content"></div>';
            html += '</div>';

            html += '<div class="pad-sms-edit-model-lists tc">' + editTmplete.html() + '</div>';

            html += '</div>';
            html += '</form>';

            tmpOptions.text = html;

        }

        //点击确认时
        function _applyCb() {
            if (smsTmpModify) {
                smsTmpModify.trigger("submit");
            }
        }

        //load成功之后，加载一些事件
        function _afterShow() {
            var content = $(this),
                modelTimeCon = content.find('.pad-sms-model-time'),
                radio = content.find(".pad-sms-radio").xmsRadio(),
                selectBox = content.find(".pad-sms-select-box").padSelectBox(),
                edit = _editCustom(content),
				selectInput = content.find(".pad-select-input");

            smsTmpModify = content.find("#smsTmpModify");
            smsTmpModify.xmsFormSubmit(submitOption);
			
			//新增时，修改类型，显示默认的模板
			selectInput.on("change",_tmpleteChange);
			selectInput.trigger("change");
			
            function _removeEvent() {
                radio.trigger("destory");
                edit.removeEvent();
                smsTmpModify.trigger("destory");
            }

            _afterShow.removeEvent = _removeEvent;
        }
		
		function _tmpleteChange(){
			var v = $(this).val(),
				i = 0,
				len = newAddOption.length,
				one = null,
				selected = null,
				padSmsEditArea = null;
				
			for(i;i<len;i++){
				one = newAddOption[i];
				if(one.value == v){
					selected = one;
					break;
				}
			}
			
			if(!selected){
				selected = {};
			}
			
			$("#padSmsEditName").val(selected.templeName || "");
			padSmsEditArea = $("#padSmsEditArea");
			padSmsEditArea.val(selected.templeContent || "");
			padSmsEditArea.trigger("keyup");
			
		}

       //提交成功之后
        function _submitSucc(json) {

            if (json.succ == false) {
                _err(json.msg);
                return false;
            }
			
			location.reload();
			
            xmsBox.hide();
        }
        
        //提交失败之后
        function _submitErr() {
            _err("保存失败，请稍后重试！");
        }

        var padErrorTip,
            timer = 0;

        function _err(str) {
            if (!padErrorTip) {
                padErrorTip = $("#padErrorTip");
            }
            padErrorTip.html(str);
            clearTimeout(timer);
            timer = setTimeout(_hideErr, 5000);
        }

        function _hideErr() {
            padErrorTip.hide();
        }

        //提交之前，做验证
        function _beforeSubmit() {
            var sendNumber = $("#sendNumberModify"),
                smsName = $("#padSmsEditName"),
                smsContent = $("#padSmsEditArea"),
                timer = 0;
                
            if (!padErrorTip) {
                padErrorTip = $("#padErrorTip");
            }

            //判断输入的数字
            /*if (!sendNumber.val()) {
                sendNumber.focus();
                return false;
            }*/

            //没有输入自定义标题时
            if (!smsName.val()) {
            	padErrorTip.html("请输入模板标题");
	            clearTimeout(timer);
	            timer = setTimeout(_hideErr, 5000);
                smsName.focus();
                return false;
            }

            //没有输入自定义短信格式时
            if (!smsContent.val()) {
            	padErrorTip.html("请输入模板内容");
	            clearTimeout(timer);
	            timer = setTimeout(_hideErr, 5000);
                smsContent.focus();
                return false;
            }

            return true;

        }

        //移除事件绑定
        function _removeEvent() {
            p.off("click", ".edit-trigger-tmplete", _showEdit);
            if (smsTmpModify) {
                smsTmpModify.trigger("des");
            }
        }

        return {
            removeEvent: _removeEvent
        };
    }
    
    //自定义短信编辑模块
	function _editCustom(parent) {
		var editArea = parent.find(".pad-sms-edit-area"),
			previewArea = parent.find(".pad-sms-edit-preview-content"),
			templeteArea = parent.find(".pad-sms-model-content"),
			templeteList = {},
			templeteObj = {};

		//把对应的
		$.each(templeteArea.find(".pad-sms-model-content-item"), _getTemplete);

		function _getTemplete() {
			var obj = $(this),
				value = obj.attr("data-value") || "",
				id = obj.attr("data-id") || "";

			//如果为空，那么不处理
			if (!value || !id) {
				return "";
			}
			value = JSON.parse(value);
			templeteList[id] = value;

			templeteObj[value.value] = value.name;

		}

		var mousPosition = 0,
			//获取光标的位置，并保存到该属性
			isEmpty = true;

		//当改动时框触发blur事件时，则计算光标的位置
		editArea.on("blur", _getMousPositon);

		function _getMousPositon() {
			var _this = editArea[0],
				curPosition = -1;

			if (_this.selectionStart) {
				//如果不在首位，则会返回位置
				mousPosition = _this.selectionStart;
			} else {
				//在首位的时候，设置position=0
				mousPosition = 0;
			}

			if (editArea.val()) {
				isEmpty = false;
			} else {
				isEmpty = true;
			}

		}

		//当修改输入时，修改并且进行预览
		var oldValue = "";
		editArea.on("keydown", _getOldValue);

		function _getOldValue() {
			oldValue = editArea.val();
		}
		editArea.on("keyup", _getInput);

		function _getInput(e) {
			var keyCode = e.keyCode || e.which,
				value = editArea.val() || "",
				flag = true;

			//计算一次位置
			_getMousPositon();

			if (keyCode == 8) {
				//表示，按下的是删除键
				if (oldValue.length == 0) {
					return "";
				}

				if (mousPosition == value.length) {
					//表示是在最后删除，那么如果是整个的
					flag = _deleteStr(value);
					if (flag !== false) {
						value = flag;
						editArea.val(value);
					}
				}

			}

			changeTemp(value);

		}

		function _deleteStr(str) {
			//当删除时，如果删除的是最后一个，那么做一些特殊判断
			//如果最后一个是模板化的，那么就直接删除该模板
			var oLength = oldValue.length,
				lastCode = "",
				modalStr = "";
			lastIndex = 0;

			if (oLength - str.length != 1) {
				return false;
			}

			lastCode = oldValue.substring(oLength - 1);

			if (lastCode !== "]") {
				return false;
			}
			lastIndex = oldValue.lastIndexOf("[");

			if (lastIndex === -1) {
				return false;
			}

			modalStr = oldValue.substring(lastIndex);

			if (!modalStr || !(modalStr in templeteObj)) {
				return false;
			}

			return oldValue.substring(0, lastIndex);

		}

		var regs = /(\{[^\}]+\})/g;

		function changeTemp(oldStr) {
			previewArea.html(oldStr.replace(regs, _chengTempCb));
		}

		function _chengTempCb(p1, p2) {
			var v = "";
			if (p2 in templeteObj) {
				v = templeteObj[p2];
			}

			if (!v) {
				v = p2;
			}
			return v;
		}

		//当点击模板时
		templeteArea.on("click", ".pad-sms-model-content-item", _insertTemp);

		function _insertTemp() {
			var obj = $(this),
				id = obj.attr("data-id") || "",
				msgValue = "",
				value = null;

			if (!id) {
				//当选择为空时，直接退出，不处理
				return false;
			}

			value = templeteList[id];

			if (!value) {
				return "";
			}

			msgValue = editArea.val() || "";
			value = value.value;

			if (mousPosition == -1 || isEmpty) {
				msgValue = msgValue + value;

			} else if (mousPosition == 0) {
				msgValue = value + msgValue;

			} else {
				msgValue = msgValue.substring(0, mousPosition) + value + msgValue.substring(mousPosition);

			}

			mousPosition = mousPosition - 0 + value.length; //内容插入在光标之前

			editArea.val(msgValue);

			//触发一个input事件，同步预览的信息
			//在此注释掉，因为触发这个之后，会将光标位置计算在末尾而可能是连续插入模板
			//			editArea.trigger("keyup");

			//增加光标重置  bzw
			//			editArea[0].focus();
			editArea[0].selectionStart = editArea[0].selectionEnd = mousPosition;

			var value = editArea.val() || "";
			changeTemp(value);

		}

		//解除事件的绑定
		function _removeEvent() {
			editArea.off("blur", _getMousPositon);
			editArea.off("keyup", _getInput);
			templeteArea.off("click", ".pad-sms-model-content-item", _insertTemp);
			editArea.off("keydown", _getOldValue);
		}

		//如果有值，那么就先初始化一次
		if (editArea.val()) {
			editArea.trigger("keyup");
		}

		return {
			removeEvent: _removeEvent
		};

	}
    
	return {
        init : _editTriggerDetail
    }
    
})()