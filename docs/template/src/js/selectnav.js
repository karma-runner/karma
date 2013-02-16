/**
 * @preserve SelectNav.js (v. 0.1)
 * Converts your <ul>/<ol> navigation into a dropdown list for small screens
 * https://github.com/lukaszfiszer/selectnav.js
 */

window.selectnav = (function(){

"use strict";

  var selectnav = function(element,options){

    element = document.getElementById(element);

    // return immediately if element doesn't exist
    if( ! element){
      return;
    }

    // return immediately if element is not a list
    if( ! islist(element) ){
      return;
    }

    // add a js class to <html> tag
    document.documentElement.className += " js";

    // retreive options and set defaults
    var o = options || {},

      activeclass = o.activeclass || 'active',
      autoselect = typeof(o.autoselect) === "boolean" ? o.autoselect : true,
      nested = typeof(o.nested) === "boolean" ? o.nested : true,
      indent = o.indent || "→",
      label = o.label || "- Navigation -",

      // helper variables
      level = 0,
      selected = " selected ";

    // insert the freshly created dropdown navigation after the existing navigation
    element.insertAdjacentHTML('afterend', parselist(element) );

    var nav = document.getElementById(id());

    // autoforward on click
    if (nav.addEventListener) {
      nav.addEventListener('change',goTo);
    }
    if (nav.attachEvent) {
      nav.attachEvent('onchange', goTo);
    }

    return nav;

    function goTo(e){

      // Crossbrowser issues - http://www.quirksmode.org/js/events_properties.html
      var targ;
      if (!e) e = window.event;
      if (e.target) targ = e.target;
      else if (e.srcElement) targ = e.srcElement;
      if (targ.nodeType === 3) // defeat Safari bug
        targ = targ.parentNode;

      if(targ.value) window.location.href = targ.value;
    }

    function islist(list){
      var n = list.nodeName.toLowerCase();
      return (n === 'ul' || n === 'ol');
    }

    function id(nextId){
      for(var j=1; document.getElementById('selectnav'+j);j++);
      return (nextId) ? 'selectnav'+j : 'selectnav'+(j-1);
    }

    function parselist(list){

      // go one level down
      level++;

      var length = list.children.length,
        html = '',
        prefix = '',
        k = level-1
        ;

      // return immediately if has no children
      if (!length) {
        return;
      }

      if(k) {
        while(k--){
          prefix += indent;
        }
        prefix += " ";
      }

      for(var i=0; i < length; i++){

        var link = list.children[i].children[0];
        if(typeof(link) !== 'undefined'){
          var text = link.innerText || link.textContent;
          var isselected = '';

          if(activeclass){
            isselected = link.className.search(activeclass) !== -1 || link.parentElement.className.search(activeclass) !== -1 ? selected : '';
          }

          if(autoselect && !isselected){
            isselected = link.href === document.URL ? selected : '';
          }

          html += '<option value="' + link.href + '" ' + isselected + '>' + prefix + text +'</option>';

          if(nested){
            var subElement = list.children[i].children[1];
            if( subElement && islist(subElement) ){
              html += parselist(subElement);
            }
          }
        }
      }

      // adds label
      if(level === 1 && label) {
        html = '<option value="">' + label + '</option>' + html;
      }

      // add <select> tag to the top level of the list
      if(level === 1) {
        html = '<select class="selectnav" id="'+id(true)+'">' + html + '</select>';
      }

      // go 1 level up
      level--;

      return html;
    }

  };

  return function (element,options) {
    selectnav(element,options);
  };


})();