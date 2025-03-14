export default class RBO {
    private _width;
    private _height;
    private _attachment;
    private _internalFormat;
    private _gl;
    private _renderBuffer;
    constructor({ width, height, internalFormat, attachment, }?: {
        width?: number | undefined;
        height?: number | undefined;
        internalFormat?: number | undefined;
        attachment?: number | undefined;
    });
    resize(width: number, height: number): void;
    bind(): void;
    unbind(): void;
    get width(): number;
    set width(value: number);
    get height(): number;
    set height(value: number);
}
