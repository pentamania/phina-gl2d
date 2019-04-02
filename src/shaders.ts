
/**
 * Abstract Shader
 * @type {[type]}
 */
export class Shader {

  private gl:WebGLRenderingContext;
  protected _shader:WebGLShader|null;
  protected _srcString:string;

  get webglShader() {return this._shader;}

  constructor(gl:WebGLRenderingContext) {
    this.gl = gl;
    this._shader = null;
  }

  compile():this {
    const gl = this.gl;
    const shader = this._shader;

    // compile check
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      // success
    } else {
      // failure: return error log
      console.log(gl.getShaderInfoLog(shader));
    }
    return this;
  }

};

/**
 * VertexShader
 */
// export const VertexShader = class extends Shader {
export class VertexShader extends Shader {

  constructor(gl, shaderSource:string) {
    super(gl);
    this._shader = gl.createShader(gl.VERTEX_SHADER)
    this._srcString = shaderSource;
    gl.shaderSource(this._shader, shaderSource);
  }

};

/**
 * FragmentShader
 */
export class FragmentShader extends Shader {

  constructor(gl, shaderSource:string) {
    super(gl);
    this._shader = gl.createShader(gl.FRAGMENT_SHADER);
    this._srcString = shaderSource;
    gl.shaderSource(this._shader, shaderSource);
  }

};
