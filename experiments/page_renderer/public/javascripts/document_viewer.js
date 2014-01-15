DC.view.DocumentViewer = DC.Backbone.View.extend({
  className: 'viewer',
  
  events: {
    'click .footer .up'   : 'previousPage',
    'click .footer .down' : 'nextPage',
    'click .footer .menu' : 'menu',
  },
  
  initialize: function(options) {
    //console.log('new viewer');
    this.model = (options.model || new DC.model.Document());
    this.createSubviews();
  },
  
  createSubviews: function() {
    // create ui chrome here.
    this.renderer = new DC.view.Renderer({model: this.model});
  },
  
  render: function() {
    // Some code to set the viewer size to the window dimensions
    // in the event that there aren't explicit limits set.
    // This should be cleaned up/tested further.
    // It should also be generalized/extracted to listen to changes in
    // window dimensions, etc.  Keep it flexible enough to extract and
    // reuse with a viewer which uses a backbone wrapped iframe as it's
    // container.
    var parentHeight = this.$el.parent().height();
    var parentWidth = this.$el.parent().width();
    var height = (parentHeight > 0 ? parentHeight : window.innerHeight);
    var width = (parentWidth > 0 ? parentWidth : window.innerWidth);
    this.$el.css({ height: height, width: width });
    
    // Render the viewer structure
    this.$el.html(JST['viewer']({ document: this.model }));
    // Render viewer chrome.
    // INSERT CHROME CODE HERE.
    // Render the main renderer.
    this.renderer.setElement(this.$('.renderer'));
    this.renderer.render();
    return this;
  },
  
  /*
    PUBLIC API
  */
  
  setDocument: function(data) {
    this.model.set(data);
    this.render();
    this.renderer.loadVisiblePages();
  },
  
  load: function(data) { this.setDocument(data); },
  
  unload: function() {
  },
  
  nextPage: function(e) {
    e.preventDefault();
    this.renderer.jump(this.renderer.currentPage + 1);
  },
  
  previousPage: function(e) {
    e.preventDefault();
    this.renderer.jump(this.renderer.currentPage - 1);
  },
  
  
});

DC._.extend(DV, {
  loadJSON: function(data) {
    this.documents.add(data);
  },
  
  documents: new DC.model.DocumentSet(),
  viewers: {}
});