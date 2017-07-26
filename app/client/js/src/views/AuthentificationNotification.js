/* eslint-env browser */

/*
 * presents messages on the display to inform user about his mistakes, whatt he has to change
 * and what is happening like gettin a verification email
 */
var LogIn = LogIn|| {};
LogIn.Notification = function(notification){
  "use strict";
  var that={};

  const CHOOSE_USER="Pick a username!",
    USER_EXIST="Username already exist!",
    EMAIL="We sent you an email to verify your account. <br> If you haven´t gotten one, just log in.";

    //shows message which was handed over
  function showMessageInNotification(message){
    notification.classList.remove("hidden");
    notification.innerHTML=message;
  }

  //informs user that he hadn´t entered an username
  function pickAnUsername(){
    notification.classList.remove("hidden");
    notification.innerHTML=CHOOSE_USER;
  }

  //informs user that his entered username already exist
  function userExist(){
    notification.classList.remove("hidden");
    notification.innerHTML=USER_EXIST;
  }

  //informs user that an email to verify his account was sented
  function emailSent(){
    notification.classList.remove("hidden");
    notification.innerHTML=EMAIL;
  }

  that.emailSent=emailSent;
  that.userExist=userExist;
  that.pickAnUsername=pickAnUsername;
  that.showMessageInNotification=showMessageInNotification;
  return that;
};
