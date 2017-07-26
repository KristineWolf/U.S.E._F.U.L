/* eslint-env browser */
/* global InitializeFirebase*/
/* global DatabaseAdapter*/
/* global FirebaseAuthentification*/
/* global Howl*/

var Menu = Menu || {};
Menu = (function() {
  "use strict";

  var that = {},
    controller,
    volumeController,
    adapter,
    view,
    sound,
    storage=localStorage,
    auth;

  const CURRENT_USER="currentUser",
    SOUND_VOLUME="soundVolume",
    SOUND_CURRENT_TIME="soundTime",
    INSTRUCTIONS=2,
    CREDITS=3,
    HIGHSCORE=4,
    HUNDRED=100;

  function onButtonsClicked(buttonClicked){
    //every time the user leaves a page the song position will be saved in localStorage
    localStorage.setItem(SOUND_CURRENT_TIME,sound.seek());
    switch (buttonClicked) {
      //if user wants to log out
      case 0:
        auth.logOut();
        //user and sound position will be removed from localStorage
        storage.removeItem(CURRENT_USER);
        storage.removeItem(SOUND_CURRENT_TIME);
        window.location.href="../index.html";
        break;
        //if user wants to play the game
      case 1:
        window.location.href="game.html";
        //in the game is a different song therefore the song position of the current song must be deleted
        storage.removeItem(SOUND_CURRENT_TIME);
        break;
        //if user wants to see the instructions
      case INSTRUCTIONS:
        window.location.href="instructions.html";
        break;
        //if user wants to see the credits
      case CREDITS:
        window.location.href="credits.html";
        break;
        //if user wants to see the highscores
      case HIGHSCORE:
        window.location.href="highscore.html";
        break;
        //if user wants to see and change his password or/and his username
      default:
        window.location.href="userdata.html";
    }
  }

  //if user is logged in adapter searches for the unique username and the data to it
  function onLoggedIn(data){
    adapter.searchForData(data.displayName);
  }

  //to get the saved data of user in database and to save them in localStorage
  //this guarantes a better performance for the other pages, because they don´t have to read again
  function onGetData(data){
    view.setData(data.id,data.highscore);
    storage.setItem(CURRENT_USER,JSON.stringify(data));
  }

  //if mouse hovers over the sound icon the slider will appear
  function onShowVolumeslider(event){
    switch (event) {
      case 0:
        view.showVolumeslider();
        break;
      default:
        view.hideVolumeslider();
    }
  }

 //if user interacts with the slider, volume of sound and the icon will change
 //every time if it changes, volume value will be saved in localStorage
  function onVolume(value){
    sound.volume(value/HUNDRED);
    view.showVolumeSymbol(value);
    localStorage.setItem(SOUND_VOLUME,value/HUNDRED);
  }

  function init(){
    initFirebase();
    initControllers();
    initAuthentification();
    initDatabaseAdapter();
    initMenuView();
    initAudio();
  }

  //plays the song where it stopped and with selected volume.
  function initAudio(){
    var volume=storage.getItem(SOUND_VOLUME),
      time=storage.getItem(SOUND_CURRENT_TIME);
    sound = new Howl({
      src: ["../res/Exploration.wav",],
      loop: true,
    });
    sound.play();
    //if volume value wasn´t been saved in localStorage, volume will be 1
    if(volume){
      sound.volume(volume);
      //sets right icon for volume
      view.showVolumeSymbol(volume*HUNDRED);
      //sets circle of slieder to the right position
      view.setSliderValue(volume);
    }
    //if play position of song wasn´t been saved, sound starts at the beginning
    if(time){
      sound.seek(time);
    }
  }

  //init connection to firebase
  function initFirebase(){
    InitializeFirebase().init();
  }

  function initDatabaseAdapter(){
    adapter=DatabaseAdapter();
    adapter.setOnDataListener(onGetData);
  }

  function initMenuView(){
    var username= document.querySelector(".usernameText"),
      highscore=document.querySelector(".highscoreText"),
      volumeslider=document.querySelector("#volumeslider"),
      volumeOff=document.querySelector(".fa-volume-off"),
      volumeUp=document.querySelector(".fa-volume-up"),
      volumeDown=document.querySelector(".fa-volume-down");
    view= Menu.View(username,highscore,volumeslider,volumeOff,volumeUp,volumeDown);
  }

  function initControllers(){
    initButtontroller();
    initVolumeController();
  }

  //listens for direct interaction with volumeslider, presenting the slider will be listened by var controller
  function initVolumeController(){
    var slider=document.querySelector("#volumeslider");
    volumeController= Menu.VolumeController(slider);
    volumeController.init();
    volumeController.setOnVolumeListener(onVolume);
  }

  function initButtontroller(){
    var logOutButton=document.querySelector(".logOut"),
      starGameButton=document.querySelector(".play"),
      instructionsButton=document.querySelector(".instructions"),
      creditsButton=document.querySelector(".credits"),
      highscore=document.querySelector(".highscore"),
      volume=document.querySelector(".sound"),
      username=document.querySelector(".username");
    controller=Menu.MenuController(logOutButton,starGameButton,instructionsButton,creditsButton,highscore,username,volume);
    controller.init();
    controller.setOnButtonsListener(onButtonsClicked);
    //to listen if mouse hovers over sound icon
    controller.setOnVolumeListener(onShowVolumeslider);
  }

  function initAuthentification(){
    auth= FirebaseAuthentification();
    auth.init();
    auth.setOnLoggedInListener(onLoggedIn);
  }

  that.init = init;
  return that;
}());
