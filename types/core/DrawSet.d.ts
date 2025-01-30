import Program from "./Program";
import Node from "./Node";
import Mesh from "./Mesh";
export default class DrawSet extends Node {
    private _program;
    private _mesh;
    /**
     * Pairs a mesh with a program to be rendered
     * @param  {Mesh} mesh
     * @param  {Program} program
     */
    constructor(mesh: Mesh, program: Program);
    get program(): Program;
    set program(value: Program);
    get mesh(): Mesh;
    set mesh(value: Mesh);
}
