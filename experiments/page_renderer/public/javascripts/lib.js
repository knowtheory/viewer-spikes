DC._.mixin({
  asFractionOf: function(numerator, denominator, suffix){
    var result = numerator / denominator;
    if (suffix) { result += suffix; }
    return result;
  },

  // Take advantage of underscore's OO wrapper to use asPercentOf
  // as an infix operation. DC._(5).asPercentOf(10) // => 50
  asPercentOf: function(numerator, denominator, suffix){
    var result = this.asFractionOf(numerator, denominator) * 100;
    if (suffix) { result += suffix; }
    return result;
  }
});

DC._.extend(DC.lib, {});