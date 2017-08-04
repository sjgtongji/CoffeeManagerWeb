/*!
* inet.js 内网相关脚本，基于MooTools 1.3
* by zhangxinxu 2011-06-28 婚团宴后台的交互脚本
* by zhangxinxu 2011-07-05 婚团宴需求提交脚本
* by zhangxinxu 2011-07-11 新的与地图交互后台脚本
* by zhangxinxu 2011-12-20 ~ 2011-12-23 餐厅预订回访页面的脚本们
* by zhangxinxu 2011-12-26 ~ 2011~12~28 下单页面的脚本们
* by zhangxinxu 2012-02-14 下单页面提交增加确认弹框
* by zhangxinxu 2012-02-16 新的餐厅详细页的交互脚本
* by huweiwei 2012-05-17 页面顶部修改按钮提交前判断时候勾选了外网上线
* by zhangxinxu 2012-05-24 网友印象迁移
* by zhangxinxu 2012-06-11 点评的迁移
* by zhangxinxu 2012-07-18 婚宴后台，修改人数，桌数以及金额的联动改变
*/

//相关URL地址
var INETURL = {
    selAjaxCall: "DoAjax.aspx",
    foodTypeCall: "/b/tmp/ajax/int_food_sel_call_type.asp",
    foodTypeSave: "/b/tmp/ajax/support.aspx",
    foodTypeDel: "",
    importMsgCall: "Test.aspx",
    importMsg: "DoAjax.aspx",
    metroAjaxCall: "",
    cityAreaAjaxCall: "",
    areaCircleAjaxCall: "",
    //婚团宴搜索预约后载入的页面
    wedOrderLoad: "wed_module_order.asp",
    //新地图交互载入餐厅详细的地址
    mapResInf1: "map_res_inf.asp",
    mapResInf2: "map_res_inf2.asp",
    mapResInf3: "map_res_inf3.asp"
};

var RESID = $("resId") && $("resId").val();
var ORDERID = $("orderId") && $("orderId").val();
var CITYID = $("cityId") && $("cityId").val();

String.prototype.temp = function (obj) {
    return this.replace(/\$\w+\$/gi, function (matchs) {
        return obj[matchs.replace(/\$/g, "")];
    });
};

//根据返回JSON动态绑定控件值
var $funJsonBind = function (params, isJustGet) {
    var hashJson = new Hash({});
    if ($isObj(params)) {
        // 如果是对象
        hashJson = new Hash(params);
    } else if ($isStr(params)) {
        // 如果是序列化字符串
        params.split("&").each(function (str) {
            if (str.test("=")) {
                hashJson[str.split("=")[0]] = (str.split("=")[1] || "").cnDecode();
            }
        });
    }

    !isJustGet && hashJson.each(function (value, key) {
        var eleControl = $$("input[name=" + key + "]");
        if (eleControl.length && !eleControl.attr("autocomplete").contains("off")) {
            var typeControl = eleControl[0].attr("type");
            //可能是单行文本框或是单选框或是复选框
            if (typeControl === "radio" || typeControl === "checkbox") {
                eleControl.each(function (eleInput) {
                    if (value.split(",").contains(eleInput.val())) {
                        eleInput.attr("checked", "checked").fireEvent("click");
                    } else {
                        eleInput.attr("checked", "");
                    }
                });
            } else {
                eleControl.val(value).fireEvent("change");
            }
        } else {
            eleControl = $$("textarea[name=" + key + "]");
            if (eleControl.length && !eleControl.attr("autocomplete").contains("off")) {
                eleControl.val(value).fireEvent("change");
            } else {
                eleControl = $$("select[name=" + key + "]");
                if (eleControl.length && !eleControl.attr("autocomplete").contains("off")) {
                    eleControl[0].getElements("option").each(function (eleOption) {
                        if (eleOption.val() === value) {
                            eleOption.attr("selected", "selected");
                            eleControl.fireEvent("change");
                        }
                    });
                }
            }
        }
    });

    return hashJson;
};

//下拉框内容联动
var $funSelectHtml = function (hash) {
    var html = '';
    if (hash) {
        hash.each(function (text, selVal) {
            html = html + '<option value="' + selVal + '">' + text + '</option>';
        });
    }
    return html;
};



//下拉框ajax请求
var $funSelectAjax = function (ele1, ele2, ajaxUrl, actionType) {
    if (ele1 && ele2) {
        ajaxUrl = ajaxUrl || ele1.attr("data-url");
        ele1.addEvent("change", function () {
            var valEle1 = this.val(), data = {};

            if (this.attr("data-type") === "city") {
                // 兼容以前的冗余代码
                CITYID = valEle1;
                $("selCircle").html('<option value="">请选择商圈</option>');
            }
            if (actionType) {
                data = {
                    selVal: valEle1,
                    action: actionType,
                    cityID: CITYID
                };
            } else {
                data[this.name] = valEle1;
            }
            data.rand = $time();

            // 请求级联数据
            new AjaxReq({
                url: ajaxUrl,
                data: data,
                onSuccess: function (json) {
                    if (json) {
                        ele2.html($funSelectHtml(new Hash(json)));
                    }
                }
            }).send();
        });
    }
};


(function () {
    //页面顶部修改按钮
    var eleModifyBtn = $("editorModify"), eleEditorSel = $("editorSel");
    if (eleModifyBtn && eleEditorSel) {
        eleModifyBtn.addEvent("click", function () {
            new AjaxPost(this, {
                url: INETURL.selAjaxCall,
                data: {
                    resID: RESID,
                    editorSelVal: eleEditorSel.val(),
                    action: "editorModify"
                }
            }).send();
        });
    }
    //顶部保存
    var eleSavePublishBtn = $("savePublish"), eleVerifyPass = $("verifyPass"), eleIsFinish = $("isFinish"), eleOldIsFinish = $("oldIsFinish"), eleOldIsVerify = $("oldIsVerify");
    if (eleSavePublishBtn && eleVerifyPass && eleIsFinish) {
        eleSavePublishBtn.addEvent("click", function () {
            var chkVal = eleVerifyPass.attr("checked") ? 1 : 0;
            var finish = eleIsFinish.attr("checked") ? 1 : 0;
            var self = this;
            var ajaxFun = function () {
                new AjaxPost(self, {
                    url: INETURL.selAjaxCall,
                    data: {
                        resID: RESID,
                        chkVal: chkVal,
                        isFinish: finish,
                        oldIsFinish: eleOldIsFinish.val(),
                        oldIsVerify: eleOldIsVerify.val(),
                        action: "savePublish"
                    }
                }).send();
            }
            //判断时候勾选 eleVerifyPass
            if (chkVal == 0) {
                Mbox.confirm("确定不需要外网上线？", function () {
                    ajaxFun();
                }, "", { title: "提示" })
            } else {
                ajaxFun();
            }
        });
    }
})();


//菜系/口味/菜单/摆盘
var $foodType = function () {

    var eleAddFoodTypeBtn = $("addFoodType"),
		eleDelFoodTypeBtn = $$(".delFoodType"),
		eleAddFoodTypeArea = $("foodTypeArea"),
		eleSaveAll = $("saveAll");

    var urlAjaxAdd = eleAddFoodTypeBtn && eleAddFoodTypeBtn.attr("data-url");

    var funFoodTypeHtml = function (json, id) {
        if (!id) { return ''; }
        var html = '<div id="newFoodType_' + id + '" class="pt5 pb5 fix newFoodType">' +
					'<div class="l w90">所属菜系</div>' +
						'<div class="cell">' +
							'<div class="fix">' +
								'<span class="l">',

			hash1, hash2, hash3;

        if (json && json.selData1 && json.selData2 && json.selData3) {
            hash1 = new Hash(json.selData1);
            hash2 = new Hash(json.selData2);
            hash3 = new Hash(json.selData3);
        }

        html = html + '<select id="foodTypeSel1' + id + '" class="ml5 w70">' + $funSelectHtml(hash1) + '</select>' +
								'<select id="foodTypeSel2' + id + '" class="ml5 w100">' + $funSelectHtml(hash2) + '</select>' +
								'<select id="foodTypeSel3' + id + '" class="ml5 w100">' + $funSelectHtml(hash3) + '</select>' +
								' 标签:<input class="input w120 ml5 mFoodLabelDn" type="text" id="foodLabel' + id + '" />' +
								' <input class="input w120 ml5 mFoodLabelDn" type="text" id="foodTypeInput' + id + '" />' +
								'<span class="abs_out ft fullTimeChef">' +
									' <input id="fullTimeChef' + id + '" class="vn" type="checkbox" /><label for="fullTimeChef' + id + '">专职厨师</label>' +
								'</span>' +
							'</span>' +
							'<div class="r">' +
								'<span class="g9 abs_out savedFoodType">已保存</span>' +
								'<a class="int_redbtn addFoodType" href="javascript:" type-id="' + id + '">保存</a>' +
								'<a class="int_graybtn delFoodType ml20" href="javascript:" type-id="' + id + '">删除</a>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>';

        return html;

    }, funEventFoodType = function (id) {
        var eleAppendBox = $("newFoodType_" + id),
			eleSel1 = $("foodTypeSel1" + id),
			eleSel2 = $("foodTypeSel2" + id),
			eleSel3 = $("foodTypeSel3" + id),
			eleStyle = $("foodLabel" + id),
			eleInput = $("foodTypeInput" + id),
			eleCheck = $("fullTimeChef" + id),
			eleSave, eleDel, eleSaved;

        var funDisplaySave = function (flag) {
            //flag为已保存
            if (flag) {
                eleSave.out().store("saved", true);
                eleSaved.into();
            } else {
                eleSave.into().store("saved", false);
                eleSaved.out();
            }
        };

        if (eleAppendBox) {
            eleSave = eleAppendBox.getElements(".addFoodType"), eleDel = eleAppendBox.getElement(".delFoodType"), eleSaved = eleAppendBox.getElement(".savedFoodType");
            $testRemind.bind();
            //保存按钮
            eleSave.addEvent("click", function () {
                var valSel1 = eleSel1.val(),
					valSel2 = eleSel2.val(),
					valSel3 = eleSel3.val()
                eleChek = 0;
                var id = eleAppendBox.attr("data-id") || ""
                if (eleCheck.attr("checked")) {
                    eleChek = 1;
                };
                if (eleSel2.val() === "0") {
                    $testRemind(eleSel2, "尚未选择");
                } else {
                    new AjaxPost(this, {
                        url: INETURL.foodTypeSave,
                        data: {
                            foodId: id,
                            sel1Val: valSel1,
                            sel2Val: valSel2,
                            sel3Val: valSel3,
                            foodLabel: eleStyle.val().trim(),
                            foodInput: eleInput.val().trim(),
                            chefCheck: eleChek,
                            resID: RESID,
                            action: "save"
                        },
                        callback: function (json) {
                            funDisplaySave(true);
                            eleAppendBox.setProperty("data-id", json.num)
                        }
                    }).send();
                }

                return false;
            });

            //删除按钮
            eleDel.addEvent("click", function () {
                var id = eleAppendBox.attr("data-id");
                if (id) {
                    Mbox.confirm("是否确定删除菜系", function () {
                        Mbox.close();
                        new AjaxPost(eleDel, {
                            url: INETURL.foodTypeDel,
                            data: {
                                resId: RESID,
                                foodId: id,
                                action: "delete"
                            },
                            callback: function (json) {
                                eleAppendBox.dispose();
                                eleAppendBox.highlight("#ddf");
                            }
                        }).send();
                    }, "", { title: "删除菜系" });
                } else {
                    eleAppendBox.dispose();
                }
                return false;
            });

            //下拉框联动
            eleSel1.addEvent("change", function () {
                var eleChef = eleAppendBox.getElement(".fullTimeChef");
                if (eleChef) {
                    if (this.getSelected()[0].txt() === "辅菜系") {
                        eleChef.into();
                    } else {
                        eleChef.out();
                    }
                }

            });

            $funSelectAjax(eleSel2, eleSel3, INETURL.selAjaxCall, "resStyle");

            [eleSel1, eleSel2, eleSel3, eleStyle, eleInput, eleCheck].each(function (ele) {
                ele.addEvent("change", function () {
                    funDisplaySave(false);
                });
            });
        }
    };



    if (urlAjaxAdd && eleAddFoodTypeArea) {
        eleAddFoodTypeBtn.addEvent("click", function () {
            var ranId = Math.random(), jsonSel = document.retrieve("jsonFoodType");

            if (jsonSel) {
                eleAddFoodTypeArea.appendHTML(funFoodTypeHtml(jsonSel, ranId));
                funEventFoodType(ranId);
            } else {
                new AjaxReq({
                    url: INETURL.foodTypeCall,
                    onSuccess: function (json) {
                        if (json) {
                            document.store("jsonFoodType", json);
                            eleAddFoodTypeArea.appendHTML(funFoodTypeHtml(json, ranId));
                            funEventFoodType(ranId);
                        }
                    }
                }).send();
            }


            return false;
        });
    };

    //判断数据是否带入

    $$(".newFoodType").each(function (ele) {
        var id = ele.attr("data-id");
        if (id) {
            funEventFoodType(id);
            if ($("foodTypeSel1" + id).val() === "1") {
                $("newFoodType_" + id).getElement(".fullTimeChef").into();
                //$("fullTimeChef"+ id).setProperty("checked","checked");
            }
        }
    })

    //判断是否全部保存
    var funAllSaved = function () {
        var flag = true, eleBox;
        $$(".addFoodType").each(function (btn) {
            if (flag && btn.retrieve("saved") === false) {
                flag = false;
                $testRemind(btn, "该项还没有保存", true);
                btn.focus();
                eleBox = $("newFoodType_" + btn.attr("type-id"));
                if (eleBox) {
                    eleBox.set("tween", { duration: "long" });
                    eleBox.highlight("#ffffe0");
                }
            }
        });
        return flag;
    };

    if (eleSaveAll) {
        eleSaveAll.addEvent("click", function () {
            if (funAllSaved()) {
                var eleFoodTypeForm = $("foodTypeForm");
                var dataQuery = eleFoodTypeForm.toQueryString();
                new AjaxPost(this, {
                    url: eleFoodTypeForm.attr("action"),
                    data: dataQuery,
                    callback: function () {
                        Mbox.alert("保存成功");
                    }
                }).send();
            }

            return false;
        })
    }
};


//重要提醒
var $importantMsg = function () {
    var eleAddImportMsg = $("addImportantMsg"),
		eleAddImportMsgArea = $("addImportMsgArea");

    var funImportMsgHtml = function (id, arr) {
        if (!id || !$isArr(arr)) { return ''; };
        var html = '<div id="newImportMsg_' + id + '" class="mb20 bbd newImportMsg">' +
                   		'<div class="mb20 fix">' +
                        	'<div class="w120 l">' +
								'<select id="msgSelType_' + id + '" class="pct80">' +
                                    function () {
                                        var htmlOption = '';
                                        arr.each(function (obj) {
                                            htmlOption = htmlOption + '<option value="' + obj.value + '">' + obj.text + '</option>';
                                        });
                                        return htmlOption;
                                    } () +
        //        '<option value="1">预定提醒</option>' +
        //        '<option value="7">订位提醒</option>' +
        //        '<option value="8">到达提醒</option>' +
        //        '<option value="9">金额提醒</option>' +
								'</select>' +
                            '</div>' +
                            '<div class="cell">' +
								'<input id="importMsgInput_' + id + '" class="input pct98" type="text" />' +
                                '<input type="hidden" id="hiddenUserId_' + id + '"/>' +
							'</div>' +
                        '</div>' +
						'<div class="mb20 fix">' +
							'<div class="w120 l">' +
								'开始有效时间' +
							'</div>' +
							'<div class="cell">' +
								'<div class="inline_box">' +
									'<div class="inline_any mr20">' +
										'<input id="msgStartDate_' + id + '" class="input w100" type="text" />' +
									'</div>' +
									'<div class="inline_any w100">' +
										'截至有效时间' +
									'</div>' +
									'<div class="inline_any mr20">' +
										'<input id="msgEndDate_' + id + '" class="input w100" type="text" />' +
									'</div>' +
                                    '<div class="inline_any mr20">' +
                                        '<input id="ckMustInfor_' + id + '" type="checkbox" />' +
                                        '<label for="ckMustInfor_' + id + '"> 必须告知客户 </label>' +
                                    '</div>' +
                                    '<div class="inline_any">' +
                                        '<input id="ckOutVisible_' + id + '" type="checkbox" />' +
                                        '<label for="ckOutVisible_' + id + '" >外网可见</label>' +
                                    '</div>' +
								'</div>' +
							'</div>' +
						'</div>' +
						'<div class="mb20 fix">' +
							'<div class="w120 l">' +
								'<a id="extranetMsgBtn_' + id + '" class="int_graybtn" href="javascript:">外网显示</a>' +
							'</div>' +
							'<div class="cell">' +
								'<input id="extranetMsgInput_' + id + '" class="input pct98" type="text" />' +
							'</div>' +
						'</div>' +
						'<div class="mb20 tr">' +
							'<a class="int_greebtn mr20 updateMsgBtn" href="javascript:">保存</a>' +
							'<a class="tdl mr10 g9 delMsgBtn abs_out" href="javascript:">删除</a>' +
						'</div>' +
					'</div>';
        return html;
    }, funEventImportMsg = function (id) {
        if (!id) { return ''; }
        var eleImportMsgBox = $("newImportMsg_" + id),
			eleMsgStartDate = $("msgStartDate_" + id),
			eleMsgEndDate = $("msgEndDate_" + id),

            eleMsgMustInfor = $("ckMustInfor_" + id),
            elsMsgOutVisible = $("ckOutVisible_" + id),
            elsMsgUserId = $("hiddenUserId_" + id);


        new Datepicker(eleMsgStartDate, eleMsgStartDate, { column: true });
        new Datepicker(eleMsgEndDate, eleMsgEndDate, { column: true });

        var eleImportMsgInput = $("importMsgInput_" + id),
			eleExtranetMsgInput = $("extranetMsgInput_" + id),
			eleExtraBtn = $("extranetMsgBtn_" + id),
			eleMsgSelType = $("msgSelType_" + id);

        if (eleImportMsgBox) {
            var eleBtnSave = eleImportMsgBox.getElement(".updateMsgBtn"),
				eleBtnDel = eleImportMsgBox.getElement(".delMsgBtn"),
				returnId = eleImportMsgBox.attr("data-id");

            $testRemind.bind();

            if (!eleBtnSave || !eleBtnDel) { return; }

            //保存按钮
            eleBtnSave.addEvent("click", function () {
                if ($isEmpty(eleImportMsgInput)) {
                    $testRemind(eleImportMsgInput, "请输入提醒内容", true);
                    eleImportMsgInput.focus();
                } else {
                    new AjaxPost(this, {
                        url: INETURL.importMsg,
                        data: {
                            returnId: this.retrieve("returnId") || returnId,
                            resId: RESID,
                            msgSelType: eleMsgSelType.val(),
                            importMsgInput: eleImportMsgInput.val().trim(),
                            msgStartDate: eleMsgStartDate.val(),
                            msgEndDate: eleMsgEndDate.val(),
                            extranetMsgInput: eleExtranetMsgInput.val().trim(),

                            msgOutVisible: elsMsgOutVisible.attr("checked") ? 1 : 0,
                            msgMustInfor: eleMsgMustInfor.attr("checked") ? 1 : 0,
                            msgUserId: elsMsgUserId.val()
                        },
                        callback: function (json) {
                            if (json && json.id) {
                                eleBtnSave.store("returnId", json.id).store("saved", true).txt("更新");
                                eleBtnDel.store("returnId", json.id).into();
                            }
                        }
                    }).send();
                }
                return false;
            });

            //外网显示按钮
            eleExtraBtn.addEvent("click", function () {
                if (!$isEmpty(eleImportMsgInput)) {
                    eleExtranetMsgInput.val(eleImportMsgInput.val());
                }
                return false;
            });

            //删除按钮
            eleBtnDel.addEvent("click", function () {
                Mbox.confirm("是否确定删除提醒信息", function () {
                    new AjaxPost(eleBtnDel, {
                        url: INETURL.importMsg,
                        data: {
                            isDel: 1,
                            returnId: this.retrieve("returnId") || returnId
                        },
                        callback: function () {
                            eleImportMsgBox.dispose();
                        }
                    }).send();
                } .bind(this), "", { title: "删除提醒信息" });
            });
            return false;
        };
    };
    if (eleAddImportMsg) {
        eleAddImportMsg.addEvent("click", function () {
            var ranId = Math.random();
            new AjaxPost(this, {
                url: "Ajax/ResAlertInfo.ashx",
                callback: function (json) {
                    eleAddImportMsgArea.appendHTML(funImportMsgHtml(ranId, json.option));
                    funEventImportMsg(ranId);
                }
            }).send();
        })
    };

    //判断数据是否带入
    $$(".newImportMsg").each(function (ele) {
        var id = ele.attr("data-id");
        if (id) {
            funEventImportMsg(id);
        }
    })
};

//地理位置/交通
var $traffic = function () {
    var eleSelCity = $("selCity"),
		eleSelArea = $("selArea"),
		eleCircle = $("selCircle"),
		eleMetroLine = $("metroLine"),
		eleMetroSite = $("metroSite");

    $funSelectAjax(eleSelCity, eleSelArea, INETURL.cityAreaAjaxCall, "cityArea");
    $funSelectAjax(eleSelArea, eleCircle, INETURL.areaCircleAjaxCall, "areaCircle");
    $funSelectAjax(eleMetroLine, eleMetroSite, INETURL.metroAjaxCall, "gSubway");

    var eleSelTraffic = $("selTraffic"), eleTrafficBus = $("trafficBus"), eleTrafficMetro = $("trafficMetro");

    eleSelTraffic.addEvent("change", function () {
        var valTraffic = this.val();
        if (valTraffic === "0") {
            eleTrafficBus.into();
            eleTrafficMetro.out();
        } else {
            eleTrafficBus.out();
            eleTrafficMetro.into();
        }
    });
    eleSelTraffic.fireEvent("change");
};



//店面及历史/餐厅连锁
var $chainRes = function () {
    var eleChName = $("txtName"), eleCityId = $("txtCityId"), eleChainResSel = $("chainResSel");
    eleChName.addEvent("blur", function () {
        if (!$isEmpty(eleChName)) {
            new AjaxReq({
                url: INETURL.selAjaxCall,
                data: {
                    chName: eleChName.val().trim(),
                    chainCityId: eleCityId.val().trim(),
                    action: "getChainRes"
                },
                onSuccess: function (json) {
                    var hash = new Hash(json);
                    eleChainResSel.html($funSelectHtml(hash));
                }
            }).send();
        }
    });
};




