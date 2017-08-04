using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using XMS.Core;
using Business;
using XMS.Inner.Coffee.Service.Model;

public partial class ShopManage : ManagerBasePage
{
    protected int pageIndex = 1, pageSize = 20;
    protected long totalCount = 0;
    protected string resName = string.Empty;
    protected List<CRestaurantDTO> listRestaurant = new List<CRestaurantDTO>();

    protected string getContactNumber(string contactNumber)
    {
        if(string.IsNullOrWhiteSpace(contactNumber))
            return string.Empty;
       return contactNumber.Replace(";", ";<br>");
    }

    protected void Page_Load(object sender, EventArgs e)
    {
      

        pageIndex = Request["pageIndex"].DoTrim().ConvertToInt32(1);
        resName = Request["resName"].DoTrim();
        XMS.Core.ReturnValue<QueryResultCRestaurantDTO> restaurantQuery = WCFClient.CoffeeService.GetRestaurantDTOByCondition(null, resName, null, null, null, null, null, (pageIndex - 1) * pageSize + 1, pageSize, true, null);
        if (restaurantQuery.Code != 200 || restaurantQuery.Value == null)
        {
            XMS.Core.Container.LogService.Info(string.Format("获取商品列表错误 详细信息：{0}", restaurantQuery.RawMessage));
            return;
        }
        totalCount = restaurantQuery.Value.TotalCount;
        if (restaurantQuery.Value.Items != null && restaurantQuery.Value.Items.Length != 0)
            listRestaurant.AddRange(restaurantQuery.Value.Items);
    }
}