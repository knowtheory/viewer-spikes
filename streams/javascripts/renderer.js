DV.views.Renderer = Backbone.View.extend({
  className: 'wrapper',
  tagName: 'div',

  DEFAULT_HEIGHT: 777,
  DEFAULT_PADDING: 20,
  MAX_PAGES_LOADED: 50,
  DEFAULT_ASPECT: 1.3,

  initialize: function() {
    this.viewer = this.options.viewer;

    this.pageViewStream = new Bacon.Bus();
    this.pageViews = {};
    this.loadedPageViews = {};

    // An event stream which fires when the user scrolls.
    this.scrollStream = this.$el.asEventStream('scroll').throttle(100);

    // Set up the stream of the current page as derived from the UI
    this.currentUIPageStream = this.scrollStream.map($.proxy(this, 'mapCurrentPage')).skipDuplicates();

    // When the view reports the current page, push it into the data stream.
    this.currentUIPageStream.onValue(function(page) {
      this.viewer.data.set('currentPage', {source: 'viewport', page: page});
    });

    // Only load the page once the user has been there for a quarter of a second
    // this.currentUIPageStream.debounce(250).onValue($.proxy(this, 'onValueLoadPage'));

    this.viewer.data.currentPage.onValue($.proxy(this, 'onValueLoadPage'));

    // When a new page view materializes, mark it as loaded.
    this.pageViewStream.onValue($.proxy(this, 'onValueMarkPageLoaded'));

    // Whenever a new page materializes, wait five seconds, then clear out any
    // old ones.
    this.pageViewStream.debounce(5000).onValue($.proxy(this, 'onValueUnloadPages'));

    // Subscribe to the document property so we can load up the pages
    this.viewer.data.document.onValue($.proxy(this, 'documentReceived'));

    // This stream is used to report when the UI should update the current page 
    // i.e. scroll to the page.
    this.setCurrentPageStream = this.viewer.data.currentPage.filter(function(p) {return p.source != 'viewport';}).map('.page');

    // When the global current page updates, move to that page.
    this.setCurrentPageStream.onValue($.proxy(this, 'onValueGoToPage'));
  },

  setGeometry: function() {
    this.geometry = [];
    var offset = this.DEFAULT_PADDING;
    var count = this.doc.get('pages');
    var width = this.pagesEl.innerWidth();

    for (var i = 0; i < count; i++) {
      var view = this.pageViews[i];
      if (view) {
        view.offsetTo(offset);
        var height = view.height(width);
        this.geometry.push({top: offset, bottom: offset + height, height: height});
        offset += height + this.DEFAULT_PADDING;
      } else {
        this.geometry.push({top: offset, bottom: offset + this.DEFAULT_HEIGHT, height: this.DEFAULT_HEIGHT});
        offset += this.DEFAULT_HEIGHT + this.DEFAULT_PADDING;
      }
    }

    this.pagesEl.height(offset);
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

  onValueLoadPage: function(update) {
    var page = update.page;

    console.log('Loading Page:', page);

    // Has never been instanced or loaded
    if (!_.has(this.pageViews, page)) {
      var opts = {number: page + 1, resource: this.pageResource};
      var view = this.pageViews[page] = new DV.views.RendererPage(opts);
      this.pagesEl.append(view.render(this.geometry[page].top).el);
      this.pageViewStream.push({page: page, view: view});
    }
    // Has been instanced, but isn't loaded
    else if (!_.has(this.loadedPageViews, page)) {
      var view = this.pageViews[page].reattach(this.pagesEl);
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
        this.pageViews[page].detach();
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

    this.setGeometry();
  },

  documentReceived: function(doc) {
    this.pageResource = doc.get('page_resource');
    this.doc = doc;

    this.setGeometry();

    // When the zoom level changes...
    this.viewer.data.zoomLevel.onValue($.proxy(this, 'onValueSetZoomLevel'));
  },

  render: function() {
    this.pagesEl = $('<div class="pages"></div>');
    this.$el.append(this.pagesEl);

    return this;
  }
});
