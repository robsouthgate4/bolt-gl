import { flattenFloatArray } from "../../core/GLUtils";
import { Mesh, Node, Program, GeometryBuffers, MeshParams } from "../../";
import Skin from "./Skin";

export default class SkinMesh extends Mesh {
  private _skin?: Skin | undefined;

  constructor(geometry?: GeometryBuffers, params?: MeshParams) {
    super(geometry, params);
    this.isSkinMesh = true;
  }

  draw(program: Program, node: Node) {
    if (!this._skin || !node) return;

    this._skin.update(node!);
    program.activate();

    // activate program and pass joint data to program
    program.setTexture("jointTexture", this._skin.jointTexture, 0);
    this._skin.jointTexture.bind(0);

    program.setMatrix4(
      "jointTransforms",
      flattenFloatArray(this.skin!.jointMatrices)
    );

    program.setFloat("jointCount", this._skin.joints.length);

    super.draw(program);
  }

  public get skin(): Skin | undefined {
    return this._skin;
  }

  public set skin(value: Skin | undefined) {
    this._skin = value;
  }
}
