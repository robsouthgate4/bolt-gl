import Texture from "./Texture";
import {
  CLAMP_TO_EDGE,
  LINEAR,
  RGBA,
  TEXTURE_2D_ARRAY,
  UNSIGNED_BYTE,
} from "./Constants";
import { TypedArray } from "./Types";

export default class Texture2DArray extends Texture {
  private _depth: number;
  private _data: TypedArray | undefined;

  constructor({
    wrapS = CLAMP_TO_EDGE,
    wrapT = CLAMP_TO_EDGE,
    width = 1,
    height = 1,
    depth = 1,
    depthAttachment = false,
    minFilter = LINEAR,
    magFilter = LINEAR,
    format = RGBA,
    internalFormat = RGBA,
    type = UNSIGNED_BYTE,
    generateMipmaps = true,
    flipY = true,
    target = TEXTURE_2D_ARRAY,
    anistropy = 0,
  } = {}) {
    super({
      wrapS,
      wrapT,
      width,
      height,
      depthAttachment,
      minFilter,
      magFilter,
      format,
      internalFormat,
      type,
      generateMipmaps,
      flipY,
      target,
      anistropy,
    });

    this._depth = depth;
    this.init();
  }

  init() {
    this._texture = <WebGLTexture>this._gl.createTexture();
    this.bind();

    this._gl.texImage3D(
      TEXTURE_2D_ARRAY,
      0,
      this._internalFormat,
      this.width,
      this.height,
      this._depth,
      0,
      this._format,
      this._type,
      null
    );

    this.applySettings();

    if (this._generateMipmaps) {
      this._gl.generateMipmap(this._target);
    }
  }

  resize(width: number, height: number, depth?: number) {
    this._width = width;
    this._height = height;
    if (depth !== undefined) {
      this._depth = depth;
    }

    this.bind();

    if (this._data) {
      this._gl.texSubImage3D(
        TEXTURE_2D_ARRAY,
        0,
        0,
        0,
        0,
        this.width,
        this.height,
        this._depth,
        this._format,
        this._type,
        this._data
      );
    } else {
      this._gl.texImage3D(
        TEXTURE_2D_ARRAY,
        0,
        this._internalFormat,
        this.width,
        this.height,
        this._depth,
        0,
        this._format,
        this._type,
        null
      );
    }
  }

  setFromData(data: TypedArray, width: number, height: number, depth?: number) {
    this._width = width;
    this._height = height;
    if (depth !== undefined) {
      this._depth = depth;
    }
    this._data = data;

    this.bind();

    this._gl.texImage3D(
      TEXTURE_2D_ARRAY,
      0,
      this._internalFormat,
      this.width,
      this.height,
      this._depth,
      0,
      this._format,
      this._type,
      data
    );

    if (this._generateMipmaps) {
      this._gl.generateMipmap(this._target);
    }
  }

  public forceGenerateMipmaps() {
    this.bind();
    this._generateMipmaps = true;
    this._gl.generateMipmap(this._target);
    this.unbind();
  }

  public get depth(): number {
    return this._depth;
  }

  public set depth(value: number) {
    this._depth = value;
  }

  public get data(): TypedArray | undefined {
    return this._data;
  }
}
