DV.Schema.events.ViewSearch = {
  next: function(e){
    var nextPage = this.viewer.models.document.nextPage();
    this.loadText(nextPage);

    this.viewer.open('ViewText');
  },
  previous: function(e){
    var previousPage = this.viewer.models.document.previousPage();
    this.loadText(previousPage);

    this.viewer.open('ViewText');
  },
  search: function(e){
    e.preventDefault();
    this.helpers.getSearchResponse(this.viewer.elements.searchInput.val());

    return false;
  }
};