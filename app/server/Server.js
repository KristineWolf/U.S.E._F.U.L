var io = require("socket.io")({
    transports: ["websocket"],
  }),
  uuidV1 = require("uuid/v1"),
  firebase = require("firebase-admin"),
  serviceAccount = require("./use-ful-firebase-adminsdk.json"),
  DatabaseAdapter = require("./js/DatabaseAdapter"),
  database,
  Player = require("./js/Player.js"),
  SectorInstance = require("./js/SectorInstance.js"),
  port = 8000,
  socket,
  updateCountdown = 0,
  openSectors = [],
  verbose = true; // If verbose mode is active, it will print a lot of server messages.

function init() {
  "use strict";
  socket = io.listen(port);
  if (verbose) {
    console.log("Server listening on " + port);
  }
  setEventHandlers();
  initDatabase();
  loop();
}

function initDatabase() {
  "use strict";
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://use-ful.firebaseio.com",
  });
  database = new DatabaseAdapter.DatabaseAdapter(firebase);
  database.setOnSectorListener(onSector);
  database.setOnObjectListener(onObject);
}

function setEventHandlers() {
  "use strict";
  socket.sockets.on("connection", onSocketConnection);
}

// Sets the event handlers.
function onSocketConnection(client) {
  "use strict";
  if (verbose) {
    console.log("Player has connected: " + client.id);
  }
  client.on("disconnect", onClientDisconnect);
  client.on("new player", onNewPlayer);
  client.on("accelerate", onAcceleratingPlayer);
  client.on("fire rocket", onFireRocketPlayer);
  client.on("fullstop", onFullstopPlayer);
  client.on("change sector", onChangeSectorPlayer);
}
/******************************************************************/
// Database communication functions
function onSector(data) {
  "use strict";
  var planets = Object.keys(data),
    planetsLength = planets.length;
  for (let i = 0; i < planetsLength; i++) {
    database.getObject(data[planets[i]]["objects"]);
  }
}

function onObject(data, id) {
  "use strict";
  id = id.replace("planet", "");
  id = id.replace("sun", "");
  let secX = parseInt(id.substr(1, 3)),
    secY = parseInt(id.substr(5, 7)),
    openSectorsLength = openSectors.length;
  for (let i = 0; i < openSectorsLength; i++) {
    if (openSectors[i].secX === secX && openSectors[i].secY === secY) {
      openSectors[i].addStatic(data);
      io.in("sector_" + secX + "_" + secY).emit("new static", data);
    }
  }
}

/******************************************************************/
// Server functions
// Each time we remove a player, we check if the Sector is now empty to reduce the Physics loop load.
function clearSectorIfEmpty() {
  "use strict";
  for (let i = 0; i < openSectors.length; i++) {
    if (openSectors[i].playersArr.length === 0) {
      if (verbose) {
        console.log("Empty sector was found. Removing.");
      }
      openSectors.splice(i, 1);
    }
  }
}

// Returns an JSON Object containing the sector of the player and the index of this sectors player array.
function playerById(id) {
  "use strict";
  let i, j,
    openSectorsLength = openSectors.length;
  for (i = 0; i < openSectorsLength; i++) {
    let playersArrLength = openSectors[i].playersArr.length;
    for (j = 0; j < playersArrLength; j++) {
      if (openSectors[i].playersArr[j].id === id) {
        return {"sector": i, "index": j};
      }
    }
  }
  return null;
}

// Adds an enemy
function insertEnemy(secX, secY) {
  "use strict";
  var uuid = uuidV1(),
    enemy = { // We assign a name, because maybe we will add a name generator later when we have HUD that displays names
      "name": uuid,
      "id": uuid,
      "type": "ship",
      "player": false,
      "shipImage": "enemy",
      "life": 1000,
      "charge": 0,
      "x": randomInt(-50000, 50000),
      "y": randomInt(-50000, 50000),
      "vx": 0.0,
      "vy": 0.0,
      "secX": secX,
      "secY": secY,
    },
    openSectorsLength = openSectors.length;

  for (let i = 0; i < openSectorsLength; i++) {
    if (openSectors[i].secX === secX && openSectors[i].secY === secY) {
      openSectors[i].enemiesArr.push(enemy);
      if (verbose) {
        console.log("Enemy added.");
      }
      break;
    }
  }
}
/******************************************************************/
// Socket functions
// When a player disconnects, we have to remove him from his active sector and update his values on the database.
function onClientDisconnect() {
  "use strict";
  if (verbose) {
    console.log("Player has disconnected: " + this.id);
  }
// If the player was not found, we've got a problem.
  let playerToRemove = playerById(this.id),
    player = openSectors[playerToRemove.sector].playersArr.splice(playerToRemove.index, 1)[0];
  if (!playerToRemove) {
    if (verbose) {
      console.log("ERROR. Player not found: " + this.id);
    }
    return;
  }
  // We remove the player from the Sector's player array;

  // We save the player's data.
  database.updateUser({
    name: player.name, x: player.x,
    y: player.y, highscore: player.score, sector: pad(player.secX, 3) + ":" + pad(player.secY, 3),
  });
  // Broadcast removed player to connected socket clients
  this.broadcast.to("sector_" + openSectors[playerToRemove.sector].secX + "_" + openSectors[playerToRemove.sector].secY).emit("remove player", {
    id: this.id,
    name: player.name,
  });
  if (verbose) {
    console.log("Successfully removed.");
  }
// Lastly, check for empty sectors and remove them if needed.
  clearSectorIfEmpty();
}

