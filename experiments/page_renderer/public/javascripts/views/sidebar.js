DC.view.Sidebar = DC.Backbone.View.extend({
  className: 'sidebar',
  
  initialize: function(options) {
    
  },
  
  render: function() {
    this.$el.html(JST['sidebar']());
  }
});