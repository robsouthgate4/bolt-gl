import { Bolt, Program, FBO, RBO } from "../../../";
import { Pass } from "./Pass";

import vertexShader from "./shaders/fast-blur/fast-blur.vert";
import fragmentShader from "./shaders/fast-blur/fast-blur.frag";
import { vec2 } from "gl-matrix";

interface FastBlurPassParams {
  width: number;
  height: number;
  iterations?: number;
  customBlurShader?: string;
}

export default class FastBlurPass extends Pass {
  private _iterations: number;
  public program!: Program;
  public fbo: FBO;
  private _rbo: RBO;

  constructor(
    bolt: Bolt,
    {
      width = 256,
      height = 256,
      iterations = 8,
      customBlurShader,
    }: FastBlurPassParams
  ) {
    super(bolt, {
      width,
      height,
    });

    this._hasCustomFBO = true;

    this.fbo = new FBO({
      width: 1,
      height: 1,
    });

    this.fbo.bind();

    this._rbo = new RBO({
      width: 1,
      height: 1,
    });

    this.fbo.unbind();
    this._rbo.unbind();

    this._iterations = iterations;

    this.requiresSwap = false;
    this.program = new Program(bolt, {
      vertexShaderSrc: vertexShader,
      fragmentShaderSrc: customBlurShader || fragmentShader,
      uniforms: {},
    });
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    this._rbo.resize(width, height);
    this.program.activate();
    this.program.setVector2("resolution", vec2.fromValues(width, height));
  }

  draw(readFBO: FBO, writeFBO: FBO, renderToScreen = true) {
    for (let i = 0; i < this._iterations; i++) {
      const radius = this._iterations - i - 1;

      writeFBO.bind();

      const map = i === 0 ? this.fbo.targetTexture : readFBO.targetTexture;

      this.program.activate();
      this.program.setTexture("map", map);

      this.program.setFloat("radius", radius);
      this.program.setVector2(
        "direction",
        i % 2 === 0 ? vec2.fromValues(radius, 0) : vec2.fromValues(0, radius)
      );

      this._bolt.clear(0, 0, 0, 0);
      this.fullScreenTriangle.draw(this.program);

      readFBO.unbind();
      writeFBO.unbind();
      this.fbo.unbind();

      const temp = writeFBO;
      writeFBO = readFBO;
      readFBO = temp;
    }

    if (renderToScreen) {
      this.program.activate();
      this.program.setVector2("direction", vec2.fromValues(0, 0));
      this.program.setTexture("map", readFBO.targetTexture);
      readFBO.targetTexture.bind(0);
      this._bolt.clear(0, 0, 0, 0);
      this.fullScreenTriangle.draw(this.program);
    }
  }
}
