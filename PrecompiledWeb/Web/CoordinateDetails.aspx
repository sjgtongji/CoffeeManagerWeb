<%@ page language="C#" autoeventwireup="true" inherits="CoordinateDetails, App_Web_coordinatedetails.aspx.cdcab7d2" %>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<style type="text/css">
	body, html{width: 100%;height: 100%;margin:0;font-family:"微软雅黑";}
	#allmap {width: 100%; height:95%; overflow: hidden;}
	#result {width:100%;font-size:12px;}
	dl,dt,dd,ul,li{
		margin:0;
		padding:0;
		list-style:none;
	}
	p{font-size:12px;}
	dt{
		font-size:14px;
		font-family:"微软雅黑";
		font-weight:bold;
		border-bottom:1px dotted #000;
		padding:5px 0 5px 5px;
		margin:5px 0;
	}
	dd{
		padding:5px 0 0 5px;
	}
	li{
		line-height:28px;
	}
	</style>
<script src="http://api.map.baidu.com/api?v=2.0&ak=rMaOcUnbX2a63hgKiceE4ESWgeu0qAG5"></script>	
<!--<script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=E4805d16520de693a3fe707cdc962045"></script> -->
	<!--加载鼠标绘制工具-->
	<!--<script type="text/javascript" src="http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js"></script> -->
	<script type="text/javascript" src="./assets/js/DrawingManager.js"></script>
	<link rel="stylesheet" href="http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css" />
	<!--加载检索信息窗口-->
	<script type="text/javascript" src="http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js"></script>
	<link rel="stylesheet" href="http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.css" />
    <link rel="stylesheet" href="<%=Business.CoffeePage.VirtulName+"/assets/css/jquery-ui-1.10.3.full.min.css"%>" />
    <script src="<%=Business.CoffeePage.VirtulName%>/assets/js/jquery.min.js"></script>
	<title>配送范围</title>
</head>
<body>
	<div id="allmap" style="overflow:hidden;zoom:1;position:relative;">	
		<div id="map" style="height:100%;-webkit-transition: all 0.5s ease-in-out;transition: all 0.5s ease-in-out;"></div>
	</div>
	<div id="result">
		<input type="button" value="提交" onclick="submitPolygon()"/>
	</div>
	<div style="display: none;"></div>
	<script type="text/javascript">
	    var APP = {
	        resId: "",
	        urls: {
	            submitPolygon: "Ajax/CoordinateAjax.aspx?act=addcoordinate&resId=<%=restaurant.id%>",
	            curPoly: "Ajax/CoordinateAjax.aspx?act=curpoly&resId=<%=restaurant.id%>",
	            curShopPosition: "Ajax/CoordinateAjax.aspx?act=curshopposition&resId=<%=restaurant.id%>"
	        }
	    }

	    // 店铺坐标
	    var curShopPosition = {
	        "lng": <%=restaurant.longitude.Value%>,
	        "lat": <%=restaurant.latitude.Value %>
	    };
	    // 当前店铺配送范围
	    var curPoly = {
	        "ResId": 0, //餐厅Id,页面需要一个标签接受参数
	        "Coordinate": <%=strCoordinateInfo%>//有序坐标序列
	    };
	    // 百度地图API功能
	var map = new BMap.Map('map');
    //var poi = new BMap.Point(curShopPosition.lng,curShopPosition.lat);
    map.enableScrollWheelZoom();
    var overlays = [];
	var overlaycomplete = function(e){
        overlays.push(e.overlay);
		polygon = e.overlay.po;
    };
	var polygon = []; // 多边形坐标点
    var styleOptions = {
        strokeColor:"red",    //边线颜色。
        fillColor:"red",      //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 3,       //边线的宽度，以像素为单位。
        strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
        fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
        strokeStyle: 'solid' //边线的样式，solid或dashed。
    };
	var currentStyleOptions = {
		strokeColor:"blue",    //边线颜色。
		fillColor:"blue",      //填充颜色。当参数为空时，圆形将没有填充效果。
		strokeWeight: 3,       //边线的宽度，以像素为单位。
		strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
		fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
		strokeStyle: 'solid' //边线的样式，solid或dashed。
	};
    //实例化鼠标绘制工具
    var drawingManager = new BMapLib.DrawingManager(map, {
        isOpen: false, //是否开启绘制模式
        enableDrawingTool: true,//是否显示工具栏
        drawingToolOptions: {
            anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
            offset: new BMap.Size(5, 5), //偏离值
	    drawingModes: [BMAP_DRAWING_POLYGON]
        },
        //circleOptions: styleOptions, //圆的样式
        //polylineOptions: styleOptions, //线的样式
        polygonOptions: styleOptions //多边形的样式
        //rectangleOptions: styleOptions //矩形的样式
    });  
	//添加鼠标绘制工具监听事件，用于获取绘制结果
    drawingManager.addEventListener('overlaycomplete', overlaycomplete);
	// 初始化当前配送范围
	init();




    function clearAll() { // 不要修改函数名或删除函数，被baidu api js回调(DrawingManager.js)
		for(var i = 0; i < overlays.length; i++){
			overlayHist = overlays[i];
            map.removeOverlay(overlays[i]);
        }
        overlays.length = 0;
		polygon = [];
    }

	function init() {
		clearAll();
		$.ajax({
			url:APP.urls.curPoly,
			type:"POST",
			dataType:"json",
			data:{ResId : APP.resId},
			success:function(res){
				if(!res.Status==0){console.log(res);
					//alert(res.Message);
					return;
				}
				var curPolygon = buildCurrentPolygon(res.Data);
				map.addOverlay(curPolygon);
			}
		});


		$.ajax({
			url:APP.urls.curShopPosition,
			type:"POST",
			dataType:"json",
			data:{ResId : APP.resId},
			success:function(res){
				if(!res.Status==0){console.log(res);
					alert(res.Message);
					return;
				}
				var center = new BMap.Point(res.Data.lng, res.Data.lat);
				var marker = new BMap.Marker(center);
				map.centerAndZoom(center, 16);
				map.addOverlay(marker);
			}
		});
	}

	function buildCurrentPolygon(curPoly) {
		var postions = curPoly.Coordinate;
		if(postions == null || postions.length == 0) {
			return;
		}
		var points = [];
		postions.forEach(function(val,index,arr){
			points.push(new BMap.Point(val.Longitude,val.Latitude));

		});
		var curPolygon = new BMap.Polygon(points, currentStyleOptions);
		return curPolygon;
	}

	function submitPolygon() {
		var submit = {};
		submit.ResId = 0000;
		submit.Coordinate = [];
		if(polygon == null || polygon.length == 0){
			alert("未发现修改或未绘制配送范围，不需要提交");
			return;
		}
		if (polygon.length == 2){
			alert("画了一条线，不能提交");
			return;
		}
		polygon.forEach(function(val,index,arr){
			submit.Coordinate.push({"Latitude": val.lat,"Longitude": val.lng});
		});
		console.log(JSON.stringify(submit));

		$.ajax({
			url:APP.urls.submitPolygon,
			type:"POST",
			dataType:"json",
			data:{CoordinateInfo:JSON.stringify(submit)},
			success:function(res){
				if(!res.Status==0){
					alert(res.Message);
					return;
				}
				alert(res.Message);
			}
		});

	}
</script>
</body>
</html>
