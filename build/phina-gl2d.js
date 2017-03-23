/*!
 * phina-gl2d.js 0.1.0
 * 
 * The MIT License (MIT)
 * Copyright © 2017 pentamania
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the “Software”), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/*!
 * phigl.js 1.1.1
 * https://github.com/daishihmr/phigl.js
 *
 * The MIT License (MIT)
 * Copyright © 2016 daishihmr <daishi.hmr@gmail.com> (http://github.dev7.jp/)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the “Software”), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*
 modified by pentamania
 */

/**
 * @add
 *プロパティの追加
 */
phina.namespace(function() {

  phina.define("phigl.Attribute", {

    gl: null,
    name: null,
    _location: null,
    _type: null,
    _ptype: null,
    typeByteSize: 4, // @add

    _normalize: null, // @add

    init: function(gl, program, name, type, size, normalize, stride) {
      this.gl = gl;
      this.name = name;
      this._normalize = normalize || false;
      this.size = size || 1;
      // this.stride = stride; // own stride
      // this.offset = offset;

      this._location = gl.getAttribLocation(program, name);
      if (this._location == -1) {
        throw "attribute " + name + " not found";
      }
      gl.enableVertexAttribArray(this._location);

      this._type = type;
      switch (type) {
        case gl.FLOAT:
          // this.size = 1;
          this._ptype = gl.FLOAT;
          break;
        case gl.FLOAT_VEC2:
          // this.size = 2;
          this._ptype = gl.FLOAT;
          break;
        case gl.FLOAT_VEC3:
          // this.size = 3;
          this._ptype = gl.FLOAT;
          break;
        case gl.FLOAT_VEC4:
          // this.size = 4;
          this._ptype = gl.FLOAT;
          break;
        case gl.UNSIGNED_BYTE:
          this.typeByteSize = 1;
          this._ptype = gl.UNSIGNED_BYTE;
          break;
        case gl.UNSIGNED_SHORT:
          this.typeByteSize = 2;
          this._ptype = gl.UNSIGNED_SHORT;
          break;
      }
    },

    // attributeの登録 vboなどのバインド後に実行
    specify: function(stride, offset) {
      var gl = this.gl;
      // stride = this.stride || stride;
      gl.vertexAttribPointer(this._location, this.size, this._ptype, this._normalize, stride, offset);
      return this;
    },

  });

});

phina.namespace(function() {

  phina.define("glb.Detector", {
    _static: {
      isEnable: (function() {
        try {
          var canvas = document.createElement('canvas');
          var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          return !!(window.WebGLRenderingContext && gl && gl.getShaderPrecisionFormat);
        } catch (e) {
          return false;
        }
      })(),
    },
  });

});

