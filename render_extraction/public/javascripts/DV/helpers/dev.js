if (!window.console || !window.console.log) {
  window.console = {};
  var _$ied;
  window.console.log = function(msg) {
    if (_.isArray(msg)) {
      var message = msg[0];
      var vars = _.map(msg.slice(1), function(arg) {
        return JSON.stringify(arg);
      }).join(' - ');
    }
    if(!_$ied){
      _$ied = DV.jQuery('<div><ol></ol></div>').css({
        'position': 'fixed',
        'bottom': 10,
        'left': 10,
        'zIndex': 200000000,
        'width': DV.jQuery('body').width() - 80,
        'border': '1px solid #000',
        'padding': '10px',
        'backgroundColor': '#fff',
        'fontFamily': 'arial,helvetica,sans-serif',
        'fontSize': '11px'
      });
      DV.jQuery('body').append(_$ied);
    }
    var $message = DV.jQuery('<li>'+message+' - '+vars+'</li>').css({
      'borderBottom': '1px solid #999999'
    });
    _$ied.find('ol').append($message);
    _.delay(function() {
      $message.fadeOut(500);
    }, 2000);
  };

}
