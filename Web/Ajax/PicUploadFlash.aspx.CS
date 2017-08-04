using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Business;
using XMS.Core;
using XMS.Inner.Coffee.Service.Model;
using System.IO;
using System.Web.Profile;

public partial class Ajax_PicUploadFlash : Page
{
    // Fields
    protected int dishId;
    protected int h;
    protected string imagePath = string.Empty;
    protected bool isSucc;
    protected string MSG = string.Empty;
    protected string source = string.Empty;
    protected int w;

    // Methods
    protected void Page_Load(object sender, EventArgs e)
    {
        this.imagePath = this.UploadResFoodLogo();
    }

    private string UploadResFoodLogo()
    {
        try
        {
            string path = string.Empty;
            HttpPostedFile file = HttpContext.Current.Request.Files["uploadPic"];
            if ((file != null) && (file.ContentLength > 0))
            {
                byte[] buffer = new byte[file.ContentLength];
                file.InputStream.Read(buffer, 0, file.ContentLength);
                string fileName = Path.GetFileName(file.FileName);
                string sExtension = Path.GetExtension(fileName).ToLower();
                if (((sExtension != ".jpg") && (sExtension != ".gif")) && (sExtension != ".png"))
                {
                    bool flag1 = sExtension != "bmp";
                }
                PhotoResult result = this.UploadResFoodLogo(buffer, Guid.NewGuid().ToString() + fileName, sExtension);
                if (result == null)
                {
                    this.isSucc = false;
                    this.MSG = "图片上传失败！";
                    return null;
                }
                this.isSucc = true;
                path = result.Path;
            }
            return path;
        }
        catch (Exception exception)
        {
            WCFClient.LoggerService.Error("图片上传出错：" + exception.Message);
            this.isSucc = false;
            this.MSG = "图片上传失败！";
            return null;
        }
    }

    private PhotoResult UploadResFoodLogo(byte[] uploadFile, string fileName, string sExtension)
    {
        if ((uploadFile != null) && (uploadFile.Length > 0))
        {
            return WCFClient.CoffeeService.UploadPic(uploadFile, fileName + sExtension, true).Value;
        }
        this.isSucc = false;
        this.MSG = "图片解析出错!";
        return null;
    }
}


