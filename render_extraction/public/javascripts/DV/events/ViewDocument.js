DV.Schema.events.ViewDocument = {
  next: function(){
    var nextPage = this.viewer.models.document.nextPage();
    this.viewer.helpers.jump(nextPage);

    // this.viewer.history.save('document/p'+(nextPage+1));
  },
  previous: function(e){
    var previousPage = this.viewer.models.document.previousPage();
    this.viewer.helpers.jump(previousPage);

    // this.viewer.history.save('document/p'+(previousPage+1));
  },
  search: function(e){
    e.preventDefault();

    this.viewer.open('ViewSearch');
    return false;
  }
}