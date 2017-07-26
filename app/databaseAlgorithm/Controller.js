var Database = Database||{};
Database.Controller=function(button){
  "use strict";
  var that={},
    buttonClicked;

  function init(){
    button.addEventListener("click",function(){buttonClicked();});
  }

  function setOnButtonClickedListener(listener){
    buttonClicked=listener;
  }

  that.setOnButtonClickedListener=setOnButtonClickedListener;
  that.init=init;
  return that;
};
