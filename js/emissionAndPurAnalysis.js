/**
 * Created by mq on 2016/7/4.
 */

$(function(){
    var formate = "YYYY/MM/DD",firstdate,enddate;
    $("#searchType").change(function(){
        family = $(this).val();
        listData();
    });
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
    var devId = getCookie("deviceId");
    var family = $("#searchType option:selected").val();
    listData();
    function listData(){
        var timeList = new Object();
        var page_object = new Object(),find = new Object(),timeParm = new Object(),other_object = new Object();
        timeParm.start = (new Date(firstdate +" 0:0:0")).getTime();
        timeParm.end = (new Date(enddate +" 0:0:0")).getTime();
        timeParm.scale = "day";
        page_object.max="2000";
        page_object.start="0";
        //获取排放出口数据
        var family = $("#searchType option:selected").val();
        find.time = timeParm;
        find.family = family;
        find.name = family;
        find.devId = devId;
        var sort = new Object();
        sort.asc = "time";
        other_object.sort = sort;
        var responsedata = JSON.parse(datahistory(find,page_object,other_object));
        if(responsedata.errCode == "success" && responsedata.total != 0) {
            var resultList = responsedata.resultList;
            var temp = /^-?\d+(\.\d+)?$/;
            //获取所有结果数据
            for (var i in resultList) {
                for (var j in resultList[i]) {
                    var dayResult = resultList[i]["dayResult"];
                    var date = resultList[i]["day"] == undefined ? "" : resultList[i]["day"];
                    for (var k in dayResult) {
                        var item = dayResult[k];
                        item["type"] = "out";
                        if(timeList[date] == undefined){
                            timeList[date] = new Array();
                        }
                        timeList[date].push(item);
                    }
                }
            }
        }
        //获取排放入口数据
        find.name = family+"入口";
        var responsedata = JSON.parse(datahistory(find,page_object,other_object));
        if(responsedata.errCode == "success" && responsedata.total != 0){
            var resultList = responsedata.resultList;
            var temp=/^-?\d+(\.\d+)?$/;
            //获取所有结果数据
            for(var i in resultList) {
                for (var j in resultList[i]) {
                    var dayResult = resultList[i]["dayResult"];
                    var date = resultList[i]["day"] == undefined ? "" : resultList[i]["day"];
                    for (var k in dayResult) {
                        var item = dayResult[k];
                        item["type"] = "in";
                        if(timeList[date] == undefined){
                            timeList[date] = new Array();
                        }
                        timeList[date].push(item);
                    }
                }
            }
        }
        //处理数据
        var valuePointArray = new Array(),inValueArray = new Array(),outValueArray = new Array();
        for(var date in timeList){
            var eePoint = new Array(),inPoint = new Array(),outPoint = new Array(),
                eeTime = 0,inValue = 1, outValue = 0;
            var substrTime = date.substring(0, 4) + "/" + date.substring(4, 6) + "/" + date.substring(6, 8);
            eeTime = (new Date(substrTime)).getTime();
            for(var i in timeList[date]){
                var item = timeList[date][i];
                var type = item.type;
                var indicatorValue = item["values"][0]["avg"]== undefined ? 0 : item["values"][0]["avg"];
                if(type == "in"){
                    inValue = Number(indicatorValue);
                    inPoint.push(eeTime);
                    inPoint.push((inValue == 0?1:inValue));
                    inValueArray.push(inPoint);
                }else{
                    outValue = Number(indicatorValue);
                    outPoint.push(eeTime);
                    outPoint.push(outValue);
                    outValueArray.push(outPoint);
                }
            }
            eePoint.push(eeTime);
            eePoint.push(Number(((inValue-outValue)/inValue).toFixed(3)).mul(100));
            valuePointArray.push(eePoint);
        }
        initHistoryChart("perElectricContainer",family+'净化率(%)',valuePointArray);
        initHistoryChart("inOutIndicator",family+'出口',outValueArray);
        initHistoryChart("inIndicator",family+'入口',inValueArray);
    }
    //初始化历史图
    function initHistoryChart(id,title,valuePointArray,inValueArray,outValueArray){
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
                //    ,{
                //    name: family+'入口',
                //    //color:'#1aadce',
                //    zIndex: 1,
                //    data: inValueArray,
                //    marker: {
                //        fillColor: 'white',
                //        lineWidth: 2,
                //        lineColor: Highcharts.getOptions().colors[0]
                //    }
                //},{
                //    name: family+'出口',
                //    //color:'#1aadce',
                //    zIndex: 1,
                //    data: outValueArray,
                //    marker: {
                //        fillColor: 'white',
                //        lineWidth: 2,
                //        lineColor: Highcharts.getOptions().colors[0]
                //    }
                //}
            ]
        };
        if(id == "perElectricContainer"){
            options.tooltip = {
                crosshairs: [true,true],
                shared: true,
                useHTML: true,
                //headerFormat: '<small>{point.key}</small><table>',
                pointFormatter: function() {
                    return this.series.name+': <b>'+this.y+'%</b><br/>.'
                },
                //pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                //'<td style="text-align: right"><b>{point.y}</b>%</td></tr>',
                //footerFormat: '</table>',
                xDateFormat:'%Y/%m/%d',
            };
        }
        $("#"+id).highcharts("Chart", options);
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
