(function (C) {

    if (!C.SettingPage)
        C.SettingPage = function () { }

    var SP = C.SettingPage,
		L = $.MyWidget.NLocal;

    $.extend(true, SP.prototype, C, {
		/// <summary>
        /// 是否在显示意见返回页面
        /// </summary>
		isShowingFeedback: false,
		/// <summary>
        /// 是否在显示登陆页面页面
        /// </summary>
		isShowingLogin: false,
		BeforeReady: function(){
			try{
                var that = this,
					doc = document,
                    size = "0.0",
				    cacheKey = that.cacheKey,
                    fixNum,
                    fixedNum;
				dh.init();
				//字体设置
				doc.getElementById("selFont").value = that.getFontSize(cacheKey.FontSize).text;
				//推送设置
				//doc.getElementById("pushSwitch").checked = L.getItem(cacheKey.push) ? true : false;
				//无图设置
				doc.getElementById("imgSwitch").checked = L.getItem(cacheKey.noImage) ? true: false;
                //计算缓存文件大小
                plus.io.requestFileSystem( plus.io.PRIVATE_DOCUMENTS, function( fs ) {
                    fs.root.getDirectory( "", {create: false}, function ( entry ) {
						entry.getMetadata(function(folder){
                             doc.getElementById("clearCache").innerHTML = (folder.size/(1024*1024)).toFixed(2) + "MB";
						}, function(){
							doc.getElementById("clearCache").innerHTML = "0.00MB";
						}, true);
                        
                    });
                }); 
			}
			catch(ex){
				this.showErr(ex);
			}
		},
        OnReady: function () {
			var that = this,
				doc = document;
				//cacheKey = that.cacheKey;
			try{
  				
				$('#username').css('line-height','20px');
				$('#password').css('line-height','20px');
				//绑定事件
				//设置字体
                that.androidMenu(function(){});
				that._bind("change", doc.getElementById("selFont"));
				that._bind("change", doc.getElementById("imgSwitch"));
				//about页面
                that._bind("click", doc.getElementById("about"));
				//我的账号
				that._bind("click", doc.getElementById("setting_login"));
				that._bind("click", doc.getElementById("check_login"));
				that._bind("click", doc.getElementById("check_logout"));
				that._bind("click", doc.getElementById("left_back"));
				that._bind("click", doc.getElementById("left_login"));
				that._bind("click", doc.getElementById("left_logout"));
				that._bind("click", doc.getElementById("setting_feedback"));
				that._bind("click", doc.getElementById("check_feedback"));
				that._bind("click", doc.getElementById("left_feedback"));
				that._bind("click", doc.getElementById("clearCache"));
				that._bind("click", doc.getElementById("login_li"));
                that.init();
				that.androidBack(function(e){
						if(that.isShowingFeedback){
							doc.getElementById("feedback").style.display = "none";
							that.isShowingFeedback = false;
							return;
						}
						if(that.isShowingLogin){
							that.isShowingLogin = false;
							doc.getElementById("login").style.left = "100%";
							doc.getElementById("logout").style.display = "none";
							return;
						}

						var startTime = that.clickTime,
							endTime = new Date().getTime();
						if(startTime && endTime - startTime < 600) {
							that.clickTime = endTime;
							return;
						}

						that.clickTime = endTime;
						that.back();

					});
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
				switch(id || parent.id){
					case "imgSwitch":
                        $("div.switch-inner").addClass("anination-switch-inner");
						L.setItem(that.cacheKey.noImage, t.checked);
						return true;
					case "selFont":
						that.changeFont(t.value);
						return true;
					case "check_login":
						that.isShowingLogin = false;
						that.checkLogin();
						return true;
					case "login_li":
					case "check_logout":
						that.checkLogout();
						return true;
					case "left_back":
						that.back();
						return true;
					case "left_login":
					case "left_logout":
						that.isShowingLogin = false;
						var doc = document;
						doc.getElementById("login").style.left = "100%";
						doc.getElementById("logout").style.display = "none";
						document.getElementById("main").style.display = "block";
						return true;
					case "setting_feedback":
						that.isShowingFeedback = true;
						document.getElementById("feedback").style.display = "block";
						return true;
					case "check_feedback":
						that.isShowingFeedback = false;
						dh.alert("您的意见我们已保存，感谢您参与CSDN互动");
		 				document.getElementById("feedback").style.display = "none";
						return true;
					case "left_feedback":
						that.isShowingFeedback = false;
						document.getElementById("feedback").style.display = "none";
						return true;
					case "setting_login":
						that.isShowingLogin = true;
//						document.getElementById("login").style.left = "0";
//						document.getElementById("loading1").style.display = "block";
//			 			document.getElementById("loading2").style.display = "none";
						that.showLoginPage();
						return true;
					case "clearCache":
						that.clear();
                        //document.getElementById("clearCache").innerHTML = "0.0MB";
						return true;
					case "about":
						var win = plus.ui.createWindow("app/about.html", {name: "ABOUTWIN", left:'0',top:'0',width:'100%',height:'100%'});
						win.show('slide-in-right',300);
                        break;
				}
				return false;
			}
			catch(ex){
				this.showErr(ex);
			}
		},
		clear: function(){
			plus.statistic.eventTrig("clearCache");
            //更新缓存数据库中的图片关系
            this.db.transaction(function(tx) {
                tx.executeSql('update article_list set Androidimg = img, readflag = 0', [], function(tx, rs){
					if(rs.rowsAffected == 0) return; 
					plus.io.requestFileSystem( plus.io.PRIVATE_DOCUMENTS, function( fs ) {
						fs.root.getDirectory( "img", {create: false}, function ( entry ) {
							entry.removeRecursively(function(){
							});
						});
						fs.root.getDirectory( "all_list", {create: false}, function ( entry ) {
							entry.removeRecursively();
						});
					}); 
				});
            });
            
            document.getElementById("clearCache").innerHTML = "0.00MB";
            dh.alert("缓存清理完毕!");
		},
		changeFont: function(val){
			var that = this;
			that.setFontSize({text: val, value: that.customerFontSize[val]});
		},
		showLoginPage: function(){
			var doc = document,
				login = doc.getElementById("login"),
				logout = doc.getElementById("logout"),
				that = this;
			if(!L.getItem(that.cacheKey.userName)){
				doc.getElementById("username").value = "";
				doc.getElementById("password").value = "";
				login.style.left = "0";
				logout.style.display = "none";
				document.getElementById("loading2").style.display = "none";
				document.getElementById("loading1").style.display = "block";
			}else{
				login.style.left = "0";
				document.getElementById("loading1").style.display = "none";
				document.getElementById("loading2").style.display = "block";
                doc.getElementById('check_logout').style.display = "none";
				that.getUserInfo();
			}
		},
		checkLogout: function(){
			var doc = document,
				cache = this.cacheKey,
				login = doc.getElementById("login"),
				logout = doc.getElementById("logout");
			L.setItem(cache.userName,"");
			L.setItem(cache.password,"");
			
			
			logout.style.display = "none";
			login.style.left = "100%";
		},
		checkLogin: function(){
			var doc = document,
				userName = doc.getElementById("username"),
				password = doc.getElementById("password"),
				userNameVal = userName.value,
				passwordVal = password.value,
				that = this,
				cacheName = this.cacheKey;
			 if(userNameVal===""){
				dh.alert("请输入用户名");
				userName.focus();
				return;
			 }
			 if(passwordVal===""){
				dh.alert("请输入密码");
				password.focus();
				return;
			 }
			 
			 document.getElementById("loading1").style.display = "none";
			 document.getElementById("loading2").style.display = "block";
			 
			 
			 var loginurl = "https://passport.csdn.net/ajax/accounthandler.ashx?t=log&u=" + userNameVal + "&p=" + passwordVal,
				 loginreq = "action=bs-transfer@mdp&_MSC_CMD_=QRY&nologin=true&phonemodel=Windows||||Microsoft&appid=FE3XK6&cellid=&screensize=640*920&vt=4&truescreensize=640*920&mscver=V3.2.0.BUILD.01.120625.122330&relogin=false&encrypt=false&carrier=PC&MSCID=&loginmode=foreground&appver=1.0&lac=&partnerid=user&url="+encodeURIComponent(loginurl);

			  $.ajax({
				type : 'GET',
				url : that.serverurl,
				timeout : that.timeout,
				data: loginreq,
				dataType : 'jsonp',
				success : function(data) {
					//alert("checkLogin:" + JSON.stringify(data));
					 if(data.success){//如果登录成功
						//乌拉！登录成功了，好吧您老可以歇着了
						//如果这个时候勾选了记住密码，那么存到缓存里面
                        doc.getElementById('check_logout').style.display = "none";
						/*if(doc.getElementById("remember").checked){
							L.setItem(cacheName.userName, userNameVal);
							L.setItem(cacheName.password, passwordVal);
						}
						else{
							L.setItem(cacheName.userName, "");
							L.setItem(cacheName.password, "");
						}*/
						L.setItem(cacheName.userName, userNameVal);
						L.setItem(cacheName.password, passwordVal);

						doc.getElementById("logout").style.display = "block";
						doc.getElementById("logout").style.zIndex = "10000";
						that.getUserInfo.call(that);
					  }else{
						  dh.alert(data.message);
						  document.getElementById("loading1").style.display = "block";
			 			  document.getElementById("loading2").style.display = "none";
					  }
				},
				error : function(xhr, type) {
					dh.alert("网络不给力");
				}
			});
		},
		getUserInfo: function(){
			//第一步看看有没有值，没有值的话，获取不了用户信息
			var doc = document,
				that = this,
				cacheName = that.cacheKey,
				userName = doc.getElementById("username"),
				passWord = doc.getElementById("password"),
				uname = L.getItem(cacheName.userName) || userName.value,
				upass = L.getItem(cacheName.password) || passWord.value,
				loginurl = "https://passport.csdn.net/ajax/accounthandler.ashx?t=log&u="+uname+"&p="+upass,
				loginreq = "action=bs-transfer@mdp&_MSC_CMD_=QRY&nologin=true&phonemodel=Windows||||Microsoft&appid=FE3XK6&cellid=&screensize=640*920&vt=4&truescreensize=640*920&mscver=V3.2.0.BUILD.01.120625.122330&relogin=false&encrypt=false&carrier=PC&MSCID=&loginmode=foreground&appver=1.0&lac=&partnerid=user&url="+encodeURIComponent(loginurl);

	            $.ajax({
					type : 'GET',
					url : that.serverurl,
					data: loginreq,
					timeout : that.timeout,
					dataType : 'jsonp',
					success : function(data) {
						//alert("getUserInfo:" + JSON.stringify(data));
		                  //为了更好的体验，先隐藏，再显示这俩
		                  if(data.success){//如果登录成功
                              	//dh.alert("登录成功！",'check');
		                  		doc.getElementById("uname").innerHTML=data.data.userName;
		                  		doc.getElementById("uemail").innerHTML=data.data.email;
		                  		doc.getElementById("lastLoginTime").innerHTML=data.data.lastLoginTime;
		                  		doc.getElementById("registerTime").innerHTML=data.data.registerTime;
		                  		doc.getElementById("loginTimes").innerHTML=data.data.loginTimes;
		                  		doc.getElementById("loading3").style.display = "none";
		                  		doc.getElementById("loading4").style.display = "block";
		                  		doc.getElementById("login_ul").style.display = "block";
		                  		setTimeout(function(){
		                  			doc.getElementById("logout").style.display = "block";
									doc.getElementById("logout").style.zIndex = "10000";
		                  		},500);
		                  		//dh.alert("登录成功！",'check');
		                  }else{
		                  	  dh.alert(data.message);
							  doc.getElementById("login").style.left = "100%";
							  doc.getElementById("logout").style.display = "none";
		                  }
					},
					error : function(xhr, type) {
						dh.alert("网络不给力");
					}
			});
		}
    });

    var spPage = new SP();
	
    //页面注册
	if(navigator.userAgent.match(/Android/i) || 
    			navigator.userAgent.match(/iPhone/i) || 
    			navigator.userAgent.match(/iPod/i) || 
    			navigator.userAgent.match(/iPad/i))
	document.addEventListener("plusready", function(){
		 spPage.BeforeReady();
		 spPage.OnReady();
	});
    else{ 
    	$(function () {  
			spPage.BeforeReady();
			spPage.OnReady(); });
    }
    //$(function () { spPage.OnReady(); });
})($.csdn);
