import { TextureSettingsWebGPU, TypedArray } from "../Types";
import BoltWGPU from "./BoltWGPU";

export default class TextureWebgpu {
  private texture: GPUTexture;
  private _bolt!: BoltWGPU;
  constructor(bolt: BoltWGPU, settings: TextureSettingsWebGPU) {
    const { device, width, height, format, usage } = settings;
    this.texture = device.createTexture({
      size: { width, height },
      format,
      usage,
    });
  }

  async setFromImage(image: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context from canvas");
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    await this.setFromData(imageData.data);
  }

  async load(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load texture from ${url}`);
    const blob = await response.blob();
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    await new Promise<void>((resolve) => {
      image.onload = () => {
        URL.revokeObjectURL(image.src);
        resolve();
      };
    });
    await this.setFromImage(image);
  }

  setFromData(data: TypedArray) {
    const { device } = this._bolt;
    if (!device) throw new Error("Device not initialized");
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.COPY_SRC,
      mappedAtCreation: true,
    });
    const range = buffer.getMappedRange();
    new (data.constructor as new (range: ArrayBuffer) => typeof data)(range);
    buffer.unmap();
    const commandEncoder = device.createCommandEncoder();
    commandEncoder.copyBufferToTexture(
      { buffer },
      { texture: this.texture },
      { width: this.texture.width, height: this.texture.height }
    );
    device.queue.submit([commandEncoder.finish()]);
  }
}
