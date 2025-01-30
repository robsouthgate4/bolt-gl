import { TypedArray } from "./Types";
export default abstract class Texture {
    protected _texture: WebGLTexture;
    protected _gl: WebGL2RenderingContext;
    protected _depthAttachment?: boolean;
    protected _internalFormat: number;
    protected _width: number;
    protected _height: number;
    protected _format: number;
    protected _type: number;
    protected _flipY: boolean;
    protected _target: number;
    protected _wrapT: number;
    protected _wrapS: number;
    protected _generateMipmaps: boolean;
    protected _minFilter: number;
    protected _magFilter: number;
    protected _anistropy: number;
    protected _imagePath: string;
    protected _pixelType: number;
    protected _name: string;
    protected _currentUnit: number;
    private _id;
    private _bolt;
    constructor({ imagePath, wrapS, wrapT, width, height, depthAttachment, minFilter, magFilter, format, internalFormat, type, generateMipmaps, flipY, target, name, anistropy, }?: {
        imagePath?: string | undefined;
        wrapS?: number | undefined;
        wrapT?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        depthAttachment?: boolean | undefined;
        minFilter?: number | undefined;
        magFilter?: number | undefined;
        format?: number | undefined;
        internalFormat?: number | undefined;
        type?: number | undefined;
        generateMipmaps?: boolean | undefined;
        flipY?: boolean | undefined;
        target?: number | undefined;
        name?: string | undefined;
        anistropy?: number | undefined;
    });
    abstract init(): void;
    abstract resize(width: number, height: number, depth?: number): void;
    abstract setFromData(data: TypedArray, width: number, height: number, depth?: number): void;
    load?(): void;
    bind(index?: number | undefined): void;
    unbind(): void;
    delete(): void;
    isPowerOf2(value: number): boolean;
    protected applySettings(): void;
    private setAnistropy;
    get texture(): WebGLTexture;
    get minFilter(): number;
    set minFilter(value: number);
    get magFilter(): number;
    set magFilter(value: number);
    get wrapT(): number;
    set wrapT(value: number);
    get wrapS(): number;
    set wrapS(value: number);
    set anistropy(value: number);
    get height(): number;
    set height(value: number);
    get width(): number;
    set width(value: number);
    get imagePath(): string;
    get depthAttachment(): boolean | undefined;
    get flipY(): boolean;
    set flipY(value: boolean);
    get generateMipmaps(): boolean;
    get pixelType(): number;
    get target(): number;
    get gl(): WebGL2RenderingContext;
    get format(): number;
    get name(): string;
    set name(value: string);
    get id(): number;
    get currentUnit(): number;
    set currentUnit(value: number);
}
