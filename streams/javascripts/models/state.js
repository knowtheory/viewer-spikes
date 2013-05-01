// An experiment with a simple state machine using Bacon. Events are 
// pushed via state.events.push(...). State updates are published via the
// state.current stream.
DV.models.State = function(config) {
  this.machine = new StateMachine.create(config);
  this.current = new Bacon.Bus();
  this.current.push({state: this.machine.current});
};

DV.models.State.prototype = {
  trigger: function(name, data) {
    if (this.machine.can(name)) {
      this.machine[name]();
      this.current.push({state: this.machine.current, data: data});
    }
  }
};
