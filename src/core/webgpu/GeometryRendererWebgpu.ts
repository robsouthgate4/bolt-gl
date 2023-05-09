import { vec3, mat4 } from "gl-matrix";
import {
  AttribPointer,
  BoxBounds,
  Face,
  GeometryBuffers,
  MeshParams,
  TypedArray,
} from "../Types";
import Node from "../Node";
import Program from "../Program";
import BoltWGPU from "./BoltWGPU";
import IBOWebgpu from "./IBOWebgu";
import VBOWebgpu from "./VBOWebgu";
import ProgramWebgpu from "./ProgramWebgpu";

export default class GeometryRendererWebgpu {
  private _geometry?: GeometryBuffers;
  private _params?: MeshParams;
  private _renderer: BoltWGPU;
  private _bounds: BoxBounds = { min: vec3.create(), max: vec3.create() };
  private _defaultBuffers: GeometryBuffers = {
    positions: [],
    normals: [],
    uvs: [],
    uvs2: [],
    indices: [],
  };
  private _extraBuffers = new Map<string, TypedArray>();
  private _drawType: number;
  private _instanced: boolean | undefined;
  private _instanceMatrices: mat4[] | undefined;
  private _instanceCount: number | undefined;
  private _ibo: IBOWebgpu | undefined;
  private _faces: Face[] = [];
  private _lineWidth = 1;
  private _vbos: VBOWebgpu[] = [];

  constructor(
    renderer: BoltWGPU,
    geometry?: GeometryBuffers,
    params?: MeshParams
  ) {
    this._geometry = geometry;
    this._params = params;
    this._renderer = renderer;

    this._drawType = 1; // default draw mode

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
      this._ibo = new IBOWebgpu(
        this._renderer,
        new Uint16Array(this._defaultBuffers.indices)
      );
    }
  }

  private linkDefaultBuffers() {
    const positionVbo = new VBOWebgpu(
      this._renderer,
      new Float32Array(this._defaultBuffers.positions!)
    );
    const normalVbo = new VBOWebgpu(
      this._renderer,
      new Float32Array(this._defaultBuffers.normals!)
    );
    const uvVbo = new VBOWebgpu(
      this._renderer,
      new Float32Array(this._defaultBuffers.uvs!)
    );

    this._vbos.push(positionVbo, normalVbo, uvVbo);
  }

  setAttribute(buffer: TypedArray, layoutID: number | AttribPointer) {
    const vbo = new VBOWebgpu(this._renderer, buffer);
    const id = typeof layoutID === "number" ? layoutID : layoutID.attributeName;
    this._extraBuffers.set(id as string, buffer);
    this._vbos.push(vbo);
  }

  public setDrawType(type: number) {
    this._drawType = type;
    return this;
  }

  public draw(program: Program, passEncoder: GPURenderPassEncoder) {
    const { device } = this._renderer;

    if (!device || !this._defaultBuffers.positions) return;

    const programWGPU = program.programRenderer as ProgramWebgpu;

    const vertexCount = this._defaultBuffers.positions.length / 3;

    passEncoder.setPipeline(programWGPU.pipeline);
    programWGPU.update(passEncoder);

    this._vbos.forEach((vbo, index) => {
      passEncoder.setVertexBuffer(index, vbo.buffer);
    });

    if (this._ibo) {
      passEncoder.setIndexBuffer(this._ibo.buffer, "uint16");
      passEncoder.drawIndexed(this._ibo.count);
    } else {
      passEncoder.draw(vertexCount, 1, 0, 0);
    }
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

    //TODO: delete
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
