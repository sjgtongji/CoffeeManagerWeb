using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;
using XMS.Core.Json;

public partial class Ajax_CommodityCategoryDetailAjax : ManagerBasePage
{
    // Fields
    protected string act = string.Empty;
    private AjaxResult ajaxResult = new AjaxResult();

    // Methods
    private void Delete()
    {
        string str = base.Request["commodityCategoryId"].DoTrim(new char[0]);
        if (string.IsNullOrWhiteSpace(str))
        {
            this.ajaxResult.msg = "商品类别编号无效";
        }
        else
        {
            int id = int.Parse(str);
            string str2 = base.Request["resId"].DoTrim(new char[0]);
            if (string.IsNullOrWhiteSpace(str2))
            {
                this.ajaxResult.msg = "商店编号无效";
            }
            else
            {
                int resId = int.Parse(str2);
                ReturnValue<CRestaurantDTO> restaurantById = WCFClient.CoffeeService.GetRestaurantById(resId);
                if (restaurantById.Code != 200)
                {
                    this.ajaxResult.msg = string.Format("获取商店发生错误 详细信息:{0}", restaurantById.Message);
                    WCFClient.LoggerService.Error(string.Format("获取商店发生错误 详细信息:{0}", restaurantById.RawMessage));
                }
                else if (restaurantById.Value == null)
                {
                    this.ajaxResult.msg = string.Format("此商店不存在 ID:{0}", resId);
                    WCFClient.LoggerService.Error(string.Format("此餐厅不存在 ID:{0}", resId));
                }
                else
                {
                    ReturnValue<bool> value3 = WCFClient.CoffeeService.DeleteCommodityCategory(id, base.Manager.Name);
                    if (value3.Code != 200)
                    {
                        this.ajaxResult.msg = restaurantById.Message;
                        WCFClient.LoggerService.Error(string.Format("删除此商品类别失败 详细信息:{0}", restaurantById.RawMessage));
                    }
                    else if (!value3.Value)
                    {
                        this.ajaxResult.msg = "删除此商品类别失败";
                        WCFClient.LoggerService.Error(string.Format("删除此商品类别失败 ID:{0}", id));
                    }
                    else
                    {
                        this.ajaxResult.succ = true;
                        this.ajaxResult.refresh = true;
                        this.ajaxResult.msg = "删除此商品类别成功";
                    }
                }
            }
        }
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        this.act = base.Request["act"].DoTrim(new char[0]).ToLower();
        string str = this.act.ToLower();
        if (str != null)
        {
            if (!(str == "delete"))
            {
                if (str == "save")
                {
                    this.Save();
                }
            }
            else
            {
                this.Delete();
            }
        }
        base.Response.Write(JsonSerializer.Serialize(this.ajaxResult));
        base.Response.End();
    }

    private void Save()
    {
        try
        {
            string str = base.Request["resId"].DoTrim(new char[0]);
            if (string.IsNullOrWhiteSpace(str))
            {
                this.ajaxResult.msg = "商店编号无效";
            }
            else
            {
                int resId = int.Parse(str);
                ReturnValue<CRestaurantDTO> restaurantById = WCFClient.CoffeeService.GetRestaurantById(resId);
                if (restaurantById.Code != 200)
                {
                    this.ajaxResult.msg = string.Format("获取商店发生错误 详细信息:{0}", restaurantById.Message);
                    WCFClient.LoggerService.Error(string.Format("获取商店发生错误 详细信息:{0}", restaurantById.RawMessage));
                }
                else if (restaurantById.Value == null)
                {
                    this.ajaxResult.msg = string.Format("此商店不存在 ID:{0}", resId);
                    WCFClient.LoggerService.Error(string.Format("此商店不存在 ID:{0}", resId));
                }
                else
                {
                    int id = int.Parse(base.Request["commodityCategoryId"]);
                    if (id > 0)
                    {
                        ReturnValue<CCommodityCategoryDTO> commodityCategoryById = WCFClient.CoffeeService.GetCommodityCategoryById(id);
                        if (commodityCategoryById.Code != 200)
                        {
                            WCFClient.LoggerService.Info(string.Format("获取商品类别发生错误 详细信息:{0}", restaurantById.RawMessage));
                            this.ajaxResult.msg = string.Format("获取商品类别发生错误 详细信息:{0}", restaurantById.Message);
                            return;
                        }
                        if (commodityCategoryById.Value == null)
                        {
                            WCFClient.LoggerService.Info(string.Format("此商品类别不存在 ID:{0}", id));
                            this.ajaxResult.msg = string.Format("此商品类别不存在", new object[0]);
                            return;
                        }
                    }
                    int num3 = 0;
                    if (!string.IsNullOrWhiteSpace(base.Request["sort"]))
                    {
                        try
                        {
                            num3 = int.Parse(base.Request["sort"]);
                        }
                        catch (Exception)
                        {
                            this.ajaxResult.msg = string.Format("排序权重格式不正确，必须是数字", new object[0]);
                            return;
                        }
                    }
                    AddOrUpdateCommodityCategoryDTO ydto2 = new AddOrUpdateCommodityCategoryDTO {
                        chineseName = base.Request["chineseName"],
                        englishName = base.Request["englishName"],
                        id = int.Parse(base.Request["commodityCategoryId"]),
                        isDelete = false,
                        remark = base.Request["remark"],
                        resId = restaurantById.Value.id,
                        sort = new int?(num3)
                    };
                    AddOrUpdateCommodityCategoryDTO commodityCategory = ydto2;
                    ReturnValue<int> value4 = WCFClient.CoffeeService.AddOrUpdateCommodityCategory(commodityCategory, base.Manager.Name);
                    if (value4.Code == 200)
                    {
                        this.ajaxResult.succ = true;
                        this.ajaxResult.msg = "操作成功";
                        this.ajaxResult.url = CoffeePage.VirtulName + "/CommodityCategoryManager.aspx?resId=" + resId;
                    }
                    else
                    {
                        WCFClient.LoggerService.Error(value4.RawMessage);
                        this.ajaxResult.succ = false;
                        this.ajaxResult.msg = value4.Message;
                    }
                }
            }
        }
        catch (Exception exception)
        {
            WCFClient.LoggerService.Error(exception.Message);
            this.ajaxResult.succ = false;
            this.ajaxResult.msg = "请输入正确的数据格式";
        }
    }
}
 
