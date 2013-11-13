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
  },
  
  render: function() {
    this.pageViews = this.collection.map( function( pageModel ){ return new DC.view.Page({model: pageModel}); } ) ;
    this.$el.html( DC._.map(this.pageViews, function(view){ return view.render().el; }) );
    return this;
  }
});

DC.view.Page = DC.Backbone.View.extend({
  className: 'page_container',
  render: function() {
    this.$el.html(JST['page']({ page: this.model.toJSON() }));
    return this;
  }
});

