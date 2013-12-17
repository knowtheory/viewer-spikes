(function(){
window.JST = window.JST || {};

window.JST['overview'] = DC._.template('<div class="page_mark ui-slider-handle">\n  <div class="mark_text">page <span class="page_number">1</span></div>\n</div>\n<% _.each(_.range(1, pageCount), function(pageNumber) { %>\n<div class="page<%= (pageNumber % 2) ? \' even\' : \'\' %>" style="width: 100%;position: absolute; top:<%= (100*pageNumber/pageCount) %>%; height:<%= (100/pageCount) %>%"></div>\n<% }); %>\n');
window.JST['page'] = DC._.template('<div class="page_number">p. <%= page.pageNumber %></div>\n<div class="header"></div>\n<div class="matte" style="width: <%= page.width %>px; height: <%= page.height %>px;">\n</div>\n');
window.JST['pages'] = DC._.template('');
window.JST['renderer'] = DC._.template('<div class="backdrop">\n  <div class="pages"></div>\n</div>\n<div class="overview"></div>\n');
window.JST['viewer'] = DC._.template('<div class="viewer">\n  <div class="header"></div>\n  <div class="renderer">\n    <div class="backdrop">\n      <div class="pages"></div>\n    </div>\n    <div class="sidebar"></div>\n  </div>\n  <div class="footer">\n    <div class="up"></div>\n    <div class="menu"></div>\n    <div class="down"></div>\n  </div>\n</div>\n\n');
})();