DV.views.Renderer = Backbone.View.extend({
  className: 'wrapper',
  tagName: 'div',

  DEFAULT_HEIGHT: 777,
  MAX_PAGES_LOADED: 50,

  initialize: function() {
    this.data = this.options.data;

    this.pageEls = [];

    this.pageViewStream = new Bacon.Bus();
    this.pageViews = {};
    this.loadedPageViews = {};

    // An event stream which fires when the user scrolls.
    this.scrollStream = this.$el.asEventStream('scroll').throttle(100);

    // Set up the stream of the current page as derived from the UI
    this.currentUIPageStream = this.scrollStream.map($.proxy(this, 'mapCurrentPage')).skipDuplicates();

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
    this.$el.scrollTop(this.geometry[page].top);
  },

  renderPageElements: function() {
    for (var i = 0; i < 200; i++) {
      var pageEl = $('<div class="page"></div>').height(this.DEFAULT_HEIGHT);
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
