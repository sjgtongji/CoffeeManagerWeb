using System.Collections;
using System.Data;

/************************************************************************************/
/*                                Code By ZuoZhiwen                                 */
/*                                    2015/07/22                                    */
/************************************************************************************/
namespace System.Linq
{
    public static class LINQExtension
    {
        public static DataTable LinQToDataTable(this IQueryable query)
        {
            IEnumerator emumator = null;
            try
            {
                emumator = query.GetEnumerator();

            }
            catch (Exception)
            {
                //发生错误，返回空
                return null;
            }

            //结果集为空，返回空
            if (!emumator.MoveNext())
            {
                return null;
            }

            var props = emumator.Current.GetType().GetProperties();
            DataTable dt = new DataTable();
            //初始化表头
            foreach (var item in props)
            {

                if ((item.PropertyType.IsGenericType) && (item.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>)))
                {
                    dt.Columns.Add(item.Name, item.PropertyType.GetGenericArguments()[0]);
                }
                else
                {
                    dt.Columns.Add(item.Name, item.PropertyType);
                }
            }
            

            //填充数据
            foreach (var item in query)
            {
                var row = dt.NewRow();
                foreach (var p in props)
                {
                    //根据属性名称获取相应的值填充至DataRow
                    row[p.Name] = p.GetValue(item, null) ?? DBNull.Value;
                }
                dt.Rows.Add(row);
            }

            dt.AcceptChanges();
            return dt;
        }

        public static DataTable LinQToDataTable(this IEnumerable query)
        {
            return LINQExtension.LinQToDataTable(query.AsQueryable());
        }

        public static void LinQToDataTable(this IEnumerable query, DataTable dt)
        {
            IEnumerator emumator = null;
            try
            {
                emumator = query.GetEnumerator();

            }
            catch (Exception)
            {
                //发生错误，返回空
                return;
            }

            //结果集为空，返回空
            if (!emumator.MoveNext())
            {
                return;
            }
            var props = emumator.Current.GetType().GetProperties();

            //填充
            foreach (var item in query)
            {
                try
                {
                    var row = dt.NewRow();
                    foreach (var p in props)
                    {
                        row.SetField(p.Name, p.GetValue(item, null));
                    }
                    dt.Rows.Add(row);
                }
                catch (Exception)
                {
                    //如果当条记录与原数据表格式不匹配，则忽略当条记录
                    continue;
                }
            }
        }

    }
}
