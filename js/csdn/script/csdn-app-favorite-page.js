(function (C) {

    if (!C.FavoritePage)
        C.FavoritePage = function () {}

    var fPage = C.FavoritePage,
		L = $.MyWidget.NLocal;

    $.extend(true, fPage.prototype, C, {
        OnReady: function () {
			var that = this,
				doc = document,
				cacheKey = that.cacheKey;
				plus.statistic.eventTrig("remark");
			try{
				dh.init();
				that.init();
				that.loadFavorite();
                that.androidMenu(function(){});
				that.androidBack(function(e){
					var startTime = that.clickTime,
						endTime = new Date().getTime();
					if(startTime && endTime - startTime < 600) {
						that.clickTime = endTime;
						return;
					}

					that.clickTime = endTime;
					that.back();
				});

				//绑定事件
				that._bind("click", doc.getElementById("left_back"));

				//alert(JSON.stringify(plus.ui.getSelfWindow().getOption()));
				
			}
			catch(e){
				that.showErr(e);
			}
        },
		handleEvent: function(e){
			try{
				var that = this,
					t = e.target,
					tag = t.tagName,
					parent = t.parentNode,
					id = t.id;
				if((id || parent.id) == "left_back"){
					that.back();
					return true;
				}
			}
			catch(ex){
				this.showErr(ex);
			}
		},
		loadFavorite: function(){
			var that = this;
			that.load_fav(function(data){
				if(data.length == 0){
					//that.showNoData();
					document.getElementById("container").innerHTML = '<span class="nofavorite"><img width="127px" height="80px" src="../app/img/no-favorite.png"></span>';
					if(that.scroll){
						that.scroll.destroy();
						that.scroll = null;
					}
				}else{
					 that.showFavorite(data);
				 }
			});
		},
		showFavorite: function(data){
			var index = 0,
				len = data.length,
				that = this,
				doc = document
				container = doc.getElementById("container"),
				scroll = that.scroll;
			container.innerHTML = "";
			for(; index < len; index++){
				var d = data[index],
					div = doc.createElement("div"),
					h2 = doc.createElement("h2"),
					p = doc.createElement("p");

					//time = d.ptime.toDate("yyyy-MM-dd HH:mm").toString("MM-dd HH:mm");
				div.setAttribute("articleid", d.id);
                div.setAttribute("remark", d.remark);
				div.id = d.id;
				h2.innerHTML = d.title;
				p.setAttribute("class", "info");
				p.innerHTML = '<span class="icon clock"></span><span class="ptime">' + d.ptime + '</span><span>&nbsp;&nbsp;</span>';
				//p.innerHTML = '<span class="icon clock"></span><span class="ptime">' + d.ptime + '</span><span>&nbsp;&nbsp;</span><span class="icon eye"></span><span class="ptime">' + d.count + '</span>';
				div.appendChild(h2);
				div.appendChild(p);
				container.appendChild(div);
				div = null;
				d = null;
				h2 = null;
				p = null;
			}

			//that._bind("click", container);
			if(scroll){
				scroll.refresh();
				scroll = null;
				return;
			}
			that.scroll = new iScroll("wrapper", {
				hScroll: false,
				hScrollbar: false,
				checkDOMChanges: false,
				onScrollMove: function(e){
					this.scrollMoved = true;
				},
				onTouchEnd: function(e){
					var _this = this;
					if(!_this.scrollMoved){
						var t = e.target,
							articleid = t.getAttribute("articleid") ||
							t.parentNode.getAttribute("articleid") ||
							t.parentNode.parentNode.getAttribute("articleid"),
                            remark = t.getAttribute("remark") ||
                            t.parentNode.getAttribute("remark") ||
                            t.parentNode.parentNode.getAttribute("remark");
						if(articleid){
							L.setItem(that.cacheKey.articleId, articleid);
							var win = plus.ui.findWindowByName("ShowWin");
							win.setOption({left:"0", transition:{duration:0}});
							win.setVisible(true);
							win.evalJS("page.loadFile('"+ articleid +"','" + remark + "');");
						}
						t = null;
					}
					
					_this.scrollMoved = false;
				}
			});
		}
    });

    window.page = new fPage();
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
    //$(function () { page.OnReady(); });
})($.csdn);
