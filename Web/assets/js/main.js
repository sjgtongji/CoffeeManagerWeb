var navBorder=function(){if(!!window.ActiveXObject&&!window.XMLHttpRequest){var lastLi=$("#lastNavLi"),nav=$("#Nav"),cont=$("#Contenter"),navLi=nav.find("li"),navHeight=0;if(navLi.length>0){for(var i=0;i<navLi.length-1;i++){navHeight+=navLi.eq(i).height()}if(nav.length>0&&navLi.eq(0).hasClass("active")){nav.css("border-color","#1ebbff")}}if(cont.length>0&&lastLi.length>0){if((cont.height()-navHeight)>0){lastLi.attr("style","min-height:"+(cont.height()-navHeight-1)+"px;_height:"+(cont.height()-navHeight-2)+"px")}}}};var minheight=function(){var Conter=$("#Contenter"),Nav=$("#Nav"),lastNavLi=$("#lastNavLi"),Content=$("#Content"),height1=$(document).height(),height2=$("body").height(),height3=Conter.height(),height4=Nav.height(),height5=Content.height(),minh=0;if(Conter.length>0){if(Nav.length>0&&height4>height3){height3=height4}if(height1>height2){minh=height1-height2+height3-2;Conter.attr("style","min-height:"+minh+"px;_height:"+(minh-3)+"px")}else{Conter.attr("style","min-height:"+height3+"px;_height:"+(height3-3)+"px")}}else{if(Content.length>0&&Nav.length==0){minh=height1-height2+height5;Content.attr("style","min-height:"+minh+"px;_height:"+(minh-4)+"px")}}if(typeof navBorder=="function"){navBorder()}Conter.resize(navBorder)};minheight();$.extend({jsonHandle:function(json){if(json.msg){alert(json.msg)}if(json.url){location.href=json.url}else{if(json.refresh){location.replace(location.href)}else{if(json.popUrl){if($("#popBox").length===0){$("body").append("<div id='popBox' class='popbox dn'></div>")}popWindow("",json.popUrl)}}}},allpass:function(inputs){var allPassed=true;inputs=inputs||$("input,textarea");PlaceHolder._clearValue(inputs);$.remind.hide();inputs.each(function(){var obj=$(this),pattern="",isUntest=false,id=this.id,eleLabel=(id==="")?"":$("label[for='"+id+"']"),remind=(eleLabel==="")?"":eleLabel.text().replace(/\*|:|：|\s/g,"")||"",value=trimAll(this.value,"g"),valid=obj.attr("data-valid"),tip="";if(allPassed===true&&!obj.parents().hasClass("dn")&&((obj.attr("requir")===""&&value==="")||(value!=""))){if(obj.attr("requir")===""&&value===""){tip=remind+"不能为空！"}else{if(valid=="num"){var min=obj.attr("data-min")-0,max=obj.attr("data-max")-0,patte="";value=value-0;if(isNaN(value)){tip="请输入正确的数字！"}else{if(!isNaN(min)&&value-min<0){tip="请输入大于"+min+"的数字！"}else{if(!isNaN(max)&&value-max>0){tip="请输入少于"+max+"的数字！"}else{if((patte=obj.attr("patte"))&&(!(new RegExp(patte).test(value))||parseInt(value)!=value)){tip="请输入正确的数字！"}}}}}else{if((pattern=obj.attr("patte"))&&!new RegExp(pattern).test(value)){var min=obj.attr("data-min")||"",max=obj.attr("data-max")||"",type="";if(valid&&(valid=="text"||valid=="num"||valid=="minMax")){if(valid=="text"){if((max||min)&&value.length>max||value.length<min){if(max&&min==""){tip="字数应少于"+max+"！"}else{if(max==""&&min){tip="最少"+min+"字！"}else{tip="字数应在"+min+"~"+max+"之间！"}}}if(obj.attr("data-format")&&tip==""){tip=remind+"的格式如："+obj.attr("data-format")+"！"}}}else{if(valid=="tele"){tip="请输入正确的座机号码！"}else{if(valid=="phone"){tip="请输入11位数的手机号码！"}}}if(!tip){tip="请输入正确的"+remind+"！"}}}}if(obj.hasClass("Min")){var minVal=0,maxVal=0;if(valid=="num"){if(isNaN(Number(value))){tip="请输入正确的数字！"}else{minVal=Number(value);maxVal=Number(obj.parents(".minMax").find(".Max").val());if(minVal>maxVal){tip=remind+"前者应比后者小！"}}}else{if(valid=="text"&&obj.attr("data-format")=="yyyy-mm-dd"){minVal=value.replace(/-|——/g,"");maxVal=obj.parents(".minMax").find(".Max").val().replace(/-|——/g,"");if((pattern=obj.attr("patte"))&&!new RegExp(pattern).test(value)){tip="请输入正确的时间<br/>格式："+obj.attr("data-format")+"！"}else{if(minVal>maxVal){tip=remind+"前者应比后者小！"}}}}}}if(tip){$.remind.show(obj,tip);allPassed=false;obj.focus();setTimeout(function(){$.remind.hide()},4000);return allPassed}});return allPassed},remind:{show:function(obj,tip){var offset=obj.offset(),top=offset.top+obj.height()+10,left=offset.left;var style="top:"+top+"px;left:"+left+"px;";obj.after("<div id='Remind' class='remind'>"+tip+"</div>");$("#Remind").offset({top:top,left:left})},hide:function(){$("#Remind").remove()}},form:function(form,success){var formEle=$(form);if(formEle.attr("data-flag")==="true"){return false}formEle.attr("data-flag","true");$.ajax({url:form.action,type:form.method||"POST",data:$(form).serialize(),dataType:"json",success:function(json){$.jsonHandle(json);if(typeof success==="function"){success.call(form,json)}formEle.removeAttr("data-flag")},error:function(){alert("由于网络的原因，您刚才的操作没有成功。");formEle.removeAttr("data-flag")}})},ajaxFn:function(obj,ur,val,success){var ele=$(obj);if(ele.attr("data-flag")==="true"){return false}ele.attr("data-flag","true");$.ajax({url:ur,type:"POST",data:val,dataType:"json",success:function(json){$.jsonHandle(json);if(typeof success==="function"){success.call(obj,json)}ele.removeAttr("data-flag")},error:function(){alert("由于网络的原因，您刚才的操作没有成功。");ele.removeAttr("data-flag")}})},overlay:{show:function(){var eleOverlay=$("#overlay"),height=$(document).height();if(eleOverlay.length===1){eleOverlay.show().css("height",height+"px")
}else{$("body").append($('<div id="overlay" class="overlay dn" style="height:'+height+'px;"></div>'));$("#overlay").show()}},hide:function(){$("#overlay").remove()}},lazyload:function(elements,success){var cache=[],success=success||function(){};elements.each(function(){var node=this.tagName.toLowerCase(),url=$(this).attr("data-url");cache.push({ele:this,tag:node,url:url})});var loading=function(){var scrollTop=$.scrollTop(),clientHeight=$.clientHeight();$.each(cache,function(index,obj){if(!obj.ele){return}var offsets=$(obj.ele).offset();if(offsets.top>scrollTop-offsets.height&&offsets.top<scrollTop+clientHeight){if(obj.url&&obj.tag==="img"){obj.ele.src=obj.url;success.call(obj.ele)}else{success.call(obj.ele)}obj.ele=null}})};loading();setTimeout(loading,500);$(window).bind("scroll",loading)},cusConfirm:function(title,msg,yesText,noText,fun1,fun2){var loading=$("#popBox");if(loading.length==0){$("body").append("<div class='popbox dn' id='popBox'></div>");loading=$("#popBox")}loading.load("/weixin/Confirm",function(){var obj=$(this),scrollY=getViewportScrollY(),width=document.body.offsetWidth,winWidth=loading.width();obj.css("top",(scrollY+120));obj.css("left",(width-winWidth)/2);$.overlay.show();obj.removeClass("dn");obj.find(".cnfrm_title").html(title);obj.find(".cnfrm_msg").html(msg);if(title==""){obj.find(".cnfrm_hr").addClass("dn")}else{$(".cnfrm_title").attr("style","background: #1ebbff")}obj.find(".cnfrm_yes").text(yesText==""?"确定":yesText);obj.find(".cnfrm_no").text(noText==""?"取消":noText);$(".cnfrm_yes").bind("click",function(){if(typeof fun1=="function"){fun1()}loading.html("");loading.addClass("dn");$.overlay.hide()});$(".cnfrm_no").bind("click",function(){if(typeof fun2=="function"){fun2()}loading.html("");loading.addClass("dn");$.overlay.hide()})})}});var trimAll=function(str,is_global){var result;result=str.replace(/(^\s+)|(\s+$)/g,"");if(is_global.toLowerCase()=="g"){result=result.replace(/\s/g,"")}return result};var selectcity=function(u1,data1,data2){var addcity=$(".addCity"),index="";var jsoneach=function(obj,thisid,json,sum){var sum1=0+sum*1,sum2=1+sum*1;var htm="<li data-vale='请选择' class='ell'>请选择</li>",htm2=htm;var selected=obj.find("input").eq(sum1).val();var selected2=obj.find("input").eq(sum2).val();var foreach=function(i){if(json[i].sub!=""&&json[i].sub!=null){for(var j=0;j<json[i].sub.length;j++){if(json[i].sub[j].id==selected2){obj.find(".sText").eq(sum2).text(json[i].sub[j].name)}htm2+="<li data-vale='"+json[i].sub[j].id+"' class='ell'>"+json[i].sub[j].name+"</li>"}if(thisid==""){if(obj.find(".sText").eq(sum2).text()==""){obj.find(".sText").eq(sum2).text("请选择");obj.find("input").eq(sum2).val("请选择")}}else{obj.find(".sText").eq(sum2).text("请选择");obj.find("input").eq(sum2).val("请选择")}}};if(json!=""&&json!=null){if(thisid==""){for(var i=0;i<json.length;i++){if(json[i].id==selected){obj.find(".sText").eq(sum1).text(json[i].name);foreach(i)}htm+="<li data-vale='"+json[i].id+"' class='ell'>"+json[i].name+"</li>"}if(obj.find(".sText").eq(sum1).text()==""){obj.find(".sText").eq(sum1).text("请选择");obj.find("input").eq(sum1).val("请选择")}obj.find(".selBox").eq(sum1).html(htm);obj.find(".selBox").eq(sum2).html(htm2)}else{for(var i=0;i<json.length;i++){if(json[i].id==thisid){foreach(i)}}obj.find(".selBox").eq(sum2).html(htm2)}}};var jdata="",summ="";var eachdata=function(obj){if(obj.data("type")=="city"){jdata=data1;summ=1}else{jdata=data2;summ=0}};addcity.each(function(e){eachdata(addcity.eq(e));jsoneach(addcity.eq(e),"",jdata,summ);addcity.eq(e).delegate(".customSel","click",function(){$(this).delegate("li","click",function(event){var obj=$(this);var vale=obj.data("vale");var parents=obj.parents(".customSel");var add=obj.parents(".addCity");var sumn=add.find(".customSel").index(this);var sumn=addcity.eq(e).find(".customSel").index($(this).parents(".customSel"));var thisid=$(this).attr("data-vale");if(!obj.hasClass("City")){parents.find(".sText").text(obj.text());parents.find("input[type='hidden']").val(vale);$("#popBlock").addClass("dn");parents.find(".selBox").addClass("dn");eachdata(addcity.eq(e));jsoneach(addcity.eq(e),thisid,jdata,sumn);event.stopPropagation();$(this).parents(".customSel").undelegate()}})})});var showselect=function(select,down){var name="",hid="",stext="",index=0,box="",block=$("#popBlock")||null;var wrap=$("#popBox").length==0?$(document):$("#popBox");block.css("width",wrap.width());block.css("height",wrap.height());block.css("z-index",1);zIndex(select);$("."+select).each(function(){var objSel=$(this);objSel.unbind();objSel.bind("click",function(){var obj=$(this);box=obj.find("."+down);index=$("."+select).index(this);name=obj.data("name");hid=obj.find("input[type='hidden']");stext=obj.find(".sText");if(block.hasClass("dn")){block.removeClass("dn")}else{block.addClass("dn")}if(box.hasClass("dn")){$("."+down).addClass("dn");box.removeClass("dn")}else{box.addClass("dn")}})});block.bind("click",function(){if(!block.hasClass("dn")){block.addClass("dn");$("."+down).addClass("dn")
}})};showselect("customSel","selBox")};var favorable=function(){var favedit=$(".favEdit"),favdelete=$(".favDelete"),favadd=$("#favAdd");favadd.bind("click",function(){var href=$(this).attr("href");window.location.href=href});favedit.bind("click",function(){var href=$(this).attr("href"),val="aname="+$(this).siblings("input").val();window.location.href=href+"?"+val});favdelete.bind("click",function(){var $this=$(this),val="aname="+$this.siblings("input").val();$.ajaxFn($this,"ajax/msg.asp",val,function(){$this.closest("li").remove()})})};var zIndex=function(pram){var zindex=$(".customSel").length+1;$("."+pram).each(function(){var obj=$(this),input=obj.find("input[type='hidden']"),val=input.val(),flag=false;$(this).css("z-index",zindex);zindex--;if(val){obj.find(".selBox li").each(function(){var obj1=$(this);if(obj1.attr("data-vale")==val){obj.find(".sText").html(obj1.text());flag=true}})}if(flag==false){obj.find(".sText").html(obj.find(".selBox li").eq(0).text());input.val(obj.find(".selBox li").eq(0).attr("data-vale"))}})};var showselect=function(select,down,url,callback,id){var name="",href="",ajax="",hid="",stext="",index=0,box="",block="",toFalse=true,wrap=$("."+select).parents("#popBox").length==0?$("body"):$("#popBox");if($("#popBlock").length==0){if($("."+select).parents("#popBox").length==0){$("#Footer").before("<div id='popBlock' class='popblock dn'></div>")}else{$("."+select).parents("#popBox").append("<div id='popBlock' class='popblock dn'></div>")}}block=$("#popBlock")||"";block.css("width",wrap.width());block.css("height",wrap.height());block.css("z-index",1);zIndex(select);$("."+select).each(function(){var objSel=$(this);objSel.unbind();objSel.bind("click",function(){var obj=$(this);toFalse=true;box=obj.find("."+down);index=$("."+select).index(this);name=obj.data("name");ajax=obj.data("ajax");hid=obj.find("input[type='hidden']");stext=obj.find(".sText");if(block.hasClass("dn")){block.removeClass("dn")}else{block.addClass("dn")}if(box.hasClass("dn")){$("."+down).addClass("dn");box.removeClass("dn")}else{box.addClass("dn")}if(toFalse==true){toFalse=false;eachli()}})});block.bind("click",function(){if(!block.hasClass("dn")){block.addClass("dn");$("."+down).addClass("dn");toFalse=true}});var eachli=function(){$("."+down).eq(index).delegate("li","click",function(event){var obj=$(this);var vale=obj.data("vale");var val="href="+vale+"&name="+name;stext.text(obj.text());if(ajax&&toFalse==false&&vale!=hid.val()){$.ajaxFn(obj,url,val,function(){if(typeof callback=="function"){callback.call(this)}})}else{if(obj.parents("."+select).attr("data-type")=="res"){$("#sourceLoad").load(url+(url.indexOf("?")==-1?"?":"&")+"resId="+vale,function(){if(typeof callback=="function"){callback.call(this)}showselect(select,down,url,callback,id)})}else{if(typeof callback=="function"){callback.call(this)}}}hid.val(vale);block.addClass("dn");box.addClass("dn");event.stopPropagation();$("."+down).eq(index).undelegate();toFalse=true})}};var album=function(u1,u2,u3,u4){var settype=$("#setType"),hid=$("#hidSType"),hidv=$("#hidSType").val();onetwo=$("#oneTwo"),picname="",picrank="",type="edit",index="",site="",snum="0",slide="",picbox=$("#picBox");if(hidv){settype.find("li").removeClass("active");settype.find("li").eq(hidv).addClass("active")}settype.delegate(".radioCheck","click",function(){var conf=confirm("您确定要切换风格吗？");var index=settype.find(".radioCheck").index(this);var val="setType="+index+"&isalert=false";var $this=$(this);if(conf){$.ajaxFn($this,u1,val,function(){$(".radioCheck").find("span").removeClass("checked");$this.find("span").addClass("checked");hid.val(index)})}});onetwo.delegate(".delPic","click",function(){var $this=$(this);var id=$this.attr("id");var val="picName="+$this.siblings("input[type='hidden']").val()+"&id="+id;$.ajaxFn($this,u2,val,function(json){if(json.succ){window.location.reload()}})});onetwo.delegate(".addPic","click",function(){var $this=$(this);type=$this.attr("data-type");index=$(".intrEdit").index(this);picbox.load(u4,function(){$("#hidwh").val("");if(type=="add"){$("#picMove").hide();$("#a_top").hide();$("#a_up").hide();$("#a_next").hide()}else{var img=$this.closest("li").find("img").attr("src");var text=$this.closest("li").find(".alTit").text();picname=$this.siblings("input[name='typeName']").val();picrank=$this.siblings("input[name='typeRank']").val();if(picrank=="True"||picrank==true){$("#a_first").addClass("active").siblings().removeClass("active");snum=1}else{$("#a_first").removeClass("active");snum=0}$("#uploadPicImg").attr("src",img);$("#uppicImg").val(img);$("#areaAdd").val(text)}swfUploadFun();$(".swfupload").addClass("swfpos");$.overlay.show();picbox&&picbox.show();PlaceHolder.init()})});picbox.delegate(".picmove a","click",function(){var obj=$(this),d_type=obj.attr("data-type"),hidinput=$("#hidSlideVal"),input=$(".picmove").find("input[type=text]"),min=hidinput.data("min"),max=hidinput.data("max"),slide=hidinput.val();if(!obj.hasClass("active")){obj.parent(".picmove").find("a").removeClass("active");
obj.addClass("active")}else{obj.removeClass("active")}if(d_type=="TUNext"){site=$(".picmove").find("a").index(this)+1}else{snum=0;if(min<=slide&&slide<max&&obj.hasClass("active")){snum=1}else{if(slide<min||slide>=max){if(obj.hasClass("active")){alert("数量大于最大限制,不能设置了！");obj.removeClass("active")}return}}}});picbox.delegate("#savePic","click",function(){var imgv=$.trim($("#uppicImg").val());var areaadd=$("#areaAdd");var texta=encodeURIComponent($.trim(areaadd.val()));var val="imgsrc="+imgv+"&textarea="+texta+"&"+$("#hidwh").val()+"&snum="+snum+"&slide="+slide+"&type="+type+"&site="+site,$this=$(this);if(picname!=""&&picrank!=""){val+="&picname="+picname+"&picrank="+picrank}if(imgv==""){alert("请选择图片！");return}if($.allpass()){$.ajaxFn($this,u3,val,function(json){if(json.succ){ie6reload(picbox)}})}else{PlaceHolder.init()}});$("#cancelPic").live("click",function(){ie6reload(picbox)})};var ie6reload=function(obj){obj.hide();$.overlay.hide();if(swfu){swfu.destroy()}};var introduce=function(u1,u2,u3,u4){var obj2=$("#introBox"),type=$("#picHtm"),hidtype=$("#hidType"),index="",nameId="",introbox=$("#introBox"),picedit=$("#picEdit"),htmedit=$("#htmEdit");$("#intrLi").delegate(".deleteIntro","click",function(){var $this=$(this),val="name="+$this.closest("li").find("input[type='hidden']").val()+"&wxid="+$("#hidId").val();if(confirm("您确认要删除？")){$.ajaxFn($this,u1,val,function(){$this.closest("li").remove()})}});$("#picType").delegate("li","click",function(){var $this=$(this);if(!$this.hasClass("res_tab_on")){if(confirm("数据还未保存，您确认要切换吗？")){if(picedit.is(":hidden")){type.val("pic");picedit.show();htmedit.hide()}else{if(htmedit.is(":hidden")){type.val("htm");picedit.hide();htmedit.show()}}$this.addClass("res_tab_on").siblings().removeClass("res_tab_on")}}});picedit.delegate(".intrEdit","click",function(){var $this=$(this);index=$(".intrEdit").index(this)-1;obj2.load(u4,function(){if($this.attr("data-btn")=="add"){hidtype.val("add")}else{hidtype.val("edit");var img=$this.closest("li").find("img").attr("src");var text=$this.closest("li").find("textarea").val();nameId=$this.closest("li").find("input[type='hidden']").val();$("#uploadPicImg").attr("src",img);$("#uppicImg").val(img);$("#areaAdd").val(text)}swfUploadFun();$(".swfupload").addClass("swfpos");$.overlay.show();introbox&&introbox.show();PlaceHolder.init()})});$("#cancelInt").bind("click",function(){window.location.reload()});$("#cancelAdd").live("click",function(){ie6reload(obj2)});$("#saveInt").bind("click",function(){var type=$("#picHtm").val();var wxid=$("#hidId").val();if(type=="pic"){var picval="",off=true;$(".picVal").each(function(){if($(this).find(".textVal").val()==""){alert("内容不能为空！");off=false;return false}picval+=$(this).find(".imgVal").attr("src")+"|*|"+$(this).find(".textVal").val()+"|*|"+$(this).find("input[type='hidden']").val()+"#*#"});picval="wxid="+wxid+"&type="+type+"&content="+picval.substring(0,picval.length-3);if(off){$.ajaxFn($(this),u2,picval,function(){window.location.reload()})}}else{if(type=="htm"){var oEditor=CKEDITOR.instances.htmlText;var htmtxt=$.trim(oEditor.getData());var _con={"wxid":wxid,"type":type,"content":htmtxt};$.ajaxFn($(this),u2,_con,function(){window.location.reload()})}}});obj2.delegate("#saveAdd","click",function(){var imgv=$.trim($("#uppicImg").val());var areaadd=$("#areaAdd");var texta=$.trim(areaadd.val());var val="imgsrc="+imgv+"&textarea="+texta,$this=$(this);$this.attr("data-flag","false");if(nameId!=""){val+="&nameId="+nameId}if(imgv==""){alert("请选择图片！");return}if($.allpass()){$.ajaxFn($this,u3,val,function(){obj2.hide();areaadd.val("");$.overlay.hide();if(hidtype.val()=="add"){var htmli="<li class='mt30 mlr50 bbe2 pb10'><div class='ovh picVal'><img class='l mr15 imgVal' src='"+imgv+"'  alt='' width='120' height='120' /><span class='well'><textarea name='' id='' class='ta wp75 h110 r textVal' placeholder='图片名称'>"+texta+"</textarea><input type='hidden' value='n1' /></span></div><div class='ovh pt5'><a class='intrEdit tdu w120 l tc dib' href='javascript:'>修改</a><a class='btn6b r mr20 deleteIntro' href='javascript:'>删除</a></div></li>";$("#intrLi").prepend(htmli)}else{if(hidtype.val()=="edit"){$(".textVal").eq(index).val(texta);$(".imgVal").eq(index).attr("src",imgv)}}})}else{PlaceHolder.init()}})};var eleDelPic=function(){swfUploadFun();if(!$("#delPic")){return}$("#uploadPic").delegate("#delPic","click",function(){$("#uploadPic").html("");$("#uploadSwfWrap").show()})};var swfu,swfUrl;var swfUploadFun=function(){var fileQueued=function(file){$("#progressBar").html("准备上传")},fileQueueError=function(file,errorCode,message){switch(errorCode){case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:alert("您最多一次性上传"+settings_object.file_queue_limit+"张照片。");break;case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:alert("您上传的图片"+file.name+"大小不能超过"+Math.floor(parseInt(settings_object.file_size_limit)/1024)+"M.");break;case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:alert("您上传了空文件。");break;case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:alert("文件类型不支持。");
break;default:alert("抱歉，出现未知错误。");break}return this},fileDialogComplete=function(){this.startUpload()},uploadComplete=function(){},uploadStart=function(){$("#progressBar").html("开始上传")},uploadProgress=function(file,curBytes,totalBytes){$("#progressBar").html("文件名:"+file.name+"总尺寸:"+totalBytes+"B"+"已上传:"+curBytes+"B"+"进度:"+parseInt((curBytes/totalBytes)*100)+"%")},uploadSuccess=function(file,serverData){var json=eval("("+serverData+")"),pcShow=$(".pc_show");if(json.succ=="True"){$("#progressBar").html("图片："+file.name+"上传成功!");$("#uploadPicImg").attr("src",json.imagesrc);$("#uppicImg").val(json.imagesrc);if(pcShow.length){pcShow.find("img").attr("src",json.imagesrc)}if(typeof changeImgFn=="function"){changeImgFn(json.imagesrc)}}else{if(json.succ=="False"){alert(json.msg);$("#progressBar").html(json.msg)}}$("#hidwh")&&$("#hidwh").val("w="+json.w+"&h="+json.h)},settings_object={upload_url:$("#uploadSwfWrap").attr("data-url"),flash_url:swfUrl,file_size_limit:"10240",file_types:"*.jpg;*.jpeg;*.png;*.gif",file_types_description:"照片文件",file_post_name:"uploadPic",file_upload_limit:20,file_queue_limit:10,button_placeholder_id:"uploadSwf",button_width:$("#uploadSwfWrap").width()!=0?$("#uploadSwfWrap").width():30,button_height:$("#uploadSwfWrap").height()!=0?$("#uploadSwfWrap").height():20,button_image_url:$("#uploadSwfWrap").attr("data-img"),button_cursor:SWFUpload.CURSOR.HAND,button_window_mode:SWFUpload.WINDOW_MODE.TRANSPARENT,file_queued_handler:fileQueued,file_queue_error_handler:fileQueueError,file_dialog_complete_handler:fileDialogComplete,upload_complete_handler:uploadComplete,upload_start_handler:uploadStart,upload_progress_handler:uploadProgress,upload_success_handler:uploadSuccess};swfu=new SWFUpload(settings_object)};var swfUploadFileFun=function(target,ele,callback){var fileType=ele.fileType||"*.jpg;*.jpeg;*.png;*.gif",target=$("#"+target),uploadSwfWrap=target.find(".uploadSwfWrap"),progressBar=target.find(".progressBar"),uppicImg=target.find(".uppicImg"),fileSize=ele.fileSize||"10240",show=target.attr("data-show")?$("#"+target.attr("data-show")):"";var fileQueued=function(file){progressBar.html("准备上传")},fileQueueError=function(file,errorCode,message){switch(errorCode){case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:alert("您最多一次性上传"+settings_object.file_queue_limit+"张照片。");break;case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:alert("您上传的图片"+file.name+"大小不能超过"+Math.floor(parseInt(settings_object.file_size_limit)/1024)+"M.");break;case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:alert("您上传了空文件。");break;case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:alert("文件类型不支持。");break;default:alert("抱歉，出现未知错误。");break}return this},fileDialogComplete=function(){this.startUpload()},uploadComplete=function(){},uploadStart=function(){progressBar.html("开始上传")},uploadProgress=function(file,curBytes,totalBytes){progressBar.html("文件名:"+file.name+"总尺寸:"+totalBytes+"B"+"已上传:"+curBytes+"B"+"进度:"+parseInt((curBytes/totalBytes)*100)+"%")},uploadSuccess=function(file,serverData){var json=eval("("+serverData+")");json.succ="True";if(json.succ=="True"){progressBar.html(file.name+"上传成功!");if(show){show.attr("src",json.imagesrc)}if($.isFunction(callback)){callback.call(target,json)}else{uppicImg.val(json.imagesrc)}}else{if(json.succ=="False"){alert(json.msg);progressBar.html(json.msg)}}},settings_object=ele.setting||{upload_url:uploadSwfWrap.attr("data-url"),flash_url:swfUrl,file_size_limit:fileSize,file_types:fileType,file_types_description:"文件",file_post_name:"uploadPic",file_upload_limit:20,file_queue_limit:10,button_placeholder_id:"uploadSwf",button_width:uploadSwfWrap.width()!=0?uploadSwfWrap.width():30,button_height:uploadSwfWrap.height()!=0?uploadSwfWrap.height():20,button_image_url:uploadSwfWrap.attr("data-img"),button_cursor:SWFUpload.CURSOR.HAND,button_window_mode:SWFUpload.WINDOW_MODE.TRANSPARENT,file_queued_handler:fileQueued,file_queue_error_handler:fileQueueError,file_dialog_complete_handler:fileDialogComplete,upload_complete_handler:uploadComplete,upload_start_handler:uploadStart,upload_progress_handler:uploadProgress,upload_success_handler:uploadSuccess};swfu=new SWFUpload(settings_object)};var xmsLoginResit=function(){var eleLoginForm=$("#loginForm"),eleLoginName=$("#loginName"),eleLoginPass=$("#loginPass"),eleLoginBtn=$("#loginBtn");var name="",pass="";eleLoginForm.attr("data-flag","false");try{name=window.localStorage&&localStorage.getItem("name"),pass=window.localStorage&&localStorage.getItem("pass")}catch(err){}if(name){eleLoginName.val(decodeURIComponent(name))}if(pass){eleLoginPass.val(decodeURIComponent(pass));$("#noLoginVal").val("1");$("#noLogin").removeClass("re_off").addClass("re_on")}eleLoginBtn.bind("click",function(){if($.allpass()){try{if(window.localStorage){localStorage.setItem("name",encodeURIComponent(eleLoginName.val()))}if(window.localStorage&&$("#noLoginVal").val()==1){localStorage.setItem("pass",encodeURIComponent(eleLoginPass.val()))}else{if(window.localStorage&&$("#noLoginVal").val()==0){localStorage.removeItem("pass")
}}}catch(err){}$.form(eleLoginForm.get(0))}return false});collectFn($("#noLogin"),$("#noLoginVal"),"re_off","re_on")};var collectFn=function(obj,obj2,classN,classN2,urlV,text){if(!obj||!obj2||!classN||!classN2){return}var oVal;var classTag=function(){oVal=obj2.val();if(oVal==0){obj.removeClass(classN).addClass(classN2);oVal=obj2.val("1")}else{if(oVal==1){obj.removeClass(classN2).addClass(classN);oVal=obj2.val("0")}}};obj.bind("click",function(){classTag();if(!!urlV){var txt=text||"由于网络的原因，您刚才的操作没有成功。";$.ajax({url:urlV,type:"POST",data:oVal,dataType:"json",success:function(json){$.overlay.hide();$.jsonHandle(json);if(json.succ==false){classTag()}},error:function(){classTag();$.overlay.hide();alert(txt)}})}})};var PlaceHolder={_support:(function(){return"placeholder" in document.createElement("input")})(),init:function(){if(!PlaceHolder._support){var inputs=$("input,textarea");PlaceHolder.create(inputs)}},create:function(inputs){if(inputs.length){inputs.each(function(){var input=$(this);if(!PlaceHolder._support&&input.attr("placeholder")){PlaceHolder._setValue(input);input.bind("focus",function(e){var obj=$(this);if(obj.val()===obj.attr("placeholder")){obj.val("")}});input.bind("blur",function(e){var obj=$(this);if(obj.val()===""){PlaceHolder._setValue(obj)}})}})}},_setValue:function(input){if(input.val()==""){input.val(input.attr("placeholder"))}},_clearValue:function(inputs){if(!PlaceHolder._support){inputs.each(function(){var input=$(this);if(input.val()==input.attr("placeholder")){input.val("")}})}}};PlaceHolder.init();