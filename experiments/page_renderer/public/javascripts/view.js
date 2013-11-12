DC.view.Viewer = DC.Backbone.View.extend({
  initialize: function(options) {
    console.log(options);
  },
  load: function(data) {
    console.log(data);
    this.model = new DC.model.Document(data);
  }
});

