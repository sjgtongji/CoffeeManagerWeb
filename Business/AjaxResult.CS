using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Script.Serialization;

namespace Business
{
    public class AjaxResult
    {
        /// <summary>
        /// 是否调用成功
        /// </summary>
        public bool succ { get; set; }

        /// <summary>
        /// 返回信息
        /// </summary>
        public string msg { get; set; }

        /// <summary>
        /// 跳转地址
        /// </summary>
        public string url { get; set; }

        /// <summary>
        /// 是否同步，为true时需点击确定按钮后方可继续
        /// </summary>
        public bool sync { get; set; }

        /// <summary>
        /// 是否刷新当前页面
        /// </summary>
        public bool refresh { get; set; }

        /// <summary>
        /// 调用成功后执行js
        /// </summary>
        public string js { get; set; }


        /// <summary>
        /// 序列化成Json字符串
        /// </summary>
        /// <returns></returns>
        public string ToJson()
        {
            try
            {
                JavaScriptSerializer js = new JavaScriptSerializer();
                StringBuilder sb = new StringBuilder();
                js.Serialize(this, sb);
                return sb.ToString();
            }
            catch (Exception exp)
            {
                throw exp;
            }
        }
    }

    /// <summary>
    /// 用于局部的Ajax请求
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class AjaxResult2<T> where T : class
    {
        /// <summary>
        /// 是否调用成功
        /// </summary>
        public bool succ { get; set; }

        /// <summary>
        /// 返回值 
        /// </summary>
        public List<T> value { get; set; }

        public string ToJson()
        {
            try
            {
                JavaScriptSerializer js = new JavaScriptSerializer();
                StringBuilder sb = new StringBuilder();
                js.Serialize(this, sb);
                return sb.ToString();
            }
            catch (Exception exp)
            {
                throw exp;
            }

        }
    }
}
