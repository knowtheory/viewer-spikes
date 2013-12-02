DC.view.DocumentViewer = DC.Backbone.View.extend({
  className: 'viewer',
  
  initialize: function(options) {
    //console.log('new viewer');
    this.model = (options.model || new DC.model.Document());
    this.createSubviews();
  },
  
  createSubviews: function() {
    this.pages   = new DC.view.PageList({collection: this.model.pages});
    this.sidebar = new DC.view.Sidebar();
    
    this.sidebar.listenTo(this.pages, 'scroll', this.sidebar.jump);
    this.sidebar.listenTo(this.pages, 'currentPage', this.sidebar.updateMark);
  },
  
  render: function() {
    var parentHeight = this.$el.parent().height();
    var parentWidth = this.$el.parent().width();
    var height = (parentHeight > 0 ? parentHeight : window.innerHeight);
    var width = (parentWidth > 0 ? parentWidth : window.innerWidth);
    this.$el.css({ height: height, width: width });
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

