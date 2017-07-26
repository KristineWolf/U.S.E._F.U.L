/* eslint-env browser */

var Highscore = Highscore|| {};
Highscore.ListView = function(list){
  "use strict";
  var that={};

  //creates a li element with two spans
  function createList(data){
    var li =document.createElement("li"),
      name=document.createElement("span"),
      score=document.createElement("span");
    score.classList.add("score");
    name.innerHTML=data.id;
    score.innerHTML=data.highscore;
    li.appendChild(score);
    li.appendChild(name);
    list.appendChild(li);

    //to get the right order, formed element must be the first
    list.insertBefore(li,list.firstChild);
  }

  that.createList=createList;
  return that;
};
