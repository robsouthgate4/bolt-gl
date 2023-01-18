import { Bolt, FBO, RBO } from "../../";
import { Pass } from "./passes/Pass";

export default class Post {
  _height: number;
  _width: number;
  _passes: Pass[] = [];
  bolt: Bolt;

  private _readFbo!: FBO;
  private _writeFbo!: FBO;
  private _writeRBO!: RBO;
  private _readRBO!: RBO;
  private _outputDepth: boolean;
  constructor(bolt: Bolt, { outputDepth = false } = {}) {
    this.bolt = bolt;

    this._outputDepth = outputDepth;

    this._width = window.innerWidth;
    this._height = window.innerHeight;

    this._readFbo = new FBO({
      width: this._width,
      height: this._height,
      depth: outputDepth,
    });

    this._writeFbo = new FBO({
      width: this._width,
      height: this._height,
      depth: outputDepth,
    });

    // attach render buffer if no depth texture is used
    if (!outputDepth) {
      this._readFbo.bind();
      this._readRBO = new RBO({ width: this._width, height: this._height });
      this._readFbo.unbind();

      this._writeFbo.bind();
      this._writeRBO = new RBO({ width: this._width, height: this._height });
      this._writeFbo.unbind();
    }

    this._passes = [];
  }

  add(pass: Pass, renderToScreen = false) {
    pass.renderToScreen = renderToScreen;
    this._passes.push(pass);

    return this;
  }

  resize(width: number, height: number) {
    this._readFbo.resize(width, height);
    this._writeFbo.resize(width, height);

    this._passes.forEach((pass) => pass.resize(width, height));

    if (!this._outputDepth) {
      this._readRBO.resize(width, height);
      this._writeRBO.resize(width, height);
    }
  }

  swap() {
    const temp = this._readFbo;
    this._readFbo = this._writeFbo;
    this._writeFbo = temp;
  }

  begin() {
    this._readFbo.bind();
    this._passes.forEach((pass) => {
      if (pass.fbo) {
        pass.fbo && pass.fbo.bind();
      } else {
        this._readFbo.bind();
      }
    });
  }

  end() {
    this._readFbo.unbind();
    const enabledPasses = this._passes.filter((pass) => pass.enabled);

    enabledPasses.forEach((pass: Pass) => {
      !pass.fbo && this._readFbo.unbind();
      pass.fbo && pass.fbo.unbind();
      pass.draw(this._readFbo, this._writeFbo, pass.renderToScreen);
      pass.requiresSwap && this.swap();
    });
  }
}
