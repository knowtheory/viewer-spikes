DV.views.RendererPage = Backbone.View.extend({
  initialize: function() {

  },

  render: function() {
    this.$p = $('<p>LOADED</p>');
    this.$el.append(this.$p);
    this.$el.addClass('loaded');
    return this;
  },

  unload: function() {
    this.$p.text('UNLOADED');
    this.$el.removeClass('loaded');
    return this;
  },

  reload: function() {
    this.$p.text('RELOADED');
    this.$el.addClass('loaded');
    return this;
  }
});
