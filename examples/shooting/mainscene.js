/**
 * mainScene
 */
phina.define('MainScene', {
  superClass: 'DisplayScene',

  age: 0,
  _score: 0,
  _shotExp: 0,
  _shotLevel: PLAYER_START_LEVEL,
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
    var player = BulletConfig.target = this.player = Player(gx.center(), gy.center());

    // レイヤーとか
    var rootLayer = this.rootLayer = (USE_WEBGL) ? GLLayer(options) : DisplayElement(options);
    rootLayer.addChildTo(this);
    this.backgroundLayer = DisplayElement(options).addChildTo(rootLayer);
    this.playerBitLayer = DisplayElement(options).addChildTo(rootLayer);
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
    BulletConfig.layer = this.bulletLayer;
    BulletConfig.enemyLayer = this.enemyLayer;
    this.itemLayer.alpha = 0.7;

    // オブジェクトプール： マネジャー化する？
    this.objectPools = {};
    var objectPoolConfig = [
      {
        poolName: "yellowRect",
        className: ExplosionChip,
        arguments: [0, 0, 16, "yellowRect"],
        count: 256,
        targetLayer: self.effectLayer,
      },
      {
        poolName: "redRect",
        className: ExplosionChip,
        arguments: [0, 0, 16, "redRect"],
        count: 256,
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
        arguments: [],
        count: 256,
        targetLayer: self.shotLayer,
      },
    ];
    objectPoolConfig.each(function(data) {
      var pool = self.objectPools[data.poolName] = ObjectPool();
      data.count.times(function() {
        var obj = data['className'].apply(null, data.arguments);
        obj.targetLayer = data.targetLayer;
        pool.add(obj);
      })
    });

    // filter適用: 事前に行う？
    var AM = AssetManager;
    var filtered = AM.get('image', 'tomapiyo').clone().filter(AM.get('filter', 'blueFilter'));
    AM.set('image', 'tomapiyo_blue', filtered);

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

    // ボムゲージ / ボタン
    this.bombGauge = BombGauge().addChildTo(this.UILayer)
    .setPosition(gx.center(), gy.span(15))
    ;
    this.UILayer.bomberButton.on('pointstart', function(e) {
      self.fireBomber();
    });

    // 自機オプション
    // this.playerBits = [];
    (this._shotLevel).times(function() {
      self.addPlayerBit();
    });
    this.playerBitLayer.visible = false;

    // 敵出現関係
    // this._enemyPointer = 0;
    // TIME_TABLE.frameSum = 0;
    ENEMY_PATTERNS.targetLayer = this.enemyLayer;
    this.enemyLauncher = EnemyLauncher(TIME_TABLE.pattern);
    this.enemyLauncher.on('waveend', function() {
      self.bossAppearance();
    });
    // Log(this.enemyLauncher)

    // UI update
    this.on('enterframe', function(e) {
      this.UILayer.scoreLabel.text = "￥ "+this._score;
      this.UILayer.remainLifeLabel.text = " x " + Math.max(0, this.remainLife);
    });

    // イベント管理用
    this.tweener = Tweener().attachTo(this);

    // debug
    if (DEBUG_MODE) {
      this.enemyLauncher._pointer = ENEMY_WAVE_START_INDEX; // debug用

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
      player.anim.gotoAndPlay('fly');
      self.scrollSpeed = SCROLL_SPEED;
      self.UILayer.setVisible(true);
    } else {
      // ゲーム開始
      this.one('gameStart', this.gameStart.bind(this))
    }

    // タイトル: スタート後スクロール
    this.titleLayer.on('enterframe', function() {
      if (!self.isStarted || !this.visible) return;
      this.x -= self.scrollSpeed;
      if (this.x < -SCREEN_WIDTH) this.visible = false;
    });
    this.titleLayer.startButton.onclick = function() {
      self.flare('gameStart');
      // if (self.isStarted) return;
      // self.gameStart();
    }

    // プレイヤーの動きに応じてビット追従
    player.on('playerMoved', function() {
      var bits = self.playerBitLayer.children;
      if (bits.length > 0) {
        bits.forEach(function(bit) {
          bit.pushPaths(player.position.clone());
       }.bind(this));
      }
    });

  }, // init

  update: function(app) {
    // if (!this.isStarted) return;

    var self = this;
    var frame = app.frame;
    var kb = app.keyboard;
    var p = app.pointer;
    var player = this.player;
    var sctw = this.tweener;
    // var currentPattern;

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

    // ボム
    if (kb.getKeyDown('x')) this.fireBomber();
    if (self.bombGauge.value < self.bombGauge.maxValue) {
      // UI.Gauge.setValueにバグあり とりあえずの処置
      self.bombGauge.value = Math.clamp(self.bombGauge.value+1, 0, self.bombGauge.maxValue);
    }

    // shot level up
    // if (
    //   self._shotLevel < MAX_SHOT_LEVEL
    //   && self._shotExp > SHOT_POWERUP_BORDER * (self._shotLevel+1)
    // ) {
    //   self._shotLevel++;
    //   self.addPlayerBit();
    //   Log('level up!')
    // }

    // enemy children
    self.enemyLayer.children.each(function(enemy) {
      // if (enemy.isAnimating) return;
      if (enemy.isDestroyed) return;

      // enemy vs player
      if (
        !player.invinsible
        && !enemy.invinsible
        && !player.isAnimating
        && enemy.hitTestCircle(player.x, player.y)
      ) {
        self.playerDestroyed();
      }

      // enemy vs player shot
      self.shotLayer.children.each(function(shot) {
        // homings対象セット
        if (
          shot.type === "homing" && shot.target == null
          && enemy.isAppeared
          // && !enemy.isAnimating
          // && !enemy.invinsible
        ) {
          shot.target = enemy;
          enemy.on('removed', function() {
            // if (shot.target != null) Log(shot, "searching");
            shot.target = null;
          });
        }

        self.shotEnemyHitTest(shot, enemy);
      });

      // 敵消す
      if (enemy.life <= 0) {
        self.enemyDestroyed(enemy);
      }

      // ボスタイムアップ
      if (enemy.isBoss && enemy.ageOfDeath < enemy.ageSum) {
        enemy.flare('timeup');
      }

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
      if (!item.target) {
        var iPos = item.position;
      // if (player.position.distance(item.position) < ITEM_SEARCH_RANGE) {
        if (Math.abs(player.position.x - iPos.x) < ITEM_SEARCH_RANGE) {
          if (Math.abs(player.position.y - iPos.y) < ITEM_SEARCH_RANGE) {
            item.target = player;
          }
        }
      }
      // }

      // vs player hittest
      if (!player.isAnimating && item.hitTestCircle(player.x, player.y)) {
        if (item.score != null) {
          // 点アイテム
          self._score += item.score;
        } else {
          // Pアイテム
          // self._shotExp = Math.min(self._shotExp + item.energy, MAX_SHOT_ENERGY);
          self._shotExp += item.energy;
        }

        item.remove();
      }
    });

    // player action
    if (!player.isAnimating) {
      this.playerBitLayer.visible = true;

      // move: tap
      if (p.getPointing()) {
        if (p.deltaPosition.x != 0 || p.deltaPosition.y != 0) {
          player.position.add(p.deltaPosition.mul(SENSIBILITY));
          player.flare('playerMoved');
        }
      }

      // move: keyboard
      if (kb.getKey('up')) {
        player.flare('playerMoved');
        player.y -= player.moveSpeed;
      }
      if (kb.getKey('down')) {
        player.flare('playerMoved');
        player.y += player.moveSpeed;
      }
      if (kb.getKey('left')) {
        player.flare('playerMoved');
        player.x -= player.moveSpeed;
      }
      if (kb.getKey('right')) {
        player.flare('playerMoved');
        player.x += player.moveSpeed;
      }

      // shot
      if (frame%4 === 0) {
        if (kb.getKey('z') || p.getPointing()) self.playerShotFire();

        // ブーストエフェクト
        this.objectPools["boostEffect"].pick(function(chip) {
          chip.spawn(player.x-5, player.y);
        });
      }
    } else {
      this.playerBitLayer.visible = false;
    }

  },

  shotEnemyHitTest: function(shot, enemy) {
    var cls = Collision;
    var self = this;
    // if (enemy.invinsible || enemy.isAnimating) return;
    // if (shot.hitTestElement(enemy)) {
    if (cls.testCircleCircle(shot, enemy)) {
      self.generateBlast(shot.x, shot.y, 8, "yellowRect");
      shot.remove();

      // 無敵ではダメージは通らない
      if (enemy.invinsible !== 0) return;
      enemy.life -= (enemy.isSuperArmor) ? 0 : shot.power;
    }
  },

  generateBlast: function(x, y, num, textureName) {
    for (var i = 0; i < num; i++) {
      this.objectPools[textureName].pick(function(chip) {
        chip.spawn(x, y, 630/num * i);
      });
    }
  },

  resetBitPosition: function(pos) {
    pos = pos || this.player.position;
    this.playerBitLayer.children.forEach(function(bit) {
      bit.clearPath().position.set(pos.x, pos.y);
    });
  },

  playerDestroyed: function() {
    var self = this;
    var player = this.player;

    // self.flare('playerDestroyed');
    self.generateBlast(player.x, player.y, 32, "redRect");
    self.remainLife--;

    player.destroyed(function() {
      if (self.remainLife < 0) {
        // game over...
        self.showResult();
      } else {
        // 自機復活
        player.respawn(function(){
          self.resetBitPosition();
          // self.flare('playerRespawned');
        });
        self.bombGauge.refill();
      }
    });
  },

  enemyDestroyed: function (enemy) {
    if (enemy.isBoss) {
      // Boss撃破
      this.bossDestroyed(enemy);
    } else {

      // 雑魚撃破
      this.generateBlast(enemy.x, enemy.y, 32, "redRect");
      enemy.remove();

      // item
      if (enemy.hasItem) {
        for (var i = 0; i < 6; i++) {
          var r_x = RAND_INTS.pickup();
          var r_y = RAND_INTS.pickup();
          ScoreItem(enemy.x+r_x, enemy.y+r_y).addChildTo(this.itemLayer);
        }
        // PowerUpItem(enemy.x, enemy.y).addChildTo(this.itemLayer);
      }
    }

    if (enemy.score != null) this._score += enemy.score;
  },

  bossAppearance: function() {
    var self = this;
    this.tweener.clear()
    .wait(1500)
    .call(function(){

      // TODO：(雑魚片す？) -> ワーニング cb-> ボス出現
      self.UILayer.showWarning(function() {
        var boss = Boss().addChildTo(self.enemyLayer).resetPosition();
        var brtl = self.UILayer.bossRemainTimeLabel;
        brtl.setVisible(true);

        boss.on('patternChange', function() {
          self.generateBlast(boss.x, boss.y, 32, "redRect");
        });

        boss.one('timeup', function() {
          // console.log("Time up");
          brtl.setVisible(false);
          self.bossDestroyed(boss);
        })

        self.on('enterframe', function() {
          brtl.text = BOSS_AGE_OF_DEATH - boss.ageSum;
        })

        self.UILayer.bossLifeGauge.setVisible(true).setTarget(boss);
      });
    })
  },

  bossDestroyed: function(enemy) {
    // if (!this.isStarted) return;
    if (enemy.isDestroyed) return;
    var self = this;

    enemy.isDestroyed = true;
    self.UILayer.bossLifeGauge.setVisible(false);
    this.tweener.clear()
    .call(function() {
      // 無敵化
      // self.player.isAnimating = true;
      self.player.invinsible = Infinity;

      self.generateBlast(enemy.x, enemy.y, 32, "redRect");
      enemy.isAnimating = true;
      // enemy.animation.gotoAndPlay('dead');
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
      WhiteCircleFlash(enemy.x, enemy.y).addChildTo(self.effectLayer);
      enemy.remove();
    })
    .wait(1400)
    .call(function() {
      // TODO: プレイヤー画面外へ？
      self.player.invinsible = 0;
      self.showResult();
    })
    ;
  },

  gameStart: function () {
    var self = this;
    var player = this.player;

    // プレイヤーキャラアニメーション -> スクロール開始 -> UI表示＆ゲーム開始
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
      self.resetBitPosition();
    })
    ;

    // スクロールのスローダウン
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
    // var fireNway = function(n) {
    //   for (var i=0; i < n; i++) {
    //     var angle = - SHOT_ANGLE_UNIT * ((n - 1) * 0.5) + i * SHOT_ANGLE_UNIT;
    //     this.objectPools['playerShot'].pick(function(shot) {
    //       shot.spawn(player.x, player.y-2, angle);
    //     });
    //   }
    // }.bind(this);

    // スパイラルショット
    for (var i = 0; i < 2; i++) {
      this.objectPools['playerShot'].pick(function(shot) {
        shot.spawn(player.x, player.y, 0, 90+i*180);
      });
    }

    // nway
    // switch (this._shotLevel) {
    //   case 1: fireNway(1); break;
    //   case 2: fireNway(3); break;
    //   case 3: fireNway(5); break;
    //   case 4:
    //     fireNway(5);
    //     // backshot
    //     for (var i=0; i < 2; i++) {
    //       var angle = 160 + (i * 20 * 2);
    //       this.objectPools['playerShot'].99(function(shot) {
    //         shot.spawn(player.x, player.y-2, angle);
    //       });
    //     }
    //     break;
    //   default: fireNway(1); break;
    // }

    // bit shot
    var bits = this.playerBitLayer.children;
    if (bits.length > 0) {
      bits.forEach(function(bit) {
        HomingShot(bit.x, bit.y).addChildTo(this.shotLayer);
     }.bind(this));
    }
  },

  addPlayerBit: function() {
    var index = this.playerBitLayer.children.length;
    // var col = (index/2 | 0) + 1;
    // var yUnit = (index%2 === 0) ? -PLAYER_BIT_INTERVAL : PLAYER_BIT_INTERVAL;
    // var bit = PlayerBit(-PLAYER_BIT_INTERVAL*col, yUnit*col, this.player)
    var bit = PlayerBit(this.player)
    .addChildTo(this.playerBitLayer);
    bit.delay = (index+1) * BIT_DELAY_INTERVAL;
  },

  // ボム （C.A.S.）
  fireBomber: function() {
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
      // if (!enemy.isBoss) enemy.life -= BOMB_POWER;
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