DV.view.ChapterSidebar = DV.Backbone.View.extend({
  events: { 'click': 'handleNavigation' },
  
  initialize: function(options) {
    this.viewer = options.viewer;
  },
  
  // Render Navigation is a distinct candidate for a Backbone.View
  // Required models: notes and sections
  render: function() {
    var bolds = [], nav=[], notes = [];
        
    var boldsId = this.viewer.models.boldsId || (this.viewer.models.boldsId = _.uniqueId());

    // If notes are to be shown, iterate over all pages
    // and create a list of notes for the sidebar, stored
    // both in our list of notes and our list of nav elements.
    if (this.viewer.helpers.showAnnotations()) {
      var markupNote = function(note) {
        bolds.push("#DV-selectedAnnotation-" + note.id + " #DV-annotationMarker-" + note.id + " .DV-navAnnotationTitle");
        return JST['annotationNav'](note.toJSON());
      };
      for(var i = 0; i < this.viewer.model.totalPages; i++){
        var noteData = this.viewer.model.notes.byPage[i];
        if(noteData){ notes[i] = nav[i] = _.map(noteData, markupNote).join(''); }
      }
    }

    var noteMarkupForRange = function(rangeStart, rangeEnd){
      var annotations = [];
      for(var i = rangeStart; i < rangeEnd; i++){
        if(notes[i]){
          annotations.push(notes[i]);
          nav[i] = ''; // blank out a note's entry in the nav markup.
        }
      }
      return annotations.join('');
    };

    // Generate and store markup for each section
    var sections = this.viewer.model.sections;
    sections.each(function(section){
      var annotations    = noteMarkupForRange(section.get('pageNumber') - 1, section.get('endPage'));
      if(annotations != '') {
        section.set('navigationExpander', JST['navigationExpander']({}));
        section.set('navigationExpanderClass', 'DV-hasChildren');
        section.set('noteViews', annotations);
      } else {
        section.set('navigationExpander', '');
        section.set('navigationExpanderClass', 'DV-noChildren');
        section.set('noteViews', '');
      }
    
      var selectionRule = "#DV-selectedChapter-" + section.id + " #DV-chapter-" + section.id;
      bolds.push(selectionRule+" .DV-navChapterTitle");
      nav[section.get('pageNumber') - 1] = JST['chapterNav'](section.toJSON());
    });
    
    // insert and observe the nav
    var navigationView = nav.join('');

    this.setElement(this.viewer.$('div.DV-chaptersContainer'));
    this.$el.html(navigationView);

    if (sections.length || _.size(this.viewer.model.notes.byId)) { this.$el.show(); } else { this.$el.hide(); }
    this.viewer.helpers.displayNavigation();

    DV.jQuery('#DV-navigationBolds-' + boldsId, DV.jQuery("head")).remove();
    var boldsContents = bolds.join(", ") + ' { font-weight:bold; color:#000 !important; }';
    var navStylesheet = '<style id="DV-navigationBolds-' + boldsId + '" type="text/css" media="screen,print">\n' + boldsContents +'\n</style>';
    DV.jQuery("head").append(navStylesheet);
    chaptersContainer = null;
  },
  
  handleNavigation: function(e){
    var el          = this.viewer.$(e.target);            // The click target. A child of DV-chaptersContainer
    var triggerEl   = el.closest('.DV-trigger');          // Search for the nearest link!
    var noteEl      = el.closest('.DV-annotationMarker'); // Search for the nearest note link
    var chapterEl   = el.closest('.DV-chapter');          // Search for the nearest chapter link
    if (!triggerEl.length) return;                        // If you didn't click on anything we care about, bail.

    if (noteEl.length) {                                                    // If there is a note link nearby
      var aid         = noteEl[0].id.replace('DV-annotationMarker-','');    // find the note's id
      var annotation  = this.viewer.model.notes.getAnnotation(aid);  // get the note model

      // If we're vewing the text, load the text for this note's page.
      if ( this.viewer.state.name === 'ViewText' ){ 
        this.loadText(annotation.index); 
      } else {
        if (this.viewer.state.name === 'ViewThumbnails') { this.viewer.open('ViewDocument'); }
        this.viewer.pages.showAnnotation(annotation); // Otherwise show the note.
      }

    } else if (chapterEl.length) {                                                            // If we have a chapter header
      if (el.hasClass('DV-expander')) {                                                       // if the click target is a section collapsing arrow
        return chapterEl.toggleClass('DV-collapsed');                                         // collapse the section and bail.
      } else {
        // its a header, take it to the page
        chapterEl.removeClass('DV-collapsed');                                                  // Expand the section if necessary
        var cid           = parseInt(chapterEl[0].id.replace('DV-chapter-',''), 10);            // chapter id
        var chapterIndex  = parseInt(this.viewer.models.chapters.getChapterPosition(cid),10);   // Figure out the page index

        if(this.viewer.state.name === 'ViewText'){                     // If we're viewing the text
          this.loadText(chapterIndex);                            // load the appropriate page text
        } else if (this.viewer.state.name === 'ViewDocument' ||        // Otherwise if we're vewing the document
                   this.viewer.state.name === 'ViewThumbnails'){       // or thumbnails
          this.helpers.jump(chapterIndex);                        // Jump to the appropriate page
          if (this.viewer.state.name === 'ViewThumbnails') { this.viewer.open('ViewDocument'); }
        }else{                                                    // Otherwise (say in the note view)
          return false;                                           // dunno lol.
        }
      }

    }else{
      return false; // How did you even end up here!??
    }
  }
});