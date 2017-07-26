var Player = function (id, name, type, shipImage, laserImage, life, score, x, y, vx, vy, secX, secY) {
  "use strict";
  this.id = id;

  this.name = name;
  this.type = type;
  this.shipImage = shipImage;
  this.laserImage = laserImage;

  this.life = life;
  this.score = score;

  this.x = x;
  this.y = y;

  this.vx = vx;
  this.vy = vy;

  this.secX = secX;
  this.secY = secY;

  this.angle = 0.0;
};

exports.Player = Player;