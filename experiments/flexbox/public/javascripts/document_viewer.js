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