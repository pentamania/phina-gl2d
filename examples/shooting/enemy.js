
/**
 * Enemy launcher

タスク例
"linear": {
  count: 4,
  action: function() { // 行う処理 }
  interval: 20,
  _tick: 0, // added
  _currentCount: 0, // added
}

*/
phina.define('EnemyLauncher', {
  superClass: "phina.util.EventDispatcher",

  init: function() {
    this.superInit();
    this._tasks = [];
  },

  pushTask: function(task) {
    task._tick = 0;
    task._currentCount = 0;
    this._tasks.push(task);
  },

  // 毎フレーム実行
  tick: function() {
    if (!this._tasks.length) return;

    this._tasks.each(function(task, i) {
      if (task == null) return;

      ++task._tick; // 個別のカウント
      if (task._tick%task.interval === 0) {
        var args = (Array.isArray(task.args)) ? task.args : [];
        task.action.apply(null, args);
        ++task._currentCount;
      }

      // task 終了
      if (task.count <= task._currentCount) {
        this._tasks[i] = null;
      }
    }.bind(this));

    // TODO: nullになったtask消す？
  }
});

/**
 * enemy
 */
phina.define('Enemy', {
  superClass: 'AbstractObjClass',

  _isAppeared: false, //画面内に出現済み
  isAnimating: false, // イベントアニメ中
  destroyable: true, // removeできる
  canAttack: true,

  init: function(x, y, type, fromLeft) {
    var eType = type.replace(/Up|Down|Left|Right/g, "");
    var data = ENEMY_TYPES[eType];
    this.superInit(data.texture);

    this.type = type;
    this.life = data.life;
    this.score = data.score || 0;
    this.target = bulletConfig.target;
    this.setPosition(x, y);

    // 初期移動速度
    var speed = data.speed || 2;
    this.vec = Vector2(-speed, 0);
    if (fromLeft) this.vec.x *= -1;

    // 判定サイズ
    this.radius = data.radius || 16;

    switch (type) {
      case "assalt":
        var rad = this.getTargetRadian();
        this.vec.set(
          speed * Math.cos(rad),
          speed * Math.sin(rad)
        );
        break;

      // case "vTurnDown":
      //   this.vec.set(-3, 0);
      //   break;
      // case "vTurnUp":
      //   this.vec.set(-3, 0);
      //   break;
      // case "vTurnDownLeft":
      //   this.vec.set(3, 0);
      //   break;
      // case "vTurnUpLeft":
      //   this.vec.set(3, 0);
      //   break;

      case "muteki":
        var d = 600;
        this.tweener.setLoop(1)
        .to({scaleX: -1}, d)
        .to({scaleX: 1}, d)
        break;

      default:
        break;
    }
  },

  // 倒された時の動作: 打ち返しなど
  ondestroyed: function() {},

  update: function() {
    this.position.add(this.vec);

    // removeしてよいかどうかのフラグ
    if (!this._isAppeared && !this.isOutOfScreen()) {
      this._isAppeared = true;
    }
    if (this.destroyable && this._isAppeared && this.isOutOfScreen()) {
      this.remove();
    }

    // 動き
    switch (this.type) {

      case "assalt":
        if (this.x < SCREEN_WIDTH * 0.8 && this.age%20 === 0) {
          this.fireBullet();
        }
        break;

      case "sinMove":
        var r = 2;
        var freq = 10;
        var rad = this.age * 0.01745 * freq;
        this.vec.y = Math.sin(rad) * r;
        this.rotation += 4;
        break;

      case "vTurnDown":
        if (this.age === 150) {
        // if (this.x < SCREEN_WIDTH * 0.3) {
          this.vec.set(2, 1);
          this.fireBullet();
        }
        break;
      case "vTurnDownLeft":
        if (SCREEN_WIDTH * 0.7 < this.x) {
          this.vec.set(-2, 1);
          this.fireBullet();
        }
        break;
      case "vTurnUp":
        if (this.x < SCREEN_WIDTH * 0.3) {
          this.vec.set(2, -1);
          this.fireBullet();
        }
        break;
      case "vTurnUpLeft":
        if (SCREEN_WIDTH * 0.7 < this.x) {
          this.vec.set(-2, -1);
          this.fireBullet();
        }
        break;

      case "orbit":
        if (this.age%10 === 0) {
          this.fireBullet();
        }
        break;

      case "verticalShot":
        if (this.age%20 === 0) {
          this.fireBullet();
        }
        break;

      case "hardBody":
        break;

      default:
        if (this.age === 100) {
          this.fireBullet();
        }
        break;
    }
  },

  // 弾の発射、キャラによって違う
  fireBullet: function() {
    if (!this.canAttack) return;

    switch (this.type) {
      case "orbit":
        var rad = (180).toRadian();
        Bullet(this.x, this.y, rad, 2).addChildTo(bulletConfig.layer);
        break;

      // 自分の上下に撃つ
      case "verticalShot":
        (2).times(function(i) {
          var rad = (90 + 180 * i).toRadian();
          Bullet(this.x, this.y, rad, 3).addChildTo(bulletConfig.layer);
        }.bind(this));
        break;

      // 自機に向かって撃つ
      default:
        var rad = this.getTargetRadian();
        Bullet(this.x, this.y, rad, 2).addChildTo(bulletConfig.layer);
        break;
    }
  },

  getTargetRadian: function() {
    return Math.atan2(this.target.y - this.y, this.target.x - this.x);
  }

});