//婚团宴交互脚本
var $intWed = function () {
    var htmlLoading = '<div style="height:200px;" class="loading"></div>';
    //选项卡
    $tabSwitch($$("#wedTabBox a"), {
        classAdd: "int_wed_tab_on",
        classRemove: "int_wed_tab_a",
        switchCall: function () {
            if (this.rel === "cusGiftSift" && this.retrieve("done") !== true) {
                funGiftSift();
                this.store("done", true);
            }
        }
    });

    //查询婚宴餐厅
    var eleSchBtn = $("wedResSchBtn"),
		eleSchForm = $("wedResSchForm"),
		eleSchBox = $("resSchResultBox"),
		eleOrderBox = $("choResInfBox"),
    //修改客户信息按钮
		eleChgInfBtn = $("cusInfChg"),
    //短信群发按钮
		eleMsgGroBtn = $("msgSendGroup"),
    //客户短信单选提示标志
		flagSingleRemind = true;

    //短信类型元素
    var eleRadioCus = $("cusMsgRadio"), eleRadioRes = $("resMsgRadio");

    var funGetChecked = function () {
        var ele = null;
        $$(".chkOrderTel").each(function (radio) {
            if (!ele && radio.attr("checked")) {
                ele = radio;
            }
        });
        return ele;
    }, funSetTel = function () {
        var radio = funGetChecked(), idRadio = radio && radio.attr("data-id"),
			eleNumInput = $("resMsgNumInput"), eleNameInput = $("resMsgManInput"),
			eleSel = $$(".orderPersSel[data-id=" + idRadio + "]")[0];

        if (idRadio && eleNumInput && eleNameInput && eleSel) {
            eleNumInput.val($$("#persTel_" + idRadio).html().join());
            eleNameInput.val(eleSel.getSelected().html().join());
        }
    }, funOrderLoad = function () {
        //一些事件
        var eleSaveBtn = $("schOrderSaveBtn"),
			eleRadios = $$(".chkOrderTel"),
			eleDels = $$(".schOrderDel"),
			eleSels = $$(".orderPersSel");

        eleRadios.addEvent("click", function () {
            //返回短信内容
            var eleCusSel = $("cusMsgTemp"), eleResSel = $("resMsgTemp");
            if (eleCusSel && eleResSel) {
                if ($("cusMsgRadio").attr("checked")) {
                    //客户短信
                    eleCusSel.fireEvent("change");
                } else {
                    eleResSel.fireEvent("change");
                }
            }
            $$("#msgResId").val(this.attr("data-id"));
            funSetTel();
        });
        //保存
        if (eleSaveBtn) {
            eleSaveBtn.addEvent("click", function () {
                $formSubmit(this, {
                    text: "保存中..."
                });
                return false;
            });
        }

        //删除
        eleDels.addEvent("click", function () {
            var resId = this.attr("data-id");
            if (resId && eleOrderBox) {
                Mbox.confirm('确认删除该项？',
					function () {
					    //加载预订列表页面
					    funDoLoad(resId, "delete");
					    Mbox.close();
					}, null, {
					    title: "确认删除"
					});
            }
            return false;
        });

        //下拉改变人
        eleSels.addEvent("change", function () {
            var id = this.attr("data-id"), selected = this.getSelected()[0], arr = selected && selected.attr("data-value").split("|"),
				elePersPosi = $("persPosi_" + id), elePersTel = $("persTel_" + id), elePersFax = $("persFax_" + id);

            if (elePersPosi && elePersTel && elePersFax && arr) {
                elePersPosi.html(arr[0] || "&nbsp;");
                elePersTel.html(arr[1] || "&nbsp;");
                elePersFax.html(arr[2] || "&nbsp;");
                funSetTel();
            }
            //当联系人改变时，刷新下面的短信内容
            var eleCusSel = $("cusMsgTemp"), eleResSel = $("resMsgTemp");
            if (eleCusSel && eleResSel) {
                if ($("cusMsgRadio").attr("checked")) {
                    // 客户短信
                    eleCusSel.fireEvent("change");
                } else {
                    eleResSel.fireEvent("change");
                }
            }
        });
        eleSels.fireEvent("change");

    }, funDoLoad = function (resId, action, data) {
        if (eleOrderBox) {
            resId = resId || "";
            action = action || "";
            data = data || {};
            var params = $extend({
                orderId: ORDERID,
                resId: resId,
                action: action
            }, data);

            eleOrderBox.html(htmlLoading).load(INETURL.wedOrderLoad + (/\?/.test(INETURL.wedOrderLoad) ? "&" : "?") + new Hash(params).toQueryString());
        }
    };

    //绑定加载
    eleOrderBox.set("load", {
        method: "post",
        onSuccess: function () {
            funOrderLoad();
        }
    });

    funDoLoad();

    if (eleSchBtn && eleSchForm && eleSchBox) {
        var funPlaceDoSch = function () {
            eleSchBox.html(htmlLoading).load(eleSchForm.attr("action") + "?" + eleSchForm.toQueryString());
            eleSchForm.store("needMobxOpen", false);
        };

        eleSchBox.set("load", {
            onSuccess: function () {
                $$(".schListOrder").addEvent("click", function () {
                    var resId = this.attr("data-id"), mboxurl = this.attr("data-url"), self = this;
                    if (mboxurl) {
                        Mbox.open({
                            url: mboxurl,
                            type: "ajax",
                            ajax: true,
                            onShow: function () {
                                var eleBtn = $("provSureBtn"), eleBox = $("provRadioBox");
                                supplierId = "";
                                if (eleBox && eleBtn) {
                                    eleBtn.addEvent("click", function () {
                                        var query = eleBox.toQueryString();
                                        self.removeProperty("data-url").store("query", query);
                                        Mbox.close();
                                        self.fireEvent("click");
                                    });
                                }
                            }
                        });
                    } else if (resId) {
                        var data = {}, storeQuery = this.retrieve("query");
                        storeQuery && (data[storeQuery.split("=")[0]] = storeQuery.split("=")[1]);
                        //触发选项卡
                        $$("a[rel=cusOrderInf]").fireEvent("click");
                        //加载预订列表页面
                        funDoLoad(resId, "add", data);
                        //自身变成已预约
                        this.getParent().txt("已预约");
                    }
                });
            }
        });

        var eleRadioNeed = $("wedSchRadioGroup"), elePleceSel = $("mapPlaceSel"), elePlaceIpt = $("mapPlaceIpt");
        var elesPosSelOption = $$("#mapPlaceSel option"), eleSelPosOption = elesPosSelOption[elesPosSelOption.txt().indexOf("经纬度")];
        var valPlaceIpt = "";

        new Elements([elePleceSel, elePlaceIpt]).addEvent("change", function () {
            eleSchForm.store("needMobxOpen", true);
        });

        eleSchForm.addEvent("submit", function () {
            if (eleRadioNeed && eleRadioNeed.attr("checked")) {
                if ((!eleSelPosOption || !eleSelPosOption.attr("selected")) && (valPlaceIpt = elePlaceIpt.val().trim()) && eleSchForm.retrieve("needMobxOpen")) {
                    Mbox.open({
                        url: elePleceSel.val() + valPlaceIpt,
                        type: "ajax",
                        ajax: true,
                        title: "查询结果，可双击选择",
                        onShow: function () {
                            var eleOn = null, eleOk = $("mapSchOkBtn"), eleNo = $("mapSchNoBtn"), clOn = "float_list_a_on";
                            if (!eleOk || !eleNo) { return false; }
                            $$("#mapSchResBox a").addEvents({
                                click: function () {
                                    var longitude = this.attr("data-longitue"), latitude = this.attr("data-latitude");
                                    if (this.hasClass(clOn)) {
                                        elePlaceIpt.val(this.txt().replace("--", "，"));
                                        if (longitude) {
                                            //将经纬度塞入隐藏文本框
                                            $$("#latitude").val(latitude);
                                            $$("#longitude").val(longitude);
                                            //执行搜索, 状态还原
                                            funPlaceDoSch();
                                        }
                                        eleNo.fireEvent("click");
                                    } else {
                                        if (eleOn) { eleOn.removeClass(clOn); }
                                        this.addClass(clOn);
                                        eleOn = this;
                                    }
                                }
                            });


                            eleOk.addEvent("click", function () {
                                if (eleOn) {
                                    //有元素选中
                                    eleOn.fireEvent("click");
                                } else {
                                    $testRemind(eleOk, "尚未选择条目");
                                }
                                return false;
                            });


                            eleNo.addEvent("click", function () {
                                Mbox.close();
                                return false;
                            });

                        }
                    });
                    return false;
                }
            }
            funPlaceDoSch();

            return false;
        }).store("needMobxOpen", true);

        // 搜索选项卡
        $tabSwitch($$("#wedSchRadio input"), {
            classAdd: "noUse",
            targetAttr: "data-rel"
        });

        // 位置以及交叉路的弹框选择，跟下单页面(map_index.asp)一样
        //$inetMap.funEventMap();

    }

    // 礼品筛选
    var funGiftSift = function () {
        if (!window.dataWedCusGift) return false;
        var eleForm = $("wedGiftSiftForm"),
			eleAreaAdd = $("wedGiftAddTemp"), eleAreaDel = $("wedGiftDelTemp"),
			eleAddBox = $("wedGiftAddBox"), eleDelBox = $("wedGiftDelBox"),
			dataSift = window.dataWedCusGift, htmlTempAdd, htmlTempDel;

        var funHtml = function (action) {
            var htmlAdd = '', htmlDel = '', action = action || "both",
				isAdd = ["add", "both"].contains(action), isDel = ["del", "both"].contains(action);
            if (dataSift.data && dataSift.data.length) {
                dataSift.data.each(function (obj) {
                    if (isAdd && dataSift.addid.contains(obj.id)) {
                        htmlAdd += htmlTempAdd.temp(obj);
                    }
                    if (isDel && dataSift.delid.contains(obj.id)) {
                        htmlDel += htmlTempDel.temp(obj);
                    }
                });
            }

            if (isAdd) {
                eleAddBox[htmlAdd ? "show" : "hide"]().html(htmlAdd).getElements("li").each(function (eleLi) {
                    eleLi.addEvent("click", function () {
                        var id = this.attr("data-id");
                        // 如果尚未添加
                        if (id && !dataSift.delid.contains(id)) {
                            dataSift.delid.push(id);
                            funHtml("del");
                        }

                        return false;
                    });
                });
            }
            if (isDel) {
                eleDelBox[htmlDel ? "show" : "hide"]().html(htmlDel).getElements("li").each(function (eleLi) {
                    eleLi.addEvent("click", function () {
                        var id = this.attr("data-id");
                        if (id) {
                            dataSift.delid.erase(id);
                            funHtml("del");
                        }
                        return false;
                    });
                });
            }
        };

        if (eleForm && eleAreaAdd && eleAreaDel && eleAddBox && eleDelBox) {
            htmlTempAdd = eleAreaAdd.val(), htmlTempDel = eleAreaDel.val();

            eleForm.addEvent("submit", function () {
                $formSubmit(this.getElement("input[type=submit]"), {
                    callback: function (json) {
                        if (json.addid) {
                            dataWedCusGift.addid = json.addid;
                            funHtml("add");
                        }
                    }
                });
                return false;
            });

            // 初始化
            funHtml();

            $$("#wedGiftChoSave").addEvent("click", function () {
                var data = {};
                if (dataSift.delid.length) {
                    data.giftid = dataSift.delid.join();
                    new AjaxPost(this, {
                        url: dataSift.url,
                        data: data,
                        text: "保存中..."
                    }).send();
                } else {
                    //$testRemind(this, "尚未选择，无法保存！", true);	
                }
            });

            // 确定发送弹框
            $$("#wedGiftChoSend").addEvent("click", function () {
                if (dataSift.delid.length) {
                    Mbox.open({
                        url: this.attr("data-url") + dataSift.delid.join(),
                        type: "ajax",
                        ajax: true
                    });
                }
            });
        }
    };


    //发送短信不同类型的切换
    var eleMsgSwitch = $$(".msgSwitchRadio"), valMsg = eleMsgSwitch[0].val();
    $tabSwitch(eleMsgSwitch, {
        //classRemove: "null",
        switchCall: function () {
            valMsg = this.val();
        }
    });
    //手机号码发送
    var funSendMsg = function (btn, tel, con) {
        if (btn && tel && con) {
            $testRemind.bind();

            btn.addEvent("click", function () {
                if ($isEmpty(tel)) {
                    $testRemind(tel, "未选择或填写发送人的手机号码", true);
                    tel.focus();
                } else if ($isEmpty(con)) {
                    $testRemind(con, "您尚未填写短信内容", true);
                    con.focus();
                } else {
                    $formSubmit(this);
                }
                return false;
            });
        }
    };
    //号码发送绑定
    ["cus", "res"].each(function (key, i) {
        var eleBtn = $(key + "SendMsgBtn"), eleTel = $(key + "MsgNumInput"), eleCon = $(key + "MsgConInput"), eleTemp = $(key + "MsgTemp");

        //发送短信
        funSendMsg(eleBtn, eleTel, eleCon);

        //短信模板改变短信内容的返回
        eleTemp.addEvent("change", function () {
            var tempId = this.val(), radioChecked = funGetChecked(), data = {}; ;
            eleCon.val("");
            if (tempId !== "0") {
                data.tempId = tempId;
                data.type = valMsg;

                if (radioChecked) {
                    var resid = radioChecked.attr("data-id"), eleSels = $$(".orderPersSel[data-id=" + resid + "]"), valUser = eleSels.length && eleSels[0].val();
                    $$("#userId").val(valUser);

                    data.resId = resid;
                    data.userId = valUser;
                }

                new AjaxPost(this, {
                    url: this.attr("data-url"),
                    data: data,
                    callback: function (json) {
                        if (json && json.text) {
                            eleCon.val(json.text);
                        }
                    }
                }).send();
            }
        });

        var eleGroupBtn, eleCusMsgTemp;
        if (i === 0 && (eleGroupBtn = $(key + "GroupMsgBtn")) && (eleCusMsgTemp = eleTemp)) {
            eleGroupBtn.addEvent("click", function () {
                var eleSels = $$(".orderPersSel");
                if ($verifyRefer.funTestName(eleCusMsgTemp, true, "短信模板")) {
                    new AjaxPost(this, {
                        url: this.attr("data-url"),
                        data: this.getParent("form").toQueryString() + "&" + (eleSels[0] && eleSels[0].name || "personid") + "=" + eleSels.val().join(),
                        text: "短信发送中..."
                    }).send();
                }
                return false;
            });
        }
    });

    //修改客户信息弹框
    //if (eleChgInfBtn) {
    //Mbox.assign(eleChgInfBtn, {
    //            type: "ajax",
    //            ajax: true,
    //            width: 900,
    //            title: "修改客户信息",
    //            onShow: function () {
    //                $custRequire.funTime();
    //
    //                if ($isIe6) {
    //                    $$("select[name=weddingType]").visible();
    //                    $$("select[name=orderType]").visible();
    //                }

    $$("#cusInfSaveBtn").addEvent("click", function () {
        $formSubmit(this);
        return false;
    });

    // 修改就餐人数产生的桌数，就餐金额的联动改变
    // add by zhangxinxu 2012-07-18
    (function () {
        var elePerson = $("wedOrdPersomNum"), eleTable = $("wedOrdTableNum"),
						elePriceStart = $("wedPerPriceStart"), elePriceUse = $("wedOrdPriceUse");

        var events = $chk(window.screenX) ? "input" : "change";

        if (elePerson && eleTable && elePriceStart && elePriceUse) {
            elePerson.addEvent(events, function () {
                var personNum = this.val().toInt(), perNumber = this.attr("data-per-table"),
								perPrice = elePriceStart.val(),
								tableNum = 0;
                if ($chk(personNum) && personNum > 0 && perNumber) {
                    tableNum = Math.ceil(personNum / perNumber);
                    eleTable.val(tableNum);
                    if (perPrice) {
                        elePriceUse.val(tableNum * perPrice);
                    }
                }
            });

            new Elements([eleTable, elePriceStart]).addEvent(events, function () {
                var perPrice = elePriceStart.val(), tableNum = eleTable.val().toInt();
                if (perPrice && tableNum) {
                    elePriceUse.val(tableNum * perPrice);
                }
            });
        }

    })();

    //            }
    //        });
    // }



    //短信群发
    if (eleMsgGroBtn) {
        Mbox.assign(eleMsgGroBtn, {
            type: "ajax",
            ajax: true,
            width: 800,
            title: "短信群发",
            onShow: function () {
                $$("#groupMsgBtn").addEvent("click", function () {
                    $formSubmit(this);
                    return false;
                });
                //搜索
                $$("#wedResMboxSchBtn").addEvent("click", function () {
                    var href = eleMsgGroBtn.attr("href").split("?")[0], eleBox = $("msgMboxSch");
                    if (eleBox) {
                        eleMsgGroBtn.attr("href", href + "?" + eleBox.toQueryString()).fireEvent("click");
                    }
                });
            }
        });
    }

    //顶部的订单状态修改
    $$("#ordStateChgBtn").addEvent("click", function () {
        $formSubmit(this, { text: "状态修改中..." });
        return false;
    });

    //客户订单提交
    $$("#cusOrdStateBtn").addEvent("click", function () {
        $formSubmit(this, { text: "提交中..." });
        return false;
    });

    //客户订单通知保存
    var eleNotForm = $("ordNoticeForm");
    $$(".jsSaveNoticeChg").addEvent("click", function () {
        var id = this.attr("data-id"), eleSel = id && $("noticeStateSel_" + id);
        if (eleSel) {
            if (eleSel.val().toInt()) {
                new AjaxPost(this, {
                    url: eleNotForm.attr("action"),
                    data: {
                        noticeId: id,
                        status: eleSel.val()
                    },
                    text: "保存中..."
                }).send();
            } else {
                $testRemind(eleSel, "尚未选择状态", true);
            }
        }
        return false;
    });

    //提醒设置
    var eleRemSetBtn = $("cusRemSetBtn"), eleRemSetTime = $("cusRemSetTime"), eleRemSetCon = $("cusRemSetCon");
    if (eleRemSetBtn && eleRemSetTime && eleRemSetCon) {
        eleRemSetBtn.addEvent("click", function () {
            if ($isEmpty(eleRemSetTime)) {
                $testRemind(eleRemSetTime, "您尚未写入提醒时间", true);
                eleRemSetTime.focus();
            } else if ($isEmpty(eleRemSetCon)) {
                $testRemind(eleRemSetCon, "您尚未写入提醒内容", true);
                eleRemSetCon.focus();
            } else {
                $formSubmit(this, { text: "设置中..." });
            }

            return false
        });
    }

    // 表单提交
    $$(".submitForm").addEvent("submit", function () {
        $formSubmit(this.getElement("input[type=submit]"), { text: "处理中..." });
        return false;
    });

    // 联系人
    $$("#linkManBtn").addEvent("click", function () {
        $formSubmit(this, { text: "修改中..." });
        return false;
    });
    var eleLinkManBtn = $("firstLinkManSet"), eleLinkManSel = $("firstLinkManSel"), eleLinkManDefs = $$(".linkManDefault");
    if (eleLinkManBtn && eleLinkManSel) {
        eleLinkManBtn.addEvent("click", function () {
            var index = eleLinkManSel.val().toInt();
            $formSubmit(this, {
                text: "设置中...",
                callback: function () {
                    eleLinkManDefs.invisible();
                    eleLinkManDefs[index - 1].visible();
                }
            });

            return false;
        });
    }
    // 联系人的展开与收起
    $visibleToggle($$("#wedConterToggle"), {
        showCall: function () { this.html("收起↑"); },
        hideCall: function () { this.html("展开↓"); }
    });

    //生成传真订单
    var eleBeFaxBtn = $("beFaxOrdBtn"), eleBeFaxArea = $("beFaxOrdArea"), eleBrFaxSel = $("beFaxOrdSel")
    if (eleBeFaxBtn) {
        eleBeFaxBtn.addEvent("click", function () {
            if (eleBeFaxArea && eleBrFaxSel) {
                if ($isEmpty(eleBeFaxArea)) {
                    $testRemind(eleBeFaxArea, "您尚未写入订单内容", true);
                    eleBeFaxArea.focus();
                } else if (!eleBrFaxSel.val().toInt()) {
                    $testRemind(eleBrFaxSel, "您尚未选择内容", true);
                } else {
                    $formSubmit(this, { text: "订单生成中..." });
                }
            } else {
                $formSubmit(this, { text: "订单生成中..." });
            }
            return false;
        });
    }

    //添加快捷语
    var eleShortCon = $("shortWordCon"), eleShortViewBtn = $("shortWayViewBtn"), eleShortViewSel = $("shortWayViewSel"), eleShortViewBox = $("shortWayViewBox");
    $$("#addShortWordBtn").addEvent("click", function () {
        if (eleShortCon && $isEmpty(eleShortCon)) {
            $testRemind(eleShortCon, "您尚未输入便捷语内容", true);
            eleShortCon.focus();
            return false;
        }
        $formSubmit(this, {
            text: "添加中...",
            callback: function () {
                var eleShortAddSel = $("shortWayAddSel");
                if (eleShortViewBtn && eleShortAddSel && eleShortViewSel && (eleShortAddSel.val() === eleShortViewSel.val())) {
                    eleShortViewBtn.fireEvent("click");
                }
            }
        });
        return false;
    });

    if (eleShortViewBtn && eleShortViewSel && eleShortViewBox) {
        eleShortViewBox.set("load", {
            method: "post",
            onSuccess: function () {
                //加载html成功后
                $$("#shortWayDelBtn").addEvent("click", function () {
                    $formSubmit(this, {
                        text: "删除中...",
                        callback: function (json) {
                            if (json && json.html) {
                                eleShortViewBox.html(json.html);
                            }
                        }
                    });
                    return false;
                });
            }
        });
        eleShortViewBtn.addEvent("click", function () {
            eleShortViewBox.load(this.attr("data-url") + eleShortViewSel.val());
            return false;
        });
    }
};

