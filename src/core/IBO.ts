import { ELEMENT_ARRAY_BUFFER, STATIC_DRAW } from "./Constants";
import Bolt from "./Bolt";
import { TypedArray } from "./Types";

export default class IBO {
  private _gl!: WebGL2RenderingContext;
  private _count!: number;
  private _indicesBuffer!: WebGLBuffer | null;

  constructor(indices: TypedArray | number, drawType = STATIC_DRAW) {
    this._gl = Bolt.getInstance().getContext();
    if (typeof indices === "number") {
      // you can provide a max allocation instead of data
      this._count = indices;
    } else {
      this._count = indices.length;
    }
    this._indicesBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
    if (typeof indices === "number") {
      // you can provide a max allocation instead of data
      this._gl.bufferData(ELEMENT_ARRAY_BUFFER, indices, drawType);
    } else {
      this._gl.bufferData(ELEMENT_ARRAY_BUFFER, indices, drawType);
    }
  }

  bind() {
    this._gl.bindBuffer(ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
  }

  update(indices: TypedArray, offset = 0) {
    this.bind();
    this._gl.bufferSubData(ELEMENT_ARRAY_BUFFER, offset, indices);
    this.unbind();
    if (indices && indices.length) {
      this._count += indices.length;
    }
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
