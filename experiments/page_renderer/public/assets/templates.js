(function(){
window.JST = window.JST || {};

window.JST['page'] = DC._.template('<div class="matte" style="width: <%= page.width %>px; height: <%= page.height %>px;">\n  <div class="page_number">p. <%= page.pageNumber %></div>\n  <img></img>\n</div>\n');
window.JST['page_set'] = DC._.template('');
window.JST['pages'] = DC._.template('');
window.JST['viewer'] = DC._.template('<div class="viewer">\n  <div class="header"></div>\n  <div class="backdrop">\n    <div class="pages"></div>\n  </div>\n  <div class="footer"></div>\n</div>\n\n');
})();