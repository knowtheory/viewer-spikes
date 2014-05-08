# Architectural Notes

## Requirements

1. As far as DocSplit is concerned, pages have native pixel dimensions.
2. Notes are placed relative to the top left corner of a page.
3. Pages should be scaled such that their width is relative to their parent container.
4. Pages belong in a sequence.


## Request cycle

1. Viewer code is loaded.
2. Viewer detects whether flexbox (and any other features) are available
3. viewer is instantiated
4. viewer.el is set.
5. viewer renders itself into specified el.
6. viewer's document is loaded

## on viewer document load

1. document height is determined (guess by counting pages & multiplying by avg page height and adding margins)
2. 