DC.view.Pagination = DC.Backbone.View.extend({
  className: 'pagination',
  _rendered: false,
  events: {
    'click .pagination-previous': 'onClickPrevious',
    'click .pagination-next': 'onClickNext',
    'keyup .pagination-input': 'onKeyUp'
  },

  initialize: function(options) {
    this.uiState = options.uiState;
    DC._.bindAll(this, 'onPageChange');
    this.uiState.on('change:currentPage', this.onPageChange);
  },

  onClickPrevious: function(e) {
    var current = this.uiState.get('currentPage');
    if (current !== 1) {this.uiState.set('currentPage', current - 1);}
  },

  // TODO: Check that we're not at the last page.
  onClickNext: function(e) {
    var current = this.uiState.get('currentPage');
    this.uiState.set('currentPage', current + 1);
  },

  // TODO: Check that the value is an integer and that it's within the page
  // bounds.
  onKeyUp: function(e) {
    if (e.keyCode === 13) {
      var value = parseInt(this.input.val());
      this.uiState.set('currentPage', value);
    }
  },

  onPageChange: function() {
    if (this._rendered) {this.updateUI();}
  },

  // TODO: Check for the last page. This depends on the ui state model storing
  // the page count as well.
  updateUI: function() {
    var current = this.uiState.get('currentPage');
    if (current === 1) {
      this.previous.addClass('disabled');
    }
    else {
      this.previous.removeClass('disabled');
    }

    this.input.val(current);
  },

  render: function() {
    this._rendered = true;
    this.previous = DC.$('<span class="pagination-previous">Previous</span>');
    this.next = DC.$('<span class="pagination-next">Next</span>');
    this.input = DC.$('<input class="pagination-input"/>');
    this.$el.append(this.previous, this.input, this.next);

    this.updateUI();

    return this;
  }
});
