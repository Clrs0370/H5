(function (C) {

    if (!C.AboutPage)
        C.AboutPage = function () { }

    var FP = C.AboutPage;

    $.extend(true, FP.prototype, C, {
        OnReady: function () {
			var that = this;
			try{
                document.getElementById("left").onclick = function(){
                    //that.goback();
                    that.back();
                }
				dh.init();
                that.androidMenu(function(){});
				that.androidBack(function(e){
                    that.back();
				});
			}
			catch(e){
				that.showErr(e);
			}
        }
    });

    var fpPage = new FP();
    //页面注册
	if(navigator.userAgent.match(/Android/i) || 
    			navigator.userAgent.match(/iPhone/i) || 
    			navigator.userAgent.match(/iPod/i) || 
    			navigator.userAgent.match(/iPad/i))
	document.addEventListener("plusready", function(){
		fpPage.OnReady();
	});
    else{ 
    	$(function () { fpPage.OnReady(); });
    }
    //$(function () { fpPage.OnReady(); });
})($.csdn);
