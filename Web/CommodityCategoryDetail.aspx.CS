using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using XMS.Inner.Coffee.Service.Model;
using Business;

public partial class CommodityCategoryDetail : ManagerBasePage
{
    protected string ShowName { get; set; }
    protected int CommodityCategoryId { get; set; }
    protected CCommodityCategoryDTO commodityCategory = null;
    protected int resId = 0;
    protected bool ErrFlag = false;
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!string.IsNullOrWhiteSpace(Request["commodityCategoryId"]))
            CommodityCategoryId = int.Parse(Request["commodityCategoryId"]);
        resId = int.Parse(Request["resId"]);
        if (resId <= 0)
        {
            ShowName = "餐厅ID不正确";
            ErrFlag = true;
        }

        initInfo();
    }

    private void initInfo()
    {
        if (CommodityCategoryId > 0)
        {
            ShowName = "修改商品类别";
            XMS.Core.ReturnValue<CCommodityCategoryDTO> restResult = WCFClient.CoffeeService.GetCommodityCategoryById(CommodityCategoryId);
            if (restResult.Code != 200)
            {
                WCFClient.LoggerService.Info(string.Format("获取商品类别发生错误 详细信息:{0}", restResult.RawMessage));
                ErrFlag = true;
            }
            else if (restResult.Value == null)
            {
                WCFClient.LoggerService.Info(string.Format("此商品类别不存在 ID:{0}", CommodityCategoryId));
                ErrFlag = true;
            }
            else if (restResult.Value != null)
            {
                commodityCategory = restResult.Value;
            }
        }
        else
            ShowName = "新增商品类别";
    }
}