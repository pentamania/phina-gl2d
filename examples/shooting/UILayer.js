
phina.define('TitleLayer', {
  superClass: 'phina.display.Layer',

  init: function(options) {
    this.superInit(options);
    this.renderChildBySelf = false;
    var gx = this.gridX;
    var gy = this.gridY;

    // Title label
    this.scoreLabel = Label({
      text: GAME_TITLE,
      fill: "#EA342B",
      stroke: "#573535",
      fontSize: 50,
    }).addChildTo(this)
    // .setOrigin(1, 0)
    .setPosition(gx.center(), gy.span(5))

    // "Press start..."
    var startLabel = this.startButton = Button({
      text: "Press here or Z-key to start !",
      fill: "transparent",
      // fill: "white",
      // stroke: "#6E6E6E",
      fontColor: "blue",
      fontSize: 20,
      width: SCREEN_WIDTH * 0.8
    })
    // setSize(SCREEN_WIDTH * 0.8)
    .addChildTo(this)
    .setPosition(gx.center(), gy.span(12));

    startLabel.tweener
    .setLoop(true)
    .to({
      alpha: 0,
    }, 450).to({
      alpha: 1.0,
    }, 450);

  },

});

/**
 * UI Layer
 */
phina.define('UILayer', {
  superClass: 'phina.display.Layer',

  init: function(param) {
    this.superInit(param);

    this.renderChildBySelf = false;
    var gx = this.gridX;
    var gy = this.gridY;
    this.alpha = 0.7;

    // ゲームオーバーラベル
    this.gameoverLabel = Sprite('gameoverLabel')
    .setPosition(gx.center(), -gy.center())
    .addChildTo(this)
    ;

    // スコアラベル
    this.scoreLabel = Label({
      fill: "#46D292",
      stroke: "#7163F6",
      fontSize: 20,
      textAlign: "right"
    }).addChildTo(this)
    .setOrigin(1, 0)
    .setPosition(gx.span(16), 10)

    // 残機表示
    var container = DisplayElement()
    .setPosition(0, gy.span(15))
    .addChildTo(this);

    // 残機アイコン
    var icon = Sprite("tomapiyo", 64, 64)
    .setScale(0.4, 0.4)
    .setOrigin(0, 0.5)
    .addChildTo(container);
    icon.frameIndex = 0;

    // 残機数
    this.remainLifeLabel = Label({
      stroke: "#2037E2",
      textAlign: "left",
      fontSize: 16,
    }).addChildTo(container)
    .setPosition(icon.width, 0)
    ;

    // Warning
    this.warningText = WarningText()
    .setPosition(this.width * 2, gy.center())
    // .setVisible(false)
    .addChildTo(this);

    // ボス用ライフゲージ
    this.bossLifeGauge = LifeGauge()
    .setPosition(this.width * 0.5, gy.span(0))
    .setVisible(false)
    .addChildTo(this)
    ;

    // ボス制限時間
    var brtl = this.bossRemainTimeLabel = Label({
      text: null,
      fill: "#2BDA44",
      stroke: "#045A43",
      fontSize: 42,
      fontFamily: "Aldrich",
    })
    .setVisible(false)
    .setPosition(gx.center(), gy.span(5))
    .addChildTo(this)
    ;
    brtl.tweener.clear()
    .to({alpha: 0}, 600)
    .to({alpha: 1}, 600)
    .setLoop(1)
    ;

    // ボム発動ボタン
    var bbtn = this.bomberButton = Sprite('buttonBG')
    .setPosition(this.width * 0.9, gy.span(14))
    .setInteractive(true)
    .addChildTo(this);
    Label({text:"B", fill: "#6F0303", fontSize:14, fontFamily: "Aldrich"})
    .addChildTo(bbtn);
  },

  showGameover: function() {
    this.gameoverLabel.tweener.clear()
    .to({y: this.gridY.center()}, 1000, "easeOutBounce");
  },

  showWarning: function(cb) {
    if (DEBUG_MODE) return cb();

    this.warningText.setVisible(true).playAnim(function() {
      cb();
    }.bind(this));
    // this.warningText.on('animEnd', cb);
  }

});

/**
 * ResultLayer
 *
 */
phina.define('ResultLayer', {
  superClass: 'phina.display.Layer',

  init: function(options) {
    this.superInit(options);
    this.renderChildBySelf = false;
    var gx = this.gridX;
    var gy = this.gridY;
    this.visible = false;

    // Title label
    this.titleLabel = Label({
      text: "Gameover!",
      fill: "#EA342B",
      stroke: "#573535",
      fontSize: 60,
    }).addChildTo(this)
    .setPosition(gx.center(), gy.span(5))

    // score label
    this.scoreLabel = Label({
      fill: "white",
      stroke: "#6E6E6E",
      fontSize: 30,
      text: "SCORE\n10",
      align: "center",
    }).addChildTo(this)
    .setPosition(gx.center(), gy.span(8))

    // replay
    this.retryButton = Button({
      text: "最初から",
      width: 160,
      fill: "#FBED0F",
      height: 40,
      fontSize: 20,
      cornerRadius: 4,
    }).addChildTo(this)
    .setPosition(gx.center(), gy.span(11));
    this.retryButton.onclick = function() {
      Log("replay");
      // this.replay();
      this.parent.exit('main');
    }.bind(this);

    // twitter share link
    this.shareButton = Button({
      text: "twitterでシェア",
      width: 160,
      height: 40,
      fontSize: 20,
      cornerRadius: 4,
    }).addChildTo(this)
    .setPosition(gx.center(), gy.span(14))
    ;
  },

  setResult: function(score) {
    // TODO: tweenerで表示させる？
    this.scoreLabel.text = "点\n" + score;

    // ツイートURL先を（無理やり）index.htmlにする
    var href = phina.global.location.href;
    var filename = href.match(".+/(.+?)\.[a-z]+([\?#;].*)?$")[1];
    var indexPath = href.replace(filename, "index");

    this.shareButton.onclick = function() {
      var message = GAME_TITLE;
      var hashtags = ['phina_js', 'phina-gl2d'];
      var text = '{0} 点: {1} \n'.format(message, score);
      var url = phina.social.Twitter.createURL({
        text: text,
        hashtags: hashtags,
        url: indexPath,
      });
      window.open(url, 'share window', 'width=480, height=320');
    }

    return this;
  },

});
