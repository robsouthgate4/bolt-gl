import BoltWGPU from "./BoltWGPU";

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
    paramaters: {
      shaderSrc: string;
      bufferDescriptors: BufferDescriptor[];
    }
  ) {
    this.device = renderer.device;

    if (!this.device) {
      return;
    }

    this.shaderSrc = paramaters.shaderSrc;
    this.module = this.device.createShaderModule({ code: this.shaderSrc });

    this.createPipeline("main");
  }

  public createPipeline(kernelName: string): void {
    if (!this.device) return;

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "storage",
          },
        },
      ],
    });

    const BUFFER_SIZE = 1000 * 4;

    this.output = this.device.createBuffer({
      size: BUFFER_SIZE,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    this.stagingBuffer = this.device.createBuffer({
      size: BUFFER_SIZE,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 1,
          resource: {
            buffer: this.output,
          },
        },
      ],
    });

    this.pipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      }),
      compute: {
        module: this.module,
        entryPoint: kernelName,
      },
    });
  }

  public async dispatch(workGroupSize: number) {
    if (!this.pipeline || !this.device) {
      throw new Error("Pipeline not created");
    }

    const BUFFER_SIZE = 1000 * 4;

    const encoder = this.device.createCommandEncoder();
    const passEncoder = encoder.beginComputePass();
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.bindGroup);

    passEncoder.dispatchWorkgroups(Math.ceil(BUFFER_SIZE / workGroupSize));
    passEncoder.end();
    this.device.queue.submit([encoder.finish()]);

    await this.stagingBuffer.mapAsync(GPUMapMode.READ, 0, BUFFER_SIZE);

    const arrayBuffer = this.stagingBuffer.getMappedRange(0, BUFFER_SIZE);
    const data = arrayBuffer.slice(0);
    this.stagingBuffer.unmap();
    console.log(new Float32Array(data));
  }
}
