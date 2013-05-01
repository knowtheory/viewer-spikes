// The Pages model represents the set of pages in the document, containing the
// image sources for each page, and the page proportions.
DV.model.Pages = function(viewer) {
  this.viewer     = viewer;

  // Rolling average page height.
  this.averageHeight   = 0;

  // Real page heights.
  this.pageHeights     = [];

  // Real page note heights.
  this.pageNoteHeights = [];

  // In pixels.
  this.BASE_WIDTH      = 700;
  this.BASE_HEIGHT     = 906;

  // Factors for scaling from image size to zoomlevel.
  this.SCALE_FACTORS   = {'500': 0.714, '700': 1.0, '800': 0.8, '900': 0.9, '1000': 1.0};

  // For viewing page text.
  this.DEFAULT_PADDING = 100;

  // Embed reduces padding.
  this.REDUCED_PADDING = 44;

  // Mini padding, when < 500 px wide.
  this.MINI_PADDING    = 18;

  this.zoomLevel  = this.viewer.models.document.zoomLevel;
  this.baseWidth  = this.BASE_WIDTH;
  this.baseHeight = this.BASE_HEIGHT;
  this.width      = this.zoomLevel;
  this.height     = this.baseHeight * this.zoomFactor();
  this.numPagesLoaded = 0;
};

DV.model.Pages.prototype = {

  // Get the complete image URL for a particular page.
  imageURL: function(index) {
    var resources = this.viewer.model.get('resources');
    var url  = resources.page.image;
    var size = this.zoomLevel > this.BASE_WIDTH ? 'large' : 'normal';
    var pageNumber = index + 1;
    if (resources.page.zeropad) pageNumber = this.zeroPad(pageNumber, 5);
    url = url.replace(/\{size\}/, size);
    url = url.replace(/\{page\}/, pageNumber);
    return url;
  },

  zeroPad : function(num, count) {
    var string = num.toString();
    while (string.length < count) string = '0' + string;
    return string;
  },

  // Return the appropriate padding for the size of the viewer.
  getPadding: function() {
           if (this.viewer.options.mini)           { return this.MINI_PADDING;
    } else if (this.viewer.options.zoom == 'auto') { return this.REDUCED_PADDING;
    } else                                         { return this.DEFAULT_PADDING;
    }
  },

  // The zoom factor is the ratio of the image width to the baseline width.
  zoomFactor : function() { return this.zoomLevel / this.BASE_WIDTH; },

  // Resize or zoom the pages width and height.
  resize : function(zoomLevel) {
    var padding = this.viewer.model.pages.DEFAULT_PADDING;

    // resize can be called w/o a zoomLevel
    if (zoomLevel) {
      if (zoomLevel == this.zoomLevel) return;
      var previousFactor  = this.zoomFactor();
      this.zoomLevel      = zoomLevel || this.zoomLevel;
      var scale           = this.zoomFactor() / previousFactor;
      this.width          = Math.round(this.baseWidth * this.zoomFactor());
      this.height         = Math.round(this.height * scale);
      this.averageHeight  = Math.round(this.averageHeight * scale);
    }

    // set the PageSet el width to the PageSet's zoomLevel
    this.viewer.elements.sets.width(this.zoomLevel);
    // set the PageSet container to the PageSet's width + padding
    this.viewer.elements.collection.css({width : this.width + padding });
    this.viewer.$('.DV-textContents').css({'font-size' : this.zoomLevel * 0.02 + 'px'});
  },

  // Update the height for a page, when its real image has loaded.
  updateHeight: function(image, pageIndex) {
    
    // get the page's stored height.
    var h = this.getPageHeight(pageIndex);

    // the image's height modulated by whether viewer is zoomed larger
    var height = image.height * (this.zoomLevel > this.BASE_WIDTH ? 0.7 : 1.0);

    if (image.width < this.baseWidth) {
      // Not supposed to happen, but too-small images sometimes do.
      height *= (this.baseWidth / image.width);
    }
    this.setPageHeight(pageIndex, height);
    // update the average page height
    this.averageHeight = ((this.averageHeight * this.numPagesLoaded) + height) / (this.numPagesLoaded + 1);
    // increment the page load count.
    this.numPagesLoaded += 1;
    
    // if the actual loaded page height is equal to the assumed page height
    // return
    if (h === height) return;

    // If it's not, recomput all page position offsets and reflow the pages
    this.viewer.document.computeOffsets();
    this.viewer.pages.simpleReflowPages();
    // Jump to the top of the current page, if loading pushed our page top off and a note isn't open.
    if (!this.viewer.activeAnnotation && (pageIndex < this.viewer.models.document.currentIndex())) {
      var diff = Math.round(height * this.zoomFactor() - h);
      this.viewer.elements.window[0].scrollTop += diff;
    }
  },

  // set the real page height
  setPageHeight: function(pageIndex, pageHeight) { 
    this.pageHeights[pageIndex] = Math.round(pageHeight);
    var page = this.viewer.model.pages.getPageByIndex(pageIndex);
    page.set('height', pageHeight);
  },

  // get the real page height
  getPageHeight: function(pageIndex) {
    var realHeight = this.pageHeights[pageIndex];
    return Math.round(realHeight ? realHeight * this.zoomFactor() : this.height);
  }

};

