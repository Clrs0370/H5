/*
dh.js
by yesun
*/
;(function ($, window) {
	var timer;
    window.dh =  window.dh || {
        version: "0.9.1",
		timer: null,
        init: function(){
			$.each(document.querySelectorAll("[data-icon],[data-image],[data-label],[data-count]"), function (index) {
				var that = $(this),
					dataicon = that.attr("data-icon"),
					dataImg = that.attr("data-image"),
					dataLabel = that.attr("data-label"),
					dataCount = that.attr("data-count");
				if (dataicon) {
					that.prepend('<span class="icon ' + dataicon + '" />')
					if (dataicon === "left") {
						that.attr("href", "javascript:history.go(-1);")
					}
				}
				if (dataImg) {
					that.prepend('<img src="' + dataImg + '" class="icon" />')
				}
				if (dataLabel) {
					that.append('<abbr>' + dataLabel + '</abbr>')
				}
				if (dataCount) {
					that.append('<span class="tag theme count">' +dataCount + '</span>')
				}
			});
		},
        alert: function(message, delay) {
	    	if(delay==null||delay==""){
	    		delay=2000;
	    	}
			if(dh.timer){
				clearTimeout(dh.timer);
				$('#_dialog_alert').remove();
			}
	        var dialogMsgBoxHTML = "<div id='_dialog_alert' class='notification' style='display: none;'><div class='window confirm growl show'><strong class='text bold' id='_dialog_message'></strong><small></small></div></div>";
	        $("body").append(dialogMsgBoxHTML);
	        $("#_dialog_message").html(message);
	
	        $('#_dialog_alert').show();
	
	        dh.timer = setTimeout(function () {
	            //$('#_dialog_alert').hide();
	            $('#_dialog_alert').remove();
	        }, delay);
	    },
        confirm: function(message, body, icon, onAccept, onCancel) {
	        var dialogMsgBoxHTML = "<div id='_dialog_confirm' class='notification' style='display: block; '><div class='window confirm show'><span class='icon' id='_dialog_icon' ></span><strong class='text bold' id='_dialog_message'></strong><small id='_dialog_body'></small>" +
	        "<a href='#' id='_accept_btn_click' class='button anchor large text thin'>确认</a>" +
	        "<a href='#' id='_cancel_btn_click' class='button anchor large text thin'>取消</a></div></div>";
	        $("body").append(dialogMsgBoxHTML);
	        $("#_dialog_icon").addClass(icon);
	        $("#_dialog_message").html(message);
	        $("#_dialog_body").html(body);
	
	        $("#_accept_btn_click").click(function(){
	            $('#_dialog_confirm').hide();
	            $('#_dialog_confirm').remove();
	            onAccept();
	        });
	
	        $("#_cancel_btn_click").click(function(){
	            $('#_dialog_confirm').hide();
	            $('#_dialog_confirm').remove();
	            onCancel();
	        });
	
	
	        $('#_dialog_confirm').show();
	    }
    };

})(window.Zepto, this);