using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;

public partial class Ajax_BusinessHourEditAjax : ManagerBasePage
{
    protected string action = string.Empty;
    protected string msg = "操作成功";
    protected bool isSucc = false;
    protected string resId = string.Empty;

    protected void Page_Load(object sender, EventArgs e)
    {
        action = Request["action"].DoTrim();
        
        #region 操作
        if (string.IsNullOrEmpty(action))
        {
            msg = "无效的操作";
            FGForm.Alert(msg);
        }

        resId = Request["resid"].DoTrim();

        if (string.IsNullOrEmpty(resId))
        {
            msg = "未选择餐厅";
            FGForm.Alert(msg);
        }

        switch (action.ToLower())
        {
            case "modify":
                //修改时间段
                ModifyBusinessHour();
                break;
            case "batchmodify":
                //批量修改
                BatchModifyBusinessHour();
                break;
            case "batchtypemodify":
                //批量添加/修改
                BatchModifyBusinessHourByType();
                break;
            case "batchdelete":
                //批量删除
                BatchDeleteBusinessHourByType();
                break;
            case "delbusinesshourweek":
                //删除单个时间段
                DeleteBusinessHourWeek();
                break;
            case "add":
                //单独添加时间段
                AddBusinessHourWeek();
                break;
            default:
                msg = "无效的操作";
                break;
        }
        #endregion

        if (isSucc)
        {
            FGForm.Success(msg);
        }
        else
        {
            FGForm.Alert(msg);
        }
    }

    private void ModifyBusinessHour()
    {
        try
        {
            string uuid = Request["id"].DoTrim();

            if (string.IsNullOrEmpty(uuid))
            {
                msg = "未选择营业时间";
                return;
            }

            DateTime startDate = Request["startDate"].DoTrim().ConvertToDateTime(new DateTime(1970, 1, 1));
            DateTime endDate = Request["endDate"].DoTrim().ConvertToDateTime(new DateTime(2999, 12, 31));

            //新规则，结束日期必须大于或等于起始日期
            //added by wei yang         2015-08-04
            if (startDate > endDate)
            {
                isSucc = false;
                msg = "结束日期应大于或等于起始日期";
                return;
            }

            int startHour = Request["startHour"].DoTrim().ConvertToInt32(0);
            int startMin = Request["startMin"].DoTrim().ConvertToInt32(0);
            int endHour = Request["endHour"].DoTrim().ConvertToInt32(0);
            int endMin = Request["endMin"].DoTrim().ConvertToInt32(0);

            //新规则，结束时间必须大于起始时间
            //added by wei yang         2015-08-04
            if ((startHour * 60 + startMin) >= (endHour * 60 + endMin))
            {
                isSucc = false;
                msg = "结束时间应大于起始时间";
                return;
            }

            decimal inAdvance = Request["inAdvance"].DoTrim().ConvertToDecimal(0);
            int? latestOrderTime = null;
            int? latestHour = Request["latestHour"].DoTrim().ConvertToNullableInt32();
            int? latestMin = Request["latestMin"].DoTrim().ConvertToNullableInt32();
            if (latestHour.HasValue && latestMin.HasValue)
            {
                latestOrderTime = (int)TimeSpan.FromMinutes((latestHour.HasValue ? latestHour.Value : 0) * 60 + (latestMin.HasValue ? latestMin.Value : 0)).TotalMilliseconds;
            }

            BusinessHourWeekPO objBusinessHourWeek = null;
            XMS.Core.ReturnValue<BusinessHourWeekPO[]> objRV = WCFClient.CoffeeService.GetBusinessHourWeekList(null, new string[] { uuid }, new string[] { resId }, null);
            if (objRV.Code == 200)
            {
                if (objRV.Value != null && objRV.Value.Length > 0)
                    objBusinessHourWeek = objRV.Value[0];

                if (objBusinessHourWeek == null)
                {
                    msg = "未找到营业时间";
                    return;
                }
            }
            else
            {
                msg = "查询营业时间出错：" + objRV.Message;
                return;
            }

            byte state = (base.Request["state"] == null) ? (byte)1 : (byte)0;
            decimal allowOrderNumber = Request["allowOrderNumber"].ConvertToDecimal(0);
            UpdateBusinessHourWeekDTO businessHourWeek = new UpdateBusinessHourWeekDTO()
            {
                AllowOrderNumber = allowOrderNumber,
                InAdvance = inAdvance,
                EndDate = endDate,
                StartDate = startDate,
                StartTime = (int)TimeSpan.FromMinutes(startHour * 60 + startMin).TotalMilliseconds,
                EndTime = (int)TimeSpan.FromMinutes(endHour * 60 + endMin).TotalMilliseconds,
                SortIndex = objBusinessHourWeek.SortIndex,
                Id = objBusinessHourWeek.Id,
                LatestOrderTime = latestOrderTime,
                ResUUID = objBusinessHourWeek.ResUUID,
                Name = objBusinessHourWeek.Name,
                State = state
            };

            ReturnValue<int> retValue = WCFClient.CoffeeService.UpdateBusinessHourWeek(businessHourWeek, Manager.Name);
            if (retValue.Code == 200)
            {
                msg = "操作成功";
                isSucc = true;
                return;
            }
            else
            {
                WCFClient.LoggerService.Error(retValue.Message);
                msg = "操作出错：" + retValue.Message;
                return;
            }
        }
        catch (Exception ex)
        {
            WCFClient.LoggerService.Error(ex.Message);
            msg = "操作出错：" + ex.Message;
            return;
        }
    }

