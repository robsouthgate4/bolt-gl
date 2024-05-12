import { mat3, mat4, vec2, vec3, vec4 } from "gl-matrix";

import {
  Bolt,
  FBO,
  Mesh,
  TextureCube,
  Texture2D,
  Viewport,
  DrawSet,
  VBO,
  AttribPointer,
  TypedArray,
  Node,
  NONE,
} from "../../";

export default class DrawState {
  protected _bolt: Bolt;
  protected _fbo: FBO | undefined;
  protected _drawSet: DrawSet | undefined;
  protected _instanceCount!: number;
  protected _mesh?: Mesh;

  protected _viewport: Viewport | undefined;
  private _clearColor:
    | { r: number; g: number; b: number; a: number }
    | undefined;
  private _cullFace = NONE;
  private _node: Node | undefined;

  constructor(bolt: Bolt) {
    this._bolt = bolt;
  }

  setMesh(mesh: Mesh) {
    this._mesh = mesh;

    return this;
  }

  setDrawSet(drawSet: DrawSet) {
    this._drawSet = drawSet;

    return this;
  }

  setNode(node: Node) {
    this._node = node;

    return this;
  }

  uniformFloat(uniform: string, value: number) {
    this._drawSet?.program.activate();
    this._drawSet && this._drawSet.program.setFloat(uniform, value);

    return this;
  }

  uniformVector2(uniform: string, value: vec2) {
    this._drawSet?.program.activate();
    this._drawSet && this._drawSet.program.setVector2(uniform, value);

    return this;
  }

  uniformVector3(uniform: string, value: vec3) {
    this._drawSet?.program.activate();
    this._drawSet && this._drawSet.program.setVector3(uniform, value);

    return this;
  }

  uniformVector4(uniform: string, value: vec4) {
    this._drawSet?.program.activate();
    this._drawSet && this._drawSet.program.setVector4(uniform, value);

    return this;
  }

  uniformMatrix3(uniform: string, value: mat3) {
    this._drawSet?.program.activate();
    this._drawSet && this._drawSet.program.setMatrix3(uniform, value);

    return this;
  }

  uniformMatrix4(uniform: string, value: mat4) {
    this._drawSet?.program.activate();
    this._drawSet && this._drawSet.program.setMatrix4(uniform, value);

    return this;
  }

  uniformInt(uniform: string, value: number) {
    this._drawSet?.program.activate();
    this._drawSet && this._drawSet.program.setInt(uniform, value);

    return this;
  }

  uniformBoolean(uniform: string, value: number) {
    this._drawSet?.program.activate();
    this._drawSet && this._drawSet.program.setBool(uniform, value);

    return this;
  }

  uniformTexture(uniform: string, texture: TextureCube | Texture2D) {
    this._drawSet?.program.activate();
    this._drawSet && this._drawSet.program.setTexture(uniform, texture);

    return this;
  }

  setAttribute(
    buffer: TypedArray,
    size: number,
    layoutID: number | AttribPointer,
    type: number,
    offset: number,
    divisor: number
  ) {
    if (this._drawSet) {
      this._drawSet.mesh.setAttribute(
        buffer,
        size,
        layoutID,
        type,
        offset,
        divisor
      );
    } else {
      console.error("No draw set provided");
    }

    return this;
  }

  setInstanceCount(count: number) {
    this._instanceCount = count;

    return this;
  }

  setVbo(
    vbo: VBO,
    size: number,
    layoutID: number | AttribPointer,
    type: number,
    offset: number,
    divisor: number
  ) {
    if (this._drawSet) {
      this._drawSet.mesh.setVBO(vbo, size, layoutID, type, offset, divisor);
    } else {
      console.error("No draw set provided");
    }

    return this;
  }

  setFbo(fbo: FBO) {
    this._fbo = fbo;

    return this;
  }

  clear(r: number, g: number, b: number, a: number) {
    this._clearColor = { r, g, b, a };

    return this;
  }

  setCullFace(face: number) {
    this._cullFace = face;

    return this;
  }

  setScissor(offsetX: number, offsetY: number, width: number, height: number) {
    this._bolt.scissor(offsetX, offsetY, width, height);

    return this;
  }

  setViewport(offsetX: number, offsetY: number, width: number, height: number) {
    this._viewport = { offsetX, offsetY, width, height };

    return this;
  }

  draw() {
    this._viewport &&
      this._bolt.setViewPort(
        this._viewport.offsetX,
        this._viewport.offsetY,
        this._viewport.width,
        this._viewport.height
      );

    this._clearColor &&
      this._bolt.clear(
        this._clearColor.r,
        this._clearColor.g,
        this._clearColor.b,
        this._clearColor.a
      );

    if (this._cullFace !== NONE) {
      this._bolt.enableCullFace();
      this._bolt.cullFace(this._cullFace);
    } else {
      this._bolt.disableCullFace();
    }

    if (this._drawSet !== undefined) {
      this._bolt.draw(this._drawSet);
    } else if (this._node !== undefined) {
      this._bolt.draw(this._node);
    }

    return this;
  }

  public get drawSet(): DrawSet | undefined {
    return this._drawSet;
  }
  public set drawSet(value: DrawSet | undefined) {
    this._drawSet = value;
  }
}
