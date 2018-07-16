'use strict';
;(function(utils) {
  
  var Scroller = (function(modules) {
  

    var init = function(scroller) {
      utils.bindEvts(scroller ,
        {
          event: 'scroll',
          callback: modules.scrollEvtCallback
        },
        {
          event: 'resize',
          callback: modules.resizeEvtCallback
        }
      );
    };

    var Scroller = function(opts) {

      this.states = {
        isActive: false,
        sectionInfos: []
      };

      init(this);
    };

    Scroller.prototype.add = function(obj) {
      this.states.sectionInfos.push(modules.getSectionState(obj));
      return this;
    };

  return Scroller;

  })((function(utils) {

    var getAbsolutePos = function(sectionInfo) {
      
      var domRect = sectionInfo.el.getBoundingClientRect();
      
      var top = domRect.top + window.pageYOffset - document.documentElement.clientTop;
      var bottom = top + sectionInfo.el.offsetHeight;

      return {
        top: top + sectionInfo.addTop,
        bottom: bottom + sectionInfo.addBottom
      };
    };

    var getRelativePos = function(sectionInfo) {
      var top = sectionInfo.el.offsetTop;
      var bottom = top + sectionInfo.el.offsetHeight;

      return {
        top: top + sectionInfo.addTop,
        bottom: bottom + sectionInfo.addBottom
      }
    };

    var getElementOffsetTopBottom = function(sectionInfo) {

      if(sectionInfo.parent === 'absolute') {
        console.log('absolute');
        return getAbsolutePos({el: sectionInfo.el, addTop: sectionInfo.addTop || 0, addBottom: sectionInfo.addBottom || 0});
      } else {
        console.log('relative');
        return getRelativePos({el: sectionInfo.el, addTop: sectionInfo.addTop || 0, addBottom: sectionInfo.addBottom || 0});
      }
    };

    // 6번
    var activeScrollEvt = function(sectionInfos, scrollY) {
      
      sectionInfos.forEach(function(info) {
        
        var top = info.top;
        var bottom = info.bottom;

        if(scrollY > top && scrollY < bottom) {
          !info.isActive && info.start();
          info.isActive = true;
        } else {
          info.isActive && info.end();
          info.isActive = false;
        }
      });
    };

    var activeResizeEvt = function(sectionInfos) {
      
      sectionInfos.forEach(function(sectionInfo) {
        
        var offsetInfo = getElementOffsetTopBottom(sectionInfo);
        
        sectionInfo.top = offsetInfo.top;
        sectionInfo.bottom = offsetInfo.bottom;
      });
    };

    var scrollEvtCallback = function(sectionInfos) {
      
      sectionInfos.length > 0 && utils.debounce(activeScrollEvt.bind(null, sectionInfos, window.pageYOffset || document.documentElement.scrollY));
    };

    var resizeEvtCallback = function(sectionInfos) {

      if(!sectionInfos.length > 0) { return; }
    
      utils.debounce(activeResizeEvt.bind(null, sectionInfos));
    };

    // 4번
    var getSectionState = function(sectionInfo) {
        
      if(!sectionInfo) {
        return;
      }

      var newInfo = {};
      var el = document.querySelector(sectionInfo.el);
      var parent = utils.getType(sectionInfo.parent) === 'string' && sectionInfo.parent === 'relative' ? 'relative' : 'absolute';
      var offsetInfo;

      newInfo['el'] = el;
      newInfo['addTop'] = sectionInfo.addTop || 0;
      newInfo['addBottom'] = sectionInfo.addBottom || 0;
      newInfo['start'] = sectionInfo.start ? sectionInfo.start : function() {};
      newInfo['end'] = sectionInfo.end ? sectionInfo.end : function() {};
      newInfo['parent'] = parent;
      newInfo['isActive'] = false;

      offsetInfo = getElementOffsetTopBottom(newInfo);
      
      newInfo['top'] = offsetInfo.top;
      newInfo['bottom'] = offsetInfo.bottom;

      return newInfo;
    };

    return {
      getElementOffsetTopBottom: getElementOffsetTopBottom,
      scrollEvtCallback: scrollEvtCallback,
      resizeEvtCallback: resizeEvtCallback,
      getSectionState: getSectionState
    };
  })(utils));

  window.Scroller = Scroller;
})((function() {
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
    var my = args.shift()
        
    if(args.length === 0) {
      return;
    }
    
    args.forEach(function(eventInfo) {
      var evt = eventInfo.event;
      var callback = eventInfo.callback;
      var target = eventInfo.target || window;

      if(target.addEventListener) {
        target.addEventListener(evt, callback.bind(null, my.states.sectionInfos));
      } else {
        target.attachEvent('on' + evt, callback.bind(null, my.states.sectionInfos));
      }
      
    });
  };

  return {
    extend: extend,
    getType: getType,
    debounce: debounce,
    bindEvts: bindEvts
  };
})());
