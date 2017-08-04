using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Business
{
    public class ToExcel
    {
        //public static void BillsToExcel(XMS.Portal.FreeOrderManage.Model.Bill[] bills)
        //{
        //    if (bills != null && bills.Length > 0)
        //    {
        //        System.Reflection.Missing miss = System.Reflection.Missing.Value;
        //        Microsoft.Office.Interop.Excel.ApplicationClass excel = new Microsoft.Office.Interop.Excel.ApplicationClass();
        //        try
        //        {
        //            excel.Application.Workbooks.Add(true); ;
        //            excel.Visible = false;//若是true，则在导出的时候会显示EXcel界面。
        //            if (excel == null)
        //            {
        //                throw new Exception("EXCEL无法启动！");
        //            }
        //            Microsoft.Office.Interop.Excel.Workbooks books = (Microsoft.Office.Interop.Excel.Workbooks)excel.Workbooks;
        //            Microsoft.Office.Interop.Excel.Workbook book = (Microsoft.Office.Interop.Excel.Workbook)(books.Add(miss));
        //            Microsoft.Office.Interop.Excel.Worksheet sheet = (Microsoft.Office.Interop.Excel.Worksheet)book.ActiveSheet;

        //            sheet.Name = "免单宝账单";

        //            excel.Cells[1, 1] = "账单 ID";
        //            excel.Cells[1, 2] = "餐厅 ID";
        //            excel.Cells[1, 3] = "餐厅名称";
        //            excel.Cells[1, 4] = "账单编号";
        //            excel.Cells[1, 5] = "请款金额";
        //            excel.Cells[1, 6] = "开卡银行";
        //            excel.Cells[1, 7] = "开卡人";
        //            excel.Cells[1, 8] = "银行卡号";
        //            excel.Cells[1, 9] = "请款时间";
        //            excel.Cells[1, 10] = "账单状态";
        //            excel.Cells[1, 11] = "失败原因";
        //            excel.Cells.NumberFormatLocal = "@";
        //            for (int i = 0; i < bills.Length; i++)
        //            {
        //                excel.Cells[i + 2, 1] = bills[i].Id;
        //                excel.Cells[i + 2, 2] = bills[i].ResId;
        //                excel.Cells[i + 2, 3] = bills[i].ResName;
        //                excel.Cells[i + 2, 4] = bills[i].BillNo;
        //                excel.Cells[i + 2, 5] = bills[i].BillAmount;
        //                var result = WCFClient.FreeOrderManageService.GetFreeResById(bills[i].ResId);
        //                if (result.Code != 200)
        //                {
        //                    throw new Exception("获取餐厅失败");
        //                }
        //                XMS.Portal.FreeOrderManage.Model.FreeRestaurant objRes = result.Value;
        //                excel.Cells[i + 2, 6] = objRes.BankCardName;
        //                excel.Cells[i + 2, 7] = objRes.PayeeName;
        //                excel.Cells[i + 2, 8] = objRes.BankCardNo;
        //                excel.Cells[i + 2, 9] = bills[i].CreateTime;
        //                excel.Cells[i + 2, 10] = GetBillState(bills[i].Status);
        //                excel.Cells[i + 2, 11] = bills[i].Remark;
        //            }
        //            sheet.SaveAs("D:\\免单宝账单\\免单宝账单-" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xlsx", miss, miss, miss, miss, miss, Microsoft.Office.Interop.Excel.XlSaveAsAccessMode.xlNoChange, miss, miss, miss);
        //            book.Close(false, miss, miss);
        //            books.Close();
        //            excel.Quit();
        //            System.Runtime.InteropServices.Marshal.ReleaseComObject(sheet);
        //            System.Runtime.InteropServices.Marshal.ReleaseComObject(book);
        //            System.Runtime.InteropServices.Marshal.ReleaseComObject(books);
        //            System.Runtime.InteropServices.Marshal.ReleaseComObject(excel);
        //        }
        //        catch (Exception ex)
        //        {
        //            throw new Exception(ex.Message);
        //        }
        //        finally
        //        {
        //            excel.Quit();
        //            excel = null;
        //        }
        //    }
        //}

        //private static string GetBillState(int state)
        //{
        //    string result = "-";
        //    switch (state)
        //    {
        //        case 0:
        //            result = "等待商家确认";
        //            break;
        //        case 1:
        //            result = "等待付款";
        //            break;
        //        case 2:
        //            result = "付款中";
        //            break;
        //        case 3:
        //            result = "付款成功";
        //            break;
        //        case 4:
        //            result = "付款失败";
        //            break;

        //    }


        //    return result;
        //}
        
    }
}
