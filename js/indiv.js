dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("dijit.Menu");
dojo.require("esri.renderers.DotDensityRenderer");
dojo.require("esri.dijit.Geocoder");
dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.InfoWindow");
dojo.require("esri.symbols.SimpleLineSymbol");
dojo.require("esri.symbols.SimpleMarkerSymbol");


var map, featureLayer, featureLayer2, pointLayer, infoTemplate, legend;

function init() {
	$("#legendDiv").draggable({
		containment : "#mapDiv"
	});
	// On load, style typical form elements
	$("select").uniform();

	$("#advancedbox").draggable({
		containment : "#mapDiv"
	});
	
	
	$('#chk1').click(function() {
		if($("#chk1").is(':checked')){
			pointLayer.setVisibility(true);	
			}else{
			pointLayer.setVisibility(false);	
			}	
	});

	$('#chk2').click(function() {
		if($("#chk2").is(':checked')){
			featureLayer2.setVisibility(true);	
			}else{
			featureLayer2.setVisibility(false);	
			}	
	});	

	map = new esri.Map("mapDiv", {
		basemap : "topo",
		center : [-104.98, 39.73],
		zoom : 13,
		maxZoom: 16,
		minZoom: 6
	});
	dojo.connect(map, "onLoad", initOperationalLayer);
	
	dojo.connect(map, "onZoomEnd", zoomroutine);	

	dojo.byId("title").innerHTML = "Poverty by Age by Ratio";
	dojo.byId("subtitle").innerHTML = "Source: Table B17024, ACS 2017-2021 5Y : Census Tracts";
}

function zoomroutine(){

//if checkbox is checked

var zoomlev=map.getZoom();




if(zoomlev==9){dotsize=1.5; dotValue=64;};
if(zoomlev==10){dotsize=1.5; dotValue=32;};
if(zoomlev==11){dotsize=1.5; dotValue=16;};
if(zoomlev==12){dotsize=1.5; dotValue=8;};
if(zoomlev==13){dotsize=1.5; dotValue=4;};
if(zoomlev==14){dotsize=2; dotValue=4;};
if(zoomlev==15){dotsize=3; dotValue=2;};
if(zoomlev==16){dotsize=4; dotValue=1;};

	var startren='new esri.renderer.DotDensityRenderer({fields: [';
	var middleren='{name: "T64", color: new dojo.Color("#000000")},'+'{name: "T74", color: new dojo.Color("#000000")},'+'{name: "T99", color: new dojo.Color("#000000")}';	
	var endren='], dotValue: '+dotValue+', dotSize: '+dotsize+'});';
	
	
	
	
	    var DDrenderer = eval(startren+middleren+endren);
		
	featureLayer2.setRenderer(DDrenderer);	
	featureLayer2.redraw();

}

function initOperationalLayer(map) {

	dojo.connect(map, 'onLayersAddResult', function(results) {
		var layerInfo = dojo.map(results, function(layer, index) {
		console.log(layer);
		if(layer.layer.id=="graphicsLayer1"){
					return {
				layer : layer.layer
			};

		}else{
					return {
			};
			}
		});
		if (layerInfo.length > 0) {
			legend = new esri.dijit.Legend({
				map : map,
				layerInfos : layerInfo
			}, "legendDiv");
			legend.startup();
		}
	});

	var Geocoder = new esri.dijit.Geocoder({
		autoComplete : true,
		arcgisGeocoder : {
			placeholder : "Find a place",
			sourceCountry : 'USA'
		},
		map : map
	}, dojo.byId("search"));

	esri.config.defaults.map.logoLink = "https://dola.colorado.gov/";
	document.getElementsByClassName('logo-med')[0].style.backgroundImage = "url(\"img/CO_LOGO.png\")";
	document.getElementsByClassName('logo-med')[0].style.backgroundRepeat = "no-repeat";

	// start widget
	Geocoder.startup();

	infoTemplate = new esri.InfoTemplate();
	infoTemplate.setTitle("${NAMELSAD}");
	infoTemplate.setContent(getText);

	infoTemplate2 = new esri.InfoTemplate();
	infoTemplate2.setTitle("${CenterName}");
	infoTemplate2.setContent(getText2);
	
	
	featureLayer = new esri.layers.FeatureLayer("https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Poverty_Comprehensive_1721/FeatureServer/0", {
		mode : esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields : ["*"],
		infoTemplate : infoTemplate
	});
	
	featureLayer2 = new esri.layers.FeatureLayer("https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Poverty_Comprehensive_1721/FeatureServer/0", {
		mode : esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields : ["*"]
	});
	
	pointLayer = new esri.layers.FeatureLayer("https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/SeniorCenters/FeatureServer/0", {
		mode : esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields : ["*"],
		infoTemplate : infoTemplate2
	});
	
	countyLayer = new esri.layers.FeatureLayer("https://services.arcgis.com/IamIM3RJ5xHykalK/ArcGIS/rest/services/CountyACSv4/FeatureServer/0", {
		mode : esri.layers.FeatureLayer.MODE_ONDEMAND
	});
	
	placeLayer = new esri.layers.FeatureLayer("https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Places2013_Inc/FeatureServer/0", {
		mode : esri.layers.FeatureLayer.MODE_ONDEMAND
	});	

	
		var ptSymbol = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
			return (graphic.attributes.Days);
		});
	ptSymbol.addBreak({
		minValue : -Infinity,
		maxValue : 1.5,
		symbol : new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([250,250,250]),1), new dojo.Color([0,169,230,0.6])),
		label : "Open 1 Day Per Week"
	});
	ptSymbol.addBreak({
		minValue : 1.5,
		maxValue : 2.5,
		symbol : new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 16, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([250,250,250]),1), new dojo.Color([0,169,230,0.6])),
		label : "Open 2 Day Per Week"
	});
	ptSymbol.addBreak({
		minValue : 2.5,
		maxValue : 3.5,
		symbol : new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([250,250,250]),1), new dojo.Color([0,169,230,0.6])),
		label : "Open 3 Day Per Week"
	});
	ptSymbol.addBreak({
		minValue : 3.5,
		maxValue : 4.5,
		symbol : new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 24, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([250,250,250]),1), new dojo.Color([0,169,230,0.6])),
		label : "Open 4 Day Per Week"
	});
	ptSymbol.addBreak({
		minValue : 4.5,
		maxValue : Infinity,
		symbol : new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 28, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([250,250,250]),1), new dojo.Color([0,169,230,0.6])),
		label : "Open 5+ Days Per Week"
	});	

	pointLayer.setRenderer(ptSymbol);

	
	map.addLayers([featureLayer, featureLayer2, pointLayer]);

	map.infoWindow.resize(360, 190);

	//initialize at 100%
	handleClick();

	//for county layer
	var defaultSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([153,76,0]), 2), new dojo.Color([153,76,0, 1]));
	var renderer2 = new esri.renderer.SimpleRenderer(defaultSymbol);
	
	//for place layer
	var pren = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 255, 0.2]), 1), new dojo.Color([0, 0, 0, 0]));
	var placerenderer = new esri.renderer.SimpleRenderer(pren);	



	placeLayer.setRenderer(placerenderer);
	map.addLayer(placeLayer);

	countyLayer.setRenderer(renderer2);
	map.addLayer(countyLayer);
	

	pointLayer.setVisibility(false);
	featureLayer2.setVisibility(false);

	
	var highlightSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 3), new dojo.Color([125, 125, 125, 0.35]));
	
	map.graphics.enableMouseEvents();
	//Listen for when the onMouseOver event fires on the featureLayer
	//When fired, create new graphic with the geometry from the event.graphic and
	//add it to the map's graphics layer
	dojo.connect(featureLayer, "onMouseOver", function(evt) {
		map.graphics.clear();
		var highlightGraphic = new esri.Graphic(evt.graphic.geometry, highlightSymbol);
		map.graphics.add(highlightGraphic);
	});

	dojo.connect(featureLayer2, "onMouseOver", function(evt) {
		map.graphics.clear();
		var highlightGraphic = new esri.Graphic(evt.graphic.geometry, highlightSymbol);
		map.graphics.add(highlightGraphic);
	});
	
	dojo.connect(pointLayer, "onMouseOver", function(evt) {
		map.graphics.clear();
		var highlightGraphic = new esri.Graphic(evt.graphic.geometry, new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, (8+4*(evt.graphic.attributes.Days)), new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]),2), new dojo.Color([0,169,230,0.1])));
		map.graphics.add(highlightGraphic);
	});	
	
	//Listen for when the map.graphics onMouseOut event is fired and then clear the
	//highlight graphic
	dojo.connect(map.graphics, "onMouseOut", function(evt) {
		map.graphics.clear();
	});
}

