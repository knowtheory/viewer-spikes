DC.view.PageList = DC.Backbone.View.extend({
  className: 'pages',
  
  DEFAULT_ASPECT: 1.31,
  GUTTER_SIZE: 0.2,

  initialize: function(options) {
    DC._.bindAll(this, 'onPageLoad');
    this.listenTo(this.collection, 'reset', this.rebuild);
    this._geometry = [];
    this._aspectRatios = {};
    this._expandedAspectRatios = {};
  },

  rebuild: function() {
    this.renderPages();
    this.setGeometry();
  },

  // TODO: Review the bottom/height calculations to see if they are really 
  // needed. Currently checks for visible are deferred to the pages. If we 
  // shift to a lazy-load model, these precalculated values are of more use.
  setGeometry: function() {
    this._geometry = [];
    var count = this.collection.length;
    var totalHeight = 0;
    var aspects = 0;

    for (var i = 0; i < count; i++) {
      totalHeight += this._getExpandedAspectRatio(i) * 100;
    };

    for (var i = 0; i < count; i++) {
      var ratio = this._getExpandedAspectRatio(i);
      var top = aspects / totalHeight * 100;
      aspects += ratio * 100;
      var bottom = aspects / totalHeight * 100;
      var geometry = {top: top, bottom: bottom, height: bottom - top, expandedRatio: ratio};

      var view = this.pageViews[i];
      if (!DC._.isEmpty(view)) {view.setGeometry(geometry);}

      this._geometry.push(geometry);
    };

    this.$el.css({'padding-top': totalHeight + '%'});
  },

  // The basic algorithim here is quite simple. The ideal/base ratio for the 
  // calculations is 1. Gutter is percentage of that. The calculation expresses
  // the following; ratios greater than then the ideal mean a smaller gutter, 
  // ratios less than the ideal mean a larger gutter.
  _getExpandedAspectRatio: function(i) {
    if (DC._.isNumber(this._expandedAspectRatios[i])) {return this._expandedAspectRatios[i];}
    var ratio = (this._aspectRatios[i] || this.DEFAULT_ASPECT);
    var diff = ratio - 1;
    var expanded = ratio + (ratio * (this.GUTTER_SIZE * diff));
    this._expandedAspectRatios[i] = expanded;
    return expanded;
  },

  height: function() {
    return this.$el.outerHeight();
  },

  loadPages: function(pageNumbers) {
    DC._.each(this.pageViews, function(page){
      if (DC._.contains(pageNumbers, page.model.get('pageNumber'))) { 
        page.load(); 
      } 
      else { 
        page.unload(); 
      }
    });
  },

  // When a page view loads, we inspect it's aspect ratio and cache it.
  // The call to setGeometry() might need to be throttled to ensure it isn't 
  // called too often.
  onPageLoad: function(page) {
    if (page.aspectRatio !== this.DEFAULT_ASPECT) {
      var index = page.model.get('pageNumber') - 1;
      this._aspectRatios[index] = page.aspectRatio;
      delete this._expandedAspectRatios[index];
      this.setGeometry();
    }
  },

  // This is just a debug function.
  // It eagerly loads the pages, the real version should do it lazily.
  renderPages: function() {
    this.pageViews = [];
    this.collection.each(function(pageModel, i) {
      var page = new DC.view.Page({model: pageModel});
      page.on('load', this.onPageLoad);
      this.pageViews.push(page);
      this.$el.append(page.render().el)
    }, this);
  }
});
