var phone = document.getElementById('phone'),
    msg = phone.appendChild(document.createElement('div')),
    buttons = document.querySelectorAll('button'),
    display = document.getElementById('number'),
    beeps = ['beep1', 'beep2', 'beep3', 'beep4'];

function yuno(RAGE){/* (屮'Д')屮 */}

var init = (function(){
  //create 4 in-memory audio elements
  for (var i = 0; i < 4; i++){
   beeps[i] = new Audio(beeps[i] + '.ogg');
  };
  
  //if you click on a number button, update the number "display"
  Array.prototype.slice.call(buttons).forEach(function(el){
    el.addEventListener('click', function(event){
      var target = event.target;
      if (!!~'0123456789'.indexOf(target.textContent)){
        display.value += target.textContent;
        beeps[Math.floor(Math.random() * 4)].play();
      //unless you click on the commie button, in which case
      //clear out the display. you know...
      } else if (target.className == 'communism') {
        display.value = '';
      }
    }, false);
  });
  
  if (!!~location.search.indexOf('tel')){
    number.value = location.search.slice(7);
  }
  
  navigator.registerProtocolHandler ? 
    navigator.registerProtocolHandler('tel', 'http://miketaylr.com/pres/capjs/demo/?%s', 'Telephony App') :
      yuno();
  
  if (navigator.onLine == false){
    msg.innerHTML = "<p>oh no, it appears you're offline and can't make a phone call!</p>";
  }
}());