//提交客户需求
var $custRequire = {
    eleName: $("custName"),
    eleTel: $("custTel"),
    eleTelCall: $("custTelCall"),
    elePhoneCall: $("custPhoneCall"),
    elePhone: $("custPhone"),
    eleQuery: $("custTelQuery"),
    eleRequire: $("otherRequire"),
    eleSubmit: $("requireSubmit"),
    funReqAdd: function () {
        var val = "", rem1 = " 请回客户手机", rem2 = " 请回客户座机";
        if (this.eleTelCall && this.elePhoneCall && this.eleRequire) {
            val = this.eleRequire.val();
            if (this.eleTelCall.attr("checked")) {
                val = val + rem1;
            } else {
                val = val.replace(rem1, "");
            }
            if (this.elePhoneCall.attr("checked")) {
                val = val + rem2;
            } else {
                val = val.replace(rem2, "");
            }
            this.eleRequire.val(val);
        }
        return this;
    },
    funRequire: function () {
        var self = this;
        [this.eleTelCall, this.elePhoneCall].each(function (ele) {
            if (ele) {
                ele.addEvent("click", function () {
                    self.funReqAdd();
                });
            }
        });
        return this;
    },
    funQuery: function () {
        var eleSexMale = $("sexyMale"), eleSexFemale = $("sexyFemale");
        if (this.eleName && this.eleQuery && this.eleTel && eleSexMale && eleSexFemale) {
            this.eleQuery.addEvent("click", function () {
                if ($isEmpty(this.eleTel)) {
                    $testRemind(this.eleTel, "尚未输入客户手机号", true);
                    this.eleTel.focus();
                } else if (!$isRegex(this.eleTel, "^\\d{11}$")) {
                    $testRemind(this.eleTel, "输入的手机号码格式不准确", true);
                    this.eleTel.focus();
                    this.eleTel.select();
                } else {
                    new AjaxPost(this.eleQuery, {
                        url: this.eleQuery.attr("data-url"),
                        data: {
                            tel: this.eleTel.val().trim()
                        },
                        callback: function (json) {
                            if (json && json.name) {
                                this.eleName.val(json.name);
                                if (json.sex === "女士") {
                                    eleSexFemale.attr("checked", "checked");
                                } else {
                                    eleSexMale.attr("checked", "checked");
                                }
                                this.elePhone.val(json.phone || "");
                            }
                        } .bind(this)
                    }).send();
                }
                return false;
            } .bind(this));
        }
        return this;
    },
    funTime: function () {
        //时间的切换
        $tabSwitch($$(".jsForSwitchTime"), {
            classAdd: "null"
        });

        //创建于删除指定时间
        var eleTimeAdd = $("timeFixedAdd");
        if (eleTimeAdd) {
            eleTimeAdd.addEvent("click", function () {
                var index = this.retrieve("index") || "1", idEle = "createTimeFixed_" + index;

                var eleP = new Element("p", {
                    id: idEle,
                    "class": "mt10"
                }).html('<input type="text" class="w160" name="timeFixed" onclick="WdatePicker({dateFmt:\'yyyy-MM-dd\',autoPickDate:true})" />' +
				'<a href="javascript:" class="tdl g6 ml20 timeFixedDel">删除</a>').inject(this, "before");

                eleP.getElement(".timeFixedDel").addEvent("click", function () {
                    $(idEle).dispose();
                    return false;
                });

                //更新index
                this.store("index", index.toInt() + 1);

                return false;
            });
        }
        return this;
    },
    funCity: function () {
        //城市切换
        $tabSwitch($$(".jsForSwitchCity"), {
            classAdd: "null"
        });

        //地区全选
        $$(".chkSelAll").addEvent("click", function () {
            $$("input[data-all=" + this.id + "]").attr("checked", this.attr("checked") || "");
        });

        $$("input[type=checkbox]").each(function (checkbox) {
            var data = checkbox.attr("data-all"), eleAll = data && $(data);
            if (eleAll) {
                checkbox.addEvent("click", function () {
                    if (!this.attr("checked")) {
                        eleAll.attr("checked", "");
                    }
                });
            }
        });


        return this;
    },
    funSubmit: function () {
        var eleName = this.eleName, eleTel = this.eleTel, elePhone = this.elePhone;
        if (this.eleSubmit) {
            this.eleSubmit.addEvent("click", function () {
                if (eleName && $isEmpty(eleName)) {
                    $testRemind(eleName, "尚未输入客户姓名", true);
                    eleName.focus();
                } else if (eleTel && elePhone && $isEmpty(eleTel) && $isEmpty(elePhone)) {
                    Mbox.alert("手机座机至少输入一个");
                    eleTel.focus();
                } else {
                    $formSubmit(this, {
                        text: "婚团宴提交中..."
                    });
                }
                return false;
            });
        }
        return this;
    },
    init: function () {
        $testRemind.bind();
        this.funRequire().funQuery().funTime().funCity().funSubmit();
    }
};


