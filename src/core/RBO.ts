import {
  DEPTH_ATTACHMENT,
  DEPTH_COMPONENT24,
  FRAMEBUFFER,
  RENDERBUFFER,
} from "./Constants";
import Bolt from "./Bolt";

export default class RBO {
  private _width = 256;
  private _height = 256;
  private _attachment = DEPTH_ATTACHMENT;
  private _internalFormat = DEPTH_COMPONENT24;
  private _gl: WebGL2RenderingContext;
  private _renderBuffer: WebGLRenderbuffer;

  constructor({
    width = 256,
    height = 256,
    internalFormat = DEPTH_COMPONENT24,
    attachment = DEPTH_ATTACHMENT,
  } = {}) {
    this._gl = Bolt.getInstance().getContext();

    this._width = width;
    this._height = height;

    this._internalFormat = internalFormat;
    this._attachment = attachment;

    this._renderBuffer = <WebGLRenderbuffer>this._gl.createRenderbuffer();

    this.bind();

    this._gl.renderbufferStorage(
      RENDERBUFFER,
      this._internalFormat,
      this._width,
      this._height
    );

    this._gl.framebufferRenderbuffer(
      FRAMEBUFFER,
      this._attachment,
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
      this._internalFormat,
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
