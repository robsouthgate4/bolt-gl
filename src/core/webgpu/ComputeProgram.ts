import { TypedArray } from "bolt-wgpu";
import BoltWGPU from "./BoltWGPU";
import ComputeBuffer from "./ComputeBuffer";

interface BufferDescriptor {
  buffer: GPUBuffer;
  offset: number;
  size: number;
}

export default class ComputeProgram {
  private readonly device?: GPUDevice;
  private readonly shaderSrc!: string;
  private readonly module!: GPUShaderModule;
  private pipeline: GPUComputePipeline | null = null;
  private stagingBuffer!: GPUBuffer;
  private output!: GPUBuffer;
  private bindGroup!: GPUBindGroup;

  constructor(
    renderer: BoltWGPU,
    parameters: {
      shaderSrc: string;
      bufferDescriptors: BufferDescriptor[];
    }
  ) {
    if (!renderer.device) throw new Error("No device found");
    this.device = renderer.device;
    this.shaderSrc = parameters.shaderSrc;
    this.module = this.device.createShaderModule({ code: this.shaderSrc });
    this.createPipeline("CSMain");
    this.createStagingBuffer();
    this.createOutputBuffer();
    this.createBindGroup(parameters.bufferDescriptors);
  }

  private createPipeline(kernelName: string): void {
    return;
  }

  private createStagingBuffer(): void {
    return;
  }

  private createOutputBuffer(): void {
    return;
  }

  private createBindGroup(bufferDescriptors: BufferDescriptor[]): void {
    return;
  }

  public setBuffers(index: number, buffer: ComputeBuffer): void {
    return;
  }

  public async dispatch(workGroupSize: number): Promise<void> {
    return;
  }
}
