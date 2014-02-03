DC.model.Document = DC.Backbone.Model.extend({
  initialize: function(attributes, options) {
    attributes = (attributes || {});
    
    // If attributes are passed in, initialize sub collections and models
    // with that data.
    this.pages     = DC.model.PageSet.createPages(attributes.pages);
    this.resources = new DC.Backbone.Model(attributes.resources);
    this.sections  = new DC.model.SectionSet(attributes.sections);
    this.notes     = new DC.model.NoteSet(attributes.annotations);
    
    // Reactive behavior.  When a document's attributes are set
    // propogate the data down into child collections and objects.
    // Current behavior will simply overwrite existing data.
    this.on( 'change:annotations', function( model, note_data ){    this.notes.reset(note_data); }, this );
    this.on( 'change:sections',    function( model, section_data ){ this.sections.reset(section_data); }, this );
    this.on( 'change:pages',       function( model, pageCount ){
      var pageAttributes = DC._.map( DC._.range(0, pageCount), function(pageIndex){ return { pageNumber: pageIndex+1 }; } );
      this.pages.set(pageAttributes);
      this.pages.trigger('reset');
    }, this);
    this.on( 'change:resources',   function( model, resource_data ){ 
      this.resources.set(resource_data);
      DC._.extend(DC.model.Page.prototype.defaults, this.resources.get('page'));
      DC._.extend(this.notes, { url: this.resources.get('annotations_url') });
    }, this );
  }
});

DC.model.DocumentSet = DC.Backbone.Collection.extend({ model: DC.model.Document });

DC.model.Note = DC.Backbone.Model.extend({});

DC.model.NoteSet = DC.Backbone.Collection.extend({
  model: DC.model.Note,
  onPage: function(pageNumber) { return this.where({'page': pageNumber}); } // make this return a shadow
});

DC.model.Page = DC.Backbone.Model.extend({
  defaults: {
    height    : 906,
    width     : 700,
    topOffset : 0,
    imageLoaded: false,
    hasRealDimensions: false
  },
  
  imageUrl: function(size){
    size = (size || 'normal');
    var template = this.constructor.prototype.defaults.image;
    template     = template.replace(/\{size\}/, size);
    url          = template.replace(/\{page\}/, this.get('pageNumber'));
    return url;
  },

  textUrl: function() {
    var template = this.constructor.prototype.defaults.text;
    return template.replace(/\{page\}/, this.get('pageNumber'));
  },
  
  aspectRatio: function() { return this.get('height') / this.get('width'); },

  orientation: function() { return (this.aspectRatio > 1 ? 'portrait' : 'landscape'); },
  
  naturalDimensions: function() { return { height: this.get('height'), width: this.get('width') }; },
  
  proportionalDimensions: function() { return { height: this.aspectRatio(), width: 1 }; }
});

DC.model.PageSet = DC.Backbone.Collection.extend({
  model: DC.model.Page,
  comparator: 'pageNumber'
},
{
  createPages: function(pageCount) {
    pageCount = (pageCount || 0);
    var pageAttributes = DC._.map( DC._.range(0, pageCount), function(pageIndex){ return { pageNumber: pageIndex+1 }; } );
    return new this(pageAttributes);
  }
});

DC.model.Section = DC.Backbone.Model.extend({
  
});

DC.model.SectionSet = DC.Backbone.Collection.extend({
  model: DC.model.Section
});