/**
 * Mid Boss
 *
 */
phina.define('Boss', {
  superClass: 'Enemy',

  isBoss: true,
  _fullLife: 0,

  init: function() {
    var data = ENEMY_TYPES["boss"];
    this.superInit(0, 0, 'boss');
    this.animation = FrameAnimation('boss').attachTo(this).gotoAndPlay('fly');

    this.setPosition(SCREEN_WIDTH * 1.5, SCREEN_HEIGHT / 2);
    this.vec = Vector2(0, 0);
    this.isAnimating = true;
    this._fullLife = this.life;
    this._startPos = {x: SCREEN_WIDTH*0.8, y: SCREEN_HEIGHT*0.5};

    // 子機
    this.orbits = [];
    (2).times(function(i, num) {
      var orbit = Enemy(0, 0, 'orbit');
      orbit.destroyable = false;
      orbit.startDeg = (i * 360/num)| 0;
      this.orbits.push(orbit);
    }.bind(this));

    this.one('changePatternOne', function(){
      this.resetPosition();
    });
    this.one('changePatternTwo', function(){
      this.resetPosition();
    });
  },

  resetPosition: function() {
    this.isAnimating = true;
    this.tweener.clear()
    .to(this._startPos, 2400, 'easeOutQuad')
    .wait(300)
    .call(function() {
      this.age = 0;
      this.isAnimating = false;
    }.bind(this));

    return this;
  },

  // パターン変化で時間経過
  addOrbit: function(index) {

  },

  // 当たり判定をとるため、子機を親と同じレイヤーに配置する
  // onadded: function(e) {
  //   var self = this;
  //   var radius = 60;
  //   var angSpeed = 8;

  //   this.orbits.forEach(function(orbit, i) {
  //     orbit.addChildTo(self.parent)
  //     .on('enterframe', function(e) {
  //       var frame = e.app.frame;
  //       var radian = (orbit.startDeg + frame * angSpeed).toRadian();
  //       orbit.position.set(
  //         self.x + radius * Math.cos(radian),
  //         self.y + radius * Math.sin(radian)
  //       );
  //     });
  //   });
  // },

  onremoved: function() {
    this.orbits.each(function(orbit) {
      orbit.remove();
    });
    this.orbits = null;
  },

  destroyAnimation: function(duration) {
    duration = duration || 3000;
    this.tweener.clear()
    .by({y: 180, rotation: 30}, duration, 'easeOutQuad')
    // .call(cb)
  },

  update: function(app) {
    if (this.isAnimating) return;
    // TODO: 残りライフでパターン変える

    if (this.life < this._fullLife * 0.333) {
      // S字ムーブ
      this.flare('changePatternTwo');
      var period = 180; // 一周期にかかるフレーム数
      var radX = 40;
      var radY = 140;
      var degUnit = 180 / (period * 0.25);
      var deg = degUnit * this.age;
      var radian = RAD_UNIT * deg;
      this.x = this._startPos.x + radX * Math.sin(radian);
      this.y = this._startPos.y + radY * Math.sin(radian * 0.5);
      if (this.age%16 === 0) this.fireBullet();
    } else if (this.life < this._fullLife * 0.66) {
      // 上下
      this.flare('changePatternOne');
      var period = 500; // 一周期にかかるフレーム数
      var radY = 140;
      var degUnit = 180 / (period * 0.25);
      var deg = degUnit * this.age;
      var radian = RAD_UNIT * deg;
      this.x = this._startPos.x;
      this.y = this._startPos.y + radY * Math.sin(radian * 0.5);
      if (this.age%24 === 0) this.fireBullet();
    } else {
      // その場
      if (this.age%30 === 0) this.fireBullet();
    }


  },

  // appearAnimation: function() {
  //   this.tweener.clear()
  //   .to({x: SCREEN_WIDTH * 0.8}, 1000)
  //   .wait(1000)
  //   .call(function(){
  //     this.isAnimating = false;
  //     this.age = 0;
  //   }.bind(this));

  //   return this;
  // },

  // TODO: 3way　撃つ
  fireBullet: function() {
    (3).times(function(i, num){
      var rad = ((180 - 30) + 30 * i) * RAD_UNIT;
      Bullet(this.x, this.y, rad, 4).addChildTo(bulletConfig.layer);
    }.bind(this))
    var rad = 180;
  },

});