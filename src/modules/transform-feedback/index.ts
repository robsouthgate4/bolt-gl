import { Bolt, FLOAT, POINTS, VAO, VBO, AttribPointer, Program } from "../../";

export interface VBOSwapDefinition {
  read: VBO;
  write: VBO;
  attributeLocation: number | AttribPointer;
  size: number;
  requiresSwap: boolean;
  stride?: number;
  offset?: number;
}

export default class TransformFeedback {
  private _gl: WebGL2RenderingContext;
  private _readVAO: VAO;
  private _writeVAO: VAO;
  private _vboSwapDefinitions: VBOSwapDefinition[] = [];
  private _tf1!: WebGLTransformFeedback;
  private _tf2!: WebGLTransformFeedback;
  private _boundBuffers = new Array<[WebGLBuffer, number]>();
  private _read!: { updateVAO: VAO; tf: WebGLTransformFeedback };
  private _write!: { updateVAO: VAO; tf: WebGLTransformFeedback };
  private _count: number;
  private _logBufferContents = false;
  private _logAttributeLocation = 0;
  private _stride = 0;

  constructor({
    bolt,
    count,
    stride,
  }: {
    bolt: Bolt;
    count: number;
    stride: number;
  }) {
    this._gl = bolt.getContext();
    this._readVAO = new VAO();
    this._writeVAO = new VAO();
    this._count = count;
    this._stride = stride;
  }

  /**
   * bind vbos that require swappoing at run time
   * @param  {VBOSwapDefinition[]} vboDefinitions - array of VBO definitions
   */
  bindVAOS(vboDefinitions: VBOSwapDefinition[]) {
    this._linkAttribs(vboDefinitions);

    this._vboSwapDefinitions = vboDefinitions.filter(
      (vboDefinition) => vboDefinition.requiresSwap
    );

    this._initTransformFeedback();
  }

  private _createTransformFeedback(
    buffers: WebGLBuffer[]
  ): WebGLTransformFeedback {
    const tf = this._gl.createTransformFeedback();
    this._gl.bindTransformFeedback(this._gl.TRANSFORM_FEEDBACK, tf);

    const currentBuffers = new Set<WebGLBuffer>();

    buffers.forEach((buffer, i) => {
      if (currentBuffers.has(buffer)) return;
      this._gl.bindBufferBase(this._gl.TRANSFORM_FEEDBACK_BUFFER, i, buffer);
      currentBuffers.add(buffer);

      this._boundBuffers.push([buffer, i]);
    });

    return tf!;
  }

  private _initTransformFeedback() {
    this._tf1 = this._createTransformFeedback(
      this._vboSwapDefinitions.map((vboDefinition) => vboDefinition.read.buffer)
    );
    this._tf2 = this._createTransformFeedback(
      this._vboSwapDefinitions.map(
        (vboDefinition) => vboDefinition.write.buffer
      )
    );

    // create current / next ojects ready for swap
    this._read = {
      updateVAO: this._readVAO,
      tf: this._tf2,
    };

    this._write = {
      updateVAO: this._writeVAO,
      tf: this._tf1,
    };
  }

  private _linkAttribs(vboDefinitions: VBOSwapDefinition[]) {
    for (let i = vboDefinitions.length - 1; i >= 0; i--) {
      this._readVAO.bind();
      const vboDefinition = vboDefinitions[i];

      const { read, attributeLocation, size, stride, offset } = vboDefinition;
      this._readVAO.linkAttrib(
        read,
        attributeLocation,
        size,
        FLOAT,
        !stride ? size * Float32Array.BYTES_PER_ELEMENT : stride,
        !offset ? 0 : offset
      );
    }

    this._readVAO.unbind();

    this._writeVAO.bind();
    for (let i = vboDefinitions.length - 1; i >= 0; i--) {
      const vboDefinition = vboDefinitions[i];

      const { write, attributeLocation, size, stride, offset } = vboDefinition;
      this._writeVAO.linkAttrib(
        write,
        attributeLocation,
        size,
        FLOAT,
        !stride ? size * Float32Array.BYTES_PER_ELEMENT : stride,
        !offset ? 0 : offset
      );
    }

    this._writeVAO.unbind();

    this._gl.bindBufferBase(this._gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
  }

  private _swapBuffers() {
    const temp = this._read;
    this._read = this._write;
    this._write = temp;
  }

  public getReadVBO(location: number) {
    return this._vboSwapDefinitions.find(
      (vboDefinition) => vboDefinition.attributeLocation === location
    )?.read;
  }

  public getWriteVBO(location: number) {
    return this._vboSwapDefinitions.find(
      (vboDefinition) => vboDefinition.attributeLocation === location
    )?.write;
  }

  public compute(program?: Program) {
    if (!program) return;
    program.activate();

    this._gl.bindVertexArray(this._read.updateVAO.arrayObject);
    this._gl.enable(this._gl.RASTERIZER_DISCARD);
    this._gl.bindTransformFeedback(this._gl.TRANSFORM_FEEDBACK, this._read.tf);

    this._gl.beginTransformFeedback(POINTS);
    this._gl.drawArrays(POINTS, 0, this._count);

    this._gl.endTransformFeedback();
    this._gl.bindTransformFeedback(this._gl.TRANSFORM_FEEDBACK, null);

    this._gl.bindVertexArray(null);
    this._gl.disable(this._gl.RASTERIZER_DISCARD);

    if (this._logBufferContents) {
      const getBufferContents = () => {
        const sync = this._gl.fenceSync(this._gl.SYNC_GPU_COMMANDS_COMPLETE, 0);

        const checkStatus = () => {
          const status = this._gl.clientWaitSync(
            sync!,
            this._gl.SYNC_FLUSH_COMMANDS_BIT,
            0
          );
          if (status === this._gl.TIMEOUT_EXPIRED) {
            console.log("GPU still busy");
            setTimeout(checkStatus);
          } else if (status === this._gl.WAIT_FAILED) {
            console.error("Something went wrong");
          } else {
            const view = new Float32Array(this._count * this._stride);

            this._gl.bindBuffer(
              this._gl.TRANSFORM_FEEDBACK_BUFFER,
              this.getReadVBO(this._logAttributeLocation)?.buffer ?? null
            );

            this._gl.getBufferSubData(
              this._gl.TRANSFORM_FEEDBACK_BUFFER,
              0,
              view
            );

            console.log(view);
          }
        };
        setTimeout(checkStatus);
      };

      getBufferContents();
    }

    this._swapBuffers();
  }

  public logBufferContents(value: boolean, attributeLocation: number) {
    this._logBufferContents = value;
    this._logAttributeLocation = attributeLocation;
  }

  public destroy() {
    this._gl.deleteTransformFeedback(this._tf1);
    this._gl.deleteTransformFeedback(this._tf2);
    this._readVAO.delete();
    this._writeVAO.delete();
  }
}
