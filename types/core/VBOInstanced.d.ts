import { mat4 } from "gl-matrix";
import { TypedArray } from "./Types";
export default class VBOInstanced {
    private _gl;
    private _buffer;
    private _drawType;
    private _id;
    constructor(data: mat4[], drawType?: number, id?: string);
    private sum;
    bufferjoin(bufs: mat4[]): Float32Array;
    bind(): void;
    update(data: TypedArray, offset?: number): void;
    unbind(): void;
    delete(): void;
    get buffer(): WebGLBuffer;
    set buffer(value: WebGLBuffer);
    get drawType(): number;
    get id(): string;
}
