/* eslint-env browser */

/*
 * chances the display view
 */
var LogIn = LogIn|| {};
LogIn.View = function(front,back,logIn,signUp,logInBox,signUpBox){
  "use strict";
  var that={};

  //hides sign up view and shows log in view
  function logInView(){
    logIn.classList.add("active");
    signUp.classList.remove("active");
    logInBox.classList.remove("hidden");
    signUpBox.classList.add("hidden");
  }

  //hides log in view and shows sign up view
  function signUpView(){
    logIn.classList.remove("active");
    signUp.classList.add("active");
    logInBox.classList.add("hidden");
    signUpBox.classList.remove("hidden");
  }

  //shows view to enter an email to reset password
  function showBack(){
    front.style.WebkitTransform="rotateY(-180deg)";
    back.style.WebkitTransform="rotateY(0deg)";

  }

  //show registration view with log in
  function showFront(){
    front.style.WebkitTransform="rotateY(0deg)";
    back.style.WebkitTransform="rotateY(180deg)";
  }

  that.signUpView=signUpView;
  that.logInView=logInView;
  that.showBack=showBack;
  that.showFront=showFront;
  return that;
};
