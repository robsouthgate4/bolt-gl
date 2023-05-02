import { mat2, mat3, mat4, vec2, vec3, vec4 } from "gl-matrix";

import {
  BlendOptions,
  Renderer,
  TextureObject,
  UniformObject,
  UniformType,
} from "../Types";
import TextureCube from "../TextureCube";
import Texture from "../Texture";
import {
  ACTIVE_UNIFORMS,
  FRAGMENT_SHADER,
  LINK_STATUS,
  ONE_MINUS_SRC_ALPHA,
  RGBA,
  SRC_ALPHA,
  VERTEX_SHADER,
} from "./Constants";
import Texture2D from "../Texture2D";
import { FLOAT, RGBA32f } from "./Constants";
import Bolt from "./Bolt";
import Camera from "../Camera";
import Node from "../Node";

let ID = -1;

export default class ProgramWebgl {
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
  private _bolt: Renderer;

  protected _context: WebGL2RenderingContext;

  constructor(
    renderer: Bolt,
    parameters: {
      vertexShaderSrc: string;
      fragmentShaderSrc: string;
      uniforms: UniformObject;
      transformFeedbackVaryings?: string[];
    }
  ) {
    ID++;

    this._id = ID;

    this._bolt = renderer;
    this._context = this._bolt.getContext();

    this._vertexShaderSource = parameters.vertexShaderSrc;
    this._fragmentShaderSource = parameters.fragmentShaderSrc;

    this._vertexShader = <WebGLShader>this._context.createShader(VERTEX_SHADER);
    this._fragmentShader = <WebGLShader>(
      this._context.createShader(FRAGMENT_SHADER)
    );

    this._textures = <TextureObject[]>[];

    this._uniforms = {};

    this.linkShaders(parameters.vertexShaderSrc, parameters.fragmentShaderSrc);

    this._program = <WebGLProgram>this._context.createProgram();

    this._context.attachShader(this._program, this._vertexShader);
    this._context.attachShader(this._program, this._fragmentShader);

    // add transform feedback varyings
    if (parameters?.transformFeedbackVaryings) {
      this._context.transformFeedbackVaryings(
        this._program,
        parameters.transformFeedbackVaryings,
        this._context.SEPARATE_ATTRIBS
      );
    }

    this._context.linkProgram(this._program);

    this.linkUniforms();

    this._context.deleteShader(this._vertexShader);
    this._context.deleteShader(this._fragmentShader);
  }

