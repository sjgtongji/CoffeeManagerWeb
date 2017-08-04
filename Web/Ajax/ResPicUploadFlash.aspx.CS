using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;

public partial class Ajax_ResPicUploadFlash : System.Web.UI.Page
{
    protected int dishId = 0;
    protected string imagePath = string.Empty;
    protected bool isSucc = false;
    protected string MSG = string.Empty;
    protected int nWidth = 0;
    protected int nHeight = 0;

    protected void Page_Load(object sender, EventArgs e)
    {
        imagePath = this.UploadResLogo();
    }

    private string UploadResLogo()
    {
        try
        {
            string logoPath = string.Empty;

            HttpPostedFile uploadFile = HttpContext.Current.Request.Files["uploadPic"];
            if (uploadFile != null && uploadFile.ContentLength > 0)
            {
                byte[] imageBytes = new byte[uploadFile.ContentLength];
                uploadFile.InputStream.Read(imageBytes, 0, uploadFile.ContentLength);
                string sFileName = System.IO.Path.GetFileName(uploadFile.FileName);
                string sExt = System.IO.Path.GetExtension(sFileName).ToLower();
                if (sExt != ".jpg" && sExt != ".gif" && sExt != ".png" && sExt != "bmp")
                {
                    // 前台JS已做限定，此处不再处理；
                    //isSucc = false;
                    //MSG = "请选择正确的图片格式！";
                }

                //var pic = this.UploadResLogo(imageBytes, Guid.NewGuid().ToString() + sFileName, sExt);

                //if (pic != null)
                //{
                //    isSucc = true;
                //    logoPath = XMS.Core.Web.ResourceHelper.GetUploadPicPath(pic.Path, "small");
                //    nWidth = pic.Width;
                //    nHeight = pic.Height;
                //}
                //else
                //{
                //    isSucc = false;
                //    MSG = "图片上传失败！";

                //    return null;
                //}
            }

            return logoPath;
        }
        catch (Exception err)
        {
            WCFClient.LoggerService.Error("图片上传出错：" + err.Message);
            isSucc = false;
            MSG = "图片上传失败！";

            return null;
        }
    }

    //private XMS.Portal.File.Model.PhotoResult UploadResLogo(Byte[] uploadFile, string fileName, string sExtension)
    //{
    //    if (uploadFile == null || uploadFile.Length <= 0)
    //    {
    //        isSucc = false;
    //        MSG = "图片解析出错!";

    //        return null;
    //    }

    //    string filePath = DateTime.Now.ToString("yyyy") + "\\" + DateTime.Now.ToString("MMdd") + "\\";

    //    var result = WCFClient.FileUploadService.UploadPic(uploadFile, filePath + fileName + sExtension, AppSettingHelper.DeliveryPicRootKey, true);

    //    return result.Value;
    //}
}