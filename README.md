# ScrollEventTrigger
> 스크롤 이벤트를 편하게 사용하려고 만듦.

## 사용방법
```javascript
var scroller = new Scroller();

scroller.add({
  el: 'SELECTOR', // only Selector,
  start: function() {},
  end: function() {}
});
```