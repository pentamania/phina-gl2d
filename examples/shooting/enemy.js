
/**
 * 敵キャラ抽象クラス
 */
phina.define('EnemyAbstract', {
  superClass: 'AbstractObjClass',

  canAttack: true,
  hasItem: true,

  init: function(typeName, isSpecialType) {
    var data = ENEMY_TYPES[typeName];
    this.superInit(data.texture);

    this.type = typeName;
    this.life = data.life;
    this.score = data.score || 0;
    this.target = BulletConfig.target;

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

        this.checkRemoval();
      });
    }

    // あたり判定
    this.invinsible = ENEMY_INIT_INVINSIBLE_FRAME;
    this.on('enterframe', function() {
      if (0 < this.invinsible) this.invinsible--;
    });
     // this.on('removed', this.ondestroyed.bind(this));
  },

  // 倒された時の動作: 打ち返しなど
  ondestroyed: function() {},

  // 出現時にエフェクト
  onadded: function() {
    var circle = Sprite("appearEffect")
    .addChildTo(this)

    circle.tweener.clear().to({
      scaleX: 8,
      scaleY: 8,
      alpha: 0
    }, 400).call(function(){
      circle.remove()
    })
  },
  // setSpeed: function(speed) {
  // },

  setVectorAngle: function(angle, speed) {
    if (speed != null) this.speed = speed;
    this.vec.fromAngle(angle * Math.DEG_TO_RAD, this.speed);
  },

  // 仮想
  fireBullet: function() {
    if (!this.canAttack) return;

    // 自機に向かって撃つ
    var rad = this.getTargetRadian();
    Bullet(this.x, this.y, rad, 2).addChildTo(BulletConfig.layer);
  },

  getTargetRadian: function() {
    return Math.atan2(this.target.y - this.y, this.target.x - this.x);
  }

});

/**
 * enmeytype example
 */
// phina.define('EnemyTypeGuy', {
//   superClass: 'EnemyAbstract',

//   init: function(x, y, degree) {
//     this.superInit("name");
//     this.setPosition(x, y);

//     if (speed != null) this.speed = speed;
//     degree = (degree != null) ? degree : 180;
//     this.setVectorAngle(degree);
//   },

//   update: function() {
//     this.checkRemoval();
//   }
// });

/**
 * 基本形
 * 方向転換可
 */
