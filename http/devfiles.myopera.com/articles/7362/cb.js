if (navigator.registerContentHandler){
  navigator.registerContentHandler("text/x-cheeseburger", "cb.html?cb=%s", "Cheeseburger Parser");
}

if (location.search.slice(1,3) == "cb") {
  var cbloc = decodeURIComponent(location.search.slice(4));
  getCB(cbloc, parseCB);
}

function getCB(url, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200){
      callback(xhr.responseText);
    }
  };
  xhr.send();
}

function parseCB(cbtext){
  var cbarray = cbtext.split('');
  cbarray.forEach(function(part){
    switch(part){
      case "(":
        wrap(part, 'bun');
        break;
      case "|": 
        wrap(part, 'cheese');
        break;
      case "%":
        wrap(part, 'burger');
        break;
      case ")":
        wrap(part, 'bun');
        break;
      default: /* lol */
    }
  });
};

function wrap(part, cssClass){
  var s = document.createElement('span');
  s.innerHTML = part;
  s.className = cssClass;
  display.appendChild(s);
};