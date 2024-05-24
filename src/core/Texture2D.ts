import Texture from "./Texture";
import {
  CLAMP_TO_EDGE,
  LINEAR,
  RGBA,
  TEXTURE_2D,
  UNSIGNED_BYTE,
} from "./Constants";
import { TypedArray } from "./Types";

export default class Texture2D extends Texture {
  private _image: HTMLImageElement | undefined;
  private _data: TypedArray | undefined;

  constructor({
    imagePath = "",
    wrapS = CLAMP_TO_EDGE,
    wrapT = CLAMP_TO_EDGE,
    width = 1,
    height = 1,
    depthAttachment = false,
    minFilter = LINEAR,
    magFilter = LINEAR,
    format = RGBA,
    internalFormat = RGBA,
    type = UNSIGNED_BYTE,
    generateMipmaps = true,
    flipY = true,
    target = TEXTURE_2D,
    anistropy = 0,
  } = {}) {
    super({
      imagePath,
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

    this.init();
  }

  init() {
    this._texture = <WebGLTexture>this._gl.createTexture();
    this.bind();

    this._gl.texImage2D(
      TEXTURE_2D,
      0,
      this._internalFormat,
      this.width,
      this.height,
      0,
      this._format,
      this._type,
      null
    );

    this.applySettings();
  }

  resize(width: number, height: number) {
    this._width = width;
    this._height = height;

    this.bind();

    if (this._data) {
      this._gl.texSubImage2D(
        TEXTURE_2D,
        0,
        0,
        0,
        this.width,
        this.height,
        this._format,
        this._type,
        this._data
      );
    }

    if (this._image) {
      this._gl.texImage2D(
        TEXTURE_2D,
        0,
        this._format,
        this._format,
        this._pixelType,
        this._image
      );
    }

    if (!this._data && !this._image) {
      this._gl.texImage2D(
        TEXTURE_2D,
        0,
        this._internalFormat,
        this.width,
        this.height,
        0,
        this._format,
        this._type,
        null
      );
    }
  }

  setFromData(data: TypedArray, width: number, height: number) {
    this._width = width;
    this._height = height;
    this._data = data;

    this.bind();

    this._gl.texSubImage2D(
      TEXTURE_2D,
      0,
      0,
      0,
      this.width,
      this.height,
      this._format,
      this._type,
      data
    );

    this.applySettings();
  }

  load() {
    return new Promise(async (resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "";
      image.src = this._imagePath;

      image.onload = async () => {
        this._width = image.width;
        this._height = image.height;

        this.bind();

        this._gl.texImage2D(
          TEXTURE_2D,
          0,
          this._format,
          this._format,
          this._pixelType,
          image
        );

        this.applySettings();

        resolve(image);

        this._image = image;

        this.unbind();

        image.addEventListener("error", (ev) => {
          reject(ev);
        });
      };
    });
  }

  public get image(): HTMLImageElement | undefined {
    return this._image;
  }
}
