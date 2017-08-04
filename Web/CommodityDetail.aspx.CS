using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Inner.Coffee.Service.Model;

public partial class CommodityDetail : ManagerBasePage
{
    protected string ShowName { get; set; }
    protected int commodityId { get; set; }
    protected CCommodityDTO commodityDTO = null;
    protected int resId = 0;
    protected bool ErrFlag = false;
    protected List<CCommodityCategoryDTO> listCommodityCategoryInfo = new List<CCommodityCategoryDTO>();

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!string.IsNullOrWhiteSpace(Request["commodityId"]))
            commodityId = int.Parse(Request["commodityId"]);
        resId = int.Parse(Request["resId"]);
        if (resId <= 0)
        {
            ShowName = "餐厅ID不正确";
            ErrFlag = true;
        }
        //commodityDTO.preferentialProportion
            
        initInfo();
    }

    private void initInfo()
    {
        if (commodityId > 0)
        {
            ShowName = "修改商品";
            XMS.Core.ReturnValue<CCommodityDTO> restResult = WCFClient.CoffeeService.GetCommodityById(commodityId);
            if (restResult.Code != 200)
            {
                WCFClient.LoggerService.Info(string.Format("获取商品发生错误 详细信息:{0}", restResult.RawMessage));
                ErrFlag = true;
            }
            else if (restResult.Value == null)
            {
                WCFClient.LoggerService.Info(string.Format("此商品不存在 ID:{0}", commodityId));
                ErrFlag = true;
            }
            else if (restResult.Value != null)
            {
                commodityDTO = restResult.Value;
            }
        }
        else
            ShowName = "新增商品";


        XMS.Core.ReturnValue<CRestaurantDTO> restaurantQuery = WCFClient.CoffeeService.GetRestaurantById(resId);
        if (restaurantQuery.Code != 200)
        {
            WCFClient.LoggerService.Error(string.Format("获取商店错误 详细信息:{0}", restaurantQuery.RawMessage));
            ErrFlag = true;
            return;
        }
        if (restaurantQuery.Value == null)
        {
            ErrFlag = true;
            return;
        }

        XMS.Core.ReturnValue<CCommodityCategoryDTO[]> commodityCategoryResult = WCFClient.CoffeeService.GetCommodityCategoryDtos(restaurantQuery.Value.resUUID);
        if (commodityCategoryResult.Code != 200)
        {
            ErrFlag = true;
            WCFClient.LoggerService.Error(string.Format("获取商品类别错误 详细信息:{0}", commodityCategoryResult.RawMessage));
            return;
        }

        if (commodityCategoryResult.Value != null || commodityCategoryResult.Value.Length > 0)
            listCommodityCategoryInfo.AddRange(commodityCategoryResult.Value);
    }
}