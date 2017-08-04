using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;

public partial class Ajax_CommodityDetailAjax : ManagerBasePage
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
            case "enablestate":
                EnableState();
                break;
            case "enablepreferential":
                EnablePreferential();
                break;
            default:
                break;
        }
        Response.Write(XMS.Core.Json.JsonSerializer.Serialize(ajaxResult));
        Response.End();
    }

    private void EnablePreferential()
    {
        string sCommodityId = Request["commodityId"].DoTrim();
        if (string.IsNullOrWhiteSpace(sCommodityId))
        {
            ajaxResult.msg = "商品编号无效";
            return;
        }
        int commodityId = int.Parse(sCommodityId);
        XMS.Core.ReturnValue<CCommodityDTO> result = WCFClient.CoffeeService.GetCommodityById(commodityId);
        if (result.Code != 200)
        {
            ajaxResult.msg = result.RawMessage;
            return;
        }
        if (result.Value == null)
        {
            ajaxResult.msg = "此属性类别不存在";
            return;
        }
        bool preferentialFlag = result.Value.preferentialFlag == true ? false : true;

        AddOrUpdateCommodityDTO addOrUpdateCommodity = new AddOrUpdateCommodityDTO()
        {
            ChineseName = result.Value.chineseName,
            EnglishName = result.Value.englishName,
            PreferentialFlag = preferentialFlag,
            CommodityCategoryUUID = result.Value.commodityCategoryUUID,
            Id = result.Value.id,
            IsDelete = result.Value.isDelete,
            ResId = int.Parse(Request["resId"]),
            Sort = result.Value.sort.HasValue ? result.Value.sort.Value : 0,
            Type = result.Value.type,
            PicPath = result.Value.picPath,
            PreferentialProportion = result.Value.preferentialProportion.HasValue ? result.Value.preferentialProportion.Value : 0,
             Price = result.Value.price.HasValue ? result.Value.price.Value : 0,
            Remark = result.Value.remark,
            ShowRemark = result.Value.showRemark,
            State = result.Value.state,
            PreferentialQuantity = result.Value.preferentialQuantity
        };
        XMS.Core.ReturnValue<int> commodityResult = WCFClient.CoffeeService.AddOrUpdateCommodity(addOrUpdateCommodity, Manager.Name);
        if (commodityResult.Code == 200)
        {
            ajaxResult.succ = true;
            ajaxResult.msg = "操作成功";
            ajaxResult.url = Business.CoffeePage.VirtulName + "/CommodityManager.aspx?resId=" + int.Parse(Request["resId"]);
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

    private void EnableState()
    {
        string sCommodityId = Request["commodityId"].DoTrim();
        if (string.IsNullOrWhiteSpace(sCommodityId))
        {
            ajaxResult.msg = "商品编号无效";
            return;
        }
        int commodityId = int.Parse(sCommodityId);
        XMS.Core.ReturnValue<CCommodityDTO> result = WCFClient.CoffeeService.GetCommodityById(commodityId);
        if (result.Code != 200)
        {
            ajaxResult.msg = result.RawMessage;
            return;
        }
        if (result.Value == null)
        {
            ajaxResult.msg = "此属性类别不存在";
            return;
        }
        int state = result.Value.state == 1 ? 2 : 1;
        AddOrUpdateCommodityDTO addOrUpdateCommodity = new AddOrUpdateCommodityDTO()
        {
            ChineseName = result.Value.chineseName,
            EnglishName = result.Value.englishName,
            PreferentialFlag = result.Value.preferentialFlag,
            CommodityCategoryUUID = result.Value.commodityCategoryUUID,
            Id = result.Value.id,
            IsDelete = result.Value.isDelete,
            ResId = int.Parse(Request["resId"]),
            Sort = result.Value.sort.HasValue ? result.Value.sort.Value : 0,
            Type = result.Value.type,
            PicPath = result.Value.picPath,
            PreferentialProportion = result.Value.preferentialProportion.HasValue ? result.Value.preferentialProportion.Value : 0,
            Price = result.Value.price.HasValue ? result.Value.price.Value : 0,
            Remark = result.Value.remark,
            ShowRemark = result.Value.showRemark,
            State = state,
            PreferentialQuantity = result.Value.preferentialQuantity
        };
        XMS.Core.ReturnValue<int> commodityResult = WCFClient.CoffeeService.AddOrUpdateCommodity(addOrUpdateCommodity, Manager.Name);
        if (commodityResult.Code == 200)
        {
            ajaxResult.succ = true;
            ajaxResult.msg = "操作成功";
            ajaxResult.url = Business.CoffeePage.VirtulName + "/CommodityManager.aspx?resId=" + int.Parse(Request["resId"]);
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
            if (commodityId > 0)
            {
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
            }

            if (string.IsNullOrWhiteSpace(Request["chineseName"]))
            {
                ajaxResult.msg = string.Format("商品名称（中文）必填");
                return;
            }

            if (string.IsNullOrWhiteSpace(Request["commodityCategoryUUID"]))
            {
                ajaxResult.msg = string.Format("商品类别必须");
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

            decimal? preferentialProportion = null;
            if (!string.IsNullOrWhiteSpace(Request["preferentialProportion"]))
            {
                try
                {
                    preferentialProportion = decimal.Parse(Request["preferentialProportion"]);
                }
                catch 
                {
                    ajaxResult.msg = string.Format("优惠百分比格式不正确，必须是数字");
                    return;
                }
            }

            decimal price = 0;
            if (!string.IsNullOrWhiteSpace(Request["price"]))
            {
                try
                {
                    price = decimal.Parse(Request["price"]);
                }
                catch
                {
                    ajaxResult.msg = string.Format("价格格式不正确，必须是数字");
                    return;
                }
            }

            int? preferentialQuantity = 0;
            if (!string.IsNullOrWhiteSpace(Request["preferentialQuantity"]))
            {
                try
                {
                    preferentialQuantity = int.Parse(Request["preferentialQuantity"]);
                }
                catch
                {
                    ajaxResult.msg = string.Format("优惠数量格式不正确，必须是数字");
                    return;
                }
            }

            AddOrUpdateCommodityDTO addOrUpdateCommodity = new AddOrUpdateCommodityDTO()
            {
                ChineseName = Request["chineseName"],
                EnglishName =  Request["englishName"],
                PreferentialFlag = Request["preferentialFlag"] == null ? false : true,
                CommodityCategoryUUID = Request["commodityCategoryUUID"],
                Id = commodityId,
                IsDelete = false,
                ResId = resId,
                Sort = sort,
                Type = 0,
                PicPath = Request["PicUrl"],
                PreferentialProportion = preferentialProportion,
                Price = price,
                Remark = Request["remark"],
                ShowRemark = string.Empty ,
                State = Request["state"] == null ? 2 : 1,
                PreferentialQuantity = preferentialQuantity
            };
            XMS.Core.ReturnValue<int> result = WCFClient.CoffeeService.AddOrUpdateCommodity(addOrUpdateCommodity, Manager.Name);
            if (result.Code == 200)
            {
                ajaxResult.succ = true;
                ajaxResult.msg = "操作成功";
                ajaxResult.url = Business.CoffeePage.VirtulName + "/CommodityManager.aspx?resId=" + resId;
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
        string scommodityId = Request["commodityId"].DoTrim();
        if (string.IsNullOrWhiteSpace(scommodityId))
        {
            ajaxResult.msg = "属性类别编号无效";
            return;
        }
        int commodityId = int.Parse(scommodityId);

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

        XMS.Core.ReturnValue<bool> commodityResult = WCFClient.CoffeeService.DeleteCommodity(commodityId, Manager.Name);
        if (commodityResult.Code != 200)
        {
            ajaxResult.msg = restResult.Message;
            WCFClient.LoggerService.Error(string.Format("删除此商品失败 详细信息:{0}", restResult.RawMessage));
            return;
        }
        if (commodityResult.Value == false)
        {
            ajaxResult.msg = "删除此属性类别失败";
            WCFClient.LoggerService.Error(string.Format("删除此商品失败 ID:{0}", commodityId));
            return;
        }

        ajaxResult.succ = true;
        ajaxResult.refresh = true;
        //ajaxResult.url = Business.CoffeePage.VirtulName + "/ShopManage.aspx";
        ajaxResult.msg = "删除此商品成功";
    }
}