import Texture from "./Texture";
import { TypedArray } from "./Types";
export default class Texture2D extends Texture {
    private _image;
    private _data;
    constructor({ imagePath, wrapS, wrapT, width, height, depthAttachment, minFilter, magFilter, format, internalFormat, type, generateMipmaps, flipY, target, anistropy, }?: {
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
        anistropy?: number | undefined;
    });
    init(): void;
    resize(width: number, height: number): void;
    setFromData(data: TypedArray, width: number, height: number): void;
    load(): Promise<unknown>;
    get image(): HTMLImageElement | undefined;
}
