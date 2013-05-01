DV.view.Notes = DV.Backbone.View.extend({
  initialize: function(options) {
    this.viewer          = options.viewer;
    this.PAGE_NOTE_FUDGE = window.dc && dc.account && (dc.account.isOwner || dc.account.isReviewer) ? 46 : 26;
  },
  
  render: function() {
    if (this.viewer.options.showAnnotations === false) return;

    var notes = this.viewer.model.notes;
    for (var i=0; i< notes.length; i++) {
      var anno      = notes.at(i);
      //anno.of       = _.indexOf(notes.byPage[anno.get('page') - 1], anno);
      anno.position = i + 1;
      anno.html     = this.renderNote(anno);
    }

    var rendered  = notes.map(function(anno){ return anno.html; });
    var html      = rendered.join('')
                    .replace(/id="DV-annotation-(\d+)"/g, function(match, id) {
      return 'id="DV-listAnnotation-' + id + '" rel="aid-' + id + '"';
    });
    this.viewer.$('div.DV-allAnnotations').html(html);

    // TODO: This is hacky, but seems to be necessary. When fixing, be sure to
    // test with both autozoom and page notes.
    this.updateAnnotationOffsets();
    _.defer(_.bind(this.updateAnnotationOffsets, this));
  },
  
  // stolen from models/annotation.js#render(annotation)
  renderNote: function(note){
    var pageModel                 = this.viewer.models.pages;
    var zoom                      = pageModel.zoomFactor();
    var adata                     = note.toJSON();
    var x1, x2, y1, y2;
    var page                      = this.viewer.model.pages.getPageByIndex(note.get("page") - 1);

    if(adata.type === 'page'){
      x1 = x2 = y1 = y2           = 0;
      adata.top                   = 0;
    }else{
      y1                          = Math.round((adata.y1) * zoom);
      y2                          = Math.round((adata.y2) * zoom);
      if (x1 < this.LEFT_MARGIN) x1 = this.LEFT_MARGIN;
      x1                          = Math.round(adata.x1 * zoom);
      x2                          = Math.round(adata.x2 * zoom);
      adata.top                   = y1 - 5;
    }

    adata.owns_note               = adata.owns_note || false;
    adata.width                   = page.get('width') * zoom;
    adata.pageNumber              = adata.page;
    adata.author                  = adata.author || "";
    adata.author_organization     = adata.author_organization || "";
    adata.bgWidth                 = adata.width;
    adata.bWidth                  = adata.width - 16;
    adata.excerptWidth            = (x2 - x1) - 8;
    adata.excerptMarginLeft       = x1 - 3;
    adata.excerptHeight           = y2 - y1;
    adata.index                   = page.pageIndex;
    adata.image                   = page.imageURL();
    adata.imageTop                = y1 + 1;
    adata.tabTop                  = (y1 < 35 ? 35 - y1 : 0) + 8;
    // position missing
    adata.imageWidth              = page.get('width') * zoom;
    adata.imageHeight             = Math.round(page.get('height'))* zoom;                // wrong
    adata.regionLeft              = x1;
    adata.regionWidth             = x2 - x1 ;
    adata.regionHeight            = y2 - y1;
    adata.excerptDSHeight         = adata.excerptHeight - 6;
    adata.DSOffset                = 3;
    adata.text                    = adata.content;

    if (adata.access == 'public')         adata.accessClass = 'DV-accessPublic';
    else if (adata.access =='exclusive')  adata.accessClass = 'DV-accessExclusive';
    else if (adata.access =='private')    adata.accessClass = 'DV-accessPrivate';

    adata.orderClass = '';
    adata.options = this.viewer.options;
    if (note === this.viewer.model.notes.first()) adata.orderClass += ' DV-firstAnnotation';
    if (note === this.viewer.model.notes.last()) { adata.orderClass += ' DV-lastAnnotation'; }

    var template = (adata.type === 'page') ? 'pageAnnotation' : 'annotation';
    return JST[template](adata);
  },
  
  renderPageNote: function(note) {
    
  },
  
  // Offsets all document pages based on interleaved page annotations.
  updateAnnotationOffsets: function(){
    var notes                 = this.viewer.model.notes;
    notes.offsetsAdjustments  = [];
    notes.offsetAdjustmentSum = 0;
    var documentModel         = this.viewer.models.document;
    var annotationsContainer  = this.viewer.$('div.DV-allAnnotations');
    var pageAnnotationEls     = annotationsContainer.find('.DV-pageNote');
    var pageNoteHeights       = this.viewer.model.pages.pageNoteHeights;
    var me                    = this;

    if(this.viewer.$('div.DV-docViewer').hasClass('DV-viewAnnotations') == false){
      annotationsContainer.addClass('DV-getHeights');
    }

    // First, collect the list of page annotations, and associate them with
    // their DOM elements.
    var pageAnnos = [];
    var pageNotes = notes.select(function(anno) { return anno.get('type') == 'page'; });
    _.each(pageNotes, function(anno, i) {
      anno.el = pageAnnotationEls[i];
      pageAnnos[anno.get('page')] = anno;
    });

    // Then, loop through the pages and store the cumulative offset due to
    // page annotations.
    for (var i = 0; i <= documentModel.totalPages; i++) {
      pageNoteHeights[i] = 0;
      if (pageAnnos[i]) {
        var height = (DV.jQuery(pageAnnos[i].el).height() + this.PAGE_NOTE_FUDGE);
        pageNoteHeights[i - 1] = height;
        notes.offsetAdjustmentSum += height;
      }
      notes.offsetsAdjustments[i] = notes.offsetAdjustmentSum;
    }
    annotationsContainer.removeClass('DV-getHeights');
  }
  
  // Refresh the annotation's title and content from the model, in both
  // The document and list views.
  // N.B. Extracted from Annotation Model
  //refreshAnnotation : function(anno) {
  //  var viewer = this.viewer;
  //  anno.html = this.render(anno);
  //  DV.jQuery.$('#DV-annotation-' + anno.id).replaceWith(anno.html);
  //}
  
  
});
