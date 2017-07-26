/* eslint-env browser */

/*
 * shows the highscore and username of current user
 * changes thy sound icon and positions the slider circle
 */
var Menu = Menu|| {};
Menu.View = function(userName, highscore,volumeslider,off,up,down){
  "use strict";
  var that={};

  const HUNDRED=100,
    MIDDLE=50,
    LOW=5;

  // set username and highscore in provided place
  function setData(name,hs){
    userName.innerHTML=name;
    highscore.innerHTML=hs;
  }

  //shows slider if mouse is over symbol
  function showVolumeslider(){
    volumeslider.classList.remove("hidden");
  }

  //hides slider is mouse is not near the sound bar
  function hideVolumeslider(){
    volumeslider.classList.add("hidden");
  }

  //changes the sound icon to volume off
  function volumeOff(){
    up.setAttribute("id","hidden");
    down.setAttribute("id","hidden");
    off.removeAttribute("id");
  }

  //changes the sound icon to volume up
  function volumeUp(){
    off.setAttribute("id","hidden");
    down.setAttribute("id","hidden");
    up.removeAttribute("id");
  }

  //changes the sound icon to volume down
  function volumeDown(){
    up.setAttribute("id","hidden");
    off.setAttribute("id","hidden");
    down.removeAttribute("id");
  }

  //checks which symbol should be presented with this volume value
  function showVolumeSymbol(value){
    if(value>MIDDLE){
      volumeUp();
    }else if(value>=LOW){
      volumeDown();
    }else{
      volumeOff();
    }
  }

  //sets slider circle position to specific value
  function setSliderValue(value){
    volumeslider.value=value*HUNDRED;
  }

  that.setSliderValue=setSliderValue;
  that.showVolumeSymbol=showVolumeSymbol;
  that.hideVolumeslider=hideVolumeslider;
  that.showVolumeslider=showVolumeslider;
  that.setData=setData;
  return that;
};
