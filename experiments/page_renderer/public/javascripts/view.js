DC.view.Viewer = DC.Backbone.View.extend({
  className: 'viewer',
  
  initialize: function(options) {
    //console.log('new viewer');
    this.model = (options.model || new DC.model.Document());
    this.createSubviews();
  },
  
  createSubviews: function() {
    this.pages = new DC.view.PageList({collection: this.model.pages});
  },
  
  render: function() {
    this.$el.attr('style', 'height: inherit');
    this.$el.html(JST['viewer']({ document: this.model }));
    this.renderSubviews();
    return this;
  },
  
  renderSubviews: function() {
    this.pages.setElement(this.$('.matte'));
    this.pages.render();
  },
  
  setDocument: function(data) {
    this.model.set(data);
    this.pages.collection = this.model.pages;
  },
  
  load: function(data) {
    this.setDocument(data);
    this.render();
    this.pages.loadVisiblePages();
  }
});

DC.view.PageList = DC.Backbone.View.extend({
  className: 'matte',
  
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
    this.throttledLoadVisiblePages = DC._.throttle(this.loadVisiblePages, 500);
    
    this.matteHeight = 0;
    this.initializeSubviews();

    this.listenTo(this.collection, 'reset', this.rebuild);
  },
  
  initializeSubviews: function() {
    this.pageViews = this.collection.map( function( pageModel ){ return new DC.view.Page({model: pageModel}); } );
    this.matteHeight = this.height();
  },
  
  events: { 'scroll': 'throttledLoadVisiblePages' },
  
  rebuild: function() {
    this.initializeSubviews();
    this.render();
  },
  
  render: function() {
    this.$('.pages').html(DC._.map(this.pageViews, function(view){ return view.render().el; }));
    this.$('.pages').css({'padding-top': this.matteHeight});
    this.calculatePositions()
    this.placePages();
    return this;
  },
  
  placePages: function() {
    DC._.each(this.pageViews, function(page){ page.$el.css(page.dimensions); });
  },
  
  calculatePositions: function() {
    return DC._.reduce(this.pageViews, function(matteHeight, page){
      var dimensions = { top: matteHeight, 'padding-top': page.height() };
      page.dimensions = dimensions
      return matteHeight + page.height();
    }, 0);
  },
  
  height: function() {
    return DC._.reduce(this.pageViews, function(total, page){ return total + page.height(); }, 0, this);
  },
  
  /*
   Old!
  */
  
  loadVisiblePages: function(e){
    console.log(this.height());
    this.identifyCurrentPage();

    var loadRange = 5;
    // the floor should be the pages to be loaded above the current page
    // unless current page is smaller than that range
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
    //console.log(pageNumbers, DC.$('img').size());
    DC._.each(this.pageViews, function(page){
      DC._.contains(pageNumbers, page.model.get('pageNumber')) ? page.load() : page.unload();
    });
  }
});

DC.view.Page = DC.Backbone.View.extend({
  className: 'page_container',
  initialize: function(options) {
    // Debounce ensureAspectRatio, because we want to listen for changes
    // to both heigth and width, but only fire once if both have been set.
    this.ensureAspectRatio = DC._.bind(DC._.debounce(this.ensureAspectRatio, 10), this);
    this.cacheNaturalDimensions = DC._.bind(this.cacheNaturalDimensions, this);
    
    this.listenTo(this.model, 'change:height', this.ensureAspectRatio);
    this.listenTo(this.model, 'change:width', this.ensureAspectRatio);
  },

  render: function() {
    this.$el.html(JST['page']({ page: this.model.toJSON() }));
    this.image = this.$('img');
    return this;
  },
  
  height: function() {
    return this.model.get('height');
  },

  isLoaded: function() {
    return this.model.get('imageLoaded');
  },

  load: function() {
    if (this.isLoaded()) return;
    //console.log("Loading", this.model.get('pageNumber'));
    
    this.render();
    this.image.attr('src', this.model.imageUrl());
    this.image.load(DC._.bind(function(){
      this.cacheNaturalDimensions();
      this.ensureAspectRatio();
    }, this));
    var attrs = {'imageLoaded': true};
    if (!this.model.get('hasRealDimensions')) { attrs['hasRealDimensions'] = true; }
    this.model.set(attrs);
  },

  unload: function() {
    if (!this.isLoaded()) return;
    //console.log("Unloading", this.model.get('pageNumber'));
    this.image = null;
    this.$('.page').html('');
    //this.image.attr('src', 'data:image/gif;base64,' + 'R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=');
    this.model.set('imageLoaded', false);
  },
  
  setImageDimensions: function(dimensions) {
    var width  = dimensions.width;
    var height = dimensions.height;
    this.$('.page').attr('style', 'width: '+width+'px; height: '+height+'px;' );
    this.image.attr({ width: width + 'px', height: height + 'px' });
  },

  ensureAspectRatio: function() {
    //console.log("ensuring Aspect Ratio!");
    this.setImageDimensions(this.model.constrainedDimensions(700));
  },

  cacheNaturalDimensions: function() {
    var unstyledImage = DC.$(new Image());
    var model = this.model;
    unstyledImage.load(function(){ model.set({ height: this.height, width:  this.width }); });
    unstyledImage.attr('src', model.imageUrl());
  }
  
});

