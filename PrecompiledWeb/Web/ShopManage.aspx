<%@ page language="C#" masterpagefile="~/MasterPage.master" autoeventwireup="true" inherits="ShopManage, App_Web_shopmanage.aspx.cdcab7d2" %>

<%@ Register Src="~/Control/LeftBar_Activity.ascx" TagPrefix="LeftBar" TagName="LeftActBar" %>
<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="Server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="Server">
    <div id="main-container" class="main-container">
        <div class="main-container-inner">
            <LeftBar:LeftActBar runat="server" ID="leftBar" />
            <div class="main-content" style="overflow: hidden;">
                <div id="breadcrumbs" class="breadcrumbs">
                    <ul class="breadcrumb">
                        <li><i class="icon-home home-icon"></i><a href="#">商店管理</a> </li>
                    </ul>
                </div>
                <div class="page-content">
                    <div class="page-header">
                        <h1>
                            商店管理
                        </h1>
                    </div>
                    <div class="row table-horiscroll">
                        <div class="col-xs-12">
                            <form id="queryForm" class="form-inline form-group" action="" method="post">
                            <div class="col-xs-3 col-md-2">
                                <input type="text" class="form-control" id="resName" name="resName" placeholder="餐厅名"
                                    value="<%=resName %>" />
                            </div>
                            <%--<div class="col-xs-3" style="width: auto; padding-right: 0px;">
                                联网状态
                                <select name="onlineState">
                                    <option value="-1" <%=-1==onlineState?"selected=\"selected\"":"" %>>全部</option>
                                    <option value="1" <%=1==onlineState?"selected=\"selected\"":"" %>>联网</option>
                                    <option value="0" <%=0==onlineState?"selected=\"selected\"":"" %>>未联网</option>
                                </select>
                            </div>--%>
                            <div>
                                <button type="button" class="btn btn-info" style="border: none;" onclick="locationForm('queryForm','<%=Business.CoffeePage.VirtulName %>/ShopManage.aspx');">
                                    查询</button>
                                <button type="button" class="btn btn-info addRes" style="border: none;" data-url="<%=Business.CoffeePage.VirtulName %>/ShopDetail.aspx">
                                    新增商店
                                </button>
                            </div>
                            </form>
                            <table class="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th>
                                            商店名
                                        </th>
                                        <th>
                                            商店地址
                                        </th>
                                        <th>
                                            经度
                                        </th>
                                        <th>
                                            纬度
                                        </th>
                                        <th>
                                            城市
                                        </th>
                                        <th>
                                            配送范围（千米）
                                        </th>
                                        <th>
                                            服务费
                                        </th>
                                        <th>
                                            联系人
                                        </th>
                                        <th>
                                            上线状态
                                        </th>
                                        <th>
                                            备注
                                        </th>
                                        <th>
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <%if (listRestaurant != null)
                                      {
                                          foreach (var item in listRestaurant)
                                          {
                                    %>
                                    <tr class="eachRow">
                                        <td> <%=item.name%></td>
                                        <td><%=item.address%></td>
                                        <td><%=item.longitude%></td>
                                        <td><%=item.latitude%></td>
                                        <td><%=item.cityId%></td>
                                        <td><%=item.allowedDistance.ToString("#0.00")%></td>
                                        <td><%=item.serverFee.ToString("#0.00")%></td>
                                        <td><%=getContactNumber(item.contactNumber)%></td>
                                        <td>
                                            <input name="switch-field-1" class="ace ace-switch enablestate" type="checkbox" data-id="<%=item.id %>" <%=item.state == 1 ?"checked=\"checked\"":"" %> />
                                            <span class="lbl"></span>
                                        </td>
                                        <td><%=item.remark%></td>
                                        <td>
                                            <a href="<%=Business.CoffeePage.VirtulName %>/ShopDetail.aspx?id=<%=item.id %>">修改商店</a>
                                            |<a href="javascript:" class="delRes" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/shopManagerAjax.aspx?act=delete&id=<%=item.id %>">删除商店</a>
                                            |<a href="<%=Business.CoffeePage.VirtulName %>/CommodityCategoryManager.aspx?resId=<%=item.id %>" >商品类别管理</a>
                                            |<a href="<%=Business.CoffeePage.VirtulName %>/CommodityManager.aspx?resid=<%=item.id%>">商品管理</a>
                                            |<a href="<%=Business.CoffeePage.VirtulName %>/PropertyCategoryManager.aspx?resid=<%=item.id%>">属性类别管理</a>
                                            |<a href="<%=Business.CoffeePage.VirtulName %>/CouponManager.aspx?resid=<%=item.id%>">优惠卷管理</a>
                                            |<a href="<%=Business.CoffeePage.VirtulName %>/BusinessHourDetail.aspx?resid=<%=item.id%>">下单时间管理</a>
                                            |<a target="view_window" href="<%=Business.CoffeePage.VirtulName %>/CoordinateDetails.aspx?resid=<%=item.id%>">配送范围设置</a>
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
                                    <li class="prev"><a href="<%=Business.CoffeePage.VirtulName %>/ShopManage.aspx?pageIndex=<%=pageIndex>1?pageIndex-1:pageIndex %>&resName=<%=resName %>&pageSize=<%=pageSize %>">
                                        <i class="icon-double-angle-left"></i></a></li>
                                    <%} %>
                                    <li class="active"><a href="#">
                                        <%=pageIndex%></a> </li>
                                    <%if (pageIndex * pageSize < totalCount)
                                      { %>
                                    <li class="next"><a href="<%=Business.CoffeePage.VirtulName %>/ShopManage.aspx?pageIndex=<%=pageIndex+1 %>&resName=<%=resName %>&pageSize=<%=pageSize %>">
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
    <script type="text/javascript">
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

            $(".enablestate").on("click", function () {
                var _obj = $(this),
            			defaultCheck = _obj.prop("checked");

                $.post("<%=Business.CoffeePage.VirtulName %>/Ajax/shopManagerAjax.aspx?act=enablestate&id=" + $(this).attr("data-id"), function (result) {
                    var data = $.parseJSON(result);
                    if (data.succ) {
                        _obj.prop("checked", !defaultCheck);
                        alert(data.msg);
                        location.reload();
                    }
                    else {
                        alert(data.msg);
                    }
                });
            });

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
                        title: "<div class='widget-header widget-header-small'><h5 class='smaller'><i class='icon-ok'></i>修改实时预定餐厅</h5></div>",
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

