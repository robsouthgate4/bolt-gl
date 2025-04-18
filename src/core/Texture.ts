import { TypedArray } from "./Types";
import {
  CLAMP_TO_EDGE,
  LINEAR,
  RGBA,
  TEXTURE0,
  TEXTURE_2D,
  TEXTURE_MAG_FILTER,
  TEXTURE_MIN_FILTER,
  TEXTURE_WRAP_S,
  TEXTURE_WRAP_T,
  UNSIGNED_BYTE,
} from "./Constants";
import Bolt from "./Bolt";

let ID = 0;

export default abstract class Texture {
  protected _texture!: WebGLTexture;
  protected _gl: WebGL2RenderingContext;
  protected _depthAttachment?: boolean;
  protected _internalFormat: number;
  protected _width!: number;
  protected _height!: number;
  protected _format: number;
  protected _type: number;
  protected _flipY: boolean;
  protected _target: number;
  protected _wrapT!: number;
  protected _wrapS!: number;
  protected _generateMipmaps: boolean;
  protected _minFilter: number;
  protected _magFilter: number;
  protected _anistropy = 0;
  protected _imagePath: string;
  protected _pixelType: number;
  protected _name: string;
  protected _currentUnit = -1;

  private _id: number;
  private _bolt = Bolt.getInstance();

  constructor({
    imagePath = "",
    wrapS = CLAMP_TO_EDGE,
    wrapT = CLAMP_TO_EDGE,
    width = 256,
    height = 256,
    depthAttachment = false,
    minFilter = LINEAR,
    magFilter = LINEAR,
    format = RGBA,
    internalFormat = RGBA,
    type = UNSIGNED_BYTE,
    generateMipmaps = true,
    flipY = true,
    target = TEXTURE_2D,
    name = "",
    anistropy = 0,
  } = {}) {
    this._id = ID++;

    this._gl = this._bolt.getContext();
    this._width = width;
    this._height = height;
    this._depthAttachment = depthAttachment;
    this._format = format;
    this._internalFormat = internalFormat;
    this._pixelType = type;
    this._imagePath = imagePath;
    this._type = type;
    this._target = target;
    this._minFilter = minFilter;
    this._magFilter = magFilter;
    this._anistropy = anistropy;

    this._name = name;

    this._wrapT = wrapT;
    this._wrapS = wrapS;

    this._generateMipmaps = generateMipmaps;

    this._flipY = flipY;
  }

  abstract init(): void;

  abstract resize(width: number, height: number, depth?: number): void;

  abstract setFromData(
    data: TypedArray,
    width: number,
    height: number,
    depth?: number
  ): void;

  load?(): void;

  bind(index?: number | undefined) {
    if (this._bolt.boundTexture === this._id) return;
    this._gl.activeTexture(TEXTURE0 + (index || 0));
    this._gl.bindTexture(this._target, this._texture);
    this._bolt.boundTexture = this._id;
  }

  unbind() {
    this._gl.bindTexture(this.target, null);
  }

  delete() {
    this._gl.deleteTexture(this._texture);
  }

  isPowerOf2(value: number) {
    return (value & (value - 1)) == 0;
  }

  protected applySettings() {
    if (this._generateMipmaps) {
      this._gl.generateMipmap(this._target);
    }

    this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, this._flipY);
    this._gl.texParameteri(this._target, TEXTURE_WRAP_S, this._wrapS);
    this._gl.texParameteri(this._target, TEXTURE_WRAP_T, this._wrapT);
    this._gl.texParameteri(this._target, TEXTURE_MIN_FILTER, this._minFilter);
    this._gl.texParameteri(this._target, TEXTURE_MAG_FILTER, this._magFilter);

    if (this._anistropy > 0) {
      this.setAnistropy();
    }
  }

  private setAnistropy() {
    const ext =
      this._gl.getExtension("EXT_texture_filter_anisotropic") ||
      this._gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
      this._gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
    if (ext) {
      const max = this._gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      const amount = Math.min(max, this._anistropy);
      this._gl.texParameterf(
        this._gl.TEXTURE_2D,
        ext.TEXTURE_MAX_ANISOTROPY_EXT,
        amount
      );
    }
  }

  public get texture(): WebGLTexture {
    return this._texture;
  }

  public get minFilter(): number {
    return this._minFilter;
  }

  public set minFilter(value: number) {
    this.bind();
    this._gl.texParameteri(this._target, TEXTURE_MIN_FILTER, value);
    this.unbind();

    this._minFilter = value;
  }

  public get magFilter(): number {
    return this._magFilter;
  }

  public set magFilter(value: number) {
    this.bind();
    this._gl.texParameteri(this._target, TEXTURE_MAG_FILTER, value);
    this.unbind();
    this._magFilter = value;
  }

  public get wrapT(): number {
    return this._wrapT;
  }

  public set wrapT(value: number) {
    this.bind();
    this._gl.texParameteri(this._target, TEXTURE_WRAP_T, value);
    this.unbind();
    this._wrapT = value;
  }

  public get wrapS(): number {
    return this._wrapS;
  }

  public set wrapS(value: number) {
    this.bind();
    this._gl.texParameteri(this._target, TEXTURE_WRAP_S, value);
    this.unbind();
    this._wrapS = value;
  }

  public set anistropy(value: number) {
    this.bind();
    this.setAnistropy();
    this.unbind();
  }

  public get height(): number {
    return this._height;
  }

  public set height(value: number) {
    this._height = value;
  }

  public get width(): number {
    return this._width;
  }

  public set width(value: number) {
    this._width = value;
  }

  public get imagePath(): string {
    return this._imagePath;
  }

  public get depthAttachment(): boolean | undefined {
    return this._depthAttachment;
  }

  public get flipY(): boolean {
    return this._flipY;
  }

  public set flipY(value: boolean) {
    this._gl.bindTexture(this._target, this._texture);
    this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, value);
    this._gl.bindTexture(this._target, null);
    this._flipY = value;
  }

  public get generateMipmaps(): boolean {
    return this._generateMipmaps;
  }

  public get pixelType(): number {
    return this._pixelType;
  }

  public get target(): number {
    return this._target;
  }

  public get gl(): WebGL2RenderingContext {
    return this._gl;
  }

  public get format(): number {
    return this._format;
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  public get id(): number {
    return this._id;
  }

  public get currentUnit(): number {
    return this._currentUnit;
  }

  public set currentUnit(value: number) {
    this._currentUnit = value;
  }
}
