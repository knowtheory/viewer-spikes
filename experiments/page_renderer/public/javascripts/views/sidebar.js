DC.view.Sidebar = DC.Backbone.View.extend({
  className: 'sidebar',
  
  initialize: function(options) {
    options = (options || {});
    //this.publisher = options.publisher;
    //if (this.publisher) { 
    //  this.listenTo(this.publisher, 'scroll', this.jump);
    //  this.listenTo(this.publisher, 'currentPage', this.updateMark);
    //}
    
    this.drag = DC._.bind(this.drag, this);
    this.endDrag = DC._.bind(this.endDrag, this);
  },
  
  events: {
    'mousedown .page_mark' : 'startDrag',
    'mouseup   .page_mark' : 'endDrag'
  },
  
  render: function() {
    this.$el.html(JST['sidebar']());
    this.mark = this.$('.page_mark');
    return this;
  },
  
  updateMark: function(pageNumber) {
    this.$('.page_mark span').html(pageNumber);
  },
  
  startDrag: function(e) {
    this.mark.mousemove(this.drag);
    this.mark.mouseup(this.endDrag);
  },
  
  drag: function(e) {
    console.log("Dragging!");
    //this.jump({top: e.clientY});
  },
  
  endDrag: function(e) {
    this.mark.unbind("mousemove", this.drag);
  },
  
  jump: function(dimensions) {
    var css = {'top': dimensions.top + '%'};
    if (dimensions.bottom) { css.height = dimensions.bottom + '%'; }
    this.$('.viewport').css(css);
  }
});