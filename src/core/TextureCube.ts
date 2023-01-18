import Texture from "./Texture";
import {
  CLAMP_TO_EDGE,
  LINEAR,
  RGBA,
  TEXTURE_CUBE_MAP,
  TEXTURE_CUBE_MAP_NEGATIVE_X,
  TEXTURE_CUBE_MAP_NEGATIVE_Y,
  TEXTURE_CUBE_MAP_NEGATIVE_Z,
  TEXTURE_CUBE_MAP_POSITIVE_X,
  TEXTURE_CUBE_MAP_POSITIVE_Y,
  TEXTURE_CUBE_MAP_POSITIVE_Z,
  UNSIGNED_BYTE,
} from "./Constants";

interface FileParams {
  [key: string]: string;
}

interface MapParams {
  [key: string]: number;
}

/**
 * Cube textures, extends from core Texture class
 */
export default class TextureCube extends Texture {
  private _files: FileParams;

  constructor({
    imagePath = "",
    files = {
      px: "",
      nx: "",
      py: "",
      ny: "",
      pz: "",
      nz: "",
    },
    wrapS = CLAMP_TO_EDGE,
    wrapT = CLAMP_TO_EDGE,
    width = 256,
    height = 256,
    depthAttachment = false,
    format = RGBA,
    minFilter = LINEAR,
    magFilter = LINEAR,
    internalFormat = RGBA,
    generateMipmaps = true,
    type = UNSIGNED_BYTE,
    flipY = false,
  } = {}) {
    super({
      wrapS,
      wrapT,
      width,
      height,
      depthAttachment,
      format,
      minFilter,
      magFilter,
      internalFormat,
      generateMipmaps,
      type,
      flipY,
      target: TEXTURE_CUBE_MAP,
      imagePath,
    });

    this._files = files;
  }

  _init() {
    this._texture = <WebGLTexture>this._gl.createTexture();

    this.bind();

    // generate textures for each face of cube map
    for (let i = 0; i < 6; i++) {
      this.gl.texImage2D(
        this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
        0,
        this._internalFormat,
        this._width,
        this._height,
        0,
        this._format,
        this._pixelType,
        null
      );
    }

    this.unbind();

    this._applySettings();
  }

  load() {
    this.bind();

    const loadImage = (source: string, type: number) => {
      return new Promise((resolve, reject) => {
        const image = new Image();

        image.addEventListener("load", () => {
          this.gl.texImage2D(
            type,
            0,
            this._format,
            this._format,
            this._pixelType,
            image
          );

          this._width = image.width;
          this._height = image.height;

          resolve(image);
        });

        image.addEventListener("error", (ev) => {
          reject(ev);
        });

        image.src = source;
      });
    };

    const map: MapParams = {
      px: TEXTURE_CUBE_MAP_POSITIVE_X,
      nx: TEXTURE_CUBE_MAP_NEGATIVE_X,
      py: TEXTURE_CUBE_MAP_POSITIVE_Y,
      ny: TEXTURE_CUBE_MAP_NEGATIVE_Y,
      pz: TEXTURE_CUBE_MAP_POSITIVE_Z,
      nz: TEXTURE_CUBE_MAP_NEGATIVE_Z,
    };

    const toLoad = Object.keys(this._files).map((key: string) => {
      const type = map[key];
      const file = this.imagePath + this._files[key as keyof FileParams];
      return loadImage(file, type);
    });

    return Promise.all(toLoad)
      .then(() => {
        if (this.generateMipmaps) {
          this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
        }

        this.unbind();
      })
      .catch((reason) => {
        console.log(reason);
        this.unbind();
      });
  }

  resize(width: number, height: number) {
    this.bind();

    this._gl.texImage2D(
      TEXTURE_CUBE_MAP,
      0,
      this._internalFormat,
      width,
      height,
      0,
      this._format,
      this._type,
      null
    );

    this.unbind();
  }

  setFromData(
    data: Float32Array | Uint16Array | Uint8Array,
    width: number,
    height: number
  ) {
    // TODO: allow setting data for each face of cube map

    this.bind();

    for (let i = 0; i < 6; i++) {
      this.gl.texImage2D(
        this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
        0,
        this._internalFormat,
        width,
        height,
        0,
        this._format,
        this._type,
        data
      );
    }

    this.unbind();
  }

  public get files(): FileParams {
    return this._files;
  }
}
