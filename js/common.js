/**
 * Created by admin on 2015/10/15.
 */

var xmlHttp;
var url="http://stock.icloud40.com:8081/rest/api/";
//var datatypeurl="http://envcloud.icloud40.com:8083/rest/api/";
var sludge = "http://rest.icloud40.com:8091/rest/api/";
var loginpage="../login.html";
//
function createXMLHttpRequest() {
    try {
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
        var aTypes = ['Microsoft.XMLHTTP', 'MSXML.XMLHTTP', 'Msxml2.XMLHTTP.7.0','Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.5.0', 'Msxml2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP'];
        var len = aTypes.length;
        for (var i = 0; i < len; i++) {
            try {
                xmlHttp = new ActiveXObject(aTypes[i]);
            } catch (e) {
                continue;
            }
            break;
        }
    }
}

function setCookie(name,value)
{
	var reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    var minutes = 100;
    var exp = new Date();
    var arr;

    arr = document.cookie.match(reg);
    if(arr!=null)
    {
    		exp.setTime(exp.getTime() -1000);
    		document.cookie = name + "="+";path=/;expires=" + exp.toGMTString();
    	}
    exp.setTime(exp.getTime() + minutes*60*1000);
    document.cookie = name + "="+value + ";path=/;expires=" + exp.toGMTString();
}

function getCookie(name)
{	
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return arr[2];
    else{
        //location.reload(true);
        return null;
    }
}

function delCookie(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1000);
    var cval=getCookie(name);
    if(cval!=null) document.cookie= name + "="+";path=/;expires="+exp.toGMTString();
}

