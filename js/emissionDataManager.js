/**
 * Created by admin on 2015/11/17.
 */
$(function(){
    InitTimeUI(true);
    $("#history").click(function(){
        chartType ="line";
        $("#searchType option[value='hour']").attr("selected", true);
        historyData();
    });
    //历史数据显示
    $("#searchType").change(function(){
        InitTimeUI(true);
    });
    var enddate,firstdate;
    $("#starthour").click(function(){
        //var selectType = $("#searchType option:selected").val();
        //if(selectType == "minute" || selectType == "minute10"){
        //    InitTimeUI("minute",false,true);
        //}else {
        //    InitTimeUI("hour",false,true);
        //}
        InitTimeUI(false,true);
    });
    $("#endhour").click(function(){
        //var selectType = $("#searchType option:selected").val();
        //if(selectType == "minute" || selectType == "minute10"){
        //    InitTimeUI("minute",false,false,true);
        //}else {
        //    InitTimeUI("hour",false,false,true);
        //}
        InitTimeUI(false,false,true);
        $("#laydate_ms span").click(function(){
            addLaydateListener();
        });
        $("#laydate_ys li").click(function(){
            addLaydateListener();
        });
    });
    $("#searchpng").click(function(){
        if(enddate == "" || enddate == undefined){
            alert("请先选择日期范围！");
            return false;
        }
        historyData();
    });
    $("#week").click(function(){
        var currentTime = (new Date()).getTime();
        firstdate = dataFormate(currentTime - 7*24*60*60*1000,"yyyy/MM/dd");
        enddate = dataFormate(currentTime,"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        historyData();
    });
    $("#month").click(function(){
        var currentTime = new Date();
        var year = currentTime.getFullYear(), month = currentTime.getMonth()+1, day = currentTime.getDate();
        firstdate = dataFormate((new Date(year+"/"+(month-1)+"/"+day)).getTime(),"yyyy/MM/dd");
        enddate = dataFormate((new Date()).getTime(),"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        historyData();
    });
    $("#quarter").click(function(){
        var currentTime = new Date();
        var year = currentTime.getFullYear(), month = currentTime.getMonth()+1, day = currentTime.getDate();
        firstdate = dataFormate((new Date(year+"/"+(month-3)+"/"+day)).getTime(),"yyyy/MM/dd");
        enddate = dataFormate((new Date()).getTime(),"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        historyData();
    });
    $("#linechart").click(function(){
        chartType ="line";
        historyData();
    });
    $("#columnchart").click(function(){
        chartType ="column";
        historyData();
    });
    var family = getCookie("emissionMenu"),
        realDataId,
        intervalStartTime = 0,
        intervalEndTime = 0, //间隔时间
        devId = getCookie("deviceId"),
        chartType ="line",
        unitType = "",
        maxValue = 0,
        minValue = 0;
    //setInterval10(true);
    //realTimeChart();
    //realdata(family);
    $("#menuitem").text(family);
    historyData();
    function realdata(family,interval){
        var nowchart = $('#nowcontainer').highcharts();
        //update chart prototype
        nowchart.series[0].name = family;
        nowchart.setTitle({ useHTML: true,});
        var findBy = new Object();
        findBy.family = family;
        findBy.devId = devId;
        findBy.name = family;
        var page_object = new Object(),other_object = new Object();
        page_object.max="2000";
        page_object.start="0";
        var sort = new Object();
        sort.asc = "time";
        other_object.sort = sort;
        var datanowresponse = datanow(findBy,page_object,other_object);
        var responsedata = JSON.parse(datanowresponse);
        var lookTime = responsedata.time;
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.poluList;
            var length = datas.length;
            for (var i = 0; i < length; i++) {
                var indicatorJsonStr = JSON.stringify(datas[i]),
                    max = datas[i]["max"] == undefined ? "" : datas[i]["max"],
                    value = datas[i]["value"] == undefined ? "" : datas[i]["value"],
                    family = datas[i]["family"] == undefined ? "" : datas[i]["family"],
                //vtype = datas[i]["vtype"] == undefined ? "" : datas[i]["vtype"],
                    time = datas[i]["time"] == undefined ? "" : datas[i]["time"];
                var intervalTime = lookTime-time; //查询时间与上报数据时间差
                var temp=/^-?\d+(\.\d+)?$/;
                //指标值是数字且
                //第一次查询或者
                // 间隔30秒查询且查数据时间与plc上报数据的时间不能超过60秒
                if(temp.test(value) == true && (interval != 30000 ||(interval == 30000 && intervalTime <= 60000))){
                    var pointArray = new Array();
                    //pointArray.push(new Date(time*1000));
                    pointArray.push(time);
                    pointArray.push(value);
                    nowchart.series[0].addPoint(pointArray);
                }
            }
        }
        //setInterval(function(){
        //    var date = new Date();
        //    var times = date.getTime() - 1000;
        //    for(var i=0;i<1;i++){
        //        var valuePoint = new Array();
        //        var value = Math.round(Math.random()*100);
        //        times += 1000;
        //        valuePoint.push(times);
        //        valuePoint.push(value);
        //        nowchart.series[0].addPoint(valuePoint);
        //    }
        //},10000);
    }
    function historyData(){
        var page_object = new Object(),findBy = new Object(),other_object = new Object();
        page_object.max="2000";
        page_object.start="0";
        findBy.family = family;
        findBy.name = family;
        //findBy.uid = indicatorId;
        findBy.devId = devId;

        var sort = new Object();
        sort.asc = "time";
        other_object.sort = sort;

        var time = new Object(),selectType = $("#searchType option:selected").val();
        var startdate = new Date(firstdate),endTime = new Date(enddate);
        time.end = endTime.getTime()+(24*60*60*1000-1);
        if(selectType == "hour"){
            time.scale = "hour";
            time.end -= 24*60*60*1000-1;
        }if(selectType == "day"){
            time.scale = "day";
        }else if(selectType == "month"){
            time.scale = "month";
        }else if(selectType == "year"){
            time.scale = "year";
        }else if(selectType == "minute"){
            time.scale = "minute";
            time.end -= 24*60*60*1000-1;
        }else if(selectType == "minute10"){
            time.scale = "minute10";
            time.end -= 24*60*60*1000-1;
        }else if(selectType == "all"){
            time.scale = "all";
        }
        time.start = startdate.getTime();
        findBy.time = time;
        var historyDataJsonStr = datahistory(findBy,page_object,other_object);
        var historyDatasObject = JSON.parse(historyDataJsonStr);
        var valuePointArray = new Array(),maxPointArray = [],minPointArray = [],rangArray = [];
        var dminValue = 0,dmaxValue = 0,avgValue = 0,totalCount = 0;
        if(historyDatasObject.errCode == "success" && historyDatasObject.total != 0){
            var resultList = historyDatasObject.resultList;
            var temp=/^-?\d+(\.\d+)?$/;
            //获取所有结果数据
            for(var i in resultList){
                for(var j in resultList[i]){
                    var dayResult = resultList[i]["dayResult"];
                    var day = resultList[i]["day"] == undefined?"":resultList[i]["day"];
                    for(var k in dayResult) {
                        unitType = dayResult[k]["unit"];
                        if(dayResult[k]["lvalue"] == undefined){
                            var values = dayResult[k]["values"] == undefined ? "" : dayResult[k]["values"];
                            for (var h in values) {
                                var valuePoint = new Array(),
                                    maxPoint = [], minPoint = [], rangePoint = [],
                                    min = values[h]["min"] == undefined ? "" : Number(values[h]["min"]).toFixed(3), //最小值
                                    max = values[h]["max"] == undefined ? "" : Number(values[h]["max"]).toFixed(3), //最大值
                                    value = values[h]["avg"] == undefined ? "" : Number(values[h]["avg"]).toFixed(3),
                                    time = values[h]["time"] == undefined ? "" : values[h]["time"],
                                    min = Number(min),
                                    max = Number(max);
                                var substrTime = day.substring(0, 4) + "/" + day.substring(4, 6) + "/" + day.substring(6, 8);
                                var date = new Date(substrTime + " " + time);
                                if (temp.test(value) == true && temp.test(min) == true && temp.test(max) == true) {
                                    if (totalCount == 0) {
                                        dmaxValue = max;
                                        dminValue = min;
                                    }
                                    totalCount++;
                                    avgValue += Number(value);
                                    if (max > dmaxValue) {
                                        dmaxValue = max;
                                    }
                                    if (min < dminValue) {
                                        dminValue = min;
                                    }
                                    valuePoint.push(date.getTime());
                                    valuePoint.push(Number(value));
                                    valuePointArray.push(valuePoint);

                                    maxPoint.push(date.getTime());
                                    maxPoint.push(Number(max))
                                    maxPointArray.push(maxPoint);

                                    minPoint.push(date.getTime());
                                    minPoint.push(Number(min))
                                    minPointArray.push(minPoint);

                                    rangePoint.push(date.getTime());
                                    rangePoint.push(Number(min));
                                    rangePoint.push(Number(max));
                                    rangArray.push(rangePoint);
                                }
                            }
                        }else{
                            var value = dayResult[k]["lvalue"] == undefined?"":Number(dayResult[k]["lvalue"]).toFixed(3);
                            if(temp.test(value) == true){
                                var time = dayResult[k]["time"] == undefined?"":dayResult[k]["time"];
                                if(totalCount == 0){
                                    dmaxValue = value;
                                    dminValue = value;
                                }
                                totalCount++;
                                avgValue+=Number(value);
                                if(value > dmaxValue){
                                    dmaxValue = value;
                                }
                                if(value < dminValue){
                                    dminValue = value;
                                }
                                var valuePoint = new Array();
                                valuePoint.push(time*1000);
                                valuePoint.push(Number(value));
                                valuePointArray.push(valuePoint);
                            }
                        }
                    }
                }
            }
        }
        $("#indicatorMax").text(Number(dmaxValue).toFixed(2) +";");
        $("#indicatorMin").text(Number(dminValue).toFixed(2) +";");
        if(totalCount == 0){
            $("#indicatorAvg").text(avgValue);
        }else{
            $("#indicatorAvg").text((avgValue/totalCount).toFixed(2));
        }
        valuePointArray.sort(function(a, b){
            return a[0]-b[0];     //return a.value.localeCompare(b.value);
        });
        rangArray.sort(function(a, b){
            return a[0]-b[0];     //return a.value.localeCompare(b.value);
        });
        initHistoryChart(chartType,valuePointArray);
        //var valuePointArray = new Array(),date = new Date();
        //var times = date.getTime() - 12*60*60*1000;
        //for(var i=0;i<15;i++){
        //    var valuePoint = new Array();
        //    var value = Math.round(Math.random()*100);
        //    times += 1000;
        //    valuePoint.push(times);
        //    valuePoint.push(value);
        //    valuePointArray.push(valuePoint);
        //}
        //initHistoryChart(chartType,valuePointArray);
    }
    /**实时图初始化
     */
    function realTimeChart(){
        //实时数据显示
        $('#nowcontainer').highcharts("StockChart",{
            chart: {
                //type: 'scatter',
                events: {
                    click: function (e) {
                        // find the clicked values and the series
                        var x = e.xAxis[0].value,
                            y = e.yAxis[0].value,
                            series = this.series[0];
                    }
                }
            },
            xAxis: {
                minPadding: 0.2,
                maxPadding: 0.2,
                //maxZoom: 60,
                type: 'datetime',
                endOnTick:true,
                showLastLabel:false,
                labels: {
                    format: '{value:%m/%d %H:%M:%S}',
                    rotation: 25,
                    align: 'left'
                }
            },
            yAxis: {
                title: {
                    text: '',
                    rotation:0,
                    margin:20
                },
                minPadding: 0.2,
                maxPadding: 0.2,
                //maxZoom: 60,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: 'red',
                    zIndex:5,
                    label: {
                        text: '下限标准: '+0,
                        align: 'center',
                        style: {
                            color: 'red'
                        }
                    }
                },{
                    value: 100,
                    color: 'red',
                    width: 1,
                    zIndex:5,
                    label: {
                        text: '上限标准: '+100,
                        align: 'center',
                        style: {
                            color: 'red'
                        }
                    }
                }]
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.3f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true,
                xDateFormat:'%Y/%m/%d %H:%M:%S'
            },
            rangeSelector:{
                inputDateFormat: "%Y/%m/%d",
                buttons:[{
                    type: 'all',
                    text: 'All'
                }]
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            plotOptions: {
                series: {
                    lineWidth: 1,
                    point: {
                        events: {
                            'click': function () {
                            }
                        }
                    }
                }
            },
            series: [{
                name:"",
                data: []
            }]
        });
    }
    //初始化历史图
    function initHistoryChart(type,valuePointArray){
        var option = {
            chart: {
                renderTo: 'historycontainer',
                type: type
            },
            title: {
                useHTML: true,
                text: family+"("+ unitType +")"
            },
            xAxis: {
                type: 'datetime',
                //crosshair: true,
                endOnTick:true,
                showLastLabel:false,
                labels: {
                    format: '{value:%Y/%m/%d %H:%M:%S}',
                    rotation: 25,
                    align: 'left'
                }
            },
            yAxis: {
                //min: 0,
                title: {
                    text: ''
                },
                plotLines: []
            },
            tooltip: {
                crosshairs: [true,true],
                shared: true,
                useHTML: true,
                xDateFormat:'%Y/%m/%d %H:%M:%S',
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: family,
                //color:'#1aadce',
                zIndex: 1,
                data: valuePointArray,
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            }]
        };
        var selectType = $("#searchType option:selected").val();
        if(selectType =="day"){
            option.xAxis.labels.format = "{value:%Y/%m/%d} ";
            option.tooltip.xDateFormat = "%Y/%m/%d";
        }else if(selectType =="month"){
            option.xAxis.labels.format = "{value:%Y/%m}";
            option.tooltip.xDateFormat = "%Y/%m";
        }else if(selectType =="year"){
            option.xAxis.labels.format = "{value:%Y}";
            option.tooltip.xDateFormat = "%Y";
        }
        $("#historycontainer").highcharts("StockChart",option);
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
    //初始化时间值
    function InitTimeUI(isInite,firstTimeClick,lastTimeClick){
        var type = $("#searchType option:selected").val();
        var formate = "YYYY/MM/DD",isTime = false;
        if(type == "minute" || type == "minute10" || type == "hour" || type == "all"){
            formate = "YYYY/MM/DD hh:mm:ss";
            isTime = true;
        }else if(type == "month"){
            formate = "YYYY/MM";
        }else if(type == "year"){
            formate = "YYYY";
        }
        if(isInite){
            setFirstLaydate(isTime,laydate.now(-2),laydate.now(0),formate);
            setLastLaydate(isTime,laydate.now(0),firstdate,laydate.now(0),formate);
        }
        if(firstTimeClick){
            laydate(setFirstLaydate(isTime,firstdate,laydate.now(0),formate));
        }
        if(lastTimeClick){
            laydate(setLastLaydate(isTime,enddate,firstdate,laydate.now(0),formate));
        }
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
    }
});

//设置10秒执行一次
function setInterval10(isFirst){
    intervalStartTime= (new Date()).getTime();
    if(isFirst){
        realDataId = setInterval(function(){
            intervalEndTime =  (new Date()).getTime();
            if((intervalEndTime-intervalStartTime)>= 10*60*1000){
                tipdialog.dialog("option","title","提示信息");
                $("#tip .tipright p").html("是否继续监控实时数据！");
                tipdialog.dialog("option","_button","overtime");
                tipdialog.dialog("open");
            }else{
                realdata(family,30000);
            }
        },10000);
        $(document).mousemove(function(){
            setInterval10(false);
        });
        $(document).click(function(){
            setInterval10(false);
        });
    }
}