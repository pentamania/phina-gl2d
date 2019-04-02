/**
 * @class Texture
 *
 */
export default class {

  protected gl:WebGLRenderingContext;
  private _glTexture: WebGLTexture;
  private _image: HTMLImageElement|HTMLCanvasElement;

  constructor(gl, phinaTexture) {
    this.gl = gl;
    this._glTexture = gl.createTexture();
    this._image = null;

    if (phinaTexture != null) {
      // this._image =
      this.create(phinaTexture.domElement);
    } else {
      // this.createPlaceholder();
      // this.allocEmpty(1, 1);
    }
  }

  create(image:HTMLImageElement | HTMLCanvasElement) {
    const gl = this.gl;

    this.bind();

    // 2の自乗でないtexture(NPOT texture)をバインドしたとき背景が白くなるを防ぐ
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // ミップマップ生成：サイズが2の乗数でないと無効
    // gl.generateMipmap(gl.TEXTURE_2D);

    // 縮小時の振る舞い
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // S 座標のラッピング (繰り返し) を禁止 NPOT textureでは必須
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

    // T 座標のラッピング (繰り返し) を禁止 NPOT textureでは必須
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.unbind();

    this._image = image;
    return this;
  }

  allocEmpty(width, height) {
    const gl = this.gl;
    this.bind();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    this.unbind();
  }

  /**
   * @memberOf glup.Texture
   * 1ピクセルイメージをtextureに割り当てる
   */
  createPlaceholder() {
    const gl = this.gl;

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixelImage = new Uint8Array([0, 0, 255, 255]);  // opaque blue

    this.bind();
    gl.texImage2D(
      gl.TEXTURE_2D, level, internalFormat,
      width, height, border, srcFormat, srcType,
    pixelImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    this.unbind();

    // var pixelImage = new Uint8Array([255.0, 255.0, 255.0, 255.0]);
    // this.bind();
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixelImage);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // this.unbind();
  }

  bind() {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this._glTexture);
    return this;
  }

  unbind() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    return this;
  }
}