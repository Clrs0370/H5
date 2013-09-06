(function (C) {

    if (!C.SearchPage)
        C.SearchPage = function () { }

    var FP = C.SearchPage,
		L = $.MyWidget.NLocal;

    $.extend(true, FP.prototype, C, {
		pageNum: 1,
        OnReady: function () {
			var that = this,
				doc = document;
			try{
				//that.init();
				plus.statistic.eventTrig("searchlist");
				dh.init();
				that._bind("click", doc.getElementById("left_back"));
				that._bind("keydown", doc.getElementById("key"));
                that.androidMenu(function(){});
				//that._bind("click", doc.getElementById("container"));

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

				that.addScroll();
			}
			catch(e){
				that.showErr(e);
			}
        },
		handleEvent: function(e){
			try{
				var t = e.target,
					that = this,
					id = t.id || t.parentNode.id;
				switch(id){
					case "left_back":
						that.back();
						return;
					case "key":
						if(e.keyCode==13){
							var txt = t.value;
							if (!txt || txt.length<2) {
								t.blur();
                            	document.getElementById('hide').focus();
								dh.alert("关键字不能少于两位！");
								return;
							};
							that.pageNum = 1;
							that.searchEnd = false;
							var scroll = that.scroll;
							scroll.pullUpRefresh = false;
							scroll.pullUpLabel.display = "none";
							//scroll.pullUpLabel.innerHTML = "上拉载入更多";
							scroll.refreshing = false;
							scroll = null;
                            //blur与下面的focus事件配合使用
                            t.blur();
                            document.getElementById('hide').focus();
							that.txt = txt;
							dh.alert("正在搜索，请稍候...",100000);
							that.getSearchData(1);
						}
						return;
				}
				
			}
			catch(ex){
				this.showErr(ex);
			}
		},
		getSearchData: function(pageNum){
			var that = this,
				searchurl = 'http://so.csdn.net/search?t=news&page=' + pageNum + '&q=' + that.txt,
				loginreq =  "action=bs-transfer@mdp&_MSC_CMD_=QRY&nologin=true&phonemodel=Windows||||Microsoft&appid=FE3XK6&cellid=&screensize=640*920&vt=4&truescreensize=640*920&mscver=V3.2.0.BUILD.01.120625.122330&relogin=false&encrypt=false&carrier=PC&MSCID=&loginmode=foreground&appver=1.0&lac=&partnerid=user&url=" + searchurl.encode();
			plus.statistic.eventTrig("searchlist",that.txt);
			if(that.ajax){
				that.ajax.abort();
				that.ajax = null;
			}
			that.ajax = $.ajax({
				type : 'GET',
				url : that.serverurl,
				timeout : that.timeout,
				data: loginreq,
				dataType : 'jsonp',
				success : function(data) {
					if(data.list.length>0){
						$("#no-search").css("display", "none");
						that.showSearch(data, pageNum);
					}else if(pageNum == 1){
						$('#_dialog_alert').hide();
	            		$('#_dialog_alert').remove();
						$("#no-search").css("display", "block");
						plus.console.log("没有搜索到任何东西！！");
						//dh.alert("没有搜到任何东西哦！",'error0',200000);
					}
					if(data.list.length < 15){
						that.searchEnd = true;
						that.scroll.pullUpLabel.innerHTML = "";
					}
				},
				error : function(xhr, type) {
					if(type == "abort") return;
					$('#_dialog_alert').hide();
	            	$('#_dialog_alert').remove();
					dh.alert("网络不给力");
				}
			});
		},
		showSearch: function(data, pageNum){
			try{
				var index = 0,
					len = data.list.length,
					doc = document,
					container = document.getElementById("container"),
					that = this,
					scroll = that.scroll;
                that.pageNum = pageNum;
				if(pageNum == 1) {
					scroll._pos(0, 0);
					container.innerHTML = "";
					doc.getElementById("scrollcontainer").style.height = window.innerHeight - 94 + "px";
				}
				for(; index < len; index++){
					var d = data.list[index],
						div = doc.createElement("div"),
						h2 = doc.createElement("h2"),
						p = doc.createElement("p");
						//time = d.ptime.toDate("yyyy-MM-dd HH:mm").toString("MM-dd HH:mm");
					div.setAttribute("articleid", d.id);
                    div.setAttribute("remark", d.remark);
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
				$('#_dialog_alert').hide();
	            $('#_dialog_alert').remove();
				scroll.pullUpRefresh = false;
				//scroll.pullUpLabel.innerHTML = "上拉载入更多";
                if(pageNum == 1) scroll.pullUp.style.display = "block";
				scroll.refreshing = false;
				scroll.refresh();
				scroll = null;
			
			}
			catch(ex){
				this.showErr(ex);
			}
		},
		addScroll: function(){
			var that = this,
				scroll = that.scroll;
			if(scroll) scroll.refresh();
			else{
				that.scroll = new iScroll("scrollcontainer", {
					hScroll: false,
					hScrollbar: false,
					checkDOMChanges: false,
					onInit: function(){
						var _this = this,
							pullUp = _this.pullUp = document.querySelector("#scrollcontainer .pullUp");
						_this.pullUpLabel = pullUp.getElementsByClassName("pullUpLabel")[0];
						pullUp.style.display = "none";
						_this.wrapper.style.position = "relative";
					},
					onTouchCancel: function(e){
						this.hasCancel = true;
					},
					onScrollMove: function(e){
						try{
							e.preventDefault();
							var _this = this,
								y = _this.y;
							_this.scrollMoved = true;
							_this.hasCancel = false;
							/*if(_this.pullUpRefresh || that.searchEnd) return;
							if(Math.abs(y) + _this.wrapperH - 50 > _this.scrollerH && !_this.pullUpRefresh){//到达底部时下拉
								_this.pullUpRefresh = true;
								_this.pullUpLabel.innerHTML = "释放载入更多";//上拉载入更多
								_this.pullUp.style.display = "block";
								_this.refresh();
							}*/
						}
						catch(ex){
							that.showErr(ex);
						}
					},
					onTouchEnd: function(e){
						try{
							var _this = this;
							
							if(!that.searchEnd && !_this.refreshing && Math.abs(_this.y) + _this.wrapperH + 60> _this.scrollerH){
								_this.refreshing = true;
								  _this.pullUpLabel.innerHTML = "数据加载中，请稍候...";
								//var num = that.pageNum + 1;
								//that.pageNum = num;
								//alert("onTouchEnd" + num);
								that.getSearchData(that.pageNum + 1);
								//_this.pullUpRefresh = false;
							}
							if(!_this.scrollMoved && !_this.hasCancel){
								var t = e.target;
								var articleid = t.getAttribute("articleid") ||
									t.parentNode.getAttribute("articleid") ||
									t.parentNode.parentNode.getAttribute("articleid"),
                                    remark = t.getAttribute("remark") ||
                                        t.parentNode.getAttribute("remark") ||
                                        t.parentNode.parentNode.getAttribute("remark");
								if(articleid){
									L.setItem(that.cacheKey.articleId, articleid);
									var win = plus.ui.findWindowByName("ShowWin");
									win.setOption({left:"0"});
									win.setVisible(true);
									win.evalJS("page.loadFile('"+ articleid +"', '" + remark + "', true);");
								}
								t = null;
							}
							
							_this.scrollMoved = false;
						}
						catch(ex){
							that.showErr(ex);
						}
					}
				});
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
