/**
author :Warren
http://www.wglong.com
**/
$.mobile.transitionFallbacks.slide = "none";
$.mobile.buttonMarkup.hoverDelay = "false";
function goTo(page) {
	showLoading();
	$.mobile.changePage(page, {
		  transition: "slide"
		});
}
function goBack() {
	$.mobile.back();
}

function showLoading(){
	$.mobile.loadingMessageTextVisible = true;
	$.mobile.showPageLoadingMsg("a", "加载中..." );
}


function hideLoading(){
	$.mobile.hidePageLoadingMsg();
}

function errpic(thepic) {
	thepic.src = "../img/no_pic.png" 
}

function getUrlParam(string) {  
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
function initMyScroll(id){
	function loaded() {
		if(myScroll!=null){
			myScroll.destroy();
		}
		myScroll = new iScroll(id,{checkDOMChange:false});
	}
}
