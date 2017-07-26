/* eslint-env browser */

/*
 * reads values of inputs and returns them back
 */
var LogIn = LogIn||{};
LogIn.InputReader=function(logInEmail,logInPassword, emailToResetPass,signUpEmail,signUpPassword,username){
  "use strict";
  var that={};

  //returns log in input
  function readLogInInput(){
    return [logInEmail.value, logInPassword.value,];
  }

  //returns entered username
  function readUsername(){
    return username.value;
  }

  //returns email and password of sign up
  function readSignUpInput(){
    return[signUpEmail.value,signUpPassword.value,];
  }

  //returns email to get the email to reset password
  function readResetInput(){
    return emailToResetPass.value;
  }

  that.readUsername=readUsername;
  that.readSignUpInput=readSignUpInput;
  that.readResetInput=readResetInput;
  that.readLogInInput=readLogInInput;
  return that;
};
