<%@ Page Language="C#" masterpagefile="~/MasterPage.master"  AutoEventWireup="true" CodeFile="CommodityCategoryDetail.aspx.cs" Inherits="CommodityCategoryDetail" %>

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
                                        <input type="text" class="form-control" id="chineseName" name="chineseName" placeholder="类别名称" value="<%=commodityCategory != null ? commodityCategory.chineseName : string.Empty%>" required />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="englishName">
                                        类别名称（英文）：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="englishName" name="englishName" value="<%=commodityCategory != null ? commodityCategory.englishName : string.Empty%>" />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="sort">
                                        排序权重*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="sort" name="sort" value="<%=commodityCategory != null ? (commodityCategory.sort.HasValue ? commodityCategory.sort.Value : 0 ) : 0%>" required data-valid="num" patte="" data-min="0" data-max="999999"/>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="remark">
                                        备注：</label>
                                    <div class="col-sm-3">
                                    <input type="text" class="form-control" id="remark" name="remark" value="<%=commodityCategory != null ? commodityCategory.remark : string.Empty%>"/>
                                    </div>
                                </div>        
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="">
                                        &nbsp;</label>
                                    <div class="col-sm-10">
                                        <%if(ErrFlag == false) {%>
                                        <button class="btn btn-info" id="submitForm" style="border: none;" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/CommodityCategoryDetailAjax.aspx?act=save&resId=<%=resId%>&commodityCategoryId=<%=CommodityCategoryId%>">
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


