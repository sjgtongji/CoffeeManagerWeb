using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;
using XMS.Core.Json;
using System.Web.Profile;

public partial class Ajax_shopManagerAjax : ManagerBasePage
{
    // Fields
    protected string act = string.Empty;
    private AjaxResult ajaxResult = new AjaxResult();

    // Methods
    private void Delete()
    {
        string str = base.Request["id"].DoTrim(new char[0]);
        if (string.IsNullOrWhiteSpace(str))
        {
            this.ajaxResult.msg = "餐厅编号无效";
        }
        else
        {
            int resId = int.Parse(str);
            ReturnValue<bool> value2 = WCFClient.CoffeeService.DeleteRestaurant(resId, base.Manager.Name);
            if (value2.Code != 200)
            {
                this.ajaxResult.msg = value2.RawMessage;
            }
            else if (!value2.Value)
            {
                this.ajaxResult.msg = "删除此餐厅失败";
            }
            else
            {
                this.ajaxResult.succ = true;
                this.ajaxResult.refresh = true;
                this.ajaxResult.msg = "删除此餐厅成功";
            }
        }
    }

    private void EnableState()
    {
        string str = base.Request["id"].DoTrim(new char[0]);
        if (string.IsNullOrWhiteSpace(str))
        {
            this.ajaxResult.msg = "餐厅编号无效";
        }
        else
        {
            int resId = int.Parse(str);
            ReturnValue<CRestaurantDTO> restaurantById = WCFClient.CoffeeService.GetRestaurantById(resId);
            if (restaurantById.Code != 200)
            {
                this.ajaxResult.msg = restaurantById.RawMessage;
            }
            else if (restaurantById.Value == null)
            {
                this.ajaxResult.msg = "此餐厅不存在";
            }
            else
            {
                int state = (restaurantById.Value.state == 1) ? 0 : 1;
                ReturnValue<bool> value3 = WCFClient.CoffeeService.SetRestaurantState(resId, state, base.Manager.Name);
                if (value3.Code != 200)
                {
                    this.ajaxResult.msg = value3.RawMessage;
                }
                else if (!value3.Value)
                {
                    this.ajaxResult.msg = "设置商店上线状态错误";
                }
                else
                {
                    this.ajaxResult.succ = true;
                    this.ajaxResult.msg = "设置商店状态成功";
                }
            }
        }
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        this.act = base.Request["act"].DoTrim(new char[0]).ToLower();
        string str = this.act.ToLower();
        if (str != null)
        {
            if (!(str == "enablestate"))
            {
                if (str == "save")
                {
                    this.Save();
                }
                else if (str == "delete")
                {
                    this.Delete();
                }
            }
            else
            {
                this.EnableState();
            }
        }
        base.Response.Write(JsonSerializer.Serialize(this.ajaxResult));
        base.Response.End();
    }

    private void Save()
    {
        try
        {
            decimal num = 0M;
            if (!string.IsNullOrWhiteSpace(base.Request["allowedDistance"]))
            {
                try
                {
                    num = decimal.Parse(base.Request["allowedDistance"]);
                }
                catch (Exception)
                {
                    this.ajaxResult.msg = string.Format("配送范围（千米）格式不正确，必须是数字", new object[0]);
                    return;
                }
            }
            decimal num2 = 0M;
            if (!string.IsNullOrWhiteSpace(base.Request["latitude"]))
            {
                try
                {
                    num2 = decimal.Parse(base.Request["latitude"]);
                }
                catch (Exception)
                {
                    this.ajaxResult.msg = string.Format("纬度格式不正确，必须是数字", new object[0]);
                    return;
                }
            }
            decimal num3 = 0M;
            if (!string.IsNullOrWhiteSpace(base.Request["longitude"]))
            {
                try
                {
                    num3 = decimal.Parse(base.Request["longitude"]);
                }
                catch (Exception)
                {
                    this.ajaxResult.msg = string.Format("经度格式不正确，必须是数字", new object[0]);
                    return;
                }
            }
            decimal num4 = 0M;
            if (!string.IsNullOrWhiteSpace(base.Request["serverFee"]))
            {
                try
                {
                    num4 = decimal.Parse(base.Request["serverFee"]);
                }
                catch (Exception)
                {
                    this.ajaxResult.msg = string.Format("服务费（配送费）格式不正确，必须是数字", new object[0]);
                    return;
                }
            }
            AddOrUpdateRestaurantDTO tdto2 = new AddOrUpdateRestaurantDTO {
                address = base.Request["address"],
                allowedDistance = num,
                cityId = base.Request["cityId"],
                contactNumber = base.Request["contactNumber"],
                id = int.Parse(base.Request["shopId"]),
                imgUrl = base.Request["PicUrl"],
                isDelete = false,
                latitude = new decimal?(num2),
                longitude = new decimal?(num3),
                name = base.Request["name"],
                remark = base.Request["remark"],
                serverFee = num4,
                state = (base.Request["state"] == null) ? 0 : 1,
                alphabet = Request["Alphabet"]
            };
            AddOrUpdateRestaurantDTO restaurant = tdto2;
            ReturnValue<int> value2 = WCFClient.CoffeeService.AddOrUpdateRestaurantDTO(restaurant, base.Manager.Name);
            if (value2.Code == 200)
            {
                this.ajaxResult.succ = true;
                this.ajaxResult.msg = "操作成功";
                this.ajaxResult.url = CoffeePage.VirtulName + "/ShopManage.aspx";
            }
            else
            {
                WCFClient.LoggerService.Error(value2.RawMessage);
                this.ajaxResult.succ = false;
                this.ajaxResult.msg = value2.Message;
            }
        }
        catch (Exception exception)
        {
            WCFClient.LoggerService.Error(exception.Message);
            this.ajaxResult.succ = false;
            this.ajaxResult.msg = "请输入正确的数据格式";
        }
    }
}


 
