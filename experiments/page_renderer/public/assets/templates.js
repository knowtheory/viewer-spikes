(function(){
window.JST = window.JST || {};

window.JST['page'] = DC._.template('<div class="page_number">p. <%= page.pageNumber %></div>\n<div class="header"></div>\n<div class="matte">\n</div>\n');
window.JST['renderer'] = DC._.template('<div class="backdrop">\n  <div class="pages"></div>\n</div>\n<div class="sidebar"></div>\n');
window.JST['sidebar'] = DC._.template('<div class="viewport">\n  <div class="page_mark">\n    <div class="mark_text">page <span class="page_number">1</span></div>\n  </div>\n</div>');
window.JST['viewer'] = DC._.template('<div class="viewer">\n  <div class="header"></div>\n  <div class="renderer">\n  </div>\n  <div class="footer"></div>\n</div>\n\n');
})();