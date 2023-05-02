import {
  AttribPointer,
  GeometryBuffers,
  MeshParams,
  Renderer,
  TypedArray,
} from "./Types";
import Program from "./Program";
import Node from "./Node";
import GeometryRendererWebgl from "./webgl/GeometryRendererWebgl";
import GeometryRendererWebgpu from "./webgpu/GeometryRendererWebgpu";
import { FLOAT } from "./webgl/Constants";
import Mediator from "./Mediator";

export default class Mesh {
  private _isSkinMesh = false;
  private _geometryRenderer: GeometryRendererWebgl | GeometryRendererWebgpu;

  constructor(
    renderer: Renderer,
    geometry?: GeometryBuffers,
    params?: MeshParams
  ) {
    const mediator = Mediator.getInstance();
    this._geometryRenderer = mediator.geometryRenderer(
      renderer,
      geometry,
      params
    );
  }

  setDrawType(type: number) {
    this._geometryRenderer.setDrawType(type);
    return this;
  }

  setAttribute(
    buffer: TypedArray,
    size: number,
    layoutID: number | AttribPointer,
    type = FLOAT,
    offset = 0,
    divisor: number | undefined = undefined
  ) {
    this._geometryRenderer.setAttribute(
      buffer,
      size,
      layoutID,
      type,
      offset,
      divisor
    );
  }

  /**
   * Render bound mesh
   * @param  {Program} program
   */
  draw(program: Program, node?: Node) {
    this._geometryRenderer.draw(program, node);
  }

  public get isSkinMesh() {
    return this._isSkinMesh;
  }

  public set isSkinMesh(value) {
    this._isSkinMesh = value;
  }

  public get geometryRenderer():
    | GeometryRendererWebgl
    | GeometryRendererWebgpu {
    return this._geometryRenderer;
  }
}
