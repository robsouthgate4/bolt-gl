import { TypedArray } from "./Types";
export default class VBO {
    private _gl;
    private _buffer;
    private _drawType;
    private _id;
    private _data;
    constructor(data: TypedArray | number, drawType?: number, id?: string);
    bind(): void;
    unbind(): void;
    update(data: TypedArray, offset?: number): void;
    getData(data: TypedArray, offset?: number): TypedArray;
    delete(): void;
    get data(): TypedArray;
    get buffer(): WebGLBuffer;
    set buffer(value: WebGLBuffer);
    get drawType(): number;
    get id(): string;
}