    private void BatchModifyBusinessHour()
    {
        try
        {
            string type = Request["type"].DoTrim();

            int noondStartHour = Request["noonStartHour"].ConvertToInt32(0);
            int noonStartMin = Request["noonStartMin"].ConvertToInt32(0);
            int noonEndHour = Request["noonEndHour"].ConvertToInt32(0);
            int noonEndMin = Request["noonEndMin"].ConvertToInt32(0);

            //新规则，结束时间必须大于起始时间
            //added by wei yang         2015-08-04
            if ((noondStartHour * 60 + noonStartMin) >= (noonEndHour * 60 + noonEndMin))
            {
                isSucc = false;
                msg = "结束时间应大于起始时间";
                return;
            }

            decimal noonInAdvance = Request["noonInAdvance"].ConvertToDecimal(0);
            int? noonLatestHour = Request["noonLatestHour"].DoTrim().ConvertToNullableInt32();
            int? noonLatestMin = Request["noonLatestMin"].DoTrim().ConvertToNullableInt32();
            int? noonLatestOrderTime = null;
            if (noonLatestHour.HasValue && noonLatestMin.HasValue)
            {
                noonLatestOrderTime = (int)TimeSpan.FromMinutes((noonLatestHour.HasValue ? noonLatestHour.Value : 0) * 60 + (noonLatestMin.HasValue ? noonLatestMin.Value : 0)).TotalMilliseconds;
            }
            byte state = (base.Request["state"] == null) ? (byte)1 : (byte)0;
            decimal allowOrderNumber = Request["allowOrderNumber"].ConvertToDecimal(0);

            ReturnValue<BusinessHourWeekDTO[]> objRV = WCFClient.CoffeeService.GetBusinessHourWeeksByResUUID(resId);
            if (objRV.Code == 200)
            {
                if (objRV.Value == null || objRV.Value.Length == 0)
                {
                    msg = "未找到该餐厅营业时间";
                    return;
                }
            }
            else
            {
                msg = "查询营业时间出错：" + objRV.Message;
                return;
            }

            foreach (var item in objRV.Value)
            {
                if (item.TypeUUID != type)
                    continue;

                if (item != null)
                {
                    UpdateBusinessHourWeekDTO businessHourWeek = new UpdateBusinessHourWeekDTO()
                    {
                        AllowOrderNumber = allowOrderNumber,
                        EndDate = item.EndDate,
                        StartDate = item.StartDate,
                        EndTime = (int)TimeSpan.FromMinutes(noonEndHour * 60 + noonEndMin).TotalMilliseconds,
                        StartTime = (int)TimeSpan.FromMinutes(noondStartHour * 60 + noonStartMin).TotalMilliseconds,
                        Id = item.id,
                        InAdvance = noonInAdvance,
                        LatestOrderTime = noonLatestOrderTime,
                        Name = item.Name,
                        State = state,
                        ResUUID = item.ResUUID,
                        SortIndex = item.SortIndex
                    };
                    ReturnValue<int> retValue = WCFClient.CoffeeService.UpdateBusinessHourWeek(businessHourWeek, Manager.Name);
                    if (retValue.Code == 200)
                    {
                        msg = "操作成功";
                        isSucc = true;
                    }
                    else
                    {
                        WCFClient.LoggerService.Error(retValue.Message);
                        msg = "操作出错：" + retValue.Message;
                        isSucc = false;
                        break;
                    }
                }
            }

            isSucc = true;
        }
        catch (Exception ex)
        {
            WCFClient.LoggerService.Error(ex.Message);
        }
    }

