/**
 * Created by mq on 2016/7/4.
 */

$(function(){
    var inoutParam = new Object(), inoutItems = new Array(),item = new Object();
    var dataId = "57ce86660cf226b14dda35bc";
    var direct = "out";
    //fuel
    item.date = "2016-08-24";
    item.time = "09:43";
    item.much = "20";
    item.stockN = "1";
    item.groupN = "A";
    item.oper = "污泥出库";
    //mud in
    //item.supNo = "15";
    //item.supName = "皮革";
    //item.carNo = "12";
    //item.grossWei = "20";
    //item.tare = "5";
    //item.netWei = "15";
    inoutItems.push(item);
    inoutParam.dataId = dataId;
    inoutParam.direct = direct;
    inoutParam.items = inoutItems;
    //manulAddInout("fuel",inoutParam);
    //manulAddInout("mud",inoutParam);

    var distkeyParam = new Object();
    distkeyParam.dataId = dataId;
    distkeyParam.distKey = "supName";
    //distkeyList("fuel",distkeyParam);
    distkeyParam.direct = direct;
    //distkeyList("mud",distkeyParam);

    var startDate = new Date("August 20,2016 9:19:35");
    var endDate = new Date("August 30,2016 10:19:35");
    var fuelParam = new Object(),find = new Object(),page = new Object(),time = new Object();
    page.max="2000";page.start="0";
    time.start = startDate.getTime();
    time.end = endDate.getTime();
    find.dataId = dataId;
    find.time = time;

    fuelParam.find = find;
    fuelParam.page = page;
    //listImportData("fuel",fuelParam);
    fuelParam.direct = direct;
    //listImportData("mud",fuelParam);


    var formate = "YYYY/MM/DD",firstdate,enddate, stockInfoId = getStockId("fuel");
    $("#starthour").click(function(){
        laydate(setFirstLaydate(true,firstdate,laydate.now(0),formate));
    });
    $("#endhour").click(function(){
        laydate(setLastLaydate(true,enddate,firstdate,laydate.now(0),formate));
    });
    $(".fuelImport").click(function(){
        $("#progressbar").css("display","none");
        $("#fuelImportWindow").dialog("open");
    });
    sortOp("importTable","currentpage","pagelimit",10);
    setFirstLaydate(true,laydate.now(-2),laydate.now(0),formate);
    setLastLaydate(true,laydate.now(0),firstdate,laydate.now(0),formate);
    initWindow();
    //浏览按钮点击触发file类型input
    $("#showFile").click(function () {
        $("#fileName").click();
    });
    $("#browse").click(function () {
        $("#fileName").click();
    });
    //file类型input值改变时赋值给showFile
    $("#fileName").change(function () {
        $("#showFile").val($(this).val());
    });

   //初始化窗口信息
   function initWindow(){
       var fuelImportDialog = $("#fuelImportWindow").dialog({
           position:{ my: "center", at: "center", of: window},
           autoOpen: false,
           height: 350,
           width: 580,
           modal: true,
           buttons: [
               {
                   text: "导入",
                   click: function () {
                       $(".confirmMsg").html("");
                       var fileObject = document.getElementById("fileName"),//$("#fileName"),
                           fileName = $("#fileName").val();
                       if(fileName == ""){
                           $(".confirmMsg").html("请先选择文件！");
                           return false ;
                       }
                       $("#progressbar").css("display","block");
                       var importType = "fuel",direct="in",dataId=stockInfoId;
                       uploadfile(importType,direct,dataId,fileObject,2);
                   },
                   class: "sure",
               },{
                   text: "关闭",
                   click: function () {
                       fuelImportDialog.dialog("close");
                   },
                   class: "cancel",
               }
           ],
           close: function () {
               $("#fileName").val("");
               $("#showFile").val("");
               $(".confirmMsg").html("");
               $("#progressbar").css("display","none");
           }
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