// Whenever a new player joins the game...
function onNewPlayer(data) {
  "use strict";
  // ... we create a new Player from the incoming data...
  let index = data.sec.indexOf(":"),
    secX = parseInt(data.sec.substr(0, index)),
    secY = parseInt(data.sec.substr(index + 1)),
    newPlayer = new Player.Player(this.id,
      data.name,
      data.type,
      data.shipImage,
      data.laserImage,
      data.life,
      data.score,
      data.x,
      data.y,
      data.vx,
      data.vy,
      secX,
      secY),
    existingPlayer,
    staticObject,
    dynamicObject,
    found = false,
    numOpenSectors = openSectors.length;

  // ... and check if the client wants to join an existing sector.
  for (let i = 0; i < numOpenSectors; i++) {
    if (openSectors[i].secX === secX && openSectors[i].secY === secY) {
      if (verbose) {
        console.log("Sector was found. Adding player.");
      }
      // If the sector exists, the player joins a room that serves as the sector communication system.
      this.join("sector_" + openSectors[i].secX + "_" + openSectors[i].secY);
      // And all players are informed about the new player.
      io.in("sector_" + openSectors[i].secX + "_" + openSectors[i].secY).emit("new player", newPlayer);
      // likewise, the new player is informed about every already existing player in this sector...
      for (let j = 0; j < openSectors[i].playersArr.length; j++) {
        existingPlayer = openSectors[i].playersArr[j];
        this.emit("new player", existingPlayer);
      }
      // ... and every existing static Object in the Sector.
      for (let j = 0; j < openSectors[i].staticsArr.length; j++) {
        staticObject = openSectors[i].staticsArr[j];
        this.emit("new static", staticObject);
      }
      // ... and every non-Player dynamic Object.
      for (let j = 0; j < openSectors[i].enemiesArr.length; j++) {
        dynamicObject = openSectors[i].enemiesArr[j];
        this.emit("new dynamic", dynamicObject);
      }
      for (let j = 0; j < openSectors[i].rocketsArr.length; j++) {
        dynamicObject = openSectors[i].rocketsArr[j];
        this.emit("new dynamic", dynamicObject);
      }
      // Finally, we add the player to the sector.
      openSectors[i].addPlayer(newPlayer);
      found = true;
      break;
    }
  }
  // If the sector was not found, we create a new one.
  if (!found) {
    if (verbose) {
      console.log("Sector was not found. Creating " + secX + ":" + secY);
    }
    this.join("sector_" + secX + "_" + secY);
    io.in("sector_" + secX + "_" + secY).emit("new player", newPlayer);
    let newSector = new SectorInstance.SectorInstance(secX, secY, onShipDestroyed, onShipHit, onRocketDestroyed, onPlayerDestroyed, onEnemyFired),
      length = openSectors.push(newSector);
    newSector.addPlayer(newPlayer);

    // Then, we initialize the procedures to get the statics as stored in the database.
    database.getSector(data.sec);
    for (let i = 0; i < 5; i++) {
      insertEnemy(secX, secY);
    }

    // We also inform the player of every existing dynamic Object in the Sector.
    for (let j = 0; j < openSectors[length - 1].rocketsArr.length; j++) {
      dynamicObject = openSectors[length - 1].rocketsArr[j];
      this.emit("new dynamic", dynamicObject);
    }
    for (let j = 0; j < openSectors[length - 1].enemiesArr.length; j++) {
      dynamicObject = openSectors[length - 1].enemiesArr[j];
      this.emit("new dynamic", dynamicObject);
    }
  }
}

