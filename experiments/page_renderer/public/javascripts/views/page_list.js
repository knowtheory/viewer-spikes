DC.view.PageList = DC.Backbone.View.extend({
  className: 'pages',
  
  initialize: function(options) {
    this.matteHeight = 0;
    this.initializeSubviews();

    this.listenTo(this.collection, 'reset', this.rebuild);
  },

  rebuild: function() {
    this.initializeSubviews();
    this.render();
  },
  
  initializeSubviews: function() {
    // create a page view for each model.
    this.pageViews = this.collection.map( function( pageModel ){ return new DC.view.Page({model: pageModel}); } );
    var subscribeToResize = function(page){
      this.listenTo(page, 'resize', function(heightDifference){
        if (heightDifference > 0) { 
          this.calculatePagePositions();
          this.placePages();
          this.resizeBackdrop(heightDifference);

          // Rethink repositioning scrollTop:
          // If a page ABOVE current scroll position changes,
          // then offset needs to be updated when the buffer size changes.
          // If the current page has yet to load, then no jumping is needed,
          // because only pages below the current page are adjusted.
          //var offset = this.$el.scrollTop() - heightDifference;
          //this.$el.scrollTop(offset);
        }
      });
    };
    
    DC._.each(this.pageViews, subscribeToResize, this);
    this.matteHeight = this.height();
  },
  
  render: function() {
    this.$el.html(DC._.map(this.pageViews, function(view){ return view.render().el; }));
    this.resizeBackdrop();
    this.placePages();
    return this;
  },

  loadPages: function(pageNumbers) {
    //console.log(pageNumbers, DC.$('img').size());
    DC._.each(this.pageViews, function(page){
      if (DC._.contains(pageNumbers, page.model.get('pageNumber'))) { page.load(); } else { page.unload(); }
    });
  },
  
  // total document height calculated as a fraction of viewer width
  aspectRatio: function(){
    return DC._.reduce(this.pageViews, function(total, page){ return total + page.aspectRatio(); }, 0, this);
  },
  
  height: function() { return this.aspectRatio() * 100; },
  
  resizeBackdrop: function() {
    this.matteHeight = this.height();
    this.$el.css({'padding-top': this.mattHeight + '%'});
  },
  
  placePages: function() {
    // Ask each page for 
    DC._.reduce(this.pageViews, function(runningAspectRatioTally, page){
      page.setMatteHeight();
      page.setPosition(100 * runningAspectRatioTally / this.matteHeight);
      runningAspectRatioTally += page.aspectRatio();
      return runningAspectRatioTally;
    }, 0, this);
  }
  
  //// Pixel based calculation functions
  //
  //// ToDo: make this smarter, and just have it subtract the difference
  //// from the existing height, rather than recounting all the page heights.
  //resizeBackdrop: function(difference) {
  //  this.matteHeight = this.height();
  //  this.$el.css({'height': this.matteHeight});
  //}
  //
  //placePages: function() {
  //  DC._.each(this.pageViews, function(page){ page.$el.css(page.dimensions); });
  //},
  //
  //calculatePagePositions: function() {
  //  var startingMargin = DC.view.Page.prototype.margin*2;
  //  var tallyPageHeights = function(backdropHeight, page){
  //    page.calculateHeight();
  //    page.dimensions.top = backdropHeight;
  //    return backdropHeight + page.dimensions.height;
  //  };
  //  return DC._.reduce(this.pageViews, tallyPageHeights, startingMargin);
  //},
  //
  //height: function() {
  //  var startingMargin = DC.view.Page.prototype.margin*2;
  //  return DC._.reduce(this.pageViews, function(total, page){ return total + page.dimensions.height; }, startingMargin, this);
  //}
});
