<%@ page language="C#" autoeventwireup="true" inherits="Dialog_UpdateOrderNew, App_Web_updateordernew.aspx.e733171c" %>

<div class="popcon4">
    <div class="bbddb m10">
        <h2 class="ell h38">
            修改订单</h2>
    </div>
    <form id="editOrder" action="/Ajax/UpdateOrderAjax" method="post">
        <input type="hidden" name="act" value="save" />
        <input type="hidden" name="orderId" value="<%=orderId %>" />
        <div class="wp100">
            <label class="label" for="orderState">确认状态：</label>
            <select name="orderState" id ="orderState">
                <option value="0" <%=0==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>未确认</option>
                <option value="1" <%=1==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>已确认</option>
                <option value="2" <%=2==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>已取消</option>
                <option value="3" <%=3==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>已配送</option>
                <option value="4" <%=4==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>已完成</option>
            </select>
        </div>
        <div class="wp100 mt20">
            <label class="l label" for="managerRemark">
                商家备注：</label><input id="managerRemark" class="input15" name="managerRemark" type="text"
                    value="<%= orderDTO==null?"":orderDTO.managerRemark%>" />
        </div>
        <div class="wp100 mt60 fix">
            <a id="cancel" class="r btn1w">放弃</a>
            <label class="r btn1b mr25" for="submit">
                保存</label>
            <input id="submit" class="dn" type="submit" />
        </div>
    </form>
</div>