DC.view.Renderer = DC.Backbone.View.extend({
  className: 'renderer',
  SCROLL_THROTTLE: 500,
  initialize: function(options) { 
    this.createSubviews();

    this.throttledScroll = DC._.bind(DC._.throttle(this.announceScroll, this.SCROLL_THROTTLE), this);
    this.on('scroll', this.loadVisiblePages, this);
  },
  
  createSubviews: function() {
    this.pages   = new DC.view.PageList({collection: this.model.pages});
    this.overview = new DC.view.Overview({collection: this.model.pages});
    
    //this.overview.listenTo(this, 'scroll', this.overview.jump);
    this.overview.listenTo(this, 'currentPage', this.overview.updateMark);
    this.listenTo(this.overview, 'scroll', this.jump);
  },
  
  //events: { 'scroll .backdrop': 'announceScroll' },
  
  render: function() {
    this.$el.html(JST['renderer']({ document: this.model }));
    // because scrolls don't bubble explicitly bind to child node.
    this.backdrop = this.$('.backdrop');
    this.backdrop.scroll(this.throttledScroll);
    this.renderSubviews();
    return this;
  },
  
  renderSubviews: function() {
    this.pages.setElement(this.$('.pages'));
    this.pages.render();
    this.overview.setElement(this.$('.overview'));
    this.overview.render();
  },
  
  jump: function(pageNumber) {
    console.log(pageNumber);
    var page = DC._.find(this.pages.pageViews, function(page) { return page.model.get('pageNumber') == pageNumber; });
    if (!page) return NaN;
    var fudge = DC.view.Page.prototype.margin;
    var position = page.dimensions.top - fudge;
    this.$('.backdrop').scrollTop(position);
    this.identifyCurrentPage();
    return position;
  },
  
  announceScroll: function(){ 
    var pagesHeight    = this.pages.height();
    var scrollTop      = (this.backdrop.scrollTop() / pagesHeight) * 100;
    var viewportHeight = (this.$el.height() / pagesHeight) * 100;
    this.trigger('scroll', {top: scrollTop, bottom: viewportHeight});
  },

  loadVisiblePages: function(e){
    this.identifyCurrentPage();

    var loadRange = 5;
    // the floor should be earliest page above the current page to be loaded
    // or the first page of the document if we're close to the top of the document.
    var floor   = ( this.currentPage <= loadRange ) ? 1 : ( this.currentPage - loadRange );
    // Likewise, the ceiling should be the pages below the current page to be loaded.
    // When scrolling to the end of the document, ensure ceiling is capped at the page count + 1 
    // (N.B. the +1 is for _.range which excludes the endpoint).
    var ceiling = (( this.currentPage + loadRange ) >= this.pages.collection.size()) ? this.pages.collection.size()+1 : (this.currentPage + loadRange);
    //console.log(floor, ceiling);
    var range   = DC._.range(floor, ceiling);
    this.pages.loadPages(range, true);
  },
  
  identifyCurrentPage: function() {
    // Calculate which pages are visible based their height/offset
    // compared to the visible container
    var visiblePages = DC._.filter(this.pages.pageViews, this.pageVisibility, this);

    if (visiblePages.length > 0) {
      var middleId = Math.floor(visiblePages.length / 2);
      this.currentPage = visiblePages[middleId].model.get('pageNumber');
      this.trigger("currentPage", this.currentPage);
      console.log(DC._.map(visiblePages, function(v){ return v.model.get('pageNumber'); }));
      //console.log(this.currentPage);
    }
  },
  
  pageVisibility: function(page) {
    var pageHeight = page.dimensions.height;
    // offsets relative to parent container
    var pageTop    = page.position.top;
    var pageBottom = pageTop + pageHeight;
    
    var containerWidth  = this.backdrop.width();
    var containerTop    = DC._(this.backdrop.scrollTop()).asPercentOf(containerWidth);
    var containerHeight = DC._(this.$el.height()).asPercentOf(containerWidth);
    var containerBottom = containerTop + containerHeight;
    
    // Visibility is defined as the intersection of a page's height/dimensions
    // and the view port's height/dimensions.
    //
    // A page is visible when its bottom is below the container top and
    // its top is above the container bottom
    
    /* possible circumstances:
    
      pageHeight > containerHeight
        
        // whole page can't fit on screen.
        // only need to consider the pageTop to containerBottom OR 
        // the pageBottom to containerTop relationship
        
      pageHeight <= containerHeight
        
        // if a page can fit entirely onto the screen, then we care about several things.
        
        // is page 100% visible?
        // Check if both the top and bottom of the page contained within the top and bottom of the screen.
        pageTop > containerTop && pageBottom < containerBottom // => 100% visibility
        // is the page offscreen?
        pageBottom < containerTop || pageTop > containerBottom
        
      
      // pageTop is above containerTop, pageBottom is above containerTop (page is off screen)
      pageTop < containerTop && pageBottom < containerTop 
      pageBottom < containerTop
      // pageTop is below containerBottom, pageBottom is below containerBottom (page is off screen)
      pageTop > containerBottom && pageBottom > containerBottom
      pageTop > containerBottom
        
      // pageTop is above containerTop, pageBottom is below containerTop (page is partially on screen)
      pageTop < containerTop && pageBottom > containerTop
      // pageTop is 
      
    */
    var underTop    = pageBottom - containerTop;
    var aboveBottom = containerBottom - pageTop;
    //if ( underTop > 0 && aboveBottom > 0 ) { console.log(page.model.get('pageNumber'), underTop/pageHeight, aboveBottom/pageHeight); }
    var visibility = ( pageBottom > containerTop ) && ( pageTop < containerBottom );
    return visibility;
  }
  
});
