phina.namespace(function() {

  /**
   * @class phina.gl2d.GLLayer
   * 表示用Layerクラス
   * 基本的にはこれしか使わない
   */
  phina.define("phina.gl2d.GLLayer", {
    superClass: "phina.display.Layer",

    renderChildBySelf: true,
    gl: null,
    resolution: 1.0,
    domElement: null,
    renderer: null,

    init: function(param) {
      this.superInit(param);

      var gl = this.gl = phina.gl2d.GLContext.getContext();
      if (!gl) {
        console.error("お使いのブラウザはWebGLに対応していません");
        return;
      }

      this.domElement = phina.gl2d.GLContext.getView();
      var w = this.width;
      var h = this.height;
      var sw = this.domElement.width = this.width * this.resolution | 0;
      var sh = this.domElement.height = this.height * this.resolution | 0;

      // 基本設定
      gl.disable(gl.DEPTH_TEST);
      // gl.enable(gl.DEPTH_TEST);
      // gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.CULL_FACE);

      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(0, 0, sw, sh);
      gl.viewport(0, 0, sw, sh);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // 重なったときのブレンドモード：透過
      gl.clearColor(0.0, 0.0, 0.0, 0.0);

      // カメラ
      this.camera = phina.gl2d.Camera()
      .setPosition(sw * 0.5, sh * 0.5, 1)
      .lookAt(sw * 0.5, sh * 0.5, 0)
      .ortho(-sw * 0.5, sw * 0.5, -sh * 0.5, sh * 0.5, 0, 1)
      .calcVpMatrix();

      // this.rootRenderTarget = phigl.Framebuffer(gl, sw, sh).bind();

      var renderer = this.renderer = phina.gl2d.SpriteRenderer(gl);
      renderer.uniforms.vpMatrix.value = this.camera.uniformValues().vpMatrix;
    },

    draw: function(canvas) {
      var self = this;
      var gl = this.gl;
      var image = this.domElement;
      var renderer = this.renderer;

      // webgl未対応の場合
      if (!gl) {
        return phina.display.Layer.prototype.draw.apply(this, arguments);
      }

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      if (this.children.length > 0) {
        var tempChildren = this.children.slice();
        for (var i=0, len=tempChildren.length; i < len; ++i) {
          renderer.render(tempChildren[i]);
        }

        renderer.flush();
      }

      // gl.flush();
      canvas.context.drawImage(image,
        0, 0, image.width, image.height,
        0, 0, this.width, this.height
      );
    },

  });

});