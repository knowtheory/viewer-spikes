DV.view.Page = DV.Backbone.View.extend({
  // In pixels.
  BASE_WIDTH      : 700,
  BASE_HEIGHT     : 906,
  // Factors for scaling from image size to zoomlevel.
  SCALE_FACTORS   : {'500': 0.714, '700': 1.0, '800': 0.8, '900': 0.9, '1000': 1.0},
  // For viewing page text.
  DEFAULT_PADDING : 100,
  // Embed reduces padding.
  REDUCED_PADDING : 44,
  // Mini padding, when < 500 px wide.
  MINI_PADDING    : 18,

  initialize: function(options) {
    this.viewer          = options.viewer;
    // Real page heights.
    this.pageHeights     = [];
    // Real page note heights.
    this.pageNoteHeights = [];
    // Rolling average page height.
    this.averageHeight   = 0;
    this.baseWidth       = this.BASE_WIDTH;
    this.baseHeight      = this.BASE_HEIGHT;
    this.width           = this.viewer.state.get('zoomLevel');
    this.height          = this.baseHeight * this.zoomFactor();
    
  },
  /*
    ORIGINAL PAGE VIEW
  */

  setPageImage: function(){ this.pageImageEl = this.getPageImage(); },

  // get page image to update
  getPageImage: function(){ return this.el.find('img.DV-pageImage'); },

  // Get the offset for the page at its current index
  getOffset: function(){ return this.model_document.offsets[this.index]; },

  getPageNoteHeight: function() { return this.model_pages.pageNoteHeights[this.index]; },

  // Draw the current page and its associated layers/annotations
  // Will stop if page index appears the same or force boolean is passed
  draw: function(argHash) {

    // Return immeditately if we don't need to redraw the page.
    if(this.index === argHash.index && !argHash.force && this.imgSource == this.model_pages.imageURL(this.index)){
      return;
    }

    this.index = (argHash.force === true) ? this.index : argHash.index;
    var _types = [];
    var source = this.model_pages.imageURL(this.index);

    // Set the page number as a class, for page-dependent elements.
    this.el[0].className = this.el[0].className.replace(/\s*DV-page-\d+/, '') + ' DV-page-' + (this.index + 1);

    if (this.imgSource != source) {
      // Change the image source
      this.imgSource = source;
      // load & notify the model as to what the image's dimensions are.
      this.loadImage();
    }
    this.sizeImage();
    this.position();

    // Only draw annotations if page number has changed or the
    // forceAnnotationRedraw flag is true.
    if(this.pageNumber != this.index+1 || argHash.forceAnnotationRedraw === true){
      for(var i = 0; i < this.annotations.length;i++){
        this.annotations[i].remove();
        delete this.annotations[i];
        this.hasLayerRegional = false;
        this.hasLayerPage     = false;
      }
      this.annotations = [];

      // if there are annotations for this page, it will proceed and attempt to draw
      var byPage = this.model_annotations.byPage[this.index] || [];
      if (byPage) {
        // Loop through all annotations and add to page
        for (var i=0; i < byPage.length; i++) {
          var anno = byPage[i];

          if(anno.id === this.viewer.annotationToLoadId){
            var active = true;
            if (anno.id === this.viewer.annotationToLoadEdit) argHash.edit = true;
            if (this.viewer.openingAnnotationFromHash) {
              this.viewer.helpers.jump(this.index, (anno.top || 0) - 37);
              this.viewer.openingAnnotationFromHash = false;
            }
          }else{
            var active = false;
          }

          if(anno.type == 'page'){
            this.hasLayerPage     = true;
          }else if(anno.type == 'regional'){
            this.hasLayerRegional = true;
          }

          var html = this.viewer.$('.DV-allAnnotations .DV-annotation[rel=aid-'+anno.id+']').clone();
          html.attr('id','DV-annotation-' + anno.id);
          html.find('.DV-img').each(function() {
            var el = DV.jQuery(this);
            el.attr('src', el.attr('data-src'));
          });

          var newAnno = new DV.Annotation({
            renderedHTML: html,
            id:           anno.id,
            page:         this,
            pageEl:       this.pageEl,
            annotationContainerEl : this.annotationContainerEl,
            pageNumber:   this.pageNumber,
            state:        'collapsed',
            top:          anno.y1,
            left:         anno.x1,
            width:        anno.x1 + anno.x2,
            height:       anno.y1 + anno.y2,
            active:       active,
            showEdit:     argHash.edit,
            type:         anno.type
            }
          );

          this.annotations.push(newAnno);
        }
      }

      this.pageInsertEl.toggleClass('visible', !this.hasLayerPage);
      this.renderMeta({ pageNumber: this.index+1 });

      // Draw remove overlay if page is removed.
      this.drawRemoveOverlay();
    }
    // Update the page type
    this.setPageType();

  },

  drawRemoveOverlay: function() {
    this.removedOverlayEl.toggleClass('visible', !!this.viewer.models.removedPages[this.index+1]);
  },

  setPageType: function(){
    if(this.annotations.length > 0){
     if(this.hasLayerPage === true){
      this.el.addClass('DV-layer-page');
     }
     if(this.hasLayerRegional === true){
      this.el.addClass('DV-layer-page');
     }
    }else{
      this.el.removeClass('DV-layer-page DV-layer-regional');
    }
  },

  // Position Y coordinate of this page in the view based on current offset in the Document model
  position: function(argHash){
    this.el.css({ top: this.model_document.offsets[this.index] });
    this.offset  = this.getOffset();
  },

  // Render the page meta, currently only the page number
  renderMeta: function(argHash){
    this.pageNumberEl.text('p. '+argHash.pageNumber);
    this.pageNumber = argHash.pageNumber;
  },

  // Load the actual image 
  // and once loaded, notify the page collection
  // so that page dimensions can be recalculated
  loadImage: function(argHash) {
    if(this.loadTimer){
      clearTimeout(this.loadTimer);
      delete this.loadTimer;
    }

    this.el.removeClass('DV-loaded').addClass('DV-loading');

    // On image load, update the height for the page and initiate drawImage method to resize accordingly
    var pageModel       = this.model_pages;
    var preloader       = DV.jQuery(new Image);
    var me              = this;

    var lazyImageLoader = function(){
      if(me.loadTimer){
        clearTimeout(me.loadTimer);
        delete me.loadTimer;
      }

      preloader.bind('load readystatechange',function(e) {
        if(this.complete || (this.readyState == 'complete' && e.type == 'readystatechange')){
          if (preloader != me._currentLoader) return;
          pageModel.updateHeight(preloader[0], me.index);
          me.drawImage(preloader[0].src);
          clearTimeout(me.loadTimer);
          delete me.loadTimer;
        }
      });

      var src = me.model_pages.imageURL(me.index);
      me._currentLoader = preloader;
      preloader[0].src = src;
    };

    this.loadTimer = setTimeout(lazyImageLoader, 150);
    this.viewer.pages.redraw();
  },

  sizeImage: function() {
    var width = this.model_pages.width;
    var height = this.model_pages.getPageHeight(this.index);

    // Resize the cover.
    this.coverEl.css({width: width, height: height});

    // Resize the image.
    this.pageImageEl.css({width: width, height: height});

    // Resize the page container.
    this.el.css({height: height, width: width});

    // Resize the page.
    this.pageEl.css({height: height, width: width});
  },

  // draw the image and update surrounding image containers with the right size
  drawImage: function(imageURL) {
    var imageHeight = this.model_pages.getPageHeight(this.index);
    // var imageUrl = this.model_pages.imageURL(this.index);
    if(imageURL == this.pageImageEl.attr('src') && imageHeight == this.pageImageEl.attr('height')) {
      // already scaled and drawn
      this.el.addClass('DV-loaded').removeClass('DV-loading');
      return;
    }

    // Replace the image completely because of some funky loading bugs we were having
    this.pageImageEl.replaceWith('<img width="'+this.model_pages.width+'" height="'+imageHeight+'" class="DV-pageImage" src="'+imageURL+'" />');
    // Update element reference
    this.setPageImage();

    this.sizeImage();

    // Update the status of the image load
    this.el.addClass('DV-loaded').removeClass('DV-loading');
  },
  
  /*
    END OF ORIGINAL PAGE VIEW
  */

  /*
    EXTRACTED FROM PAGE MODEL
  */

  // Get the complete image URL for a particular page.
  imageURL: function(index) {
    var resources = this.viewer.model.get('resources');
    var url  = resources.page.image;
    var size = this.viewer.state.get('zoomLevel') > this.BASE_WIDTH ? 'large' : 'normal';
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
  zoomFactor : function() { return this.viewer.state.get('zoomLevel') / this.BASE_WIDTH; },

  // Resize or zoom the pages width and height.
  resize : function(zoomLevel) {
    var padding = this.viewer.models.pages.DEFAULT_PADDING;

    if (zoomLevel) {
      if (zoomLevel == this.viewer.state.get('zoomLevel')) return;
      var previousFactor  = this.zoomFactor();
      zoomLevel           = zoomLevel || this.viewer.state.get('zoomLevel');
      var scale           = this.zoomFactor() / previousFactor;
      this.width          = Math.round(this.baseWidth * this.zoomFactor());
      this.height         = Math.round(this.height * scale);
      this.averageHeight  = Math.round(this.averageHeight * scale);
    }

    this.viewer.elements.sets.width(zoomLevel);
    this.viewer.elements.collection.css({width : this.width + padding });
    this.viewer.$('.DV-textContents').css({'font-size' : zoomLevel * 0.02 + 'px'});
  },

  // Update the height for a page, when its real image has loaded.
  //updateHeight: function(image, pageIndex) {
  //  var h = this.getPageHeight(pageIndex);
  //  var height = image.height * (this.zoomLevel > this.BASE_WIDTH ? 0.7 : 1.0);
  //  if (image.width < this.baseWidth) {
  //    // Not supposed to happen, but too-small images sometimes do.
  //    height *= (this.baseWidth / image.width);
  //  }
  //  this.setPageHeight(pageIndex, height);
  //  this.averageHeight = ((this.averageHeight * this.numPagesLoaded) + height) / (this.numPagesLoaded + 1);
  //  this.numPagesLoaded += 1;
  //  if (h === height) return;
  //  this.viewer.document.computeOffsets();
  //  this.viewer.pages.simpleReflowPages();
  //  if (!this.viewer.activeAnnotation && (pageIndex < this.viewer.models.document.currentIndex())) {
  //    var diff = Math.round(height * this.zoomFactor() - h);
  //    this.viewer.elements.window[0].scrollTop += diff;
  //  }
  //},

  // set the real page height
  setPageHeight: function(pageIndex, pageHeight) { this.pageHeights[pageIndex] = Math.round(pageHeight); },

  // get the real page height
  getPageHeight: function(pageIndex) {
    var realHeight = this.pageHeights[pageIndex];
    return Math.round(realHeight ? realHeight * this.zoomFactor() : this.height);
  }

  /*
    END OF PAGE MODEL
  */
  
  
});
