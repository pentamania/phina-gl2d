
// てきとうにテクスチャ素材
;(function(){
  var am = AssetManager;
  var r, lw, img, shape;
  var drawShape = function(shape) {
    shape.render(shape.canvas);
    return shape.canvas;
  };

  // 弾
  r = 5;
  lw = r/4;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.strokeStyle = "#143F10";
  img.fillStyle = "#E557C5";
  img.lineWidth = lw;
  img.fillCircle(r, r, r-lw)
  .strokeCircle(r, r, r-lw);
  am.set('image', 'enemyNormalbullet', img);

  // 自弾
  r = 6;
  lw = r/3;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.strokeStyle = "#A90A0A";
  img.fillStyle = "#EE4B4B";
  img.lineWidth = lw;
  img.fillCircle(r, r, r-lw)
  .strokeCircle(r, r, r-lw);
  am.set('image', 'redBullet', img);

  // 天アイテム
  shape = phina.display.Label({
    text: "金",
    fontSize: 14,
    fontFamily: "Meirio",
    fill: "#E7EE29",
    stroke: "#gold",
  });
  am.set('image', 'scoreItem', drawShape(shape))

  // 敵 =========

  // teki: cucumber
  r = 16;
  lw = r/4;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.strokeStyle = "#1B6314";
  img.fillStyle = "#57E58C";
  img.lineWidth = lw;
  img.fillPolygon(r, r, r-lw, 6);
  img.strokePolygon(r, r, r-lw, 6);
  am.set('image', 'cucumber', img);

  // teki: hoshi
  r = 16;
  lw = r/4 | 0;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.strokeStyle = "#C7711D";
  img.fillStyle = "#E0E557";
  img.lineWidth = lw;
  img.fillStar(r, r, r-lw, 6)
  .strokeStar(r, r, r-lw, 6);
  am.set('image', 'meteorStar', img);

  // effect ==============================
  r = 8;
  lw = r/4;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  // img.strokeStyle = "#C5332C";
  // img.fillStyle = "#F7743A";
  img.strokeStyle = "#2889D4";
  img.fillStyle = "#82E5E4";
  img.lineWidth = lw;
  img.fillPolygon(r, r, r-lw, 3)
  .strokePolygon(r, r, r-lw, 3);
  am.set('image', 'triangle', img)

  // rect
  r = 16;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.fillStyle = "#EC5252";
  img.fillPolygon(r, r, r, 4);
  am.set('image', 'redRect', img)
  r = 8;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.fillStyle = "#F2E128";
  img.fillPolygon(r, r, r, 4);
  am.set('image', 'yellowRect', img)

  // 爆発
  r = 32;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.fillStyle = "#E56F28";
  img.fillCircle(r, r, r);
  am.set('image', 'orangeCircle', img)

  r = 64;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.fillStyle = "#FFF";
  img.fillCircle(r, r, r);
  am.set('image', 'whiteCircle', img)

  // GAME OVER
  var shape = phina.display.Label({
    text: "GAME OVER",
    fontSize: 40,
    fontFamily: "Meirio",
    fill: "#EE7C29",
  });
  am.set('image', 'gameoverLabel', drawShape(shape))

}());

// 出現パターン
var ENEMY_PATTERNS = {
  targetLayer: null, // 追加対象

  "empty": {
    count: 1,
    interval: 1,
    action: function(y, x) {}
  },

  "liner": {
    count: 5,
    interval: 25,
    action: function(y, fromLeft) {
      var eType = "basic";
      var x = (fromLeft) ? -SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 1.2;
      y = y || 60;
      Enemy(x, y, eType, fromLeft).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

  "vTurns": {
    count: 6,
    interval: 30,
    action: function(y, goUp, fromLeft) {
      var eType = (goUp && fromLeft) ? "vTurnUpLeft" :
      (goUp) ? "vTurnUp" : // 左から出現
      (fromLeft) ? "vTurnDownLeft" : // 左から出現
      "vTurnDown";

      var x = (fromLeft) ? -SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 1.2;
      y = y || 40;
      Enemy(x, y, eType, fromLeft).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

  "verticals": {
    count: 8,
    interval: 30,
    action: function(y, fromLeft) {
      var eType = "verticalShot";
      var x = (fromLeft) ? -SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 1.2;
      y = y || 40;
      Enemy(x, y, eType, fromLeft).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

  "sinMoves": {
    count: 10,
    interval: 20,
    action: function(y, fromLeft) {
      var eType = "sinMove";
      var x = (fromLeft) ? -SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 1.2;
      y = y || 50;
      Enemy(x, y, eType, fromLeft).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

  "kabe": {
    count: 1,
    interval: 1,
    action: function() {
      var shift = SCREEN_HEIGHT / 12;
      var eType = "hardBody";
      for (var i = 0; i < 12; i++) {
        Enemy(SCREEN_WIDTH*1.2, i*shift+shift/2, eType).addChildTo(ENEMY_PATTERNS.targetLayer);
      }
    }
  },

  "mutekiSingle": {
    count: 1,
    interval: 1,
    action: function(y) {
      var eType = "muteki";
      y = y || 40;
      Enemy(SCREEN_WIDTH*1.2, y, eType).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

  "meteors": {
    count: 3,
    interval: 10,
    action: function(y) {
      var eType = "assalt";
      y = y || 40;
      Enemy(SCREEN_WIDTH*1.2, y, eType).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

};

/**
 * 敵出現タイムテーブル
 */
var TIME_TABLE = {
  frameSum: 0,
  pattern: [
    // [直前パターンからの待機フレーム, "編隊タイプ", 引数配列]

    // debug用 =====
    // [10, "vTurns", [60]],
    // [30, "vTurns", [SCREEN_HEIGHT-40, true, true]],
    // [30, "verticals", [SCREEN_HEIGHT-40]],

    // // ここから本番　=====
    // [100, "liner", []],
    // [120, "liner", [SCREEN_HEIGHT-60]],
    // [120, "liner"],
    // [120, "liner", [SCREEN_HEIGHT-60]],

    // [90, "meteors", [SCREEN_HEIGHT*0.3 | 0]],
    // [45, "meteors", [SCREEN_HEIGHT*0.7 | 0]],
    // [45, "meteors", [SCREEN_HEIGHT*0.3 | 0]],
    // [45, "meteors", [SCREEN_HEIGHT*0.7 | 0]],

    // // 魚群
    // [40, "sinMoves", [40, true]],
    [0, "sinMoves", [40]],
    [0, "sinMoves", [70]],
    [0, "sinMoves", [100]],
    [0, "sinMoves", [130]],
    [0, "sinMoves", [160]],
    [0, "sinMoves", [190]],
    [0, "sinMoves", [220]],

    // [40, "sinMoves", [10]],
    // [30, "sinMoves", [60]],

    // // V-atttack
    // [130, "verticals", [60]],
    [15, "verticals", [SCREEN_HEIGHT*0.7 | 0, true]],

    // // ボス前　壁
    // [400, "mutekiSingle", 120],
    // [30, "baqula", 120],
    // [0, "kabe"],
    // [120, "kabe"],
    // [120, "kabe"],

    [100, "boss"],
  ]
};

if (BOSS_ONLY) TIME_TABLE.pattern = [[100, "boss"]];
