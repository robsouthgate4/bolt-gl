export default class IBO {
    private _gl;
    private _count;
    private _indicesBuffer;
    constructor(indices: Uint32Array | Uint16Array | Int16Array | Uint8Array);
    bind(): void;
    unbind(): void;
    delete(): void;
    get indicesBuffer(): WebGLBuffer | null;
    set indicesBuffer(value: WebGLBuffer | null);
    get count(): number;
    set count(value: number);
}
