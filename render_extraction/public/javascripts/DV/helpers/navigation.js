_.extend(DV.Schema.helpers, {
  resetNavigationState: function(){
    var elements                      = this.viewer.elements;
    if (elements.chaptersContainer.length) elements.chaptersContainer[0].id  = '';
    if (elements.navigation.length)        elements.navigation[0].id         = '';
  },
  setActiveChapter: function(chapterId){
    if (chapterId) this.viewer.elements.chaptersContainer.attr('id','DV-selectedChapter-'+chapterId);
  },
  setActiveAnnotationInNav: function(annotationId){
    if(annotationId != null){
      this.viewer.elements.navigation.attr('id','DV-selectedAnnotation-'+annotationId);
    }else{
      this.viewer.elements.navigation.attr('id','');
    }
  }
});
