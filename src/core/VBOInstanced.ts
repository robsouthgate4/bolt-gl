import { mat4 } from "gl-matrix";

import { ARRAY_BUFFER, STATIC_DRAW } from "./Constants";
import Bolt from "./Bolt";
import { TypedArray } from "./Types";

export default class VBOInstanced {
  private _gl: WebGL2RenderingContext;
  private _buffer: WebGLBuffer;
  private _drawType: number;
  private _id: string;

  constructor(data: mat4[], drawType = STATIC_DRAW, id = "") {
    this._gl = Bolt.getInstance().getContext();
    this._buffer = <WebGLBuffer>this._gl.createBuffer();
    this._gl.bindBuffer(ARRAY_BUFFER, this._buffer);

    const mergedData = this.bufferjoin(data);

    this._gl.bufferData(ARRAY_BUFFER, mergedData, drawType);

    this._drawType = drawType;
    this._id = id;
  }

  private sum(a: number[]) {
    return a.reduce(function (a, b) {
      return a + b;
    }, 0);
  }

  bufferjoin(bufs: mat4[]) {
    const lens = bufs.map((a) => a.length);

    const aout = new Float32Array(this.sum(lens));
    for (let i = 0; i < bufs.length; ++i) {
      const start = this.sum(lens.slice(0, i));
      aout.set(bufs[i], start);
    }

    return aout;
  }

  bind() {
    this._gl.bindBuffer(ARRAY_BUFFER, this._buffer);
  }

  update(data: TypedArray, offset = 0) {
    this._gl.bufferSubData(ARRAY_BUFFER, offset, data);
  }

  unbind() {
    this._gl.bindBuffer(ARRAY_BUFFER, null);
  }

  delete() {
    this._gl.deleteBuffer(this._buffer);
  }

  public get buffer(): WebGLBuffer {
    return this._buffer;
  }

  public set buffer(value: WebGLBuffer) {
    this._buffer = value;
  }

  public get drawType(): number {
    return this._drawType;
  }

  public get id(): string {
    return this._id;
  }
}
