(function (C) {
    if (!C.IndexPage)
        C.IndexPage = function () { }

    var FP = C.IndexPage,
		L = $.MyWidget.NLocal;

    $.extend(true, FP.prototype, C, {
		pageName: "indexpage",
		/// <summary>
        /// 是否是无图模式
        /// </summary>
		noImage: false,
        noImageStatus: false,

		hasPushup: false,
		/// <summary>
        /// 当前显示的category id
        /// </summary>
		categoryId:"news",
		/// <summary>
        /// 菜单窗口是否在显示
        /// </summary>
		isShowingMenu: false,
		/// <summary>
        /// 当前窗口是否处于动画之中
        /// </summary>
		isAnimating: false,
		venable: true,
		henable: false,
		_isIOS: false,
        OnReady: function () {
			var that = this,
				doc = document,
				ui = plus.ui,
				cacheKey = that.cacheKey,
				tiro = cacheKey.tiro,
				selfWin = ui.getSelfWindow();
			doc.onselectstart=function(){return false;}
			try{
				//that.registerPush();
               	// that.noImage = L.getItem(that.cacheKey.noImage);
				//doc.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
				
				
//				var div = doc.createElement('div');
//				div.id = 'installing';
//				back = "想如今我的身段儿自然是极好的，若再梳妆敛容，瞬息可就，定不负君恩！";
//				div.innerHTML = '<div><div class="installloading iosinstalling"></div><div class="installcontent">' + back + '</div></div>';
//				doc.body.appendChild(div);
				
				dh.init();
				//alert(selfWin);
				selfWin.setPullToRefresh({
					support: true, 
					height: '60', 
					range: '50%',
					contentover: {caption:'松开即可刷新..'},
					contentdown: {caption:'下拉可以刷新...'},
					contentrefresh: {caption:'正在加载资讯...'}},
					function(){
						that._unbind('touchend', document);
						//that._unbind('touchcancel', document);
						that._unbind('touchmove', document);
						that.isPullRefresh = true;
						//that.loadFirstPageData(that.categoryId);
						that.isLoading = false;
						that.loadData(that.categoryId, 1);
					});

				that.androidBack(function(e){
					try{
						if(that.installing) return;
						if(that.isShowingMenu) {
							that.showMenu();
							return;
						}
						var startTime = that.clickTime,
							endTime = new Date().getTime();
						if(that.resumeTime && endTime - that.resumeTime < 200) return;
						if(that.showingConfirm) {
							plus.runtime.quit();
							that.showingConfirm = false;
							return;
						}
						//退出策略，500ms内，连续按返回键，直接退出，否则提示退出
						
						if(startTime && endTime - startTime < 500) {
							plus.runtime.quit();
							that.clickTime = null;
							return;
						}
						L.setItem(that.cacheKey.noImage, that.noImage);
						that.showingConfirm = true;
						dh.alert("再按一次退出应用",2000);
						setTimeout(function(){
							that.showingConfirm = false;
						}, 2000);
					}
					catch(ex){
						that.showErr(ex);
					}
				});
				
				that.androidMenu(function(){
					if(that.installing) return;
					that.showMenu();
				});
				that._bind("resume", doc);
				//that._bind("pause", doc);
				that._bind("netchange", doc);
				that._bind('scroll', window);
				that._bind('touchstart', document);
				
				if (that.is2G()) {
					that.noImage = true;
					L.setItem(that.cacheKey.noImage,that.noImage);
				}else{
					that.noImage = L.getItem(that.cacheKey.noImage);
				};
				
				that.init();
				that.loadFirstPageData("news");

				that.addDock();
				that._scrollY = 0;

				var showWin = ui.createWindow('app/show.html',{name:'ShowWin', zindex:1});
				showWin.show();
				showWin.setVisible(false);

			}
			catch(ex){
				that.showErr(ex);
			}
			ui = null;
        },
		checkInstall: function(){
			var that = this,
				widgitPath = L.getItem(that.cacheKey.widgtPath),
				doc = document;
			if(widgitPath){
				that.installing = true;
				plus.ui.getSelfWindow().setPullToRefresh({support: false});
				var div = doc.createElement('div');
				div.id = 'installing';
//				switch(String.fromCharCode(Math.floor( Math.random() * 8) + "a".charCodeAt(0))) {
//					case 'a':
//						back = "稍等一下，惊喜马上呈现！";
//						break;
//					case 'b':
//						back = "等待，是为爆发积蓄力量！";
//						break;
//					case 'c':
//						back = "熊孩子出没，请稍等！";
//						break;
//					case 'd':
//						back = "等一会，我是年轻人，我心情不太好！";
//						break;
//					case 'e':
//						back = "别碰我，放空一下，排除负能量！";
//						break;
//					case 'f':
//						back = "想如今我的身段儿自然是极好的，若再梳妆敛容，瞬息可就，定不负君恩！";
//						break;
//					case 'g':
//						back = "生生不息的存在和永不停歇的奋斗，永远在路上！";
//						break;
//					case 'h':
//						back = "马儿好，马儿跑，马儿要吃草 ！";
//						break;
//				}
				div.innerHTML = '<div><div class="installloading iosinstalling"></div><div class="installcontent">正在解压新资源，请稍后...</div></div>';
				doc.body.appendChild(div);
				plus.runtime.install(widgitPath,{force:true}, function(widgetInfo){
					L.remove(that.cacheKey.widgtPath);
					that.installing = false;
					plus.io.requestFileSystem( plus.io.PRIVATE_DOCUMENTS, function( fs ) {
						fs.root.getDirectory( "widgt", {create: false}, function ( entry ) {
							entry.removeRecursively(function(){
								plus.runtime.restart();
							});
						});
					});
					//alert('plus.runtime.restart();');
				}, function(error){
					//alert('faile:' + error);
					//L.setItem(that.cacheKey.widgtPath, '');
					L.remove(that.cacheKey.widgtPath);
					that.installing = false;
					plus.ui.getSelfWindow().setPullToRefresh({support: true});
					doc.getElementById('installing').style.display = 'none';
					plus.io.requestFileSystem( plus.io.PRIVATE_DOCUMENTS, function( fs ) {
						fs.root.getDirectory( "widgt", {create: false}, function ( entry ) {
							entry.removeRecursively(function(){
								//doc.getElementById('installing').style.display = 'none';
								plus.runtime.restart();
							});

						});
					});
				});
			}
			else{
				plus.runtime.getProperty('B8B4BD', function(widgetInfo){
					$.ajax({
						type: 'GET',
						timeout: that.timeout,
						url: that.UpdateURL + '?appversion=' + widgetInfo.version + '&version=' + plus.runtime.version + '&innerversion=1.0&type=android',
						dataType : 'jsonp',
						success : function(data) {
							if(data.download_url_base){
								that.installing = true;
								plus.ui.confirm(data.releasenotes, function(index, text){
									if(index == 1) plus.runtime.openURL(data.download_url_base);
									that.installing = false;
								}, '', ['不更新', '更新']);

								//alert('data.download_url_base:' + data.download_url_base);
								//plus.runtime.openURL(data.download_url_base);
								return;
							}
							if(data.download_url_app){
								var source = data.download_url_app,
									dstFile = source.substring(source.lastIndexOf('/') + 1);
								that.downLoadFile({
									srcFile:source,
									downloadFolerPath: '_doc/widgt/',
									folderPath : "widgt/",
									dstFile : dstFile,
									success : function(op, isExist, d) {
										if(isExist){
											 plus.downloader.enumerate(function(downloads){
												 var len = downloads.length, index = 0;
												 for(; index < len; index++){
													 var download = downloads[index];
													 // alert('download:'+JSON.stringify(download));
													 if(download.filename == '_doc/widgt/' + dstFile){
														 //alert('download:'+JSON.stringify(download));
														 download.addEventListener('statechanged', function(_d, status){
															 if (download.state == 4 && status == 200){
																 //alert('statechanged:' + status);
																 L.setItem(that.cacheKey.widgtPath, _d.filename);
															 }
														 });
														 download.start();
														 return;
													 }
												 }
												 //删除非正常下载的安装包文件
												 plus.io.requestFileSystem( plus.io.PRIVATE_DOCUMENTS, function( fs ) {
													fs.root.getDirectory( "widgt", {create: false}, function ( entry ) {
														entry.removeRecursively(function(){
														});
													});
												}); 
											 });
										}
										else{
											L.setItem(that.cacheKey.widgtPath, d.filename);
										}
									}
								});
							}
							//alert('getProperty:' + JSON.stringify(data));
							//that.downLoadWgidt();
						},
						error : function(xhr, type) {
							//alert('checkUpdate:' + type);
						}
					});
				});
			}
		},
		addDock: function(){
			var ui = plus.ui,
				that = this,
				nav = ui.createView('Navigator',{position:'dock',dock:'top'}),
				path,
				width = window.innerWidth;
			if(width < 320) path = '240';
			else if(width < 480)  path = '320';
			else if(width < 720)  path = '480';
			else path = '720';
			//设置左边图标文字
			nav.setLeft({icon:'_www/img/' + path + '/menu.png',content:'菜单'});
			//设置右边图标文字
			if(that.noImage)
				nav.setRight([{icon:'_www/img/' + path + '/text.png'},{icon:'_www/img/' + path + '/image.png'}]);
			else nav.setRight([{icon:'_www/img/' + path + '/image.png'},{icon:'_www/img/' + path + '/text.png'}]);

			nav.setTitleText('最新资讯');

			//添加导航控件监听
			nav.addNavigationListener(function(type){
			  //回来的为点击的哪
			  switch(type){
					case 'left':
					  that.showMenu();
						break;
					case 'right':
					   var noImage = that.noImage;
					   that.ImageFlag = true;
					   that.noImage = !noImage;
					   plus.statistic.eventTrig("imgmode",that.noImage);
					   setTimeout(function(){
						   if(noImage) dh.alert("已切换到有图模式");
						   else dh.alert("已切换到无图模式");
					   }, 10)
					   
					   break;
			  }
			});
			that.nav = nav;

			//将控件添加到window上
			ui.getSelfWindow().append(nav);
		},
		hidePullToRefresh: function(){
			var that = this;
			if(that.isPullRefresh){
				that.isPullRefresh = false;
				plus.ui.getSelfWindow().endPullToRefresh();
			}
		},
		/// <summary>
        ///
        /// </summary>
        /// <param name="url">url地址</param>
		/// <param name="pageName">窗口id</param>
		goNextpage: function(url, pageName){
			var win = plus.ui.createWindow(url, {name: pageName, left:'0%',top:'0',width:'100%',height:'100%'} );
			win.show('slide-in-left');
			return;
			win.addEventListener('loaded',function(){
				win.show('slide-in-left');
			},false);
		},

		
		handleEvent: function(e){
			try{
				var that = this,
					t = e.target;
				switch(e.type){
					case "scroll":
						that.scroll(e);
						break;
					case "resume":
						that.onResume();
						break;
					case "pause":
						that.onPause();
						break;
					case "netchange":
						//that.onNetChange();
						that.onResume();
						break;
					case "touchstart":
						
						console.log(e.type);
						if(that.installing){
							e.preventDefault();
							return false;
						}
						//that._unbind('scroll', window);
						//if(that.showingConfirm) return;
						if(that.isShowingMenu) {
							e.stopPropagation();
							that.showMenu();
							return false;
						}
						if(that.isShowingNoImg){
							if(!that.hasNetwork()){
								dh.alert("网络不给力");
								return false;
							}
							that.isShowingNoImg = false;
							that.loadData(that.categoryId, 1);
						}
						that.touchmoved = false;
						
						that._bind('touchend', document);
						//that._bind('touchcancel', document);
						that._bind('touchmove', document);
						return false;
						break;
					case "touchmove":
						that.touchmoved = true;
						//that._bind('scroll', window);
						break;
					case "touchcancel":
					case "touchend":

						//that._bind('scroll', window);
						//that.scroll(e);
						that._unbind('touchend', document);
						//that._unbind('touchcancel', document);
						that._unbind('touchmove', document);

						if(!that.touchmoved && t){//到详情页面
							that.goShowPage(t.getAttribute('articleid') ||
											t.parentNode.getAttribute('articleid') ||
											t.parentNode.parentNode.getAttribute('articleid'));
						}
						else that.touchmoved = false;

						break;
				}
				t = null;
			}
			catch(ex){
				this.showErr(ex);
			}
		},
		scroll: function(e){
			var that = this,
				w = window,
				pageYOffset = w.pageYOffset;
			if(that.pageNum == 4) return;
			var diffY = that._scrollY - pageYOffset;
			that._scrollY = pageYOffset;

			if(diffY < 0 && w.pageYOffset + w.innerHeight + 60 >= that.scrollHeight && !that.isLoading){
				if(that.loadDataTimer) clearTimeout(that.loadDataTimer);
				that.loadDataTimer = setTimeout(function(){
					that.loadData(that.categoryId, that.pageNum + 1);
				}, 50);
			}
			else{
				that.checkLazyLoad("#container img[lazyload]", pageYOffset);
			}
		},
		/// <summary>
        /// 程序从后台恢复到前台事件
        /// </summary>
		onResume: function(){
			console.log('onResume');
			var that = this;
			that.resumeTime = new Date().getTime();
			if(that.hasError){
				that.hasError = false;
				if(!that.hasNetwork()){
					that.hasError = true;
					//alert("没有网络");
					dh.alert("请连接网络后重试",2000);
					return;
				}
				
				if(that.ajax) that.ajax.abort();
				that.ajax = that.loadCategoryByPageNetwork(that.categoryId, that.loaddingPageNum, 0, 
						function(networkData){
							if(networkData){
								that.showData(networkData, that.categoryId, that.loaddingPageNum);
							}
							else dh.alert("未能从网络请求到数据。");
						}, 
						function(xhr, type){
							if(type == 'abort') return;
							that.hasError = true;
							dh.alert("网络不给力");
						});
			}
			//that.isPause = false;
		},
		/// <summary>
        /// 程序从前台恢复到后台事件
        /// </summary>
		onPause: function(){
			console.log('onPause');
			//var that = this;
			this.isPause = true;
			//plus.console.log("onPause");
		},
		/// <summary>
        /// 网络状态改变
        /// </summary>
		onNetChange: function(){
			console.log('onNetChange');
			this.isNetChange = true;
		},

		/// <summary>
        /// 最新资讯的第一天新闻特殊显示
        /// </summary>
		getAndroidFirstNews: function(d){
			//if(this.noImage) return this.getDivForNoImg(d);
			var doc = document,
				div = doc.createElement("div"),
				img = doc.createElement("img"),
				div2 = doc.createElement("div"),
				width = window.innerWidth - 20,
				height = width*0.6;
				//height = 360/600.0 * (window.innerWidth - 20);
			
			try{
				div.setAttribute("articleid", d.id);
                div.setAttribute("remark", d.remark);
				if(d.readflag) div.setAttribute("class", "androidfirstnew readed");
				else div.setAttribute("class", "androidfirstnew");

				var imgPath = d.img,
                    index = imgPath.indexOf('localhost');
                    if(imgPath && index < 0){
                        img.setAttribute("lazyload", imgPath);
                        img.setAttribute("articleid", d.id);
                        img.src = "app/img/ios-default1.png";
                    }
                    else if(this.noImage && imgPath && index >= 0){
                        img.setAttribute("local", '1');
                        img.setAttribute("lazyload", imgPath);
                        img.setAttribute("articleid", d.id);
                        img.src = "app/img/ios-default1.png";
                    }else{
                        img.src = imgPath || "app/img/ios-default1.png";
                    }
				img.style.cssText = "width:" + width + "px; height:" + height + "px";
				div.appendChild(img);
				div2.innerHTML = "<h2>" + d.title + "</h2>";
				div.appendChild(div2);
				return div;
			}
			catch(ex){
				this.showErr(ex);
			}
			finally{
				doc = null;
				div = null;
				img = null;
				div2 = null;
			}
		},
		getDivForAndriod: function(d){
			var that = this;
			//if(that.noImage) return that.getDivForNoImg(d);
			var doc = document,
				div = doc.createElement("div"),
				img = doc.createElement("img"),
				span = doc.createElement("span"),
				h2 = doc.createElement("h2"),
				p = doc.createElement("p"),
				img = doc.createElement("img"),
				className = "andrid",
				time = d.ptime.toDate("yyyy-MM-dd HH:mm").toString("MM-dd HH:mm");
			try{
				div.setAttribute("articleid", d.id);
                div.setAttribute("remark", d.remark);
				if(d.readflag) className += " readed";
				div.setAttribute("class", className);

				h2.innerHTML = d.title;
				p.setAttribute("class", "info");
				//p.innerHTML = '<span class="icon clock"></span><span class="ptime">' + time + '</span><span>&nbsp;&nbsp;</span><span class="icon eye"></span><span class="ptime">' + parseInt(d.count, 10) + '</span>';
				p.innerHTML = '<span class="icon clock"></span><span class="ptime">' + time + '</span><span>&nbsp;&nbsp;</span>';

                var androidimg = d.androidimg,
                    index = androidimg.indexOf('?');
                if(androidimg && androidimg.indexOf('localhost') < 0){
                    if(index > 0) androidimg = androidimg.substring(0, index);
                    img.setAttribute("lazyload", androidimg + '?width=180&height=120');
                    img.src = "app/img/logo.png";
                    img.setAttribute("articleid", d.id);
                } else if(this.noImage && androidimg && androidimg.indexOf('localhost') >= 0){
                    img.setAttribute("local", '1');
                    img.setAttribute("lazyload", androidimg);
                    img.setAttribute("articleid", d.id);
                    img.src = "app/img/logo.png";
                }else{
                    img.src = androidimg || "app/img/logo.png";
                }
                //img.setAttribute("class", "androidimg");
                div.appendChild(img);

				span.appendChild(h2);
				span.appendChild(p);
				span.setAttribute("articleid", d.id);
				span.style.width = window.innerWidth - 125 + "px";
				div.appendChild(img);
				div.appendChild(span);
				
				return div;
			}
			catch(ex){
				this.showErr(ex);
			}
			finally{
				doc = null;
				div = null;
				img = null;
				span = null;
				h2 = null;
				p = null;
				img = null;
			}
		},
		/**
		 * @作者：
		 * @时间：2013/04/15 10:40:45
		 * @param lazyPath:css path
		 * @param  top:
		 * @描述：延迟加载图片 
		 */
		checkLazyLoad: function(lazyPath, top){
			var that = this;
			if(that.noImage) return;
			if(that.lazyTimeout) clearTimeout(that.lazyTimeout);
			that.lazyTimeout = setTimeout(function(){
				try{
					var doc = document,
						lazyObjs = doc.querySelectorAll(lazyPath),
						len = lazyObjs.length,
						index = 0,
						winheight = window.innerHeight * 2;
					if(len <= 0) return;
					for(; index < len; index++){
						var obj = lazyObjs[index],
							_top = obj.offsetTop - top;

						if(_top >= 0 && _top < winheight){
							var srcImg = obj.getAttribute("lazyload"),
                                local = obj.getAttribute('local');
							obj.removeAttribute("lazyload");
                            if(local == '1'){
                                obj.src = srcImg;
                            }else{
                                that.downLoadImg(srcImg, obj.getAttribute("articleid"));
                            }
						}
						obj = null;
					}
					lazyObjs = null;
				}
				catch(ex){
					that.showErr(ex);
				}
			}, 600);
		},
		/**
		 * @作者：
		 * @时间：2013/04/15 10:42:15
		 * @param articleid:
		 * @描述： 显示详情页面
		 */
		goShowPage: function(articleid){
			try{
				if(!articleid) return;
				var that = this,
					divs = document.querySelectorAll("div[articleid='" + articleid + "']"),
					div0 = divs[0],
					div1 = divs[1],
                    remark = div0.getAttribute("remark");
				div0.className = div0.className + ' readed';//设置已读标志
				div0 = null;
				if(div1) {
					div1.className = div1.className + ' readed';
					div1 = null;
				}
				divs = null;

				L.setItem(that.cacheKey.articleId, articleid);
				L.setItem(that.cacheKey.noImage, that.noImage);
				var win = plus.ui.findWindowByName("ShowWin");
				win.setOption({left:"0", transition:{duration:0}});
				win.setVisible(true);
				win.evalJS("page.loadFile('"+ articleid +"', '"+ remark + "');");
			}
			catch(ex){
				this.showErr(ex);
			}
		},
		/**
		 * @作者：
		 * @时间：2013/04/15 10:42:39
		 * @param pageIndex:如果是菜单栏页面调用该方法，指示是显示列表页面第几个栏目
		 * @param  categoryid:
		 * @描述： 显示菜单页面
		 */
		showMenu: function(categoryid){
			try{
				plus.statistic.eventTrig(categoryid);
				if(this.isAnimating) return;
				var ui = plus.ui,
					that = this,
					isShowMenu = that.isShowingMenu,
					doc = document;
				if(that.installing) return;
				ui.getSelfWindow().setOption({left: isShowMenu ? '0' : '70%', transition:{duration:300}});
				that.isAnimating = true;
				setTimeout(function(){
					that.isAnimating = false;
				}, 300);
				that.isShowingMenu = !isShowMenu;
				//回调menu win
				if(categoryid && categoryid != that.categoryId) {
					ui.getSelfWindow().setPullToRefresh({support: false});
					that.categoryId = categoryid;
					var d = {'news': '最新资讯', 'industry': '业界', 'cloud': '云计算', 'mobile': '移动开发', 'sd': '软件研发'};
					that.nav.setTitleText(d[categoryid]);
					var container = doc.getElementById('container');
					doc.getElementById('pullUp').style.display = 'none';
					container.className = '';
					container.innerHTML = '<div class="index-loadding"><div></div><div></div></div>';
					window.scrollTo(0, 0);
					//that.loadData(categoryid, 1);
					that.hidePullToRefresh();
					that.loadFirstPageData(categoryid);
				}
				else{
					ui.getSelfWindow().setPullToRefresh({support: isShowMenu});
				}
				ui = null;
			}
			catch(ex){
				this.showErr(ex);
			}
		},
		showData: function(data, categoryid, pageNum, isFromDb){
			try{
				var that = this,
					doc = document,
					container = doc.getElementById("container"),
					list = data.list,
					fragment = doc.createDocumentFragment(),
                    firstnewid,
                    index = 0,
					firstnews = data.firstnews,
					pullUp = doc.getElementById('pullUp');
				if(categoryid != that.categoryId) return;
                if(firstnews){
                    fragment.appendChild(that.getAndroidFirstNews(firstnews));
                    firstnewid = firstnews.id;
                }
				for(i in list){
					var d = list[i];
                    if(d.id != firstnewid)
                        fragment.appendChild(that.getDivForAndriod(d));
					d = null;
				}

                if(pageNum == 1){
					plus.ui.getSelfWindow().setPullToRefresh({support: true});
                    container.innerHTML = "";
                    container.setAttribute("class", "container");
					that.checkLazyLoad('#container img[lazyload]', 0);
					pullUp.style.display = 'block';
					pullUp.innerHTML = '数据加载中，请稍候...';
					plus.ui.closeSplashscreen();//关闭启动页图片
					that.hidePullToRefresh();
                }
				else if(pageNum == 4){
					pullUp.innerHTML = '没有更早的资讯了';
				}
				if(!that.hasCheckInstall){
					setTimeout(function(){
						that.checkInstall();
					}, 10)
					
					that.hasCheckInstall = true;
				}
                container.appendChild(fragment);
				that.scrollHeight = doc.body.scrollHeight;
                fragment = null;

                /*if(categoryid == 'news' && !isFromDb) that.pageNum = (pageNum-1) * 4 + 1;
                else */that.pageNum = pageNum;

				container = null;
				list = null;

			}
			catch(ex){
				this.showErr(ex);
			}
		},
		downLoadImg: function(srcImg, articleid){
			var that = this,
				dstImg = srcImg.substring(srcImg.lastIndexOf('/') + 1);
            //if(articleid == 2814859) alert("2814859>>>"+srcImg);
			that.downLoadFile({
				srcFile: srcImg,
				dstFile: dstImg,
				folderPath: "img/",
				downloadFolerPath: "_doc/img/",
				articleId: articleid,
				success: function(op, isExist, file){
					try{
						var _articleid = op.articleId,
							imgs = document.querySelectorAll("img[articleid='" + _articleid + "']"),
							img0 = imgs[0],
                            img1 = imgs[1],
							_dstImg = "http://localhost:13131/" + (file.filename || "_doc/img/" + file.name);
                        //if(_articleid == 2814859)alert("json:" + JSON.stringify(op)+ ";;" + isExist + ",dst:" + _dstImg);
						if(!isExist){
							that.db.transaction(function(tx) {
								tx.executeSql('update article_list set androidimg=? where id=?', [_dstImg, _articleid], null);
							});
						}
						if(img0){
							img0.src = _dstImg;
							if(img1){
								img1.src = _dstImg;
								img1 = null;
							}
						}
						else if(document.querySelector(".androidfirstnew img")){
							document.querySelector(".androidfirstnew img").src = _dstImg;
						}
						
						img0 = null;
						imgs = null;
					}
					catch(ee){
						that.showErr(ee);
					}
				},
				error: function(op, status,d){
					//if(status != 404) 
					plus.console.log("index: downLoadImg fail:" + status + "," + op.srcImg)
				}
			});
		},
		/**
		 * @作者：
		 * @时间：2013/04/13 16:42:36
		 * @param catetory:
		 * @描述：加载第一页的数据 
		 */
		loadFirstPageData: function(catetory){
			try{
				var that = this,
					cacheKey = that.cacheKey,
					updateTime = L.getItem(cacheKey.updateTime + catetory),
					time = new Date().getTime();
				if(!updateTime || time - updateTime >= 1000*60*30){//30分钟更新
					that.loadData(catetory, 1);
					return;
				}
				that.loadCategoryByPageDB(catetory, 1, 0, 
						function(data){
							if(data)
								that.showData(data, catetory, 1);
							else 
								that.loadData(catetory, 1);
						},
						function (){
						});
			}
			catch(ex){
				that.showerr(ex);
			}
		},
		loadData: function(categoryid, pageNum){
			try{
				var that = this,
					doc = document;
				if(that.isLoading) return;
				
				if(!that.hasNetwork()){
					if(pageNum == 1){
						that.isShowingNoImg = true;
						doc.getElementById("container").innerHTML = '<div class="nonetworkimg"><img width="50%" src="app/img/refresh.png"/></div>';
					}
					else dh.alert("网络不给力",2000);
					//alert("to claise:" + plus.ui.closeSplashscreen)
					plus.ui.closeSplashscreen();//关闭启动页图片
					return;
				}
				that.isLoading = true;
				var startTime = new Date().getTime();
				
				if(that.ajax) that.ajax.abort();
				that.ajax = that.loadCategoryByPageNetwork(categoryid, pageNum, 0, function (data) {  //loadCategoryByPageDB,loadCategoryByPageNetwork
						try{
							that.hasError = false;
							var endTime = new Date().getTime();
							L.setItem(that.cacheKey.updateTime + categoryid, endTime);
							that.isLoading = false;
							if (data) {
								var remainTime = endTime - startTime;
								if(remainTime < 1000) remainTime = 1000 + startTime - endTime;
								//remainTime = 100000;
								setTimeout(function(){
									that.showData(data, categoryid, pageNum);
								}, remainTime);
								
							}else{
								//dh.alert("网络不给力2" + categoryid,'help',2000);
								plus.ui.closeSplashscreen();//关闭启动页图片
							}
						}
						catch(ex){
							that.showErr(ex);
						}
					}, 
					function(xhr, type){
						try{
							plus.ui.closeSplashscreen();//关闭启动页图片
							that.isLoading = false;
							//dh.alert("发生网络错误，请稍后重试:",'help',2000)
							if(type == "abort"){
								return;
							}
							else{
								if(pageNum == 1){
									that.isShowingNoImg = true;
									doc.getElementById("container").innerHTML = '<div class="nonetworkimg"><img width="50%" src="app/img/refresh.png"/></div>';
									return;
								}
								if(type == "timeout"){
									dh.alert("网络不给力",2000);
								}
							}
							
							that.hasError = true;
							that.loaddingPageNum = pageNum;
							//alert('that.hasError:' + that.hasError)
							
						}
						catch(ee){
							that.showerr(ee);
						}
					},function(data){
						return false;
						that.hidePullToRefresh();
						that.isLoading = false;
                        if(that.ImageFlag){
                            that.ImageFlag = false;
                            return false;
                        }
						var _div = doc.querySelector('#container>div[articleid]:nth-child(' + (categoryid=='news'?2:1) + ')'),
							endTime = new Date().getTime();
                        if(!_div) return false;
						if(data.list[0].id == _div.getAttribute("articleid")){
                            return true;
						}
						return false;
					});
			}
			catch(ex){
				this.showErr(ex);
			}
		}
    });

    window.ipPage = new FP();
    if(navigator.userAgent.match(/Android/i) || 
    			navigator.userAgent.match(/iPhone/i) || 
    			navigator.userAgent.match(/iPod/i) || 
    			navigator.userAgent.match(/iPad/i))
	document.addEventListener("plusready", function(){
		ipPage.OnReady();
	});
    else{ 
    	$(function () { ipPage.OnReady(); });
    }
})($.csdn);
