<%@ Page Language="C#" AutoEventWireup="true" CodeFile="UpdateOrder.aspx.cs" Inherits="Dialog_UpdateOrder" %>

<form class="form-horizontal" id="resForm">
<div class="form-group">
    <label class="col-sm-4 control-label" for="orderState">确认状态：</label>
    <div class="col-sm-7">
        <select name="orderState" id ="orderState">
            <option value="0" <%=0==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>未确认</option>
            <option value="1" <%=1==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>已确认</option>
            <option value="2" <%=2==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>已取消</option>
            <option value="3" <%=3==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>已配送</option>
            <option value="4" <%=4==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>已完成</option>
        </select>
    </div>
</div>
<div class="form-group">
    <label class="col-sm-4 control-label" for="managerRemark">
        商家备注：</label>
    <div class="col-sm-7">
        <input type="text" class="form-control" id="managerRemark" name="managerRemark" value="<%= orderDTO==null?"":orderDTO.managerRemark%>" />
    </div>
</div>
<div class="form-group">
    <label class="col-sm-4 control-label" for="">
        &nbsp;</label>
    <div class="col-sm-7">
        
        <button class="btn btn-info" id="submitForm" style="border: none;" data-url="<%=Business.CoffeePage.VirtulName %>/Ajax/UpdateOrderAjax.aspx?act=save&orderId=<%=orderId%>">
            保存</button>
    </div>
</div>
</form>
<script type="text/javascript">
    $("#btnCreateGuid").on("click", function () {
        $("#discountkey").val(newGuid());
    })

    function newGuid() {
        var guid = "";
        for (var i = 1; i <= 32; i++) {
            var n = Math.floor(Math.random() * 16.0).toString(16);
            guid += n;
            if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
                guid += "-";
        }
        return guid;
    }

    $("#submitForm").on("click", function (event) {
        $.ajax({
            url: $(this).attr("data-url"),
            type: "post",
            dataType: "json",
            data: $("#resForm").serialize(),
            success: function (result) {
                ajaxSuccess(result);
            }
        });
        event.preventDefault();
    });

    function ajaxSuccess(result) {
        var data = eval(result);
        if (data.msg) {
            alert(data.msg);
        }
        if (data.url) {
            window.location.href = data.url;
        }
        else {
            if (data.refresh) {
                window.location.reload(data.refresh);
            }
        }
    }
</script>
