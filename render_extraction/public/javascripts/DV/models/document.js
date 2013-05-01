// The Document Model is in actuality a rather
// confused presenter conflated with viewer state storage.
//
// The Document "Model" such as it is should be converted
// to a view and as much state as possible pushed into the
// ViewerState model.
DV.model.Document = function(viewer){
  this.viewer                    = viewer;
  
  this.offsets                   = []; // page collection property
  this.baseHeightsPortion        = []; //
  this.baseHeightsPortionOffsets = []; //
  this.paddedOffsets             = []; //
  this.originalPageText          = {}; // page collection property
  this.totalDocumentHeight       = 0;  // 
  this.totalPages                = 0;
  this.additionalPaddingOnPage   = 0;
  this.ZOOM_RANGES               = [500, 700, 800, 900, 1000];

  //var data                       = this.viewer.schema.data;
  var doc                        = this.viewer.model;

  //this.state                     = data.state;
  //this.baseImageURL              = data.baseImageURL;
  //this.canonicalURL              = data.canonicalURL;
  this.additionalPaddingOnPage   = this.viewer.state.get('additionalPaddingOnPage');
  this.pageWidthPadding          = this.viewer.state.get('pageWidthPadding');
  this.totalPages                = doc.totalPages;
  
  this.onPageChangeCallbacks = [];

  var zoom = this.zoomLevel = this.viewer.state.get('zoomLevel');
  if (zoom == 'auto') this.zoomLevel = this.viewer.state.defaults.zoomLevel;

  // The zoom level cannot go over the maximum image width.
  var maxZoom = _.last(this.ZOOM_RANGES);
  if (this.zoomLevel > maxZoom) this.zoomLevel = maxZoom;
};

