using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;

public partial class Ajax_CoordinateAjax : ManagerBasePage
{
    protected string act = string.Empty;
    private AjaxResultNew ajaxResult = new AjaxResultNew();

    protected void Page_Load(object sender, EventArgs e)
    {
        ajaxResult.Status = 1;
        this.act = base.Request["act"].DoTrim(new char[0]).ToLower();
        string str = this.act.ToLower();

        switch (act)
        {
            case "addcoordinate":
                AddCoordinateAjax();
                break;
            case "curpoly":
                CurPoly();
                break;
            case "curshopposition":
                CurShopPosition();
                break;
            default:
                break;
        }

        base.Response.Write(XMS.Core.Json.JsonSerializer.Serialize(this.ajaxResult));
        base.Response.End();
    }

    /// <summary>
    /// 获取餐厅坐标
    /// </summary>
    protected void CurShopPosition()
    {
        if (string.IsNullOrWhiteSpace(Request["resId"]))
        {
            ajaxResult.Message = "resId参数为空";
            return;
        }

        XMS.Core.ReturnValue<CRestaurantDTO> result1 = WCFClient.CoffeeService.GetRestaurantById(int.Parse(Request["resId"]));
        if (result1.Code != 200 || result1.Value == null)
        {
            ajaxResult.Message = "获取餐厅错误";
            return;
        }

        CurShopPosition curShopPosition = new global::CurShopPosition()
        {
            lat = result1.Value.longitude.Value,
            lng = result1.Value.latitude.Value
        };

        ajaxResult.Status = 0;
        ajaxResult.Message = "提交成功";
        ajaxResult.Data = curShopPosition;
    }

    /// <summary>
    /// 获取餐厅设置的配送范围
    /// </summary>
    protected void CurPoly()
    {
        if (string.IsNullOrWhiteSpace(Request["resId"]))
        {
            ajaxResult.Message = "resId参数为空";
            return;
        }

        XMS.Core.ReturnValue<CRestaurantDTO> result1 = WCFClient.CoffeeService.GetRestaurantById(int.Parse(Request["resId"]));
        if (result1.Code != 200 || result1.Value == null)
        {
            ajaxResult.Message = "获取餐厅错误";
            return;
        }

        AddCoordinate addResCoordinate1 = new AddCoordinate()
        {
            ResId = result1.Value.id
        };
        ajaxResult.Data = addResCoordinate1;

        XMS.Core.ReturnValue<CResCoordinatePO[]> result = WCFClient.CoffeeService.GetCResCoordinateList(null, result1.Value.resUUID, null, null, null);
        if (result.Code != 200)
        {
            WCFClient.LoggerService.Info(string.Format("获取商店坐标错误发生错误 详细信息:{0}", result.RawMessage));
            ajaxResult.Message = "未设置配送范围";
            return;
        }

        List<CoordinateInfo> listCoordinateInfo = new List<CoordinateInfo>();
        if (result.Value == null || result.Value.Length == 0)
            return;

        foreach (var item in result.Value)
        {
            CoordinateInfo coordinateInfo = new CoordinateInfo()
            {
                Latitude = item.Latitude,
                Longitude = item.Longitude
            };
            listCoordinateInfo.Add(coordinateInfo);
        }

        addResCoordinate1.Coordinate = listCoordinateInfo;

        ajaxResult.Status = 0;
        ajaxResult.Message = "提交成功";
        ajaxResult.Data = addResCoordinate1;
    }


    protected void AddCoordinateAjax()
    {
        if (string.IsNullOrWhiteSpace(Request["CoordinateInfo"]))
        {
            ajaxResult.Message = "参数为空";
            return;
        }

        if (string.IsNullOrWhiteSpace(Request["resId"]))
        {
            ajaxResult.Message = "resId参数为空";
            return;
        }

        int resId = int.Parse(Request["resId"]);

        AddCoordinate addCoordinate = XMS.Core.Json.JsonSerializer.Deserialize<AddCoordinate>(Request["CoordinateInfo"]);

        AddResCoordinateDTO addResCoordinate1 = new AddResCoordinateDTO() {
            resId = resId
        };
        List<XMS.Inner.Coffee.Service.Model.CoordinateInfo> listCoordinateInfo = new List<XMS.Inner.Coffee.Service.Model.CoordinateInfo>();

        if(addCoordinate.Coordinate != null)
        {
            foreach (var item in addCoordinate.Coordinate)
            {
                listCoordinateInfo.Add(new XMS.Inner.Coffee.Service.Model.CoordinateInfo { Latitude = item.Latitude, Longitude = item.Longitude });
            }
        }
        addResCoordinate1.listCoordinateInfo = listCoordinateInfo.ToArray();
        XMS.Core.ReturnValue<bool> result = WCFClient.CoffeeService.AddResCoordinate(addResCoordinate1, Manager.Name);
        if (result.Code != 200)
        {
            ajaxResult.Message = result.Message;
            WCFClient.LoggerService.Error(result.RawMessage);
            return;
        }

        ajaxResult.Status = 0;
        ajaxResult.Message = "提交成功";
        ajaxResult.Data = true;
    }
}

[Serializable]
public class CurShopPosition
{
    public decimal lng { get; set; }
    public decimal lat { get; set; }
}


[Serializable]
public class AddCoordinate
{
    public int ResId { get; set; }

    public List<CoordinateInfo> Coordinate = new List<CoordinateInfo>();

}

/// <summary>
/// 
/// </summary>
[Serializable]
public class CoordinateInfo
{
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
}

public class AjaxResultNew
{
    public int Status { get; set; }
    public string Message { get; set; }
    public object Data { get; set; }
}