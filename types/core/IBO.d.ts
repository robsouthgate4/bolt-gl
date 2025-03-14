import { TypedArray } from "./Types";
export default class IBO {
    private _gl;
    private _count;
    private _indicesBuffer;
    constructor(indices: TypedArray | number, drawType?: number);
    bind(): void;
    update(indices: TypedArray, offset?: number): void;
    unbind(): void;
    delete(): void;
    get indicesBuffer(): WebGLBuffer | null;
    set indicesBuffer(value: WebGLBuffer | null);
    get count(): number;
    set count(value: number);
}
