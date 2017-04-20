
phina.define('MainScene', {
  superClass: 'DisplayScene',

  age: 0,
  _score: 0,
  _shotExp: 0,
  _shotLevel: 1,
  remainLife: PLAYER_INITIAL_LIFE,
  isStarted: false,

  init: function(options) {
    this.superInit(options);
    var self = this;
    var gx = this.gridX;
    var gy = this.gridY;
    // this.scrollSpeed = SCROLL_SPEED;
    this.scrollSpeed = 0;

    // player
    var player = bulletConfig.target = this.player = Player(gx.center(), gy.center());

    // レイヤーとか
    var rootLayer = this.rootLayer = (USE_WEBGL) ? GLLayer(options) : DisplayElement(options);
    rootLayer.addChildTo(this);
    this.backgroundLayer = DisplayElement(options).addChildTo(rootLayer);
    player.addChildTo(rootLayer);
    this.enemyLayer = DisplayElement(options).addChildTo(rootLayer);
    this.effectLayer = DisplayElement(options).addChildTo(rootLayer);
    this.shotLayer = DisplayElement(options).addChildTo(rootLayer);
    this.friendLayer = DisplayElement(options).addChildTo(rootLayer);
    this.bulletLayer = DisplayElement(options).addChildTo(rootLayer);
    this.itemLayer = DisplayElement(options).addChildTo(rootLayer);
    this.UILayer = UILayer(options).addChildTo(this).setVisible(false);
    this.titleLayer = TitleLayer(options).addChildTo(this);
    this.resultLayer = ResultLayer(options).addChildTo(this);
    bulletConfig.layer = this.bulletLayer;

    // オブジェクトプール： マネジャー化する？
    this.objectPools = {};
    var objectPoolConfig = [
      {
        poolName: "yellowRect",
        className: ExplosionChip,
        arguments: [0, 0, 16, "yellowRect"],
        count: 100,
        targetLayer: self.effectLayer,
      },
      {
        poolName: "redRect",
        className: ExplosionChip,
        arguments: [0, 0, 16, "redRect"],
        count: 100,
        targetLayer: self.effectLayer,
      },
      {
        poolName: "boostEffect",
        className: BoostEffectChip,
        arguments: [self.backgroundLayer],
        count: 12,
        targetLayer: self.backgroundLayer,
      },
      {
        poolName: "playerShot",
        className: Shot,
        arguments: [self.shotLayer],
        count: 256,
        targetLayer: self.shotLayer,
      },
      // {
      //   poolName: "enemyBullet",
      //   className: Shot,
      //   arguments: [self.shotLayer],
      //   count: 256,
      //   targetLayer: self.shotLayer,
      // },
    ];
    objectPoolConfig.each(function(data) {
      var pool = self.objectPools[data.poolName] = ObjectPool();
      data.count.times(function() {
        var obj = data['className'].apply(null, data.arguments);
        obj.targetLayer = data.targetLayer;
        pool.add(obj);
      })
    });

    // 背景スクロール
    for (var i = 0; i < 2; i++) {
      var bg = Sprite('bg')
      .setSize(this.width+20, this.height)
      .setOrigin(0, 0)
      .setPosition(i * (this.width+20), 0)
      .addChildTo(this.backgroundLayer);
      bg.on('enterframe', function() {
        if (!self.isStarted) return;
        this.x -= self.scrollSpeed;
        if (this.x <= -this.width) this.x += this.width * 2;
      });
    }

    // ボム演出
    // 仲間
    var friendList = [
      'buropiyo', 'meropiyo', 'nasupiyo', 'takepiyo', 'mikapiyo',
    ];
    var yPoses = [36, 100, 144, 212, 300];
    this.friends = friendList.map(function(name, i){
      var randSpeed = Math.randint(4, 7);
      var randX = Math.randint(-25, -10);

      var sprite = Sprite(name)
      .setVisible(false)
      .setPosition(randX, yPoses[i])
      .addChildTo(self.friendLayer)
      sprite.vec = Vector2(randSpeed, 0);
      sprite._startPos = Vector2(randX, yPoses[i]);
      FrameAnimation('tomapiyo').attachTo(sprite).gotoAndPlay('fly');

      sprite.on('enterframe', function(){
        this.position.add(this.vec);
        if (SCREEN_WIDTH * 1.2 < this.x) this.visible = false;
      });

      return sprite;
    });

    // ボムゲージ
    this.bombGauge = BombGauge().addChildTo(this.UILayer)
    .setPosition(gx.center(), gy.span(15))
    ;

    // 敵出現関係
    this._enemyPointer = 0;
    ENEMY_PATTERNS.targetLayer = this.enemyLayer;
    this.enemyLauncher = EnemyLauncher();
    TIME_TABLE.frameSum = 0;

    // UI update
    this.on('enterframe', function(e) {
      this.UILayer.scoreLabel.text = "￥ "+this._score;
      this.UILayer.remainLifeLabel.text = " x " + Math.max(0, this.remainLife);
    })

    // イベント管理用
    this.tweener = Tweener().attachTo(this);

    // debug
    if (DEBUG_MODE) {
      Label({
        fill: "#46D292",
        fontSize: 12,
        textAlign: "right"
      }).addChildTo(this.UILayer)
      .setOrigin(1, 0)
      .setPosition(gx.span(16), gy.span(14))
      .on('enterframe', function() {
        this.text = self.age;
      });

      // タイトルすっ飛ばす
      this.isStarted = true;
      player.isAnimating = false;
      self.scrollSpeed = SCROLL_SPEED;
      self.UILayer.setVisible(true);
    }

    // ゲーム開始
    this.one('gameStart', this.gameStart.bind(this))

    // タイトル: スタート後スクロール
    this.titleLayer.on('enterframe', function(){
      if (!self.isStarted || !this.visible) return;
      this.x -= self.scrollSpeed;
      if (this.x < -SCREEN_WIDTH) this.visible = false;
    });
    this.titleLayer.startButton.onclick = function() {
      self.flare('gameStart');
      // if (self.isStarted) return;
      // self.gameStart();
    }

  },

  update: function(app) {
    // if (!this.isStarted) return;

    var self = this;
    var frame = app.frame;
    var kb = app.keyboard;
    var p = app.pointer;
    var player = this.player;
    var sctw = this.tweener;
    var currentPattern = TIME_TABLE.pattern[this._enemyPointer];

    // スタート画面解除
    if (!this.isStarted) {
      // if (p.getPointingStart()) {
      if (kb.getKeyDown('z')) {
        // this.gameStart();
        this.flare('gameStart');
      } else {
        return;
      }
    }

    this.age++;

    if (DEBUG_MODE && kb.getKeyDown('q')) {
      // this.exit("main");
    }

    // 敵の出現
    this.enemyLauncher.tick();
    if (currentPattern && TIME_TABLE.frameSum + currentPattern[0] < this.age) {
      TIME_TABLE.frameSum += currentPattern[0];
      var name = currentPattern[1];
      // Bossの出現
      if (name === "boss") {
        // TODO：雑魚片す？ -> ワーニング cb-> ボス出現
        // this.UILayer.showWarning(function() {
          var boss = Boss().addChildTo(self.enemyLayer).resetPosition();
          boss.on('patternChange', function() {
            self.generateBlast(boss.x, boss.y, 32, "redRect");
          })
          self.UILayer.bossLifeGauge.setVisible(true).setTarget(boss);
        // });
      // 雑魚編隊
      } else {
        var pattern = ({}).$extend(ENEMY_PATTERNS[name]);
        var args = currentPattern[2];
        if (args != null) pattern.args = args;
        // Log(pattern, TIME_TABLE.frameSum);
        this.enemyLauncher.pushTask(pattern);
      }

      this._enemyPointer++;
    }

    // ボム
    if (kb.getKeyDown('x')) this.fireBomb();

    if (self.bombGauge.value < self.bombGauge.maxValue) {
      // UI.Gauge.setValueにバグあり とりあえずの処置
      self.bombGauge.value = Math.clamp(self.bombGauge.value+1, 0, self.bombGauge.maxValue);
    }

    // shot level up
    if (
      self._shotLevel < MAX_SHOT_LEVEL
      && self._shotExp > 50 * self._shotLevel
    ) {
      self._shotLevel++;
      // Log("shot level up",self._shotLevel);
    }

    // enemy children
    self.enemyLayer.children.each(function(enemy) {
      if (enemy.isAnimating) return;

      if (enemy.life <= 0) {
        self.enemyDestroyed(enemy);
      }

      // enemy vs player
      if (
        !player.invinsible
        && !player.isAnimating
        && enemy.hitTestCircle(player.x, player.y)
      ) {
        self.playerDestroyed();
      }

      // enemy vs player shot
      self.shotLayer.children.each(function(shot) {
        self.shotEnemyHitTest(shot, enemy);
      });
    });

    // enemy bullet vs player
    self.bulletLayer.children.each(function(bullet) {
      if (
        !player.invinsible
        && !player.isAnimating
        && bullet.hitTestCircle(player.x, player.y)
      ) {
        self.playerDestroyed();
      }
    });

    // item action
    var tempChildren = this.itemLayer.children.slice();
    tempChildren.each(function(item) {
      // player位置をサーチ・吸引させる
      if (player.position.distance(item.position) < ITEM_SEARCH_RANGE) {
        item.target = player;
      }

      // vs player hittest
      if (!player.isAnimating && item.hitTestCircle(player.x, player.y)) {
        self._score += item.score;
        item.remove();
      }
    });

    // player action
    if (!player.isAnimating) {
      if (p.getPointing()) {
        player.position.add(p.deltaPosition.mul(SENSIBILITY));
      }
      if (kb.getKey('up')) player.y -= player.moveSpeed;
      if (kb.getKey('down')) player.y += player.moveSpeed;
      if (kb.getKey('left')) player.x -= player.moveSpeed;
      if (kb.getKey('right')) player.x += player.moveSpeed;
    }

    if (!player.isAnimating && frame%4 === 0) {
      // if (kb.getKey('z')) self.playerShotFire();
      self.playerShotFire();

      // ブーストエフェクト
      this.objectPools["boostEffect"].pick(function(chip) {
        chip.spawn(player.x-5, player.y);
      });
    }

  },

  shotEnemyHitTest: function(shot, enemy) {
    var cls = Collision;
    var self = this;
    if (enemy.isAnimating) return;
    // if (shot.hitTestElement(enemy)) {
    if (cls.testCircleCircle(shot, enemy)) {
      self.generateBlast(shot.x, shot.y, 8, "yellowRect");
      shot.remove();
      enemy.life -= shot.power;
    }
  },

  // TODO: クラス化
  whiteBlast: function(x, y) {
    var s = Sprite('whiteCircle').addChildTo(this.effectLayer);
    s.tweener.clear()
    .set({x: x, y: y})
    .to({scaleX:100, scaleY:80, alpha: 0}, 1000, "easeInQuad")
    .call(function(){
      this.remove();
    })
  },

  generateBlast: function(x, y, num, textureName) {
    for (var i = 0; i < num; i++) {
      this.objectPools[textureName].pick(function(chip) {
        chip.spawn(x, y, 630/num * i);
      });
    }
  },

  playerDestroyed: function() {
    var player = this.player;
    this.generateBlast(player.x, player.y, 32, "redRect");
    this.remainLife--;

    player.destroyed(function(){
      if (this.remainLife < 0) {
        // this.gameover();
        this.showResult();
      } else {
        player.respawn();
        this.bombGauge.refill();
      }
    }.bind(this));
  },

  enemyDestroyed: function (enemy) {
    if (enemy.isBoss) {
      // Boss撃破
      this.bossDestroyed(enemy);
    } else {
      // 雑魚撃破
      this.generateBlast(enemy.x, enemy.y, 32, "redRect");
      enemy.remove();
    }

    if (enemy.score != null) this._score += enemy.score;
    this._shotExp += 50;
  },

  bossDestroyed: function(enemy) {
    var self = this;

    this.tweener.clear()
    .call(function() {
      // 無敵化
      // self.player.isAnimating = true;
      self.player.invinsible = Infinity;

      self.generateBlast(enemy.x, enemy.y, 32, "redRect");
      enemy.isAnimating = true;
      enemy.animation.gotoAndPlay('dead');
    })
    .wait(1600)
    .call(function(){
      self.generateBlast(enemy.x, enemy.y, 32, "redRect");
      enemy.destroyAnimation(2800);
    })
    // 爆発エフェクトここから
    .wait(500)
    .call(function(){ self.generateBlast(enemy.x, enemy.y+10, 32, "redRect"); })
    .wait(500)
    .call(function(){ self.generateBlast(enemy.x-20, enemy.y+10, 32, "redRect"); })
    .wait(500)
    .call(function(){ self.generateBlast(enemy.x+20, enemy.y+10, 32, "redRect"); })
    .wait(260)
    .call(function(){
      self.generateBlast(enemy.x, enemy.y, 32, "redRect");
      self.whiteBlast(enemy.x, enemy.y);
      enemy.remove();
    })
    .wait(1400)
    .call(function() {
      // プレイヤー画面外へ？
      self.player.invinsible = 0;
      self.showResult();
    })
    ;

  },

  gameStart: function () {
    var self = this;
    var player = this.player;

    // プレイヤーアニメーション -> スクロール開始
    player.anim.gotoAndPlay('fly');
    player.tweener.clear()
    .by({y: -40}, 1600, 'easeOutElastic')
    .to({x: -100, y: -200}, 600, 'easeOutQuad')
    .set({x: -100, y: self.height * 0.5})
    .wait(240)
    .call(function() {
      self.isStarted = true;
      // self.scrollSpeed = SCROLL_SPEED * 2;
    })
    .to({x: self.width * 0.3}, 800, "easeInOutQuad")
    .call(function() {
      player.isAnimating = false;
      self.UILayer.setVisible(true);
    })
    ;

    this.tweener.clear()
    .to({scrollSpeed: SCROLL_SPEED * 5}, 1000, "easeInQuad")
    .to({scrollSpeed: SCROLL_SPEED}, 5000)
    ;
  },

  showResult: function() {
    this.UILayer.setVisible(false);
    this.resultLayer.setVisible(true).setResult(this._score);
    this.isStarted = false;
  },

  // タイトル画面へ
  // reset: function() {
  //   this.isStarted = false;
  //   this.age = 0;
  //   this._score = 0;
  //   this.remainLife = PLAYER_INITIAL_LIFE;
  //   this.player.setVisible(true);
  //   this.titleLayer.setPosition(0, 0).setVisible(true);
  //   this.UILayer.setVisible(false);
  //   this.resultLayer.setVisible(false);
  //   this.scrollSpeed = 0;
  // },

  playerShotFire: function () {
    var player = this.player;
    var fireNway = function(n) {
      for (var i=0; i < n; i++) {
        var angle = - SHOT_ANGLE_UNIT * ((n - 1) * 0.5) + i * SHOT_ANGLE_UNIT;
        this.objectPools['playerShot'].pick(function(shot) {
          shot.spawn(player.x, player.y-2, angle);
        });
      }
    }.bind(this);

    switch (this._shotLevel) {
      case 1: fireNway(1); break;
      case 2: fireNway(3); break;
      case 3: fireNway(5); break;
      case 4:
        fireNway(5);
        // TODO: backshot
        break;
    }
  },

  // ボム （C.A.S.）
  fireBomb: function() {
    var gauge = this.bombGauge;
    var self = this;

    // 何もしない
    if (this.player.isAnimating || gauge.value < gauge.maxValue) return;

    gauge.value = 0;
    this.player.invinsible = 200;

    // フレンド出現
    this.friends.each(function(friend) {
      friend.x = friend._startPos.x;
      friend.setVisible(true);
    });

    // 敵ダメージ
    this.enemyLayer.children.each(function(enemy) {
      if (enemy.isAnimating) return;
      this.generateBlast(enemy.x, enemy.y, 8, "yellowRect");
      enemy.life -= BOMB_POWER;
    }.bind(this));

    // var tempChildren = self.bulletLayer.children.slice()
    for (var i = 0, len = self.bulletLayer.children.length; i < len; i++) {
      var child = self.bulletLayer.children[0];
      // 点アイテムに変換
      ScoreItem(child.x, child.y).addChildTo(self.itemLayer);
      // this._score += 10;
      if (child != null) child.remove();
    }

    // 爆発 TODO、プール化
    (20).times(function() {
      var x = Math.randint(0, SCREEN_WIDTH);
      var y = Math.randint(0, SCREEN_HEIGHT);
      var ss = Math.randfloat(0.2, 0.8);
      var es = Math.randfloat(1.0, 2.5);
      ExplosionCircle(x, y, ss, es).addChildTo(self.backgroundLayer);
    })

  },

});