<%@ page language="C#" autoeventwireup="true" inherits="Login, App_Web_login.aspx.cdcab7d2" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head id="Head1" runat="server">
    <meta charset="utf-8" />
	<title>登录——BuzztimeCoffee运营后台</title>

	<meta name="description" content="User login page" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="assets/css/bootstrap.min.css" rel="stylesheet" />
	<link rel="stylesheet" href="assets/css/font-awesome.min.css" />

    <%--<link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:400,300" />--%>
    <link rel="stylesheet" href="assets/css/ace.min.css" />
	<link rel="stylesheet" href="assets/css/ace-rtl.min.css" />
</head>
<body class="login-layout">
    <div class="main-container">
			<div class="main-content">
				<div class="row">
					<div class="col-sm-10 col-sm-offset-1">
						<div class="login-container">
							<div class="center">
								<h1>
									<img class="nav-user-photo" src="assets/images/logo.jpg" alt="BuzztimeCoffee运营后台" width="49px" heigh="40px" />
									<span class="red">Buzztime</span>
									<span class="white">运营后台</span>
								</h1>
								<h4 class="blue">&copy; 创业信息技术（上海）有限公司</h4>
							</div>

							<div class="space-6"></div>

							<div class="position-relative">
								<div id="login-box" class="login-box visible widget-box no-border">
									<div class="widget-body">
										<div class="widget-main">
											<h4 class="header blue lighter bigger">
												<i class="icon-coffee green"></i>
											</h4>

											<div class="space-6"></div>

											<form id="loginForm" action="" method="post" class="noCallForm" data-ajax="true">
												<fieldset>
													<label class="block clearfix">
														<span class="block input-icon input-icon-right">
															<input type="text" class="form-control" id="uName" name="uName" placeholder="账号" />
															<i class="icon-user"></i>
														</span>
													</label>
													<label class="block clearfix">
														<span class="block input-icon input-icon-right">
															<input type="password" class="form-control" id="uPassword" name="uPassword" placeholder="密码" />
															<i class="icon-lock"></i>
														</span>
													</label>
													

													<div class="space"></div>

													<div class="clearfix">
														<label class="inline">
															<input type="checkbox" class="ace" id="rememberToken" name="rememberToken" value="1"/>
															<span class="lbl">记住，一周内无需登录</span>
														</label>

														<button type="button" id="loginId" class="width-35 pull-right btn btn-sm btn-primary">
															<i class="icon-key"></i>
															登录
														</button>
													</div>

													<div class="space-4"></div>
												</fieldset>
											</form>											
										</div>
										<div class="toolbar clearfix">								

										</div>
									</div>
								</div>								
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

 <script type="text/javascript">
     window.jQuery || document.write("<script src='assets/js/jquery.min.js'>" + "<" + "/script>");
	</script>

    <script type="text/javascript">
        if ("ontouchend" in document) document.write("<script src='assets/js/jquery.mobile.custom.min.js'>" + "<" + "/script>");
	</script>

    <%--<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>--%>
    <script src="assets/js/jquery.min.js"></script>
<script type="text/javascript">
    jQuery(function ($) {
        $("#loginId").on("click", function (e) {
            var name = $("#uName").val();
            var psd = $("#uPassword").val();
            var remem = ""; //$("#rememberToken").val();
            $("input[name='rememberToken']:checkbox").each(function () {
                if ($(this).prop("checked") == true) {
                    remem += $(this).val();
                }
            });

            if (!checkInfo(name, psd)) {
                return;
            }
            $.post("<%=Business.CoffeePage.VirtulName %>/Ajax/LoginAjax.aspx", { uName: name, uPassword: psd, rememberToken: remem }, function (result) {
                data = eval('(' + result + ')');
                if (data.succ) {
                    window.location.href = "<%=Business.CoffeePage.VirtulName %>/ShopManage.aspx";
                }
                else {
                    if (data.url) {
                        window.location.href = data.url;
                    }
                    else {
                        alert(data.msg);
                    }
                }
            });
        });
    });

    function checkInfo(name,psd) {
        if (!name) {
            alert("用户名不能为空");
            return false;
        }
        if (!psd) {
            alert("密码不能为空");
            return false;
        }
        return true;
    }
</script>
</body>
</html>
