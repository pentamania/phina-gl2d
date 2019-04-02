import gl2dProgram from './Program';
// //todo
// const TYPE_BYTE_TABLE = {
//   'FLOAT': 4,
//   'BYTE': 1,
//   'UNSIGNED_SHORT': 2,
// }
const FLOAT_BYTE_SIZE = 4;

/**
 * @class Attribute
 *
 * @param {WebGLRenderingContext} gl      [description]
 * @param {GLProgram} program [description]
 * @param {String} name    シェーダ上の名前
 * @param {Number} stride  要素数
 * @param  {number} offset メモリのズレ
 */
export default class {

  protected gl:WebGLRenderingContext;
  protected _location:GLint;
  protected _valueType:GLenum;
  protected _size:number; // 要素数：1,2,3,4のいずれか
  protected _rowCount:number = 1; // 行列数： FLOAT_MAT2なら2
  protected _stride:number = 0; // 0 ~ 255
  protected _offset:number;
  protected _vbo:WebGLBuffer = null;
  protected _type:string = 'FLOAT';
  protected _normalized:boolean = false;

  get size() { return this._size; }
  get byteSize() {
    // FLOATのみという前提
    return this._size * FLOAT_BYTE_SIZE * this._rowCount;
  }

  constructor(
    gl:WebGLRenderingContext,
    program:gl2dProgram,
    name:string,
    type:string='FLOAT',
    offset:number=0
  ) {
    this.gl = gl;
    this._location = gl.getAttribLocation(program.glProgram, name); // GPUメモリ上の位置
    this._offset = offset;

    // TODO: typeに応じてsize/rowcount変更
    switch(type) {
      case 'FLOAT':
        this._size = 1;
        this._rowCount = 1;
        break;
      case 'FLOAT_VEC2':
        this._size = 2;
        this._rowCount = 1;
        break;
      case 'FLOAT_MAT2':
        this._size = 2;
        this._rowCount = 2;
        break;
      case 'FLOAT_VEC3':
        this._size = 3;
        this._rowCount = 1;
        break;
      case 'FLOAT_MAT3':
        this._size = 3;
        this._rowCount = 3;
        break;
      case 'FLOAT_VEC4':
        this._size = 4;
        this._rowCount = 1;
        break;
      case 'FLOAT_MAT4':
        this._size = 4;
        this._rowCount = 4;
        break;
    }

    this._valueType = gl.FLOAT; // FLOATしか無いのでほぼ定数
    gl.enableVertexAttribArray(this._location);
    // console.log(name, this._size, this._rowCount, offset);
    // console.log(name, 'location', this._location);
  }

  assignVbo(vbo: WebGLBuffer) {
    this._vbo = vbo;
    return this;
  }

  setStride(stride: number):this {
    this._stride = stride;
    return this;
  }

  /**
   * vboにバインドしてデータを送る
   * 変更がない限り、何度も行う必要はない？
   * @return {this}
   */
  specify():this {
    var gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
    gl.vertexAttribPointer(this._location, this._size, this._valueType, this._normalized, this._stride, this._offset);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); // unbind
    return this;
  }

};
