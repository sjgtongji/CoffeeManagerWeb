<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="BusinessHourDetail.aspx.cs" Inherits="BusinessHourDetail" %>
<%@ Register Src="~/Control/LeftBar_Activity.ascx" TagPrefix="LeftBar" TagName="LeftActBar" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" Runat="Server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" Runat="Server">
<div id="main-container" class="main-container">
    <div class="main-container-inner">
        <LeftBar:LeftActBar runat="server" ID="leftBar" />
        <div class="main-content">
            <div id="breadcrumbs" class="breadcrumbs">
                <ul class="breadcrumb">
                    <li>
                        <i class="icon-home home-icon"></i>
                        <a href="#">预订时间管理</a>
                    </li>
                </ul>
            </div>
            <div class="page-content">
                <div class="page-header">
                    <h1> 预订时间管理 </h1>
                </div>
            <div class="row">
                <div class="col-xs-12">
                    <h3 class="header smaller lighter blue">
                        <%=resName%>--预订时间列表
                        <button type="button" class="btn btn-info blue returnMenu" style="border: none;" data-url="<%=Business.CoffeePage.VirtulName %>/ShopManage.aspx">
                                    返回上级菜单
                        </button>
                        <a id="<%=resUUID %>" data-act="add" class="blue" href="#">
                            <span class="icon-pencil pull-right action-buttons batchModify">增加预订时段</span>
                        </a>
                    </h3>
                    
        <%if (businessHours != null && businessHours.Length > 0)
              {%>
                <table class="table table-bordered">
                    <thead>
					<tr>
						<th>&nbsp;</th>
                        <th class="sorting" role="columnheader" tabindex="0" aria-controls="sample-table-2"
                            rowspan="1" colspan="1" style="width: 11.5%;" aria-label="周一: activate to sort column ascending">
                            周一
                        </th>
						<th class="sorting" role="columnheader" tabindex="0" aria-controls="sample-table-2"
                            rowspan="1" colspan="1" style="width: 11.5%;" aria-label="周二: activate to sort column ascending">
                            周二
                        </th>
                        <th class="sorting" role="columnheader" tabindex="0" aria-controls="sample-table-2"
                            rowspan="1" colspan="1" style="width: 11.5%;" aria-label="周三: activate to sort column ascending">
                            周三
                        </th>
                        <th class="sorting" role="columnheader" tabindex="0" aria-controls="sample-table-2"
                            rowspan="1" colspan="1" style="width: 11.5%;" aria-label="周四: activate to sort column ascending">
                            周四
                        </th>
                        <th class="sorting" role="columnheader" tabindex="0" aria-controls="sample-table-2"
                            rowspan="1" colspan="1" style="width: 11.5%;" aria-label="周五: activate to sort column ascending">
                            周五
                        </th>
                        <th class="sorting" role="columnheader" tabindex="0" aria-controls="sample-table-2"
                            rowspan="1" colspan="1" style="width: 11.5%;" aria-label="周六: activate to sort column ascending">
                            周六
                        </th>
                        <th class="sorting" role="columnheader" tabindex="0" aria-controls="sample-table-2"
                            rowspan="1" colspan="1" style="width: 11.5%;" aria-label="周日: activate to sort column ascending">
                            周日
                        </th>
                        <th class="sorting" role="columnheader" tabindex="0" aria-controls="sample-table-2"
                            rowspan="1" colspan="1" style="width: 9%;" aria-label="操作: activate to sort column ascending">
                            操作
                        </th>
					</tr>
                    </thead>
                    <%if (lstBusinessName != null && lstBusinessName.Length > 0)
                      {
                          //lstBusinessName = lstBusinessName.OrderBy(p => p.Key).ToArray();
                          foreach (var item in lstBusinessName)
                          {
                              if (item != null)
                              {%>
                    <tbody>
					<tr>
						<td class="text-center"><%=item.Value%></td>
                        <%for (int i = 1; i < 8; i++)
                          {
                              List<XMS.Inner.Coffee.Service.Model.BusinessHourWeekDTO> obj = businessHours.Where(p => p.WeekDay == i).ToList();
                              if (obj == null || obj.Count == 0)
                              {%>
                              <td>
                                  <div class="pull-right action-buttons">
                                    <a id="<%=i %>" data-type="<%=item.Key %>" data-name="<%=item.Value%>" class="blue" href="#">
                                        <i class="icon-pencil bigger-130 addBusinessHourWeek">新增</i>
                                    </a>
                                  </div>
                              </td>
                              <%
                                  continue;
                              }
                              string key = item.Key;
                              var obj1 = obj.Where(p => p.TypeUUID == key).ToList();
                              if (obj1 == null || obj1.Count() == 0)
                              {%>
                              <td>
                                  <div class="pull-right action-buttons">
                                    <a id="<%=i %>" data-type="<%=item.Key %>" data-name="<%=item.Value%>" class="blue" href="#">
                                        <i class="icon-pencil bigger-130 addBusinessHourWeek">新增</i>
                                    </a>
                                  </div>
                              </td>
                              <%
                                  continue;
                              }
                              var objBH = obj1.First();
                              if(objBH!=null)
                              {%>
						<td>
                        <%=(objBH.StartTime/1000/60 / 60).ToString().PadLeft(2, '0')%>:<%=((objBH.StartTime / 1000 / 60) % 60).ToString().PadLeft(2, '0')%>
                        --
                        <%=(objBH.EndTime/1000/60 / 60).ToString().PadLeft(2, '0')%>:<%=((objBH.EndTime / 1000 / 60) % 60).ToString().PadLeft(2, '0')%>

                        <div class="pull-right action-buttons">
                            <a id="<%=objBH.UUID %>" class="blue" href="#">
                                <i class="icon-pencil bigger-130 modifyActivity">修改</i>
                            </a>
                        </div>
                        </td>
                        <%}
                          } %>
                        <td>
                            <a id="<%=item.Key %>" data-act="batchmodify" class="blue" href="#">
                                <span class="pull-left action-buttons batchModify">批量设置</span>
                            </a>
                            <a data-id="<%=item.Key %>" data-act="batchdelete" class="blue" href="#">
                                <span class="pull-right action-buttons batchDelete">批量删除</span>
                            </a>
                        </td>
					</tr>
                    </tbody>
                        <%} %>
                    <%}
                      } %>

				</table>
            <%}%>
            </div>
            </div>
            <!-- #修改团购活动 -->
            <div id="EditActivityInfoDialog-message" class="hide">
            </div>
            </div>
        </div>
    </div>
