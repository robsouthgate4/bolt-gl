import { mat2, mat3, mat4, vec2, vec3, vec4 } from "gl-matrix";

import {
  BlendOptions,
  StencilOptions,
  TextureObject,
  UniformObject,
} from "./Types";
import TextureCube from "./TextureCube";
import Texture from "./Texture";
import {
  ACTIVE_UNIFORMS,
  ALWAYS,
  BACK,
  EQUAL,
  FRAGMENT_SHADER,
  FRONT,
  GEQUAL,
  GREATER,
  KEEP,
  LEQUAL,
  LESS,
  LINK_STATUS,
  NEVER,
  NONE,
  NOTEQUAL,
  ONE_MINUS_SRC_ALPHA,
  REPLACE,
  SRC_ALPHA,
  VERTEX_SHADER,
  SEPARATE_ATTRIBS,
  INTERLEAVED_ATTRIBS,
} from "./Constants";
import Bolt from "./Bolt";
import Texture2D from "./Texture2D";

let ID = -1;

export default class Program {
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
  private _bolt: Bolt;
  private _stencilSettings: Record<string, number> = {};

  private _stencilDictionary: Record<string, number> = {
    keep: KEEP,
    replace: REPLACE,
    always: ALWAYS,
    never: NEVER,
    less: LESS,
    lequal: LEQUAL,
    greater: GREATER,
    gequal: GEQUAL,
    equal: EQUAL,
    notequal: NOTEQUAL,
  };

  protected _gl: WebGL2RenderingContext;

  constructor(
    vertexShaderSrc: string,
    fragmentShaderSrc: string,
    parameters?: {
      transformFeedbackVaryings: string[];
      transformFeedbackVaryingType:
        | typeof SEPARATE_ATTRIBS
        | typeof INTERLEAVED_ATTRIBS;
    }
  ) {
    ID++;

    this._id = ID;

    this._bolt = Bolt.getInstance();
    this._gl = Bolt.getInstance().getContext();

    const processedVertexShader = vertexShaderSrc.trim();
    const processedFragmentShader = this.shaderPreprocessor(fragmentShaderSrc);

    this._vertexShaderSource = processedVertexShader;
    this._fragmentShaderSource = processedFragmentShader.shaderSource;

    this._vertexShader = <WebGLShader>this._gl.createShader(VERTEX_SHADER);
    this._fragmentShader = <WebGLShader>this._gl.createShader(FRAGMENT_SHADER);

    this._textures = <TextureObject[]>[];

    this._uniforms = {};

    this.linkShaders(this._vertexShaderSource, this._fragmentShaderSource);

    this._program = <WebGLProgram>this._gl.createProgram();

    //apply settings
    this.applySettings(processedFragmentShader.settings);

    this._gl.attachShader(this._program, this._vertexShader);
    this._gl.attachShader(this._program, this._fragmentShader);

    // add transform feedback varyings
    if (parameters?.transformFeedbackVaryings) {
      console.log(parameters.transformFeedbackVaryingType);
      this._gl.transformFeedbackVaryings(
        this._program,
        parameters.transformFeedbackVaryings,
        parameters.transformFeedbackVaryingType || SEPARATE_ATTRIBS
      );
    }

    this._gl.linkProgram(this._program);

    this.linkUniforms();

    this._gl.deleteShader(this._vertexShader);
    this._gl.deleteShader(this._fragmentShader);
  }

  private applySettings(settings: Record<string, Record<string, string>>) {
    const CULL_MODES = {
      back: BACK,
      front: FRONT,
      none: NONE,
    } as const;

    if (settings.STENCIL) {
      this._stencilSettings = {
        ref: this._stencilDictionary[settings.STENCIL.ref],
        writeMask: parseInt(settings.STENCIL.writeMask),
        func: this._stencilDictionary[settings.STENCIL.func],
        fail: this._stencilDictionary[settings.STENCIL.fail],
        zFail: this._stencilDictionary[settings.STENCIL.zFail],
        pass: this._stencilDictionary[settings.STENCIL.pass],
      };
    }

    if (settings.CULL) {
      this._cullFace =
        CULL_MODES[settings.CULL.mode as keyof typeof CULL_MODES] ?? BACK;
    }
  }

  private shaderPreprocessor(shaderSource: string) {
    const potentialSettings = ["STENCIL", "BLEND", "CULL"];

    const settingsObject: Record<string, Record<string, string>> = {};
    let newShaderString = shaderSource;

    for (const setting of potentialSettings) {
      const regex = new RegExp(`#pragma ${setting}\\s*\\{([^}]+)\\}`);
      const match = shaderSource.match(regex);

      if (match) {
        const blockContent = match[1].trim();
        settingsObject[setting] = {};

        // Convert each line into key-value pairs
        blockContent.split("\n").forEach((line) => {
          const [key, value] = line
            .trim()
            .split(":")
            .map((s) => s.trim());

          if (key && value !== undefined) {
            settingsObject[setting][key] = value.toString();
          }
        });
        newShaderString = newShaderString.replace(regex, "").trim();
      }
    }

    return {
      shaderSource: newShaderString.trim(),
      settings: settingsObject,
    };
  }

