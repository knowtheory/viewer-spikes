// Renderer is the coordinating component for identifying
// browser features and instructing Pages how and where they
// should render.
DC.view.Renderer = DC.Backbone.View.extend({
  /* notes:
    Renderer needs to:
      * determine what the viewable window size is
      * figure out what the viewable boundaries are
      * track scrolling events
      * 
  */
  initialize: function(options){
    
  }
});

DC.view.PageList = DC.Backbone.View.extend({
  initialize: function(options){
    this.pages = [];
    
  }
});

// A Page view's job is to render and manage a Page
// as specified by the Page's model.
// The Page view takes a Page model's natural dimensions
// and scales them to the appropriate dimensions to fit
// within the space allotted by the PageList a page belongs to.
//
// Additionally Page views provide project and unproject methods
// to translate note & other annotation objects positions on a page
// between DOM dimensions and a Page's natural dimensions.
DC.view.Page     = DC.Backbone.View.extend({
  initialize: function(options){
    
  },
  scale: function(relative) {
    this.model.aspectRatio();
  },
  project: function(coordinates){
    var source = DC._.flatten([DC._.toArray(coordinates)]);
    var projected;
    return projected;
  },
  unproject: function(coordinates){
    var projected = DC._.flatten([DC._.toArray(coordinates)]);
    var source;
  },
  render: function(){
    
  }
});

DC.view.Note     = DC.Backbone.View.extend({
  initialize: function(){
    
  }
});
// Use NoteList to display just notes
DC.view.NoteList = DC.Backbone.View.extend({
  initialize: function(){
    
  }
});

