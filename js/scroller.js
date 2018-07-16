;(function() {  
  'use strict';

  var Scroller = function() {
    this.sections = [];

    this._scrollEvtCallback = this._scrollEvtCallback.bind(this);
    this._resizeEvtCallback = this._resizeEvtCallback.bind(this);
    this._activeScrollEvt = this._activeScrollEvt.bind(this);
    this._activeResizeEvt = this._activeResizeEvt.bind(this);

    this._init();
  };

  Scroller.prototype._init = function () {
    bindEvts(
      {
        event: 'scroll',
        callback: this._scrollEvtCallback
      },
      {
        event: 'resize',
        callback: this._resizeEvtCallback
      }
    );
  }

  Scroller.prototype.add = function(obj) {
    this.sections.push(new Section(obj));
    return this;
  };

  Scroller.prototype._activeScrollEvt = function() {
    this.sections.forEach(function(section) {
      section.onScroll()
    });
  };

  Scroller.prototype._activeResizeEvt = function() {
    this.sections.forEach(function(section) {      
      section.updateOffset();
    });
  };

  Scroller.prototype._scrollEvtCallback = function() {
    this.sections.length > 0 && debounce(this._activeScrollEvt);
  };

  Scroller.prototype._resizeEvtCallback = function() {
    if(!this.sections.length > 0) { return; }
    debounce(this._activeResizeEvt);
  };

    // 4번
  var Section = function(sectionInfo) {
    if(!sectionInfo) throw new TypeError('sectionInfo가 필요합니다!')

    var el = document.querySelector(sectionInfo.el);
    var parent = getType(sectionInfo.parent) === 'string' && sectionInfo.parent === 'relative' ? 'relative' : 'absolute';
  
    this.el = el;
    this.addTop = sectionInfo.addTop || 0;
    this.addBottom = sectionInfo.addBottom || 0;
    this.start = sectionInfo.start || noop;
    this.end = sectionInfo.end || noop;
    this.parent = parent;
    this.isActive = false;

    this.updateOffset();
  };

  Section.prototype.onScroll = function () {
    var scrollY = window.pageYOffset || document.documentElement.scrollY

    if(scrollY > this.top && scrollY < this.bottom) {
      !this.isActive && this.start();
      this.isActive = true;
    } else {
      this.isActive && this.end();
      this.isActive = false;
    }
  }

  Section.prototype._getAbsolutePos = function() {
    var domRect = this.el.getBoundingClientRect();
    
    var top = domRect.top + window.pageYOffset - document.documentElement.clientTop;
    var bottom = top + this.el.offsetHeight;

    return {top: top, bottom: bottom};
  };

  Section.prototype._getRelativePos = function() {
    var top = this.el.offsetTop;
    var bottom = top + this.el.offsetHeight;

    return {top: top, bottom: bottom};
  };

  Section.prototype.updateOffset = function () {
    var pos = this.parent === 'absolute'? this._getAbsolutePos() :  this._getRelativePos();
    this.top = pos.top + this.addTop
    this.bottom = pos.bottom + this.addBottom
  }

  var noop = function () {  }

  var getType = function(data) {
    
    return Object.prototype.toString.call(data).slice(8, -1).toLowerCase();
  };

  var extend = function(newObj, oldObj) {
    
    var checkArr = function(arr) {

      var emptyArr = [];

      arr.forEach(function(data) {
        var dataType = getType(data);

        if(dataType === 'object') {
          emptyArr.push(extend({}, data));
        } else if(dataType === 'array') {
          emptyArr.push(checkArr(data));
        } else {
          emptyArr.push(data);
        }
      });

      return emptyArr;
    };

    for(var prop in oldObj) {
      if(oldObj.hasOwnProperty(prop)) {
        var _data = oldObj[prop];
        var type = getType(_data);

        if(type === 'object') {
          newObj[prop] = extend({}, _data);
        } else if(type === 'array') {
          newObj[prop] = checkArr(_data);
        } else {
          newObj[prop] = _data;
        }
      }
    }

    return newObj;
  };

  var debounce = function(callback) {
    if(window.requestAnimationFrame) {
      window.requestAnimationFrame(callback);
    } else {
      window.setTimeout(callback, 66);
    }
  };

  var bindEvts = function() {
    var args = [].slice.call(arguments)        
    if(args.length === 0) {
      return;
    }
    
    args.forEach(function(eventInfo) {
      var evt = eventInfo.event;
      var callback = eventInfo.callback;
      var target = eventInfo.target || window;

      if(target.addEventListener) {
        target.addEventListener(evt, callback);
      } else {
        target.attachEvent('on' + evt, callback);
      }
      
    });
  };

  window.Scroller = Scroller
})();
