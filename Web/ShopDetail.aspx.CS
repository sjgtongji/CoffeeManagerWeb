using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Inner.Coffee.Service.Model;

public partial class ShopDetail : ManagerBasePage
{
    protected string ShowName { get; set; }
    protected int ShopId { get; set; }
    protected CRestaurantDTO restaurant = null;
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!string.IsNullOrWhiteSpace(Request["id"]))
            ShopId = int.Parse(Request["id"]);

        initInfo();
    }

    private void initInfo()
    {
        if (ShopId > 0)
        {
            ShowName = "修改商店";
            XMS.Core.ReturnValue<CRestaurantDTO> restResult = WCFClient.CoffeeService.GetRestaurantById(ShopId);
            if (restResult.Code != 200)
            {
                WCFClient.LoggerService.Info(string.Format("获取商店发生错误 详细信息:{0}", restResult.RawMessage));
            }
            else if (restResult.Value == null)
            {
                WCFClient.LoggerService.Info(string.Format("此餐厅不存在 ID:{0}", ShopId));
            }
            else if (restResult.Value != null)
            {
                restaurant = restResult.Value;
            }
        }
        else
            ShowName = "新增商店";
       
    }
}