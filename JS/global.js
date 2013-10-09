
//$.mobile.transitionFallbacks.slide = "none";
//$.mobile.buttonMarkup.hoverDelay = "false";

var ServerURL = "http://192.168.3.26:82/";
var localHost = "http://localhost:13375/";

//ServerURL = localHost;

//电子邮箱
var Email = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-|_)[A-Za-z0-9]+)*\.([a-zA-Z0-9_-])+$/;
//手机号码
var MobilePhone = /^01(3|5|8)\d{9}$/;
//带分机的传真号
var FaxNum = /^(\d{6,21})(($)|(,\d{1,8}$))$/;
//带分机的传真号
var LFaxNum = /^(\d{6,20})(($)|(,\d{1,8}$))$/;
//固定电话
var Telephone = /^((0\d{2,3})\d{7,8})(($)|(,\d{1,8}$))/;
var International = /^(00\d{8,16})(($)|(,\d{1,8}$))/;

var userInfo;
var popup;
var myScroll,
   pullDownEl,
   pullDownOffset,
   pullUpEl,
   pullUpOffset,
   generatedCount = 0,
   pullDownEl,
   pullUpEl;

function hide(data)
{
    var dat = data;
}
//跳转
function GoTo(page) {

    //ShowLoading();

	$.mobile.changePage(page, {
		  transition: "slide"
	});

}

//后退
function GoBack() {
	$.mobile.back();
}

//显示loading
function ShowLoading(){
	$.mobile.loadingMessageTextVisible = true;
	$.mobile.showPageLoadingMsg("a", "加载中..." );
}

//显示loading
function ShowLoading(txtVisible,txt) {
    $.mobile.loadingMessageTextVisible = txtVisible;
    $.mobile.showPageLoadingMsg("a", txt);
}

//隐藏loading
function HideLoading(){
	$.mobile.hidePageLoadingMsg();
}

//消息框
function msgBox(txt) {

    ShowLoading(false,txt);
    setTimeout(HideLoading, 1000);
}

//错误图片
function Errpic(thepic) {
    thepic.src = "CSS/Images/no_pic.png";
}

//获取Url参数
function GetUrlParam(string) {  
    var obj =  new Array();  
	    if (string.indexOf("?") != -1) {  
	        var string = string.substr(string.indexOf("?") + 1); 
	        var strs = string.split("&");  
	        for(var i = 0; i < strs.length; i ++) {  
	            var tempArr = strs[i].split("=");  
	            obj[i] = tempArr[1];
	        }  
	    }  
	    return obj;  
} 

//init iscroll
var myScroll;
function InitMyScroll(id){
	function loaded() {
		if(myScroll!=null){
			myScroll.destroy();
		}
		myScroll = new iScroll(id,{checkDOMChange:false});
	}
}

var openDialog= function (options) {
    var href = options.href || "about:blank";
    var transition = options.transition || "none";
    $('body').append("<a id='tPushDialog' href='" + options.href + "' data-rel=\"dialog\" data-transition=\"" + options.transition + "\" style='display:none;'>Open dialog</a> ");
    $("#tPushDialog").trigger('click');
    $('body').find('#tPushDialog').remove();

    $("#" + options.dialog).live('pageshow', function (event) {
        if (typeof options.callback == 'function')
            options.callback();
    });

}

//Ajax
function YtAjax(url, callback, succFun, errorFun) {
    $.ajax({
        type: "get",
        async: false,
        url: url,
        dataType: "jsonp",
        timeout: 5000,
        jsonp: "cb",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
        jsonpCallback: callback,//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名，也可以写"?"，jQuery会自动为你处理数据
        success: succFun,
        error: errorFun
    });
}

//function YtAjax1(url,data)
//{
//    $.ajax({
//            async:false,
//            url: url,
//            type: "GET",
//            dataType:'jsonp',
//            jsonp: 'cb',
//            data: data,
//            timeout: 5000,
//            beforeSend: function(){
//                //jsonp 方式此方法不被触发.原因可能是dataType如果指定为jsonp的话,就已经不是ajax事件了
//                var a = 0;
//            },
//            success: function (data, textStatus, jqXHR) {//客户端jquery预先定义好的callback函数,成功获取跨域服务器上的json数据后,会动态执行这个callback函数
//                var a = 0;
//            },
//            complete: function(XMLHttpRequest, textStatus){
//                var a = 0;
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                //jsonp 方式此方法不被触发.原因可能是dataType如果指定为jsonp的话,就已经不是ajax事件了
//                //请求出错处理
//                alert("请求出错(请检查相关度网络状况.)");
//            }
//    });
//}

