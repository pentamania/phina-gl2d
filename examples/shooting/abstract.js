
/**
 * プール
 */
phina.define('ObjectPool', {
  superClass: "phina.util.EventDispatcher",

  init: function() {
    this.superInit();
    this.objects = [];
    this._pointer = 0;
  },

  add: function(obj) {
    obj.isReady = true;
    this.objects.push(obj);
  },

  pick: function(cb) {
    var obj = null;
    this.objects.some(function(o){
      if (o.isReady) {
        o.isReady = false;
        obj = o;
        return true;
      }
    });

    if (obj && cb) cb(obj);
  },

  // いる？
  // recover: function(obj) {
  //   obj.isReady = true;
  // }

});

/**
 * ゲームオブジェクトの抽象クラス
 * ageの加算、 remove時の動作追加
 */
phina.define('AbstractObjClass', {
  superClass: "phina.display.Sprite",

  isAppeared: false,
  destroyable: true,

  init: function(image, width, height) {
    this.superInit(image, width, height);
    this.setBoundingType('circle');
    this.targetLayer = null;
    this.isReady = true;
    this.age = 0;

    this.on('removed', function(){
      this.isReady = true;
    });

    this.on('enterframe', function(){
      this.age++;
    });
  },

  isOutOfScreen: function() {
    return (
      this.x < -10 ||
      SCREEN_WIDTH+10 < this.x ||
      this.y < -10 ||
      SCREEN_HEIGHT+10 < this.y
    );
  },

  // removeしてよいかどうかをチェック
  checkRemoval: function() {
    if (!this.isAppeared && !this.isOutOfScreen()) {
      this.isAppeared = true;
    }
    if (this.destroyable && this.isAppeared && this.isOutOfScreen()) {
      this.remove();
    }
  },

});


/**
 * Enemy launcher
 * ザコ敵の出現を管理

Wave data例
[直前パターンからの待機フレーム, "編隊タイプ", 引数配列, 上書きオプション]
[40, "linear", [240, 120, 45, 140], {count: 14, interval: 20}],

タスク例
"linear": {
  count: 4, // 初期値
  interval: 20, // 初期値
  args: : [] // actionの引数、waveDataで設定。optional
  action: function() { // 行う処理 }
  _tick: 0, // added
  _currentCount: 0, // added
}

*/
phina.define('EnemyLauncher', {
  superClass: "phina.util.EventDispatcher",

  _tasks: [],
  _waveTable: null,
  _pointer: 0,
  _waitSum: 0,
  age: 0,

  init: function(tableArray) {
    this.superInit();
    if (!ENEMY_PATTERNS) throw Error("ENEMY_PATTERNSが定義されていません");
    if (tableArray) this.setTable(tableArray);
  },

  _pushTask: function(waveData) {
    var wait = waveData[0];
    var name = waveData[1];
    var args = waveData[2];
    var options = waveData[3];
    var task = ({}).$extend(ENEMY_PATTERNS[name]); // clone
    if (args != null) task.args = args;

    this.pushTask(task, options);
    this._pointer++;
    this._waitSum += wait;
  },

  pushTask: function(task, option) {
    if (option != null) task.$extend(option);
    task._tick = 0;
    task._currentCount = 0;

    this._tasks.push(task);
  },

  // 毎フレーム実行
  tick: function() {
    this.age++;

    // taskの登録
    var pointer = this._pointer;
    var nextWave = this._waveTable[pointer];
    if (nextWave && this._waitSum + nextWave[0] < this.age) {
      this._pushTask(nextWave);
      this._checkNextWave(pointer);
    }

    this._stepTasks();

    // TODO: nullになったtask消す？
  },

  // タスクのステップ
  _stepTasks: function() {
    if (!this._tasks.length) return;

    this._tasks.each(function(task, i) {
      if (task == null) return;

      ++task._tick; // 個別のカウント
      if (task._tick % task.interval === 0) {
        var args = (Array.isArray(task.args)) ? task.args : [];
        task.action.apply(null, args);
        ++task._currentCount;
      }

      // task完了
      if (task.count <= task._currentCount) {
        this._tasks[i] = null;
      }
    }.bind(this));
  },

  // テーブル生成＆初期化
  setTable: function(tableArray) {
    this._waveTable = [].concat(tableArray);
    this._pointer = 0;
    this._waitSum = 0;
    this.age = 0;

    return this;
  },

  _checkNextWave: function(index) {
    var nextWave = this._waveTable[index+1];
    if (nextWave) {
      // 次タスクの待ち時間が0だったら同じフレーム中に登録、再帰処理
      if (nextWave[0] === 0) {
        this._pushTask(nextWave);
        this._checkNextWave(index+1);
      }
    } else {
      // テーブル終了
      this.flare('waveend');
      return;
    }
  },

});