var $inetMap = {
    //详情
    eleDetailBox: $("intMapDefaultInf"),
    //用户信息
    eleCustBox: $("intMapCustBox"),
    //搜索相关
    eleSchBox: $("mapSearchBox"),
    idSchTable: "intMapSchTable",
    arrHtmlSearch: [],
    //选中的餐厅id
    resId: "",
    mobile: "",
    phone: "",
    uvid: "",
    nowDate: new Date(),
    //锚点数组
    g_LonLatArray: new Array(),

    //load餐厅信息相关
    eleResInf: $("intMapResInf"),
    //加载菜谱
    eleFoodBox: $("intMapMenuBox"),

    htmlLoading: '<div class="loading" style="height:400px;"></div>',

    clScroll: "int_map_table_box",

    //方法们
    funMenuTab: function () {
        var self = this;
        $tabSwitch($$(".menuSwitchIn"), {
            classAdd: "int_nav_on",
            classRemove: "int_nav_off",
            property: "display",
            switchCall: function () {
                var id_1 = "intMapDefaultInf", id_2 = "intMapDetailInf";
                if (this.attr("rel") === id_1) {
                    $$("#" + id_2).hide();
                } else {
                    $$("#" + id_1).hide();
                    $$("#" + id_2).show();
                }

                // 搜索结果第一个tr的定位
                $$("#searchTrFirst").css({
                    top: self.eleSchBox.getPosition().y + 12
                });
            }
        });
        $tabSwitch($$("#intMapTabBox li"), {
            classAdd: "res_home_tab_on",
            switchCall: function () {
                var idMenuChan = "intMapMenuChan", eleMenuChan = $(idMenuChan), idMenuMap = "intMapMapInf", eleMenuMam = $(idMenuMap);
                if (this.attr("rel") === idMenuChan && eleMenuChan && self.resId !== self.eleFoodBox.retrieve("resid")) {
                    self.eleFoodBox.load(self.eleFoodBox.attr("data-url") + "?resid=" + self.resId);
                } else if (this.attr("rel") === idMenuMap && eleMenuMam && !eleMenuMam.retrieve("loaded")) {
                    if (!window.o) {
                        funGeoMap();
                    }
                    eleMenuMam.store("loaded", true);
                }
            }
        });
        return this;
    },
    funSearch: function () {
        var eleBox = this.eleSchBox, htmlLoad = this.htmlLoading;
        $$(".searchSubmit").each(function (btn) {
            var eleForm = btn.getParents("form")[0];
            if (eleForm) {
                eleForm.getElements("input[type=text]").addEvent("keyup", function (e) {
                    if (e.key === "enter") {
                        btn.fireEvent("click");
                    }
                    e.stop();
                });

                btn.addEvent("click", function () {
                    var action = eleForm.attr("action");
                    if (!this.retrieve("disabled")) {
                        eleBox.html(htmlLoad).load(action + (/\?/.test(action) ? "&" : "?") + eleForm.toQueryString());
                    }
                    return false;
                });
            }
        });

        return this;
    },
    funResInfLoad: function (element) {
        var eleResInfBox = this.eleResInf, eleTabInf = $$("li[rel=intMapResInf]")[0], eleTabFood = $$("li[rel=intMapMenuChan]")[0];
        var resId = element.attr("data-id"), type = element.attr("data-type"), longitude = element.attr("data-longitue"), latitude = element.attr("data-latitude"), zpcy = element.attr("data-zpcy");
        var vMobile = $$("#custTel").val().join(), urlLoad = INETURL[type] + "?resId=" + resId + "&Mobile=" + vMobile + "&zpcy=" + zpcy;


        if (eleResInfBox && type && resId) {
            eleResInfBox.html(this.htmlLoading).load(urlLoad).attr("data-url", urlLoad);
            this.resId = resId;
            //如果是菜谱频道，open餐厅信息选项卡
            if (eleTabFood && eleTabInf && eleTabFood.hasClass("res_home_tab_on")) {
                eleTabInf.fireEvent("click");
            }
        }
        if (!window.o) {
            funGeoMap();
        }
        if (window.o) {
            //移除所有原有锚点
            o.removeMarkers();
            //添加原有锚点
            if (this.g_LonLatArray && this.g_LonLatArray.length > 0) {
                for (var i = 0; i < this.g_LonLatArray.length; i++) {
                    if (longitude && this.g_LonLatArray[i][0] != longitude && this.g_LonLatArray[i][1] != latitude) {
                        o.addMarker(this.g_LonLatArray[i][0], this.g_LonLatArray[i][1]);
                    }
                }
            }
            //添加新锚点
            if (longitude) {
                o.addMarker(longitude, latitude, 'red');
                if (this.g_LonLatArray) {
                    this.g_LonLatArray[this.g_LonLatArray.length] = [longitude, latitude];
                }
            }
        }
        return this;
    },
    funSearchEvent: function () {
        var self = this, eleTable = $(this.idSchTable), eleSchBox = this.eleSchBox, cl = "int_map_tr_focus";

        //排序
        var eleSortBtn = $("priceSortBtn"), arrPrice = [];

        if (eleTable && eleSchBox) {
            eleTable.getElements("tr").each(function (tr, index) {
                var eleTdPrice = tr.getElement(".forPriceSort"), arrTdPrice = eleTdPrice && eleTdPrice.txt().match(/\d+/g);
                if (arrTdPrice) {
                    //数组存储价格，排序用
                    arrPrice.push(arrTdPrice + "|" + index);
                }

                tr.addEvents({
                    click: function () {
                        if (!this.hasClass(cl)) {
                            $$("." + cl).removeClass(cl);
                            this.addClass(cl);
                            self.funResInfLoad(this);
                        }
                    }
                });

                if (index === 0) {
                    tr.attr("id", "searchTrFirst").getElements("th").each(function (th) {
                        th.w(th.w() - 10);
                    });
                    tr.css({
                        position: "absolute",
                        top: eleSchBox.getPosition().y + 12,
                        marginLeft: -1,
                        backgroundColor: "#bbb"
                    });
                }

                // 第一个td有hover关键字提示
                var eleTdFirsts = tr.getElements("td");
                if (eleTdFirsts) {
                    eleTdFirsts.each(function (eleTdFirst) {
                        $powerFloat(eleTdFirst, {
                            hoverHold: false,
                            targetMode: "other",
                            targetAttr: "data-key",
                            reverseSharp: true,
                            position: "6-8",
                            container: "plugin"
                        });
                    });
                }
            });

            //排序
            if (eleSortBtn) {
                eleSortBtn.addEvent("click", function () {
                    var typeSort = this.attr("data-sort"), textSort = this.txt(), htmlSort = '';

                    if (!typeSort) {
                        //默认第一次，按降序处理
                        arrPrice.sort(function (a, b) {
                            return a.toInt() - b.toInt();
                        });

                        this.attr("data-sort", "reserver");
                        this.txt(textSort + "↓");
                    } else {
                        //其余反向排序
                        arrPrice.reverse();
                        if (textSort.test("↓")) {
                            this.txt(textSort.replace("↓", "↑"));
                        } else {
                            this.txt(textSort.replace("↑", "↓"));
                        }
                    }

                    //tr标签HTML字符数组
                    var arrHtmlTrs = eleTable.html().match(/<tr(?:.|\n|\r|\s)*?tr>/gi);

                    if (arrHtmlTrs) {
                        //标题
                        htmlSort = arrHtmlTrs[0];

                        arrPrice.each(function (price_index) {
                            htmlSort += arrHtmlTrs[price_index.split("|")[1].toInt()];
                        });

                        //载入HTML
                        eleTable.html(htmlSort);
                        //事件
                        self.funSearchEvent();
                    }
                });
            }
        }

        return this;
    },
    //载入查询的用户信息事件
    funEventCustInf: function () {
        var eleTelInput = $("custTel"), eleCustBtn = $("intMapCustBtn"), eleCustBox = this.eleCustBox, eleIframeBtn = $("custInfBtn");
        if (eleCustBtn && eleTelInput && eleCustBox) {
            eleCustBtn.addEvent("click", function () {
                if ($isEmpty(eleTelInput)) {
                    $testRemind(eleTelInput, "尚未输入客户手机号");
                    eleTelInput.focus();
                } else if (!$isRegex(eleTelInput, "^\\d{11}$")) {
                    $testRemind(eleTelInput, "手机号码格式不正确");
                    eleTelInput.focus();
                    eleTelInput.select();
                } else {
                    $testRemind.hide();
                    this.txt("查询中...");
                    var key = this.attr("data-key"), url = window.location.href.toLowerCase().split("#")[0].replace(new RegExp("[&,\?]" + key + "=[0-9]+"), "");
                    //改变页面地址
                    $pageFresh(url + (/\?/.test(url) ? "&" : "?") + key + "=" + eleTelInput.val().trim());
                }

                return false;
            });
            eleTelInput.addEvent("keyup", function (e) {
                if (e.key === "enter") {
                    eleCustBtn.fireEvent("click");
                }
                e.stop();
            });
        }
        if (eleIframeBtn) {
            eleIframeBtn.addEvent("click", function () {
                Mbox.open({
                    url: this.attr("href"),
                    type: "iframe",
                    ajax: true,
                    width: 800,
                    height: 600,
                    onClose: function () {
                        $pageFresh();
                    }
                });
                return false;
            });
        }
        return this;
    },

    //load餐厅信息后的些脚本
    funEventRes: function () {
        var eleSendBtn = $("intAddrMsgBtn"), elePicBtn = $("intPicViewBtn"), elePicBox = $("intPicViewBox"), eleScrollBox = $("resInfScrollBox"), self = this;
        var eleSubmitInfo = $("btnSubmitInfo");
        //相关餐厅
        var eleRelRes = $("intRelRes");
        if (eleRelRes) {
            eleRelRes.addEvent("click", function () {
                self.eleSchBox.html(self.htmlLoading).load(this.attr("data-url"));
                return false;
            });
        }
        //相似菜系
        var eleResStyle = $("intRelStyle");
        if (eleResStyle) {
            eleResStyle.addEvent("click", function () {
                self.eleSchBox.html(self.htmlLoading).load(this.attr("data-url") + "&distance=" + $$("#selSimailStyle").val());
                return false;
            });
        }


        //加载餐厅图片相关页面
        elePicBox.set("load", {
            onSuccess: function () {
                elePicBox.store("disLoaded", true);

                //图片绑定显示加载
                $lazyLoading($$(".jsLazyImage"), {
                    container: eleScrollBox
                });

                //图片选项卡
                $tabSwitch($$(".intResPicTab"), {
                    classAdd: "int_tab_on",
                    classRemove: "int_tab_a",
                    switchCall: function () {
                        eleScrollBox.fireEvent("scroll");
                    }
                });

                //点击查看大图
                $$(".mboxLargeImage").addEvent("click", function () {
                    Mbox.open({
                        url: this.attr("href"),
                        type: "image",
                        ajax: true,
                        title: this.txt()
                    });
                    return false;
                });

                //推图
                if (window.imagePushData) {
                    $$(".imagePushBtn").addEvent("click", function () {
                        var hashPush = new Hash(imagePushData[this.attr("data-id")]);
                        $loadScript(imagePushData.url + "?data=" + imagePushData[this.attr("data-id")], function () {
                            //请返回
                            $jsonHandle(imagePushData.json);
                        });
                        return false;
                    });
                }
                eleScrollBox.fireEvent("scroll");
            }
        });

        //短信发送
        if (eleSendBtn) {
            eleSendBtn.addEvent("click", function () {
                var eleResAddress = $$("#eleResAddress").val();
                var eleParking = $$("#eleParkingSMS").val();
                var vMobile = "";
                if ($("orderOrderTelInput")) {
                    vMobile = $$("#orderOrderTelInput").val();
                }
                else {
                    vMobile = self.mobile;
                }

                Mbox.open({
                    url: this.attr("data-url") + "&mobile=" + vMobile + "&Addr=" + eleResAddress + "&Park=" + eleParking,
                    ajax: true,
                    type: "ajax",
                    title: "发送地址短信"
                });

                return false;
            });
        }

        // 专题
        $$(".resSpeAddBtn").addEvent("click", function () {
            Mbox.open({
                url: this.attr("data-url"),
                ajax: true,
                type: "ajax"
            });
        });

        $$(".buyCashLink").addEvent("click", function () {
            var vMobile = "";
            var eleTel = $("orderOrderTelInput");
            if (eleTel) {
                vMobile = eleTel.val();
            } else {
                vMobile = self.mobile;
            }
            window.open(this.attr("data-url") + "&mobile=" + vMobile);
        });

        if (eleSubmitInfo) {
            eleSubmitInfo.addEvent("click", function () {
                Mbox.open({
                    url: this.attr("data-url"),
                    ajax: true,
                    type: "ajax",
                    title: "提交信息"
                });
                return false;
            });
        }
        if (elePicBtn && elePicBox) {
            //图片的展开与收起
            $visibleToggle(elePicBtn, {
                showCall: function () {
                    this.txt("收起图片↑");
                    if (!elePicBox.retrieve("disLoaded")) {
                        elePicBox.load(this.attr("data-url"));
                    }
                },
                hideCall: function () {
                    this.txt("显示图片↓");
                }
            });
        }


        //特色菜选项卡
        $tabSwitch($$(".intSpeFoodTab"), {
            classAdd: "int_tab_on",
            classRemove: "int_tab_a"
        });

        //查看详细
        [$$(".dinTimeDetail"), $$(".dinRoomDetail")].each(function (elements) {
            Mbox.assign(elements, {
                type: "ajax",
                ajax: true
            });
        });

        //预订，连环，购买现金券几个动态链接
        var eleOrder = $("resOrderBtn"), eleConn = $("resConnBtn"), eleCash = $("resCashBtn"), eleNewOrder = $("newOrderBtn");
        if (eleOrder) {
            eleOrder.addEvent("click", function () {
                window.open(this.attr("data-url") + "?AdentityId=" + self.resId + "&uvid=" + self.uvid);
            });
        }
        if (eleNewOrder) {
            eleNewOrder.addEvent("click", function () {
                window.open(this.attr("data-url") + "?AdentityId=" + self.resId + "&uvid=" + self.uvid + "&zpcy=" + eleNewOrder.attr("data-zpcy"));
            });
        }
        if (eleConn) {
            eleConn.addEvent("click", function () {
                window.open(this.attr("data-url") + "?resid=" + self.resId + "&uvid=" + self.uvid);
            });
        }
        if (eleCash) {
            eleCash.addEvent("click", function () {
                window.open(this.attr("data-url") + "?resid=" + self.resId + "&mobile=" + self.mobile);
            });
        }

        // add on 2012-02-16 新的餐厅详细页脚本
        // 展开与收起
        $$(".resInfToggleBtn").each(function (btnToggle) {
            $visibleToggle(btnToggle, {
                attribute: "data-rel",
                showCall: function () {
                    this.html("收起↑");
                },
                hideCall: function () {
                    this.html("展开↓");
                }
            });
        });

        // 购买常规现金券
        //$$("#resCashBuyBtn").addEvent("click", function() {
        //			Mbox.open({
        //				url: this.attr("data-url"),
        //				type: "iframe",
        //				ajax: true,
        //				width: 800,
        //				height: 600
        //			});
        //			return false;	
        //		});

        // add by zhangxinxu 2012-6-12 点评
        var eleCommLoadBox = $("intCommLoadBox"), eleCommLoadBtn = $("intCommLoadBtn"), eleCommFavBox = null;
        // 是否是收藏选项卡
        var isFavTab = false, loadingHtml = '<div class="h20 pt20 pb20 loading"></div>';
        // 方法
        //删除与收藏
        var funFavDel = function (elements) {
            elements.addEvent("click", function () {
                var text = this.txt(), vtext = (text === "收藏") ? (isFavTab ? "删除" : "取消收藏") : "收藏";

                new AjaxPost(this, {
                    url: this.attr("data-url") + this.txt(),
                    callback: function () {
                        if (isFavTab) {
                            funFavLoad();
                        } else {
                            this.html(vtext);
                        }
                    } .bind(this)
                }).send();
                return false;
            });
        }, funFavLoad = function () {
            if (eleCommFavBox) {
                eleCommFavBox.html(loadingHtml).load(eleCommFavBox.attr("data-url") + "&rand=" + $time());
            }
        }, funCommMbox = function (elements) {
            elements.each(function (element) {
                element.addEvent("click", function () {
                    var object = {
                        url: this.attr("data-url"),
                        ajax: true,
                        type: "ajax"
                    };
                    Mbox.open({
                        url: this.attr("data-url"),
                        ajax: true,
                        type: "ajax"
                    });
                    return false;
                });
            });
        }, funPageLoad = function (box) {
            box.getElements(".page_able").addEvent("click", function () {
                box.html(loadingHtml).load(this.attr("href"));
                return false;
            });
        };

        if (eleCommLoadBox && eleCommLoadBtn) {
            eleCommLoadBox.set("load", {
                onSuccess: function () {
                    eleCommLoadBtn.retrieve("hasLoaded", true);

                    $$(".intCommKind").each(function (tabLoadBox) {
                        tabLoadBox.set("load", {
                            onSuccess: function () {
                                funFavDel(tabLoadBox.getElements(".intCommFavDel"));
                                funCommMbox(tabLoadBox.getElements(".intCommBgHover"));
                                funPageLoad(tabLoadBox);
                            }
                        });
                        funPageLoad(tabLoadBox);
                    });

                    eleCommFavBox = $("intCommKindFav");

                    // 一些事件方法等
                    // 选项卡
                    $tabSwitch($$(".intCommTab"), {
                        classRemove: "int_tab_a",
                        classAdd: "int_tab_on",
                        switchCall: function (box) {
                            if (isFavTab = this.html().test("收藏")) {
                                funFavLoad();
                            }
                        }
                    });

                    // 删除与收藏
                    funFavDel($$(".intCommFavDel"));
                    // 评论详情弹框
                    funCommMbox([$$(".intCommBgHover"), $$(".intCommSendBtn")]);
                }
            });
            eleCommLoadBtn.addEvent("click", function () {
                if (!this.retrieve("hasLoaded")) {
                    eleCommLoadBox.html(loadingHtml).load(eleCommLoadBox.attr("data-url"));
                }
            });
        }

        // hover显示浮动
        var funHoverFloat = function (element) {
            element.each(function (eleHover) {
                $powerFloat(eleHover, {
                    showDelay: 210,
                    targetMode: "ajax",
                    targetAttr: "data-url",
                    position: "6-8"
                })
            });
        };

        funHoverFloat($$(".resInfHoverFloat"));

        // hover显示tip
        var funHoverTip = function (element) {
            element.each(function (eleHover) {
                $powerFloat(eleHover, {
                    hoverHold: false,
                    targetMode: "tip",
                    //reverseSharp: true,
                    targetAttr: "data-tip",
                    position: "1-4"
                })
            });
        };
        funHoverTip($$(".resInfHoverTip"));

        // 网友印象
        (function () {
            var eleImpInput = $("intSendImpInput"), eleImpBtn = $("intSendImpBtn"),
				eleXmsLoad = $("xmsImpressLoadBox"), eleUserLoad = $("userImpressLoadBox");

            var funXmsLoad = function () {
                eleXmsLoad.load(eleXmsLoad.attr("data-url"));
            }, funUserLoad = function () {
                eleUserLoad.load(eleUserLoad.attr("data-url"));
            };

            var funAddOrDelOrTop = function () {
                ["intImpOptBtn", "impTopTrigger"].each(function (cl) {
                    $$("." + cl).addEvent("click", function () {
                        new AjaxPost(this, {
                            url: this.attr("data-url"),
                            callback: function () {
                                funXmsLoad();
                            }
                        }).send();
                        return false;
                    }).removeClass(cl);
                });

            }, funTipAndAgree = function (elements) {
                funHoverTip((elements || $$(".impTipTrigger")).addEvent("click", function () {
                    Mbox.confirm("确认赞同此印象？", function () {
                        new AjaxPost(this, {
                            url: this.attr("data-url"),
                            callback: function () {
                                funUserLoad();
                            }
                        }).send();
                        Mbox.close();
                    } .bind(this));
                    return false;
                }));

                // 更多
                if (!elements) {
                    $powerFloat($$(".intImpressMore"), {
                        eventType: "click",
                        targetMode: "ajax",
                        targetAttr: "data-url",
                        position: "3-2",
                        zIndex: 18,
                        //edgeAdjust: false,
                        showCall: function (target) {
                            funTipAndAgree(target.getElements(".impTipTrigger"));
                            funAddOrDelOrTop();
                        }
                    });
                }

            };

            funAddOrDelOrTop();
            funTipAndAgree();

            if (eleImpBtn && eleImpInput && eleXmsLoad && eleUserLoad) {
                eleXmsLoad.set("load", {
                    onSuccess: function () {
                        funAddOrDelOrTop();
                    }
                });
                eleUserLoad.set("load", {
                    onSuccess: function () {
                        funAddOrDelOrTop();
                        funTipAndAgree();
                    }
                });

                eleImpBtn.addEvent("click", function () {
                    if ($verifyRefer.funTestName(eleImpInput, true, "餐厅印象")) {
                        new AjaxPost(this, {
                            url: this.attr("data-url"),
                            data: (function () { var data = {}; data[eleImpInput.name] = eleImpInput.val(); return data; })(),
                            callback: function () {
                                // 刷新	
                                funXmsLoad();
                                funUserLoad();

                                eleImpInput.val("");
                            }
                        }).send();
                    }
                    return false;
                });
                // 回车
                $enterEvent(eleImpInput, eleImpBtn);

                // 默认加载
                funXmsLoad();
                funUserLoad();
            }
        })();

        return this;
    },

    //页面键盘事件的响应
    funDocKey: function () {
        var clFocus = "int_map_tr_focus", clHover = "int_map_tr_hover", idTable = this.idSchTable;
        document.addEvent("keyup", function (e) {
            var eleTable = $(idTable), eleTrs = $$("." + clHover)[0] || $$("." + clFocus)[0], eleTarget;
            if (eleTable && eleTrs) {
                if (e.key === "down") {
                    eleTarget = eleTrs.getNext();
                } else if (e.key === "up") {
                    eleTarget = eleTrs.getPrevious();
                } else if (e.key === "enter") {
                    eleTrs.fireEvent("click");
                }
                if (eleTarget) {
                    eleTrs.removeClass(clHover);
                    eleTarget.addClass(clHover);
                }
            }
            e.stop();
        });
        document.oncontextmenu = function () {
            return false;
        };
        return this;
    },

    //搜索餐厅列表的筛选功能
    funKeyFilter: function () {
        var self = this;
        var eleInput = $("schKeyWordInput"), eleFilterBtn = $("schFilterBtn"), eleRecoverBtn = $("schRecoverBtn"), eleTable = $(self.idSchTable);
        //处理后的数据，分隔HTML与普通文字的正则表达式，用户输入的过滤关键字
        var arrDealed = [], regTags = /[^<>]+|<(\/?)([A-Za-z]+)([^<>]*)>/g, arrKeys = [];
        var thHtml = this.arrHtmlTitle[0];
        if (eleInput && eleFilterBtn && eleTable) {
            $autoRemind(eleInput);
            eleFilterBtn.addEvent("click", function () {
                if ($isEmpty(eleInput)) {
                    $testRemind(eleInput, "尚未输入查找关键字", true);
                    eleInput.focus();
                } else {
                    arrDealed = [];
                    arrKeys = eleInput.val().trim().split(" ");
                    //HTML分组
                    self.arrHtmlSearch.each(function (htmlTr, indexTr) {
                        //tr HTML分离成标签（不参与匹配）和普通文字	
                        var arrSpliteHtml = htmlTr.match(regTags), flagPush = 0;
                        //分离的数组再处理
                        arrSpliteHtml.each(function (parts, indexPart) {
                            var flagTest = 0;
                            //如果是非标签
                            if (!/<(?:.|\s)*?>/.test(parts)) {
                                //开始执行替换
                                arrKeys.each(function (key) {
                                    if (key) {
                                        var regKey = new RegExp(key.escapeRegExp(), "g");
                                        if (regKey.test(parts)) {
                                            parts = parts.replace(regKey, '<span class="inet_mark">' + key + '</span>');
                                            flagTest = 1;
                                        }
                                    }
                                });
                            }
                            arrSpliteHtml[indexPart] = parts;
                            if (flagTest) {
                                flagPush = 1;
                            }
                        });
                        if (flagPush) {
                            //分离的片段们重新组合成tr字符串，塞入数据中
                            arrDealed.push(arrSpliteHtml.join(""));
                        }
                    });

                    //如果有匹配
                    if (arrDealed.length) {
                        eleTable.html(thHtml + arrDealed.join(""));
                        self.funSearchEvent();
                    } else {
                        eleTable.html('<tr><td height="200">没有匹配结果</td></tr>');
                    }
                }
                return false;
            });
            //回车
            $enterEvent(eleInput, eleFilterBtn);

            eleRecoverBtn.addEvent("click", function () {
                eleTable.html(thHtml + self.arrHtmlSearch.join(""));
                self.funSearchEvent();
                return false;
            });

        }
        return this;
    },

    funEventAimSel: function () {
        var eleSel1 = $("intMapFavSel1"), eleSel2 = $("intMapFavSel2"), eleBtn = $("intMapFavOrDel");

        if (eleSel1 && eleSel2 && eleBtn) {
            $funSelectAjax(eleSel1, eleSel2);
            eleSel1.addEvent("change", function () {
                var textSelected = this.getSelected().txt().join();
                if (/收藏/.test(textSelected)) {
                    eleBtn.val("删除");
                } else {
                    eleBtn.val("收藏");
                }
            });

            eleBtn.addEvent("click", function () {
                var data = {}, value = this.val();
                data[eleSel2.name] = eleSel2.val();
                data[this.name] = value;

                new AjaxPost(this, {
                    url: this.attr("data-url"),
                    text: "处理中...",
                    data: data,
                    callback: function (json) {
                        if (value === "删除") {
                            eleSel2.getSelected().dispose();
                        }
                    }
                }).send();
            });
        }
        return this;
    },


    funEventTime: function () {
        var self = this;
        var eleTimeInputs = $$(".timeInputAuto"), eleDinNums = $$(".dinInputNum"), eleSaveBtn = $("intMapQuesBtn"), lenTimeInput = eleTimeInputs.length;
        var funNumJudge = function (element) {
            var vMax = element.attr("max").toInt(), vMin = element.attr("min").toInt(), val = Number(element.val().trim());
            if (val > vMax || val < vMin || (!val && val !== 0)) {
                $testRemind(element, "请输入合适范围的数值", true);
                if (element.val().trim()) {
                    element.select();
                }
                return false;
            } else {
                $testRemind.hide();
                return true;
            }
        };

        var funResInfReload = function () {
            //触发修改事件
            var timeQuery = eleTimeInputs[0].getParent().toQueryString();
            // 现在修改为整体(2012-3-2)刷新
            var urlLoad = self.eleResInf.attr("data-url");
            if (urlLoad) {
                self.eleResInf.html(self.htmlLoading).load(urlLoad + "&" + timeQuery);
            }
        };

        //时间选择器
        //日期选择
        var eleMapDateBox = $("intMapDateBox");
        var funMapDate = function (element, date) {
            if (element) {
                $calenderPicker(element, function (year, month, date) {
                    if (month < 10) {
                        month = "0" + month;
                    }
                    if (date < 10) {
                        date = "0" + date;
                    }
                    eleTimeInputs[0].val(year);
                    eleTimeInputs[1].val(month);
                    eleTimeInputs[2].val(date);

                    funResInfReload();
                }, date);
            }
        };
        funMapDate(eleMapDateBox, self.nowDate);


        var timerInfFresh;
        eleTimeInputs.each(function (input, index) {
            input.store("index", index).addEvents({
                "click": function () {
                    this.select();
                },
                "change": function () {
                    funNumJudge(this);
                },
                "keyup": function (e) {
                    var index = this.retrieve("index"), numMax = this.attr("data-length").toInt(), lenVal = this.val().trim().length;

                    clearTimeout(timerInfFresh);
                    if ((e.code > 48 && e.code < 57) || (e.code > 96 && e.code < 105) || e.key === "backspace" || e.key === "delete") {
                        if (lenVal === numMax && funNumJudge(this)) {
                            // 不是最后一个日期输入框
                            if (index !== lenTimeInput - 1) {
                                // 防止按键过快，直接跳到下下个文本框
                                setTimeout(function () {
                                    eleTimeInputs[index + 1].fireEvent("click");
                                }, 100);

                                // 2012-04-24 修改为按键直接刷新
                                timerInfFresh = setTimeout(funInputInfLoad, 500);
                            } else {
                                if (eleDinNums[0]) {
                                    eleDinNums[0].focus();
                                    eleDinNums[0].select();
                                }
                                return false;
                            }
                        }
                    }
                }
            });

            // 2012-04-24 修改为按键直接刷新
            var funInputInfLoad = function () {
                //console.log("load");
                // 时间刷新
                var dateTime = Date.parse(new Elements([eleTimeInputs[1], eleTimeInputs[2], eleTimeInputs[0]]).val().join("/"));
                funMapDate(eleMapDateBox, new Date(dateTime));
                funResInfReload();
            };


            if (eleSaveBtn) {
                eleSaveBtn.addEvent("click", function () {
                    var flagSubmit = true;
                    [eleTimeInputs, eleDinNums].each(function (elements) {
                        elements.each(function (input) {
                            if (flagSubmit) {
                                flagSubmit = funNumJudge(input);
                            }
                        });
                    });
                    if (flagSubmit) {
                        $formSubmit(this, {
                            text: "保存中...",
                            callback: function () {
                                //当前选项卡下再次查询，如果已经有搜索内容，记录滚动高度
                                var eleNavOn = $$(".int_nav_on")[0],
									eleNavRef = eleNavOn && $(eleNavOn.attr("rel")),
									eleSubmit = eleNavRef && eleNavRef.getElement(".searchSubmit"),
									eleScroll = self.eleSchBox.getElement("." + self.clScroll);

                                if (eleScroll) {
                                    self.eleSchBox.store("scroll", eleScroll.getScroll().y);
                                }
                                if (eleSubmit) { eleSubmit.fireEvent("click"); }
                            }
                        });
                    }
                });
            }
        });
        return this;
    },

    funEventFood: function () {
        var eleFoodBox = this.eleFoodBox, id = this.resId, htmlLoad = this.htmlLoading;
        if (eleFoodBox) {
            $$("a[name=resChoLink]").addEvent("click", function () {
                eleFoodBox.html(htmlLoad);
                eleFoodBox.load(eleFoodBox.attr("data-url") + this.attr("href"));
                return false;
            });
        }
        return this;
    },

    funEventMap: function () {
        //地图城市切换
        var eleSelCity = $("mapCityChange"), eleCityInput = $("mapCityInput"), arrCityList = [];
        if (eleSelCity) {
            eleSelCity.addEvent("change", function () {
                var urlAjax = this.val(), key = this.attr("data-freshkey"), href = window.location.href;
                if (urlAjax && key) {
                    href = href.toLowerCase().replace(new RegExp("[&,\?]" + "cityid" + "=[0-9]+"), "").replace("&tabmap=1", "");
                    if (href === href.replace(key, "")) {
                        if (/\?/.test(href)) {
                            href = href + "&" + key;
                        } else {
                            href = href + "?" + key;
                        }
                    }
                    new AjaxPost(this, {
                        url: urlAjax,
                        callback: function () {
                            $pageFresh(href);
                        }
                    }).send();
                }
            });
            arrCityList = eleSelCity.getElements("option").txt();
        }


        if (eleCityInput && eleSelCity) {
            eleCityInput.addEvents({
                "keyup": function (e) {
                    if (e.key === "enter" && $verifyRefer.funTestName(this, true, "切换城市")) {
                        /*var indexCity = arrCityList.indexOf(this.val());
                        if (indexCity === -1) {
                        $testRemind(this, "没有匹配到对应的城市", true);
                        setTimeout($testRemind.hide, 2000);
                        } else {
                        eleSelCity.getElements("option")[indexCity].attr("selected", "selected");
                        eleSelCity.fireEvent("change");
                        }*/
                        new AjaxPost(this, {
                            url: this.attr("data-url") + this.val(),
                            callback: function (json) {
                                if (json.html) {
                                    if (json.html.split('^')[0] == "true") {
                                        Mbox.open({
                                            url: json.html.split('^')[1],
                                            type: "string",
                                            onShow: function () {
                                                var eleOn = null, eleOk = $("mapCityOkBtn"), eleNo = $("mapCityNoBtn"), clOn = "float_list_a_on";
                                                $$("#mapCityBox a").addEvents({
                                                    click: function () {
                                                        if (!this.hasClass(clOn)) {
                                                            if (eleOn) {
                                                                eleOn.removeClass(clOn);
                                                            }
                                                            this.addClass(clOn);
                                                            eleOn = this;
                                                            return false;
                                                        } else {
                                                            if (eleOk)
                                                                eleOk.fireEvent("click");
                                                        }
                                                    }
                                                });

                                                if (eleOk) {
                                                    eleOk.addEvent("click", function () {
                                                        if (eleOn) {
                                                            //有元素选中
                                                            var url = window.location.href.toLowerCase().split("#")[0].replace(new RegExp("[&,\?]" + "cityid" + "=[0-9]+"), "").replace("&tabmap=1", "").replace("?tabmap=1", "?");
                                                            //改变页面地址

                                                            $pageFresh(url + (/\?/.test(url) ? "&" : "?") + eleOn.attr("data_cityid"));
                                                        } else {
                                                            $testRemind(eleOk, "尚未选择条目");
                                                        }
                                                        return false;
                                                    });
                                                }
                                                if (eleNo) {
                                                    eleNo.addEvent("click", function () {
                                                        Mbox.close();
                                                        return false;
                                                    });
                                                }

                                            }
                                        });
                                    }
                                    else {
                                        var url = window.location.href.toLowerCase().split("#")[0].replace(new RegExp("[&,\?]" + "cityid" + "=[0-9]+"), "").replace("&tabmap=1", "").replace("?tabmap=1", "?");
                                        //改变页面地址

                                        $pageFresh(url + (/\?/.test(url) ? "&" : "?") + json.html);
                                    }
                                }
                            }
                        }).send();
                        e.stop();
                    }
                }
            });
        }


        ["mapPlace", "mapSearch", "mapGroup"].each(function (key) {
            //地图的搜索，位置已转移至左半区域，地理位置选项卡下
            var eleSchPlaceBtn = $$("#" + key + "SchBtn");
            var funPlaceDoSch = function () {
                eleSchPlaceBtn.store("disabled", false).fireEvent("click");
            };

            // 地图双击
            var elesPosSelOption = $$("#" + key + "Sel option"), eleSelPosOption = elesPosSelOption[elesPosSelOption.txt().indexOf("经纬度")];
            /*$$("#intMapMapInf").addEvent("dblclick", function() {
            $$("a[rel=intMapSchLocal]").fireEvent("click");
            var newCenterPos = window.forGetLonLatAddByZxx || o.centerPos.lon || {};
            $$("#mapPlaceIpt").val([newCenterPos.lon, newCenterPos.lat].join());
            $$("#latitude").val(o.centerPos.lat);
            $$("#longitude").val(o.centerPos.lon);
            if (eleSelPosOption) {
            eleSelPosOption.attr("selected", "selected");
            }
            });*/



            var eleMapSchIpt = $(key + "Ipt"), eleMapSchSel = $(key + "Sel"), eleMapSchBtn = $(key + "Btn");
            var eleTrigger = eleMapSchBtn || eleMapSchIpt;
            if (eleMapSchIpt && eleMapSchSel && eleTrigger) {
                if (!eleMapSchBtn) {
                    new Elements([eleMapSchIpt, eleMapSchSel]).addEvent("change", function () {
                        eleSchPlaceBtn.store("disabled", true)
                    });
                }

                eleTrigger.addEvent((eleMapSchBtn ? "click" : "custom"), function () {
                    if ($isEmpty(eleMapSchIpt)) {
                        if (eleMapSchBtn) {
                            $testRemind(eleMapSchIpt, "尚未输入要查询内容", true);
                            eleMapSchIpt.focus();
                        } else {
                            //执行搜索, 状态还原
                            funPlaceDoSch();
                        }
                    } else if (eleSelPosOption && eleSelPosOption.attr("selected")) {
                        //执行搜索
                        funPlaceDoSch();
                    } else {
                        Mbox.open({
                            url: eleMapSchSel.val() + eleMapSchIpt.val().trim(),
                            ajax: "true",
                            type: "ajax",
                            title: "查询结果，可双击选择",
                            onShow: function () {
                                var eleOn = null, eleOk = $("mapSchOkBtn"), eleNo = $("mapSchNoBtn"), clOn = "float_list_a_on";
                                $$("#mapSchResBox a").addEvents({
                                    click: function () {
                                        var longitude = this.attr("data-longitue"), latitude = this.attr("data-latitude");
                                        if (this.hasClass(clOn)) {
                                            eleMapSchIpt.val(this.txt().replace("--", "，"));
                                            if (longitude) {
                                                if (!eleMapSchBtn) {
                                                    //打开地图选项卡
                                                    $$("li[rel=intMapMapInf]").fireEvent("click");
                                                    // 标注经纬度
                                                    o.addMarker(longitude, latitude, 'red');
                                                    //将经纬度塞入隐藏文本框
                                                    $$(".latitude").val(latitude);
                                                    $$(".longitude").val(longitude);
                                                    //执行搜索, 状态还原
                                                    funPlaceDoSch();
                                                }
                                            }
                                            if (eleNo) { eleNo.fireEvent("click"); }
                                        } else {
                                            if (eleOn) {
                                                eleOn.removeClass(clOn);
                                            }
                                            this.addClass(clOn);
                                            eleOn = this;
                                        }
                                    }
                                });

                                if (eleOk) {
                                    eleOk.addEvent("click", function () {
                                        if (eleOn) {
                                            //有元素选中
                                            eleOn.fireEvent("click");
                                        } else {
                                            $testRemind(eleOk, "尚未选择条目");
                                        }
                                        return false;
                                    });
                                }
                                if (eleNo) {
                                    eleNo.addEvent("click", function () {
                                        Mbox.close();
                                        return false;
                                    });
                                }
                            }
                        });
                    }
                });
                //回车
                if (eleMapSchBtn) {
                    $enterEvent(eleMapSchIpt, eleMapSchBtn);
                } else {
                    //按钮
                    eleSchPlaceBtn.store("disabled", true).addEvent("click", function () {
                        if (this.retrieve("disabled")) {
                            eleMapSchIpt.fireEvent("custom");
                        }
                        return false;
                    });
                }
            }
        });

        return this;
    },

    //选菜相关方法
    funFoodMenu: function () {
        var self = this, eleIpt = $("menuSearchIpt"), eleBtn = $("menuSearchBtn"), eleBox = this.eleFoodBox, resId = this.resId;
        if (eleIpt && eleBtn) {
            $autoRemind(eleIpt);
            eleBtn.addEvent("click", function () {
                if ($isEmpty(eleIpt)) {
                    $testRemind(eleIpt, "尚未输入搜索内容", true);
                    eleIpt.focus()
                } else {
                    self.eleFoodBox.html(self.htmlLoading);
                    self.eleFoodBox.load(self.eleFoodBox.attr("data-url") + "?resid=" + self.resId + "&" + this.attr("name") + "=" + eleIpt.val().trim());
                }
                return false;
            });
            //回车
            $enterEvent(eleIpt, eleBtn);
        }


        return this;
    },

    init: function () {
        //加载订单详情，现金券详情
        if (this.eleDetailBox) {
            this.eleDetailBox.set("load", {
                onSuccess: function () {
                    var self = this;
                    //点击显示餐厅信息
                    $$(".tdLoadResInf").addEvent("click", function () {
                        self.funResInfLoad(this);
                    });
                    if (self.resId) {
                        self.funResInfLoad($$(".alinkLoadResInf"));
                    }
                } .bind(this)
            });
            this.eleDetailBox.load(this.eleDetailBox.attr("data-url"));
        }

        //用户信息查询载入
        //if (this.eleCustBox) {
        //	this.eleCustBox.set("load", {
        //		onSuccess: function() {
        //			this.funEventCustInf();
        //		}.bind(this)
        //	});	
        //}
        //搜索box绑定load回调
        if (this.eleSchBox) {
            this.eleSchBox.set("load", {
                onSuccess: function (a, b, html) {
                    //IE6下的最大高度
                    if ($isIe6) {
                        if (this.eleSchBox.h() > 400) {
                            this.eleSchBox.h(400);
                        } else {
                            this.eleSchBox.h("auto");
                        }
                    }

                    this.funSearchEvent();
                    //过滤和还原
                    this.arrHtmlSearch = html.match(/<tr\s(?:.|\n|\r|\s)*?tr>/gi);
                    this.arrHtmlTitle = html.match(/<tr>(?:.|\n|\r|\s)*?tr>/gi) || [];
                    this.funKeyFilter();

                    // 是否关键字查询
                    var eleSchInput = $("schKeyWordInput"), searchKeyword = this.eleSchBox.retrieve("keyword");
                    if (eleSchInput) {
                        if (searchKeyword) {
                            eleSchInput.val(searchKeyword);
                            $$("#schFilterBtn").fireEvent("click");
                            this.eleSchBox.store("keyword", null);
                        } else {
                            //滚动
                            $$("." + this.clScroll).scrollTo(0, this.eleSchBox.retrieve("scroll") || 0);
                            this.eleSchBox.store("scroll", 0);
                        }
                    }

                } .bind(this)
            });
        }

        //餐厅信息载入回调
        if (this.eleResInf) {
            this.eleResInf.set("load", {
                onSuccess: function () {
                    //事件绑定
                    this.funEventRes();
                } .bind(this)
            });
        }

        //菜谱信息载入回调
        if (this.eleFoodBox) {
            this.eleFoodBox.set("load", {
                onSuccess: function () {
                    this.eleFoodBox.store("resid", this.resId);
                    //事件绑定
                    this.funEventFood();
                } .bind(this)
            });
        }

        this.funMenuTab().funEventCustInf().funSearch().funDocKey().funEventTime().funEventAimSel().funEventMap().funFoodMenu();

        $testRemind.bind();
        return this;
    }
};

