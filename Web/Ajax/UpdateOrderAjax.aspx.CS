using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;

public partial class Ajax_UpdateOrderAjax : ManagerBasePage
{
    // Fields
    protected string act = string.Empty;
    private AjaxResult ajaxResult = new AjaxResult();
    private int orderId;

    // Methods
    protected void Page_Load(object sender, EventArgs e)
    {
        string str;
        this.act = base.Request["act"].DoTrim(new char[0]).ToLower();
        this.orderId = int.Parse(base.Request["orderId"]);
        if (((str = this.act.ToLower()) != null) && (str == "save"))
        {
            this.Save();
        }
        if (string.IsNullOrEmpty(this.ajaxResult.msg))
        {
            if (this.ajaxResult.succ)
            {
                this.ajaxResult.msg = "操作成功";
            }
            else
            {
                this.ajaxResult.msg = "操作失败";
            }
        }
        if (this.ajaxResult.succ)
        {
            this.ajaxResult.refresh = true;
        }
        base.Response.Write(this.ajaxResult.ToJson());
        base.Response.End();
    }

    private void Save()
    {
        string managerRemark = base.Request["managerRemark"];
        int orderState = int.Parse(base.Request["orderState"]);
        ReturnValue<bool> value2 = WCFClient.CoffeeService.UpdateOrderInfo(this.orderId, orderState, managerRemark, base.Manager.Name);
        if (value2.Code != 200)
        {
            this.ajaxResult.msg = value2.RawMessage;
        }
        else if (!value2.Value)
        {
            this.ajaxResult.msg = "修改订单失败";
        }
        else
        {
            this.ajaxResult.succ = true;
            this.ajaxResult.refresh = true;
            this.ajaxResult.msg = "修改订单成功";
        }
    }
}


 
