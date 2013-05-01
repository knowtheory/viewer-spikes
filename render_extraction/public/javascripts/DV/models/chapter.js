// The Chapters view keep track of a document's
// sections/chapters and on which page each
// chapter begins.
DV.model.Chapters = function(viewer) {
  this.viewer = viewer;
  this.loadChapters();
};

DV.model.Chapters.prototype = {

  // Load (or reload) the chapter model from the schema's defined sections.
  loadChapters : function() {
    var doc = this.viewer.model;
    var sections = doc.sections;
    // not clear why we're even keeping an inverted index of pages => chapter/sections
    var chapters = this.chapters = doc.chapters = [];
    var pageCount = doc.totalPages;

    if (sections.length < 1) return; // short circuit if there are no sections

    sections.each(function(section, index){ 
      var nextSection = sections.at(index+1);

      // make sure each section has a unique id we can reference.
      section.id || (section.id = _.uniqueId());
      section.set('id', section.id);
      section.set('pageNumber', section.get('page'));
      section.set('endPage', nextSection ? nextSection.get('page') - 1 : pageCount);

      // so long as the pageIndex for the section is in bounds
      // assign the section to the appropriate page's chapter.
      var pageIndex = section.page - 1;
      if (pageIndex >= 0 && pageIndex < pageCount) { chapters[pageIndex] = section.id; }
    });
  },

  getChapterId: function(index) {
    return this.chapters[index];
  },

  getChapterPosition: function(chapterId) {
    for (var i = 0, len = this.chapters.length; i < len; i++) {
      if (this.chapters[i] === chapterId) {
        return i;
      }
    }
  }
};

DV.model.SectionSet = DV.Backbone.Collection.extend({ 
  comparator: function(sec){ return sec.get('page'); }
});