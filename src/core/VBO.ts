import { TypedArray } from "./Types";
import { ARRAY_BUFFER, STATIC_DRAW } from "./Constants";
import Bolt from "./Bolt";
export default class VBO {
  private _gl: WebGL2RenderingContext;
  private _buffer: WebGLBuffer;

  constructor(data: TypedArray, drawType = STATIC_DRAW) {
    this._gl = Bolt.getInstance().getContext();
    this._buffer = <WebGLBuffer>this._gl.createBuffer();
    this._gl.bindBuffer(ARRAY_BUFFER, this._buffer);

    this._gl.bufferData(ARRAY_BUFFER, data, drawType);
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
