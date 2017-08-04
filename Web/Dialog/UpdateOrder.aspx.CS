using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using XMS.Core;
using Business;
using XMS.Inner.Coffee.Service.Model;

public partial class Dialog_UpdateOrder : System.Web.UI.Page
{
    protected int orderId = 0;
    protected COrderDTO orderDTO = null;
    protected void Page_Load(object sender, EventArgs e)
    {
        orderId = int.Parse(Request["orderId"].DoTrim());
        if (orderId > 0)
        {
            
            XMS.Core.ReturnValue<QueryResultCOrderDTO> orderResult = WCFClient.CoffeeService.GetOrderDTOs(orderId,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,
              1,1,false,false);

            if(orderResult.Code != 200)
            {
                WCFClient.LoggerService.Error(orderResult.RawMessage);
                Response.Write("<script>alert('获取订单信息错误!')</script>");
                return;
            }

            if(orderResult.Value == null || orderResult.Value.Items == null || orderResult.Value.Items.Length == 0)
            {
                Response.Write("<script>alert('此获取不存在!')</script>");
                return;
            }

            orderDTO = orderResult.Value.Items[0];
        }
    }
}