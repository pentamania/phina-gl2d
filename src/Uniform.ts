import gl2dProgram from './Program';

/**
 * Uniform
 */
export default class {

  protected gl:WebGLRenderingContext;
  // protected _location:GLint;
  protected _location:WebGLUniformLocation;
  protected _value:number;
  protected _type:string;
  protected _uniformMethod:string;
  // protected texture:WebGLBuffer;
  protected texture:any; // type gl2dTexture
  public name:string;

  get value() {return this._value}
  set value(v) {this._value = v}

  constructor(
    gl:WebGLRenderingContext,
    program:gl2dProgram,
    name:string,
    type:string
  ) {
    this.gl = gl;
    this.name = name;
    this._location = gl.getUniformLocation(program.glProgram, name);
    this._value = null; // SAMPLER_2Dの場合、テクスチャユニットを表す
    this._type = gl[type];
    this.texture = null;

    switch (type) {
      case 'FLOAT':
        this._uniformMethod = "uniform1f";
        break;
      case 'FLOAT_VEC2':
        this._uniformMethod = "uniform2fv";
        break;
      case 'FLOAT_VEC3':
        this._uniformMethod = "uniform3fv";
        break;
      case 'FLOAT_VEC4':
        this._uniformMethod = "uniform4fv";
        break;
      case 'FLOAT_MAT2':
        this._uniformMethod = "uniformMatrix2fv";
        break;
      case 'FLOAT_MAT3':
        this._uniformMethod = "uniformMatrix3fv";
        break;
      case 'FLOAT_MAT4':
        this._uniformMethod = "uniformMatrix4fv";
        break;
      case 'SAMPLER_2D':
        this._uniformMethod = "uniform1i";
        break;
    }
  }

  setTexture(gl2dTexture, unitId?) {
    this.texture = gl2dTexture;
    if (unitId !== undefined) this._value = unitId;
  }

  assign(value) {
    var gl = this.gl;
    if (value != null) this._value = value;

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
        if (this.texture) {
          gl.activeTexture(gl["TEXTURE"+this._value]);
          this.texture.bind();
        }
        gl[this._uniformMethod](this._location, this._value);
        // バインド解除すると描画されない
        // if (glupTexture) glupTexture.unbind();
        break;
    }
  }

};