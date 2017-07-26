/* global Howl*/

var Useful = (function () {
  var that = {},
    gameController,
    gameView,
    client,
    explosion,
    menuState = false,
    shoot;

  const SOUND_VOLUME = "soundVolume";
  /******************************************************************/

  function init() {
    initGameController();
    initGameView();
    initAudio();
  }

  //plays song and sounds with saved volume value in localStorage
  function initAudio() {
    var v,
      battle;
    //checks for volume value in localStorage
    if (localStorage.getItem(SOUND_VOLUME)) {
      v = localStorage.getItem(SOUND_VOLUME);
    } else {
      v = 1;
    }
    //background sound
    battle = new Howl({
      src: ["../res/Battle.wav",],
      volume: v,
      loop: true,
    });
    //sound for firing rocket
    shoot = new Howl({
      src: ["../res/shoot.mp3",],
      volume: v,
    });
    //sound for ship explosion
    explosion = new Howl({
      src: ["../res/explosion.mp3",],
      volume: v,
    });
    battle.play();
  }

  function initGameController() {
    gameController = Useful.GameController();
    gameController.init(window);
    gameController.setOnMouseClickedCallback(mouseClicked);
    gameController.setOnKeyPressedCallback(keyPressed);
    gameController.setOnMouseMovedCallback(mouseMoved);
    gameController.setOnWheelCallback(wheelMoved);
  }

  function initGameView() {
    gameView = Useful.GameView();
    gameView.setOnGameViewStartedCallback(gameViewStarted);
  }

  function initClient() {
    client = Useful.Client();
    client.setOnStaticRecievedCallback(addStaticObject);
    client.setOnDynamicRecievedCallback(addDynamicObject);
    client.setOnPlayerMovedCallback(playerMoved);
    client.setOnPlayerRemovedCallback(playerRemoved);
    client.setOnClearViewCallback(clearView);
    client.setOnExplosionCallback(drawExplosion);
  }

  function gameViewStarted() {
    initClient();
  }

  function addStaticObject(staticObject) {
    gameView.addStaticObject(staticObject);
  }

  function addDynamicObject(dynamicObject) {
    gameView.addDynamicObject(dynamicObject);
  }

  function playerMoved(data) {
    console.log(data); // Is fired when another player has clicked the mouse.
    // Format is:
    // data.vx = velocity in x
    // data.vy = velocity in y
    // data.id = id of the ship that has a different velocity now.
  }

  function playerRemoved(data) {
    gameView.removeObjectByName(data.name);
  }

  function clearView(data) {
    gameView.clearObjectLayer();
  }

  function drawExplosion(x, y) {
    gameView.explode(x, y);
    explosion.play();
  }

  /**********************************************************************/

  function keyPressed(key) {
    var sector = gameView.getPlayerSector();

    if (key === "s") {
      gameView.fullStop();
      client.fullStop();
    }

    if (key === "ArrowUp" && menuState === true) {
      if (sector.secY < 100) {
        gameView.toggleWarpMenu();
        menuState = false;
        client.changeSector({secX: sector.secX, secY: sector.secY+1,});
      }
    }

    if (key === "ArrowDown" && menuState === true) {
      if (gameView.getPlayerSector().secY > 0) {
        gameView.toggleWarpMenu();
        menuState = false;
        client.changeSector({secX: sector.secX, secY: sector.secY-1,});
      }
    }

    if (key === "ArrowLeft" && menuState === true) {
      if (gameView.getPlayerSector().secX > 0) {
        gameView.toggleWarpMenu();
        menuState = false;
        client.changeSector({secX: sector.secX-1, secY: sector.secY,});
      }
    }

    if (key === "ArrowRight" && menuState === true) {
      if (gameView.getPlayerSector().secX < 100) {
        gameView.toggleWarpMenu();
        menuState = false;
        client.changeSector({secX: sector.secX+1, secY: sector.secY,});
      }
    }

    if (key === "1") {
      let x1 = gameView.getPlayerPosition().x,
        y1 = gameView.getPlayerPosition().y,
        vx1 = gameView.getPlayerSpeed().vx + gameView.getPlayerRotation().x * 30,
        vy1 = gameView.getPlayerSpeed().vy + gameView.getPlayerRotation().y * 30,
        data = {x: x1, y: y1, vx: vx1, vy: vy1,};
      if (client.fireRocket(data)) {shoot.play();}
    }

    if (key === "m") {
      menuState = gameView.toggleWarpMenu();

    }
  }

  function mouseClicked() {
    gameView.accelerate();
    client.accelerate(gameView.getPlayerSpeed());
  }

  function wheelMoved(value) {
    gameView.zoom(value);
  }

  function mouseMoved(clientX, clientY) {
    gameView.steer(clientX, clientY);
  }

  that.init = init;
  return that;
}());
