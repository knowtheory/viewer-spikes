DV.views.RendererPage = Backbone.View.extend({
  initialize: function() {

  },

  render: function() {
    this.$p = $('<p></p>').text(this.options.number).addClass('number');
    var number = this.options.number > 100 ? this.options.number - 100 : this.options.number;
    this.$img = $('<img />').attr("src", "http://s3.documentcloud.org/documents/282753/pages/lefler-thesis-p" + number + "-normal.gif");
    this.$el.append(this.$p, this.$img);
    this.$el.addClass('loaded');
    return this;
  },

  unload: function() {
    this.detachedChildren = this.$el.children().detach();
    this.$el.removeClass('loaded');
    return this;
  },

  reload: function() {
    this.$el.append(this.detachedChildren);
    this.$el.addClass('loaded');
    return this;
  }
});
