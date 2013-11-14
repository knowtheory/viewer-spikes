DC.view.DebugConsole = DC.Backbone.View.extend({
  className: "DV-debugConsole",
  initialize: function(options){
    this.viewer = options.viewer;
    if (this.viewer.debugConsole) { return; } // the debugger is a singleton.
    this.viewer.debugConsole = this;
    this.render();
  },
  render: function(){
    this.$el.html('<div class="dump"></div>');
    this.$el.css({
      'position': 'absolute',
      'bottom': 10,
      'left': 10,
      'zIndex': 200000000,
      'width': DC.$('body').width() - 80,
      'border': '1px solid #000',
      'padding': '10px',
      'backgroundColor': '#fff',
      'fontFamily': 'arial,helvetica,sans-serif',
      'fontSize': '11px',
      'opacity': 0.4
    });
    this.viewer.$el.append(this.$el);
  },
  drawScrollPositions: function(positions){
    var width = this.viewer.$el.width;
    _.each(positions, function(info, positionName){
      var paper = this.viewer.$('.DV-paper');
      if (paper.find('.'+positionName).length == 0) { paper.append('<div class="'+positionName+'"></div>'); }
      var el = paper.find('.'+positionName);
      this[positionName] = el;
      el.css({
        height: '1px',
        backgroundColor: info.color,
        position: 'absolute',
        top: info.position,
        width: paper.width()
      });
    });
  },
  dump: function(html){ this.$('.dump').html(html); }
});
