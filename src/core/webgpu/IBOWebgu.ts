import { TypedArray } from "../Types";
import BoltWGPU from "./BoltWGPU";

export default class IBOWebgpu {
  private _buffer: GPUBuffer;
  private _data: TypedArray;

  constructor(renderer: BoltWGPU, data: TypedArray) {
    if (!renderer.device)
      throw new Error("No device found, please initialise renderer first");

    this._buffer = renderer.device.createBuffer({
      size: (data.byteLength + 3) & ~3,
      usage: GPUBufferUsage.INDEX,
      mappedAtCreation: true,
    });

    const range = this._buffer.getMappedRange();
    const dest = new (data.constructor as new (
      range: ArrayBuffer
    ) => typeof data)(range);

    dest.set(data);
    this._buffer.unmap();
    this._data = data;
  }

  delete() {
    this._buffer.destroy();
  }

  public get count(): number {
    return this._data.length;
  }

  public get buffer(): GPUBuffer {
    return this._buffer;
  }

  public set buffer(value: GPUBuffer) {
    this._buffer = value;
  }
}
