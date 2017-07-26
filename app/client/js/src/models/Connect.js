var Useful = Useful || {};
Useful.Client = function () {
  "use strict";
  var socket = io("server.nopunkgames.space:8000"),
    that = {},
    newStaticCallback,
    newDynamicCallback,
    playerMovedCallback,
    playerRemovedCallback,
    clearViewCallback,
    explosionCallback,
    cooldownRocket = true;

  socket.on("connect", onSocketConnected);
  socket.on("new player", onNewPlayer);
  socket.on("move player", onMovedPlayer);
  socket.on("new static", onNewStatic);
  socket.on("new dynamic", onNewDynamic);
  socket.on("remove player", onRemovedPlayer);
  socket.on("remove enemy", onRemovedEnemy);
  socket.on("remove rocket", onRemovedPlayer);
  socket.on("ship hit", onShipHit);
  socket.on("pos update", onPosUpdate);
  socket.on("clear view", onClearView);

  // When the Socket has established a connection, we will send the server the needed data.
  function onSocketConnected() {
    var json = JSON.parse(localStorage.currentUser);
    socket.emit("new player",
      {
        "name": json.id,
        "type": "ship",
        "player": true,
        "shipImage": "shuttle",
        //"rocketImage" : "Mark1",
        "laserImage": "laser",
        "life": 1000,
        "score": json.highscore,
        "x": json.x,
        "y": json.y,
        "vx": 0.0,
        "vy": 0.0,
        "sec": json.sector,
      });
  }

  function onNewPlayer(data) {
    data.player = data.id === socket.id;
    onNewDynamic(data);
  }

  function onNewStatic(data) {
    newStaticCallback(data);
  }

  function onNewDynamic(data) {
    newDynamicCallback(data);
  }

  function onMovedPlayer(data) {
    newDynamicCallback(data);
  }

  function onRemovedPlayer(data) {
    playerRemovedCallback(data);
  }

  function onRemovedEnemy(data) {
    playerRemovedCallback(data);
    explosionCallback(data.x, data.y);
  }

  function onShipHit(data) {
    explosionCallback(data.x, data.y);
  }

  function onPosUpdate(data) {
    var dataLength = data.length;
    // To make the player-centered drawing easier, we make sure that only the own player is marked as true
    for (let i = 0; i < dataLength; i++) {
      if (data[i].id === socket.id) {
        data[i].player = true;
      }
      newDynamicCallback(data[i]);
    }
  }

  function onClearView(data) {
    clearViewCallback(data);
  }

  /******************************************************************/

  function accelerate(data) {
    socket.emit("accelerate", data);
  }

  function fullStop(data) {
    socket.emit("fullstop", data);
  }

  function fireRocket(data) {
    if (cooldownRocket) {
      socket.emit("fire rocket", data);
      cooldownRocket = false;
      setTimeout(function () {
        cooldownRocket = true;
      }, 2500);
      return true;
    }
    return false;
  }

// Data Format: {secX: 1, secY: 1}
  function changeSector(data) {
    socket.emit("change sector", data);
  }

  /******************************************************************/
  function setOnStaticReceivedCallback(callback) {
    newStaticCallback = callback;
  }

  function setOnDynamicReceivedCallback(callback) {
    newDynamicCallback = callback;
  }

  function setOnPlayerMovedCallback(callback) {
    playerMovedCallback = callback;
  }

  function setOnPlayerRemovedCallback(callback) {
    playerRemovedCallback = callback;
  }

  function setOnClearViewCallback(callback) {
    clearViewCallback = callback;
  }

  function setOnExplosionCallback(callback) {
    explosionCallback = callback;
  }

  /******************************************************************/
  that.accelerate = accelerate;
  that.fullStop = fullStop;
  that.fireRocket = fireRocket;
  that.changeSector = changeSector;
  that.setOnStaticRecievedCallback = setOnStaticReceivedCallback;
  that.setOnDynamicRecievedCallback = setOnDynamicReceivedCallback;
  that.setOnPlayerMovedCallback = setOnPlayerMovedCallback;
  that.setOnPlayerRemovedCallback = setOnPlayerRemovedCallback;
  that.setOnClearViewCallback = setOnClearViewCallback;
  that.setOnExplosionCallback = setOnExplosionCallback;
  return that;
};