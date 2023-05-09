// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

import { mat2, mat3, mat4, vec2, vec3, vec4 } from "gl-matrix";

import { TextureObject, UniformObjectWgpu } from "../Types";
import TextureCube from "../TextureCube";
import Texture from "../Texture";
import BoltWGPU from "./BoltWGPU";
import Node from "../Node";
import Camera from "../Camera";
import { UniformType } from "../Types";
import { TypedArray } from "../..";

let ID = -1;

export default class ProgramWebgpu {
  private _shaderSource!: string;
  private _name!: string;
  private _transparent = false;
  private _cullFace?: number | undefined = undefined;
  private _id = ID;
  private _renderer: BoltWGPU;
  private _pipeline: GPURenderPipeline | undefined;
  private _uniforms: UniformObjectWgpu = {};
  private _entries: GPUBindGroupEntry[] = [];
  private _bindGroup: GPUBindGroup | undefined;
  private _wgpuData: {
    [key: string]: {
      arrayBuffer: UniformType;
      gpuBuffer: GPUBuffer;
      offset: number;
      size: number;
    };
  };

  constructor(
    renderer: BoltWGPU,
    parameters: {
      shaderSrc: string;
      uniforms: UniformObjectWgpu;
    }
  ) {
    ID++;
    this._id = ID;
    this._renderer = renderer;
    this._shaderSource = parameters.shaderSrc;

    this.createPipeline();

    this._uniforms = parameters.uniforms || {};

    const projection = mat4.create();
    const view = mat4.create();
    const model = mat4.create();
    const normal = mat4.create();
    const modelViewProjection = mat4.create();

    // TODO: these should be split into Camera and Node - Camera is global and Node is local
    this._uniforms.ViewData = {
      bindGroupID: 0,
      values: {
        model,
        view,
        projection,
        normal,
        modelViewProjection,
      },
    };

    this._wgpuData = {};

    Object.entries(this._uniforms).forEach(([uniformBlockKey, uniform]) => {
      if (!this._renderer.device) {
        throw new Error("WebGPU device not found");
      }

      const uniformValues = uniform.values;

      this._wgpuData[uniformBlockKey] = {};

      // calculate size of buffer
      let size = 0;
      Object.values(uniformValues).forEach((buffer) => {
        const buf = buffer as Float32Array;
        if (!buf.length) {
          size += 4;
          return;
        }
        size += buf.length * 4;
      });

      const gpuBuffer = this._renderer.device.createBuffer({
        size,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      // calculate offset of each buffer
      let offset = 0;

      Object.keys(uniformValues).forEach((key) => {
        const arrayBuffer = uniformValues[key] as TypedArray;
        if (!arrayBuffer) return;
        let length = 0;
        if (!arrayBuffer.length) {
          length = 1;
        } else {
          length = arrayBuffer.length;
        }

        this._wgpuData[uniformBlockKey][key] = {
          arrayBuffer,
          gpuBuffer,
          offset,
          size: length * 4,
        };

        offset += length * 4;
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

    if (!this._renderer.device || this._pipeline === undefined)
      throw new Error("WebGPU device or pipeline not found");

    this._bindGroup = this._renderer.device.createBindGroup({
      layout: this._pipeline.getBindGroupLayout(0),
      entries: this._entries,
    });
  }

  createPipeline() {
    if (!this._renderer.device || !this._renderer.presentationFormat) return;
    this._pipeline = this._renderer.device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: this._renderer.device.createShaderModule({
          code: this._shaderSource,
        }),
        entryPoint: "vsMain",
        buffers: [
          // create default attribute buffers
          {
            // position
            arrayStride: 4 * 3, // 4 bytes per float * 3 floats per vertex
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
            arrayStride: 4 * 3, // 4 bytes per float * 3 floats per vertex
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
            arrayStride: 4 * 2, // 4 bytes per float * 2 floats per vertex
            attributes: [
              {
                shaderLocation: 2,
                offset: 0,
                format: "float32x2",
              },
            ],
          },
        ],
      },
      fragment: {
        module: this._renderer.device.createShaderModule({
          code: this._shaderSource,
        }),
        entryPoint: "fsMain",
        targets: [
          {
            format: <GPUTextureFormat>this._renderer.presentationFormat,
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
        cullMode: "none",
      },
      multisample: {
        count: 4,
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus",
      },
    });
  }

  setBool(uniform: string, value: boolean, uniformBlock: string) {
    this.setBlockUniform(uniformBlock, uniform, value);
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
    this._wgpuData[uniformBlock][uniform].arrayBuffer = value;
  }

  updateMatrices(node: Node, camera: Camera) {
    const viewData = this._wgpuData["ViewData"];

    if (viewData) {
      const model = viewData["model"].arrayBuffer as mat4;

      mat4.copy(model, node.modelMatrix);

      const view = viewData["view"].arrayBuffer as mat4;
      mat4.copy(view, camera.view);

      const projection = viewData["projection"].arrayBuffer as mat4;
      mat4.copy(projection, camera.projection);

      mat4.multiply(node.modelViewMatrix, camera.view, node.modelMatrix);
      mat4.invert(node.inverseModelViewMatrix, node.modelViewMatrix);
      mat4.transpose(node.normalMatrix, node.inverseModelViewMatrix);

      const normal = viewData["normal"].arrayBuffer as mat4;
      mat4.copy(normal, node.normalMatrix);

      const modelViewProjection = viewData["modelViewProjection"]
        .arrayBuffer as mat4;

      mat4.multiply(
        modelViewProjection,
        camera.projection,
        node.modelViewMatrix
      );
    }

    node.updateModelMatrix();
  }

  update(passEncoder: GPURenderPassEncoder) {
    if (!this._bindGroup) return;
    Object.values(this._wgpuData).forEach((uniformBlock) => {
      if (!this._renderer || !this._renderer.device) return;
      Object.values(uniformBlock).forEach((uniformData) => {
        this._renderer.device.queue.writeBuffer(
          // TODO: should we mark uniforms as dynamic or static?
          uniformData.gpuBuffer,
          uniformData.offset,
          uniformData.arrayBuffer as ArrayBuffer
        );
      });
    });
    passEncoder.setBindGroup(0, this._bindGroup);
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

  public get vertexShader(): WebGLShader {
    return this._vertexShader;
  }

  public set vertexShader(value: WebGLShader) {
    this._vertexShader = value;
  }

  public get fragmentShader(): WebGLShader {
    return this._fragmentShader;
  }

  public set fragmentShader(value: WebGLShader) {
    this._fragmentShader = value;
  }

  public get program(): WebGLProgram {
    return this._program;
  }

  public get textures(): TextureObject[] {
    return this._textures;
  }

  public set textures(value: TextureObject[]) {
    this._textures = value;
  }

  public get uniforms(): UniformObjectWgpu {
    return this._uniforms;
  }

  public get transparent() {
    return this._transparent;
  }

  public set transparent(value) {
    this._transparent = value;
  }

  public get blendFunction() {
    return this._blendFunction;
  }

  public set blendFunction(value) {
    this._blendFunction = value;
  }

  public get cullFace(): number {
    return this._cullFace!;
  }

  public set cullFace(value: number) {
    this._cullFace = value;
  }

  public get id(): number {
    return this._id;
  }

  public get pipeline(): GPURenderPipeline {
    return this._pipeline;
  }
}
