//     cache-control.js
//     (c) 2013-2013 Seaman Jiang / Digital Heaven

(function($, undefined) {
	if (!$.csdn || typeof $.csdn == 'undefined')
		$.csdn = function() {
		}
	var webSQL_DB_NAME = "csdn_db", // CSDN indexedDB Name
		csdnLib_VERSION = "0.9.4", // version of this lib;
		csdnLib_SERVERURL_CACHE = "http://csdn.m3w.cn", //124.205.53.2
		csdnLib_SERVERURL = "http://csdn.m3w.cn/http.do", csdnLit_URL = "http://csdn-php.m3w.cn/all_list/",
		db = null, 
		_catagory = [
			{id : 'news', name : "最新资讯", url : "http://news.csdn.net/news/"}, 
			{id : 'industry', name : "业界", url : "http://news.csdn.net/news/"}, 
			{id : 'cloud', name : "云计算", url : "http://cloud.csdn.net/cloud/"}, 
			{id : 'mobile', name : "移动开发", url : "http://mobile.csdn.net/mobile/"}, 
			{id : 'sd', name : "软件研发", url : "http://sd.csdn.net/sd/"}, 
			{id : 'hot', name : "推送消息", url : ""}], 
			CP = $.csdn, 
			L = $.MyWidget.NLocal;

	$.csdn = $.extend(CP.prototype, {
		UpdateURL: 'http://csdn-php.m3w.cn/sus/',
		csdnLit_URL : "http://csdn-php.m3w.cn/all_list/",
		csdnLib_SERVERURL : "http://csdn.m3w.cn/http.do",
		timeout : 30000, //ajax请求的超时时间
		cacheKey : {
			fontSize : "CSDN_FontSize",
			push : "CSDN_Push",
			noImage : "CSDN_NoImage",
			userName : "CSDN_USERNAME",
			password : "CSDN_password",
			articleId : "CSDN_articleId",
			articleUrl : "CSDN_articleUrl",
			articleTitle : "CSDN_articleTitle",
			shareType : "CSDN_sharetype", //qq或sina
			updateTime : "CSDN_updatetime", //列表第一页的更新时间
			tiro : "CSDN_tiro", //新手指导标志
			articleContent : "CSDN_articleContent",
			widgtPath:'CSDN_widgtPath',
			releaseNotes: 'CSDN_releasenotes'
		},
		is2GOr3G : function() {
			if (!plus.networkinfo) {
				//alert("基座版本不对");
				return true;
			}
			var type = plus.networkinfo.getCurrentType();
			return type == plus.networkinfo.CONNECTION_CELL2G || type == plus.networkinfo.CONNECTION_CELL3G || type == plus.networkinfo.CONNECTION_CELL4G;
		},
		is2G : function() {
			if (!plus.networkinfo) {
				//alert("基座版本不对");
				return true;
			}
			var type = plus.networkinfo.getCurrentType();
			return type == plus.networkinfo.CONNECTION_CELL2G;
		},
		hasNetwork : function() {
			if (!plus.networkinfo) {
				//alert("基座版本不对");
				return true;
			};
			
			var type = plus.networkinfo.getCurrentType(), networkInfo = plus.networkinfo;
			return type == networkInfo.CONNECTION_ETHERNET || type == networkInfo.CONNECTION_WIFI || type == networkInfo.CONNECTION_CELL2G || type == networkInfo.CONNECTION_CELL3G || type == networkInfo.CONNECTION_CELL4G;
		},
		customerFontSize : {
			"大" : "1.5em",
			"中" : "1.3em",
			"小" : "1.15em"
		},
		getFontSize : function() {
			var fontsize = L.getItem(this.cacheKey.fontSize)|| {text : "中",	value : "1.3em"};
			plus.statistic.eventTrig("fontSize", fontsize.text);
			return fontsize;
		},
		setFontSize : function(value) {
			L.setItem(this.cacheKey.fontSize, value);
		},
		version : csdnLib_VERSION,

		serverurl : csdnLib_SERVERURL,

		init : function() {
			if(db) return;
			db = _getDatabaseConnection();
			this.db = db;
			_checkIsExistsTable(db);
			//_insertData(db);
		},
		/*getVendor: function(){
			var that = this;
			if(typeof that._vendor !== 'undefined') return that._vendor;
			var vendors = 't,webkitT,MozT,msT,OT'.split(','),
				t,
				i = 0,
				l = vendors.length,
				docStyle = document.documentElement.style;

			for ( ; i < l; i++ ) {
				t = vendors[i] + 'ransform';
				if ( t in docStyle) {
					that._vendor = vendors[i].substr(0, vendors[i].length - 1);
					return that._vendor;
				}
			}
		},
		prefixStyle: function(style){
			var vendor = this.getVendor();
			if (vendor === '' ) return style;

			style = style.charAt(0).toUpperCase() + style.substr(1);
			return vendor + style;
		},*/

		findNextPageInfo : function(articleid, category2, onRight, onLeft) {
			_find_next_page_info(articleid, category2, onRight, onLeft);
		},

		loadFsJsonFile : function(articleid2, onSuccess, onError) {
			_load_fs_json_file(articleid2, onSuccess, onError);
		},

		loadCategoryByPageNetwork : function(category2, pagenum, lastNewsId, onSuccess, onError, checkFunc) {
			//alert("loadCategoryByPageNetwork:" + category2);
			return _query_network_with_page(category2, pagenum, lastNewsId, onSuccess, onError, checkFunc);
		},

		loadCategoryByPageDB : function(category2, pagenum, lastNewsId, onSuccess, onError) {
			//alert("loadCategoryByPageDB:" + category2);
			_loadCategory_page_db(category2, pagenum, lastNewsId, onSuccess, onError);
		},

		saveImg2File : function(data, onSuccess) {
			_saveImg2File(data, onSuccess);
		},

		clearArticleByCategory : function(categoryId, onsuccess) {
			_clearArticleByCategory(categoryId, onsuccess);
		},

		add_fav_with_id : function(articileid, onSuccess) {
			//_add_fav_with_id(articileid2, onSuccess);
			if (!db) {
			} else {
				db.transaction(function(tx) {
                    //plus.console.log("当前保存的ID为:" + articileid);
					tx.executeSql('UPDATE article_list SET fav = 1 WHERE id = ?', [articileid], function(tr, rs){
						if(rs.rowsAffected == 0) tx.executeSql('UPDATE first_news SET fav = 1 WHERE id = ?', [articileid]);
						onSuccess(tr, rs)
					});
                    //plus.console.log("保存后的ID为:" + articileid + "保存完成");
					//tx.executeSql('INSERT OR REPLACE into article_fav select * from article_list where  article_list.id = ?', [articileid], onSuccess());
				});
			}
		},
		/**
		 * @作者：
		 * @时间：2013/04/10 11:01:55
		 * @param articileid2:
		 * @param  onSuccess:成功回调
		 * @描述：移除收藏
		 */
		remove_fav_with_id : function(articileid, onSuccess) {
			//_remove_fav_with_id(articileid2, onSuccess);
			if (!db) {
			} else {
				db.transaction(function(tx) {
                    //plus.console.log("当前保存的ID为:" + articileid);
					tx.executeSql('UPDATE article_list SET fav = 0 WHERE id = ?', [articileid], function(tr, rs){
						if(rs.rowsAffected == 0) tx.executeSql('UPDATE first_news SET fav = 0 WHERE id = ?', [articileid]);
						onSuccess(tr, rs)
					});
                    //plus.console.log("保存后的ID为:" + articileid + "保存完成");
					//tx.executeSql('INSERT OR REPLACE into article_fav select * from article_list where  article_list.id = ?', [articileid], onSuccess());
				});
			}
		},
		/**
		 * @作者：
		 * @时间：2013/04/10 10:55:21
		 * @param onSuccess:回调方法
		 * @描述： 获取所有收藏
		 */
		load_fav : function(onSuccess) {
			if (!db) {
				return null;
			} else {
				var list = [];
				db.transaction(function(tx) {
					tx.executeSql('select id, title, ptime, [count], remark from article_list where fav=1 order by ptime desc', [], function(tx, rs) {
						var len = rs.rows.length, i = 0;
						if (len > 0) {
							for (; i < len; i++) {
								list.push(rs.rows.item(i));
							}
						}
						tx.executeSql('select id, title, ptime, [count], remark from first_news where fav=1 order by ptime desc', [], function(tx, rs) {
							var len = rs.rows.length, i = 0;
							if (len > 0) {
								for (; i < len; i++) {
									list.push(rs.rows.item(i));
								}
							}
							onSuccess(list);
						});
					});
				});
			}
		},
		/**
		 * @作者：
		 * @时间：2013/04/10 11:17:08
		 * @param articileid2:
		 * @param  onSuccess:
		 * @描述：检查指定文章是否已经收藏
		 */
		checkisfav : function(articileid, onSuccess) {
			if (!db) {
				return null;
			} else {
				db.transaction(function(tx) {
					tx.executeSql('select id from article_list where id = ? and fav=1', [articileid], function(tx, rs) {
						if (rs.rows.length == 1) {
							onSuccess(true);
							return;
						};
						tx.executeSql('select id from first_news where id = ? and fav=1', [articileid], function(tx, rs) {
							onSuccess(rs.rows.length == 1);
						});
					});
				});
			}
		},
		readArticle : function(articleid, onSuccess) {
			db.transaction(function(tx) {
				tx.executeSql('update article_list set readflag=1 where id = ?', [articleid], function(tx, rs) {
					if (onSuccess)
						onSuccess(rs);
				});
			});
		},
		insertArticle : function(data, onSuccess) {
			db.transaction(function(tx) {
				tx.executeSql('select count(id) as num from article_list where id = ?', [data.id], function(tr, result) {
					if (result.rows.item(0).num == 0) {
						tx.executeSql('INSERT into article_list values(?,?,?,?,?,?,?,?,0,1,?)', [data.id, data.title, data.img, data.ptime, data.category, data.href, parseInt(data.count, 10), data.remark, data.Androidimg], function(tx, result) {
							if (onSuccess)
								onSuccess(result);
						});
					}
				});
			});
		},
		download_news_list : function(onSuccess, onError, onStatus) {
			_download_news_list(onSuccess, onError, onStatus);
		},

		download_analyse_listdata : function(data, onError, onSuccess) {
			_download_analyse_listdata(data, onError, onSuccess);
		},
		_bind : function(type, el, bubble) {
			el.addEventListener(type, this, !!bubble);
		},
		_unbind : function(type, el, bubble) {
			el.removeEventListener(type, this, !!bubble);
		},
		isIOS : function() {
			return navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i);
		},
		isAndroid : function(t) {
			return navigator.userAgent.match(/Android/i);
		},
		androidBack : function(callback) {
			if (this.isAndroid()) {
				var win = plus.ui.getSelfWindow();
				win.addEventListener('back', callback);
			}
		},
		androidMenu : function(callback) {
			if ((/android/gi).test(navigator.appVersion)) {
				var win = plus.ui.getSelfWindow();
				win.addEventListener('menu', callback);
			}
		},
		log : function(txt) {
			plus.console.log(this.pageName + ":" + txt);
		},
		showErr : function(ex) {
			try {
				//alert(ex.name + ':' + ex.message + ':' + ex.stack);
				var message = [];
				for (i in ex) {
					//if (typeof ex[i] == 'function' || typeof ex[i] == 'object') continue;
					message.push("\n" + i + ":" + ex[i]);
				}
				plus.statistic.eventTrig("error",message.join(';'));
				//console.trace();
				//alert(message.join(';'));
				//plus.console.log(message.join(';'));
				throw ex;
			} catch (err) {
				//alert(err.message);
			}
		},
		/// <summary>
		///保存文件
		/// {path:文件路径, data:要保存的文件内容, success:成功回调, error：失败回调}
		/// </summary>
		saveFile : function(options) {
			var that = this;
			that.fileSystemAPI.root.getFile(options.path, { 	
				create : true
			}, function(fileEntry) {
				//保存到临时目录
				fileEntry.createWriter(function(fileWirte) {
					fileWirte.write(JSON.stringify(options.data));
					//这个时候不存文件
					if (options.success)
						options.success();
				}, null);
			}, function(err) {
				//alert("err:" + err.code)
				if (options.error)
					options.error(err);
			});
		},
		saveArticle : function(data, articleid) {
			var that = this, path = "all_list/" + (articleid || data.id) + ".json";
			if (that.fileSystemAPI)
				that.saveFile({
					path : path,
					data : data
				});
			else
				plus.io.requestFileSystem(plus.io.PRIVATE_DOCUMENTS, function(fs) {
					that.fileSystemAPI = fs;
					that.saveFile({
						path : path,
						data : data
					});
				});
			//存完后保存到数据库
			//缓存图片
			//_saveShowImg2File(oldimgs, null);
			//暂不保存详情页的数据到article_list表中
			//_saveFile2DB(data,onSuccess);
		},
		/// <summary>
		///保存文件
		/// {srcImg:源文件路径, dstImg:要保存的文件路径, success:成功回调, error：失败回调}
		/// </summary>
		downLoadFile : function(options) {
			var that = this;
			if (!that.fileSystemAPI)
				plus.io.requestFileSystem(plus.io.PRIVATE_DOCUMENTS, function(fs) {
					that.fileSystemAPI = fs;
					that._downLoadFile(options);
				});
			else
				that._downLoadFile(options);
		},
		_downLoadFile : function(options) {
			var that = this, path = options.folderPath + options.dstFile, index = path.indexOf('?');
			if (index > 0)
				path = path.substring(0, index);
//			alert('getFile:' + JSON.stringify(options));
			that.fileSystemAPI.root.getFile(path, {
				create : false
			}, function(fileEntry) {
				if (options.success)
					options.success(options, true, fileEntry);
			}, function(err) {
				if (options.onNotFund) {
					options.onNotFund(options);
					return;
				}
//				alert(options.srcFile)
				var dt = plus.downloader.createDownload(options.srcFile, {
					filename : options.downloadFolerPath,
					timeout : 120
				}, function(d, status) {
					if (status == 200) {
						d.abort();
                        //options.dFilename = d.filename;
						if (options.success)
							options.success(options, false, d);
					} else {
						if (options.error)
							options.error(options, status, d);
					}
				});
				dt.start();
			});
		},
		back: function() {
	        var currentPage = plus.ui.getSelfWindow();
	        currentPage.close('slide-out-right',300);
		},
		updateDB: function(){
			db.transaction(function(tx) {
				tx.executeSql('update article_list set Androidimg = img, readflag = 0', []);
			});
		}
	});

	//找到下一篇信息
	function _find_next_page_info(articleid2, category, onRight, onLeft) {
		console.log("_find_next_page_info");

		if (!db) {
			return null;
		} else {
			db.transaction(function(tx) {
				var leftsql = "";
				var rightsql = "";
				if (category === "news") {
					leftsql = 'SELECT * FROM article_list WHERE ptime < (SELECT ptime FROM article_list WHERE id = ?) and id != ? ORDER BY ptime DESC limit 1';
					rightsql = 'SELECT * FROM article_list WHERE ptime > (SELECT ptime FROM article_list WHERE id = ?) and id != ? ORDER BY ptime limit 1';
				} else if (category === "favorite") {
					leftsql = 'SELECT * FROM article_fav WHERE ptime < (SELECT ptime FROM article_fav WHERE id = ?) and id != ? ORDER BY ptime DESC limit 1';
					rightsql = 'SELECT * FROM article_fav WHERE ptime > (SELECT ptime FROM article_fav WHERE id = ?) and id != ? ORDER BY ptime limit 1';
				} else {
					leftsql = 'SELECT * FROM article_list WHERE ptime < (SELECT ptime FROM article_list WHERE id = ?) AND category = ? ORDER BY ptime DESC limit 1';
					rightsql = 'SELECT * FROM article_list WHERE ptime > (SELECT ptime FROM article_list WHERE id = ?) AND category = ? ORDER BY ptime limit 1';
				}

				tx.executeSql(leftsql, [articleid2, category], function(tx, rs) {
					if (rs.rows.length > 0) {
						var art = {};
						art.id = rs.rows.item(0).id;
						art.summary = rs.rows.item(0).summary;
						art.title = rs.rows.item(0).title;
						art.ptime = rs.rows.item(0).ptime;
						art.fav = rs.rows.item(0).fav;
						art.href = rs.rows.item(0).href;
						onLeft(art);
					} else {
						onLeft(null);
					}
				});

				tx.executeSql(rightsql, [articleid2, category], function(tx, rs) {
					if (rs.rows.length > 0) {
						var art = {};
						art.id = rs.rows.item(0).id;
						art.summary = rs.rows.item(0).summary;
						art.title = rs.rows.item(0).title;
						art.ptime = rs.rows.item(0).ptime;
						art.fav = rs.rows.item(0).fav;
						art.href = rs.rows.item(0).href;
						onRight(art);
					} else {
						onRight(null);
					}
				});
			});
		}
	}

	function _load_fav(onSuccess) {
		console.log("_load_fav");

		if (!db) {
			return null;
		} else {
			var categoryList = {};
			categoryList.list = [];
			db.transaction(function(tx) {

				var sql = 'select * from article_list where fav=1 order by ptime desc';

				tx.executeSql(sql, [], function(tx, rs) {
					if (rs.rows.length > 0) {
						for (var i = 0; i < rs.rows.length; i++) {
							var art = {};
							art.author = rs.rows.item(i).author;
							art.count = rs.rows.item(i).count;
							art.href = rs.rows.item(i).href;
							art.id = rs.rows.item(i).id;
							//增加如果是无图模式不显示图
							//art.img=((localStorage.getItem("NoImage")==null || (localStorage.getItem("NoImage"))=="false"))?rs.rows.item(i).img:"app/img/default.png";
							art.ptime = rs.rows.item(i).ptime;
							art.summary = rs.rows.item(i).summary;
							art.tag = rs.rows.item(i).tag;
							art.title = rs.rows.item(i).title;
							art.remark = rs.rows.item(i).remark;
							art.fav = rs.rows.item(i).fav;
							art.href = rs.rows.item(i).href;
							categoryList.list[i] = art;
						}
						onSuccess(categoryList);
					} else {
						onSuccess(null);
					}
				});
			});
		}
	}

	function _load_fs_json_file(articleid, onSuccess, onError) {
		plus.io.requestFileSystem(plus.io.PRIVATE_DOCUMENTS, function(fs) {
			fs.root.getFile("all_list/" + articleid + ".json", {
				create : false
			}, function(fileEntry) {
				//成功文件存在
				fileEntry.file(function(file) {

					var fileReader = new plus.io.FileReader();
					fileReader.readAsText(file, 'utf-8');
					fileReader.onloadend = function(evt) {
						var jresult = evt.target.result;
						//alert('jresult=' + jresult);
						//var jsondata = eval("("+jresult+")");
						//alert('jsondata=' + JSON.stringify(jsondata));
						onSuccess(JSON.parse(jresult));
					};
				});
			}, function(err) {
				console.log("fileEntry does not es, network");
				//错误 文件不存在
				$.ajax({
					type : 'GET',
					url : csdnLit_URL + "Detail/" + articleid + ".json",
					timeout : $.csdn.timeout,
					// data to be added to query string: ÕâÀïÓÐÎÊÌâ£¬Ö»ÓÐµÚÒ»´ÎÐèÒª´«ÕâÐ©²ÎÊý

					// type of data we are expecting in return:
					dataType : 'jsonp',
					success : function(data) {
						_sava_networkdata_to_fs(data, articleid, onSuccess);
					},
					error : function(xhr, type) {
						if (onError)
							onError(type);
					}
				});

			});

		}, function(t) {
			if (onError)
				onError(null, t);
		});
	}

	/* 访问网络获得栏目数据 */
	function _query_network_with_page(category, pagenum, lastNewsId, onSuccess, onError, checkFun) {
		//var _pageNum = category == "news" ? (pagenum - 1) % 4 + 1 : pagenum;
		//最新资讯一次回来40条数据
		var path = category == 'news' ? 
			(csdnLit_URL + category + "list_10_" + pagenum + ".json") : 
			(csdnLit_URL + category + "list_20_" + pagenum + ".json");
			var time = new Date().getTime();
			
		return $.ajax({
			type : 'GET',
			timeout : $.csdn.timeout,
			url : path,//csdnLit_URL + category + "list" + pagenum + ".json",
			// type of data we are expecting in return:
			dataType : 'jsonp',
			success : function(data) {
				var time_tj = new Date().getTime()-time;
				plus.statistic.eventDuration("ajax", time_tj ,category+ "_" +pagenum);
				if (pagenum == 1 && checkFun && checkFun(data))
					return;
				if(!data.list) onError(null, 'timeout');
				_sava_networkdata_to_database_with_page(data, category, pagenum, lastNewsId, onSuccess, onError, checkFun);
			},
			error : function(xhr, type, s2) {
				if(type != 'abort'){
					plus.statistic.eventDuration("ajax", new Date().getTime()-time,category+ "_" +pagenum+ "_" +type);
				}
				if (onError)
					onError(xhr, type);
				else
					dh.alert("发生网络错误，请稍后重试", 2000);
			}
		});

		/*console.log("_query_network_with_page");
		 var req = "url=";
		 for (var i = 0; i < _catagory.length; i++) {
		 if (_catagory[i].id == category) {
		 req = req + _catagory[i].url + pagenum;
		 if (_catagory[i].id == 'news') req = req + "%23";
		 }
		 }

		 req = req + "&action=bs-transfer@mdp&_MSC_CMD_=QRY&nologin=true&phonemodel=Windows||||Microsoft&appid=FE3XK6&cellid=&screensize=640*920&vt=4&truescreensize=640*920&mscver=V3.2.0.BUILD.01.120625.122330&relogin=false&encrypt=false&carrier=PC&MSCID=&loginmode=foreground&appver=1.0&lac=&partnerid=user";
		 console.log(req);
		 return $.ajax({
		 type: 'GET',
		 timeout: $.csdn.timeout,
		 url: csdnLib_SERVERURL,
		 // data to be added to query string: ÕâÀïÓÐÎÊÌâ£¬Ö»ÓÐµÚÒ»´ÎÐèÒª´«ÕâÐ©²ÎÊý
		 data: req,
		 // type of data we are expecting in return:
		 dataType: 'jsonp',
		 success: function(data) {
		 _sava_networkdata_to_database_with_page(data, category, pagenum, lastNewsId, onSuccess, onError);
		 },
		 error: function(xhr, type) {
		 if(onError) onError(xhr, type);
		 else dh.alert("发生网络错误，请稍后重试",'help',2000);
		 }
		 });*/
	}

	/* 保存从网络上得到的数据，保存进入数据库 */
	function _sava_networkdata_to_database_with_page(data, category2, pagenum, lastNewsId, onSuccess, onError, checkFun) {
		var isAndroid = $.csdn.isAndroid(), list = data.list, len = list.length, counter = 0;
		db.transaction(function(tx) {
            var firstnews = data.firstnews;
            if(firstnews){
                tx.executeSql('INSERT OR REPLACE into first_news values(?,?,?,?,?,?,?,?,?,?,?)', [firstnews.id,firstnews.title,firstnews.img,firstnews.ptime,firstnews.category,firstnews.href,firstnews.count,firstnews.remark,firstnews.fav,firstnews.readflag,firstnews.androidimg]);
            }
			for (var index = 0; index < len; index++) {
				_saveNewToDb(tx, list[index], isAndroid, function(result) {
					counter++;
					if (counter == len)
						_loadCategory_page_db(category2, pagenum, lastNewsId, onSuccess, onError);
				});
			}
		});
	}

	/// <summary>
	/// 保存单条数据到数据库中
	/// </summary>
	function _saveNewToDb(transition, data, isAndroid, onSuccess) {
		transition.executeSql('select count(id) as num from article_list where id = ?', [data.id], function(tr, result) {
			if (result.rows.item(0).num != 0) {//已存在记录，更新count和remark
				transition.executeSql('update article_list set remark=?,[count]=? where id = ?', [data.remark, parseInt(data.count, 10), data.id], function(tr, result) {
					if (onSuccess)
						onSuccess(result);
				});
			} else {
				//data.ptime = datenow_from_csdn_network(data.ptime);
				//if(isAndroid) data.img = data.Androidimg;
				transition.executeSql('INSERT into article_list values(?,?,?,?,?,?,?,?,0,0,?)', [data.id, data.title, data.Androidimg, data.ptime, data.category, data.href, parseInt(data.count, 10), data.remark, data.Androidimg], function(tx, result) {
					if (onSuccess)
						onSuccess(result);
				});
			}
		});
	}

	function _clearArticleByCategory(categoryId, onSuccess) {
		db.transaction(function(tx) {
			if (categoryId != "news")
				tx.executeSql('DELETE FROM article_list', [], onSuccess);
			tx.executeSql('DELETE FROM article_list where category = ?', [categoryId], onSuccess);
		});
	}

	function zeroString(nS) {
		var pmonth = nS + "";
		if (pmonth.length == 1)
			pmonth = "0" + pmonth;
		return pmonth;
	}

	function getLocalTime(nS) {

		return nS.getFullYear() + "-" + zeroString(nS.getMonth() + 1) + "-" + zeroString(nS.getDate()) + " " + zeroString(nS.getHours()) + ":" + zeroString(nS.getMinutes());
	}

	/* 从数据库里面读取出来 */
	function _loadCategory_page_db(category, pagenum, lastNewsId, onSuccess, onError) {
		//argv [category,pagenum,lastNewsId,onSuccess];
		console.log("_loadCategory_page_db");

		if (!db) {
			return null;
		} else {

			db.transaction(function(tx) {
				var pagestart = 20 * (pagenum - 1), pageEnd = pagestart + 20;
				var latssql = "";
				//判断lastNewsId
				if (lastNewsId > 0) {
					latssql = "and id < " + lastNewsId;
				}

				var sql = "select * from article_list where category = '" + category + "' " + latssql + " order by ptime desc limit " + pagestart + ", 20";
				if (category == "news") {
					//var _num = argv[5] || 40;
					// pagestart = _num * (argv[1] - 1);
					sql = "SELECT * FROM article_list  ORDER BY ptime DESC LIMIT " + pagestart + ", 20";

					//sql = "SELECT * FROM article_list  ORDER BY ptime DESC LIMIT " + pagestart + ",10";
				}
				tx.executeSql(sql, [], function(tx, rs) {
                    var categoryList = {};
                    categoryList.list = [];
					if (rs.rows.length > 0) {
						console.log(rs.rows);
						for (var i = 0; i < rs.rows.length; i++) {
							var art = {}, item = rs.rows.item(i);
							//id, title, img, ptime, category, href, count, remark, fav, readflag
							//art.author = item.author;
							art.id = item.id;
							art.title = item.title;
							art.img = item.img;
							art.ptime = item.ptime;
							art.category = item.category;
							art.href = item.href;
							art.count = item.count;
							art.remark = item.remark;
							art.fav = item.fav;
							art.readflag = item.readflag;
							art.androidimg = item.androidimg;
							categoryList.list[i] = art;
						}
                        if (category == "news" && pagenum == 1) {
                            tx.executeSql('Select * From first_news order by ptime desc Limit 1', [], function(tx, rs){
                                if (rs.rows.length > 0) {
                                  var item = rs.rows.item(0);
                                categoryList.firstnews = {
                                        id:item.id,
                                        title:item.title,
                                        img:item.img,
                                        ptime:item.ptime,
                                        count:item.count,
                                        remark:item.remark,
                                        author:item.author,
                                        href:item.href
                                    }
                                }
                                if (onSuccess){
                                    onSuccess(categoryList);
                                }
                            })
                        }
                        else{
                            if (onSuccess){
                                onSuccess(categoryList);
                            }
                        }
					}else{
                        if (onSuccess){
                            onSuccess();
                        }
                    }
				});
			});
		}
	}

	/* 统一处理要求所有事务都结束才能触发的条件 */
	var _full_success_callback_count = 0;
	/*function _process_full_success_callback(onSuccess, argv){
	_full_success_callback_count--;
	if(_full_success_callback_count==0){
	onSuccess(argv);
	}
	}*/

	//从这里开始处理下载缓存的业务逻辑
	function _download_news_list(onSuccess, onError, onStatus) {
		var listurl = csdnLib_SERVERURL_CACHE + "/all_list.zip";
		var dt = plus.downloader.createDownload(listurl, {
			filename : "_doc/"
		}, null);
		dt.addEventListener('statechanged', function(d, status) {
			if (d.state == 4) {
				if (status == 200) {
					//下载成功了,开始解压zip
					console.log("Download success: " + d.getFileName());
					plus.zip.decompress(d.getFileName(), '_doc/', function() {
						plus.io.requestFileSystem(plus.io.PRIVATE_DOCUMENTS, function(fs) {
							fs.root.getFile("all_list.json", {
								create : false
							}, function(fileEntry) {
								//成功文件存在
								fileEntry.file(function(file) {
									var fileReader = new plus.io.FileReader();
									fileReader.readAsText(file, 'utf-8');
									fileReader.onloadend = function(evt) {
										onSuccess(JSON.parse(evt.target.result));
									};
								});
							}, function(err) {
								//alert(err.code);
								console.log("fileEntry does not es, network" + err.messsage);
								onError(-1, "文件下载读取失败，请稍后再试");
							});
						});
					}, function() {
						onError(-1, "Decompress error!");
					});
				} else {
					onError(-2, "文件下载失败，可能网络繁忙，请稍后再试");
				}

			} else if (d.state == 3) {
				onStatus(d.downloadedSize, d.totalSize);
			}
		}, false);
		dt.start();
	}

	/***
	 * 分析下载下来的数据
	 * @param data
	 * @private
	 */
	//var downloadHM = new HashMap();
	function _download_analyse_listdata(data, onError, onSuccess) {
		var isAndriod = $.csdn.isAndroid(), len = data.list.length, updateIndex = 0;
		db.transaction(function(tx) {
			//downloadHM.put("fullLength",data.list.length);
			$.each(data.list, function(index, news) {
				_saveNewToDb(tx, news, isAndroid, function() {
					updateIndex++;
					if (updateIndex == len && onSuccess)
						onSuccess();
				})
			});

		});
	}

	//这里是将通过点击搜索列表点出的数据存储到数据库中
	function _saveFile2DB(news, onSuccess) {
		//alert(JSON.stringify(news));
		var argv = ['search', '1', '', onSuccess];
		if (!db) {
		} else {

			db.transaction(function(tx) {
				tx.executeSql('INSERT OR REPLACE into article_list values(?,?,?,?,?,?,?,?,?,0)', [news.id, news.title, news.summary, news.img, news.ptime, news.tag, 'search', news.href, news.remark], _process_full_success_callback(onSuccess, argv));

			});
		}
	}

	//这里缓存图片
	function _saveImg2File(data, onSuccess) {
		//var argv = ['search', '1', '', onSuccess];
		if (!db) {
		} else {

			for (var i = 0; i < data.list.length; i++) {
				var news = data.list[i];
				//保存图片
				//图片不为空,没有缓存过才需要缓存,不包含localhost就是没有缓存

				if (news.img != null && news.img != "" && news.img.indexOf("localhost") < 0) {
					var imgfileName = news.img.substring(news.img.lastIndexOf('/') + 1);
					var downloadImgFile = news.img;
					_downIndexImg(imgfileName, downloadImgFile, news);

				}

			}
		}
	}

	/**
	 * @作者：wl
	 * @时间：2013/03/19 21:04:10
	 * @param imgName:
	 * @param  imgFullPath:
	 * @param  newsid :
	 * @param onStatus:
	 * @描述： 为列表存储图片
	 */
	//这真是悲剧,再封一个方法吧
	function _downIndexImg(imgfileName, downloadImgFile, news) {
		plus.io.requestFileSystem(plus.io.PRIVATE_DOCUMENTS, function(fs) {
			fs.root.getFile("img/" + imgfileName, {
				create : false
			}, function(fileEntry) {
				//成功文件存在
				news.img = "http://localhost:13131/_doc/img/" + imgfileName;
				db.transaction(function(tx) {
					tx.executeSql('INSERT OR REPLACE into article_list values(?,?,?,?,?,?,?,?,?,0)', [news.id, news.title, news.summary, news.img, news.ptime, news.tag, news.category, news.href, news.remark], null);
				});
				var imgs = document.querySelectorAll("#img" + news.id), img0 = imgs[0], img1 = imgs[1];
				if (img0) {
					img0.src = news.img;

				}
				if (img1) {
					img1.src = news.img;
				}

			}, function(err) {

				var dt = plus.downloader.createDownload(downloadImgFile, {
					filename : "_doc/img/"
				}, function(d, status) {
					if (status == 200) {
						console.log("Download success: " + d.getFileName());
						news.img = "http://localhost:13131/_doc/img/" + imgfileName;

						db.transaction(function(tx) {
							tx.executeSql('INSERT OR REPLACE into article_list values(?,?,?,?,?,?,?,?,?,0)', [news.id, news.title, news.summary, news.img, news.ptime, news.tag, news.category, news.href, news.remark], null);
						});
						var imgs = document.querySelectorAll("#img" + news.id), img0 = imgs[0], img1 = imgs[1];
						if (img0) {
							img0.src = news.img;

						}
						if (img1) {
							img1.src = news.img;
						}

					} else {

						var imgs = document.querySelectorAll("#img" + news.id), img0 = imgs[0], img1 = imgs[1];
						if (img0) {

							img0.src = news.img;

						}
						if (img1) {
							img1.src = news.img;
						}
					}
				});
				dt.start();

			});
		});
	}

	/**
	 * @作者：
	 * @时间：2013/03/19 21:08:48
	 * @描述： 缓存图片
	 */
	function _saveShowImg2File(imgs, onSuccess) {
		//data.ptime = data.ptime;
		if (imgs && imgs.length > 0) {
			for (var i = 0; i < imgs.length; i++) {
				var img = imgs[i];
				var imgfileName = img.substring(img.lastIndexOf('/') + 1);
				var downloadImgFile = img;

				_downShowImg(imgfileName, downloadImgFile);
				//			  	  jsondata = jsondata.replace(downloadImgFile,lastFileName);
			}
		}
	}

	/**
	 * @作者：
	 * @时间：2013/03/19 21:06:42
	 * @param imgfileName:
	 * @param downloadImgFile:
	 * @param news:
	 * @描述： 为详情缓存图片
	 */
	function _downShowImg(imgfileName, downloadImgFile) {
		try {
			plus.io.requestFileSystem(plus.io.PRIVATE_DOCUMENTS, function(fs) {
				fs.root.getFile("img/" + imgfileName, {
					create : false
				}, function(fileEntry) {
					//成功文件存在
					console.log("文件存在");
					var newimg = "http://localhost:13131/_doc/img/" + imgfileName;

					var imgs = document.querySelectorAll("img[rc='img/default.png?" + imgfileName + "']");
					var img0 = imgs[0], img1 = imgs[1];
					if (img0) {
						img0.src = newimg;
					}
					if (img1) {
						img1.src = newimg;
					}
				}, function(err) {

					var dt = plus.downloader.createDownload(downloadImgFile, {
						filename : "_doc/img/"
					}, function(d, status) {
						if (status == 200) {
							console.log("Download success: " + d.getFileName());
							var newimg = "http://localhost:13131/_doc/img/" + imgfileName;
							var imgs = document.querySelectorAll("[src='img/default.png?" + imgfileName + "']");
							var img0 = imgs[0], img1 = imgs[1];
							if (img0) {
								img0.src = newimg;
							}
							if (img1) {
								img1.src = newimg;
							}
						} else {
							console.log("下载图片失败");
						}
					});
					dt.start();

				});
			});
		} catch(e) {
			//alert(e.message);
		}
	}

	/**
	 * used like java.util.HashMap
	 */
	/**
	 * HashMap构造函数
	 */
	function HashMap() {
		this.length = 0;
		this.prefix = "hashmap_prefix_20090924_";
	}

	/**
	 * 向HashMap中添加键值对
	 */
	HashMap.prototype.put = function(key, value) {
		if (!this.containsKey(key)) {
			this.length++;
		}
		this[this.prefix + key] = value;
	}
	/**
	 * 从HashMap中获取value值
	 */
	HashMap.prototype.get = function(key) {
		return typeof (this[this.prefix + key]) == "undefined" ? null : this[this.prefix + key];
	}
	/**
	 * 从HashMap中获取所有key的集合，以数组形式返回
	 */
	HashMap.prototype.keySet = function() {
		var arrKeySet = new Array();
		var index = 0;
		for (var strKey in this) {
			if (strKey.substring(0, this.prefix.length) == this.prefix)
				arrKeySet[index++] = strKey.substring(this.prefix.length);
		}
		return arrKeySet.length == 0 ? null : arrKeySet;
	}
	/**
	 * 从HashMap中获取value的集合，以数组形式返回
	 */
	HashMap.prototype.values = function() {
		var arrValues = new Array();
		var index = 0;
		for (var strKey in this) {
			if (strKey.substring(0, this.prefix.length) == this.prefix)
				arrValues[index++] = this[strKey];
		}
		return arrValues.length == 0 ? null : arrValues;
	}
	/**
	 * 获取HashMap的value值数量
	 */
	HashMap.prototype.size = function() {
		return this.length;
	}
	/**
	 * 删除指定的值
	 */
	HashMap.prototype.remove = function(key) {
		if (this.containsKey(key)) {
			delete this[this.prefix + key];
			this.length--;
		}
	}
	/**
	 * 清空HashMap
	 */
	HashMap.prototype.clear = function() {
		for (var strKey in this) {
			if (strKey.substring(0, this.prefix.length) == this.prefix)
				delete this[strKey];
		}
		this.length = 0;
	}
	/**
	 * 判断HashMap是否为空
	 */
	HashMap.prototype.isEmpty = function() {
		return this.length == 0;
	}
	/**
	 * 判断HashMap是否存在某个key
	 */
	HashMap.prototype.containsKey = function(key) {
		for (var strKey in this) {
			if (strKey == this.prefix + key)
				return true;
		}
		return false;
	}
	/**
	 * 判断HashMap是否存在某个value
	 */
	HashMap.prototype.containsValue = function(value) {
		for (var strKey in this) {
			if (this[strKey] == value)
				return true;
		}
		return false;
	}
	/**
	 * 把一个HashMap的值加入到另一个HashMap中，参数必须是HashMap
	 */
	HashMap.prototype.putAll = function(map) {
		if (map == null)
			return;
		if (map.constructor != JHashMap)
			return;
		var arrKey = map.keySet();
		var arrValue = map.values();
		for (var i in arrKey)
		this.put(arrKey[i], arrValue[i]);
	}
	//toString
	HashMap.prototype.toString = function() {
		var str = "";
		for (var strKey in this) {
			if (strKey.substring(0, this.prefix.length) == this.prefix)
				str += strKey.substring(this.prefix.length) + " : " + this[strKey] + "\r\n";
		}
		return str;
	}
	function _getDatabaseConnection() {
		return openDatabase(webSQL_DB_NAME, '0.9.4', 'Offline document storage', 5 * 1024 * 1024);
	}

	/*function _insertData(db) {
	 console.log("_insertData");
	 db.transaction(function (tx) {
	 tx.executeSql('INSERT OR REPLACE into article_list values(?,?,?,?,?,?,?,?,?,0)', [1, "news.title", "news.summary", "news.img", "news.ptime", "news.tag", "category", "news.href", 0]);
	 tx.executeSql('INSERT OR REPLACE into article_list values(?,?,?,?,?,?,?,?,?,0)', [2, "news.title", "news.summary", "news.img", "news.ptime", "news.tag", "category", "news.href", 0]);
	 tx.executeSql('INSERT OR REPLACE into article_list values(?,?,?,?,?,?,?,?,?,0)', [3, "news.title", "news.summary", "news.img", "news.ptime", "news.tag", "category", "news.href", 0]);
	 tx.executeSql('INSERT OR REPLACE into article_list values(?,?,?,?,?,?,?,?,?,0)', [4, "news.title", "news.summary", "news.img", "news.ptime", "news.tag", "category", "news.href", 0]);
	 tx.executeSql('INSERT OR REPLACE into article_list values(?,?,?,?,?,?,?,?,?,0)', [5, "news.title", "news.summary", "news.img", "news.ptime", "news.tag", "category", "news.href", 0]);
	 });
	 }*/

	function _checkIsExistsTable(db) {
		/*if(!db){
		 alert("_checkIsExistsTable db is null");
		 }*/
		db.transaction(function(tx) {
			//tx.executeSql('drop table article_list' , [], function(){});
			//tx.executeSql('drop table first_news' , [], function(){});
			tx.executeSql('create table if not exists article_list (id num PRIMARY KEY,title text, img text, ptime datetime, category text, href text, count num, remark num, fav num, readflag bit, androidimg text)', []);
            tx.executeSql('create table if not exists first_news (id num PRIMARY KEY,title text, img text, ptime datetime , category text, href text, count num, remark num, fav num, readflag bit, androidimg text)', []);
			//tx.executeSql('create table if not exists article_list (id num PRIMARY KEY,title text,summary text, img text, ptime datetime, tag text, category text,  href text, remark num  , fav num)', []);
			//tx.executeSql('create table if not exists article_fav (id num PRIMARY KEY,title text,summary text, img text, ptime datetime, tag text, category text,  href text, remark num , fav num)', []);
		});
	}

})(Zepto); 