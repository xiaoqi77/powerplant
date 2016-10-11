/**
 * Created by mq on 2016/7/5.
 */
$(function(){
    $("#sludgeH").click(function(){
        $("#mudWindow").dialog("open");
    });
    $("#fuelH").click(function(){
        $("#fuelWindow").dialog("open");
    });
    $("#electricH").click(function(){
        $("#electricWindow").dialog("open");
    });
    $("#otherS").click(function(){
        $("#otherSWindow").dialog("open");
    });
    $("#emissionType").change(function () {
        family = $(this).val();
        historyData();
    });
    $("#mudin").click(function () {
        tabsInitMudTable("in");
    });
    $("#mudout").click(function () {
        tabsInitMudTable("out");
    });
    $("#mudsurplus").click(function () {
        tabsInitMudTable("surplus");
    });
    $("#fuelin").click(function () {
        tabsInitFuelTable("in");
    });
    $("#fuelout").click(function () {
        tabsInitFuelTable("out");
    });
    $("#fuelsurplus").click(function () {
        tabsInitFuelTable("surplus");
    });
    $("#electric").click(function () {
        tabsInitElectricTable("electric");
    });
    $("#wastwater").click(function () {
        tabsInitElectricTable("water");
    });
    var nowDate = new Date(), dayEnd,
    family = $("#emissionType option:selected").val();
    var year = nowDate.getFullYear(), month = nowDate.getMonth()+1, day = nowDate.getDate();
    dayEnd = new Date(year+"/"+month+"/"+day);
    initWindow();
    tabsInitMudTable("in",true);
    tabsInitFuelTable("in",true);
    tabsInitElectricTable("electric",true);
    historyData(true);
    /**
     * 污泥综合检测数据显示
     */
    function tabsInitMudTable(tabType,isFirst){
        var direct = "in";
        if(tabType == "surplus"){
            direct = undefined;
        }else{
            direct = tabType;
        }
        var stockId = getStockId("mud");
        var mudParm = new Object(),page_object = new Object(),find = new Object(),
            daytime = new Object();
        page_object.max="2000";
        page_object.start="0";
        find.dataId = stockId;
        daytime.scale = "day";
        mudParm.page = page_object;
        mudParm.find = find;
        mudParm.direct = direct;

        //当月数据
        daytime.start = (new Date(year+"/"+month+"/01")).getTime();
        daytime.end = nowDate.getTime();
        find.time = daytime;
        mudParm.find = find;
        var responsedata = JSON.parse(storageList("history",mudParm)),
            monthgrossWeiTotal = 0, monthnetweiTotal = 0, monthtareTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //只查余量
            if(direct == undefined){
                monthgrossWeiTotal = datas[datas.length -1]["stock"];
            }else{
                for (var i = 0; i < datas.length; i++) {
                    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                        inNum = datas[i][direct] == undefined ? 0 : datas[i][direct];
                    monthgrossWeiTotal = monthgrossWeiTotal.add(inNum);
                }
            }
        }
        //当年数据
        daytime.start = (new Date(year+"/01/01")).getTime();
        daytime.end = nowDate.getTime();
        find.time = daytime;
        mudParm.find = find;
        var responsedata = JSON.parse(storageList("history",mudParm)),
            yeargrossWeiTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //只查余量
            if(direct == undefined){
                yeargrossWeiTotal = datas[datas.length -1]["stock"];
            }else {
                for (var i = 0; i < datas.length; i++) {
                    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                        inNum = datas[i][direct] == undefined ? 0 : datas[i][direct];
                    yeargrossWeiTotal = yeargrossWeiTotal.add(inNum);
                }
            }
        }
        //上月同期消耗数据
        daytime.start = (new Date(year+"/"+(month-1)+"/01")).getTime();
        daytime.end = dayEnd.getTime()- 24*60*60*1000*30;
        find.time = daytime;
        mudParm.find = find;
        var responsedata = JSON.parse(storageList("history",mudParm)),
            monthmudOutTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //只查余量
            if(direct == undefined){
                monthmudOutTotal = datas[datas.length -1]["stock"];
            }else {
                for (var i = 0; i < datas.length; i++) {
                    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                        outNum = datas[i][direct] == undefined ? 0 : datas[i][direct];
                    monthmudOutTotal = monthmudOutTotal.add(outNum);
                }
            }
        }
        //去年同期数据
        daytime.start = (new Date((year-1)+"/01"+"/01")).getTime();
        daytime.end = (new Date((year-1)+"/"+month+"/"+day)).getTime();
        find.time = daytime;
        mudParm.find = find;
        var responsedata = JSON.parse(storageList("history",mudParm)),
            yearmudOutTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //只查余量
            if(direct == undefined){
                yearmudOutTotal = datas[datas.length -1]["stock"];
            }else {
                for (var i = 0; i < datas.length; i++) {
                    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                        outNum = datas[i][direct] == undefined ? 0 : datas[i][direct];
                    yearmudOutTotal = yearmudOutTotal.add(outNum);
                }
            }
        }
        if(isFirst){
            var storageParam = new Object(),sFind = new Object();
            sFind.dataId = stockId;
            storageParam.find = sFind;
            storageParam.page = page_object;
            //查询库存余量
            var responsedata = JSON.parse(storageList("now",storageParam));
            //当返回状态是success的时候才去填充表数据
            if (responsedata.errCode == "success") {
                var datas = responsedata.resultList;
                $("#mudNowStock").text(datas[datas.length-1]["stock"]+" 吨");
            }
        }
        $(".monthIndataTotal").html(Number(monthgrossWeiTotal).toFixed(0)+"吨");
        $(".monthOutdataTotal").html(Number(monthmudOutTotal).toFixed(0)+"吨");
        var monthSurplus = monthgrossWeiTotal-monthmudOutTotal;
        if(monthgrossWeiTotal != 0 && monthmudOutTotal !=0){
            var monthSurolusNumOverHtml = Number((monthSurplus/monthgrossWeiTotal).toFixed(4)).mul(100)+"%";
            var monthSurolusNumLessHtml = Number(((-monthSurplus)/monthgrossWeiTotal).toFixed(4)).mul(100)+"%";
            $(".monthSurplus").html(monthSurplus > 0?monthSurolusNumOverHtml:monthSurolusNumLessHtml);
        }else{
            $(".monthSurplus").html("");
        }
        $(".monthmudIcon").attr("src",monthSurplus >0?"../images/upArrow.png":"../images/downArrow.png");

        $(".yearIndataTotal").html(Number(yeargrossWeiTotal).toFixed(0)+"吨");
        $(".yearOutdataTotal").html(Number(yearmudOutTotal).toFixed(0)+"吨");
        var yearSurplus = yeargrossWeiTotal-yearmudOutTotal;
        if(yeargrossWeiTotal != 0 && yearmudOutTotal !=0){
            var yearSurolusNumOverHtml = Number((yearSurplus/(yeargrossWeiTotal).toFixed(4))).mul(100)+"%";
            var yearSurolusNumLessHtml = Number(((-yearSurplus)/(yeargrossWeiTotal)).toFixed(4)).mul(100)+"%";
            $(".yearSurplus").html(yearSurplus > 0?yearSurolusNumOverHtml:yearSurolusNumLessHtml);
        }else{
            $(".yearSurplus").html("");
        }
        $(".yearmudIcon").attr("src",yearSurplus >0?"../images/upArrow.png":"../images/downArrow.png");
    }
    /**
     * 污泥综合检测数据显示
     */
    function initMudTable(){
        var stockId = getStockId("mud");
        var mudParm = new Object(),page_object = new Object(),find = new Object(),
            daytime = new Object();
        page_object.max="2000";
        page_object.start="0";
        find.dataId = stockId;
        //昨日接收数据
        daytime.start = dayEnd.getTime() - 24*60*60*1000;
        daytime.end = dayEnd.getTime();
        daytime.scale = "day";
        find.time = daytime;
        mudParm.page = page_object;
        //mudParm.direct = "in";
        mudParm.find = find;
        //var responsedata = JSON.parse(listImportData("mud",mudParm)),
        //    daygrossWeiTotal = 0, daynetweiTotal = 0, daytareTotal = 0;
        ////当返回状态是success的时候才去填充表数据
        //if (responsedata.errCode == "success") {
        //    var datas = responsedata.resultList;
        //    for (var i = 0; i < datas.length; i++) {
        //        var netWei = datas[i]["netWei"] == undefined ? "" : datas[i]["netWei"],
        //            grossWei = datas[i]["grossWei"] == undefined ? "" : datas[i]["grossWei"],
        //            tare = datas[i]["tare"] == undefined ? "" : datas[i]["tare"];
        //        daygrossWeiTotal += grossWei;
        //        daynetweiTotal += netWei;
        //        daytareTotal += tare;
        //    }
        //}
        //当月接收数据
        daytime.start = (new Date(year+"/"+month+"/01")).getTime();
        daytime.end = nowDate.getTime();
        find.time = daytime;
        mudParm.find = find;
        //mudParm.direct = "in";

        var filter = new Object();
        filter.exclude = "out";
        mudParm.filter = filter;
        var responsedata = JSON.parse(storageList("history",mudParm)),
        //var responsedata = JSON.parse(listImportData("mud",mudParm)),
            monthgrossWeiTotal = 0, monthnetweiTotal = 0, monthtareTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            for (var i = 0; i < datas.length; i++) {
                var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                    time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                    inNum = datas[i]["in"] == undefined ? 0 : datas[i]["in"];
                monthgrossWeiTotal = monthgrossWeiTotal.add(inNum);
            }
        }
        //当返回状态是success的时候才去填充表数据
        //if (responsedata.errCode == "success") {
        //    var datas = responsedata.resultList;
        //    for (var i = 0; i < datas.length; i++) {
        //        var netWei = datas[i]["netWei"] == undefined ? "" : datas[i]["netWei"],
        //            grossWei = datas[i]["grossWei"] == undefined ? "" : datas[i]["grossWei"],
        //            tare = datas[i]["tare"] == undefined ? "" : datas[i]["tare"];
        //        monthgrossWeiTotal = monthgrossWeiTotal.add(grossWei);
        //        monthnetweiTotal = monthnetweiTotal.add(netWei);
        //        monthtareTotal = monthtareTotal.add(tare);
        //    }
        //}
        //当年接收数据
        daytime.start = (new Date(year+"/01/01")).getTime();
        daytime.end = nowDate.getTime();
        find.time = daytime;
        mudParm.find = find;
        var responsedata = JSON.parse(storageList("history",mudParm)),
            yeargrossWeiTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            for (var i = 0; i < datas.length; i++) {
                var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                    time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                    inNum = datas[i]["in"] == undefined ? 0 : datas[i]["in"];
                yeargrossWeiTotal = yeargrossWeiTotal.add(inNum);
            }
        }
        //mudParm.direct = "in";
        //var responsedata = JSON.parse(listImportData("mud",mudParm)),
        //    yeargrossWeiTotal = 0, yearnetweiTotal = 0, yeartareTotal = 0;
        ////当返回状态是success的时候才去填充表数据
        //if (responsedata.errCode == "success") {
        //    var datas = responsedata.resultList;
        //    for (var i = 0; i < datas.length; i++) {
        //        var netWei = datas[i]["netWei"] == undefined ? "" : datas[i]["netWei"],
        //            grossWei = datas[i]["grossWei"] == undefined ? "" : datas[i]["grossWei"],
        //            tare = datas[i]["tare"] == undefined ? "" : datas[i]["tare"];
        //        yeargrossWeiTotal = yeargrossWeiTotal.add(grossWei);
        //        yearnetweiTotal = yearnetweiTotal.add(netWei);
        //        yeartareTotal = yeartareTotal.add(tare);
        //    }
        //}
        //前日消耗数据
        //daytime.start = dayEnd.getTime() - 24*60*60*1000*2;
        //daytime.end = dayEnd.getTime()- 24*60*60*1000;
        //find.time = daytime;
        //mudParm.find = find;
        //mudParm.direct = "out";
        //var responsedata = JSON.parse(listImportData("mud",mudParm)),
        //    daymudOutTotal = 0;
        ////当返回状态是success的时候才去填充表数据
        //if (responsedata.errCode == "success") {
        //    var datas = responsedata.resultList;
        //    for (var i = 0; i < datas.length; i++) {
        //        var much = datas[i]["much"] == undefined ? "" : datas[i]["much"];
        //        daymudOutTotal += much;
        //    }
        //}
        //上月同期消耗数据
        daytime.start = (new Date(year+"/"+(month-1)+"/01")).getTime();
        daytime.end = dayEnd.getTime()- 24*60*60*1000*30;
        find.time = daytime;
        mudParm.find = find;
        var filter = new Object();
        filter.exclude = "in";
        mudParm.filter = filter;
        var responsedata = JSON.parse(storageList("history",mudParm)),
            monthmudOutTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            for (var i = 0; i < datas.length; i++) {
                var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                    time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                    outNum = datas[i]["out"] == undefined ? 0 : datas[i]["out"];
                monthmudOutTotal = monthmudOutTotal.add(outNum);
            }
        }
        //mudParm.direct = "out";
        //var responsedata = JSON.parse(listImportData("mud",mudParm)),
        //    monthmudOutTotal = 0;
        ////当返回状态是success的时候才去填充表数据
        //if (responsedata.errCode == "success") {
        //    var datas = responsedata.resultList;
        //    for (var i = 0; i < datas.length; i++) {
        //        var much = datas[i]["much"] == undefined ? "" : datas[i]["much"];
        //        monthmudOutTotal = monthmudOutTotal.add(much);
        //    }
        //}
        //去年同期消耗数据
        daytime.start = (new Date((year-1)+"/01"+"/01")).getTime();
        daytime.end = (new Date((year-1)+"/"+month+"/"+day)).getTime();
        find.time = daytime;
        mudParm.find = find;
        var responsedata = JSON.parse(storageList("history",mudParm)),
            yearmudOutTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            for (var i = 0; i < datas.length; i++) {
                var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                    time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                    outNum = datas[i]["out"] == undefined ? 0 : datas[i]["out"];
                yearmudOutTotal = yearmudOutTotal.add(outNum);
            }
        }
        //mudParm.direct = "out";
        //var responsedata = JSON.parse(listImportData("mud",mudParm)),
        //    yearmudOutTotal = 0;
        ////当返回状态是success的时候才去填充表数据
        //if (responsedata.errCode == "success") {
        //    var datas = responsedata.resultList;
        //    for (var i = 0; i < datas.length; i++) {
        //        var much = datas[i]["much"] == undefined ? "" : datas[i]["much"];
        //        yearmudOutTotal = yearmudOutTotal.add(much);
        //    }
        //}
        var storageParam = new Object(),sFind = new Object();
        sFind.dataId = stockId;
        storageParam.find = sFind;
        storageParam.page = page_object;
        //查询库存余量
        var responsedata = JSON.parse(storageList("now",storageParam));
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            $("#mudNowStock").text(datas[datas.length-1]["stock"]+" 吨");
        }
        //$("#dayIndataTotal").html(daygrossWeiTotal+"吨");
        //$("#dayOutdataTotal").html(daymudOutTotal+"吨");
        //var daySurplusNum = daygrossWeiTotal-daymudOutTotal;
        //
        //var daySurolusNumOverHtml = "<label class='showNum'>"+daySurplusNum+"吨</label><br><label class='showNum'>"
        //    +(daySurplusNum/(daygrossWeiTotal==0?1:daygrossWeiTotal))*100+"%</label>";
        //
        //var daySurolusNumLessHtml = "<label class='showNum'>"+(-daySurplusNum)+"吨</label><br><label class='showNum'>"
        //    +((-daySurplusNum)/(daygrossWeiTotal==0?1:daygrossWeiTotal))*100+"%</label>";
        //$("#daySurplus").html(daySurplusNum > 0?daySurolusNumOverHtml:daySurolusNumLessHtml);
        //$("#daymudIcon").attr("src",daySurplusNum >0?"../images/upArrow.png":"../images/downArrow.png");

        $("#monthIndataTotal").html(monthgrossWeiTotal+"吨");
        $("#monthOutdataTotal").html(monthmudOutTotal+"吨");
        var monthSurplus = monthgrossWeiTotal-monthmudOutTotal;
        var monthSurolusNumOverHtml = "<label class='showNum'>"
            +Number((monthSurplus/(monthgrossWeiTotal==0?1:monthgrossWeiTotal)).toFixed(5))*100+"%</label>";
        var monthSurolusNumLessHtml = "<label class='showNum'>"
            +Number(((-monthSurplus)/(monthgrossWeiTotal==0?1:monthgrossWeiTotal)).toFixed(5))*100+"%</label>";
        $("#monthSurplus").html(monthSurplus > 0?monthSurolusNumOverHtml:monthSurolusNumLessHtml);
        $("#monthmudIcon").attr("src",monthSurplus >0?"../images/upArrow.png":"../images/downArrow.png");

        $("#yearIndataTotal").html(yeargrossWeiTotal+"吨");
        $("#yearOutdataTotal").html(yearmudOutTotal+"吨");
        var yearSurplus = yeargrossWeiTotal-yearmudOutTotal;
        var yearSurolusNumOverHtml = "<label class='showNum'>"
        +Number((yearSurplus/(yeargrossWeiTotal==0?1:yeargrossWeiTotal).toFixed(5)))*100+"%</label>";
        var yearSurolusNumLessHtml = "<label class='showNum'>"
        +Number(((-yearSurplus)/(yeargrossWeiTotal==0?1:yeargrossWeiTotal)).toFixed(5))*100+"%</label>";
        $("#yearSurplus").html(yearSurplus > 0?yearSurolusNumOverHtml:yearSurolusNumLessHtml);
        $("#yearmudIcon").attr("src",yearSurplus >0?"../images/upArrow.png":"../images/downArrow.png");
    }

    /**
     * 燃料综合数据检测
     */
    function tabsInitFuelTable(tabType,isFirst){
        var direct = "in";
        if(tabType == "surplus"){
            direct = undefined;
        }else{
            direct = tabType;
        }
        var stockId = getStockId("fuel");
        var fuelParm = new Object(),page_object = new Object(),find = new Object(),
            daytime = new Object();
        page_object.max="2000";
        page_object.start="0";
        find.dataId = stockId;
        fuelParm.page = page_object;
        daytime.scale = "day";
        find.direct = direct;
        //当月接收数据
        daytime.start = (new Date(year+"/"+month+"/01")).getTime();
        daytime.end = nowDate.getTime();
        find.time = daytime;
        fuelParm.find = find;
        var responsedata = JSON.parse(storageList("history",fuelParm)),
            monthfuleIndataTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //只查余量
            if(direct == undefined){
                monthfuleIndataTotal = datas[datas.length -1]["stock"];
            }else {
                for (var i = 0; i < datas.length; i++) {
                    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                        inNum = datas[i][direct] == undefined ? 0 : datas[i][direct];
                    monthfuleIndataTotal = monthfuleIndataTotal.add(inNum);
                }
            }
        }
        //当年接收数据
        daytime.start = (new Date(year+"/01/01")).getTime();
        daytime.end = nowDate.getTime();
        find.time = daytime;
        fuelParm.find = find;
        var responsedata = JSON.parse(storageList("history",fuelParm)),
            yearfuleIndataTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //只查余量
            if(direct == undefined){
                yearfuleIndataTotal = datas[datas.length -1]["stock"];
            }else {
                for (var i = 0; i < datas.length; i++) {
                    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                        inNum = datas[i][direct] == undefined ? 0 : datas[i][direct];
                    yearfuleIndataTotal = yearfuleIndataTotal.add(inNum);
                }
            }
        }
        //上月同期消耗数据
        daytime.start = (new Date(year+"/"+(month-1)+"/01")).getTime();
        daytime.end = dayEnd.getTime()- 24*60*60*1000*30;
        find.time = daytime;
        fuelParm.find = find;
        var responsedata = JSON.parse(storageList("history",fuelParm)),
            monthfuelOutTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //只查余量
            if(direct == undefined){
                monthfuelOutTotal = datas[datas.length -1]["stock"];
            }else {
                for (var i = 0; i < datas.length; i++) {
                    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                        outNum = datas[i][direct] == undefined ? 0 : datas[i][direct];
                    monthfuelOutTotal = monthfuelOutTotal.add(outNum);
                }
            }
        }
        //去年同期消耗数据
        daytime.start = (new Date((year-1)+"/01"+"/01")).getTime();
        daytime.end = (new Date((year-1)+"/"+month+"/"+day)).getTime();
        find.time = daytime;
        fuelParm.find = find;
        var responsedata = JSON.parse(storageList("history",fuelParm)),
            yearfuelOutTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //只查余量
            if(direct == undefined){
                yearfuelOutTotal = datas[datas.length -1]["stock"];
            }else {
                for (var i = 0; i < datas.length; i++) {
                    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
                        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                        outNum = datas[i][direct] == undefined ? 0 : datas[i][direct];
                    yearfuelOutTotal = yearfuelOutTotal.add(outNum);
                }
            }
        }
        if(isFirst){
            var storageParam = new Object(),sFind = new Object();
            sFind.dataId = stockId;
            storageParam.find = sFind;
            storageParam.page = page_object;
            //查询库存余量
            var responsedata = JSON.parse(storageList("now",storageParam));
            //当返回状态是success的时候才去填充表数据
            if (responsedata.errCode == "success") {
                var datas = responsedata.resultList;
                $("#fuelNowStock").text(datas[datas.length-1]["stock"]+" 吨");
            }
        }
        $(".monthInfuelTotal").html(Number(monthfuleIndataTotal).toFixed(0)+"吨");
        $(".monthOutfuelTotal").html(Number(monthfuelOutTotal).toFixed(0)+"吨");
        var monthSurplus = monthfuleIndataTotal-monthfuelOutTotal;
        if(monthfuleIndataTotal != 0 && monthfuelOutTotal != 0){
            var monthSurolusNumOverHtml = Number((monthSurplus/(monthfuleIndataTotal)).toFixed(4)).mul(100)+"%";
            var monthSurolusNumLessHtml = Number(((-monthSurplus)/(monthfuleIndataTotal)).toFixed(4)).mul(100)+"%";
            $(".monthfuelSurplus").html(monthSurplus > 0?monthSurolusNumOverHtml:monthSurolusNumLessHtml);
        }else{
            $(".monthfuelSurplus").html("");
        }
        $(".monthfuelIcon").attr("src",monthSurplus >0?"../images/upArrow.png":"../images/downArrow.png");

        $(".yearInfuelTotal").html(Number(yearfuleIndataTotal).toFixed(0)+"吨");
        $(".yearOutfuelTotal").html(Number(yearfuelOutTotal).toFixed(0)+"吨");
        var yearSurplus = yearfuleIndataTotal-yearfuelOutTotal;
        if(yearfuleIndataTotal != 0 && yearfuelOutTotal != 0){
            var yearSurolusNumOverHtml = Number((yearSurplus/(yearfuleIndataTotal)).toFixed(4)).mul(100)+"%";
            var yearSurolusNumLessHtml = Number(((-yearSurplus)/(yearfuleIndataTotal)).toFixed(4)).mul(100)+"%";
            $(".yearfuelSurplus").html(yearSurplus > 0?yearSurolusNumOverHtml:yearSurolusNumLessHtml);
        }else{
            $(".yearfuelSurplus").html("");
        }
        $(".yearfuelIcon").attr("src",yearSurplus >0?"../images/upArrow.png":"../images/downArrow.png");
    }
    /**
     * 发电量综合数据检测
     */
    function tabsInitElectricTable(tabType,isFirst){
        var elParm = new Object(),page_object = new Object(),find = new Object(),
            daytime = new Object();
        page_object.max="2000";
        page_object.start="0";
        daytime.scale = "day";
        elParm.page = page_object;
        if(tabType == "electric"){
            var elstockId = getStockId("electric");
            find.dataId = elstockId;
        }else{
            var waterstockId = getStockId("water");
            find.dataId = waterstockId;
        }
        //当月接收数据
        daytime.start = (new Date(year+"/"+month+"/01")).getTime();
        daytime.end = nowDate.getTime();
        find.time = daytime;
        elParm.find = find;
        var responsedata = JSON.parse(storageList("history",elParm)),
            montheldataTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //for (var i = 0; i < datas.length; i++) {
            //    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
            //        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
            //        inNum = datas[i]["in"] == undefined ? 0 : datas[i]["in"];
            //    montheldataTotal = montheldataTotal.add(inNum);
            //}
            montheldataTotal = datas[datas.length-1]["stock"] - datas[0]["stock"];
        }
        //当年接收数据
        daytime.start = (new Date(year+"/01/01")).getTime();
        daytime.end = nowDate.getTime();
        find.time = daytime;
        elParm.find = find;
        var responsedata = JSON.parse(storageList("history",elParm)),
            yeareldataTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //for (var i = 0; i < datas.length; i++) {
            //    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
            //        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
            //        inNum = datas[i]["in"] == undefined ? 0 : datas[i]["in"];
            //    yeareldataTotal = yeareldataTotal.add(inNum);
            //}
            yeareldataTotal = datas[datas.length-1]["stock"] - datas[0]["stock"];
        }
        //上月同期消耗数据
        daytime.start = (new Date(year+"/"+(month-1)+"/01")).getTime();
        daytime.end = dayEnd.getTime()- 24*60*60*1000*30;
        find.time = daytime;
        elParm.find = find;
        var responsedata = JSON.parse(storageList("history",elParm)),
            monthwaterTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //for (var i = 0; i < datas.length; i++) {
            //    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
            //        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
            //        outNum = datas[i]["out"] == undefined ? 0 : datas[i]["out"];
            //    monthwaterTotal = monthwaterTotal.add(outNum);
            //}
            monthwaterTotal = datas[datas.length-1]["stock"] - datas[0]["stock"];
        }
        //去年同期消耗数据
        daytime.start = (new Date((year-1)+"/01"+"/01")).getTime();
        daytime.end = (new Date((year-1)+"/"+month+"/"+day)).getTime();
        find.time = daytime;
        elParm.find = find;
        var responsedata = JSON.parse(storageList("history",elParm)),
            yearwaterTotal = 0;
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            //for (var i = 0; i < datas.length; i++) {
            //    var stock = datas[i]["stock"] == undefined ? "" : datas[i]["stock"],
            //        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
            //        outNum = datas[i]["out"] == undefined ? 0 : datas[i]["out"];
            //    yearwaterTotal = yearwaterTotal.add(outNum);
            //}
            yearwaterTotal = datas[datas.length-1]["stock"] - datas[0]["stock"];
        }
        if(isFirst){
            var storageParam = new Object(),sFind = new Object();
            sFind.dataId = elstockId;
            storageParam.find = sFind;
            storageParam.page = page_object;
            //查询库存余量
            var responsedata = JSON.parse(storageList("now",storageParam));
            //当返回状态是success的时候才去填充表数据
            if (responsedata.errCode == "success") {
                var datas = responsedata.resultList;
                $("#elNowStock").text(datas[datas.length-1]["stock"]+" kkwh");
            }
        }
        if(tabType == "water"){
            montheldataTotal = montheldataTotal+"吨";
            monthwaterTotal = monthwaterTotal+"吨";
            yeareldataTotal = yeareldataTotal+"吨";
            yearwaterTotal = yearwaterTotal+"吨";
        }else{
            montheldataTotal = montheldataTotal+"kkwh";
            monthwaterTotal = monthwaterTotal+"kkwh";
            yeareldataTotal = yeareldataTotal+"kkwh";
            yearwaterTotal = yearwaterTotal+"kkwh";
        }
        $(".monthElecTotal").html(montheldataTotal);
        $(".monthWaterTotal").html(monthwaterTotal);

        $(".yearElecTotal").html(yeareldataTotal);
        $(".yearWaterTotal").html(yearwaterTotal);
    }
    /**
     * 排放数据查询
     * @param isFirst
     */
    function historyData(isFirst){
        var devId = getCookie("deviceId");
        var page_object = new Object(),findBy = new Object(),other_object = new Object();
        page_object.max="2000";
        page_object.start="0";
        findBy.devId = devId;

        var sort = new Object();
        sort.asc = "time";
        other_object.sort = sort;

        var time = new Object();
        if(family == "发电量" || family == "用水量"){
            time.scale = "all";
            datanow(findBy,page_object,other_object);
        }else{
            time.scale = "day";
        }
        findBy.family = family;
        findBy.name = family;

        //当月时间
        //time.start = (new Date(year+"/"+month+"/01")).getTime();
        //time.end = nowDate.getTime();

        //当年接收数据
        //time.start = (new Date(year+"/01/01")).getTime();
        //time.end = nowDate.getTime();

        //上月消耗数据
        time.start = (new Date(year+"/"+(month-1)+"/01")).getTime();
        time.end = (new Date(year+"/"+month+"/"+(new Date(year, month, 0).getDate()))).getTime();

        //去年同期消耗数据
        //time.start = (new Date((year-1)+"/01"+"/01")).getTime();
        //time.end = (new Date((year-1)+"/"+month+"/"+day)).getTime();
        findBy.time = time;
        //var historyDatasObject = JSON.parse(datahistory(findBy,page_object,other_object));
        var valuePointArray = analyData(findBy,page_object,other_object),otherArray = new Array();

       if(isFirst){
           findBy.family = "NOX";
           findBy.name = "NOX";
           otherArray = analyData(findBy,page_object,other_object);
       }
        initHistoryChart(isFirst,"so2monthcontainer","line",valuePointArray,otherArray);
    }
    //解析后台返回数据
    function analyData(findBy,page_object,other_object){
        var historyDatasObject = JSON.parse(datahistory(findBy,page_object,other_object)),valuePointArray = new Array();
        if(historyDatasObject.errCode == "success" && historyDatasObject.total != 0){
            var resultList = historyDatasObject.resultList;
            //获取所有结果数据
            for(var i in resultList){
                for(var j in resultList[i]){
                    var dayResult = resultList[i]["dayResult"];
                    var date = resultList[i]["day"] == undefined?"":resultList[i]["day"],
                        substrTime = date.substring(0, 4) + "/" + date.substring(4, 6) + "/" + date.substring(6, 8),
                        time = (new Date(substrTime)).getTime();
                    for(var k in dayResult) {
                        var item = dayResult[k];
                        var indicatorValue = item["values"][0]["avg"]== undefined ? 0 : item["values"][0]["avg"];
                        var point = new Array();
                        point.push(time);
                        point.push(Number(indicatorValue));
                        valuePointArray.push(point);
                    }
                }
            }
        }
        return valuePointArray;
    }
    //初始化历史图
    function initHistoryChart(isFirst,id,type,valuePointArray,otherArray){
        var options = {
            chart: {
                renderTo: id,
                type: type
            },
            title: {
                useHTML: true,
                text: family
            },
            navigator: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            },
            rangeSelector: {
                enabled: false
            },
            xAxis: {
                type: 'datetime',
                //crosshair: true,
                endOnTick:true,
                showLastLabel:false,
                labels: {
                    format: '{value:%m/%d}',
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
                xDateFormat:'%m/%d',
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: []
        };
        options.series = new Array();
        options.series[0] = new Object();
        options.series[0].name = family;
        options.series[0].color = "#1aadce";
        options.series[0].data = valuePointArray;
        if(isFirst){
            options.series[1] = new Object();
            options.series[1].name = "NOX";
            options.series[1].color = "green";
            options.series[1].data = otherArray;

            options.title = new Object();
            options.title.text = family + " 和 NOX"
        }
        $("#" +id).highcharts("Chart",options);
    }

    /**
     * 初始化弹出窗口信息
     */
    function initWindow(){
        $("#mudWindow").dialog({
            position:{ my: "left top", at: "left top", of: "#sludgeH"},
            autoOpen: false,
            height: 350,
            width: 400,
            modal: false,
            open:function(){
                //$(".ui-dialog-titlebar-close").addClass("ui-dialog-titlebar-alarm");
                $("#alarmWindow").prev().find("button").hide();//先找到上一个同级兄弟，再找元素，然后隐藏
                $(".ui-dialog-buttonpane").hide();
            }
        });
        $("#fuelWindow").dialog({
            position:{ my: "center", at: "right bottom", of: "#fuelH"},
            autoOpen: false,
            height: 350,
            width: 400,
            modal: false,
            open:function(){
                //$(".ui-dialog-titlebar-close").addClass("ui-dialog-titlebar-alarm");
                $("#alarmWindow").prev().find("button").hide();//先找到上一个同级兄弟，再找元素，然后隐藏
                $(".ui-dialog-buttonpane").hide();
            }
        });
        $("#electricWindow").dialog({
            position:{ my: "center", at: "left bottom", of: "#electricH"},
            autoOpen: false,
            height: 250,
            width: 400,
            modal: false,
            open:function(){
                //$(".ui-dialog-titlebar-close").addClass("ui-dialog-titlebar-alarm");
                $("#alarmWindow").prev().find("button").hide();//先找到上一个同级兄弟，再找元素，然后隐藏
                $(".ui-dialog-buttonpane").hide();
            }
        });
        $("#otherSWindow").dialog({
            position:{ my: "center", at: "right bottom", of: "#otherS"},
            autoOpen: false,
            height: 250,
            width: 400,
            modal: false,
            open:function(){
                //$(".ui-dialog-titlebar-close").addClass("ui-dialog-titlebar-alarm");
                $("#alarmWindow").prev().find("button").hide();//先找到上一个同级兄弟，再找元素，然后隐藏
                $(".ui-dialog-buttonpane").hide();
            }
        });
        $("#alarmWindow").dialog({
            position:{ my: "center", at: "right bottom", of: window},
            autoOpen: false,
            height: 150,
            width: 200,
            modal: false,
            open:function(){
                //$(".ui-dialog-titlebar-close").addClass("ui-dialog-titlebar-alarm");
                $("#alarmWindow").prev().find("button").hide();//先找到上一个同级兄弟，再找元素，然后隐藏
                $(".ui-dialog-buttonpane").hide();
            }
        });
    }
});