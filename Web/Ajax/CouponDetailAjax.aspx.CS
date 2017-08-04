using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;
using XMS.Core.JsonFast;
using System.Web.Profile;

public partial class Ajax_CouponDetailAjax : ManagerBasePage
{
    // Fields
    protected string act = string.Empty;
    private AjaxResult ajaxResult = new AjaxResult();

    // Methods
    private void Delete()
    {
        string str = base.Request["couponId"].DoTrim(new char[0]);
        if (string.IsNullOrWhiteSpace(str))
        {
            this.ajaxResult.msg = "优惠卷编号无效";
        }
        else
        {
            int id = int.Parse(str);
            string str2 = base.Request["resId"].DoTrim(new char[0]);
            if (string.IsNullOrWhiteSpace(str2))
            {
                this.ajaxResult.msg = "优惠卷编号无效";
            }
            else
            {
                int resId = int.Parse(str2);
                ReturnValue<CRestaurantDTO> restaurantById = WCFClient.CoffeeService.GetRestaurantById(resId);
                if (restaurantById.Code != 200)
                {
                    this.ajaxResult.msg = string.Format("获取商店发生错误 详细信息:{0}", restaurantById.Message);
                    WCFClient.LoggerService.Error(string.Format("获取商店发生错误 详细信息:{0}", restaurantById.RawMessage));
                }
                else if (restaurantById.Value == null)
                {
                    this.ajaxResult.msg = string.Format("此商店不存在 ID:{0}", resId);
                    WCFClient.LoggerService.Error(string.Format("此餐厅不存在 ID:{0}", resId));
                }
                else
                {
                    ReturnValue<bool> value3 = WCFClient.CoffeeService.DeleteCoupon(id, base.Manager.Name);
                    if (value3.Code != 200)
                    {
                        this.ajaxResult.msg = restaurantById.Message;
                        WCFClient.LoggerService.Error(string.Format("删除此优惠卷失败 详细信息:{0}", restaurantById.RawMessage));
                    }
                    else if (!value3.Value)
                    {
                        this.ajaxResult.msg = "删除此优惠卷失败";
                        WCFClient.LoggerService.Error(string.Format("删除此优惠卷失败 ID:{0}", id));
                    }
                    else
                    {
                        this.ajaxResult.succ = true;
                        this.ajaxResult.refresh = true;
                        this.ajaxResult.msg = "删除此优惠卷成功";
                    }
                }
            }
        }
    }

