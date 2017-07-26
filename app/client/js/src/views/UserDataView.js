/* eslint-env browser */

//shows information on display, changes view and returns input
var UserData=UserData||{};
UserData.View=function(email,currentName,front,back,changeCurrentName,inputName,inputPass,inputRepeatPass, notification){
  "use strict";
  var that={};

  //shows all important informations like username and email
  function setCurrentData(mail,name){
    email.innerHTML=mail;
    currentName.innerHTML=name;
    changeCurrentName.value=name;
  }

  //updates username after successful change
  function updateData(name){
    currentName.innerHTML=name;
    changeCurrentName.value=name;
  }

  //animates divs to change the view
  function showBack(){
    front.style.WebkitTransform="rotateY(-180deg)";
    back.style.WebkitTransform="rotateY(0deg)";
  }

  //animates divs to change the view
  function showFront(){
    front.style.WebkitTransform="rotateY(0deg)";
    back.style.WebkitTransform="rotateY(180deg)";
  }

  //reads username input und gives it back
  function getName(){
    return inputName.value;
  }

  //reads first password input und gives it back
  function getPassword(){
    return [inputPass.value,inputRepeatPass.value,];
  }

  //reads second password input und gives it back
  function setNotification(message){
    notification.innerHTML=message;
  }

  that.updateData=updateData;
  that.setNotification=setNotification;
  that.getPassword=getPassword;
  that.getName=getName;
  that.showFront=showFront;
  that.showBack=showBack;
  that.setCurrentData=setCurrentData;
  return that;
};