function commafy(nStr) {
	var x, x1, x2, rgx;
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function getText(graphic) {
	
	var tcontent="";

	var level = $('#levelinput').val();
	
	var agef = $('#agefrom').val();	
	var aget = $('#ageto').val();	
	
	var lowage="";
	var highage="";
	
	var pctmoe=0;
	var checka=false;
	
	if(agef=="0"){lowage="From Age 0";};
	if(agef=="1"){lowage="From Age 6";};
	if(agef=="2"){lowage="From Age 12";};
	if(agef=="3"){lowage="From Age 18";};
	if(agef=="4"){lowage="From Age 25";};
	if(agef=="5"){lowage="From Age 35";};
	if(agef=="6"){lowage="From Age 45";};
	if(agef=="7"){lowage="From Age 55";};
	if(agef=="8"){lowage="From Age 65";};
	if(agef=="9"){lowage="From Age 75";};

	if(aget=="0"){highage=" to 5";};
	if(aget=="1"){highage=" to 11";};
	if(aget=="2"){highage=" to 17";};
	if(aget=="3"){highage=" to 24";};
	if(aget=="4"){highage=" to 34";};
	if(aget=="5"){highage=" to 44";};
	if(aget=="6"){highage=" to 54";};
	if(aget=="7"){highage=" to 64";};
	if(aget=="8"){highage=" to 74";};
	if(aget=="9"){highage="+";};	

	
	var group1=false;var group2=false;var group3=false;var group4=false;var group5=false;var group6=false;var group7=false;var group8=false;var group9=false;var group10=false;	
	if(agef=='0'){group1=true;group2=true;group3=true;group4=true;group5=true;group6=true;group7=true;group8=true;group9=true;group10=true;}
	if(agef=='1'){group2=true;group3=true;group4=true;group5=true;group6=true;group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='2'){group3=true;group4=true;group5=true;group6=true;group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='3'){group4=true;group5=true;group6=true;group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='4'){group5=true;group6=true;group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='5'){group6=true;group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='6'){group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='7'){group8=true;group9=true;group10=true;}	
	if(agef=='8'){group9=true;group10=true;}	
	if(agef=='9'){group10=true;}	
	if(aget=='0'){group2=false;group3=false;group4=false;group5=false;group6=false;group7=false;group8=false;group9=false;group10=false;}
	if(aget=='1'){group3=false;group4=false;group5=false;group6=false;group7=false;group8=false;group9=false;group10=false;}
	if(aget=='2'){group4=false;group5=false;group6=false;group7=false;group8=false;group9=false;group10=false;}
	if(aget=='3'){group5=false;group6=false;group7=false;group8=false;group9=false;group10=false;}
	if(aget=='4'){group6=false;group7=false;group8=false;group9=false;group10=false;}
	if(aget=='5'){group7=false;group8=false;group9=false;group10=false;}
	if(aget=='6'){group8=false;group9=false;group10=false;}	
	if(aget=='7'){group9=false;group10=false;}		
	if(aget=='8'){group10=false;}			
	
	var mapvar=0; //variable
	var ttlvar=0; //universe
	var moevar=0; //margin of error variable	
	var moeuniv=0; //margin of error universe

	
	if(level=="0"){  //50% Poverty
	
	if(group1){
	mapvar = mapvar + graphic.attributes.T5A; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5A,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11A; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11A,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17A; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17A,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24A; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24A,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34A; 
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34A,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44A; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44A,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54A; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54A,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64A; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64A,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74A; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74A,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99A; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99A,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
	
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &lt;50% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &lt;50% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";
	}
	
	if(level=="1"){  //75% Poverty
	
	if(group1){
	mapvar = mapvar + graphic.attributes.T5A + graphic.attributes.T5B; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5A,2) + Math.pow(graphic.attributes.MT5B,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);	
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11A + graphic.attributes.T11B; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11A,2) + Math.pow(graphic.attributes.MT11B,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17A + graphic.attributes.T17B; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17A,2) + Math.pow(graphic.attributes.MT17B,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24A + graphic.attributes.T24B; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24A,2) + Math.pow(graphic.attributes.MT24B,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34A + graphic.attributes.T34B; 
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34A,2) + Math.pow(graphic.attributes.MT34B,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44A + graphic.attributes.T44B; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44A,2) + Math.pow(graphic.attributes.MT44B,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54A + graphic.attributes.T54B; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54A,2) + Math.pow(graphic.attributes.MT54B,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64A + graphic.attributes.T64B; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64A,2) + Math.pow(graphic.attributes.MT64B,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74A + graphic.attributes.T74B; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74A,2) + Math.pow(graphic.attributes.MT74B,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99A + graphic.attributes.T99B; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99A,2) + Math.pow(graphic.attributes.MT99B,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
	
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &lt;75% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &lt;75% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";	
	}
	
	if(level=="2"){  //100% Poverty

	if(group1){
	mapvar = mapvar + graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5A,2) + Math.pow(graphic.attributes.MT5B,2) + Math.pow(graphic.attributes.MT5C,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);	
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11A,2) + Math.pow(graphic.attributes.MT11B,2) + Math.pow(graphic.attributes.MT11C,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17A,2) + Math.pow(graphic.attributes.MT17B,2) + Math.pow(graphic.attributes.MT17C,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24A,2) + Math.pow(graphic.attributes.MT24B,2) + Math.pow(graphic.attributes.MT24C,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C; 
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34A,2) + Math.pow(graphic.attributes.MT34B,2) + Math.pow(graphic.attributes.MT34C,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44A,2) + Math.pow(graphic.attributes.MT44B,2) + Math.pow(graphic.attributes.MT44C,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54A,2) + Math.pow(graphic.attributes.MT54B,2) + Math.pow(graphic.attributes.MT54C,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64A,2) + Math.pow(graphic.attributes.MT64B,2) + Math.pow(graphic.attributes.MT64C,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74A,2) + Math.pow(graphic.attributes.MT74B,2) + Math.pow(graphic.attributes.MT74C,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99A,2) + Math.pow(graphic.attributes.MT99B,2) + Math.pow(graphic.attributes.MT99C,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
	
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &lt;100% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &lt;100% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";	
	}
	
	if(level=="3"){  //125% Poverty

	if(group1){
	mapvar = mapvar + graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5A,2) + Math.pow(graphic.attributes.MT5B,2) + Math.pow(graphic.attributes.MT5C,2) + Math.pow(graphic.attributes.MT5D,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);	
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11A,2) + Math.pow(graphic.attributes.MT11B,2) + Math.pow(graphic.attributes.MT11C,2) + Math.pow(graphic.attributes.MT11D,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17A,2) + Math.pow(graphic.attributes.MT17B,2) + Math.pow(graphic.attributes.MT17C,2) + Math.pow(graphic.attributes.MT17D,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24A,2) + Math.pow(graphic.attributes.MT24B,2) + Math.pow(graphic.attributes.MT24C,2) + Math.pow(graphic.attributes.MT24D,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D; 
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34A,2) + Math.pow(graphic.attributes.MT34B,2) + Math.pow(graphic.attributes.MT34C,2) + Math.pow(graphic.attributes.MT34D,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44A,2) + Math.pow(graphic.attributes.MT44B,2) + Math.pow(graphic.attributes.MT44C,2) + Math.pow(graphic.attributes.MT44D,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54A,2) + Math.pow(graphic.attributes.MT54B,2) + Math.pow(graphic.attributes.MT54C,2) + Math.pow(graphic.attributes.MT54D,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64A,2) + Math.pow(graphic.attributes.MT64B,2) + Math.pow(graphic.attributes.MT64C,2) + Math.pow(graphic.attributes.MT64D,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74A,2) + Math.pow(graphic.attributes.MT74B,2) + Math.pow(graphic.attributes.MT74C,2) + Math.pow(graphic.attributes.MT74D,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99A,2) + Math.pow(graphic.attributes.MT99B,2) + Math.pow(graphic.attributes.MT99C,2) + Math.pow(graphic.attributes.MT99D,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
	
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &lt;125% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &lt;125% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";	
	}
	
	if(level=="4"){  //150% Poverty

	if(group1){
	mapvar = mapvar + graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5A,2) + Math.pow(graphic.attributes.MT5B,2) + Math.pow(graphic.attributes.MT5C,2) + Math.pow(graphic.attributes.MT5D,2) + Math.pow(graphic.attributes.MT5E,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);	
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11A,2) + Math.pow(graphic.attributes.MT11B,2) + Math.pow(graphic.attributes.MT11C,2) + Math.pow(graphic.attributes.MT11D,2) + Math.pow(graphic.attributes.MT11E,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17A,2) + Math.pow(graphic.attributes.MT17B,2) + Math.pow(graphic.attributes.MT17C,2) + Math.pow(graphic.attributes.MT17D,2) + Math.pow(graphic.attributes.MT17E,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24A,2) + Math.pow(graphic.attributes.MT24B,2) + Math.pow(graphic.attributes.MT24C,2) + Math.pow(graphic.attributes.MT24D,2) + Math.pow(graphic.attributes.MT24E,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E; 
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34A,2) + Math.pow(graphic.attributes.MT34B,2) + Math.pow(graphic.attributes.MT34C,2) + Math.pow(graphic.attributes.MT34D,2) + Math.pow(graphic.attributes.MT34E,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44A,2) + Math.pow(graphic.attributes.MT44B,2) + Math.pow(graphic.attributes.MT44C,2) + Math.pow(graphic.attributes.MT44D,2) + Math.pow(graphic.attributes.MT44E,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54A,2) + Math.pow(graphic.attributes.MT54B,2) + Math.pow(graphic.attributes.MT54C,2) + Math.pow(graphic.attributes.MT54D,2) + Math.pow(graphic.attributes.MT54E,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64A,2) + Math.pow(graphic.attributes.MT64B,2) + Math.pow(graphic.attributes.MT64C,2) + Math.pow(graphic.attributes.MT64D,2) + Math.pow(graphic.attributes.MT64E,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74A,2) + Math.pow(graphic.attributes.MT74B,2) + Math.pow(graphic.attributes.MT74C,2) + Math.pow(graphic.attributes.MT74D,2) + Math.pow(graphic.attributes.MT74E,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99A,2) + Math.pow(graphic.attributes.MT99B,2) + Math.pow(graphic.attributes.MT99C,2) + Math.pow(graphic.attributes.MT99D,2) + Math.pow(graphic.attributes.MT99E,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
	
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &lt;150% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &lt;150% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";	
	}
	
	if(level=="5"){  //175% Poverty

	if(group1){
	mapvar = mapvar + graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5A,2) + Math.pow(graphic.attributes.MT5B,2) + Math.pow(graphic.attributes.MT5C,2) + Math.pow(graphic.attributes.MT5D,2) + Math.pow(graphic.attributes.MT5E,2) + Math.pow(graphic.attributes.MT5F,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11A,2) + Math.pow(graphic.attributes.MT11B,2) + Math.pow(graphic.attributes.MT11C,2) + Math.pow(graphic.attributes.MT11D,2) + Math.pow(graphic.attributes.MT11E,2) + Math.pow(graphic.attributes.MT11F,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17A,2) + Math.pow(graphic.attributes.MT17B,2) + Math.pow(graphic.attributes.MT17C,2) + Math.pow(graphic.attributes.MT17D,2) + Math.pow(graphic.attributes.MT17E,2) + Math.pow(graphic.attributes.MT17F,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24A,2) + Math.pow(graphic.attributes.MT24B,2) + Math.pow(graphic.attributes.MT24C,2) + Math.pow(graphic.attributes.MT24D,2) + Math.pow(graphic.attributes.MT24E,2) + Math.pow(graphic.attributes.MT24F,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F; 
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34A,2) + Math.pow(graphic.attributes.MT34B,2) + Math.pow(graphic.attributes.MT34C,2) + Math.pow(graphic.attributes.MT34D,2) + Math.pow(graphic.attributes.MT34E,2) + Math.pow(graphic.attributes.MT34F,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44A,2) + Math.pow(graphic.attributes.MT44B,2) + Math.pow(graphic.attributes.MT44C,2) + Math.pow(graphic.attributes.MT44D,2) + Math.pow(graphic.attributes.MT44E,2) + Math.pow(graphic.attributes.MT44F,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54A,2) + Math.pow(graphic.attributes.MT54B,2) + Math.pow(graphic.attributes.MT54C,2) + Math.pow(graphic.attributes.MT54D,2) + Math.pow(graphic.attributes.MT54E,2) + Math.pow(graphic.attributes.MT54F,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64A,2) + Math.pow(graphic.attributes.MT64B,2) + Math.pow(graphic.attributes.MT64C,2) + Math.pow(graphic.attributes.MT64D,2) + Math.pow(graphic.attributes.MT64E,2) + Math.pow(graphic.attributes.MT64F,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74A,2) + Math.pow(graphic.attributes.MT74B,2) + Math.pow(graphic.attributes.MT74C,2) + Math.pow(graphic.attributes.MT74D,2) + Math.pow(graphic.attributes.MT74E,2) + Math.pow(graphic.attributes.MT74F,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99A,2) + Math.pow(graphic.attributes.MT99B,2) + Math.pow(graphic.attributes.MT99C,2) + Math.pow(graphic.attributes.MT99D,2) + Math.pow(graphic.attributes.MT99E,2) + Math.pow(graphic.attributes.MT99F,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
	
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &lt;175% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &lt;175% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";	
	}
	
	if(level=="6"){  //185% Poverty

	if(group1){
	mapvar = mapvar + graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F + graphic.attributes.T5G; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5A,2) + Math.pow(graphic.attributes.MT5B,2) + Math.pow(graphic.attributes.MT5C,2) + Math.pow(graphic.attributes.MT5D,2) + Math.pow(graphic.attributes.MT5E,2) + Math.pow(graphic.attributes.MT5F,2) + Math.pow(graphic.attributes.MT5G,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);	
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F + graphic.attributes.T11G; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11A,2) + Math.pow(graphic.attributes.MT11B,2) + Math.pow(graphic.attributes.MT11C,2) + Math.pow(graphic.attributes.MT11D,2) + Math.pow(graphic.attributes.MT11E,2) + Math.pow(graphic.attributes.MT11F,2) + Math.pow(graphic.attributes.MT11G,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F + graphic.attributes.T17G; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17A,2) + Math.pow(graphic.attributes.MT17B,2) + Math.pow(graphic.attributes.MT17C,2) + Math.pow(graphic.attributes.MT17D,2) + Math.pow(graphic.attributes.MT17E,2) + Math.pow(graphic.attributes.MT17F,2) + Math.pow(graphic.attributes.MT17G,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F + graphic.attributes.T24G; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24A,2) + Math.pow(graphic.attributes.MT24B,2) + Math.pow(graphic.attributes.MT24C,2) + Math.pow(graphic.attributes.MT24D,2) + Math.pow(graphic.attributes.MT24E,2) + Math.pow(graphic.attributes.MT24F,2) + Math.pow(graphic.attributes.MT24G,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F + graphic.attributes.T34G; 
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34A,2) + Math.pow(graphic.attributes.MT34B,2) + Math.pow(graphic.attributes.MT34C,2) + Math.pow(graphic.attributes.MT34D,2) + Math.pow(graphic.attributes.MT34E,2) + Math.pow(graphic.attributes.MT34F,2) + Math.pow(graphic.attributes.MT34G,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F + graphic.attributes.T44G; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44A,2) + Math.pow(graphic.attributes.MT44B,2) + Math.pow(graphic.attributes.MT44C,2) + Math.pow(graphic.attributes.MT44D,2) + Math.pow(graphic.attributes.MT44E,2) + Math.pow(graphic.attributes.MT44F,2) + Math.pow(graphic.attributes.MT44G,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F + graphic.attributes.T54G; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54A,2) + Math.pow(graphic.attributes.MT54B,2) + Math.pow(graphic.attributes.MT54C,2) + Math.pow(graphic.attributes.MT54D,2) + Math.pow(graphic.attributes.MT54E,2) + Math.pow(graphic.attributes.MT54F,2) + Math.pow(graphic.attributes.MT54G,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F + graphic.attributes.T64G; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64A,2) + Math.pow(graphic.attributes.MT64B,2) + Math.pow(graphic.attributes.MT64C,2) + Math.pow(graphic.attributes.MT64D,2) + Math.pow(graphic.attributes.MT64E,2) + Math.pow(graphic.attributes.MT64F,2) + Math.pow(graphic.attributes.MT64G,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F + graphic.attributes.T74G; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74A,2) + Math.pow(graphic.attributes.MT74B,2) + Math.pow(graphic.attributes.MT74C,2) + Math.pow(graphic.attributes.MT74D,2) + Math.pow(graphic.attributes.MT74E,2) + Math.pow(graphic.attributes.MT74F,2) + Math.pow(graphic.attributes.MT74G,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F + graphic.attributes.T99G; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99A,2) + Math.pow(graphic.attributes.MT99B,2) + Math.pow(graphic.attributes.MT99C,2) + Math.pow(graphic.attributes.MT99D,2) + Math.pow(graphic.attributes.MT99E,2) + Math.pow(graphic.attributes.MT99F,2) + Math.pow(graphic.attributes.MT99G,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
	
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &lt;185% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &lt;185% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";	
	}
	
	if(level=="7"){  //200% Poverty

	if(group1){
	mapvar = mapvar + graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F + graphic.attributes.T5G + graphic.attributes.T5H; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5A,2) + Math.pow(graphic.attributes.MT5B,2) + Math.pow(graphic.attributes.MT5C,2) + Math.pow(graphic.attributes.MT5D,2) + Math.pow(graphic.attributes.MT5E,2) + Math.pow(graphic.attributes.MT5F,2) + Math.pow(graphic.attributes.MT5G,2) + Math.pow(graphic.attributes.MT5H,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);	
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F + graphic.attributes.T11G + graphic.attributes.T11H; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11A,2) + Math.pow(graphic.attributes.MT11B,2) + Math.pow(graphic.attributes.MT11C,2) + Math.pow(graphic.attributes.MT11D,2) + Math.pow(graphic.attributes.MT11E,2) + Math.pow(graphic.attributes.MT11F,2) + Math.pow(graphic.attributes.MT11G,2) + Math.pow(graphic.attributes.MT11H,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F + graphic.attributes.T17G + graphic.attributes.T17H; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17A,2) + Math.pow(graphic.attributes.MT17B,2) + Math.pow(graphic.attributes.MT17C,2) + Math.pow(graphic.attributes.MT17D,2) + Math.pow(graphic.attributes.MT17E,2) + Math.pow(graphic.attributes.MT17F,2) + Math.pow(graphic.attributes.MT17G,2) + Math.pow(graphic.attributes.MT17H,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F + graphic.attributes.T24G + graphic.attributes.T24H; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24A,2) + Math.pow(graphic.attributes.MT24B,2) + Math.pow(graphic.attributes.MT24C,2) + Math.pow(graphic.attributes.MT24D,2) + Math.pow(graphic.attributes.MT24E,2) + Math.pow(graphic.attributes.MT24F,2) + Math.pow(graphic.attributes.MT24G,2) + Math.pow(graphic.attributes.MT24H,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F + graphic.attributes.T34G + graphic.attributes.T34H; 
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34A,2) + Math.pow(graphic.attributes.MT34B,2) + Math.pow(graphic.attributes.MT34C,2) + Math.pow(graphic.attributes.MT34D,2) + Math.pow(graphic.attributes.MT34E,2) + Math.pow(graphic.attributes.MT34F,2) + Math.pow(graphic.attributes.MT34G,2) + Math.pow(graphic.attributes.MT34H,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F + graphic.attributes.T44G + graphic.attributes.T44H; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44A,2) + Math.pow(graphic.attributes.MT44B,2) + Math.pow(graphic.attributes.MT44C,2) + Math.pow(graphic.attributes.MT44D,2) + Math.pow(graphic.attributes.MT44E,2) + Math.pow(graphic.attributes.MT44F,2) + Math.pow(graphic.attributes.MT44G,2) + Math.pow(graphic.attributes.MT44H,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F + graphic.attributes.T54G + graphic.attributes.T54H; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54A,2) + Math.pow(graphic.attributes.MT54B,2) + Math.pow(graphic.attributes.MT54C,2) + Math.pow(graphic.attributes.MT54D,2) + Math.pow(graphic.attributes.MT54E,2) + Math.pow(graphic.attributes.MT54F,2) + Math.pow(graphic.attributes.MT54G,2) + Math.pow(graphic.attributes.MT54H,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F + graphic.attributes.T64G + graphic.attributes.T64H; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64A,2) + Math.pow(graphic.attributes.MT64B,2) + Math.pow(graphic.attributes.MT64C,2) + Math.pow(graphic.attributes.MT64D,2) + Math.pow(graphic.attributes.MT64E,2) + Math.pow(graphic.attributes.MT64F,2) + Math.pow(graphic.attributes.MT64G,2) + Math.pow(graphic.attributes.MT64H,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F + graphic.attributes.T74G + graphic.attributes.T74H; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74A,2) + Math.pow(graphic.attributes.MT74B,2) + Math.pow(graphic.attributes.MT74C,2) + Math.pow(graphic.attributes.MT74D,2) + Math.pow(graphic.attributes.MT74E,2) + Math.pow(graphic.attributes.MT74F,2) + Math.pow(graphic.attributes.MT74G,2) + Math.pow(graphic.attributes.MT74H,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F + graphic.attributes.T99G + graphic.attributes.T99H; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99A,2) + Math.pow(graphic.attributes.MT99B,2) + Math.pow(graphic.attributes.MT99C,2) + Math.pow(graphic.attributes.MT99D,2) + Math.pow(graphic.attributes.MT99E,2) + Math.pow(graphic.attributes.MT99F,2) + Math.pow(graphic.attributes.MT99G,2) + Math.pow(graphic.attributes.MT99H,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
	
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &lt;200% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &lt;200% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";	
	}
	
	if(level=="8"){  //300% Poverty

	if(group1){
	mapvar = mapvar + graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F + graphic.attributes.T5G + graphic.attributes.T5H + graphic.attributes.T5I; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5A,2) + Math.pow(graphic.attributes.MT5B,2) + Math.pow(graphic.attributes.MT5C,2) + Math.pow(graphic.attributes.MT5D,2) + Math.pow(graphic.attributes.MT5E,2) + Math.pow(graphic.attributes.MT5F,2) + Math.pow(graphic.attributes.MT5G,2) + Math.pow(graphic.attributes.MT5H,2) + Math.pow(graphic.attributes.MT5I,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);	
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F + graphic.attributes.T11G + graphic.attributes.T11H + graphic.attributes.T11I; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11A,2) + Math.pow(graphic.attributes.MT11B,2) + Math.pow(graphic.attributes.MT11C,2) + Math.pow(graphic.attributes.MT11D,2) + Math.pow(graphic.attributes.MT11E,2) + Math.pow(graphic.attributes.MT11F,2) + Math.pow(graphic.attributes.MT11G,2) + Math.pow(graphic.attributes.MT11H,2) + Math.pow(graphic.attributes.MT11I,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F + graphic.attributes.T17G + graphic.attributes.T17H + graphic.attributes.T17I; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17A,2) + Math.pow(graphic.attributes.MT17B,2) + Math.pow(graphic.attributes.MT17C,2) + Math.pow(graphic.attributes.MT17D,2) + Math.pow(graphic.attributes.MT17E,2) + Math.pow(graphic.attributes.MT17F,2) + Math.pow(graphic.attributes.MT17G,2) + Math.pow(graphic.attributes.MT17H,2) + Math.pow(graphic.attributes.MT17I,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F + graphic.attributes.T24G + graphic.attributes.T24H + graphic.attributes.T24I; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24A,2) + Math.pow(graphic.attributes.MT24B,2) + Math.pow(graphic.attributes.MT24C,2) + Math.pow(graphic.attributes.MT24D,2) + Math.pow(graphic.attributes.MT24E,2) + Math.pow(graphic.attributes.MT24F,2) + Math.pow(graphic.attributes.MT24G,2) + Math.pow(graphic.attributes.MT24H,2) + Math.pow(graphic.attributes.MT24I,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F + graphic.attributes.T34G + graphic.attributes.T34H + graphic.attributes.T34I; 
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34A,2) + Math.pow(graphic.attributes.MT34B,2) + Math.pow(graphic.attributes.MT34C,2) + Math.pow(graphic.attributes.MT34D,2) + Math.pow(graphic.attributes.MT34E,2) + Math.pow(graphic.attributes.MT34F,2) + Math.pow(graphic.attributes.MT34G,2) + Math.pow(graphic.attributes.MT34H,2) + Math.pow(graphic.attributes.MT34I,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F + graphic.attributes.T44G + graphic.attributes.T44H + graphic.attributes.T44I; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44A,2) + Math.pow(graphic.attributes.MT44B,2) + Math.pow(graphic.attributes.MT44C,2) + Math.pow(graphic.attributes.MT44D,2) + Math.pow(graphic.attributes.MT44E,2) + Math.pow(graphic.attributes.MT44F,2) + Math.pow(graphic.attributes.MT44G,2) + Math.pow(graphic.attributes.MT44H,2) + Math.pow(graphic.attributes.MT44I,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F + graphic.attributes.T54G + graphic.attributes.T54H + graphic.attributes.T54I; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54A,2) + Math.pow(graphic.attributes.MT54B,2) + Math.pow(graphic.attributes.MT54C,2) + Math.pow(graphic.attributes.MT54D,2) + Math.pow(graphic.attributes.MT54E,2) + Math.pow(graphic.attributes.MT54F,2) + Math.pow(graphic.attributes.MT54G,2) + Math.pow(graphic.attributes.MT54H,2) + Math.pow(graphic.attributes.MT54I,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F + graphic.attributes.T64G + graphic.attributes.T64H + graphic.attributes.T64I; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64A,2) + Math.pow(graphic.attributes.MT64B,2) + Math.pow(graphic.attributes.MT64C,2) + Math.pow(graphic.attributes.MT64D,2) + Math.pow(graphic.attributes.MT64E,2) + Math.pow(graphic.attributes.MT64F,2) + Math.pow(graphic.attributes.MT64G,2) + Math.pow(graphic.attributes.MT64H,2) + Math.pow(graphic.attributes.MT64I,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F + graphic.attributes.T74G + graphic.attributes.T74H + graphic.attributes.T74I; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74A,2) + Math.pow(graphic.attributes.MT74B,2) + Math.pow(graphic.attributes.MT74C,2) + Math.pow(graphic.attributes.MT74D,2) + Math.pow(graphic.attributes.MT74E,2) + Math.pow(graphic.attributes.MT74F,2) + Math.pow(graphic.attributes.MT74G,2) + Math.pow(graphic.attributes.MT74H,2) + Math.pow(graphic.attributes.MT74I,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F + graphic.attributes.T99G + graphic.attributes.T99H + graphic.attributes.T99I; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99A,2) + Math.pow(graphic.attributes.MT99B,2) + Math.pow(graphic.attributes.MT99C,2) + Math.pow(graphic.attributes.MT99D,2) + Math.pow(graphic.attributes.MT99E,2) + Math.pow(graphic.attributes.MT99F,2) + Math.pow(graphic.attributes.MT99G,2) + Math.pow(graphic.attributes.MT99H,2) + Math.pow(graphic.attributes.MT99I,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
	
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &lt;300% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &lt;300% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";	
	}
	
	if(level=="9"){  //400% Poverty

	if(group1){
	mapvar = mapvar + graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F + graphic.attributes.T5G + graphic.attributes.T5H + graphic.attributes.T5I + graphic.attributes.T5J; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5A,2) + Math.pow(graphic.attributes.MT5B,2) + Math.pow(graphic.attributes.MT5C,2) + Math.pow(graphic.attributes.MT5D,2) + Math.pow(graphic.attributes.MT5E,2) + Math.pow(graphic.attributes.MT5F,2) + Math.pow(graphic.attributes.MT5G,2) + Math.pow(graphic.attributes.MT5H,2) + Math.pow(graphic.attributes.MT5I,2) + Math.pow(graphic.attributes.MT5J,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);	
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F + graphic.attributes.T11G + graphic.attributes.T11H + graphic.attributes.T11I + graphic.attributes.T11J; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11A,2) + Math.pow(graphic.attributes.MT11B,2) + Math.pow(graphic.attributes.MT11C,2) + Math.pow(graphic.attributes.MT11D,2) + Math.pow(graphic.attributes.MT11E,2) + Math.pow(graphic.attributes.MT11F,2) + Math.pow(graphic.attributes.MT11G,2) + Math.pow(graphic.attributes.MT11H,2) + Math.pow(graphic.attributes.MT11I,2) + Math.pow(graphic.attributes.MT11J,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F + graphic.attributes.T17G + graphic.attributes.T17H + graphic.attributes.T17I + graphic.attributes.T17J; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17A,2) + Math.pow(graphic.attributes.MT17B,2) + Math.pow(graphic.attributes.MT17C,2) + Math.pow(graphic.attributes.MT17D,2) + Math.pow(graphic.attributes.MT17E,2) + Math.pow(graphic.attributes.MT17F,2) + Math.pow(graphic.attributes.MT17G,2) + Math.pow(graphic.attributes.MT17H,2) + Math.pow(graphic.attributes.MT17I,2) + Math.pow(graphic.attributes.MT17J,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F + graphic.attributes.T24G + graphic.attributes.T24H + graphic.attributes.T24I + graphic.attributes.T24J; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24A,2) + Math.pow(graphic.attributes.MT24B,2) + Math.pow(graphic.attributes.MT24C,2) + Math.pow(graphic.attributes.MT24D,2) + Math.pow(graphic.attributes.MT24E,2) + Math.pow(graphic.attributes.MT24F,2) + Math.pow(graphic.attributes.MT24G,2) + Math.pow(graphic.attributes.MT24H,2) + Math.pow(graphic.attributes.MT24I,2) + Math.pow(graphic.attributes.MT24J,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F + graphic.attributes.T34G + graphic.attributes.T34H + graphic.attributes.T34I + graphic.attributes.T34J;
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34A,2) + Math.pow(graphic.attributes.MT34B,2) + Math.pow(graphic.attributes.MT34C,2) + Math.pow(graphic.attributes.MT34D,2) + Math.pow(graphic.attributes.MT34E,2) + Math.pow(graphic.attributes.MT34F,2) + Math.pow(graphic.attributes.MT34G,2) + Math.pow(graphic.attributes.MT34H,2) + Math.pow(graphic.attributes.MT34I,2) + Math.pow(graphic.attributes.MT34J,2);
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F + graphic.attributes.T44G + graphic.attributes.T44H + graphic.attributes.T44I + graphic.attributes.T44J; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44A,2) + Math.pow(graphic.attributes.MT44B,2) + Math.pow(graphic.attributes.MT44C,2) + Math.pow(graphic.attributes.MT44D,2) + Math.pow(graphic.attributes.MT44E,2) + Math.pow(graphic.attributes.MT44F,2) + Math.pow(graphic.attributes.MT44G,2) + Math.pow(graphic.attributes.MT44H,2) + Math.pow(graphic.attributes.MT44I,2) + Math.pow(graphic.attributes.MT44J,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F + graphic.attributes.T54G + graphic.attributes.T54H + graphic.attributes.T54I + graphic.attributes.T54J; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54A,2) + Math.pow(graphic.attributes.MT54B,2) + Math.pow(graphic.attributes.MT54C,2) + Math.pow(graphic.attributes.MT54D,2) + Math.pow(graphic.attributes.MT54E,2) + Math.pow(graphic.attributes.MT54F,2) + Math.pow(graphic.attributes.MT54G,2) + Math.pow(graphic.attributes.MT54H,2) + Math.pow(graphic.attributes.MT54I,2) + Math.pow(graphic.attributes.MT54J,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F + graphic.attributes.T64G + graphic.attributes.T64H + graphic.attributes.T64I + graphic.attributes.T64J; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64A,2) + Math.pow(graphic.attributes.MT64B,2) + Math.pow(graphic.attributes.MT64C,2) + Math.pow(graphic.attributes.MT64D,2) + Math.pow(graphic.attributes.MT64E,2) + Math.pow(graphic.attributes.MT64F,2) + Math.pow(graphic.attributes.MT64G,2) + Math.pow(graphic.attributes.MT64H,2) + Math.pow(graphic.attributes.MT64I,2) + Math.pow(graphic.attributes.MT64J,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F + graphic.attributes.T74G + graphic.attributes.T74H + graphic.attributes.T74I + graphic.attributes.T74J; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74A,2) + Math.pow(graphic.attributes.MT74B,2) + Math.pow(graphic.attributes.MT74C,2) + Math.pow(graphic.attributes.MT74D,2) + Math.pow(graphic.attributes.MT74E,2) + Math.pow(graphic.attributes.MT74F,2) + Math.pow(graphic.attributes.MT74G,2) + Math.pow(graphic.attributes.MT74H,2) + Math.pow(graphic.attributes.MT74I,2) + Math.pow(graphic.attributes.MT74J,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F + graphic.attributes.T99G + graphic.attributes.T99H + graphic.attributes.T99I + graphic.attributes.T99J; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99A,2) + Math.pow(graphic.attributes.MT99B,2) + Math.pow(graphic.attributes.MT99C,2) + Math.pow(graphic.attributes.MT99D,2) + Math.pow(graphic.attributes.MT99E,2) + Math.pow(graphic.attributes.MT99F,2) + Math.pow(graphic.attributes.MT99G,2) + Math.pow(graphic.attributes.MT99H,2) + Math.pow(graphic.attributes.MT99I,2) + Math.pow(graphic.attributes.MT99J,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
	
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &lt;400% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &lt;400% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";	
	}

	if(level=="10"){  //500% Poverty

	if(group1){
	mapvar = mapvar + graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F + graphic.attributes.T5G + graphic.attributes.T5H + graphic.attributes.T5I + graphic.attributes.T5J + graphic.attributes.T5K; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5A,2) + Math.pow(graphic.attributes.MT5B,2) + Math.pow(graphic.attributes.MT5C,2) + Math.pow(graphic.attributes.MT5D,2) + Math.pow(graphic.attributes.MT5E,2) + Math.pow(graphic.attributes.MT5F,2) + Math.pow(graphic.attributes.MT5G,2) + Math.pow(graphic.attributes.MT5H,2) + Math.pow(graphic.attributes.MT5I,2) + Math.pow(graphic.attributes.MT5J,2) + Math.pow(graphic.attributes.MT5K,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);	
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F + graphic.attributes.T11G + graphic.attributes.T11H + graphic.attributes.T11I + graphic.attributes.T11J + graphic.attributes.T11K; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11A,2) + Math.pow(graphic.attributes.MT11B,2) + Math.pow(graphic.attributes.MT11C,2) + Math.pow(graphic.attributes.MT11D,2) + Math.pow(graphic.attributes.MT11E,2) + Math.pow(graphic.attributes.MT11F,2) + Math.pow(graphic.attributes.MT11G,2) + Math.pow(graphic.attributes.MT11H,2) + Math.pow(graphic.attributes.MT11I,2) + Math.pow(graphic.attributes.MT11J,2) + Math.pow(graphic.attributes.MT11K,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F + graphic.attributes.T17G + graphic.attributes.T17H + graphic.attributes.T17I + graphic.attributes.T17J + graphic.attributes.T17K; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17A,2) + Math.pow(graphic.attributes.MT17B,2) + Math.pow(graphic.attributes.MT17C,2) + Math.pow(graphic.attributes.MT17D,2) + Math.pow(graphic.attributes.MT17E,2) + Math.pow(graphic.attributes.MT17F,2) + Math.pow(graphic.attributes.MT17G,2) + Math.pow(graphic.attributes.MT17H,2) + Math.pow(graphic.attributes.MT17I,2) + Math.pow(graphic.attributes.MT17J,2) + Math.pow(graphic.attributes.MT17K,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F + graphic.attributes.T24G + graphic.attributes.T24H + graphic.attributes.T24I + graphic.attributes.T24J + graphic.attributes.T24K; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24A,2) + Math.pow(graphic.attributes.MT24B,2) + Math.pow(graphic.attributes.MT24C,2) + Math.pow(graphic.attributes.MT24D,2) + Math.pow(graphic.attributes.MT24E,2) + Math.pow(graphic.attributes.MT24F,2) + Math.pow(graphic.attributes.MT24G,2) + Math.pow(graphic.attributes.MT24H,2) + Math.pow(graphic.attributes.MT24I,2) + Math.pow(graphic.attributes.MT24J,2) + Math.pow(graphic.attributes.MT24K,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F + graphic.attributes.T34G + graphic.attributes.T34H + graphic.attributes.T34I + graphic.attributes.T34J + graphic.attributes.T34K; 
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34A,2) + Math.pow(graphic.attributes.MT34B,2) + Math.pow(graphic.attributes.MT34C,2) + Math.pow(graphic.attributes.MT34D,2) + Math.pow(graphic.attributes.MT34E,2) + Math.pow(graphic.attributes.MT34F,2) + Math.pow(graphic.attributes.MT34G,2) + Math.pow(graphic.attributes.MT34H,2) + Math.pow(graphic.attributes.MT34I,2) + Math.pow(graphic.attributes.MT34J,2) + Math.pow(graphic.attributes.MT34K,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F + graphic.attributes.T44G + graphic.attributes.T44H + graphic.attributes.T44I + graphic.attributes.T44J + graphic.attributes.T44K; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44A,2) + Math.pow(graphic.attributes.MT44B,2) + Math.pow(graphic.attributes.MT44C,2) + Math.pow(graphic.attributes.MT44D,2) + Math.pow(graphic.attributes.MT44E,2) + Math.pow(graphic.attributes.MT44F,2) + Math.pow(graphic.attributes.MT44G,2) + Math.pow(graphic.attributes.MT44H,2) + Math.pow(graphic.attributes.MT44I,2) + Math.pow(graphic.attributes.MT44J,2) + Math.pow(graphic.attributes.MT44K,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F + graphic.attributes.T54G + graphic.attributes.T54H + graphic.attributes.T54I + graphic.attributes.T54J + graphic.attributes.T54K; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54A,2) + Math.pow(graphic.attributes.MT54B,2) + Math.pow(graphic.attributes.MT54C,2) + Math.pow(graphic.attributes.MT54D,2) + Math.pow(graphic.attributes.MT54E,2) + Math.pow(graphic.attributes.MT54F,2) + Math.pow(graphic.attributes.MT54G,2) + Math.pow(graphic.attributes.MT54H,2) + Math.pow(graphic.attributes.MT54I,2) + Math.pow(graphic.attributes.MT54J,2) + Math.pow(graphic.attributes.MT54K,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F + graphic.attributes.T64G + graphic.attributes.T64H + graphic.attributes.T64I + graphic.attributes.T64J + graphic.attributes.T64K; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64A,2) + Math.pow(graphic.attributes.MT64B,2) + Math.pow(graphic.attributes.MT64C,2) + Math.pow(graphic.attributes.MT64D,2) + Math.pow(graphic.attributes.MT64E,2) + Math.pow(graphic.attributes.MT64F,2) + Math.pow(graphic.attributes.MT64G,2) + Math.pow(graphic.attributes.MT64H,2) + Math.pow(graphic.attributes.MT64I,2) + Math.pow(graphic.attributes.MT64J,2) + Math.pow(graphic.attributes.MT64K,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F + graphic.attributes.T74G + graphic.attributes.T74H + graphic.attributes.T74I + graphic.attributes.T74J + graphic.attributes.T74K; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74A,2) + Math.pow(graphic.attributes.MT74B,2) + Math.pow(graphic.attributes.MT74C,2) + Math.pow(graphic.attributes.MT74D,2) + Math.pow(graphic.attributes.MT74E,2) + Math.pow(graphic.attributes.MT74F,2) + Math.pow(graphic.attributes.MT74G,2) + Math.pow(graphic.attributes.MT74H,2) + Math.pow(graphic.attributes.MT74I,2) + Math.pow(graphic.attributes.MT74J,2) + Math.pow(graphic.attributes.MT74K,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F + graphic.attributes.T99G + graphic.attributes.T99H + graphic.attributes.T99I + graphic.attributes.T99J + graphic.attributes.T99K; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99A,2) + Math.pow(graphic.attributes.MT99B,2) + Math.pow(graphic.attributes.MT99C,2) + Math.pow(graphic.attributes.MT99D,2) + Math.pow(graphic.attributes.MT99E,2) + Math.pow(graphic.attributes.MT99F,2) + Math.pow(graphic.attributes.MT99G,2) + Math.pow(graphic.attributes.MT99H,2) + Math.pow(graphic.attributes.MT99I,2) + Math.pow(graphic.attributes.MT99J,2) + Math.pow(graphic.attributes.MT99K,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
	
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &lt;500% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &lt;500% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";	
	}	
	
	if(level=="11"){  //At or Above 500% Poverty

	if(group1){
	mapvar = mapvar + graphic.attributes.T5L; 
	ttlvar = ttlvar + graphic.attributes.T5;
	moevar = moevar + Math.pow(graphic.attributes.MT5L,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT5,2);	
	}
	if(group2){
	mapvar = mapvar + graphic.attributes.T11L; 
	ttlvar = ttlvar + graphic.attributes.T11;
	moevar = moevar + Math.pow(graphic.attributes.MT11L,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT11,2);	
	}	
	if(group3){
	mapvar = mapvar + graphic.attributes.T17L; 
	ttlvar = ttlvar + graphic.attributes.T17;
	moevar = moevar + Math.pow(graphic.attributes.MT17L,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT17,2);	
	}
	if(group4){
	mapvar = mapvar + graphic.attributes.T24L; 
	ttlvar = ttlvar + graphic.attributes.T24;
	moevar = moevar + Math.pow(graphic.attributes.MT24L,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT24,2);	
	}
	if(group5){
	mapvar = mapvar + graphic.attributes.T34L; 
	ttlvar = ttlvar + graphic.attributes.T34;
	moevar = moevar + Math.pow(graphic.attributes.MT34L,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT34,2);	
	}
	if(group6){
	mapvar = mapvar + graphic.attributes.T44L; 
	ttlvar = ttlvar + graphic.attributes.T44;
	moevar = moevar + Math.pow(graphic.attributes.MT44L,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT44,2);	
	}
	if(group7){
	mapvar = mapvar + graphic.attributes.T54L; 
	ttlvar = ttlvar + graphic.attributes.T54;
	moevar = moevar + Math.pow(graphic.attributes.MT54L,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT54,2);	
	}
	if(group8){
	mapvar = mapvar + graphic.attributes.T64L; 
	ttlvar = ttlvar + graphic.attributes.T64;
	moevar = moevar + Math.pow(graphic.attributes.MT64L,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT64,2);	
	}
	if(group9){
	mapvar = mapvar + graphic.attributes.T74L; 
	ttlvar = ttlvar + graphic.attributes.T74;
	moevar = moevar + Math.pow(graphic.attributes.MT74L,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT74,2);	
	}
	if(group10){
	mapvar = mapvar + graphic.attributes.T99L; 
	ttlvar = ttlvar + graphic.attributes.T99;
	moevar = moevar + Math.pow(graphic.attributes.MT99L,2); 
	moeuniv = moeuniv + Math.pow(graphic.attributes.MT99,2);	
	}	
		
	finalvar = (( mapvar / ttlvar ) * 100).toFixed(1);
	
	moevar=Math.sqrt(moevar);
	moeuniv=Math.sqrt(moeuniv);	
	
	pctmoe = ((Math.sqrt(Math.pow(moevar, 2) - (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
	checka=isNaN(pctmoe);
	if(checka){
		pctmoe = ((Math.sqrt(Math.pow(moevar, 2) + (Math.pow((mapvar / ttlvar), 2) * Math.pow(moeuniv, 2))) / ttlvar) * 100).toFixed(1);
		console.log('derived proportion failed');
	};
	
	tcontent = tcontent + "<br /><table class='smallfont'><tr><th style='text-align:left'><b>" + lowage + highage + "</b></th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#</th><th style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MOE</th></tr>"
	tcontent = tcontent + "<tr><td>Total Sample: </td><td  style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(ttlvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moeuniv.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Persons at &gt;500% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + commafy(mapvar) + "</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + moevar.toFixed(0) + "</td></tr>";
	tcontent = tcontent + "<tr><td>Percent at &gt;500% Poverty: </td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + finalvar + "%</td><td style='text-align:right'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&plusmn;&nbsp;" + pctmoe + "%</td></tr>";	
	tcontent = tcontent + "</table>";	
	}	
	
	

	return tcontent;
	
}

function getText2(graphic){
	
	var tcontent="<table><tr><td>Center Name:&nbsp;&nbsp;</td><td><b>"+ graphic.attributes.CenterName+"</b></td></tr><tr><td>Address:&nbsp;&nbsp;</td><td><b>"+graphic.attributes.Full_Addre +"</b></td></tr><tr><td>Days Open:&nbsp;&nbsp;</td><td><b>"+graphic.attributes.Days+"</b></td></tr></table>";

	return tcontent;

}




function handleClick() {

var zoomlev=map.getZoom();



if(zoomlev==9){dotsize=1.5; dotValue=64;};
if(zoomlev==10){dotsize=1.5; dotValue=32;};
if(zoomlev==11){dotsize=1.5; dotValue=16;};
if(zoomlev==12){dotsize=1.5; dotValue=8;};
if(zoomlev==13){dotsize=1.5; dotValue=4;};
if(zoomlev==14){dotsize=2; dotValue=4;};
if(zoomlev==15){dotsize=3; dotValue=2;};
if(zoomlev==16){dotsize=4; dotValue=1;};


	var startren='new esri.renderer.DotDensityRenderer({fields: [';
	var middleren='{name: "T64", color: new dojo.Color("#000000")},'+'{name: "T74", color: new dojo.Color("#000000")},'+'{name: "T99", color: new dojo.Color("#000000")}';	
	var endren='], dotValue: '+dotValue+', dotSize: '+dotsize+'});';

	var level = $('#levelinput').val();
	
	var agef = $('#agefrom').val();	
	var aget = $('#ageto').val();	
	
	var group1=false;var group2=false;var group3=false;var group4=false;var group5=false;var group6=false;var group7=false;var group8=false;var group9=false;var group10=false;	
	if(agef=='0'){group1=true;group2=true;group3=true;group4=true;group5=true;group6=true;group7=true;group8=true;group9=true;group10=true;}
	if(agef=='1'){group2=true;group3=true;group4=true;group5=true;group6=true;group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='2'){group3=true;group4=true;group5=true;group6=true;group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='3'){group4=true;group5=true;group6=true;group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='4'){group5=true;group6=true;group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='5'){group6=true;group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='6'){group7=true;group8=true;group9=true;group10=true;}	
	if(agef=='7'){group8=true;group9=true;group10=true;}	
	if(agef=='8'){group9=true;group10=true;}	
	if(agef=='9'){group10=true;}	
	if(aget=='0'){group2=false;group3=false;group4=false;group5=false;group6=false;group7=false;group8=false;group9=false;group10=false;}
	if(aget=='1'){group3=false;group4=false;group5=false;group6=false;group7=false;group8=false;group9=false;group10=false;}
	if(aget=='2'){group4=false;group5=false;group6=false;group7=false;group8=false;group9=false;group10=false;}
	if(aget=='3'){group5=false;group6=false;group7=false;group8=false;group9=false;group10=false;}
	if(aget=='4'){group6=false;group7=false;group8=false;group9=false;group10=false;}
	if(aget=='5'){group7=false;group8=false;group9=false;group10=false;}
	if(aget=='6'){group8=false;group9=false;group10=false;}	
	if(aget=='7'){group9=false;group10=false;}		
	if(aget=='8'){group10=false;}			
	
	
	var mapvar="";
	var ttlvar="";
	
	if(level=="0"){  //50% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5A + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11A + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17A + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24A + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34A + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44A + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54A + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64A + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74A + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99A + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}
	
	if(level=="1"){  //75% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5A + graphic.attributes.T5B + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11A + graphic.attributes.T11B + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17A + graphic.attributes.T17B + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24A + graphic.attributes.T24B + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34A + graphic.attributes.T34B + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44A + graphic.attributes.T44B + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54A + graphic.attributes.T54B + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64A + graphic.attributes.T64B + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74A + graphic.attributes.T74B + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99A + graphic.attributes.T99B + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}
	
	if(level=="2"){  //100% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}
	
	if(level=="3"){  //125% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}
	
	if(level=="4"){  //150% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}
	
	if(level=="5"){  //175% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}
	
	if(level=="6"){  //185% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F + graphic.attributes.T5G + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F + graphic.attributes.T11G + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F + graphic.attributes.T17G + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F + graphic.attributes.T24G + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F + graphic.attributes.T34G + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F + graphic.attributes.T44G + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F + graphic.attributes.T54G + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F + graphic.attributes.T64G + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F + graphic.attributes.T74G + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F + graphic.attributes.T99G + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}
	
	if(level=="7"){  //200% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F + graphic.attributes.T5G + graphic.attributes.T5H + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F + graphic.attributes.T11G + graphic.attributes.T11H + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F + graphic.attributes.T17G + graphic.attributes.T17H + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F + graphic.attributes.T24G + graphic.attributes.T24H + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F + graphic.attributes.T34G + graphic.attributes.T34H + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F + graphic.attributes.T44G + graphic.attributes.T44H + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F + graphic.attributes.T54G + graphic.attributes.T54H + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F + graphic.attributes.T64G + graphic.attributes.T64H + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F + graphic.attributes.T74G + graphic.attributes.T74H + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F + graphic.attributes.T99G + graphic.attributes.T99H + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}
	
	if(level=="8"){  //300% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F + graphic.attributes.T5G + graphic.attributes.T5H + graphic.attributes.T5I + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F + graphic.attributes.T11G + graphic.attributes.T11H + graphic.attributes.T11I + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F + graphic.attributes.T17G + graphic.attributes.T17H + graphic.attributes.T17I + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F + graphic.attributes.T24G + graphic.attributes.T24H + graphic.attributes.T24I + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F + graphic.attributes.T34G + graphic.attributes.T34H + graphic.attributes.T34I + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F + graphic.attributes.T44G + graphic.attributes.T44H + graphic.attributes.T44I + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F + graphic.attributes.T54G + graphic.attributes.T54H + graphic.attributes.T54I + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F + graphic.attributes.T64G + graphic.attributes.T64H + graphic.attributes.T64I + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F + graphic.attributes.T74G + graphic.attributes.T74H + graphic.attributes.T74I + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F + graphic.attributes.T99G + graphic.attributes.T99H + graphic.attributes.T99I + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}
	
	if(level=="9"){  //400% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F + graphic.attributes.T5G + graphic.attributes.T5H + graphic.attributes.T5I + graphic.attributes.T5J + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F + graphic.attributes.T11G + graphic.attributes.T11H + graphic.attributes.T11I + graphic.attributes.T11J + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F + graphic.attributes.T17G + graphic.attributes.T17H + graphic.attributes.T17I + graphic.attributes.T17J + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F + graphic.attributes.T24G + graphic.attributes.T24H + graphic.attributes.T24I + graphic.attributes.T24J + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F + graphic.attributes.T34G + graphic.attributes.T34H + graphic.attributes.T34I + graphic.attributes.T34J + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F + graphic.attributes.T44G + graphic.attributes.T44H + graphic.attributes.T44I + graphic.attributes.T44J + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F + graphic.attributes.T54G + graphic.attributes.T54H + graphic.attributes.T54I + graphic.attributes.T54J + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F + graphic.attributes.T64G + graphic.attributes.T64H + graphic.attributes.T64I + graphic.attributes.T64J + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F + graphic.attributes.T74G + graphic.attributes.T74H + graphic.attributes.T74I + graphic.attributes.T74J + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F + graphic.attributes.T99G + graphic.attributes.T99H + graphic.attributes.T99I + graphic.attributes.T99J + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}

	if(level=="10"){  //500% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5A + graphic.attributes.T5B + graphic.attributes.T5C + graphic.attributes.T5D + graphic.attributes.T5E + graphic.attributes.T5F + graphic.attributes.T5G + graphic.attributes.T5H + graphic.attributes.T5I + graphic.attributes.T5J + graphic.attributes.T5K + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11A + graphic.attributes.T11B + graphic.attributes.T11C + graphic.attributes.T11D + graphic.attributes.T11E + graphic.attributes.T11F + graphic.attributes.T11G + graphic.attributes.T11H + graphic.attributes.T11I + graphic.attributes.T11J + graphic.attributes.T11K + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17A + graphic.attributes.T17B + graphic.attributes.T17C + graphic.attributes.T17D + graphic.attributes.T17E + graphic.attributes.T17F + graphic.attributes.T17G + graphic.attributes.T17H + graphic.attributes.T17I + graphic.attributes.T17J + graphic.attributes.T17K + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24A + graphic.attributes.T24B + graphic.attributes.T24C + graphic.attributes.T24D + graphic.attributes.T24E + graphic.attributes.T24F + graphic.attributes.T24G + graphic.attributes.T24H + graphic.attributes.T24I + graphic.attributes.T24J + graphic.attributes.T24K + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34A + graphic.attributes.T34B + graphic.attributes.T34C + graphic.attributes.T34D + graphic.attributes.T34E + graphic.attributes.T34F + graphic.attributes.T34G + graphic.attributes.T34H + graphic.attributes.T34I + graphic.attributes.T34J + graphic.attributes.T34K + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44A + graphic.attributes.T44B + graphic.attributes.T44C + graphic.attributes.T44D + graphic.attributes.T44E + graphic.attributes.T44F + graphic.attributes.T44G + graphic.attributes.T44H + graphic.attributes.T44I + graphic.attributes.T44J + graphic.attributes.T44K + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54A + graphic.attributes.T54B + graphic.attributes.T54C + graphic.attributes.T54D + graphic.attributes.T54E + graphic.attributes.T54F + graphic.attributes.T54G + graphic.attributes.T54H + graphic.attributes.T54I + graphic.attributes.T54J + graphic.attributes.T54K + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64A + graphic.attributes.T64B + graphic.attributes.T64C + graphic.attributes.T64D + graphic.attributes.T64E + graphic.attributes.T64F + graphic.attributes.T64G + graphic.attributes.T64H + graphic.attributes.T64I + graphic.attributes.T64J + graphic.attributes.T64K + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74A + graphic.attributes.T74B + graphic.attributes.T74C + graphic.attributes.T74D + graphic.attributes.T74E + graphic.attributes.T74F + graphic.attributes.T74G + graphic.attributes.T74H + graphic.attributes.T74I + graphic.attributes.T74J + graphic.attributes.T74K + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99A + graphic.attributes.T99B + graphic.attributes.T99C + graphic.attributes.T99D + graphic.attributes.T99E + graphic.attributes.T99F + graphic.attributes.T99G + graphic.attributes.T99H + graphic.attributes.T99I + graphic.attributes.T99J + graphic.attributes.T99K + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}	
	
	if(level=="11"){  //At or Above 500% Poverty
	mapvar = "((";
	if(group1){mapvar = mapvar + "graphic.attributes.T5L + "; ttlvar = ttlvar + "graphic.attributes.T5 +";}
	if(group2){mapvar = mapvar + "graphic.attributes.T11L + "; ttlvar = ttlvar + "graphic.attributes.T11 +";}	
	if(group3){mapvar = mapvar + "graphic.attributes.T17L + "; ttlvar = ttlvar + "graphic.attributes.T17 +";}
	if(group4){mapvar = mapvar + "graphic.attributes.T24L + "; ttlvar = ttlvar + "graphic.attributes.T24 +";}
	if(group5){mapvar = mapvar + "graphic.attributes.T34L + "; ttlvar = ttlvar + "graphic.attributes.T34 +";}
	if(group6){mapvar = mapvar + "graphic.attributes.T44L + "; ttlvar = ttlvar + "graphic.attributes.T44 +";}
	if(group7){mapvar = mapvar + "graphic.attributes.T54L + "; ttlvar = ttlvar + "graphic.attributes.T54 +";}
	if(group8){mapvar = mapvar + "graphic.attributes.T64L + "; ttlvar = ttlvar + "graphic.attributes.T64 +";}
	if(group9){mapvar = mapvar + "graphic.attributes.T74L + "; ttlvar = ttlvar + "graphic.attributes.T74 +";}
	if(group10){mapvar = mapvar + "graphic.attributes.T99L + "; ttlvar = ttlvar + "graphic.attributes.T99 +";}	
	mapvar = mapvar + " 0)/("+ttlvar+" 0))*100;"

	}	
	

	map.infoWindow.hide();
	
	
	if(level=="11"){  //renderer specifically for >500%
		var renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {return(eval(mapvar))});
	renderer.addBreak({
		minValue : 0,
		maxValue : 5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([165, 0, 38, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "< 5% of Population"
	});
	renderer.addBreak({
		minValue : 5,
		maxValue : 10,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([215, 48, 39, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "5% to 10%"
	});
	renderer.addBreak({
		minValue : 10,
		maxValue : 15,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([244, 109, 67, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "10% to 15%"
	});
	renderer.addBreak({
		minValue : 15,
		maxValue : 20,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 174, 97, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "15% to 20%"
	});
	renderer.addBreak({
		minValue : 20,
		maxValue : 25,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 224, 144, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "20% of 25%"
	});
	renderer.addBreak({
		minValue : 25,
		maxValue : 30,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 255, 191, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "25% to 30%"
	});
	renderer.addBreak({
		minValue : 30,
		maxValue : 35,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([224, 243, 248, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "30% to 35%"
	});
	renderer.addBreak({
		minValue : 35,
		maxValue : 40,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([171, 217, 233, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "35% to 40%"
	});
	renderer.addBreak({
		minValue : 40,
		maxValue : 45,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([116, 173, 209, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "40% to 45%"
	});
	renderer.addBreak({
		minValue : 45,
		maxValue : 50,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([69, 117, 180, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "45% to 50%"
	});
	renderer.addBreak({
		minValue : 50,
		maxValue : Infinity,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([49, 54, 149, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "> 50%"
	});	
	featureLayer.setRenderer(renderer);
	featureLayer.redraw();
	}else{
	
	var renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {return(eval(mapvar))});
	renderer.addBreak({
		minValue : 0,
		maxValue : 5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 104, 55, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "< 5% of Population"
	});
	renderer.addBreak({
		minValue : 5,
		maxValue : 10,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([26, 152, 80, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "5% to 10%"
	});
	renderer.addBreak({
		minValue : 10,
		maxValue : 15,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([102, 189, 99, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "10% to 15%"
	});
	renderer.addBreak({
		minValue : 15,
		maxValue : 20,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([166, 217, 106, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "15% to 20%"
	});
	renderer.addBreak({
		minValue : 20,
		maxValue : 25,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([217, 239, 139, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "20% of 25%"
	});
	renderer.addBreak({
		minValue : 25,
		maxValue : 30,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 255, 191, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "25% to 30%"
	});
	renderer.addBreak({
		minValue : 30,
		maxValue : 35,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 224, 139, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "30% to 35%"
	});
	renderer.addBreak({
		minValue : 35,
		maxValue : 40,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 174, 97, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "35% to 40%"
	});
	renderer.addBreak({
		minValue : 40,
		maxValue : 45,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([244, 109, 67, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "40% to 45%"
	});
	renderer.addBreak({
		minValue : 45,
		maxValue : 50,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([215, 48, 39, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "45% to 50%"
	});
	renderer.addBreak({
		minValue : 50,
		maxValue : Infinity,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([165, 0, 38, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "> 50%"
	});	
	


}


	featureLayer.setRenderer(renderer);	
	featureLayer.redraw();
	
//if checkbox is checked
	
	    var DDrenderer = eval(startren+middleren+endren);
		
	featureLayer2.setRenderer(DDrenderer);	
	featureLayer2.redraw();

	
//end of function

setTimeout(function(){legend.refresh();}, 1000);

}

function makeid() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 5; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function Clickhereformap(mainid) {

	//new ({ wkid: 4326});
	//old ({ wkid: 102100});
	var oldx = (map.extent.xmin + map.extent.xmax) / 2;
	var oldy = (map.extent.ymin + map.extent.ymax) / 2;

	//function convert spatial ref 102100 to spatial ref 4326
	var x = oldx;
	var y = oldy;
	var num3 = x / 6378137.0;
	var num4 = num3 * 57.295779513082323;
	var num5 = Math.floor(((num4 + 180.0) / 360.0));
	var num6 = num4 - (num5 * 360.0);
	var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
	var newx = num6;
	var newy = num7 * 57.295779513082323;

	var sendtitle;

	var agef = $('#agefrom').val();	
	var aget = $('#ageto').val();	
	var pvt = $('#levelinput').val();		
	
	var lowage="";
	var highage="";
	var povtext="";
	
	if(pvt=="0"){povtext="Percent at &lt; 50% Poverty: ";};
	if(pvt=="1"){povtext="Percent at &lt; 75% Poverty: ";};
	if(pvt=="2"){povtext="Percent at &lt; 100% Poverty: ";};
	if(pvt=="3"){povtext="Percent at &lt; 125% Poverty: ";};
	if(pvt=="4"){povtext="Percent at &lt; 150% Poverty: ";};
	if(pvt=="5"){povtext="Percent at &lt; 175% Poverty: ";};
	if(pvt=="6"){povtext="Percent at &lt; 185% Poverty: ";};
	if(pvt=="7"){povtext="Percent at &lt; 200% Poverty: ";};
	if(pvt=="8"){povtext="Percent at &lt; 300% Poverty: ";};
	if(pvt=="9"){povtext="Percent at &lt; 400% Poverty: ";};
	if(pvt=="10"){povtext="Percent at &lt; 500% Poverty: ";};
	if(pvt=="11"){povtext="Percent &ge; 500% Poverty: ";};
	
	if(agef=="0"){lowage="From Age 0";};
	if(agef=="1"){lowage="From Age 6";};
	if(agef=="2"){lowage="From Age 12";};
	if(agef=="3"){lowage="From Age 18";};
	if(agef=="4"){lowage="From Age 25";};
	if(agef=="5"){lowage="From Age 35";};
	if(agef=="6"){lowage="From Age 45";};
	if(agef=="7"){lowage="From Age 55";};
	if(agef=="8"){lowage="From Age 65";};
	if(agef=="9"){lowage="From Age 75";};

	if(aget=="0"){highage=" to 5";};
	if(aget=="1"){highage=" to 11";};
	if(aget=="2"){highage=" to 17";};
	if(aget=="3"){highage=" to 24";};
	if(aget=="4"){highage=" to 34";};
	if(aget=="5"){highage=" to 44";};
	if(aget=="6"){highage=" to 54";};
	if(aget=="7"){highage=" to 64";};
	if(aget=="8"){highage=" to 74";};
	if(aget=="9"){highage="+";};	
	
	sendtitle=povtext+lowage+highage;

	var newobj = new Object();
	newobj.zoom = map.getZoom();
	newobj.filename = "https://dola.colorado.gov/gis-php/phantomComprPoverty.html";
	newobj.lat = newy;
	newobj.lng = newx;
	newobj.title = encodeURIComponent(sendtitle);
	newobj.agef = $('#agefrom').val();	
	newobj.aget = $('#ageto').val();	
	newobj.pct = $('#levelinput').val();
	newobj.outname = makeid();
	//output file name  ... makeid() is function creates random 5 letter filename

	$('#printspan').html('Processing...');

	$.get("https://dola.colorado.gov/gis-php/comprpoverty.php", newobj, function() {
		$('#printspan').html('DOWNLOAD');
		$('#uniform-printbtns').attr("onClick", "opmapwin('" + newobj.outname + "')");
	});

}

function opmapwin(outname) {
	window.open("https://dola.colorado.gov/tmp/" + outname + ".png");
	$('#printspan').html("Print Map");
	$('#uniform-printbtns').attr("onClick", "javascript:Clickhereformap('uniform-printbtns')");
}

function closeadvancedbox() {
	$('#advancedbox').toggle();
}

dojo.ready(init); 