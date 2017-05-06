
/**
 * Enemy launcher

タスク例
"linear": {
  count: 4, // 初期値
  interval: 20, // 初期値
  action: function() { // 行う処理 }
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

  // pushTask: function(task, actionNum, interval) {
  pushTask: function(task, option) {
    if (option != null) task.$extend(option);
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
      if (task._tick % task.interval === 0) {
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

  _isAppeared: false, // 画面内に出現済み
  isAnimating: false, // イベントアニメ中
  destroyable: true, // removeできる
  canAttack: true,

  init: function(x, y, type, directionAngle) {
    var eType = type.replace(/Up|Down|Left|Right/g, "");
    var data = ENEMY_TYPES[eType];
    this.superInit(data.texture);

    this.type = type;
    this.life = data.life;
    this.score = data.score || 0;
    this.target = bulletConfig.target;
    this.setPosition(x, y);

    // 初期移動速度
    var speed = this.speed = (data.speed != null) ? data.speed : 2;
    this.vec = Vector2(-speed, 0);
    if (directionAngle != null) {
      this.vec.fromAngle(directionAngle * RAD_UNIT, speed);
    }

    // 判定サイズ
    this.radius = data.radius || 16;

    switch (type) {
      // プレイヤーに突っ込む
      case "assalt":
        var rad = this.getTargetRadian();
        this.vec.set(
          speed * Math.cos(rad),
          speed * Math.sin(rad)
        );
        break;

      case "sinMove":
        this.baseY = this.y;
        break;

      // case "whirl":
      //   this.axis = ({}).$extend(this.position);
      //   this.vec.set(0, 0);
      //   this.startR = 250;
      //   this.startDeg = 0;
      //   this.attenuation = 1.1; // 減衰量
      //   this.destroyable = false;
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

    switch (this.type) {
      case "assalt":
        if (this.x < SCREEN_WIDTH * 0.8 && this.age%20 === 0) {
          this.fireBullet();
        }
        break;

      case "sinMove":
        // TODO: パラメータを自由に変えられるようにする？
        var r = 30; // 半径
        var frequency = 4; // 周波数、高いほどうねうねする
        var rad = this.age * frequency * RAD_UNIT;
        this.y = this.baseY + Math.sin(rad) * r;
        // this.rotation += 4;
        break;

      // case "whirl":
      //   // if (this.startR > 0) this.startR--;
      //   // 復路は消せるように
      //   if (!this.destroyable && this.startR <= 0 ) {
      //     this.destroyable = true;
      //   }
      //   var r = this.startR -= this.attenuation; // 半径
      //   var rad = (this.startDeg + this.age) * RAD_UNIT * this.speed;
      //   this.setPosition(
      //     this.axis.x + Math.cos(rad) * r,
      //     this.axis.y + Math.sin(rad) * r
      //   );
        // break;

      // V字移動型
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
        // do nothing
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
 * 敵キャラ抽象クラス
 */
phina.define('EnemyAbstract', {
  superClass: 'AbstractObjClass',

  _isAppeared: false, // 画面内に出現済み
  isAnimating: false, // イベントアニメ中
  destroyable: true, // removeできる
  canAttack: true,

  init: function(typeName, isSpecialType) {
    var data = ENEMY_TYPES[typeName];
    this.superInit(data.texture);

    this.type = typeName;
    this.life = data.life;
    this.score = data.score || 0;
    this.target = bulletConfig.target;
    // this.setPosition(x, y);

    // 初期移動速度
    var speed = this.speed = (data.speed != null) ? data.speed : 2;
    this.vec = Vector2(-speed, 0);

    // 判定サイズ
    this.radius = data.radius || 16;

    // 汎用処理
    if (!isSpecialType) {
      this.on('enterframe', function() {
        if (!this.isAnimating) {
          this.position.add(this.vec);
        }

        // removeしてよいかどうかのフラグ
        if (!this._isAppeared && !this.isOutOfScreen()) {
          this._isAppeared = true;
        }
        if (this.destroyable && this._isAppeared && this.isOutOfScreen()) {
          this.remove();
        }
      });
    }

  },

  // setSpeed: function(speed) {
  // },

  setVectorAngle: function(angle, speed) {
    if (speed != null) this.speed = speed;
    this.vec.fromAngle(angle * RAD_UNIT, this.speed);
  },

  // 仮想
  fireBullet: function() {
    if (!this.canAttack) return;

    // 自機に向かって撃つ
    var rad = this.getTargetRadian();
    Bullet(this.x, this.y, rad, 2).addChildTo(bulletConfig.layer);
  },

  getTargetRadian: function() {
    return Math.atan2(this.target.y - this.y, this.target.x - this.x);
  }

});