//地图产生的回调
function selectRegion(data) {
    var dLeftLatitude = data.lbLat,
		dLeftLongitude = data.lbLon
    dRightLatitude = data.rtLat
    dRightLongitude = data.rtLon;

    var ajaxUrl = $inetMap.mapUrl || "SearchInfo.aspx", data = {
        Action: "SchMap",
        lLat: dLeftLatitude,
        lLong: dLeftLongitude,
        rLat: dRightLatitude,
        rLong: dRightLongitude
    };

    // 如果有关键字，把关键字内容也带上
    var eleTargetBox = $($$("a.int_nav_on").attr("rel").join()), eleInputKeyword = (eleTargetBox && eleTargetBox.getElement("input[data-type=keyword]"));
    if (eleInputKeyword && !$isEmpty(eleInputKeyword)) {
        data.Key = eleInputKeyword.val().trim();
    }

    if ($inetMap.eleSchBox) {
        //var eleSchInput = $("schKeyWordInput");
        //		if (eleSchInput && !$isEmpty(eleSchInput)) {
        //			$inetMap.eleSchBox.store("keyword", eleSchInput.val().trim());
        //		}
        $inetMap.eleSchBox.html($inetMap.htmlLoading).load(ajaxUrl + "?" + new Hash(data).toQueryString());
        var eleNav1 = $$(".menuSwitchIn[rel=intMapDefaultInf]");
        if (eleNav1[0] && eleNav1[0].hasClass("int_nav_on")) {
            $$("a[rel=intMapSchFixed]").fireEvent("click");
        }


    }
}


