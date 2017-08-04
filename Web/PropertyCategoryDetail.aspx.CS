using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Inner.Coffee.Service.Model;

public partial class PropertyCategoryDetail : ManagerBasePage
{
    protected string ShowName { get; set; }
    protected int propertyCategoryId { get; set; }
    protected CPropertyCategoryDTO propertyCategory = null;
    protected int resId = 0;
    protected bool ErrFlag = false;
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!string.IsNullOrWhiteSpace(Request["propertyCategoryId"]))
            propertyCategoryId = int.Parse(Request["propertyCategoryId"]);
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
        if (propertyCategoryId > 0)
        {
            ShowName = "修改属性类别";
            XMS.Core.ReturnValue<CPropertyCategoryDTO> restResult = WCFClient.CoffeeService.GetPropertyCategoryById(propertyCategoryId);
            if (restResult.Code != 200)
            {
                WCFClient.LoggerService.Info(string.Format("获取属性类别发生错误 详细信息:{0}", restResult.RawMessage));
                ErrFlag = true;
            }
            else if (restResult.Value == null)
            {
                WCFClient.LoggerService.Info(string.Format("此属性类别不存在 ID:{0}", propertyCategoryId));
                ErrFlag = true;
            }
            else if (restResult.Value != null)
            {
                propertyCategory = restResult.Value;
            }
        }
        else
            ShowName = "新增属性类别";
    }
}