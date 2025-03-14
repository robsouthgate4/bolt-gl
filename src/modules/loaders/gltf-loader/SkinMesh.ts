import { flattenFloatArray } from "../../core/GLUtils";
import { Mesh, Node, Program, GeometryBuffers, MeshParams, Texture2D,  RGBA, CLAMP_TO_EDGE, NEAREST, FLOAT, RGBA32f, RGB, Bolt } from "../../";
import Skin from "./Skin";

export default class SkinMesh extends Mesh {
  private _skin: Skin | undefined;
  private _jointTexture: Texture2D | undefined;

  constructor(geometry?: GeometryBuffers, params?: MeshParams) {
    super(geometry, params);
    this.isSkinMesh = true;
  }

  createTexture(skin: Skin) {
    const w = 4;
    const h = skin.joints.length;

    this._jointTexture = new Texture2D({
      width: w,
      height: h,
      internalFormat: RGBA32f,
      format: RGBA,
      wrapS: CLAMP_TO_EDGE,
      wrapT: CLAMP_TO_EDGE,
      minFilter: NEAREST,
      magFilter: NEAREST,
      type: FLOAT,
      generateMipmaps: false,
      flipY: false,
    });

    this._jointTexture.setFromData(
      skin.jointData,
      4,
      skin.joints.length
    );

    this._jointTexture.name = "jointTexture";
  }

  draw(program: Program, node: Node) {
    
    if (!this._skin || !node) return;
    
    this._skin.update(node!, program, this._jointTexture);
    
    program.activate();
    
    program.setMatrix4(
      "jointTransforms",
      flattenFloatArray(this.skin!.jointMatrices)
      );
      
      program.setFloat("jointCount", this._skin.joints.length);
      
      if (this._jointTexture !== undefined) {
        program.setTexture("jointTexture", this._jointTexture);
      }
      
    super.draw(program);
  }

  public get skin(): Skin | undefined {
    return this._skin;
  }

  public set skin(value: Skin | undefined) {
    this._skin = value;
  }
}
