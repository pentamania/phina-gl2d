
/**
 * CONST
*/
var GAME_TITLE = "TOMADIUS(仮)";
var SCREEN_WIDTH = 512;
var SCREEN_HEIGHT = 360;
var SCROLL_SPEED = 5;
var SENSIBILITY = 0.8;
var PLAYER_SPEED = 4;
var PLAYER_INITIAL_LIFE = 1;
var BOMB_MAX_VALUE = 1000;
var ITEM_SEARCH_RANGE = 70;
var PLAYER_BIT_INTERVAL = 20;

var MAX_SHOT_LEVEL = 4;
var SHOT_ANGLE_UNIT = 12;

// var RAD_UNIT = 0.01745;
var RAD_UNIT = Math.PI / 180;

var USE_WEBGL;
var DEBUG_MODE;
var BOSS_ONLY;
(function(){
  var qsParams = phina.util.QueryString.parse();
  USE_WEBGL = (qsParams.webgl != null) ? JSON.parse(qsParams.webgl) : true;
  DEBUG_MODE = (qsParams.debug != null) ? JSON.parse(qsParams.debug) : false;
  BOSS_ONLY = (qsParams.bossOnly != null) ? JSON.parse(qsParams.bossOnly) : false;
}());
var Log = function() {
  if (DEBUG_MODE) {
    return console.log.apply(null, arguments);
  }
};

var bulletConfig = {
  target: null,
  layer: null,
};

var assetPath = "../../assets/";
var ASSETS = {
  image: {
    "tomapiyo": assetPath+"tomapiyo.png",
    "buropiyo": assetPath+"buropiyo.png",
    "takepiyo": assetPath+"takepiyo.png",
    "mikapiyo": assetPath+"mikapiyo.png",
    "meropiyo": assetPath+"meropiyo.png",
    "nasupiyo": assetPath+"nasupiyo.png",
    "boss": assetPath+"karasu_ss.png",
    "bg": assetPath+"background.png",
  },

  // sound: {
  //   "":
  // },

  spritesheet: {
    "tomapiyo": {
      "frame": {
        "width": 64, // 1フレームの画像サイズ（横）
        "height": 64, // 1フレームの画像サイズ（縦）
        "cols": 6, // フレーム数（横）
        "rows": 3, // フレーム数（縦）
      },
      "animations" : {
        "wait": {
          "frames": [5],
        },
        "fly": {              //アニメーション名
          "frames": [1, 2, 3],
          "next": "fly",
          "frequency": 5      //フレーム毎の間隔
        },
         "dead": {
          "frames": [4],
        }
      }
    },

    "boss": {
      "frame": {
        "width": 64,
        "height": 64,
        "cols": 3,
        "rows": 1,
      },
      "animations" : {
        "fly": {
          "frames": [0, 1, 2],
          "next": "fly",
          "frequency": 8
        },
         "dead": {
          "frames": [],
        }
      }
    }
  },
};

var SHOT_POWER = 8;
var BOMB_POWER = 100;
/**
 * @param {string} texture [画像テクスチャキー名]
 * @param {life} [Number] [体力]
 * @param {score} [Number] [獲得点数]
 * @param {speed} [Number] [x軸速度]
 * @optional {radius} [Number] [当たり判定広さ]
 * @type {Object}
 */
var ENEMY_TYPES = {
  "basic": {
    texture: "cucumber",
    life: 10,
    score: 100,
    speed: 2,
    radius: 12,
  },
  "sine": {
    texture: "cucumber",
    life: 10,
    score: 100,
  },
  "homing": {
    texture: "rightHeart",
    life: 10,
    score: 100,
  },
  "whirl": {
    texture: "cucumber",
    life: 10,
    speed: 4,
    score: 100,
  },
  "vTurn": {
    texture: "cucumber",
    life: 4,
    score: 100,
  },
  "mine": {
    texture: "meteorStar",
    life: 20,
    score: 200,
  },
  "hardBody": {
    texture: "beniyaIta",
    life: 200,
    speed: 2,
    radius: 16,
    score: 1000,
  },
  "verticalShot": {
    texture: "cucumber",
    life: 60,
    score: 200,
  },
  "muteki": {
    texture: "cucumber",
    life: 9000000,
    score: 100,
  },
  "assalt": {
    texture: "meteorStar",
    life: 20,
    score: 100,
    speed: 6,
  },
  "orbit": {
    texture: "cucumber",
    life: 2000,
    score: 2000,
  },
  "boss": {
    texture: "boss",
    life: 100,
    // life: 1000,
    score: 10000,
  }
};
