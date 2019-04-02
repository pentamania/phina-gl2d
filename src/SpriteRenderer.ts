import * as phina from 'phina.js'
import Program from './Program'
import Uniform from './Uniform'
import Attribute from './Attribute'
import Gl2dTexture from './Texture'
import {VertexShader, FragmentShader} from './shaders'
import {
  ATTRIBUTES,
  UNIFORMS,
  DEFAULT_VERTEX_SHADER_SOURCE,
  DEFAULT_FRAGMENT_SHADER_SOURCE
} from './constants'
import {nextPow2, logTwo} from './utils'
import {Ibo, Vbo} from './buffers'

interface textureGroup {
  // texture:WebGLBuffer,
  texture:Gl2dTexture, // Gl2dTexture
  size:Number,
  start:Number,
}

/**
 * BatchBuffer
 */
const BatchBuffer = function(byteSize) {
  this.vertices = new ArrayBuffer(byteSize);
  this.float32View = new Float32Array(this.vertices);
  this.uint32View = new Uint32Array(this.vertices);
};

const VERTEX_PER_SPRITE = 4; // スプライト毎に４頂点必要

/**
 * phina.gl2d.SpriteRenderer
 */
export default phina.createClass({
  superClass: phina.util.EventDispatcher,

  init: function(gl, maxSpriteNum:number=2048) {
    this.superInit();
    this.gl = gl;
    this.drawType = gl.STREAM_DRAW;
    this.drawMode = gl.TRIANGLES;

    this.maxSpriteNum = maxSpriteNum;
    this.sprites = [];
    this._index = 0; // スプライト描画カウント

    // スプライトをテクスチャごとにグループ分割
    // @TODO: グループは動的に増やすようにする？
    this.groups = [];
    for (let i = 0; i < this.maxSpriteNum; i++) {
      let group: textureGroup = {
        texture: null,
        size: 0,
        start: 0
      };
      this.groups[i] = group;
    }

    // shader/program
    const vs = new VertexShader(gl, DEFAULT_VERTEX_SHADER_SOURCE).compile();
    const fs = new FragmentShader(gl, DEFAULT_FRAGMENT_SHADER_SOURCE).compile();
    const prg = this.program = new Program(gl, vs, fs).link();

    /* index & ibo */
    var indices = [];
    for (var i=0, j=0; i < this.maxSpriteNum; i++, j+=VERTEX_PER_SPRITE) {
      indices = indices.concat([
        // [0, 1, 2, 1, 2, 3], [4, 5, 6, 5, 6, 7]...
        j, j+1, j+2, j+1, j+2, j+3
      ]);
    }
    this.ibo = new Ibo(gl).setData(indices).bind();

    /* vbo setup */
    this.vbo = new Vbo(gl);

    // attribute setup, strideの計算
    let stride = 0;
    const attributes = [];
    this._attrTotalSize = 0; // スプライト一枚あたりのattributeデータサイズ:後で動的計算
    ATTRIBUTES.forEach( attrData => {
      const attribute = new Attribute(gl, prg, attrData.name, attrData.type, stride)
      attribute.assignVbo(this.vbo.glVbo);
      this._attrTotalSize += attribute.size; // attrubuteサイズ総数計算
      stride += attribute.byteSize;
      attributes.push(attribute);
    });
    // 最終的なstrideのセット＆attribute有効化
    attributes.forEach( attr => {
      attr.setStride(stride).specify();
    });
    // console.log("stride", stride);
    // console.log("total", this._attrTotalSize);
    // console.log("active", gl.getProgramParameter(prg.glProgram, gl.ACTIVE_ATTRIBUTES));

    // BatchBuffer setup: 使う頂点データ量（==スプライト数*全attributeデータサイズ）に応じてバッファサイズを変更する
    this.batchBuffers = [];
    for (let i = 1; i <= nextPow2(this.maxSpriteNum); i*=2) {
      let numVertsTemp = i * VERTEX_PER_SPRITE * stride;
      this.batchBuffers.push(new BatchBuffer(numVertsTemp));
    }

    /* uniforms setup */
    this.uniforms = [];
    UNIFORMS.forEach( uniData => {
      const uniform = new Uniform(gl, prg, uniData.name, uniData.type)
      if (uniData.value !== undefined) uniform.value = uniData.value;
      this.uniforms.push(uniform);
    });
  },

  getUniform: function(uniformName:string) {
    var uniform = this.uniforms.find( uni => {
      return uni.name === uniformName;
    });
    if (!uniform) {
      console.error(`${uniformName} doesn't exist`);
      return
    }
    return uniform;
  },

  /**
   * スプライト毎に頂点情報セットする
   * @param {phina.Display.Sprite} sprite
   * @param {number} index スプライトのインデックス
   */
  assignSprite: function(sprite, spriteIndex) {
    const srcRect = sprite.srcRect;
    const rW = sprite._image.domElement.width;
    const rH = sprite._image.domElement.height;
    const og = sprite.origin;
    const wm = sprite._worldMatrix;
    const wa = sprite._worldAlpha;

    // frameサイズ
    // @TODO: 毎回やる必要はない frameIndex変更時に再計算する
    const f = {
      x: srcRect.x / rW,
      y: srcRect.y / rH,
      dx: (srcRect.x + srcRect.width) / rW,
      dy: (srcRect.y + srcRect.height) / rH,
    };

    const unit = this._attrTotalSize; // 一頂点あたりのattribute全要素数

    // メモリ上の開始位置位置、頂点は4点なので4を掛ける
    const startIndex = spriteIndex * unit * VERTEX_PER_SPRITE;
    let subIndex = 0; // attribute各要素毎のインデックス
    const data = this.buffer.float32View;

    // TODO: Transformはシェーダ側で計算する？

    // left down
    let px = - og.x * sprite._width;
    let py = (1 - og.y) * sprite._height;
    // positionのセット
    data[startIndex + subIndex] = px * wm.m00 + py * wm.m01 + wm.m02;
    data[startIndex + subIndex + 1] = px*wm.m10 + py * wm.m11 + wm.m12;
    // uvのセット
    data[startIndex + subIndex + 2] = f.x;
    data[startIndex + subIndex + 3] = f.dy;
    // colorのセット
    data[startIndex + subIndex + 4] = 1.0;
    data[startIndex + subIndex + 5] = 1.0;
    data[startIndex + subIndex + 6] = 1.0;
    data[startIndex + subIndex + 7] = wa;

    // right down
    subIndex += unit;
    px = (1 - og.x) * sprite._width;
    py = (1 - og.y) * sprite._height;
    data[startIndex + subIndex] = px * wm.m00 + py * wm.m01 + wm.m02;
    data[startIndex + subIndex + 1] = px * wm.m10 + py * wm.m11 + wm.m12;
    // uint32View[startIndex + subIndex + 2] = uvs[1];
    data[startIndex + subIndex + 2] = f.dx;
    data[startIndex + subIndex + 3] = f.dy;
    data[startIndex + subIndex + 4] = 1.0;
    data[startIndex + subIndex + 5] = 1.0;
    data[startIndex + subIndex + 6] = 1.0;
    data[startIndex + subIndex + 7] = wa;

    // left up
    subIndex += unit;
    px = -og.x * sprite._width;
    py = -og.y * sprite._height;
    data[startIndex + subIndex] = px * wm.m00 + py * wm.m01 + wm.m02;
    data[startIndex + subIndex + 1] = px * wm.m10 + py * wm.m11 + wm.m12;
    // uint32View[startIndex + subIndex + 2] = uvs[2];
    data[startIndex + subIndex + 2] = f.x;
    data[startIndex + subIndex + 3] = f.y;
    data[startIndex + subIndex + 4] = 1.0;
    data[startIndex + subIndex + 5] = 1.0;
    data[startIndex + subIndex + 6] = 1.0;
    data[startIndex + subIndex + 7] = wa;

    // right up
    subIndex += unit;
    px = (1 - og.x) * sprite._width;
    py = - og.y * sprite._height;
    data[startIndex + subIndex] = px * wm.m00 + py * wm.m01 + wm.m02;
    data[startIndex + subIndex + 1] = px * wm.m10 + py * wm.m11 + wm.m12;
    // uint32View[startIndex + subIndex + 2] = uvs[3];
    data[startIndex + subIndex + 2] = f.dx;
    data[startIndex + subIndex + 3] = f.y;
    data[startIndex + subIndex + 4] = 1.0;
    data[startIndex + subIndex + 5] = 1.0;
    data[startIndex + subIndex + 6] = 1.0;
    data[startIndex + subIndex + 7] = wa;
  },

  render: function(obj) {
    if (!obj.visible) return;

    obj._calcWorldAlpha && obj._calcWorldAlpha();

    // 透明なら描画しない
    if (obj._worldAlpha && obj._worldAlpha <= 0) return;

    // スプライト数限界時は描画
    if (this.maxSpriteNum <= this._index) {
      this.flush();
    }

    // 描画されない（格納用の空）オブジェクトも計算
    obj._calcWorldMatrix && obj._calcWorldMatrix();

    // テクスチャ&コンテキスト無ければ追加
    if (obj.image) {
      if (!obj.image._gl2dTexture) {
        obj.image._gl2dTexture = new Gl2dTexture(this.gl, obj.image);
        // obj.image._gl2dTexture = phigl.Texture(this.gl, obj.image);
      }

      this.sprites[this._index++] = obj;
    }

    // 子要素にもrender
    if (obj.children.length > 0) {
      obj.children.forEach(function(child) {
        this.render(child)
      }.bind(this))
    }

    return this;
  },

  flush: function() {
    if (this._index === 0) return;

    const gl = this.gl;
    const ext = this.extVao;
    const groups = this.groups;

    let currentTexture = null;
    let nextTexture = null;
    let groupCount = 1;
    let currentGroup = groups[0];
    currentGroup.start = 0;
    currentGroup.texture = null;

    // 使用バッファの選定
    const log2 = logTwo(nextPow2(this._index));
    this.buffer = this.batchBuffers[log2];

    {
      // spriteのグループ分け
      let i;
      for (i = 0; i < this._index; i++) {
        var sprite = this.sprites[i];

        // textureに応じてグループ分けする処理
        nextTexture = sprite.image;
        if (currentTexture !== nextTexture) {
          currentTexture = nextTexture;

          // テクスチャが変わってたらグループ切り替え
          if (currentGroup.texture != null) {
            // サイズを記録しておく
            currentGroup.size = i - currentGroup.start;
            // 切り替え
            currentGroup = groups[groupCount++];
            currentGroup.start = i;
          }

          // 初回・切り替え後グループいずれもtextureを入れる処理は入る
          currentGroup.texture = sprite.image._gl2dTexture;
        }

        this.assignSprite(sprite, i);
      }

      // 最後のグループのサイズを記録？
      currentGroup.size = i - currentGroup.start;
    }

    // vbo更新
    this.vbo.setData(this.buffer.vertices);
    // gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo._vbo);
    // // gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vbo.array);
    // if (this.vbo.array.byteLength >= this.buffer.vertices.byteLength) {
    //   gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.buffer.vertices);
    // } else {
    //   gl.bufferData(gl.ARRAY_BUFFER, this.buffer.vertices, this.drawType);
    // }
    // this.vbo.array = this.buffer.vertices; // データ同期
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 描画
    for (let i = 0; i < groupCount; ++i) {
      const group = groups[i];
      this.getUniform('texture').setTexture(group.texture);

      // uniformメソッドの実行：テクスチャのバインド等
      // this.uniforms.forIn(function(k, v) { v.assign() });
      this.uniforms.forEach( uni => { uni.assign() });

      // １スプライトに必要なインデックスは６点？なのでcountはスプライト数*6
      const count = group.size * 6;
      const offset = (group.start * 6) * 2; // offsetバイト数: unsigned Shortは2byte (0 〜 65535)
      this.flare("predraw");
      gl.drawElements(this.drawMode, count, gl.UNSIGNED_SHORT, offset);
      this.flare("postdraw");

      // this.uniforms.forIn(function(k, v) { v.reassign() });
    };

    this._index = 0; // リセット

    return this;
  },

  _static: {

  //   createProgram: function(gl) {
  //     var vertexShader = phigl.VertexShader();
  //     vertexShader.data = this.vertexShaderSource;

  //     var fragmentShader = phigl.FragmentShader();
  //     fragmentShader.data = this.fragmentShaderSource;

  //     return phigl.Program(gl)
  //     .attach(vertexShader)
  //     .attach(fragmentShader)
  //     .link(); // active uniformの取り出しなど
  //   },
  },
});
