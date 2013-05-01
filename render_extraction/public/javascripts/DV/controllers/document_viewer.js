DV.DocumentViewer = DV.Backbone.View.extend({
  
  initialize: function(options) {
    this.options  = options;
    var state_data = {};
    if (options.zoomLevel) state_data.zoomLevel = options.zoomLevel;
    this.state    = new DV.model.ViewerState(state_data, { viewer: this });

    // this is a hack just to get loading working. see the end of states.InitialLoad
    this.history        = this.state.history;
    
    // Legacy components to be refactored
    this.helpers  = _.extend({}, DV.Schema.helpers);
    this.api      = new DV.Api(this);
    this.models   = {};
    this.confirmStateChange = null;
    this.onStateChangeCallbacks = [];
        
    // Extend helpers with viewer references to provide 
    // access to viewer internals in the helper namespace.
    this.helpers  = _.extend(this.helpers, {
      viewer      : this,
      state       : this.state
    });
  },
  
  // loadModels is currently necessary to initialize a pile of presenters
  // it should be replaced by subsuming the data munging components
  // into Backbone models, and view configuration into Backbone views
  // and a call to the viewer's render method.
  loadModels: function() {
    this.models.chapters     = new DV.model.Chapters(this);
    this.models.document     = new DV.model.Document(this);
    this.models.pages        = new DV.model.Pages(this);
    this.models.removedPages = {};
  },

  createSubViews: function() {
    this.sidebar  = new DV.view.ChapterSidebar({viewer: this});
    this.document = new DV.view.Document({viewer: this});
    this.notes    = new DV.view.Notes({viewer: this});
    this.pages    = new DV.view.PageSet({viewer: this, model: this.model.pages});
  },

  // transition between viewer states.
  open: function(state) {
    if (this.state.name == state) return;
    var continuation = _.bind( function() { this.state.transitionTo(state); return true; }, this );
    this.confirmStateChange ? this.confirmStateChange(continuation) : continuation();
  },

  notifyChangedState: function() {
    _.each(this.onStateChangeCallbacks, function(c) { c(); });
  },

  slapIE: function(){ this.$el.css({zoom: 0.99}).css({zoom: 1}); },

  recordHit: function(hitUrl){ // pulled wholesale
    var loc = window.location;
    var url = loc.protocol + '//' + loc.host + loc.pathname;
    if (url.match(/^file:/)) return false;
    url = url.replace(/[\/]+$/, '');
    var id   = parseInt(this.api.getId(), 10);
    var key  = encodeURIComponent('document:' + id + ':' + url);
    DV.jQuery(document.body).append('<img alt="" width="1" height="1" src="' + hitUrl + '?key=' + key + '" />');
  },
  
  render: function(){
    var doc         = this.model.toJSON();
    var pagesHTML   = this.pages.render();
    var description = (doc.description) ? doc.description : null;
    var storyURL = doc.resources.related_article;

    var headerHTML  = JST['header']({
      options     : this.options,
      id          : doc.id,
      story_url   : storyURL,
      title       : doc.title || ''
    });
    var footerHTML = JST['footer']({options : this.options});

    var pdfURL = doc.resources.pdf;
    pdfURL = pdfURL && this.options.pdf !== false ? '<a target="_blank" href="' + pdfURL + '">Original Document (PDF) &raquo;</a>' : '';

    var contribs = doc.contributor && doc.contributor_organization &&
                   ('' + doc.contributor + ', '+ doc.contributor_organization);

    var showAnnotations = this.helpers.showAnnotations();
    var printNotesURL = (showAnnotations) && doc.resources.print_annotations;

    var viewerOptions = {
      options : this.options,
      pages: pagesHTML,
      header: headerHTML,
      footer: footerHTML,
      pdf_url: pdfURL,
      contributors: contribs,
      story_url: storyURL,
      print_notes_url: printNotesURL,
      descriptionContainer: JST['descriptionContainer']({ description: description}),
      autoZoom: this.options.zoom == 'auto',
      mini: false
    };

    var width  = this.options.width;
    var height = this.options.height;
    if (width && height) {
      if (width < 500) {
        this.options.mini = true;
        viewerOptions.mini = true;
      }
      DV.jQuery(this.options.container).css({
        position: 'relative',
        width: this.options.width,
        height: this.options.height
      });
    }

    var container = this.options.container;
    var containerEl = DV.jQuery(container);
    if (!containerEl.length) throw "Document Viewer container element not found: " + container;
    containerEl.html(JST['viewer'](viewerOptions));
  }
});

// The origin function, kicking off the entire documentViewer render.
DV.load = function(documentRep, options) {
  options = options || {};
  var id  = documentRep.id || documentRep.match(/([^\/]+)(\.js|\.json)$/)[1];
  if ('showSidebar' in options) options.sidebar = options.showSidebar;
  var defaults = {
    container : document.body,
    zoom      : 'auto',
    sidebar   : true
  };
  options            = _.extend({}, defaults, options);
  options.fixedSize  = !!(options.width || options.height);
  options.el         = options.container;
  var viewer         = new DV.DocumentViewer(options);
  DV.viewers[id]     = viewer;
  // Once we have the JSON representation in-hand, finish loading the viewer.
  var continueLoad = DV.loadJSON = function(json) {
    
    // Since we're retaining the existing loading mechanism
    // we'll load the models manually.
    // N.B. this does a shallow copy using _.clone, rather than
    // jQuery.extend
    var doc = new DV.model.NewDocument(json);
    DV.documents.add(doc);

    // And set viewer's model to the document
    // and initialize subviews and models.
    // ToDo: move this to a callback hooked
    // to the viewer's model loading.
    var viewer = DV.viewers[json.id];
    viewer.model = doc;
    viewer.createSubViews();
    viewer.loadModels();
    //viewer.schema.importCanonicalDocument(json);
    DV.jQuery(function() {
      viewer.open('InitialLoad');
      if (options.afterLoad) options.afterLoad(viewer);
      if (DV.afterLoad) DV.afterLoad(viewer);
      if (DV.recordHit) viewer.recordHit(DV.recordHit);
    });
  };

  // If we've been passed the JSON directly, we can go ahead,
  // otherwise make a JSONP request to fetch it.
  var jsonLoad = function() {
    if (_.isString(documentRep)) {
      if (documentRep.match(/\.js$/)) {
        DV.jQuery.getScript(documentRep);
      } else {
        var crossDomain = viewer.helpers.isCrossDomain(documentRep);
        if (crossDomain) documentRep = documentRep + '?callback=?';
        DV.jQuery.getJSON(documentRep, continueLoad);
      }
    } else {
      continueLoad(documentRep);
    }
  };

  // If we're being asked the fetch the templates, load them remotely before
  // continuing.
  if (options.templates) {
    DV.jQuery.getScript(options.templates, jsonLoad);
  } else {
    jsonLoad();
  }

  return viewer;
};

// If the document viewer has been loaded dynamically, allow the external
// script to specify the onLoad behavior.
if (DV.onload) _.defer(DV.onload);
