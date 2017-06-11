
/**
 * 敵出現タイムテーブル
 * ステージはとりあえず一つ
 */
;(function(global) {
  /*
    テーブル用の特殊な平準化処理
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
    // frameSum: 0,
    pattern: null,
  };

  /**
   * [五芒星状にてんかいする]
   * @param  {[type]} initWait  [最初のウェイト]
   * @param  {[type]} centerX   [中心x]
   * @param  {[type]} centerY   [中心y]
   * @param  {[type]} radius    [五芒星半径]
   * @param  {[type]} baseAngle [五芒星傾き]
   * @param  {[type]} ratio     [出現位置倍率：遠くから出現させるときとか]
   * @return {array}           []
   */
  var createPentagramPattern = function(initWait, centerX, centerY, radius, baseAngle, ratio) {
    var arr = [];
    var ratio = ratio || 2;
    var baseAngle = baseAngle || 0;
    var _wait = 0;

    (5).times(function(i, n) {
      _wait = (i !== 0) ? 0 : initWait;
      var radian = (baseAngle + 72 * i) * Math.DEG_TO_RAD;
      var deg = baseAngle + 180 - 18/ratio + 72 * i;
      arr.push([_wait, "liner", [centerX + radius*ratio * Math.cos(radian), centerY + radius*ratio * Math.sin(radian), deg, null, 4], {count: 6, interval: 10}]);
    });

    return arr;
  };

  /**
   * 魚群パターン
   */
  var createSinesPattern = function(initWait, yStart, yInterval, num, fromLeft) {
    var arr = [];

    (num).times(function(i, n) {
      wait = (i !== 0) ? 0 : initWait;
      var y = yStart + i * yInterval;
      arr.push([wait, "sines", [y, fromLeft]]);
    });

    return arr;
  };

  /**
   * 通路のように壁パターンを並べる
   * startVoidIndexは 0~12
   */
  var createCorridorPattern = function(initWait, interval, firstVoidIndex, num, reverse) {
    var arr = [];
    var voidLength = 2;
    var speed = 6;

    (num).times(function(i, n) {
      wait = (i !== 0) ? interval : initWait;
      // var nextIndex = (reverse) ? firstVoidIndex - i : firstVoidIndex + i;
      var voidStart = Math.clamp(nextIndex, 0, 11);
      arr.push([wait, "kabe", [voidStart, voidLength, speed]]);
    });

    return arr;
  };

  // 位置の簡略化
  var gx = phina.util.Grid(SCREEN_WIDTH, 20);
  var gxs = function(n) { return gx.span(n); };
  var DEF_X = gx.span(22);
  var DEF_NX = gx.span(-2);

  var gy = phina.util.Grid(SCREEN_HEIGHT, 20);
  var gys = function(n) { return gy.span(n); };
  var DEF_Y = gy.span(10);

  var pattern = [
    // [直前パターンからの待機フレーム, "編隊タイプ", 引数配列, 上書きオプション]

    // debug用 =====
    // createPentagramPattern(140, gxs(10), gys(10), 60, null),
    // createPentagramPattern(140, gxs(10), gys(14), 60, 10),

    // [90, "assaults", [DEF_X, gy.span(13)]],
    // [60, "assaults", [DEF_X, gy.span(10)]],
    // [60, "assaults", [DEF_X, gy.span(7)]],

    // 交差: 右下
    // [30, "verticals", [gx.span(17), gy.span(-2), 90]],
    // [0, "verticals", [DEF_NX, gy.span(16), 0]],

    // 交差: 左上
    // [400, "verticals", [gx.span(3), gy.span(22), 270]],
    // [0, "verticals", [DEF_X, gy.span(4)]], // 横

    // [40, "whirls", [240, 120, 45, 140], {count: 14, interval: 20}],
    // [0, "mine", [100, 100, 32]],
    // [0, "mine", [170, 170]],
    // [40, "flower", [120, 120, 45, 140], {count: 4, interval: 20}],
    // [30, "homings", [gx.span(22), 100]],

    // createSinesPattern(140, 70, 30, 3, false),

    // ここから本番　=====

    // 基本
    [45, "liner", [null, gys(5), null, 45]],
    [120, "liner", [null, gys(15), null, -45]],
    [120, "liner", [null, gys(5), null, 45]],
    [120, "liner", [null, gys(15), null, -45]],

    // 上下から
    [120, "liner", [gxs(17), gys(-4), 90]],
    [100, "liner", [gxs(16), gys(24), -90]],
    [100, "liner", [gxs(15), gys(-4), 90]],
    [100, "liner", [gxs(14), gys(24), -90]],

    // uzu
    [240, "whirls", [gxs(16), gys(5), 160, 80]],
    [100, "whirls", [gxs(16), gys(15), 200, 80]],

    // 追尾
    [130, "homings", [gxs(24), gys(4)]],
    [0, "homings", [gxs(24), gys(16)]],
    [130, "homings", [gxs(24), gys(2)]],
    [0, "homings", [gxs(24), gys(18)]],

    // 突撃隊
    [110, "assaults", [DEF_X, gys(6)]],
    [45, "assaults", [DEF_X, gys(14)]],
    [45, "assaults", [DEF_X, gys(6)]],

    // kabeで一区切り
    [120, "kabe", [1, 10]],
    // [60, "kabe", [2, 2]],
    // [60, "kabe", [3, 1]],

    // 魚群
    createSinesPattern(140, gys(2), 30, 3, false),
    // [0, "sines", [70]],
    // [0, "sines", [100]],
    // [0, "sines", [130]],
    // [0, "sines", [160]],
    // [0, "sines", [190]],
    // [0, "sines", [220]],

    // めっちゃ跳ねる
    [130, "sines", [0, false, SCREEN_HEIGHT/2]],
    [0, "sines", [300, false, SCREEN_HEIGHT/2]],

    // 魚群： 挟み撃ち
    [140, "sines", [40, true]],
    [20, "sines", [70, true]],
    [20, "sines", [100, true]],

    // V-atttack
    // [130, "verticals", [DEF_X, 60]],

    // 最後　演出
    createPentagramPattern(140, gxs(10), gys(10), 120, 200, 4),

    // 最終通路
    // [15, "verticals", [SCREEN_HEIGHT*0.7 | 0, true]], // hardmodeならあり？
    // createCorridorPattern(20, 10, 0, 11),
    // createCorridorPattern(10, 10, 9, 10, true),
    // // createCorridorPattern(10, 10, 1, 7),
    // createCorridorPattern(10, 10, 7, 3, true),
    // createCorridorPattern(10, 10, 3, 3),
    // アイワナ式壁
    // [60, "kabe", [2, 1]],
    // [30, "kabe", [3, 1]],
    // [30, "kabe", [4, 1]],
    // [80, "kabe", [5, 2, 9]], // 追い越し初見殺し

    // [100, "boss"],
  ];

  if (BOSS_ONLY) {
    timeTable.pattern = [[0, "empty"]];
  } else {
    timeTable.pattern = flatten(pattern);
  }

  global.TIME_TABLE = timeTable;

}(window));

console.table(TIME_TABLE.pattern);