DV.model.Document.prototype = {

  setPageIndex : function(index) {
    // current page now lives on model
    this.viewer.state.set('pageIndex', index);
    //this.currentPageIndex = index;
    // Page indicator needs to be moved to view, and subscribe to change:currentPageIndex
    this.viewer.elements.currentPage.text(this.currentPage());
    this.viewer.helpers.setActiveChapter(this.viewer.models.chapters.getChapterId(index));
    _.each(this.onPageChangeCallbacks, function(c) { c(); });
    return index;
  },
  currentPage : function() {
    return this.viewer.state.get('pageIndex') + 1;
  },
  currentIndex : function() {
    //return this.viewer.model.get('currentPageIndex');
    return this.viewer.state.get('pageIndex');
  },
  nextPage : function() {
    var nextIndex = this.currentIndex() + 1;
    if (nextIndex >= this.totalPages) return this.currentIndex();
    return this.setPageIndex(nextIndex);
  },
  previousPage : function() {
    var previousIndex = this.currentIndex() - 1;
    if (previousIndex < 0) return this.currentIndex();
    return this.setPageIndex(previousIndex);
  },
  zoom: function(zoomLevel,force){
    if(this.zoomLevel != zoomLevel || force === true){
      this.zoomLevel   = zoomLevel;
      this.viewer.models.pages.resize(this.zoomLevel);
      this.viewer.notes.render();
      this.computeOffsets();
    }
  },

  // rewrite this.
  computeOffsets: function() {
    console.log("Computing Page Offsets");
    var annotationModel  = this.viewer.model.notes;
    var pages            = this.viewer.model.pages;
    var totalDocHeight   = 0;
    var adjustedOffset   = 0;
    var len              = this.viewer.model.totalPages;
    var diff             = 0;
    var scrollPos        = this.viewer.elements.window[0].scrollTop;

    for(var i = 0; i < len; i++) {
      var page = pages.getPageByIndex(i);
      
      // calculate if there is a page note which needs to be factored in to offset.
      if(annotationModel.offsetsAdjustments[i]){ adjustedOffset = annotationModel.offsetsAdjustments[i]; }

      //var pageHeight     = this.viewer.models.pages.getPageHeight(i);
      var pageHeight     = Math.round(page.get('height') * this.viewer.models.pages.zoomFactor());
      var previousOffset = page.get('offset') || 0; //this.offsets[i] || 0;
      var h              = this.offsets[i] = adjustedOffset + totalDocHeight;
      page.set('offset', h);

      // if the page's offset has not changed, 
      // and the total document height is smaller than the current scroll position
      if((previousOffset !== h) && (h < scrollPos)) {
        var delta = h - previousOffset - diff;
        scrollPos += delta;
        diff += delta;
      }

      this.baseHeightsPortion[i]        = Math.round((pageHeight + this.additionalPaddingOnPage) / 3);
      this.baseHeightsPortionOffsets[i] = (i == 0) ? 0 : h - this.baseHeightsPortion[i];

      totalDocHeight                    += (pageHeight + this.additionalPaddingOnPage);
    }

    // Add the sum of the page note heights to the total document height.
    totalDocHeight += adjustedOffset;

    // artificially set the scrollbar height
    if(totalDocHeight != this.totalDocumentHeight){
      diff = (this.totalDocumentHeight != 0) ? diff : totalDocHeight - this.totalDocumentHeight;
      this.viewer.document.setDocHeight(totalDocHeight,diff);
      this.totalDocumentHeight = totalDocHeight;
    }
  },

  getOffset: function(_index){
    var oldOffset = this.offsets[_index];
    var newOffset = this.viewer.model.pages.getPageByIndex(_index).get('offset');
    if (oldOffset !== newOffset) { console.log("Offset mismatch"); }
    //return this.offsets[_index];
    return newOffset;
  },

  resetRemovedPages: function() {
    this.viewer.models.removedPages = {};
  },

  addPageToRemovedPages: function(page) {
    this.viewer.models.removedPages[page] = true;
  },

  removePageFromRemovedPages: function(page) {
    this.viewer.models.removedPages[page] = false;
  },

  redrawPages: function() {
    _.each(this.viewer.pages.pages, function(page) {
      page.drawRemoveOverlay();
    });
    if (this.viewer.thumbnails) {
      this.viewer.thumbnails.render();
    }
  },

  redrawReorderedPages: function() {
    if (this.viewer.thumbnails) {
      this.viewer.thumbnails.render();
    }
  }

};

/*
DV.Schema.prototype.importCanonicalDocument = function(json) {
  json.canonicalURL           = json.canonical_url;

  this.document               = DV.jQuery.extend(true, {}, json);
  // Everything after this line is for back-compatibility.
  this.data.title             = json.title;
  this.data.totalPages        = json.pages;
  this.data.totalAnnotations  = json.annotations.length;
  this.data.sections          = json.sections;
  this.data.chapters          = [];
  this.data.annotationsById   = {};
  this.data.annotationsByPage = {};
  _.each(json.annotations, DV.jQuery.proxy(this.loadAnnotation, this));
};
*/

DV.model.NewDocument = DV.Backbone.Model.extend({
  initialize: function(attributes, options) {
    // Track Sections
    this.sections = new DV.model.SectionSet(attributes.sections);

    // Create the main collection of notes.
    this.notes    = new DV.model.NoteSet();
    this.notes.reset(attributes.annotations);
    
    // Create a collection to represent all pages
    // The PageSet acts as a lazy loading container
    // for Page objects, and will only create them
    // when requested by the PageSet view.
    // In this way the PageSet model also doubles as
    // a factory, and thus needs access to notes
    // and the document's url resources.
    this.pages    = new DV.model.PageSet([], {
      pageTotal: this.get('pages'),
      resources: this.get('resources').page,
      notes:     this.notes
    });
    
    // Legacy behavior (which must be replaced in order to guarantee
    // data integrity via setters)
    this.totalPages   = this.get('pages');
  }
});

DV.model.DocumentSet = DV.Backbone.Collection.extend({
  model: DV.model.NewDocument
});
