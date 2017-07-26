/* eslint-env browser */
/* exported BackToMenu*/
/* global Controller*/
/* global Howl*/

/*
 * used in credits.html and instructions.html.
 * inits button listener to get back to menu.html.
 * plays the song.
 */
var BackToMenu = (function() {
  "use strict";

  var that = {},
    sound,
    controller;

  const SOUND_VOLUME="soundVolume",
    SOUND_CURRENT_TIME="soundTime";

  //saves song position in localStorage and opens menu.html if home-button is clicked
  function onButtonClicked(){
    localStorage.setItem(SOUND_CURRENT_TIME,sound.seek());
    window.location.href="menu.html";
  }

  function init() {
    initController();
    initAudio();
  }

  //plays the song where it stopped and with selected volume.
  function initAudio(){
    var volume=localStorage.getItem(SOUND_VOLUME),
      time=localStorage.getItem(SOUND_CURRENT_TIME);
    sound = new Howl({
      src: ["../res/Exploration.wav",],
      loop:true,
    });
    sound.play();
    sound.volume(volume);
    sound.seek(time);
  }

  //listens for a click event and calls afterwards onButtonClicked()
  function initController(){
    var home=document.querySelector(".home");
    controller=Controller(home);
    controller.init();
    controller.setOnButtonClickedListener(onButtonClicked);
  }

  that.init = init;
  return that;
}());
