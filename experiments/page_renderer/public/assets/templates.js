(function(){
window.JST = window.JST || {};

window.JST['page'] = DC._.template('<div class="page_number">p. <%= page.pageNumber %></div>\n<div class="page" style="width: <%= page.width %>px; height: <%= page.height %>px;">\n  \n</div>\n');
window.JST['page_set'] = DC._.template('');
window.JST['viewer'] = DC._.template('<div class="pages"></div>\n<div class="footer"></div>\n');
})();