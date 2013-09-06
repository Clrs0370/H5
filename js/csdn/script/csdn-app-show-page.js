(function(C) {

	if (!C.ShowPage)
		C.ShowPage = function() {
		}
	var SP = C.ShowPage, W = $.MyWidget, L = W.NLocal;

	$.extend(true, SP.prototype, C, {
		pageName : "showpage",
		isFavorite : false,
		articleId : null,
		articelHref : null,
		articleTitle : null,
		isShowingShare : false,
		isShowingBar : false,
		/**
		在android系统下，关闭详情页的瞬间。避免右滑动可以打开写评论页面
		*/
		openpage : true ,
		hasDownloadFile : false,
		canShowFile: false,//解决在上一篇资讯加载的过程中返回到列表界面，然后再进入一篇新的资讯详情界面时，会先看到上一篇的详情
		OnReady : function() {
			var that = this , doc = document ;
			that.time_tj = new Date().getTime();
			try {
				that.zIndex = plus.ui.getSelfWindow().getOption()['zindex'] + 1;
				that.init();
				dh.init();
				that._bind("resume", doc);
				that._bind("pause", doc);
				that._bind("netchange", doc);
				that._bind('resize', doc);

                that.androidMenu(function(){
					if (that.isShowingShare) {
						that.hideShare();
						that.showBar();
						return;
					}
					if (that.isShowingBar) {
						that.hideBar();
						//return;
					}
					else{
						that.showBar();
					}
				});
				that.androidBack(function(e) {
					try {
						var startTime = that.clickTime, endTime = new Date().getTime();

						if (that.resumeTime && endTime - that.resumeTime < 200)
							return;

						if (that.isAnimating)
							return;

						if (that.isShowingShare) {
							that.hideShare();
							that.showBar();
							//return;
						}
						if (that.isShowingBar) {
							that.hideBar();
							//return;
						}
						if (startTime && endTime - startTime < 300) {
							that.clickTime = endTime;
							return;
						}

						that.clickTime = endTime;
						that.goBack();
					} catch(ex) {
						that.showErr(ex);
					}
				});
				that.toolbar = document.getElementById("toolbar");
				that.sharetb = document.getElementById("sharetb");

				that.slider = new W.slider(document, {
					onMove: function(){
						that.hideShare(true);
						that.hideBar(true);
						//that.toolbar.style.display = "none";
						//that.sharetb.style.display = "none";
					},
					onLeft: function(){
						//console.log('onLeft');
						that.goBack();
					},
					onRight: function(){
						//console.log('onRight');
						if (!that.openpage) {
							return;
						};
						that.showRemark();
					},
					onEnd: function(){
						//console.log('onEnd');
						//console.log('onEnd:' + window.pageYOffset + ':' + document.documentElement.offsetHeight);
						that.checkLazyLoad(window.pageYOffset);
						//that.toolbar.style.display = "block";
						//that.sharetb.style.display = "block";
						//that.hideShare(true);
						//that.hideBar(true);
					},
					onScroll: function(e){
						console.log('onScroll');
						if(that.checkTimer) clearTimeout(that.checkTimer);
						that.checkTimer = setTimeout(function(){
							that.checkLazyLoad(window.pageYOffset);
							/*if(window.pageYOffset + window.innerHeight > that.scrollheight){
								that.scrollheight = document.body.scrollHeight;
							}*/
							console.log(window.pageYOffset + ':' + that.winHeight + ':' +  that.scrollheight);
							if(window.pageYOffset + that.winHeight + 10 >= that.scrollheight){
								that.showBar();
							}
						}, 100);
						
					},
					onStatic: function(e){
						if (that.isShowingShare) {
							that.hideShare();
							that.showBar();
							return;
						}
						if (that.isShowingBar) {
							that.hideBar();
							//return;
						}
						else{
							that.showBar();
						}
					},
					canStart: function(e){
						var t = e.target,
							id = t.id || t.parentNode.id;
						if(id == 'back' || id == 'remark' || id == 'star' || id == 'share' || id == 'sina' || id == 'qq') return false;
						else return true;
					}
				});
				//document.getElementById("toolbar").style.bottom = "-6000px";
				//that.fromSearch = true;
				//that.canShowFile = true;
				//that.showFile("");
				//that.showNoFile();
			} catch(ex) {
				that.showErr(ex);
			}
		},
		canStart: function(e){
			var t = e.target,
				id = t.id || t.parentNode.id;
			if(id == 'back' || id == 'remark' || id == 'star' || id == 'share' || id == 'sina' || id == 'qq') return false;
			else return true;
		},
		handleEvent : function(e) {
			try {
				var that = this,
                    doc = document;
				switch(e.type) {
					case "resume":
						that.onResume();
						return;
					case "pause":
						that.onPause();
						return;
					case "netchange":
						that.onNetChange();
						return;
					case 'resize':
						var height = document.body.scrollHeight;
						if(height != that.scrollheight){
							that.scrollheight = height;
						}
						//window.scrollTo(0, window.pageYOffset + 10);
						//that.hideBar();
						break;
				}
				var t = e.target, 
					tag = t.tagName,
					id = t.id || t.parentNode.id, 
					doc = document;
				switch(id) {
					case "back":
						that.goBack();
						return true;
					case "remark":
						if(that.noFile) return;
						that.showRemark();
						return true;
					case "share":
						if(that.noFile) return;
						that.hideBar();
						that.showShare();
						return true;
					case "star":
						if(that.noFile) return;
						if (that.isFavorite) {
							doc.querySelector("#star span").style.color = "#f1f1f1";
							that.remove_fav_with_id(that.articleId, function(tx, rs) {
								//dh.alert("取消收藏", "error0");
								that.isFavorite = false;
								//需要赋值
								that.reloadFavorite();
							});
						} else {
							doc.querySelector("#star span").style.color = "#FFC926";
							if(that.data){
								that.insertArticle(that.data, function() {
                                    that.data = null;
									that.add_fav_with_id(that.articleId, function(tx, rs) {
										//dh.alert("收藏成功", "ok");
										plus.statistic.eventTrig("favorites");
										that.isFavorite = true;
										//需要赋值
										that.reloadFavorite();
									});
								});
							}
							else{
								that.add_fav_with_id(that.articleId, function(tx, rs) {
										//dh.alert("收藏成功", "ok");
										plus.statistic.eventTrig("favorites");
										that.isFavorite = true;
										//需要赋值
										that.reloadFavorite();
								});
							}
						}
						//that.hideBar();
						return true;
					case "sina":
					case "qq":
						if(that.noFile) return;
						that.shareArticle(id);
						that.hideShare();
						return true;
					case "check_feedback":
						dh.alert("您的意见我们已保存，感谢您参与CSDN互动");
						document.getElementById("feedback").style.display = "none";
						return true;
					case "left_feedback":
						document.getElementById("feedback").style.display = "none";
						return true;
					case "loadingcontent":
						var loadingcontent = doc.getElementById("loadingcontent");
						that._unbind("click", loadingcontent);
						loadingcontent.innerHTML = "<div></div>";
						that.getFile();
						return true;
				}

				return false;
			} catch(ex) {
				this.showErr(ex);
			}
		},
		reloadFavorite : function() {
			try {
				var win = plus.ui.findWindowByName("FAVORITEWIN");

				if (win) {
					win.evalJS("page.loadFavorite();");
					win = null;
				}
			} catch(ee) {
			}
		},
		/// <summary>
		/// 程序从后台恢复到前台事件
		/// </summary>
		onResume : function() {
			var that = this;
			that.resumeTime = new Date().getTime();
			that.isPause = false;
			if (that.isLoading && that.hasError)
				that.loadFile();
		},
		/// <summary>
		/// 程序从前台恢复到后台事件
		/// </summary>
		onPause : function() {
			var that = this;
			that.isPause = true;
			//plus.console.log("onPause");
		},
		/// <summary>
		/// 网络状态改变
		/// </summary>
		onNetChange : function() {
			//var that = this;
			//that.isNetChange = true;
			var that = this;
			if (!that.isLoading || !that.hasError)
				return;
			if (that.hasNetwork())
				that.loadFile();
			else
				dh.alert("网络不给力");
		},
		showRemark : function() {
			var win = plus.ui.createWindow("app/remark.html", {name: 'RemarkWIN', zindex: this.zIndex} );
			win.show('slide-in-right',300);
		},
		
		showFile : function(data) {
			try {
				//var data = {"count":"0","remark":"0","tag":"","next":"","img":"","url":"http://www.csdn.net/article/2013-05-13/2815251","prev":"","id":"2815251","author":"叶子","category":"sd","title":"优秀HTML5网站学习范例：饥饿游戏浏览器/从饥饿游戏2谈用户体验","source":"社区供稿","notfind":false,"ptime":"2013-05-13 15:00","notModified":false,"body":"<div class=\"con news_content\"> <p>继影片《饥饿游戏》获得票房成功后，《饥饿游戏2：火星燎原》也于2012年宣布开拍，将在今年的11月22日登陆全球各大院线。值此之际，微软携手美国狮门影业公司和RED Interactive Agency一起为影迷打造了一个基于 HTML5现代网页规范开发的沉浸式体验网站——饥饿游戏浏览器（The Hunger Games Explorer）。在这里，全世界的饥饿游戏迷们可以获得影片上映前的一切资讯，包括狮门影业官方放出的海报、预告片等等，同时也可以参与到全球社交媒体关于饥饿游戏的讨论中来。饥饿游戏的讨论中来。</p> <p align=\"center\" style=\"text-align: center; display: block; \"><img border=\"0\" src=\"http://localhost:13131/_doc/img/51908eb4bc07a_middle_640_.jpg\" unselectable=\"on\" imgname=\"51908eb4bc07a_middle_640_.jpg\"></p> <p>今天，消费者们可以与我一同看看，一个优秀的 HTML5站点能给我们大家带来怎样的新体验，而开发者们也可以参考这个网站所使用的一些 HTML5特性，去开发出您自己的优秀 HTML5站点。</p> <p>网站亮点</p> <p>从功能上看，该网站为所有的影迷们提供了一站式的影讯资源平台，不仅可以看到狮门公司所发布的官方讯息，更可以实时查看到来自全球的社交媒体上关于饥饿游戏的讨论。所有的内容，包括图像、视频和文字，都是通过一个个的方块区域组织到一起的，内容也是直观地呈现在了不同的方块里面，并且很多区块中的内容是动态的，给网站增添了视觉上的活力。而且如果您有触摸屏的话，不难发现，这个站点是支持多点触控的，用双指可以进行自然的缩放，来调整页面内容的呈现，很好地支持直接用手指去与整个网站进行交互。</p> <p>这些社交媒体的数据抓取和整合自全球热门的社交媒体网站，例如 Facebook、Twitter、YouTube、Pinterest和Tumblr.同时这个饥饿游戏浏览器网站也支持通过 Facebook和 Twitter账号登录，登录后用户可以创建自己的页面来组织你所关注的资源和内容，也可以去“赞”别人发布的内容，因此，这个站点本身通过对第三方社交媒体网络的整合，为用户轻松提供了一个新的影迷专用社交平台。这样的做法是值得推荐给开发者们的。</p> <p>在UI设计方面，网站整体呈现出一种现代感，借助 HTML5的一些功能，网站可以使用自定义的字体，并且可以设计出与影片主题契合的配色风格和界面元素。在我们点击某一内容方块时，可以看见该方块放大且周遭方块缩小重排的动画效果，这样会让内容的切换不显得过于突兀。用户在刚打开这个网站的同时，也可以看见方块向中间堆叠铺陈的效果，虽然很快，但能给人舒适的感受。在功能上，用户还可以对某一关键字进行检索，也可以进行筛选。该网站也采用了瀑布流的方式，网站不设底边，一直往下滚动会看见越来越多的来自社交媒体网站的内容被整合进来，并得以呈现。</p> <p>横跨不同设备并提供一致用户体验也是该网站的一个亮点，因为不论是从 PC端的 IE10，还是智能手机或平板的支持 HTML5的浏览器访问该站点，都可以看到一致的内容与风格，只不过，里面的方块大小和排列方式会根据用户的屏幕分辨率来自动调整。对于这样的自适应效果，我们也可以通过 PC端的 IE10浏览器看到，具体做法是改变窗口的尺寸。</p> <p align=\"center\" style=\"text-align: center; display: block; \"><img border=\"0\" src=\"../app/img/ios-default.png\" unselectable=\"on\" lazyload=\"http://210.14.152.35:9021/cms.csdnimg.cn/article/201305/13/51908f6d792e1_middle_640_.jpg\" imgname=\"51908f6d792e1_middle_640_.jpg\"></p> <p>幕后的技术</p> <p align=\"center\" style=\"text-align: center; display: block; \"><img border=\"0\" src=\"../app/img/ios-default.png\" unselectable=\"on\" lazyload=\"http://210.14.152.35:9021/cms.csdnimg.cn/article/201305/13/51908ffc15333_middle_640_.jpg\" imgname=\"51908ffc15333_middle_640_.jpg\"></p> <p>网站的瀑布式内容呈现方式，借助了 JavaScript 将大大小小的信息方块无缝地组织到一起。这是一个典型的网格布局，只不过它使用的不是传统的网格布局技术，而是使用了 JS将每一块内容放到合适的位置，并且使用 3DCSS变换来实现块移动和旋转时候的效果。</p> <p>而对于触摸的支持，它利用了 MicrosoftPointersModel，因此可以做到使用一个 API就可以同时管理鼠标和手指触摸这两种用户输入。</p> <p align=\"center\" style=\"text-align: center; display: block; \"><img border=\"0\" src=\"../app/img/ios-default.png\" unselectable=\"on\" lazyload=\"http://210.14.152.35:9021/cms.csdnimg.cn/article/201305/13/51909041477cf_middle_640_.jpg\" imgname=\"51909041477cf_middle_640_.jpg\"></p> <p>对于 3D 翻转动画，网站运用了使用requestAnimationFrameAPI优化的 CSS3变换，这样能确保动画效果在不同的浏览器和设备上都一样流畅。requestAnimationFrame技术能够在不牺牲运算能力的同时进一步提高响应度，响应度的提高也是让用户感觉到动画流畅的一个关键。</p> <p>如果您想查看这些技术范例的代码，可以移步此处：http://www.thehungergamesexplorer.com/us/upgrade/ </p> <p>创作用户喜爱的网站</p> <p>如今的互联网不再单以信息内容为第一要务，用户对参与和交互的要求已经越来越高，因为 Web2.0是一个强调用户为中心、用户创造内容和参与交互的一个时代。因此，用户体验是越来越重要的一个环节。要做好用户体验，并且兼顾这一需求在未来的发展，旧有的一些技术似乎已不再能很好地支撑用户体验的今天和明天。虽然现在 Flash等插件在网页中有很多运用，但是我们已经通过这些优秀的 HTML5网站看到了无插件网页带来的一些优势，例如高性能、省电与浑然天成的视觉效果等。对于熟知旧有技术的开发者而言，做出改变虽然看似有些困难，但是我们应当看到现代网页技术的发展给我们带来的喜悦，以及能够给用户带来的惊喜与价值。我们值得为用户做出改变，也同样值得为网站用户体验及网页技术的未来做出改变。</p> <p>微软通过参与研究和推动 HTML5等现代网页技术规范，改进了 IE浏览器对 HTML5等现代网页技术的支持，也正不断为开发者提供越来越多的指引和资源。我们看到，已经有越来越多的开发者步入到 HTML5开发的行列中来，也期待在不久的将来，能有更多的网站构建于新的技术之上！</p> <p>如果您需要更多了解HTML5等现代网页技术，可以前往http://www.ietestdrive.com查看更多技术示例及代码。前不久，微软也新推出了http://www.modern.ie网站，帮助开发者更轻松地评估现有在线网站，当然，您也可以选择下载一个用于本地的 modern.IE程序，用来简化您的开发测试工作。试试身手吧！</p> </div>"};
                var that = this,
                    doc = document,
                    content = doc.getElementById("content"),
                    p = doc.querySelector("#container>p"),
                    cacheKey = that.cacheKey,
                    articleId = that.articleId,
                    modified = false;
                that.showBar();
  				if(!that.canShowFile || data.id != that.articleId) return;
                that.noImage = L.getItem(that.cacheKey.noImage);
				that.isFavorite = false;
				if(data.notfind) {//文件未找到
					that.showNoFile();
					//that.showBar();
					return;
				}
				that.noFile = false;
				//doc.getElementById("wrapper").style.height = window.innerHeight + "px";
				that.isLoading = false;
				that.hasError = false;
				
				content.style.fontSize = that.getFontSize().value;
				//分享页面用到title和href
				//L.setItem(cacheKey.articleUrl, data.url);
				//L.setItem(cacheKey.articleTitle, data.title);
				L.setItem(cacheKey.articleUrl, data.url);
				L.setItem(cacheKey.articleTitle, data.title);
				that.articelHref = data.url;
				that.articleTitle = data.title;

				doc.getElementById("title").innerHTML = data.title;
				doc.getElementById("ptime").innerHTML = data.ptime;
//				doc.getElementById("remark0").innerHTML = that.remark; //data.remark;
			
				
				content.innerHTML = data.body;
				doc.getElementById("author").innerHTML = data.author;
				doc.getElementById("loadingcontent").style.opacity= "0";
				doc.getElementById("wrapper").style.opacity = "1";


				if (that.fromSearch) {
					that.data = {
						id : data.id,
						title : data.title,
						img : data.img,
						ptime : data.ptime,
						category : data.category,
						href : data.url,
						count : data.count,
						remark : data.remark,
						Androidimg : data.Androidimg || ""
					};
				}else{
                    that.data = null;
                }
				that.readArticle(articleId);
				that.checkisfav(articleId, function(fav) {
					that.isFavorite = fav;
					doc.querySelector("#star span").style.color = fav ? "#FFC926" : "#f1f1f1";
				});
				if (!data.notModified) {
					var imgs = doc.querySelectorAll("#container img"), len = imgs.length, index = 0;
					for (; index < len; index++) {
						var img = imgs[index], src = img.src;
                        if(that.noImage){
                            img.style.display = "none";
                            continue;
                        }
						if (src == "" || src.indexOf("localhost") > 0 || src.indexOf('base64') >= 0) {
							if (!src)
								img.style.display = "none";
							img = null;
							continue;
						}
						if (img.parentNode.tagName != "P" && img.parentNode.parentNode.tagName != "P") {
							img.style.display = "none";
							that.hasDownloadFile = true;
							img = null;
							continue;
						}
                        var parent = img.parentNode;
                        parent.style.cssText = "text-align: center;display:block";
                        var next = img.nextSibling;
                        if(next && next.nodeType == 3){//下一个节点是text文本
                            var span = doc.createElement("div");
                            span.innerHTML = next.nodeValue;
                            parent.removeChild(next);
                            parent.appendChild(span);
                            span = null;
                            next = null;
                        }
                        parent = null;
						//图片居中
						img.src = "../app/img/ios-default.png";
						img.setAttribute("lazyload", src);
						img.setAttribute("imgname", src.substring(src.lastIndexOf('/') + 1));
                        modified = true;
						img = null;
					}
					imgs = null;
				}
				var _data = {};
				for (i in data) {
					if (i != 'body')
						_data[i] = data[i];
				}
				_data.notModified = !modified;
				L.setItem(cacheKey.articleContent, _data);
				_data = null;
				that.checkLazyLoad(0);
				that.slider.enable();
				that.winHeight = window.innerHeight;
				that.scrollheight = document.body.scrollHeight;
				//doc.getElementById("sharetb").style.bottom = -that.scrollheight+"px";
				
			} catch(ex) {
				that.showErr(ex);
			}
		},
		checkLazyLoad : function(top) {
			//alert("checkLazyLoad");
			var that = this;
			if (that.lazyTimeout)
				clearTimeout(that.lazyTimeout);
			that.lazyTimeout = setTimeout(function() {
				try {
					var doc = document, 
						lazyObjs = doc.querySelectorAll("#container img[lazyload]"), 
						len = lazyObjs.length, 
						index = 0, 
						winheight = that.winHeight;
					if (len <= 0)
						return;
					for (; index < len; index++) {
						var obj = lazyObjs[index], _top = obj.offsetTop - top;
						//alert(_top + ":" + winheight + ":" + top);
						if (_top > 0 && _top < winheight) {
							var srcImg = obj.getAttribute("lazyload");
							obj.removeAttribute("lazyload");
							//plus.console.log("srcImg:" + srcImg);
							that.downLoadFile({
								srcFile : srcImg,
								dstFile : srcImg.substring(srcImg.lastIndexOf('/') + 1),
								folderPath : "img/",
								downloadFolerPath : "_doc/img/",
								success : function(op, isExist) {
									that.hasDownloadFile = true;
									var _img = doc.querySelector("#container img[imgname='" + op.dstFile + "']");
									if (_img) {
										_img.src = "http://localhost:13131/_doc/img/" + op.dstFile;
										//that.pageHeight = doc.getElementById('wrapper').offsetHeight;
										_img = null;
									}
								},
								error1 : function(type) {
									//alert("downLoadFile fail :" + type + "," + srcImg);
								}
							});
						}
						obj = null;
					}
					lazyObjs = null;
				} catch(ex) {
					that.showErr(ex);
				}
			}, 100);
		},
		showNoFile: function(){
			var _container = document.getElementById("loadingcontent");
			_container.innerHTML = '<span class="fileerror"></span>';
			this._bind("click", _container);
			this.noFile = true;
            this.showBar();
			_container = null;
			this.slider.disable();
		},
		getFile : function() {
			try {
				var that = this;
				//alert("downLoadFile:" + that.articleId + ".json");
				that.downLoadFile({
					folderPath : "all_list/",
					dstFile : that.articleId + ".json",
					onNotFund : function(op) {
						$.ajax({
							type : 'GET',
							url : that.csdnLit_URL + "Detail/" + that.articleId + ".json",
							timeout : that.timeout,
							dataType : 'jsonp',
							success : function(data) {
								that.showFile(data);
								that.saveArticle(data, that.articleId);
							},
							error : function(xhr, type) {
//								plus.console.log(JSON.stringify(type));
								that.showNoFile();
							}
						});
					},
					success : function(op, isExist, fileEntry) {
						//alert("success:" + isExist);
						fileEntry.file(function(file) {
							var fileReader = new plus.io.FileReader();
							fileReader.readAsText(file, 'utf-8');
							fileReader.onloadend = function(evt) {
								that.showFile(JSON.parse(evt.target.result));
							};
							fileReader = null;
						});
					}
				});
			} catch(ex) {
				this.showErr(ex);
			}
		},
		/**
		 * @作者：
		 * @时间：2013/04/10 16:57:46
		 * @param articleId:文章id
		 * @param  isFromSearch:是否来自搜索页面，如果来自搜索页面需要将该篇文章添加到缓存数据库
		 * @描述： 获取详情内容
		 */
		loadFile : function(articleId, remark,isFromSearch) {
			try {
			//alert(articleId);
				var that = this;
				that.canShowFile = true;
				window.scroll(0, 0);
				that.fromSearch = isFromSearch;
				that.articleId = articleId;
                that.remark = remark,
				that.openpage = true;
				if (that.fileSystemAPI) {
					that.getFile();
				} else {
					plus.io.requestFileSystem(plus.io.PRIVATE_DOCUMENTS, function(fs) {
						that.fileSystemAPI = fs;
						that.getFile();
					});
				}
			} catch (ex) {
				this.showErr(ex);
			}

		},
		showShare: function() {
			var that = this, doc = document;
			if (that.isShowingShare)
				return;
			that.isShowingShare = true;
			that.sharetb.style.display = 'block';
			setTimeout(function(){
				that.sharetb.style.bottom = '0';
				//alert('sd');
			}, 15);
			//doc.getElementById("sharetb").style.bottom = "0";
			that.hideBar();
			that._bind("click", doc.getElementById("sina"));
			that._bind("click", doc.getElementById("qq"));
		},
		hideShare : function(notUseTimer) {
			var that = this, doc = document;
			if (!that.isShowingShare)
				return;
			that.isShowingShare = false;
			if(notUseTimer){
				that.sharetb.style.display = 'none';
				that.sharetb.style.bottom = '-130px';
			}
			else{
				that.sharetb.style.bottom = '-130px';
				setTimeout(function(){
					that.sharetb.style.display = 'none';
				}, 180);
			}

			//doc.getElementById("sharetb").style.bottom = '-130px';// -that.scrollheight+"px";
			that._unbind("click", doc.getElementById("sina"));
			that._unbind("click", doc.getElementById("qq"));
		},
		showBar : function() {
			var that = this, doc = document;
			
			if (that.isShowingBar)
				return;
			that.isShowingBar = true;
			that.toolbar.style.display = 'block';
			setTimeout(function(){
				that.toolbar.style.display = 'block';
				that.toolbar.style.bottom = '0';
			}, 15);
			//doc.getElementById("toolbar").style.bottom = "0";
			
			
			that._bind("click", doc.getElementById("back"));
			that._bind("click", doc.getElementById("remark"));
			that._bind("click", doc.getElementById("share"));
			that._bind("click", doc.getElementById("star"));
		},
		hideBar : function(notUseTimer) {
			var that = this, doc = document;
			if (!that.isShowingBar)
				return;
			that.isShowingBar = false;
			
			if(notUseTimer){
				that.toolbar.style.display = 'none';
				that.toolbar.style.bottom = '-60px';
			}
			else{
				that.toolbar.style.bottom = '-60px';
				setTimeout(function(){
					that.toolbar.style.display = 'none';
				}, 180);
			}
			doc.getElementById("toolbar").style.bottom = '-60px';//-that.scrollheight+"px";
			that._unbind("click", doc.getElementById("back"));
			that._unbind("click", doc.getElementById("remark"));
			that._unbind("click", doc.getElementById("share"));
			that._unbind("click", doc.getElementById("star"));
		},
		saveModifyFile : function() {
			var that = this;
			try {
				if (!that.hasDownloadFile)
					return;
				var data = L.getItem(that.cacheKey.articleContent);
				data.body = document.getElementById("content").innerHTML;
				that.saveArticle(data);
				that.hasDownloadFile = false;
			} catch(ex) {
				that.showErr(ex);
			}
		},
		goBack : function() {
			try{
				plus.statistic.eventDuration("show", new Date().getTime()-this.time_tj);
				var ui = plus.ui, currentPage = ui.getSelfWindow(), doc = document, that = this;
				that.openpage = false;
//				currentPage.setOption({left : '100%', transition:{duration:300}});
				currentPage.setVisible(false);
//				setTimeout(function(){currentPage.setVisible(false);},300);
				that.saveModifyFile();
				that.canShowFile = false;
				that.slider.disable();
//				setTimeout(function(){
					try{
						doc.getElementById("loadingcontent").style.opacity = "1";
						doc.getElementById("wrapper").style.opacity = "0";
						//以下解决进详情页显示上一次文章内容的问题
						doc.getElementById("title").innerHTML = "";
						doc.getElementById("ptime").innerHTML = "";
//						doc.getElementById("remark0").innerHTML = "";
						doc.getElementById("content").innerHTML = "";
						doc.getElementById("author").innerHTML = "";
						//currentPage.setVisible(false);
						
						if (that.isShowingBar)
							that.hideBar();
						//document.getElementById("toolbar").style.bottom = "-6000px";
						if(that.noFile) doc.getElementById("loadingcontent").innerHTML = "<div></div>";
						
						
					}
					catch(ex){
						that.showErr(ex)
					}
//				}, 300);
			}
			catch(ex){
				this.showErr(ex);
			}
		},
		shareArticle : function(type) {
			L.setItem(this.cacheKey.shareType, type);
			var that = this,
				ui = plus.ui, 
				zindex = that.zIndex,
				sharetopwin = ui.createWindow("app/sharetop.html", {name: 'sharetop', height : '10%', zindex: zindex}), 
				sharecontent = ui.createWindow("app/sharecontent.html", {name: 'sharecontent', top : '10%', height : '90%', zindex: zindex});

			sharecontent.addEventListener("loaded", function() {
				sharecontent.evalJS("\
					var obj = document.getElementsByTagName('ul')[0];\
					var childobjs = obj.childNodes;\
					for(var i=0;i<childobjs.length;i++){\
						if(childobjs[i].nodeName=='LI'){\
							var gobjs = childobjs[i].childNodes;\
							for(var j = 0 ; j <gobjs.length;j++ ){\
								if(gobjs[j].text=='我的微博'){\
									childobjs[i].parentNode.removeChild(childobjs[i]);\
								}\
							}\
						}\
					};\
					var aobjs = document.getElementsByTagName('a');\
					for(var i = 0;i<aobjs.length;i++){\
						if(aobjs[i].text=='<<返回继续浏览'){\
							aobjs[i].parentNode.parentNode.removeChild(aobjs[i].parentNode);\
						}\
						if(aobjs[i].text=='移动版'){\
							aobjs[i].parentNode.parentNode.removeChild(aobjs[i].parentNode);\
						}\
						if(aobjs[i].text=='返回之前浏览页面'){\
							aobjs[i].parentNode.parentNode.removeChild(aobjs[i].parentNode);\
						}\
					}");
			}, false);

			sharetopwin.show();
			sharecontent.show();
			
			setTimeout(function() {
				that.saveModifyFile();
			}, 10);
		}
	});

	window.page = new SP();
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

})($.csdn);
