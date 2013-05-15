DV.views.RendererPage = Backbone.View.extend({
  className: 'page',

  initialize: function() {
    this.attached = false;
    this.resourceURL = this.options.resource.replace(/\{size\}/, 'normal').replace(/\{page\}/, this.options.number);
    this.ratio = this.options.ratio;
  },

  render: function(offset) {
    this.$wrapper = $('<div class="liner"></div>');
    this.$p = $('<p></p>').text(this.options.number).addClass('number');
    this.$img = $('<img />').attr("src", this.resourceURL);
    this.$img.load($.proxy(this, 'imageLoad'));
    this.$el.append(this.$wrapper.append(this.$p, this.$img));
    this.$el.addClass('loaded');
    this.offsetTo(offset);
    this.attached = true;
    return this;
  },

  offsetTo: function(top) {
    this.$el.css({top: top + '%'});
    return this;
  },

  height: function(parentWidth) {
    // If we're attached to the DOM, use the real height, otherwise speculate 
    // about the height using the cached ratio.
    if (this.attached) {
      return this.$el.height();
    }
    else {
      return parentWidth * this.ratio;
    }
  },

  detach: function() {
    this.attached = false;
    this.$el.detach();
    return this;
  },

  reattach: function(el) {
    this.attached = false;
    el.append(this.$el);
    return this;
  },

  imageLoad: function(evt){
    this.ratio = this.$el.height() / this.$el.height();
    this.$img.closest('.page').css('padding-top', ((this.$img.height() / this.$img.width()) * 100) + '%');
  }
});
