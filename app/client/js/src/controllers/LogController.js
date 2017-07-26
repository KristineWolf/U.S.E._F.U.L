/* eslint-env browser */

var LogIn = LogIn|| {};
LogIn.LogController = function(logIn,signUp,resetPassword, enterEmail, backToRegistration,logInBtn,signUpBtn){
  "use strict";
  var that={},
    chanceView,
    readInput;

  const RESET_PASSWORD=2,
    ENTER_EMAIL_BUTTON=2,
    BACK_REGISTRATION=3;

  function init(){
    //to listen when user wants to see the log in view
    logIn.addEventListener("click", function(){chanceView(0);});
    //to listen when user wants to see the sign up view
    signUp.addEventListener("click",function(){chanceView(1);});
    //to listen when user wants to chance his password
    resetPassword.addEventListener("click",function(){chanceView(RESET_PASSWORD);});
    //to listen when log in input should be readed
    logInBtn.addEventListener("click",function(){readInput(0);});
    //to listen when sign up input should be readed
    signUpBtn.addEventListener("click",function(){readInput(1);});
  }

  function initResetPass(){
    //to listen when user´s entered email to reset his password should be readed
    enterEmail.addEventListener("click",function(){readInput(ENTER_EMAIL_BUTTON);});
    //to listen if user wants to go back
    backToRegistration.addEventListener("click",function(){chanceView(BACK_REGISTRATION);});
  }

  //removes all listeners for the reseting password view
  function removeResetPass(){
    enterEmail.removeEventListener("click",function(){readInput(ENTER_EMAIL_BUTTON);});
    backToRegistration.removeEventListener("click",function(){chanceView(BACK_REGISTRATION);});
  }

  function setOnButtonsListener(listener){
    //callback method to start reading the input
    readInput=listener;
  }

  function setOnChanceViewListener(listener){
    //callback method to change display view
    chanceView=listener;
  }

  that.removeResetPass=removeResetPass;
  that.setOnChanceViewListener=setOnChanceViewListener;
  that.initResetPass=initResetPass;
  that.setOnButtonsListener=setOnButtonsListener;
  that.init=init;
  return that;
};
