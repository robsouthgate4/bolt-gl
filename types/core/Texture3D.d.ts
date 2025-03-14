import Texture from "./Texture";
export default class Texture3D extends Texture {
    private _depth;
    private _data;
    private _image;
    constructor({ imagePath, wrapS, wrapT, width, height, depthAttachment, minFilter, magFilter, format, internalFormat, type, generateMipmaps, flipY, target, depth, anistropy, }: {
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
        depth?: number | undefined;
        anistropy?: number | undefined;
    });
    init(): void;
    resize(width: number, height: number, depth: number): void;
    setFromData(data: ArrayBufferView, width: number, height: number): void;
    load(): Promise<HTMLImageElement>;
    get image(): HTMLImageElement | null;
    get depth(): number;
}
