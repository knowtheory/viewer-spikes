DC.view.Sidebar = DC.Backbone.View.extend({
  className: 'sidebar',
  
  initialize: function(options) {
    this.publisher = options.publisher;
    if (this.publisher) { 
      this.listenTo(this.publisher, 'scroll', this.jump);
      this.listenTo(this.publisher, 'currentPage', this.updateMark);
    }
  },
  
  render: function() {
    this.$el.html(JST['sidebar']());
  },
  
  updateMark: function(pageNumber) {
    this.$('.page_mark span').html(pageNumber);
  },
  
  jump: function(dimensions) {
    this.$('.viewport').css({'top': dimensions.top + '%', 'height' : dimensions.bottom + '%' });
  }
});