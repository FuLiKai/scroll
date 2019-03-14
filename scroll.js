export default function myScroll (options) {
  if (options && options instanceof HTMLElement) {
    options = {
      el: options,
      pulldown: true,
      scrollEnd: true,
      bottomDistance: 50,
      pulldownDistance: 50,
      maxPulldownOffset: 200,
      useRem: false
    }
    return new _myScroll(options)
  } else if (options && options.el instanceof HTMLElement) {
    return new _myScroll(options)
  } else {
    throw new Error('must provide a dom element for scroll')
  }
}

function _myScroll (options) {
  // start的x/y
  var pageX = 0
  var pageY = 0
  // touchstart时滚动条的y
  var scrollY = 0
  // touchstart时偏移的y
  var startY = 0
  var _this = this
  // 是否有下拉
  _this.pulled = false
  // 偏移的y
  _this.offsetY = 0
  var el = _this.el = options.el
  var pulldownDistance = options.pulldownDistance || 50
  var maxPulldownOffset = options.maxPulldownOffset || 200
  var unit = options.useRem ? 'rem' : 'px'

  if (options.pulldown) {
    el.addEventListener('touchstart', function (e) {
      pageX = e.changedTouches[0].pageX
      pageY = e.changedTouches[0].pageY
      scrollY = el.scrollTop
      startY = _this.offsetY
    })
    el.addEventListener('touchmove', function (e) {
      if (el.scrollTop > 0) return
      if (Math.abs(e.changedTouches[0].pageY - pageY) < Math.abs(e.changedTouches[0].pageX - pageX)) return
      var newY = e.changedTouches[0].pageY
      var newOffsetY = 0
      if (!_this.pulled) {
        newOffsetY = (newY - pageY - scrollY) * 0.4
      } else {
        newOffsetY = startY + (newY - pageY - scrollY) * 0.4
      }
      if (newOffsetY >= 0 && newOffsetY <= maxPulldownOffset) {
        _this.offsetY = newOffsetY
        el.setAttribute('style', addPrefix(`transform: translate3D(0, ${_this.offsetY}px, 0)`))
        e.cancelable && e.preventDefault()
        options.onPulldownMove && typeof options.onPulldownMove === 'function' && options.onPulldownMove(_this.offsetY)
      }
      if (newOffsetY > maxPulldownOffset) {
        e.cancelable && e.preventDefault()
      }
    })
    el.addEventListener('touchend', function (e) {
      if (Math.abs(e.changedTouches[0].pageY - pageY) < Math.abs(e.changedTouches[0].pageX - pageX)) return
      if (_this.offsetY >= pulldownDistance) {
        _this.pulled = true
        _this.offsetY = options.useRem ? pulldownDistance / 75 : pulldownDistance
        el.setAttribute('style', addPrefix([`transform: translate3D(0, ${_this.offsetY + unit}, 0)`, `transition: all 0.5s`]))
        el.scrollTop === 0 && options.onPulldownEnd && typeof options.onPulldownEnd === 'function' && options.onPulldownEnd()
      } else {
        _this.pulled = false
        _this.offsetY = 0
        // el.setAttribute('style', addPrefix([`transform: translate3D(0, 0, 0)`, `transition: all 0.5s`]))
        el.setAttribute('style', addPrefix([`transition: all 0.5s`]))
      }
    })
  }
  if (options.scrollEnd) {
    if (typeof options.bottomDistance !== 'number') options.bottomDistance = 50
    el.addEventListener('scroll', function (e) {
      options.onScroll && typeof options.onScroll === 'function' && options.onScroll(e)
      if (e.target.scrollTop + e.target.offsetHeight + options.bottomDistance >= e.target.scrollHeight) {
        options.onScrollEnd && typeof options.onScrollEnd === 'function' && options.onScrollEnd()
      }
    }, { passive: true })
  }
}

_myScroll.prototype.closePulldown = function () {
  if (this.pulled) {
    // this.el.setAttribute('style', addPrefix([`transform: translate3D(0, 0, 0)`, `transition: all 0.5s`]))
    this.el.setAttribute('style', addPrefix([`transition: all 0.5s`]))
    this.pulled = false
    this.offsetY = 0
  }
}

function addPrefix (strs) {
  var prefixs = ['', '-webkit-', '-moz-']
  if (Array.isArray(strs)) {
    var result = []
    strs.forEach(str => {
      result = result.concat(
        prefixs.map((prefix) => {
          return prefix + str
        })
      )
    })
    return result.join(';')
  } else {
    return prefixs.map((prefix) => {
      return prefix + strs
    }).join(';')
  }
}
