using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;

public partial class Ajax_CommodityPropertyDetailAjax : ManagerBasePage
{
    AjaxResult ajaxResult = new AjaxResult();
    protected string act = string.Empty;
    protected void Page_Load(object sender, EventArgs e)
    {
        act = Request["act"].DoTrim().ToLower();
        switch (act.ToLower())
        {
            case "delete":
                Delete();
                break;
            case "save":
                Save();
                break;
            default:
                break;
        }
        Response.Write(XMS.Core.Json.JsonSerializer.Serialize(ajaxResult));
        Response.End();
    }

    private void Save()
    {
        try
        {
            string sresId = Request["resId"].DoTrim();
            if (string.IsNullOrWhiteSpace(sresId))
            {
                ajaxResult.msg = "商店编号无效";
                return;
            }
            int resId = int.Parse(sresId);

            XMS.Core.ReturnValue<CRestaurantDTO> restResult = WCFClient.CoffeeService.GetRestaurantById(resId);
            if (restResult.Code != 200)
            {
                ajaxResult.msg = string.Format("获取商店发生错误 详细信息:{0}", restResult.Message);
                WCFClient.LoggerService.Error(string.Format("获取商店发生错误 详细信息:{0}", restResult.RawMessage));
                return;
            }
            else if (restResult.Value == null)
            {
                ajaxResult.msg = string.Format("此商店不存在 ID:{0}", resId);
                WCFClient.LoggerService.Error(string.Format("此商店不存在 ID:{0}", resId));
                return;
            }

            int commodityId = int.Parse(Request["commodityId"]);
            if (commodityId <= 0)
            {
                ajaxResult.msg = "获取商品编号不正确";
                return;
            }
            XMS.Core.ReturnValue<CCommodityDTO> commodityResult = WCFClient.CoffeeService.GetCommodityById(commodityId);
            if (commodityResult.Code != 200)
            {
                WCFClient.LoggerService.Info(string.Format("获取商品发生错误 详细信息:{0}", commodityResult.RawMessage));
                ajaxResult.msg = string.Format("获取商品发生错误 详细信息:{0}", commodityResult.Message);
                return;
            }
            else if (commodityResult.Value == null)
            {
                WCFClient.LoggerService.Info(string.Format("此商品不存在 ID:{0}", commodityId));
                ajaxResult.msg = string.Format("此商品不存在");
                return;
            }

            int commodityPropertyId = int.Parse(Request["commodityPropertyId"]);
            if (commodityPropertyId > 0)
            {
                XMS.Core.ReturnValue<CCommodityPropertyDTO> commodityPropertyResult = WCFClient.CoffeeService.GetCommodityPropertyById(commodityPropertyId);
                if (commodityPropertyResult.Code != 200)
                {
                    WCFClient.LoggerService.Info(string.Format("获取商品属性发生错误 详细信息:{0}", commodityPropertyResult.RawMessage));
                    ajaxResult.msg = string.Format("获取商品属性发生错误 详细信息:{0}", commodityPropertyResult.Message);
                    return;
                }
                else if (commodityPropertyResult.Value == null)
                {
                    WCFClient.LoggerService.Info(string.Format("此商品属性不存在 ID:{0}", commodityPropertyId));
                    ajaxResult.msg = string.Format("此商品属性不存在");
                    return;
                }
            }

            if (string.IsNullOrWhiteSpace(Request["chineseName"]))
            {
                ajaxResult.msg = string.Format("属性名称（中文）必填");
                return;
            }

            if (string.IsNullOrWhiteSpace(Request["propertyCategoryUUID"]))
            {
                ajaxResult.msg = string.Format("属性类别必选");
                return;
            }

            int sort = 0;
            if (!string.IsNullOrWhiteSpace(Request["sort"]))
            {
                try
                {
                    sort = int.Parse(Request["sort"]);
                }
                catch
                {
                    ajaxResult.msg = string.Format("排序权重格式不正确，必须是数字");
                    return;
                }
            }

            decimal? addPrice = null;
            if (!string.IsNullOrWhiteSpace(Request["addPrice"]))
            {
                try
                {
                    addPrice = decimal.Parse(Request["addPrice"]);
                }
                catch
                {
                    ajaxResult.msg = string.Format("价格比格式不正确，必须是数字");
                    return;
                }
            }

            AddOrUpdateCommodityPropertyDTO addOrUpdateCommodityPropertyDTO = new AddOrUpdateCommodityPropertyDTO()
            {
                ChineseName = Request["chineseName"],
                EnglishName = Request["englishName"],
                IsDelete = false,
                ResId = resId,
                Sort = sort,
                AddPrice = addPrice,
                CommodityUUID = commodityResult.Value.commodityUUID,
                PropertyCategoryUUID = Request["propertyCategoryUUID"],
                Id = commodityPropertyId
            };
            XMS.Core.ReturnValue<int> result = WCFClient.CoffeeService.AddOrUpdateCommodityProperty(addOrUpdateCommodityPropertyDTO, Manager.Name);
            if (result.Code == 200)
            {
                ajaxResult.succ = true;
                ajaxResult.msg = "操作成功";
                ajaxResult.url = Business.CoffeePage.VirtulName + "/CommodityPropertyManager.aspx?resId=" + resId + "&commodityId=" + commodityId;
                return;
            }
            else
            {
                WCFClient.LoggerService.Error(result.RawMessage);
                ajaxResult.succ = false;
                ajaxResult.msg = result.Message;
                return;
            }
        }
        catch (Exception ex)
        {
            WCFClient.LoggerService.Error(ex.Message);
            ajaxResult.succ = false;
            ajaxResult.msg = "请输入正确的数据格式";
            return;
        }
    }

