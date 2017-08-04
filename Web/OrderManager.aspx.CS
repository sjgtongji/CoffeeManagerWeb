using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Inner.Coffee.Service.Model;
using XMS.Core;

public partial class OrderManager : ManagerBasePage
{
    protected int pageIndex = 1, pageSize = 20;
    protected long totalCount = 0;

    protected string resUUID = "-1";
    protected int payStatus = -1;
    protected int deliveryType = -1;
    protected int orderState = -1;
    protected DateTime maxCreateTime = DateTime.Now.Date;
    protected DateTime minCreateTime = DateTime.Now.Date;
    protected List<CRestaurantDTO> listRestaurant = new List<CRestaurantDTO>();

    protected List<COrderDTO> listOrderDTO = new List<COrderDTO>();
    protected string Action { get { return Request["action"]; } }

    protected void Page_Load(object sender, EventArgs e)
    {
        if (intiData() == false)
            return;

        if ("export" == Action)
        {
            Export();
            return;
        }

        initInfo();
    }

    /// <summary>
    /// 获取客户的性别
    /// </summary>
    /// <param name="addressUUID"></param>
    /// <returns></returns>
    protected string GetCustomerName(string addressUUID)
    {
        if (string.IsNullOrWhiteSpace(addressUUID))
            return string.Empty;

        XMS.Core.ReturnValue<QueryResultCMemberAddressDTO> addressResult = WCFClient.CoffeeService.GetMemberAddress(addressUUID, null, null, null, null, null, null, 1, 1);
        if (addressResult.Code != 200)
        {
            WCFClient.LoggerService.Error(addressResult.RawMessage);
            return string.Empty;
        }

        if (addressResult.Value == null || addressResult.Value.Items == null || addressResult.Value.Items.Length == 0)
        {
            return string.Empty;
        }

        return "女士".Equals(addressResult.Value.Items[0].sex) || "0".Equals(addressResult.Value.Items[0].sex) ? "女士" : "先生";

    }

    protected void Export()
    {
        List<int> listPayStatus = new List<int>();
        List<int> listDeliveryType = new List<int>();
        List<int> listOrderState = new List<int>();
        string strResUUID = string.Empty;
        if (resUUID != "-1")
            strResUUID = resUUID;
        if (payStatus != -1)
        {
            if (payStatus == 1)
            {
                listPayStatus.Add(1);
                listPayStatus.Add(2);
            }
            else
            {
                listPayStatus.Add(payStatus);
            }
        }
        if (deliveryType != -1)
        {
            listDeliveryType.Add(deliveryType);
        }

        if (orderState != -1)
        {
            listOrderState.Add(orderState);
        }

        XMS.Core.ReturnValue<QueryResultCOrderDTO> orderQuery = WCFClient.CoffeeService.GetOrderDTOs(null, null, strResUUID, null, null, null, minCreateTime,  maxCreateTime.AddDays(1).AddMilliseconds(-1), listOrderState.ToArray(), listPayStatus.ToArray(), null, listDeliveryType.ToArray(), null, null, null, null, 1, 1000, true, true);
        if (orderQuery.Code != 200 || orderQuery.Value == null || orderQuery.Value.Items == null || orderQuery.Value.Items.Length == 0)
        {
            XMS.Core.Container.LogService.Info(string.Format("获取订单列表错误 详细信息：{0}", orderQuery.RawMessage));
            return;
        }


        var dt = orderQuery.Value.Items.Select(item => new OrderInfo
        {
            商店名 = GetShopName(item.resUUID),
            订单编号 = item.orderId,
            订餐人 = item.memberName + GetCustomerName(item.memberAddressUUID),
            用户号码 = item.telephone,
            订单创建时间 = item.createTime,
            支付状态 = GetPayStatus(item.payStatus),
            购买次数 = GetBuyCount(item.memberUUID),
            取货方式 = GetDeliveryType(item.deliveryType),
            确认状态 = GetOrderState(item.orderState),
            支付金额 = item.payMomey.HasValue ? item.payMomey.Value : 0,
            送达时间 = GetDeliveryTime(item.deliveryMinTime, item.deliveryMaxTime, item.isOutOfTime),
            送货地址 = item.deliveryAddress,
            服务费 = item.serverFee,
            订单金额 = item.orderMomey,
            优惠金额 = decimal.Parse((-(item.orderMomey + item.serverFee - (item.payMomey.HasValue ? item.payMomey.Value : 0))).ToString("#0.00")),
            商品 = GetCommodityInfo(item.listCOrderCommodityRelation),
            备注 = item.remark,
            商家备注 = item.managerRemark,

        }).LinQToDataTable();
        //传送给用户
        string fileName = DateTime.Now.ToString("yyyy-MM-dd") + "_订单记录导出.xlsx";
        ExportExcel.XRenderToBrowser(System.Web.HttpContext.Current, dt, fileName);
        dt.Dispose();
    }

