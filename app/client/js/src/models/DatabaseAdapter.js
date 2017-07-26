/* eslint-env browser */
/* exported DatabaseAdapter*/
/* global firebase*/

// this adapter reads and writes only data from the "users"-node
var DatabaseAdapter = function() {
  "use strict";

  var that = {},
    sendData;

  const MIN_POS=10,
    MAX_POS= 1000;

  //hands over existing users to a callback method ordered by their highscore value
  function getHighscore(){
    firebase.database().ref().child("users").orderByChild("highscore").on("child_added",function(snapshot){
      sendData(snapshot.val());
    });
  }

  //searches for an unique key in "users"-node and hands over data to a callback method
  function searchForData(id){
    firebase.database().ref("users/"+ id).once("value").then(function(snapshot){
      sendData(snapshot.val());
    });
  }

  //updates user only by his unique key
  function updateUsername(user, name){
    firebase.database().ref("users/"+user.id).remove();
    user.id=name;
    firebase.database().ref("users/"+name).set(user);
  }

  //adds new user to database
  function addNewUser(name){
    var user={
      id:name,
      //new user always starts in this sector
      sector:"000:000",
      highscore:0,
      //user has random position
      x: randomInt(MIN_POS,MAX_POS),
      y:randomInt(MIN_POS,MAX_POS),
    };
    firebase.database().ref("users/"+name).set(user);
  }

  function randomInt(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
  }

  function setOnDataListener(listener){
    sendData=listener;
  }

  that.updateUsername=updateUsername;
  that.getHighscore=getHighscore;
  that.searchForData=searchForData;
  that.setOnDataListener=setOnDataListener;
  that.addNewUser=addNewUser;
  return that;
};
