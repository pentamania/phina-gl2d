
/**
 * @class GLCore
 *
 */
export default class {

  private _view: HTMLCanvasElement;
  private _context: WebGLRenderingContext;

  get context() { return this._context; }
  get view() { return this._view; }

  constructor(
    canvas: HTMLCanvasElement=document.createElement("canvas")
  ) {
    this._view = canvas;
    this._context = this._view.getContext("webgl") || this._view.getContext("experimental-webgl");
    if (!this._context) {
      console.error("[phina-gl2d]: お使いのブラウザはWebGLに対応していません");
      return;
    }
  }

  // static getContext() {
  //   if (!this._view) this._view = document.createElement("canvas");
  //   if (!this._context) this._context = this._view.getContext("webgl") || this._view.getContext("experimental-webgl");
  //   return this._context;
  // },

};
