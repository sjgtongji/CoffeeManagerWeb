using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Inner.Coffee.Service.Model;

public partial class CommodityPropertyDetail : ManagerBasePage
{
    protected string ShowName { get; set; }
    protected int commodityPropertyId { get; set; }
    protected CCommodityPropertyDTO commodityPropertyDTO = null;
    protected int resId = 0;
    protected bool ErrFlag = false;
    protected List<CPropertyCategoryDTO> listPropertyCategory = new List<CPropertyCategoryDTO>();
    protected int commodityId = 0;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!string.IsNullOrWhiteSpace(Request["commodityPropertyId"]))
            commodityPropertyId = int.Parse(Request["commodityPropertyId"]);
        resId = int.Parse(Request["resId"]);
        if (resId <= 0)
        {
            ShowName = "餐厅ID不正确";
            ErrFlag = true;
            return;
        }

        if (!string.IsNullOrWhiteSpace(Request["commodityId"]))
            commodityId = int.Parse(Request["commodityId"]);
        if (commodityId <= 0)
        {
            ShowName = "商品ID不正确";
            ErrFlag = true;
            return;
        }

        //commodityDTO.preferentialProportion

        initInfo();
    }

    private void initInfo()
    {
        if (commodityPropertyId > 0)
        {
            ShowName = "修改商品属性";
            XMS.Core.ReturnValue<CCommodityPropertyDTO> restResult = WCFClient.CoffeeService.GetCommodityPropertyById(commodityPropertyId);
            if (restResult.Code != 200)
            {
                WCFClient.LoggerService.Info(string.Format("获取商品属性发生错误 详细信息:{0}", restResult.RawMessage));
                ErrFlag = true;
            }
            else if (restResult.Value == null)
            {
                WCFClient.LoggerService.Info(string.Format("此商品属性不存在 ID:{0}", commodityPropertyId));
                ErrFlag = true;
            }
            else if (restResult.Value != null)
            {
                commodityPropertyDTO = restResult.Value;
            }
        }
        else
            ShowName = "新增商品属性";


        XMS.Core.ReturnValue<CPropertyCategoryDTO[]> propertyCategoryResult = WCFClient.CoffeeService.GetPropertyCategoryDTO(resId);
        if (propertyCategoryResult.Code != 200)
        {
            WCFClient.LoggerService.Error(string.Format("获取属性类别错误 详细信息:{0}", propertyCategoryResult.RawMessage));
            ErrFlag = true;
            return;
        }

        if (propertyCategoryResult.Value != null || propertyCategoryResult.Value.Length > 0)
            listPropertyCategory.AddRange(propertyCategoryResult.Value);
    }
}