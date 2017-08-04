using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.IO;

namespace Business
{
    public static class PicHelper
    {
        static Regex regPicSize = new Regex(@"/(small|middle|\d+_\d+|\d+_x)/", RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.RightToLeft);
        public static string GetSmallPath(string path)
        {
            if (String.IsNullOrEmpty(path) || path.IndexOf(".") < 0) return path;
            return path.Insert(path.IndexOf("."), "_small");
        }
        /// <summary>
        /// 输入新文件路径，判断文件夹，返回一个新的不重复地址
        /// </summary>
        /// <param name="tfullPath">文件路径</param>
        /// <param name="replaceUrl">需要模式匹配的字符串</param>
        /// <returns></returns>
        public static string GetLastPath(string tfullPath, string replaceUrl)
        {
            if (String.IsNullOrEmpty(tfullPath) || String.IsNullOrEmpty(replaceUrl)) return null;
            string fullPath = Path.Combine(replaceUrl, tfullPath);
            if (!File.Exists(fullPath)) return fullPath;
            int loopFrom = 0;
            string exts = Path.GetExtension(fullPath).Trim().ToLower();
            string oldPath = fullPath.Trim().ToLower().Substring(0, fullPath.Length - exts.Length);
            oldPath = Regex.Replace(oldPath, @"\[\d*\]$", "");
            string Opath = fullPath;

            while (File.Exists(oldPath + "[" + (++loopFrom).ToString() + "]" + exts)) { }
            string OFilePath = (oldPath + "[" + loopFrom.ToString() + "]" + exts);
            return OFilePath.ToLower().Replace(replaceUrl.ToLower(), "").Trim('/', '\\');
        }



        /// <summary>
        /// 返回文件服务器下的图片地址
        /// </summary>
        /// <param name="sPath">图片地址</param>
        /// <returns></returns>
        /// 


        public static string GetPicRelative(string path)
        {
            string str = "";
            if (!string.IsNullOrEmpty(path))
            {
                Uri ui = new Uri(path);
                string sp = ui.Host;
                str = ui.AbsolutePath;
            }
            return str;
        }
        public static string GetUploadPicPath(string sPath)
        {
            if (string.IsNullOrEmpty(sPath))
            {
                return sPath;
            }
            sPath = sPath.ToLower().StartsWith("http://") ? sPath : (AppSettingHelper.GetUploadSiteUrl(sPath).Trim('/') + "/" + sPath.TrimStart('/'));
            return sPath;
        }

        /// <summary>
        /// 取文件服务器各种尺寸的图片地址
        /// </summary>
        /// <param name="sPath"></param>
        /// <param name="sSize"></param>
        /// <returns></returns>
        public static string GetUploadPicPath(string sPath, string sSize)
        {
            if (string.IsNullOrEmpty(sPath))
            {
                return sPath;
            }
            sPath = GetUploadPicPath(sPath);

            if (!string.IsNullOrEmpty(sSize))
            {
                sPath = regPicSize.Replace(sPath, "/", 1);
                sPath = sPath.Insert(sPath.LastIndexOf("/"), "/" + sSize);
            }
            return sPath;
        }

     
    }
}
