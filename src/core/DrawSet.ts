import Program from "./Program";
import Node from "./Node";
import Mesh from "./Mesh";
import GeometryRendererWebgpu from "./webgpu/GeometryRendererWebgpu";
import { mat4 } from "gl-matrix";
import ProgramWebgpu from "./webgpu/ProgramWebgpu";

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

    if (program.programRenderer instanceof ProgramWebgpu) {
      const geometryRenderer = mesh.geometryRenderer as GeometryRendererWebgpu;
      const programWebgpu = program.programRenderer as ProgramWebgpu;
      this.createpipeline(geometryRenderer, programWebgpu);
    }
  }

  private createpipeline(
    geometryRenderer: GeometryRendererWebgpu,
    program: ProgramWebgpu
  ) {
    const buffers = geometryRenderer.extraBuffers;
    program.createPipeline(buffers);
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