    private void BatchModifyBusinessHourByType()
    {
        try
        {
            bool isAdd = Request["isadd"].DoTrim().ConvertToBoolean();
            string type = Request["type"].DoTrim();
            string name = Request["name"].DoTrim();
            int sortIndex = Request["sortIndex"].DoTrim().ConvertTo<int>(0);
            if (string.IsNullOrEmpty(name))
            {
                msg = "请输入名称";
                return;
            }

            int noondStartHour = Request["noonStartHour"].ConvertToInt32(0);
            int noonStartMin = Request["noonStartMin"].ConvertToInt32(0);
            int noonEndHour = Request["noonEndHour"].ConvertToInt32(0);
            int noonEndMin = Request["noonEndMin"].ConvertToInt32(0);

            //新规则，结束时间必须大于起始时间
            //added by wei yang         2015-08-04
            if ((noondStartHour * 60 + noonStartMin) >= (noonEndHour * 60 + noonEndMin))
            {
                isSucc = false;
                msg = "结束时间应大于起始时间";
                return;
            }

            decimal noonInAdvance = Request["noonInAdvance"].ConvertToDecimal(0);
            int? noonLatestHour = Request["noonLatestHour"].DoTrim().ConvertToNullableInt32();
            int? noonLatestMin = Request["noonLatestMin"].DoTrim().ConvertToNullableInt32();
            int? noonLatestOrderTime = null;
            byte state = (base.Request["state"] == null) ? (byte)1 : (byte)0;
            decimal allowOrderNumber = Request["allowOrderNumber"].ConvertToDecimal(0);
            if (noonLatestHour.HasValue && noonLatestMin.HasValue)
            {
                noonLatestOrderTime = (int)TimeSpan.FromMinutes((noonLatestHour.HasValue ? noonLatestHour.Value : 0) * 60 + (noonLatestMin.HasValue ? noonLatestMin.Value : 0)).TotalMilliseconds;
            }

            ReturnValue<BusinessHourWeekDTO[]> objRV = WCFClient.CoffeeService.GetBusinessHourWeeksByResUUID(resId);
            if (objRV.Code != 200)
            {
                msg = "查询营业时间出错：" + objRV.Message;
                return;
            }

            if (!isAdd)
            {
                if (objRV.Value == null || objRV.Value.Length == 0)
                {
                    msg = "未找到该餐厅营业时间";
                    return;
                }
                
                foreach (var item in objRV.Value)
                {
                    if (item != null)
                    {
                        if (item.TypeUUID == type)
                        {
                            UpdateBusinessHourWeekDTO updateBusinessHourWeek = new UpdateBusinessHourWeekDTO()
                            {
                                AllowOrderNumber = allowOrderNumber,
                                EndDate = item.EndDate,
                                StartDate = item.StartDate,
                                EndTime = (int)TimeSpan.FromMinutes(noonEndHour * 60 + noonEndMin).TotalMilliseconds,
                                InAdvance = noonInAdvance,
                                Id = item.id,
                                LatestOrderTime = noonLatestOrderTime,
                                Name = name,
                                ResUUID = resId,
                                SortIndex = sortIndex,
                                StartTime = (int)TimeSpan.FromMinutes(noondStartHour * 60 + noonStartMin).TotalMilliseconds,
                                State = state,
                            };
                            XMS.Core.ReturnValue<int> addResult = WCFClient.CoffeeService.UpdateBusinessHourWeek(updateBusinessHourWeek, Manager.Name);

                            if (addResult.Code == 200)
                            {
                                msg = "操作成功";
                                isSucc = true;
                            }
                            else
                            {
                                WCFClient.LoggerService.Error(addResult.Message);
                                msg = "操作出错：" + addResult.Message;
                                isSucc = false;
                                break;
                            }

                        }
                    }
                }
            }
            else
            {
                if (objRV.Value != null && objRV.Value.Where(p => p.TypeUUID == type).Count() > 0)
                {
                    msg = "操作出错：该餐厅已无法添加预订时段";
                    FGForm.Success(msg);
                }
                else
                {
                    BusinessHourWeekBaseDTO businessHourWeekBase = new BusinessHourWeekBaseDTO()
                    {
                        AllowOrderNumber = allowOrderNumber,
                        EndDate = new DateTime(2999, 12, 31),
                        StartDate = new DateTime(1970, 1, 1),
                        EndTime = (int)TimeSpan.FromMinutes(noonEndHour * 60 + noonEndMin).TotalMilliseconds,
                        StartTime = (int)TimeSpan.FromMinutes(noondStartHour * 60 + noonStartMin).TotalMilliseconds,
                        InAdvance = noonInAdvance,
                        LatestOrderTime = noonLatestOrderTime,
                        Name = name,
                        ResUUID = resId,
                        SortIndex = sortIndex,
                        State = state

                    };
                    ReturnValue<bool> retValue = WCFClient.CoffeeService.AddBusinessHourWeekBase(businessHourWeekBase, Manager.Name);
                    if (retValue.Code == 200)
                    {
                        msg = "操作成功";
                        isSucc = true;
                    }
                    else
                    {
                        WCFClient.LoggerService.Error(retValue.Message);
                        msg = "操作出错：" + retValue.Message;
                        isSucc = false;
                    }
                }
            }

            //isSucc = true;
        }
        catch (Exception ex)
        {
            WCFClient.LoggerService.Error(ex.Message);
        }
    }

