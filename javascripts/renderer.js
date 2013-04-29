DV.views.Renderer = Backbone.View.extend({
  className: 'wrapper',
  tagName: 'div',

  DEFAULT_HEIGHT: 777,
  MAX_PAGES_LOADED: 50,
  DEFAULT_ASPECT: 1.3,

  initialize: function() {
    this.data = this.options.data; 

    this.pageEls = [];

    this.pageViewStream = new Bacon.Bus();
    this.pageViews = {};
    this.loadedPageViews = {};

    this.scrollStream = this.$el.asEventStream('scroll')
                                  .throttle(100)

    // An event stream which fires when the user scrolls.
    this.scrollStream = this.$el.asEventStream('scroll').throttle(100);

    // Set up the stream of the current page as derived from the UI
    this.currentUIPageStream = this.scrollStream.map($.proxy(this, 'mapCurrentPage')).skipDuplicates();

    //The scroll position as a proportion of the total scrollable height
    this.scrollPositionStream = this.scrollStream
                                    .map($.proxy(this, 'mapScrollPosition'))
                                    .skipDuplicates();

    //A stream of resize events on the window, mapped to provide a timeStamp, and the current window width
    //The width is used to predict the height of the pages element later - on the hunch that 
    //it's quicker to fetch than the height of a 1000's page document.
    this.windowResizeStream = $(window).asEventStream('resize')
                                        .map(function(e){return {timeStamp: e.timeStamp, width: $(window).width()}})

    //A trigger stream - when there's been 1s or more since the last resize
    this.resizeExpiredStream = this.windowResizeStream.afterExpiry(1000)

    //Retain the scroll position by sampling the scroll position whenever the viewport begins resizing, as follows:
    //Take the scroll position
    //Emit an event whenever the resize has expired (not during a resize)
    //Then combine that stream with the resize events themselves, preserving only the position
    this.retainScrollPositionStream = this.scrollPositionStream.toProperty({})
                                      .sampledBy(this.resizeExpiredStream)
                                      .combine(this.windowResizeStream, function(position, resize){return $.extend({}, position, resize)});

    //Fire the 'retain position' calc:    
    this.retainScrollPositionStream.onValue($.proxy(this, 'onValueRetainScrollPosition'));

    // When the view reports the current page, push it into the data stream.
    this.currentUIPageStream.onValue(function(page) {
      this.data.set('currentPage', {source: 'viewport', page: page});
    });

    // This stream is used to report when the UI should update the current page 
    // i.e. scroll to the page.
    this.setCurrentPageStream = this.data.currentPage.filter(function(p) {return p.source != 'viewport';}).map('.page');

    // When the global current page updates, move to that page.
    this.setCurrentPageStream.onValue($.proxy(this, 'onValueGoToPage'));


    // Only load the page once the user has been there for a quarter of a second
    this.currentUIPageStream.debounce(250).onValue($.proxy(this, 'onValueLoadPage'));

    // When a new page view materializes, mark it as loaded.
    this.pageViewStream.onValue($.proxy(this, 'onValueMarkPageLoaded'));

    // When the zoom level changes...
    this.data.zoomLevel.onValue($.proxy(this, 'onValueSetZoomLevel'));

    // Whenever a new page materializes, wait five seconds, then clear out any
    // old ones.
    this.pageViewStream.debounce(5000).onValue($.proxy(this, 'onValueUnloadPages'));
  },

  setDocument: function(doc) {
    this.renderPageElements();
    this.calculateGeometry();
  },

  calculateGeometry: function() {
    this.geometry = _.map(this.pageEls, function(el) {
      var top = el.offset().top, height = el.height();
      return {
        top     : top,
        bottom  : top + height,
        height  : height
      };
    }, this);
  },

  mapCurrentPage: function(e) {
    var topBound = $(e.target).scrollTop();
    var bottomBound = topBound + this.pagesEl.height();

    for (var i = 0; i < this.geometry.length; i++) {
      var entry = this.geometry[i];

      // if topbound is less than the mid-point
      // or if bottombound is greater than the mid-point
      if ((entry.top >= topBound && entry.top <= bottomBound) ||
          (entry.bottom >= topBound && entry.bottom <= bottomBound) ||
          (entry.top <= topBound && entry.bottom >= bottomBound)) {
        return i;
      }
    }

    return -1;
  },

  //Return the scrollTop, the overall height and the proportional scroll position
  mapScrollPosition: function(e){
    var height = this.pagesEl.height();
    var scrollTop = $(e.target).scrollTop();
    var aspect = $(window).width() / height;
    return {proportion: scrollTop / height, aspect: aspect};
  },

  onValueLoadPage: function(page) {
    console.log('Loading Page:', page);

    // Has never been instanced or loaded
    if (!_.has(this.pageViews, page)) {
      var pageEl = this.pageEls[page];
      var view = this.pageViews[page] = new DV.views.RendererPage({el: pageEl, number: page + 1}).render();
      this.pageViewStream.push({page: page, view: view});
    }
    // Has been instanced, but isn't loaded
    else if (!_.has(this.loadedPageViews, page)) {
      var view = this.pageViews[page].reload();
      this.pageViewStream.push({page: page, view: view});
    }
  },

  onValueMarkPageLoaded: function(update) {
    this.loadedPageViews[update.page] = new Date();
  },

  //Guess the new height, based on the incoming width and aspect, then apply the proportional scroll position:
  onValueRetainScrollPosition: function(position){
    this.$el.scrollTop((position.width / position.aspect) * position.proportion)
  },

  onValueUnloadPages: function(update) {
    var pairs = _.pairs(this.loadedPageViews);
    if (pairs.length >= this.MAX_PAGES_LOADED) {
      var sorted = pairs.sort(function(x, y) { return x[1] - y[1];});
      var targets = sorted.slice(0, sorted.length - this.MAX_PAGES_LOADED);
      for (var i = 0; i < targets.length; i++) {
        var page = targets[i][0];
        console.log('Evicting', page)
        this.pageViews[page].unload();
        delete this.loadedPageViews[page];
      }
    }
  },

  onValueGoToPage: function(page) {
    if (this.geometry[page]) {this.$el.scrollTop(this.geometry[page].top)};
  },

  onValueSetZoomLevel: function(level) {
    this.$el.removeClass(function(index, name) {
        return (name.match(/\bzoom-[\S]+/g) || []).join(' ');
      }).addClass('zoom-' + level);
  },

  renderPageElements: function() {

    for (var i = 0; i < 200; i++) {
      var pageEl = $('<div class="page"></div>').css('padding-top', (this.DEFAULT_ASPECT * 100) + '%');
      this.pageEls[i] = pageEl;
      this.pagesEl.append(pageEl);
    }
  },

  render: function() {
    this.pagesEl = $('<div class="pages"></div>');
    this.$el.append(this.pagesEl);

    return this;
  }
});
