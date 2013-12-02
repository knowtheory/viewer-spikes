# Planning

## Page Overlays (notes)
* Pages must provide a mechanism for overlays to hook into for loading/unloading.


## Note List Display

## Text Display

## Search

## Chrome
Open questions:

* What default set of interactions should be available?

## Ideas

* Indicate current page number w/ a tab that appears when scrolling, which is grabbable, and assignable.
* Indicate which pages have notes relative to page position in the scrollbar?

## Rambling Notes

Models are structured as a Tree of objects (Document -> (Pages, Notes, Sections))

Views will be structured as a Directed Acyclic Graph.  That said, the view graph must have a single root, and sub-sections of the graph must also have a single common root.  Common roots are necessary as certain subsections of the graph must be destructible & regenerable as a whole.