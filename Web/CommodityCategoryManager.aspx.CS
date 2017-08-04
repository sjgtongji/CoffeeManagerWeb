using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;

public partial class CommodityCategoryManager : ManagerBasePage
{
    protected int pageIndex = 1, pageSize = 20;
    protected long totalCount = 0;
    protected string resName = string.Empty;
    protected int resId = 0;
    protected List<CCommodityCategoryDTO> listCommodityCategoryDTO = new List<CCommodityCategoryDTO>();

    protected void Page_Load(object sender, EventArgs e)
    {
        pageIndex = Request["pageIndex"].DoTrim().ConvertToInt32(1);
        if(!string.IsNullOrWhiteSpace(Request["resId"]))
            resId = int.Parse(Request["resId"]);
        if(resId <= 0)
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

        resName = restaurantQuery.Value.name;

        XMS.Core.ReturnValue<QueryResultCCommodityCategoryDTO> commodityCategoryResult = WCFClient.CoffeeService.GetCommodityCategoryQuery(restaurantQuery.Value.resUUID, (pageIndex - 1) * pageSize + 1, pageSize);
        if (commodityCategoryResult.Code != 200 || commodityCategoryResult.Value == null)
        {
            XMS.Core.Container.LogService.Info(string.Format("获取商品类别列表错误 详细信息：{0}", restaurantQuery.RawMessage));
            return;
        }

        totalCount = commodityCategoryResult.Value.TotalCount;
        if (commodityCategoryResult.Value.Items != null && commodityCategoryResult.Value.Items.Length != 0)
            listCommodityCategoryDTO.AddRange(commodityCategoryResult.Value.Items);
    }
}