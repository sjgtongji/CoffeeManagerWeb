<%@ page language="C#" masterpagefile="~/MasterPage.master" autoeventwireup="true" inherits="CommodityPropertyManager, App_Web_commoditypropertymanager.aspx.cdcab7d2" %>

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
                        <li><i class="icon-home home-icon"></i><a href="#">商品属性管理(<%=resName%>)</a> </li>
                    </ul>
                </div>
                <div class="page-content">
                    <div class="page-header">
                        <h1>
                            商品属性管理(<%=resName%>)
                        </h1>
                    </div>
                    <div class="row table-horiscroll">
                        <div class="col-xs-12">
                            <form id="queryForm" class="form-inline form-group" action="" method="post">
                            <div class="col-xs-3" style="width: auto; padding-right: 0px;">
                                商品类别
                                <select name="propertyCategoryUUID">
                                    <option value="-1" <%="-1"==propertyCategoryUUID?"selected=\"selected\"":"" %>>全部</option>
                                    <%listPropertyCategory.ForEach(item =>
                                      {%>
                                      <option value="<%=item.propertyCategoryUUID%>" <%=item.propertyCategoryUUID==propertyCategoryUUID?"selected=\"selected\"":"" %>><%=item.chineseName%></option>
                                    <%});%>
                                </select>
                            </div>

                            <div>
                                <button type="button" class="btn btn-info" style="border: none;" onclick="locationForm('queryForm','<%=Business.CoffeePage.VirtulName %>/CommodityPropertyManager.aspx?resId=<%=resId%>&commodityId=<%=commodityId%>');">
                                    查询</button>
                                <button type="button" class="btn btn-info addRes" style="border: none;" data-url="<%=Business.CoffeePage.VirtulName %>/CommodityPropertyDetail.aspx?resId=<%=resId%>&commodityId=<%=commodityId%>">
                                    新增商品
                                </button>
                            </div>
                            </form>
                            <table class="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th>
                                            名称（中文）
                                        </th>
                                        <th>
                                            名称（英文）
                                        </th>
                                        <th>
                                            价格
                                        </th>
                                        <th>
                                            排序权重
                                        </th>
                                        <th>
                                           属性类别
                                        </th>
                                        <th>
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <%if (listCCommodityPropertyDTO != null)
                                      {
                                          foreach (var item in listCCommodityPropertyDTO)
                                          {
                                    %>
                                    <tr class="eachRow">
                                        <td> <%=item.chineseName%></td>
                                        <td><%=item.englishName%></td>
                                        <td><%=item.addPrice.HasValue ? item.addPrice.Value.ToString("#0.00") : "0"%></td>
                                        <td><%=item.sort%></td>
                                        <td><%=GetPropertyCategoryName(item.propertyCategoryUUID)%></td>
                                        <td>
                                            <a href="<%=Business.CoffeePage.VirtulName %>/CommodityPropertyDetail.aspx?commodityPropertyId=<%=item.id%>&resId=<%=resId%>&commodityId=<%=commodityId%>">修改商品属性</a>
                                            |<a href="javascript:" class="delRes" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/CommodityPropertyDetailAjax.aspx?act=delete&commodityPropertyId=<%=item.id %>&resId=<%=resId%>&commodityId=<%=commodityId%>">删除商品属性</a>
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
                                    <li class="prev"><a href="<%=Business.CoffeePage.VirtulName %>/CommodityPropertyManager.aspx?pageIndex=<%=pageIndex>1?pageIndex-1:pageIndex %>&resId=<%=resId%>&pageSize=<%=pageSize %>&propertyCategoryUUID=<%=propertyCategoryUUID%>&commodityId=<%=commodityId%>">
                                        <i class="icon-double-angle-left"></i></a></li>
                                    <%} %>
                                    <li class="active"><a href="#">
                                        <%=pageIndex%></a> </li>
                                    <%if (pageIndex * pageSize < totalCount)
                                      { %>
                                    <li class="next"><a href="<%=Business.CoffeePage.VirtulName %>/CommodityPropertyManager.aspx?pageIndex=<%=pageIndex+1 %>&resId=<%=resId%>&pageSize=<%=pageSize %>&propertyCategoryUUID=<%=propertyCategoryUUID%>&commodityId=<%=commodityId%>">
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
                if (confirm("确定删除该商品属性？")) {
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
