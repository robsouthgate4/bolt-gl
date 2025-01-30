import { mat2, mat3, mat4, vec2, vec3, vec4 } from "gl-matrix";
import { BlendOptions, TextureObject, UniformObject } from "./Types";
import TextureCube from "./TextureCube";
import Texture from "./Texture";
export default class Program {
    private _vertexShader;
    private _fragmentShader;
    private _program;
    private _textures;
    private _uniforms;
    private _vertexShaderSource;
    private _fragmentShaderSource;
    private _name;
    private _transparent;
    private _blendFunction;
    private _cullFace?;
    private _id;
    private _bolt;
    protected _gl: WebGL2RenderingContext;
    constructor(vertexShaderSrc: string, fragmentShaderSrc: string, parameters?: {
        transformFeedbackVaryings: string[];
    });
    private linkUniforms;
    private linkShaders;
    setBool(uniform: string, value: number): void;
    setInt(uniform: string, value: number): void;
    setFloat(uniform: string, value: number): void;
    setVector2(uniform: string, value: vec2): void;
    setVector3(uniform: string, value: vec3): void;
    setVector4(uniform: string, value: vec4): void;
    setMatrix2(uniform: string, value: mat2): void;
    setMatrix3(uniform: string, value: mat3): void;
    setMatrix4(uniform: string, value: mat4): void;
    setTexture(uniform: string, texture: Texture | TextureCube): void;
    private getLocation;
    activate(): void;
    use(): void;
    disable(): void;
    delete(): void;
    get name(): string;
    set name(value: string);
    get vertexShader(): WebGLShader;
    set vertexShader(value: WebGLShader);
    get fragmentShader(): WebGLShader;
    set fragmentShader(value: WebGLShader);
    get program(): WebGLProgram;
    get textures(): TextureObject[];
    set textures(value: TextureObject[]);
    get uniforms(): UniformObject;
    get vertexShaderSource(): string;
    set vertexShaderSource(value: string);
    get fragmentShaderSource(): string;
    set fragmentShaderSource(value: string);
    get transparent(): boolean;
    set transparent(value: boolean);
    get blendFunction(): BlendOptions;
    set blendFunction(value: BlendOptions);
    get cullFace(): number;
    set cullFace(value: number);
    get id(): number;
}
