using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;

public partial class Dialog_ModifyBusinessHour : System.Web.UI.Page
{
    protected BusinessHourWeekPO objBusinessHourWeek = null;
    protected string nBusinessHourWeekUUID = string.Empty, resId = string.Empty, action = string.Empty;

    protected void Page_Load(object sender, EventArgs e)
    {
        resId = Request["resid"].DoTrim();

        action = Request["act"].DoTrim();
        if (action.ToLower().Equals("add"))
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
            objBusinessHourWeek = new BusinessHourWeekPO()
            {
                ResUUID = resId,
                StartDate = new DateTime(1970, 1, 1),
                EndDate = new DateTime(2999, 12, 31),
                WeekDay = weekday,
                Name = name,
                TypeUUID = type,
                AllowOrderNumber = 0,
            };
        }
        else
        {
            action = "modify";
            nBusinessHourWeekUUID = Request["id"].DoTrim();
            ReturnValue<BusinessHourWeekPO[]> retBusinessHourWeek = WCFClient.CoffeeService.GetBusinessHourWeekList(null, new string[] { nBusinessHourWeekUUID }, new string[] { resId }, null);
            if (retBusinessHourWeek.Code == 200)
            {
                if (retBusinessHourWeek.Value != null && retBusinessHourWeek.Value.Length > 0)
                    objBusinessHourWeek = retBusinessHourWeek.Value[0];

                if (objBusinessHourWeek == null)
                {
                    Response.Write("未找到预订时间");
                    Response.End();
                }
            }
            else
            {
                Response.Write("查询预订时间出错：" + retBusinessHourWeek.Message);
                Response.End();
            }
        }

        if (!objBusinessHourWeek.StartDate.HasValue)
            objBusinessHourWeek.StartDate = new DateTime(1970, 1, 1);
        if(!objBusinessHourWeek.EndDate.HasValue)
            objBusinessHourWeek.EndDate = new DateTime(2999, 12, 31);
    }
}