import Texture from "./Texture";
interface FileParams {
    [key: string]: string;
}
/**
 * Cube textures, extends from core Texture class
 */
export default class TextureCube extends Texture {
    private _files;
    constructor({ imagePath, files, wrapS, wrapT, width, height, depthAttachment, format, minFilter, magFilter, internalFormat, generateMipmaps, type, flipY, }?: {
        imagePath?: string | undefined;
        files?: {
            px: string;
            nx: string;
            py: string;
            ny: string;
            pz: string;
            nz: string;
        } | undefined;
        wrapS?: number | undefined;
        wrapT?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        depthAttachment?: boolean | undefined;
        format?: number | undefined;
        minFilter?: number | undefined;
        magFilter?: number | undefined;
        internalFormat?: number | undefined;
        generateMipmaps?: boolean | undefined;
        type?: number | undefined;
        flipY?: boolean | undefined;
    });
    init(): void;
    load(): Promise<void>;
    resize(width: number, height: number): void;
    setFromData(data: Float32Array | Uint16Array | Uint8Array, width: number, height: number): void;
    get files(): FileParams;
}
export {};
