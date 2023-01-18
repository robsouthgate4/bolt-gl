import { Bolt, FBO, Mesh, Program, Texture2D } from "../../../";
export abstract class Pass {
  private _fullScreenTriangle!: Mesh;
  private _renderToScreen = false;
  private _enabled = true;

  protected _texture: Texture2D | undefined;
  protected _width: number;
  protected _height: number;
  protected _bolt: Bolt;

  public _hasCustomFBO = false;
  public fbo?: FBO;
  public requiresSwap = true;

  constructor(
    bolt: Bolt,
    { texture }: { width: number; height: number; texture?: Texture2D }
  ) {
    const triangleVertices = [-1, -1, 0, -1, 4, 0, 4, -1, 0];

    const triangleIndices = [2, 1, 0];

    this.fullScreenTriangle = new Mesh({
      positions: triangleVertices,
      indices: triangleIndices,
    });

    this._bolt = bolt;

    this._width = texture ? texture.width : 256;
    this._height = texture ? texture.height : 256;

    this._texture = texture || undefined;
  }

  resize(width: number, height: number) {
    this._width = width;
    this._height = height;

    if (this.fbo) {
      this.fbo.resize(width, height);
    }
  }

  setEnabled(val: boolean) {
    this._enabled = val;

    return this;
  }

  protected _bindTextures(program: Program) {
    if (program.textures && program.textures.length > 0) {
      for (let i = 0; i < program.textures.length; i++) {
        const textureObject = program.textures[i];

        textureObject.texture.textureUnit(
          program,
          textureObject.uniformName,
          i
        );
      }
    }
  }

  set enabled(val: boolean) {
    this._enabled = val;
  }

  get enabled() {
    return this._enabled;
  }

  set renderToScreen(val: boolean) {
    this._renderToScreen = val;
  }

  get renderToScreen(): boolean {
    return this._renderToScreen;
  }

  public get fullScreenTriangle(): Mesh {
    return this._fullScreenTriangle;
  }

  public set fullScreenTriangle(value: Mesh) {
    this._fullScreenTriangle = value;
  }

  public get texture(): Texture2D | undefined {
    return this._texture;
  }

  abstract draw(readFBO: FBO, writeFbo: FBO, renderToScreen?: boolean): void;
}
