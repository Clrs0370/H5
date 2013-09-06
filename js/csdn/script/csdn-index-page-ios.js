(function (C) {
    if (!C.IndexPage)
        C.IndexPage = function () { }

    var FP = C.IndexPage,
		L = $.MyWidget.NLocal;

    $.extend(true, FP.prototype, C, {
		pageName: "indexpage",
		/// <summary>
        /// 每个栏目的iscroll实例
        /// </summary>
		subScroll:{
			news: null,
			industry: null,
			cloud: null,
			mobile: null,
			sd: null
		},
		/// <summary>
        /// 是否是无图模式
        /// </summary>                             
		noImage:false,
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
		/**
		 * @作者：
		 * @时间：2013/04/15 10:38:39
		 * @描述： 是否显示新手提示
		 */
		isRito: false,
		venable: true,
		henable: false,
		_isIOS: true,
        OnReady: function () {
			var that = this,
				doc = document,
				ui = plus.ui,
				cacheKey = that.cacheKey,
				tiro = cacheKey.tiro;
			try{
				//that.registerPush();
               // that.noImage = L.getItem(that.cacheKey.noImage);
				//doc.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
				dh.init();
				that._bind("resume", doc);
				//that._bind("pause", doc);
				that._bind("netchange", doc);
				that._bind('touchstart', doc);
				if(!L.getItem(tiro)){
					that.isRito = true;
					var div = doc.createElement("div");
					div.innerHTML = "<div></div>";
					div.id = "rito";
					doc.body.appendChild(div);
					that._bind("touchend", div);
					L.setItem(tiro, true);
					div = null;
				}
				
				
//				var div = doc.createElement('div');
//				div.id = 'installing';
//				back = "想如今我的身段儿自然是极好的，若再梳妆敛容，瞬息可就，定不负君恩！";
//				div.innerHTML = '<div><div class="installloading iosinstalling"></div><div class="installcontent">' + back + '</div></div>';
//				doc.body.appendChild(div);
				
				
//				if (that.is2G()) {
//					that.noImage = true;
//					L.setItem(that.cacheKey.noImage,that.noImage);
//				}else{
//					that.noImage = L.getItem(that.cacheKey.noImage);
//				};
				
				that.noImage = L.getItem(that.cacheKey.noImage);
				
				setTimeout(function(){
				try{
					that.init();
					var updateTime = L.getItem(cacheKey.updateTime),
						time = new Date().getTime();
                    
                    //!updateTime || time - updateTime >= 1000*60*30
					if(!updateTime || time - updateTime >= 1000*60*30){//30分钟更新
						that.addScroll();//添加左右滑动
						that.loadData("news", 1);
					}else{
						that.loadFirstPageData("news");
					}
					cacheKey = null;
					}
				catch(ee){
					that.showErr(ee);
				}
				}, 1);
				var showWin = ui.createWindow('app/show.html',{name:'ShowWin', zindex:1});
				showWin.show();
				showWin.setVisible(false);

				// that.noImage = L.getItem(that.cacheKey.noImage);
				var imgs_a = document.querySelectorAll('#container [data-icon="img0"]'),
                    len = imgs_a.length,
                    index = 0,
                    className;
                if(that.noImage){
                    className = "icon A0";
                }else{
                    className = "icon img0";
                }
                for(; index<len; index++){
                    var img = imgs_a[index];
                    img.childNodes[0].className = className;
					img = null;
                }
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
				that.setSubScrollStatus(false);
				that.setScrollStatus(false);
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
				var start = new Date().getTime();
				plus.runtime.install(widgitPath,{force:true}, function(widgetInfo){
					//alert('installed:' + widgetInfo);
					//L.setItem(that.cacheKey.widgtPath, '');
					L.remove(that.cacheKey.widgtPath);
					that.installing = false;
					var time = new Date().getTime() - start;
					if(time < 5000) time = 5000;
					setTimeout(function(){
						plus.io.requestFileSystem( plus.io.PRIVATE_DOCUMENTS, function( fs ) {
							fs.root.getDirectory( "widgt", {create: false}, function ( entry ) {
								entry.removeRecursively(function(){
									doc.getElementById('installing').style.display = 'none';
									plus.runtime.restart();
								});

							});
						});
					}, time);
					//
					//alert('plus.runtime.restart();');
					
				}, function(error){
					//alert('faile:' + error);
					//L.setItem(that.cacheKey.widgtPath, '');
					L.remove(that.cacheKey.widgtPath);
					that.setSubScrollStatus(true);
					that.setScrollStatus(true);
					that.installing = false;
					doc.getElementById('installing').style.display = 'none';
					plus.io.requestFileSystem( plus.io.PRIVATE_DOCUMENTS, function( fs ) {
						fs.root.getDirectory( "widgt", {create: false}, function ( entry ) {
							entry.removeRecursively(function(){
								doc.getElementById('installing').style.display = 'none';
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
						url: that.UpdateURL + '?appversion=' + widgetInfo.version + '&version=' + plus.runtime.version + '&innerversion=1.0&type=ios',
						dataType : 'jsonp',
						success : function(data) {
							if(data.download_url_base){
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
													 if(download.filename == '_doc/widgt/' + dstFile){
														// alert('download:'+JSON.stringify(download));
														 download.addEventListener('statechanged', function(_d, status){
															 if (download.state == 4 && status == 200){
																// alert('statechanged:' + status);
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
		/**
		 * @作者：
		 * @时间：2013/04/13 16:42:36
		 * @param catetory:
		 * @描述：加载第一页的数据 
		 */
		loadFirstPageData: function(catetory){
			var that = this;
			that.loadCategoryByPageDB(catetory, 1, 0, 
					function(data){
						that.addScroll();//添加左右滑动
						if(data) {
							that.showData(data, catetory, 1);
							return;
						}
						that.loadData(catetory, 1);
					},
					function (){
					});
		},
		handleEvent: function(e){
			try{
				var that = this,
					t = e.target;
				switch(e.type){
					case "resume":
						that.onResume();
						return;
					case "pause":
						that.onPause();
						return;
					case "netchange":
						//that.onNetChange();
						that.onResume();
						return;
					case "touchstart":
						if(that.installing) return;
						var id = t.id || t.parentNode.id;
                        if(that.isShowingMenu || id == 'menu') {
							e.stopPropagation();
							that.showMenu();
						}
						else if(id == 'imgflag'){
							that.changeImgFlag();
						}
						return;
					case "touchend":
						if((t.id || t.parentNode.id) == "rito"){//触摸新手提示
							that.isRito = false; 
							if(t.id != "rito") t = t.parentNode;
							that.hideRito(t);
							return;
						}
						//if(that.isShowingMenu){
						//	that.showMenu();
						//}
						return;
					case "click":
						if(t.tagName == "IMG" && t.hasAttribute("category")){
							if(!that.hasNetwork()){
								dh.alert("网络不给力");
								return;
							}
							that._unbind("click", t.parentNode);
							that.loadData(t.getAttribute("category"), 1);
						}
				}
				t = null;
			}
			catch(ex){
				this.showErr(ex);
			}
		},
        changeImgFlag: function(){
            var imgs_a = document.querySelectorAll('#container [data-icon="img0"]'),
                len = imgs_a.length,
                index = 0,
                that = this,
                className;
            if(that.noImage){
                that.noImage = false;
                className = "icon img0";
				dh.alert("已切换到有图模式");
            }else{
                that.noImage = true;
                className = "icon A0";
				dh.alert("已切换到无图模式");
            }
            that['newsImageFlag'] = true;
            that['industryImageFlag'] = true;
            that['cloudImageFlag'] = true;
            that['mobileImageFlag'] = true;
            that['sdImageFlag'] = true;

            for(; index<len; index++){
                var img = imgs_a[index];
                img.childNodes[0].className = className;
            }
            setTimeout(function(){
                L.setItem(that.cacheKey.noImage,that.noImage);
            },0)

        },
		hideRito: function(t){
			if(!t) t = document.getElementById("rito");
			this._unbind("touchend", t);
			$(t).remove();
		},
		/// <summary>
        /// 程序从后台恢复到前台事件
        /// </summary>
		onResume: function(){
			var that = this;
			that.resumeTime = new Date().getTime();
			if(that.hasError){
				that.hasError = false;
				if(!that.hasNetwork()){
					that.hasError = true;
					dh.alert("网络不给力",2000);
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
			//var that = this;
			this.isPause = true;
			//plus.console.log("onPause");
		},
		/// <summary>
        /// 网络状态改变
        /// </summary>
		onNetChange: function(){
			this.isNetChange = true;
		},
		getDivForNoImg: function(d){
			var doc = document,
				div = doc.createElement("div"),
				h2 = doc.createElement("h2"),
				p = doc.createElement("p"),
				img = doc.createElement("img"),
				className = "ios",
				time = d.ptime.toDate("yyyy-MM-dd HH:mm").toString("MM-dd HH:mm"),
				width = window.innerWidth - 20;
			try{
				div.setAttribute("articleid", d.id);
                div.setAttribute("remark", d.remark);
				if(d.readflag) className += " readed";
				div.setAttribute("class", className);
				h2.innerHTML = d.title;
				p.setAttribute("class", "info");
				//p.innerHTML = '<span class="icon clock"></span><span class="ptime">' + time + '</span><span>&nbsp;&nbsp;</span><span class="icon eye"></span><span class="ptime">' + parseInt(d.count, 10) + '</span>';
				p.innerHTML = '<span class="icon clock"></span><span class="ptime">' + time + '</span><span>&nbsp;&nbsp;</span>';
				div.appendChild(h2);
				div.appendChild(p);

				return div;
			}
			catch(ex){
				this.showErr(ex);
			}
			finally{
				doc = null;
				h2 = null;
				p = null;
				img = null;
				div = null;
			}
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
//                        img.src = imgPath || "app/img/ios-default1.png";
                        img.src = "app/img/ios-default1.png";
                    }
                    else if(this.noImage && imgPath && index >= 0){
                        img.setAttribute("local", '1');
                        img.setAttribute("lazyload", imgPath);
                        img.setAttribute("articleid", d.id);
//                        img.src = imgPath || "app/img/ios-default1.png";
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
//                    img.src = androidimg || "app/img/logo.png";
                    img.setAttribute("articleid", d.id);
                } else if(this.noImage && androidimg && androidimg.indexOf('localhost') >= 0){
                    img.setAttribute("local", '1');
                    img.setAttribute("lazyload", androidimg);
                    img.setAttribute("articleid", d.id);
                    img.src = "app/img/logo.png";
//                    img.src = androidimg || "app/img/logo.png";
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
		setSubScrollStatus: function(status){
			var subScroll = this.subScroll;
			for(i in subScroll){
				var _scroll = subScroll[i];
				if(!_scroll) continue;
				if(status) _scroll.enable();
				else{
					_scroll.disable();
					_scroll["vScrollbarIndicator"].style.display = "none";
				}
				_scroll = null;
			}
			subScroll = null;
		},
		setStatus: function(status, scroll){
			if(!scroll) return;
			if(status) scroll.enable();
			else{
				scroll.disable();
				scroll["vScrollbarIndicator"].style.display = "none";
			}
		},
		setScrollStatus: function(status){
			if(status) this.scroll.enable();
			else this.scroll.disable();  
			//plus.console.log("setScrollStatus:" + this.scroll.enabled + "," + status);
		},
		/**
		 * @作者：
		 * @时间：2013/04/15 10:40:00
		 * @描述：绑定横向滚动条 
		 */
		addScroll: function(){
			var that = this,
				categories = ["news", "industry", "cloud", "mobile", "sd"],
				width = window.innerWidth;
			if(that.scroll) return;
			that.scroll = new iScroll('wrapper', {
				snap: true,
				snapThreshold: width/4,
				momentum: false,
				vScroll: false,
				hScrollbar: false,
				vScrollbar: false,
				onScrollMove: function () {
					var henable = that.henable,
						_this = this;
					if(henable){
						 if(Math.abs(_this.distX)>Math.abs(_this.distY)){	//如果是左右划就锁定下拉的滑动
							that.setSubScrollStatus(!henable);
							//that.setStatus(!henable, that.subScroll[that.categoryId]);
						}
						that.henable=!henable;
					}
				},
				onScrollEnd: function () {
					//解锁已经禁掉上下滑动
					var _this = this,
						henable = that.henable,
						category = categories[_this.currPageX],
						x = _this.x;
					that.categoryId = category;
					plus.statistic.eventTrig(that.categoryid);
					//that.setStatus(!henable, that.subScroll[that.categoryId]);
					that.setSubScrollStatus(!henable);
					that.henable = !henable;
					that.subScrollMoved = false;

					if(!that.subScroll[category]){
						that.loadData(category, 1);
					}
					if(Math.abs(x)%width != 0 || _this.distX){
						_this.scroller.style["-webkit-transform"] = 'translate(-' + _this.currPageX * width + 'px,' + 0 + 'px)';
					}
				}
			 });
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
							_top = obj.offsetTop + top,
							offsetHeight = obj.offsetHeight;
						if(_top + offsetHeight > 0 && _top < winheight){
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
		 * @时间：2013/04/15 10:41:32
		 * @param categoryid:
		 * @描述：添加横向指定栏目的竖向滚动条
		 */
		addSubScroll: function(categoryid){
			var that = this,
				width = window.innerHeight - 44,
				scroll = that.subScroll[categoryid] = new iScroll(categoryid + 'page',{
				categoryid: categoryid,
				topOffset:60,
				pageNum: 1,
				hScroll: false,
				hScrollbar: false,
				checkDOMChanges: false,
				getVScroll: function(){
					return true;
				},
				getVScrollbar: function(){
					return true;
				},
				onInit: function(){
					var _this = this,
						pullDown = _this.pullDown = document.querySelector("#" + _this.options.categoryid + ">.pullDown"),
						pullUp = _this.pullUp = document.querySelector("#" + _this.options.categoryid + ">.pullUp");
					_this.pullDownLabel = pullDown.getElementsByClassName("pullDownLabel")[0];
					_this.pullUpLabel = pullUp.getElementsByClassName("pullUpLabel")[0];
					pullDown.style.display = "none";
					pullUp.style.display = "block";
					_this.wrapper.style.position = "relative";
					_this.wrapper.style.height = width + "px";
					//_this.minScrollY = -60;
					//_this.scroller.style["-webkit-transform"] = 'translate(0px,-60px)';
				},
				onScrollMove: function(e){
					try{
						e.preventDefault();
						var _this = this,
							y = _this.y,
							venable = that.venable;
						_this["vScrollbarIndicator"].style.display = "block";
						that.subScrollMoved = true;
						_this.hasCancel = false;
  						if(y > 0){
  							if(y > 20 || _this.pullDownRefresh){
  								_this.pullDownRefresh = true;
  								_this.pullDownLabel.innerHTML = "松开即可刷新...";
  								//_this.pullDown.style.display = "block";
  								_this.scrollerH = _this.scroller.offsetHeight;
  								_this.minScrollY = 0;
  							}
  						}
					}
					catch(ex){
						that.showErr(ex);
					}
				},
				onScrollEnd: function(){
                    var _this = this;
                    if(!that.noImage) that.checkLazyLoad("#" + this.options.categoryid + "container img[lazyload]", this.y);
					this["vScrollbarIndicator"].style.display = "none";

                    if(!this.refreshing && Math.abs(this.y) + _this.wrapperH + 60>= this.scrollerH){
                        if(_this.options.pageNum == 4) {
							_this.pullUpLabel.innerHTML = "没有更早的资讯了";
                             _this.pullUp.style.display = "block";
                            return;
                        }else{
                            _this.pullUp.style.display = "block";
                        }
                        //else _this.scrollerH = m.round(_this.scroller.offsetHeight + _this.minScrollY);
                        this.refreshing = true;
                        //var num = this.options.pageNum + 1;
                        //this.options.pageNum = num;
                        //alert("onTouchEnd" + num);
                        that.loadData(categoryid, this.options.pageNum + 1);
                        
                        
                    }
				},
				onTouchCancel: function(e){
					this.hasCancel = true;
				},
				onTouchEnd: function(e){
					try{
						var _this = this,
							venable = that.venable,
							categoryid = that.categoryId =  _this.options.categoryid;
						//that.setScrollStatus(!venable);
						that.venable = !venable;
  						if(_this.pullDownRefresh){
  							_this.pullDownLabel.innerHTML = "正在加载资讯...";
  							//_this.options.pageNum = 1;

  							that.loadData(categoryid, 1, true);
  							_this.pullDownRefresh = false;
  						}

						if(!that.subScrollMoved && !that.isShowingMenu && !that.scrollMoved && !_this.hasCancel){
							var t = e.target;
							if(t.tagName == "HTML") return;
							
							var articleid = t.getAttribute("articleid") ||
									t.parentNode.getAttribute("articleid") ||
									t.parentNode.parentNode.getAttribute("articleid");
							if(articleid)
								that.goShowPage(articleid);
							t = null;
						}
						that.subScrollMoved = false;
					}
					catch(ex){
						that.showErr(ex);
					}
				}
			});
			scroll.scrollTo(0, 0, 0);

			scroll.refresh();
			scroll = null;
		},
		/**
		 * @作者：
		 * @时间：2013/04/15 10:42:15
		 * @param articleid:
		 * @描述： 显示详情页面
		 */
		goShowPage: function(articleid){
			try{
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
		showMenu: function(pageIndex, categoryid){
			try{
				plus.statistic.eventTrig(categoryid);
				if(this.isAnimating) return;
				var ui = plus.ui,
					that = this,
					isShowMenu = that.isShowingMenu,
					doc = document;
				ui.getSelfWindow().setOption({left: isShowMenu ? '0' : '70%', transition:{duration:300}});
				that.isAnimating = true;
				setTimeout(function(){
					that.isAnimating = false;
				}, 300);

				that.isShowingMenu = !isShowMenu;
				//回调menu win
				
				if(categoryid) {
					that.categoryId = categoryid;
				}
				if(!isShowMenu){
					ui.findWindowByName('B8B4BD').evalJS("page.changeMenu.call(page,'"+ that.categoryId +"');");
					//that.setStatus(false, that.subScroll[that.categoryId]);
					that.setSubScrollStatus(false);
					that.setScrollStatus(false);
				}
				else if(isShowMenu){
					//that.setStatus(true, that.subScroll[that.categoryId]);
					that.setSubScrollStatus(true);
					that.setScrollStatus(true);
				}
				if(pageIndex){
					that.scroll._pos.call(that.scroll, (1 - pageIndex)* window.innerWidth, 0);
					that.scroll.currPageX = pageIndex - 1;
					if(!that.subScroll[categoryid]) that.loadData(categoryid, 1);
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
					container = doc.getElementById(categoryid + "container"),
					list = data.list,
					scroll = that.subScroll[categoryid],
					fragment = doc.createDocumentFragment(),
					firstnewid;
					plus.statistic.eventTrig("imgmode",that.noImage?"true":"false");
                var firstnews = data.firstnews;
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
                    container.innerHTML = "";
                    container.setAttribute("class", "container");
                }
                container.appendChild(fragment);
                fragment = null;
				if(pageNum == 1 && !that.noImage) that.checkLazyLoad("#" + categoryid + "container img[lazyload]", 0);
				if(scroll){
					scroll.pullUpRefresh = false;
                    //scroll.pullUpLabel.innerHTML = "上拉载入更多";
					scroll.refreshing = false;
					//scroll.minScrollY = -60;
					scroll.options.pageNum = pageNum;
					scroll.refresh();
					
					scroll = null;
				}
				else{
					//绑定到菜单窗口的事件
					that.addSubScroll(categoryid);
					if(categoryid == "news"){
						plus.ui.closeSplashscreen();//关闭启动页图片
					}
				}
				if(!that.hasCheckInstall){
					setTimeout(function(){
						that.checkInstall();
					}, 10);
					
					that.hasCheckInstall = true;
				}
				if(pageNum == 1){
					var _scroll = that.subScroll[categoryid];
					_scroll.pullDown.style.display = "block";
  					_scroll.pullUpLabel.innerHTML = "正在加载资讯...";
  					_scroll.scroller.style["-webkit-transform"] = 'translate(0px,-60px)';
				}
               /* if(categoryid == 'news' && !isFromDb) that.subScroll[categoryid].options.pageNum = (pageNum-1) * 4 + 1;
                else*/
               
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
						else document.querySelector(".androidfirstnew img").src = _dstImg;
						
						img0 = null;
						imgs = null;
					}
					catch(ee){
						that.showErr(ee);
					}
				},
				error: function(op, status, d){
					//if(status != 404) 
					plus.console.log("index: downLoadImg fail:" + status + "," + op.srcImg)
				}
			});
		},
		loadDataFromDB: function(categoryid, pageNum){
			var that = this,
				startTime = new Date().getTime();
			that.loadCategoryByPageDB(categoryid, pageNum, 0, function (data) {//loadCategoryByPageDB,loadCategoryByPageNetwork
					if (data) {
						var endTime = new Date().getTime(),
							remainTime = endTime - startTime;
							if(remainTime < 1000) remainTime = 1000 + startTime - endTime;
							setTimeout(function(){
								that.showData(data, categoryid, pageNum, true);
						 		plus.ui.closeSplashscreen();//关闭启动页图片
							}, remainTime);
						 
					}
				});
		},
		loadData: function(categoryid, pageNum, t){
			try{
				
				var that = this,
					doc = document;
				if(!that.hasNetwork()){
					if(!that.subScroll[categoryid]){
						var _container = doc.getElementById(categoryid + "container");
						_container.innerHTML = '<div class="nonetworkimg"><img category="' + categoryid + '" width="50%" src="app/img/refresh.png"/></div>';
						that._bind("click", _container);
						_container = null;
					}
					else dh.alert("网络不给力",'help',2000);
					plus.ui.closeSplashscreen();//关闭启动页图片
					return;
				}
//				if(categoryid == "news" && (pageNum-1) % 4 != 0){//网络加载最新资讯，一次回来40条，可以显示四屏，所以每4屏请求一次网络数据
//					that.loadDataFromDB(categoryid, pageNum);
//					return;
//				}
//                else if(categoryid == "news"){
//                    //alert("计算前pageNum>>"+pageNum)
//                    pageNum = (pageNum - 1)/4 + 1;
//                    //alert("pageNum>>"+pageNum)
//                }
				var startTime = new Date().getTime();
				that.loadCategoryByPageNetwork(categoryid, pageNum, 0, function (data) {  //loadCategoryByPageDB,loadCategoryByPageNetwork
						try{
							that.hasError = false;
							var scroll = that.subScroll[categoryid],
								endTime = new Date().getTime();
							if(scroll){
								scroll.isLoading = false;
								scroll = null;
							}
							if (data) {
								L.setItem(that.cacheKey.updateTime, new Date().getTime());
								var remainTime = endTime - startTime
								if(remainTime < 1000) remainTime = 1000 + startTime - endTime;
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
						var scroll = that.subScroll[categoryid];
						try{
							if(scroll) scroll.isLoading = false;
							 
							//dh.alert("发生网络错误，请稍后重试:",'help',2000)
							if(type == "abort"){
								return;
							}
							else if(type == "timeout"){
								if(scroll && scroll.pullUpRefresh) {
									scroll.pullUpRefresh = false;
								}
								else if(scroll && scroll.pullDownRefresh) {
									scroll.pullDownRefresh = false;
								}
								dh.alert("网络不给力",2000);
								scroll = null;
							}
							//if(that.isPause && that.isNetChange)
							if(type == 'timeout' && !scroll){
								var _container = doc.getElementById(categoryid + "container");
								_container.innerHTML = '<div class="nonetworkimg"><img category="' + categoryid + '" width="50%" src="app/img/refresh.png"/></div>';
								that._bind("click", _container);
								_container = null;
							}
							else{
								that.hasError = true;
								that.loaddingPageNum = pageNum;
							}

							plus.ui.closeSplashscreen();//关闭启动页图片
						}
						catch(ee){
							that.showerr(ee);
						}
						finally{
							scroll = null;
						}
					}, function(data){
						try{
							
                        if(that[categoryid + 'ImageFlag']){
                            that[categoryid + 'ImageFlag'] = false;
                            return false;
                        }
						var _div = doc.querySelector('#' + categoryid + 'container>div[articleid]:nth-child(' + (categoryid=='news'?2:1) + ')'),
							endTime = new Date().getTime();
						if(!_div) return false;
                        var scroll = that.subScroll[categoryid];
						if(scroll){
							setTimeout(function(){
								//scroll.minScrollY = -60;
								//scroll._resetPos(400);
								scroll.scrollTo(0, -60, 400);
								scroll.refresh();
							},500);
							setTimeout(function(){
								scroll.pullDownLabel.innerHTML = "下拉可以刷新...";
							},700);
						}
						if(data.list[0].id == _div.getAttribute("articleid")){
                            _div = null;
                            var remainTime = endTime - startTime, _categoryid = categoryid;
                            that.categoryId = _categoryid;
                            if(remainTime < 1000) remainTime = 1000 + startTime - endTime;
                            setTimeout(function(){
                                var scroll = that.subScroll[_categoryid];
                                //scroll.pullDown.style.display = "none";
                                scroll.refreshing = false;
                                scroll = null;
                            },remainTime);
                            return true;
						}
						return false;
						}
						catch(ex){
							that.showErr(ex);
						}
					});
			}
			catch(ex){
				this.showErr(ex);
			}
		},
		push: function(json){
			var that = this,
				initExecXhr = new XMLHttpRequest(),
				ShowAction = false,
				PushAction = null,
				HttpUrl = null;
			
			if (__Mkey__.getPlatform() == 0)// IOS
			{
				HttpUrl = 'http://210.14.152.35:9021/mkey_aps/index.php?token=' + json + '&platform=IOS';
			}
			else
			{
				//HttpUrl = 'http://210.14.152.35:9019/http.do/?' + 'token='+ json +'&platform=Android';
				HttpUrl = 'http://210.14.152.35:9021/mkey_aps/index.php?token=' + json + '&platform=Android';
			}
			initExecXhr.open('get', HttpUrl, true);
            initExecXhr.send(json);
			initExecXhr = null;

			plus.push.addEventListener('click', function(msgInfo)
            {
				try{
					  // 处理新的action
					//ShowAction = true;
					//PushAction = msgInfo;
					eval('var PageID = '+msgInfo.payload+';');
					L.setItem(that.cacheKey.articleId, PageID.id);
					var win = plus.ui.findWindowByName('ShowWin');

					win.setOption({left:"0"});
					win.setVisible(true);
					setTimeout(function(){
						win.evalJS("page.loadFile('"+ PageID.id +"');");
						win = null;
						PageID = null;
					}, 50);
					var aniwin = new plus.ui.NAnimation( win, {style:'none', duration: 0});
					plus.ui.animate( aniwin );
				}
				catch(ex){
					that.showErr(ex);
				}
            },false);
		},
		registerPush: function(){
			var json, times = 50,that = this,
				interval = setInterval(function(){
				if(times < 0) {
					clearInterval(interval);
				}
				var json =  plus.push.getClientInfo();
				if(json && json != "null"){
					clearInterval(interval);
					that.push(json);
				}
				times--;
			}, 100);
			
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
    	setTimeout(function(){
    		document.getElementById("rito").style.display = "none";
    	}, 3000);
    }
})($.csdn);
