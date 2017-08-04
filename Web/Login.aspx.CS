using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Security;
using XMS.Core.Web;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;

public partial class Login : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string act = Request["act"].DoTrim();
        if (string.IsNullOrEmpty(act))
        {
            act = "login";
        }
        switch (act.ToLower())
        {
            case "relogin":
                DoReLogin();
                break;
            default:
                DoLogin();
                break;
        }
    }

    protected void DoReLogin()
    {
         HttpCookie cookie = HttpContext.Current.Request.Cookies[Constants.CoffeeManagerCookieName];
         if (cookie != null)
         {
             cookie.Expires = DateTime.Now.Date.AddDays(-1);
             Response.Cookies.Add(cookie);
         }
    }

    protected void DoLogin()
    {
        HttpCookie cookie = HttpContext.Current.Request.Cookies[Constants.CoffeeManagerCookieName];
        if (cookie != null && !string.IsNullOrEmpty(cookie.Value))
        {
            string[] arrStr = cookie.Value.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            if (arrStr.Length == 2)
            {
                int nUserId = 0;
                try
                {
                    XMS.Core.ReturnValue<QueryResultCManagerPO> managerResult = WCFClient.CoffeeService.GetManagers(null, arrStr[0], arrStr[1], null, 1, 1);
                    if (managerResult.Code != 200)
                    {
                        XMS.Core.Container.LogService.Error(string.Format("获取管理员错误 详细信息:{0}", managerResult.RawMessage));
                        nUserId = -2;
                    }
                    else if (managerResult.Value != null && managerResult.Value.Items != null && managerResult.Value.Items.Length > 0)
                    {
                        nUserId = managerResult.Value.Items[0].Id;
                    }
                }
                catch
                {
                }
                if (nUserId > 0)
                {
                    FormsAuthentication.SetAuthCookie(nUserId.ToString(), true);
                    Response.Redirect(Business.CoffeePage.VirtulName + "/ShopManage.aspx");
                }
            }
        }
    }
}