var $inetCall = {
    isBeforeCloseRemind: true,
    element: {
        resDetailBox: $("callResDetailBox"),
        orderRemindBox: $("callOrderRemindBox")
    },
    funLoadBind: function () {
        var eleOrderRemindBox = this.element.orderRemindBox;
        if (this.element.resDetailBox) {
            this.element.resDetailBox.set("load", {
                onSuccess: function () {
                    //加载完毕的事件
                    //查看详细
                    [$$(".dinTimeDetail"), $$(".dinRoomDetail")].each(function (elements) {
                        Mbox.assign(elements, {
                            type: "ajax",
                            ajax: true
                        });
                    });

                    //最早接线
                    var eleEarlyInput = $("dinEarlyTimeInput"), eleEarlyBtn = $("dinEarlyTimeBtn");
                    if (eleEarlyBtn && eleEarlyInput) {
                        eleEarlyBtn.addEvent("click", function () {
                            var data = {};
                            if ($verifyRefer.funTestName(eleEarlyInput, true, "接线时间")) {
                                data[eleEarlyInput.name] = eleEarlyInput.val().trim();
                                new AjaxPost(this, {
                                    url: this.attr("data-url"),
                                    data: data,
                                    callback: function () {
                                        if (window.screenX) {
                                            //IE6 ~ IE8
                                            this.html("已保存").swapClass("int_yellbtn", "int_graybtn");
                                        }
                                    } .bind(this)
                                }).send();
                            }
                            return false;
                        });
                    }
                    //回车
                    $enterEvent(eleEarlyInput.addEvent("input", function () {
                        //IE6~8不支持
                        eleEarlyBtn.html("保存").swapClass("int_graybtn", "int_yellbtn");
                    }), eleEarlyBtn);
                }
            });
        }
        if (eleOrderRemindBox) {
            eleOrderRemindBox.set("load", {
                onSuccess: function () {
                    //加载完毕的事件	
                    //提醒的的保存或删除操作
                    $$(".callRemEditBtn").addEvent("click", function () {
                        $formSubmit(this, {
                            text: "修改中..."
                        });
                        return false;
                    });
                    //删除
                    $$(".callRemDelBtn").addEvent("click", function () {
                        var self = this;
                        Mbox.confirm("确认删除该提醒？", function () {
                            Mbox.close();
                            //发送请求
                            new AjaxPost(self, {
                                url: self.attr("data-url"),
                                callback: function () {
                                    var eleTarget = $(self.attr("data-rel"));
                                    if (eleTarget) {
                                        eleTarget.set("tween", {
                                            onComplete: function () {
                                                eleTarget.dispose();

                                                if (!$$(".callRemDelBtn").length) {
                                                    eleOrderRemindBox.html('<div class="p20 tc">暂无提醒。</div>');
                                                }
                                            }
                                        }).fade("out");
                                    }
                                }
                            }).send();
                        });
                        return false;
                    });
                }
            });
        }
        return this;
    },
    funEventAddRemind: function () {
        var eleForm = $("callRemAddForm"), eleSubmit = $("callRemAddSubmit"),
			eleTimeBegin = $("callRemTimeBegin"), eleTimeEnd = $("callRemTimeEnd"),
			eleArea = $("callRemAddArea");

        var eleRemindBox = this.element.orderRemindBox, urlLoad = eleRemindBox && eleRemindBox.attr("data-url");

        if (eleForm && eleTimeBegin && eleTimeEnd && eleArea) {
            //时间选择器绑定
            new Datepicker(eleTimeBegin, eleTimeBegin);
            new Datepicker(eleTimeEnd, eleTimeEnd);

            eleForm.addEvent("submit", function () {
                $formSubmit(eleSubmit, {
                    callback: function () {
                        if (urlLoad) {
                            eleRemindBox.html('<div style="height:200px;" class="loading"></div>')
								.load(urlLoad + (urlLoad.test("\\?") ? "&" : "?") + "time=" + $time());
                        }
                    }
                });
                return false;
            });
        }

        return this;
    },
    //不处理
    funEventIgnore: function () {
        var self = this;
        var eleInput = $("callIgnoreInput"), eleBtnHide = $("callIgnoreHidden");
        if (eleBtnHide) {
            if (eleInput) {
                eleBtnHide.addEvent("click", function () {
                    var data = {};
                    if ($verifyRefer.funTestName(eleInput, true, "不处理原因")) {
                        self.isBeforeCloseRemind = false;
                        if ($("forceCloseAjaxUrl")) {
                            $("forceCloseAjaxUrl").val("");
                        }
                        data[eleInput.name] = eleInput.val().trim();
                        new AjaxPost(this, {
                            url: eleInput.attr("data-url"),
                            data: data
                        }).send();
                    }
                    return false;
                });
                //回车
                $enterEvent(eleInput, eleBtnHide);
            } else {
                eleBtnHide.addEvent("click", function () {
                    self.isBeforeCloseRemind = false;
                    if ($("forceCloseAjaxUrl")) {
                        $("forceCloseAjaxUrl").val("");
                    }
                    new AjaxPost(this, {
                        url: this.attr("data-url")
                    }).send();
                });
            }
        }

        //电话不通
        var eleBtnUncall = $("callIgnoreUncall"), eleSelUncall = $("callIgnoreSel");
        if (eleBtnUncall) {
            eleBtnUncall.addEvent("click", function () {
                var data = {};
                if ($verifyRefer.funTestName(eleSelUncall, true, "原因")) {
                    self.isBeforeCloseRemind = false;
                    if ($("forceCloseAjaxUrl")) {
                        $("forceCloseAjaxUrl").val("");
                    }
                    data[eleSelUncall.name] = eleSelUncall.val();
                    new AjaxPost(this, {
                        url: this.attr("data-url"),
                        data: data
                    }).send();
                }
                return false;
            });
        }

        //餐厅不营业
        //餐厅不营业
        var eleBtnClose = $("callIgnoreClose");
        if (eleBtnClose) {
            eleBtnClose.addEvent("click", function () {
                Mbox.open({
                    url: this.attr("data-url"),
                    ajax: true,
                    type: "ajax",
                    onShow: function () {
                        var eleForm = $("callTimeSetForm");
                        if (eleForm) {
                            eleForm.addEvent("submit", function () {
                                var eleBtn = this.getElement("input[type='submit']");
                                self.isBeforeCloseRemind = false;
                                if ($("forceCloseAjaxUrl")) {
                                    $("forceCloseAjaxUrl").val("");
                                }
                                $formSubmit(eleBtn, {
                                    text: "提交中..."
                                });
                                return false;
                            });

                            eleForm.getElements("input").addEvent("focus", function () {
                                setTimeout(function () {
                                    this.select();
                                } .bind(this), 50);
                            });

                            //新增的代码 开始
                            var eleInputs = eleForm.getElements("input");
                            eleInputs.each(function (eleTimeInput, index) {
                                if (eleTimeInput.attr("type") === "radio") {
                                    eleTimeInput.addEvent("click", function () {
                                        if (this.attr("id") === "callTimeSetWeek") {
                                            $$("#callTimeWeekHide").out();
                                        } else {
                                            $$("#callTimeWeekHide").into();
                                        }
                                    });
                                } else {
                                    if (eleTimeInput.attr("size") === "4") {
                                        eleTimeInput.addEvent("focus", function () {
                                            setTimeout(function () {
                                                this.select();
                                            } .bind(this), 30);
                                        });
                                    }
                                    eleTimeInput.addEvent("keyup", function () {
                                        var length = this.attr("size").toInt();
                                        if (length && this.val().trim().length === length && eleInputs[index + 1]) {
                                            setTimeout(function () {
                                                if (!eleInputs[index + 2]) {
                                                    eleInputs[index + 1].focus();
                                                }
                                                eleInputs[index + 1].select();
                                            }, 100);
                                        }
                                    });
                                }
                            });
                            //新增的代码 结束
                        }
                    }
                });
                return false;
            });
        }

        return this;
    },

    //订单列表
    funEventOrderList: function () {
        //列表右上角的展开收起
        var eleToggles = $$(".callToggleOperateArea");
        if (eleToggles.length) {
            $visibleToggle(eleToggles, {
                display: false,
                showCall: function () {
                    this.html(this.html().replace("展开", "收起"));
                },
                hideCall: function () {
                    this.html(this.html().replace("收起", "展开"));
                }
            });
            eleToggles[0].fireEvent("click");
        }

        //新增交互
        $$(".callContAddBtn").each(function (button) {
            var orderId = button.getParent("form").attr("data-orderid"),
				eleInput = $("callContAddInput_" + orderId),
				eleTable = $("callContAddTable_" + orderId);

            if (eleInput && eleTable) {
                button.addEvent("click", function () {
                    var data = {};
                    if ($verifyRefer.funTestName(eleInput, true, "新增交互")) {
                        data[eleInput.name] = eleInput.val().trim();
                        new AjaxPost(this, {
                            url: eleInput.attr("data-url"),
                            data: data,
                            text: "信息添加中...",
                            callback: function (json) {
                                var html = '<tr>' +
									'<td>' + (json.content || data[eleInput.name]) + '</td>' +
									'<td>' + (json.user || "&nbsp;") + '</td>' +
									'<td>' + (json.title || "&nbsp;") + '</td>' +
									'<td>' + (json.kind || "&nbsp;") + '</td>' +
									'<td>' + (json.kind2 || "&nbsp;") + '</td>' +
									'<td>' + (json.time || "&nbsp;") + '</td>' +
								  '</tr>';
                                eleTable.into().html("<tbody>" + html + eleTable.html().replace(/<tbody>/i, ""))
                                button.store("hasAddNewUx", true);
                                eleInput.val("");
                            }
                        }).send();
                    }
                });
                //回车
                $enterEvent(eleInput, button);
            }
        });

        //订单详情的展开与收起
        $visibleToggle($$(".callToggleOrderDetail"), {
            showCall: function (target) {
                this.html(this.html().replace("订单", "收起"));
                //ajax加载详情
                if (!target.retrieve("successLoaded")) {
                    target.set("load", {
                        onSuccess: function () {
                            target.store("successLoaded", true);
                        }
                    });
                    //尚未成功加载数据
                    target.load(target.attr("data-url"));
                }
            },
            hideCall: function () {
                this.html(this.html().replace("收起", "订单"));
            }
        });

        //订单状态的修改
        $$(".callOperatBtnBox").each(function (btnBox) {
            btnBox.store("isCallMoneyOk", false).getElements("a").addEvent("click", function () {
                if (this.attr("data-status") && this.attr("data-status") == "MayDead") {
                    if (!confirm("你确定客户疑似死单？如果你点击确定，将会自动向客户发送短信！"))
                        return;
                }

                var orderid = btnBox.getParent("form").attr("data-orderid");
                var eleForm = this.getParent("form");
                //定位信息
                var eleInfControl = $("callOrderInfControl_" + orderid), eleInfText = $("callOrderInfText_" + orderid), eleFailSel = $("callFailReasonSel_" + orderid);
                var arrInfText = [], isBtnFail = this.txt().test("失败");
                if (eleInfControl && eleInfText) {
                    var eleInfInput = eleInfControl.getElement("input"), eleInfArea = eleInfControl.getElement("textarea");

                    [eleInfInput, eleInfArea].each(function (control) {
                        var value = control && control.val().trim();
                        if (value) {
                            arrInfText.push(value);
                        }
                    });

                    if (!eleInfInput.val().trim().length) {
                        if (isBtnFail) {
                            $testRemind(eleInfInput, "必须在定位信息中输入定位失败原因！", true);
                        } else {
                            $testRemind(eleInfInput, "尚未输入定位信息", true);
                        }
                        eleInfInput.focus();
                        return;
                    } else {
                        eleInfText.html(arrInfText.join("，"));
                    }
                }

                //桌台号
                var eleCallDesk = eleForm.getElement(".callBackDeskNum");
                if (eleCallDesk && this.hasClass("int_greebtn") && !this.retrieve("isCallMoneyOk")) {
                    var valCallDesk = eleCallDesk.val().trim();
                    if (valCallDesk === "") {
                        $testRemind(eleCallDesk, "桌台号不能为空", true);
                        eleCallDesk.focus();
                        return false;
                    }
                }

                //回访金额
                var eleCallMoney = eleForm.getElement(".callBackMoneyNum");
                if (eleCallMoney && this.hasClass("int_greebtn") && !this.retrieve("isCallMoneyOk")) {
                    var valCallMoney = eleCallMoney.val().trim();
                    var valCallMoneyInt = parseInt(valCallMoney);
                    if (valCallMoney === "") {
                        $testRemind(eleCallMoney, "回访金额不能为空", true);
                        eleCallMoney.focus();
                    }
                    else if (isNaN(valCallMoneyInt) || valCallMoneyInt < 0) {
                        $testRemind(eleCallMoney, "请输入大于等于0的数值金额", true);
                        eleCallMoney.focus();
                        eleCallMoney.select();
                    }
                    else {
                        //回访金额范围判断
                        var num = valCallMoney.toInt(), numMax = eleCallMoney.attr("data-max").toInt(), numMin = eleCallMoney.attr("data-min").toInt(), remind = eleCallMoney.attr("data-remind");
                        if (num && (num < numMin || num > numMax)) {
                            Mbox.confirm(remind, function () {
                                this.store("isCallMoneyOk", true).fireEvent("click");
                                Mbox.close();
                            } .bind(this), function () {
                                $testRemind(eleCallMoney, "请输入合适数值", true);
                                eleCallMoney.val("").focus();
                            } .bind(this), {
                                onShow: function () {
                                    $testRemind.hide();
                                }
                            });
                            return false;
                        } else {
                            this.store("isCallMoneyOk", true);
                        }
                    }
                    return false;
                }
                this.store("isCallMoneyOk", false);

                //新增交互
                var eleAddNewUx = $("callContAddInput_" + orderid), eleAddNewUxBtn = eleForm.getElement(".callContAddBtn");

                if (eleAddNewUx && eleAddNewUxBtn && !this.hasClass("int_greebtn")) {
                    // 如果内容为空
                    if (eleAddNewUx.val().trim() === "") {
                        // 如果已经成功添加过交互, 不管
                        // 如果没有成功添加过
                        if (eleAddNewUxBtn.retrieve("hasAddNewUx") !== true) {
                            $testRemind(eleAddNewUx, "尚未输入该情形下的交互信息", true);
                            eleAddNewUx.focus();
                            return false;
                        }
                    } else {
                        // 失败原因
                        if (isBtnFail && eleFailSel && !$verifyRefer.funTestName(eleFailSel, true, "失败原因")) { return; }
                        // 如果有内容，直接添加	
                        eleAddNewUxBtn.fireEvent("click");
                    }
                }

                // 失败原因
                if (isBtnFail && eleFailSel && !$verifyRefer.funTestName(eleFailSel, true, "失败原因")) { return; }

                var elesBeHide = $$(".callOrderDealHide_" + orderid),
					elesBeShow = $$(".callOrderDealShow_" + orderid),
					elesInputHide = $$(".callDealInputHide_" + orderid);

                elesBeHide.hide();
                elesBeShow.show();
                elesInputHide.addClass("search_input");

                //回访时间按钮禁用
                eleForm.getElements(".callSetOrderTime").addClass("int_call_disable");

                //状态文字描述
                var eleStatusText = $("callStatusText_" + orderid), eleStatusInput = $("callStatusInput_" + orderid);

                if (eleStatusText && eleStatusInput) {
                    var arrClassChar = this.attr("data-class").split("|");

                    //状态值改变
                    eleStatusInput.val(this.attr("data-status"));

                    if (arrClassChar.length === 2) {
                        eleStatusText.html(arrClassChar[1] + this.html()).className = arrClassChar[0];
                    }
                }

                //是否显示短信
                var booMessage = this.attr("data-message");
                var bFailMessage = this.attr("data-failmsg");
                if (booMessage) {
                    var eleMsgHidden = $("callDinnerMsgHidden_" + orderid), valMegHidden = eleMsgHidden && eleMsgHidden.val();
                    if (valMegHidden) {
                        var nameMsgArea = valMegHidden.replace(/.*{(\w+)}.*/, "$1");
                        $$("textarea[name=" + nameMsgArea + "]").val(valMegHidden.replace("{" + nameMsgArea + "}", arrInfText.join("，")));
                    }

                    $$("#callMessageBox_" + orderid).into();
                    $$("#othercallMessageBox_" + orderid).into();
                } else if (bFailMessage) {
                    var eleMsgHidden = $("BookFailMsg_" + orderid), valMegHidden = eleMsgHidden && eleMsgHidden.val();
                    if (valMegHidden) {
                        //var nameMsgArea = valMegHidden.replace(/.*{(\w+)}.*/, "$1");
                        $$("textarea[name=BookAndRoomInfo_" + orderid + "]").val(valMegHidden.replace("****", arrInfText[0]));
                        $$("#callMessageBox_" + orderid).into();
                    }

                } else {
                    $$("#callMessageBox_" + orderid).out();
                }

                //整个样式修改
                $$("#callOrderListOuter_" + orderid).addClass("int_call_order_box_deal");

                return false;
            });
        });

        //返回上一状态
        $$(".callBackLastStatus").addEvent("click", function () {
            var orderid = this.getParent("form").attr("data-orderid");
            var elesBeHide = $$(".callOrderDealHide_" + orderid),
				elesBeShow = $$(".callOrderDealShow_" + orderid),
				elesInputHide = $$(".callDealInputHide_" + orderid),
				elecallBackMoneyNum = $$(".callBackMoneyNum");

            elesBeHide.show();
            elesBeShow.hide();
            elecallBackMoneyNum.val("");
            elesInputHide.removeClass("search_input");

            //回访按钮恢复
            this.getParent("form").getElements(".callSetOrderTime").removeClass("int_call_disable");
            $$("#BookAndRoomInfo_" + orderid).val("");
            $$("#othercallMessageBox_" + orderid).out();

            $$("#callMessageBox_" + orderid).out();
            $$("#callStatusInput_" + orderid).val("");
            //整个样式还原
            $$("#callOrderListOuter_" + orderid).removeClass("int_call_order_box_deal");
            return false;
        });

        //修改餐位情况，ajax
        $$(".callEditSeatInf").addEvent("click", function () {
            Mbox.open({
                url: this.attr("data-url"),
                type: "iframe",
                ajax: true,
                width: 790,
                height: 440,
                title: this.html()
            });
            return false;
        });

        //设置餐厅到达回访事件
        var eleTimeBtn = $("callCallTimeBtn"), eleTimeTxt = $("callCallTimeTxt"), self = this;
        if (eleTimeBtn) {
            eleTimeBtn.addEvent("click", function () {
                Mbox.open({
                    url: this.attr("data-url"),
                    ajax: true,
                    type: "ajax",
                    onShow: function () {
                        var eleForm = $("callTimeSetForm"), eleWeekRadio = $("callTimeSetWeek");
                        if (eleForm && eleWeekRadio) {
                            eleForm.addEvent("submit", function () {
                                var eleBtn = this.getElement("input[type='submit']"),
									eleHour = this.getElement("input[type='hour']"),
									eleMini = this.getElement("input[type='mini']");

                                self.isBeforeCloseRemind = false;

                                $formSubmit(eleBtn, {
                                    text: "提交中...",
                                    callback: function () {
                                        if (eleHour && eleMini && eleTimeTxt) {
                                            eleTimeTxt.html(eleHour.val().trim() + ":" + eleMini.val().trim());
                                        }
                                        Mbox.close();  //新增
                                    }
                                });

                                return false;
                            });


                            var eleInputs = eleForm.getElements("input");
                            eleInputs.each(function (eleInput, index) {
                                if (eleInput.attr("type") === "radio") {
                                    eleInput.addEvent("click", function () {
                                        if (this.attr("id") === "callTimeSetWeek") {
                                            $$("#callTimeWeekHide").out();
                                        } else {
                                            $$("#callTimeWeekHide").into();
                                        }
                                    });
                                } else {
                                    if (eleInput.attr("size") === "4") {
                                        eleInput.addEvent("focus", function () {
                                            setTimeout(function () {
                                                this.select();
                                            } .bind(this), 30);
                                        });
                                    }
                                    eleInput.addEvent("keyup", function () {
                                        var length = this.attr("size").toInt();
                                        if (length && this.val().trim().length === length && eleInputs[index + 1]) {
                                            setTimeout(function () {
                                                if (!eleInputs[index + 2]) {
                                                    eleInputs[index + 1].focus();
                                                }
                                                eleInputs[index + 1].select();
                                            }, 100);
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
                return false;
            });
        }

        //设置本单到达回访时间
        $$(".callSetOrderTime").each(function (eleTimeBtn) {
            var orderid = eleTimeBtn.getParent("form").attr("data-orderid");
            var eleInput = $("callSetOrderTimeIpt_" + orderid);

            if (eleInput) {
                eleTimeBtn.addEvent("click", function () {
                    var data = {};
                    if ($verifyRefer.funTestName(eleInput, true, "回访时间")) {
                        if (/[a-z]/i.test(eleInput.val())) {
                            $testRemind(eleInput, "时间格式有误", true);
                            eleInput.focus();
                            eleInput.select();
                            return false;
                        }
                        data[eleInput.name] = eleInput.val().trim();
                        new AjaxPost(this, {
                            url: eleInput.attr("data-url"),
                            data: data,
                            callback: function (json) {
                                eleInput.addClass("i");

                                var eleTable = $("callContAddTable_" + orderid);
                                if (eleTable) {
                                    var html = '<tr>' +
								    '<td>' + (json.content || "&nbsp;") + '</td>' +
								    '<td>' + (json.user || "&nbsp;") + '</td>' +
								    '<td>' + (json.title || "&nbsp;") + '</td>' +
								    '<td>' + (json.kind || "&nbsp;") + '</td>' +
								    '<td>' + (json.kind2 || "&nbsp;") + '</td>' +
								    '<td>' + (json.time || "&nbsp;") + '</td>' +
								    '</tr>';
                                    eleTable.into().html("<tbody>" + html + eleTable.html().replace(/<tbody>/i, ""));
                                }
                            }
                        }).send();
                    }
                    return false;
                });
                //回车
                $enterEvent(eleInput.addEvents({
                    "input": function () {
                        this.removeClass("i");
                    },
                    "focus": function () {
                        setTimeout(function () {
                            this.select();
                        } .bind(this), 50);
                    }
                }), eleTimeBtn);
            }
        });

        //回访金额回车事件
        $$(".callBackMoneyNum").each(function (input) {
            var eleForm = input.getParent("form"), eleBtn = eleForm && eleForm.getElement(".callOperatBtnBox .int_greebtn");
            if (eleBtn) {
                $enterEvent(input, eleBtn);
            }
        });

        return this;
    },

    //订单表单终极提交
    funEventOrderSubmit: function () {
        var eleOperater = $("callOrderOperater"), eleAllSubmit = $("callOrderAllSubmit"),
			classDisable = "int_call_disable", arrIndex = [], lengthSuccess, lengthFail;

        var self = this;

        var eleStatus = $("callSubmitMboxStatus"), eleBtn = $("callSubmitMboxBtn"), eleRem = $("callSubmitMboxRem"),
				elesForm = $$(".callOrderListForm");

        var funAjaxSubmit = function (eleForm, indexForm) {
            var eleStatus = $$("#callSubmitStatus_" + indexForm);

            new AjaxReq({
                url: eleForm.attr("action"),
                data: eleForm.toQueryString() + "&" + eleOperater.name + "=" + eleOperater.val().trim(),
                method: "post",
                onSuccess: function (json) {
                    if (json && json.succ) {
                        eleStatus.addClass("cg").html('√ 提交成功');

                        //订单相关状态改变
                        eleForm.addClass(classDisable);

                        lengthSuccess++;
                    } else {
                        eleStatus.addClass("co").html('×' + ((json && json.msg) || "提交失败"));
                        lengthFail++;
                    }
                    arrIndex.erase(indexForm);
                    funAjaxInfo();
                },
                onError: function () {
                    eleStatus.addClass("co").html('× 网络异常');
                    lengthFail++;
                    arrIndex.erase(indexForm);
                    funAjaxInfo();
                }
            }).send();
        }, funAjaxInfo = function () {
            var arrRemind = [];
            if (arrIndex.length) {
                arrRemind.push('有<span class="co ml2 mr2">' + arrIndex.length + '</span>个未提交订单');
            }
            if (lengthSuccess) {
                arrRemind.push('有<span class="cg ml2 mr2">' + lengthSuccess + '</span>个订单提交成功');
            }
            if (lengthFail) {
                arrRemind.push('有<span class="co ml2 mr2">' + lengthFail + '</span>个订单提交失败');
            }

            $$("#callSubmitInfo").html(arrRemind.join("，"));

            if (!arrIndex.length && !lengthFail && eleBtn) {
                //全部成功
                eleBtn.fireEvent("click");
            }
        };

        if (eleOperater && eleAllSubmit) {
            //确认完毕
            if (eleBtn) {
                eleBtn.addEvent("click", function () {
                    //上传完毕后的操作
                    Mbox.close();
                    if (!arrIndex.length && !lengthFail) {
                        self.isBeforeCloseRemind = false;
                        //没有未上传的，没有失败上传的，跳转或其他什么的

                        if ($("forceCloseAjaxUrl")) {
                            $("forceCloseAjaxUrl").val("");
                        }
                        $pageFresh(this.attr("data-url"));
                    }
                    return false;
                });
            }

            eleAllSubmit.addEvent("click", function () {
                lengthSuccess = 0;
                lengthFail = 0;
                arrIndex = [];

                if ($verifyRefer.funTestName(eleOperater, true, "该处信息")) {
                    $testRemind.hide();
                    //打开进度提示框
                    Mbox.open({
                        url: "callSubmitMbox",
                        closable: false,
                        onShow: function () {
                            var html = '';

                            elesForm.each(function (eleForm, index) {
                                if (!eleForm.hasClass(classDisable)) {
                                    html = html + '<ul class="res_uppic_list">' +
										'<li class="pct50 l">订单<strong class="co ml2">' + (index + 1) + '</strong></li>' +
										'<li id="callSubmitStatus_' + index + '" class="pct50 l">等待提交</li>' +
									'</ul>';
                                    arrIndex.push(index);
                                }
                            });

                            html = html + '<div id="callSubmitInfo" class="res_uppic_list bgeb">' +
								'共<span class="co ml2 mr2">' + arrIndex.length + '</span>个尚未提交订单' +
							'</div>';

                            if (eleStatus && eleBtn) {
                                eleStatus.html(html);
                                eleBtn.getElement("a").focus();
                            }

                            //开始上传
                            arrIndex.each(function (indexForm) {
                                funAjaxSubmit(elesForm[indexForm], indexForm);
                            });
                        }
                    });
                }
            });
            //回车
            $enterEvent(eleOperater, eleAllSubmit);
        }

        return this;
    },


    init: function () {
        $testRemind.bind();

        this.funLoadBind().funEventAddRemind().funEventIgnore().funEventOrderList().funEventOrderSubmit();

        //默认的加载事件
        if (this.element.resDetailBox) {
            this.element.resDetailBox.load(this.element.resDetailBox.attr("data-url"));
        }

        if (this.element.orderRemindBox) {
            this.element.orderRemindBox.load(this.element.orderRemindBox.attr("data-url"));
        }

        window.onbeforeunload = function () {
            if (this.isBeforeCloseRemind) {
                return "请不要使用刷新或直接跳转网页，有可能丢失数据, 请按<留在此页>！";
            }
        } .bind(this)

        window.onunload = function () {
            var eleLeaveAjax = $("forceCloseAjaxUrl");
            if (eleLeaveAjax) {
                new AjaxReq({
                    url: eleLeaveAjax.val(),
                    method: "post",
                    async: false
                }).send();
            }
        };

        return this;
    }
};

//下单
var $inetOrder = {
    resInfBox: $("orderLoadResInfBox"),
    seatInfBox: $("orderSeatInfBox"),
    cheapInfBox: $("orderCheapInfBox"),
    olderInfBox: $("orderOlderLoadBox"),

    // 终极大表单
    eleForm: $("orderOrderSubmitForm"),

    //预订人姓名文本框
    eleNameInput: $("orderOrderNameInput"),
    //预订人手机号文本框
    eleTelInput: $("orderOrderTelInput"),
    //就餐人姓名文本框元素
    eleDinnerName: $("orderDinnerNameInput"),

    //显示请柬内容的文本域
    eleInviteInfArea: $("InvitationInfo"),

    urlOrderRemind: "Ajax/MakeOrderAjax.aspx",

    nowDate: new Date(),

    //顶部携程还是普通订单标题切换
    funEventTypeBar: function () {
        var eleSel = $("orderTypeSel"), eleTxt = $("orderTypeTxt"), eleBox = $("orderTypeBarBox");
        if (eleSel && eleTxt && eleBox) {
            eleSel.addEvent("change", function () {
                var eleOptionSelected = this.getSelected()[0], htmlOptionSelected = eleOptionSelected && eleOptionSelected.html();
                if (htmlOptionSelected) {
                    eleTxt.html(htmlOptionSelected);
                    if (htmlOptionSelected.test("携程")) {
                        eleBox.addClass("int_ord_bar_ctrip");
                    } else {
                        eleBox.removeClass("int_ord_bar_ctrip");
                    }
                }
            });
        }

        var eleMobile = this.eleTelInput;
        //发送小秘书专属链接
        $$("#orderSendXmsMsg").addEvent("click", function () {
            if (eleMobile) {
                new AjaxPost(this, {
                    url: this.attr("data-url") + "&Mobile=" + eleMobile.val().trim()
                }).send();
            }
            return false;
        });

        return this;
    },

    funEventGetUserInf: function () {
        //采集用户信息
        var eleGetBtn = $("orderGetUserInf"), urlGet = eleGetBtn && eleGetBtn.attr("data-url");
        var eleMobile = this.eleTelInput;
        if (urlGet) {
            eleGetBtn.addEvent("click", function () {
                Mbox.open({
                    url: urlGet + "Mobile=" + eleMobile.val().trim(),
                    ajax: true,
                    type: "iframe",
                    width: eleGetBtn.attr("data-width"),
                    height: eleGetBtn.attr("data-height"),
                    title: "采集用户信息"
                });
                return false;
            });
        }
        return this;
    },

    //用户姓名或手机的查询，订餐人或就餐人姓名性别改动时请柬的响应修改
    funEventSearchOrderInf: function () {
        var eleOrderName = this.eleNameInput, eleDinerName = this.eleDinnerName, eleForm = this.eleForm,
			eleOrderSex = $$(".orderOrderSex"), eleDinnerSex = $$(".orderDinnerType"),
			eleNameBtn = $("orderOrderNameBtn"),
			eleTelInput = this.eleTelInput, eleTelBtn = $("orderOrderTelBtn"),
			eleInfBox = $("orderOrderInfBox"), eleOlderInfBox = this.olderInfBox;
        var elehidIsOpen = $$("#hidIsOpen");


        if (eleInfBox && eleTelInput && eleTelBtn) {
            eleTelBtn.addEvent("click", function () {
                if ($isEmpty(eleTelInput)) {
                    $testRemind(eleTelInput, "尚未输入客户手机号");
                    eleTelInput.focus();
                } else if (!$isRegex(eleTelInput, "^\\d{11}$")) {
                    $testRemind(eleTelInput, "手机号码格式不正确");
                    eleTelInput.focus();
                    eleTelInput.select();
                } else {
                    $testRemind.hide();

                    var numTel = eleTelInput.val().trim(), nameTel = eleTelInput.attr("name");
                    var href = location.href, telSearch = location.search.split("?")[1], hashSearch = {};
                    if (window.localStorage && eleForm) {
                        localStorage.setItem("orderStorage", eleForm.toQueryString());
                    }
                    var isOpen = false;
                    var isNeedOpen = false;
                    if (elehidIsOpen && elehidIsOpen.val() == "1") {
                        isNeedOpen = true;
                    }

                    if (telSearch) {
                        telSearch.split("&").each(function (part) {
                            var arrPart = part.split("=");
                            if (arrPart[1]) {
                                hashSearch[arrPart[0]] = arrPart[1];
                                if ("IsOpen" == arrPart[0]) {
                                    isOpen = true;
                                }
                            }
                        });
                        if (!isOpen && isNeedOpen)
                            hashSearch["IsOpen"] = 1;
                    }

                    // 更新，替换
                    hashSearch[nameTel] = numTel;
                    hashSearch[eleOrderName.attr("name")] = eleOrderName.val().trim();
                    if (eleOrderSex) {
                        eleOrderSex.each(function (eleSex) {
                            if (eleSex.attr("checked")) {
                                hashSearch[eleSex.attr("name")] = eleSex.val();
                            }
                        });
                    }

                    // 刷新
                    window.location.replace(href.split("?")[0] + "?" + new Hash(hashSearch).toQueryString());

                }
                return false;
            });
            //回车
            $enterEvent(eleTelInput.addEvent("change", function () {
                eleTelBtn.fireEvent("click");
            }), eleTelBtn);

            var orderStorage = window.localStorage && localStorage.getItem("orderStorage");
            if (orderStorage) {
                $funJsonBind(orderStorage);
                //WITHIN-477 查询手机号，背景颜色到默认背景问题处理
                //因为要处理上面的问题，所以这里不对本地存储进行移除
                //移除处理放在b/js/calender.js中
                //在该文件中搜索“WITHIN-477”可以查看到相关内容
                //localStorage.removeItem("orderStorage");
            }
            this.funEventInviteInfo();
        }
        //用户姓名修改的时候，请柬需要跟着变化
        if (eleOrderName && eleDinerName) {
            new Elements([eleOrderName, eleDinerName]).addEvent("change", function () {
                $$("#hiddenInvitSMS").val("");
                this.funEventInviteInfo();
            } .bind(this));
        }
        //订餐人或就餐人性别修改的时候，请柬也要跟着变化
        eleOrderSex.addEvent("click", function () {
            $$("#hiddenInvitSMS").val("");
            this.funEventInviteInfo();
        } .bind(this));
        eleDinnerSex.addEvent("click", function () {
            $$("#hiddenInvitSMS").val("");
            this.funEventInviteInfo();
        } .bind(this));

        return this;
    },

    //加载订单详情
    funEventOrderDetail: function () {
        //订单详情的展开与收起
        $visibleToggle($$(".orderOrderDetailToggle"), {
            attribute: "data-rel",
            showCall: function (target) {
                this.html(this.html().replace("查看", "收起"));
                //ajax加载详情
                if (!target.retrieve("successLoaded")) {
                    target.set("load", {
                        onSuccess: function () {
                            target.store("successLoaded", true);
                        }
                    });
                    //尚未成功加载数据
                    target.load(target.attr("data-url"));
                }
            },
            hideCall: function () {
                this.html(this.html().replace("收起", "查看"));
            }
        });

        return this;
    },

    //之前就餐相关操作
    funEventOldOrder: function () {
        $$(".orderEditRadio").addEvent("click", function () {
            if (this.attr("checked")) {
                new AjaxPost(this, {
                    url: this.attr("data-url"),
                    callback: function (json) {
                        if (json.url == "") {
                            this.erase("checked");
                        }
                    } .bind(this)
                }).send();
            }
        });

        $$(".orderCancelRadio").addEvent("click", function () {
            if (this.attr("checked")) {
                Mbox.confirm("确定退订吗?", function () {
                    new AjaxPost(this, {
                        url: this.attr("data-url"),
                        callback: function (json) {
                            window.open("DCYorderAction.aspx?OrderId=" + this.attr("data-id") + "&Entry=XMS");
                        } .bind(this)
                    }).send();
                    Mbox.close();
                } .bind(this), function () {
                    this.erase("checked");
                } .bind(this));
            }
        });

        //关联
        $$(".orderConnRadio").addEvent("click", function () {
            var eleConn = this, eleHiddenRel = $("hiddenRelatedOrderId"), vOrderId = eleConn.attr("data-id");
            if (this.attr("checked")) {
                if (eleHiddenRel && eleHiddenRel.val()) {
                    Mbox.alert("最多只能关联一张订单！");
                    eleConn.erase("checked");
                    return;
                }
                Mbox.open({
                    url: this.attr("data-url") + "&random=" + $time(),
                    type: "ajax",
                    ajax: true,
                    title: "订单关联",
                    onShow: function () {
                        var eleRadPrio2 = $("radPriority2");
                        $$("#btnPriorityEnter").addEvent("click", function () {
                            var valPriority = 0;
                            if (eleRadPrio2 && eleRadPrio2.attr("checked")) {
                                valPriority = 1;
                            }

                            //先锁被关联订单
                            $formSubmit(this, {
                                callback: function (json) {
                                    if (!json.msg) {
                                        if (eleHiddenRel) {
                                            eleHiddenRel.val(vOrderId + "_" + valPriority);
                                        }
                                        Mbox.alert("关联成功。");
                                    } else {
                                        eleConn.erase("checked");
                                    }
                                }
                            });
                        });

                        $$("#btnPriorityCancel").addEvent("click", function () {
                            Mbox.close();
                            eleConn.erase("checked");
                        });
                    }
                });
            } else {
                new AjaxPost(this, {
                    url: "Ajax/MakeOrderAjax.aspx?action=CancelConnectOrder&OrderId=" + vOrderId + "&StateId=" + eleConn.attr("data-state"),
                    callback: function (json) {
                        if (json.msg === "") {
                            if (eleHiddenRel) {
                                eleHiddenRel.val("");
                            }
                        } else {
                            Mbox.alert("取消关联失败");
                            eleConn.attr("checked", "checked");
                        }
                    } .bind(this)
                }).send();
            }
        });

        //点击餐厅名
        var self = this;
        $$(".orderAjaxResInfBtn").addEvent("click", function () {
            new AjaxPost(this, {
                url: this.attr("data-url"),
                callback: function (json) {
                    this.addClass("int_ord_a_visit");

                    //修改页面一些表单控件的值
                    $funJsonBind(json);
                    if (json.park && json.park == "True") {
                        $$("#parkRequire").attr("checked", "checked");
                    } else {
                        $$("#parkRequire").attr("checked", "");
                    }

                    self.funOrderTimeChange();

                    var queryTime = $("orderTimeInputBox").toQueryString();
                    var mobile = $("orderOrderTelInput").val();

                    new AjaxReq({
                        url: "Ajax/MakeOrderAjax.aspx?action=CheckIsDuplicateOrder&" + queryTime + "&mobile=" + mobile + "&CrntOrderId=" + $$("#hiddenOrderId").val(),
                        method: "post",
                        onSuccess: function (json) {
                            var msg = json && json.msg;
                            if (msg) {
                                Mbox.alert(msg);
                            }
                        }
                    }).send();



                } .bind(this)
            }).send();

            return false;
        });

        return this;
    },

    //当时间改变
    funOrderTimeChange: function () {
        var eleTimePickerBox = $("orderTimePickerBox"), eleTimeInputBox = $("orderTimeInputBox"), eleNumberInputBox = $("orderNumberInputBox"),
			eleYear = $("orderTimeYear"), eleMonth = $("orderTimeMonth"), eleDate = $("orderTimeDate"),
			eleHour = $("orderTimeHour"), eleMini = $("orderTimeMini"), eleDay = $("orderTimeDay"),
			eleStart = $("orderNumberStartInput"), eleEnd = $("orderNumberEndInput"), eleEnterpriseId = $("nEnterPriseId");

        var eleSeatBox = this.seatInfBox, eleCheapBox = this.cheapInfBox, self = this;
        var isSeatInfLoad = false, isCheapInfLoad = false;
        var isInviteInfoLoad = false;


        var funGetDay = function (year, month, date) {
            year = year || eleYear.val().trim();
            month = month || eleMonth.val().trim();
            date = date || eleDate.val().trim();
            //周几
            var time = new Date(Date.parse([month, date, year].join("/"))), indexDay = time.getDay();
            // 即时确认
            document.store("time", time.getTime() + eleHour.val().toInt() * 3600000 + eleMini.val().toInt() * 60000);
            self.funEventLimitSure();
            eleDay.html("周" + nStr1[indexDay]);
        };

        var funIsMatch = function (eleInput, value) {
            var vMin = eleInput.attr("data-min"), vMax = eleInput.attr("data-max"), vInput = value || eleInput.val().trim().toInt();
            if (!$chk(vInput) || (vMin && vInput < vMin) || (vMax && vInput > vMax)) {
                $testRemind(eleInput, "请输入合适数值", true);
                eleInput.focus();
                eleInput.select();
                isSeatInfLoad = false;
                isCheapInfLoad = false;
                return false;
            }
            return true;
        };

        var funCalPicker = function (datePicker) {
            if (eleTimePickerBox && eleYear && eleMonth && eleDate && eleHour && eleMini && eleDay) {
                // 日期选择
                $calenderPicker(eleTimePickerBox, function (year, month, day) {
                    eleYear.val(year);
                    eleMonth.val(month < 10 ? "0" + month : month);
                    eleDate.val(day < 10 ? "0" + day : day);
                    //周几
                    funGetDay(year, month, day);
                    //触发修改事件
                    eleYear.fireEvent("input");
                    document.fireEvent("timeSwitch");
                }, datePicker);
            }
        };
        // 时间选择器
        funCalPicker(this.nowDate);

        // 计算周几
        funGetDay();

        //这里数组顺序有讲究
        var arrElement = [eleYear, eleMonth, eleDate, eleHour, eleMini, eleStart, eleEnd], timerTimeChange;

        arrElement.each(function (input, index) {
            input.store("index", index);

            //自定焦点功能   
            input.addEvent(($chk(window.screenX) ? "input" : "keyup"), function () {
                var jumpLength = this.attr("data-length"), thisIndex = this.retrieve("index"), value = this.val();
                isCheapInfLoad = false;
                isSeatInfLoad = false;

                clearTimeout(timerTimeChange);
                // 是否刷新的标志量
                //规则如下：时间改变，优惠刷新；时间和人数改变，如果餐位是无低消模式，餐位刷新
                if (thisIndex < 5) {
                    isCheapInfLoad = true;
                }

                if (!$("orderMiniExpense")) {
                    //如果没有最低消费	
                    isSeatInfLoad = true;
                }
                //add on 2012-04-24 改成键盘刷新
                // 设置500毫秒间断延迟，提高性能
                timerTimeChange = setTimeout(function () {
                    if (funIsMatch(this, value.toInt())) {
                        if (jumpLength && value.length === jumpLength.toInt()) {
                            $testRemind.hide();
                            setTimeout(function () {
                                arrElement[thisIndex + 1].fireEvent("click");
                            }, 100);
                        }
                        //if (thisIndex < 3) {
                        //日期改变，星期几跟着变
                        funGetDay();
                        //}

                        document.fireEvent("timeSwitch");
                    }
                } .bind(this), 500);
            });

            input.addEvent("click", function () {
                this.focus();
                this.select();
            });
        });

        document.addEvent("timeSwitch", function () {
            var queryTime = eleTimeInputBox && eleTimeInputBox.toQueryString(), queryNumber = eleNumberInputBox && eleNumberInputBox.toQueryString();

            //载入赛诺菲BA信息
            if (eleEnterpriseId && eleEnterpriseId.val() == 1) {
                var hBAlist = $("BAList");
                if (hBAlist) {
                    hBAlist.load(hBAlist.attr("data-url") + "&" + queryTime);
                }
            }


            //载入餐位信息
            if (isSeatInfLoad && eleSeatBox && queryTime && queryNumber && eleSeatBox.attr("data-url")) {
                var hSeatBox = eleSeatBox.h(), querySeat = queryTime + "&" + queryNumber;
                eleSeatBox.html('<div style="height:' + hSeatBox + 'px;" class="loading"></div>').load(eleSeatBox.attr("data-url") + "&" + querySeat);
                isSeatInfLoad = false;
            }


            isInviteInfoLoad = true;
            //载入优惠信息
            if (isCheapInfLoad && eleCheapBox) {
                var hCheapBox = eleCheapBox.h(), mobile = this.eleTelInput.val(), urlCheapBox = eleCheapBox.attr("data-url");
                // 页面首次载入不加载
                urlCheapBox && eleCheapBox.html('<div style="height:' + hCheapBox + 'px;" class="loading mt10"></div>').load(urlCheapBox + "&" + queryTime);

                //var elehiddenInvitSMS = $("hiddenInvitSMS");
                //if (elehiddenInvitSMS == null || elehiddenInvitSMS.val() == "") {
                //   isInviteInfoLoad = true;
                //}


                //修改请柬内容
                if (isInviteInfoLoad && this.eleInviteInfArea.val()) {
                    $$("#hiddenInvitSMS").val("");
                    this.funEventInviteInfo();
                }
                isInviteInfoLoad = true;

                ////左侧的餐位信息也刷新, 2012-01-13添加
                //                var eleResSeatInfBox = $("resSeatInfBox");
                //                if (eleResSeatInfBox) {
                //                    eleResSeatInfBox.html('<div style="height:' + eleResSeatInfBox.h() + 'px;" class="loading"></div>').load(eleResSeatInfBox.attr("data-url") + "&" + queryTime);
                //                }
                //				// 其他些相关信息也刷新, 2012-02-24 添加
                //				$$(".resInfReload").each(function(eleLoadBox) {
                //					eleLoadBox.html('<div class="loading" style="height:'+ eleLoadBox.h() +'px;"></div>').load(eleLoadBox.attr("data-url") + "&" + queryTime);	
                //				});

                // 现改为整体刷新 2012-03-02
                $inetOrder.resInfBox.html('<div class="loading" style="height:' + $inetOrder.resInfBox.h() + 'px;"></div>').load($inetOrder.resInfBox.attr("data-url") + "&" + queryTime + "&mobile=" + mobile);

                new AjaxReq({
                    url: this.urlOrderRemind + "?action=CheckIsDuplicateOrder&" + queryTime + "&mobile=" + mobile + "&CrntOrderId=" + $$("#hiddenOrderId").val(),
                    method: "post",
                    onSuccess: function (json) {
                        var msg = json && json.msg;
                        if (msg) {
                            Mbox.alert(msg);
                        }
                    }
                }).send();

                // 提交确认根据时间显示的提醒也刷新 2012-02-15添加
                var eleSubmitRem = $("orderSubmitEnsureRem"), urlSubmitRem = eleSubmitRem && eleSubmitRem.attr("data-url");
                if (eleSubmitRem) {
                    eleSubmitRem.load(urlSubmitRem);
                }

                // 时间选择器跟着刷新 2012-03-08添加
                funCalPicker(new Date(Date.parse(new Elements([arrElement[1], arrElement[2], arrElement[0]]).val().join("/"))));

                isCheapInfLoad = false;
            }
        } .bind(this));

        window.addEvent("domready", function () {
            if (!window.location.href.test("78shequ")) {
                isSeatInfLoad = true;
                isCheapInfLoad = false;
                isInviteInfoLoad = false;
                document.fireEvent("timeSwitch");
            }
        });


        return this;
    },

    // 即时确认信息显示方法
    funEventLimitSure: function () {
        var selTime = document.retrieve("time");
        var eleIsResRealTime = $("IsResRealTime");
        if (this.eleRadioNoMiniExp && this.eleRadioNoMiniExp.attr("checked")) {
            // 时间判定，是否超过1小时
            if (selTime && (selTime - $time()) > 3600000 && eleIsResRealTime && eleIsResRealTime.value == "1") {
                if (this.eleLimitSure) {
                    this.eleLimitSure.into();
                } else {
                    this.eleLimitSure = new Element("span", {
                        styles: {
                            color: "red"
                        },
                        "class": "pl2 pr2"
                    }).html("即时确认");
                    $$("label[for=" + this.eleRadioNoMiniExp.id + "]").grab(this.eleLimitSure);
                    $("spanRealTime").innerHTML = "";
                }
                this.seatInfBox.store("isNeedLimitSure", true);
                return this;
            }
        }
        if (this.eleLimitSure) {
            this.eleLimitSure.out();
        }
        this.seatInfBox.store("isNeedLimitSure", false);
        return this;
    },

    //最低消费相关交互
    funEventMiniExpense: function () {
        var self = this, eleMiniExpense = $("orderMiniExpense");
        if (this.seatInfBox && eleMiniExpense) {
            this.seatInfBox.getElements("input[type=radio]").each(function (radio) {
                if (!radio.attr("data-miniexpense")) {
                    self.eleRadioNoMiniExp = radio;
                }
                radio.addEvent("click", function () {
                    if (this.attr("data-miniexpense")) {
                        eleMiniExpense.attr("disabled", "");
                    } else {
                        eleMiniExpense.attr("disabled", "disabled");
                    }
                    self.funEventLimitSure();
                });
            });

        }
        return this;
    },

    //折扣短信
    funEventCheapMessage: function () {
        var eleCheapMessage = $("orderCheapMessage"), elesCheapRadio = $$(".orderCheapCheckbox"), eleSelectDis = $("hdDiscountId"), eleSelectSId = $("hdSupplierId"), eleCashCouponId = $("OrderCashCouponIds");
        var funGetMessage = function () {
            var arrMessage = [];
            elesCheapRadio.each(function (radio) {
                var eleLabel = $$("label[for=" + radio.attr("id") + "]")[0];
                if (radio.attr("checked") && eleLabel) {
                    arrMessage.push(eleLabel.txt().trim());
                    //新增
                    if (radio.attr("data-type") == "Supplier" && parseInt(radio.attr("data-id")) > 0) {
                        if (eleSelectSId) {
                            eleSelectSId.val(radio.attr("data-id"));
                        }
                        if (eleSelectDis) {
                            eleSelectDis.val("");
                        }
                        if (eleCashCouponId) {
                            if (eleCashCouponId.val().length > 0) {
                                $("btnsubmit").attr("disabled", "").swapClass("int_graybtn", "int_greebtn");
                            }
                            else {
                                $("btnsubmit").attr("disabled", "disabled").swapClass("int_greebtn", "int_graybtn");
                            }
                        }
                        else {
                            $("btnsubmit").attr("disabled", "disabled").swapClass("int_greebtn", "int_graybtn");
                        }
                        var eleBuyCash = $("BuyCash");
                        if (eleBuyCash) {
                            eleBuyCash.attr("checked", "");
                        }
                        var eleUncertainOrder = $("UncertainOrder");
                        if (eleUncertainOrder) {
                            eleUncertainOrder.attr("checked", "");
                        }
                    }
                    else {
                        $("btnsubmit") && $("btnsubmit").attr("disabled", "").swapClass("int_graybtn", "int_greebtn");
                        if (eleSelectDis) {
                            eleSelectDis.val(radio.attr("data-id"));
                        }
                        if (eleSelectSId) {
                            eleSelectSId.val("");
                        }
                    }
                }
            });
            if (eleCheapMessage) {
                eleCheapMessage.val(arrMessage.join("，"));
            }
        };
        //点击事件
        elesCheapRadio.addEvent("click", function () {
            funGetMessage();
        });
        return this;
    },

    //请柬信息改变
    funEventInviteInfo: function (isShowRemind) {
        var eleRadioChecked = null, eleOrderSexRadio = null, eleDinnerSexRadio = null,
			eleOrderName = this.eleNameInput, eleDinerName = this.eleDinnerName,
			eleOrderSex = $$(".orderOrderSex"), eleDinnerSex = $$(".orderDinnerType"),
			eleTextArea = this.eleInviteInfArea,
            elehiddenInvitSMS = $("hiddenInvitSMS");

        if (elehiddenInvitSMS && elehiddenInvitSMS.val()) {
            return this;
        }
        //获取当前选中的请柬类型
        $$(".InvitationType").each(function (eleRadio) {
            if (!eleRadioChecked && eleRadio.attr("checked")) {
                eleRadioChecked = eleRadio;
            }
        });

        //需要提示的请柬文字模板(其中姓名和时间需要被替换)
        var inviteInfo = eleRadioChecked && eleRadioChecked.attr("data-msg");

        //如果当前单选没有模板信息（例如选中“不发请柬”选项），或是找不到显示请柬内容的文本域，直接回家过年
        if (!eleTextArea || !inviteInfo) {
            if (eleRadioChecked) {
                //将请柬内容清空
                eleTextArea.val("");
            }
            return this;
        }

        //以下为请柬处理规则
        //① 当给请柬类别赋值时 若订餐人姓名 或性别  为空 则不赋值 请柬内容也不赋值
        //② 点击请柬类别时 当 请柬人姓名为空 或性别为空 提醒并把请柬类型和内容清空
        //③ 当修改订餐人姓名时 当 请柬类型选中且不为不发请柬，此时检查 就餐人和就餐性别 是否都不为空 ，若不是就修改 请柬中的 姓名为当前订餐人姓名 
        //④ 当手动清空订餐人框时 提醒 订餐人姓名不能为空 并清空 请柬类型 和请柬内容
        //⑤ 修改就餐人 且 就餐人性别不为空时 且请柬类型 选中且不为不发请柬， 修改请柬内容姓名为 就餐人
        //⑥ 当手动清空就餐人框时 且请柬类型 选中且不为不发请柬，修改请柬内容姓名为 订餐人
        //⑦ 当选择订餐人性别时 若就餐人 姓名不为空  且请柬类型 选中且不为不发请柬 修改请柬内容姓名为 就餐人

        //无论哪种情况的处理，需要先获取订餐人姓名和性别，以及就餐人姓名和性别/类型
        var nameUser = '', arrTimeUser = [], timeUser = '';

        var nameOrder, nameDinner, isOrderSexChecked, sexTypeDinner;

        if (eleOrderName && eleDinerName) {
            nameOrder = eleOrderName.val().trim(), nameDinner = eleDinerName.val().trim();

            //订餐人性别被选中单选框
            eleOrderSexRadio = eleOrderSex[eleOrderSex.attr("checked").indexOf(true)];

            //获得当前选中的就餐人性别的文本框，如果没有就是undefined
            eleDinnerSexRadio = eleDinnerSex[eleDinnerSex.attr("checked").indexOf(true)];

            //提示，如果是提示模式 - 即直接点击请柬类型单选触发该段脚本的话~~
            if (!nameOrder || !eleOrderSexRadio) {
                if (isShowRemind) {
                    window.scrollTo(0, 0);
                    if (!nameOrder) {
                        $testRemind(eleOrderName, "还没有输入订餐人姓名", true);
                        eleOrderName.focus();
                    } else if (!eleOrderSexRadio && eleOrderSex[0]) {
                        $testRemind(eleOrderSex[0], "还没有选择订餐人性别", true);
                        eleOrderSex[0].focus();
                    }
                }
                //将请柬内容清空
                eleTextArea.val("");
                //单选不选中
                eleRadioChecked.erase("checked");
                return this;
            } else {
                //符合显示请柬提示文字的情况
                //确定显示的姓名是
                if (nameDinner && eleDinnerSexRadio) {
                    //如果就餐人姓名和性别类型都有
                    nameUser = nameDinner;

                    //选中性别对应的id
                    var idForLabel = eleDinnerSexRadio.attr("id");
                    //需要根据不同形成生成完整的就餐人姓名信息
                    //规则如下，如果就餐人姓名为一个字，则要附带上先生/女士，如果选择公司，则无论几个字都带上，例如李鱼公司
                    if (nameDinner.length === 1 || idForLabel === "orderUserCompany") {
                        nameUser = nameDinner + $$("label[for='" + idForLabel + "']").html().join();
                    }
                } else {
                    //否则，把订餐人姓名作为请柬文字中的姓名
                    nameUser = nameOrder;
                }

                //确定就餐的时间
                arrTimeUser = $$("#orderTimeInputBox input").val();
                if (arrTimeUser.length === 5) {
                    var timeWeek = new Date(Date.parse([arrTimeUser[1], arrTimeUser[2], arrTimeUser[0]].join("/"))), WeekDay = "周" + nStr1[timeWeek.getDay()];
                    timeUser = parseInt(arrTimeUser[1], 10) + "月" + parseInt(arrTimeUser[2], 10) + "号" + WeekDay + parseInt(arrTimeUser[3], 10) + "时" + (parseInt(arrTimeUser[4], 10) > 0 ? parseInt(arrTimeUser[4], 10) + "分" : "");
                }

                //请柬内容赋值
                eleTextArea.val(inviteInfo.replace("$Name$", nameUser).replace("$Time$", timeUser));
            }
        }

        return this;
    },

    //修改请柬接受人
    funEventInviter: function () {
        var elebtn = $("orderEditInviter"), eleInput = $("orderInviterInf"),
        //顶部的手机号，姓名
			eleTel = this.eleTelInput, eleName = this.eleNameInput;

        var eleInviteRadio = $$(".InvitationType");

        eleInviteRadio.addEvent("click", function () {
            $$("#hiddenInvitSMS").val("");
            this.funEventInviteInfo(true);
        } .bind(this));


        window.funInviterCallback = function (arr) {
            var arrValue = [];
            if ($isArr(arr)) {
                arr.each(function (inf) {
                    var arrInf = inf.split("|");
                    if (arrInf.length) {
                        arrValue.push(arrInf[0] + (arrInf[1] ? "(" + arrInf[1] + ")" : ""));
                    }
                });
            }
            if (eleInput) {
                eleInput.val(arrValue.join(";"));
            }
        };
        if (elebtn && eleInput && eleTel) {
            elebtn.addEvent("click", function () {
                var data = {};
                //先验证是否选择了请柬类型
                if (eleInviteRadio.length && eleInviteRadio.attr("checked").indexOf(true) === -1) {
                    $testRemind(eleInviteRadio[0], "请先选择请柬类型", true);
                } else {
                    if ($isEmpty(eleTel)) {
                        $testRemind(eleTel, "尚未输入客户手机号");
                        eleTel.focus();
                    } else if (!$isRegex(eleTel, "^\\d{11}$")) {
                        $testRemind(eleTel, "手机号码格式不正确");
                        eleTel.focus();
                        eleTel.select();
                    } else {
                        $testRemind.hide();
                        data[eleTel.name] = eleTel.val();
                        data[eleInput.name] = (eleInput.val().match(/\d{11}/g) || []).join();
                        data[eleName.name] = eleName.val();
                        data["MemberId"] = $$("#hiddenMemberId").val().join();
                        Mbox.open({
                            url: this.attr("data-url"),
                            ajax: true,
                            type: "ajax",
                            ajaxOptions: {
                                data: data
                            },
                            title: this.html()
                        });
                    }
                }

                return false;
            });
        }

        return this;
    },

    // 表单核对信息
    funEnsureInf: function () {
        var eleEnsureInf = $("orderSubmitEnsureInf"), htmlEnsureInf = '';
        var userName, userTel, userSex = '', userTime, resName, userNumber, userSeat = '', userSmoke = '', userPark = '', userJoker = '', userRequire = '';

        if (eleEnsureInf) {
            // 用户姓名
            if (this.eleNameInput) {
                userName = this.eleNameInput.val() || "不知名";
            }
            // 用户性别
            var eleSexes = $$(".orderOrderSex"), eleSexChecked = eleSexes[eleSexes.attr("checked").indexOf(true)];
            if (eleSexChecked) {
                userSex = $$("label[for=" + eleSexChecked.attr("id") + "]").html().join();
            }
            // 手机号
            if (this.eleTelInput) {
                userTel = this.eleTelInput.val();
            }

            //时间提醒
            var strTimeAlert = "";

            // 预订时间
            var arrUserTime = $$("#orderTimeInputBox input").val();
            if (arrUserTime.length >= 5) {
                userTime = arrUserTime[0] + "年" + arrUserTime[1] + "月" + arrUserTime[2] + "日 " + arrUserTime[3] + ":" + arrUserTime[4] + " " + $$("#orderTimeDay").val().join();
                var today = new Date();
                var Year = today.getFullYear(); pageMonth = (today.getMonth() + 1); pageDay = today.getDate();
                if (today.getFullYear() >= arrUserTime[0] && (today.getMonth() + 1) >= arrUserTime[1] && today.getDate() >= arrUserTime[2] && today.getHours() >= arrUserTime[3] && today.getMinutes() >= arrUserTime[4]) {
                    strTimeAlert = "<span class='co'>(就餐时间比当前时间早)</span>";
                }
            }

            // 餐厅名称
            resName = eleEnsureInf.attr("data-resname") || "不知名餐厅";

            // 就餐人数
            var userNumberStart = $$("#orderNumberStartInput").val().join().toInt(), userNumberEnd = $$("#orderNumberEndInput").val().join().toInt();
            if (userNumberStart && userNumberStart) {
                userNumber = userNumberStart + "-" + userNumberEnd + "人";
            } else if (userNumberStart || userNumberStart) {
                userNumber = (userNumberStart || userNumberStart) + "人"
            }

            // 座位信息
            var eleSeats = $$("#orderSeatInfBox input[type=radio]"), eleSeatChecked = eleSeats[eleSeats.attr("checked").indexOf(true)];
            if (eleSeatChecked) {
                userSeat = $$("label[for=" + eleSeatChecked.attr("id") + "]").html().join();
            }

            // 香烟信息
            var eleSmokes = $$(".smokeRequire"), eleSmokeChecked = eleSmokes[eleSmokes.attr("checked").indexOf(true)];
            if (eleSmokeChecked) {
                userSmoke = $$("label[for=" + eleSmokeChecked.attr("id") + "]").html().join();
            }

            // 停车信息
            var elePark = $("parkRequire");
            if (elePark && elePark.attr("checked")) {
                userPark = $$("label[for=" + elePark.attr("id") + "]").html().join();
            }
            // 就餐笑话
            var eleJoker = $("jokeRequire");
            if (eleJoker && eleJoker.attr("checked")) {
                userJoker = $$("label[for=" + eleJoker.attr("id") + "]").html().join();
            }
            //用户需求
            var eleRequire = $("userRequireArea");
            if (eleRequire) {
                userRequire = eleRequire.val().trim();
            }

            eleEnsureInf.html('<h5>' + userName + userSex + '(' + userTel + ')，最后和您核对下：' + strTimeAlert + '</h5>' +
				'<p class="mt15 fs">您预订了' + userTime + function () {
				    var strUser = '';
				    [resName, userNumber, userSeat, userSmoke, userPark, userJoker, userRequire].each(function (str) {
				        if (str) {
				            strUser = strUser + '“' + str + '” ';
				        }
				    });
				    return strUser;
				} () + '</p>' + (this.seatInfBox.retrieve("isNeedLimitSure") ? '<p class="clred b mt10">您的预订已成功，我们会尽快将预订成功的短信发给你！</p>' : ''));
        }
        return this;
    },

    //表单提交
    funEventSubmit: function () {
        var eleForm = this.eleForm, self = this,
			eleEnsureBox = $("orderSubmitEnsureBox");

        if (eleForm) {
            eleForm.addEvent("submit", function () {
                if (this.retrieve("ensure")) {
                    $formSubmit(this.getElement("input[type=submit]"), {
                        text: "提交中...",
                        callback: function () {
                            this.store("ensure", false);
                        } .bind(this)
                    });
                } else if (eleEnsureBox) {
                    self.funEventLimitSure().funEnsureInf();
                    Mbox.open({
                        url: eleEnsureBox,
                        closable: false,
                        title: "表单提交确认"
                    });
                }
                return false;
            });
        }

        $$("#orderSubmitOkBtn").addEvent("click", function () {
            Mbox.close();
            eleForm.store("ensure", true).fireEvent("submit");
        });
        $$("#orderSubmitNoBtn").addEvent("click", function () {
            Mbox.close();
            eleForm.store("ensure", false);
        });

        return this;
    },

    init: function () {
        $testRemind.bind();
        if (this.resInfBox) {
            this.resInfBox.set("load", {
                onSuccess: function () {
                    //事件绑定
                    $inetMap.funEventRes();
                }
            });
            this.resInfBox.load(this.resInfBox.attr("data-url"));
        }

        this.funEventTypeBar().funEventGetUserInf().funEventSearchOrderInf().funEventOrderDetail()
			.funEventOldOrder().funOrderTimeChange().funEventMiniExpense().funEventCheapMessage()
			.funEventInviter().funEventSubmit();

        //绑定加载事件
        if (this.seatInfBox) {
            this.seatInfBox.set("load", {
                onSuccess: function () {
                    this.funEventMiniExpense();
                } .bind(this)
            });
        }
        if (this.cheapInfBox) {
            this.cheapInfBox.set("load", {
                onSuccess: function () {
                    this.funEventCheapMessage();
                } .bind(this)
            });
        }

        if (this.olderInfBox) {
            this.olderInfBox.set("load", {
                onSuccess: function () {
                    this.funEventOldOrder();
                } .bind(this)
            });
        }

        //文字颜色
        $classToggle($$(".orderTextColor .g9"), {
            addClass: "g3",
            removeClass: "g9"
        });

        return this;
    }
};
// 表单大提交
var submitOrder = function () {
    $testRemind.bind();
    $$(".optAllSubmit").addEvent("click", function () {
        $formSubmit(this, {
            callback: function (json) {
                var orderIframe = jq("#orderIframe");
                if (orderIframe) {
                    orderIframe.load(json.url, function () {
                        tabContentLi("a-green", "a-red");
                    });
                }
            } .bind(this)
        });
        return false;
    });
};
// 订单表单提交
var orderSummit = function () {
    $testRemind.bind();
    $$("seachOrder").addEvent("click", function () {
        if ($verifyRefer.funTestDate($("operaDate"), false) &&
            $verifyRefer.funTestNumber($("operaNum"), true, "人数", true)) {
            var orderIframe = jq("#orderIframe");
            if (orderIframe) {
                orderIframe.load(json.url, function () {
                    tabContentLi("a-green", "a-red");
                })
            }
        }
    });
    var optAllSubmit = $$(".optAllSubmit")[0];
    optAllSubmit.addEvent("click", function () {
        $$("#hidTableIds").val(tabsActive);
        var _this = this;
        if ((function () {
            var eleTel = $("operaTel"), value = eleTel && eleTel.val().trim();
            if (value === "") {
                $testRemind(eleTel, "您尚未输入手机号", true);
                eleTel.focus();
            } else if (!/^\d+$/.test(value)) {
                $testRemind(eleTel, "格式不准确", true);
                eleTel.focus();
                eleTel.select();
            } else {
                return true;
            }
            return false;
        })()) {
            var fsubmit = function () {
                $formSubmit(_this, {
                    callback: function (json) {
                        window.open('', '_self');
                        window.close();
                    } .bind(_this)
                });
            };
            new AjaxPost(optAllSubmit, {
                url: optAllSubmit.attr("data-url"),
                callback: function (json) {
                    if (json.msgs != "") {
                        Mbox.confirm(json.msgs, function () {
                            Mbox.close();
                            fsubmit();
                        })
                    } else {
                        fsubmit();
                    }
                }
            }).send()
        }
        return false;
    });
    jq("#operaNum").keydown(function (e) {
        if (e.keyCode == 13) {
            jq(".btnSearchSeat").click();
        }
        return false;
    });
    jq("#operaTel").keydown(function (e) {
        if (e.keyCode == 13) {
            jq(".btnSearchMember").click();
        }
        return false;
    });
};
// 时，分
var intDataLi = function () {
    var eleTimeInputs = jq(".timeInputAuto"), eleMapDateBox = $("intMapDateBox");
    jq(".int_date_box li").on("click", function () {
        var self = jq(this), text = parseInt(self.text());
        self.closest(".int_date_box").siblings(".timeInputAuto").val(text);
    });
    eleTimeInputs.on("click", function () {
        var index = eleTimeInputs.index(this), intMapDateHour = jq("#intMapDateHour"), intMapDateMinute = jq("#intMapDateMinute");
        if (index == 0) {
            eleMapDateBox.show();
        } else if (index == 1) {
            intMapDateHour.show();
        } else if (index == 2) {
            intMapDateMinute.show();
        }
        var opacityBox = jq("#opacityBox").show().on("click", function () {
            eleMapDateBox.hide();
            intMapDateHour.hide();
            intMapDateMinute.hide();
            opacityBox.hide();
        })
    });
};
var intDataInput = function () {
    var eleTimeInputs = jq(".timeInputAuto"), eleMapDateBox = $("intMapDateBox");
    eleTimeInputs.on("click", function () {
        var index = eleTimeInputs.index(this), datatime = jq(this).val().replace(/\-/g, "/") || new Date();
        if (index == 0) {
            funMapDateInput(eleMapDateBox, new Date(datatime), 0);
            eleMapDateBox.show().css("right", "37px");
        } else if (index == 1) {
            funMapDateInput(eleMapDateBox, new Date(datatime), 1);
            eleMapDateBox.show().css("right", "-100px");
        }
        var opacityBox = jq("#opacityBox").show().on("click", function () {
            eleMapDateBox.hide();
            opacityBox.hide();
        })
    });
};
// 日期
var funMapDateInput = function (element, date, sum) {
    var eleTimeInputs = $$(".timeInputAuto"), sum = sum || 0;
    if (element) {
        $calenderPicker(element, function (year, month, date) {
            if (month < 10) {
                month = "0" + month;
            }
            if (date < 10) {
                date = "0" + date;
            }
            eleTimeInputs[sum].val(year + "-" + month + "-" + date);
        }, date);
    }
};
// 选择餐位
var tabActive = "";
var tabContentLi = function (green, red) {
    var alertli = jq("#myTabContent .thumbnail"), greentext = "<span class='alertshow'>+</span>", redtext = "<span class='alertshow'>-</span>", bookadd = jq("#bookAdd"), alerttext = bookadd.find(".alert"), myTabContent = jq("#myTabContent");
    // 初始化，加入+-符号
    for (var i = 0, len = alertli.length; i < len; i++) {
        if (alertli.eq(i).hasClass(green)) {
            alertli.eq(i).append(greentext)
        } else if (alertli.eq(i).hasClass(red)) {
            alertli.eq(i).append(redtext)
        }
        for (var j = 0, len2 = alerttext.length; j < len2; j++) {
            if (alerttext.eq(j).data("text") == alertli.eq(i).find("h3").text()) {
                if (alertli.eq(i).hasClass(green)) {
                    alertli.eq(i).removeClass(green).addClass(red);
                    alertli.eq(i).append(redtext);
                }
            }
        }
    }
    if ($$("#hidTableIds").val()) {
        tabActive = $$("#hidTableIds").val();
    }
    var booktext = "", booktextid = "", bookid = "", dataid = "";
    //点击取消餐位
    bookadd.delegate(".alert", "click", function () {
        var self = jq(this), bookid = self.data("text"), dataid = self.data("id"); ;
        for (var i = 0, len = alertli.length; i < len; i++) {
            if (bookid == alertli.eq(i).find("h3").text() && alertli.eq(i).hasClass(red)) {
                alertli.eq(i).removeClass(red).addClass(green).find(".alertshow").text("+");
            }
        }
        self.remove();
        tabActive = tabActive.toString().replace((dataid + "@" + bookid + ","), "");
    });
    jq("#orderIframe").delegate("#allTab", "click", function () {
        myTabContent.find(".tab-pane").addClass("active");
    });
    //点击添加餐位，再点击取消餐位
    myTabContent.delegate(".thumbnail", "click", function () {
        var self = jq(this);
        booktextid = self.find("h3").text();
        bookid = bookadd.find(".alert");
        dataid = self.data("id");
        if (self.hasClass(green)) {
            self.removeClass(green).addClass(red).find(".alertshow").text("-");
            //检查餐位，有则退出不添加
            for (var i = 0, len = bookid.length; i < len; i++) {
                if (bookid.eq(i).data("id") == booktextid) {
                    return
                }
            }
            //没有则添加
            booktext = "<div class='alert alert-warning' data-text=" + booktextid + " data-id=" + dataid + "><button class='close' aria-hidden='true' data-dismiss='alert' type='button'>x</button>" + booktextid + "</div>"
            tabActive += dataid + "@" + booktextid + ",";

            bookadd.append(booktext);
        } else if (self.hasClass(red)) {
            //检查餐位，有则移除
            for (var i = 0, len = bookid.length; i < len; i++) {
                if (bookid.eq(i).data("text") == booktextid) {
                    bookid.eq(i).remove();
                    tabActive = tabActive.toString().replace((dataid + "@" + booktextid + ","), "");

                }
            }
            self.removeClass(red).addClass(green).find(".alertshow").text("+");
        }
    })
};
// 选择菜系
var tabFoodLi = function (green, red) {
    var myTabContent = jq("#myTabContent"),
    booktitle = "",
    dataprice = "",
    dataid = "",
    booktext = "",
    allAttr = "配料/属性：",
    attrId = "",
    modalhtml = "",
    objFood = "",
    likeFood = "",
    orderFood = "",
    orderFoodUl = jq("#orderFoodUl"),
    url = orderFoodUl.data("href"),
    url2 = myTabContent.data("url"),
    url3 = myTabContent.data("href"),
    show2 = "<span class=\"alertshow2 glyphicon glyphicon-ok\"></span>",
    modalContent = jq("#modalContent");
    //套餐切换
    myTabContent.delegate("#allTab", "click", function () {
        myTabContent.find(".tab-pane").addClass("active");
    });
    //子品牌切换
    var urlType = jq(".urlType");
    urlType.on("click", function () {
        var search = location.search,
        type = "urltype=" + jq(this).data("urltype"), href = location.href;
        if (/urltype=/.test(search)) {
            href = href.replace(/urltype=.*[^&]/, type);
        } else {
            href = search.length > 0 ? href + "&" + type : href + "?" + type;
        }
        location.replace(href);
    });
    var qs = (location.search.length > 0 ? parseInt(location.search.substr(location.search.indexOf("urltype=") + 8, 2)) : "");
    urlType.removeClass("active").eq(qs).addClass("active");
    //子品牌切换结束
    //下拉框点击
    var clickMenuA = jq(".clickMenu a");
    clickMenuA.on("click", function () {
        var self = jq(this);
        self.closest("ul").siblings("input[type='text']").val(self.text());
    });
    //下拉框点击结束
    var attrText = function (obj) {
        dataid = obj.data("id");
        objFood = jq(".eleFood[data-id='" + dataid + "']", ".tab-content3");
        likeFood = jq(".eleFood[data-id='" + dataid + "']", "#likeFood");
        orderFood = jq(".eleFood[data-id='" + dataid + "']", "#orderFoodUl");
        booktitle = obj.data("title");
        dataprice = obj.data("price");
        booktextFn();
    };
    var booktextFn = function () {
        booktext = "<li class=\"list-group-item\"><div class=\"clearfix\"><span class=\"pull-left pt5 w150 ovh\">" + booktitle + "</span><span class=\"pull-left pt5 allPrice\" data-id=" + dataid + " data-attrid=" + attrId + ">￥" + dataprice + "</span><div class=\"num pull-right\"><span class=\"num_s icon-minus cashNumDesc\"></span><span class=\"cash_n cashNumber\">1</span><span class=\"num_s icon-plus cashNumAsc\"></span></div></div>";
        if (attrId != "") {
            booktext += "<div class=\"pct98 allattr c8\">" + allAttr + "</div></li>"
        } else {
            booktext += "</li>"
        }
    };
    //添加菜
    var addFoodFn = function () {
        objFood.removeClass(green).addClass(red);
        objFood.append(show2);
        //喜欢菜单
        var html = likeFood.text();
        likeFood.empty().append(html + show2);
        //没有则添加
        orderFoodUl.prepend(booktext);
    };
    //删除菜
    var deletedFoodFn = function () {
        //菜单的删除
        orderFood.closest("li").remove();
        objFood.find(".alertshow2").remove();
        objFood.removeClass(red).addClass(green);
    };
    //点击添加餐位，再点击取消餐位
    var isdb = false;
    myTabContent.delegate(".eleFood", "dblclick", function () {
        isdb = true;
        var self = jq(this);
        allAttr = "配料/属性：";
        attrId = "";
        attrText(self);
        modalContent.load(url3, { "di": dataid }, function () {
            jq('#myModal').modal({
                keyboard: true
            });
            var check = jq(this).find("input[type='checkbox']");
            check.on("click", function () {
                var thiss = jq(this), attr = thiss.data("attrid"), text = thiss.siblings("span").text(), price = thiss.data("price") || "";
                if (attrId.indexOf(attr) == -1) {
                    allAttr += text + "，";
                    attrId += attr + "%%";
                    dataprice = dataprice * 1 + price
                } else {
                    allAttr = allAttr.replace(text + "，", "");
                    attrId = attrId.replace(attr + "%%", "");
                    dataprice = dataprice * 1 - price
                }
            });
        });
    });
    //弹框
    myTabContent.delegate(".eleFood", "click", function () {
        var self = jq(this);
        allAttr = "配料/属性：";
        attrId = "";
        setTimeout(function () {
            if (isdb == false) {
                attrText(self);
                modalContent.load(url2, { "di": dataid }, function () {
                    jq('#myModal').modal({
                        keyboard: true
                    })
                });
            }
        }, 300);
        setTimeout(function () {
            isdb = false;
        }, 600)
    });
    //弹框中添加菜单
    jq("#addFood").on("click", function () {
        allAttr = allAttr.substring(0, (allAttr.length - 1));
        attrId = attrId.substring(0, (attrId.length - 2));
        booktextFn();
        addFoodFn();
    });
    // cash number
    var xmsCashMibi = function () {
        var eleForm = $("#cashNumForm"),
            eleNum = $("#cashNumber"),
            num,
            timer = {
                cashNumDesc: null,
                cashNumAsc: null
            },
            sec = 2000,
            cashNumDesc = $("#cashNumDesc"),
            cashNumAsc = $("#cashNumAsc");

        function clearFn(obj, id) {
            obj.removeClass("disable");
            clearTimeout(timer[id]);
        }

        // money shoule pay
        var pay = function (obj) {
            var id = "";
            if (!obj) return;
            id = obj.attr("id");
            num = parseInt(eleNum.html(), 10);

            if (id == "cashNumDesc") {
                num--;
            } else if (id == "cashNumAsc") {
                num++;
            }

            if (obj.hasClass("disable")) {
                return false;
            }

            if (!num || num <= 0) {
                num = 1;
                eleNum.html(num);
            } else {
                var href = obj.parent().data("href");
                $.post(href, { "num": num }, function (data) {
                    var json = $.parseJSON(data);
                    $("#frightRates").html(json.price);
                    $("#cashMibiShow").html(json.mibi);
                    eleNum.html(num);
                    clearFn(obj, id);
                });

                //只有需要提交的时候，才做这个处理。
                //2014-11-17更新时，下面的两行代码，在if模块之外，
                //忘记了，下次更新时，带上吧。
                obj.addClass("disable");
                timer[id] = setTimeout(function () {
                    clearFn(obj, id);
                }, sec);
            }
        };

        cashNumDesc.bind("click", function () {
            pay($(this));
            return false;
        });
        cashNumAsc.bind("click", function () {
            pay($(this));
            return false;
        });
        cashNumDesc.on("touchstart", function () {
            pay($(this));
            return false;
        });
        cashNumAsc.on("touchstart", function () {
            pay($(this));
            return false;
        });

        // form submit
        eleForm.bind("submit", function () {
            if (!$.allpass()) {
                return false;
            }
            $.form(this);
            return false;
        });
    };
};
/*给聊天界面传递餐厅消息所用 start*/
var postMessageToChat = function (id) {
    var t = window.opener,
		data = { fn: "addNewHall", resid: id },
		e = event || window.event;

    try {
        t.postMessage(JSON.stringify(data), "*");
    } catch (err) { }

    if (window.event) {
        e.cancelBubble = true;
    } else {
        e.stopPropagation();
    }
}
/*给聊天界面传递餐厅消息所用end*/

/*  问答库 分类管理*/
var selectcity = function (data1) {
    var addcity = jq(".addCity");
    /*循环填充数据*/
    var jsoneach = function (obj, thisid, json, sum) {
        //var sum1 = 0, sum2 = 1;
        var htm = "<option value='请选择'>请选择</option>", htm2 = htm;
        var selected = obj.find("select:eq(" + sum + ")").data("value");
        var selected2 = obj.find("select:eq(" + (sum * 1 + 1) + ")").data("value");
        /*下一层数据填充*/
        var foreach = function (i) {
            if (json[i].sub != "" && json[i].sub != null) {
                for (var j = 0; j < json[i].sub.length; j++) {
                    if (json[i].sub[j].id == selected2) {
                        htm2 += "<option selected='selected' value='" + json[i].sub[j].id + "'>" + json[i].sub[j].name + "</option>";
                    } else {
                        htm2 += "<option value='" + json[i].sub[j].id + "'>" + json[i].sub[j].name + "</option>";
                    }
                }
            }
        };
        /*第一层数据填充*/
        if (json != "" && json != null) {
            if (thisid == "") {
                for (var i = 0; i < json.length; i++) {
                    if (json[i].id == selected) {
                        htm += "<option selected='selected' value='" + json[i].id + "'>" + json[i].name + "</option>";
                        foreach(i);
                    } else {
                        htm += "<option value='" + json[i].id + "'>" + json[i].name + "</option>";
                    }
                }
                obj.find("select:eq(" + sum + ")").html(htm);

            } else {
                for (var i = 0; i < json.length; i++) {
                    if (json[i].id == thisid) {
                        foreach(i);
                    }
                }
                obj.find("select:eq(" + (sum * 1 + 1) + ")").html(htm2);
            }
        }
    };
    /*下拉选择*/
    addcity.each(function (e) {
        jsoneach(addcity.eq(e), "", data1, "0");
        addcity.eq(e).delegate("select", "change", function () {
            var sumn = addcity.eq(e).find("select").index(this);
            var thisid = jq(this).val();
            jsoneach(addcity.eq(e), thisid, data1, sumn);
        })
    });
    /*提交*/
    var form = jq("#infoForm");
    jq("#submit").bind("click", function () {
        console.log(addcity.find("select").val())
        if (addcity.find("select").eq("0").val() != "请选择" || addcity.find("select").eq("1").val() != "请选择" || addcity.find("select").eq("2").val() != "请选择") {
            form.submit();
        } else {
            alert("请选择！")
        }
        return false;
    });
};
/*问题库搜索*/
var questionAndAnswer = function () {
    /*问题库搜索-搜索*/
    jq(".showAnswer").bind("click", function () {
        var _this = jq(this), obj = _this.closest("li").find(".answer"), id = _this.siblings().data("id"), lock = _this.data("lock"), url = _this.closest("ul").data("url");
        if (lock == undefined) {
            _this.data("lock", "true");
            jq.post(url, { "id": id })
        }
        if (obj.is(":hidden")) {
            obj.show()
        } else {
            obj.hide()
        }
    });
    var inputtime, eleAddQuestion = jq("#addKeyword"), href = eleAddQuestion.data("url");
    eleAddQuestion.bind("input", function () {
        clearTimeout(inputtime);
        var val = jq(this).val();
        if (val != "") {
            inputtime = setTimeout(function () {
                jq.post(href, { "word": val }, function (data) {
                    if (data.succ = true) {
                        var html = "", con = data.word.split("%%");
                        for (var i = 0, len = con.length; i < len; i++) {
                            html += "<li>" + con[i] + "</li>";
                        }
                        jq(".focusWord").html(html).show();
                    }
                }, "json");
            }, 1000);
        }
    });
    var index = -1;
    var submitFn = function () {
        var datas = jq("#infoForm").serialize(), lock = true;
        if (datas != "" && lock) {
            lock = false;
            jq.ajax({
                type: "post",
                url: href,
                data: datas
            });
        } else {
            alert("请输入关键字！")
        }
    };
    eleAddQuestion.keyup(function (event) {
        var keycode = event.which, obj = jq(".focusWord"), objli = obj.find("li");
        if (!obj.is(":hidden")) {
            if (keycode == 40) {
                index++;
            } else if (keycode == 38) {
                index--;
            }
            if (index >= objli.length) {
                index = 0
            } else if (index <= -1) {
                index = objli.length - 1
            }
            objli.removeClass("active");
            objli.eq(index).addClass("active");
            jq(this).val(objli.eq(index).text());
        }
        if (keycode == 13) {
            submitFn()
        }
    });
    jq(".focusWord").delegate("li", "click", function () {
        var _this = jq(this), text = _this.text();
        eleAddQuestion.val(text);
        jq.post(href, { "focusword": text });
        jq(".focusWord").hide();
    });
    jq("#eleBtn").bind("click", function () {
        submitFn()
    });
    var obj = jq(".eleClick");
    /*问题库搜索-列表*/
    obj.bind("click", function () {
        var _this = jq(this), type = _this.data("type"), id = _this.closest(".eleId").data("id"), url = _this.closest("ul").data("url"), lock = true, num = Number(_this.next().text()) + 1;
        if (lock && type != "") {
            jq.post(url, { "type": type, "num": num, "id": id }, function (data) {
                if (data.succ == true) {
                    if (type == "praise" || type == "tread") {
                        _this.next().text(num);
                    } else if (type == "delete") {
                        if (confirm("是否删除？")) {
                            _this.closest("li").remove();
                        }
                    } else if (type == "audit" || type == "error") {
                        _this.closest("li").find("h2").find("span").removeClass().addClass("ysh").text("已审核");
                        _this.remove();
                    } else if (type == "restore") {
                        _this.closest("li").find("h2").find("span").removeClass().addClass("wsh").text("未审核");
                        _this.text("审核").data("type", "audit");
                    } else if (type == "report") {
                        _this.text("已报错").data("type", "");
                    }
                }
                lock = false;
            }, "json")
        }
    });
};
var dateTime = function () {
    jq(".submit,.export").on("click", function () {
        var form = jq("#returnForm"), data = "", url = window.location.href;
        data = form.serialize();
        if (jq(this).hasClass("export")) {
            data += "act=export";
        }
        location.href = url.indexOf("?") > 0 ? url + "&" + data : url + "?" + data;
    });
    jq(".showBtn").on("click", function () {
        var self = jq(this), id = self.data("id"), url = "OrderBackCashLog.aspx";
        jq(".modal-title").html("日志查看");
        myModal(url, { "id": id });
    });
    jq(".modifyBtn").on("click", function () {
        var self = jq(this), id = self.data("id"), url = "OrderBackCashBank.aspx";
        jq(".modal-title").html("修改银行卡");
        myModal(url, { "id": id });
    });
    jq(".remarkBtn").on("click", function () {
        var self = jq(this), id = self.data("id"), status = self.data("status"), url = "OrderBackCashReMark.aspx";
        jq(".modal-title").html("理由");
        myModal(url, { "id": id, "status": status });
    });
    jq(".btnAddMemeberLabel").on("click", function () {
        var self = jq(this), phone = self.data("phone"), name = self.data("name"), url = "OrderBackCashMemeberLabel.aspx";
        jq(".modal-title").html("会员(" + name + ")角色");
        myModal(url, { "phone": phone });
    });
    jq(".receiveBtn").on("click", function () {
        var self = jq(this), id = self.data("id"), status = self.data("status"), url = self.data("url");
        if (confirm("您确定要修改该条订单的状态吗？")) {
            jq.ajax({
                type: "post",
                url: url,
                data: "act=modify&id=" + id + "&status=" + status,
                success: function (result) {
                    var data = eval('(' + result + ')');
                    if (data.succ) {
                        alert(data.msg);
                        location.href = window.location.href;
                    }
                    else {
                        alert(data.msg);
                    }
                }
            });
        }
    });
    var myModal = function (url, data) {
        jq("#myModal").find(".modal-body").load(url, data, function () {
            var myModal = jq("#myModal");
            myModal.modal({
                keyboard: true
            });

            jq("#submit").off("click");

            jq("#submit").on("click", function () {
                var formEle = jq("#bankForm"), inputs = formEle.find("input");
                //                 for (var i = 0; i < inputs.length; i++) {
                //                     var obj = inputs.eq(i);
                //                     if (obj.attr("requir") === "" && obj.val() === "") {
                //                         alert(jq("label[for='" + obj.attr("id") + "']").text().replace(/\*|:|：|\s/g, "") + "不能为空");
                //                         obj.focus();
                //                         return false;
                //                     }
                //                 }

                jq.ajax({
                    type: "post",
                    url: formEle.attr("action"),
                    data: formEle.serialize(),
                    success: function (result) {
                        var data = eval('(' + result + ')');
                        if (data.succ) {
                            alert(data.msg);
                            location.href = window.location.href;
                        }
                        else {
                            alert(data.msg);
                        }
                    }
                });
            });
        });
    }
};