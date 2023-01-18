import { mat2, mat3, mat4, vec2, vec3, vec4 } from "gl-matrix";

import { BlendOptions, TextureObject, UniformObject } from "./Types";
import TextureCube from "./TextureCube";
import Texture from "./Texture";
import {
  ACTIVE_UNIFORMS,
  FRAGMENT_SHADER,
  LINK_STATUS,
  ONE_MINUS_SRC_ALPHA,
  SAMPLER_2D,
  SAMPLER_CUBE,
  SRC_ALPHA,
  VERTEX_SHADER,
} from "./Constants";
import Bolt from "./Bolt";

let ID = -1;

export default class Program {
  private _gl: WebGL2RenderingContext;
  private _vertexShader: WebGLShader;
  private _fragmentShader: WebGLShader;
  private _program: WebGLProgram;
  private _textures: TextureObject[];
  private _uniforms: UniformObject;
  private _vertexShaderSource!: string;
  private _fragmentShaderSource!: string;
  private _name!: string;
  private _transparent = false;
  private _blendFunction: BlendOptions = {
    src: SRC_ALPHA,
    dst: ONE_MINUS_SRC_ALPHA,
  };
  private _cullFace?: number | undefined = undefined;
  private _id = ID;

  constructor(
    vertexShaderSrc: string,
    fragmentShaderSrc: string,
    parameters?: {
      transformFeedbackVaryings: string[];
    }
  ) {
    ID++;

    this._id = ID;

    this._vertexShaderSource = vertexShaderSrc;
    this._fragmentShaderSource = fragmentShaderSrc;

    this._textures = <TextureObject[]>[];

    this._uniforms = {};

    this._gl = Bolt.getInstance().getContext();

    const ext = this._gl.getExtension("KHR_parallel_shader_compile");

    this._vertexShader = <WebGLShader>this._gl.createShader(VERTEX_SHADER);

    this._gl.shaderSource(this._vertexShader, vertexShaderSrc);
    this._gl.compileShader(this._vertexShader);

    const vertexLogs = this._gl.getShaderInfoLog(this._vertexShader);

    if (vertexLogs && vertexLogs.length > 0) {
      throw vertexLogs;
    }

    this._fragmentShader = <WebGLShader>this._gl.createShader(FRAGMENT_SHADER);

    this._gl.shaderSource(this._fragmentShader, fragmentShaderSrc);
    this._gl.compileShader(this._fragmentShader);

    const fragmentLogs = this._gl.getShaderInfoLog(this._fragmentShader);

    if (fragmentLogs && fragmentLogs.length > 0) {
      throw fragmentLogs;
    }

    this._program = <WebGLProgram>this._gl.createProgram();

    this._gl.attachShader(this._program, this._vertexShader);
    this._gl.attachShader(this._program, this._fragmentShader);

    // add transform feedback varyings
    if (parameters?.transformFeedbackVaryings) {
      this._gl.transformFeedbackVaryings(
        this._program,
        parameters.transformFeedbackVaryings,
        this._gl.SEPARATE_ATTRIBS
      );
    }

    this._gl.linkProgram(this._program);

    // use KHR extension to compile shaders in parallel
    if (ext) {
      if (
        !this._gl.getProgramParameter(this._program, ext.COMPLETION_STATUS_KHR)
      ) {
        if (!this._gl.getProgramParameter(this._program, LINK_STATUS)) {
          const info = this._gl.getProgramInfoLog(this._program);
          throw "Could not compile WebGL program. \n\n" + info;
        }
      }
    } else {
      if (!this._gl.getProgramParameter(this._program, LINK_STATUS)) {
        const info = this._gl.getProgramInfoLog(this._program);
        throw "Could not compile WebGL program. \n\n" + info;
      }
    }

    const uniformCount = this._gl.getProgramParameter(
      this._program,
      ACTIVE_UNIFORMS
    );

    const textureUniforms = [];

    // get the active uniform locations and populate the uniform object
    for (let i = 0; i < uniformCount; i++) {
      const uniform = this._gl.getActiveUniform(this._program, i);
      if (!uniform) continue;
      // only run .getUniformLocation() before the first draw call
      // if the uniform is an array, remove the array index from the name
      const uniformName = uniform.name.includes("[")
        ? uniform.name.substring(0, uniform.name.lastIndexOf("["))
        : uniform.name;
      const location = this._gl.getUniformLocation(this._program, uniform.name);
      if (!location) continue;

      if (uniform.type === SAMPLER_2D || uniform.type === SAMPLER_CUBE) {
        textureUniforms.push({
          name: uniformName,
          value: undefined,
          type: uniform.type,
          location,
        });
      } else {
        this._uniforms[uniformName] = { location, value: undefined };
      }
    }

    textureUniforms.forEach((uniform, index) => {
      this._uniforms[uniform.name] = {
        location: uniform.location,
        value: uniform.value,
        textureUnit: index,
      };
    });

    this._gl.deleteShader(this._vertexShader);
    this._gl.deleteShader(this._fragmentShader);
  }

