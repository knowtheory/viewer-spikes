DC.view.Page = DC.Backbone.View.extend({
  className: 'page',
  expandedRatio: 1.31,
  initialize: function(options) {
    DC._.bindAll(this, 'onImageLoad');
  },

  // This function is responsible for setting the aspect ratio of the external
  // page wrapper, interior wrapper and position.
  //
  // Since width is fixed and dictated by parent list
  // all this does is set the height appropriate to the width based on aspect ratio.
  //
  // Important Nota Bene:
  //
  //  "padding-top" of an object is calculated proportional to ITS OWN WIDTH (as opposed
  //  to an object's "height" which is calculated proportional to its parent container's
  //  height)
  //
  //  As a consequence, a page's height can be specified as a proportion to its width
  //  allowing pages to to scale up/down naturally as a function of the document's width
  //  without recalculating heights or positions.
  setGeometry: function(vals) {
    this.expandedRatio = vals.expandedRatio;
    this.$el.css({'top': vals.top + '%', 'padding-bottom': this.expandedRatio * 100 + '%'});
    this.matte.css('padding-top', this.model.aspectRatio() * 100 + '%');
  },

  render: function() {
    this.$el.html(JST['page']({ page: this.model.toJSON() }));
    this.matte = this.$('.matte');
    this.content = this.$('.content');
    this.image = this.$('img');
    return this;
  },
  
  isLoaded: function() { return this.model.get('imageLoaded'); },

  load: function() {
    if (this.isLoaded()) return;
    this.content.html('<img></img>');
    this.image = this.$('img');
    this.image.attr('src', this.model.imageUrl());
    this.image.load(this.onImageLoad);
  },

  onImageLoad: function() {
    this.model.set({imageLoaded: true, height: this.image.height(), width: this.image.width()});
    this.trigger('load', this);
  },

  unload: function() {
    if (!this.isLoaded()) return;
    this.image.remove();
    delete this.image;
    this.model.set('imageLoaded', false);
  }
});