function ajaxcommand(Url,param) {
    var userInfo;
    if(Url.indexOf(url) >= 0){
        userInfo = JSON.parse(getCookie("userInfo"));
    }else{
        userInfo = JSON.parse(getCookie("datauserInfo"));
    }
    if(userInfo==null)
    {
    	delCookie("userInfo");
    	alert("用户认证过期，请重新登录！");
    	window.parent.location.href =loginpage;
    	return;
    }
    param.operatorId = userInfo.account.userId;
    param.accessId=userInfo.accessId;
    param.operType = userInfo.account.type;
    var param1 = JSON.stringify(param);
    console.log(Url+" param="+param1);
    try{
	    createXMLHttpRequest();
	    if (!xmlHttp) {
	        return "{\"errCode\":\"createXMLHttpRequest\"}";
	    }
	    xmlHttp.open("POST", Url, false);
//	    xmlHttp.onreadystatechange = createorgresponse;
	    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        //xmlHttp.setRequestHeader("Cache-Control","no-cache");
	    xmlHttp.send("callback=?&param=" + param1+ "&" + Math.random);
	  }
	  catch(e){
	  	return "{\"errCode\":\"NetworkError\"}";
	  }
	  var ret = JSON.parse(xmlHttp.responseText);
    if (ret.errCode == "authenFailed") {
      delCookie("userInfo");
     	alert("服务用户认证过期，请重新登录！");
    	window.parent.location.href =loginpage;
    	return;
    }
    var response =JSON.parse(xmlHttp.responseText);
    if(response.errCode == "success" && response.total == 2000){
        param.page.start = "1";
        var sret = JSON.parse(ajaxcommand(Url,param));
        if(sret.errCode == "success" && sret.total != 0){
            response.resultList = response.resultList.concat(sret.resultList);
            return JSON.stringify(response);
        }
    }else{
        console.log("response = " + xmlHttp.responseText);
    }
    return xmlHttp.responseText;
}
//object location_object   location{province,city,district,address}
//object contact_object    contact{name,phone}
function createorg(name,prof,type,location_object,loc_code,stuffs,contact_object,faOrgId) {
    var Url = url;
    Url +="org/create";

    var param = new Object();
    param.prof = prof;
    param.type = type;
    param.location = location_object;
    param.name = name;
    param.stuffs = stuffs;
    param.loc_code= loc_code;
    param.contact = contact_object;
    param.faOrgId = faOrgId;
    var userInfo = JSON.parse(getCookie("userInfo"));
    if(userInfo==null)
    {
    		delCookie("userInfo");
        alert("用户认证过期，请重新登录！");
        window.parent.location.href =loginpage;
        return;
    }
    param.creator=userInfo.account.userId;
    var ret = ajaxcommand(Url,param);
    return ret;
}
//object 只传修改项
/*
 location{province,city,district,address}
 contact{name,phone}
 loc_code
 prof
 stuffs
 name
*/
function updateorg(name, orgId, object){
    var Url = url;
    Url +="org/update";

    var param = new Object();
    param.name = name;
    param.orgId =orgId;
    for(var i in object){
        param[i]=object[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}

//string  orgId
function deleteorg(orgId){
    var Url = url;
    Url +="org/delete";

    var param = new Object();
    param.orgId = orgId;
    var ret = ajaxcommand(Url,param);
	  return ret;
}

//object, 可选  {"all","location","name","orgId","creator","type"}
function listorg(object){
    var Url = url;
    Url +="org/list";

    var param = new Object();
    for(var i in object){
    	param[i]=object[i];
    	}
     var ret = ajaxcommand(Url,param);
    return ret;
}

//##############用户接口##############
//group: operator,deviceProvider,factory,envProtectAgency,common,other;
//type: root,superr,admin,common
function login(userName,password) {
    var Url = url;
    Url +="account/login";

    var param = new Object();
    param.userName = userName;
    param.password = password;

    var param1 = JSON.stringify(param);
    try{
	    createXMLHttpRequest();
	    if (!xmlHttp) {
	        return "{\"errCode\":\"createXMLHttpRequest\"}";
	    }
	    xmlHttp.open("POST", Url, false);
//	    xmlHttp.onreadystatechange = loginresponse;
	    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	    xmlHttp.send("callback=login&param=" + param1);
	  }
	  catch(e){
	  	return "{\"errCode\":\"NetworkError\"}";
	  }

    userInfo = JSON.parse(xmlHttp.responseText);
    if (userInfo.errCode == "success") {
        accessId = userInfo.accessId;
        setCookie("userInfo",JSON.stringify(userInfo));
        if(userInfo["account"]["type"] == "common" || userInfo["account"]["type"] == "admin"){
            setCookie("orgId",userInfo["account"]["orgId"]);
            setCookie("orgName",userInfo["account"]["org"]);
            var deviceParam = new Object();
            deviceParam.org = userInfo["account"]["org"];
            deviceParam.orgId = userInfo["account"]["orgId"];
            var response = JSON.parse(listdevice(deviceParam));
            if(response.errCode == "success" && response.total != 0){
                setCookie("deviceId",response["deviceList"][0]["devId"]);
            }
            window.location.href ="main.html";
        }else{
            window.location.href ="factoryMain.html";
        }
        //alert(xmlHttp.responseText);
    }
	  return xmlHttp.responseText;
}

function logout() {
		delCookie("userInfo");
}

//group: operator,deviceProvider,factory,envProtectAgency,common,other;
//type: root,superr,admin,common
//status: active，disabled,deleted
function createuser(userName,password,type,kind,realName,appName,zone,org,orgId,mobile,email,location_object,status){
    var Url = url;
    Url +="account/create";

    var param = new Object();
    param.userName=userName;
    param.password=password;
    param.type=type;
    param.kind=kind;
    param.realName=realName;
    if(appName!="")
    	param.appName=appName;
    param.zone=zone;
    param.org=org;
    param.orgId=orgId;
    param.mobile=mobile;
    param.email=email;
    param.location=location_object;
    param.status = status;
    var ret = ajaxcommand(Url,param);
    return ret;
}

function deleteuser(userId){
    var Url = url;
    Url +="account/delete";
    var param = new Object();
    param.userId=userId;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//object, 可选  {"all","fatherId","userId","userName","realName","appName","type","group","zone","email","mobile","org"}
function listuser(object){
    var Url = url;
    Url +="account/list";

    var param = new Object();
    for(var i in object){
    	param[i]=object[i];
    	}
    var ret = ajaxcommand(Url,param);
    return ret;
}

//object {"password","email","mobile","location","org","orgId","realName","appName"，"status"}
//status  值 "active" “disabled” "deleted"
function updateuser(userId, object){
    var Url = url;
    Url +="account/update";

    var param = new Object();
    param.userId=userId;
    for(var i in object){
    	param[i]=object[i];
    	}
    var ret = ajaxcommand(Url,param);
    return ret;
}

function resetuserpassword(userId){
    var Url = url;
    Url +="account/resetpwd";

    var param = new Object();
    param.userId=userId;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//确认用户名是否已经存在 
//返回 failed 表示已被占用
function finduser(userName){
    var Url = url;
    Url +="account/nouser";

    var param = new Object();
    param.userName=userName;
    var ret = ajaxcommand(Url,param);
    return ret;
}
/*file_type
0，表示raw 文件，不做任何转义处理
1, 表示json 格式文件，需按照json 格式的规范进行转义
以后有新的需求再增加
2. 表示.xls(excel)文件
3. .txt 文件
 * @param importType  导入类型fuel、mud两种
 * @param direct 入库还是出库记录
 * @param dataId 库存条目id
 * @param file_object
 * @param file_type
 * @returns {*}
 */
function uploadfile(importType,direct,dataId,file_object,file_type){
    var Url = url;

    if(importType == "fuel"){
        Url +="stock/fuel/upload";
    }else if(importType == "mud"){
        if(direct == "in"){
            Url +="stock/mud/in/upload";
        }else if(direct == "out"){
            Url +="stock/mud/out/upload";
        }
    }else if(importType == "electric"){
        Url +="stock/power/upload";
    }else if(importType == "water"){
        Url +="stock/water/upload";
    }
    var userInfo;
    if(Url.indexOf(url) >= 0){
        userInfo = JSON.parse(getCookie("userInfo"));
    }
    if(userInfo==null)
    {
        delCookie("userInfo");
        alert("用户认证过期，请重新登录！");
        window.parent.location.href =loginpage;
        return;
    }

    var form = new FormData();
    form.append("operatorId",userInfo.account.userId);
    form.append("accessId",userInfo.accessId);
    form.append("type",file_type);
    form.append("dataId",dataId);
    form.append("direct",direct);
    form.append("File",file_object.files[0]);
    console.log("form " + form.toString());
    try{
        createXMLHttpRequest();
        if (!xmlHttp) {
            return "{\"errCode\":\"createXMLHttpRequest\"}";
        }
        xmlHttp.open("POST", Url, true);
        //xmlHttp.onreadystatechange = importResponse;
        ret = xmlHttp.send(form);
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 ) {
                if(xmlHttp.status == 200){
                    var response = JSON.parse(xmlHttp.responseText);
                    if (response.errCode == "authenFailed") {
                            delCookie("userInfo");
                            alert("用户认证过期，请重新登录！");
                            window.parent.location.href =loginpage;
                            return;
                    }
                    if(response.errCode == "success"){
                        document.getElementById("confirmMsg").innerText = "导入成功！";
                    }else{
                        document.getElementById("confirmMsg").innerHTML = "导入失败，原因："+response.errCode+",错误信息：</br>"+JSON.stringify(response.errInfo)+"！";
                        //$(".confirmMsg").html("导入失败，原因："+response.errCode);
                    }
                    document.getElementById("progressbar").style.display="none";
                    document.getElementById("fileName").value = "";
                    document.getElementById("showFile").value = "";
                    console.log("response="+xmlHttp.responseText);
                    //$("#progressbar").css("display","none");
                }
            }
        };
    }
    catch(e){
        return "{\"errCode\":\"NetworkError\"}";
    }
}
/*user.uid=userInfo.userId;
 user.name=userInfo.userName;
 item.user=user;
 org.uId=userInfo.orgId;
 org.name=userInfo.org;
 item.org=org;
 item.mgroups=mgroups;
 accessList[0]=item;*/
function resaccessCreate(accessList){
    var Url = url;
    Url +="resaccess/create";

    var param=new Object();
    param.accessList=accessList;
    var ret = ajaxcommand(Url,param);
    return ret;
}
function resaccessList(userId){
    var Url = url;
    Url +="resaccess/list";

    var param=new Object();
    if(userId=="all")
        param.all="";
    else
        param.userId=userId;
    var ret = ajaxcommand(Url,param);
    return ret;
}

function resaccessDelete(id){
    var Url = url;
    Url +="resaccess/delete";

    var param=new Object();
    param.id=id;
    var ret = ajaxcommand(Url,param);
    return ret;
}
function resaccessUpdate(id,accessList){
    var Url = url;
    Url +="resaccess/update";

    var param=new Object();
    param.id=id;
    param.accessList=accessList;
    var ret = ajaxcommand(Url,param);
    return ret;
}
function dictionary(key)
{
    var Url = url;
    Url +="dictionary/list/enum";

    var param=new Object();
    param.items=key;
    var ret = ajaxcommand(Url,param);
    return ret;
}
/**stockRoster
 * opType：create/update/list**/
/**
 * @param obj
 * @returns {*}
 *  * 创建
 * 必须参数：{orgId,name}可选参数：{unit}正常返回 {id:xxx,errCode:success};
 *  * 更新
 *必须参数：{id}可选参数：{name,unit}
 * * 查询
 * 查询参数结构按照{find,page,sort,filter}结构进行组织，find和page必须
 账户只能查询有授权账户的数据条目
 find中的参数说明如下：
 必选参数：没有
 可选参数：{orgId,name,unit,account}
 返回条目在 {resultList:[{},{}],errCode:success};
 */
function stockRosterOp(opType,obj){
    var Url = url;
    if(opType == "create"){
        Url +="stock/roster/create";
    }else if(opType == "update"){
        Url +="stock/roster/update";
    }else if(opType == "list"){
        Url +="stock/roster/list";
    }
    var param = new Object();
    for(var i in obj){
        param[i]=obj[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}
/**
 * 删除
 * 必须参数：{id}
 * @param obj
 * @returns {*}
 */
function stockRosterDelete(id){
    var Url = url;
    Url +="stock/roster/delete";

    var param = new Object();
    param.id = id;
    var ret = ajaxcommand(Url,param);
    return ret;
}

/**
 * @param type 针对燃料（fuel）还是污泥(mud)操作
 * @param obj
 * @returns {*}
 * * 页面添加燃料出入库
 * 参数结构为：{dataId:xxx,direct:xx,items:[
{"date":xxx,"time":xxx,"much":xx,"stockN":xx,"groupN":xx,"oper":xx},
{"date":xxx,"time":xxx,"much":xx,"stockN":xx,"groupN":xx,"oper":xx}]}
 以上参数均为必选参数
 其中,direct为"in"，表示入库； 为"out",表示"出库"
 * *污泥出入库，页面操作
 *   参数结构为：{dataId:xxx,direct:xx,items:[
{"date":xx,"time":xx,"supNo":xx,"supName":xx,"carNo":xx,"grossWei":xx,"tare":xx,"netWei":xx},
{"date":xx,"time":xx,"supNo":xx,"supName":xx,"carNo":xx,"grossWei":xx,"tare":xx,"netWei":xx}]}
 以上参数均为必选参数
 其中,direct为"in"，表示入库；
 date,类型String,格式为: 2016-08-024
 time,类型String,格式为：09:43
 */
function manulAddInout(type,obj){
    var Url = url;
    if(type == "fuel"){
        Url +="stock/fuel/inout";
    }else if(type == "mud"){
        if(obj.direct == "in"){
            Url +="stock/mud/in/manul";
        }else if(obj.direct == "out"){
            Url +="stock/mud/out/manul";
        }
    }
    var param = new Object();
    for(var i in obj){
        param[i]=obj[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}
/**
 *燃料出入库记录各个属性的值的列表查询
 * @param opType 燃料fuel污泥mud
 * @param obj
 * @returns {*}
 * 必选参数：{dataId,distKey}， distkKey为需要查询的属性名称
 可选参数:{direct}
 */
function distkeyList(opType,obj){
    var Url = url;
    if(opType == "fuel"){
        Url +="stock/fuel/distkey";
    }else if(opType =="mud"){
        if(obj.direct == "in"){
            Url +="stock/mud/in/distkey";
        }else if(obj.direct == "out"){
            Url +="stock/mud/out/distkey";
        }
        obj.direct = undefined;
    }
    var param = new Object();
    for(var i in obj){
        param[i]=obj[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}
/**
 *燃料出入库历史查询
 * @param opType 燃料fuel污泥mud
 * @param obj
 * @returns {*}
 * 查询参数结构按照{find,page,sort,filter}结构进行组织，find和page必须
 在find结构中，必须参数有：{"dataId","time"}
 可选参数有:{"stockN","groupN","oper","direct"}
 "time"的结构为：
 public class TimeDesc {
		private Long start; //起始时间，单位毫秒
		private Long end; //结束时间，单位 毫秒
	}
 **污泥入库历史查询
 * 查询参数结构按照{find,page,sort,filter}结构进行组织，find和page必须
 在find结构中，必须参数有：{"dataId","time"}
 可选参数有:{"supNo","supName","carNo","grossWei","tare","netWei"}
 "time"的结构为：
 public class TimeDesc {
		private Long start; //起始时间，单位毫秒
		private Long end; //结束时间，单位 毫秒
	}
 **污泥出库历史查询
 查询参数结构按照{find,page,sort,filter}结构进行组织，find和page必须
 在find结构中，必须参数有：{"dataId","time"}
 可选参数有:{"much","stockN","groupN","oper"}
 "time"的结构为：
 public class TimeDesc {
		private Long start; //起始时间，单位毫秒
		private Long end; //结束时间，单位 毫秒
	}
 */
function listImportData(opType,obj){
    var Url = url;
    if(opType == "fuel"){
        Url +="stock/fuel/list";
    }else if(opType == "mud"){
        if(obj.direct  == "in"){
            Url +="stock/mud/in/list";
        }else if(obj.direct  == "out"){
            Url +="stock/mud/out/list";
        }
        obj.direct = undefined;
    }else if(opType == "electric"){
        Url +="stock/power/list";
    }else if(opType == "water"){
        Url +="stock/water/list";
    }
    var param = new Object();
    for(var i in obj){
        param[i]=obj[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}
/**
 * @param opType 实时查询now历史查询history
 * @param obj
 * @returns {*}
 * *实时查询
 * 查询参数结构按照{find,page,sort,filter}结构进行组织，find和page必须
 在find结构中，必须参数有：{dataId}
 可选参数有:{time,direct,much,stock}
 **历史查询
 * 查询参数结构按照{find,page,sort,filter}结构进行组织，find和page必须
 在find结构中，必须参数有：{dataId,time}
 其中 time的结构为:
 public class TimeDesc {
		private Long start; //起始时间，单位毫秒
		private Long end; //结束时间，单位 毫秒
		private String scale; //day,month,year  表示日库存，月库存、年库存
	}
 */
function storageList(opType,obj){
    var Url = url;
    if(opType == "now"){
        Url +="stock/storage/list/now";
    }else if(opType == "history"){
        Url +="stock/storage/list/hist";
    }
    var param = new Object();
    for(var i in obj){
        param[i]=obj[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}
/**
 * 获取库存条目Id，
 * 没有对应库存条目自动添加
 * @param type
 */
function getStockId(type) {
    var orgInfoId = getCookie("orgId");
    var all = new Object(),page_object = new Object(),find = new Object();
    page_object.max="2000";
    page_object.start="0";
    find.orgId = orgInfoId;
    all.page = page_object;
    all.find = find;
    var responsedata = JSON.parse(stockRosterOp("list",all));
    if(responsedata.errCode == "success"){
        var datas = responsedata.resultList;
        for (var i = 0; i < datas.length; i++) {
            var id = datas[i]["id"]== undefined?"":datas[i]["id"],
                name = datas[i]["name"]== undefined?"":datas[i]["name"];
            if(type == "fuel" && name == "燃料"){
                return id;
            }else if(type == "mud" && name == "污泥"){
                return id;
            }else if(type == "electric" && name == "发电量"){
                return id;
            }else if(type == "water" && name == "用水量"){
                return id;
            }
        }
    }
    //如果没有对应的库存条目则添加
    var addParam = new Object();
    addParam.orgId = orgInfoId;
    if(type == "fuel"){
        addParam.name = "燃料";
        addParam.unit = "吨";

    }else if(type == "mud"){
        addParam.name = "污泥";
        addParam.unit = "吨";
    }else if(type == "electric"){
        addParam.name = "发电量";
        addParam.unit = "千瓦时";
        addParam.isTotal = true;
    }else if(type == "water"){
        addParam.name = "用水量";
        addParam.unit = "吨";
        addParam.isTotal = true;
    }
    var response = JSON.parse(stockRosterOp("create",addParam));
    if(response.errCode == "success"){
        var stockId = response.id;
        return stockId;
    }
}
var wCRCTalbeAbs = [0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
    0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400];
function Gen_Checksum(id, len)
{
    var wCRC = 0xFFFF, i,chChar,checksum,str;
    for (i = 0; i < len; i++)
    {
        chChar = id.charCodeAt(i);
        wCRC = wCRCTalbeAbs[(chChar ^ wCRC) & 15] ^ (wCRC >> 4);
        wCRC = wCRCTalbeAbs[((chChar >> 4) ^ wCRC) & 15] ^ (wCRC >> 4);
    }
    wCRC=(wCRC<<3)|(wCRC>>(16-3));
    wCRC = ~(wCRC&0xFFFF);
    checksum = wCRC&0xFFFF;
    str = checksum.toString(16);
    if(str.length==0)str="0000"; else if(str.length==1)str="000"+str; else if(str.length==2)str= "00"+str; else if(str.length==3)str= "0"+str;
    return str.toUpperCase();
}
//##############设备接口##############
//account ： 为创建者的account account{name,uid}
//state :  init,active,disabled,deleted
//location_object   填入工厂所在地址
//views： 为 account 列表
//devId、name：为必填参数
//other_Parm：其它可选参数
function createdevice(org,orgId,location){
    var Url = url;
    Url +="device/create";
    var deviceId = 0;
    var parm = new Object();
    parm.all = "";
    //获取所有设备信息，计算deviceId
    var allDevice = JSON.parse(listdevice(parm)),deviceIdArray = new Array();
    if(allDevice.errCode == "success" && allDevice.total != 0){
        var datas = allDevice.deviceList;
        for (var i = 0; i < datas.length; i++) {
            var devId = datas[i]["devId"];
            deviceIdArray.push(Number(devId.substring(devId.length-5,devId.length)));
        }
        deviceIdArray.sort(function(a,b){
            return a - b;
        });
        deviceId = (deviceIdArray[deviceIdArray.length -1]).add(1);
    }else{
        deviceId = 0;
    }
    var deviceIdStr = "99900000000"+PrefixInteger(deviceId,5);
    var deviceName = org+deviceIdStr.substring(deviceIdStr.length-4,deviceIdStr.length);
    var checkCode = Gen_Checksum(deviceIdStr,deviceIdStr.length);
    var createParam = new Object(),subs = new Array();
    var plc = new Object();
    plc.pid = deviceIdStr;
    plc.code = checkCode;
    plc.type = "plc";
    subs.push(plc);
    createParam.devId = deviceIdStr;
    createParam.name = deviceName;
    createParam.code = checkCode;
    createParam.state = "active";
    createParam.desc = "污泥发电厂脱硫除尘";
    createParam.org = org;
    createParam.orgId = orgId;
    createParam.type = "plc";
    createParam.location = location;
    createParam.subs = subs;
    var ret = ajaxcommand(Url,createParam);
    return ret;
}
function PrefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}
//此id为数据库里的id
function deletedevice(id){
    var Url = url;
    Url +="device/delete";

    var param = new Object();
    param.id = id;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//object   可选 {"account","devId","state","name","appName","desc","views","all"};
//必选{"org","orgId","location"}
//返回    {"errCode":"success","total":2,deviceList:[{d1 },{d2}], 也有可能 {"total":0,"errCode":"noItem"}
function listdevice(object){
    //object.op != undefined说明需要创建设备
    if(object.op != undefined){
        object.op = undefined;
        var createRes = JSON.parse(createdevice(object.org,object.orgId,object.location));
        if(createRes.errCode == "success"){
            return listdevice(object);
        }
    }else{
        var Url = url;
        Url +="device/list";
        var ret = ajaxcommand(Url,object);
        var response = JSON.parse(ret);
        //创建一个工厂的同时去创建一个设备且不是去查询所有
        if(response.total == 0 && object.all == undefined){
            var createRes = JSON.parse(createdevice(object.org,object.orgId,object.location));
            if(createRes.errCode == "success"){
                return listdevice(object);
            }
        }else{
            return ret;
        }
    }
}
//object  可选{"devId","code","state","name","appName","desc","org","orgId","location","account"};
function updatedevice(id,object){
    var Url = url;
    Url +="device/update";

    var param = new Object();
    param.id =id;
    for(var i in object){
        param[i]=object[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}
//page   "page":{"max":50,"start":0}
//"find":{
//必选    "time":{"scale":"day","start":1449417600000,"end":1449698400000},
//可选    "uid","devId","name","family","poluType","higher","lower","location","factory","provider"
// 可选参数中，至少应该有一项。如果一项都没有，将不会有任何查询结果。}
function datahistory(find_object,page_object,other_object,isMulti){
    var Url = url;
    Url +="polusource/listhist";

    var param = new Object();
    if(!isMulti){
        param.page=page_object;
        param.find =find_object;
    }
    for(var i in other_object){
        param[i] = other_object[i];
    }
    //filter_object.include="values|location";
    //param.filter=filter_object;
    var ret = ajaxcommand(Url,param);
    return ret;
}
//数据接口
//find 设置查找条件，支持如下条件查找
//	"location":{"province":"河北省","city":"唐山市"}
//	"family":"SO3|NO2"
//	"name":"流排放|氮排放"
//	"higher":"no"
//	"lower":"no"
//	"factory":{"name":"工厂组织1","uId":"562f021302aa5eb9ebd2ea13"}
//	"provider":{"uid":"562fhigher021302aa5eb9ebd2ea13","name":"Robin1"}
//sort   "sort":{"asc":"time"}
//page   "page":{"max":50,"start":0}
//filter  "filter":{"exclude":"location|provider|factory","include":"time|name|family|higher|lvalue|dvalue|svalue"}
function datanow(find_object,page_object,other_object){
    var Url = url;
    Url +="polusource/listnow";

    var param = new Object();
    //param.sort = sort_object;
    param.page=page_object;
    //param.filter =filter_object;
    param.find =find_object;
    for(var i in other_object){
        param[i] = other_object[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}

function leftmenuclick(){
    window.parent.frames["leftFrame"].document.getElementById("dataAlarmMenuHeader").click();
    window.parent.frames["leftFrame"].document.getElementById("dataManaMenu").click();
    window.parent.frames["leftFrame"].document.getElementById("dataAlarmMenu").click();
}
/**
 * 日期格式转换
 * @param time
 * @param format
 * @returns {XML|*|string|void}
 */
function dataFormate(time, format){
    var t = new Date(time);
    var tf = function(i){return (i < 10 ? '0' : '') + i};
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
        switch(a){
            case 'yyyy':
                return tf(t.getFullYear());
                break;
            case 'MM':
                return tf(t.getMonth() + 1);
                break;
            case 'mm':
                return tf(t.getMinutes());
                break;
            case 'dd':
                return tf(t.getDate());
                break;
            case 'HH':
                return tf(t.getHours());
                break;
            case 'ss':
                return tf(t.getSeconds());
                break;
        }
    });
}
/**分页设置
 * @param tableId 表元素Id
 * @param currentPageId 当前页Id
 * @param pageListId 页数Id
 */
function sortOp(tableId,currentPageId,pageListId,pageSize){
    sorter.head = "head";
    sorter.asc = "asc";
    sorter.desc = "desc";
    sorter.even = "evenrow";
    sorter.odd = "oddrow";
    sorter.evensel = "evenselected";
    sorter.oddsel = "oddselected";
    sorter.paginate = true;
    sorter.currentid = currentPageId;
    sorter.limitid = pageListId;
    sorter.init(tableId,1);
    sorter.size(pageSize);
}
/**
 * 日期选择添加提示信息
 */
function addLaydateListener(){
    var tdList = document.getElementById("laydate_table").getElementsByTagName("td");
    for(var i in tdList){
        if(tdList[i].className.indexOf("laydate_void")>= 0){
            tdList[i].setAttribute("title","该值不能选择！");
        }
    }
}
/**
 ** 加法函数，用来得到精确的加法结果
 ** 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
 ** 调用：accAdd(arg1,arg2)
 ** 返回值：arg1加上arg2的精确结果
 **/
function accAdd(arg1, arg2) {
    var r1, r2, m, c;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    c = Math.abs(r1 - r2);
    m = Math.pow(10, Math.max(r1, r2));
    if (c > 0) {
        var cm = Math.pow(10, c);
        if (r1 > r2) {
            arg1 = Number(arg1.toString().replace(".", ""));
            arg2 = Number(arg2.toString().replace(".", "")) * cm;
        } else {
            arg1 = Number(arg1.toString().replace(".", "")) * cm;
            arg2 = Number(arg2.toString().replace(".", ""));
        }
    } else {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", ""));
    }
    return (arg1 + arg2) / m;
}
/**
 ** 减法函数，用来得到精确的减法结果
 ** 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果。
 ** 调用：accSub(arg1,arg2)
 ** 返回值：arg1加上arg2的精确结果
 **/
function accSub(arg1, arg2) {
    var r1, r2, m, n;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
}
/**
 ** 乘法函数，用来得到精确的乘法结果
 ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
 ** 调用：accMul(arg1,arg2)
 ** 返回值：arg1乘以 arg2的精确结果
 **/
function accMul(arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
        m += s1.split(".")[1].length;
    }
    catch (e) {
    }
    try {
        m += s2.split(".")[1].length;
    }
    catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}

// 给Number类型增加一个mul方法，调用起来更加方便。
Number.prototype.mul = function (arg) {
    return accMul(arg, this);
};

// 给Number类型增加一个mul方法，调用起来更加方便。
Number.prototype.sub = function (arg) {
    return accSub(arg, this);
};

//给Number类型增加一个add方法，调用起来更加方便。
Number.prototype.add = function (arg) {
    return accAdd(arg, this);
};
if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
    window.applicationCache.update();
}