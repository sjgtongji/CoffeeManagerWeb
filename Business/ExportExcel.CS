using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;

namespace Business
{
    public class ExportExcel
    {
        private static MemoryStream RenderToExcel(DataTable table)
        {
            if (table == null)
            {
                return null;
            }

            MemoryStream ms = new MemoryStream();

            using (table)
            {
                IWorkbook workbook = new HSSFWorkbook();
                ISheet sheet = workbook.CreateSheet();
                IRow headerRow = sheet.CreateRow(0);
                int cellCount = table.Columns.Count;

                // handling header.
                foreach (DataColumn column in table.Columns)
                    headerRow.CreateCell(column.Ordinal).SetCellValue(column.Caption);

                int rowIndex = 1;
                foreach (DataRow row in table.Rows)
                {
                    if (row != null)
                    {
                        IRow dataRow = sheet.CreateRow(rowIndex);

                        foreach (DataColumn column in table.Columns)
                        {
                            dataRow.CreateCell(column.Ordinal).SetCellValue(row[column].ToString());
                        }

                        rowIndex++;
                    }
                }

                workbook.Write(ms);

                ms.Flush();
                ms.Position = 0;
            }
            return ms;
        }

        public static void RenderToBrowser(HttpContext context, DataTable table, string fileName)
        {
            MemoryStream ms = RenderToExcel(table);
            if (ms == null)
            {
                context.Response.End();
                return;
            }

            //fileName = HttpUtility.UrlEncode(fileName);

            // 设置编码和附件格式
            context.Response.ContentType = "application/vnd.ms-excel";
            context.Response.ContentEncoding = System.Text.Encoding.UTF8;
            context.Response.Charset = "";
            context.Response.AppendHeader("Content-Disposition",
                "attachment;filename=" + HttpUtility.UrlEncode(fileName, System.Text.Encoding.UTF8));

            context.Response.BinaryWrite(ms.GetBuffer());
            context.Response.End();
        }

        /// <summary>
        /// 返回Office2007的Excel表格到浏览器客户端。
        /// 由于Office2003的最大行数为65536行，所以导出大型数据时需要使用Office2007Excel类型。
        /// </summary>
        public static void XRenderToBrowser(HttpContext context, DataTable table, string fileName)
        {
            var data = XRenderToExcel(table);
            if (data == null || data.Length == 0)
            {
                context.Response.End();
                return;
            }

            fileName = HttpUtility.UrlEncode(fileName);

            // 设置编码和附件格式
            context.Response.ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            context.Response.ContentEncoding = System.Text.Encoding.UTF8;
            context.Response.Charset = "";
            context.Response.AppendHeader("Content-Disposition", "attachment;filename=" + fileName);
            //HttpUtility.UrlEncode(fileName, System.Text.Encoding.UTF8));
            context.Response.BinaryWrite(data);
            context.Response.End();
        }


        public static byte[] XRenderToExcel(DataTable table)
        {
            if (table == null)
            {
                return null;
            }

            var xssfworkbook = new XSSFWorkbook();
            ISheet sheet = xssfworkbook.CreateSheet();

            //表头
            IRow row = sheet.CreateRow(0);
            for (int i = 0; i < table.Columns.Count; i++)
            {
                ICell cell = row.CreateCell(i);
                cell.SetCellValue(table.Columns[i].ColumnName);
            }

            //数据
            for (int i = 0; i < table.Rows.Count; i++)
            {
                IRow row1 = sheet.CreateRow(i + 1);
                for (int j = 0; j < table.Columns.Count; j++)
                {
                    var cell = row1.CreateCell(j);
                    var cellValue = table.Rows[i][j].ToString();
                    if (table.Columns[j].DataType == typeof(decimal))
                    {
                        cell = row1.CreateCell(j, CellType.Numeric);
                        cell.SetCellValue(double.Parse(cellValue));
                    }
                    else
                    {
                        cell.SetCellValue(cellValue);
                    }

                    if (cellValue.Contains("\n"))
                    {
                        var cellStyle = cell.CellStyle ?? xssfworkbook.CreateCellStyle();
                        cellStyle.WrapText = true;
                        cell.CellStyle = cellStyle;
                    }
                }
            }

            using (var ms = new MemoryStream())
            {
                xssfworkbook.Write(ms);
                return ms.ToArray();
            }
        }

        public static void RenderToTXT(HttpContext context, DataTable table, string fileName)
        {
            context.Response.Clear();
            context.Response.Buffer = false;
            context.Response.ContentType = "application/txt";
            context.Response.ContentEncoding = System.Text.Encoding.Default;
            context.Response.AppendHeader("content-disposition", "attachment;filename=" + fileName);

            string str = string.Empty;

            foreach (DataColumn column in table.Columns)
                str+=column.Caption.ToString()+"\t";

            context.Response.Write(str + "\r\n");

            // 读取数据库，循环
            foreach (DataRow row in table.Rows)
            {
                str = string.Empty;
                if (row != null)
                {                    
                    foreach (DataColumn column in table.Columns)
                    {
                        str += row[column].ToString() + "\t";                        
                    }
                    context.Response.Write(str + "\r\n");
                }
                
            }
            context.Response.Flush();
            context.Response.End();
        }
    }
}