phina.define('BasicGuy', {
  superClass: 'EnemyAbstract',

  _transformSum: 0,

  init: function(x, y, initialDegree, nextDegree, speed) {
    this.superInit('basic');
    this.setPosition(x, y);

    if (speed != null) this.speed = speed;

    if (initialDegree != null) {
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

    // if (this.has('changeRoute') && this._transformSum > SCREEN_WIDTH*0.5) {
    if (this.has('changeRoute')) {
      if (this._transformSum > SCREEN_WIDTH) {
        this.flare('changeRoute');
        this.flare('fireBullet');
      }
      // if (this.has('changeRoute')) this.flare('changeRoute');
    } else  {
      // if (this._transformSum > SCREEN_WIDTH*0.5) this.flare('fireBullet');
    }

    this.rotation += 4;
  },

});

/**
 * VerticalShotGuy
 * 進行方向に対し、直角2方向に玉を打つ
 */
phina.define('VerticalShotGuy', {
  superClass: 'EnemyAbstract',

  init: function(x, y, degree, speed) {
    this.superInit('verticalShot');
    this.setPosition(x, y);

    if (speed != null) this.speed = speed;
    degree = (degree != null) ? degree : 180;
    this.setVectorAngle(degree);

    // 進行方向に直角のラジアンを計算しとく
    this.bulletDirections = [];
    (2).times(function(i, n) {
      var dir = this.vec.toDegree();
      var rad = (dir + 90 + 180 * i).toRadian();
      this.bulletDirections.push(rad);
    }.bind(this));
  },

  update: function (app) {
    if (this.isAnimating) return;

    if (this.age%20 === 0) this.fireBullet();
  },

  fireBullet: function() {
    this.bulletDirections.forEach(function(rad) {
      Bullet(this.x, this.y, rad, 3).addChildTo(BulletConfig.layer);
    }.bind(this));
  },

});

/**
 * Assault
 * プレイヤーに向けて突っ込んでくる
 */
phina.define('AssaultGuy', {
  superClass: 'EnemyAbstract',

  init: function(x, y, degree) {
    this.superInit("assault");
    this.setPosition(x, y);

    var speed = this.speed;
    var rad = this.getTargetRadian();
    this.vec.set(
      speed * Math.cos(rad),
      speed * Math.sin(rad)
    );
  },

  update: function() {
    this.checkRemoval();
    if (this.age%6 === 0) this.fireBullet();
  },

});

/**
 * orbit
 * 本体の周りをぐるぐる
 */
phina.namespace(function() {

  var BULLET_RAD = 180 * Math.DEG_TO_RAD;
  var FIRE_DELAY_FRAME = 18;

  phina.define('OrbitGuy', {
    superClass: 'EnemyAbstract',

    init: function(mainBody, orbitRadius, startDegree, angSpeed) {
      this.superInit("orbit", true);
      this.mainBody = mainBody;
      this.orbitRadius = orbitRadius || 100;
      this.startDegree = startDegree || 0;
      this.angSpeed = angSpeed || 8;
      this.destroyable = false;
    },

    update: function() {
      if (this.age%FIRE_DELAY_FRAME === 0) this.fireBullet();

      var radian = (this.startDegree + this.age * this.angSpeed).toRadian();
      var oRad = this.orbitRadius;
      var mainBody = this.mainBody;
      this.position.set(
        mainBody.x + oRad * Math.cos(radian),
        mainBody.y + oRad * Math.sin(radian)
      );

      this.rotation += 4;
    },

    fireBullet: function() {
      if (!this.canAttack) return;
      Bullet(this.x, this.y, BULLET_RAD, 2).addChildTo(BulletConfig.layer);
    }

  });

});


/**
 * 波移動型
 */
phina.define('SineGuy', {
  superClass: 'EnemyAbstract',

  init: function(x, baseY, vectorAngle, fluctRadius, frequency) {
    this.superInit("sine", true);
    this.x = x || 0;
    this.baseY = baseY || 0;
    this.fluctRadius = fluctRadius || 30; // 波半径
    this.frequency = frequency || 4; // 周波数、高いほどうねうねする
    if (vectorAngle != null) this.setVectorAngle(vectorAngle);
    this.destroyable = false;
  },

  update: function() {
    this.checkRemoval();

    this.x += this.vec.x;
    this.baseY += this.vec.y;
    var rad = this.age * this.frequency * Math.DEG_TO_RAD;
    this.y = this.baseY + Math.sin(rad) * this.fluctRadius;

    // 独自のdestroyフラグ
    if (this.x < - SCREEN_WIDTH * 0.3 || SCREEN_WIDTH * 1.4 < this.x) this.destroyable = true;
    // if (this.age === 100) this.fireBullet();
    // if (this.age > 1000) this.destroyable = true;
  }

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

    this.destroyable = false;
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
    var rad = (this.startDeg + this.age * this.speed) * Math.DEG_TO_RAD;
    this.setPosition(
      this.axis.x + Math.cos(rad) * r,
      this.axis.y - Math.sin(rad) * r
    );
  },

  fireBullet: function() {
    var rad = this.startDeg.toRadian();
    Bullet(this.x, this.y, rad, 3).addChildTo(BulletConfig.layer);
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
    var rad = 360 / bulletNum * Math.DEG_TO_RAD;
    for (var i = 0; i < bulletNum; i++) {
      Bullet(this.x, this.y, rad * i, 3).addChildTo(BulletConfig.layer);
    }

    this.remove();
  },

  update: function() {

  },

});

/**
 * HomingGuy 追っかけてくるやつ
 * Ref: http://www7.plala.or.jp/kfb/program/stg2dvec.html
 */
