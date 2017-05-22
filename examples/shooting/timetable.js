
/**
 * 敵出現タイムテーブル
 * ステージはとりあえず一つ
 */
;(function(global) {
  /*
    平準化処理
    flatten([ [30, "pattern"...], [[40, "inner",...], [40, "inner",...]], ...])
    -> [ [30, "pattern" ...], [40, "inner",...], [40, "inner",...], ...]
  */
  var flatten = function(pattternArray) {
    var arr = [];
    pattternArray.forEach(function(pattern){
      if (typeof(pattern[0]) !== "number") {
        pattern.forEach(function(childPattern) {
          arr.push(childPattern);
        });
      } else {
        arr.push(pattern);
      }
    });

    return arr;
  };

  var timeTable = {
    frameSum: 0,
    pattern: null,
  };

  var createPentagramPattern = function(wait, centerX, centerY, radius, baseAngle, ratio) {
    var arr = [];
    var ratio = ratio || 2;
    var baseAngle = baseAngle || 0;
    var _wait = 0;

    (5).times(function(i, n) {
      _wait = (i !== 0) ? 0 : wait;
      var radian = (baseAngle + 72 * i) * Math.DEG_TO_RAD;
      var deg = baseAngle + 180 - 18/ratio + 72 * i;
      arr.push([_wait, "liner", [centerX + radius*ratio * Math.cos(radian), centerY + radius*ratio * Math.sin(radian), deg, null, 4], {count: 6, interval: 10}]);
    });

    return arr;
  };

  // 位置の簡略化
  var gx = phina.util.Grid(SCREEN_WIDTH, 20);
  var DEF_X = gx.span(22);
  var DEF_NX = gx.span(-2);
  var gy = phina.util.Grid(SCREEN_HEIGHT, 20);
  var DEF_Y = gy.span(10);

  var pattern = [
    // [直前パターンからの待機フレーム, "編隊タイプ", 引数配列]

    // debug用 =====
    // [30, "verticals", [DEF_X, DEF_Y, 180, 3]],
    // [50, "verticals", [DEF_NX, gy.span(12), 0, 3]],
    [30, "verticals", [gx.span(17), gy.span(-2), 90]],
    [0, "verticals", [DEF_NX, gy.span(16), 0]],

    [400, "verticals", [gx.span(3), gy.span(22), 270]],
    [0, "verticals", [DEF_X, gy.span(4)]], // 横

    [40, "whirls", [240, 120, 45, 140], {count: 14, interval: 20}],
    // [0, "mine", [100, 100, 32]],
    // [100, "mine", [150, 150]],
    // [0, "mine", [170, 170]],
    // [0, "mine", [200, 200]],
    // [40, "liner", [null, 240], {count: 14, interval: 20}],
    // [40, "liner"],
    // [10, "liner", [null, null, 190, 90]],
    // [10, "vTurns", [null, null, 160, 90]],
    // [40, "flower", [120, 120, 45, 140], {count: 4, interval: 20}],
    // [0, "kabe"],
    // [30, "homings", [SCREEN_WIDTH * 0.7, -100]],

    // createPentagramPattern(40, SCREEN_WIDTH*0.1, SCREEN_HEIGHT*0.2, 120, null, 4),
    // createPentagramPattern(40, SCREEN_WIDTH*0.1, SCREEN_HEIGHT * 0.2, 80, null, 2),
    // createPentagramPattern(120, SCREEN_WIDTH*0.5, SCREEN_HEIGHT*0.5, 120),
    // createPentagramPattern(120, SCREEN_WIDTH*0.9, SCREEN_HEIGHT*0.9, 80, null, 2),

    // ここから本番　=====

    // [100, "liner", []],
    // [120, "liner", [SCREEN_HEIGHT-60]],
    // [120, "liner"],
    // [120, "liner", [SCREEN_HEIGHT-60]],

    // [90, "meteors", [SCREEN_HEIGHT*0.3 | 0]],
    // [45, "meteors", [SCREEN_HEIGHT*0.7 | 0]],
    // [45, "meteors", [SCREEN_HEIGHT*0.3 | 0]],
    // [45, "meteors", [SCREEN_HEIGHT*0.7 | 0]],

    // // 魚群
    // [40, "sines", [40, true]],
    // [20, "sines", [70, true]],
    // [20, "sines", [100, true]],

    // [0, "sines", [300, null, SCREEN_HEIGHT/2]],
    // [0, "sines", [70]],
    // [0, "sines", [100]],
    // [0, "sines", [130]],
    // [0, "sines", [160]],
    // [0, "sines", [190]],
    // [0, "sines", [220]],

    // // V-atttack
    // [130, "verticals", [60]],
    // [15, "verticals", [SCREEN_HEIGHT*0.7 | 0, true]],

    // アイワナ式の壁
    // [30, "kabe", [2, 1]],
    // [30, "kabe", [3, 1]],
    // [30, "kabe", [4, 1]],
    // [30, "kabe", [5, 2, 10]], // 追い越し初見殺し

    // // ボス前　壁
    // [400, "mutekiSingle", 120],
    // [30, "baqula", 120],
    // [0, "kabe"],
    // [120, "kabe"],
    // [120, "kabe"],

    [100, "boss"],
  ];

  timeTable.pattern = flatten(pattern);

  global.TIME_TABLE = timeTable;
}(window));

console.table(TIME_TABLE.pattern);