phina.namespace(function() {

  phina.define("phigl.Drawable", {
    superClass: "phina.util.EventDispatcher",

    gl: null,
    extVao: null,

    program: null,
    indices: null,
    attributes: null,
    stride: 0,
    offsets: null,
    uniforms: null,
    vbo: null,
    drawMode: 0,
    vao: null,

    init: function(gl, extVao) {
      this.superInit();
      this.gl = gl;
      this.extVao = extVao;
      this.attributes = [];
      this.offsets = [];
      this.uniforms = {};
      this.drawMode = gl.TRIANGLES;
    },

    setDrawMode: function(mode) {
      this.drawMode = mode;
      return this;
    },

    setProgram: function(program) {
      this.program = program;
      program.use();
      return this;
    },

    setIndexValues: function(value) {
      if (!this.indices) this.indices = phigl.Ibo(this.gl);
      this.indices.set(value);
      return this;
    },

    setIndexBuffer: function(ibo) {
      this.indices = ibo;
      return this;
    },

    // @add
    setAttribute: function(name, type, size, normalized, stride, offset) {
      var attr = this.program.uploadAttribute(name, type, size, normalized, stride);
      stride = attr.size * attr.typeByteSize;
      offset = offset || this.stride;
      this.attributes.push(attr);
      this.offsets.push(offset);
      this.stride += stride;

      return this;
    },

    setAttributes: function(names) {
      names = Array.prototype.concat.apply([], arguments);

      var stride = 0;
      for (var i = 0; i < names.length; i++) {
        var attr = names[i];
        if (typeof attr === "string") attr = this.program.getAttribute(attr);
        this.attributes.push(attr);
        this.offsets.push(stride);
        stride += attr.size * 4;
      }
      this.stride = stride;
      return this;
    },

    // vbo生成 ＆ attrbiteへの登録を一緒くたにやる？
    setAttributeData: function(data, usage) {
      if (!this.vbo) {
        this.vbo = phigl.Vbo(this.gl, usage);
      }
      this.vbo.set(data);

      this.vbo.bind();
      var stride = this.stride;
      var offsets = this.offsets;
      this.attributes.forEach(function(v, i) { v.specify(stride, offsets[i]) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    // attrbiteへの登録が適切になるように配置する
    // インターリーブ配列にしてからvbo
    setAttributeDataArray: function(dataArray, usage) {
      if (!this.vbo) {
        this.vbo = phigl.Vbo(this.gl, usage);
      }
      this.vbo.setAsInterleavedArray(dataArray);

      this.vbo.bind();
      var stride = this.stride;
      var offsets = this.offsets;
      this.attributes.forEach(function(v, i) { v.specify(stride, offsets[i]) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    setAttributeVbo: function(vbo) {
      this.vbo = vbo;

      this.vbo.bind();
      var stride = this.stride;
      var offsets = this.offsets;
      this.attributes.forEach(function(v, i) { v.specify(stride, offsets[i]) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    createVao: function() {
      var gl = this.gl;
      var stride = this.stride;
      var offsets = this.offsets;

      if (!this.extVao) this.extVao = phigl.Extensions.getVertexArrayObject(gl);
      if (!this.vao) this.vao = this.extVao.createVertexArrayOES();

      this.extVao.bindVertexArrayOES(this.vao);

      if (this.indices) this.indices.bind();

      if (this.vbo) this.vbo.bind();
      this.attributes.forEach(function(v, i) {
        v.specify(stride, offsets[i]);
        gl.enableVertexAttribArray(v._location);
      });

      this.extVao.bindVertexArrayOES(null);

      phigl.Ibo.unbind(gl);
      phigl.Vbo.unbind(gl);

      return this;
    },

    setUniforms: function(names) {
      names = Array.prototype.concat.apply([], arguments);

      var program = this.program;
      var map = Array.prototype.reduce.call(names, function(m, name) {
        m[name] = program.getUniform(name);
        return m;
      }, {});
      this.uniforms.$extend(map);
      return this;
    },

    draw: function() {
      // console.log("-- begin");

      var gl = this.gl;
      var ext = this.extVao;

      this.program.use();

      if (this.vao) {
        ext.bindVertexArrayOES(this.vao);
      } else {
        if (this.indices) this.indices.bind();
        if (this.vbo) this.vbo.bind();
        var stride = this.stride;
        var offsets = this.offsets;
        this.attributes.forEach(function(v, i) { v.specify(stride, offsets[i]) });
      }

      this.uniforms.forIn(function(k, v) { v.assign() });

      this.flare("predraw");
      this.gl.drawElements(this.drawMode, this.indices.length, gl.UNSIGNED_SHORT, 0);
      this.flare("postdraw");

      if (this.vao) {
        ext.bindVertexArrayOES(null);
      } else {
        phigl.Ibo.unbind(gl);
        phigl.Vbo.unbind(gl);
      }

      this.uniforms.forIn(function(k, v) { v.reassign() });

      // console.log("-- end");
    },
  });

});

phina.namespace(function() {

  phina.define("phigl.Extensions", {

    _static: {

      getVertexArrayObject: function(gl) {
        return this._get(gl, "OES_vertex_array_object");
      },

      getInstancedArrays: function(gl) {
        return this._get(gl, "ANGLE_instanced_arrays");
      },

      _get: function(gl, name) {
        var ext = gl.getExtension(name);
        if (ext) {
          return ext;
        } else {
          throw name + " is not supported";
        }
      }
    },

  });

});

phina.namespace(function() {

  phina.define("phigl.Framebuffer", {
    gl: null,
    texture: null,

    _framebuffer: null,
    _depthRenderbuffer: null,
    _texture: null,

    init: function(gl, width, height) {
      this.gl = gl;
      this.width = width;
      this.height = height;

      this.texture = phigl.Texture(gl);

      this._framebuffer = gl.createFramebuffer();
      this._depthRenderbuffer = gl.createRenderbuffer();
      this._texture = this.texture._texture;

      gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

      gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthRenderbuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthRenderbuffer);

      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0);

      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },

    bind: function() {
      var gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
      return this;
    },

    _static: {
      unbind: function(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      },
    },
  });

});

phina.namespace(function() {

  phina.define("phigl.Ibo", {

    gl: null,
    length: 0,

    _buffer: null,

    init: function(gl) {
      this.gl = gl;
      this._buffer = gl.createBuffer();
    },

    set: function(data) {
      var gl = this.gl;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffer);
      // @modify Int -> Uintに変更
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      this.length = data.length;
      return this;
    },

    bind: function() {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._buffer);
      return this;
    },

    delete: function() {
      this.gl.deleteBuffer(this._buffer);
    },

    _static: {
      unbind: function(gl) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return this;
      },
    },

    _accessor: {
      value: {
        get: function() {
          return null;
        },
        set: function(v) {
          this.set(v);
        },
      },
    },
  });

});

phina.namespace(function() {

  phina.define("phigl.ImageUtil", {

    init: function() {},

    _static: {

      resizePowOf2: function(image, fitH, fitV) {
        if (typeof(image) == "string") {
          image = phina.asset.AssetManager.get("image", image).domElement;
        }

        if (Math.sqrt(image.width) % 1 == 0 && Math.sqrt(image.height) % 1 == 0) {
          return image;
        }

        var width = Math.pow(2, Math.ceil(Math.log2(image.width)));
        var height = Math.pow(2, Math.ceil(Math.log2(image.height)));

        var canvas = phina.graphics.Canvas().setSize(width, height);

        var dw = fitH ? width : image.width;
        var dh = fitV ? height : image.height;

        canvas.context.drawImage(image,
          0, 0, image.width, image.height,
          0, 0, dw, dh
        );

        return canvas;
      }

    },

  });
});

phina.namespace(function() {

  phina.define("phigl.InstancedDrawable", {
    superClass: "phigl.Drawable",

    instanceAttributes: null,
    ext: null,

    instanceVbo: null,
    instanceStride: 0,
    instanceOffsets: null,

    init: function(gl, extInstancedArrays) {
      this.superInit(gl);
      this.ext = extInstancedArrays;
      this.instanceAttributes = [];
      this.instanceOffsets = [];
    },

    setInstanceAttributes: function(names) {
      names = Array.prototype.concat.apply([], arguments);

      var gl = this.gl;
      var ext = this.ext;

      var stride = 0;
      for (var i = 0; i < names.length; i++) {
        var attr = names[i];
        if (typeof attr === "string") attr = this.program.getAttribute(attr);
        this.instanceAttributes.push(attr);
        this.instanceOffsets.push(stride);
        stride += attr.size * 4;
      }
      this.instanceStride = stride;

      return this;
    },

    setInstanceAttributeVbo: function(vbo) {
      this.instanceVbo = vbo;

      this.instanceVbo.bind();
      var iStride = this.instanceStride;
      var iOffsets = this.instanceOffsets;
      this.instanceAttributes.forEach(function(v, i) { v.specify(iStride, iOffsets[i]) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    setInstanceAttributeData: function(data) {
      if (!this.instanceVbo) this.instanceVbo = phigl.Vbo(this.gl, this.gl.DYNAMIC_DRAW);
      this.instanceVbo.set(data);

      this.instanceVbo.bind();
      var iStride = this.instanceStride;
      var iOffsets = this.instanceOffsets;
      this.instanceAttributes.forEach(function(v, i) { v.specify(iStride, iOffsets[i]) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    setInstanceAttributeDataArray: function(dataArray) {
      if (!this.instanceVbo) this.instanceVbo = phigl.Vbo(this.gl);
      this.instanceVbo.setAsInterleavedArray(dataArray);

      this.instanceVbo.bind();
      var iStride = this.instanceStride;
      var iOffsets = this.instanceOffsets;
      this.instanceAttributes.forEach(function(v, i) { v.specify(iStride, iOffsets[i]) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    createVao: function() {
      return this;
    },

    draw: function(instanceCount) {
      var gl = this.gl;
      var ext = this.ext;

      this.program.use();

      if (this.indices) this.indices.bind();

      if (this.vbo) this.vbo.bind();
      var stride = this.stride;
      var offsets = this.offsets;
      this.attributes.forEach(function(v, i) {
        v.specify(stride, offsets[i]);
      });

      if (this.instanceVbo) this.instanceVbo.bind();
      var iStride = this.instanceStride;
      var iOffsets = this.instanceOffsets;
      this.instanceAttributes.forEach(function(v, i) {
        v.specify(iStride, iOffsets[i]);
        ext.vertexAttribDivisorANGLE(v._location, 1);
      });

      this.uniforms.forIn(function(k, v) { v.assign() });

      this.flare("predraw");
      this.ext.drawElementsInstancedANGLE(this.drawMode, this.indices.length, gl.UNSIGNED_SHORT, 0, instanceCount);
      this.flare("postdraw");

      // 解除処理
      this.instanceAttributes.forEach(function(v, i) {
        ext.vertexAttribDivisorANGLE(v._location, 0);
      });
      phigl.Ibo.unbind(gl);
      phigl.Vbo.unbind(gl);
    },

  });

});

phina.namespace(function() {

  phina.define("phigl.PostProcessing", {

    gl: null,
    drawer: null,

    width: 0,
    height: 0,

    init: function(gl, shader, uniforms, width, height) {
      this.gl = gl;

      if (typeof(shader) == "string") {
        shader = phigl.PostProcessing.createProgram(gl, shader);
      }
      width = width || 256;
      height = height || 256;
      uniforms = uniforms || [];

      var sqWidth = Math.pow(2, Math.ceil(Math.log2(width)));
      var sqHeight = Math.pow(2, Math.ceil(Math.log2(height)));

      this.drawer = phigl.Drawable(gl)
        .setDrawMode(gl.TRIANGLE_STRIP)
        .setProgram(shader)
        .setIndexValues([0, 1, 2, 3])
        .setAttributes("position", "uv")
        .setAttributeData([
          //
          -1, +1, 0, height / sqHeight,
          //
          +1, +1, width / sqWidth, height / sqHeight,
          //
          -1, -1, 0, 0,
          //
          +1, -1, width / sqWidth, 0,
        ])
        .setUniforms(["texture", "canvasSize"].concat(uniforms));

      this.width = width;
      this.height = height;
      this.sqWidth = sqWidth;
      this.sqHeight = sqHeight;
    },

    render: function(texture, uniformValues) {
      var gl = this.gl;

      this.drawer.uniforms.texture.setValue(0).setTexture(texture);
      this.drawer.uniforms.canvasSize.value = [this.sqWidth, this.sqHeight];
      if (uniformValues) this.setUniforms(uniformValues);
      this.drawer.draw();

      return this;
    },

    setUniforms: function(uniformValues) {
      var uniforms = this.drawer.uniforms;
      uniformValues.forIn(function(k, v) {
        uniforms[k].value = v;
      });
    },

    calcCoord: function(x, y) {
      return [x / this.sqWidth, (this.height - y) / this.sqHeight];
    },

    _static: {
      vertexShaderSource: [
        "attribute vec2 position;",
        "attribute vec2 uv;",

        "varying vec2 vUv;",

        "void main(void) {",
        "  vUv = uv;",
        "  gl_Position = vec4(position, 0.0, 1.0);",
        "}",
      ].join("\n"),

      createProgram: function(gl, fragmentShader) {
        var vertexShader = phigl.VertexShader(gl);
        vertexShader.data = this.vertexShaderSource;

        return phigl.Program(gl)
          .attach(vertexShader)
          .attach(fragmentShader)
          .link();
      },
    },

  });

});

phina.namespace(function() {
  var id = 0;

  phina.define("phigl.Program", {

    _static: {
      currentUsing: null,
    },

    gl: null,
    linked: false,

    _program: null,

    _vbo: null,

    _attributes: null,
    _uniforms: null,

    _shaders: null,

    init: function(gl) {
      this.gl = gl;

      this._program = gl.createProgram();
      this._program._id = id++;
      this.linked = false;

      this._attributes = {};
      this._uniforms = {};

      this._shaders = [];
    },

    attach: function(shader) {
      var gl = this.gl;

      if (typeof shader === "string") {
        shader = phina.asset.AssetManager.get("vertexShader", shader) || phina.asset.AssetManager.get("fragmentShader", shader);
      }

      if (!shader.compiled) {
        shader.compile(gl);
      }

      gl.attachShader(this._program, shader._shader);

      this._shaders.push(shader);

      return this;
    },

    link: function() {
      var gl = this.gl;

      gl.linkProgram(this._program);

      if (gl.getProgramParameter(this._program, gl.LINK_STATUS)) {

        var attrCount = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);
        for (var i = 0; i < attrCount; i++) {
          var attr = gl.getActiveAttrib(this._program, i);
          this.getAttribute(attr.name, attr.type);
        }

        var uniCount = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
        for (var i = 0; i < uniCount; i++) {
          var uni = gl.getActiveUniform(this._program, i);
          this.getUniform(uni.name, uni.type);
        }

        this.linked = true;
        return this;
      } else {
        this.linked = false;
        throw gl.getProgramInfoLog(this._program);
      }
    },

    // @add： 上書きも設定
    uploadAttribute: function(name, type, size, normalized, stride) {
      this._attributes[name] = phigl.Attribute(this.gl, this._program, name, type, size, normalized, stride);
      return this._attributes[name];
    },

    // @modify: active時に自動で_attributesに設定される
    getAttribute: function(name, type, size, normalized, stride) {
      if (!this._attributes[name]) {
        this._attributes[name] = phigl.Attribute(this.gl, this._program, name, type, size, normalized, stride);
      }
      return this._attributes[name];
    },

    getUniform: function(name, type) {
      if (!this._uniforms[name]) {
        this._uniforms[name] = phigl.Uniform(this.gl, this._program, name, type);
      }
      return this._uniforms[name];
    },

    use: function() {
      if (phigl.Program.currentUsing === this) return this;
      this.gl.useProgram(this._program);
      phigl.Program.currentUsing = this;
      return this;
    },

    delete: function() {
      var gl = this.gl;
      var program = this._program;
      this._shaders.forEach(function(shader) {
        gl.detachShader(program, shader._shader);
      });
      this._shaders.forEach(function(shader) {
        gl.deleteShader(shader._shader);
      });
      gl.deleteProgram(program);
      return this;
    },
  });

});

phina.namespace(function() {

  phina.define("phigl.Shader", {
    superClass: "phina.asset.File",

    type: null,
    gl: null,
    compiled: false,

    _shader: null,

    init: function() {
      this.superInit();
      this.compiled = false;
    },

    compile: function(gl) {
      this.gl = gl;

      this.type = this._type(gl);

      this._shader = gl.createShader(this.type);
      gl.shaderSource(this._shader, this.data);
      gl.compileShader(this._shader);

      if (gl.getShaderParameter(this._shader, gl.COMPILE_STATUS)) {
        this.compiled = true;
        return this;
      } else {
        this.compiled = false;
        throw gl.getShaderInfoLog(this._shader);
      }
    },

    _type: function(gl) {
      return 0;
    },
  });

  phina.define("phigl.VertexShader", {
    superClass: "phigl.Shader",

    init: function() {
      this.superInit();
    },

    _type: function(gl) {
      return gl.VERTEX_SHADER;
    },
  });
  phina.asset.AssetLoader.assetLoadFunctions["vertexShader"] = function(key, path) {
    var shader = phigl.VertexShader();
    return shader.load({
      path: path,
    });
  };

  phina.define("phigl.FragmentShader", {
    superClass: "phigl.Shader",

    init: function() {
      this.superInit();
    },

    _type: function(gl) {
      return gl.FRAGMENT_SHADER;
    },
  });
  phina.asset.AssetLoader.assetLoadFunctions["fragmentShader"] = function(key, path) {
    var shader = phigl.FragmentShader();
    return shader.load({
      path: path,
    });
  };

});

phina.namespace(function() {

  phina.define("phigl.Texture", {

    gl: null,

    _texture: null,

    init: function(gl, image) {
      this.gl = gl;
      this._texture = gl.createTexture();
      this.isPowerOf2 = false;
      if (image) {
        this.setImage(image);
      }
    },

    setImage: function(image) {
      var gl = this.gl;

      if (typeof image === "string") {
        image = phina.asset.AssetManager.get("image", image);
      }
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      // @add (potでないtextureをバインドした背景が白くなるを防ぐ)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image.domElement);

      // @add : サイズがpotでない場合mipmapは無効
      if (phigl.Texture.isPowOf2(image.domElement)) {
        gl.generateMipmap(gl.TEXTURE_2D);
        this.isPowerOf2 = true;
      }

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      // @add: 繰り返しを禁止、
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.bindTexture(gl.TEXTURE_2D, null);

      return this;
    },

    bind: function(unitIndex) {
      var gl = this.gl;
      gl.activeTexture(gl["TEXTURE" + (unitIndex || 0)]);
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      return this;
    },

    delete: function() {
      this.gl.deleteTexture(this._texture);
    },

    _static: {
      unbind: function(gl) {
        gl.bindTexture(gl.TEXTURE_2D, null);
        return this;
      },

      // @add
      isPowOf2: function(image) {
        if (typeof(image) == "string") {
          image = phina.asset.AssetManager.get("image", image).domElement;
        }

        var isPOT = function(n) {
          return !(n & (n-1));
        }

        return (isPOT(image.width) && isPOT(image.height));
      }
    },

  });

});

phina.namespace(function() {

  phina.define("phigl.Uniform", {

    gl: null,
    name: null,

    texture: null,

    _location: null,
    _value: null,
    _type: null,
    _uniformMethod: null,

    init: function(gl, program, name, type) {
      this.gl = gl;
      this.name = name;

      this._location = gl.getUniformLocation(program, name);
      this._type = type;

      switch (type) {
        case gl.FLOAT:
          this._uniformMethod = "uniform1f";
          break;
        case gl.FLOAT_VEC2:
          this._uniformMethod = "uniform2fv";
          break;
        case gl.FLOAT_VEC3:
          this._uniformMethod = "uniform3fv";
          break;
        case gl.FLOAT_VEC4:
          this._uniformMethod = "uniform4fv";
          break;
        case gl.FLOAT_MAT2:
          this._uniformMethod = "uniformMatrix2fv";
          break;
        case gl.FLOAT_MAT3:
          this._uniformMethod = "uniformMatrix3fv";
          break;
        case gl.FLOAT_MAT4:
          this._uniformMethod = "uniformMatrix4fv";
          break;
        case gl.SAMPLER_2D:
          this._uniformMethod = "uniform1i";
          break;
      }
    },

    setValue: function(value) {
      this._value = value;
      return this;
    },

    setTexture: function(texture) {
      this.texture = texture;
      return this;
    },

    assign: function() {
      var gl = this.gl;

      switch (this._type) {
        case gl.FLOAT:
        case gl.FLOAT_VEC2:
        case gl.FLOAT_VEC3:
        case gl.FLOAT_VEC4:
          gl[this._uniformMethod](this._location, this._value);
          break;
        case gl.FLOAT_MAT2:
        case gl.FLOAT_MAT3:
        case gl.FLOAT_MAT4:
          gl[this._uniformMethod](this._location, false, this._value);
          break;
        case gl.SAMPLER_2D:
          if (this.texture) this.texture.bind(this._value);
          gl[this._uniformMethod](this._location, this._value);
          break;
      }

      return this;
    },

    reassign: function() {
      var gl = this.gl;

      switch (this._type) {
        case gl.SAMPLER_2D:
          if (this.texture) phigl.Texture.unbind(gl);
          break;
      }

      return this;
    },

    _accessor: {
      value: {
        get: function() {
          return this._value;
        },
        set: function(v) {
          this.setValue(v);
        },
      },
    },
  });

});

phina.namespace(function() {
  var i = 0;

  phina.define("phigl.Vbo", {

    gl: null,
    usage: null,
    _vbo: null,

    array: null,

    init: function(gl, usage) {
      this.gl = gl;
      this.usage = usage || gl.STATIC_DRAW;
      this._vbo = gl.createBuffer();
      this._vbo._id = i++;
    },

    set: function(data) {
      var gl = this.gl;
      if (this.array) {
        this.array.set(data);
      } else {
        this.array = new Float32Array(data);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
      gl.bufferData(gl.ARRAY_BUFFER, this.array, this.usage);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return this;
    },

    /**
     * [{ unitSize: 3, data: [...] }, { unitSize: 2, data: [...] }]
     */
    setAsInterleavedArray: function(dataArray) {
      var count = dataArray[0].data.length / dataArray[0].unitSize;
      var interleavedArray = [];
      for (var i = 0; i < count; i++) {
        dataArray.forEach(function(d) {
          for (var j = 0; j < d.unitSize; j++) {
            interleavedArray.push(d.data[i * d.unitSize + j]);
          }
        });
      }
      return this.set(interleavedArray);
    },

    bind: function() {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
      // console.log("bindBuffer", this._vbo, this.array.length);
      return this;
    },

    delete: function() {
      this.gl.deleteBuffer(this._vbo);
    },

    _static: {
      unbind: function(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
      },
    },

  });
});

//# sourceMappingURL=phigl.js.map

/**
 * Camera
 */
phina.namespace(function() {

  phina.define("phina.gl2d.Camera", {

    position: null,
    vMatrix: null,
    pMatrix: null,
    vpMatrix: null,

    init: function() {
      var m4 = this._m4 = phina.geom.MatIV();
      this.position = new Array(3);
      this.vMatrix = m4.create();
      this.pMatrix = m4.create();
      this.vpMatrix = m4.create();
    },

    setPosition: function(x, y, z) {
      // vec3.set(this.position, x, y, z);
      this.position[0] = x;
      this.position[1] = y;
      this.position[2] = z;
      return this;
    },

    lookAt: function(x, y, z) {
      this._m4.lookAt(this.position, [x, y, z], [0, 1, 0], this.vMatrix);
      return this;
    },

    ortho: function(left, right, top, bottom, near, far) {
      this._m4.ortho(left, right, top, bottom, near, far, this.pMatrix);
      return this;
    },

    calcVpMatrix: function() {
      // mat4.multiply(this.vpMatrix, this.pMatrix, this.vMatrix);
      this._m4.multiply(this.pMatrix, this.vMatrix, this.vpMatrix)
      return this;
    },

    uniformValues: function() {
      return {
        vpMatrix: this.vpMatrix,
        cameraPosition: this.position,
      };
    }

  });
});


/**
 * 表示用Layer
 */
phina.namespace(function() {

  phina.define("phina.gl2d.GLLayer", {
    superClass: "phina.display.Layer",

    renderChildBySelf: true,
    gl: null,
    resolution: 1.0,
    domElement: null,
    renderer: null,

    init: function(param) {
      this.superInit(param);

      var canvas = document.createElement("canvas");
      var gl = this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        console.error("お使いのブラウザはWebGLに対応していません");
        return;
      }

      this.domElement = canvas;
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
/*
 * minMatrix.js
 * version 0.0.1
 * Copyright (c) doxas
 * https://wgld.org/d/library/
 */
phina.namespace(function() {

  function matIV(){
    var ARRAY = (typeof Float32Array !== 'undefined') ? Float32Array : Array;

    // create関数だけ書き換え
    this._create = function(){
      return new ARRAY(16);
    };
    this.identity = function(dest){
      dest[0]  = 1; dest[1]  = 0; dest[2]  = 0; dest[3]  = 0;
      dest[4]  = 0; dest[5]  = 1; dest[6]  = 0; dest[7]  = 0;
      dest[8]  = 0; dest[9]  = 0; dest[10] = 1; dest[11] = 0;
      dest[12] = 0; dest[13] = 0; dest[14] = 0; dest[15] = 1;
      return dest;
    };
    this.create = function(){
      return this.identity(this._create());
    };
    this.multiply = function(mat1, mat2, dest){
      var a = mat1[0],  b = mat1[1],  c = mat1[2],  d = mat1[3],
        e = mat1[4],  f = mat1[5],  g = mat1[6],  h = mat1[7],
        i = mat1[8],  j = mat1[9],  k = mat1[10], l = mat1[11],
        m = mat1[12], n = mat1[13], o = mat1[14], p = mat1[15],
        A = mat2[0],  B = mat2[1],  C = mat2[2],  D = mat2[3],
        E = mat2[4],  F = mat2[5],  G = mat2[6],  H = mat2[7],
        I = mat2[8],  J = mat2[9],  K = mat2[10], L = mat2[11],
        M = mat2[12], N = mat2[13], O = mat2[14], P = mat2[15];
      dest[0] = A * a + B * e + C * i + D * m;
      dest[1] = A * b + B * f + C * j + D * n;
      dest[2] = A * c + B * g + C * k + D * o;
      dest[3] = A * d + B * h + C * l + D * p;
      dest[4] = E * a + F * e + G * i + H * m;
      dest[5] = E * b + F * f + G * j + H * n;
      dest[6] = E * c + F * g + G * k + H * o;
      dest[7] = E * d + F * h + G * l + H * p;
      dest[8] = I * a + J * e + K * i + L * m;
      dest[9] = I * b + J * f + K * j + L * n;
      dest[10] = I * c + J * g + K * k + L * o;
      dest[11] = I * d + J * h + K * l + L * p;
      dest[12] = M * a + N * e + O * i + P * m;
      dest[13] = M * b + N * f + O * j + P * n;
      dest[14] = M * c + N * g + O * k + P * o;
      dest[15] = M * d + N * h + O * l + P * p;
      return dest;
    };
    this.scale = function(mat, vec, dest){
      dest[0]  = mat[0]  * vec[0];
      dest[1]  = mat[1]  * vec[0];
      dest[2]  = mat[2]  * vec[0];
      dest[3]  = mat[3]  * vec[0];
      dest[4]  = mat[4]  * vec[1];
      dest[5]  = mat[5]  * vec[1];
      dest[6]  = mat[6]  * vec[1];
      dest[7]  = mat[7]  * vec[1];
      dest[8]  = mat[8]  * vec[2];
      dest[9]  = mat[9]  * vec[2];
      dest[10] = mat[10] * vec[2];
      dest[11] = mat[11] * vec[2];
      dest[12] = mat[12];
      dest[13] = mat[13];
      dest[14] = mat[14];
      dest[15] = mat[15];
      return dest;
    };
    this.translate = function(mat, vec, dest){
      dest[0] = mat[0]; dest[1] = mat[1]; dest[2]  = mat[2];  dest[3]  = mat[3];
      dest[4] = mat[4]; dest[5] = mat[5]; dest[6]  = mat[6];  dest[7]  = mat[7];
      dest[8] = mat[8]; dest[9] = mat[9]; dest[10] = mat[10]; dest[11] = mat[11];
      dest[12] = mat[0] * vec[0] + mat[4] * vec[1] + mat[8]  * vec[2] + mat[12];
      dest[13] = mat[1] * vec[0] + mat[5] * vec[1] + mat[9]  * vec[2] + mat[13];
      dest[14] = mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14];
      dest[15] = mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15];
      return dest;
    };
    this.rotate = function(mat, angle, axis, dest){
      var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
      if(!sq){return null;}
      var a = axis[0], b = axis[1], c = axis[2];
      if(sq != 1){sq = 1 / sq; a *= sq; b *= sq; c *= sq;}
      var d = Math.sin(angle), e = Math.cos(angle), f = 1 - e,
        g = mat[0],  h = mat[1], i = mat[2],  j = mat[3],
        k = mat[4],  l = mat[5], m = mat[6],  n = mat[7],
        o = mat[8],  p = mat[9], q = mat[10], r = mat[11],
        s = a * a * f + e,
        t = b * a * f + c * d,
        u = c * a * f - b * d,
        v = a * b * f - c * d,
        w = b * b * f + e,
        x = c * b * f + a * d,
        y = a * c * f + b * d,
        z = b * c * f - a * d,
        A = c * c * f + e;
      if(angle){
        if(mat != dest){
          dest[12] = mat[12]; dest[13] = mat[13];
          dest[14] = mat[14]; dest[15] = mat[15];
        }
      } else {
        dest = mat;
      }
      dest[0] = g * s + k * t + o * u;
      dest[1] = h * s + l * t + p * u;
      dest[2] = i * s + m * t + q * u;
      dest[3] = j * s + n * t + r * u;
      dest[4] = g * v + k * w + o * x;
      dest[5] = h * v + l * w + p * x;
      dest[6] = i * v + m * w + q * x;
      dest[7] = j * v + n * w + r * x;
      dest[8] = g * y + k * z + o * A;
      dest[9] = h * y + l * z + p * A;
      dest[10] = i * y + m * z + q * A;
      dest[11] = j * y + n * z + r * A;
      return dest;
    };
    this.lookAt = function(eye, center, up, dest){
      var eyeX    = eye[0],    eyeY    = eye[1],    eyeZ    = eye[2],
        upX     = up[0],     upY     = up[1],     upZ     = up[2],
        centerX = center[0], centerY = center[1], centerZ = center[2];
      if(eyeX == centerX && eyeY == centerY && eyeZ == centerZ){return this.identity(dest);}
      var x0, x1, x2, y0, y1, y2, z0, z1, z2, l;
      z0 = eyeX - center[0]; z1 = eyeY - center[1]; z2 = eyeZ - center[2];
      l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
      z0 *= l; z1 *= l; z2 *= l;
      x0 = upY * z2 - upZ * z1;
      x1 = upZ * z0 - upX * z2;
      x2 = upX * z1 - upY * z0;
      l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
      if(!l){
        x0 = 0; x1 = 0; x2 = 0;
      } else {
        l = 1 / l;
        x0 *= l; x1 *= l; x2 *= l;
      }
      y0 = z1 * x2 - z2 * x1; y1 = z2 * x0 - z0 * x2; y2 = z0 * x1 - z1 * x0;
      l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
      if(!l){
        y0 = 0; y1 = 0; y2 = 0;
      } else {
        l = 1 / l;
        y0 *= l; y1 *= l; y2 *= l;
      }
      dest[0] = x0; dest[1] = y0; dest[2]  = z0; dest[3]  = 0;
      dest[4] = x1; dest[5] = y1; dest[6]  = z1; dest[7]  = 0;
      dest[8] = x2; dest[9] = y2; dest[10] = z2; dest[11] = 0;
      dest[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
      dest[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
      dest[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
      dest[15] = 1;
      return dest;
    };

    // From minMatrixb.js
    this.ortho = function(left, right, top, bottom, near, far, dest) {
      var h = (right - left);
      var v = (top - bottom);
      var d = (far - near);
      dest[0]  = 2 / h;
      dest[1]  = 0;
      dest[2]  = 0;
      dest[3]  = 0;
      dest[4]  = 0;
      dest[5]  = 2 / v;
      dest[6]  = 0;
      dest[7]  = 0;
      dest[8]  = 0;
      dest[9]  = 0;
      dest[10] = -2 / d;
      dest[11] = 0;
      dest[12] = -(left + right) / h;
      dest[13] = -(top + bottom) / v;
      dest[14] = -(far + near) / d;
      dest[15] = 1;
      return dest;
    };
  }

  phina.geom.MatIV = function() { return new matIV; };

});


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
