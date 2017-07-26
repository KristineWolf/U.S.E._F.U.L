/*global PIXI*/

var Useful = Useful || {};
Useful.GameView = function ()
{

    var that = {},

        //constants
        GAME_WIDTH = window.innerWidth, //getting actual screen parameters
        GAME_HEIGHT = window.innerHeight,
        HALF_WIDTH = GAME_WIDTH / 2, // since these are needed a lot, we define them here
        HALF_HEIGHT = GAME_HEIGHT / 2,
        TEXT_SIZE = Math.round(GAME_WIDTH / 50), //Scale Text to screen size
        SECTOR_MENU_TEXT_OFFSET =200,
        FAR_STARS_SCALE = 20,
        NEAR_STARS_SCALE = 10,
        PLAYER_ACCELERATION = 5,
        EXPLOSION_DURATION = 100,

        renderer,  //needed by PIXI: main rendering context
        onGameViewStartedCallback,  //is called after this is initialized

        stage = new PIXI.Container(),  //main stage, root element of all layers
        //A container is a PIXI specific data structure that can contain images and other containers

        backgroundLayer = new PIXI.Container(), //contains background layers:
        backgroundImage,  // a still image
        farStars,  // a slowly-moving TilingSprite
        nearStars, // a faster-moving TilingSprite

        zoomableLayer,  //extra layer needed to zoom objectsLayer und playerLayer without distance issues
        objectsLayer,  //child of zoomableLayer, contains all objects except player
        playerLayer,  //layer reserved for player, so it can move independently
        infoLayer,  //layer for enemy information
        sectorLayer, //layer for changing sectors

        playerHUD = Useful.GameView.TextBox(0, 0, TEXT_SIZE, false);  // HUD Display;

    setupRenderer();
    setupLayers();

    var assetLoader = Useful.GameView.AssetLoader(); //Load and start AssetLoader
    assetLoader.setOnBackgroundLoadedCallback(createStage); //When assets are loaded, create the stage

    /*********************************************************/

    function setupLayers()
    {
        setupPlayerLayer();
        setupObjectsLayer();
        setupZoomableLayer();
        setupInfoLayer();
        setupSectorLayer();
    }

    function setupPlayerLayer()
    {
        playerLayer = new PIXI.Container();
        playerLayer.setTransform(HALF_WIDTH, HALF_HEIGHT, 0, 0, 0, 0, 0, HALF_WIDTH, HALF_HEIGHT); //center layer on screen and set layer pivot to center
        playerLayer.vx = 0.0; //variables to store players speed
        playerLayer.vy = 0.0; //initialized to zero
        playerLayer.secX = 0;
        playerLayer.secY = 0;
    }

    //objectsLayer and zoomableLayer are, in principle, set up like playerLayer, but don't store speed

    function setupObjectsLayer()
    {
        objectsLayer = new PIXI.Container();
        objectsLayer.setTransform(HALF_WIDTH, HALF_HEIGHT, 0, 0, 0, 0, 0, HALF_WIDTH, HALF_HEIGHT);
    }

    function setupZoomableLayer()
    {
        zoomableLayer = new PIXI.Container();
        zoomableLayer.setTransform(HALF_WIDTH, HALF_HEIGHT, 0, 0, 0, 0, 0, HALF_WIDTH, HALF_HEIGHT);
    }

    function setupInfoLayer()
    {
        infoLayer = new PIXI.Container();
        infoLayer.setTransform(HALF_WIDTH, HALF_HEIGHT, 0, 0, 0, 0, 0, HALF_WIDTH, HALF_HEIGHT);
    }

    function setupSectorLayer()
    {
        sectorLayer = new PIXI.Container();

        let sectorMenu = Useful.GameView.TextBox(0, 0, TEXT_SIZE, false);
        sectorMenu.text = "Warp engine ready";
        sectorLayer.addChild(sectorMenu);
        sectorMenu = Useful.GameView.TextBox(HALF_WIDTH, HALF_HEIGHT, TEXT_SIZE, false);
        sectorMenu.text = "Current Sector.";
        sectorMenu.x -= sectorMenu.width / 2;
        sectorLayer.addChild(sectorMenu);
        sectorMenu = Useful.GameView.TextBox(HALF_WIDTH, HALF_HEIGHT - SECTOR_MENU_TEXT_OFFSET, TEXT_SIZE, false);
        sectorMenu.text = "Arrow up:\nWarp to sector " + playerLayer.secX + ":" + (playerLayer.secY - 1);
        sectorMenu.x -= sectorMenu.width / 2;
        sectorLayer.addChild(sectorMenu);
        sectorMenu = Useful.GameView.TextBox(HALF_WIDTH, HALF_HEIGHT + SECTOR_MENU_TEXT_OFFSET, TEXT_SIZE, false);
        sectorMenu.text = "Arrow down:\nWarp to sector " + playerLayer.secX + ":" + (playerLayer.secY + 1);
        sectorMenu.x -= sectorMenu.width / 2;
        sectorLayer.addChild(sectorMenu);
        sectorMenu = Useful.GameView.TextBox(SECTOR_MENU_TEXT_OFFSET, HALF_HEIGHT, TEXT_SIZE, false);
        sectorMenu.text = "Arrow left:\nWarp to sector " + (playerLayer.secX - 1) + ":" + playerLayer.secY;
        sectorLayer.addChild(sectorMenu);
        sectorMenu = Useful.GameView.TextBox(HALF_WIDTH + SECTOR_MENU_TEXT_OFFSET, HALF_HEIGHT, TEXT_SIZE, false);
        sectorMenu.text = "Arrow right:\nWarp to sector " + (playerLayer.secX + 1) + ":" + playerLayer.secY;
        sectorLayer.addChild(sectorMenu);
        sectorLayer.visible = false;
    }

    function createStage(allBackgroundLayers) // In this function, layers are connected to setup the view
    {
        backgroundImage = allBackgroundLayers.background;
        farStars = allBackgroundLayers.farStars;
        nearStars = allBackgroundLayers.nearStars;

        backgroundLayer.addChild(backgroundImage);
        backgroundLayer.addChild(farStars);
        backgroundLayer.addChild(nearStars);

        zoomableLayer.addChild(objectsLayer);
        zoomableLayer.addChild(playerLayer);

        stage.addChild(backgroundLayer);
        stage.addChild(zoomableLayer);
        stage.addChild(infoLayer);
        stage.addChild(playerHUD);
        stage.addChild(sectorLayer);

        onGameViewStartedCallback();
        gameLoop();
    }

    /*********************************************************/

    function gameLoop()
    {
        updateBackground();
        updateObjectsLayer();

        requestAnimationFrame(gameLoop); //Loop this function at 60 frames per second
        renderer.render(stage); //Render the stage to see the animation
    }

    /*************************************************/

    function updateBackground()
    {
        farStars.tilePosition.x -= playerLayer.vx / FAR_STARS_SCALE;
        farStars.tilePosition.y -= playerLayer.vy / FAR_STARS_SCALE;
        nearStars.tilePosition.x -= playerLayer.vx / NEAR_STARS_SCALE;
        nearStars.tilePosition.y -= playerLayer.vy / NEAR_STARS_SCALE;
    }

    function updateObjectsLayer()
    {
        infoLayer.removeChildren();
        let allObjects = objectsLayer.children;

        for (let count = 0; count < allObjects.length; count++) //cycle through objects on objectLayer
        {
            if (allObjects[count].type === "ship")
            {
                allObjects[count].x += allObjects[count].vx; //update objects position
                allObjects[count].y += allObjects[count].vy;

                updateInfoLayer(allObjects[count]);
            }

            if (allObjects[count].name === "explosion")
            {
                allObjects[count].ttl--;
                if (allObjects[count].ttl === 0)
                {
                    objectsLayer.removeChild(allObjects[count]);

                }

            }

        }
        objectsLayer.x -= playerLayer.vx; //move objectslayer in the opposite direction, creating the illusion of
        objectsLayer.y -= playerLayer.vy; //objects flying away while clients ship is standing still in the center

    }

    function updateInfoLayer(ship)
    {
        /*

         var info = Useful.GameView.TextBox(ship.getGlobalPosition().x, ship.getGlobalPosition().y + 10, GAME_WIDTH / 150, true);
         info.text = "Name: " + ship.name + " Life:\n" + ship.life;
         infoLayer.addChild(info);
         */

    }

    function updatePlayerHUD(dynamicObject)
    {
        var speed = Math.sqrt(dynamicObject.vx * dynamicObject.vx + dynamicObject.vy * dynamicObject.vy);
        playerHUD.text = "Name: " + dynamicObject.name + " | Life: " + dynamicObject.life + " | Score: " + dynamicObject.score + " | Sector: " + playerLayer.secX + ":" + playerLayer.secY + " | Speed: " + Math.round(speed * 100) / 100;
    }

    function toggleWarpMenu()
    {
        //toggle visibility of layers while in sector menu
        playerHUD.visible = !playerHUD.visible;
        sectorLayer.visible = !sectorLayer.visible;
        return sectorLayer.visible;
    }

    /*************************************************/

    function zoom(value)
    {
        //scale of zoomable layer (contains playerLayer and objectsLayer) is multiplied with scaling value
        zoomableLayer.scale.set(zoomableLayer.scale.x * value, zoomableLayer.scale.y * value);
    }

    function steer(x, y)
    {
        //calculate rotation from mouse position and screen center.
        playerLayer.rotation = Math.PI / 2 - Math.atan2(x - HALF_WIDTH, y - HALF_HEIGHT);
    }

    function accelerate()
    {
        //calculate speed from rotation
        playerLayer.vx += Math.cos(playerLayer.rotation) * PLAYER_ACCELERATION;
        playerLayer.vy += Math.sin(playerLayer.rotation) * PLAYER_ACCELERATION;
    }

    function fullStop()
    {
        playerLayer.vx = 0.0; //initial player velocity is always zero
        playerLayer.vy = 0.0;
    }

    /*********************************************************/
    function addStaticObject(staticObject)
    {
        if (staticObject.type === "sphere")
        {

            var circle = new PIXI.Graphics();  //prepare sphere
            circle.beginFill(staticObject.color, staticObject.alpha); //set color and alpha
            circle.drawCircle(staticObject.x, staticObject.y, staticObject.rad); //set position and radius
            circle.endFill();
            objectsLayer.removeChild(staticObject.name); //remove old sphere if there is any
            objectsLayer.addChild(circle) //add sphere to objectslayer
        }

    }

    function addDynamicObject(dynamicObject)
    {

        var container = new PIXI.Container(),
            img = assetLoader.getShip(dynamicObject.shipImage);
        container.setTransform(0, 0, 0, 0, 0, 0, 0, HALF_WIDTH, HALF_HEIGHT);

        container.name = dynamicObject.name;
        container.type = dynamicObject.type;
        container.life = dynamicObject.life;
        container.score = dynamicObject.score;

        img.x = HALF_WIDTH;
        img.y = HALF_HEIGHT;

        container.addChild(img);

        if (dynamicObject.player === true)
        {
            container.x = HALF_WIDTH;
            container.y = HALF_HEIGHT;
            playerLayer.secX = dynamicObject.secX;
            playerLayer.secY = dynamicObject.secY;
            objectsLayer.x = GAME_WIDTH - dynamicObject.x;
            objectsLayer.y = GAME_HEIGHT - dynamicObject.y;

            updatePlayerHUD(dynamicObject);
            playerLayer.removeChildren();
            playerLayer.addChild(container);

        }

        else
        {
            container.x = dynamicObject.x;
            container.y = dynamicObject.y;
            container.vx = dynamicObject.vx;
            container.vy = dynamicObject.vy;
            container.rotation = Math.PI / 2 - Math.atan2(container.vx, container.vy);

            removeObjectByName(dynamicObject.name); //delete old object
            objectsLayer.addChild(container); //add new object

        }
    }

    function removeObjectByName(objectName)
    {
        var allObjects = objectsLayer.children;

        for (let count = 0; count < allObjects.length; count++)
        {
            if (allObjects[count].name === objectName)
            {
                objectsLayer.removeChild(allObjects[count]);

            }
        }
    }

    function explode(x, y)
    {
        var img = assetLoader.getShip("explosion");
        img.x = x;
        img.y = y;
        img.name = "explosion";
        img.ttl = EXPLOSION_DURATION;  //ttl = time to live
        objectsLayer.addChild(img);
    }

    function clearObjectLayer()
    {
        objectsLayer.removeChildren();
    }

    function getPlayerPosition()
    {
        var position = {};
        position.x = GAME_WIDTH - objectsLayer.x;
        position.y = GAME_HEIGHT - objectsLayer.y;
        return position;
    }

    function getPlayerSector()
    {
        var sector = {};
        sector.secX = playerLayer.secX;
        sector.secY = playerLayer.secY;
        return sector;
    }

    function getPlayerSpeed()
    {
        var speed = {};
        speed.vx = playerLayer.vx;
        speed.vy = playerLayer.vy;
        return speed;
    }

    function getPlayerRotation()
    {
        var rot = {};
        rot.x = Math.cos(playerLayer.rotation);
        rot.y = Math.sin(playerLayer.rotation);
        return rot;
    }

    /*********************************************************/

    function setupRenderer()
    {
        rendererOptions =
            {
                antialiasing: false,
                transparent: false,
                resolution: window.devicePixelRatio,
                autoResize: true,
            },

            renderer = PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT, rendererOptions);

        // Put the renderer on screen in the corner
        renderer.backgroundColor = 0x000000;
        renderer.view.style.position = "absolute";
        renderer.view.style.top = "0px";
        renderer.view.style.left = "0px";

        window.addEventListener("resize", resize);
        document.body.appendChild(renderer.view);
        stage.interactive = true;
    }

    function resize()
    {
        // Determine which screen dimension is most constrained
        var ratio = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);

        // Scale the view appropriately to fill that dimension
        stage.scale.x = stage.scale.y = ratio;

        // Update the renderer dimensions
        renderer.resize(Math.ceil(GAME_WIDTH * ratio), Math.ceil(GAME_HEIGHT * ratio));

        // Set the Renderer in the middle of the screen
        renderer.view.style.left = ((window.innerWidth - renderer.width) >> 1) + "px";
        renderer.view.style.top = ((window.innerHeight - renderer.height) >> 1) + "px";
    }

    /*********************************************************/
    function setOnGameViewStartedCallback(callback)
    {
        onGameViewStartedCallback = callback;
    }

    that.explode = explode;
    that.toggleWarpMenu = toggleWarpMenu;
    that.getPlayerRotation = getPlayerRotation;
    that.getPlayerPosition = getPlayerPosition;
    that.getPlayerSector = getPlayerSector;
    that.clearObjectLayer = clearObjectLayer;
    that.getPlayerSpeed = getPlayerSpeed;
    that.setOnGameViewStartedCallback = setOnGameViewStartedCallback;
    that.addStaticObject = addStaticObject;
    that.addDynamicObject = addDynamicObject;
    that.removeObjectByName = removeObjectByName;
    that.fullStop = fullStop;
    that.accelerate = accelerate;
    that.steer = steer;
    that.zoom = zoom;
    return that;
};