    private void EnableState()
    {
        string str = base.Request["couponId"].DoTrim(new char[0]);
        if (string.IsNullOrWhiteSpace(str))
        {
            this.ajaxResult.msg = "优惠卷编号无效";
        }
        else
        {
            int id = int.Parse(str);
            ReturnValue<CCouponDTO> couponById = WCFClient.CoffeeService.GetCouponById(id);
            if (couponById.Code != 200)
            {
                this.ajaxResult.msg = couponById.RawMessage;
            }
            else if (couponById.Value == null)
            {
                this.ajaxResult.msg = "此属性类别不存在";
            }
            else
            {
                int num2 = (couponById.Value.state == 1) ? 2 : 1;
                AddOrUpdateCouponDTO ndto2 = new AddOrUpdateCouponDTO {
                    Id = couponById.Value.id,
                    IsDelete = couponById.Value.isDelete,
                    ResId = int.Parse(base.Request["resId"]),
                    Remark = couponById.Value.remark,
                    State = num2,
                    CouponName = couponById.Value.couponName,
                    CouponType = couponById.Value.couponType,
                    EffectiveEndTime = couponById.Value.effectiveEndTime,
                    EffectiveStartTime = couponById.Value.effectiveStartTime,
                    OfferAmount = couponById.Value.offerAmount,
                    Preferential = couponById.Value.preferential,
                    PreferentialType = couponById.Value.preferentialType
                };
                AddOrUpdateCouponDTO coupon = ndto2;
                if (WCFClient.CoffeeService.AddOrUpdateCoupon(coupon, base.Manager.Name).Code == 200)
                {
                    this.ajaxResult.succ = true;
                    this.ajaxResult.msg = "操作成功";
                    this.ajaxResult.url = CoffeePage.VirtulName + "/CouponManager.aspx?resId=" + int.Parse(base.Request["resId"]);
                }
                else
                {
                    WCFClient.LoggerService.Error(couponById.RawMessage);
                    this.ajaxResult.succ = false;
                    this.ajaxResult.msg = couponById.Message;
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
            if (!(str == "delete"))
            {
                if (str == "save")
                {
                    this.Save();
                }
                else if (str == "enablestate")
                {
                    this.EnableState();
                }
            }
            else
            {
                this.Delete();
            }
        }
        base.Response.Write(JsonSerializer.Serialize(this.ajaxResult));
        base.Response.End();
    }

    private void Save()
    {
        try
        {
            string str = base.Request["resId"].DoTrim(new char[0]);
            if (string.IsNullOrWhiteSpace(str))
            {
                this.ajaxResult.msg = "商店编号无效";
            }
            else
            {
                int resId = int.Parse(str);
                ReturnValue<CRestaurantDTO> restaurantById = WCFClient.CoffeeService.GetRestaurantById(resId);
                if (restaurantById.Code != 200)
                {
                    this.ajaxResult.msg = string.Format("获取商店发生错误 详细信息:{0}", restaurantById.Message);
                    WCFClient.LoggerService.Error(string.Format("获取商店发生错误 详细信息:{0}", restaurantById.RawMessage));
                }
                else if (restaurantById.Value == null)
                {
                    this.ajaxResult.msg = string.Format("此商店不存在 ID:{0}", resId);
                    WCFClient.LoggerService.Error(string.Format("此商店不存在 ID:{0}", resId));
                }
                else
                {
                    int id = int.Parse(base.Request["couponId"]);
                    if (id > 0)
                    {
                        ReturnValue<CCouponDTO> couponById = WCFClient.CoffeeService.GetCouponById(id);
                        if (couponById.Code != 200)
                        {
                            WCFClient.LoggerService.Info(string.Format("获取优惠卷发生错误 详细信息:{0}", couponById.RawMessage));
                            this.ajaxResult.msg = string.Format("获取优惠卷发生错误 详细信息:{0}", couponById.Message);
                            return;
                        }
                        if (couponById.Value == null)
                        {
                            WCFClient.LoggerService.Info(string.Format("此优惠卷不存在 ID:{0}", id));
                            this.ajaxResult.msg = string.Format("此优惠卷不存在", new object[0]);
                            return;
                        }
                    }
                    if (string.IsNullOrWhiteSpace(base.Request["couponName"]))
                    {
                        this.ajaxResult.msg = string.Format("优惠卷名称必填", new object[0]);
                    }
                    else
                    {
                        int num3 = 0;
                        if (!string.IsNullOrWhiteSpace(base.Request["preferentialType"]))
                        {
                            try
                            {
                                num3 = int.Parse(base.Request["preferentialType"]);
                            }
                            catch (Exception)
                            {
                                this.ajaxResult.msg = string.Format("优惠方式格式不正确，必须是数字", new object[0]);
                                return;
                            }
                        }
                        decimal num4 = 0M;
                        if (!string.IsNullOrWhiteSpace(base.Request["preferential"]))
                        {
                            try
                            {
                                num4 = decimal.Parse(base.Request["preferential"]);
                            }
                            catch (Exception)
                            {
                                this.ajaxResult.msg = string.Format("优惠额度格式不正确，必须是数字", new object[0]);
                                return;
                            }
                        }
                        decimal num5 = 0M;
                        if (!string.IsNullOrWhiteSpace(base.Request["offerAmount"]))
                        {
                            try
                            {
                                num5 = decimal.Parse(base.Request["offerAmount"]);
                            }
                            catch (Exception)
                            {
                                this.ajaxResult.msg = string.Format("满额额度格式不正确，必须是数字", new object[0]);
                                return;
                            }
                        }
                        if ((int.Parse(base.Request["couponType"]) == 3) && (num5 <= 0M))
                        {
                            this.ajaxResult.msg = string.Format("满额优惠时,必须设置满额额度", new object[0]);
                        }
                        else if (num4 < 0M)
                        {
                            this.ajaxResult.msg = string.Format("优惠额度不能小于0", new object[0]);
                        }
                        else if ((num3 == 2) && (num4 > 10M))
                        {
                            this.ajaxResult.msg = string.Format("优惠方式是折扣的情况时，优惠百分比不能大于10", new object[0]);
                        }
                        else
                        {
                            DateTime? nullable = null;
                            if (!string.IsNullOrWhiteSpace(base.Request["effectiveEndTime"]))
                            {
                                try
                                {
                                    nullable = new DateTime?(DateTime.Parse(base.Request["effectiveEndTime"]));
                                }
                                catch (Exception)
                                {
                                    this.ajaxResult.msg = string.Format("结束时间格式不正确，必须是日期", new object[0]);
                                    return;
                                }
                            }
                            DateTime? nullable2 = null;
                            if (!string.IsNullOrWhiteSpace(base.Request["effectiveStartTime"]))
                            {
                                try
                                {
                                    nullable2 = new DateTime?(DateTime.Parse(base.Request["effectiveStartTime"]));
                                }
                                catch (Exception)
                                {
                                    this.ajaxResult.msg = string.Format("开始时间格式不正确，必须是日期", new object[0]);
                                    return;
                                }
                            }
                            if (nullable.HasValue && nullable2.HasValue)
                            {
                                DateTime? nullable3 = nullable;
                                DateTime? nullable4 = nullable2;
                                if ((nullable3.HasValue & nullable4.HasValue) ? (nullable3.GetValueOrDefault() <= nullable4.GetValueOrDefault()) : false)
                                {
                                    this.ajaxResult.msg = string.Format("结束时间必须大于开始时间", new object[0]);
                                    return;
                                }
                            }
                            AddOrUpdateCouponDTO ndto2 = new AddOrUpdateCouponDTO {
                                Id = id,
                                IsDelete = false,
                                ResId = resId,
                                Remark = base.Request["remark"],
                                State = (base.Request["state"] == null) ? 2 : 1,
                                CouponName = base.Request["couponName"],
                                CouponType = int.Parse(base.Request["couponType"]),
                                EffectiveEndTime = nullable,
                                EffectiveStartTime = nullable2,
                                OfferAmount = num5,
                                Preferential = new decimal?(num4),
                                PreferentialType = num3
                            };
                            AddOrUpdateCouponDTO coupon = ndto2;
                            ReturnValue<int> value4 = WCFClient.CoffeeService.AddOrUpdateCoupon(coupon, base.Manager.Name);
                            if (value4.Code == 200)
                            {
                                this.ajaxResult.succ = true;
                                this.ajaxResult.msg = "操作成功";
                                this.ajaxResult.url = CoffeePage.VirtulName + "/CouponManager.aspx?resId=" + resId;
                            }
                            else
                            {
                                WCFClient.LoggerService.Error(value4.RawMessage);
                                this.ajaxResult.succ = false;
                                this.ajaxResult.msg = value4.Message;
                            }
                        }
                    }
                }
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


 
