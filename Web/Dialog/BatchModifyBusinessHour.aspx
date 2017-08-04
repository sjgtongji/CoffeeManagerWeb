<%@ Page Language="C#" AutoEventWireup="true" CodeFile="BatchModifyBusinessHour.aspx.cs" Inherits="Dialog_BatchModifyBusinessHour" %>

<div class="p20">
    <form id="addBox" action="<%=Business.CoffeePage.VirtulName %>/ajax/businesshoureditajax.aspx?resid=<%=resId %>&action=batchtypemodify&isadd=<%=isAdd %>" method="post" class="form-horizontal">
        <input type="hidden" name="type" value="<%=type %>" />
        <div>
            <div class="form-group">
                <div class="col-sm-3 control-label pull-left smaller-80 col-sm-offset-1">名称：</div>
                <div class="col-sm-4">
                    <input type="text" name="name" placeholder="" value="<%=noonBusinessHourWeek!=null?noonBusinessHourWeek.Name:string.Empty %>"/>
                </div>
            </div>

            <div class="form-group">
                <label class="col-sm-3 control-label pull-left smaller-80 col-sm-offset-1">起始时间：</label>
                <% TimeSpan noonStart = TimeSpan.FromMilliseconds(noonBusinessHourWeek == null ? 0 : noonBusinessHourWeek.StartTime);%>
                <div class="col-sm-4">
                    <select name="noonStartHour" class="w60">
                        <%for (int j = 0; j <= 23; j++)
                        {%>
                    <option value="<%=j %>" <%= j == noonStart.Hours ? "selected" : ""%>><%=j%>点</option>
                        <%}%>
                    </select> - 
                    <select name="noonStartMin" class="w60">
                        <%for (int m = 0; m < 60; m += 15)
                        { %>
                    <option value="<%=m %>" <%= m==noonStart.Minutes?"selected":"" %>><%=m%>分</option>
                    <%} %>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="col-sm-3 control-label pull-left smaller-80 col-sm-offset-1">结束时间：</label>
                <% TimeSpan noonEnd = TimeSpan.FromMilliseconds(noonBusinessHourWeek == null ? 0 : noonBusinessHourWeek.EndTime);%>
                <div class="col-sm-4">
                    <select name="noonEndHour" class="w60">
                    <%for (int j = 0; j <= 23; j++)
                        {%>
                    <option value="<%=j %>" <%= j == noonEnd.Hours ? "selected" : ""%>><%=j%>点</option>
                <%} %>
                    </select> - 
                    <select name="noonEndMin" class="w60">
                        <%for (int m = 0; m < 60; m += 15)
                        { %>
                    <option value="<%=m %>" <%= m==noonEnd.Minutes?"selected":"" %>><%=m%>分</option>
                    <%} %>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="col-sm-3 control-label pull-left smaller-80 col-sm-offset-1">提前预定时间：</label>
                <div class="col-sm-4">
                    <input type="text" name="noonInAdvance" placeholder="" value="<%=noonBusinessHourWeek!=null?noonBusinessHourWeek.InAdvance.ToString():string.Empty %>"/>
                </div>
            </div>
            
            <div class="form-group">
                <label for="latest" class="col-sm-3 control-label pull-left smaller-80 col-sm-offset-1">最晚接单时间：</label>
                <% TimeSpan? tsNoonLatest = noonBusinessHourWeek == null || !noonBusinessHourWeek.LatestOrderTime.HasValue ? null : (TimeSpan?)TimeSpan.FromMilliseconds(noonBusinessHourWeek.LatestOrderTime.Value);%>
                <div class="col-sm-4">
                    <select name="noonLatestHour" class="w60">
                    <option value="" <%= noonBusinessHourWeek == null || !noonBusinessHourWeek.LatestOrderTime.HasValue ? "selected" : ""%>>无</option>
                    <%if (noonBusinessHourWeek != null)
                  {
                      for (int j = 0; j <= 23; j++)
                      {%>
                <option value="<%=j %>" <%= tsNoonLatest.HasValue && j == tsNoonLatest.Value.Hours ? "selected" : ""%>><%=j%>点</option>
                        <%}%>
                <%} %>
                    </select> - 
                    <select name="noonLatestMin" class="w60">
                    <option value="" <%= noonBusinessHourWeek == null || !noonBusinessHourWeek.LatestOrderTime.HasValue ? "selected" : ""%>>无</option>
                        <%for (int m = 0; m < 60; m += 15)
                      { %>
                    <option value="<%=m %>" <%= tsNoonLatest.HasValue && m == tsNoonLatest.Value.Minutes ? "selected" : "" %>><%=m%>分</option>
                    <%} %>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-3 control-label pull-left smaller-80 col-sm-offset-1">排序：</label>
                <div class="col-sm-4">
                    <input type="text" name="sortIndex" placeholder="" value="<%=noonBusinessHourWeek.SortIndex %>"/>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-3 control-label pull-left smaller-80 col-sm-offset-1">最大预订数：</label>
                <div class="col-sm-4">
                    <input type="text" name="allowOrderNumber" placeholder="" value="<%=noonBusinessHourWeek.AllowOrderNumber %>"/>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-3 control-label pull-left smaller-80 col-sm-offset-1">是否有效：</label>
                <div class="col-sm-4">
                    <label class="checkbox-inline">
                        <input type="checkbox" name="state" id ="state" <%=noonBusinessHourWeek != null ? (noonBusinessHourWeek.State == 0 ? " checked='checked'" : ""): "" %> />
                    </label>
                </div>
            </div>
        </div>
        <div class="form-group">
            <div class="col-md-offset-3 col-md-4">
                <button class="btn btn-info" id="editSave" type="button">
                    <i class="icon-ok bigger-110"></i>保存
                </button>
            </div>
        </div>
    </form>
</div>