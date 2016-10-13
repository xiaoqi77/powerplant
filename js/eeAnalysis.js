/**
 * Created by mq on 2016/7/4.
 */

$(function(){
    var formate = "YYYY/MM/DD",firstdate,enddate;
    $("#starthour").click(function(){
        laydate(setFirstLaydate(true,firstdate,laydate.now(0),formate));
    });
    $("#endhour").click(function(){
        laydate(setLastLaydate(true,enddate,firstdate,laydate.now(0),formate));
    });
    $("#searchpng").click(function(){
        if(enddate == "" || enddate == undefined){
            alert("请先选择日期范围！");
            return false;
        }
        listData();
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
        var currentTime = new Date();
        var year = currentTime.getFullYear(), month = currentTime.getMonth()+1, day = currentTime.getDate();
        firstdate = dataFormate((new Date(year+"/"+(month-3)+"/"+day)).getTime(),"yyyy/MM/dd");
        enddate = dataFormate((new Date()).getTime(),"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        listData();
    });

    setFirstLaydate(true,laydate.now(-30),laydate.now(0),formate);
    setLastLaydate(true,laydate.now(0),firstdate,laydate.now(0),formate);
    $("#starthour").val(firstdate);
    $("#endhour").val(enddate);
    listData();
    function listData(){
        var timeList = new Object();
        var page_object = new Object(),find = new Object(),timeParm = new Object();
        timeParm.start = (new Date(firstdate +" 0:0:0")).getTime();
        timeParm.end = (new Date(enddate +" 0:0:0")).getTime();
        timeParm.scale = "day";
        page_object.max="2000";
        page_object.start="0";
        //获取污泥数据
        var mudParm = new Object(),stockInfoId = getStockId("mud");
        find.dataId = stockInfoId;
        find.time = timeParm;
        mudParm.page = page_object;
        mudParm.find = find;
        var filter = new Object();
        filter.exclude = "in";
        mudParm.filter = filter;
        var responsedata = JSON.parse(storageList("history",mudParm));
        if(responsedata.errCode == "success"){
            var datas = responsedata.resultList;
            for (var i = 0; i < datas.length; i++) {
                var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                    time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                    date = datas[i]["date"] == undefined ? "" : datas[i]["date"],
                    inNum = datas[i]["out"] == undefined ? 0 : datas[i]["out"];
                datas[i]["type"] = "mud";
                if(timeList[date] == undefined){
                    timeList[date] = new Array();
                }
                timeList[date].push(datas[i]);
            }
        }
        var other_object = new Object(),sort = new Object(),devId = getCookie("deviceId");
        sort.desc = "day";
        other_object.sort = sort;
        //var responsedata = JSON.parse(listImportData("electric",electricParm));
        $(".importTable tbody").empty();
        $(".importTable tbody").html("");
        find.devId = devId;
        find.family = "发电量";
        find.name = "发电量";
        var historyDatasObject = JSON.parse(datahistory(find,page_object,other_object));
        if(historyDatasObject.errCode == "success" && historyDatasObject.total != 0){
            var resultList = historyDatasObject.resultList;
            //获取所有结果数据
            for(var i in resultList){
                var dayResult = resultList[i]["dayResult"];
                var date = resultList[i]["day"] == undefined?"":resultList[i]["day"],
                    substrTime = date.substring(0, 4) + "/" + date.substring(4, 6) + "/" + date.substring(6, 8),
                    time = (new Date(substrTime)).getTime();
                for(var k in dayResult) {
                    var item = dayResult[k];
                    var inNum = Number(item["values"][0]["dif"]== undefined ? 0 : item["values"][0]["dif"]),
                        stock = Number(item["values"][0]["max"]== undefined ? 0 : item["values"][0]["max"]);
                    if(timeList[date] == undefined){
                        timeList[date] = new Array();
                    }
                    var invaluePoint = new Object();
                    invaluePoint["time"] = time;
                    invaluePoint["out"] = inNum;
                    invaluePoint["stock"] = stock;
                    invaluePoint["type"] = "electric";
                    timeList[date].push(invaluePoint);
                }
            }
        }
        //获取发电量数据
        //var elstockId = getStockId("electric");
        //var elParm = new Object(),find = new Object();
        //timeParm.start = timeParm.start - 24*60*60*1000;
        //find.time = timeParm;
        //elParm.page = page_object;
        //find.dataId = elstockId;
        //elParm.find = find;
        //var responsedata = JSON.parse(storageList("history",elParm));
        //if(responsedata.errCode == "success"){
        //    var datas = responsedata.resultList,oldNum = 0,startTime = (new Date(firstdate + " 0:0:0")).getTime();
        //    for (var i = 0; i < datas.length; i++) {
        //        var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
        //            time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
        //            date = datas[i]["date"] == undefined ? "" : datas[i]["date"];
        //        datas[i]["type"] = "electric";
        //
        //        if(time < startTime){
        //            oldNum = stock;
        //            continue;
        //        }
        //        if(timeList[date] == undefined){
        //            timeList[date] = new Array();
        //        }
        //        datas[i]["stock"] = stock - oldNum;
        //        timeList[date].push(datas[i]);
        //        oldNum = stock;
        //    }
        //}
        //处理数据
        var valuePointArray = new Array(),mudValueArray = new Array(),electricValueArray = new Array();
        for(var date in timeList){
            var eePoint = new Array(),mudPoint = new Array(),elecPoint = new Array(),
                eeTime = 0,mudValue = 0, elecValue = 0;
            for(var i in timeList[date]){
                var item = timeList[date][i];
                var type = item.type,
                    time = item["time"] == undefined ? "" : item["time"],
                    stock = item["stock"] == undefined ? "" : item["stock"],
                    inNum = item["out"] == undefined ? 0 : item["out"];
                eeTime = time;
                if(type == "mud"){
                    mudValue = inNum;
                    mudPoint.push(time);
                    mudPoint.push(inNum);
                    mudValueArray.push(mudPoint);
                }else{
                    elecValue = inNum;
                    elecPoint.push(time);
                    elecPoint.push(inNum);
                    electricValueArray.push(elecPoint);
                }
            }
            if(elecValue ==0 || mudValue ==0){
                continue;
            }
            eePoint.push(eeTime);
            eePoint.push(Number((elecValue/mudValue).toFixed(3)));
            valuePointArray.push(eePoint);
        }
        initHistoryChart("perElectricContainer","每吨污泥发电量曲线",valuePointArray);
        initHistoryChart("inElectric","产生电量曲线",electricValueArray);
        initHistoryChart("outMud","消耗污泥曲线",mudValueArray);
    }
    //var valuePointArray = new Array(),mudValueArray = new Array(),electricValueArray = new Array(),date = new Date();
    //var times = date.getTime() - 12*60*60*1000;
    //for(var i=0;i<15;i++){
    //    var valuePoint = new Array();
    //    var value = Math.round(Math.random()*100);
    //    times += 1000;
    //    valuePoint.push(times);
    //    valuePoint.push(value);
    //    valuePointArray.push(valuePoint);
    //
    //    mudValueArray.push();
    //}
    //for(var i=0;i<15;i++){
    //    var valuePoint = new Array();
    //    var value = Math.round(Math.random()*100);
    //    times += 1000;
    //    valuePoint.push(times);
    //    valuePoint.push(value);
    //    mudValueArray.push(valuePoint);
    //}
    //for(var i=0;i<15;i++){
    //    var valuePoint = new Array();
    //    var value = Math.round(Math.random()*100);
    //    times += 1000;
    //    valuePoint.push(times);
    //    valuePoint.push(value);
    //    electricValueArray.push(valuePoint);
    //}

    //initHistoryChart("useContainer","污泥使用量曲线",valuePointArray);
    //initHistoryChart("electricContainer","发电量曲线",valuePointArray);
    //初始化历史图
    function initHistoryChart(id,title,valuePointArray,mudValueArray,electricValueArray){
        var options = {
            chart: {
                renderTo: id,
                type: "line"
            },
            title: {
                useHTML: true,
                text: title
            },
            subtitle: {
                text: ''
            },
            legend:{
                enabled:false
            },
            xAxis: {
                type: 'datetime',
                crosshair: true,
                endOnTick:true,
                showLastLabel:false,
                labels: {
                    format: '{value:%Y/%m/%d}',
                    rotation: 25,
                    align: 'left'
                }
            },
            yAxis: {
                minPadding:0,
                startOnTick:false,
                title: {
                    text: ''
                },
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
                name: title,
                //color:'#1aadce',
                zIndex: 1,
                data: valuePointArray,
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            }
                //    {
                //    name: '污泥使用量（吨）',
                //    //color:'#1aadce',
                //    zIndex: 1,
                //    data: mudValueArray,
                //    marker: {
                //        fillColor: 'white',
                //        lineWidth: 2,
                //        lineColor: Highcharts.getOptions().colors[0]
                //    }
                //},{
                //    name: '发电量',
                //    //color:'#1aadce',
                //    zIndex: 1,
                //    data: electricValueArray,
                //    marker: {
                //        fillColor: 'white',
                //        lineWidth: 2,
                //        lineColor: Highcharts.getOptions().colors[0]
                //    }}
            ]
        };
        if(id == "perElectricContainer"){
            options.tooltip = {
                crosshairs: [true,true],
                shared: true,
                useHTML: true,
                //headerFormat: '<small>{point.key}</small><table>',
                pointFormatter: function() {
                    return this.series.name+': <b>'+this.y+'</b><br/>.'
                },
                //pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                //'<td style="text-align: right"><b>{point.y}</b>%</td></tr>',
                //footerFormat: '</table>',
                valueDecimals: 3, //数据值保留小数位数
                xDateFormat:'%Y/%m/%d',
            };
        }
        $("#"+id).highcharts("Chart",options);
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
