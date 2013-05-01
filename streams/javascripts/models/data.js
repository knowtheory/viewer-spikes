// Data is basically a key/value store, where the values are only
// accessible via event streams
DV.models.Data = function(initial) {
  for (var prop in initial) {
    if (_.has(initial, prop)) {
      var bus = this[prop + '_bus'] = new Bacon.Bus();

      if (_.has(initial, prop) && !_.isNull(initial[prop])) {
        this[prop] = bus.skipDuplicates().toProperty(initial[prop]);
      }
      else {
        this[prop] = bus.skipDuplicates().toProperty();
      }
    }
  }

  this.all_bus = new Bacon.Bus();
  this.all = this.all_bus.skipDuplicates();
};

DV.models.Data.prototype = {
  set: function(key, value) {
    this[key + '_bus'].push(value);
    this.all_bus.push({key: key, value: value});
  }
};
