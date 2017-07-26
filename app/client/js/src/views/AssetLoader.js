/* global PIXI*/

var Useful = Useful || {};
Useful.GameView.AssetLoader = function () {
  var that = {},
    backgroundContainer = {},
    backgroundLoadedCallback,
    nearStarsScale = 1.0,
    farStarsScale = 0.5,
    ship,
    loader = PIXI.loader,
    Sprite = PIXI.Sprite,
    resources = loader.resources,
    texture = PIXI.Texture.fromImage("../res/stars.png");
  PIXI.loader.add(["../res/galaxy.png",
    "../res/stars.png",
    "../res/shuttle.png",
    "../res/enemy.png",
    "../res/rocket.png",
    "../res/explosion.png",
    "../res/laser.png",
  ]).load(setup);

  /*********************************************************/

  function setup() {
    backgroundContainer.background = loadBackground();
    backgroundContainer.farStars = createTilingSprite(farStarsScale);
    backgroundContainer.nearStars = createTilingSprite(nearStarsScale);
    backgroundLoadedCallback(backgroundContainer);
  }

  function loadBackground() {
    background = new Sprite(loader.resources["../res/galaxy.png"].texture);
    background.anchor.set(0.5, 0.5);  //rotate layer around its center
    background.x = 0;
    background.y = 0;
    return background;
  }

  function createTilingSprite(scale) {
    var tilingSprite = new PIXI.extras.TilingSprite
    (
      texture,
      2048,
      2048
    );
    tilingSprite.position.x = 0;
    tilingSprite.position.y = 0;
    tilingSprite.tilePosition.x = 0;
    tilingSprite.tilePosition.y = 0;
    tilingSprite.tileScale.x = scale;
    tilingSprite.tileScale.y = scale;
    return tilingSprite;
  }

  /*********************************************************/

  function getShip(name) {
    ship = new Sprite(loader.resources["../res/" + name + ".png"].texture);
    ship.anchor.set(0.5, 0.5);
    return ship;
  }

  function getLaser(name) {
    laser = new Sprite(loader.resources["../res/" + name + ".png"].texture);
    laser.anchor.set(0.05, 0.5);
    return laser;
  }

  /*********************************************************/

  function setOnBackgroundLoadedCallback(callback) {
    backgroundLoadedCallback = callback;
  }

  that.getShip = getShip;
  that.getLaser = getLaser;
  that.setOnBackgroundLoadedCallback = setOnBackgroundLoadedCallback;

  return that;
};
