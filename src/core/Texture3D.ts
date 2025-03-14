import {
  CLAMP_TO_EDGE,
  LINEAR,
  RGBA,
  TEXTURE_3D,
  UNSIGNED_BYTE,
} from "./Constants";
import Texture from "./Texture";

export default class Texture3D extends Texture {
  private _depth: number;
  private _data: ArrayBufferView | null = null;
  private _image: HTMLImageElement | null = null;

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
    target = TEXTURE_3D,
    depth = 1,
    anistropy = 0,
  }) {
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

    this._depth = depth;
    this.init();
  }

  init(): void {
    this._texture = this._gl.createTexture();
    this.bind();
    this._gl.texImage3D(
      TEXTURE_3D,
      0,
      this._internalFormat,
      this.width,
      this.height,
      this.depth,
      0,
      this._format,
      this._type,
      null
    );
    this.applySettings();
  }

  public resize(width: number, height: number, depth: number): void {
    this._width = width;
    this._height = height;
    this._depth = depth;
    this.bind();

    if (this._data) {
      this._gl.texSubImage3D(
        TEXTURE_3D,
        0,
        0,
        0,
        0,
        this.width,
        this.height,
        this.depth,
        this._format,
        this._type,
        this._data
      );
    }
    if (this._image) {
      this._gl.texImage3D(
        TEXTURE_3D,
        0,
        this._internalFormat,
        this.width,
        this.height,
        this.depth,
        0,
        this._format,
        this._pixelType,
        this._image
      );
    }
    if (!this._data && !this._image) {
      this._gl.texImage3D(
        TEXTURE_3D,
        0,
        this._internalFormat,
        this.width,
        this.height,
        this.depth,
        0,
        this._format,
        this._type,
        null
      );
    }
  }

  public setFromData(
    data: ArrayBufferView,
    width: number,
    height: number
  ): void {
    this._width = width;
    this._height = height;
    this._data = data;
    this.bind();
    this._gl.texImage3D(
      TEXTURE_3D,
      0,
      this._internalFormat,
      this.width,
      this.height,
      this.depth,
      0,
      this._format,
      this._pixelType,
      data
    );
    this.applySettings();
  }

  public async load(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "";
      image.src = this._imagePath;

      image.onload = async () => {
        this._width = image.width;
        this._height = image.height;
        this.bind();
        this._gl.texImage3D(
          TEXTURE_3D,
          0,
          this._internalFormat,
          this.width,
          this.height,
          this.depth,
          0,
          this._format,
          this._pixelType,
          image
        );
        this.applySettings();
        this._image = image;
        this.unbind();
        resolve(image);
      };

      image.addEventListener("error", (ev) => {
        reject(ev);
      });
    });
  }

  public get image(): HTMLImageElement | null {
    return this._image;
  }

  public get depth(): number {
    return this._depth;
  }
}
