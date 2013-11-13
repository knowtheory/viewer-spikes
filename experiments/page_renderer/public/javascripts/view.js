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
    var floor   = this.currentPage < 10                ? 1 : (this.currentPage - 10);
    var ceiling = this.currentPage > this.collection.size() ? this.collection.size() : (this.currentPage + 10);
    var range   = DC._.range(floor, ceiling);
    this.loadPages(range);
  },
  
  identifyCurrentPage: function() {
    this.currentPage = 12;
  },
  
  loadPages: function(pageNumbers) {
    DC._.each( pageNumbers, function(pageNumber){ this.pageViews[pageNumber-1].loadImage(); }, this);
  }
});

DC.view.Page = DC.Backbone.View.extend({
  className: 'page_container',
  render: function() {
    this.$el.html(JST['page']({ page: this.model.toJSON() }));
    return this;
  },
  loadImage: function() {
    this.$('img').attr('src', this.model.imageUrl());
  }
});

