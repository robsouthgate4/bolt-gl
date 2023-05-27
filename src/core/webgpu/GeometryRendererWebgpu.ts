import { vec3, mat4 } from "gl-matrix";
import {
  AttribPointer,
  BoxBounds,
  Face,
  GeometryBuffers,
  MeshParams,
  TypedArray,
  WebgpuAttributeBuffer,
} from "../Types";
import Program from "../Program";
import BoltWGPU from "./BoltWGPU";
import IBOWebgpu from "./IBOWebgu";
import VBOWebgpu from "./VBOWebgu";
import ProgramWebgpu from "./ProgramWebgpu";
import DrawSet from "../DrawSet";
import { FLOAT } from "bolt-wgpu";

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

  private _extraBuffers = new Map<string, WebgpuAttributeBuffer>();
  private _drawType: number;
  private _instanced: boolean | undefined;
  private _instanceMatrices: mat4[] | undefined;
  private _instanceCount: number | undefined;
  private _ibo: IBOWebgpu | undefined;
  private _faces: Face[] = [];
  private _lineWidth = 1;
  private _vbos: VBOWebgpu[] = [];
  private _nodeUniformBuffer!: GPUBuffer;
  private _nodeBindGroup!: GPUBindGroup;

  constructor(
    renderer: BoltWGPU,
    geometry?: GeometryBuffers,
    params?: MeshParams
  ) {
    this._geometry = geometry;
    this._params = params;
    this._renderer = renderer;

    this._instanceCount = params?.instanceCount || 1;

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

    this.setupNodeBindGroup();
  }

  private setupNodeBindGroup() {
    if (!this._renderer.device) return;

    const matrixSizeInBytes = 16 * Float32Array.BYTES_PER_ELEMENT; // 16 floats (4x4 matrix)
    const bufferSize = 3 * matrixSizeInBytes; // 3 matrices in total, model, normal, modelViewProjection

    this._nodeUniformBuffer = this._renderer.device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this._nodeBindGroup = this._renderer.device.createBindGroup({
      layout: this._renderer.nodeBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this._nodeUniformBuffer,
          },
        },
      ],
    });
  }

  private linkDefaultBuffers() {
    const positionVbo = new VBOWebgpu(
      this._renderer,
      new Float32Array(this._defaultBuffers.positions!)
    );

    this._vbos.push(positionVbo);

    //if (this.defaultBuffers.normals !== undefined) {
    const normalVbo = new VBOWebgpu(
      this._renderer,
      new Float32Array(this._defaultBuffers.normals!)
    );
    this._vbos.push(normalVbo);
    //}

    //if (this.defaultBuffers.uvs !== undefined) {
    const uvVbo = new VBOWebgpu(
      this._renderer,
      new Float32Array(this._defaultBuffers.uvs!)
    );
    this._vbos.push(uvVbo);
    // }
  }

  setAttribute(
    buffer: TypedArray,
    size: number,
    layoutID: number | AttribPointer,
    type = FLOAT,
    offset = 0,
    divisor: number | undefined = undefined
  ) {
    const vbo = new VBOWebgpu(this._renderer, buffer);

    this._extraBuffers.set(layoutID.toString(), {
      buffer,
      size,
      type,
      offset,
      divisor,
    });
    this._vbos.push(vbo);
  }

  public setDrawType(type: number) {
    this._drawType = type;
    return this;
  }

  public draw(
    program: Program,
    node: DrawSet,
    passEncoder: GPURenderPassEncoder
  ) {
    const { device } = this._renderer;

    const programWGPU = program.programRenderer as ProgramWebgpu;
    if (!device || !this._defaultBuffers.positions || !programWGPU.pipeline)
      return;

    const vertexCount = this._defaultBuffers.positions.length / 3;

    passEncoder.setPipeline(programWGPU.pipeline);
    programWGPU.update(passEncoder, node);

    this._vbos.forEach((vbo, index) => {
      passEncoder.setVertexBuffer(index, vbo.buffer);
    });

    if (this._defaultBuffers.indices && this._ibo) {
      passEncoder.setIndexBuffer(this._ibo.buffer, "uint16");
      passEncoder.drawIndexed(this._ibo.count, this._instanceCount);
    } else {
      passEncoder.draw(vertexCount, this._instanceCount);
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

  public get extraBuffers(): Map<string, WebgpuAttributeBuffer> {
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

  public get nodeUniformBuffer(): GPUBuffer {
    return this._nodeUniformBuffer;
  }

  public get nodeBindGroup(): GPUBindGroup {
    return this._nodeBindGroup;
  }
}