DV.model.Page = DV.Backbone.Model.extend({
  defaults: {
    notes: [],
    height: 906,
    width: 700,
    padding: 'normal',
    offset: 0
    /*
      imageURL
    */
  },

  initialize: function(attributes, options) {
    this.notes      = new DV.model.NoteSet(this.get('notes'));
    this.pageIndex  = this.get('index');
    this.pageNumber = this.pageIndex + 1;
  },
  
  // Get the complete image URL for a particular page.
  imageURL: function(size) {
    var url  = this.get('imageURL');
    var pageIdentifier = this.pageNumber;
    if (size != 'large' || size != 'normal') { size = 'normal'; }
    if (this.get('zeropad')) { pageIdentifier = this.zeroPad(this.pageNumber, 5); }
    url = url.replace(/\{size\}/, size);
    url = url.replace(/\{page\}/, pageIdentifier);
    return url;
  },

  // helper to pad page number with 0s used in conjunction
  // with image/text URL creation.
  zeroPad : function(num, count) {
    var string = num.toString();
    while (string.length < count) string = '0' + string;
    return string;
  }

});


DV.model.PageSet = DV.Backbone.Collection.extend({
  initialize: function(models, options) {
    this.resources = options.resources || {};
    this.notes     = options.notes     || new DV.model.NoteSet();
    this.padding   = options.padding   || 'reduced';
    this.pageTotal = options.pageTotal || 0;
    
    // Rolling average page height.
    this.averageHeight   = 0;

    // Real page heights.
    this.pageHeights     = [];

    // Real page note heights.
    this.pageNoteHeights = [];

    // In pixels.
    this.BASE_WIDTH      = 700;
    this.BASE_HEIGHT     = 906;

    // Factors for scaling from image size to zoomlevel.
    this.SCALE_FACTORS   = {'500': 0.714, '700': 1.0, '800': 0.8, '900': 0.9, '1000': 1.0};

    // For viewing page text.
    this.DEFAULT_PADDING = 100;

    // Embed reduces padding.
    this.REDUCED_PADDING = 44;

    // Mini padding, when < 500 px wide.
    this.MINI_PADDING    = 18;
    
    this.PADDINGS = {
      'default': 100,
      'reduced': 44,
      'mini'   : 18
    };
    this.numPagesLoaded = 0;
  },
  
  getPadding: function() { return this.PADDINGS[this.padding]; },
  
  // getPageByIndex will fetch or create a Page object
  // to represent a page.
  getPageByIndex: function(pageIndex) {
    var page = this.find(function(model){ return model.get('index') == pageIndex; });
    if (!page) {
      page = new DV.model.Page({
        index:    pageIndex,
        height:   this.BASE_HEIGHT,
        width:    this.BASE_WIDTH,
        padding:  this.getPadding(),
        imageURL: this.resources.image,
        textURL:  this.resources.text,
        notes:    this.notes.byPage[pageIndex],
        zeroPad:  (this.resources.page && this.resources.page.zeroPad)
      });
      this.add(page);
    }
    return page;
  }
});
