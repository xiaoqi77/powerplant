$(function () {
    //初始化窗口变量
    var orgType = new Object();
    orgType.factory = "工厂";
    orgType.deviceProvider = "设备商";
    orgType.operator = "运营商";

    //从服务器获取所有数据
    var all = new Object();
    all.type = "factory";
    //all.all = "";
    fillRow(all);
    //填充表数据
    function fillRow(parm) {
        //清空表数据
        $(".orgTable tbody").empty();
        $(".orgTable tbody").html("");
        var jsonStr = listorg(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.orgList;
            for (var i = 0; i < datas.length; i++) {
                var contact = datas[i]["contact"];
                var name = datas[i]["name"] == undefined?"":datas[i]["name"],
                    id = datas[i]["id"]== undefined?"":datas[i]["id"],
                    type = datas[i]["type"]== undefined?"":datas[i]["type"],
                    location = datas[i]["location"]== undefined?"":datas[i]["location"],
                    province = location == ""?"":location["province"]==undefined?"":location["province"],
                    city = location == ""?"":location["city"]== undefined?"":location["city"],
                    district = location == ""?"":location["district"]== undefined?"":location["district"],
                    address = location == ""?"":location["address"]== undefined?"":location["address"],
                    lnt = location == ""?"":location["lnt"]== undefined?"":location["lnt"],
                    lat = location == ""?"":location["lat"]== undefined?"":location["lat"],
                    contactname = "",
                    contactphone = "";
                if (contact != undefined) {
                    contactname = contact["name"]== undefined?"":contact["name"];
                    contactphone = contact["phone"]== undefined?"":contact["phone"];
                }
                var detailId = "detail" +(i+1);
                $("#plantList").append("<div style='padding:5px 0px 5px 0px;background-color:#eee;margin:5px 0px 5px 0px;' " +
                    "id='"+id+"' class='"+JSON.stringify(datas[i])+"'>" +
                "<a href='#' class='tablelink' id='"+ detailId +"'>"+name+"</a></div>")
                //$(".orgTable tbody").append("<tr id='org_" + (i + 1) + "'>" +
                //    "<td style='display: none'>" + id + "</td>" +//id
                //    "<td>" + (i + 1) + "</td>" +
                //    "<td>" + name + "</td>" +//name
                //    "<td><a href='#' class='detailOrg tablelink' id='"+ detailId +"'> 进入管理系统</a></td>" +
                //    "</tr>");
                $(document).on("click","#"+detailId,function(){
                    var orgInfo = $(this).parent().attr("id");
                    var orgInfoObj = JSON.parse($(this).parent().attr("class"));
                    setCookie("orgId",orgInfo);
                    setCookie("orgName",orgInfoObj.name);
                    var deviceParam = new Object();
                    deviceParam.org = orgInfoObj.name;
                    deviceParam.location = orgInfoObj.location;
                    deviceParam.orgId = orgInfoObj.id;
                    var ret = orgInfoObj.type == "factory"?listdevice(deviceParam):undefined;
                    if(ret != undefined){
                        var response = JSON.parse(ret);
                        if(response.errCode == "success" && response.total != 0){
                            setCookie("deviceId",response["deviceList"][0]["devId"]);
                        }
                    }
                    //window.location.href ="login.html";
                    window.open("main.html","_parent","location=yes");
                });
            }
            //sorter.init("orgTable",2);
        }else{
            //没有工厂信息时，列出该用户所在组织
            var cookieObject = JSON.parse(getCookie("userInfo"));
            var userInfo = cookieObject.account;
            var orgInfo = userInfo.orgId;
            setCookie("orgId",orgInfo);
            setCookie("orgName",userInfo.org);
            //window.location.href ="login.html";
            window.open("main.html","_parent","location=yes");
        }
    }
});