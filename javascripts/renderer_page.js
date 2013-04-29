DV.views.RendererPage = Backbone.View.extend({
  initialize: function() {
    this.resourceURL = this.options.resource.replace(/\{size\}/, 'normal').replace(/\{page\}/, this.options.number);
  },

  render: function() {
    this.$wrapper = $('<div class="liner"></div>');
    this.$p = $('<p></p>').text(this.options.number).addClass('number');
    this.$img = $('<img />').attr("src", this.resourceURL);
    this.$img.load(this.imageLoad);
    this.$el.append(this.$wrapper.append(this.$p, this.$img));
    this.$el.addClass('loaded');
    return this;
  },

  unload: function() {
    this.$wrapper.detach();
    this.$el.removeClass('loaded');
    return this;
  },

  reload: function() {
    this.$el.append(this.$wrapper);
    this.$el.addClass('loaded');
    return this;
  },

  imageLoad: function(evt){
    console.log('Loaded image', this);
    //Calculate the 'real' aspect ratio of the page:
    $(this).closest('.page').css('padding-top', ((this.height / this.width) * 100) + '%');
  }
});
