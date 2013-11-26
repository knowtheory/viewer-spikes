DC.view.DocumentViewer = DC.Backbone.View.extend({
  className: 'viewer',
  
  initialize: function(options) {
    //console.log('new viewer');
    this.model = (options.model || new DC.model.Document());
    this.createSubviews();
  },
  
  createSubviews: function() {
    this.pages   = new DC.view.PageList({collection: this.model.pages});
    this.sidebar = new DC.view.Sidebar({publisher: this.pages});
  },
  
  render: function() {
    this.$el.attr('style', 'height: inherit');
    this.$el.html(JST['viewer']({ document: this.model }));
    this.renderSubviews();
    return this;
  },
  
  renderSubviews: function() {
    this.pages.setElement(this.$('.backdrop'));
    this.pages.render();
    this.sidebar.setElement(this.$('.sidebar'));
    this.sidebar.render();
  },
  
  /*
    PUBLIC API
  */
  
  setDocument: function(data) {
    this.model.set(data);
    this.pages.collection = this.model.pages;
  },
  
  load: function(data) {
    this.setDocument(data);
    this.render();
    this.pages.loadVisiblePages();
  },
  
  unload: function() {
    delete this.pages;
    delete this.model;
    return this;
  }  
});

