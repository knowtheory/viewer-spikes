DV.views.Viewer = Backbone.View.extend({
  className: 'dv-viewer',

  initialize: function() {
    // Boostrap test state machine
    this.state = new DV.models.State({
      initial: 'green',
      events: [
        { name: 'warn',  from: 'green',  to: 'yellow' },
        { name: 'panic', from: 'yellow', to: 'red'    },
        { name: 'calm',  from: 'red',    to: 'yellow' },
        { name: 'clear', from: 'yellow', to: 'green'  }
      ]
    });

    // Create a data store
    this.data = new DV.models.Data({
      state       : this.state.current, 
      zoomLevel   : 1,
      currentPage : null,
      document    : null
    });

    // Create a subscription to state updates which updates the state in 
    // our data store.
    this.state.current.onValue($.proxy(this, 'stateReceived'));

    // Set up constituient views
    this.rendererView = new DV.views.Renderer({viewer: this});

    // Kick off document loading
  },

  load: function() {
    // Stubbed out for now
    this.jsonReceived();
  },

  jsonReceived: function(json) {
    // this.data.set('document', new DV.models.Document(json));
    this.data.set('document', docs.at(0));
    this.data.set('currentPage', {page: 0});
  },

  stateReceived: function(update) {
    this.data.set('state', update.state);
  },

  render: function() {
    this.$el.append(this.rendererView.render().el);

    return this;
  }
});
