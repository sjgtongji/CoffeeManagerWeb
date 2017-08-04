using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;

public partial class CommodityPropertyManager : ManagerBasePage
{
    protected int pageIndex = 1, pageSize = 20;
    protected long totalCount = 0;
    protected string resName = string.Empty;
    protected int resId = 0;
    protected List<CCommodityPropertyDTO> listCCommodityPropertyDTO = new List<CCommodityPropertyDTO>();
    protected int commodityId = 0;

    protected string propertyCategoryUUID = "-1";
    protected List<CPropertyCategoryDTO> listPropertyCategory = new List<CPropertyCategoryDTO>();

    protected void Page_Load(object sender, EventArgs e)
    {
        intiData();

        if (resId <= 0)
        {
            resName = "请选择商店";
            return;
        }

        XMS.Core.ReturnValue<CRestaurantDTO> restaurantQuery = WCFClient.CoffeeService.GetRestaurantById(resId);
        if (restaurantQuery.Code != 200)
        {
            WCFClient.LoggerService.Error(string.Format("获取商店错误 详细信息:{0}", restaurantQuery.RawMessage));
            resName = restaurantQuery.Message;
            return;
        }
        if (restaurantQuery.Value == null)
        {
            resName = "商店不存在";
            return;
        }

        XMS.Core.ReturnValue<CCommodityDTO> commodityResult = WCFClient.CoffeeService.GetCommodityById(commodityId);
        if (commodityResult.Code != 200)
        {
            WCFClient.LoggerService.Error(string.Format("获取商品错误 详细信息:{0}", commodityResult.RawMessage));
            return;
        }
        if (commodityResult.Value == null)
        {
            resName = "此商品不存在";
            return;
        }

        if (restaurantQuery.Value.resUUID != commodityResult.Value.resUUID)
        {
            resName = "此商品不属于商店";
            return;
        }

        XMS.Core.ReturnValue<CPropertyCategoryDTO[]> propertyCategoryResult = WCFClient.CoffeeService.GetPropertyCategoryDTO(restaurantQuery.Value.id);
        if (propertyCategoryResult.Code != 200)
        {
            WCFClient.LoggerService.Error(string.Format("获取属性类别错误 详细信息:{0}", propertyCategoryResult.RawMessage));
            return;
        }

        if (propertyCategoryResult.Value != null || propertyCategoryResult.Value.Length > 0)
            listPropertyCategory.AddRange(propertyCategoryResult.Value);

        resName = restaurantQuery.Value.name + "  " + commodityResult.Value.chineseName;

       
        //商品类别
        List<string> listPropertyCategoryUUID = new List<string>();
        if (!string.IsNullOrWhiteSpace(propertyCategoryUUID) && propertyCategoryUUID != "-1")
        {
            listPropertyCategoryUUID.Add(propertyCategoryUUID);
        }

        XMS.Core.ReturnValue<QueryResultCCommodityPropertyDTO> commodityPropertyResult =
            WCFClient.CoffeeService.GetCommodityPropertyDTOs(null, restaurantQuery.Value.resUUID, null, new string[] { commodityResult.Value.commodityUUID }, listPropertyCategoryUUID.ToArray(), (pageIndex - 1) * pageSize + 1, pageSize);
        if (commodityPropertyResult.Code != 200 || commodityPropertyResult.Value == null)
        {
            XMS.Core.Container.LogService.Info(string.Format("获取商品属性列表错误 详细信息：{0}", commodityPropertyResult.RawMessage));
            return;
        }

        totalCount = commodityPropertyResult.Value.TotalCount;
        if (commodityPropertyResult.Value.Items != null && commodityPropertyResult.Value.Items.Length != 0)
            listCCommodityPropertyDTO.AddRange(commodityPropertyResult.Value.Items);
    }

    private void intiData()
    {
        if (!string.IsNullOrWhiteSpace(Request["resId"]))
            resId = int.Parse(Request["resId"]);
        pageIndex = Request["pageIndex"].DoTrim().ConvertToInt32(1);
        if (!string.IsNullOrWhiteSpace(Request["commodityId"]))
            commodityId = int.Parse(Request["commodityId"]);
        if(!string.IsNullOrWhiteSpace(Request["propertyCategoryUUID"]))
            propertyCategoryUUID = Request["propertyCategoryUUID"];
    }

    protected string GetPropertyCategoryName(string propertyUUID)
    {
        if (string.IsNullOrWhiteSpace(propertyUUID))
            return string.Empty;
        if (listPropertyCategory == null || listPropertyCategory.Count == 0)
            return string.Empty;

        CPropertyCategoryDTO propertyCategoryDTO = listPropertyCategory.FirstOrDefault(x => x.propertyCategoryUUID == propertyUUID);
        if (propertyCategoryDTO == null)
            return string.Empty;

        return propertyCategoryDTO.chineseName;
    }
}