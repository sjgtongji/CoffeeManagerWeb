

var eleDelPic1 = function(){
	swfUploadFun1();
	if(!$("#delPic1")){
		return;
	}
	// 删除图片
	$("#uploadPic1").delegate("#delPic1","click", function() {
		$("#uploadPic1").html("");
		$("#uploadSwfWrap1").show();
	})
    
};

var swfu1, swfUrl1;
// 上传图片
var swfUploadFun1 = function () {
    var fileQueued = function (file) {
        $("#progressBar1").html("准备上传");
    },
	fileQueueError = function (file, errorCode, message) {
	    switch (errorCode) {
	        case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
	            alert("您最多一次性上传" + settings_object.file_queue_limit + "张照片。");
	            break;
	        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
	            alert("您上传的图片" + file.name + "大小不能超过" + Math.floor(parseInt(settings_object.file_size_limit) / 1024) + "M.");
	            break;
	        case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
	            alert("您上传了空文件。");
	            break;
	        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
	            alert("文件类型不支持。");
	            break;
	        default:
	            alert("抱歉，出现未知错误。");
	            break;
	    }
	    return this;
	},
	fileDialogComplete = function () {
	    this.startUpload(); //开始上传
	},
	uploadComplete = function () {
	    // 这里是上传完毕的事件，无论是否成功，都是上传完毕
	},
	uploadStart = function () {
	    $("#progressBar1").html("开始上传");
	},
	uploadProgress = function (file, curBytes, totalBytes) {
	    $("#progressBar1").html([
		"文件名:", file.name + "<br />",
		"总尺寸:", totalBytes + "B" + "<br />",
		"已上传:", curBytes + "B" + "<br />",
		"进度:", parseInt((curBytes / totalBytes) * 100), '%'
		].join(" "));
	},
	uploadSuccess = function (file, serverData) {
	    var json = eval('(' + serverData + ')');
	    $("#progressBar1").html("图片：" + file.name + "上传成功!");
	    var newImgHtml = "<img src='" + json.imagesrc + "' " +
						"id='uploadPicImg1' " +
						"alt=''" +
						"width='64' height='64'>" +
						"<a href='javascript:'" +
						"id='delPic1'" +
						"class='f12 fs g6 db pt2'>更改图片</a>";
	    $("#uploadPic1").html(newImgHtml);
	    $("#uploadSwfWrap1").hide();
	    alert(json.imagesrc);
	    $("#uppicImg1").val(json.imagesrc);
	    // 删除图片
	    if ($("#delPic1")) {
	        //$("#delPic").bind("click", function() {
	        $("#uploadPic1").delegate("#delPic1", "click", function () {
	            $("#uploadPic1").html("")
	            $("#uploadSwfWrap1").show();
	        })
	    };
	},
	settings_object1 = {
	    upload_url: $("#uploadSwfWrap1").attr("data-url"),
	    flash_url: swfUrl,
	    file_size_limit: "10240",
	    file_types: "*.jpg;*.jpeg;*.png;*.bmp;*.gif",
	    file_types_description: "照片文件",
	    file_post_name: "UpgratePicUrl",
	    file_upload_limit: 1,
	    file_queue_limit: 1,

	    //debug:true,   debug 模式

	    button_placeholder_id: "uploadSwf1",
	    button_width: 66,
	    button_height: 67,
	    button_text: "<b>点击上传</b>",
	    button_text_left_padding: 5,
	    button_text_top_padding: 20,
	    button_cursor: SWFUpload.CURSOR.HAND,

	    //handler
	    file_queued_handler: fileQueued,
	    file_queue_error_handler: fileQueueError,
	    file_dialog_complete_handler: fileDialogComplete,
	    upload_complete_handler: uploadComplete,
	    upload_start_handler: uploadStart,
	    upload_progress_handler: uploadProgress,
	    upload_success_handler: uploadSuccess
	};


    swfu1 = new SWFUpload(settings_object1);


}


