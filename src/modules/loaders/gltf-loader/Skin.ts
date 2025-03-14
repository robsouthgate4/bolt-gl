import { Node, Program, Texture2D } from "../../../";
import { mat4 } from "gl-matrix";

export default class Skin {
  private _joints: Node[];
  private _inverseBindMatrices: Float32Array[];
  private _jointMatrices: Float32Array[];
  private _jointData: Float32Array;
  private _globalWorldInverse = mat4.create();

  constructor(joints: Node[], inverseBindMatrixData: Float32Array) {
    this._joints = joints;
    this._inverseBindMatrices = [];
    this._jointMatrices = [];

    const mat4size = 4 * 4;
    this._jointData = new Float32Array(this._joints.length * mat4size);

    for (let i = 0; i < joints.length; i++) {
      this._inverseBindMatrices.push(
        new Float32Array(
          inverseBindMatrixData.buffer,
          inverseBindMatrixData.byteOffset +
            Float32Array.BYTES_PER_ELEMENT * mat4size * i,
          mat4size
        )
      );

      this._jointMatrices.push(
        new Float32Array(
          this._jointData.buffer,
          Float32Array.BYTES_PER_ELEMENT * mat4size * i,
          mat4size
        )
      );
    }
  }

  update(node: Node, program: Program, jointTexture: Texture2D | undefined) {
    mat4.invert(this._globalWorldInverse, node.worldMatrix);

    // apply inverse bind matrix to each joint

    for (let i = 0; i < this._joints.length; i++) {
      const joint = this._joints[i];

      const dst = this._jointMatrices[i];

      mat4.multiply(dst, this._globalWorldInverse, joint.modelMatrix);
      mat4.multiply(dst, dst, this._inverseBindMatrices[i]);
    }

    if (jointTexture !== undefined) {
      jointTexture.setFromData(this.jointData, 1, this._joints.length);
    }
  }

  public get jointData(): Float32Array {
    return this._jointData;
  }

  public get joints(): Node[] {
    return this._joints;
  }

  public set joints(value: Node[]) {
    this._joints = value;
  }

  public get jointMatrices(): Float32Array[] {
    return this._jointMatrices;
  }

  public set jointMatrices(value: Float32Array[]) {
    this._jointMatrices = value;
  }
}
