(function(){
window.JST = window.JST || {};

window.JST['page'] = DC._.template('<div class="page_number">p. <%= page.pageNumber %></div>\n<div class="page" style="width: <%= page.width %>px; height: <%= page.height %>px;"></div>\n');
window.JST['page_set'] = DC._.template('');
window.JST['pages'] = DC._.template('');
window.JST['viewer'] = DC._.template('<div class="viewer">\n  <div class="header"></div>\n  <div class="pages">\n    <div class="matte"></div>\n  </div>\n  <div class="footer"></div>\n</div>\n\n');
})();