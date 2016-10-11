$(function () {
    //初始化窗口变量
    var stockDialog,
        tipdialog, //提示信息对话框
        addOrUpdateOrgTips = $(".validateTips");
    stockDialog = $("#addStock").dialog({
        autoOpen: false,
        height: 300,
        width: 530,
        modal: true,
        buttons: [{
            text: "确定",
            click: function () {
                var flag = addOrUpdateStock();
                if(flag != false){
                    stockDialog.dialog("close");
                }
            },
            class: "sure",
        }, {
            text: "取消",
            click: function () {
                stockDialog.dialog("close");
            },
            class: "cancel",
        }],
        close: function () {
        }
    });
    tipdialog = $("#tip").dialog({
        autoOpen: false,
        height: 300,
        width: 530,
        modal: true,
        buttons: [{
            text: "确定",
            click: function (_button) {
                tipdialog.dialog("close");
                //只有删除操作才处理
                var del = $(this).dialog("option","_button");
                if(del != null){
                    if(del == "del"){
                        $("input[type=checkbox][name=checkbox]:checked").each(function () {
                            var attrId = $(this).attr("id");
                            if(attrId == "checkAll"){
                                return true;
                            }
                            var stock = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                            stockRosterDelete(stock.id);
                            $(this).parent().parent().remove();
                        });
                    }else{
                        var stock = JSON.parse(del.parent().parent().children("td").eq(0).text());
                        stockRosterDelete(stock.id);
                        del.parent().parent().remove();
                    }
                }
            },
            class: "sure",
        }, {
            text: "取消",
            click: function () {
                tipdialog.dialog("close");
            },
            class: "cancel",
        }]
    });
    // jquery conflict handle
    //jQuery.noConflict();
    $("#checkAll").click(function () {
        if ($(this).is(':checked')) {
            $("input[name=checkbox][type=checkbox]").each(function () {
                $(this).prop("checked", true);
            });
        } else {
            $("input[type=checkbox][name=checkbox]").each(function () {
                $(this).prop("checked", false);
            });
        }
    });
    //添加
    $(".add").click(function () {
        var factoryInfo = $("#factoryList option:selected").text();
        if(factoryInfo == undefined ){
            alert("当前没有选择工厂信息！");
        }else{
            $("#factoryLi").css("display","inline");
            $(".confirmMsg").html("");
            $("#name").val("");
            $("#unit").val("");
            $("#factoryInfo").val(factoryInfo);
            stockDialog.dialog("open");
            stockDialog.dialog({title: "添加库存条目"});
            addOrUpdateOrgTips.text("请添加下面信息");
        }
    });
    //修改
    $(".update").click(function () {
        $(".confirmMsg").html("");
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if (length != 0 && length == 1) {
            var obj = $("input[type=checkbox][name=checkbox]:checked");
            $("#factoryLi").css("display","none");
            //给文本框赋值
            updateorgui(obj);
        } else {
            tipdialog.dialog("option","title","提示信息");
            $("#tip .tipright p").html("当前需要且只能选择一条数据进行修改，请重新选择！");
            tipdialog.dialog("open");
        }
    });
    //del one or more data
    $(".del").click(function () {
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if (length == 0) {
            tipdialog.dialog("option","title","删除提示信息");
            $("#tip .tipright p").html("当前没有选择任何数据进行删除！");
        } else {
            tipdialog.dialog("option","title","删除提示信息");
            $("#tip .tipright p").html("确定删除数据信息！");
            tipdialog.dialog("option","_button","del");
        }
        tipdialog.dialog("open");
    });
    //del a data
    $(document).on("click",".delOrg",function () {
        tipdialog.dialog("option","title","删除提示信息");
        $("#tip .tipright p").html("确定删除数据信息！！");
        tipdialog.dialog("option","_button",$(this));
        tipdialog.dialog("open");
    });
    $("#factoryList").change(function(){
        var factoryInfo = JSON.parse($(this).val());
        //从服务器获取所有数据
        var all = new Object(),page_object = new Object(),find = new Object();
        page_object.max="2000";
        page_object.start="0";
        find.orgId = factoryInfo.id;
        all.page = page_object;
        all.find = find;
        fillRow(all);
    });
    $("#searchpng").click(function(){
        //从服务器获取数据
        var parm = new Object();
        var selectType = $("#searchType option:selected").text();
        var factoryInfo = $("#factoryList option:selected").val();
        if(factoryInfo == undefined ){
            alert("当前没有选择工厂信息！");
        }else{
            if(selectType == "全部"){
                parm.all="";
            }else if(selectType == "名称"){
                var orgname = $("#searchByName").val().trim();
                if(orgname == ""){
                    alert("库存条目名称不能为空！");
                    return false;
                }
                parm.name = orgname;
            }
            fillRow(parm);
        }
    });
    sortOp("stockRosterTable","currentpage","pagelimit",10);
    initUI();
    var factoryInfo = JSON.parse($("#factoryList option:selected").val());
    if(factoryInfo == undefined ){
        alert("当前没有工厂信息,请先添加工厂组织信息！");
    }else{
        //从服务器获取所有数据
        var all = new Object(),page_object = new Object(),find = new Object();
        page_object.max="2000";
        page_object.start="0";
        find.orgId = factoryInfo.id;
        all.page = page_object;
        all.find = find;
        fillRow(all);
    }
    //添加或修改库存条目数据处理
    function addOrUpdateStock(){
        var title = $("#addStock").dialog("option", "title");
        var name = $("#name").val().trim();
        var unit = $("#unit").val().trim();
        var factoryInfo = JSON.parse($("#factoryList option:selected").val());
        if(name == ""){
            $(".confirmMsg").html("名称不能为空！");
            return false;
        }
        var addParam = new Object();
        addParam.orgId = factoryInfo.id;
        addParam.name = name;
        addParam.unit = unit;
        if (title == "添加库存条目") {
            var response = JSON.parse(stockRosterOp("create",addParam));
            if(response.errCode == "success"){
                var stockId = response.id;
                var parm = new Object();
                parm.id = stockId;
                parm.name = name;
                parm.unit = unit;
                var length = $(".stockRosterTable tbody tr").length + 1;
                $(".stockRosterTable tbody").append("<tr id='org_" + length + "'>" +
                    "<td style='display: none'>" + JSON.stringify(parm) + "</td>" +
                    "<td><input name='checkbox' type='checkbox' id='checkbox_" + length + "'/></td>" +
                    "<td>" + length + "</td>" +
                    "<td>" + name + "</td>" +
                    "<td>" + unit + "</td>" +
                    "<td><a href='#'  class='delOrg tablelink'> 删除</a></td>" +
                    "</tr>");
            }else{
                alert("添加失败！");
                return false;
            }
        } else {
            var stockObject = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());
            var updateParam = new Object();
            if(name != stockObject.name){stockObject.name = name;updateParam.name=name;}
            if(unit != stockObject.unit ) {stockObject.unit = unit;updateParam.unit=unit;}
            updateParam.id = stockObject.id;
            var response = JSON.parse(stockRosterOp("update",updateParam));
            if(response.errCode == "success"){
                $("input[type=checkbox][name=checkbox]:checked").each(function () {
                    var tr = $(this).parent().parent();
                    tr.children("td").eq(0).text(JSON.stringify(stockObject));
                    tr.children("td").eq(3).text(name);
                    tr.children("td").eq(4).text(unit);
                });
            }else{
                alert("修改失败！");
                return false;
            }
        }
    }
    //修改组织时，给弹出窗口控件赋值
    function updateorgui(obj){
        obj.each(function () {
            var stockObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
            var name = stockObject.name == undefined?"":stockObject.name,
                unit = stockObject.unit == undefined?"":stockObject.unit;
            $("#name").val(name);
            $("#unit").val(unit);
            stockDialog.dialog("open");
            stockDialog.dialog({title: "修改库存条目"});
            addOrUpdateOrgTips.text("修改库存条目信息");
        });
    }
    //填充表数据
    function fillRow(parm) {
        //清空表数据
        $(".stockRosterTable tbody").empty();
        $(".stockRosterTable tbody").html("");
        var responsedata = JSON.parse(stockRosterOp("list",parm));
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            for (var i = 0; i < datas.length; i++) {
                var unit = datas[i]["unit"]== undefined?"":datas[i]["unit"],
                    name = datas[i]["name"]== undefined?"":datas[i]["name"];
                $(".stockRosterTable tbody").append("<tr id='org_" + (i + 1) + "'>" +
                    "<td style='display: none'>" + JSON.stringify(datas[i]) + "</td>" +//id
                    "<td><input name='checkbox' class='nosort' type='checkbox' id='checkbox_" + (i + 1) + "'/></td>" +
                    "<td>" + (i + 1) + "</td>" +
                    "<td>" + name + "</td>" +//name
                    "<td>" + unit + "</td>" +//unit
                    "<td><a href='#' class='delOrg tablelink'> 删除</a></td>" +
                    "</tr>");
            }
            sorter.init("stockRosterTable",2);
        }
    }
    //初始化组件值
    function initUI(){
        var facoryParam = new Object();
        facoryParam.type = "factory";
        var responsedata = JSON.parse(listorg(facoryParam));
        if(responsedata.errCode == "success"){
            var datas = responsedata.orgList;
            for (var i = 0; i < datas.length; i++) {
                var orgInfo = JSON.stringify(datas[i]);
                var name = datas[i]["name"] == undefined ? "" : datas[i]["name"];
                $("#factoryList").append("<option value = '"+ orgInfo.trim() +"'>"+ name +"</option>");
            }
        }
    }
});
var sorter = new TINY.table.sorter("sorter");