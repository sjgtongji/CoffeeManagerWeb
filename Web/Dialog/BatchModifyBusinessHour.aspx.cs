using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;

public partial class Dialog_BatchModifyBusinessHour : System.Web.UI.Page
{
    //protected string nBusinessHourWeekUUID = string.Empty;
    //protected BusinessHourWeek objBusinessHourWeek = null;
    protected BusinessHourWeekDTO noonBusinessHourWeek = null;
    //protected BusinessHourWeek nightBusinessHourWeek = null;
    protected Dictionary<string, string> dic = new Dictionary<string, string>();
    protected string resId = string.Empty;
    protected string type = string.Empty;
    protected string act = string.Empty;
    protected bool isAdd = false;

    protected void Page_Load(object sender, EventArgs e)
    {
        resId = Request["resid"].DoTrim();
        type = Request["type"].DoTrim();
        act = Request["act"].DoTrim();
        if (act.ToLower().Equals("add", StringComparison.CurrentCultureIgnoreCase))
        {
            isAdd = true;
        }
        if (!isAdd)
        {
            ReturnValue<BusinessHourWeekDTO[]> objRV = WCFClient.CoffeeService.GetBusinessHourWeeksByResUUID(resId);
            if (objRV.Code == 200 && objRV.Value != null && objRV.Value.Length > 0)
            {
                if (!string.IsNullOrWhiteSpace(type))
                {
                    var arrNoon = objRV.Value.Where(p => p.TypeUUID == type);
                    if (arrNoon != null && arrNoon.Count() > 0)
                    {
                        noonBusinessHourWeek = arrNoon.OrderBy(x=>x.WeekDay).First();
                    }
                }
            }
        }

        if (noonBusinessHourWeek == null)
        {
            ReturnValue<KeyValue<string, string>[]> objKVBH = WCFClient.CoffeeService.GetAllBusinessHourTypesByResUUID(resId);
            if (objKVBH != null && objKVBH.Code == 200 && objKVBH.Value != null)
            {
                foreach (var item in objKVBH.Value)
                {
                    if (item != null)
                    {
                        if (!dic.ContainsKey(item.Key))
                        {
                            dic[item.Key] = item.Value;
                        }
                    }
                }
            }

            type = System.Guid.NewGuid().ToString();
            noonBusinessHourWeek = new BusinessHourWeekDTO() {  ResUUID = resId, TypeUUID = type };
        }
    }
}