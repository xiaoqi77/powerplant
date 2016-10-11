/**
 * Created by mq on 2016/7/4.
 */

$(function(){

    var formate = "YYYY/MM/DD",firstdate,enddate;
    $(".sludgeUnit").click(function () {
        $("#sludgeUnitWindow").dialog("open");
    });
    $("#starthour").click(function(){
        laydate(setFirstLaydate(true,firstdate,laydate.now(0),formate));
    });
    $("#endhour").click(function(){
        laydate(setLastLaydate(true,enddate,firstdate,laydate.now(0),formate));
    });
    setFirstLaydate(true,laydate.now(-2),laydate.now(0),formate);
    setLastLaydate(true,laydate.now(0),firstdate,laydate.now(0),formate);
    var valuePointArray = new Array(),date = new Date();
    var times = date.getTime() - 12*60*60*1000;
    for(var i=0;i<15;i++){
        var valuePoint = new Array();
        var value = Math.round(Math.random()*100);
        times += 1000;
        valuePoint.push(times);
        valuePoint.push(value);
        valuePointArray.push(valuePoint);
    }
    initWindow();
    initHistoryChart(valuePointArray);
    sortOp("sludgeDataTable","currentpage","pagelimit",10);
    //初始化历史图
    function initHistoryChart(valuePointArray){
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
                    format: '{value:%Y/%m/%d %H:%M:%S}',
                    rotation: 25,
                    align: 'left'
                }
            },
            yAxis: {
                title: {
                    text: ''
                },
                plotLines: [{
                    value: 0, //最小值
                    width: 1,
                    color:'red',
                    zIndex: 5,
                    label: {
                        text: '下限标准: '+0,
                        align: 'center',
                        style: {
                            color: 'red'
                        }
                    }
                },{
                    value: 100, //最大值
                    width: 1,
                    color:'red',
                    zIndex: 5,
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
            rangeSelector:{
                inputDateFormat: "%Y/%m/%d",
                buttons:[{
                    type: 'all',
                    text: 'All'
                }]
            },
            series: [{
                //name: family + '值',
                //color:'#1aadce',
                zIndex: 1,
                data: valuePointArray,
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            }]
        });
    }
    //初始化窗口信息
    function initWindow(){
        $("#sludgeUnitWindow").dialog({
            position:{ my: "center", at: "center", of: window},
            autoOpen: false,
            height: 300,
            width: 400,
            modal: true
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