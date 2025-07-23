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
  TEXTURE_MAG_FILTER,
  TEXTURE_MIN_FILTER,
  TEXTURE_WRAP_S,
  TEXTURE_WRAP_T,
  UNSIGNED_BYTE,
} from "./Constants";

interface FileParams {
  [key: string]: string;
}

interface MapParams {
  [key: string]: number;
}

const map: MapParams = {
  px: TEXTURE_CUBE_MAP_POSITIVE_X,
  nx: TEXTURE_CUBE_MAP_NEGATIVE_X,
  py: TEXTURE_CUBE_MAP_POSITIVE_Y,
  ny: TEXTURE_CUBE_MAP_NEGATIVE_Y,
  pz: TEXTURE_CUBE_MAP_POSITIVE_Z,
  nz: TEXTURE_CUBE_MAP_NEGATIVE_Z,
};

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

    this._flipY = false;

    this.init();

    this._files = files;
  }

  init() {
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
  }

  load() {
    const promises = [];

    const loadImage = (source: string, type: number, key: string) => {
      return new Promise((resolve, reject) => {
        const image = new Image();

        image.addEventListener("load", () => {
          resolve({
            image,
            type,
            key,
          });
        });

        image.addEventListener("error", (ev) => {
          reject(ev);
        });

        image.src = source;
      });
    };

    for (const key in this._files) {
      const file = this.imagePath + this._files[key as keyof FileParams];
      const promise = loadImage(file, map[key], key);
      promises.push(promise);
    }

    return Promise.all(promises).then((results) => {
      results.forEach((result: any) => {
        this.bind();
        this.applySettings(false);
        this.gl.texImage2D(
          result.type,
          0,
          this._format,
          this._format,
          this._pixelType,
          result.image
        );
        this._width = result.image.width;
        this._height = result.image.height;
      });

      if (this._generateMipmaps) {
        this._gl.generateMipmap(this._target);
      }
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

    for (let i = 0; i < 6; i++) {
      this.bind();
      this.applySettings(false);
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
      if (this._generateMipmaps) {
        this._gl.generateMipmap(this._target);
      }
      this.unbind();
    }
  }

  public get files(): FileParams {
    return this._files;
  }
}
