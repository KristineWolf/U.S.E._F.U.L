/* eslint-env browser */
/*global firebase*/

var Database = Database || {};
Database = (function() {
  "use strict";

  var that = {},
    controller;

  const SUN_RAD_MIN=10000,
    SECTOR_NUM = 100,
    SUN_RAD_MAX = 100000,
    MIN_NUM_OF_PLANETS = 5,
    MAX_NUM_OF_PLANETS = 15,
    NUM_OF_SUN=1,
    PROBABILITY_OF_SUN= 0.6,
    PLANET_RAD_MIN = 5000,
    PLANET_RAD_MAX = 10000,
    MIN_DIST = 10000,
    MAX_DIST= 20000,
    SUN_MIN_RED_VALUE =100,
    SUN_MAX_RED_VALUE = 255,
    SUN_MIN_GREEN_VALUE = 30,
    SUN_MAX_GREEN_VALUE = 255,
    SUN_BLUE_VALUE = 0,
    PLANETS_MIN_COLOR_VALUE =0,
    PLANETS_MAX_COLOR_VALUE =255,
    MIN_ALPHA_VAL=7,
    MAX_ALPHA_VAL=10,
    MIN_ANGLE=0,
    MAX_ANGLE=359,
    NUM_TEN=10,
    NUM_HUNDRED=100,
    NUM_TWO=2,
    NINETY_DEG=90,
    TWO_HUNDRED_SEVENTY_DEG=270,
    HUNDRED_EIGHTY_DEG=180,
    THREE_HUNDRED_SIXTY_DEG=360,
    HEX=16;

  //if button is clicked initialization of all objects beginns
  function onButtonClicked(){
    initializeObjects();
  //firebase.database().ref("sectors").remove();
  }

  function init(){
    initializeDB();
    initController();
  }

  function initController(){
    controller=Database.Controller(document.querySelector(".startAlgorithm"));
    controller.init();
    controller.setOnButtonClickedListener(onButtonClicked);
  }

  //initializes a sun and all planets and starts at the end with initialization of sector
  function initializeObjects(){
    for(let i=0; i<SECTOR_NUM;i++){
      for(let j=0;j<SECTOR_NUM;j++){
        let beforeI="",
          beforeJ="",
          ids =[],
          sun,
          key,
          planet,
          currentPlanetRadius,
          sunR=randomInt(SUN_RAD_MIN,SUN_RAD_MAX),
          planetDis=sunR,
          rnd=randomInt(MIN_NUM_OF_PLANETS,MAX_NUM_OF_PLANETS);

        //to get the right format for unique key of object
        if(i<NUM_TEN){
          beforeI="00";
        }else if(i<NUM_HUNDRED){
          beforeI="0";
        }
        if(j<NUM_TEN){
          beforeJ="00";
        }else if(j<NUM_HUNDRED){
          beforeJ="0";
        }

        //not every sector has a sun
        if(randomInt(0,NUM_OF_SUN)>PROBABILITY_OF_SUN){
          sun=buildSun(sunR);
          key="sun:"+beforeI+i+":"+beforeJ+j;
          firebase.database().ref("objects/"+key).set(sun);
          ids.push(key);
        }

        //planetDis is always the distance to the sun therefore it has to get bigger
        for(let k=0;k<rnd;k++){
          currentPlanetRadius=randomInt(PLANET_RAD_MIN,PLANET_RAD_MAX);
          planetDis+=randomInt(MIN_DIST,MAX_DIST)+currentPlanetRadius;
          key="planet:"+beforeI+i+":"+beforeJ+j+":"+k;
          planet=buildplanet(planetDis,currentPlanetRadius);
          firebase.database().ref("objects/planet:"+beforeI+i+":"+beforeJ+j+":"+k).set(planet);
          planetDis+=currentPlanetRadius;
          ids.push(key);
        }
        initializeSector(ids,i,j,beforeI,beforeJ);
      }
    }
  }

  //initializes the sectors with the associated planets
  function initializeSector(ids,i,j,beforeI,beforeJ){
    for(let k=0; k<ids.length; k++){
      firebase.database().ref("sectors/"+beforeI+i+":"+beforeJ+j+"/"+ids[k]).set({objects:ids[k],});
    }
  }

  //builds a sun. The colors of a sun are either shades of orange, yellow or red.
  // A sun is always in the middle of a sector.
  function buildSun(r){
    var red=randomInt(SUN_MIN_RED_VALUE,SUN_MAX_RED_VALUE),
      green=randomInt(SUN_MIN_GREEN_VALUE,SUN_MAX_GREEN_VALUE),
      blue=SUN_BLUE_VALUE,
      color=convertRGB(red,green,blue),
      sun={
        x:0,
        y:0,
        rad:r,
        type:"sphere",
        color: color,
        alpha: randomInt(MIN_ALPHA_VAL,MAX_ALPHA_VAL)/NUM_TEN,
      };
    return sun;
  }

  //builds a planet.
  function buildplanet(dis,r){
    var red=randomInt(PLANETS_MIN_COLOR_VALUE,PLANETS_MAX_COLOR_VALUE),
      green=randomInt(PLANETS_MIN_COLOR_VALUE,PLANETS_MAX_COLOR_VALUE),
      blue=randomInt(PLANETS_MIN_COLOR_VALUE,PLANETS_MAX_COLOR_VALUE),
      color=convertRGB(red,green,blue),
      angle=randomInt(MIN_ANGLE,MAX_ANGLE),
      x=getX(angle,dis),
      y=getY(angle,dis),
      planet={
        type:"sphere",
        rad:r,
        dist: dis,
        color:color,
        angle:angle,
        x:x,
        y: y,
        alpha: randomInt(MIN_ALPHA_VAL,MAX_ALPHA_VAL)/NUM_TEN,
      };
    return planet;
  }

  //calculates with cos*dist y position of planet
  function getY(angle,dist){
    var y,
      beta,
      alpha;
    //in first and fourth quadrants of coordinate system
    if(angle<=NINETY_DEG||angle>TWO_HUNDRED_SEVENTY_DEG){
      //to get same angle in first quadrant
      if(angle>TWO_HUNDRED_SEVENTY_DEG){
        beta= THREE_HUNDRED_SIXTY_DEG-angle;
      }else{
        beta=angle;
      }
      alpha= NINETY_DEG-beta;
      y=Math.cos(alpha*(Math.PI/HUNDRED_EIGHTY_DEG))*dist;

      //in fourth quadrant y is negative
      if(angle>TWO_HUNDRED_SEVENTY_DEG){ y*=-1;}

    //in second and third quadrants of coordinate system
    }else{
      //to get same angle in second quadrant
      if(angle>HUNDRED_EIGHTY_DEG){
        beta=THREE_HUNDRED_SIXTY_DEG-angle;
      }else{
        beta=angle;
      }
      alpha = HUNDRED_EIGHTY_DEG-beta;
      y=Math.cos(alpha*(Math.PI/HUNDRED_EIGHTY_DEG))*dist;

      //in third quadrant y is negative
      if(angle>HUNDRED_EIGHTY_DEG){ y*=-1;}
    }

    return y;
  }

  //calculates with sin*dist x position of planet
  function getX(angle, dist){
    var x,
      beta,
      alpha;
    //in first and fourth quadrants of coordinate system
    if(angle<=NINETY_DEG||angle>TWO_HUNDRED_SEVENTY_DEG){
      //to get same angle in first quadrant
      if(angle>TWO_HUNDRED_SEVENTY_DEG){
        beta= THREE_HUNDRED_SIXTY_DEG-angle;
      }else{
        beta=angle;
      }
      alpha= NINETY_DEG-beta;
      x=Math.sin(alpha*(Math.PI/HUNDRED_EIGHTY_DEG))*dist;

    //in second and third quadrants of coordinate system
    }else{
      //to get same angle in second quadrant
      if(angle>HUNDRED_EIGHTY_DEG){
        beta=THREE_HUNDRED_SIXTY_DEG-angle;
      }else{
        beta=angle;
      }
      alpha = HUNDRED_EIGHTY_DEG-beta;
      x=Math.sin(alpha*(Math.PI/HUNDRED_EIGHTY_DEG))*dist;
    }
    return x;
  }

  //pixi needs color in hex code
  function convertRGB(r,g,b){
    var rHex=r.toString(HEX),
      gHex=g.toString(HEX),
      bHex=b.toString(HEX);
    return "0x"+getRightFormat(rHex)+getRightFormat(gHex)+getRightFormat(bHex);
  }

  function getRightFormat(hex){
    if(hex.length<NUM_TWO){
      return "0"+hex;
    }
    return hex.toUpperCase();
  }

  function randomInt(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
  }

  function initializeDB(){
    // Initialize Firebase
    const config = {
      apiKey: "AIzaSyDjQJ_h7Qu6-3FJjN5TfOrI3Isx07J8EJs",
      authDomain: "use-ful.firebaseapp.com",
      databaseURL: "https://use-ful.firebaseio.com",
      storageBucket: "use-ful.appspot.com",
      messagingSenderId: "778837795685",
    };
    firebase.initializeApp(config);
  }

  that.init=init;
  return that;
}());
