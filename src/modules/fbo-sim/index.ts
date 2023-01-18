import { Bolt, Program, FBO, Mesh, DrawSet, Texture2D } from "../../";

import vertexShader from "./shaders/vertexShader.glsl";
import throughShader from "./shaders/through.glsl";
import { vec2 } from "gl-matrix";
export interface FBOSwapDefinition {
  read: FBO;
  write: FBO;
  requiresSwap: boolean;
  shader: string;
  passName: string;
  program?: Program;
  initialTexture?: Texture2D;
  inputs?: { name: string }[];
}

export default class FBOSim {
  private _FBOSwapDefinitions: FBOSwapDefinition[] = [];
  private _triangleMesh: Mesh;
  private _gl: WebGL2RenderingContext;
  private _bolt: Bolt;
  private _outProgram: Program;
  private _drawSetOut: DrawSet;
  private _drawSetblit: DrawSet;
  private _outputToScreen = false;
  private _throughProgram: Program;
  private _isIos: boolean;

  constructor(bolt: Bolt, outPutToScreen = false) {
    this._bolt = bolt;
    this._gl = bolt.getContext();

    this._outputToScreen = outPutToScreen;

    this._throughProgram = new Program(vertexShader, throughShader);
    this._outProgram = new Program(vertexShader, throughShader);

    // required for using float and half float textures
    this._isIos = /(iPad|iPhone|iPod)/g.test(window.navigator.userAgent);

    if (this._isIos) {
      this._gl.getExtension("EXT_color_buffer_half_float");
    } else {
      this._gl.getExtension("EXT_color_buffer_float");
    }

    const triangleVertices = [-1, -1, 0, -1, 4, 0, 4, -1, 0];

    const triangleIndices = [2, 1, 0];

    // create full screen quad for rendering
    this._triangleMesh = new Mesh({
      positions: triangleVertices,
      indices: triangleIndices,
    });

    this._drawSetblit = new DrawSet(
      this._triangleMesh,
      new Program(vertexShader, throughShader)
    );

    this._drawSetOut = new DrawSet(this._triangleMesh, this._outProgram);
  }

  private _runBlit(texture: Texture2D, fbo: FBO) {
    fbo.bind();
    this._throughProgram.activate();
    this._throughProgram.setTexture("map", texture);
    this._drawSetblit.program = this._throughProgram;
    this._bolt.clear(0, 0, 0, 1);
    this._bolt.draw(this._drawSetblit);
    fbo.unbind();
  }

  /**
   * bind fbos that require swappoing at run time
   * @param  {FBOSwapDefinition[]} fboDefinitions - array of FBO definitions
   */
  bindFBOs(fboDefinitions: FBOSwapDefinition[]) {
    this._FBOSwapDefinitions = fboDefinitions;

    this._FBOSwapDefinitions.forEach((fboSwapDefinition) => {
      // blit the initial texture to the read and write fbos
      if (fboSwapDefinition.initialTexture) {
        this._runBlit(fboSwapDefinition.initialTexture, fboSwapDefinition.read);
        this._runBlit(
          fboSwapDefinition.initialTexture,
          fboSwapDefinition.write
        );
      }

      fboSwapDefinition.program = new Program(
        vertexShader,
        fboSwapDefinition.shader
      );
    });

    this._FBOSwapDefinitions = fboDefinitions;
  }

  swapBuffers(fboSwapDefinition: FBOSwapDefinition) {
    const temp = fboSwapDefinition.read;
    fboSwapDefinition.read = fboSwapDefinition.write;
    fboSwapDefinition.write = temp;
  }

  getTexture(passName: string) {
    const pass = this._FBOSwapDefinitions.find(
      (fboSwapDefinition) => fboSwapDefinition.passName === passName
    );

    if (pass) {
      return pass.read.targetTexture;
    }
  }

  getProgram(passName: string) {
    const pass = this._FBOSwapDefinitions.find(
      (fboSwapDefinition) => fboSwapDefinition.passName === passName
    );

    if (pass) {
      return pass.program;
    }
  }

  compute() {
    const passes = this._FBOSwapDefinitions;

    passes.forEach((fboSwapDefinition) => {
      const program = fboSwapDefinition.program;

      fboSwapDefinition.write.bind();

      if (program) {
        program.activate();

        program.setVector2(
          "resolution",
          vec2.fromValues(
            fboSwapDefinition.read.width,
            fboSwapDefinition.read.height
          )
        );

        if (fboSwapDefinition.inputs) {
          //TODO: needs work
          fboSwapDefinition.inputs.forEach((input) => {
            // console.log("------------------------------------");
            // console.log(input.name);
            // console.log(fboSwapDefinition.read.name);
            // console.log("------------------------------------");
            program.setTexture(
              input.name,
              fboSwapDefinition.read.targetTexture
            );
          });
        }
      }

      this._bolt.clear(0, 0, 0, 1);

      if (program) {
        this._drawSetblit.program = program;
      }

      this._bolt.draw(this._drawSetblit);

      this.swapBuffers(fboSwapDefinition);
      fboSwapDefinition.write.unbind();
    });

    if (this._outputToScreen) {
      //console.log("output to screen");
      const pass1 = this._FBOSwapDefinitions[0];
      this._bolt.setViewPort(0, 0, pass1.read.width * 3, pass1.read.height * 3);
      this._bolt.clear(0, 0, 0, 1);
      this._outProgram.activate();
      this._outProgram.setTexture("map", pass1.read.targetTexture);
      this._bolt.draw(this._drawSetOut);
    }
  }
}
