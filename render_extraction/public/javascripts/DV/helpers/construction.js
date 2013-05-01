 // Renders the navigation sidebar for chapters and annotations.
_.extend(DV.Schema.helpers, {

  showAnnotations : function() {
    if (this.viewer.options.showAnnotations === false) return false;
    return _.size(this.viewer.model.notes.byId) > 0;
  },

  // If there is no description, no navigation, and no sections, tighten up
  // the sidebar.
  displayNavigation : function() {
    var doc = this.viewer.model;
    var missing = (!doc.get('description') && !_.size(this.viewer.model.notes.byId) && !this.viewer.model.sections.length);
    this.viewer.$('.DV-supplemental').toggleClass('DV-noNavigation', missing);
  },

  renderSpecificPageCss : function() {
    var classes = [];
    for (var i = 1, l = this.viewer.models.document.totalPages; i <= l; i++) {
      classes.push('.DV-page-' + i + ' .DV-pageSpecific-' + i);
    }
    var css = classes.join(', ') + ' { display: block; }';
    var stylesheet = '<style type="text/css" media="all">\n' + css +'\n</style>';
    DV.jQuery("head").append(stylesheet);
  },

  // Hide or show all of the components on the page that may or may not be
  // present, depending on what the document provides.
  renderComponents : function() {
    // Hide the overflow of the body, unless we're positioned.
    var containerEl = DV.jQuery(this.viewer.options.container);
    var position = containerEl.css('position');
    if (position != 'relative' && position != 'absolute' && !this.viewer.options.fixedSize) {
      DV.jQuery("html, body").css({overflow : 'hidden'});
      // Hide the border, if we're a full-screen viewer in the body tag.
      if (containerEl.offset().top == 0) {
        this.viewer.elements.viewer.css({border: 0});
      }
    }

    // Hide and show navigation flags:
    var showAnnotations = this.showAnnotations();
    var showPages       = this.viewer.models.document.totalPages > 1;
    var showSearch      = (this.viewer.options.search !== false) &&
                          (this.viewer.options.text !== false) &&
                          (!this.viewer.options.width || this.viewer.options.width >= 540);
    var noFooter = (!showAnnotations && !showPages && !showSearch && !this.viewer.options.sidebar);


    // Hide annotations, if there are none:
    var $annotationsView = this.viewer.$('.DV-annotationView');
    $annotationsView[showAnnotations ? 'show' : 'hide']();

    // Hide the text tab, if it's disabled.
    if (showSearch) {
      this.viewer.elements.viewer.addClass('DV-searchable');
      this.viewer.$('input.DV-searchInput', containerEl).placeholder({
        message: 'Search',
        clearClassName: 'DV-searchInput-show-search-cancel'
      });
    } else {
      this.viewer.$('.DV-textView').hide();
    }

    // Hide the Pages tab if there is only 1 page in the document.
    if (!showPages) {
      this.viewer.$('.DV-thumbnailsView').hide();
    }

    // Hide the Documents tab if it's the only tab left.
    if (!showAnnotations && !showPages && !showSearch) {
      this.viewer.$('.DV-views').hide();
    }

    this.viewer.api.roundTabCorners();

    // Hide the entire sidebar, if there are no annotations or sections.
    var showChapters = this.viewer.models.chapters.chapters.length > 0;

    // Remove and re-render the nav controls.
    // Don't show the nav controls if there's no sidebar, and it's a one-page doc.
    this.viewer.$('.DV-navControls').remove();
    if (showPages || this.viewer.options.sidebar) {
      var navControls = JST['navControls']({
        totalPages: this.viewer.model.totalPages,
        totalAnnotations: this.viewer.model.notes.length
      });
      this.viewer.$('.DV-navControlsContainer').html(navControls);
    }

    this.viewer.$('.DV-fullscreenControl').remove();
    if (this.viewer.model.canonicalURL) {
      var fullscreenControl = JST['fullscreenControl']({});
      if (noFooter) {
        this.viewer.$('.DV-collapsibleControls').prepend(fullscreenControl);
        this.viewer.elements.viewer.addClass('DV-hideFooter');
      } else {
        this.viewer.$('.DV-fullscreenContainer').html(fullscreenControl);
      }
    }

    if (this.viewer.options.sidebar) {
      this.viewer.$('.DV-sidebar').show();
    }

    // Check if the zoom is showing, and if not, shorten the width of search
    _.defer(_.bind(function() {
      if ((this.viewer.elements.viewer.width() <= 700) && (showAnnotations || showPages || showSearch)) {
        this.viewer.$('.DV-controls').addClass('DV-narrowControls');
      }
    }, this));

    // Set the currentPage element reference.
    this.viewer.elements.currentPage = this.viewer.$('span.DV-currentPage');
    this.viewer.models.document.setPageIndex(this.viewer.models.document.currentIndex());
  },

  // Reset the view state to a baseline, when transitioning between views.
  reset : function() {
    this.resetNavigationState();              // sets chaptersContainer and navigation ids to ''
    this.cleanUpSearch();                     // viewer.searchResponse = viewer.toHighLight = null and blur searchInput on keyup
    this.viewer.pages.cleanUp();            // hide the activeAnnotation (if available)
    this.removeObserver('drawPages');         // stop DV.Schema.events.drawPages from being called (it's in events/events.js)
    this.viewer.dragReporter.unBind();        //
    this.viewer.elements.window.scrollTop(0); // jump back to the top.
  }

});
