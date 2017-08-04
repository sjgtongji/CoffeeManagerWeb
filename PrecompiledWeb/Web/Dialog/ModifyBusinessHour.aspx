<%@ page language="C#" autoeventwireup="true" inherits="Dialog_ModifyBusinessHour, App_Web_modifybusinesshour.aspx.e733171c" %>

<div class="p20">
    <form id="addBox" action="<%=Business.CoffeePage.VirtulName %>/ajax/businesshoureditajax.aspx?resid=<%=resId %>&id=<%=objBusinessHourWeek.UUID %>&action=<%=action %>" method="post" class="form-horizontal">
    <input type="hidden" name="name" value=<%=objBusinessHourWeek.Name %> />
    <input type="hidden" name="type" value=<%=objBusinessHourWeek.TypeUUID %> />
    <input type="hidden" name="weekday" value=<%=objBusinessHourWeek.WeekDay %> />
    <div class="form-group">
            <label for="startDate" class="col-sm-3 control-label pull-left">起始日期：</label>
            <div class="col-sm-4">
                <div class="input-group input-group-sm">
                    <input type="text" id="startDate" name="startDate" class="form-control hasDatepicker" value="<%=objBusinessHourWeek.StartDate.Value.ToString("yyyy-MM-dd") %>"/>
                    <span class="input-group-addon"> <i class="icon-calendar"></i>
                    </span>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="endDate" class="col-sm-3 control-label pull-left">结束日期：</label>
            <div class="col-sm-4">
                <div class="input-group input-group-sm">
                    <input type="text" id="endDate" name="endDate" class="form-control hasDatepicker" value="<%=objBusinessHourWeek.EndDate.Value.ToString("yyyy-MM-dd") %>"/>
                    <span class="input-group-addon"> <i class="icon-calendar"></i>
                    </span>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="start" class="col-sm-3 control-label pull-left">起始时间：</label>
            <% TimeSpan tsStart = TimeSpan.FromMilliseconds(objBusinessHourWeek==null?0:objBusinessHourWeek.StartTime);%>
            <div class="col-sm-4">
                <select name="startHour" class="w60">
                    <%if (objBusinessHourWeek != null)
              {
                  for (int j = 0; j <= 23; j++)
                  {%>
            <option value="<%=j %>" <%= j == tsStart.Hours ? "selected" : ""%>><%=j%>点</option>
                    <%}%>
            <%} %>
                </select> - 
                <select name="startMin" class="w60">
                    <%for (int m = 0; m < 60; m += 15)
                  { %>
                <option value="<%=m %>" <%= m==tsStart.Minutes?"selected":"" %>><%=m%>分</option>
                <%} %>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="end" class="col-sm-3 control-label pull-left">结束时间：</label>
            <% TimeSpan tsEnd = TimeSpan.FromMilliseconds(objBusinessHourWeek==null?0:objBusinessHourWeek.EndTime);%>
            <div class="col-sm-4">
                <select name="endHour" class="w60">
                <%if (objBusinessHourWeek != null)
              {
                  for (int j = 0; j <= 23; j++)
                  {%>
            <option value="<%=j %>" <%= j == tsEnd.Hours ? "selected" : ""%>><%=j%>点</option>
                    <%}%>
            <%} %>
                </select> - 
                <select name="endMin" class="w60">
                    <%for (int m = 0; m < 60; m += 15)
                  { %>
                <option value="<%=m %>" <%= m==tsEnd.Minutes?"selected":"" %>><%=m%>分</option>
                <%} %>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label class="col-sm-3 control-label pull-left">提前预定小时：</label>
            <div class="col-sm-4">
                <input type="text" id="inAdvance" name="inAdvance" placeholder="" value="<%=objBusinessHourWeek.InAdvance %>"/>
            </div>
        </div>
        
        <div class="form-group">
            <label for="latest" class="col-sm-3 control-label pull-left">最晚接单时间：</label>
            <% TimeSpan? tsLatest = objBusinessHourWeek == null || !objBusinessHourWeek.LatestOrderTime.HasValue ? null : (TimeSpan?)TimeSpan.FromMilliseconds(objBusinessHourWeek.LatestOrderTime.Value);%>
            <div class="col-sm-4">
                <select name="latestHour" class="w60">
                <option value="" <%= objBusinessHourWeek == null || !objBusinessHourWeek.LatestOrderTime.HasValue ? "selected" : ""%>>无</option>
                <%if (objBusinessHourWeek != null)
              {
                  for (int j = 0; j <= 23; j++)
                  {%>
            <option value="<%=j %>" <%= tsLatest.HasValue && j == tsLatest.Value.Hours ? "selected" : ""%>><%=j%>点</option>
                    <%}%>
            <%} %>
                </select> - 
                <select name="latestMin" class="w60">
                <option value="" <%= objBusinessHourWeek == null || !objBusinessHourWeek.LatestOrderTime.HasValue ? "selected" : ""%>>无</option>
                    <%for (int m = 0; m < 60; m += 15)
                  { %>
                <option value="<%=m %>" <%= tsLatest.HasValue && m == tsLatest.Value.Minutes ? "selected" : "" %>><%=m%>分</option>
                <%} %>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label class="col-sm-3 control-label pull-left smaller-80 col-sm-offset-1">最大预订数：</label>
            <div class="col-sm-4">
                <input type="text" id="allowOrderNumber" name="allowOrderNumber" placeholder="" value="<%=(int)objBusinessHourWeek.AllowOrderNumber %>"/>
            </div>
        </div>
        <div class="form-group">
            <label class="col-sm-3 control-label pull-left smaller-80 col-sm-offset-1">是否有效：</label>
            <div class="col-sm-4">
                <label class="checkbox-inline">
                    <input type="checkbox" name="state" id ="state" <%=objBusinessHourWeek != null ? (objBusinessHourWeek.State == 0 ? " checked='checked'" : ""): "" %> />
                </label>
            </div>
        </div>

        <div class="form-group">
            <div class="col-md-offset-3 col-md-3">
                <button class="btn btn-info" id="editSave" type="button">
                    <i class="icon-ok bigger-110"></i>保存
                </button>
                <%if (action.Equals("modify"))
                  { %>
                <button class="btn btn-info" id="editDel" data-id="<%=objBusinessHourWeek.Id %>" data-act="delBusinessHourWeek" type="button">
                    <i class="icon-ok bigger-110"></i>删除
                </button>
                <%} %>
            </div>
        </div>
    </form>
</div>