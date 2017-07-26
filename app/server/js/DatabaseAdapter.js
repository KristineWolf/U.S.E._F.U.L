/* eslint-env browser */

//reads and writes data from "users", "objects" and "sectors" node
var DatabaseAdapter = function(firebase) {
  "use strict";

  var that = {},
    sendObject,
    sendSector;
    
  //hands over all static objects of demanded sector to a callback method together with sector´s unique key
  function getSector(sectorId){
    firebase.database().ref("sectors/"+ sectorId).on("value",function(snapshot){
      sendSector(snapshot.val(),sectorId);
    });
  }

  //hands over demanded object to a callback method together with object´s unique key
  function getObject(objectId){
    firebase.database().ref("objects/"+objectId).on("value",function(snapshot){
      sendObject(snapshot.val(),objectId);
    });
  }

  //updates users x,y positions, his highscore and his sector
  function updateUser(update) {
    firebase.database().ref("users/"+update.name).update({x: update.x,
      y:update.y,highscore:update.highscore, sector:update.sector,});
  }

  function setOnSectorListener(listener){
    sendSector=listener;
  }

  function setOnObjectListener(listener){
    sendObject=listener;
  }

  that.setOnSectorListener=setOnSectorListener;
  that.getObject=getObject;
  that.setOnObjectListener=setOnObjectListener;
  that.getSector=getSector;
  that.updateUser=updateUser;
  return that;
};

exports.DatabaseAdapter = DatabaseAdapter;