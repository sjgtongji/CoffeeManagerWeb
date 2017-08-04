using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Inner.Coffee.Service.Model;
using XMS.Core;

public partial class oops : CoffeePage
{
    // Fields
    protected string sContent = string.Empty;

    // Methods
    protected void Page_Load(object sender, EventArgs e)
    {
        this.sContent = base.Request["msg"].DoTrim(new char[0]).ToHtmlEncode();
        if (string.IsNullOrEmpty(this.sContent))
        {
            this.sContent = "您要访问的页面不存在";
        }
    }
}


