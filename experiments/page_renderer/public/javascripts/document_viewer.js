DC.view.DocumentViewer = DC.Backbone.View.extend({
  className: 'viewer',
  
  initialize: function(options) {
    //console.log('new viewer');
    this.model = (options.model || new DC.model.Document());
    this.ui = new DC.Backbone.Model({zoom: 75, currentPage: 1});
    this.createSubviews();
  },
  
  createSubviews: function() {
    // create ui chrome here.
    this.renderer = new DC.view.Renderer({model: this.model, uiState: this.ui});
    this.zoom = new DC.view.Zoom({uiState: this.ui});
    this.pagination = new DC.view.Pagination({uiState: this.ui});
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
    this.$('.footer').prepend(this.pagination.render().el);
    this.$('.footer').prepend(this.zoom.render().el);
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
    delete this.pages;
    delete this.model;
    return this;
  }  
});

