DC.view.Sidebar = DC.Backbone.View.extend({
  className: 'sidebar',
  
  initialize: function(options) {
    this.publisher = options.publisher;
    if (this.publisher) { this.listenTo(this.publisher, 'scroll', this.jump); }
  },
  
  render: function() {
    this.$el.html(JST['sidebar']());
  },
  
  jump: function(percentPosition) {
    this.$('.page_mark').css({'top': percentPosition + '%'});
  }
});