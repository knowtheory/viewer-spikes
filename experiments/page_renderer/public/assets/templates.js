(function(){
window.JST = window.JST || {};

window.JST['page'] = DC._.template('<div class="page_number">p. <%= page.pageNumber %></div>\n<div class="page" style="width: <%= page.width %>px; height: <%= page.height %>px;">\n  <img width="<%= page.width %>" height="<%= page.height %>"></img>\n</div>\n');
window.JST['page_set'] = DC._.template('');
window.JST['viewer'] = DC._.template('<div class="page_matte">\n  <div class="header"></div>\n  <div class="pages"></div>\n  <div class="footer"></div>\n</div>\n\n');
})();