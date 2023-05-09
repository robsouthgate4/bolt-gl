import { TypedArray } from "../Types";
import BoltWGPU from "./BoltWGPU";

export default class ComputeBuffer {
  private _buffer!: GPUBuffer;
  private _data!: TypedArray;
  constructor(renderer: BoltWGPU, data: TypedArray) {
    const device = renderer.device;

    if (!device) {
      console.log("No device found");
      return;
    }

    this._buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
      mappedAtCreation: true,
    });

    const range = this._buffer.getMappedRange();
    this._data = new (data.constructor as new (
      range: ArrayBuffer
    ) => typeof data)(range);

    this._data.set(data);
    this._buffer.unmap();

    console.log(this._data);
  }
}
