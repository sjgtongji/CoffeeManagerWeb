using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace Business
{
    public class FGForm
    {
        #region 提交返回信息
        /// <summary>
        /// 提交返回信息
        /// </summary>
        /// <param name="msg"></param>
        public static void Alert(string sMessage)
        {
            var obj = new { msg = sMessage };
            string json = XMS.Core.Json.JsonSerializer.Serialize(obj);
            HttpContext.Current.Response.Write(json);
            HttpContext.Current.Response.End();
        }
        public static void Alert(string sMessage, string sUrl)
        {
            var obj = new { succ = true, msg = sMessage, url = sUrl };
            string json = XMS.Core.Json.JsonSerializer.Serialize(obj);
            HttpContext.Current.Response.Write(json);
            HttpContext.Current.Response.End();
        }
        #endregion

        #region 提交返回成功
        /// <summary>
        /// 提交返回成功
        /// </summary>
        /// <param name="msg"></param>
        public static void Success(string sMessage)
        {
            var obj = new { succ = true, msg = sMessage };
            string json = XMS.Core.Json.JsonSerializer.Serialize(obj);
            HttpContext.Current.Response.Write(json);
            HttpContext.Current.Response.End();
        }

        #endregion

        #region 提交返回信息,跳转到指定页
        /// <summary>
        /// 提交返回信息,跳转到指定页
        /// </summary>
        /// <param name="msg"></param>
        public static void SendGoto(string sMessage, string sURL)
        {
            var obj = new { url = sURL, msg = sMessage };
            string json = XMS.Core.Json.JsonSerializer.Serialize(obj);
            HttpContext.Current.Response.Write(json);
            HttpContext.Current.Response.End();
        }
        #endregion

        #region 提交返回信息,刷新本页
        /// <summary>
        /// 提交返回信息,刷新本页
        /// </summary>
        /// <param name="msg"></param>
        public static void Reload(string sMessage)
        {
            Reload(sMessage, false);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="sMessage"></param>
        /// <param name="bWait">是否等待点击确认按钮</param>
        public static void Reload(string sMessage, bool bWait)
        {
            var obj = new { refresh = true, msg = sMessage, sync = (bWait ? true : false) };
            string json = XMS.Core.Json.JsonSerializer.Serialize(obj);
            HttpContext.Current.Response.Write(json);
            HttpContext.Current.Response.End();
        }

        #endregion

        #region 提交后,用户自定义js方法
        /// <summary>
        /// 提交后,用户自定义js方法
        /// </summary>
        /// <param name="sMethond"></param>
        public static void Eval(string sMethond)
        {
            var obj = new { callback = sMethond };
            string json = XMS.Core.Json.JsonSerializer.Serialize(obj);
            HttpContext.Current.Response.Write(json);
            HttpContext.Current.Response.End();
        }
        #endregion

        public static void PageAlert(string sMsg)
        {
            HttpContext.Current.Response.Write("<script>alert(\"" + sMsg + "\")</script>");
            HttpContext.Current.Response.End();
        }

        public static void PageAlert(string sMsg, string sUrl)
        {
            HttpContext.Current.Response.Write("<script>alert(\"" + sMsg + "\");window.location.href='" + sUrl + "';</script>");
            HttpContext.Current.Response.End();
        }
    }
}
