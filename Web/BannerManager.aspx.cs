using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using XMS.Core;
using Business;
using XMS.Inner.Coffee.Service.Model;

public partial class BannerManager : ManagerBasePage
{
    protected  List<CBannerDTO> listCBannerDTO = new List<CBannerDTO>();
    protected void Page_Load(object sender, EventArgs e)
    {
        XMS.Core.ReturnValue<CBannerDTO[]> listBanner = WCFClient.CoffeeService.GetCBannerList(null, null);
        if (listBanner.Code != 200)
        {
            WCFClient.LoggerService.Error(listBanner.RawMessage);
            return;
        }

        if (listBanner.Value == null || listBanner.Value.Length == 0)
            return;

        listCBannerDTO.AddRange(listBanner.Value);
    }
}