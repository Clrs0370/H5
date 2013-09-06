(function (C) {

    if (!C.RemarkPage)
        C.RemarkPage = function () { }

    var RP = C.RemarkPage,
		W = $.MyWidget, L = W.NLocal;

    $.extend(true, RP.prototype, C, {
        pagenum: 1,
        isShowingLogin: false,
        isShowComment: false,
        isShowReplay: false,
        OnReady: function () {
            var that = this,
				doc = document,
				cacheKey = that.cacheKey;
            try {
                //that.href = L.getItem(cacheKey.articleUrl);
                //that.href = "http://www.csdn.net/article/2013-04-10/2814837-interview-with-nimblebits-david-marsh";
                //that.title = L.getItem(cacheKey.articleTitle);
				plus.statistic.eventTrig("remark");
                that.href = L.getItem(cacheKey.articleUrl);
                that.title = L.getItem(cacheKey.articleTitle);
                //that.href = "http://www.csdn.net/article/2013-06-03/2815514";
                dh.init();
                that.getComment(1);
                
                that._bind("click", doc.getElementById("left_back"));
                that._bind("click", doc.getElementById("txtWrite"));
                //that._bind("touchstart", doc);
				//that._bind('scroll', window);
                
                $('#txtWrite').css('line-height','20px');
				$('#username').css('line-height','20px');
				$('#password').css('line-height','20px');
                
                //that._bind("click", doc.getElementById("container"));

				that.androidMenu(function(){});
                that.androidBack(function (e) {
                    try {
                        var startTime = that.clickTime,
							endTime = new Date().getTime();
                        if (that.isShowingLogin) {
                            that.closeLogin.call(that);
                            return;
                        }
                        if (that.isShowComment) {
                            that.closeWriteComment.call(that);
                            return;
                        }
                        if (that.isShowReplay) {
                            that.closeReplay.call(that);
                            return;
                        }
                        if (startTime && endTime - startTime < 600) {
                            that.clickTime = endTime;
                            return;
                        }

                        that.clickTime = endTime;
                        that.back();
                    }
                    catch (ex) {
                        that.showErr(ex);
                    }
                });
                
                that.slider = new W.slider(document, {
  					onLeft: function(e){
  						//console.log('onLeft');
  						if (that.isShowComment) {
							return;							 
  						}
  						that.back();
  					},
  					onMove: function(e){
  						that.closeReplay();
  					},
  					onScroll: function(e){
  						that.scroll(e);
  					},
  					onStatic: function(e){
  						var t = e.target, username = t.getAttribute("username");
  			  			if (username) {
  			  				that.showReplay(t.tagName == "DIV" ? t : t.parentNode);
  			  			}
  					}
  				});
                that.slider.enable();
            }
            catch (e) {
                that.showErr(e);
            }
        },
        scroll: function(e){
			var that = this,
				w = window,
				pageYOffset = w.pageYOffset;
			var diffY = that._scrollY - pageYOffset;
			that._scrollY = pageYOffset;

			if(!that.isLoading && diffY < 0 && w.pageYOffset + that.innerHeight + 30 >= that.scrollHeight ){
				that.isLoading = true;
				if(that.loadDataTimer) clearTimeout(that.loadDataTimer);
				that.loadDataTimer = setTimeout(function(){
					that.getComment(that.pagenum);
				}, 50);
			}
		},
        handleEvent: function (e) {
            try {
                var that = this,
					t = e.target,
					tag = t.tagName,
					parent = t.parentNode,
					id = t.id,
					doc = document;
				
                switch (id || parent.id) {
                    case "txtWrite":
                    	that.closeReplay();
                        that.showWriteComment();
                        return true;
                    case "left_write":
                        that.closeWriteComment();
                        return true;
                    case "left_back":
                        that.back();
                        return true;
                    case "check_reply":
                        that.commitComment();
                        return true;
                    case "left_login":
                        that.closeLogin();
                        return true;
                    case "check_login":
                        that.login();
                        return true;
                    case "reply":
                        that.showWriteComment();
                        break;
                }

                return false;
            }
            catch (ex) {
                this.showErr(ex);
            }
        },
        showReplay: function (target) {
            try {
                var username = target.getAttribute("username"),
					commentid = target.getAttribute("commentid"),
                    tails = document.getElementById("tails"),
					top = target.children[0].offsetTop + tails.clientHeight - 55,

					span = target.getElementsByTagName("span")[0],
					that = this,
					doc = document;
                //var re = "@" + $(this).children("span").text();
                //current = re;
                var _top = top;

                if (_top < 0) _top = 0;
                tails.style.top = _top + "px";
                tails.style.left = 0;
                that.replayData = "回复@" + target.getAttribute("username") + ":";
                if (that.isShowReplay) return;
                that.isShowReplay = true;
                that._bind("click", doc.getElementById("reply"));
            }
            catch (ex) {
                this.showErr(ex);
            }
        },
        closeReplay: function () {
            var doc = document,
				that = this;
            if (!that.isShowReplay) return;
            that.isShowReplay = false;
            doc.getElementById("tails").style.left = "-100%";
            that._unbind("click", doc.getElementById("reply"));
        },
        showLogin: function () {
            var doc = document,
				that = this;
            if (that.isShowingLogin) return;
            that.isShowingLogin = true;
            doc.getElementById("login").style.display = "block";
            doc.getElementById("login").style.top = "0px";
            //doc.getElementById("login").style.display = "block";
            that._bind("click", doc.getElementById("left_login"));
            that._bind("click", doc.getElementById("check_login"));
        },
        login: function () {
            var doc = document,
				that = this,
				userName = doc.getElementById("username"),
				userNameVal = userName.value,
				password = doc.getElementById("password"),
				passwordVal = password.value,
				loginurl = "https://passport.csdn.net/ajax/accounthandler.ashx?t=log&u=" + userNameVal + "&p=" + passwordVal,
				loginreq = "action=bs-transfer@mdp&_MSC_CMD_=QRY&nologin=true&phonemodel=Windows||||Microsoft&appid=FE3XK6&cellid=&screensize=640*920&vt=4&truescreensize=640*920&mscver=V3.2.0.BUILD.01.120625.122330&relogin=false&encrypt=false&carrier=PC&MSCID=&loginmode=foreground&appver=1.0&lac=&partnerid=user&url=" + encodeURIComponent(loginurl);

            $.ajax({
				type : 'GET',
				url : that.serverurl,
				timeout : that.timeout,
				data: loginreq,
				dataType : 'jsonp',
				success : function(data) {
					//为了更好的体验，先隐藏，再显示这俩
	                if (data.success) {//如果登录成功
	                    //乌拉！登录成功了，好吧您老可以歇着了
	                    //如果这个时候勾选了记住密码，那么存到缓存里面
	                    var cacheKey = that.cacheKey;
	                    L.setItem(cacheKey.userName, userNameVal);
	                    L.setItem(cacheKey.password, passwordVal);
	                    that.commitComment(userNameVal, passwordVal);
	                    that.closeLogin.call(that);
	                    /*var cookie_UserInfo = data.cookie_UserInfo;
	                    var cookie_UN = data.cookie_UN;
	                    var cookie_UserName = data.cookie_UserName;
	                    var cookie_access_token = data.cookie_access_token;
	                    //都完了就发评论
	                    active_reply(cookie_UserInfo, cookie_UN, cookie_UserName, cookie_access_token);*/
	
	                } else {
	                    dh.alert(data.message,1500);
	                }
	                //$("#pullUp").css("visibility", "visible");
	                //$("#pullDown").css("visibility", "visible");
				},
				error : function(xhr, type) {
					dh.alert("网络不给力");
				}
			});
        },
        closeLogin: function () {
            var doc = document,
				that = this;
            if (!that.isShowingLogin) return;
            that.isShowingLogin = false;
            doc.getElementById("login").style.display = "none";
            doc.getElementById("main").style.display = "block";
            that._unbind("click", doc.getElementById("left_login"));
            that._unbind("click", doc.getElementById("check_login"));
        },
        showWriteComment: function () {
            var doc = document,
				that = this;
  			window.scrollTo(0, 0);
			doc.getElementById('body').style.overflow = 'hidden';
  			doc.getElementsByTagName('html')[0].style.overflow = 'hidden';
            if (that.isShowComment) return;
            that.isShowComment = true;
            var content = doc.getElementById("content");
            
            if (that.isShowReplay) {
                content.value = that.replayData;
                doc.getElementById("remarktitle").innerHTML = "回复评论";
            }
            else {
                doc.getElementById("remarktitle").innerHTML = "写评论";
                content.value = "";
            }
            doc.getElementById("write").style.display = "block";
            doc.getElementById("write").style.overflow = "hidden";
            doc.getElementById("write").style.top = "0px";
            doc.getElementById("main").style.display = "none";
            //content.focus();
            //content.select();
            
            that._bind("click", doc.getElementById("left_write"));
            that._bind("click", doc.getElementById("check_reply"));
        },
        closeWriteComment: function () {
            var doc = document,
				that = this;
			doc.getElementById('body').style.overflow = 'scroll';
  			doc.getElementsByTagName('html')[0].style.overflow = '';
            if (!that.isShowComment) return;
            that.isShowComment = false;
            doc.getElementById("write").style.display = "none";
            doc.getElementById("main").style.display = "block";
            that._unbind("click", doc.getElementById("left_write"));
            that._unbind("click", doc.getElementById("check_reply"));
        },
        commitComment: function (_username, _password) {
            //第一步判断有没有登录过（其实就是看有没有记录登录信息）
            var doc = document,
				content = doc.getElementById("content"),
				contentVal = content.value.replace(/(^\s*)|(\s*$)/g, '');

            if (!contentVal || contentVal == " ") {
                dh.alert("评论内容不可以为空，请确认", 1500);
                setTimeout(function () {
                    content.focus();
                }, 1500);
                return;
            }
            var that = this,
				cacheKey = that.cacheKey,
				username = _username || L.getItem(cacheKey.userName),
				password = _password || L.getItem(cacheKey.password);
            //如果用户名密码都不是空，那么说明登录过，好吧先登录后发评论
            if (username && password) {
                var posturl = "http://ptcms.csdn.net/comment/comment/do_comment?url=" + that.href + "&&title=" + that.title + "&body=" + contentVal,
					loginurl = "https://passport.csdn.net/ajax/accounthandler.ashx?t=log&u=" + username + "&p=" + password + "&url2=" + posturl,
					loginreq = "action=bs-transfer@mdp&_MSC_CMD_=QRY&nologin=true&phonemodel=Windows||||Microsoft&appid=FE3XK6&cellid=&screensize=640*920&vt=4&truescreensize=640*920&mscver=V3.2.0.BUILD.01.120625.122330&relogin=false&encrypt=false&carrier=PC&MSCID=&loginmode=foreground&appver=1.0&lac=&partnerid=user&url=" + encodeURIComponent(loginurl);
                //在目前情况下，我只能先登录然后发评论，以下是登录代码
                $.ajax({
					type : 'GET',
					url : that.serverurl,
					timeout : that.timeout,
					data: loginreq,
					dataType : 'jsonp',
					success : function(data) {
						try {
	                        //判断登录成功没
	                        if (data.success) {
	                            //如果登录成功，开始发评论
	                            //dh.alert("评论成功！", 'ok', 1000);
	                            that.pagenum = 1;
	                            that.getComment(1);
	                            that.closeWriteComment();
	                        } else {
	                            //如果登录失败，那么调出登录界面
	                            dh.alert(data.msg,1500);
	                            if (data.msg === "登录失败") {
	                                that.closeWriteComment.call(that);
	                                doc.getElementById("username").select();
	                                doc.getElementById("username").focus();
	                            } else {
	                                that.closeWriteComment.call(that);
	                                content.focus();
	                                content.select();
	                            }
	                        }
	                    }
	                    catch (ex) {
	                        that.showErr(ex);
	                    }
	                    //csdn的詭異做法，评论為嘛還要傳文章url呢？先获取url吧
					},
					error : function(xhr, type) {
						dh.alert("网络不给力");
					}
				});
            } else {
                //神马！你居然没有登录过？登录去撒
                that.closeWriteComment.call(that);
                that.showLogin.call(that);
                doc.getElementById("main").style.display = "none";
                doc.getElementById("username").focus();
                doc.getElementById("username").select();
            }

        },
        showComment: function (data, pagenum) {
            try {
                var index = 0,
					len = data.length,
					doc = document,
					container = doc.getElementById("container"),
					body_height = doc.getElementById("body").clientHeight,
					that = this;
					that.isLoading = false;
                if (!data || data.length == 0) {
					if(pagenum == 1 && data.length == 0){
						document.getElementById("pullUpLabel").innerHTML = "";
						container.innerHTML = '<div class="nocomment"><img src="img/sofa.png" height="96" width="84"></img></div>';
	                    doc.getElementById("loadingcontent").style.opacity = "0";	                    
	                    doc.getElementById("main").style.opacity = "1";
	                    window.scrollTo(0, 0);
	                    doc.getElementById("body").style.overflow = "hidden";
	                    doc.getElementsByTagName('html')[0].style.overflow = 'hidden';
						return;
					}
  					if(pagenum != 0){
  						document.getElementById("pullUpLabel").innerHTML = "没有更多的评论了";
  						return;
  					}
                }
                if (pagenum == 1) {
                    that.closeReplay.call(that);
                    container.innerHTML = "";
                    for (; index < len; index++) {
                    	container.appendChild(that.getCommentObj(data[index]));
                    }
                    if (data.length < 20) {
                    	document.getElementById("pullUpLabel").innerHTML = "";
                    };
                }
                else {
                    for (; index < len; index++) {
                    	container.appendChild(that.getCommentObj(data[index]));
                    }
                }

                wrapper_height = doc.getElementById("wrapper").scrollHeight;
                
                if((wrapper_height + 42) >= body_height){
                	doc.getElementById("body").style.overflow = "scroll";
                }else{
                	doc.getElementById("body").style.overflow = "hidden";
                }
                
                
                
                that.scrollHeight = doc.body.scrollHeight;
                if(pagenum==1){ 
                	that.innerHeight = window.innerHeight;
                	doc.getElementById("loadingcontent").style.opacity = "0";
	                doc.getElementById("main").style.opacity = "1";
	                setTimeout(function(){
                    	doc.getElementById("loadingcontent").style.display = "none";
                    },100);
                }
				that.pagenum = pagenum + 1;
            }
            catch (ex) {
                this.showErr(ex);
            }
        },
       	getCommentObj: function(d){
       		try{
	       		var doc = document,
	       			comment = doc.createElement("div"),
	       			logo = doc.createElement("div"),
	       			content = doc.createElement("div"),
	       			username = d.username;

                this.noImage = L.getItem(this.cacheKey.noImage);
                //this.noImage = false;
                if(!this.noImage){
                    logo.innerHTML = '<img src="' + d.img + '"/>';
                    logo.setAttribute("class", "logo");
                    logo.setAttribute("username", username);
                    comment.appendChild(logo);
                }else{
                    content.setAttribute("style", "margin-left:0px");
                }

	            content.setAttribute("class", "content");
	            content.innerHTML = '<span username="' + username + '">' + username + '</span>&#160;&#160;&#160;' + d.ptime + '<p username="' + username + '">' + d.body + '</p>';
	            content.setAttribute("username", d.username);
	            comment.setAttribute("username", username);
	            comment.setAttribute("class", "comment");
	            comment.appendChild(content);
            	return comment;
            }
       		catch(ex){
       			this.showErr(ex);
       		}
       		finally{
       			comment = null;
       			logo = null;
       			content = null;
       		}
       	},
        getComment: function (pagenum) {
            var that = this;
            var url = "http://ptcms.csdn.net/comment/comment/newest?url=" + that.href + "&pageno=" + pagenum + "&pagesize=50&jsonpcallback=jsonp1358762124086", 
				req = "action=bs-transfer@mdp&_MSC_CMD_=QRY&nologin=true&phonemodel=Windows||||Microsoft&appid=FE3XK6&cellid=&screensize=640*920&vt=4&truescreensize=640*920&mscver=V3.2.0.BUILD.01.120625.122330&relogin=false&encrypt=false&carrier=PC&MSCID=&loginmode=foreground&appver=1.0&lac=&partnerid=user&url=" + encodeURIComponent(url);
            
			$.ajax({
				type : 'GET',
				url : that.serverurl,
				timeout : that.timeout,
				data: req,
				dataType : 'jsonp',
				success : function(data) {
					if(pagenum == 1 && data.remark != 0) document.getElementById("comment_count").innerHTML = data.remark + '条评论';
					that.showComment(data.list, pagenum);
				},
				error : function(xhr, type) {
					dh.alert("网络不给力");
				}
			});
        }
    });

    var page = new RP();
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
