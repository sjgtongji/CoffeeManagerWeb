using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

///
/// ZuoZhiwen 2015/08/19
///

namespace Business
{
    public static class BasePageExtension
    {
        #region BasePage Extension

        /// <summary>
        /// 序列化指定类型对象为JSON文本
        /// </summary>
        public static string SerJson<T>(this T page, object value) where T : System.Web.UI.Page
        {
            return XMS.Core.Json.JsonSerializer.Serialize(value);
        }

        /// <summary>
        /// 反序列化JSON文本为指定的对象。
        /// </summary>
        public static TValue DesJson<T, TValue>(this T page, string value) where T : System.Web.UI.Page
        {
            return XMS.Core.Json.JsonSerializer.Deserialize<TValue>(value);
        }

        /// <summary>
        /// 序列化指定类型对象为JSON文本，并写入到返回客户端的流中。
        /// </summary>
        /// <param name="value">待序列化类型。</param>
        public static void WriteJson<T>(this T page, object value) where T : System.Web.UI.Page
        {
            if (page.Response.ContentType != "application/json")
            {
                page.Response.ContentType = "application/json";
            }
            
            page.Response.Write(XMS.Core.Json.JsonSerializer.Serialize(value));
            page.Response.End();
        }

        #endregion
    }
}
