
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

    if (userAccount == "" || password == "") {

        HideLoading();
        msgBox("账户或密码不能为空！");

        return;
    }

    var url = ServerURL + "login.ashx?Acd=" + userAccount + "&Pwd=" + password;

    YtAjax(
            url,
            "hide",
            function (data, textStatus, jqXHR) {
                

                if (data.ResultCode != undefined && data.ResultCode == 100) {

                    data.UserName = userAccount;

                    var jsonObj = JSON.stringify(data);

                    sessionStorage.setItem("UserInfo", jsonObj);//存储用户信息

                    GoTo("home.html");

                }
                else {
                    HideLoading();
                    msgBox("用户名或密码有误！");
                }
            },
            function (jqXHR, textStatus, errorThrown) {

                HideLoading();

               // msgBox("用户名或密码有误！");
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

    HideLoading();

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

var sendIndex = 1;
var sendSize = 10;

//$("#sendfaxlist").live("touchmove", function (e) { e.preventDefault(); });

//$("#sendfaxlist").live("pageinit", function (event) {

//    pullDownEl = document.getElementById('pullDown');
//    pullUpEl = document.getElementById('pullUp');

//    $("#sendfaxlist").live("DOMContentLoaded",
//                            Init(
//                                'wrapper',
//                                pullDownEl,
//                                pullUpEl,
//                                function () {
//                                    setTimeout(function () {
//                                        // <-- Simulate network congestion, remove setTimeout from production!
//                                        sendSize = sendIndex * sendSize;

//                                        SendLoadData(1, sendSize, 0);

//                                        myScroll.refresh();
//                                        //数据加载完成后，调用界面更新方法   Remember to refresh when contents are loaded (ie: on ajax completion)
//                                    }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
//                                },
//                                function () {

//                                    setTimeout(function () {	// <-- Simulate network congestion, remove setTimeout from production!
//                                        //var el, li, i;
//                                        //el = document.getElementById('recvList');

//                                        //for (i = 0; i < 3; i++) {
//                                        //    li = document.createElement('li');
//                                        //    li.innerText = 'Generated row ' + (++generatedCount);
//                                        //    el.appendChild(li, el.childNodes[0]);
//                                        //}
//                                        sendIndex++;
//                                        SendLoadData(sendIndex, sendSize, 1);
//                                        myScroll.refresh();		// 数据加载完成后，调用界面更新方法 Remember to refresh when contents are loaded (ie: on ajax completion)
//                                    }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
//                                }
//                            ));
//    GetUserInfo();

//    ShowLoading(true, "正在加载……");

//    //photoShows(window, window.jQuery, window.Code.PhotoSwipe, '#detailsSendPage');
//    SendLoadData(sendIndex, sendSize, 0);
//});
$("#sendfaxlist").live("pageinit", function (event) {

    GetUserInfo();

    ShowLoading(true, "正在加载……");

    //photoShows(window, window.jQuery, window.Code.PhotoSwipe, '#detailsSendPage');
    SendLoadData(sendIndex, sendSize, 0);
});

$("#btn_SendRef").live("click",function(e)
{
    ShowLoading(true, "正在刷新……");

    sendSize = sendIndex * sendSize;

    SendLoadData(1, sendSize, 0);
});

function JoinList()
{
    sendIndex++;
    SendLoadData(sendIndex, sendSize, 1);
}


//$('#detailsSendPage').live('pageshow', function (e) {


//    try {

//        var currentPage = $(e.target),
//              options = {
//                  getToolbar: function () {

//                      return '<div class="ps-toolbar-close" style="padding-top: 12px;">返回</div><div class="ps-toolbar-previous" style="padding-top: 12px;">上一页</div><div class="ps-toolbar-next" style="padding-top: 12px;">下一页</div>';

//                  },
//                  allowRotationOnUserZoom: true,
//                  imageScaleMethod: "fit",
//                  captionAndToolbarAutoHideDelay: 0,
//                  preventDefaultTouchEvents: false
//                  //doubleTapSpeed: false,
//                  //doubleTapSpeed:100
//              };

//        $("ul.gallery a", e.target).photoSwipe(options, currentPage.attr('id'));

//        return true;

//    } catch (ex) {


//    }


//})
//.live('pagehide', function (e) {

//    try {

//        var currentPage = $(e.target),
//            PhotoSwipe = window.Code.PhotoSwipe,
//            photoSwipeInstance = PhotoSwipe.getInstance(currentPage.attr('id'));

//        if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
//            PhotoSwipe.detatch(photoSwipeInstance);
//        }

//        return true;

//    } catch (ex) {

//    }

//});

function SendLoadData(index, size, flag) {
    YtAjax(
              ServerURL + "GetSendFaxBill.ashx?seqno=" + userInfo.SeqNo + "&isDel=" + 0 + "&index=" + index + "&size=" + size,
              "hide",
              function (data, textStatus, jqXHR) {

                  if (data != undefined && data.length > 0) {

                      HideLoading();

                      //pullDownEl.style.display = "none";

                      if (flag == 0) {
                          CreateSendList($("#thelist"), data);
                      }
                      else {
                          AppendSendList($("#thelist"), data);
                      }

                  }
                  else {

                      HideLoading();

                      if (sendIndex > 1) {

                          sendIndex--;
                      }

                      //pullDownEl.style.display = "block";
                      //OpenPopup("没有接收到新的传真");
                  }
              },
              function (jqXHR, textStatus, errorThrown) {

                  HideLoading();

                  if (sendIndex > 1) {

                      sendIndex--;
                  }

                  //pullDownEl.style.display = "block";
                  OpenPopup("Error:" + textStatus + "," + errorThrown);

              }
      );
}

function CreateSendList(divList, list) {

    var re = document.getElementById("thelist");
    var count = 1;

    while (re.childNodes.length > 0) {

        count = re.childNodes.length;

        re.removeChild(re.childNodes[count - 1]);

    }

    var content = "";

    for (var i = 0; i < list.length; i++) {
        content = content + "<li>";
        content = content + "<a href=\"#\" onclick=\"GoTo('details-Send.html?cn=" + list[i].FaxNum + "&sub=" + list[i].Subject + "&date=" + list[i].Date + "&url=" + list[i].FaxFile + "&sys=" + list[i].BatchNo + "&dis=" + list[i].DisplayName + "')\">";
        //content = content + "<img src=\"./img/headpic/5.jpg\" onerror=\"errpic(this)\" class=\"listpic\"/>";
        content = content + "<p>";
        content = content + "<h3 class=\"listtitle\">" + list[i].FaxNum + "</h3>";
        content = content + list[i].BatchNo + " <span class=\"timestyle\">时间：" + list[i].Date + "</span>";
        content = content + "</p>";
        content = content + "</a>";
        content = content + "</li>";

    }

    content += "<li id='li_Join'><a onclick='JoinList();'>点击加载更多</a></li>";

    divList.append(content).listview('refresh');

}

function AppendSendList(divList, list) {

   var th= document.getElementById("thelist");
   th.removeChild(th.childNodes[th.childNodes.length - 1]);

   var content = "";
    for (var i = 0; i < list.length; i++) {
        content = content + "<li>";
        content = content + "<a href=\"#\" onclick=\"GoTo('details.html?cn=" + list[i].FaxNum + "&sub=" + list[i].Subject + "&date=" + list[i].Date + "&url=" + list[i].FaxFile + "&sys=" + list[i].BatchNo + "&flag=1')\">";
        //content = content + "<img src=\"./img/headpic/5.jpg\" onerror=\"errpic(this)\" class=\"listpic\"/>";
        content = content + "<p>";
        content = content + "<h3 class=\"listtitle\">" + list[i].FaxNum + "</h3>";
        content = content + list[i].BatchNo + " <span class=\"timestyle\">时间：" + list[i].Date + "</span>";
        content = content + "</p>";
        content = content + "</a>";
        content = content + "</li>";
    }
    content += "<li id='li_Join'><a onclick='JoinList();'>点击加载更多</a></li>";
    divList.append(content).listview('refresh');

}

//接收列表
var recvIndex = 1;
var recvSize = 10;
$("#recvfaxlist").live("pageinit", function (event) {

    GetUserInfo();

    ShowLoading(true, "正在加载……");

    RecvLoadData(recvIndex, recvSize, 0);

});

$("#btn_RecvRef").live("click", function (e) {

    ShowLoading(true, "正在刷新……");

    recvSize = recvIndex * recvSize;

    RecvLoadData(1, recvSize, 0);
});

function JoinRecvList() {

    recvIndex++;
    RecvLoadData(recvIndex, recvSize, 1);

}
//$("#recvfaxlist").live("pageinit", function (event) {

//    pullDownEl = document.getElementById('pullDown');
//    pullUpEl = document.getElementById('pullUp');

//    $("#recvfaxlist").live("touchmove", function (e) { e.preventDefault(); });

//    $("#recvfaxlist").live("DOMContentLoaded",
//                            Init(
//                                'recvWrapper',
//                                pullDownEl,
//                                pullUpEl,
//                                function () {
//                                    setTimeout(function () {
//                                        // <-- Simulate network congestion, remove setTimeout from production!
                                        //recvSize = recvIndex * recvSize;

                                        //RecvLoadData(1, recvSize, 0);

//                                        myScroll.refresh();
//                                        //数据加载完成后，调用界面更新方法   Remember to refresh when contents are loaded (ie: on ajax completion)
//                                    }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
//                                },
//                                function () {

//                                    setTimeout(function () {	// <-- Simulate network congestion, remove setTimeout from production!
//                                        //var el, li, i;
//                                        //el = document.getElementById('recvList');

//                                        //for (i = 0; i < 3; i++) {
//                                        //    li = document.createElement('li');
//                                        //    li.innerText = 'Generated row ' + (++generatedCount);
//                                        //    el.appendChild(li, el.childNodes[0]);
//                                        //}
                                        //recvIndex++;
                                        //RecvLoadData(recvIndex, recvSize, 1);
//                                        myScroll.refresh();		// 数据加载完成后，调用界面更新方法 Remember to refresh when contents are loaded (ie: on ajax completion)
//                                    }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
//                                }
//                            ));

//    GetUserInfo();

//    ShowLoading(true, "正在加载……");

//    //photoShows(window, window.jQuery, window.Code.PhotoSwipe, '#detailsPage');

//    RecvLoadData(recvIndex, recvSize, 0);


//});


$(document).bind("pagebeforechange", beforechange);

function beforechange(e, data) {

    if (typeof data.toPage != "string") {

        var url = $.mobile.path.parseUrl(e.target.baseURI);

        var re = 'details.html';
        var resend = 'details-Send.html';
        //
        if (url.href.search(re) != -1 || url.href.search(resend) != -1) {

            var d = data.options.data;
            var data = GetUrlParam(url.href);

            var picSrc = data[3];
            var sysid = data[4];

            var page;
            switch (url.filename) {

                case re:
                    page = $(e.target).find("#detailsPage");

                    break;
                case resend:

                    page = $(e.target).find("#detailsSendPage");

                    page.find("#displaySts").html(decodeURIComponent(data[5]));
                    break;

            }

            page.find("#numberDiv").html(decodeURIComponent(data[0]));
            page.find("#timeDiv").html(decodeURIComponent(data[2]));
            page.find("#contentDiv").html(decodeURIComponent(data[1]));

            //var pages = data[5];

            if (picSrc != '') {

                if (!IsExistsSysID(sysid)) {

                    GetImageData(picSrc, page, sysid);
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

                         //content +="<li><a href='" + obj + "'\"><img src='" + obj + "' alt='第" + (i + 1) + "页' height=\"100%\" width=\"100%\" /></a></li>";
                        content += "<li><a href=\"javascript:dialogPhoto('" + obj + "')\"><img src='" + obj + "' alt='第" + (i + 1) + "页' /></a></li>";
                    }

                    page.find("#Gallery").html(content);
                }


            }
            else {

                // page.find("#Gallery").html("");
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

                      //pullDownEl.style.display = "none";

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

                      //pullDownEl.style.display = "block";
                      OpenPopup("没有接收到新的传真");
                  }
              },
              function (jqXHR, textStatus, errorThrown) {

                  HideLoading();

                  if (recvIndex > 1) {

                      recvIndex--;
                  }

                  //pullDownEl.style.display = "block";
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
    for (var i = 0; i < list.length; i++) {
        content = content + "<li>";
        content = content + "<a href=\"#\" onclick=\"GoTo('details.html?cn=" + list[i].CallerNum + "&sub=" + list[i].Subject + "&date=" + list[i].Date + "&url=" + list[i].FaxFile + "&sys=" + list[i].SysID + "&flag=0')\">";
        //content = content + "<img src=\"./img/headpic/5.jpg\" onerror=\"errpic(this)\" class=\"listpic\"/>";
        content = content + "<p>";
        content = content + "<h3 class=\"listtitle\">" + list[i].CallerNum + "</h3>";
        content = content + list[i].Subject + " <span class=\"timestyle\">时间：" + list[i].Date + "</span>";
        content = content + "</p>";
        content = content + "</a>";
        content = content + "</li>";
    }

    content += "<li id='li_Join'><a onclick='JoinRecvList();'>点击加载更多</a></li>";

    divList.append(content).listview('refresh');

}

function AppendList(divList, list) {

    var th = document.getElementById("recvList");
    th.removeChild(th.childNodes[th.childNodes.length - 1]);

    var content = "";
    for (var i = 0; i < list.length; i++) {

        content = content + "<li>";
        content = content + "<a href=\"#\" onclick=\"GoTo('details.html?cn=" + list[i].CallerNum + "&sub=" + list[i].Subject + "&date=" + list[i].Date + "&url=" + list[i].FaxFile + "&sys=" + list[i].SysID + "&pages=" + list[i].Pages + "')\">";

        content = content + "<p>";
        content = content + "<h3 class=\"listtitle\">" + list[i].CallerNum + "</h3>";
        content = content + list[i].Subject + " <span class=\"timestyle\">时间：" + list[i].Date + "</span>";
        content = content + "</p>";
        content = content + "</a>";
        content = content + "</li>";
    }
    content += "<li id='li_Join'><a onclick='JoinRecvList();'>点击加载更多</a></li>";
    divList.append(content).listview('refresh');

}

//$('#detailsPage').live('pageshow', function (e) {

//    var currentPage = $(e.target),
//        options = {
//            getToolbar: function () {

//                return '<div class="ps-toolbar-close" style="padding-top: 12px;">返回</div><div class="ps-toolbar-previous" style="padding-top: 12px;">上一页</div><div class="ps-toolbar-next" style="padding-top: 12px;">下一页</div>';

//            },
//            allowRotationOnUserZoom: true,
//            imageScaleMethod: "fit",
//            captionAndToolbarAutoHideDelay: 0,
//            preventDefaultTouchEvents: false
//            //doubleTapSpeed: false,
//            //doubleTapSpeed:100
//        },
//        instance = $("ul.gallery a", e.target).photoSwipe(options, currentPage.attr('id'));

//    return true;

//})

//            .live('pagehide', function (e) {

//                var
//                    currentPage = $(e.target),
//                    PhotoSwipe = window.Code.PhotoSwipe,
//                    photoSwipeInstance = PhotoSwipe.getInstance(currentPage.attr('id'));

//                if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
//                    PhotoSwipe.detatch(photoSwipeInstance);
//                }

//                return true;

//            });

function GetImageData(url, page, sysid) {
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

                           //content += "<li><a href='" + img64[i].Data + "'><img src='" + img64[i].Data + "' alt='第" + (i + 1) + "页' /></a></li>";
                           content += "<li><a href=\"javascript:dialogPhoto('" + obj + "')\"><img src='" + obj + "' alt='第" + (i + 1) + "页' /></a></li>";
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

function IsExistsSysID(sysid) {
    var obj = localStorage.getItem(sysid);
    if (obj != undefined && obj != null) {
        return true;
    }

    return false;
}

function dialogPhoto(data) {

    if (data=="") {

        return;
    }

    document.getElementById("photoImg").setAttribute("src", data);
    $("#photo").popup('open');

}

//function a() {
//    var div = $("<div>").attr("class", "ps-zoom-pan-rotate").attr("style", "left: 0px; top: 0px; position: absolute; width: 1360px; height: 272px; z-index: 1000; display: block;");

//    var img = $("<img>").attr("style", "display: block; transform: scale(2.5) rotate(0deg) translate(-18px, 47px); position: absolute; width: 411px; height: 272px; top: 0px; left: 475px; z-index: 1;");
//    img.attr("src", "data:image/gif;base64,R0lGODlhwAZ5BPcAAAAAAAAAMwAAZgAAmQAAzAAA/wAzAAAzMwAzZgAzmQAzzAAz/wBmAABmMwBmZgBmmQBmzABm/wCZAACZMwCZZgCZmQCZzACZ/wDMAADMMwDMZgDMmQDMzADM/wD/AAD/MwD/ZgD/mQD/zAD//zMAADMAMzMAZjMAmTMAzDMA/zMzADMzMzMzZjMzmTMzzDMz/zNmADNmMzNmZjNmmTNmzDNm/zOZADOZMzOZZjOZmTOZzDOZ/zPMADPMMzPMZjPMmTPMzDPM/zP/ADP/MzP/ZjP/mTP/zDP//2YAAGYAM2YAZmYAmWYAzGYA/2YzAGYzM2YzZmYzmWYzzGYz/2ZmAGZmM2ZmZmZmmWZmzGZm/2aZAGaZM2aZZmaZmWaZzGaZ/2bMAGbMM2bMZmbMmWbMzGbM/2b/AGb/M2b/Zmb/mWb/zGb//5kAAJkAM5kAZpkAmZkAzJkA/5kzAJkzM5kzZpkzmZkzzJkz/5lmAJlmM5lmZplmmZlmzJlm/5mZAJmZM5mZZpmZmZmZzJmZ/5nMAJnMM5nMZpnMmZnMzJnM/5n/AJn/M5n/Zpn/mZn/zJn//8wAAMwAM8wAZswAmcwAzMwA/8wzAMwzM8wzZswzmcwzzMwz/8xmAMxmM8xmZsxmmcxmzMxm/8yZAMyZM8yZZsyZmcyZzMyZ/8zMAMzMM8zMZszMmczMzMzM/8z/AMz/M8z/Zsz/mcz/zMz///8AAP8AM/8AZv8Amf8AzP8A//8zAP8zM/8zZv8zmf8zzP8z//9mAP9mM/9mZv9mmf9mzP9m//+ZAP+ZM/+ZZv+Zmf+ZzP+Z///MAP/MM//MZv/Mmf/MzP/M////AP//M///Zv//mf//zP///8DAwICAgIAAAACAAAAAgICAAIAAgACAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAwAZ5BAAIogCvCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx0OQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6tezbq169ewY8ueTbu27du4c+vezbu379/AgwsfTry48ePIkytfM868ufPn0KNLn069uvXr2LNr3869u/fv4MOLH0++vPnz6NOrX8++vfv38OPLn0+/vv37+DDz69/Pv7///wAGKOCABBZo4IEIJqjgggw26OCDEEYo4YQUVmjhhRhmqOGGHHbo4YcqIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGJynkkEQWaeSRSCap5JJMNunkk1BGKeWUVFZp5ZVYZqnlllx26eWXYCOGKeaYZJZp5plopqnmmmy26eabcMYp55x01mnnnXjmqeeefCD26eefgAYq6KCEFmrooYgmquiijDbq6KOQRirppJRWaiDppZhmqummnHbq6aeghirqqKSWauqpqKaq6qqsturqqxywxirrrLTWauutuOaq66689urrr8AGK+ywxBZrHeyxyCar7LLMNuvss9BGK+201FZr7bXYZqvtttx2Guvtt+CGK+645JZr7rnopqvuuuy26+678MYr/++89NZr77345qvvvvx6C8C/GwEcksADESyQwRQhXJPCGgGQEsMZQdyQwxNR/JDEEkOEsMUkcbyQxwVlXJHINJGcMMgXJ6xxQiYjhPJBLysUc8Ezu8wyyjWHnHPDLV/Us8w/M4TxzjBPLBHRK3+MEcRIO/Rv0wEL7TTFUA8dEdQEYd1RxkFjavXVMD8tttgXb2xQ12Hf7JLCY7dt8sZuu10x2hPPXPPTWcctd91AH20w23hPrffgRH9Nd9E+Be4R1x//TTjZfJ+t9cGOg1y1yF0PzfHPh2usuEgEf1523qKPbvPJj3Ne+eB12z055S6/njbqqbOuttAWlz577FfXHo430HvXjnvjpwoPtuS8O4143rgTTnnwLbHd9/DMy+w31Vj7rvc1dzMN8OSuz63z7dR7PjX53GO8e/rbzxR45trL3f3LeINv+eNKn819yDTfHXbqxMuaAAs2wACCLneX+9369ue3/zUvfnszYPLOR8HzQVB341ugz2KGwfQdMHIHY6D10Kc884lweSHc2ua0/+cpgcGt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");

//    img.appendTo(div);

//    div.appendTo("#detailsPage");

//    $("#detailsPage").trigger("PhotoSwipeOnZoomPanRotateShow");

//}









