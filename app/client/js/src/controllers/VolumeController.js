/* eslint-env browser */

/*
 * controlls the interaction with the volumeslider
 */
var Menu = Menu||{};
Menu.VolumeController=function(slider){
  "use strict";
  var that={},
    setVolume;

  //if user interacts with slider, a callback method will be called
  //this method gets the slider circle position as a parameter
  function init(){
    slider.addEventListener("mousemove",function(){setVolume(slider.value);});
  }

  function setOnVolumeListener(listener){
    setVolume=listener;
  }

  that.setOnVolumeListener=setOnVolumeListener;
  that.init=init;
  return that;
};
