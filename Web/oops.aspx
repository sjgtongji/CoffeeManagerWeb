
<%@ Page Language="C#" masterpagefile="~/MasterPage.master"  AutoEventWireup="true" CodeFile="oops.aspx.cs" Inherits="oops" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="Server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="Server">
    <div id="content" class="content order">
        <div class="wrap_top">
            &nbsp;</div>
        <div class="wrapper" style="height:300px">
            <h2>
                <%=sContent %></h2>
        </div>
    </div> 
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="FootContent" runat="Server">
</asp:Content>
