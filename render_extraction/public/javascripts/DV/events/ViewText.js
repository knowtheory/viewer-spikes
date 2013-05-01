DV.Schema.events.ViewText = {
  next: function(e){
    var nextPage = this.viewer.models.document.nextPage();
    this.loadText(nextPage);
  },
  previous: function(e){
    var previousPage = this.viewer.models.document.previousPage();
    this.loadText(previousPage);
  },
  search: function(e){
    e.preventDefault();
    this.viewer.open('ViewSearch');

    return false;
  }
};