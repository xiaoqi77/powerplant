/**
 * Created by mq on 2016/7/4.
 */
$(function(){
    var formate = "YYYY/MM/DD hh:mm:ss",firstdate,enddate;
    $("#starthour").click(function(){
        laydate(setFirstLaydate(true,firstdate,laydate.now(0),formate));
    });
    $("#endhour").click(function(){
        laydate(setLastLaydate(true,enddate,firstdate,laydate.now(0),formate));
    });
    $("#factoryList").change(function () {
        initStockList();
    });
    $("#stockRosterList").change(function () {
        var stockInfoId = $(this).val();
        fillRow(stockInfoId);
    });
    $("#searchpng").click(function(){
        var stockInfoId = $("#stockRosterList").val();
        if(stockInfoId != undefined && stockInfoId != ""){
            fillRow(stockInfoId);
        }
    });
    sortOp("mudInDataTable","currentpage","pagelimit",10);
    setFirstLaydate(true,laydate.now(-2),laydate.now(0),formate);
    setLastLaydate(true,laydate.now(0),firstdate,laydate.now(0),formate);
    $("#starthour").val(firstdate);
    $("#endhour").val(enddate);

    initFactoryList();
    var stockInfoId = $("#stockRosterList").val();
    if(stockInfoId != undefined && stockInfoId != ""){
        fillRow(stockInfoId);
    }
    //填充表数据
    function fillRow(stockInfoId) {
        var mudParm = new Object(),page_object = new Object(),find = new Object(),time = new Object();
        time.start = (new Date(firstdate)).getTime();
        time.end = (new Date(enddate)).getTime();
        page_object.max="2000";
        page_object.start="0";
        find.dataId = stockInfoId;
        find.time = time;
        mudParm.page = page_object;
        mudParm.find = find;
        mudParm.direct = "in";
        //清空表数据
        $(".mudInDataTable tbody").empty();
        $(".mudInDataTable tbody").html("");
        var responsedata = JSON.parse(listImportData("mud",mudParm));
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            for (var i = 0; i < datas.length; i++) {
                var carNo = datas[i]["carNo"]== undefined?"":datas[i]["carNo"],
                    time = datas[i]["time"]== undefined?"":datas[i]["time"],
                    netWei = datas[i]["netWei"]== undefined?"":datas[i]["netWei"],
                    grossWei = datas[i]["grossWei"]== undefined?"":datas[i]["grossWei"],
                    supName = datas[i]["supName"]== undefined?"":datas[i]["supName"],
                    tare = datas[i]["tare"]== undefined?"":datas[i]["tare"],
                    supNo = datas[i]["supNo"]== undefined?"":datas[i]["supNo"];
                $(".mudInDataTable tbody").append("<tr id='org_" + (i + 1) + "'>" +
                    "<td style='display: none'>" + JSON.stringify(datas[i]) + "</td>" +//id
                    "<td><input name='checkbox' class='nosort' type='checkbox' id='checkbox_" + (i + 1) + "'/></td>" +
                    "<td>" + (i + 1) + "</td>" +
                    "<td>" + dataFormate(time, "yyyy/MM/dd HH:mm:ss") + "</td>" +
                    "<td>" + supNo + "</td>" +
                    "<td>" + supName + "</td>" +
                    "<td>" + carNo + "</td>" +
                    "<td>" + tare + "</td>" +
                    "<td>" + grossWei + "</td>" +
                    "<td>" + netWei + "</td>" +
                    //"<td><a href='#' class='delOrg tablelink'> 删除</a></td>" +
                    "</tr>");
            }
            sorter.init("mudInDataTable",2);
        }
    }
    //工厂列表组件值
    function initFactoryList(){
        //工厂列表赋值
        var facoryParam = new Object();
        facoryParam.type = "factory";
        var responsedata = JSON.parse(listorg(facoryParam));
        if(responsedata.errCode == "success"){
            var datas = responsedata.orgList;
            for (var i = 0; i < datas.length; i++) {
                var orgInfo = JSON.stringify(datas[i]);
                var name = datas[i]["name"] == undefined ? "" : datas[i]["name"],
                    id = datas[i]["id"] == undefined ? "" : datas[i]["id"];
                $("#factoryList").append("<option value = '"+ id +"'>"+ name +"</option>");
            }
        }
        initStockList();
    }
    //工厂列表组件值
    function initStockList(){
        $("#stockRosterList").empty();
        var factoryId = $("#factoryList option:selected").val();
        if(factoryId != undefined && factoryId != "" ){
            //从服务器获取所有数据
            var all = new Object(),page_object = new Object(),find = new Object();
            page_object.max="2000";
            page_object.start="0";
            find.orgId = factoryId;
            all.page = page_object;
            all.find = find;
            var responsedata = JSON.parse(stockRosterOp("list",all));
            if(responsedata.errCode == "success"){
                var datas = responsedata.resultList;
                for (var i = 0; i < datas.length; i++) {
                    var id = datas[i]["id"]== undefined?"":datas[i]["id"],
                        name = datas[i]["name"]== undefined?"":datas[i]["name"];
                    $("#stockRosterList").append("<option value = '"+ id +"'>"+ name +"</option>");
                }
            }
        }
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
