class SectorInstance {
  constructor(secX, secY, shipDestroyedCallback, shipHitCallback, rocketDestroyedCallback, playerDestroyedCallback, enemyFireCallback) {
    this.secX = secX;
    this.secY = secY;
    this.playersArr = [];
    this.staticsArr = [];
    this.rocketsArr = [];
    this.enemiesArr = [];
    this.rocketDestroyedCallback = rocketDestroyedCallback;
    this.shipHitCallback = shipHitCallback;
    this.shipDestroyedCallback = shipDestroyedCallback;
    this.playerDestroyedCallback = playerDestroyedCallback;
    this.enemyFireCallback = enemyFireCallback;
    this.LOOP_CONSTANT = 1;
    this.HIT_RANGE = 1000;
  }

  addPlayer(newPlayer) {
    this.playersArr.push(newPlayer);
  }

  addStatic(newStatic) {
    this.staticsArr.push(newStatic);
  }

  update() {
    this.updatePlayers();
    this.updateRockets();
    this.updateEnemies();
  }

  updatePlayers() {
    var playerLength = this.playersArr.length;
    for (let i = 0; i < playerLength; i++) {
      this.playersArr[i].x += this.playersArr[i].vx * this.LOOP_CONSTANT;
      this.playersArr[i].y += this.playersArr[i].vy * this.LOOP_CONSTANT;
    }
  }

  updateRockets() {
    var rocketArrLength = this.rocketsArr.length;
    for (let i = 0; i < rocketArrLength; i++) {
      this.rocketsArr[i].x += this.rocketsArr[i].vx * this.LOOP_CONSTANT;
      this.rocketsArr[i].y += this.rocketsArr[i].vy * this.LOOP_CONSTANT;
      // If it's  not expired, we remove 1 hitpoint to reduce its lifetime.
      this.rocketsArr[i].life -= 1;
      if (this.rocketsArr[i].life < 0) { // Check if there's a rocket whose time has expired. Boop!
        this.rocketDestroyedCallback(this.secX, this.secY, this.rocketsArr[i].name);
        this.rocketsArr.splice(i, 1);
        rocketArrLength = this.rocketsArr.length;
      } else {        // We  check if there's any enemy in range to hit! If so, we "hit" it.
        let enemiesArrLength = this.enemiesArr.length;
        for (let j = 0; j < enemiesArrLength; j++) {
          if (this.rocketsArr[i].owner !== this.enemiesArr[j].id) {
            let x1 = this.rocketsArr[i].x,
              x2 = this.enemiesArr[j].x,
              y1 = this.rocketsArr[i].y,
              y2 = this.enemiesArr[j].y,
              distance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

            if (distance < this.HIT_RANGE) {
              this.enemiesArr[j].life -= 250;
              this.rocketDestroyedCallback(this.secX, this.secY, this.rocketsArr[i].name);
              this.rocketsArr[i].life = 0;
              if (this.enemiesArr[j].life <= 0) {
                this.shipDestroyedCallback(this.enemiesArr[j].x, this.enemiesArr[j].y, this.secX, this.secY, this.enemiesArr[j].name, this.rocketsArr[i].owner);
                this.enemiesArr.splice(j, 1);
                enemiesArrLength = this.enemiesArr.length;
              }
            }
          }
        }
        // We check the same hitbox for any players. Poor players. :(
        let playersArr = this.playersArr.length;
        for (let j = 0; j < playersArr; j++) {
          if (this.rocketsArr[i].owner !== this.playersArr[j].id) {
            let x1 = this.rocketsArr[i].x,
              x2 = this.playersArr[j].x,
              y1 = this.rocketsArr[i].y,
              y2 = this.playersArr[j].y,
              distance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

            if (distance < this.HIT_RANGE) {
              this.playersArr[j].life -= 250;
              this.rocketDestroyedCallback(this.secX, this.secY, this.rocketsArr[i].name);
              this.rocketsArr[i].life = 0;
              if (this.playersArr[j].life <= 0) {
                this.playerDestroyedCallback(this.secX, this.secY, this.playersArr[j].id);
                playersArr = this.playersArr.length;
              }
            }
          }
        }
      }
    }
  }

  // Moves enemies towards the player.
  updateEnemies() {
    var enemiesLength = this.enemiesArr.length,
      playersLength = this.playersArr.length,
      nearestPlayer = {x: 0, y: 0,},
      distance = Infinity;
    for (let i = 0; i < enemiesLength; i++) {
      this.enemiesArr[i].x += this.enemiesArr[i].vx * this.LOOP_CONSTANT;
      this.enemiesArr[i].y += this.enemiesArr[i].vy * this.LOOP_CONSTANT;
      for (let j = 0; j < playersLength; j++) {
        let x1 = this.playersArr[j].x,
          x2 = this.enemiesArr[i].x,
          y1 = this.playersArr[j].y,
          y2 = this.enemiesArr[i].y,
          newDistance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        if (newDistance < distance) {
          distance = newDistance;
          nearestPlayer = this.playersArr[j];
        }
      }
      if (distance < 5000) {this.enemiesArr[i].charge++;}
      if (this.enemiesArr[i].charge >= 300) {
        this.enemyFireCallback({
          "owner": this.enemiesArr[i].id,
          "x": this.enemiesArr[i].x,
          "y": this.enemiesArr[i].y,
          "vx": this.enemiesArr[i].vx*5,
          "vy": this.enemiesArr[i].vy*5,
          "secX": this.enemiesArr[i].secX,
          "secY": this.enemiesArr[i].secY,
        });
        this.enemiesArr[i].charge = 0;
      }
      this.enemiesArr[i].vx = (nearestPlayer.x - this.enemiesArr[i].x) / distance;
      this.enemiesArr[i].vy = (nearestPlayer.y - this.enemiesArr[i].y) / distance;
    }
  }

  /******************************************************************/

  /******************************************************************/

}

exports.SectorInstance = SectorInstance;