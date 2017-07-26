/* eslint-env browser */

var Menu = Menu|| {};
Menu.MenuController = function(logOutButton, starGameButton, instructionsButton, creditsButton, highscore, username,volume){
  "use strict";
  var that={},
    buttonsClicked,
    showVolumeslider;

  const INSTRUCTIONS=2,
    CREDITS=3,
    HIGHSCORE=4,
    USER_DATA=5;

  //by clicking a button, a callback method will be called and to differ these buttons this method will get a specific number
  function init(){
    logOutButton.addEventListener("click", function(){buttonsClicked(0);});
    starGameButton.addEventListener("click",function(){buttonsClicked(1);});
    instructionsButton.addEventListener("click",function(){buttonsClicked(INSTRUCTIONS);});
    creditsButton.addEventListener("click",function(){buttonsClicked(CREDITS);});
    highscore.addEventListener("click",function(){buttonsClicked(HIGHSCORE);});
    username.addEventListener("click",function(){buttonsClicked(USER_DATA);});
    //if mouse mover over the symbol, the slider appears
    volume.addEventListener("mouseover",function(){showVolumeslider(0);});
    //if mouse is not above the symbol, the slider disappears
    volume.addEventListener("mouseout",function(){showVolumeslider(1);});
  }

  function setOnButtonsListener(listener){
    buttonsClicked=listener;
  }

  function setOnVolumeListener(listener){
    showVolumeslider=listener;
  }

  that.setOnVolumeListener=setOnVolumeListener;
  that.setOnButtonsListener=setOnButtonsListener;
  that.init=init;
  return that;
};
