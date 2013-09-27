
//Login
//登录
function login() {
    ShowLoading(true, "正在登录……");

    var userAccount = $("#txtUserAccount").val();
    var password = $("#txtPassWord").val();

    //if (!Email.test(userAccount)) {

    //    msgBox("账户格式不正确！");
    //    return;
    //}

    var url = ServerURL + "login.ashx?Acd=" + userAccount + "&Pwd=" + password;

    YtAjax(
            url,
            "hide",
            function (data, textStatus, jqXHR) {
                HideLoading();

                if (data.ResultCode != undefined && data.ResultCode == 100) {

                    data.UserName = userAccount;

                    var jsonObj = JSON.stringify(data);

                    sessionStorage.setItem("UserInfo", jsonObj);//存储用户信息

                    GoTo("home.html");
                }
                else {
                    msgBox("用户名或密码有误！");
                }
            },
            function (jqXHR, textStatus, errorThrown) {

                HideLoading();
                msgBox("Error:" + textStatus + "," + errorThrown);
            }

        );
}

//退出
function Exit() {
    navigator.app.exitApp();
}

//home
$("#home").live("pageinit", function (event) {

    GetUserInfo();

    var FaxNumber = userInfo.Linenum;

    if (userInfo.Extension !== "") {

        FaxNumber += "," + userInfo.Extension;

    }

    $("#sp_Name").html(userInfo.UserName);
    $("#sp_Date").html(new Date().toLocaleDateString());

    $("<p>").html("账户：" + userInfo.UserName).appendTo("#div_UserInfo");
    $("<p>").html("传真号码：" + FaxNumber).appendTo("#div_UserInfo");

    setTimeout("GetUnReadCount()", 1000);

});

function GetUnReadCount() {
    var a = 0;
    YtAjax(
              ServerURL + "GetRecvFaxUnReadCount.ashx?seqno=" + userInfo.SeqNo,
              "hide",
              function (data, textStatus, jqXHR) {

                  if (data.ResultCode != undefined && data.ResultCode == 100) {

                      HideLoading();
                      $("#sp_RecvCount").html(data.Count);
                  }
                  else {

                      HideLoading();
                  }
              },
              function (jqXHR, textStatus, errorThrown) {

                  HideLoading();
                  msgBox("Error:" + textStatus + "," + errorThrown);
              }
      );
}

//发送
function sendfax() {
    var faxNumbers = $("#txtFaxNo").val();
    var subject = $("#txtSub").val();
    var content = $("#txtContent").val();

    if (faxNumbers === "") {

        OpenPopup("号码不能为空！");
        return;
    }

    if (content === "") {
        OpenPopup("内容不能为空！");
        return;
    }

    var arr = faxNumbers.split(';');
    var errNum = "";

    for (var i = 0; i < arr.length; i++) {

        var item = arr[i];

        if (!IsFaxNum(item)) {

            errNum += item;
        }
    }

    if (errNum != "") {

        Dialog("传真号码有误：" + errNum);
        return;
    }

    GetUserInfo();

    ShowLoading(true, "正在发送……");

    //var data={
    //    faxnums:faxNumbers ,
    //    sub:subject ,
    //    content: content ,
    //    obj: JSON.stringify(userInfo)
    //};

    YtAjax(
              ServerURL + "sendfax.ashx?faxnums=" + faxNumbers + "&sub=" + subject + "&content=" + content + "&obj=" + JSON.stringify(userInfo),
              "hide",
              function (data, textStatus, jqXHR) {

                  if (data.ResultCode != undefined && data.ResultCode == 100) {

                      HideLoading();
                      OpenPopup("发送成功！");

                      CleanText();
                  }
                  else {

                      HideLoading();
                      OpenPopup("发送失败！");

                  }
              },
              function (jqXHR, textStatus, errorThrown) {

                  HideLoading();

                  OpenPopup("Error:" + textStatus + "," + errorThrown);

              }
      );
}

function CleanText() {
    $("#txtFaxNo").val("");
    $("#txtSub").val("");
    $("#txtContent").val("");
}


