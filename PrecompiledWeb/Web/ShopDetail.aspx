<%@ page language="C#" masterpagefile="~/MasterPage.master" autoeventwireup="true" inherits="ShopDetail, App_Web_shopdetail.aspx.cdcab7d2" %>

<%@ Register Src="~/Control/LeftBar_Activity.ascx" TagPrefix="LeftBar" TagName="LeftActBar" %>
<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="Server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="Server">
    <div id="main-container" class="main-container">
        <div class="main-container-inner">
            <LeftBar:LeftActBar runat="server" ID="leftBar" />
            <div class="main-content">
                <div id="breadcrumbs" class="breadcrumbs">
                    <ul class="breadcrumb">
                        <li><i class="icon-home home-icon"></i><a href="#"><%=ShowName%></a> </li>
                    </ul>
                </div>
                <div class="page-content">
                    <div class="page-header">
                        <h1>
                            <%=ShowName%>
                        </h1>
                    </div>
                    <div class="row">
                        <div class="col-xs-12">
                        <div id="Contenter" class="contenter cell fs14 query_order">
                            <form class="form-horizontal" id="resForm">
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="name">
                                        商店名称*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="name" name="name" placeholder="商店名称" value="<%=restaurant != null ? restaurant.name : string.Empty%>" required />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="address">
                                        商品地址：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="address" name="address" value="<%=restaurant != null ? restaurant.address : string.Empty%>" />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="longitude">
                                        经度*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="longitude" name="longitude" value="<%=restaurant != null ? (restaurant.longitude.HasValue ? restaurant.longitude.Value : 0 ) : 0%>" required data-valid="num" patte="" data-min="0" data-max="999999.999999"/>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="latitude">
                                        纬度*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="latitude" name="latitude" value="<%=restaurant != null ? (restaurant.latitude.HasValue ? restaurant.latitude.Value : 0 ) : 0%>" required data-valid="num" patte="" data-min="0" data-max="999999.999999"/>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="cityId">
                                        城市：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="cityId" name="cityId" value="<%=restaurant != null ? restaurant.cityId : string.Empty%>" />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="remark">
                                        备注：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="remark" name="remark" value="<%=restaurant != null ? restaurant.remark : string.Empty%>"  />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="allowedDistance">
                                        配送范围（千米）*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="allowedDistance" name="allowedDistance" value="<%=restaurant != null ? restaurant.allowedDistance.ToString("#0.00") : string.Empty%>" required data-valid="num" patte="" data-min="0" data-max="999999.99"/>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="serverFee">
                                        服务费（配送费）*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="serverFee" name="serverFee" value="<%=restaurant != null ? restaurant.serverFee.ToString("#0.00") : string.Empty%>" required data-valid="num" patte="" data-min="0" data-max="999999.99"/>
                                    </div>
                                </div>
                               <%-- <div class="form-group">
                                    <label class="col-sm-2 control-label" for="imgUrl">
                                        图片*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="imgUrl" name="imgUrl" value="<%=restaurant != null ? restaurant.imgUrl : string.Empty%>" required />
                                    </div>
                                </div>--%>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="contactNumber">
                                        联系人（多个使用分号分隔）：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="contactNumber" name="contactNumber" value="<%=restaurant != null ? restaurant.contactNumber : string.Empty%>" />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="state">
                                        是否上线：</label>
                                    <div class="col-sm-10">
                                        <label class="checkbox-inline">
                                            <input type="checkbox" name="state" id ="state" <%=restaurant != null ? (restaurant.state == 1 ? " checked='checked'" : ""): "" %> />
                                        </label>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="uploadPicImg">商店图片：</label>
                                    <span id="uploadPic" class="tc dib">
                                                <%
                                                    if (restaurant != null && !string.IsNullOrWhiteSpace(restaurant.imgUrl))
                                                    {
                                                        string image = "<img src='" + restaurant.imgUrl + "' " + "id='uploadPicImg' name='uploadPicImg'" + "alt=''" + "width='64' height='64'>" + "<a href='javascript:'" + "id='delPic'" + "class='f12 fs g6 db pt2'>更改图片</a>";
                                                        Response.Write(image);
                                                    }
                                                %>
                                    </span>
                                    <!-- 无图片状态 -->
                                    <!-- 这里是上传图片的地址 -->
                                     <% if (restaurant == null || string.IsNullOrWhiteSpace(restaurant.imgUrl))
                                       {%>
                                        <span id="uploadSwfWrap" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/PicUploadFlash.aspx"><span id="uploadSwf"></span>
                                     <%}
                                       else
                                       { %>
                                        <span id="uploadSwfWrap" style="display:none;" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/PicUploadFlash.aspx"><span id="uploadSwf"></span>
                                     <%} %>
                                    </span><span id="progressBar" class="db fs f12 pt5"></span>
                                    <input type="hidden" id="uppicImg" name="PicUrl" value="<%=restaurant != null ? restaurant.imgUrl : string.Empty%>" />
                                </div>

                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="">
                                        &nbsp;</label>
                                    <div class="col-sm-10">
                                        <button class="btn btn-info" id="submitForm" style="border: none;" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/shopManagerAjax.aspx?act=save&shopId=<%=ShopId%>">
                                            提交</button>
                                        <button class="btn btn-info" id="back" style="border: none;">
                                            关闭</button>
                                    </div>
                                </div>
                            </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="FootContent" runat="Server">
    <script src="assets/js/swfupload.js" type="text/javascript"></script>
    <script src="assets/js/freerespic.js" type="text/javascript"></script>
    <script type="text/javascript">

        swfUrl = "Swf/swfupload.swf";
        eleDelPic();
//        var uploadEle = $(".upload");

//        if (uploadEle.length) {
//            $.each(uploadEle, function (index, ele) {
//                var obj = $(ele), upswf = obj.find(".uploadSwf"),
//			        type = obj.attr("data-type");
//                upswf.addClass("dn");
//                if (type) {
//                    swfUploadFileFun(ele.id, { fileType: type, fileSize: '102400' }, function (json) {
//                        var obj = $(this), show = obj.attr("data-show"), src = json.src || "";

//                        if (show) {
//                            $("#" + show).attr("src", src);
//                        }
//                        if (json.Url) {
//                            $("#pathhref").attr("href", json.Url).show();
//                            obj.find("#path").val(json.Url);
//                            obj.find("#md5").val(json.Md5);
//                        }
//                    });
//                }
//                setTimeout(function () {
//                    $(ele).find(".swfupload").addClass("swfpos");
//                    upswf.removeClass("dn");
//                }, 300);
//            })
//        }



        $(function () {
            $("#back").on("click", function () {
                location.href = "<%=Business.CoffeePage.VirtulName %>/ShopManage.aspx";
                return false;
            })

            $("#submitForm").on("click", function (event) {
                $.ajax({
                    url: $(this).attr("data-url"),
                    type: "post",
                    dataType: "json",
                    data: $("#resForm").serialize(),
                    success: function (result) {
                        ajaxSuccess(result);
                    }
                });
                event.preventDefault();
            });

            function ajaxSuccess(result) {
                var data = eval(result);
                if (data.msg) {
                    alert(data.msg);
                }
                if (data.url) {
                    window.location.href = data.url;
                }
                else {
                    if (data.refresh) {
                        window.location.reload(data.refresh);
                    }
                }
            }
        })
    </script>
</asp:Content>

