/**
 * Created by mq on 2016/7/4.
 */

$(function(){
    var formate = "YYYY/MM/DD",firstdate,enddate,devId = getCookie("deviceId");
    $("#starthour").click(function(){
        laydate(setFirstLaydate(true,firstdate,laydate.now(0),formate));
    });
    $("#endhour").click(function(){
        laydate(setLastLaydate(true,enddate,firstdate,laydate.now(0),formate));
    });
    $("#searchpng").click(function(){
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
    sortOp("importTable","currentpage","pagelimit",10);
    setFirstLaydate(true,laydate.now(-7),laydate.now(0),formate);
    setLastLaydate(true,laydate.now(0),firstdate,laydate.now(0),formate);
    $("#starthour").val(firstdate);
    $("#endhour").val(enddate);
    listData();
    //查询库存数据
    function listData(){
        var other_object = new Object(),page_object = new Object(),find = new Object(),
            timeParm = new Object(),sort = new Object();
        timeParm.start = (new Date(firstdate +" 0:0:0")).getTime();
        timeParm.end = (new Date(enddate +" 0:0:0")).getTime();
        timeParm.scale = "day";
        page_object.max="2000";
        page_object.start="0";
        find.time = timeParm;
        sort.desc = "day";
        other_object.sort = sort;
        $(".importTable tbody").empty();
        $(".importTable tbody").html("");
        find.devId = devId;
        find.family = "用水量";
        find.name = "用水量";
        var historyDatasObject = JSON.parse(datahistory(find,page_object,other_object)),valuePointArray = new Array(),
            invaluePointArray = new Array(),totalNum = 0,length = 0;
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
                    length++;
                    $(".importTable tbody").append("<tr id='org_" + length + "'>" +
                        "<td style='display: none'></td>" +//id
                        "<td>" + length + "</td>" +
                        "<td>" + dataFormate(time, "yyyy/MM/dd") + "</td>" +
                        "<td>" + inNum + "</td>" +
                        "<td>" + stock + "</td>" +
                        "</tr>");
                    var invaluePoint = new Array();
                    invaluePoint.push(time);
                    invaluePoint.push(inNum);
                    invaluePointArray.push(invaluePoint);
                    totalNum += inNum;
                }
                sorter.init("importTable",1);
                $("#StockTotal").text(totalNum);
            }
        }
        invaluePointArray.sort(function(a,b){
            return b[0] - a[0];
        });
        initHistoryChart(invaluePointArray);
    }
    //初始化历史图
    function initHistoryChart(valuePointArray){
        $("#watercontainer").highcharts("StockChart",{
            chart: {
                renderTo: 'historycontainer',
                type: "line"
            },
            title: {
                useHTML: true,
                text: "用水量曲线"
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
                name: '用水量',
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
