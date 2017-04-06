
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
    var startLabel = Label({
      text: "Press screen to start !",
      fill: "white",
      stroke: "#6E6E6E",
      fontSize: 20,
    }).addChildTo(this)
    .setPosition(gx.center(), gy.span(12));

    startLabel.tweener
    .setLoop(true)
    .to({
      alpha: 0,
    }, 450).to({
      alpha: 1.0,
    }, 450);

  },

  withdrawAnim: function() {

  }
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
    .setPosition(this.width*2, gy.center())
    // .setVisible(false)
    .addChildTo(this);

    // ボス用ライフゲージ
    this.bossLifeGauge = LifeGauge()
    .setPosition(this.width * 0.5, gy.span(0))
    .setVisible(false)
    .addChildTo(this)
    ;
    this.alpha = 0.7;
  },

  showGameover: function() {
    this.gameoverLabel.tweener.clear()
    .to({y: this.gridY.center()}, 1000, "easeOutBounce");
  },

  showWarning: function(cb) {
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
    // TODO: tweenerで　移動
    this.scoreLabel.text = "SCORE\n" + score;
    this.shareButton.onclick = function() {
      var message = GAME_TITLE;
      var hashtags = ['phina.js', 'phina-gl2d'];
      var text = '{0} Score: {1}\n'.format(score, message);
        var url = phina.social.Twitter.createURL({
          text: text,
          hashtags: hashtags,
          // url: params.url,
        });
        window.open(url, 'share window', 'width=480, height=320');
    }
    return this;
  },
});
