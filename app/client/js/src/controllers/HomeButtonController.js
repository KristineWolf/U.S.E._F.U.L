/* eslint-env browser */
/* exported Controller*/

//listens for an click event and informs callback by an event
var Controller = function(homeButton){
  "use strict";
  var that={},
    buttonClicked;

  function init(){
    homeButton.addEventListener("click",function(){buttonClicked();});
  }

  function setOnButtonClickedListener(listener){
    buttonClicked=listener;
  }

  that.init=init;
  that.setOnButtonClickedListener=setOnButtonClickedListener;
  return that;
};
