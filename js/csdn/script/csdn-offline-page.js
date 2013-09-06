(function (C) {

    if (!C.OfflinePage)
        C.OfflinePage = function () { }

    var FP = C.OfflinePage,
		L = $.MyWidget.NLocal;

    $.extend(true, FP.prototype, C, {
        OnReady: function () {
			var that = this;
			var intervalObj;
			var flag;
			try{
				that.init();
				dh.init();
				that.download_news_list(function(data){
					//采用zip下载后不需要具体下载
					//得到数据以后，应该分析，需要下载哪些？
					that.download_analyse_listdata(data,function (){
						//TODO error
					},function(){
						//TODO onSuccess
						$("#spprocessbar").css("width",100+"%");
						$("#lblprocessbar").html(100+"%");
						clearInterval(intervalObj);
						intervalObj = null;
						flag = 0;
						//alert('下载完成,请享受无网络阅读，节省流量费用！！！');
						that.back("OffLineWIN","B8B4BD");
					});
				},function(status,msg){
					//alert(msg);
				},function(downloadedSize,totalSize){
					//下载中
					try{
						console.log('下载进度 '+ downloadedSize + "/" + totalSize);
						var postionsize = parseInt((downloadedSize) * 100 / totalSize,10);
						if(postionsize < 80){
							$("#spprocessbar").css("width",postionsize+"%");
							$("#lblprocessbar").html(postionsize+"%");
						}else{
							flag = postionsize;
							intervalObj = setInterval(function(){
								flag++;
								if(flag < 100){
									$("#spprocessbar").css("width",flag+"%");
									$("#lblprocessbar").html(flag+"%");
								}
							},50);
						}
					}
					catch(ex){
						that.showErr(ex);
					}

				});
				that._bind("click", document.getElementById("left"));
				that.androidBack(function(e){
						that.back("OffLineWIN","B8B4BD");
					});
			}
			catch(e){
				that.showErr(e);
			}
        },
		handleEvent: function(e){
			that.back("OffLineWIN","B8B4BD");
		}
    });

    var fpPage = new FP();
    //页面注册
    $(function () { fpPage.OnReady(); });
})($.csdn);
