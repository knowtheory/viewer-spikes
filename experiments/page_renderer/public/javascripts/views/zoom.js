DC.view.Zoom = DC.Backbone.View.extend({
  className: 'zoom-level',
  LEVELS: [50, 66, 75, 100, 125, 133, 150],
  events: {
    'change select': 'onUpdate'
  },
  _rendered: false,

  initialize: function(options) {
    DC._.bindAll(this, 'onZoomChange');
    this.uiState = options.uiState;
    this.uiState.on('change:zoom', this.onZoomChange);
  },

  onZoomChange: function(uiState, zoom) {
    if (this._rendered) {this.$select.val(zoom);}
  },

  onUpdate: function() {
    this.uiState.set('zoom', parseInt(this.$select.val()));
  },

  render: function() {
    this._rendered = true;
    var title = DC.$('<span class="zoom-level-title">Zoom</span>');
    var options = DC._.map(this.LEVELS, function(level) {
      return DC.$('<option></option>').attr('value', level).text(level + '%');
    });
    this.$select = DC.$('<select class="zoom-level-select"></select>').append(options);
    this.$el.append(title, this.$select);
    this.$select.val(this.uiState.get('zoom'));

    return this;
  }
});
