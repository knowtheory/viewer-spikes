DC.view.Overview = DC.Backbone.View.extend({
  className: 'overview',
  
  initialize: function(options) {
    this.options = (options || {});
    DC._.bindAll(this, 'announceScroll');
  },
  
  events: { 'slide': 'announceScroll' },
  
  render: function() {
    this.$el.html(JST['overview']({pages: this.collection}));
    this.slider = this.$el.slider({
      orientation: 'vertical',
      range: 'min',
      min: 1,
      max: this.collection.length
    });
    this.mark = this.$('.ui-slider-handle');
    this.mark.css({'background': 'red'});
    this.updateMark((this.options.pageNumber || 1));
  },
  
  updateMark: function(pageNumber) {
    this.slider.slider('option', 'value', this._invertScale(pageNumber));
    this.$('.page_mark span').html(pageNumber);
  },
  
  announceScroll: function(e, slider) {
    this.trigger('scroll', this._invertScale(slider.value));
  },
  
  _invertScale: function(value) {
    return this.collection.length - value + 1;
  },
});
