<%@ page language="C#" autoeventwireup="true" inherits="Dialog_UpdateOrderNew, App_Web_updateordernew.aspx.e733171c" %>

<div class="popcon4">
    <div class="bbddb m10">
        <h2 class="ell h38">
            �޸Ķ���</h2>
    </div>
    <form id="editOrder" action="/Ajax/UpdateOrderAjax" method="post">
        <input type="hidden" name="act" value="save" />
        <input type="hidden" name="orderId" value="<%=orderId %>" />
        <div class="wp100">
            <label class="label" for="orderState">ȷ��״̬��</label>
            <select name="orderState" id ="orderState">
                <option value="0" <%=0==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>δȷ��</option>
                <option value="1" <%=1==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>��ȷ��</option>
                <option value="2" <%=2==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>��ȡ��</option>
                <option value="3" <%=3==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>������</option>
                <option value="4" <%=4==(orderDTO == null ? 0 : orderDTO.orderState)?"selected=\"selected\"":"" %>>�����</option>
            </select>
        </div>
        <div class="wp100 mt20">
            <label class="l label" for="managerRemark">
                �̼ұ�ע��</label><input id="managerRemark" class="input15" name="managerRemark" type="text"
                    value="<%= orderDTO==null?"":orderDTO.managerRemark%>" />
        </div>
        <div class="wp100 mt60 fix">
            <a id="cancel" class="r btn1w">����</a>
            <label class="r btn1b mr25" for="submit">
                ����</label>
            <input id="submit" class="dn" type="submit" />
        </div>
    </form>
</div>