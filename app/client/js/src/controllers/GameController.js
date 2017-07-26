var Useful = Useful || {};
Useful.GameController = function () {
  var that = {},
    mouseClickedCallback,
    keyPressedCallback,
    mouseWheelCallback,
    mouseMovedCallback;

  /******************************************************************/

  function init(window)
  {
    window.addEventListener("click", onMouseClicked);
    window.addEventListener("keydown", onKeyPressed);
    window.addEventListener("mousemove", onMouseMoved);
    window.addEventListener("wheel", onMouseWheel);
  }

  /******************************************************************/

  function onMouseClicked()
  {
    mouseClickedCallback();
  }

  function onMouseWheel(event)
  {
    if (event.deltaY<0) //Zoom In
    {
      mouseWheelCallback(2.0);
    }

    if (event.deltaY>0) //Zoom Out
    {
      mouseWheelCallback(0.5);
    }
  }

  function onKeyPressed(event)
  {
    keyPressedCallback(event.key);
  }

  function onMouseMoved(event)
  {
    mouseMovedCallback(event.clientX, event.clientY);
  }

  /******************************************************************/

  function setOnMouseClickedCallback(callback)
  {
    mouseClickedCallback = callback;
  }

  function setOnWheelCallback(callback)
  {
    mouseWheelCallback = callback;
  }

  function setOnKeyPressedCallback(callback)
  {
    keyPressedCallback = callback;
  }

  function setOnMouseMovedCallback(callback)
  {
    mouseMovedCallback = callback;
  }

  /******************************************************************/

  that.setOnWheelCallback = setOnWheelCallback;
  that.setOnMouseMovedCallback = setOnMouseMovedCallback;
  that.setOnMouseClickedCallback = setOnMouseClickedCallback;
  that.setOnKeyPressedCallback = setOnKeyPressedCallback;
  that.init = init;
  return that;
};
