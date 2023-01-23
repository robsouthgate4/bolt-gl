import { mat4, vec3 } from "gl-matrix";

import VBOInstanced from "./VBOInstanced";
import VBO from "./VBO";
import VAO from "./VAO";
import {
  AttribPointer,
  BoxBounds,
  Face,
  GeometryBuffers,
  MeshParams,
  TypedArray,
} from "./Types";
import Program from "./Program";
import Node from "./Node";
import IBO from "./IBO";
import { FLOAT, TRIANGLES, UNSIGNED_INT, UNSIGNED_SHORT } from "./Constants";
import Bolt from "./Bolt";

export default class Mesh {
  private _gl: WebGL2RenderingContext;

  private _defaultBuffers: GeometryBuffers = {
    positions: [],
    normals: [],
    uvs: [],
    uvs2: [],
    indices: [],
  };

  private _extraBuffers = new Map<string, TypedArray>();

  // structured data
  private _faces: Face[] = [];
  private _vertices: number[][] = [];

  private _instanced?: boolean;
  private _vao: VAO;
  private _ibo!: IBO;
  private _instanceMatrices?: mat4[];
  private _instanceCount?: number;
  private _drawType: number;
  private _bounds: BoxBounds = { min: vec3.create(), max: vec3.create() };
  private _isSkinMesh = false;
  private _lineWidth?: number;

  constructor(geometry?: GeometryBuffers, params?: MeshParams) {
    this._gl = Bolt.getInstance().getContext();

    this._drawType = TRIANGLES; // default draw mode

    if (geometry) {
      this._defaultBuffers.positions = geometry.positions;
      this._defaultBuffers.normals = geometry.normals;
      this._defaultBuffers.uvs = geometry.uvs;
      this._defaultBuffers.indices = geometry.indices;
    }

    this._instanced = params?.instanced;
    this._instanceMatrices = params?.instanceMatrices;
    this._instanceCount = params?.instanceCount;
    this._vao = new VAO();

    this.linkDefaultBuffers();

    if (
      this._defaultBuffers.indices &&
      this._defaultBuffers.indices.length > 0
    ) {
      if (this._instanced) {
        // use higher precision for instanced meshes

        this._ibo = new IBO(new Uint32Array(this._defaultBuffers.indices));
      } else {
        this._ibo = new IBO(new Uint16Array(this._defaultBuffers.indices));
      }
    }
  }

  setDrawType(type: number) {
    this._drawType = type;

    return this;
  }

  setLineWidth(width: number) {
    this._lineWidth = width;

    return this;
  }

  setAttribute(
    buffer: TypedArray,
    size: number,
    layoutID: number | AttribPointer,
    type = FLOAT,
    offset = 0,
    divisor: number | undefined = undefined
  ) {
    const vbo = new VBO(buffer);

    this._vao.bind();
    this._vao.linkAttrib(
      vbo,
      layoutID,
      size,
      type,
      size * buffer.BYTES_PER_ELEMENT,
      offset * buffer.BYTES_PER_ELEMENT,
      divisor
    );

    const id = typeof layoutID === "number" ? layoutID : layoutID.attributeName;
    this._extraBuffers.set(id as string, buffer);

    this._vao.unbind();
  }

  setVBO(
    vbo: VBO,
    size: number,
    layoutID: number | AttribPointer,
    type = FLOAT,
    offset = 0,
    divisor: number | undefined = undefined
  ) {
    const buffer = vbo.buffer as TypedArray;

    this._vao.bind();
    this._vao.linkAttrib(
      vbo,
      layoutID,
      size,
      type,
      size * buffer.BYTES_PER_ELEMENT,
      offset * buffer.BYTES_PER_ELEMENT,
      divisor
    );

    const id = typeof layoutID === "number" ? layoutID : layoutID.attributeName;
    this._extraBuffers.set(id as string, buffer);

    this._vao.unbind();
  }

  private linkDefaultBuffers() {
    const positionVbo = new VBO(
      new Float32Array(this._defaultBuffers.positions!)
    );
    const normalVbo = new VBO(new Float32Array(this._defaultBuffers.normals!));
    const uvVbo = new VBO(new Float32Array(this._defaultBuffers.uvs!));

    this._vao.bind();

    this._vao.linkAttrib(positionVbo, 0, 3, FLOAT, 3 * 4, 0 * 4);

    if (
      this._defaultBuffers.normals &&
      this._defaultBuffers.normals.length > 0
    ) {
      this._vao.linkAttrib(normalVbo, 1, 3, FLOAT, 3 * 4, 0 * 4);
    }

    if (this._defaultBuffers.uvs && this._defaultBuffers.uvs.length > 0) {
      this._vao.linkAttrib(uvVbo, 2, 2, FLOAT, 2 * 4, 0 * 4);
    }

    if (this._instanced && this._instanceMatrices) {
      const instancedVBO = new VBOInstanced(this._instanceMatrices);
      instancedVBO.bind();

      const bytesMatrix = 4 * 16;
      const bytesVec4 = 4 * Float32Array.BYTES_PER_ELEMENT;

      this._vao.linkAttrib(
        instancedVBO,
        3,
        4,
        FLOAT,
        bytesMatrix,
        0 * bytesVec4
      );
      this._vao.linkAttrib(
        instancedVBO,
        4,
        4,
        FLOAT,
        bytesMatrix,
        1 * bytesVec4
      );
      this._vao.linkAttrib(
        instancedVBO,
        5,
        4,
        FLOAT,
        bytesMatrix,
        2 * bytesVec4
      );
      this._vao.linkAttrib(
        instancedVBO,
        6,
        4,
        FLOAT,
        bytesMatrix,
        3 * bytesVec4
      );

      this._gl.vertexAttribDivisor(3, 1);
      this._gl.vertexAttribDivisor(4, 1);
      this._gl.vertexAttribDivisor(5, 1);
      this._gl.vertexAttribDivisor(6, 1);

      instancedVBO.unbind();
    }

    this._vao.unbind();
    positionVbo.unbind();
    normalVbo.unbind();
    uvVbo.unbind();
  }

