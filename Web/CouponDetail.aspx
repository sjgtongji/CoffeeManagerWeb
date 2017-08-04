<%@ Page Language="C#" masterpagefile="~/MasterPage.master"  AutoEventWireup="true" CodeFile="CouponDetail.aspx.cs" Inherits="CouponDetail" %>

<%@ Register Src="~/Control/LeftBar_Activity.ascx" TagPrefix="LeftBar" TagName="LeftActBar" %>
<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="Server">
    <style>
    
    .custom_sele_icon
    {
        top:7px !important;
        }
    .date_hd
    {
        height:auto !important;
        }
    </style>
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
                                    <label class="col-sm-2 control-label" for="couponName">
                                        优惠卷名称*：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="couponName" name="couponName" placeholder="优惠卷名称" value="<%=couponDTO != null ? couponDTO.couponName : string.Empty%>" required />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="couponType">
                                        优惠类别*：</label>
                                    <div class="col-sm-3">
                                        <select name="couponType">
                                            <option value="1" <%=1==(couponDTO != null ? couponDTO.couponType : 1)?"selected=\"selected\"":"" %>>新用户优惠</option>
                                            <option value="2" <%=2==(couponDTO != null ? couponDTO.couponType : 1)?"selected=\"selected\"":"" %>>全场优惠</option>
                                            <option value="3" <%=3==(couponDTO != null ? couponDTO.couponType : 1)?"selected=\"selected\"":"" %>>满额优惠</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="preferentialType">
                                        优惠类别*：</label>
                                    <div class="col-sm-3">
                                        <select name="preferentialType">
                                            <option value="1" <%=1==(couponDTO != null ? couponDTO.preferentialType : 1)?"selected=\"selected\"":"" %>>减额</option>
                                            <option value="2" <%=2==(couponDTO != null ? couponDTO.preferentialType : 1)?"selected=\"selected\"":"" %>>折扣</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="preferential">
                                        优惠额度：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="preferential" name="preferential"  value="<%=couponDTO != null ?(couponDTO.preferential.HasValue ? couponDTO.preferential.Value.ToString("#0.00") : "0"): "0"%>"  />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="state">
                                        是否有效：</label>
                                    <div class="col-sm-10">
                                        <label class="checkbox-inline">
                                            <input type="checkbox" name="state" id ="state" <%=couponDTO != null ? (couponDTO.state == 1 ? " checked='checked'" : ""): "" %> />
                                        </label>
                                    </div>
                                </div> 
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="offerAmount">
                                        满额额度：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="offerAmount" name="offerAmount" value="<%=couponDTO != null ? couponDTO.offerAmount : 0%>" />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="effectiveStartTime">
                                        有效开始时间：</label>
                                    <div class="col-sm-3">
                                        <div class="input-group input-group-sm">
						                    <input type="text" id="effectiveStartTime" name="effectiveStartTime" class="form-control hasDatepicker"  value="<%=couponDTO != null ? (couponDTO.effectiveStartTime.HasValue ? couponDTO.effectiveStartTime.Value.ToString("yyyy-MM-dd") : string.Empty) : string.Empty%>" patte="^\d{4}-\d{2}-\d{2}$" data-format="yyyy-mm-dd" data-valid="text"/>
						                    <span class="input-group-addon"> <i class="icon-calendar"></i>
						                    </span>
					                    </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="effectiveEndTime">
                                        有效结束时间：</label>
                                    <div class="col-sm-3">
					                    <div class="input-group input-group-sm">
						                    <input type="text" id="effectiveEndTime" name="effectiveEndTime" class="form-control hasDatepicker"  value="<%=couponDTO != null ? (couponDTO.effectiveStartTime.HasValue ? couponDTO.effectiveEndTime.Value.ToString("yyyy-MM-dd") : string.Empty) : string.Empty%>"  patte="^\d{4}-\d{2}-\d{2}$" data-format="yyyy-mm-dd" data-valid="text"/>
						                    <span class="input-group-addon"> <i class="icon-calendar"></i>
						                    </span>
					                    </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="remark">
                                        备注：</label>
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control" id="remark" name="remark" value="<%=couponDTO != null ? couponDTO.remark: string.Empty%>"/>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-2 control-label" for="">
                                        &nbsp;</label>
                                    <div class="col-sm-10">
                                        <%if(ErrFlag == false) {%>
                                        <button class="btn btn-info" id="submitForm" style="border: none;" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/CouponDetailAjax.aspx?act=save&resId=<%=resId%>&couponId=<%=couponId%>">
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
    <script src="assets/js/cxcalendar.js" type="text/javascript"></script>
    <link rel="stylesheet" href="/CoffeeManagerWeb/assets/css/cxcalendar.css" />    
    <script type="text/javascript">
        $("#effectiveStartTime").cxCalendar();
        $("#effectiveEndTime").cxCalendar();
        $("#start").cxCalendar();
        
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