    private void BatchDeleteBusinessHourByType()
    {
        try
        {
            string type = Request["type"].DoTrim();

            if (string.IsNullOrWhiteSpace(type))
            {
                msg = "无效的市别类型" + type.ToString();
                return;
            }

            XMS.Core.ReturnValue<bool> deleteResult = WCFClient.CoffeeService.DeleteBusinessHourWeek(type, Manager.Name);
            if (deleteResult.Code == 200)
            {
                msg = "操作成功";
                isSucc = true;
            }
            else
            {
                WCFClient.LoggerService.Error(deleteResult.Message);
                msg = "操作出错：" + deleteResult.Message;
                isSucc = false;
            }
        }
        catch (Exception ex)
        {
            WCFClient.LoggerService.Error(ex.Message);
        }
    }

    private void DeleteBusinessHourWeek()
    {
        int id = Request["id"].DoTrim().ConvertToInt32();
        if (id > 0)
        {
            var objRV = WCFClient.CoffeeService.DeleteBusinessHourWeekById(id, Manager.Name);
            if (objRV.Code == 200)
            {
                msg = "操作成功";
                isSucc = true;
                return;
            }
            else
            {
                WCFClient.LoggerService.Error(objRV.Message);
                msg = "操作出错：" + objRV.Message;
                isSucc = false;
                return;
            }
        }

        isSucc = true;
    }

