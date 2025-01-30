import VBOInstanced from "./VBOInstanced";
import VBO from "./VBO";
import { AttribPointer } from "./Types";
export default class VAO {
    private _arrayObject;
    private _gl;
    private _vbos;
    constructor();
    /**
     * Enable vetex attribute array, either with layout id or attribute name
     * @param  {VBO|VBOInstanced} vbo
     * @param  {number|AttribPointer} layoutID as either integer or attribute name ( requires program to be passed )
     * @param  {number} numComponents
     * @param  {number} type
     * @param  {number} stride=0
     * @param  {number} offset=0
     */
    linkAttrib(vbo: VBO | VBOInstanced, layoutID: number | AttribPointer, numComponents: number, type: number, stride?: number, offset?: number, divisor?: number | undefined): void;
    _isAttribPointer(arg: AttribPointer): arg is AttribPointer;
    bind(): void;
    unbind(): void;
    delete(): void;
    get arrayObject(): WebGLVertexArrayObject;
    set arrayObject(value: WebGLVertexArrayObject);
    getVBO(id: string): VBO | VBOInstanced | undefined;
}
