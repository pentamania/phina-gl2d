
/**
 * Player
 */
phina.define('Player', {
  superClass: 'AbstractObjClass',

  // イベント動作中
  isAnimating: true,

  invinsible: 0,

  init: function(x, y) {
    this.superInit("tomapiyo");
    this.setPosition(x, y);
    this.setScale(0.5, 0.5);
    this.moveSpeed = PLAYER_SPEED;

    this.setBoundingType('rect');
    this.radius = 16;

    this.anim = FrameAnimation('tomapiyo').attachTo(this)
    .gotoAndPlay('wait');
  },

  destroyed: function(cb) {
    // if (this.isAnimating || this.invinsible) return;
    this.isAnimating = true;
    this.anim.gotoAndPlay('dead');

    this.tweener.clear()
    .by({y: -80}, 100, 'easeOutQuad')
    .by({y: SCREEN_HEIGHT*1.5}, 800, 'easeInQuad')
    .call(cb.bind(this));
  },

  respawn: function() {
    this.setPosition(-100, 100);
    this.anim.gotoAndPlay('fly');

    this.tweener.clear()
    .to({x: 200}, 1000, 'easeInOutQuad')
    .call(function() {
      this.invinsible = 180;
      this.isAnimating = false;
    }.bind(this))
  },

  update: function(app) {
    if (this.invinsible > 0) {
      --this.invinsible;
      this.visible = (this.age%2 === 0) ? false : true;
    } else {
      this.visible = true;
    }

    if (!this.isAnimating) {
      this.x = Math.clamp(this.x, 0, SCREEN_WIDTH);
      this.y = Math.clamp(this.y, 0, SCREEN_HEIGHT);
    }
  }

});

/**
 * Player Shot
 */
phina.define('Shot', {
  superClass: 'AbstractObjClass',

  init: function() {
    this.superInit('redBullet');
    this.radius = 4;

    this.power = SHOT_POWER;
    this.vec = Vector2(0, 0);
    this.fluct = 0;
  },

  update: function() {
    // this.fluct = 4 * Math.sin(this._age);
    this.position.add(this.vec);
    // this.y += this.fluct;
    if (this.isOutOfScreen()) {
    // if (SCREEN_WIDTH < this.x) {
      this.remove();
    }
  },

  spawn: function(x, y, angle, speed) {
    speed = speed || 10;
    angle = angle || 0;
    this.setPosition(x, y);
    this.vec.set(
      speed,
      speed * Math.sin(angle.toRadian())
    );

    this.targetLayer.addChild(this);
  },

});

/**
 * Enemy bullet
 */
phina.define('Bullet', {
  superClass: 'AbstractObjClass',

  init: function(x, y, angle, speed) {
    this.superInit('enemyNormalbullet');
    this.setPosition(x, y);

    // this.setBoundingType('rect');
    this.radius = 8;
    angle = angle || 0;
    speed = speed || 10
    this.power = 10;
    this.vec = Vector2(speed * Math.cos(angle), speed * Math.sin(angle));
    this.fluct = 0;
  },

  update: function() {
    this.position.add(this.vec);
    // if (this.x < 0) this.remove();
    if (this.isOutOfScreen()) this.remove();
  }

});


/**
 * boostEffectChip
 * バーニア演出用の
 */
phina.define('BoostEffectChip', {
  superClass: 'AbstractObjClass',

  init: function() {
    this.superInit('triangle');
    // this.targetLayer = targetLayer;
    this.setBoundingType('rect');
    this.accelX = 0.5;
  },

  update: function(app) {
    this.alpha -= 0.05;
    this.accelX += 0.5;
    this.scaleX += 0.1;
    this.x -= this.accelX;

    if (this.alpha <= 0) {
      this.remove();
    }
  },

  spawn: function(x, y) {
    this.setPosition(x, y);
    this.alpha = 1.0;
    this.accelX = 0.5;
    this.scaleX = 1;

    this.targetLayer.addChild(this);
  },
});

/**
 * ExplosionChip
 * 爆発演出用
 */
phina.define('ExplosionChip', {
  superClass: 'AbstractObjClass',

  init: function(x, y, direction, texture) {
    this.superInit(texture);
    this.setBoundingType('rect');
    this.setPosition(x, y);
    this.vec = Vector2();
    this.on('enterframe', function() {
      this.alpha -= 0.05;
      this.position.add(this.vec);
      this.scaleX -= 0.05;
      this.scaleY -= 0.05;

      if (this.alpha <= 0) this.remove();
    });
  },

  spawn: function(x, y, direction) {
    this.setPosition(x, y);
    this.alpha = 1.0;
    this.setScale(1, 1);
    var speed = Math.randint(3, 7);
    var rad = direction.toRadian();
    this.vec.set(speed * Math.cos(rad), speed * Math.sin(rad));

    this.targetLayer.addChild(this);
  },
});

/**
 * ExplosionCircle
 * 爆発演出用
 */
