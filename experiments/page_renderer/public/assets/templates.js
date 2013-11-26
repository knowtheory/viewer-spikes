(function(){
window.JST = window.JST || {};

window.JST['page'] = DC._.template('<div class="page_number">p. <%= page.pageNumber %></div>\n<div class="header"></div>\n<div class="matte" style="width: <%= page.width %>px; height: <%= page.height %>px;">\n</div>\n');
window.JST['page_renderer'] = DC._.template('');
window.JST['pages'] = DC._.template('');
window.JST['sidebar'] = DC._.template('<div class="page_mark"></div>');
window.JST['viewer'] = DC._.template('<div class="viewer">\n  <div class="header"></div>\n  <div class="backdrop">\n    <div class="pages"></div>\n  </div>\n  <div class="sidebar"></div>\n  <div class="footer"></div>\n</div>\n\n');
})();