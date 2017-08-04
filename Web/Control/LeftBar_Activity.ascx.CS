using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using XMS.Core;
using Business;

public partial class Control_LeftBar_Activity : System.Web.UI.UserControl
{
    public string URLName = string.Empty;
    protected void Page_Load(object sender, EventArgs e)
    {
        //<%@ Register Src="~/Control/LeftBar_Activity.ascx" TagPrefix="LeftBar" TagName="LeftActBar" %>
        //<%--<LeftBar:LeftActBar runat="server" ID="leftBar" />--%>
    }

    protected bool CheckMenuOpen(string[] strs)
    {
        if (strs != null && strs.Length > 0)
        {
            foreach (var str in strs)
            {
                if (Request.RawUrl.ToLower().Contains(str.ToLower()))
                {
                    return true;
                }
            }
        }
        return false;
    }
}