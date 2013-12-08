DC.view.Page = DC.Backbone.View.extend({
  margin:    10,
  className: 'page',
  aspectRatio: 1.31,
  initialize: function(options) {
    DC._.bindAll(this, 'onImageLoad');
  },

  // This function is responsible for setting the aspect ratio of the external
  // page wrapper, interior wrapper and position.
  setGeometry: function(vals) {
    this.$el.css({'top': vals.top + '%', 'padding-top': this.aspectRatio * 100 + '%'});
  },

  render: function() {
    this.$el.html(JST['page']({ page: this.model.toJSON() }));
    this.image = this.$('img');
    return this;
  },
  
  height: function() {
    return this.model.get('height') + this.margin*2;
  },

  isLoaded: function() {
    return this.model.get('imageLoaded');
  },

  load: function() {
    if (this.isLoaded()) return;
    this.$('.matte').html('<img></img>');
    this.image = this.$('img');
    this.image.attr('src', this.model.imageUrl());
    this.image.load(this.onImageLoad);
  },

  onImageLoad: function() {
    this.aspectRatio = this.image.height() / this.image.width();
    this.model.set({'imageLoaded': true});
    this.trigger('load', this);
  },

  unload: function() {
    if (!this.isLoaded()) return;
    this.image.remove();
    delete this.image;
    this.model.set('imageLoaded', false);
  }
});
