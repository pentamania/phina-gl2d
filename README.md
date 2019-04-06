phina-gl2d
===

SpriteクラスをwebGL描画するphina.js用簡易プラグインです。

[サンプルシューティングゲーム](https://github.com/pentamania/toma-shooting)

## Usage
phina.gl2d.GLLayerクラスのインスタンスを生成し、そこにSpriteインスタンスを追加するだけでOKです。  

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>phina.gl2d sample</title>
</head>
<body>
  <script src='path/to/phina.js'></script>
  <script src="path/to/phina-gl2d.js"></script>

  <script type="text/javascript">
    phina.define("MainScene", {
      superClass: "phina.display.DisplayScene",

      init: function(param) {
        this.superInit(param);
        this.glLayer = phina.gl2d.GLLayer(param).addChildTo(this);

        this.player = Sprite('player').addChildTo(this.glLayer);
      },
    });

    phina.main(function() {
      var app = phina.game.GameApp({
        assets: {
          player: "./assets/player.png"
        },
        startLabel: 'main',
      });

      app.run();
    });
  </script>
</body>
</html>
```

### Note
同じテクスチャ由来のSpriteクラスはバッジ処理してドローコールを節約するよう設計されています。  
なので画像を一枚にまとめ（スプライトシート化）、スプライトが全て同じテクスチャ由来となるよう調整すると、最もパフォーマンスがよくなります。

## Inspired by
- [pixi.js](http://www.pixijs.com/)
- [phigl.js](https://github.com/daishihmr/phigl.js)