</div>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="FootContent" Runat="Server">
<script>
    jQuery(function ($) {
        $(".returnMenu").on("click", function () {
            location.href = $(this).attr("data-url");
        });

        $.fn.datepicker.dates['zh'] = {
            days: ["日", "一", "二", "三", "四", "五", "六", "日"],
            daysShort: ["日", "一", "二", "三", "四", "五", "六", "日"],
            daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
            months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            today: "Today"
        };

        $.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
            _title: function (title) {
                var $title = this.options.title || '&nbsp;'
                if (("title_html" in this.options) && this.options.title_html == true)
                    title.html($title);
                else title.text($title);
            }
        }));

        $(".modifyActivity").on('click', function (e) {
            e.preventDefault();
            var id = $(this).parent("a").attr("id");
            $("#EditActivityInfoDialog-message").load("<%=Business.CoffeePage.VirtulName %>/dialog/modifybusinesshour.aspx?resid=<%=resUUID %>", { id: id }, function () {
                var editSave = $("#editSave");
                var editDel = $("#editDel");
                editSave.prop("data-flag", "false");
                editDel.prop("data-flag", "false");
                $("#startDate").datepicker({
                    format: 'yyyy-mm-dd',
                    language: 'zh',
                    autoclose: true,
                    showOtherMonths: true
                });
                $("#endDate").datepicker({
                    format: 'yyyy-mm-dd',
                    language: 'zh',
                    autoclose: true,
                    showOtherMonths: true
                });

                editSave.on("click", function () {
                    var obj = $(this), form = $("#addBox");
                    if (obj.attr("data-flag") == "true") { return false; }
                    obj.prop("data-flag", "true");
                    $.post(form.attr("action"), form.serialize(), function (result) {
                        var data = eval('(' + result + ')');
                        if (data.succ) {
                            alert(data.msg);
                            location.reload();
                        }
                        else {
                            alert(data.msg);
                        }
                        obj.prop("data-flag", "false");
                    });
                });

                editDel.on("click", function () {
                    e.preventDefault();
                    var obj = $(this), id = $(this).attr("data-id"), act = $(this).attr("data-act");
                    var del = confirm("确定要删除吗?");
                    if (del) {
                        $.post("<%=Business.CoffeePage.VirtulName %>/ajax/businesshoureditajax.aspx", { id: id, action: act, resid: "<%=resUUID %>" }, function (result) {
                            data = eval('(' + result + ')');
                            if (data.succ) {
                                alert(data.msg);
                                location.reload();
                            }
                            else {
                                alert(data.msg);
                            }
                        });
                    }
                });

                var dialog = $("#EditActivityInfoDialog-message").removeClass('hide').dialog({
                    modal: true,
                    title: "<div class='widget-header widget-header-small'><h5 class='smaller'><i class='icon-ok'></i>修改预订时间</h5></div>",
                    title_html: true,
                    width: 900
                });
            });
        });

        $(".addBusinessHourWeek").on('click', function (e) {
            e.preventDefault();
            var id = $(this).parent("a").attr("id"), name = $(this).parent("a").attr("data-name"), type = $(this).parent("a").attr("data-type");
            $("#EditActivityInfoDialog-message").load("<%=Business.CoffeePage.VirtulName %>/dialog/modifybusinesshour.aspx?resid=<%=resUUID %>&act=add", { weekday: id, name: name, type: type }, function () {
                var editSave = $("#editSave");
                editSave.prop("data-flag", "false");
                $("#startDate").datepicker({
                    format: 'yyyy-mm-dd',
                    language: 'zh',
                    autoclose: true,
                    showOtherMonths: true
                });
                $("#endDate").datepicker({
                    format: 'yyyy-mm-dd',
                    language: 'zh',
                    autoclose: true,
                    showOtherMonths: true
                });

                editSave.on("click", function () {
                    var obj = $(this), form = $("#addBox");
                    if (obj.attr("data-flag") == "true") { return false; }
                    obj.prop("data-flag", "true");
                    $.post(form.attr("action"), form.serialize(), function (result) {
                        var data = eval('(' + result + ')');
                        if (data.succ) {
                            alert(data.msg);
                            location.reload();
                        }
                        else {
                            alert(data.msg);
                        }
                        obj.prop("data-flag", "false");
                    });
                });

                var dialog = $("#EditActivityInfoDialog-message").removeClass('hide').dialog({
                    modal: true,
                    title: "<div class='widget-header widget-header-small'><h5 class='smaller'><i class='icon-ok'></i>新增预订时间</h5></div>",
                    title_html: true,
                    width: 900
                });
            });
        });

        $(".batchModify").on('click', function (e) {
            e.preventDefault();
            var id = $(this).parent("a").attr("id");
            var act = $(this).parent("a").attr("data-act");
            $("#EditActivityInfoDialog-message").load("<%=Business.CoffeePage.VirtulName %>/dialog/batchmodifybusinessHour.aspx?resid=<%=resUUID %>", { type: id, act: act }, function () {
                var editSave = $("#editSave");
                editSave.prop("data-flag", "false");
                $("#startDate").datepicker({
                    format: 'yyyy-mm-dd',
                    language: 'zh',
                    autoclose: true,
                    showOtherMonths: true
                });
                $("#endDate").datepicker({
                    format: 'yyyy-mm-dd',
                    language: 'zh',
                    autoclose: true,
                    showOtherMonths: true
                });

                editSave.on("click", function () {
                    var obj = $(this), form = $("#addBox");
                    if (obj.attr("data-flag") == "true") { return false; }
                    obj.prop("data-flag", "true");
                    $("#type").removeAttr("disabled");
                    $.post(form.attr("action"), form.serialize(), function (result) {

                        var data = eval('(' + result + ')');
                        if (data.succ) {
                            alert(data.msg);
                            location.reload();
                        }
                        else {
                            alert(data.msg);
                        }
                        obj.prop("data-flag", "false");
                    });
                });

                var dialog = $("#EditActivityInfoDialog-message").removeClass('hide').dialog({
                    modal: true,
                    title: "<div class='widget-header widget-header-small'><h5 class='smaller'><i class='icon-ok'></i>修改预订时间</h5></div>",
                    title_html: true,
                    width: 900
                });
            });
        });
        $(".batchDelete").on('click', function (e) {
            e.preventDefault();
            var obj = $(this), id = $(this).parent("a").attr("data-id"), act = $(this).parent("a").attr("data-act");
            var del = confirm("确定要删除吗?");
            if (del) {
                $.post("<%=Business.CoffeePage.VirtulName %>/ajax/businesshoureditajax.aspx", { type: id, action: act, resid: "<%=resUUID %>" }, function (result) {
                    data = eval('(' + result + ')');
                    if (data.succ) {
                        alert(data.msg);
                        location.reload();
                    }
                    else {
                        alert(data.msg);
                    }
                });
            }
        });
    });
</script>
</asp:Content>

