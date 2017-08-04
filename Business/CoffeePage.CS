using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using XMS.Core;

namespace Business
{
    public class CoffeePage : System.Web.UI.Page
    {
        public static string VirtulName
        {
            get
            {
                return GetVirulName();
            }
            set { }
        }

        public static string GetVirulName()
        {
            return AppSettingHelper.VirtulName;
        }

        protected override void OnPreInit(EventArgs e)
        {
            base.OnPreInit(e);
            //string userToken = BasePage.LoginTokenOfCookie;

            //CheckLogin();
        }

        //public string LoginTokenOfCookie
        //{
        //    get
        //    {
        //        try
        //        {
        //            HttpCookie objCookie = XMS.Core.Web.HttpContextHelper.GetCookie(HttpContext.Current, Constants.FreeBookInnerManagerCookieName);
        //            if (objCookie != null && !string.IsNullOrEmpty(objCookie.Value))
        //            {
        //                return objCookie.Value;
        //            }
        //            return null;
        //        }
        //        catch
        //        {
        //            return null;
        //        }
        //    }
        //}

        //private TicketInfo GetLoginTicket()
        //{
        //    if (!string.IsNullOrEmpty(LoginTokenOfCookie))
        //    {
        //        ReturnValue<TicketInfo> objResu = WCFClient.FreeBookManagerService.LoginWithToken(LoginTokenOfCookie);
        //        if (objResu.Code == 200 && objResu.Value != null)
        //        {
        //            return objResu.Value;
        //        }
        //        else
        //        {
        //            WCFClient.LoggerService.Error("获取餐厅失败：" + objResu == null ? "服务未返回有效的响应" : objResu.Message + "；出错TOKEN为:" + LoginTokenOfCookie);
        //        }
        //    }
        //    return null;
        //}

        //public TicketInfo CurrentTicket
        //{
        //    get
        //    {
        //        return objCurrentTicket;
        //    }

        //}

        //private TicketInfo _objCurrentTicket = null;
        //private TicketInfo objCurrentTicket
        //{
        //    get
        //    {
        //        if (_objCurrentTicket == null)
        //        {
        //            _objCurrentTicket = GetLoginTicket();
        //        }
        //        return _objCurrentTicket;
        //    }
        //}

        //protected void CheckLogin()
        //{
        //    if (CurrentTicket == null || CurrentTicket.ExpireTime <= DateTime.Now.ToMilliSecondsFrom1970L())
        //    {
        //        Response.Redirect("/login?lgohref=" + HttpUtility.UrlEncode(Request.Url.PathAndQuery.ToLower()), true);
        //    }
        //}
    }
}
