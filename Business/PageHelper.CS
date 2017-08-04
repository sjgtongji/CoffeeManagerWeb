using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using XMS.Core;

namespace Business
{
 public class PageHelper
    {
        /// <summary>
        /// 获取Page参数，当前页
        /// </summary>
        /// <returns></returns>
        public static int CurrentPage
        {
            get
            {
                return Math.Max((HttpContext.Current.Request["page"]).ConvertToInt32(), 1);
            }
        }

        /// <summary>
        /// 生成分页的HTML代码
        /// </summary>
        /// <param name="nTotal">总条数</param>
        /// <param name="nCurrentPage">当前页</param>
        /// <param name="nPageSize">每页数</param>
        /// <param name="sUrlBase">地址</param>
        /// <returns></returns>
        public static string GetPager(int nTotal, int nCurrentPage, int nPageSize, string sClickMethod)
        {
            if (nTotal <= 0)
                return string.Empty;
            StringBuilder sb = new StringBuilder();
            if (nCurrentPage > 1)
            {
                sb.Append("<a href='javascript:' class=\"page_able\" onclick=\"" + sClickMethod + "(" + (nCurrentPage - 1) + ");\">«上一页</a>");
            }
            else
            {
                sb.Append("<span class=\"page_off\">«</span>");
            }
            int nPages = 0;
            if (nTotal % nPageSize > 0)
                nPages = (nTotal / nPageSize) + 1;
            else
                nPages = (nTotal / nPageSize);

            if (nCurrentPage > nPages)
                nCurrentPage = nPages;
            if (nCurrentPage < 1)
                nCurrentPage = 1;

            if (nCurrentPage > 5)
            {
                sb.Append(LoopStr(1, 2, nCurrentPage, sClickMethod));
                sb.Append("<span class=\"page_on\">...</span>");
                if (nPages > nCurrentPage + 3)
                {
                    sb.Append(LoopStr(nCurrentPage - 2, nCurrentPage + 2, nCurrentPage, sClickMethod));
                    sb.Append("<span class=\"page_on\">...</span>");
                    sb.Append(LoopStr(nPages - 1, nPages, nCurrentPage, sClickMethod));
                }
                else
                {
                    sb.Append(LoopStr(nCurrentPage - 2, nPages, nCurrentPage, sClickMethod));
                }
            }
            else
            {
                if (nPages < nCurrentPage + 5)
                {
                    sb.Append(LoopStr(1, nPages, nCurrentPage, sClickMethod));
                }
                else
                {
                    sb.Append(LoopStr(1, nCurrentPage + 2, nCurrentPage, sClickMethod));
                    sb.Append("<span class=\"page_on\">...</span>");
                    sb.Append(LoopStr(nPages - 1, nPages, nCurrentPage, sClickMethod));
                }
            }

            if (nCurrentPage < nPages)
            {
                sb.Append(" <a href='javascript:' class=\"page_able\" onclick=\"" + sClickMethod + "(" + (nCurrentPage + 1) + ");\">下一页»</a>");
            }
            else
            {
                sb.Append("<span class=\"page_off\">»</span>");
            }
            return sb.ToString();
        }


