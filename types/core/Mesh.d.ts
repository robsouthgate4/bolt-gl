import VBO from "./VBO";
import VAO from "./VAO";
import { AttribPointer, BoxBounds, Face, GeometryBuffers, MeshParams, TypedArray } from "./Types";
import Program from "./Program";
import Node from "./Node";
export default class Mesh {
    private _gl;
    private _defaultBuffers;
    private _extraBuffers;
    private _faces;
    private _instanced?;
    private _vao;
    private _ibo;
    private _drawType;
    private _bounds;
    private _isSkinMesh;
    private _lineWidth?;
    private _depthWrite;
    private _depthTest;
    constructor(geometry?: GeometryBuffers, params?: MeshParams);
    setDrawType(type: number): this;
    setLineWidth(width: number): this;
    setAttribute(buffer: TypedArray, size: number, layoutID: number | AttribPointer, type?: number, offset?: number, divisor?: number | undefined, drawType?: number): void;
    setVBO(vbo: VBO, size: number, layoutID: number | AttribPointer, type?: number, offset?: number, divisor?: number | undefined): void;
    private linkDefaultBuffers;
    calculateBoxBounds(): void;
    /**
     * Delete vao and associated buffers
     */
    delete(): void;
    /**
     * Render bound mesh
     * @param  {Program} program
     */
    draw(program: Program, node?: Node): void;
    get drawType(): number;
    set drawType(value: number);
    get bounds(): BoxBounds;
    set bounds(value: BoxBounds);
    get indices(): number[] | Uint16Array | Int16Array | undefined;
    set indices_(value: number[] | Uint16Array | undefined);
    get positions(): number[] | Float32Array | undefined;
    set positions(value: number[] | Float32Array | undefined);
    get normals(): number[] | Float32Array | undefined;
    set normals(value: number[] | Float32Array | undefined);
    get uvs(): number[] | Float32Array | undefined;
    set uvs(value: number[] | Float32Array | undefined);
    get defaultBuffers(): GeometryBuffers;
    set defaultBuffers(value: GeometryBuffers);
    get extraBuffers(): Map<string, TypedArray>;
    get faces(): Face[];
    get isSkinMesh(): boolean;
    set isSkinMesh(value: boolean);
    get vao(): VAO;
    set vao(value: VAO);
    set depthWrite(value: boolean);
    get depthWrite(): boolean;
    get depthTest(): boolean;
    set depthTest(value: boolean);
    protected get lineWidth(): number | undefined;
    get instanced(): boolean;
    set instanced(value: boolean);
}
