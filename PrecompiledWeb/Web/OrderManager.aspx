<%@ page language="C#" masterpagefile="~/MasterPage.master" autoeventwireup="true" inherits="OrderManager, App_Web_ordermanager.aspx.cdcab7d2" %>

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
            <div class="main-content" style="overflow: hidden;">
                <div id="breadcrumbs" class="breadcrumbs">
                    <ul class="breadcrumb">
                        <li><i class="icon-home home-icon"></i><a href="#">订单管理</a> </li>
                    </ul>
                </div>
                <div class="page-content">
                    <div class="page-header">
                        <h1>
                            订单管理
                        </h1>
                    </div>
                    <div class="row table-horiscroll">
                        <div class="col-xs-12">
                            <form id="queryForm" class="form-inline form-group" action="" method="post">
                            <div class="col-xs-3" style="width: auto; padding-right: 0px;">
                                商店
                                <select name="resUUID">
                                    <option value="-1" <%="-1"==resUUID?"selected=\"selected\"":"" %>>全部</option>
                                    <%listRestaurant.ForEach(item => {  %>
                                     <option value="<%=item.resUUID%>" <%=item.resUUID==resUUID?"selected=\"selected\"":"" %>><%=item.name%></option>
                                    <%});%>
                                </select>
                            </div>
                            <%--<div class="col-xs-3" style="width: auto; padding-right: 0px;">
                                支付状态
                                <select name="payStatus">
                                    <option value="-1" <%=-1==payStatus?"selected=\"selected\"":"" %>>全部</option>
                                    <option value="0" <%=0==payStatus?"selected=\"selected\"":"" %>>未支付</option>
                                    <option value="1" <%=1==payStatus?"selected=\"selected\"":"" %>>已支付</option>
                                </select>
                            </div>--%>
                            <div class="col-xs-3" style="width: auto; padding-right: 0px;">
                                取货方式
                                <select name="deliveryType">
                                    <option value="-1" <%=-1==deliveryType?"selected=\"selected\"":"" %>>全部</option>
                                    <option value="0" <%=0==deliveryType?"selected=\"selected\"":"" %>>配送</option>
                                    <option value="1" <%=1==deliveryType?"selected=\"selected\"":"" %>>门店自取</option>
                                </select>
                            </div>
                            <div class="col-xs-3" style="width: auto; padding-right: 0px;">
                                确认状态
                                <select name="orderState">
                                    <option value="-1" <%=-1==orderState?"selected=\"selected\"":"" %>>全部</option>
                                    <option value="0" <%=0==orderState?"selected=\"selected\"":"" %>>未确认</option>
                                    <option value="1" <%=1==orderState?"selected=\"selected\"":"" %>>已确认</option>
                                    <option value="2" <%=2==orderState?"selected=\"selected\"":"" %>>已取消</option>
                                    <option value="3" <%=3==orderState?"selected=\"selected\"":"" %>>已配送</option>
                                    <option value="4" <%=4==orderState?"selected=\"selected\"":"" %>>已完成</option>
                                </select>
                            </div>
                            <div class="col-xs-3" style="width: auto; padding-right: 0px;">
                                创建时间
                                <input type="text" id="minCreateTime" name="minCreateTime" class="hasDatepicker"  value="<%=minCreateTime.ToString("yyyy-MM-dd")%>" patte="^\d{4}-\d{2}-\d{2}$" data-format="yyyy-mm-dd" data-valid="text"/>
                            </div>
                            <div class="col-xs-3" style="width: auto; padding-right: 0px;">
                                -
                                <input type="text" id="maxCreateTime" name="maxCreateTime" class="hasDatepicker"  value="<%=maxCreateTime.ToString("yyyy-MM-dd")%>" patte="^\d{4}-\d{2}-\d{2}$" data-format="yyyy-mm-dd" data-valid="text"/>
                            </div>
                            <div  class="col-xs-3" style="width: auto; padding-right: 0px;">
                                
                                <button type="button" class="btn btn-info" style="border: none;" onclick="locationForm('queryForm','<%=Business.CoffeePage.VirtulName %>/OrderManager.aspx');">
                                    查询</button>
                                <button type="button" class="btn btn-info"  style="border: none;"  onclick="locationForm('queryForm','<%=Business.CoffeePage.VirtulName %>/OrderManager.aspx?action=export');">导出</button>
                            </div>
                            </form>
                            <table class="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th style="width:8%;">
                                            商店名
                                        </th>
                                        <th style="width:4%;">
                                            订餐人
                                        </th>
                                        <th style="width:5%;">
                                            用户号码
                                        </th>
                                        <th style="width:8%;">
                                            订单创建时间
                                        </th>
                                        <th style="width:5%;">
                                            支付状态
                                        </th>
                                        <th  style="width:5%;">
                                            取货方式
                                        </th>
                         <%--               <th style="width:8%;">
                                            支付时间
                                        </th>--%>
                                        <th  style="width:5%;">
                                            确认状态
                                        </th>
                                        <th style="width:5%;">
                                            支付金额
                                        </th>
                                        <th  style="width:10%;">
                                            送达时间
                                        </th>
                                        <th style="width:9%;">
                                            送货地址
                                        </th>
                                        <th style="width:4%;">
                                            服务费
                                        </th>
                                        <th style="width:4%;">
                                            订单金额
                                        </th>
                                        <th  style="width:5%;">
                                            优惠金额
                                        </th>
                                        <th  style="width:10%;">
                                            商品
                                        </th>
                                        <th>
                                            备注
                                        </th>
                                        <th>
                                            商家备注
                                        </th>
                                        <th>
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <%if (listOrderDTO != null)
                                      {
                                          foreach (var item in listOrderDTO)
                                          {
                                            %>
                                            <tr class="eachRow">
                                                <td> <%=GetShopName(item.resUUID)%></td>
                                                <td><%=item.memberName%></td>
                                                <td><%=item.telephone%></td>
                                                <td><%=item.createTime.ToString("yyyy-MM-dd HH:mm")%></td>
                                                <td><%=GetPayStatus(item.payStatus)%></td>
                                                <td><%=GetDeliveryType(item.deliveryType)%></td>
                                                <%--<td><%=item.payDateTime.HasValue ? item.payDateTime.Value.ToString("yyyy-MM-dd HH:mm") : string.Empty%></td>--%>
                                                <td><%=GetOrderState(item.orderState)%></td>
                                                <td><%=item.payMomey.HasValue ? item.payMomey.Value.ToString("#0.00") : string.Empty%></td>
                                                <td><%=GetDeliveryTime(item.deliveryMinTime,item.deliveryMaxTime,item.isOutOfTime)%></td>
                                                <td><%=item.deliveryAddress%></td>
                                                <td><%=item.serverFee.ToString("#0.00")%></td>
                                                <td><%=item.orderMomey.ToString("#0.00")%></td>
                                                <td><%=(-(item.orderMomey + item.serverFee - (item.payMomey.HasValue ? item.payMomey.Value : 0))).ToString("#0.00")%></td>
                                                <td><%=GetCommodityInfo(item.listCOrderCommodityRelation)%></td>
                                                <td><%=item.remark%></td>
                                                <td><%=item.managerRemark%></td>
                                                <td>
                                                    <a href="javascript:" class="midify" data-url="<%=Business.CoffeePage.VirtulName %>/Dialog/UpdateOrder.aspx?orderId=<%=item.id %>">修改</a> 
                                                </td>
                                            </tr>
                                        <%}
                                      }%>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-6">
                            <div id="sample-table-2_info" class="dataTables_info">
                                显示总共
                                <%=totalCount %>
                                条记录中的
                                <%=(pageIndex-1)*pageSize+1 %>
                                到
                                <%= pageIndex * pageSize < totalCount ? pageIndex * pageSize : totalCount%>
                                条记录</div>
                        </div>
                        <div class="col-sm-6">
                            <div class="dataTables_paginate paging_bootstrap">
                                <ul class="pagination">
                                    <%if (pageIndex > 1)
                                      { %>
                                    <li class="prev"><a href="<%=Business.CoffeePage.VirtulName %>/OrderManager.aspx?pageIndex=<%=pageIndex>1?pageIndex-1:pageIndex %>&resUUID=<%=resUUID%>&payStatus=<%=payStatus %>&deliveryType=<%=deliveryType %>">
                                        <i class="icon-double-angle-left"></i></a></li>
                                    <%} %>
                                    <li class="active"><a href="#">
                                        <%=pageIndex%></a> </li>
                                    <%if (pageIndex * pageSize < totalCount)
                                      { %>
                                    <li class="next"><a href="<%=Business.CoffeePage.VirtulName %>/OrderManager.aspx?pageIndex=<%=pageIndex+1 %>&pageSize=<%=pageSize %>&resUUID=<%=resUUID%>&payStatus=<%=payStatus %>&deliveryType=<%=deliveryType %>">
                                        <i class="icon-double-angle-right"></i></a></li>
                                    <%} %>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div id="DialogMessage" class="hide">
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="FootContent" runat="Server">
    <script src="assets/js/cxcalendar.js" type="text/javascript"></script>
    <link rel="stylesheet" href="/CoffeeManagerWeb/assets/css/cxcalendar.css" />   
    <script type="text/javascript">
        $("#minCreateTime").cxCalendar();
        $("#maxCreateTime").cxCalendar();

        $(function () {
            $(".addRes").on("click", function () {
                location.href = $(this).attr("data-url");
            });

            $(".open").on("click", function () {
                $.ajax({
                    url: $(this).attr("data-url"),
                    type: "POST",
                    success: function (result) {
                        ajaxSuccess(result);
                    }
                });
            });

            $(".delRes").on("click", function () {
                if (confirm("确定删除该商店？")) {
                    $.ajax({
                        url: $(this).attr("data-url"),
                        type: "POST",
                        success: function (result) {
                            ajaxSuccess(result);
                        }
                    });
                }
            });

            function ajaxSuccess(result) {
                var data = $.parseJSON(result);
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

            $.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
                _title: function (title) {
                    var $title = this.options.title || '&nbsp;'
                    if (("title_html" in this.options) && this.options.title_html == true)
                        title.html($title);
                    else title.text($title);
                }
            }));

            $(".midify").on('click', function (e) {
                var url = $(this).attr("data-url");
                $("#DialogMessage").load(url, function () {
                    var dialog = $("#DialogMessage").removeClass('hide').dialog({
                        modal: true,
                        title: "<div class='widget-header widget-header-small'><h5 class='smaller'><i class='icon-ok'></i>修改订单</h5></div>",
                        title_html: true,
                        width: 450
                    });
                });
            });

        })

        //导出
        var locationForm = function (form, url) {
            var form = $("#" + form), data = "", url = url || form.attr("action");
            data = form.serialize();
            if (!url) {
                url = window.location.href;
            }
            if (form.length) {
                // location.href = url.indexOf("?") > 0 ? url+"&"+data : url+"?"+data;
                location.href = urlRConnect(url, data);
            } else {
                location.href = url;
            }
        };
        var urlRConnect = function (url, data) {
            //url为字符串
            //data为对象，{type:"",resid:"resid"}
            //或者为字符串"type=1asd&resid=resid";
            var reg = /([^\&]+)=([^\&]*)/g,
		        regTrim = /^\s+|\s+$/;

            function dataToString(data) {
                var str = "",
			        i, arr = [];
                for (i in data) {
                    data[i] == "" ? "" : arr.push(i + "=" + data[i]);
                }

                return arr.join("&");
            }
            function strToObj(str) {
                var obj = {}, i;
                str.replace(reg, function ($0, $1, $2) {
                    obj[$1] = $2;
                });

                return obj;
            }
            return function (url, data) {
                var urlList = url.split("?"),
			        host = urlList[0],
			        search = (typeof (search = urlList[1]) == "undefined" ? host : search).replace(regTrim, "") || "";

                if (typeof data != "object") {
                    data = strToObj(data);
                }
                if (search == "") {
                    return host + "?" + dataToString(data);
                }
                search.replace(reg, function ($0, $1, $2) {
                    data[$1] = ($1 in data) ? data[$1] : $2;
                });

                data = dataToString(data);
                return host == "" ? data : host + (data != "" ? "?" + data : "");
            }
        } ();
    </script>
</asp:Content>

