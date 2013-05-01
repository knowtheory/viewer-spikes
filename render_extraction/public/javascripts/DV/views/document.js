// The Document View is the default view for the DocumentViewer.
// This view is responsible for tabulating the dimensions and
// positions for 
DV.view.Document = DV.Backbone.View.extend({
  initialize: function(options) {
    this.viewer = options.viewer;
    this.model  = this.viewer.model;

    this.offsets                   = [];
    this.baseHeightsPortion        = [];
    this.baseHeightsPortionOffsets = [];
    this.paddedOffsets             = [];
    this.originalPageText          = {};
    this.totalDocumentHeight       = 0;
    this.totalPages                = this.model.get('pages') || 0;
    this.additionalPaddingOnPage   = 0;
    this.ZOOM_RANGES               = [500, 700, 800, 900, 1000];
    
    // new!
    this.defaultZoom               = 700;

    //var data                       = this.viewer.schema.data;
    //
    //this.state                     = data.state;
    //this.baseImageURL              = data.baseImageURL;
    //this.canonicalURL              = data.canonicalURL;
    //this.additionalPaddingOnPage   = data.additionalPaddingOnPage;
    //this.pageWidthPadding          = data.pageWidthPadding;
    //this.totalPages                = data.totalPages;

    this.onPageChangeCallbacks = [];

    var zoom = this.zoomLevel = this.viewer.options.zoom || this.model.get('zoomLevel') || this.defaultZoom;
    if (zoom == 'auto') this.zoomLevel = this.model.get('zoomLevel') || this.defaultZoom;

    // The zoom level cannot go over the maximum image width.
    var maxZoom = _.last(this.ZOOM_RANGES);
    if (this.zoomLevel > maxZoom) this.zoomLevel = maxZoom;
  },
  setPageIndex: function(index) { console.log("DV.view.Document.setPageIndex"); },
  currentPage : function() { console.log("DV.view.Document.currentPage"); },
  currentIndex : function() { console.log("DV.view.Document.currentIndex"); },
  nextPage : function() { console.log("DV.view.Document.nextPage"); },
  previousPage : function() { console.log("DV.view.Document.previousPage"); },
  zoom: function(zoomLevel,force) { console.log("DV.view.Document.zoom"); },
  computeOffsets: function() { console.log("DV.view.Document.computeOffsets"); },
  getOffset: function(_index) { console.log("DV.view.Document.getOffset"); },
  resetRemovedPages: function() { console.log("DV.view.Document.resetRemovedPages"); },
  addPageToRemovedPages: function(page) { console.log("DV.view.Document.addPageToRemovedPages"); },
  removePageFromRemovedPages: function(page) { console.log("DV.view.Document.removePageFromRemovedPages"); },
  redrawPages: function() {console.log("DV.view.Document.redrawPages");},
  redrawReorderedPages: function() {console.log("DV.view.Document.redrawReorderedPages");},
  
  // Removed from helper.js
  setDocHeight:   function(height,diff) {
    this.viewer.elements.bar.css('height', height);
    this.viewer.elements.window[0].scrollTop += diff;
  }
  
});