/**
 * 方向転換型
 *
 */
phina.define('BasicGuy', {
  superClass: 'EnemyAbstract',

  _transformSum: 0,

  init: function(x, y, initialDegree, nextDegree) {
    this.superInit('basic');
    this.setPosition(x, y);

    if (initialDegree) {
      this.setVectorAngle(initialDegree);
    }

    if (nextDegree) {
      this.one('changeRoute', function() {
        this.setVectorAngle(nextDegree);
      });
    }

    this.one('fireBullet', function() {
      this.fireBullet();
    })
  },

  update: function (app) {
    if (!this.isAnimating) {
      // 移動した分
      this._transformSum += this.vec.length();
    }

    // if (this.age === 180) {
    // if (this.has('changeRoute') && this._transformSum > SCREEN_WIDTH*0.5) {
    if (this._transformSum > SCREEN_WIDTH * 0.5) {
      if (this.has('changeRoute')) this.flare('changeRoute');
      this.flare('fireBullet');
    }

  },

});

/**
 * 渦を巻く敵
 */
phina.define('WhirlGuy', {
  superClass: 'EnemyAbstract',

  init: function(x, y, startDegree, startRadius, disableAttack) {
    this.superInit('whirl', true);

    this.axis = Vector2(x, y);
    this.startDeg = startDegree || 0; // const
    this.rotRadius = startRadius || 250;
    this.attenuation = 1; // 半径減衰量 これもパラメータせっていできるようにする？
    this.vec = null;

    if (!disableAttack) this.one('fireBullet', this.fireBullet.bind(this));
  },

  update: function (app) {
    if (this.destroyable && this.isOutOfScreen()) {
      this.remove();
    }

    // 復路は消せるように
    if (!this.destroyable && this.rotRadius <= 0 ) {
      this.destroyable = true;
      this.flare('fireBullet');
    }

    var r = this.rotRadius -= this.attenuation; // 半径
    var rad = (this.startDeg + this.age * this.speed) * RAD_UNIT;
    this.setPosition(
      this.axis.x + Math.cos(rad) * r,
      this.axis.y - Math.sin(rad) * r
    );
  },

  fireBullet: function() {
    var rad = this.startDeg.toRadian();
    Bullet(this.x, this.y, rad, 3).addChildTo(bulletConfig.layer);
  }
});

/**
 * 自爆型
 */
phina.define('FloatingMineGuy', {
  superClass: 'EnemyAbstract',

  init: function(x, y, bulletNum, destroyTime) {
    this.superInit("mine");
    this.vec = Vector2(0, 0);
    this.setPosition(x, y);
    this.setScale(2.5, 2.5);
    this.alpha = 0;
    this.rotation = 600;

    bulletNum = bulletNum || 12;
    destroyTime = destroyTime || 1000;
    this.isAnimating = true;
    this.tweener.clear()
    .to({scaleX: 1.2, scaleY: 1.2, rotation: 0, alpha: 1}, 600, "easeOutQuint")
    .call(function() {
      // 当たり判定
      this.isAnimating = false;
    }, this)
    .wait(destroyTime)
    .call(function() {
      this.selfDestroy(bulletNum);
    }, this)
  },

  selfDestroy: function(bulletNum) {
    var rad = 360 / bulletNum * RAD_UNIT;
    for (var i = 0; i < bulletNum; i++) {
      Bullet(this.x, this.y, rad * i, 3).addChildTo(bulletConfig.layer);
    }

    this.remove();
  },

  update: function() {

  },

});

