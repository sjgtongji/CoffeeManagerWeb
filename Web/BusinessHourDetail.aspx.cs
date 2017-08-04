using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using Business;
using XMS.Inner.Coffee.Service.Model;
using XMS.Core;

public partial class BusinessHourDetail : ManagerBasePage
{
    protected BusinessHourWeekDTO[] businessHours;
    protected KeyValue<string, string>[] lstBusinessName;
    protected int resId;
    protected string resUUID = string.Empty;
    protected string resName = string.Empty;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!string.IsNullOrWhiteSpace(Request["resId"]))
            resId = int.Parse(Request["resId"]);
        if (resId <= 0)
        {
            resName = "请选择商店";
            return;
        }

        XMS.Core.ReturnValue<CRestaurantDTO> restaurantQuery = WCFClient.CoffeeService.GetRestaurantById(resId);
        if (restaurantQuery.Code != 200)
        {
            WCFClient.LoggerService.Error(string.Format("获取商店错误 详细信息:{0}", restaurantQuery.RawMessage));
            return;
        }
        if (restaurantQuery.Value == null)
        {
            resName = "商店不存在";
            return;
        }
        resUUID = restaurantQuery.Value.resUUID;
        resName = restaurantQuery.Value.name;

        var objResu = WCFClient.CoffeeService.GetBusinessHourWeeksByResUUID(restaurantQuery.Value.resUUID);
        if (objResu != null && objResu.Code == 200)
        {
            businessHours = objResu.Value;
            if (businessHours != null && businessHours.Length > 0)
            {
                ReturnValue<KeyValue<string, string>[]> objKVBH = WCFClient.CoffeeService.GetAllBusinessHourTypesByResUUID(restaurantQuery.Value.resUUID);
                if (objKVBH != null && objKVBH.Code == 200)
                {
                    lstBusinessName = objKVBH.Value;
                }
            }
        }
    }
}