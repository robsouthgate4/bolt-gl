import { TypedArray } from "../Types";
import BoltWGPU from "./BoltWGPU";

export default class VBOWebgpu {
  private _buffer: GPUBuffer;
  private _data: TypedArray;

  constructor(renderer: BoltWGPU, data: TypedArray) {
    if (!renderer.device)
      throw new Error("No device found, please initialise renderer first");
    this._buffer = renderer.device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });

    const range = this._buffer.getMappedRange();
    const dest = new (data.constructor as new (
      range: ArrayBuffer
    ) => typeof data)(range);

    dest.set(data);
    this._data = data;
    this._buffer.unmap();
  }

  updateData(data: TypedArray) {
    this._data = data;
  }

  delete() {
    this._buffer.destroy();
  }

  public get buffer(): GPUBuffer {
    return this._buffer;
  }

  public set buffer(value: GPUBuffer) {
    this._buffer = value;
  }
}