    private void AddBusinessHourWeek()
    {
        try
        {
            string name = Request["name"].DoTrim();
            if (string.IsNullOrEmpty(name))
            {
                Response.Write("无效的名称");
                Response.End();
            }
            string type = Request["type"].DoTrim();
            //if (type <= 2)
            //{
            //    Response.Write("无效的类别");
            //    Response.End();
            //}
            int weekday = Request["weekday"].DoTrim().ConvertToByte();
            if (weekday > 7 || weekday < 0)
            {
                Response.Write("无效的星期");
                Response.End();
            }

            DateTime startDate = Request["startDate"].DoTrim().ConvertToDateTime(new DateTime(1970, 1, 1));
            DateTime endDate = Request["endDate"].DoTrim().ConvertToDateTime(new DateTime(2999, 12, 31));

            //新规则，结束日期必须大于或等于起始日期
            //added by wei yang         2015-08-04
            if (startDate > endDate)
            {
                isSucc = false;
                msg = "结束日期应大于或等于起始日期";
                return;
            }

            int startHour = Request["startHour"].DoTrim().ConvertToInt32(0);
            int startMin = Request["startMin"].DoTrim().ConvertToInt32(0);
            int endHour = Request["endHour"].DoTrim().ConvertToInt32(0);
            int endMin = Request["endMin"].DoTrim().ConvertToInt32(0);

            //新规则，结束时间必须大于起始时间
            //added by wei yang         2015-08-04
            if ((startHour * 60 + startMin) >= (endHour * 60 + endMin))
            {
                isSucc = false;
                msg = "结束时间应大于起始时间";
                return;
            }

            XMS.Core.ReturnValue<BusinessHourWeekPO[]> businessHourWeekResult = WCFClient.CoffeeService.GetBusinessHourWeekList(null, null, new string[] { resId }, new string[] { type });
            if (businessHourWeekResult.Code != 200)
            {
                WCFClient.LoggerService.Error(businessHourWeekResult.RawMessage);
                isSucc = false;
                msg = "发生异常";
                return;
            }

            decimal inAdvance = Request["inAdvance"].DoTrim().ConvertToDecimal(0);
            int? latestOrderTime = null;
            int? latestHour = Request["latestHour"].DoTrim().ConvertToNullableInt32();
            int? latestMin = Request["latestMin"].DoTrim().ConvertToNullableInt32();
            if (latestHour.HasValue && latestMin.HasValue)
            {
                latestOrderTime = (int)TimeSpan.FromMinutes((latestHour.HasValue ? latestHour.Value : 0) * 60 + (latestMin.HasValue ? latestMin.Value : 0)).TotalMilliseconds;
            }
            byte state = (base.Request["state"] == null) ? (byte)1 : (byte)0;
            decimal allowOrderNumber = Request["allowOrderNumber"].ConvertToDecimal(0);

            AddBusinessHourWeekDTO objBusinessHourWeek = new AddBusinessHourWeekDTO()
            {
                ResUUID = resId,
                Name = name,
                WeekDay = weekday,
                TypeUUID = type,
                StartDate = startDate,
                EndDate = endDate,
                StartTime = (int)TimeSpan.FromMinutes(startHour * 60 + startMin).TotalMilliseconds,
                EndTime = (int)TimeSpan.FromMinutes(endHour * 60 + endMin).TotalMilliseconds,
                InAdvance = inAdvance,
                LatestOrderTime = latestOrderTime,
                AllowOrderNumber = allowOrderNumber,
                SortIndex = businessHourWeekResult.Value == null || businessHourWeekResult.Value.Length == 0 ? 0 : businessHourWeekResult.Value[0].SortIndex,
                State = state
            };
            ReturnValue<int> retValue = WCFClient.CoffeeService.AddBusinessHourWeek(objBusinessHourWeek, Manager.Name);
            if (retValue.Code == 200)
            {
                msg = "操作成功";
                isSucc = true;
                return;
            }
            else
            {
                WCFClient.LoggerService.Error(retValue.Message);
                msg = "操作出错：" + retValue.Message;
                return;
            }
        }
        catch (Exception ex)
        {
            WCFClient.LoggerService.Error(ex.Message);
            msg = "操作出错：" + ex.Message;
            return;
        }
    }

    private string GetBusinessHourWeekNameByType(byte type)
    {
        switch (type)
        {
            case 0:
                return "全天";
            case 1:
                return "午市";
            case 2:
                return "晚市";
            case 4:
                return "早市";
            case 8:
                return "上午茶";
            case 16:
                return "下午茶";
            case 32:
                return "夜宵";
            default:
                return "未知";
        }
    }
}