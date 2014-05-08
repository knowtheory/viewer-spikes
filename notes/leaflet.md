# Leaflet Notes

## Architectural notes

Contains implementations of the following:
* An Eventing system equivalent to Backbone.Events
* A class/inheritance system equivalent to Backbone's
* An abstract Renderer base class
* SVG and Canvas renderers which draw & manage components
* A dependency manager
* Has very explicit bounding box & region intersection math/calculations
* a uniform space to project objects over

### Main drawing loop

1. 

## Questions

### How are polygons drawn / scaled?
Leaflet includes a class that maps points between an x/y pixel space and a lat/long map space.


## Relevance Document Viewing

### Similarities
* Contains Zoom steps
* Has layers
* Has drawable polygons, lines and so on.
* Panning

### Differences
* Leaflet can assume a uniform tile size
* Leaflet has no scroll bars
* Document pages are a self-contained lil world

# DocumentViewer

## Array of pages
* Must be scrollable by means of mouse wheel, arrow keys & touching.
* Must retain ordering
* Must scale individual pages to width of viewable buffer.