phina.define('ExplosionCircle', {
  superClass: 'AbstractObjClass',

  init: function(x, y, startScale, endScale) {
    this.superInit("orangeCircle");
    this.setPosition(x, y);
    this.setScale(startScale, startScale);

    this.tweener.clear()
    .to({scaleX: endScale, scaleY: endScale}, 90)
    .wait(1000)
    .to({scaleX: 0, scaleY: 0}, 80)
    .call(function() {
      this.remove();
    }.bind(this));
  },

  update: function() {
    this.visible = (this.age%2 === 0) ? false : true;
  }

});

/**
 * Warning
 */
phina.define('WarningText', {
  superClass: 'phina.display.Label',

  init: function() {
    this.superInit({
      text: "WARNING!",
      fontSize: 32,
      fill: "#D92226",
    });

    // 明滅
    var dur = 600;
    this.tweener
    .setLoop(1)
    .to({ alpha: 0 }, dur)
    .to({ alpha: 1 }, dur)
    .stop()
    ;

    // 右から左に
    this.positionTweener = phina.accessory.Tweener().attachTo(this);
  },

  playAnim: function(cb) {
    this.tweener.play();
    this.positionTweener.clear()
    .to({
      x: SCREEN_WIDTH *0.5
    })
    .wait(2000)
    .to({
      x: - SCREEN_WIDTH *0.5
    })
    .call(function(){
      if (typeof cb === 'function') cb();
      // this.flare('animEnd')
    }.bind(this))
    .play()
    ;
  }

});

/**
 * animation
 */
phina.define('AnimatingLabel', {
  superClass: 'phina.display.Label',

  _isAnimating: false,

  init: function(options) {
    this.superInit(options);

    this.letters = this.text.split("");
    this.typeDelay = options.delay || 10;

    this.text = "";
  },

  animate: function() {
    if (this._isAnimating) return false;

    this.text = "";
    this._isAnimating = true;
    var letters = this.letters;
    var delay = this.typeDelay;
    var _index = 0;
    var _frame = 0;
    var _text = "";

    var _f = function() {
      if (letters.length < _index) {
        this._isAnimating = false;
        this.flare('animationend')
        this.off('enterframe', _f);
        return;
      }

      if (_frame%delay === 0) {
        _text = "";
        for (var i = 0; i < _index; i++) {
          _text += letters[i];
        }
        this.text = _text;
        _index++;
      }

      _frame++;
    };
    this.on('enterframe', _f);

    return this;
  },

});

/**
 * Life gauge
 */
phina.define("LifeGauge", {
  superClass: "phina.ui.Gauge",

  target: null,

  init: function() {
    this.superInit({
      value: 0, // 演出用
      width: SCREEN_WIDTH*0.8,
      height: 12,
      // fill: '#10B6DF',
      stroke: '#444',
      gaugeColor: '#10B6DF',
      // padding: 0,
      maxValue: 0,
    });

    this.setOrigin(0.5, 0)

    // 演出： ゼロから徐々に回復
    // this.value = this.maxValue;
  },

  update: function(app) {
    if (!this.target) return;
    this.value = this.target.life;
  },

  setTarget: function(target) {
    this.target = target;
    this.setLife(target.life);
    return this;
  },

  setLife: function(maxLife) {
    this.animationTime = 1000;
    this.maxValue = maxLife;
    return this;
  },

});

/**
 * bomb gauge
 */
phina.define("BombGauge", {
  superClass: "phina.ui.Gauge",

  init: function() {
    var height = 12;
    var fontSize = 12;

    this.superInit({
      value: BOMB_MAX_VALUE,
      width: SCREEN_WIDTH * 0.6,
      height: height,
      fill: '#aaa',
      stroke: '#E1E1E1',
      // gaugeColor: '#3EDC07',
      gaugeColor: 'red',
      padding: 0,
      maxValue: BOMB_MAX_VALUE,
    });

    Label({
      // text: "C.A.S.",
      text: "BOMBER GAUGE",
      textAlign: 'left',
      fontSize: fontSize,
    }).setOrigin(0, 0.5).setPosition(-this.width * 0.5, -height * 1.1).addChildTo(this);

    this.animationTime = 1500;

    // Label: "ready"
    var duration = 350;
    var noticeLabel = Label({
      text: "READY",
      fill: '#fff',
      fontSize: height,
    })
    .addChildTo(this);
    noticeLabel.tweener
    .setLoop(true)
    .to({
      alpha: 0,
    }, duration).to({
      alpha: 1.0,
    }, duration);

    this.on('enterframe', function() {
      if (this.value < this.maxValue) {
        noticeLabel.text = "RECHARGING..."
        noticeLabel.tweener.pause();
        noticeLabel.alpha = 1;
        this.gaugeColor = "#3BA4E6";
      } else {
        noticeLabel.text = "READY!"
        noticeLabel.tweener.play();
        this.gaugeColor = "red";
      }
    });

  },

});

