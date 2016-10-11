/**
 * Created by mq on 2016/7/4.
 */

$(function(){
    var formate = "YYYY/MM/DD",firstdate,enddate;
    $("#starthour").click(function(){
        laydate(setFirstLaydate(false,firstdate,laydate.now(0),formate));
    });
    $("#endhour").click(function(){
        laydate(setLastLaydate(false,enddate,firstdate,laydate.now(0),formate));
    });
    $("#searchpng").click(function(){
        fillRow();
    });
    $("#week").click(function(){
        var currentTime = (new Date()).getTime();
        firstdate = dataFormate(currentTime - 7*24*60*60*1000,"yyyy/MM/dd");
        enddate = dataFormate(currentTime,"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        fillRow();
    });
    $("#month").click(function(){
        var currentTime = new Date();
        var year = currentTime.getFullYear(), month = currentTime.getMonth()+1, day = currentTime.getDate();
        firstdate = dataFormate((new Date(year+"/"+(month-1)+"/"+day)).getTime(),"yyyy/MM/dd");
        enddate = dataFormate((new Date()).getTime(),"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        fillRow();
    });
    $("#quarter").click(function(){
        var currentTime = new Date();
        var year = currentTime.getFullYear(), month = currentTime.getMonth()+1, day = currentTime.getDate();
        firstdate = dataFormate((new Date(year+"/"+(month-3)+"/"+day)).getTime(),"yyyy/MM/dd");
        enddate = dataFormate((new Date()).getTime(),"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        fillRow();
    });
    $("#fuelDirect").change(function(){
        initTable();
    });
    var firstdate, enddate, stockInfoId = getStockId("fuel"),fuelInStock = new Array(),fuelOutStock = new Array();
    sortOp("fuelStockManager","currentpage","pagelimit",10);
    setFirstLaydate(false,laydate.now(-7),laydate.now(0),formate);
    setLastLaydate(false,laydate.now(0),firstdate,laydate.now(0),formate);
    $("#starthour").val(firstdate);
    $("#endhour").val(enddate);

    fillRow();
    //填充表数据
    function fillRow() {
        fuelOutStock = new Array();
        fuelInStock = new Array();
        var fuelParm = new Object(),page_object = new Object(),find = new Object(),
            timeParm = new Object(),sort = new Object();
        timeParm.start = (new Date(firstdate +" 0:0:0")).getTime();
        timeParm.end = (new Date(enddate +" 0:0:0")).getTime();
        page_object.max="2000";
        page_object.start="0";
        find.dataId = stockInfoId;
        find.time = timeParm;
        sort.desc = "time";
        fuelParm.page = page_object;
        fuelParm.find = find;
        fuelParm.sort = sort;
        var responsedata = JSON.parse(listImportData("fuel",fuelParm)),
            invaluePointArray = new Array(), outvaluePointArray = new Array(),
            inStockTotal = 0, outStockTotal = 0;
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            for (var i = 0; i < datas.length; i++) {
                var direct = datas[i]["direct"]== undefined?"":datas[i]["direct"],
                    much = datas[i]["much"]== undefined?"":datas[i]["much"];
                if(direct == "in"){
                    inStockTotal += much;
                    fuelInStock.push(datas[i]);
                }else{
                    outStockTotal += much;
                    fuelOutStock.push(datas[i]);
                }
            }
        }
        page_object.start="0";
        timeParm.scale = "day";
        find.time = timeParm;
        fuelParm.find = find;
        fuelParm.sort = undefined;
        //查询库存余量
        var responsedata = JSON.parse(storageList("history",fuelParm));
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            for (var i = 0; i < datas.length; i++) {
                var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                    time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                    inNum = datas[i]["in"] == undefined ? 0 : datas[i]["in"],
                    outNum = datas[i]["out"] == undefined ? 0 : datas[i]["out"];
                var invaluePoint = new Array();
                invaluePoint.push(time);
                invaluePoint.push(inNum);
                invaluePointArray.push(invaluePoint);
                var outvaluePoint = new Array();
                outvaluePoint.push(time);
                outvaluePoint.push(outNum);
                outvaluePointArray.push(outvaluePoint);
            }
            $("#StockTotal").text(datas[datas.length-1]["stock"]);
        }
        initTable();
        initHistoryChart(invaluePointArray,outvaluePointArray);
        $("#inStockTotal").text(inStockTotal);
        $("#outStockTotal").text(outStockTotal);
    }
    //根据生产提取给表赋值
    function initTable(){
        var direct = $("#fuelDirect option:selected").val(),
            datas = new Array;
        if(direct == "in"){
            datas = fuelInStock;
            $("#fuelStockManager thead tr").children().eq(2).html("<h3>生产(吨)</h3>");
        }else{
            datas = fuelOutStock;
            $("#fuelStockManager thead tr").children().eq(2).html("<h3>提取(吨)</h3>");
        }
        //清空表数据
        $(".fuelStockManager tbody").empty();
        $(".fuelStockManager tbody").html("");
        for (var i = 0; i < datas.length; i++) {
            var direct = datas[i]["direct"]== undefined?"":datas[i]["direct"],
                time = datas[i]["time"]== undefined?"":datas[i]["time"],
                groupN = datas[i]["groupN"]== undefined?"":datas[i]["groupN"],
                oper = datas[i]["oper"]== undefined?"":datas[i]["oper"],
                stockN = datas[i]["stockN"]== undefined?"":datas[i]["stockN"],
                much = datas[i]["much"]== undefined?"":datas[i]["much"];
            $(".fuelStockManager tbody").append("<tr id='org_" + (i + 1) + "'>" +
                "<td style='display: none'>" + JSON.stringify(datas[i]) + "</td>" +//id
                "<td>" + (i + 1) + "</td>" +
                "<td>" + much + "</td>" +
                "<td>" + stockN + "</td>" +
                "<td>" + dataFormate(time, "yyyy/MM/dd HH:mm:ss") + "</td>" +
                "<td>" + groupN + "</td>" +
                "<td>" + oper + "</td>" +
                "</tr>");
        }
        sorter.init("fuelStockManager",1);
    }
    //初始化历史图
    function initHistoryChart(inStockValuePointArray, outStockValuePointArray){
        $("#fuelcontainer").highcharts("StockChart",{
            chart: {
                renderTo: 'historycontainer',
                type: "line"
            },
            title: {
                useHTML: true,
                text: "燃料数据曲线"
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'datetime',
                //crosshair: true,
                endOnTick:true,
                showLastLabel:false,
                labels: {
                    format: '{value:%Y/%m/%d}',
                    rotation: 25,
                    align: 'left'
                }
            },
            yAxis: {
                title: {
                    text: ''
                },
                plotLines: []
            },
            tooltip: {
                crosshairs: [true,true],
                shared: true,
                useHTML: true,
                xDateFormat:'%Y/%m/%d',
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            rangeSelector:{
                inputDateFormat: "%Y/%m/%d",
                buttons:[{
                    type: 'all',
                    text: 'All'
                }]
            },
            series: [{
                name: '入库',
                //color:'#1aadce',
                zIndex: 1,
                data: inStockValuePointArray,
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            },{
                name: '出库',
                //color:'#1aadce',
                zIndex: 1,
                data: outStockValuePointArray,
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            }]
        });
    }
    //设置开始日期时间
    //start:laydate.now(0)/2099-06-16 23:59:59
    function setFirstLaydate(istime,start,max,format){
        var firstTimeoption = {
            elem: '#starthour',
            istime: istime,
            isclear:false,
            istoday:false,
            format: format,
            issure:false, //是否显示确认
            start:start,//设置起始日期
            //min: laydate.now(), //设定最小日期为当前日期
            max: max, //最大日期
            choose: function(datas){ //选择日期完毕的回调
                firstdate= datas;
            }
        };
        firstdate = firstTimeoption.start;
        return firstTimeoption;
    }
    //设置结束日期时间
    function setLastLaydate(istime,start,min,max,format){
        var lastTimeoption = {
            elem: '#endhour',
            istime: istime,
            isclear:false,
            istoday:false,
            format: format,
            issure:false, //是否显示确认
            start:start,//设置起始日期
            min: min, //设定最小日期为当前日期
            max: max, //最大日期
            choose: function(datas){ //选择日期完毕的回调
                enddate = datas;
            }
        };
        enddate = lastTimeoption.start;
        return lastTimeoption;
    }
});
var sorter = new TINY.table.sorter("sorter");