phina.namespace(function() {

  var ROTATE_UNIT = 8;
  var ROTATE_UNIT_RAD = ROTATE_UNIT * Math.DEG_TO_RAD;
  var LIMIT_DISTANCE = 35; // ここまで近づいたら追跡をやめる
  var SEARCH_RANGE = 15 * Math.DEG_TO_RAD; // 上下（or左右）15度ずつ、前方30度を探索

  phina.define('HomingGuy', {
    superClass: 'EnemyAbstract',

    _isChasing: true,

    init: function(x, y, speed, startAngle) {
      this.superInit("homing");
      this.setPosition(x, y);
      this.speed　= (speed != null) ? speed : this.speed;

      startAngle = (startAngle != null) ? startAngle : 180;
      this.rotation = startAngle;
      this.setVectorAngle(startAngle);
    },

    update: function() {
      this.searchAndRotate();

      // 追跡やめる
      if (this.position.distance(this.target.position) < LIMIT_DISTANCE) {
        this._isChasing = false;
      }
    },

    searchAndRotate: function() {
      if (!this._isChasing) return;

      var V2 = phina.geom.Vector2;
      var target = this.target;

      // 自分 vs ターゲット間のベクトルを計算
      var this2targetVec = V2(target.x - this.x, target.y - this.y);

      // if (!this.checkTargetWithinRange(this2targetVec)) return;

      // メモ：　外積 a×b = |a||b|sinθ = ax * by - ay * bx
      if (V2.cross(this.vec, this2targetVec) > 0) {
        // targetが上にいる
        this.vec.rotate(ROTATE_UNIT_RAD);
      } else {
        // targetが下にいる
        this.vec.rotate(-ROTATE_UNIT_RAD);
        // this.rotation -= ROTATE_UNIT;
      }

      // 進行方向を向く：デフォルトが右向きの場合
      if (this.age%4 === 0) this.rotation = this.vec.toDegree();
    },

    /**
     * [checkTargetWithinRange]
     * targetが進行方向の指定範囲内にいるかどうかをチェック
     * メモ：　内積 cosθ = (vx * tx + vy * ty) / (sqrt(vx^2 + vy^2) * sqrt(tx^2 + ty^2))
     * or cosθ = Vector2.dot(v, t) / (sqrt(pow(v.x) + pow(v.y)) * sqrt(pow(t.x) + pow(t.y))
     * (sqrt(vx^2 + vy^2)はthis.speedと等価のため計算省略
     */
    checkTargetWithinRange: function(targetAngleVector) {
      var cosTheta = Vector2.dot(this.vec, targetAngleVector) / (this.speed * targetAngleVector.length());
      if (cosTheta > Math.cos(SEARCH_RANGE)) {
        return true;
      }
    },

  });

});

/**
 * Boss
 *
 */
