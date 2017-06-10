
// てきとうにテクスチャ素材
;(function(){
  var am = phina.asset.AssetManager;
  var r, lw, img, shape;
  var drawShape = function(shape) {
    shape.render(shape.canvas);
    return shape.canvas;
  };
  var D2R = Math.DEG_TO_RAD;

  // 敵弾
  r = 8;
  lw = r/4;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.strokeStyle = "#143F10";
  img.fillStyle = "#E557C5";
  img.lineWidth = lw;
  img.fillCircle(r, r, r-lw)
  .strokeCircle(r, r, r-lw);
  am.set('image', 'enemyNormalbullet', img);

  // 自弾
  r = 5;
  lw = r/3;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.strokeStyle = "#A90A0A";
  img.fillStyle = "#EE4B4B";
  img.lineWidth = lw;
  img.fillCircle(r, r, r-lw)
  .strokeCircle(r, r, r-lw);
  am.set('image', 'redBullet', img);

  // カード型
  var w = 16;
  var h = 10;
  lw = 2;
  img = phina.graphics.Canvas().setSize(w+lw*2, h+lw*2);
  img.strokeStyle = "#F4240E";
  img.fillStyle = "#FA1752";
  img.lineWidth = lw;
  img.fillRect(0, 0, w, h)
  .strokeRect(0, 0, w, h)
  am.set('image', 'redCard', img);

  // △
  r = 12;
  lw = r/3;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.strokeStyle = "#A90A85";
  img.fillStyle = "#EE4B4B";
  img.lineWidth = lw;
  img.transformCenter()
  .rotate(90 * D2R)
  .fillPolygon(0, 0, r-lw, 3)
  .strokePolygon(0, 0, r-lw, 3);
  am.set('image', 'redTriangle', img);

  // 天アイテム
  shape = phina.display.Label({
    text: "金",
    fontSize: 14,
    fontFamily: "Meirio",
    fill: "#E7EE29",
    stroke: "#gold",
  });
  am.set('image', 'scoreItem', drawShape(shape))

  r = 14;
  shape = phina.ui.Button({
    text: "P",
    textAlign: 'center',
    width: r,
    height: r,
    fontSize: r,
    cornerRadius: 2,
    fontFamily: "Meirio",
    fill: "#F82B2B",
    stroke: "transparent",
  });
  am.set('image', 'powerItem', drawShape(shape))

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

  // teki: ita
  r = 16;
  lw = r/4 | 0;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.strokeStyle = "#C71D51";
  img.fillStyle = "#E0E557";
  img.lineWidth = lw;
  img.fillRect(0, 0, r*2, r*2)
  .strokeRect(0, 0, r*2, r*2)
  am.set('image', 'beniyaIta', img);

  // teki: heart
  r = 16;
  lw = r/4 | 0;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.strokeStyle = "#C71D51";
  img.fillStyle = "#37E550";
  img.lineWidth = lw;
  img.transformCenter()
  .rotate(-90 * D2R)
  .fillHeart(0, 0, r-lw)
  .strokeHeart(0, 0, r-lw);
  // .strokeHeart(r, r, r-lw);
  // img.fillHeart(r, r, r-lw)
  am.set('image', 'rightHeart', img);


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
  am.set('image', 'whiteCircle', img);

  r = 8;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.fillStyle = "#312D4B";
  img.fillCircle(r, r, r);
  am.set('image', 'appearEffect', img);

  // button BG
  r = 32;
  lw = r/4;
  img = phina.graphics.Canvas().setSize(r*2, r*2);
  img.strokeStyle = "#631416";
  img.fillStyle = "#EBAF97";
  img.lineWidth = lw;
  img.fillPolygon(r, r, r-lw, 6);
  img.strokePolygon(r, r, r-lw, 6);
  am.set('image', 'buttonBG', img);

  // GAME OVER
  var shape = phina.display.Label({
    text: "GAME OVER",
    fontSize: 40,
    fontFamily: "Meirio",
    fill: "#EE7C29",
  });
  am.set('image', 'gameoverLabel', drawShape(shape))

  // filterのセット
  var blueFilter = function(pixel, i, x, y, imageData) {
    if (pixel[3] === 0) return;
    var data = imageData.data;
    data[i+0] *= 0.3;
    data[i+1] *= 0.3;
  };
  am.set('filter', 'blueFilter', blueFilter);

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
    count: 8,
    interval: 25,
    action: function(x, y, degree, nextDegree, speed) {
      x = (x != null) ? x : SCREEN_WIDTH * 1.2;
      y = (y != null) ? y : 60;
      degree = (degree != null) ? degree : 180;
      BasicGuy(x, y, degree, nextDegree, speed).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

  "homings": {
    count: 4,
    interval: 22,
    action: function(x, y, speed, startAngle) {
      x = (x != null) ? x : SCREEN_WIDTH * 1.2;
      y = (y != null) ? y : 60;
      HomingGuy(x, y, speed, startAngle).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

  "mine": {
    count: 1,
    interval: 1,
    action: function(x, y, bulletNum) {
      x = x || SCREEN_WIDTH * 0.5;
      y = y || SCREEN_HEIGHT * 0.5;
      FloatingMineGuy(x, y, bulletNum).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

  "whirls": {
    count: 5,
    interval: 18,
    action: function(x, y, deg, rad) {
      // var eType = "whirl";
      x = x || SCREEN_WIDTH * 0.5;
      y = y || SCREEN_HEIGHT * 0.5;
      // Enemy(x, y, eType).addChildTo(ENEMY_PATTERNS.targetLayer);
      WhirlGuy(x, y, deg, rad).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

  "flower": {
    count: 1,
    interval: 1,
    action: function(x, y, gap, radius) {
      x = x || SCREEN_WIDTH * 0.5;
      y = y || SCREEN_HEIGHT * 0.5;
      var unit = 360 / gap;
      for (var i = unit; i >= 0; i--) {
        WhirlGuy(x, y, gap*i, radius).addChildTo(ENEMY_PATTERNS.targetLayer);
      }
    }
  },

  "verticals": {
    count: 8,
    interval: 30,
    // action: function(y, fromLeft, speed) {
    action: function(x, y, degree, speed) {
      x = (x != null) ? x : SCREEN_WIDTH * 1.2;
      y = (y != null) ? y : 40;
      degree = (degree != null) ? degree : 180;
      VerticalShotGuy(x, y, degree, speed).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

  "sines": {
    count: 10,
    interval: 20,
    action: function(y, fromLeft, fluctRadius) {
      // var eType = "sinMove";
      var x = (fromLeft) ? -SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 1.2;
      var directionAngle = (fromLeft) ? 0 : 180;
      y = y || 50;

      // Enemy(x, y, eType, fromLeft).addChildTo(ENEMY_PATTERNS.targetLayer);
      var e = SineGuy(x, y, directionAngle).addChildTo(ENEMY_PATTERNS.targetLayer);
      if (fluctRadius != null) e.fluctRadius = fluctRadius;
    }
  },

  "kabe": {
    count: 1,
    interval: 1,
    action: function(voidStart, voidLength, speed) {
      var shift = SCREEN_HEIGHT / 12;
      var eType = "hardBody";
      voidLength = voidLength || 1;
      if (voidStart != null) {
        var voidEnd = voidStart + voidLength;
      }

      for (var i = 0; i < 12; i++) {
        // 隙間をあける
        if (voidStart != null && voidStart <= i && i <= voidEnd) {
          continue;
        }
        var e = EnemyAbstract(eType).addChildTo(ENEMY_PATTERNS.targetLayer);
        e.setPosition(SCREEN_WIDTH * 1.5, i * shift + shift/2);
        e.setVectorAngle(180, speed);
        // Enemy(SCREEN_WIDTH * 1.2, i * shift + shift/2, eType).addChildTo(ENEMY_PATTERNS.targetLayer);
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

  "assaults": {
    count: 3,
    interval: 10,
    action: function(x, y) {
      y = (y != null) ? y : 40;
      x = (x != null) ? x : SCREEN_WIDTH * 1.2;
      AssaultGuy(x, y).addChildTo(ENEMY_PATTERNS.targetLayer);
    }
  },

};
