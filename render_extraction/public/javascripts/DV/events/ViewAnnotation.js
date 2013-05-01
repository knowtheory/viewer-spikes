DV.Schema.events.ViewAnnotation = {
  next: function(e){
    var viewer              = this.viewer;
    var activeAnnotationId  = viewer.activeAnnotationId;
    var notes    = this.viewer.model.notes;
    var nextAnnotation      = (activeAnnotationId === null) ?
        notes.getFirstAnnotation() : notes.getNextAnnotation(activeAnnotationId);

    if (!nextAnnotation){
      return false;
    }

    viewer.pages.showAnnotation(nextAnnotation);
    viewer.helpers.setAnnotationPosition(nextAnnotation.position);
  },
  previous: function(e){
    var viewer              = this.viewer;
    var activeAnnotationId  = viewer.activeAnnotationId;
    var notes    = this.viewer.model.notes;

    var previousAnnotation = (!activeAnnotationId) ?
    notes.getFirstAnnotation() : notes.getPreviousAnnotation(activeAnnotationId);
    if (!previousAnnotation){
      return false;
    }

    viewer.pages.showAnnotation(previousAnnotation);
    viewer.helpers.setAnnotationPosition(previousAnnotation.position);


  },
  search: function(e){
    e.preventDefault();
    this.viewer.open('ViewSearch');

    return false;
  }
};