    public decimal GetBuyCount(string memberUUID)
    {
        XMS.Core.ReturnValue<QueryResultCOrderPO> resultQuery = WCFClient.CoffeeService.GetOrders(null, null, null, memberUUID, null, null, null, null, new int[] { 1, 2 }, null, null, null, null, null, null, 1, 1);
        if (resultQuery.Code != 200)
        {
            WCFClient.LoggerService.Error(resultQuery.RawMessage);
            return 0;
        }

        if (resultQuery.Value == null)
        {
            return 0;
        }

        return resultQuery.Value.TotalCount;
    }

    protected class OrderInfo
    {
        public string 商店名 { get; set; }
        public string 订单编号 { get; set; }
        public string 订餐人 { get; set; }
        public string 用户号码 { get; set; }
        public DateTime 订单创建时间 { get; set; }
        public string 支付状态 { get; set; }
        public decimal 购买次数 { get; set; }
        public string 取货方式 { get; set; }
        public string 确认状态 { get; set; }
        public decimal 支付金额 { get; set; }
        public string 送达时间 { get; set; }
        public string 送货地址 { get; set; }
        public decimal 服务费 { get; set; }
        public decimal 订单金额 { get; set; }
        public decimal 优惠金额 { get; set; }
        public string 商品 { get; set; }
        public string 备注 { get; set; }
        public string 商家备注 { get; set; }
    }

    private bool intiData()
    {
        pageIndex = Request["pageIndex"].DoTrim().ConvertToInt32(1);
        if (!string.IsNullOrWhiteSpace(Request["resUUID"]))
            resUUID = Request["resUUID"];
        //if (!string.IsNullOrWhiteSpace(Request["payStatus"]))
        //    payStatus = int.Parse(Request["payStatus"]);
        payStatus = 1;
        if (!string.IsNullOrWhiteSpace(Request["deliveryType"]))
            deliveryType = int.Parse(Request["deliveryType"]);
        if (!string.IsNullOrWhiteSpace(Request["orderState"]))
            orderState = int.Parse(Request["orderState"]);
        try
        {
            if (!string.IsNullOrWhiteSpace(Request["minCreateTime"]))
                minCreateTime = DateTime.Parse(Request["minCreateTime"]);
            //else
            //{
            //    Response.Write("<script>alert('开始时间必须设定!')</script>");
            //    return false;
            //}
            if (!string.IsNullOrWhiteSpace(Request["maxCreateTime"]))
                maxCreateTime = DateTime.Parse(Request["maxCreateTime"]);
            //else
            //{
            //    Response.Write("<script>alert('结束时间必须设定!')</script>");
            //    return false;
            //}
        }
        catch (Exception ex)
        {
            Response.Write("<script>alert('" + ex.Message + "!')</script>");
            return false;
        }
     

        XMS.Core.ReturnValue<QueryResultCRestaurantDTO> queryRestaurant = WCFClient.CoffeeService.GetRestaurantDTOByCondition(null, null, null, null, null, null, null, 1, 1000, true, null);
         if (queryRestaurant.Code != 200 || queryRestaurant.Value == null)
        {
            XMS.Core.Container.LogService.Info(string.Format("获取商品列表错误 详细信息：{0}", queryRestaurant.RawMessage));
            return false;
        }
        totalCount = queryRestaurant.Value.TotalCount;
        if (queryRestaurant.Value.Items != null && queryRestaurant.Value.Items.Length != 0)
            listRestaurant.AddRange(queryRestaurant.Value.Items);

        return true;
    }


