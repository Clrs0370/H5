/*
 * iScroll v4.2.5 ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
(function(W, win){
var slider = function (el, options) {
	var that = this;
	// Default options
	that.options = {
		width: win.innerWidth/3,
		height: 60,
		onStart:null,
		onMove: null,
		onEnd: null,
		onLeft: null,
		onRight: null,
		onStatic: null,
		onScroll: null,
		canStart: null
	};
	// User defined options
	for (i in options) that.options[i] = options[i];
	//if(el) that.target = document.getElementById(el);
	//else that.target = win;
	that.target = el;
	//that._bind('touchstart', el);
};

// Prototype
slider.prototype = {
	handleEvent: function (e) {
		switch(e.type) {
			case 'touchstart':
				this._start(e);
				
				break;
			case 'touchmove': 
				this._move(e); 
				break;
			case 'touchcancel':
			case 'touchend': 
				this._end(e); 
				break;
			case 'scroll':
				this._scroll(e);
				break;
		}
	},
	enable: function(){
		var that = this;
		if(that.enabled) return;
		that.enabled = true;
		that._bind('touchstart', that.target);
	},
	disable: function(){
		var that = this;
		if(!that.enabled) return;
		that.enabled = false;
		that._unbind('touchstart', that.target);
		that._unbind("scroll", document);
		that._unbind("touchmove", document);
		that._unbind("touchend", document);
		that._unbind("touchcancel", document);
	},
	_start: function(e){
		var that = this,
			point = e.touches[0];
		that.startPointX = point.pageX;
		that.startPointY = point.pageY;
		that.touchmoved = false;
		console.log('_start:' + that.startPointX + ',' + that.startPointY);
		if(that.options.onStart) that.options.onStart.call(that, e);
		if(!that.options.canStart || that.options.canStart && that.options.canStart.call(that, e)){
			that._unbind("scroll", document);
			that._bind("touchmove", document);
			that._bind("touchend", document);
			that._bind("touchcancel", document);
		}
	},
	_move: function(e){
		var that = this;
		that.touchmoved = true;
		if(that.options.onMove) that.options.onMove.call(that, e);
	},
	_end: function(e){
		var that = this;
		that._bind("scroll", document);
		that._unbind("touchmove", document);
		that._unbind("touchend", document);
		that._unbind("touchcancel", document);
		if(that.options.onEnd) that.options.onEnd.call(that, e);
		if(that.touchmoved){
			var point = e.changedTouches[0],
				endPointX = point.pageX,
				endPointY = point.pageY,
				width = that.options.width,
				height = that.options.height;
			console.log('_end:' + endPointX + ',' + endPointY);
			if (Math.abs(endPointY - that.startPointY) < height) {//上下滑动距离限制
				var _x = endPointX - that.startPointX;
				console.log('_end>>:' + _x + ',' + width);
				if (_x > width && that.options.onLeft)
					that.options.onLeft.call(that, e);
				else if (_x < -width && that.options.onRight)
					that.options.onRight.call(that, e);
			}
		}else if(that.options.onStatic){
			that.options.onStatic.call(that, e);
		}
	},
	_scroll: function(e){
		var that = this;
		if(that.options.onScroll) that.options.onScroll.call(that, e);
	},
	_bind: function (type, el, bubble) {
		(el || win).addEventListener(type, this, !!bubble);
	},

	_unbind: function (type, el, bubble) {
		(el || win).removeEventListener(type, this, !!bubble);
	},
};

W.slider = W.slider || slider;

})($.MyWidget, window);
