using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using XMS.Core;
using System.Web;
using XMS.Core.Web;
using XMS.Inner.Coffee.Service.Model;

namespace Business
{
    public class ManagerBasePage : System.Web.UI.Page
    {
        protected CManagerPO Manager = null; 

        protected override void OnPreInit(EventArgs e)
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
                            Response.Redirect("/CoffeeManagerWeb/Login.aspx");
                        }
                        else if (managerResult.Value != null && managerResult.Value.Items != null && managerResult.Value.Items.Length > 0)
                        {
                            nUserId = managerResult.Value.Items[0].Id;
                            Manager = managerResult.Value.Items[0];

                            cookie.Expires = DateTime.Now.AddHours(1);
                            HttpContext.Current.Response.Cookies.Add(cookie);
                        }
                        else
                        {
                            Response.Redirect("/CoffeeManagerWeb/Login.aspx");
                        }
                    }
                    catch
                    {
                        Response.Redirect("/CoffeeManagerWeb/Login.aspx");
                    }
                }
            }
            else
            {
                Response.Redirect("/CoffeeManagerWeb/Login.aspx");
            }
        }
    }
}
