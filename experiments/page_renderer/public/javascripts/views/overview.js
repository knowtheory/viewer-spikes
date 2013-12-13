DC.view.Overview = DC.Backbone.View.extend({
  className: 'overview',
  
  initialize: function(options) {
    options = (options || {});
    //DC._.bindAll(this, 'announceScroll');
  },
  
  events: {
    'slide': 'announceScroll'
  },
  
  render: function() {
    this.$el.html(JST['overview']());
    this.slider = this.$el.slider({
      orientation: 'vertical',
      range: 'min',
      min: 1,
      max: this.collection.length
    });
    this.mark = this.$('.ui-slider-handle');
    this.mark.css({'background': 'red'});
    //this.mark = this.$('.page_mark');
  },
  
  updateMark: function(pageNumber) {
    this.slider.slider('option', 'value', this._invertScale(pageNumber));
    this.$('.page_mark span').html(pageNumber);
  },
  
  announceScroll: function(e, slider) {
    this.trigger('scroll')
  },
  
  _invertScale: function(value) {
    return this.collection.length - value + 1;
  },
  
  jump: function(dimensions) {
    console.log("jumping");
    //var css = {'top': dimensions.top + '%'};
    //if (dimensions.bottom) { css.height = dimensions.bottom + '%'; }
    //this.$('.viewport').css(css);
  }
});