  private linkUniforms() {
    const ext = this._gl.getExtension("KHR_parallel_shader_compile");

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
    let textureUnit = 0;

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

      if (
        uniform.type === this._gl.SAMPLER_2D ||
        uniform.type === this._gl.SAMPLER_CUBE ||
        uniform.type === this._gl.SAMPLER_3D
      ) {
        const tempTexture = new Texture2D({
          width: 1,
          height: 1,
        });

        tempTexture.setFromData(new Uint8Array([1, 1, 0, 1]), 1, 1);

        textureUniforms.push({
          name: uniformName,
          value: tempTexture,
          type: uniform.type,
          location,
          textureUnit,
        });

        this.activate();
        this._gl.uniform1i(location, textureUnit);

        textureUnit++;
      } else {
        this._uniforms[uniformName] = { location, value: undefined };
      }
    }

    textureUniforms.forEach((uniform) => {
      this._uniforms[uniform.name] = {
        location: uniform.location,
        value: uniform.value,
        textureUnit: uniform.textureUnit,
      };
    });
  }

  private linkShaders(vertexShaderSrc: string, fragmentShaderSrc: string) {
    this._gl.shaderSource(this._vertexShader, vertexShaderSrc);
    this._gl.compileShader(this._vertexShader);

    const vertexLogs = this._gl.getShaderInfoLog(this._vertexShader);

    if (vertexLogs && vertexLogs.length > 0) {
      throw vertexLogs;
    }

    this._gl.shaderSource(this._fragmentShader, fragmentShaderSrc);
    this._gl.compileShader(this._fragmentShader);

    const fragmentLogs = this._gl.getShaderInfoLog(this._fragmentShader);

    if (fragmentLogs && fragmentLogs.length > 0) {
      throw fragmentLogs;
    }
  }

  setBool(uniform: string, value: number) {
    this.activate();
    const location = this.getLocation(uniform);
    if (!location) return;
    this._gl.uniform1i(location, +value);
    this._uniforms[uniform] = { location, value };
  }

  setInt(uniform: string, value: number) {
    this.activate();
    const location = this.getLocation(uniform);
    if (!location) return;
    this._gl.uniform1i(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setFloat(uniform: string, value: number) {
    this.activate();
    const location = this.getLocation(uniform);
    if (!location) return;
    this._uniforms[uniform] = { location, value };
    this._gl.uniform1f(location, value);
  }

  setVector2(uniform: string, value: vec2) {
    this.activate();
    const location = this.getLocation(uniform);
    if (!location) return;
    this._gl.uniform2fv(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setVector3(uniform: string, value: vec3) {
    this.activate();
    const location = this.getLocation(uniform);
    if (!location) return;
    this._gl.uniform3fv(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setVector4(uniform: string, value: vec4) {
    this.activate();
    const location = this.getLocation(uniform);
    if (!location) return;
    this._gl.uniform4fv(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setMatrix2(uniform: string, value: mat2) {
    this.activate();
    const location = this.getLocation(uniform);
    if (!location) return;
    this._gl.uniformMatrix2fv(location, false, value);
    this._uniforms[uniform] = { location, value };
  }

  setMatrix3(uniform: string, value: mat3) {
    this.activate();
    const location = this.getLocation(uniform);
    if (!location) return;
    this._gl.uniformMatrix3fv(location, false, value);
    this._uniforms[uniform] = { location, value };
  }

  setMatrix4(uniform: string, value: mat4) {
    this.activate();
    const location = this.getLocation(uniform);
    if (!location) return;
    this._gl.uniformMatrix4fv(location, false, value);
    this._uniforms[uniform] = { location, value };
  }

  setTexture(uniform: string, texture: Texture | TextureCube) {
    this.activate();
    const location = this.getLocation(uniform);
    if (!location) return;

    const unit = this._uniforms[uniform].textureUnit;

    texture.currentUnit = unit || 0;
    this._gl.uniform1i(location, unit || 0);
    this._uniforms[uniform] = { location, value: texture, textureUnit: unit };
  }

  private getLocation(uniform: string) {
    let location: WebGLUniformLocation | null;
    if (this._uniforms[uniform] !== undefined) {
      location = this._uniforms[uniform].location;
    } else {
      location = null;
    }
    return location;
  }

  activate() {
    if (this._bolt.activeProgram === this._id) return;
    this._gl.useProgram(this._program);
    this._bolt.activeProgram = this._id;
  }

  use() {
    Object.values(this._uniforms).forEach((uniform) => {
      if (uniform.value instanceof Texture) {
        const texture = uniform.value;
        if (this._bolt.activeTextureUnit !== texture.id) {
          texture.bind(uniform.textureUnit);
          this._bolt.activeTextureUnit = texture.id;
        }
      }
    });

    // pass in an any default uniforms here

    if (this._bolt.activeCamera && this._uniforms["cameraPosition"]) {
      this.setVector3("cameraPosition", this._bolt.activeCamera.position);
    }

    if (this._bolt.getContext() && this._uniforms["resolution"]) {
      const canvas = this._bolt.getContext().canvas;
      this.setVector2(
        "resolution",
        vec2.fromValues(canvas.width, canvas.height)
      );
    }
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

  public get stencilSettings(): Record<string, number> {
    return this._stencilSettings;
  }

  public set stencilSettings(value: Record<string, number>) {
    this._stencilSettings = value;
  }

  public get id(): number {
    return this._id;
  }
}
