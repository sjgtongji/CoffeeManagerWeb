<%@ Page Language="C#" masterpagefile="~/MasterPage.master"  AutoEventWireup="true" CodeFile="CommodityDetail.aspx.cs" Inherits="CommodityDetail" %>

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
                                    <label class="col-sm-2 control-label" for="chineseName">
                                        商品名称（中文）*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="chineseName" name="chineseName" placeholder="商店名称" value="<%=commodityDTO != null ? commodityDTO.chineseName : string.Empty%>" required />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="englishName">
                                        商品名称（英文）：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="englishName" name="englishName" value="<%=commodityDTO != null ? commodityDTO.englishName : string.Empty%>" />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="price">
                                        价格：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="price" name="price" value="<%=commodityDTO != null ? (commodityDTO.price.HasValue ? commodityDTO.price.Value.ToString("#0.00") : "0"): "0"%>"  required data-valid="num" patte="" data-min="0" data-max="999999.99"/>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="sort">
                                        排序权重*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="sort" name="sort" value="<%=commodityDTO != null ? (commodityDTO.sort.HasValue ? commodityDTO.sort.Value : 0): 0%>" required data-valid="num" patte="" data-min="0" data-max="999999"/>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="commodityCategoryUUID">
                                        商品类别*：</label>
                                    <div class="col-sm-3">
                                        <select name="commodityCategoryUUID">
                                            <%listCommodityCategoryInfo.ForEach(item =>
                                            {%>
                                                <option value="<%=item.commodityCategoryUUID%>" <%=item.commodityCategoryUUID== (commodityDTO == null ? string.Empty : commodityDTO.commodityCategoryUUID)?"selected=\"selected\"":"" %>><%=item.chineseName%></option>
                                            <%});%>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="state">
                                        是否上线：</label>
                                    <div class="col-sm-10">
                                        <label class="checkbox-inline">
                                            <input type="checkbox" name="state" id ="state" <%=commodityDTO != null ? (commodityDTO.state == 1 ? " checked='checked'" : ""): "" %> />
                                        </label>
                                    </div>
                                </div>  
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="preferentialFlag">
                                        是否优惠：</label>
                                    <div class="col-sm-10">
                                        <label class="checkbox-inline">
                                            <input type="checkbox" name="preferentialFlag" id ="preferentialFlag" <%=commodityDTO != null ? (commodityDTO.preferentialFlag == true ? " checked='checked'" : ""): "" %> />
                                        </label>
                                    </div>
                                </div>  
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="preferentialQuantity">
                                        优惠数量：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="preferentialQuantity" name="preferentialQuantity" value="<%=commodityDTO != null ? (commodityDTO.preferentialQuantity.HasValue ? commodityDTO.preferentialQuantity.Value : 0): 0%>" data-valid="num" patte="" data-min="0" data-max="999999"/>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="preferentialProportion">
                                        优惠百分比：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="preferentialProportion" name="preferentialProportion" value="<%=commodityDTO != null ? (commodityDTO.preferentialProportion.HasValue ? commodityDTO.preferentialProportion.Value.ToString("#0.00") : string.Empty): string.Empty%>" data-valid="num" patte="" data-min="0" data-max="999999"/>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="remark">
                                        备注：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="remark" name="remark" value="<%=commodityDTO != null ? commodityDTO.remark: string.Empty%>"/>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="uploadPicImg">商店图片：</label>
                                    <span id="uploadPic" class="tc dib">
                                                <%
                                                    if (commodityDTO != null && !string.IsNullOrWhiteSpace(commodityDTO.picPath))
                                                    {
                                                        string image = "<img src='" + commodityDTO.picPath + "' " + "id='uploadPicImg' name='uploadPicImg'" + "alt=''" + "width='64' height='64'>" + "<a href='javascript:'" + "id='delPic'" + "class='f12 fs g6 db pt2'>更改图片</a>";
                                                        Response.Write(image);
                                                    }
                                                %>
                                    </span>
                                    <!-- 无图片状态 -->
                                    <!-- 这里是上传图片的地址 -->
                                    <% if (commodityDTO == null || string.IsNullOrWhiteSpace(commodityDTO.picPath))
                                       {%>
                                   <span id="uploadSwfWrap" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/PicUploadFlash.aspx"><span id="uploadSwf"></span>
                                   <%}
                                       else
                                       { %>
                                        <span id="uploadSwfWrap" style="display:none;" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/PicUploadFlash.aspx"><span id="uploadSwf"></span>
                                        <%} %>
                                    </span><span id="progressBarSpan2db fs f12 pt5"></span>
                                    <input type="hidden" id="uppicImg" name="PicUrl" value="<%=commodityDTO != null ? commodityDTO.picPath : string.Empty%>" />
                                </div>
                                    
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="">
                                        &nbsp;</label>
                                    <div class="col-sm-10">
                                        <%if(ErrFlag == false) {%>
                                        <button class="btn btn-info" id="submitForm" style="border: none;" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/CommodityDetailAjax.aspx?act=save&resId=<%=resId%>&commodityId=<%=commodityId%>">
                                            提交</button>
                                            <%} %>
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
        $(function () {
            $("#back").on("click", function () {
                location.href = "<%=Business.CoffeePage.VirtulName %>/CommodityManager.aspx?resId=<%=resId%>";
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