        public static string GetPagerHtml(int nTotalCount, int nPageSize, int nCurrentPage)
        {
            var strb = new StringBuilder();
            int nPageCount = nTotalCount / nPageSize + (nTotalCount % nPageSize == 0 ? 0 : 1);

            if (nPageCount == 0)
            {
                return "";
            }

            //如果当前页面超过了最大记录页数
            if(nCurrentPage > nPageCount)
            {
                nCurrentPage = 1;
            }

            //在当前分页前后个显示2页，共5页。

            //位于最前面5页以内，显示前5页。
            if (nCurrentPage <= 3)
            {
                if (nCurrentPage == 1)
                {
                    strb.Append("<li class=\"disabled\"><a href=\"javascript:void(0)\" aria-label=\"Previous\"><span aria-hidden=\"true\">&laquo;</span></a></li>");
                }
                else
                {
                    strb.Append("<li><a href=\"javascript:void(0)\" aria-label=\"Previous\"><span aria-hidden=\"true\">&laquo;</span></a></li>");
                }

                for (int i = 1; i <= Math.Min(nPageCount, 5); i++)
                {
                    if (i != nCurrentPage)
                    {
                        strb.Append("<li><a href=\"javascript:void(0)\">" + i + "</a></li>");
                    }
                    else
                    {
                        strb.Append("<li class=\"active\"><a href=\"javascript:void(0)\">" + i + "</a></li>");
                    }
                }

                if (nCurrentPage == nPageCount)
                {
                    strb.Append("<li class=\"disabled\"><a href=\"javascript:void(0)\" aria-label=\"Next\"><span aria-hidden=\"true\">&raquo;</span></a></li>");
                }
                else
                {
                    strb.Append("<li><a href=\"javascript:void(0)\" aria-label=\"Next\"><span aria-hidden=\"true\">&raquo;</span></a></li>");
                }
                return strb.ToString();
            }
            
            //位于最后面5页以内，显示后5页。
            if (nPageCount - nCurrentPage <= 2)
            {
                if (nCurrentPage == 1)
                {
                    strb.Append("<li class=\"disabled\"><a href=\"javascript:void(0)\" aria-label=\"Previous\"><span aria-hidden=\"true\">&laquo;</span></a></li>");
                }
                else
                {
                    strb.Append("<li><a href=\"javascript:void(0)\" aria-label=\"Previous\"><span aria-hidden=\"true\">&laquo;</span></a></li>");
                }

                for (int i = (nPageCount - 4 > 0 ? nPageCount - 4 : 1); i <= nPageCount; i++)
                {
                    if (i != nCurrentPage)
                    {
                        strb.Append("<li><a href=\"javascript:void(0)\">" + i + "</a></li>");
                    }
                    else
                    {
                        strb.Append("<li class=\"active\"><a href=\"javascript:void(0)\">" + i + "</a></li>");
                    }
                }

                if (nCurrentPage == nPageCount)
                {
                    strb.Append("<li class=\"disabled\"><a href=\"javascript:void(0)\" aria-label=\"Next\"><span aria-hidden=\"true\">&raquo;</span></a></li>");
                }
                else
                {
                    strb.Append("<li><a href=\"javascript:void(0)\" aria-label=\"Next\"><span aria-hidden=\"true\">&raquo;</span></a></li>");
                }
                return strb.ToString();
            }

            //显示中间的页面
            if (nCurrentPage == 1)
            {
                strb.Append("<li class=\"disabled\"><a href=\"javascript:void(0)\" aria-label=\"Previous\"><span aria-hidden=\"true\">&laquo;</span></a></li>");
            }
            else
            {
                strb.Append("<li><a href=\"javascript:void(0)\" aria-label=\"Previous\"><span aria-hidden=\"true\">&laquo;</span></a></li>");
            }

            for (int i = nCurrentPage - 2; i <= nCurrentPage + 2 && i > 0 && i <= nPageCount; i++)
            {
                if (i != CurrentPage)
                {
                    strb.Append("<li><a href=\"javascript:void(0)\">" + i + "</a></li>");
                }
                else
                {
                    strb.Append("<li class=\"active\"><a href=\"javascript:void(0)\">" + i + "</a></li>");
                }
            }

            if (nCurrentPage == nPageCount)
            {
                strb.Append("<li class=\"disabled\"><a href=\"javascript:void(0)\" aria-label=\"Next\"><span aria-hidden=\"true\">&raquo;</span></a></li>");
            }
            else
            {
                strb.Append("<li><a href=\"javascript:void(0)\" aria-label=\"Next\"><span aria-hidden=\"true\">&raquo;</span></a></li>");
            }
            return strb.ToString();
        }
        //生成HTML代码用
        private static StringBuilder LoopStr(int nMin, int nMax, int nCurrentPage, string sClickMethod)
        {
            StringBuilder sb = new StringBuilder();
            for (int i = nMin; i <= nMax; i++)
            {
                if (i == nCurrentPage)
                    sb.Append(string.Format("<strong class=\"page_on\">{0}</strong>", i));
                else
                    sb.Append(string.Format("<a href='javascript:' class=\"page_able\" onclick=\"" + sClickMethod + "(" + i + ");\">{0}</a>", i));
            }
            return sb;
        }
    }
}
