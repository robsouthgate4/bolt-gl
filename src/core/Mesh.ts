import { vec3 } from "gl-matrix";
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
import { FLOAT, TRIANGLES, UNSIGNED_SHORT, STATIC_DRAW } from "./Constants";
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
  private _instanced?: boolean;
  private _vao: VAO;
  private _ibo!: IBO;
  private _drawType: number;
  private _bounds: BoxBounds = { min: vec3.create(), max: vec3.create() };
  private _isSkinMesh = false;
  private _lineWidth?: number;
  private _depthWrite = true;
  private _depthTest = true;
  constructor(geometry?: GeometryBuffers, params?: MeshParams) {
    this._gl = Bolt.getInstance().getContext();

    this._drawType = TRIANGLES; // default draw mode

    if (geometry) {
      this._defaultBuffers.positions = geometry.positions;
      this._defaultBuffers.normals = geometry.normals;
      this._defaultBuffers.uvs = geometry.uvs;
      this._defaultBuffers.indices = geometry.indices;
    }

    this._vao = new VAO();

    this.linkDefaultBuffers();

    if (!this._instanced) {
      if (
        this._defaultBuffers.indices &&
        this._defaultBuffers.indices.length > 0
      ) {
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
    divisor: number | undefined = undefined,
    drawType = STATIC_DRAW
  ) {
    // create new VBO if it doesn't exist
    if (!this._extraBuffers.has(layoutID as unknown as string)) {
      const id =
        typeof layoutID === "number" ? layoutID : layoutID.attributeName;
      const vbo = new VBO(buffer, drawType, id as string);

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

      this._extraBuffers.set(id as string, buffer);

      this._vao.unbind();
    } else {
      // update existing VBO
      const vbo = this._vao.getVBO(layoutID as unknown as string);
      if (vbo) vbo.update(buffer);
    }
  }

  setVBO(
    vbo: VBO,
    size: number,
    layoutID: number | AttribPointer,
    type = FLOAT,
    offset = 0,
    divisor: number | undefined = undefined,
    stride: number | undefined = undefined
  ) {
    const buffer = vbo.buffer as TypedArray;

    this._vao.bind();
    this._vao.linkAttrib(
      vbo,
      layoutID,
      size,
      type,
      stride || size,
      offset,
      divisor
    );

    const id = typeof layoutID === "number" ? layoutID : layoutID.attributeName;
    this._extraBuffers.set(id as string, buffer);

    this._vao.unbind();
  }

  private linkDefaultBuffers() {
    const positionVbo = new VBO(
      new Float32Array(this._defaultBuffers.positions || [])
    );
    const normalVbo = new VBO(
      new Float32Array(this._defaultBuffers.normals || [])
    );
    const uvVbo = new VBO(new Float32Array(this._defaultBuffers.uvs || []));

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

      this._gl.drawElements(
        this._drawType,
        this._defaultBuffers.indices.length,
        UNSIGNED_SHORT,
        0
      );

      this._ibo.unbind();
    } else {
      if (!this._defaultBuffers.positions) return;

      this._gl.drawArrays(
        this._drawType,
        0,
        this._defaultBuffers.positions.length / 3
      );
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

  public set depthWrite(value: boolean) {
    this._depthWrite = value;
  }

  public get depthWrite() {
    return this._depthWrite;
  }

  public get depthTest() {
    return this._depthTest;
  }

  public set depthTest(value: boolean) {
    this._depthTest = value;
  }

  protected get lineWidth() {
    return this._lineWidth;
  }

  public get instanced(): boolean {
    return this._instanced ?? false;
  }

  public set instanced(value: boolean) {
    this._instanced = value;
  }
}
