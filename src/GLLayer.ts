// WIP:
import * as phina from 'phina.js';
import GLCore from './Core';
import SpriteRenderer from './SpriteRenderer'
import {calcVPMatrix} from './utils'

/**
 * @class phina.gl2d.GLLayer
 * 表示用Layerクラス
 * 基本的にはこれしか使わない
 */
// export default phina.createClass({
export default phina.define('phina.gl2d.GLLayer', {
  superClass: phina.display.Layer,

  renderChildBySelf: true,
  resolution: 1.0,

  init: function(param) {
    this.superInit(param);

    var core = new GLCore();
    var gl = this.gl = core.context;
    this.domElement = core.view;
    var sw = this.domElement.width = this.width * this.resolution | 0;
    var sh = this.domElement.height = this.height * this.resolution | 0;

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

    this.renderer = SpriteRenderer(gl);
    this.renderer.getUniform('vpMatrix').value = calcVPMatrix(sw, sh);
  },

  draw: function(canvas) {
    var self = this;
    var gl = this.gl;
    var image = this.domElement;
    var renderer = this.renderer;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (this.children.length > 0) {
      var tempChildren = this.children.slice();
      for (var i=0, len=tempChildren.length; i < len; ++i) {
        renderer.render(tempChildren[i]);
      }

      renderer.flush();
    }

    canvas.context.drawImage(image,
      0, 0, image.width, image.height,
      0, 0, this.width, this.height
    );
  },

});