    private void Delete()
    {
        string scommodityPropertyId = Request["commodityPropertyId"].DoTrim();
        if (string.IsNullOrWhiteSpace(scommodityPropertyId))
        {
            ajaxResult.msg = "属性类别编号无效";
            return;
        }
        int commodityPropertyId = int.Parse(scommodityPropertyId);

        string sresId = Request["resId"].DoTrim();
        if (string.IsNullOrWhiteSpace(sresId))
        {
            ajaxResult.msg = "商店编号无效";
            return;
        }
        int resId = int.Parse(sresId);

        XMS.Core.ReturnValue<CRestaurantDTO> restResult = WCFClient.CoffeeService.GetRestaurantById(resId);
        if (restResult.Code != 200)
        {
            ajaxResult.msg = string.Format("获取商店发生错误 详细信息:{0}", restResult.Message);
            WCFClient.LoggerService.Error(string.Format("获取商店发生错误 详细信息:{0}", restResult.RawMessage));
            return;
        }
        else if (restResult.Value == null)
        {
            ajaxResult.msg = string.Format("此商店不存在 ID:{0}", resId);
            WCFClient.LoggerService.Error(string.Format("此餐厅不存在 ID:{0}", resId));
            return;
        }

        XMS.Core.ReturnValue<bool> commodityPropertyResult = WCFClient.CoffeeService.DeleteCommodityProperty(commodityPropertyId, Manager.Name);
        if (commodityPropertyResult.Code != 200)
        {
            ajaxResult.msg = restResult.Message;
            WCFClient.LoggerService.Error(string.Format("删除此商品属性失败 详细信息:{0}", restResult.RawMessage));
            return;
        }
        if (commodityPropertyResult.Value == false)
        {
            ajaxResult.msg = "删除此商品属性失败";
            WCFClient.LoggerService.Error(string.Format("删除此商品属性失败 ID:{0}", commodityPropertyId));
            return;
        }

        ajaxResult.succ = true;
        ajaxResult.refresh = true;
        ajaxResult.msg = "删除此商品属性成功";
    }
}