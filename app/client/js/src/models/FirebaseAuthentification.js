/* eslint-env browser */
/* exported FirebaseAuthentification*/
/* global firebase*/
/*eslint no-console: "error"*/

var FirebaseAuthentification = function() {
  "use strict";

  var that = {},
    loggedIn,
    emailSent,
    showError;

  const WRONG_PASS = "auth/wrong-password",
    WRONG_PASS_M="Wrong password!",
    USER_NOT_FOUND = "auth/user-not-found",
    USER_NOT_FOUND_M="User does not exist!",
    EMAIL_IN_USE ="auth/email-already-in-use",
    EMAIL_IN_USE_M="E-mail is already in use!",
    INVALID_EMAIL="auth/invalid-email",
    INVALID_EMAIL_M="Wrong e-mail format!",
    WEAK_PASSWORD ="auth/weak-password",
    WEAK_PASSWORD_M="Your password should at least have six characters!",
    EMAIL_SEND_M="We sent you the reset confirmation.<br>Please check your email.",
    RECENT_LOGIN="auth/requires-recent-login",
    PASS_CHANGE_SUCCESSFUL="Password changed!",
    RECENT_LOGIN_M="We could not change your password! <br>Your last sign-in time does not meet our security threshold.<br>To change your password please sign in again.";

  //to log in user has to enter his email and password
  function logIn(email,password){
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(e) {
      switch (e.code) {
        //sends notification if password is wrong
        case WRONG_PASS:
          showError(WRONG_PASS_M);
          break;
        //sends notification if email doesn´t exist
        case USER_NOT_FOUND:
          showError(USER_NOT_FOUND_M);
          break;
        //sends notification if email format is not right
        case INVALID_EMAIL:
          showError(INVALID_EMAIL_M);
          break;
        default:
      }
    });
  }

  //if a user wants to join use-ful, he has to sign up with email, password and an unique username
  function signUp(email,password,name){
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
      //if signUp was successful, update displayName to username
      updateUser(name);
    }).catch(function(e) {
      switch (e.code) {
        //sends notification if email is already in use
        case EMAIL_IN_USE:
          showError(EMAIL_IN_USE_M);
          break;
        //sends notification if email format is not right
        case INVALID_EMAIL:
          showError(INVALID_EMAIL_M);
          break;
        //sends notification if the length of password is lower than six
        case WEAK_PASSWORD:
          showError(WEAK_PASSWORD_M);
          break;
        default:
      }
    });
  }

  //sends email to email address to verify this address
  function verifyEmail(){
    var user = firebase.auth().currentUser;
    user.sendEmailVerification().then(function() {
      emailSent(user);
    });
  }

  //sends Email to entered email-address if user forgot his password to log in
  function sendPassResetEmail(email){
    firebase.auth().sendPasswordResetEmail(email).then(function() {
      showError(EMAIL_SEND_M);
    }).catch(function(e) {
      switch (e.code) {
        //sends notification if user´s entered email doesn´t exist
        case USER_NOT_FOUND:
          showError(USER_NOT_FOUND_M);
          break;
        //send notification if user´s entered email format is not right
        case INVALID_EMAIL:
          showError(INVALID_EMAIL_M);
          break;
        default:
      }
    });
  }

  function logOut(){
    firebase.auth().signOut();
  }

  //updates password if user wants to change it in userdata.html
  function updatePassword(password){
    firebase.auth().currentUser.updatePassword(password).then(function() {
      showError(PASS_CHANGE_SUCCESSFUL);
    }, function(e) {
      //if user´s sign in time doesn´t fit with firebase security threshold, user has to sign in again
      if(e.code===RECENT_LOGIN){
        showError(RECENT_LOGIN_M);
      }
    });
  }

  //updates displayName of user´s profil, if user wants to chance his username
  function updateUser(userName){
    var user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: userName,
    });
  }

  //start listening is user is logged in or not
  function init(){
    authentificationListener();
  }

  function setOnLoggedInListener(listener){
    loggedIn=listener;
  }

  function setOnErrorListener(listener){
    showError=listener;
  }

  function setOnVerificationEmailSent(listener){
    emailSent=listener;
  }

  function authentificationListener(){
    //if user is logged in, callback method will get user´s profil as parameter
    firebase.auth().onAuthStateChanged(firebaseUser=>{
      if(firebaseUser){
        loggedIn(firebaseUser);
      }
    });
  }

  that.updatePassword=updatePassword;
  that.setOnVerificationEmailSent=setOnVerificationEmailSent;
  that.verifyEmail=verifyEmail;
  that.sendPassResetEmail=sendPassResetEmail;
  that.updateUser=updateUser;
  that.setOnErrorListener=setOnErrorListener;
  that.setOnLoggedInListener=setOnLoggedInListener;
  that.logOut=logOut;
  that.signUp=signUp;
  that.logIn=logIn;
  that.init=init;
  return that;
};
