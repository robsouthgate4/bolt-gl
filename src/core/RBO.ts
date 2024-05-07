import {
  DEPTH_STENCIL,
  DEPTH_STENCIL_ATTACHMENT,
  FRAMEBUFFER,
  RENDERBUFFER,
} from "./Constants";
import Bolt from "./Bolt";

export default class RBO {
  private _width = 256;
  private _height = 256;

  private _gl: WebGL2RenderingContext;
  private _renderBuffer: WebGLRenderbuffer;

  constructor({ width = 256, height = 256 } = {}) {
    this._gl = Bolt.getInstance().getContext();

    this._width = width;
    this._height = height;

    this._renderBuffer = <WebGLRenderbuffer>this._gl.createRenderbuffer();
    this.bind();
    this._gl.renderbufferStorage(
      RENDERBUFFER,
      DEPTH_STENCIL,
      this._width,
      this._height
    );
    this._gl.framebufferRenderbuffer(
      FRAMEBUFFER,
      DEPTH_STENCIL_ATTACHMENT,
      RENDERBUFFER,
      this._renderBuffer
    );
  }

  resize(width: number, height: number) {
    this._width = width;
    this._height = height;

    this._gl.bindRenderbuffer(RENDERBUFFER, this._renderBuffer);
    this._gl.renderbufferStorage(
      RENDERBUFFER,
      DEPTH_STENCIL,
      this._width,
      this._height
    );
    this._gl.bindRenderbuffer(RENDERBUFFER, null);
  }

  bind() {
    this._gl.bindRenderbuffer(RENDERBUFFER, this._renderBuffer);
  }

  unbind() {
    this._gl.bindRenderbuffer(RENDERBUFFER, null);
  }

  public get width() {
    return this._width;
  }

  public set width(value) {
    this._width = value;
  }

  public get height() {
    return this._height;
  }

  public set height(value) {
    this._height = value;
  }
}
