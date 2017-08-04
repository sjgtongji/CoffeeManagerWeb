using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Core.Web;
using System.Web.Security;
using XMS.Inner.Coffee.Service.Model;

public partial class Ajax_LoginAjax : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        //string sAction = Request["act"].Trim();
        //switch (sAction)
        //{
        //    case "login":
        //        DoLogin();
        //        break;
        //}
        DoLogin();
    }

    private void DoLogin()
    {
        string sUserName = Request["uName"].Trim();
        string sPassword = Request["uPassword"];
        string sRemember = Request["rememberToken"];

        int nUserId = -1;
        try
        {
            XMS.Core.ReturnValue<QueryResultCManagerPO> managerResult = WCFClient.CoffeeService.GetManagers(null, sUserName, sPassword, null, 1, 1);
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
        catch(Exception ex)
        {
            WCFClient.LoggerService.Info(ex.Message);
        }

        if (nUserId > 0)
        {
            FormsAuthentication.SetAuthCookie(nUserId.ToString(), true);
            //string cookValue = sUserName + "," + sPassword;
            //if (sRemember == "1")
            //{
            //    HttpContext.Current.AddCookie(Constants.CoffeeManagerCookieName, cookValue, DateTime.Now.AddDays(7), Request.Url.Host);
            //}
            //else
            //{
            //    HttpContext.Current.AddCookie(Constants.CoffeeManagerCookieName, cookValue, null, Request.Url.Host);
            //}

            string cookValue = sUserName + "," + sPassword;
            HttpCookie cookie = new HttpCookie(Constants.CoffeeManagerCookieName);
            cookie.Value = cookValue;
            if (sRemember == "1")
            {
                cookie.Expires = DateTime.Now.AddDays(7);
            }
            else
            {
                cookie.Expires = DateTime.Now.AddHours(1);
            }
            HttpContext.Current.Response.Cookies.Add(cookie);
            FGForm.Success("登录成功");
        }
        else
        {
            switch (nUserId)
            {
                case -1:
                    FGForm.Alert("错误，登陆名不存在或密码错误！");
                    break;
                default:
                    FGForm.Alert("意外错误请联系网管！");
                    break;
            }
        }
    }
}