  setBool(uniform: string, value: number) {
    const location = this._getLocation(uniform);
    if (!location) return;
    this._gl.uniform1i(location, +value);
    this._uniforms[uniform] = { location, value };
  }

  setInt(uniform: string, value: number) {
    const location = this._getLocation(uniform);
    if (!location) return;
    this._gl.uniform1i(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setFloat(uniform: string, value: number) {
    const location = this._getLocation(uniform);
    if (!location) return;
    this._uniforms[uniform] = { location, value };
    this._gl.uniform1f(location, value);
  }

  setVector2(uniform: string, value: vec2) {
    const location = this._getLocation(uniform);
    if (!location) return;
    this._gl.uniform2fv(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setVector3(uniform: string, value: vec3) {
    const location = this._getLocation(uniform);
    if (!location) return;
    this._gl.uniform3fv(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setVector4(uniform: string, value: vec4) {
    const location = this._getLocation(uniform);
    if (!location) return;
    this._gl.uniform4fv(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setMatrix2(uniform: string, value: mat2) {
    const location = this._getLocation(uniform);
    if (!location) return;
    this._gl.uniformMatrix2fv(location, false, value);
    this._uniforms[uniform] = { location, value };
  }

  setMatrix3(uniform: string, value: mat3) {
    const location = this._getLocation(uniform);
    if (!location) return;
    this._gl.uniformMatrix3fv(location, false, value);
    this._uniforms[uniform] = { location, value };
  }

  setMatrix4(uniform: string, value: mat4) {
    const location = this._getLocation(uniform);
    if (!location) return;
    this._gl.uniformMatrix4fv(location, false, value);
    this._uniforms[uniform] = { location, value };
  }

  setTexture(
    uniform: string,
    texture: Texture | TextureCube,
    textureUnit?: number
  ) {
    const location = this._getLocation(uniform);
    if (!location) return;

    const unit =
      textureUnit === undefined
        ? this._uniforms[uniform].textureUnit
        : textureUnit;

    this._gl.uniform1i(location, unit || 0);

    this._uniforms[uniform] = { location, value: texture, textureUnit: unit };
  }

  _getLocation(uniform: string) {
    let location: WebGLUniformLocation | null;
    if (this._uniforms[uniform] !== undefined) {
      location = this._uniforms[uniform].location;
    } else {
      location = null;
    }
    return location;
  }

  activate() {
    this._gl.useProgram(this._program);
  }

  disable() {
    this._gl.useProgram(null);
  }

  delete() {
    this._gl.deleteProgram(this._program);
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

  public get uniforms(): UniformObject {
    return this._uniforms;
  }

  public get vertexShaderSource(): string {
    return this._vertexShaderSource;
  }

  public set vertexShaderSource(value: string) {
    this._vertexShaderSource = value;
  }

  public get fragmentShaderSource(): string {
    return this._fragmentShaderSource;
  }

  public set fragmentShaderSource(value: string) {
    this._fragmentShaderSource = value;
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
}
