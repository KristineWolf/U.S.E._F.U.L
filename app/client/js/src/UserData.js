/* eslint-env browser */
/* global Howl*/
/* global DatabaseAdapter*/
/* global InitializeFirebase*/
/* global FirebaseAuthentification*/

var UserData = (function() {
  "use strict";

  var that = {},
    auth,
    adapter,
    sound,
    view,
    controller;

  const CURRENT_USER="currentUser",
    PASSWORDS_NOT_SIMILIAR="Your passwords are not similiar!",
    PASSWORD_TOO_SHORT="Your password should at least have six characters!",
    USER_EXIST="This username is already in use! <br> Please choose an other one.",
    SOUND_VOLUME="soundVolume",
    PASS_MIN_LENGTH=6,
    SOUND_CURRENT_TIME="soundTime";

  function onButtonClicked(buttonClicked){
    switch (buttonClicked) {
      //if home button is clicked
      //saves song position and calls menu.html
      case 0:
        localStorage.setItem(SOUND_CURRENT_TIME,sound.seek());
        window.location.href="menu.html";
        break;
      //if pencil icon is clicked
      //chances view
      case 1:
        view.showBack();
        break;
      //if user presses enter-button
      default:
        //if entered username is the same as current name, check for new password
        if(view.getName()===JSON.parse(localStorage.getItem(CURRENT_USER)).id){
          checkPassword();
        }else{
          //if input for new username is different than current username
          //adapter should search for entered username
          adapter.searchForData(view.getName());
        }
    }
  }

  function onShowError(message){
    view.setNotification(message);
  }

  function onGetData(data){
    var name=view.getName();
    //if user exist show notification
    if(data){
      view.setNotification(USER_EXIST);
    }else{
      //if not, update unique key in database,
      //update displayName in Firebase Authentification and change username on display
      //afterwards check for password
      adapter.updateUsername(JSON.parse(localStorage.getItem(CURRENT_USER)),name);
      auth.updateUser(name);
      view.updateData(name);
      checkPassword();
    }
  }

  function checkPassword(){
    var passwords=view.getPassword();
    //if user entered new password
    if(passwords[0].length!==0 &&passwords[1]!==0){
      //if passwords are not similiar
      if(passwords[1]!==passwords[0]){
        view.setNotification(PASSWORDS_NOT_SIMILIAR);
      }else{
        //password should at least have six characters
        if(passwords[0].length<PASS_MIN_LENGTH){
          view.setNotification(PASSWORD_TOO_SHORT);
        }else{
          // if everthing is fullfilled, change password and show front view
          auth.updatePassword(passwords[0]);
          view.showFront();
        }
      }
    //if user didn´t entered new password
    }else{
      view.showFront();
    }
  }

  //method will be called if user is logged in
  //important informations like username and email will be sent to view to show them on the display
  function onLoggedIn(data){
    view.setCurrentData(data.email,data.displayName);
  }

  function init() {
    initFirebase();
    initAuthentification();
    initDatabaseAdapter();
    initView();
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

  //view shows informations and reads from inputs
  function initView(){
    var email =document.querySelector(".currentMailInput"),
      currentName=document.querySelector(".currentNameInput"),
      front=document.querySelector(".userData"),
      back=document.querySelector(".changeUserData"),
      changeCurrentName=document.querySelector(".changeUsername"),
      inputName=document.querySelector(".changeUsername"),
      inputPass=document.querySelector(".changePassword"),
      inputRepeatPass=document.querySelector(".changeRepeatPassword"),
      notification=document.querySelector(".changeDataNotification");
    view=UserData.View(email, currentName,front,back,changeCurrentName,inputName,inputPass,inputRepeatPass,notification);
  }

  function initDatabaseAdapter(){
    adapter=DatabaseAdapter();
    adapter.setOnDataListener(onGetData);
  }

  // init Firebase Authentification
  function initAuthentification(){
    auth=FirebaseAuthentification();
    auth.init();
    auth.setOnLoggedInListener(onLoggedIn);
    auth.setOnErrorListener(onShowError);
  }

  // Initializes Firebase
  function initFirebase(){
    InitializeFirebase().init();
  }

  function initController(){
    var home=document.querySelector(".home"),
      change=document.querySelector(".change"),
      enter=document.querySelector(".enterChange");
    controller=UserData.Controller(home,change,enter);
    controller.init();
    controller.setOnButtonsClickedListener(onButtonClicked);
  }

  that.init = init;
  return that;
}());
