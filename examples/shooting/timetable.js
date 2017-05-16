
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

  var tabelMethodStar = function() {
    var arr = [];
    (5).times(function(i, n) {
      arr.push([40, "liner", [null, 240 - 20*i], {count: 14, interval: 20}]);
      arr.push([40, "liner", [null, 240 - 20*i, 200], {count: 8, interval: 20}]);
    });
    return arr;
  };

  var pattern = [
    // [直前パターンからの待機フレーム, "編隊タイプ", 引数配列]

    // debug用 =====
    // [30, "verticals", [SCREEN_HEIGHT-40]],
    // [40, "whirls", [240, 120, 45, 140], {count: 14, interval: 20}],
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
    [30, "homings", [SCREEN_WIDTH * 1.2, SCREEN_HEIGHT + 100]],
    tabelMethodStar(),
    // 五芒星 70 todo
    [
      [40, "liner", [SCREEN_WIDTH/2 + 127*2 * Math.cos((230+15)* Math.DEG_TO_RAD), SCREEN_HEIGHT/2 - 127*2 * Math.sin((230+15)* Math.DEG_TO_RAD), -70], {count: 10}],
      [0, "liner", [SCREEN_WIDTH/2 + 127*2 * Math.cos((90+15)* Math.DEG_TO_RAD), SCREEN_HEIGHT/2 - 127*2 * Math.sin((90+15)* Math.DEG_TO_RAD), 70], {count: 10}],
      [0, "liner", [SCREEN_WIDTH/2 + 127*2 * Math.cos((160+15)* Math.DEG_TO_RAD), SCREEN_HEIGHT/2 - 127*2 * Math.sin((160+15)* Math.DEG_TO_RAD), 0], {count: 10}],
    ],

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

    // アイワナ壁
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
