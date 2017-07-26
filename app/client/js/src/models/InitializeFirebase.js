/* eslint-env browser */
/* exported InitializeFirebase*/
/* global firebase */

var InitializeFirebase = function() {
  "use strict";

  var that = {};

 // Initialize Firebase
  function init() {
    const config = {
      apiKey: "AIzaSyDjQJ_h7Qu6-3FJjN5TfOrI3Isx07J8EJs",
      authDomain: "use-ful.firebaseapp.com",
      databaseURL: "https://use-ful.firebaseio.com",
      storageBucket: "use-ful.appspot.com",
      messagingSenderId: "778837795685",
    };
    firebase.initializeApp(config);
  }

  that.init=init;
  return that;
};