//发送列表
$("#sendfaxlist").live("pageinit", function (event) {
    pullDownEl = document.getElementById('pullDown');
    pullUpEl = document.getElementById('pullUp');

    $("#sendfaxlist").live("touchmove", function (e) { e.preventDefault(); });

    $("#sendfaxlist").live("DOMContentLoaded",
                            Init(
                                'wrapper',
                                pullDownEl,
                                pullUpEl,
                                function () {
                                    setTimeout(function () {	// <-- Simulate network congestion, remove setTimeout from production!
                                        var el, li, i;
                                        el = document.getElementById('thelist');

                                        for (i = 0; i < 3; i++) {
                                            li = document.createElement('li');
                                            li.innerText = 'Generated row ' + (++generatedCount);
                                            el.insertBefore(li, el.childNodes[0]);
                                        }

                                        myScroll.refresh();		//数据加载完成后，调用界面更新方法   Remember to refresh when contents are loaded (ie: on ajax completion)
                                    }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
                                },
                                function () {
                                    setTimeout(function () {	// <-- Simulate network congestion, remove setTimeout from production!
                                        var el, li, i;
                                        el = document.getElementById('thelist');

                                        for (i = 0; i < 3; i++) {
                                            li = document.createElement('li');
                                            li.innerText = 'Generated row ' + (++generatedCount);
                                            el.appendChild(li, el.childNodes[0]);
                                        }

                                        myScroll.refresh();		// 数据加载完成后，调用界面更新方法 Remember to refresh when contents are loaded (ie: on ajax completion)
                                    }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
                                }
                            ));
});

//接收列表
var recvIndex = 1;
var recvSize = 10;

$("#recvfaxlist").live("pageinit", function (event) {

    pullDownEl = document.getElementById('pullDown');
    pullUpEl = document.getElementById('pullUp');

    $(document).bind("pagebeforechange", beforechange);

    $("#recvfaxlist").live("touchmove", function (e) { e.preventDefault(); });

    $("#recvfaxlist").live("DOMContentLoaded",
                            Init(
                                'recvWrapper',
                                pullDownEl,
                                pullUpEl,
                                function () {
                                    setTimeout(function () {
                                        // <-- Simulate network congestion, remove setTimeout from production!
                                        recvSize = recvIndex * recvSize;

                                        RecvLoadData(1, recvSize, 0);

                                        myScroll.refresh();
                                        //数据加载完成后，调用界面更新方法   Remember to refresh when contents are loaded (ie: on ajax completion)
                                    }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
                                },
                                function () {

                                    setTimeout(function () {	// <-- Simulate network congestion, remove setTimeout from production!
                                        //var el, li, i;
                                        //el = document.getElementById('recvList');

                                        //for (i = 0; i < 3; i++) {
                                        //    li = document.createElement('li');
                                        //    li.innerText = 'Generated row ' + (++generatedCount);
                                        //    el.appendChild(li, el.childNodes[0]);
                                        //}
                                        recvIndex++;
                                        RecvLoadData(recvIndex, recvSize, 1);
                                        myScroll.refresh();		// 数据加载完成后，调用界面更新方法 Remember to refresh when contents are loaded (ie: on ajax completion)
                                    }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
                                }
                            ));

    GetUserInfo();

    ShowLoading(true, "正在加载……");

    RecvLoadData(recvIndex, recvSize, 0);


});

function beforechange(e, data) {

    if (typeof data.toPage != "string") {

        var url = $.mobile.path.parseUrl(e.target.baseURI);

        var re = 'details.html';

        if (url.href.search(re) != -1) {

            var page = $(e.target).find("#detailsPage");
            var d = data.options.data;
            var data = GetUrlParam(url.href);
            
            page.find("#numberDiv").html(decodeURIComponent(data[0]));
            page.find("#timeDiv").html(decodeURIComponent(data[2]));
            page.find("#contentDiv").html(decodeURIComponent(data[1]));

            var picSrc = data[3];

            var sysid = data[4];

            var pages = data[5];
            
            if (picSrc != '' && !IsExistsSysID(sysid)) {

                GetImageData(picSrc,page,sysid);

            }
            else {

                pages = localStorage.getItem(sysid + "Pages");

                var content = "";

                for (var i = 0; i < pages; i++) {

                    var obj = localStorage.getItem(
                                                    i == 0
                                                    ? sysid
                                                    : (sysid + "-" + i)
                                                 );

                    content += "<li><a href='" + obj + "'><img src='" + obj + "' alt='第" + (i + 1) + "页' /></a></li>";
                }

                page.find("#Gallery").html(content);
            }

            
        }
    }
}

function RecvLoadData(index, size, flag) {
    YtAjax(
              ServerURL + "GetRecvFaxBill.ashx?seqno=" + userInfo.SeqNo + "&isDel=" + 0 + "&index=" + index + "&size=" + size,
              "hide",
              function (data, textStatus, jqXHR) {

                  if (data != undefined && data.length > 0) {

                      HideLoading();

                      pullDownEl.style.display = "none";

                      if (flag == 0) {
                          CreateList($("#recvList"), data);
                      }
                      else {
                          AppendList($("#recvList"), data);
                      }

                  }
                  else {

                      HideLoading();

                      if (recvIndex > 1) {

                          recvIndex--;
                      }

                      pullDownEl.style.display = "block";
                      OpenPopup("没有接收到新的传真");
                  }
              },
              function (jqXHR, textStatus, errorThrown) {

                  HideLoading();

                  if (recvIndex > 1) {

                      recvIndex--;
                  }

                  pullDownEl.style.display = "block";
                  OpenPopup("Error:" + textStatus + "," + errorThrown);

              }
      );
}

function CreateList(divList, list) {

    var re = document.getElementById("recvList");
    var count = 1;

    while (re.childNodes.length > 0) {

        count = re.childNodes.length;

        re.removeChild(re.childNodes[count - 1]);

    }

    var content = "";

    for (var i = 1; i < list.length; i++) {
        content = content + "<li>";
        content = content + "<a href=\"#\" onclick=\"GoTo('details.html?cn=" + list[i].CallerNum + "&sub=" + list[i].Subject + "&date=" + list[i].Date + "&url=" + list[i].FaxFile + "&sys=" + list[i].SysID + "&pages="+list[i].Pages+"')\">";
        //content = content + "<img src=\"./img/headpic/5.jpg\" onerror=\"errpic(this)\" class=\"listpic\"/>";
        content = content + "<p>";
        content = content + "<h3 class=\"listtitle\">" + list[i].CallerNum + "</h3>";
        content = content + list[i].Subject + " <span class=\"timestyle\">时间：" + list[i].Date + "</span>";
        content = content + "</p>";
        content = content + "</a>";
        content = content + "</li>";
    }

    divList.append(content).listview('refresh');

}

function AppendList(divList, list) {

    var content = "";

    for (var i = 1; i < list.length; i++) {

        content = content + "<li>";
        content = content + "<a href=\"#\" onclick=\"GoTo('details.html?cn=" + list[i].CallerNum + "&sub=" + list[i].Subject + "&date=" + list[i].Date + "&url=" + list[i].FaxFile + "&sys=" + list[i].SysID + "&pages=" + list[i].Pages + "')\">";
        
        content = content + "<p>";
        content = content + "<h3 class=\"listtitle\">" + list[i].CallerNum + "</h3>";
        content = content + list[i].Subject + " <span class=\"timestyle\">时间：" + list[i].Date + "</span>";
        content = content + "</p>";
        content = content + "</a>";
        content = content + "</li>";
    }

    divList.append(content).listview('refresh');

}

(function photoShows(window, $, PhotoSwipe) {

    $(document).ready(function () {

        $('#detailsPage')
            .live('pageshow', function (e) {

                var
                    currentPage = $(e.target),
                    options = {
                        getToolbar: function () {

                            return '<div class="ps-toolbar-close" style="padding-top: 12px;">返回</div><div class="ps-toolbar-previous" style="padding-top: 12px;">上一页</div><div class="ps-toolbar-next" style="padding-top: 12px;">下一页</div>';

                        }
                    },
                    photoSwipeInstance = $("ul.gallery a", e.target).photoSwipe(options, currentPage.attr('id'));

                return true;

            })

            .live('pagehide', function (e) {

                var
                    currentPage = $(e.target),
                    photoSwipeInstance = PhotoSwipe.getInstance(currentPage.attr('id'));

                if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
                    PhotoSwipe.detatch(photoSwipeInstance);
                }

                return true;

            });

    });

}(window, window.jQuery, window.Code.PhotoSwipe));

function GetImageData(url,page,sysid)
{
    ShowLoading(true, "正在加载……");

    YtAjax(
               ServerURL + "GetImageData.ashx?par=" + url,
               "hide",
               function (img64, textStatus, jqXHR) {

                   if (img64 != undefined && img64.length > 0) {

                       HideLoading();

                       localStorage.setItem(sysid + "Pages", img64.length);

                       var content = "";

                       for (var i = 0; i < img64.length; i++) {

                           content += "<li><a href='" + img64[i].Data + "'><img src='" + img64[i].Data + "' alt='第" + (i + 1) + "页' /></a></li>";

                           localStorage.setItem(
                                                    (
                                                        i == 0
                                                        ? sysid
                                                        : (sysid + "-" + i)
                                                    ),
                                                    img64[i].Data
                                                 );
                       }

                       page.find("#Gallery").html(content);

                   }
                   else {

                       HideLoading();

                       OpenPopup("加载文件失败");

                       return data;

                   }
               },
               function (jqXHR, textStatus, errorThrown) {

                   HideLoading();

                   OpenPopup("Error:" + textStatus + "," + errorThrown);
               }
       );
}

function IsExistsSysID(sysid)
{
    var obj = localStorage.getItem(sysid);
    if (obj!=undefined&&obj!=null) {
        return true;
    }

    return false;
}
 










