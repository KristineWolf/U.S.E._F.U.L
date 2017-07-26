/* eslint-env browser */
/* global InitializeFirebase*/
/* global DatabaseAdapter*/
/* global FirebaseAuthentification*/

var LogIn = (function() {
  "use strict";

  var that = {},
    controller,
    input,
    notificationView,
    view,
    adapter,
    username,
    auth;

  const SIGN_UP_OPTION=2;

  function onButtonsClicked(clickedButton){
    var data;
    switch (clickedButton) {
      //if user wants to log in and presses the button
      case 0:
        data= input.readLogInInput();
        //auth checks for email with password
        auth.logIn(data[0],data[1]);
        break;
      //if user wants to sign up and presses the button
      case 1:
        //if user enters no username, he will be informed about entering an username
        username= input.readUsername();
        if(username===""){
          notificationView.pickAnUsername();
        }else{
          //looking for existence of entered username
          adapter.searchForData(username);
        }
        break;
      //if user forgot his password and presses enter to get an reset-password email
      default:
        data= input.readResetInput();
        auth.sendPassResetEmail(data);
    }
  }

  //if user logged in and verified his email, he will automatically be sented to menu.html
  function onLoggedIn(data){
    if(data.emailVerified){
      window.location.href = "./html/menu.html";
    }else{
      //if user still hasn´t verified his email, he will get an new email to verifiy his account
      auth.verifyEmail();
    }
  }

  //if verification email was sented, user will get a notification on success
  function onVerificationEmailSent(displayName){
    notificationView.emailSent();
    //if the current user profil displayName is still null, it will be updated to the entered username before
    if(!displayName){
      auth.updateUser(username);
    }else{
      //otherwise user will be logged out
      auth.logOut();
    }
  }

  //if something is wrong with the input, user will be informed about it
  function onError(message){
    notificationView.showMessageInNotification(message);
  }

  //returned data from database
  function onGetData(data){
    var i;
    //if username already exist, user will be informed to choose an other one
    if(data){
      notificationView.userExist();
    }else{
      //if username doesn´t exist, new account in Firebase Authentification
      //and new user in Firebase Realtime database will be created
      i=input.readSignUpInput();
      auth.signUp(i[0],i[1],username);
      adapter.addNewUser(username);
    }
  }

  //callback method if user pressed specific buttons or labels to chance the view
  function onChanceView(clickedText){
    switch (clickedText) {
      //if user presses the "log in" navigation button
      case 0:
        view.logInView();
        break;
      //if user presses the "sign up" navigation button
      case 1:
        view.signUpView();
        break;
      //if user presses on "Forgot Password?"
      //listeners for button and link will be initialized
      case SIGN_UP_OPTION:
        view.showBack();
        controller.initResetPass();
        break;
      //if user presses on "Go back"
      //listener for button an link will be removed
      default:
        view.showFront();
        controller.removeResetPass();
    }
  }

  function init() {
    initFirebase();
    initController();
    initInputReader();
    initAuthentification();
    initDatabaseAdapter();
    initNotification();
    initView();
  }

  //reads value of inputs
  function initInputReader(){
    var logInEmail= document.querySelector(".logInEmail"),
      logInPassword=document.querySelector(".logInPassword"),
      signUpEmail=document.querySelector(".signUpEmail"),
      signUpPassword=document.querySelector(".signUpPassword"),
      username=document.querySelector(".userName"),
      emailToResetPass=document.querySelector(".emailToResetPass");
    input=LogIn.InputReader(logInEmail,logInPassword,emailToResetPass,signUpEmail,signUpPassword,username);
  }

  //changes display view
  function initView(){
    var front = document.querySelector(".registration"),
      back = document.querySelector(".resetPassword"),
      logIn=document.querySelector(".logIn"),
      signUp=document.querySelector(".signUp"),
      logInBox=document.querySelector(".logInContent"),
      signUpBox=document.querySelector(".signUpContent");
    view = LogIn.View(front,back,logIn,signUp,logInBox,signUpBox);
  }

  //notification pops up if user enters something wrong or username already exist
  function initNotification(){
    var notification=document.querySelector(".logInNotification");
    notificationView=LogIn.Notification (notification);
  }

  function initDatabaseAdapter(){
    adapter=DatabaseAdapter();
    adapter.setOnDataListener(onGetData);
  }

  function initFirebase(){
    InitializeFirebase().init();
  }

  //user can only log in if his email is verified
  function initAuthentification(){
    auth= FirebaseAuthentification();
    auth.init();
    auth.setOnLoggedInListener(onLoggedIn);
    auth.setOnErrorListener(onError);
    auth.setOnVerificationEmailSent(onVerificationEmailSent);
  }

  function initController(){
    var logIn=document.querySelector(".logIn"),
      signUp=document.querySelector(".signUp"),
      resetPassword=document.querySelector(".forgotPass"),
      enterEmail=document.querySelector(".enterEmail"),
      backToRegistration=document.querySelector(".back"),
      logInBtn=document.querySelector(".logInButton"),
      signUpBtn=document.querySelector(".signUpButton");
    controller= LogIn.LogController(logIn,signUp,resetPassword,enterEmail,backToRegistration,logInBtn,signUpBtn);
    controller.init();
    controller.setOnButtonsListener(onButtonsClicked);
    controller.setOnChanceViewListener(onChanceView);
  }

  that.init = init;
  return that;
}());
