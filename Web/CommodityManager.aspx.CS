using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Inner.Coffee.Service.Model;
using XMS.Core;

public partial class CommodityManager : ManagerBasePage
{
    // Fields
    protected string commodityCategory = "-1";
    protected string commodityName = string.Empty;
    protected List<CCommodityDTO> listCCommodityDTO = new List<CCommodityDTO>();
    protected List<CCommodityCategoryDTO> listCommodityCategoryInfo = new List<CCommodityCategoryDTO>();
    protected int onlineState = -1;
    protected int pageIndex = 1;
    protected int pageSize = 20;
    protected int resId;
    protected string resName = string.Empty;
    protected long totalCount;

    // Methods
    protected string GetCommodityCategoryName(string commodityCategoryUUID)
    {
        if (string.IsNullOrWhiteSpace(commodityCategoryUUID))
        {
            return string.Empty;
        }
        if ((this.listCommodityCategoryInfo == null) || (this.listCommodityCategoryInfo.Count == 0))
        {
            return string.Empty;
        }
        CCommodityCategoryDTO ydto = this.listCommodityCategoryInfo.FirstOrDefault<CCommodityCategoryDTO>(x => x.commodityCategoryUUID == commodityCategoryUUID);
        if (ydto == null)
        {
            return string.Empty;
        }
        return ydto.chineseName;
    }

    private void intiData()
    {
        this.commodityName = base.Request["commodityName"];
        this.pageIndex = base.Request["pageIndex"].DoTrim(new char[0]).ConvertToInt32(1);
        if (!string.IsNullOrWhiteSpace(base.Request["resId"]))
        {
            this.resId = int.Parse(base.Request["resId"]);
        }
        this.onlineState = base.Request["onlineState"].DoTrim(new char[0]).ConvertToInt32(-1);
        this.commodityCategory = base.Request["commodityCategory"];
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        this.intiData();
        if (this.resId <= 0)
        {
            this.resName = "请选择商店";
        }
        else
        {
            ReturnValue<CRestaurantDTO> restaurantById = WCFClient.CoffeeService.GetRestaurantById(this.resId);
            if (restaurantById.Code != 200)
            {
                WCFClient.LoggerService.Error(string.Format("获取商店错误 详细信息:{0}", restaurantById.RawMessage));
            }
            else if (restaurantById.Value == null)
            {
                this.resName = "商店不存在";
            }
            else
            {
                ReturnValue<CCommodityCategoryDTO[]> commodityCategoryDtos = WCFClient.CoffeeService.GetCommodityCategoryDtos(restaurantById.Value.resUUID);
                if (commodityCategoryDtos.Code != 200)
                {
                    WCFClient.LoggerService.Error(string.Format("获取商品类别错误 详细信息:{0}", commodityCategoryDtos.RawMessage));
                }
                else
                {
                    if ((commodityCategoryDtos.Value != null) || (commodityCategoryDtos.Value.Length > 0))
                    {
                        this.listCommodityCategoryInfo.AddRange(commodityCategoryDtos.Value);
                    }
                    this.resName = restaurantById.Value.name;
                    int[] states = null;
                    if (this.onlineState == -1)
                    {
                        states = null;
                    }
                    else if (this.onlineState == 1)
                    {
                        states = new int[] { 1 };
                    }
                    else
                    {
                        int[] numArray3 = new int[2];
                        numArray3[1] = 2;
                        states = numArray3;
                    }
                    List<string> list = new List<string>();
                    if (!string.IsNullOrWhiteSpace(this.commodityCategory) && (this.commodityCategory != "-1"))
                    {
                        list.Add(this.commodityCategory);
                    }
                    ReturnValue<QueryResultCCommodityDTO> value4 = WCFClient.CoffeeService.GetCCommodityDTOs(null, restaurantById.Value.resUUID, null, list.ToArray(), states, ((this.pageIndex - 1) * this.pageSize) + 1, this.pageSize, !string.IsNullOrWhiteSpace(this.commodityName) ? this.commodityName.Trim() : null);
                    if ((value4.Code != 200) || (value4.Value == null))
                    {
                        Container.LogService.Info(string.Format("获取商品列表错误 详细信息：{0}", value4.RawMessage));
                    }
                    else
                    {
                        this.totalCount = value4.Value.TotalCount;
                        if ((value4.Value.Items != null) && (value4.Value.Items.Length != 0))
                        {
                            this.listCCommodityDTO.AddRange(value4.Value.Items);
                        }
                    }
                }
            }
        }
    }
}

 

 