// If a player has moved, we will inform everyone in the relevant room about it.
function onAcceleratingPlayer(data) {
  "use strict";
  let playerToBeMoved = playerById(this.id);
  openSectors[playerToBeMoved.sector].playersArr[playerToBeMoved.index].vx = data.vx;
  openSectors[playerToBeMoved.sector].playersArr[playerToBeMoved.index].vy = data.vy;
  this.broadcast.to(Object.keys(this.rooms)[1]).emit("move player", (openSectors[playerToBeMoved.sector].playersArr[playerToBeMoved.index]));
}

// if  a player fired, we will add the rocket.
function onFireRocketPlayer(data) {
  "use strict";
  var playerPointer = playerById(this.id),
    sector = openSectors[playerPointer.sector],
    uuid = uuidV1(),
    newRocket = {
      "name": uuid,
      "id": uuid,
      "type": "ship",
      "shipImage": "rocket",
      "life": 500,
      "owner": this.id,
      "x": data.x,
      "y": data.y,
      "vx": data.vx,
      "vy": data.vy,
    };
  if (verbose) {
    console.log(this.id + " has fired a Rocket.");
  }
  sector.rocketsArr.push(newRocket);
  io.in("sector_" + sector.secX + "_" + sector.secY).emit("new dynamic", newRocket);
}

function onFullstopPlayer() {
  "use strict";
  let playerToBeMoved = playerById(this.id);
  openSectors[playerToBeMoved.sector].playersArr[playerToBeMoved.index].vx = 0;
  openSectors[playerToBeMoved.sector].playersArr[playerToBeMoved.index].vy = 0;
  this.broadcast.to(Object.keys(this.rooms)[1]).emit("move player", (openSectors[playerToBeMoved.sector].playersArr[playerToBeMoved.index]));

}

// A player wants to change the sector.
function onChangeSectorPlayer(data) {
  "use strict";
  // First, we check if the sector is already open.
  if (verbose) {
    console.log("Trying to change sector.");
  }
  let found = false,
    numOpenSectors = openSectors.length;
  for (let i = 0; i < numOpenSectors; i++) {
    if (openSectors[i].secX === data.secX && openSectors[i].secY === data.secY) {
      this.emit("clear view");
      // if it is, we leave the communication room.
      this.leave(Object.keys(this.rooms)[1]);
      // We remove the player from the Sector's player array
      let playerToRemove = playerById(this.id);
      let newPlayer = openSectors[playerToRemove.sector].playersArr.splice(playerToRemove.index, 1)[0];
      newPlayer.secX = data.secX;
      newPlayer.secY = data.secY;
      // Broadcast removed player to connected socket clients
      this.broadcast.to("sector_" + openSectors[playerToRemove.sector].secX + "_" + openSectors[playerToRemove.sector].secY).emit("remove player", {
        id: this.id,
        name: newPlayer.name,
      });

      if (verbose) {
        console.log("Sector was found. Changing sector.");
      }
      // If the sector exists, the player joins a room that serves as the sector communication system.
      this.join("sector_" + openSectors[i].secX + "_" + openSectors[i].secY);
      // And all players are informed about the new player.
      io.in("sector_" + openSectors[i].secX + "_" + openSectors[i].secY).emit("new player", newPlayer);
      // likewise, the new player is informed about every already existing player in this sector...
      for (let j = 0; j < openSectors[i].playersArr.length; j++) {
        let existingPlayer = openSectors[i].playersArr[j];
        this.emit("new player", existingPlayer);
      }
      // ... and every existing static Object in the Sector.
      for (let j = 0; j < openSectors[i].staticsArr.length; j++) {
        let staticObject = openSectors[i].staticsArr[j];
        this.emit("new static", staticObject);
      }
      // ... and every non-Player dynamic Object.
      for (let j = 0; j < openSectors[i].enemiesArr.length; j++) {
        let dynamicObject = openSectors[i].enemiesArr[j];
        this.emit("new dynamic", dynamicObject);
      }
      for (let j = 0; j < openSectors[i].rocketsArr.length; j++) {
        let dynamicObject = openSectors[i].rocketsArr[j];
        this.emit("new dynamic", dynamicObject);
      }
      // Finally, we add the player to the sector.
      openSectors[i].addPlayer(newPlayer);
      found = true;
      break;
    }
  }
  // If the sector was not found...
  if (!found) {
    // ... we first handle some things that we need to do beforehand.
    // Like clearing the view.
    this.emit("clear view");
    // Leaving the old communication room.
    this.leave(Object.keys(this.rooms)[1]);
    // Removing the player from the Sector's player array
    let playerToRemove = playerById(this.id),
      newPlayer = openSectors[playerToRemove.sector].playersArr.splice(playerToRemove.index, 1)[0];
    newPlayer.secX = data.secX;
    newPlayer.secY = data.secY;
    // Broadcast removed player to connected socket clients
    this.broadcast.to("sector_" + openSectors[playerToRemove.sector].secX + "_" + openSectors[playerToRemove.sector].secY).emit("remove player", {
      id: this.id,
      name: newPlayer.name,
    });
    // ... and then create the new Sector.
    if (verbose) {
      console.log("Sector was not found. Creating " + data.secX + ":" + data.secY);
    }
    this.join("sector_" + data.secX + "_" + data.secY);
    io.in("sector_" + data.secX + "_" + data.secY).emit("new player", newPlayer);
    let newSector = new SectorInstance.SectorInstance(data.secX, data.secY, onShipDestroyed, onShipHit, onRocketDestroyed, onPlayerDestroyed, onEnemyFired);
    newSector.addPlayer(newPlayer);
    let length = openSectors.push(newSector);
    // We add enemies to the system.
    for (let i = 0; i < 3; i++) {
      insertEnemy(data.secX, data.secY);
    }
    // We also initialize the procedure to get the Statics data from the database.
    database.getSector(pad(data.secX, 3) + ":" + pad(data.secY, 3));
    //
    for (let j = 0; j < openSectors[length - 1].rocketsArr.length; j++) {
      let dynamicObject = openSectors[length - 1].rocketsArr[j];
      this.emit("new dynamic", dynamicObject);
    }
    for (let j = 0; j < openSectors[length - 1].enemiesArr.length; j++) {
      let dynamicObject = openSectors[length - 1].enemiesArr[j];
      this.emit("new dynamic", dynamicObject);
    }
  }
  clearSectorIfEmpty();
}