  public linkUniforms() {
    const ext = this._context.getExtension("KHR_parallel_shader_compile");

    // use KHR extension to compile shaders in parallel
    if (ext) {
      if (
        !this._context.getProgramParameter(
          this._program,
          ext.COMPLETION_STATUS_KHR
        )
      ) {
        if (!this._context.getProgramParameter(this._program, LINK_STATUS)) {
          const info = this._context.getProgramInfoLog(this._program);
          throw "Could not compile WebGL program. \n\n" + info;
        }
      }
    } else {
      if (!this._context.getProgramParameter(this._program, LINK_STATUS)) {
        const info = this._context.getProgramInfoLog(this._program);
        throw "Could not compile WebGL program. \n\n" + info;
      }
    }

    const uniformCount = this._context.getProgramParameter(
      this._program,
      ACTIVE_UNIFORMS
    );

    const textureUniforms = [];
    let textureUnit = -1;

    // get the active uniform locations and populate the uniform object
    for (let i = 0; i < uniformCount; i++) {
      const uniform = this._context.getActiveUniform(this._program, i);
      if (!uniform) continue;
      // only run .getUniformLocation() before the first draw call
      // if the uniform is an array, remove the array index from the name
      const uniformName = uniform.name.includes("[")
        ? uniform.name.substring(0, uniform.name.lastIndexOf("["))
        : uniform.name;
      const location = this._context.getUniformLocation(
        this._program,
        uniform.name
      );
      if (!location) continue;

      if (
        uniform.type === this._context.SAMPLER_2D ||
        uniform.type === this._context.SAMPLER_CUBE ||
        uniform.type === this._context.SAMPLER_3D
      ) {
        textureUnit++;

        const tempTexture = new Texture2D({
          width: 1,
          height: 1,
          type: FLOAT,
          format: RGBA,
          internalFormat: RGBA32f,
          generateMipmaps: false,
        });

        tempTexture.setFromData(new Float32Array([1, 1, 0, 1]), 1, 1);

        textureUniforms.push({
          name: uniformName,
          value: tempTexture,
          type: uniform.type,
          location,
          textureUnit,
        });

        this.activate();
        this._context.uniform1i(location, textureUnit);
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
    this._context.shaderSource(this._vertexShader, vertexShaderSrc);
    this._context.compileShader(this._vertexShader);

    const vertexLogs = this._context.getShaderInfoLog(this._vertexShader);

    if (vertexLogs && vertexLogs.length > 0) {
      throw vertexLogs;
    }

    this._context.shaderSource(this._fragmentShader, fragmentShaderSrc);
    this._context.compileShader(this._fragmentShader);

    const fragmentLogs = this._context.getShaderInfoLog(this._fragmentShader);

    if (fragmentLogs && fragmentLogs.length > 0) {
      throw fragmentLogs;
    }
  }

  setBool(uniform: string, value: number) {
    const location = this.getLocation(uniform);
    if (!location) return;
    this._context.uniform1i(location, +value);
    this._uniforms[uniform] = { location, value };
  }

  setInt(uniform: string, value: number) {
    const location = this.getLocation(uniform);
    if (!location) return;
    this._context.uniform1i(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setFloat(uniform: string, value: number) {
    const location = this.getLocation(uniform);
    if (!location) return;
    this._uniforms[uniform] = { location, value };
    this._context.uniform1f(location, value);
  }

  setVector2(uniform: string, value: vec2) {
    const location = this.getLocation(uniform);
    if (!location) return;
    this._context.uniform2fv(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setVector3(uniform: string, value: vec3) {
    const location = this.getLocation(uniform);
    if (!location) return;
    this._context.uniform3fv(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setVector4(uniform: string, value: vec4) {
    const location = this.getLocation(uniform);
    if (!location) return;
    this._context.uniform4fv(location, value);
    this._uniforms[uniform] = { location, value };
  }

  setMatrix2(uniform: string, value: mat2) {
    const location = this.getLocation(uniform);
    if (!location) return;
    this._context.uniformMatrix2fv(location, false, value);
    this._uniforms[uniform] = { location, value };
  }

  setMatrix3(uniform: string, value: mat3) {
    const location = this.getLocation(uniform);
    if (!location) return;
    this._context.uniformMatrix3fv(location, false, value);
    this._uniforms[uniform] = { location, value };
  }

  setMatrix4(uniform: string, value: mat4) {
    const location = this.getLocation(uniform);
    if (!location) return;
    this._context.uniformMatrix4fv(location, false, value);
    this._uniforms[uniform] = { location, value };
  }

  setTexture(
    uniform: string,
    texture: Texture | TextureCube,
    uniformBlock: string | undefined
  ) {
    const location = this.getLocation(uniform);
    if (!location) return;

    const unit = this._uniforms[uniform].textureUnit;

    texture.currentUnit = unit || 0;
    this._context.uniform1i(location, unit || 0);
    this._uniforms[uniform] = { location, value: texture, textureUnit: unit };
  }

  setBlockUniform(uniformBlock: string, uniform: string, value: UniformType) {
    console.warn("Uniform blocks are not supported in Bolt WebGL mode yet");
    return;
  }

  private getLocation(uniform: string) {
    let location: WebGLUniformLocation | undefined;
    if (this._uniforms[uniform] !== undefined) {
      location = this._uniforms[uniform].location;
    } else {
      location = undefined;
    }
    return location;
  }

  activate() {
    if (this._bolt.activeProgram === this._id) return;
    this._context.useProgram(this._program);
    this._bolt.activeProgram = this._id;
  }

  updateMatrices(node: Node, camera: Camera) {
    this.uniforms["projection"] &&
      this.setMatrix4("projection", camera.projection);

    this.uniforms["view"] && this.setMatrix4("view", camera.view);

    this.uniforms["model"] && this.setMatrix4("model", node.modelMatrix);

    // Generate normal matrix
    mat4.multiply(node.modelViewMatrix, camera.view, node.modelMatrix);

    this.uniforms["modelView"] &&
      this.setMatrix4("modelView", node.modelViewMatrix);

    mat4.invert(node.inverseModelViewMatrix, node.modelViewMatrix);

    this.uniforms["modelViewInverse"] &&
      this.setMatrix4("modelViewInverse", node.inverseModelViewMatrix);

    mat4.transpose(node.normalMatrix, node.inverseModelViewMatrix);

    this.uniforms["normal"] && this.setMatrix4("normal", node.normalMatrix);

    node.updateModelMatrix();
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
  }

  disable() {
    this._context.useProgram(null);
  }

  delete() {
    this._context.deleteProgram(this._program);
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
