// interface WebGLBufferObject {
//   name:string
// }

/**
 * @class BufferObject
 * Abstract Buffer class
 */
const BufferObject = class {

  protected gl:WebGLRenderingContext;
  protected _glBuffer:WebGLBuffer;
  protected _drawType:GLenum;
  protected _dataArray:number[] = [];

  constructor(gl, drawType:string) {
    this.gl = gl;
    this._glBuffer = gl.createBuffer();
    this._drawType = gl[drawType] || gl.STATIC_DRAW;
  }

  get dataArray() {
    return this._dataArray;
  }
  get length() {
    return this._dataArray.length;
  }
  get drawType() {
    return this._drawType;
  }

}


/**
 * VBO
 */
export const Vbo = class extends BufferObject {

  public glVbo: WebGLBuffer

  get data() { return this._dataArray; }

  constructor(gl, drawType?) {
    super(gl, drawType);
    this.glVbo = this._glBuffer;
  }

  /**
   * バッファにデータを送る
   * @param  {[number]} data
   * @return {this}
   */
  setData(data:number[], reset:boolean) {
    const gl = this.gl;
    this._dataArray = data;

    // if (this._dataArray) {
    //   this.updateData(data);
    // } else {}
    this.bind();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), this._drawType);
    this.unbind();

    return this;
  }

  /**
   * バッファデータの更新
   */
  // updateData(data:number[]) {
  //   const gl = this.gl;
  //   this._dataArray = data;

  //   this.bind();
  //   gl.bufferSubData(gl.ARRAY_BUFFER, new Float32Array(data), this._drawType);
  //   this.unbind();

  //   return this;
  // }

  bind() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._glBuffer);

    return this;
  }

  unbind() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return this;
  }

};

/**
 * IBO class
 */
export const Ibo = class extends BufferObject {

  public glIbo: WebGLBuffer

  constructor(gl, drawType?) {
    super(gl, drawType);
    this.glIbo = this._glBuffer;
  }

  setData(data:number[]) {
    const gl = this.gl;
    this._dataArray = data;

    this.bind();
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this._drawType);
    this.unbind();

    return this;
  }

  bind() {
    const gl = this.gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glBuffer);

    return this;
  }

  unbind() {
    const gl = this.gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return this;
  }

};
