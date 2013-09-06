(function (C) {

    if (!C.ShareContentPage)
        C.ShareContentPage = function () { }

    var SP = C.ShareContentPage,
		L = $.MyWidget.NLocal;

    $.extend(true, SP.prototype, C, {
        OnReady: function () {
			try{
				var that = this,
					cacheKey = that.cacheKey,
					shareType = L.getItem(cacheKey.shareType);
				plus.statistic.eventTrig(shareType);
				that.share[shareType]({
						"url": L.getItem(cacheKey.articleUrl),
						"appkey": "",
						"title": "我在CSDN上看到一篇文章，不错，分享给大家 " + L.getItem(cacheKey.articleTitle),
						"pic": "",
						"ralateUid": "",
						"language": "zh_cn",
						"site": "www.csdn.net"
					 });
			}
			catch(ex){
				this.showErr(ex);
			}
        }
    });

    var spPage = new SP();
    //页面注册
	var hasTrigered = false;
    document.addEventListener("plusready", function(){
		if(hasTrigered) return;
		hasTrigered = true;
		spPage.OnReady();
	});
})($.csdn);