function GetUserInfo()
{
    userInfo= JSON.parse(sessionStorage.getItem("UserInfo"));
}

//function CheckNumber()
//{
//    if (!(((window.event.keyCode >= 48) && (window.event.keyCode <= 57) || (window.event.keyCode == 44) || (window.event.keyCode == 59) || (window.event.keyCode == 8))))
//    {
//        window.event.keyCode = 0;
//    }
//}

function IsFaxNum(obj) {
    var flag = false;

    if (International.test(obj)) {
        return true;
    }
    else if (Telephone.test(obj)) {
        return true;
    }
    else if (MobilePhone.test(obj)) {
        return true;
    }
    return flag;
}

//<div data-role="popup" id="popupCloseRight"  data-overlay-theme="a" data-theme="c"  class="ui-content" style="max-width:280px">          <a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right"></a>            <div data-role="content"><p>"+txt+"</p>       //<a href="#" data-role="button" data-inline="true" data-rel="back" data-theme="c">Cancel</a>//    <a  href="#" data-role="button" data-inline="true" data-rel="back" data-transition="flow"                    data-theme="b">Delete</a></div></div>
var Dialog = function (txt) {
    var dialog = $('<div data-role="popup" id="popupCloseRight"  data-overlay-theme="a" data-theme="c"  class="ui-content" style="max-width:280px"><a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right"></a> <div data-role="content"><p>'+txt+'</p></div></div>');
    $.mobile.activePage.append(dialog);
    dialog.trigger("create");
    dialog.popup();

    dialog.popup('open');
}

var OpenPopup = function (txt) {
    popup = $('<div data-role="popup" data-transition="fade" data-theme="a" data-position-to="window" id="popupiOS"><p>' + txt + '<p></div>');
    $.mobile.activePage.append(popup);
    popup.trigger("create");
    popup.popup();
    popup.popup('open');

    setTimeout(ClosePopup,2000);
}

function ClosePopup()
{
    if (popup!=undefined&&popup!=null) {
        popup.popup('close');
    }
}


/**
 * 初始化iScroll控件
 */
function Init(wrapper,pullDownEl, pullUpEl, pullDownFun, pullUpFun) {
    if (myScroll != null) {
        myScroll.destroy();
    }
    //pullDownEl = document.getElementById('pullDown');
    pullDownOffset = pullDownEl.offsetHeight;
    //pullUpEl = document.getElementById('pullUp');
    pullUpOffset = pullUpEl.offsetHeight;

    
    myScroll = new iScroll(wrapper, {
        scrollbarClass: 'myScrollbar', /* 重要样式 */
        useTransition: false, /* 此属性不知用意，本人从true改为false */
        topOffset: pullDownOffset,

        onRefresh: function () {
            if (pullDownEl.className.match('loading')) {
                pullDownEl.className = '';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新...';
            } else if (pullUpEl.className.match('loading')) {
                pullUpEl.className = '';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉加载更多...';
            }
        },

        onScrollMove: function () {
            if (this.y > 5 && !pullDownEl.className.match('flip')) {
                pullDownEl.className = 'flip';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '松手开始更新...';
                this.minScrollY = 0;
            } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                pullDownEl.className = '';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新...';
                this.minScrollY = -pullDownOffset;
            } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
                pullUpEl.className = 'flip';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '松手开始更新...';
                this.maxScrollY = this.maxScrollY;
            } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
                pullUpEl.className = '';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉加载更多...';
                this.maxScrollY = pullUpOffset;
            }
        },

        onScrollEnd: function () {
            if (pullDownEl.className.match('flip')) {
                pullDownEl.className = 'loading';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '加载中...';

                pullDownFun();	// Execute custom function (ajax call?)

            } else if (pullUpEl.className.match('flip')) {
                pullUpEl.className = 'loading';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载中...';

                pullUpFun();	// Execute custom function (ajax call?)
            }
        }
    });

    setTimeout(function () { document.getElementById(wrapper).style.left = '0'; }, 800);
}