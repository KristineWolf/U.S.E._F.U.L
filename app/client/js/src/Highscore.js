/* eslint-env browser */
/* global Howl*/
/* global Controller*/
/* global InitializeFirebase*/
/* global DatabaseAdapter*/

/*
 * represents all existing users with their highscore.
 * the highest score is in first place.
 */
var Highscore = (function() {
  "use strict";

  var that = {},
    adapter,
    sound,
    listView,
    controller;

  const SOUND_VOLUME="soundVolume",
    SOUND_CURRENT_TIME="soundTime";

  //if home buttons is clicked, sound position will be saved in localStorage
  // and user goes back to menu.html
  function onButtonClicked(){
    localStorage.setItem(SOUND_CURRENT_TIME,sound.seek());
    window.location.href="menu.html";
  }

  // will be called if adapter got data from database
  // gives data over to ordered list
  function onGetData(data){
    listView.createList(data);
  }

  function init() {
    initController();
    initFirebase();
    initDatabaseAdapter();
    initListView();
    initAudio();
    showHighscore();
  }

  // starts getting data from database
  function showHighscore(){
    adapter.getHighscore();
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

  //an ordered list where data of adapter will be presented
  function initListView(){
    var list=document.querySelector(".highscoreList");
    listView=Highscore.ListView(list);
  }

  //connection to Firebase Realtime Database
  function initDatabaseAdapter(){
    adapter= DatabaseAdapter();
    adapter.setOnDataListener(onGetData);
  }

  //inits connection to firebase
  function initFirebase(){
    InitializeFirebase().init();
  }

  //controller listens for click event if user wants to go back to menu.html
  function initController(){
    var home = document.querySelector(".home");
    controller=Controller(home);
    controller.init();
    controller.setOnButtonClickedListener(onButtonClicked);
  }

  that.init = init;
  return that;
}());
