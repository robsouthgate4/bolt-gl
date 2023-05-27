import { mat2, mat3, mat4, vec2, vec3, vec4 } from "gl-matrix";

import {
  Renderer,
  TextureObject,
  UniformObject,
  UniformObjectWgpu,
  UniformType,
} from "./Types";
import TextureCube from "./TextureCube";
import Texture from "./Texture";
import ProgramWebgl from "./webgl/ProgramWebgl";
import ProgramWebgpu from "./webgpu/ProgramWebgpu";
import Mediator from "./Mediator";
import Node from "./Node";
import Camera from "./Camera";

let ID = -1;

export default class Program {
  private _name!: string;
  private _id = ID;

  private _programRenderer: ProgramWebgl | ProgramWebgpu;
  private _renderer: Renderer;

  constructor(
    renderer: Renderer,
    parameters: {
      vertexShaderSrc: string;
      fragmentShaderSrc: string;
      shaderSrc?: string;
      uniforms: UniformObject;
      transformFeedbackVaryings?: string[];
      topology?: GPUPrimitiveTopology;
    }
  ) {
    ID++;

    this._renderer = renderer;
    const mediator = Mediator.getInstance();
    this._programRenderer = mediator.programType(renderer, parameters);
  }

  setBool(uniform: string, value: number, uniformBlock?: string) {
    const programRenderer = this._programRenderer as ProgramWebgl;
    programRenderer.setBool(uniform, value);
  }

  setInt(uniform: string, value: number, uniformBlock?: string) {
    const programRenderer = this._programRenderer as ProgramWebgl;
    programRenderer.setInt(uniform, value, uniformBlock);
  }

  setFloat(uniform: string, value: number, uniformBlock?: string) {
    const programRenderer = this._programRenderer as ProgramWebgl;
    programRenderer.setFloat(uniform, value, uniformBlock);
  }

  setVector2(uniform: string, value: vec2, uniformBlock?: string) {
    const programRenderer = this._programRenderer as ProgramWebgl;
    programRenderer.setVector2(uniform, value, uniformBlock);
  }

  setVector3(uniform: string, value: vec3, uniformBlock?: string) {
    const programRenderer = this._programRenderer as ProgramWebgl;
    programRenderer.setVector3(uniform, value, uniformBlock);
  }

  setVector4(uniform: string, value: vec4, uniformBlock?: string) {
    const programRenderer = this._programRenderer as ProgramWebgl;
    programRenderer.setVector4(uniform, value, uniformBlock);
  }

  setMatrix2(uniform: string, value: mat2, uniformBlock?: string) {
    const programRenderer = this._programRenderer as ProgramWebgl;
    programRenderer.setMatrix2(uniform, value, uniformBlock);
  }

  setMatrix3(uniform: string, value: mat3, uniformBlock?: string) {
    const programRenderer = this._programRenderer as ProgramWebgl;
    programRenderer.setMatrix3(uniform, value, uniformBlock);
  }

  setMatrix4(uniform: string, value: mat4, uniformBlock?: string) {
    const programRenderer = this._programRenderer as ProgramWebgl;
    programRenderer.setMatrix4(uniform, value, uniformBlock);
  }

  setBlockUniform(uniformBlock: string, uniform: string, value: UniformType) {
    this._programRenderer.setBlockUniform(uniformBlock, uniform, value);
  }

  setTexture(
    uniform: string,
    texture: Texture | TextureCube,
    uniformBlock?: string
  ) {
    const programRenderer = this._programRenderer as ProgramWebgl;
    programRenderer.setTexture(uniform, texture, uniformBlock);
  }

  updateMatrices(node: Node, camera: Camera) {
    this._programRenderer.updateMatrices(node, camera);
  }

  activate() {
    this._programRenderer.activate();
  }

  use() {
    this._programRenderer.use();
  }

  disable() {
    this._programRenderer.disable();
  }

  delete() {
    this._programRenderer.delete();
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  public get program(): WebGLProgram {
    return this._programRenderer.program;
  }

  public get textures(): TextureObject[] {
    return this._programRenderer.textures;
  }

  public get uniforms(): UniformObject | UniformObjectWgpu {
    return this._programRenderer.uniforms;
  }

  public get transparent() {
    return this._programRenderer.transparent;
  }

  public set transparent(value) {
    this._programRenderer.transparent = value;
  }

  public get blendFunction() {
    return this._programRenderer.blendFunction;
  }

  public set blendFunction(value) {
    this._programRenderer.blendFunction = value;
  }

  public get cullFace(): number {
    return this._programRenderer.cullFace;
  }

  public set cullFace(value: number) {
    this._programRenderer.cullFace = value;
  }

  public get id(): number {
    return this._id;
  }

  public get programRenderer(): ProgramWebgl | ProgramWebgpu {
    return this._programRenderer;
  }
}
