DC.view.PageList = DC.Backbone.View.extend({
  className: 'backdrop',
  SCROLL_THROTTLE: 500,
  
  jump: function(pageNumber) {
    var page = DC._.find(this.pageViews, function(page) { return page.model.get('pageNumber') == pageNumber; });
    if (!page) return NaN;
    var jumpOffset = this.$el.scrollTop() + page.$el.offset().top;
    var fudge = 10;
    this.$el.scrollTop(jumpOffset - fudge);
    return jumpOffset;
  },
  
  initialize: function(options) {
    this.loadVisiblePages          = DC._.bind(this.loadVisiblePages, this);
    //this.throttledLoadVisiblePages = DC._.throttle(this.loadVisiblePages, this.SCROLL_THROTTLE);
    this.announceScroll            = DC._.bind(DC._.throttle(this.announceScroll, this.SCROLL_THROTTLE), this);
    
    this.matteHeight = 0;
    this.initializeSubviews();

    this.listenTo(this.collection, 'reset', this.rebuild);
    this.on('scroll', this.loadVisiblePages);
  },

  rebuild: function() {
    this.initializeSubviews();
    this.render();
  },
  
  initializeSubviews: function() {
    this.pageViews = this.collection.map( function( pageModel ){ return new DC.view.Page({model: pageModel}); } );
    DC._.each(this.pageViews, function(page){
      this.listenTo(page, 'resize', function(heightDifference){
        if (heightDifference > 0) { 
          this.calculatePositions();
          this.placePages();
          this.resizeBackdrop(heightDifference);

          // Rethink repositioning scrollTop:
          // If a page ABOVE current scroll position changes,
          // then offset needs to be updated when the buffer size changes.
          // If the current page has yet to load, then no jumping is needed,
          // because only pages below the current page are adjusted.
          //var offset = this.$el.scrollTop() - heightDifference;
          //this.$el.scrollTop(offset);
        }
      });
    }, this);
    this.matteHeight = this.height();
  },
  
  events: { 'scroll': 'announceScroll' },
  
  announceScroll: function() {
    var scrollTop      = (this.$el.scrollTop() / this.matteHeight) * 100;
    var viewportHeight = (this.$el.parent().height() / this.matteHeight) * 100;
    this.trigger('scroll', {top: scrollTop, bottom: viewportHeight});
  },
  
  // ToDo: make this smarter, and just have it subtract the difference
  // from the existing height, rather than recounting all the page heights.
  resizeBackdrop: function(difference) {
    this.matteHeight = this.height();
    this.$('.pages').css({'padding-top': this.matteHeight});
  },
  
  render: function() {
    this.$('.pages').html(DC._.map(this.pageViews, function(view){ return view.render().el; }));
    this.resizeBackdrop();
    this.calculatePositions();
    this.placePages();
    return this;
  },
  
  placePages: function() {
    DC._.each(this.pageViews, function(page){ page.$el.css(page.dimensions); });
  },
  
  calculatePositions: function() {
    var startingMargin = DC.view.Page.prototype.margin*2;
    return DC._.reduce(this.pageViews, function(backdropHeight, page){
      var dimensions = { top: backdropHeight }; //, 'padding-top': page.height() };
      page.dimensions = dimensions;
      return backdropHeight + page.height();
    }, startingMargin);
  },
  
  height: function() {
    var startingMargin = DC.view.Page.prototype.margin*2;
    return DC._.reduce(this.pageViews, function(total, page){ return total + page.height(); }, startingMargin, this);
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
    var ceiling = (( this.currentPage + loadRange ) >= this.collection.size()) ? this.collection.size()+1 : (this.currentPage + loadRange);
    var range   = DC._.range(floor, ceiling);
    this.loadPages(range, true);
  },
  
  identifyCurrentPage: function() {
    var viewableTop    = this.$el.scrollTop();
    var viewableBottom = this.$el.height();
    
    // Calculate which pages are visible based their height/offset
    // compared to the visible container
    var visiblePages = DC._.filter(this.pageViews, this.isPageVisible, this);

    if (visiblePages.length > 0) {
      var middleId = Math.floor(visiblePages.length / 2);
      this.currentPage = visiblePages[middleId].model.get('pageNumber');
      this.trigger("currentPage", this.currentPage);
      //console.log(DC._.map(visiblePages, function(v){ return v.model.get('pageNumber'); }));
      //console.log(this.currentPage);
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
  },
  
  loadPages: function(pageNumbers) {
    console.log(pageNumbers, DC.$('img').size());
    DC._.each(this.pageViews, function(page){
      if (DC._.contains(pageNumbers, page.model.get('pageNumber'))) { page.load(); } else { page.unload(); }
    });
  }
});