/**
 * (Mid) Boss
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
    // this.vec = Vector2(0, 0);
    this.isAnimating = true;
    this._fullLife = this.life;
    this._initialPos = {x: SCREEN_WIDTH*0.8, y: SCREEN_HEIGHT*0.5};

    // 子機
    this.orbits = [];
    (2).times(function(i, num) {
      var orbit = Enemy(0, 0, 'orbit');
      orbit.destroyable = false;
      orbit.startDeg = (i * 360/num)| 0;
      this.orbits.push(orbit);
    }.bind(this));

  },

  resetPosition: function() {
    this.isAnimating = true;
    this.tweener.clear()
    .to(this._initialPos, 1200, 'easeOutQuad')
    .wait(300)
    .call(function() {
      this.age = 0;
      this.isAnimating = false;
    }.bind(this));

    return this;
  },

  addOrbit: function(index) {
    var self = this;
    var radius = 60;
    var angSpeed = 8;
    this.orbits.forEach(function(orbit, i) {
      orbit.addChildTo(self.parent)
      .on('enterframe', function(e) {
        var frame = e.app.frame;
        var radian = (orbit.startDeg + frame * angSpeed).toRadian();
        orbit.position.set(
          self.x + radius * Math.cos(radian),
          self.y + radius * Math.sin(radian)
        );
      });
    });
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

  // 傾く
  destroyAnimation: function(duration) {
    duration = duration || 3000;
    this.tweener.clear()
    .by({y: 180, rotation: 30}, duration, 'easeOutQuad')
    // .call(cb)
  },

  update: function(app) {
    if (this.isAnimating) return;

    switch (this._pattern) {
      case "sMove":
        // S字を描くように
        var period = 180; // 一周期にかかるフレーム数
        var radX = 40;
        var radY = 140;
        var degUnit = 180 / (period * 0.25);
        var deg = degUnit * this.age;
        var radian = RAD_UNIT * deg;
        this.x = this._initialPos.x + radX * Math.sin(radian);
        this.y = this._initialPos.y + radY * Math.sin(radian * 0.5);
        if (this.age%8 === 0) this.fireBullet();
        break;

      case "upDown":
        // 上下移動
        var period = 500; // 一周期にかかるフレーム数
        var radY = 140;
        var degUnit = 180 / (period * 0.25);
        var deg = degUnit * this.age;
        var radian = RAD_UNIT * deg;
        this.x = this._initialPos.x;
        this.y = this._initialPos.y + radY * Math.sin(radian * 0.5);
        if (this.age%24 === 0) this.fireBullet();
        break;

      default:
        // 初期状態：その場にとどまる
        if (this.age%30 === 0) this.fireBullet();
        break;
    }

    // change pattern by life
    if (this.life < this._fullLife * 0.333) {
      this.changePattern('sMove');
    } else if (this.life < this._fullLife * 0.66) {
      this.changePattern('upDown');
    }

  },

  changePattern: function(pattern) {
    if (pattern === this._pattern) return;

    this.flare('patternChange');
    this.resetPosition();
    this._pattern = pattern;
    switch (pattern) {
      case "upDown":
        this.addOrbit();
        break;
      default:
        break;
    }
  },

  // TODO: パターンごとに撃ち方変える？
  fireBullet: function() {
    (3).times(function(i, num){
      var rad = ((180 - 30) + 30 * i) * RAD_UNIT;
      Bullet(this.x, this.y, rad, 4).addChildTo(bulletConfig.layer);
    }.bind(this))
    var rad = 180;
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

});