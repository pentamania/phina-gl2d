import {Shader as gl2dShader} from './shaders'

export default class {

  protected gl:WebGLRenderingContext;
  protected _program: WebGLProgram;

  get glProgram() { return this._program; }

  constructor(
    gl:WebGLRenderingContext,
    vs:gl2dShader,
    fs:gl2dShader
  ) {
    this.gl = gl;
    this._program = gl.createProgram();

    // プログラムオブジェクトにシェーダを割り当てる
    if (vs != null) this.attach(vs);
    if (fs != null) this.attach(fs);
  }

  attach(shader:gl2dShader):this {
    this.gl.attachShader(this._program, shader.webglShader);
    return this;
  }

  // useにする？
  link():this {
    var gl = this.gl;
    var prg = this._program;

    gl.linkProgram(prg);

    // check link
    if (gl.getProgramParameter(prg, gl.LINK_STATUS)) {
      // success
      gl.useProgram(prg);
    } else {
      // fail
      console.error(gl.getProgramInfoLog(prg));
    }

    return this;
  }

};
