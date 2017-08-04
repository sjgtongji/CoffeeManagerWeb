<%@ page language="C#" masterpagefile="~/MasterPage.master" autoeventwireup="true" inherits="PropertyCategoryDetail, App_Web_propertycategorydetail.aspx.cdcab7d2" %>

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
                                        类别名称（中文）*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="chineseName" name="chineseName" placeholder="商店名称" value="<%=propertyCategory != null ? propertyCategory.chineseName : string.Empty%>" required />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="englishName">
                                        类别名称（英文）：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="englishName" name="englishName" value="<%=propertyCategory != null ? propertyCategory.englishName : string.Empty%>" />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="sort">
                                        排序权重*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="sort" name="sort" value="<%=propertyCategory != null ?  propertyCategory.sort : 0%>" required data-valid="num" patte="" data-min="0" data-max="999999"/>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="enableMultiple">
                                        是否多选：</label>
                                    <div class="col-sm-10">
                                        <label class="checkbox-inline">
                                            <input type="checkbox" name="enableMultiple" id ="enableMultiple" <%=propertyCategory != null ? (propertyCategory.enableMultiple == true ? " checked='checked'" : ""): "" %> />
                                        </label>
                                    </div>
                                </div>      
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="">
                                        &nbsp;</label>
                                    <div class="col-sm-10">
                                        <%if(ErrFlag == false) {%>
                                        <button class="btn btn-info" id="submitForm" style="border: none;" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/PropertyCategoryDetailAjax.aspx?act=save&resId=<%=resId%>&propertyCategoryId=<%=propertyCategoryId%>">
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
        $(function () {
            $("#back").on("click", function () {
                location.href = "<%=Business.CoffeePage.VirtulName %>/CommodityCategoryManager.aspx?resId=<%=resId%>";
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



