using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Inner.Coffee.Service.Model;

public partial class CoordinateDetails : ManagerBasePage
{
    protected CRestaurantDTO restaurant = null;
    protected int ShopId { get; set; }
    protected string ShowName { get; set; }
    protected string strCoordinateInfo = string.Empty;
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!string.IsNullOrWhiteSpace(Request["resid"]))
            ShopId = int.Parse(Request["resid"]);
        initInfo();

        XMS.Core.ReturnValue<CResCoordinatePO[]> result = WCFClient.CoffeeService.GetCResCoordinateList(null, restaurant.resUUID, null, null, null);
        if (result.Code != 200)
        {
            WCFClient.LoggerService.Info(string.Format("获取商店坐标错误发生错误 详细信息:{0}", result.RawMessage));
            return;
        }

        List<CoordinateInfo> listCoordinateInfo = new List<CoordinateInfo>();
        if (result.Value == null || result.Value.Length == 0)
        {
            strCoordinateInfo = XMS.Core.Json.JsonSerializer.Serialize(listCoordinateInfo);
            return;
        }
            

        foreach (var item in result.Value)
        {
            CoordinateInfo coordinateInfo = new CoordinateInfo()
            {
                Latitude = item.Latitude,
                Longitude = item.Longitude
            };
        }

        strCoordinateInfo = XMS.Core.Json.JsonSerializer.Serialize(listCoordinateInfo);
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
/// <summary>
/// 
/// </summary>
[Serializable]
public class CoordinateInfo
{
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
}