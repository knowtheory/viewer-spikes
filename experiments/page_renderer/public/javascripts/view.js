DC.view.Viewer = DC.Backbone.View.extend({
  className: 'viewer',
  
  initialize: function(options) {
    console.log('new viewer');
    this.model = (options.model || new DC.model.Document());
    this.createSubviews();
  },
  
  createSubviews: function() {
    this.pages = new DC.view.PageList();
  },
  
  render: function() {
    this.$el.html(JST['viewer']({ document: this.model }));
    this.renderSubviews();
    return this;
  },
  
  renderSubviews: function() {
    this.pages.setElement(this.$('.pages'));
    this.pages.render();
  },
  
  setDocument: function(data) {
    this.model.set(data);
    this.pages.collection = this.model.pages;
  },
  
  load: function(data) {
    this.setDocument(data);
    this.render();
  }
});

DC.view.PageList = DC.Backbone.View.extend({
  className: 'pages',
  
  initialize: function(options) {
    this.currentPageIndex = (this.currentPageIndex || 0);
    this.throttledLoadVisiblePages = DC._.throttle(DC._.bind(this.loadVisiblePages, this), 100);
  },
  
  events: { 'scroll': 'throttledLoadVisiblePages' },

  render: function() {
    this.pageViews = this.collection.map( function( pageModel ){ return new DC.view.Page({model: pageModel}); } ) ;
    this.$el.html( DC._.map(this.pageViews, function(view){ return view.render().el; }) );
    return this;
  },
  
  loadVisiblePages: function(e){
    this.identifyCurrentPage();
    var floor   = ( this.currentPage <= 10 ) ? 1 : ( this.currentPage - 10 );
    var ceiling = ( this.currentPage + 10 ) > this.collection.size() ? this.collection.size() : (this.currentPage + 10);
    var range   = DC._.range(floor, ceiling);
    this.loadPages(range);
  },
  
  identifyCurrentPage: function() {
    var viewableTop    = this.$el.scrollTop();
    var viewableBottom = this.$el.height();
    
    // Calculate which pages are visible based their height/offset
    // compared to the visible container
    var visiblePages = DC._.filter(this.pageViews, this.isPageVisible, this);
    
    var middleId = Math.floor(visiblePages.length / 2);
    this.currentPage = visiblePages[middleId].model.get('pageNumber');
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
    console.log(pageNumbers);
    DC._.each( pageNumbers, function(pageNumber){ if(!pageNumber){console.log("help!")}; this.pageViews[pageNumber-1].loadImage(); }, this);
    // this will cause jitter in docs w/ non standard page sizes.
    // to fix, track current position relative to current page, and then jump back
    // to that location.
    this.calculateOffsets();
  },
  
  calculateOffsets: function() {
    
  }
});

DC.view.Page = DC.Backbone.View.extend({
  className: 'page_container',
  events: {
    'onLoad img': 'updateModel'
  },
  render: function() {
    this.$el.html(JST['page']({ page: this.model.toJSON() }));
    this.image = this.$('img');
    return this;
  },
  loadImage: function() {
    this.image.attr('src', this.model.imageUrl());
    this.model.set('imageLoaded', true);
  },
  updateModel: function() {
    this.model.set({
      height: this.image.height(),
      width:  this.image.width()
    });
  }
});

