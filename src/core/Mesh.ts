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
import DrawSet from "./DrawSet";

let ID = -1;

export default class Mesh {
  private _isSkinMesh = false;
  private _geometryRenderer: GeometryRendererWebgl | GeometryRendererWebgpu;
  private _id: number;
  private _renderer: Renderer;

  constructor(
    renderer: Renderer,
    geometry?: GeometryBuffers,
    params?: MeshParams
  ) {
    ID++;
    this._id = ID;
    const mediator = Mediator.getInstance();
    this._geometryRenderer = mediator.geometryRenderer(
      renderer,
      geometry,
      params
    );
    this._renderer = renderer;
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

  public get isSkinMesh() {
    return this._isSkinMesh;
  }

  public set isSkinMesh(value) {
    this._isSkinMesh = value;
  }

  public get id() {
    return this._id;
  }

  public get geometryRenderer():
    | GeometryRendererWebgl
    | GeometryRendererWebgpu {
    return this._geometryRenderer;
  }

  public get renderer(): Renderer {
    return this._renderer;
  }

  draw(program: Program, node?: Node, passEncoder?: GPURenderPassEncoder) {
    if (this._geometryRenderer instanceof GeometryRendererWebgpu) {
      this._geometryRenderer.draw(program, node! as DrawSet, passEncoder!);
    } else {
      this._geometryRenderer.draw(program, node);
    }
  }
}
