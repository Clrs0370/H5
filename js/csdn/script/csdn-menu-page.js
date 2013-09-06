(function (C) {

    if (!C.MenuPage)
        C.MenuPage = function () { }

    var MP = C.MenuPage,
		L = $.MyWidget.NLocal;

    $.extend(true, MP.prototype, C, {
		/// <summary>
        /// 当前选中的菜单栏目
        /// </summary>
		selected: null,
        OnReady: function () {
			var that = this,
				doc = document;
			try{
				that._isIOS = that.isIOS();
				setTimeout(function(){
					var url = 'index.html';
					if(that._isIOS) {
						url= 'index-ios.html';
					}
					plus.ui.createWindow( url, {name: "LISTWIN"} ).show();
				}, 0);
				dh.init();
				that.selected = doc.getElementById("news");

				that._bind("touchstart", doc);
				//that._bind("click", doc.getElementById("menu-ul"));
				//that._bind("click", doc.getElementById("dosearch"));
				//that._bind("click", doc.getElementById("key"));
			}
			catch(e){
				that.showErr(e);
			}
        },
		handleEvent: function(e){
			try{
				var t = e.target,
					id = t.id || t.parentNode.id,
					that = this,
					clickTime = that.clickTime,
					time = new Date().getTime();
				//600ms内不让连续点击
				if(clickTime && time - clickTime < 600) return;
				that.clickTime = time;
				
				switch(id){
					case "dosearch":
					case "searcharticle":
						plus.ui.createWindow("app/search.html", {name: 'SearchWIN', transition:{duration:300}}).show('slide-in-right',300);
						break;
					case "news":
					case "industry":
					case "cloud":
					case "mobile":
					case "sd":
						that.changeMenu(id);
						that.showIndexPage(id);
						break;
					case "push":
						alert("目前版本不支持推送消息！");
						break;
					case "offline":
						plus.ui.createWindow( "app/offline.html", {name: "OffLineWIN", transition:{duration:300}} ).show('slide-in-right',300);
						break;
					case "favorite":
						plus.ui.createWindow( "app/favorite.html", {name: "FAVORITEWIN", transition:{duration:300}} ).show('slide-in-right',300);
						break;
					case "settings":
						plus.ui.createWindow( "app/setting.html", {name: "SETWIN", transition:{duration:300}} ).show('slide-in-right',300);
						break;
				}

				return true;
			}
			catch(ex){
				this.showErr(ex);
			}
		},
		/// <summary>
        /// 显示列表页面
        /// </summary>
		showIndexPage: function(categoryid){
			plus.statistic.eventTrig(categoryid);
			var win = plus.ui.findWindowByName("LISTWIN");
			if(this._isIOS) win.evalJS("ipPage.showMenu(" + this.selected.getAttribute("num") + ",'" + categoryid + "');");
			else win.evalJS("ipPage.showMenu('" + categoryid + "');");
		},
		/// <summary>
        /// 切换菜单栏目,改变当前选择中的颜色
        /// </summary>
		/// <param name="id">category id</param>
		changeMenu: function(id){
			var that = this,
				selected = that.selected;
			if(selected.id == id) return;
			selected.parentNode.setAttribute("class", "");
			that.selected = document.getElementById(id);
			that.selected.parentNode.setAttribute("class", "clicked");
		}
    });

    window.page = new MP();
    //页面注册
	 if(navigator.userAgent.match(/Android/i) || 
    			navigator.userAgent.match(/iPhone/i) || 
    			navigator.userAgent.match(/iPod/i) || 
    			navigator.userAgent.match(/iPad/i))
	document.addEventListener("plusready", function(){
		page.OnReady();
	});
    else{ 
    	$(function () { page.OnReady(); });
    }
   // $(function () { page.OnReady(); });
})($.csdn);
