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
    $("#week").click(function(){
        var currentTime = (new Date()).getTime();
        firstdate = dataFormate(currentTime - 7*24*60*60*1000,"yyyy/MM/dd");
        enddate = dataFormate(currentTime,"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        //fillRow();
    });
    $("#month").click(function(){
        var currentTime = (new Date()).getTime();
        firstdate = dataFormate(currentTime - 30*24*60*60*1000,"yyyy/MM/dd");
        enddate = dataFormate(currentTime,"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        //fillRow();
    });
    $("#quarter").click(function(){
        var currentTime = (new Date()).getTime();
        firstdate = dataFormate(currentTime - 90*24*60*60*1000,"yyyy/MM/dd");
        enddate = dataFormate(currentTime,"yyyy/MM/dd");
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        //fillRow();
    });

    setFirstLaydate(true,laydate.now(-2),laydate.now(0),formate);
    setLastLaydate(true,laydate.now(0),firstdate,laydate.now(0),formate);
    var valuePointArray = new Array(),mudValueArray = new Array(),electricValueArray = new Array(),date = new Date();
    var times = date.getTime() - 12*60*60*1000;
    for(var i=0;i<15;i++){
        var valuePoint = new Array();
        var value = Math.round(Math.random()*100);
        times += 1000;
        valuePoint.push(times);
        valuePoint.push(value);
        valuePointArray.push(valuePoint);

        mudValueArray.push();
    }
    for(var i=0;i<15;i++){
        var valuePoint = new Array();
        var value = Math.round(Math.random()*100);
        times += 1000;
        valuePoint.push(times);
        valuePoint.push(value);
        mudValueArray.push(valuePoint);
    }
    for(var i=0;i<15;i++){
        var valuePoint = new Array();
        var value = Math.round(Math.random()*100);
        times += 1000;
        valuePoint.push(times);
        valuePoint.push(value);
        electricValueArray.push(valuePoint);
    }
    initHistoryChart("perElectricContainer","药剂使用效率分析",valuePointArray,mudValueArray,electricValueArray);
    //initHistoryChart("useContainer","污泥使用量曲线",valuePointArray);
    //initHistoryChart("electricContainer","发电量曲线",valuePointArray);
    //初始化历史图
    function initHistoryChart(id,title,valuePointArray,mudValueArray,electricValueArray){
        $("#"+id).highcharts("StockChart",{
            chart: {
                renderTo: 'historycontainer',
                type: "line"
            },
            title: {
                useHTML: true,
                text: title
            },
            subtitle: {
                text: ''
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
                name: '单位排放所消耗的药剂量',
                //color:'#1aadce',
                zIndex: 1,
                data: valuePointArray,
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            },{
                name: 'SO2净化量',
                //color:'#1aadce',
                zIndex: 1,
                data: mudValueArray,
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            },{
                name: '药剂使用率',
                //color:'#1aadce',
                zIndex: 1,
                data: electricValueArray,
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
