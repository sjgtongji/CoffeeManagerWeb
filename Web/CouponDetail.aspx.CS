using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using XMS.Inner.Coffee.Service.Model;
using Business;

public partial class CouponDetail : System.Web.UI.Page
{
    protected string ShowName { get; set; }
    protected int couponId { get; set; }
    protected CCouponDTO couponDTO = null;
    protected int resId = 0;
    protected bool ErrFlag = false;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!string.IsNullOrWhiteSpace(Request["couponId"]))
            couponId = int.Parse(Request["couponId"]);
        resId = int.Parse(Request["resId"]);
        if (resId <= 0)
        {
            ShowName = "餐厅ID不正确";
            ErrFlag = true;
        }
        initInfo();
    }

    private void initInfo()
    {
        if (couponId > 0)
        {
            ShowName = "修改优惠卷";
            XMS.Core.ReturnValue<CCouponDTO> restResult = WCFClient.CoffeeService.GetCouponById(couponId);
            if (restResult.Code != 200)
            {
                WCFClient.LoggerService.Info(string.Format("获取优惠卷发生错误 详细信息:{0}", restResult.RawMessage));
                ErrFlag = true;
            }
            else if (restResult.Value == null)
            {
                WCFClient.LoggerService.Info(string.Format("此优惠卷不存在 ID:{0}", couponId));
                ErrFlag = true;
            }
            else if (restResult.Value != null)
            {
                couponDTO = restResult.Value;
            }
        }
        else
            ShowName = "新增优惠卷";


        XMS.Core.ReturnValue<CRestaurantDTO> restaurantQuery = WCFClient.CoffeeService.GetRestaurantById(resId);
        if (restaurantQuery.Code != 200)
        {
            WCFClient.LoggerService.Error(string.Format("获取商店错误 详细信息:{0}", restaurantQuery.RawMessage));
            ErrFlag = true;
            return;
        }
        if (restaurantQuery.Value == null)
        {
            ErrFlag = true;
            return;
        }
    }
}