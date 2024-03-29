import { mat4 } from "gl-matrix";

import { ARRAY_BUFFER, STATIC_DRAW } from "./Constants";
import Bolt from "./Bolt";

export default class VBOInstancedWebgl {
  private _gl: WebGL2RenderingContext;
  private _buffer: WebGLBuffer;

  constructor(data: mat4[], drawType = STATIC_DRAW) {
    this._gl = Bolt.getInstance().getContext();
    this._buffer = <WebGLBuffer>this._gl.createBuffer();
    this._gl.bindBuffer(ARRAY_BUFFER, this._buffer);

    const mergedData = this.bufferjoin(data);

    this._gl.bufferData(ARRAY_BUFFER, mergedData, drawType);
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
}
