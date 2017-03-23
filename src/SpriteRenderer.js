
/**
 * SpriteRenderer
 */
phina.namespace(function() {

  var nextPow2 = function(x) {
    return Math.pow(2, Math.round(Math.max(x,0)).toString(2).length);
  }

  Math.log2 = Math.log2 || function(x) {
    return Math.log(x) / Math.LN2;
  };

  var BatchBuffer = function(byteSize) {
    this.vertices = new ArrayBuffer(byteSize);
    this.float32View = new Float32Array(this.vertices);
    this.uint32View = new Uint32Array(this.vertices);
  };

  // temp
  // var _assigned = false;

  phina.define('phina.gl2d.SpriteRenderer', {
    superClass: 'phigl.Drawable',

    fullUnitSize: 0,

    init: function(gl, program, maxSprite) {
      this.superInit(gl);

      this._index = 0;
      this.drawType = gl.STREAM_DRAW;

      // this.size = maxSprite || 4096; // pixi v4のデフォルト
      this.size = maxSprite || 2000;
      this.sprites = [];

      this.groups = [];
      for (var i = 0; i < this.size; i++) {
        this.groups[i] = { texture: null, size: 0, start: 0 };
      }

      // program
      program = program || phina.gl2d.SpriteRenderer.createProgram(gl);
      this.setProgram(program)
      // .setAttributes("position", "uv", "color")
      .setUniforms("vpMatrix", "texture")
      ;

      // index 設定
      var indices = [];
      for (var i=0, j=0; i < this.size; i++, j+=4) {
        indices = indices.concat([
          // [0, 1, 2, 1, 2, 3], [4, 5, 6, 5, 6, 7]...
          j, j+1, j+2, j+1, j+2, j+3
        ]);
      }
      this.setIndexValues(indices);

      // attribute 設定
      var attributes = [
        {
          name: "position",
          type: gl.FLOAT,
          attributeSize: 2, // attributeのサイズ
          unitSize: 2, // indexシフト用のみに使う 基本はattributeSizeと一緒
        },
        {
          name: "uv",
          attributeSize: 2,
          // type: gl.UNSIGNED_SHORT,
          // unitSize: 1,
          // normalize: true,
          type: gl.FLOAT,
          unitSize: 2,
        },
        {
          name: "color",
          type: gl.FLOAT,
          attributeSize: 4,
          unitSize: 4,
        },
      ];
      attributes.each(function(attr) {
        this.fullUnitSize += attr.unitSize;
        this.setAttribute(attr.name, attr.type, attr.attributeSize, attr.normalize || false);
      }.bind(this));

      // 空のvertex buffer生成
      var vbo = phigl.Vbo(this.gl).set(0);
      this.setAttributeVbo(vbo); // specify

      // BatchBuffer
      // 使う頂点データ量 （==スプライト数）に応じてバッファサイズを変更する
      this.buffers = [];
      for (var i = 1; i <= nextPow2(this.size); i*=2) {
        var numVertsTemp = i * 4 * this.stride;
        this.buffers.push(new BatchBuffer(numVertsTemp));
      }

      if (this.indices) this.indices.bind();
    },

    // 頂点情報をセットする
    assignSprite: function(sprite, index) {
      var srcRect = sprite.srcRect;
      var rW = sprite._image.domElement.width;
      var rH = sprite._image.domElement.height;
      var og = sprite.origin;
      var wm = sprite._worldMatrix;
      var wa = sprite._worldAlpha;

      // frameサイズ
      // TODO: 毎回やる必要はない frameIndex変更時に再計算する
      var f = {
        x: srcRect.x / rW,
        y: srcRect.y / rH,
        dx: (srcRect.x + srcRect.width) / rW,
        dy: (srcRect.y + srcRect.height) / rH,
      };

      var unit = this.fullUnitSize;
      var startIndex = index * unit * 4;
      var subIndex = 0;
      // var data = this.vbo.array;
      var data = this.buffer.float32View;
      // var uint32View = this.buffer.uint32View;

      // TODO: Transformはシェーダ側で計算する？
      // left down
      var px = - og.x * sprite._width;
      var py = (1 - og.y) * sprite._height;
      data[startIndex + subIndex] = px * wm.m00 + py * wm.m01 + wm.m02;
      data[startIndex + subIndex + 1] = px*wm.m10 + py * wm.m11 + wm.m12;
      // uint32View[startIndex + subIndex + 2] = uvs[0];
      data[startIndex + subIndex + 2] = f.x;
      data[startIndex + subIndex + 3] = f.dy;
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

      return this;
    },

    render: function(obj) {
      if (!obj.visible) return;

      obj._calcWorldAlpha && obj._calcWorldAlpha();

      // 透明なら描画しない
      if (obj._worldAlpha && obj._worldAlpha <= 0) return;

      // スプライト数限界時は描画
      if (this._index >= this.size) {
        this.flush();
      }

      // 描画されない（格納用の空）オブジェクトも計算
      obj._calcWorldMatrix && obj._calcWorldMatrix();

      // テクスチャ&コンテキスト無ければ追加
      if (obj.image) {
        if (!obj.image._glTexture) {
          obj.gl = this.gl;
          obj.image._glTexture = phigl.Texture(this.gl, obj.image);
        }

        this.sprites[this._index++] = obj;
      }

      // 子要素
      if (obj.children.length > 0) {
        obj.children.forEach(function(child) {
          this.render(child)
        }.bind(this))
      }

      return this;
    },

    flush: function() {
      if (this._index === 0) return;

      var gl = this.gl;
      var ext = this.extVao;
      var currentTexture = null;
      var nextTexture = null;
      var groups = this.groups;
      var groupCount = 1;
      var currentGroup = groups[0];
      var i;

      // 使用バッファの選定
      var np2 = nextPow2(this._index);
      var log2 = Math.log2(np2);
      this.buffer = this.buffers[log2];

      currentGroup.start = 0;
      currentGroup.texture = null;

      for (i = 0; i < this._index; i++) {
        var sprite = this.sprites[i];

        // textureに応じてグループ分けする処理
        nextTexture = sprite.image;
        if (currentTexture !== nextTexture) {
          currentTexture = nextTexture;

          if (currentGroup.texture != null) {
            currentGroup.size = i - currentGroup.start;
            // グループ切り替え
            currentGroup = groups[groupCount++];
            currentGroup.start = i;
          }

          // 初回・切り替え後グループいずれもtextureを入れる処理は入る
          currentGroup.texture = sprite.image._glTexture;
        }

        this.assignSprite(sprite, i);
      }

      currentGroup.size = i - currentGroup.start;

      // vbo更新
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo._vbo);
      // gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vbo.array);
      if (this.vbo.array.byteLength >= this.buffer.vertices.byteLength) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.buffer.vertices);
      } else {
        gl.bufferData(gl.ARRAY_BUFFER, this.buffer.vertices, this.drawType);
      }
      this.vbo.array = this.buffer.vertices; // データ同期
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      // draw
      // this.program.use();
      for (i = 0; i < groupCount; ++i) {
        var group = groups[i];
        var txt = this.uniforms.texture;
        this.uniforms.texture.setTexture(group.texture);

        // if (this.vao) {
          // ext.bindVertexArrayOES(this.vao);
        // } else {
          // if (this.indices) this.indices.bind();
          // if (this.vbo) this.vbo.bind();
          // var stride = this.stride;
          // var offsets = this.offsets;
          // this.attributes.forEach(function(v, i) { v.specify(stride, offsets[i]) });
        // }

        // テクスチャのバインド等
        this.uniforms.forIn(function(k, v) { v.assign() });
        // if (!_assigned) {
        //   // 最初だけ
        //   this.uniforms.forIn(function(k, v) { v.assign() });
        //   _assigned = true;
        // }

        this.flare("predraw");
        gl.drawElements(this.drawMode, group.size * 6, gl.UNSIGNED_SHORT, group.start * 6 * 2);
        this.flare("postdraw");

        // bind解除 いらない？
        // if (this.vao) {
        //   ext.bindVertexArrayOES(null);
        // } else {
          // phigl.Ibo.unbind(gl);
          // phigl.Vbo.unbind(gl);
        // }

        // this.uniforms.forIn(function(k, v) { v.reassign() });
      };

      this._index = 0;

      return this;
    },

    _static: {

      vertexShaderSource: [
        "precision highp float;", // 一部のGPU向け？
        "attribute vec2 position;",
        "attribute vec2 uv;",
        "attribute vec4 color;",

        "uniform mat4 vpMatrix;",

        "varying vec2 vUv;",
        "varying vec4 vColor;",

        "void main(void) {",
        "  gl_Position = vpMatrix * vec4(position, 0.0, 1.0);",

        "  vUv = uv;",
        "  vColor = vec4(color.rgb * color.a, color.a);",
        "}",
      ].join("\n"),

      fragmentShaderSource: [
        "precision mediump float;",
        "uniform sampler2D texture;",

        "varying vec2 vUv;",
        "varying vec4 vColor;",

        "void main(void) {",
        // "  gl_FragColor = texture2D(texture, vUv);",
        "  gl_FragColor = texture2D(texture, vUv) * vColor;",
        "}",
      ].join("\n"),

      createProgram: function(gl) {
        var vertexShader = phigl.VertexShader();
        vertexShader.data = this.vertexShaderSource;

        var fragmentShader = phigl.FragmentShader();
        fragmentShader.data = this.fragmentShaderSource;

        return phigl.Program(gl)
        .attach(vertexShader)
        .attach(fragmentShader)
        .link(); // active uniformの取り出しなど
      },
    },
  });

});
