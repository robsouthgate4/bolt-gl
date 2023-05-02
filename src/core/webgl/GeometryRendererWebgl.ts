import { vec3, mat4 } from "gl-matrix";
import Bolt from "./Bolt";
import { FLOAT, TRIANGLES, UNSIGNED_INT, UNSIGNED_SHORT } from "./Constants";
import IBOWebgl from "./IBOWebgl";
import {
  AttribPointer,
  BoxBounds,
  Face,
  GeometryBuffers,
  MeshParams,
  TypedArray,
} from "../Types";
import VAO from "./VAO";
import VBOWebgl from "./VBOWebgl";
import VBOInstancedWebgl from "./VBOInstancedWebgl";
import Node from "../Node";
import Program from "../Program";

export default class GeometryRendererWebgl {
  private _geometry?: GeometryBuffers;
  private _params?: MeshParams;
  private _renderer: Bolt;
  private _vao: VAO;
  private _bounds: BoxBounds = { min: vec3.create(), max: vec3.create() };
  private _defaultBuffers: GeometryBuffers = {
    positions: [],
    normals: [],
    uvs: [],
    uvs2: [],
    indices: [],
  };
  private _extraBuffers = new Map<string, TypedArray>();
  private _gl: WebGL2RenderingContext;
  private _drawType: number;
  private _instanced: boolean | undefined;
  private _instanceMatrices: mat4[] | undefined;
  private _instanceCount: number | undefined;
  private _ibo: IBOWebgl | undefined;
  private _faces: Face[] = [];
  private _lineWidth = 1;

  constructor(renderer: Bolt, geometry?: GeometryBuffers, params?: MeshParams) {
    this._geometry = geometry;
    this._params = params;
    this._renderer = renderer;
    this._vao = new VAO(this._renderer);

    this._gl = renderer.getContext();

    this._drawType = TRIANGLES; // default draw mode

    if (this._geometry) {
      this._defaultBuffers.positions = this._geometry.positions;
      this._defaultBuffers.normals = this._geometry.normals;
      this._defaultBuffers.uvs = this._geometry.uvs;
      this._defaultBuffers.indices = this._geometry.indices;
    }

    this._instanced = params?.instanced;
    this._instanceMatrices = params?.instanceMatrices;
    this._instanceCount = params?.instanceCount;

    this.linkDefaultBuffers();

    if (
      this._defaultBuffers.indices &&
      this._defaultBuffers.indices.length > 0
    ) {
      if (this._instanced) {
        // use higher precision for instanced meshes
        this._ibo = new IBOWebgl(new Uint32Array(this._defaultBuffers.indices));
      } else {
        this._ibo = new IBOWebgl(new Uint16Array(this._defaultBuffers.indices));
      }
    }
  }

  private linkDefaultBuffers() {
    const positionVbo = new VBOWebgl(
      this._renderer,
      new Float32Array(this._defaultBuffers.positions!)
    );
    const normalVbo = new VBOWebgl(
      this._renderer,
      new Float32Array(this._defaultBuffers.normals!)
    );
    const uvVbo = new VBOWebgl(
      this._renderer,
      new Float32Array(this._defaultBuffers.uvs!)
    );

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
      const instancedVBO = new VBOInstancedWebgl(this._instanceMatrices);
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

  setAttribute(
    buffer: TypedArray,
    size: number,
    layoutID: number | AttribPointer,
    type = FLOAT,
    offset = 0,
    divisor: number | undefined = undefined
  ) {
    const vbo = new VBOWebgl(this._renderer, buffer);

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

  public setDrawType(type: number) {
    this._drawType = type;
    return this;
  }

  public draw(program: Program, node?: Node) {
    if (this._lineWidth) {
      this._gl.lineWidth(this._lineWidth);
    }

    this._vao.bind();

    if (
      this._defaultBuffers.indices &&
      this._defaultBuffers.indices.length > 0
    ) {
      this._ibo && this._ibo.bind();

      if (this._instanced && this._instanceCount && this._ibo) {
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

      this._ibo && this._ibo.unbind();
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

  public get vao(): VAO {
    return this._vao;
  }

  public set vao(value: VAO) {
    this._vao = value;
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

  public get drawType() {
    return this._drawType;
  }

  public set drawType(value) {
    this._drawType = value;
  }
}
