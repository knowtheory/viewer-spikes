DC.view.Page = DC.Backbone.View.extend({
  margin:    2,
  className: 'page',
  initialize: function(options) {
    // Debounce ensureAspectRatio, because we want to listen for changes
    // to both heigth and width, but only fire once if both have been set.
    //this.ensureAspectRatio = DC._.bind(DC._.debounce(this.ensureAspectRatio, 10), this);
    this.cacheNaturalDimensions = DC._.bind(this.cacheNaturalDimensions, this);
    
    // Dimensions are calculated as a fraction of width
    this.dimensions = this.model.proportionalDimensions();
    // Positions are calculated as a percentage of parent container
    this.position = { top: 0 };
    
    //this.listenTo(this.model, 'change:height', this.ensureAspectRatio);
    //this.listenTo(this.model, 'change:width',  this.ensureAspectRatio);
  },

  render: function() {
    this.$el.html(JST['page']({ page: this.model.toJSON() }));
    //this.$el.css({height: this.dimensions.height, top: this.dimensions.top});
    return this;
  },

  isLoaded: function() { return this.model.get('imageLoaded'); },

  load: function() {
    if (this.isLoaded()) return;
    //console.log("Loading", this.model.get('pageNumber'));
    
    this.$('.content').html('<img></img>');
    this.image = this.$('img');
    this.image.attr('src', this.model.imageUrl());
    this.image.load(DC._.bind(function(){
      this.cacheNaturalDimensions();
      //this.ensureAspectRatio();
      var attrs = {'imageLoaded': true};
      if (!this.model.get('hasRealDimensions')) { attrs.hasRealDimensions = true; }
      this.model.set(attrs);
    }, this));
  },

  unload: function() {
    if (!this.isLoaded()) return;
    //console.log("Unloading", this.model.get('pageNumber'));
    this.image = null;
    this.$('.matte').html('');
    //this.image.attr('src', 'data:image/gif;base64,' + 'R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=');
    this.model.set('imageLoaded', false);
  },
  
  aspectRatio: function(){
    var headerAspectRatio = 0;
    return this.model.aspectRatio() + headerAspectRatio;
  },
  
  height: function() { return DC._(this.aspectRatio()).asPercentOf(this.dimensions.width); },
  
  setMatteHeight: function() {
    this.dimensions.height = this.height();
    this.$('.matte').css({'padding-top': this.dimensions.height + '%'});
  },
  
  setPosition: function(position) {
    this.position.top = position;
    this.$el.css({'top': position + '%'});
  },
  
  // Once an page image is loaded, store its natural dimensions
  // to provide accurate calculations of its aspect ratio and
  // positioning (as opposed to using the default assumed dimensions)
  cacheNaturalDimensions: function() {
    var model = this.model;
    var unstyledImage = DC.$(new Image());
    unstyledImage.load(function(){ 
      if ( model.get('height') != this.height || model.get('width') != this.width ) {
        model.set({ height: this.height, width:  this.width });
      }
    });
    unstyledImage.attr('src', model.imageUrl());
  }
  
  //setImageDimensions: function(dimensions) {
  //  var intendedWidth    = dimensions.width;
  //  var intendedHeight   = dimensions.height;
  //  var currentHeight    = this.$('.matte').height();
  //  var heightDifference = currentHeight - intendedHeight;
  //
  //  this.$('.matte').attr('style', 'width: '+intendedWidth+'px; height: '+intendedHeight+'px;' );
  //  if (heightDifference !== 0) { this.trigger('resize', heightDifference); }
  //  //this.image.attr({ width: width + 'px', height: height + 'px' });
  //},
  //
  //ensureAspectRatio: function() {
  //  //console.log("ensuring Aspect Ratio!");
  //  this.setImageDimensions(this.constrainedImageDimensions(700));
  //},
  //
  //constrainedImageDimensions: function(limit, constrained_edge) {
  //  constrained_edge = (constrained_edge || 'width');
  //  if (!DC._.isNumber(limit)){ console.log("limit must be a number", limit); }
  //  if (!constrained_edge.match(/width|height/)){ console.log("constrained_edge must be 'width' or 'height'", constrained_edge); return; }
  //  var other_edge = (constrained_edge == 'width' ? 'height' : 'width');
  //  var dimensions = this.model.naturalDimensions();
  //  var scale = dimensions[constrained_edge] / limit; // smaller than 1 when limit is larger; greater than 1 when limit is smaller.
  //  dimensions[constrained_edge] = limit;
  //  dimensions[other_edge] = Math.floor(dimensions[other_edge] / scale);
  //  return dimensions;
  //}
  
  
});
