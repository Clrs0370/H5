(function (C) {

    if (!C.ShareTopPage)
        C.ShareTopPage = function () { }

    var FP = C.ShareTopPage;

    $.extend(true, FP.prototype, C, {
        OnReady: function () {
			var that = this;
			try{
				that.init();
				dh.init();
				document.getElementById("left").onclick = function(){
					that.goback();
				}
                that.androidMenu(function(){});
				that.androidBack(function(e){
					that.goback();
				});
			}
			catch(e){
				that.showErr(e);
			}
        },
        goback: function(){
        	var ui = plus.ui;
			ui.findWindowByName("sharecontent").close();
			ui.findWindowByName("sharetop").close();
        }
    });

    var fpPage = new FP();
    //页面注册
	document.addEventListener("plusready", function(){
		fpPage.OnReady();
	});
    //$(function () { fpPage.OnReady(); });
})($.csdn);
