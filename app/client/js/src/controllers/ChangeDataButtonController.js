/* eslint-env browser */

//listens for click-events and hands over a specific number to recognize the clicked button
var UserData=UserData||{};
UserData.Controller = function(homeButton,change,enter){
  "use strict";
  var that={},
    buttonClicked;

  const ENTER_BUTTON=2;

  function init(){
    homeButton.addEventListener("click",function(){buttonClicked(0);});
    change.addEventListener("click",function(){buttonClicked(1);});
    enter.addEventListener("click",function(){buttonClicked(ENTER_BUTTON);});
  }

  function setOnButtonsClickedListener(listener){
    buttonClicked=listener;
  }

  that.init=init;
  that.setOnButtonsClickedListener=setOnButtonsClickedListener;
  return that;
};
