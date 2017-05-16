
/**
 * 敵出現タイムテーブル
 * ステージはとりあえず一つ
 */
var TIME_TABLE = {
  frameSum: 0,
  pattern: [
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
    [30, "homings", [SCREEN_WIDTH * 0.7, -100]],
    [30, "homings", [SCREEN_WIDTH * 1.2, SCREEN_HEIGHT + 100]],

    // あとで使う
    // [30, "kabe", [2, 1]],
    // [30, "kabe", [3, 1]],
    // [30, "kabe", [4, 1]],
    // [30, "kabe", [5, 2, 10]], // 追い越し初見殺し

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
