import { mat4 } from "gl-matrix";
import Mesh from "./Mesh";
import Program from "./Program";
import Node from "./Node";
import { GeometryBuffers, MeshParams } from "./Types";
import { FLOAT, UNSIGNED_INT } from "./Constants";
import VBOInstanced from "./VBOInstanced";
import { DYNAMIC_DRAW } from "./Constants";
import IBO from "./IBO";
import Bolt from "./Bolt";

export default class InstancedMesh extends Mesh {
  private _instanceMatrices: mat4[] | undefined;
  private _instanceCount: number | undefined;
  private _instancedIBO: IBO | undefined;
  private gl: WebGL2RenderingContext;
  constructor(geometry: GeometryBuffers, params: MeshParams) {
    super(geometry, params);
    this.instanced = true;
    this._instanceMatrices =
      params === null || params === void 0 ? void 0 : params.instanceMatrices;
    this._instanceCount =
      params === null || params === void 0 ? void 0 : params.instanceCount;
    this.gl = Bolt.getInstance().getContext();
    this.setup();
  }
  setup() {
    if (this.defaultBuffers.indices) {
      this._instancedIBO = new IBO(
        new Uint32Array(this.defaultBuffers.indices)
      );
    }
    if (this._instanceMatrices) {
      console.log(this.vao);
      this.vao.bind();
      const id = "3";
      const instancedVBO = new VBOInstanced(
        this._instanceMatrices,
        DYNAMIC_DRAW,
        id
      );
      instancedVBO.bind();
      const bytesMatrix = 4 * 16;
      const bytesVec4 = 4 * Float32Array.BYTES_PER_ELEMENT;
      this.vao.linkAttrib(
        instancedVBO,
        3,
        4,
        FLOAT,
        bytesMatrix,
        0 * bytesVec4
      );
      this.vao.linkAttrib(
        instancedVBO,
        4,
        4,
        FLOAT,
        bytesMatrix,
        1 * bytesVec4
      );
      this.vao.linkAttrib(
        instancedVBO,
        5,
        4,
        FLOAT,
        bytesMatrix,
        2 * bytesVec4
      );
      this.vao.linkAttrib(
        instancedVBO,
        6,
        4,
        FLOAT,
        bytesMatrix,
        3 * bytesVec4
      );
      this.gl.vertexAttribDivisor(3, 1);
      this.gl.vertexAttribDivisor(4, 1);
      this.gl.vertexAttribDivisor(5, 1);
      this.gl.vertexAttribDivisor(6, 1);
      instancedVBO.unbind();
      this.vao.unbind();
      console.log(this);
    }
  }
  setMatrixAt(index: number, matrix: Float32Array) {
    if (!this._instanceMatrices) return;
    this._instanceMatrices[index] = matrix;
    const instancedVBO = this.vao.getVBO("3");
    if (instancedVBO) {
      instancedVBO.bind();
      instancedVBO.update(matrix, index * 16 * 4);
      instancedVBO.unbind();
    }
  }
  draw(program?: Program, node?: Node) {
    if (!this.vao) return;
    if (this.lineWidth) {
      this.gl.lineWidth(this.lineWidth);
    }
    this.vao.bind();
    if (this._instancedIBO && this._instanceCount) {
      this._instancedIBO.bind();
      this.gl.drawElementsInstanced(
        this.drawType,
        this._instancedIBO.count,
        UNSIGNED_INT,
        0,
        this._instanceCount
      );
      this._instancedIBO.unbind();
    } else {
      if (this._instanceCount && this.defaultBuffers.positions) {
        this.gl.drawArraysInstanced(
          this.drawType,
          0,
          this.defaultBuffers.positions.length,
          this._instanceCount
        );
      }
    }
    this.vao.unbind();
  }
}
