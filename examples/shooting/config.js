/**
 * config.js
 * 定数、ゲーム用パラメータ等を定義
*/
var phina = phina || null;

// 基本情報：index.htmlと共用
var GAME_TITLE = "TOMA REVENGE(仮)";
var GAME_VERSION = '0.1.0';
var SCREEN_WIDTH = 512;
var SCREEN_HEIGHT = 360;

// 以下ゲーム用
if (phina) {

  var USE_WEBGL = true;
  var DEBUG_MODE = false;
  var BOSS_ONLY = false;
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

  var SCROLL_SPEED = 5;
  var SENSIBILITY = 0.8;
  var PLAYER_SPEED = 4;
  var PLAYER_INITIAL_LIFE = 2;

  var BOMB_MAX_VALUE = 1000;
  var ITEM_SEARCH_RANGE = 110;
  var RAND_INTS = [].range(-25, 25); // アイテムバラマキ用

  var BOSS_AGE_OF_DEATH = 5300; // 90sec = 90000ms / 17 = about 5300 frame
  var ENEMY_INIT_INVINSIBLE_FRAME = 50;

  // debug用: ザコ編隊の開始インデックス指定
  var ENEMY_WAVE_START_INDEX = 0;
  // var ENEMY_WAVE_START_INDEX = 96;
  // var ENEMY_WAVE_START_INDEX = 105;

  /* プレイヤーショット関係 */
  var PLAYER_START_LEVEL = 4; // 初期パワーアップ状態： ->オプション数
  var BIT_DELAY_INTERVAL = 13;
  // var PLAYER_BIT_INTERVAL = 20;
  var SHOT_POWER = 2;
  var HOMING_SHOT_POWER = 2;
  var BOMB_POWER = 100;
  // var SHOT_POWERUP_BORDER = 100;
  // var SHOT_ENERGY_UNIT = 5; // ショットパワーアップアイテム 基本単位
  // var MAX_SHOT_LEVEL = 4;
  // var MAX_SHOT_ENERGY = SHOT_POWERUP_BORDER * MAX_SHOT_LEVEL;
  // var SHOT_ANGLE_UNIT = 12;

  /**
   * 敵データ
   * @param {string} texture [画像テクスチャキー名]
   * @param {life} [Number] [体力]
   * @param {score} [Number] [獲得点数]
   * @param {speed} [Number] [x軸速度]
   * @optional {radius} [Number] [当たり判定広さ]
   * @type {Object}
   */
  var ENEMY_TYPES = {
    "basic": {
      texture: "redTriangle",
      life: 10,
      score: 100,
      speed: 2,
      radius: 12,
    },
    "sine": {
      texture: "rightArrow",
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
      life: 20,
      speed: 4,
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
      life: 10,
      score: 200,
    },
    "muteki": {
      texture: "cucumber",
      life: Infinity,
      score: 100,
    },
    "assault": {
      texture: "meteorStar",
      life: 50,
      score: 100,
      speed: 6,
    },
    "orbit": {
      texture: "cucumber",
      life: 800,
      score: 2000,
    },
    "boss": {
      texture: "boss",
      radius: 36,
      life: 2800,
      // life: 100, // for debug
      score: 10000,
    }
  };

  var BulletConfig = {
    target: null,
    layer: null,
  };

  // assets
  (function(){
    var assetPath = "../../assets/";
    window.ASSETS = {
      image: {
        "tomapiyo": assetPath+"tomapiyo.png",
        "buropiyo": assetPath+"buropiyo.png",
        "takepiyo": assetPath+"takepiyo.png",
        "mikapiyo": assetPath+"mikapiyo.png",
        "meropiyo": assetPath+"meropiyo.png",
        "nasupiyo": assetPath+"nasupiyo.png",
        // "boss": assetPath+"karasu_ss.png",
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

        // "boss": {
        //   "frame": {
        //     "width": 64,
        //     "height": 64,
        //     "cols": 3,
        //     "rows": 1,
        //   },
        //   "animations" : {
        //     "fly": {
        //       "frames": [0, 1, 2],
        //       "next": "fly",
        //       "frequency": 8
        //     },
        //      "dead": {
        //       "frames": [],
        //     }
        //   }
        // }
      },
    };
  }());

}