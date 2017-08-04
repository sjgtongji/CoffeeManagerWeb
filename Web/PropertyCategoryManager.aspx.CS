using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;
using Business;

public partial class PropertyCategoryManager : ManagerBasePage
{
    protected int pageIndex = 1, pageSize = 20;
    protected long totalCount = 0;
    protected string resName = string.Empty;
    protected int resId = 0;
    protected List<CPropertyCategoryDTO> listCPropertyCategory = new List<CPropertyCategoryDTO>();

    protected void Page_Load(object sender, EventArgs e)
    {
        pageIndex = Request["pageIndex"].DoTrim().ConvertToInt32(1);
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

        resName = restaurantQuery.Value.name;
        XMS.Core.ReturnValue<QueryResultCPropertyCategoryDTO> propertyCategoryResult = WCFClient.CoffeeService.GetPropertyCategoryQuery(restaurantQuery.Value.resUUID, null, (pageIndex - 1) * pageSize + 1, pageSize);

        if (propertyCategoryResult.Code != 200 || propertyCategoryResult.Value == null)
        {
            XMS.Core.Container.LogService.Info(string.Format("获取属性类别列表错误 详细信息：{0}", restaurantQuery.RawMessage));
            return;
        }

        totalCount = propertyCategoryResult.Value.TotalCount;
        if (propertyCategoryResult.Value.Items != null && propertyCategoryResult.Value.Items.Length != 0)
            listCPropertyCategory.AddRange(propertyCategoryResult.Value.Items);
    }
}