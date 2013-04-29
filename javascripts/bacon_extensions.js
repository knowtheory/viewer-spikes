//This is superficially like 'debounce', but emits events only when there's been a gap of length (delay) since the previous event.
//Requires that the event itself has a 'timeStamp' property - supplied by jQuery
Bacon.EventStream.prototype.afterExpiry = function(delay) {
  return this.map(function(e){return e.timeStamp})//The timestamp for this event
         .diff(0, function(a, b){return Math.abs(b - a)}) //The time since the last event
         .filter(function(time){return time > delay}); //Emit when the timestamp has expired
};
