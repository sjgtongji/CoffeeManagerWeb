using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using Fg114User;
using XMS.Inner.Coffee.Service.Model;
using XMS.Core;

public partial class MasterPage : System.Web.UI.MasterPage
{
    // Fields
    protected CManagerPO Manager;

    // Methods
    protected void Page_Load(object sender, EventArgs e)
    {
        HttpCookie cookie = HttpContext.Current.Request.Cookies["CoffeeManagerCookieName"];
        if ((cookie != null) && !string.IsNullOrEmpty(cookie.Value))
        {
            string[] strArray = cookie.Value.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            if (strArray.Length == 2)
            {
                try
                {
                    ReturnValue<QueryResultCManagerPO> value2 = WCFClient.CoffeeService.GetManagers(null, strArray[0], strArray[1], null, 1, 1);
                    if (value2.Code != 200)
                    {
                        Container.LogService.Error(string.Format("获取管理员错误 详细信息:{0}", value2.RawMessage));
                    }
                    else if (((value2.Value != null) && (value2.Value.Items != null)) && (value2.Value.Items.Length > 0))
                    {
                        int id = value2.Value.Items[0].Id;
                        this.Manager = value2.Value.Items[0];
                    }
                }
                catch
                {
                }
            }
        }
    }
}
