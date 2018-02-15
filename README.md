# phina-gl2d
SpriteクラスをwebGL描画するphina.js用簡易プラグインです。

webGLを使うことにより、描画パフォーマンスが向上します。  
どれくらいパフォーマンスがよくなるかはGPUやコード・条件次第ですが、古いオンボードやモバイルでも既定のCanvas2Dと比較して2倍程度は良くなると思います。  
**ただしiOS端末ではあまり効果が期待できないかもしれません。**

[サンプル](https://github.com/pentamania/toma-shooting)

## 使い方
phina.gl2d.GLLayerクラスのインスタンスを生成し、そこにSpriteインスタンスを追加するだけでOKです。  
GLLayerクラスはSpriteクラス以外描画されないことを除けば、通常のLayerクラスと使い方はほぼ変わりません。  

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>phina.gl2d sample</title>
</head>
<body>
  <script src='http://cdn.rawgit.com/phi-jp/phina.js/v0.2.0/build/phina.js'></script>
  <script src="path/to/phina-gl2d.min.js" type="text/javascript"></script>

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
```

### メモ
同じテクスチャ由来のSpriteクラスはバッジ処理してドローコールを節約するよう設計されています。  
なので画像を一枚にまとめ（スプライトシート化）、スプライトが全て同じテクスチャ由来となるよう調整すると、最もパフォーマンスがよくなります。

逆に全てのスプライトが別テクスチャ由来だと通常のCanvas2Dよりもパフォーマンスが劣ってしまう場合があります。  

## サンプル
- [シューティング](https://pentamania.github.io/toma-shooting/)
- [パフォーマンステスト](https://pentamania.github.io/phina-gl2d/examples/benchmark/)
（参考：[Canvas2Dの場合](https://pentamania.github.io/phina-gl2d/examples/benchmark/index.html?webgl=false)）

## インスパイア元
[pixi.js](http://www.pixijs.com/)

## ライセンス
当プラグインのライセンスはMITです。  
また、以下のライブラリを使用しています。

- [phigl.js (MIT)](https://github.com/daishihmr/phigl.js)
- [min.matrix.js (License Free)](https://github.com/doxas/minMatrix.js)
