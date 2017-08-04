using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;
using Business;


public partial class CouponManager : System.Web.UI.Page
{
    protected int pageIndex = 1, pageSize = 20;
    protected long totalCount = 0;
    protected string resName = string.Empty;
    protected int resId = 0;
    protected List<CCouponDTO> listCCouponDTO = new List<CCouponDTO>();
    protected int preferentialType = -1;
    protected int couponType = -1;

    protected void Page_Load(object sender, EventArgs e)
    {
        InitData();

        pageIndex = Request["pageIndex"].DoTrim().ConvertToInt32(1);
        if (!string.IsNullOrWhiteSpace(Request["resId"]))
            resId = int.Parse(Request["resId"]);
        if (resId <= 0)
        {
            resName = "请选择商店";
            return;
        }
        XMS.Core.ReturnValue<CRestaurantDTO> restaurantQuery = WCFClient.CoffeeService.GetRestaurantById(resId);
        if (restaurantQuery.Code != 200)
        {
            WCFClient.LoggerService.Error(string.Format("获取商店错误 详细信息:{0}", restaurantQuery.RawMessage));
            return;
        }
        if (restaurantQuery.Value == null)
        {
            resName = "商店不存在";
            return;
        }

        resName = restaurantQuery.Value.name;

        List<int> listPreferentialType = new List<int>();
        if (preferentialType != -1)
            listPreferentialType.Add(preferentialType);
        List<int> listCouponType = new List<int>();
        if (couponType != -1)
            listCouponType.Add(couponType);

        XMS.Core.ReturnValue<QueryResultCCouponDTO> couponResult = WCFClient.CoffeeService.GetCoupons(null, null, listCouponType.ToArray(), listPreferentialType.ToArray(), null, restaurantQuery.Value.resUUID, null, (pageIndex - 1) * pageSize + 1, pageSize);

        if (couponResult.Code != 200 || couponResult.Value == null)
        {
            XMS.Core.Container.LogService.Info(string.Format("获取优惠卷列表错误 详细信息：{0}", restaurantQuery.RawMessage));
            return;
        }

        totalCount = couponResult.Value.TotalCount;
        if (couponResult.Value.Items != null && couponResult.Value.Items.Length != 0)
            listCCouponDTO.AddRange(couponResult.Value.Items);
    }

    private void InitData()
    {
        if (!string.IsNullOrWhiteSpace(Request["preferentialType"]))
            preferentialType = int.Parse(Request["preferentialType"]);
        if (!string.IsNullOrWhiteSpace(Request["couponType"]))
            couponType = int.Parse(Request["couponType"]);
    }

    protected string GetTypeName(int type)
    {
        switch (type)
        {
            case 1:
                return "新用户优惠";
            case 2:
                return "全场优惠";
            case 3:
                return "满额优惠";
            default:
                return "未知";
        }
    }

    protected string GetPreferentialType(int preferentialType)
    {
        switch (preferentialType)
        {
            case 1:
                return "减额";
            case 2:
                return "百分比";
            default:
                return "未知";
        }
    }
}