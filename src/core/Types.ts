import { mat2, mat3, mat4, vec2, vec3, vec4 } from "gl-matrix";

import TextureCube from "./TextureCube";
import Texture from "./Texture";
import Program from "./Program";
import Bolt from "./webgl/Bolt";
import BoltWGPU from "./webgpu/BoltWGPU";

export interface BoltParams {
  antialias?: boolean;
  dpi?: number;
  powerPreference?: "high-performance" | "low-power" | "default";
  alpha?: boolean;
  premultipliedAlpha?: boolean;
  preserveDrawingBuffer?: boolean;
  stencil?: boolean;
}

export interface Viewport {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export type UniformType =
  | number
  | vec2
  | vec3
  | vec4
  | mat2
  | mat3
  | mat4
  | Texture
  | TextureCube
  | TypedArray
  | undefined;

export type Renderer = Bolt | BoltWGPU;

export interface AttribPointer {
  attributeName: string;
  program: Program;
}

export interface GeometryBuffers {
  positions?: number[] | Float32Array;
  normals?: number[] | Float32Array;
  uvs?: number[] | Float32Array;
  uvs2?: number[] | Float32Array;
  indices?: number[] | Uint16Array | Int16Array;
}

export interface MeshParams {
  indices?: number[];
  drawType?: number;
  instanced?: boolean;
  instanceCount?: number;
  instanceMatrices?: mat4[];
}

export interface Face {
  indices: number[];
  vertices: number[][];
}

export interface BoxBounds {
  min: vec3;
  max: vec3;
}
export interface TextureObject {
  uniformName: string;
  uniformLocation: WebGLUniformLocation | null;
  textureUnit: number;
  texture: Texture | TextureCube;
}

export interface TextureSettingsWebGPU {
  device: GPUDevice;
  width: number;
  height: number;
  format: GPUTextureFormat;
  usage: GPUTextureUsageFlags;
}

export interface Uniform {
  location: WebGLUniformLocation | undefined;
  value: UniformType;
  textureUnit?: number;
}

export interface UniformWgpu {
  values: { [key: string]: UniformType };
  bindGroupID: number;
}

export interface UniformParam {
  name: string;
  value: UniformType;
}
export interface UniformParams {
  [key: string]: UniformParam;
}

export interface UniformObject {
  [key: string]: Uniform;
}

export interface UniformObjectWgpu {
  [key: string]: UniformWgpu;
}

export interface BlendOptions {
  src: number;
  dst: number;
}

export enum RendererType {
  WEBGL = "webgl",
  WEBGPU = "webgpu",
}

export type WebgpuAttributeBuffer = {
  buffer: TypedArray;
  size: number;
  type: number;
  offset: number;
  divisor: number | undefined;
};
