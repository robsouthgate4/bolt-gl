import Texture from "./Texture";
import { TypedArray } from "./Types";
export default class Texture2DArray extends Texture {
    private _depth;
    private _data;
    constructor({ wrapS, wrapT, width, height, depth, depthAttachment, minFilter, magFilter, format, internalFormat, type, generateMipmaps, flipY, target, anistropy, }?: {
        wrapS?: number | undefined;
        wrapT?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        depth?: number | undefined;
        depthAttachment?: boolean | undefined;
        minFilter?: number | undefined;
        magFilter?: number | undefined;
        format?: number | undefined;
        internalFormat?: number | undefined;
        type?: number | undefined;
        generateMipmaps?: boolean | undefined;
        flipY?: boolean | undefined;
        target?: number | undefined;
        anistropy?: number | undefined;
    });
    init(): void;
    resize(width: number, height: number, depth?: number): void;
    setFromData(data: TypedArray, width: number, height: number, depth?: number): void;
    forceGenerateMipmaps(): void;
    get depth(): number;
    set depth(value: number);
    get data(): TypedArray | undefined;
}
