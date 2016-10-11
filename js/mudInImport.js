/**
 * Created by mq on 2016/7/4.
 */

$(function(){

    var formate = "YYYY/MM/DD",firstdate,enddate, stockInfoId = getStockId("mud");
    $("#starthour").click(function(){
        laydate(setFirstLaydate(true,firstdate,laydate.now(0),formate));
    });
    $("#endhour").click(function(){
        laydate(setLastLaydate(true,enddate,firstdate,laydate.now(0),formate));
    });
    $(".mudImport").click(function(){
        $("#progressbar").css("display","none");
        $("#mudImportWindow").dialog("open");
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
       var mudImportDialog = $("#mudImportWindow").dialog({
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
                       var importType = "mud",direct="in",dataId=stockInfoId;
                       uploadfile(importType,direct,dataId,fileObject,2);
                   },
                   class: "sure",
               },{
                   text: "关闭",
                   click: function () {
                       mudImportDialog.dialog("close");
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
       $("#integratedImportWindow").dialog({
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
