import { ELEMENT_ARRAY_BUFFER, STATIC_DRAW } from "./Constants";
import Bolt from "./Bolt";

export default class IBO {
  private _gl!: WebGL2RenderingContext;
  private _count!: number;
  private _indicesBuffer!: WebGLBuffer | null;

  constructor(indices: Uint32Array | Uint16Array | Int16Array | Uint8Array) {
    this._gl = Bolt.getInstance().getContext();
    this._count = indices.length;
    this._indicesBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(ELEMENT_ARRAY_BUFFER, this._indicesBuffer);

    this._gl.bufferData(ELEMENT_ARRAY_BUFFER, indices, STATIC_DRAW);
  }

  bind() {
    this._gl.bindBuffer(ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
  }

  unbind() {
    this._gl.bindBuffer(ELEMENT_ARRAY_BUFFER, null);
  }

  delete() {
    this._gl.deleteBuffer(this.indicesBuffer);
  }

  public get indicesBuffer(): WebGLBuffer | null {
    return this._indicesBuffer;
  }
  public set indicesBuffer(value: WebGLBuffer | null) {
    this._indicesBuffer = value;
  }
  public get count(): number {
    return this._count;
  }
  public set count(value: number) {
    this._count = value;
  }
}
