DV.model.Note = DV.Backbone.Model.extend({
  defaults: {
    title               : "Untitled Note",
    text                : "",
    content             : "",
    access              : "public",
    owns_note           : false,
    author              : "",
    author_organization : ""
  },
  initialize: function(data, options){
    this.set("type", (this.get('location') && this.get('location').image ? 'region' : 'page'));

    if (this.get('type') === 'region') {
      var loc = DV.jQuery.map(this.get('location').image.split(','), function(n, i) { return parseInt(n, 10); });
      this.set('y1', loc[0]); this.set('x2', loc[1]); this.set('y2', loc[2]); this.set('x1', loc[3]);
      this.top = this.get('y1') - 5;
    } else if(this.get('type') === 'page') {
      this.set('y1', 0); this.set('x2', 0); this.set('y2', 0); this.set('x1', 0);
      this.top = 0;
    }
  }
});

DV.model.NoteSet = DV.Backbone.Collection.extend({
  model: DV.model.Note,
  
  // Default comparator set to sort by vertical order.
  // The annotation presenter accesses notes in three ways
  // byId, byPage and bySortOrder.  Only the last is an array
  // so, we'll use it as the default order, and manually track
  // the other two.
  comparator: function(note) { return note.get('page') * 10000 + note.get('y1'); },

  initialize: function(data, options){
    this.byId   = {};
    this.byPage = {};

    this.on( 'reset', function(){ this.each( _.bind(this.insertNoteIntoIndexes, this) ); }, this );
    this.on( 'add', this.insertNoteIntoIndexes, this );
    
    // Legacy craziness that needs to be excized
    this.offsetsAdjustments       = [];
    this.offsetAdjustmentSum      = 0;
  },

  getFirstAnnotation: function(){
    return this.first();
  },
  
  getNextAnnotation: function(note) {
    var anno = (note.id ? note : this.get(note));
    return this.at(this.indexOf(anno) + 1);
  },

  getPreviousAnnotation: function(note) {
    var anno = (note.id ? note : this.get(note));
    return this.at(this.indexOf(anno) - 1);
  },
  
  insertNoteIntoIndexes: function(note){
    this.byId[note.id] = note;
    
    var pageIndex = note.get('page') - 1;
    var pageNotes = this.byPage[pageIndex] = this.byPage[pageIndex] || [];
    var insertionIndex = _.sortedIndex(pageNotes, note, function(n){ return n.get('y1'); });
    pageNotes.splice(insertionIndex, 0, note);
  },
  
  // Below is functionality which needs to be reinstated
  
  //  // Removes a given annotation from the Annotations model (and DOM).
  //  removeAnnotation : function(anno) {
  //    delete this.byId[anno.id];
  //    var i = anno.page - 1;
  //    this.byPage[i] = _.without(this.byPage[i], anno);
  //    this.sortAnnotations();
  //    DV.jQuery('#DV-annotation-' + anno.id + ', #DV-listAnnotation-' + anno.id).remove();
  //    this.viewer.api.redraw(true);
  //    if (_.isEmpty(this.byId)) this.viewer.open('ViewDocument');
  //  },
  //
  //  // When an annotation is successfully saved, fire any registered
  //  // save callbacks.
  //  fireSaveCallbacks : function(anno) {
  //    _.each(this.saveCallbacks, function(c){ c(anno); });
  //  },
  //
  //  // When an annotation is successfully removed, fire any registered
  //  // delete callbacks.
  //  fireDeleteCallbacks : function(anno) {
  //    _.each(this.deleteCallbacks, function(c){ c(anno); });
  //  },
  //
  // Get an annotation by id, with backwards compatibility for argument hashes.
  getAnnotation: function(identifier) {
    if (identifier.id) return this.byId[identifier.id];
    if (identifier.index && !identifier.id) throw new Error('looked up an annotation without an id');
    return this.byId[identifier];
  }
  
});