  calculateBoxBounds() {
    if (!this._defaultBuffers.positions || this.positions?.length === 0) {
      this._bounds = {
        min: vec3.create(),
        max: vec3.create(),
      };

      return;
    }

    const min = vec3.create();
    const max = vec3.create();

    for (let i = 0; i < this._defaultBuffers.positions.length / 3; i++) {
      const v = vec3.fromValues(
        this._defaultBuffers.positions[i * 3 + 0],
        this._defaultBuffers.positions[i * 3 + 1],
        this._defaultBuffers.positions[i * 3 + 2]
      );

      if (v[0] < min[0]) min[0] = v[0];
      else if (v[0] > max[0]) max[0] = v[0];
      if (v[1] < min[1]) min[1] = v[1];
      else if (v[1] > max[1]) max[1] = v[1];
      if (v[2] < min[2]) min[2] = v[2];
      else if (v[2] > max[2]) max[2] = v[2];
    }

    this._bounds = {
      min,
      max,
    };
  }

  /**
   * Delete vao and associated buffers
   */
  delete() {
    // reset all buffer data
    this._defaultBuffers = {
      positions: [],
      normals: [],
      uvs: [],
      indices: [],
    };

    this._faces = [];

    this._vao.delete();
  }

  /**
   * Render bound mesh
   * @param  {Program} program
   */
  draw(program: Program, node?: Node) {
    if (this._lineWidth) {
      this._gl.lineWidth(this._lineWidth);
    }

    this._vao.bind();

    if (
      this._defaultBuffers.indices &&
      this._defaultBuffers.indices.length > 0
    ) {
      this._ibo.bind();

      if (this._instanced && this._instanceCount) {
        this._gl.drawElementsInstanced(
          this._drawType,
          this._ibo.count,
          UNSIGNED_INT,
          0,
          this._instanceCount
        );
      } else {
        this._gl.drawElements(
          this._drawType,
          this._defaultBuffers.indices.length,
          UNSIGNED_SHORT,
          0
        );
      }

      this._ibo.unbind();
    } else {
      if (this._instanced && this._instanceCount) {
        if (!this._defaultBuffers.positions) return;

        this._gl.drawArraysInstanced(
          this._drawType,
          0,
          this._defaultBuffers.positions.length / 3,
          this._instanceCount
        );
      } else {
        if (!this._defaultBuffers.positions) return;

        this._gl.drawArrays(
          this._drawType,
          0,
          this._defaultBuffers.positions.length / 3
        );
      }
    }

    this._vao.unbind();
  }

  public get drawType() {
    return this._drawType;
  }

  public set drawType(value) {
    this._drawType = value;
  }

  public get bounds(): BoxBounds {
    return this._bounds;
  }
  public set bounds(value: BoxBounds) {
    this._bounds = value;
  }

  public get indices(): number[] | Uint16Array | Int16Array | undefined {
    return this._defaultBuffers.indices;
  }

  public set indices_(value: number[] | Uint16Array | undefined) {
    this._defaultBuffers.indices = value;
  }

  public get positions(): number[] | Float32Array | undefined {
    return this._defaultBuffers.positions;
  }

  public set positions(value: number[] | Float32Array | undefined) {
    this._defaultBuffers.positions = value;
  }

  public get normals(): number[] | Float32Array | undefined {
    return this._defaultBuffers.normals;
  }

  public set normals(value: number[] | Float32Array | undefined) {
    this._defaultBuffers.normals = value;
  }

  public get uvs(): number[] | Float32Array | undefined {
    return this._defaultBuffers.uvs;
  }

  public set uvs(value: number[] | Float32Array | undefined) {
    this._defaultBuffers.uvs = value;
  }

  public get defaultBuffers(): GeometryBuffers {
    return this._defaultBuffers;
  }

  public set defaultBuffers(value: GeometryBuffers) {
    this._defaultBuffers = value;
  }

  public get extraBuffers(): Map<string, TypedArray> {
    return this._extraBuffers;
  }

  public get faces(): Face[] {
    return this._faces;
  }

  public get isSkinMesh() {
    return this._isSkinMesh;
  }

  public set isSkinMesh(value) {
    this._isSkinMesh = value;
  }

  public get vao(): VAO {
    return this._vao;
  }

  public set vao(value: VAO) {
    this._vao = value;
  }
}
