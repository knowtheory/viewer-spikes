DC.view.Renderer = DC.Backbone.View.extend({
  className: 'renderer',
  SCROLL_THROTTLE: 100,
  initialize: function(options) { 
    DC._.bindAll(this, 'onZoomChange');
    this.uiState = options.uiState;
    options.uiState.on('change:zoom', this.onZoomChange);
    this._currentZoom = options.uiState.get('zoom');

    this.createSubviews();
    this.throttledScroll = DC._.bind(DC._.throttle(this.announceScroll, this.SCROLL_THROTTLE), this);
    this.on('scroll', this.loadVisiblePages, this);
  },
  
  createSubviews: function() {
    this.pages   = new DC.view.PageList({collection: this.model.pages});
    this.sidebar = new DC.view.Sidebar();
  },

  onZoomChange: function(model, zoom) {
    if (this._rendered) {
      this.backdrop.removeClass('zoom-' + this._currentZoom);
      this.backdrop.addClass('zoom-' + zoom);
      this._currentZoom = zoom;
    }
  },
  
  //events: { 'scroll .backdrop': 'announceScroll' },
  
  render: function() {
    this._rendered = true;

    this.backdrop = DC.$('<div class="backdrop"></div>');
    this.$el.scroll(this.throttledScroll);
    this.$el.append(this.backdrop);

    this.backdrop.append(this.pages.render().el);
    this.$el.append(this.sidebar.render().el);

    return this;
  },
  
  jump: function(pageNumber) {
    var page = DC._.find(this.pageViews, function(page) { return page.model.get('pageNumber') == pageNumber; });
    if (!page) return NaN;
    var jumpOffset = this.$el.scrollTop() + page.$el.offset().top;
    var fudge = 10;
    this.$el.scrollTop(jumpOffset - fudge);
    return jumpOffset;
  },
  
  announceScroll: function(){ 
    var pagesHeight    = this.pages.height();
    var scrollTop      = (this.backdrop.scrollTop() / pagesHeight) * 100;
    var viewportHeight = (this.$el.height() / pagesHeight) * 100;
    this.trigger('scroll', {top: scrollTop, bottom: viewportHeight});
  },

  loadVisiblePages: function(e){
    //console.log(this.height());
    this.identifyCurrentPage();

    var loadRange = 5;
    // the floor should be earliest page above the current page to be loaded
    // or the first page of the document if we're close to the top of the document.
    var floor   = ( this.currentPage <= loadRange ) ? 1 : ( this.currentPage - loadRange );
    // Likewise, the ceiling should be the pages below the current page to be loaded.
    // When scrolling to the end of the document, ensure ceiling is capped at the page count + 1 
    // (N.B. the +1 is for _.range which excludes the endpoint).
    var ceiling = (( this.currentPage + loadRange ) >= this.pages.collection.size()) ? this.pages.collection.size()+1 : (this.currentPage + loadRange);
    var range   = DC._.range(floor, ceiling);
    this.pages.loadPages(range, true);
  },
  
  identifyCurrentPage: function() {
    var viewableTop    = this.backdrop.scrollTop();
    var viewableBottom = this.$el.height();
    
    // Calculate which pages are visible based their height/offset
    // compared to the visible container
    var visiblePages = DC._.filter(this.pages.pageViews, this.isPageVisible, this);

    if (visiblePages.length > 0) {
      var middleId = Math.floor(visiblePages.length / 2);
      this.currentPage = visiblePages[middleId].model.get('pageNumber');
      this.trigger("currentPage", this.currentPage);
      this.uiState.set('currentPage', this.currentPage);
    }
  },
  
  isPageVisible: function(page) {
    var pageHeight = page.$el.height();
    // offsets relative to parent container
    var pageTop    = page.$el.offset().top;
    var pageBottom = pageTop + pageHeight;
    
    var containerTop    = 0;
    var containerBottom = this.$el.height();
    
    // Visibility is defined as the intersection of a page's height/dimensions
    // and the view port's height/dimensions.
    //
    // A page is visible when its bottom is below the container top and
    // its top is above the container bottom
    var visibility = ( pageBottom > containerTop ) && ( pageTop < containerBottom );
    return visibility;
  }
  
});
