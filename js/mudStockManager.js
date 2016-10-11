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
    $("#week").click(function(){
        var currentTime = (new Date()).getTime();
        firstdate = dataFormate(currentTime - 7*24*60*60*1000,"yyyy/MM/dd");
        enddate = dataFormate(currentTime,"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        listData();
    });
    $("#month").click(function(){
        var currentTime = new Date();
        var year = currentTime.getFullYear(), month = currentTime.getMonth()+1, day = currentTime.getDate();
        firstdate = dataFormate((new Date(year+"/"+(month-1)+"/"+day)).getTime(),"yyyy/MM/dd");
        enddate = dataFormate((new Date()).getTime(),"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        listData();
    });
    $("#quarter").click(function(){
        var currentTime = (new Date()).getTime();
        firstdate = dataFormate(currentTime - 90*24*60*60*1000,"yyyy/MM/dd");
        enddate = dataFormate(currentTime,"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        listData();
    });
    $("#searchpng").click(function(){
        $(".mudStockTableShow").css("display","block");
        $(".mudInDetailTableShow").css("display","none");
        $(".mudOutDetailTableShow").css("display","none");
        listData();
    });
    $(".backMudStock").click(function(){
        $(".toolbar1").css("display","block");
        $(".mudStockTableShow").css("display","block");
        $(".mudInDetailTableShow").css("display","none");
        $(".mudOutDetailTableShow").css("display","none");
    });
    $("#mudDirect").change(function(){
        initStockTable();
    });
    var firstdate, enddate, stockInfoId = getStockId("mud"),mudInStock = new Object(),mudOutStock = new Object();

    setFirstLaydate(false,laydate.now(-7),laydate.now(0),formate);
    setLastLaydate(false,laydate.now(0),firstdate,laydate.now(0),formate);
    $("#starthour").val(firstdate);
    $("#endhour").val(enddate);
    $(".mudInDetailTableShow").css("display","none");
    $(".mudOutDetailTableShow").css("display","none");
    listData();
    //填充表数据
    function listData() {
        mudOutStock = new Object();
        mudInStock = new Object();
        var mudParm = new Object(),page_object = new Object(),find = new Object(),timeParm = new Object();
        timeParm.start = (new Date(firstdate +" 0:0:0")).getTime();
        timeParm.end = (new Date(enddate +" 0:0:0")).getTime();
        page_object.max="2000";
        page_object.start="0";
        find.dataId = stockInfoId;
        find.time = timeParm;
        mudParm.page = page_object;
        mudParm.find = find;
        mudParm.direct = "out";
        //查询出库数据
        var responsedata = JSON.parse(listImportData("mud",mudParm)),
            invaluePointArray = new Array(), outvaluePointArray = new Array(),
            inStockTotal = 0, outStockTotal = 0;
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            for (var i = 0; i < datas.length; i++) {
                var time = datas[i]["time"]== undefined?"":datas[i]["time"],
                    groupN = datas[i]["groupN"]== undefined?"":datas[i]["groupN"],
                    oper = datas[i]["oper"]== undefined?"":datas[i]["oper"],
                    stockN = datas[i]["stockN"]== undefined?"":datas[i]["stockN"],
                    much = datas[i]["much"]== undefined?"":datas[i]["much"];
                if(mudOutStock[stockN] == undefined){
                    var supplyList = new Array();
                    supplyList.push(datas[i]);
                    mudOutStock[stockN] = new Object();
                    mudOutStock[stockN]["totalNum"] = much;
                    mudOutStock[stockN]["groupN"] = groupN;
                    mudOutStock[stockN]["supplyList"] = supplyList;
                }else{
                    mudOutStock[stockN]["totalNum"] = mudOutStock[stockN]["totalNum"].add(much);
                    mudOutStock[stockN]["supplyList"].push(datas[i]);
                }
                outStockTotal = outStockTotal.add(much);
            }
        }
        mudParm.direct = "in";
        //查询入库数据
        var responsedata = JSON.parse(listImportData("mud",mudParm));
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            for (var i = 0; i < datas.length; i++) {
                var carNo = datas[i]["carNo"] == undefined ? "" : datas[i]["carNo"],
                    time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                    netWei = datas[i]["netWei"] == undefined ? "" : datas[i]["netWei"],
                    grossWei = datas[i]["grossWei"] == undefined ? "" : datas[i]["grossWei"],
                    supName = datas[i]["supName"] == undefined ? "" : datas[i]["supName"],
                    tare = datas[i]["tare"] == undefined ? "" : datas[i]["tare"],
                    supNo = datas[i]["supNo"] == undefined ? "" : datas[i]["supNo"];
                if(mudInStock[supName] == undefined){
                    var supplyList = new Array();
                    supplyList.push(datas[i]);
                    mudInStock[supName] = new Object();
                    mudInStock[supName]["totalNum"] = netWei;
                    mudInStock[supName]["supNo"] = supNo;
                    mudInStock[supName]["supplyList"] = supplyList;
                }else{
                    mudInStock[supName]["totalNum"] = mudInStock[supName]["totalNum"].add(netWei);
                    mudInStock[supName]["supplyList"].push(datas[i]);
                }
                inStockTotal = inStockTotal.add(netWei);
            }
        }
        timeParm.scale = "day";
        find.time = timeParm;
        mudParm.find = find;
        mudParm.direct = undefined;
        //查询库存余量
        var responsedata = JSON.parse(storageList("history",mudParm));
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
        initHistoryChart(invaluePointArray,outvaluePointArray);
        $("#inStockTotal").text(inStockTotal);
        $("#outStockTotal").text(outStockTotal);

        initStockTable();
    }
    //库存表赋值
    function initStockTable(){
        sortOp("mudStockTable","currentpage","pagelimit",10);
        //清空表数据
        $(".mudStockTable tbody").empty();
        $(".mudStockTable tbody").html("");
        var direct = $("#mudDirect option:selected").val(),num =0;
        if(direct == "in"){
            $("#mudStockTable thead tr").children().eq(2).html("<h3>污泥产生单位</h3>");
            $("#mudStockTable thead tr").children().eq(3).html("<h3>单位编号</h3>");
            $("#mudStockTable thead tr").children().eq(4).html("<h3>共接收(吨)</h3>");
            for(var i in mudInStock){
                num++;
                var supName = i,
                    inNum = mudInStock[i]["totalNum"],
                    supNo = mudInStock[i]["supNo"],
                    detailId = "detailMudIn" + num;

                $(".mudStockTable tbody").append("<tr id='mudIn_" + (i + 1) + "'>" +
                    "<td style='display: none'>" + JSON.stringify(mudInStock[i]) + "</td>" +//id
                    "<td>" + num + "</td>" +
                    "<td>" + supName + "</td>" +
                    "<td>" + supNo + "</td>" +
                    "<td>" + inNum + "</td>" +
                    "<td><a href='#' class='tablelink' id='"+ detailId+"'> 明细</a></td>" +
                    "</tr>");
                $(document).on("click","#"+detailId ,function(){
                    $(".mudStockTableShow").css("display","none");
                    $(".toolbar1").css("display","none");
                    $(".mudInDetailTableShow").css("display","block");
                    var name = $(this).parent().parent().children().eq(2).text().trim();
                    initMudInDetailTable(name);
                });
            }
        }else{
            $("#mudStockTable thead tr").children().eq(2).html("<h3>污泥库编号</h3>");
            $("#mudStockTable thead tr").children().eq(3).html("<h3>班组</h3>");
            $("#mudStockTable thead tr").children().eq(4).html("<h3>共出库(吨)</h3>");
            for(var i in mudOutStock){
                var mudNum = i,
                    inNum = mudOutStock[i]["totalNum"],
                    groupN = mudOutStock[i]["groupN"],
                    detailId = "detailMudOut" + num;
                num++;
                $(".mudStockTable tbody").append("<tr id='mudIn_" + (i + 1) + "'>" +
                    "<td style='display: none'>" + JSON.stringify(mudInStock[i]) + "</td>" +//id
                    "<td>" + num + "</td>" +
                    "<td>" + mudNum + "</td>" +
                    "<td>" + groupN + "</td>" +
                    "<td>" + inNum + "</td>" +
                    "<td><a href='#' class=' tablelink' id='"+ detailId+"'> 明细</a></td>" +
                    "</tr>");
                $(document).on("click","#"+detailId ,function(){
                    $(".mudStockTableShow").css("display","none");
                    $(".toolbar1").css("display","none");
                    $(".mudOutDetailTableShow").css("display","block");
                    var mudNum = $(this).parent().parent().children().eq(2).text().trim();
                    initMudOutDetailTable(mudNum);
                });
            }
        }
        sorter.init("mudStockTable",1);
    }
    //入库明细表赋值
    function initMudInDetailTable(name){
        sortOp("mudDetailInStockTable","detailIncurrentpage","detailInpagelimit",10);
        $("#detailInStockTotal").text(mudInStock[name]["totalNum"]);
        $("#mudInUnit").text(name);
        $(".mudDetailInStockTable tbody").empty();
        $(".mudDetailInStockTable tbody").html("");
        var datas = mudInStock[name]["supplyList"];
        for (var i = 0; i < datas.length; i++) {
            var carNo = datas[i]["carNo"]== undefined?"":datas[i]["carNo"],
                time = datas[i]["time"]== undefined?"":datas[i]["time"],
                netWei = datas[i]["netWei"]== undefined?"":datas[i]["netWei"],
                grossWei = datas[i]["grossWei"]== undefined?"":datas[i]["grossWei"],
                supName = datas[i]["supName"]== undefined?"":datas[i]["supName"],
                tare = datas[i]["tare"]== undefined?"":datas[i]["tare"],
                supNo = datas[i]["supNo"]== undefined?"":datas[i]["supNo"];
            $(".mudDetailInStockTable tbody").append("<tr id='detailIn_" + (i + 1) + "'>" +
                "<td style='display: none'>" + JSON.stringify(datas[i]) + "</td>" +//id
                "<td>" + (i + 1) + "</td>" +
                "<td>" + supNo + "</td>" +
                "<td>" + netWei + "</td>" +
                "<td>" + grossWei + "</td>" +
                "<td>" + tare + "</td>" +
                "<td>" + carNo + "</td>" +
                "<td>" + dataFormate(time, "yyyy/MM/dd HH:mm:ss") + "</td>" +
                "<td></td>" +
                "</tr>");
        }
        sorter.init("mudDetailInStockTable",1);
    }
    //出库明细表赋值
    function initMudOutDetailTable(num){
        sortOp("mudDetailOutStockTable","detailOutcurrentpage","detailOutpagelimit",10);
        $("#detailOutStockTotal").text(mudOutStock[num]["totalNum"]);
        $(".mudDetailOutStockTable tbody").empty();
        $(".mudDetailOutStockTable tbody").html("");
        var datas = mudOutStock[num]["supplyList"];
        for (var i = 0; i < datas.length; i++) {
            var time = datas[i]["time"]== undefined?"":datas[i]["time"],
                groupN = datas[i]["groupN"]== undefined?"":datas[i]["groupN"],
                oper = datas[i]["oper"]== undefined?"":datas[i]["oper"],
                stockN = datas[i]["stockN"]== undefined?"":datas[i]["stockN"],
                much = datas[i]["much"]== undefined?"":datas[i]["much"];
            $(".mudDetailOutStockTable tbody").append("<tr id='detailOut_" + (i + 1) + "'>" +
                "<td style='display: none'>" + JSON.stringify(datas[i]) + "</td>" +//id
                "<td>" + (i + 1) + "</td>" +
                "<td>" + much + "</td>" +
                "<td>" + stockN + "</td>" +
                "<td>" + dataFormate(time, "yyyy/MM/dd HH:mm:ss") + "</td>" +
                "<td>" + groupN + "</td>" +
                "<td>" + oper + "</td>" +
                    //"<td><a href='#' class='delOrg tablelink'> 删除</a></td>" +
                "</tr>");
        }
        sorter.init("mudDetailOutStockTable",1);
    }
    //初始化历史图
    function initHistoryChart(inStockValuePointArray, outStockValuePointArray){
        $("#sludgecontainer").highcharts("StockChart",{
            chart: {
                renderTo: 'historycontainer',
                type: "line"
            },
            title: {
                useHTML: true,
                text: "污泥数据曲线"
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
            },
            tooltip: {
                crosshairs: [true,true],
                shared: true,
                useHTML: true,
                xDateFormat:'%Y/%m/%d ',
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
