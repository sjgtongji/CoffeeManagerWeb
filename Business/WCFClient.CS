using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Business
{
    public class WCFClient
    {
        #region WCF
        public static XMS.Core.Logging.ILogService LoggerService
        {
            get
            {
                return XMS.Core.Container.Instance.Resolve<XMS.Core.Logging.ILogService>();
            }
        }

        /// <summary>
        /// Coffee服务
        /// </summary>
        public static XMS.Inner.Coffee.Service.ICoffeeService CoffeeService
        {
            get
            {
                return XMS.Core.Container.Instance.Resolve<XMS.Inner.Coffee.Service.ICoffeeService>();
            }
        }
        #endregion
    }
}