phina.namespace(function() {

  var MAX_ORBIT_NUM = 2;
  var BULLET_NUM = 12;
  var BULLET_RANGE = 260;
  var bulletInterval = BULLET_RANGE / (BULLET_NUM - 1);

  phina.define('Boss', {
    superClass: 'EnemyAbstract',

    isBoss: true,
    ageSum: 0,
    ageOfDeath: BOSS_AGE_OF_DEATH,
    isSuperArmor: false,
    isDestroyed: false,
    _maxLife: 0,

    init: function() {
      this.superInit('boss', true);
      this.animation = FrameAnimation('boss').attachTo(this).gotoAndPlay('fly');

      this.setPosition(SCREEN_WIDTH * 1.5, SCREEN_HEIGHT / 2);
      this.isAnimating = true;
      this._maxLife = this.life;
      this._initialPos = {x: SCREEN_WIDTH*0.8, y: SCREEN_HEIGHT*0.5};
      this.isAppeared = true;

      // 子機
      this.orbits = [];
      MAX_ORBIT_NUM.times(function(i, num) {
        var orbit = OrbitGuy(this, 60, i * 360/num |0);
        orbit.canAttack = false;
        this.orbits.push(orbit);
      }.bind(this));

      // パターン設定
      this.on('added', function(){
        this.setPattern('upDownEasy');
        // this.setPattern('upDownHard');
      })
    },

    addOrbit: function(index) {
      this.orbits.forEach(function(orbit, i) {
        orbit.addChildTo(this.parent)
      }, this);
    },

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
      if (this.isDestroyed) return;
      this.ageSum++;

      if (this.isAnimating) return;

      // ミサイル定期発射
      if (this.age%90 === 0) {
        (2).times(function(i, n) {
          var hm = HomingGuy(this.x+16, this.y, 6, -45 + i*90).addChildTo(BulletConfig.enemyLayer);
          hm.hasItem = false;
        }.bind(this))
      }

      switch (this._currentPattern) {
        case "yakekuso":
          // S字を描くように
          var period = 180; // 一周期にかかるフレーム数
          var radX = 40;
          var radY = 140;
          var degUnit = 180 / (period * 0.25);
          var deg = degUnit * this.age;
          var radian = deg.toRadian();
          this.x = this._initialPos.x + radX * Math.sin(radian);
          this.y = this._initialPos.y + radY * Math.sin(radian * 0.5);

          if (this.age%24 === 0) this.fireBullet();
          break;
        case "upDownHard":
          // 突撃モード
          if (this.age !== 0 && this.age%300 === 0) this.dashAttack();
          // 上下移動
          var period = 300; // 一周期にかかるフレーム数
          var radY = 140;
          var degUnit = 180 / (period * 0.25);
          var radian = (degUnit * this.age).toRadian();
          this.x = this._initialPos.x;
          this.y = this._initialPos.y + radY * Math.sin(radian * 0.5);

          if (this.age%36 === 0) this.fireBullet();
          break;

        case "upDownEasy":

          // 上下移動
          var period = 500; // 一周期にかかるフレーム数
          var radY = 140;
          var degUnit = 180 / (period * 0.25);
          var deg = degUnit * this.age;
          var radian = deg.toRadian();
          this.x = this._initialPos.x;
          this.y = this._initialPos.y + radY * Math.sin(radian * 0.5);

          if (this.age%36 === 0) this.fireBullet();
          break;

        default:
          // 初期状態：その場にとどまる
          // if (this.age%30 === 0) this.fireBullet();
          break;
      }

      // change pattern by life
      if (this.life < this._maxLife * 0.333) {
        this.setPattern('yakekuso');
      } else if (this.life < this._maxLife * 0.66) {
        this.setPattern('upDownHard');
      }

    },

    setPattern: function(pattern) {
      if (pattern === this._currentPattern) return;

      this.flare('patternChange'); // パターン変更時のアニメーションなどに
      this.resetPosition();
      this._currentPattern = pattern;
      switch (pattern) {
        case "upDownHard":
          this.addOrbit();
          break;
        case "yakekuso":
          this.orbits.forEach(function(o){
            o.canAttack = true;
          });
          break;
        default:
          break;
      }
    },

    // パターンごとに撃ち方変える？
    fireBullet: function() {
      (BULLET_NUM).times(function(i, num) {
        var rad = ((180 - BULLET_RANGE / 2) + bulletInterval * i) * Math.DEG_TO_RAD;
        Bullet(this.x, this.y, rad, 4).addChildTo(BulletConfig.layer);
      }.bind(this))
    },

    resetPosition: function() {
      this.isAnimating = true;
      this.isSuperArmor = true;

      this.tweener.clear()
      .to(this._initialPos, 1200, 'easeOutQuad')
      .wait(300)
      .call(function() {
        this.age = 0;
        this.isSuperArmor = false;
        this.isAnimating = false;
      }.bind(this));

      return this;
    },

    dashAttack: function() {
      // var rad = this.getTargetRadian();
      if (this.isAnimating) return;

      this.isAnimating = true;
      this.isSuperArmor = true;
      var gap = [-80, -40, 0, 40, 80].pickup();
      // this.invinsible = Infinity;
      var tgt = this.target;
      this.tweener.clear()
      .wait(500)
      .by({x: 60}, 500, 'easeOutQuad') //予備動作
      .to({x: tgt.x-gap, y:tgt.y}, 500, 'easeOutQuad')
      .wait(1000)
      .call(function() {
        this.resetPosition();
        this.isSuperArmor = false;
        // this.invinsible = 0;
      }.bind(this));

      return this;
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
});
