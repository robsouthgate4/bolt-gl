import Program from "./Program";
import Node from "./Node";
import Mesh from "./Mesh";

export default class DrawSet extends Node {
  private _program: Program;
  private _mesh: Mesh;

  /**
   * Pairs a mesh with a program to be rendered
   * @param  {Mesh} mesh
   * @param  {Program} program
   */
  constructor(mesh: Mesh, program: Program) {
    super();
    this._mesh = mesh;
    this._program = program;
  }

  public get program(): Program {
    return this._program;
  }

  public set program(value: Program) {
    this._program = value;
  }

  public get mesh(): Mesh {
    return this._mesh;
  }

  public set mesh(value: Mesh) {
    this._mesh = value;
  }
}
