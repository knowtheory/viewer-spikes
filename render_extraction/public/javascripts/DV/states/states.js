// Viewer State machine
// encapsulates the current state of the viewer
// and manages which states the viewer can transition into
// as well as notifications 
DV.model.ViewerState = DV.Backbone.Model.extend({
  ZOOM_RANGES: [500, 700, 800, 900, 1000],

  defaults: {
    zoomLevel: 700,
    pageWidthPadding: 20,
    additionalPaddingOnPage: 30,
    pageIndex: 0
  },

  initialize: function(attributes, options){ 
    this.viewer = options.viewer;
    this.busy = false;
    
    // retaining use of existing History object, prior to moving to
    // Backbone.History
    this.history = new DV.History(this.viewer);

    // this is a hack to preserve the existing event function namespacing
    this.observers      = [];
    this.eventFunctions = _.extend( { viewer: this.viewer }, DV.Schema.events);
    this.delegated      = {};
    
    // TODO:
    // iterate over the state names to create a list 
    // of event namespaces to attach callbacks to when
    // a transition is made.
  },
  
  transitionTo: function(name) {
    // call state function
    //console.log("transitioning to: "+name);
    this.name = name;
    this.states[name].apply(this.viewer, arguments);
    // Trigger event announcing transition into state.
    // ??? do something.
  },
  
  // The original viewer has a notion of delegated event/state functions
  // where a single function can be called, and depending on the current
  // state of the viewer, the call will be dispatche dynamically to a
  // namespaced behavior.
  //
  // For example, viewer.compiled.next().
  //
  // This functionality has been migrated over to the viewer state to
  // manage for the time being.
  //
  // instead of calling viewer.compiled.next()
  // call: viewer.state.delegated.next()
  delegatedEventFunction: function(methodName) {
    //console.log(arguments.callee.caller);
    return _.bind(_.partial(this.delegateToState,methodName), this);
  },

  delegateToState: function() {
    //console.log("DELEGATE TO STATE");
    //console.log(arguments.callee.caller);
    var args = _.toArray(arguments);
    var methodName = args.shift();
    //console.log(methodName);
    //console.log(this);
    if (this.eventFunctions[this.name] && this.eventFunctions[this.name][methodName]) { 
      this.eventFunctions[this.name][methodName].apply(this.eventFunctions, args); 
    } else { 
      this.eventFunctions[methodName].apply(this.eventFunctions, args);
    }
  },
  
  states: {
    InitialLoad: function() {
      console.log("InitialLoad");
      // If we're in an unsupported browser ... bail.
      if (this.helpers.unsupportedBrowser()) return;

      // Insert the Document Viewer HTML into the DOM.
      //this.helpers.renderViewer();
      this.render();

      // Cache DOM node references.  See lib/elements.js and elements/elements.js for the actual list of elements.
      this.elements = new DV.Elements(this);

      // Render included components, and hide unused portions of the UI.
      this.helpers.renderComponents();

      // Render chapters and notes navigation:
      this.sidebar.render(); // used to be: this.helpers.renderNavigation();

      // Render CSS rules for showing/hiding specific pages:
      this.helpers.renderSpecificPageCss();

      // Instantiate pageset and build accordingly
      //this.pages = new DV.PageSet(this);
      //this.pages = new DV.view.PageSet({viewer: this});
      //this.pages.buildPages();
      this.pages.buildPages();

      // BindEvents
      this.helpers.bindEvents(this);

      this.helpers.positionViewer();
      this.models.document.computeOffsets(); // the event loop seems to render everything fine w/o this.

      // Tell viewer to (re)draw pages every 100 ms (see helpers.addObserver, events.check, and helpers.startCheckTimer)
      this.helpers.addObserver('drawPages');
      this.helpers.registerHashChangeEvents();
      this.dragReporter = new DV.DragReporter(this, '.DV-pageCollection',DV.jQuery.proxy(this.helpers.shift, this), { ignoreSelector: '.DV-annotationContent' });

      // Start observer timer loop.
      this.helpers.startCheckTimer();
      // If configured to do so, open the viewer to a non-default state.
      this.helpers.handleInitialState();
      _.defer(_.bind(this.helpers.autoZoomPage, this.helpers));
    },
    ViewAnnotation: function(){ console.log("View Annotation"); 
      this.helpers.reset();                       // in construction.js
      this.helpers.ensureAnnotationImages();      // 
      this.activeAnnotationId = null;
      this.acceptInput.deny(); // lock jumping to another page (since that doesn't make sense in the Notes tab)
      // Nudge IE to force the annotations to repaint.
      if (DV.jQuery.browser.msie) {
        this.elements.annotations.css({zoom : 0});
        this.elements.annotations.css({zoom : 1});
      }

      this.helpers.toggleContent('viewAnnotations');
      this.state.delegated.next();
      return true;
    },
    ViewDocument: function() { 
      console.log("View Document");
      this.helpers.reset();                   // in construction.js cleans up search/activeAnnotation/dragReporter/drawPages.
      this.helpers.addObserver('drawPages');  // resets the page drawing function
      this.dragReporter.setBinding();
      this.elements.window.mouseleave(DV.jQuery.proxy(this.dragReporter.stop, this.dragReporter));
      this.acceptInput.allow();

      this.helpers.toggleContent('viewDocument');

      this.helpers.setActiveChapter(this.models.chapters.getChapterId(this.models.document.currentIndex()));

      this.helpers.jump(this.models.document.currentIndex());
      return true;
    },
    ViewSearch: function() { console.log("View Search"); },
    ViewText: function() { console.log("View Text"); },
    ViewThumbnails: function() {
      console.log("View Thumbnails");
      this.helpers.reset();
      this.helpers.toggleContent('viewThumbnails');
      this.thumbnails = new DV.Thumbnails(this); // new DV.view.ThumbnailSet({viewer: this});
      this.thumbnails.render();
      return true;
    }

  }
});

DV.Schema.states = {
  ViewEntity: function(name, offset, length) {
    this.helpers.reset();
    this.helpers.toggleContent('viewSearch');
    this.helpers.showEntity(name, offset, length);
  },
  ViewSearch: function(){
    this.helpers.reset();

    if(this.elements.searchInput.val() == '') {
      this.elements.searchInput.val(searchRequest);
    } else {
      var searchRequest = this.elements.searchInput.val();
    }

    this.helpers.getSearchResponse(searchRequest);
    this.acceptInput.deny();

    this.helpers.toggleContent('viewSearch');

    return true;
  },

  ViewText: function(){
    this.helpers.reset();
    this.acceptInput.allow();
    this.pages.zoomText();
    this.helpers.toggleContent('viewText');
    this.events.loadText();
    return true;
  }

};