    private void initInfo()
    {
        List<int> listPayStatus = new List<int>();
        List<int> listDeliveryType = new List<int>();
        List<int> listOrderState = new List<int>();

        string strResUUID = string.Empty;
        if (resUUID != "-1")
            strResUUID = resUUID;
        if (payStatus != -1)
        {
            if (payStatus == 1)
            {
                listPayStatus.Add(1);
                listPayStatus.Add(2);
            }
            else
            {
                listPayStatus.Add(payStatus);
            }
        }
        if (deliveryType != -1)
        {
            listDeliveryType.Add(deliveryType);
        }
        if (orderState != -1)
        {
            listOrderState.Add(orderState);
        }

        XMS.Core.ReturnValue<QueryResultCOrderDTO> orderQuery = WCFClient.CoffeeService.GetOrderDTOs(null, null, strResUUID, null, null, null, minCreateTime, maxCreateTime.AddDays(1).AddMilliseconds(-1), listOrderState.ToArray(), listPayStatus.ToArray(), null, listDeliveryType.ToArray(), null, null, null, null, (pageIndex - 1) * pageSize + 1, pageSize, true, true);
        if (orderQuery.Code != 200 || orderQuery.Value == null)
        {
            XMS.Core.Container.LogService.Info(string.Format("获取订单列表错误 详细信息：{0}", orderQuery.RawMessage));
            return;
        }

        totalCount = orderQuery.Value.TotalCount;
        if (orderQuery.Value.Items != null && orderQuery.Value.Items.Length != 0)
            listOrderDTO.AddRange(orderQuery.Value.Items);
    }

    protected string GetShopName(string resUUID)
    {
        if (string.IsNullOrWhiteSpace(resUUID))
            return string.Empty;
        if (listRestaurant == null || listRestaurant.Count == 0)
            return string.Empty;
        CRestaurantDTO restaurant = listRestaurant.FirstOrDefault(x => x.resUUID == resUUID);
        if (restaurant == null)
            return string.Empty;
        return restaurant.name;
    }

    protected string GetPayStatus(int? payStatus)
    {
        if (!payStatus.HasValue)
            return "未支付";
        switch (payStatus.Value)
        {
            case 0:
                return "未支付";
            case 1:
                return "已支付";
            case 2:
                return "已支付";
            default:
                return "未支付";
        }
    }

    protected string GetDeliveryType(int deliveryType)
    {
        if (deliveryType == 1)
            return "门店自取";
        return "配送";
    }

    protected string GetOrderState(int? orderState)
    {
        if (!orderState.HasValue)
            return "未确认";
        switch (orderState.Value)
        {
            case 0:
                return "未确认";
            case 1:
                return "已确认";
            case 2:
                return "已取消";
            case 3:
                return "已配送";
            case 4:
                return "已完成";
            default:
                return "未确认";
        }
    }

    protected string GetDeliveryTime(DateTime? startTime, DateTime? endTime,bool flag)
    {
        string returnInfo = string.Empty;
        if (flag == true)
            returnInfo = "(尽快送达)";
        if (!startTime.HasValue && !endTime.HasValue)
            return returnInfo;
        if (!startTime.HasValue)
            return endTime.Value.ToString("yyyy-MM-dd HH:mm") + returnInfo;
        if (!endTime.HasValue)
            return startTime.Value.ToString("yyyy-MM-dd HH:mm") + returnInfo;

        return startTime.Value.ToString("yyyy-MM-dd HH:mm") + "-" + endTime.Value.ToString("HH:mm") + returnInfo;
    }

    protected string GetCommodityInfo(COrderCommodityRelationDTO[] orderCommodityRelation)
    {
        if (orderCommodityRelation == null || orderCommodityRelation.Length == 0)
            return string.Empty;
        string returnInfo = string.Empty;
        foreach (var item in orderCommodityRelation)
        {
            if(item==null)
                continue;
            returnInfo =  returnInfo + item.chineseName;
            if(!string.IsNullOrWhiteSpace(item.chinesePropertyName))
                returnInfo = returnInfo + "(" + item.chinesePropertyName + ")";
            returnInfo = returnInfo + " X " + item.quantity + ";";
        }

        return returnInfo;
    }
}