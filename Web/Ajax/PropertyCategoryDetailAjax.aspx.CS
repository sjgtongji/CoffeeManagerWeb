using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;

public partial class Ajax_PropertyCategoryDetailAjax : ManagerBasePage
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
            case "enablemultiple":
                EnableMultiple();
                break;
            default:
                break;
        }
        Response.Write(XMS.Core.Json.JsonSerializer.Serialize(ajaxResult));
        Response.End();
    }

    private void EnableMultiple()
    {
        string sPropertyCategoryId = Request["propertyCategoryId"].DoTrim();
        if (string.IsNullOrWhiteSpace(sPropertyCategoryId))
        {
            ajaxResult.msg = "属性类别编号无效";
            return;
        }
        int propertyCategoryId = int.Parse(sPropertyCategoryId);
        XMS.Core.ReturnValue<CPropertyCategoryDTO> result = WCFClient.CoffeeService.GetPropertyCategoryById(propertyCategoryId);
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
        bool state = result.Value.enableMultiple == true ? false : true;

        AddOrUpdatetPropertyCategoryDTO addOrUpdatePropertyCategory = new AddOrUpdatetPropertyCategoryDTO()
        {
            ChineseName = result.Value.chineseName,
            EnglishName = result.Value.englishName,
            EnableMultiple = state,
            Id = result.Value.id,
            IsDelete = result.Value.isDelete,
            ResId = int.Parse(Request["resId"]),
            Sort = result.Value.sort,
            Type = result.Value.type
        };
        XMS.Core.ReturnValue<int> propertyCategoryResult = WCFClient.CoffeeService.AddOrUpdatetPropertyCategory(addOrUpdatePropertyCategory, Manager.Name);
        if (propertyCategoryResult.Code == 200)
        {
            ajaxResult.succ = true;
            ajaxResult.msg = "操作成功";
            ajaxResult.url = Business.CoffeePage.VirtulName + "/PropertyCategoryManager.aspx?resId=" + int.Parse(Request["resId"]);
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
            int propertyCategoryId = int.Parse(Request["propertyCategoryId"]);
            if (propertyCategoryId > 0)
            {
                XMS.Core.ReturnValue<CPropertyCategoryDTO> propertyCategoryResult = WCFClient.CoffeeService.GetPropertyCategoryById(propertyCategoryId);
                if (propertyCategoryResult.Code != 200)
                {
                    WCFClient.LoggerService.Info(string.Format("获取商品类别发生错误 详细信息:{0}", restResult.RawMessage));
                    ajaxResult.msg = string.Format("获取商品类别发生错误 详细信息:{0}", restResult.Message);
                    return;
                }
                else if (propertyCategoryResult.Value == null)
                {
                    WCFClient.LoggerService.Info(string.Format("此商品类别不存在 ID:{0}", propertyCategoryId));
                    ajaxResult.msg = string.Format("此商品类别不存在");
                    return;
                }
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

            AddOrUpdatetPropertyCategoryDTO addOrUpdatePropertyCategory = new AddOrUpdatetPropertyCategoryDTO()
            {
                ChineseName = Request["chineseName"],
                EnglishName = Request["englishName"],
                EnableMultiple = Request["enableMultiple"] == null ? false : true,
                Id = propertyCategoryId,
                IsDelete = false,
                ResId = restResult.Value.id,
                Sort = sort,
                Type = 1
            };
            XMS.Core.ReturnValue<int> result = WCFClient.CoffeeService.AddOrUpdatetPropertyCategory(addOrUpdatePropertyCategory, Manager.Name);
            if (result.Code == 200)
            {
                ajaxResult.succ = true;
                ajaxResult.msg = "操作成功";
                ajaxResult.url = Business.CoffeePage.VirtulName + "/PropertyCategoryManager.aspx?resId=" + resId;
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
        string spropertyCategoryId = Request["propertyCategoryId"].DoTrim();
        if (string.IsNullOrWhiteSpace(spropertyCategoryId))
        {
            ajaxResult.msg = "属性类别编号无效";
            return;
        }
        int propertyCategoryId = int.Parse(spropertyCategoryId);

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

        XMS.Core.ReturnValue<bool> propertyCategoryResult = WCFClient.CoffeeService.DeletePropertyCategory(propertyCategoryId, Manager.Name);
        if (propertyCategoryResult.Code != 200)
        {
            ajaxResult.msg = restResult.Message;
            WCFClient.LoggerService.Error(string.Format("删除此属性类别失败 详细信息:{0}", restResult.RawMessage));
            return;
        }
        if (propertyCategoryResult.Value == false)
        {
            ajaxResult.msg = "删除此属性类别失败";
            WCFClient.LoggerService.Error(string.Format("删除此属性类别失败 ID:{0}", propertyCategoryId));
            return;
        }

        ajaxResult.succ = true;
        ajaxResult.refresh = true;
        //ajaxResult.url = Business.CoffeePage.VirtulName + "/ShopManage.aspx";
        ajaxResult.msg = "删除此属性类别成功";
    }
}