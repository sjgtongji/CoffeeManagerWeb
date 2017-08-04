<%@ Control Language="C#" AutoEventWireup="true" CodeFile="LeftBar_Activity.ascx.cs"
    Inherits="Control_LeftBar_Activity" %>

<a class="menu-toggler" id="menu-toggler" href="#">
    <span class="menu-text"></span>
</a>
<div id="sidebar" class="sidebar">
    <script type="text/javascript">        try { ace.settings.check('sidebar', 'fixed') } catch (e) { }</script>
    <ul class="nav nav-list">
        <li class="active <%=CheckMenuOpen(new string[] { "/ShopManage.aspx","/OrderManager.aspx","/BannerManager.aspx"})?"open":"" %>">
            <a href="#" class="dropdown-toggle"><i class="icon-list"></i><span class="menu-text">
                咖啡</span><b class="arrow icon-angle-down"></b></a>
            <ul class="submenu" style="<%=CheckMenuOpen(new string[] { "/ShopManage.aspx","/OrderManager.aspx","/BannerManager.aspx"})?"": "display:none" %>">
                <li class="active <%=Request.RawUrl.Contains("ShopManage.aspx")?"":"open" %>"><a
                    href="<%=Business.CoffeePage.VirtulName %>/ShopManage.aspx" class="dropdown-toggle">
                    <i class="icon-double-angle-right"></i>商店管理<b class="arrow"></b></a>
                </li>
                <li class="active <%=Request.RawUrl.Contains("OrderManager.aspx")?"":"open" %>"><a
                    href="<%=Business.CoffeePage.VirtulName %>/OrderManager.aspx" class="dropdown-toggle">
                    <i class="icon-double-angle-right"></i>订单管理<b class="arrow"></b></a>
                </li>
                <li class="active <%=Request.RawUrl.Contains("BannerManager.aspx")?"":"open" %>"><a
                    href="<%=Business.CoffeePage.VirtulName %>/BannerManager.aspx" class="dropdown-toggle">
                    <i class="icon-double-angle-right"></i>Banner管理<b class="arrow"></b></a>
                </li>
            </ul>
        </li>
    </ul>
    <div id="sidebar-collapse" class="sidebar-collapse">
        <i class="icon-double-angle-left" data-icon2="icon-double-angle-right" data-icon1="icon-double-angle-left">
        </i>
    </div>
</div>
