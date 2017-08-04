using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using XMS.Core;

namespace Business
{
    public class AppSettingHelper
    {

        #region 产生随机数
        private static readonly int UPLOADSITE_MAXNUM = 4;
        private static Random r = new Random();
        private static int GetRandom()
        {
            int i;
            if (System.Web.HttpContext.Current != null)
            {
                string key = System.Web.HttpContext.Current.Request.UserHostAddress;
                object value = Container.CacheService.LocalCache.GetItem("RESOURCE_USER_RANDOM", key);
                if (value == null)
                {
                    i = r.Next(1, UPLOADSITE_MAXNUM);
                    Container.CacheService.LocalCache.SetItem("RESOURCE_USER_RANDOM", key, i, TimeSpan.FromHours(12));
                }
                else
                {
                    i = (int)value;
                }
            }
            else
            {
                i = r.Next(1, UPLOADSITE_MAXNUM);
            }
            return i;
        }
        #endregion

        /// <summary>
        /// 静态资源站点Url
        /// </summary>
        public static string ResourceSiteUrl
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("ResourceSiteUrl", "http://s1.95171.cn").TrimEnd('/');
            }
        }

        public static string NewResUrl
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("NewResUrl", "http://192.168.1.138/newres").TrimEnd('/');
            }
        }

        public static string NoticeUrl
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("NoticeUrl", "http://192.168.1.138/IVRWeb2").TrimEnd('/');
            }
        }

        public static string RTBWebUrl
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("RTBWebUrl", "http://192.168.1.138/RTBWeb").TrimEnd('/');
            }
        }

        public static string RTBWeb90Url
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("RTBWeb90Url", "http://192.168.1.138/RTBWebNew").TrimEnd('/');
            }
        }

        public static string RTBWebAdminUrl
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("RTBWebAdminUrl", "http://192.168.1.138/RTBWeb/Admin").TrimEnd('/');
            }
        }

        public static string UploadSiteUrl
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("UploadSiteUrl", "http://192.168.1.30:9114").TrimEnd('/');
            }
        }
        public static string UploadKey
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("UploadKey", "MemberUCPM4WeiXin");
            }
        }
        public static string DeliveryPicRootKey
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("DeliveryPicRootKey", "DefaultRootKey");
            }
        }

        public static string DefaultImagePath
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("DefaultImagePath", "http://upload2.95171.cn/o/img/small/takeaway_foodnopic.png");
            }
        }
        /// <summary>
        /// 上传微信图片Key
        /// </summary>
        public static string UploadWeiXinPicKey
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("UploadWeiXinPicKey", "MemberUCPM4WeiXin");
            }
        }

        /// <summary>
        /// 上传3D实景图Key
        /// </summary>
        public static string Upload3DPicKey
        {
            get
            {
                return XMS.Core.Container.ConfigService.GetAppSetting<string>("Upload3DPicKey", "Panoramagram");
            }
        }

        /// <summary>
        /// 根据文件路径获取文件站点Url
        /// </summary>
        /// <param name="sFilePath"></param>
        /// <returns></returns>
        public static string GetUploadSiteUrl(string sFilePath)
        {
            int i;
            if (string.IsNullOrEmpty(sFilePath))
            {
                return UploadSiteUrl;
            }
            int x = sFilePath.LastIndexOf("/");
            if (x > -1)
            {
                sFilePath = sFilePath.Substring(x + 1);
            }
            i = Math.Abs(sFilePath.GetHashCode()) % UPLOADSITE_MAXNUM + 1;
            return string.Format(Container.ConfigService.GetAppSetting<string>("UploadSiteUrl", "http://upload{0}.95171.cn").TrimEnd('/'), i);
        }

        /// <summary>
        /// 解析配置文件中的字符串，字符串格式如下："0_位,1_桌"
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static KeyValuePair<int, string>[] GetKeyValuesByKey(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                return Empty<KeyValuePair<int, string>>.Array;
            }

            string[] arr = Container.ConfigService.GetAppSetting<string[]>(key, Empty<string>.Array);
            if (arr == null || arr.Length == 0)
            {
                return Empty<KeyValuePair<int, string>>.Array;
            }

            char split = '_';
            List<KeyValuePair<int, string>> lst = new List<KeyValuePair<int, string>>();
            foreach (var item in arr)
            {
                if (!string.IsNullOrEmpty(item))
                {
                    if (item.IndexOf(split) >= 0)
                    {
                        string[] strarr = item.Split(new char[] { split }, StringSplitOptions.RemoveEmptyEntries);
                        if (strarr != null && strarr.Length == 2 && !string.IsNullOrEmpty(strarr[0]))
                        {
                            lst.Add(new KeyValuePair<int, string>(strarr[0].ConvertToInt32(), strarr[1]));
                        }
                    }
                }
            }

            return lst.ToArray();
        }

        public static string VirtulName
        {
            get
            {
                return Container.ConfigService.GetAppSetting<string>("VirtulName", "/GroupManage");
            }
        }

        public static int[] EnableSMSChargeUserIds
        {
            get
            {
                return Container.ConfigService.GetAppSetting<int[]>("EnableSMSChargeUserIds", Empty<int>.Array);
            }
        }

        public static int[] EnablePrepaymentChargeUserIds
        {
            get
            {
                return Container.ConfigService.GetAppSetting<int[]>("EnablePrepaymentChargeUserIds", Empty<int>.Array);
            }
        }

        public static int[] EnableAuditContractUserIds
        {
            get
            {
                return Container.ConfigService.GetAppSetting<int[]>("EnableAuditContractUserIds", Empty<int>.Array);
            }
        }
    }
}
