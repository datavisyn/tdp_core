document.addEventListener("DOMContentLoaded", function(event) {
  var options = {
    valueNames: ['title', 'name', 'description']
  };
  var className = 'active';

  var appsList = new List('apps', options);

  var selectedItem = null;

  var UP = 38;
  var DOWN = 40;
  var ENTER = 13;

  var getKey = function(e) {
    if(window.event) { return e.keyCode; }  // IE
    else if(e.which) { return e.which; }    // Netscape/Firefox/Opera
  };

  var addClass = function(el, className) {
    if(el === null) return;

    if (el.classList)
        el.classList.add(className);
    else
      el.className += ' ' + className;
  };

  var removeClass = function(el, className) {
    if(el === null) return;

    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  };

  var search = document.getElementById('search');
  var list = document.querySelectorAll('ul.list')[0];

  search.onsearch = function(e) {
    if(search.value === "") {
      removeClass(list, 'nothing-found');
    }
  };

  // update cursor and trigger enter
  search.onkeyup = function(e) {
    var keynum = getKey(e);

    removeClass(list, 'nothing-found');

    if(appsList.visibleItems.length === 0) {
      selectedItem = null;
      addClass(list, 'nothing-found');
      //return false;

    } else if(appsList.visibleItems.length === 1) {
      removeClass(selectedItem, className);
      selectedItem = appsList.visibleItems[0].elm;
      addClass(selectedItem, className);

    } else if(appsList.visibleItems.length > 1 &&
      appsList.visibleItems.filter(function(item) { return item.elm === selectedItem; }).length === 0) {

      appsList.items.map(function(item) {
        removeClass(item.elm, className);
      });
      selectedItem = appsList.visibleItems[0].elm;
      addClass(selectedItem, className);
    }

    if(keynum === ENTER && selectedItem !== null) {
      //console.log(selectedItem.getAttribute('href'));
      window.location.href = selectedItem.firstElementChild.getAttribute('href');
    }
  };

  // move active/selected element in list up or down
  search.onkeydown = function(e) {
    var keynum = getKey(e);
    var selectedParent = null;

    // do nothing, if nothing is slected
    if(selectedItem === null) {
      return true;
    }

    switch(keynum) {
      case UP:
        removeClass(selectedItem, className);
        // use previous list element or last element, if at the end
        selectedParent = selectedItem.previousElementSibling || selectedItem.parentNode.lastElementChild;
        selectedItem = selectedParent;
        addClass(selectedItem, className);
        //selectedItem.scrollIntoView(true);
        return false;
        break;

      case DOWN:
        removeClass(selectedItem, className);
        // use next list element or first element, if at the end
        selectedParent = selectedItem.nextElementSibling || selectedItem.parentNode.firstElementChild;
        selectedItem = selectedParent;
        addClass(selectedItem, className);
        //selectedItem.scrollIntoView(true);
        return false;
        break;
    }
  };

  search.onblur = function() {
    if(selectedItem === null) {
      return true;
    }
    removeClass(selectedItem, className);
    return false;
  };

  search.onfocus = function() {
    if(selectedItem === null) {
      return true;
    }
    addClass(selectedItem, className);
    selectedItem.scrollIntoView(true);
    return false;
  };

  // focus by default
  search.focus();


});
