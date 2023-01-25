import Bolt from "./Bolt";
import { CLAMP_TO_EDGE, LEQUAL, LINEAR, NONE } from "./Constants";

export default class TextureSampler {
  private _bolt = Bolt.getInstance();
  private _minFilter = LINEAR;
  private _magFilter = LINEAR;
  private _wrapS = CLAMP_TO_EDGE;
  private _wrapT = CLAMP_TO_EDGE;
  private _minLod = -1000;
  private _maxLod = 1000;
  private _compareMode = NONE;
  private _compareFunc = LEQUAL;
  private _sampler: WebGLSampler;
  private _gl: WebGL2RenderingContext;

  constructor({
    minFilter = LINEAR,
    magFilter = LINEAR,
    wrapS = CLAMP_TO_EDGE,
    wrapT = CLAMP_TO_EDGE,
    minLod = -1000,
    maxLod = 1000,
    compareMode = NONE,
    compareFunc = LEQUAL,
  } = {}) {
    this._gl = this._bolt.getContext();
    this._sampler = <WebGLSampler>this._gl.createSampler();
    this._minFilter = minFilter;
    this._magFilter = magFilter;
    this._wrapS = wrapS;
    this._wrapT = wrapT;
    this._minLod = minLod;
    this._maxLod = maxLod;
    this._compareMode = compareMode;
    this._compareFunc = compareFunc;
    this.applySettings();
  }

  private applySettings() {
    this._gl.samplerParameteri(
      this._sampler,
      this._gl.TEXTURE_MIN_FILTER,
      this._minFilter
    );
    this._gl.samplerParameteri(
      this._sampler,
      this._gl.TEXTURE_MAG_FILTER,
      this._magFilter
    );
    this._gl.samplerParameteri(
      this._sampler,
      this._gl.TEXTURE_WRAP_S,
      this._wrapS
    );
    this._gl.samplerParameteri(
      this._sampler,
      this._gl.TEXTURE_WRAP_T,
      this._wrapT
    );
    this._gl.samplerParameteri(
      this._sampler,
      this._gl.TEXTURE_MIN_LOD,
      this._minLod
    );
    this._gl.samplerParameteri(
      this._sampler,
      this._gl.TEXTURE_MAX_LOD,
      this._maxLod
    );
    this._gl.samplerParameteri(
      this._sampler,
      this._gl.TEXTURE_COMPARE_MODE,
      this._compareMode
    );
    this._gl.samplerParameteri(
      this._sampler,
      this._gl.TEXTURE_COMPARE_FUNC,
      this._compareFunc
    );
  }
  /**
   * Binds the sampler to a texture unit
   * @param  {number} unit
   */
  bind(unit: number) {
    this._gl.bindSampler(unit, this._sampler);
  }

  unbind(unit: number) {
    this._gl.bindSampler(unit, null);
  }
}
