// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

import { mat3, mat4, vec2, vec3, vec4 } from "gl-matrix";
import { UniformObjectWgpu, WebgpuAttributeBuffer } from "../Types";
import Texture from "../Texture";
import BoltWGPU from "./BoltWGPU";
import Node from "../Node";
import Camera from "../Camera";
import { UniformType } from "../Types";
import { DrawSet, GeometryRendererWebgpu } from "../..";
import TopologyWGPU from "./TopologyWGPU";

let ID = -1;

export default class ProgramWebgpu {
  private _shaderSource!: string;
  private _name!: string;
  private _transparent = false;
  private _cullFace?: number = undefined;
  private _id = ID;
  private _renderer: BoltWGPU;
  private _pipeline?: GPURenderPipeline;
  private _uniforms: UniformObjectWgpu = {};
  private _entries: GPUBindGroupEntry[] = [];
  private _bindGroup?: GPUBindGroup;
  private _topology: GPUPrimitiveTopology;
  private _uniformGPUData: {
    [key: string]: {
      arrayBuffer: UniformType;
      gpuBuffer: GPUBuffer;
      offset: number;
      size: number;
    };
  } = {};
  private _bindGroupLayout: GPUBindGroupLayout;

  constructor(
    renderer: BoltWGPU,
    parameters: {
      shaderSrc: string;
      uniforms: UniformObjectWgpu;
      topology?: GPUPrimitiveTopology;
    }
  ) {
    ID++;
    this._id = ID;
    this._renderer = renderer;
    this._shaderSource = parameters.shaderSrc;

    this._topology = parameters.topology || TopologyWGPU.TRIANGLES;

    this._uniforms = parameters.uniforms || {};

    Object.entries(this._uniforms).forEach(([uniformBlockKey, uniform]) => {
      if (!this._renderer.device) {
        throw new Error("WebGPU device not found");
      }

      const uniformValues = uniform.values;

      this._uniformGPUData[uniformBlockKey] = {};

      // calculate size of buffer
      let size = 0;
      Object.values(uniformValues).forEach((buffer) => {
        const buf = buffer as Float32Array;
        if (!buf.length) {
          size += Float32Array.BYTES_PER_ELEMENT;
          return;
        }
        size += buf.length * Float32Array.BYTES_PER_ELEMENT;
      });

      // round up size to a multiple of 16
      size = (size + 15) & ~15;

      const gpuBuffer = this._renderer.device.createBuffer({
        size,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      // calculate offset of each buffer
      let offset = 0;

      Object.keys(uniformValues).forEach((key) => {
        let uniformValue = uniformValues[key];

        if (typeof uniformValue === "number") {
          uniformValue = new Float32Array([uniformValue]);
        }

        const uniformSize = uniformValue.length;

        this._uniformGPUData[uniformBlockKey][key] = {
          arrayBuffer: uniformValue,
          gpuBuffer,
          offset,
          size: uniformSize * Float32Array.BYTES_PER_ELEMENT,
        };

        offset += uniformSize * Float32Array.BYTES_PER_ELEMENT;
      });

      this._entries.push({
        binding: uniform.bindGroupID,
        resource: {
          buffer: gpuBuffer,
        },
      });

      // order by binding
      this._entries.sort((a, b) => {
        return a.binding - b.binding;
      });
    });
  }

  createPipeline(buffers: Map<string, WebgpuAttributeBuffer>) {
    const attributeBuffers = [
      // create default attribute buffers
      {
        // position
        arrayStride: Float32Array.BYTES_PER_ELEMENT * 3,
        attributes: [
          {
            shaderLocation: 0,
            offset: 0,
            format: "float32x3",
          },
        ],
      },
      {
        // normal
        arrayStride: Float32Array.BYTES_PER_ELEMENT * 3,
        attributes: [
          {
            shaderLocation: 1,
            offset: 0,
            format: "float32x3",
          },
        ],
      },
      {
        // uv
        arrayStride: Float32Array.BYTES_PER_ELEMENT * 2,
        attributes: [
          {
            shaderLocation: 2,
            offset: 0,
            format: "float32x2",
          },
        ],
      },
    ];

    // append custom attribute buffers
    buffers.forEach((buffer, key) => {
      attributeBuffers.push({
        arrayStride: buffer.size * Float32Array.BYTES_PER_ELEMENT,
        attributes: [
          {
            shaderLocation: parseInt(key),
            offset: 0,
            format: buffer.size === 1 ? "float32" : `float32x${buffer.size}`,
          },
        ],
      });
    });

    this._pipeline = this._renderer.device!.createRenderPipeline({
      layout: this._renderer.boltPipelineLayout,
      vertex: {
        module: this._renderer.device!.createShaderModule({
          code: this._shaderSource,
        }),
        entryPoint: "vsMain",
        buffers: attributeBuffers,
      },
      fragment: {
        module: this._renderer.device.createShaderModule({
          code: this._shaderSource,
        }),
        entryPoint: "fsMain",
        targets: [
          {
            format: this._renderer.presentationFormat as GPUTextureFormat,
          },
        ],
      },
      primitive: {
        topology: this._topology,
        cullMode: "none",
      },
      multisample: {
        count: 4, //TODO: get from renderer
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus",
      },
    });

    if (!this._renderer.device) return;

    this._bindGroupLayout = this._renderer.programBindGroupLayout;

    this._bindGroup = this._renderer.device.createBindGroup({
      layout: this._bindGroupLayout,
      entries: this._entries,
    });
  }

  setBool(uniform: string, value: boolean, uniformBlock: string) {
    this.setBlockUniform(uniformBlock, uniform, +value);
  }

  setInt(uniform: string, value: number, uniformBlock: string) {
    this.setBlockUniform(uniformBlock, uniform, value);
  }

  setFloat(uniform: string, value: number, uniformBlock: string) {
    this.setBlockUniform(uniformBlock, uniform, value);
  }

  setVector2(uniform: string, value: vec2, uniformBlock: string) {
    this.setBlockUniform(uniformBlock, uniform, value);
  }

  setVector3(uniform: string, value: vec3, uniformBlock: string) {
    this.setBlockUniform(uniformBlock, uniform, value);
  }

  setVector4(uniform: string, value: vec4, uniformBlock: string) {
    this.setBlockUniform(uniformBlock, uniform, value);
  }

  setMatrix3(uniform: string, value: mat3, uniformBlock: string) {
    this.setBlockUniform(uniformBlock, uniform, value);
  }

  setMatrix4(uniform: string, value: mat4, uniformBlock: string) {
    this.setBlockUniform(uniformBlock, uniform, value);
  }

  setTexture(uniform: string, value: Texture, uniformBlock: string) {
    //TODO: implement
    return;
  }

  setBlockUniform(uniformBlock: string, uniform: string, value: UniformType) {
    this._uniforms[uniformBlock].values[uniform] = value;
    this._uniformGPUData[uniformBlock][uniform].arrayBuffer = value;
  }

  updateMatrices(node: Node, camera: Camera) {
    mat4.multiply(node.modelViewMatrix, camera.view, node.modelMatrix);
    mat4.invert(node.inverseModelViewMatrix, node.modelViewMatrix);
    mat4.transpose(node.normalMatrix, node.inverseModelViewMatrix);
    mat4.multiply(
      node.modelViewProjectionMatrix,
      camera.projection,
      node.modelViewMatrix
    );
    node.updateModelMatrix();
  }

  update(passEncoder: GPURenderPassEncoder, node: DrawSet) {
    this.writeNodeBuffers(passEncoder, node);
    if (!this._bindGroup) return;
    this.writeUniformBuffers(passEncoder);
  }

  writeNodeBuffers(passEncoder: GPURenderPassEncoder, node: DrawSet) {
    const geometryRenderer = node.mesh
      .geometryRenderer as GeometryRendererWebgpu;

    if (!this._renderer.device) return;

    const matrixSize = 16 * 4;
    this._renderer.device.queue.writeBuffer(
      geometryRenderer.nodeUniformBuffer,
      0,
      node.modelMatrix as ArrayBuffer
    );
    this._renderer.device.queue.writeBuffer(
      geometryRenderer.nodeUniformBuffer,
      matrixSize,
      node.normalMatrix as ArrayBuffer
    );
    this._renderer.device.queue.writeBuffer(
      geometryRenderer.nodeUniformBuffer,
      matrixSize * 2,
      node.modelViewProjectionMatrix as ArrayBuffer
    );
    passEncoder.setBindGroup(1, geometryRenderer.nodeBindGroup);
  }

  writeUniformBuffers(passEncoder: GPURenderPassEncoder) {
    Object.values(this._uniformGPUData).forEach((uniformBlock) => {
      if (!this._renderer.device) return;
      Object.values(uniformBlock).forEach((uniformData) => {
        this._renderer.device.queue.writeBuffer(
          uniformData.gpuBuffer,
          uniformData.offset,
          uniformData.arrayBuffer as ArrayBuffer
        );
      });
    });
    passEncoder.setBindGroup(2, this._bindGroup);
  }

  activate() {
    return;
  }

  use() {
    return;
  }

  disable() {
    return;
  }

  delete() {
    return;
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  public get pipeline(): GPURenderPipeline | undefined {
    return this._pipeline;
  }

  public get transparent(): boolean {
    return this._transparent;
  }

  public set transparent(value: boolean) {
    this._transparent = value;
  }

  public get cullFace(): number | undefined {
    return this._cullFace;
  }

  public set cullFace(value: number | undefined) {
    this._cullFace = value;
  }

  public get id(): number {
    return this._id;
  }

  public get renderer(): BoltWGPU {
    return this._renderer;
  }

  public get uniforms(): UniformObjectWgpu {
    return this._uniforms;
  }
}