/******************************************************************/

// Aiding function from http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
function pad(n, width, z) {
  "use strict";
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
// Aiding function to get Random int
function randomInt(min, max) {
  "use strict";
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/******************************************************************/

function onShipDestroyed(x, y, secX, secY, name, owner) {
  "use strict";
  var playerPointer = playerById(owner);
  insertEnemy(secX, secY);
  if (playerPointer != null) {
    openSectors[playerPointer.sector].playersArr[playerPointer.index].score++;
  }
  io.in("sector_" + secX + "_" + secY).emit("remove enemy", {x: x, y: y, name: name});
}

function onShipHit(secX, secY, name) {
  "use strict";
  io.in("sector_" + secX + "_" + secY).emit("ship hit", {name: name});
}

function onRocketDestroyed(secX, secY, name) {
  "use strict";
  io.in("sector_" + secX + "_" + secY).emit("remove rocket", {name: name});
}

function onPlayerDestroyed(secX, secY, id) {
  "use strict";
  var playerPointer = playerById(id),
    player = openSectors[playerPointer.sector].playersArr[playerPointer.index];
  if (verbose) {
    console.log("Player " + id + " dead! Resetting.");
  }
  player.score = 0;
  player.life = 1000;
  player.x = randomInt(-50000, 50000);
  player.y = randomInt(-50000, 50000);
}

function onEnemyFired(data) {
  "use strict";
  var sector,
    openSectorLength = openSectors.length,
    uuid = uuidV1(),
    newRocket = {
      "name": uuid,
      "id": uuid,
      "type": "ship",
      "shipImage": "rocket",
      "life": 300,
      "owner": data.owner,
      "x": data.x,
      "y": data.y,
      "vx": data.vx,
      "vy": data.vy,
    };
  if (verbose) console.log(data.owner + " has fired an enemy rocket.");
  for (let i = 0; i < openSectorLength; i++) {
    if (openSectors[i].secX === data.secX && openSectors[i].secY === data.secY) {
      sector = openSectors[i];
    }
  }
  sector.rocketsArr.push(newRocket);
  io.in("sector_" + data.secX + "_" + data.secY).emit("new dynamic", newRocket);
}
/******************************************************************/

// This is the server sided game loop. It tells all active Sectors to update their status. It runs approx. every 16.6ms.
function loop() {
  "use strict";
  var timeInMs = Date.now(),
    openSectorsLength = openSectors.length;
  for (let i = 0; i < openSectorsLength; i++) {
    updateCountdown += 1;
    openSectors[i].update();

    // Every second, we will reupdate positions and velocities of all players.
    if (updateCountdown === 60) {
      updateCountdown = 0;
      let relevantArrays = openSectors[i].playersArr.concat(openSectors[i].enemiesArr, openSectors[i].rocketsArr);
      io.in("sector_" + openSectors[i].secX + "_" + openSectors[i].secY).emit("pos update", relevantArrays);
    }
  }
  timeInMs = Date.now() - timeInMs;
  setTimeout(loop, Math.max(1000 / 60 - timeInMs, 0));
}

init();