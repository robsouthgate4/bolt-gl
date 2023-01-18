import { Bolt, FLOAT, POINTS, VAO, VBO, AttribPointer, Program } from "../../";

export interface VBOSwapDefinition {
  vbo1: VBO;
  vbo2: VBO;
  attributeLocation: number | AttribPointer;
  size: number;
  requiresSwap: boolean;
}

export default class TransformFeedback {
  private _gl: WebGL2RenderingContext;
  private _vao1: VAO;
  private _vao2: VAO;
  private _vboSwapDefinitions: VBOSwapDefinition[] = [];
  private _tf1!: WebGLTransformFeedback;
  private _tf2!: WebGLTransformFeedback;

  private _current!: { updateVAO: VAO; tf: WebGLTransformFeedback };
  private _next!: { updateVAO: VAO; tf: WebGLTransformFeedback };
  private _count: number;

  constructor({ bolt, count }: { bolt: Bolt; count: number }) {
    this._gl = bolt.getContext();
    this._vao1 = new VAO();
    this._vao2 = new VAO();
    this._count = count;
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

    buffers.forEach((buffer, i) => {
      this._gl.bindBufferBase(this._gl.TRANSFORM_FEEDBACK_BUFFER, i, buffer);
    });

    return tf!;
  }

  private _initTransformFeedback() {
    this._tf1 = this._createTransformFeedback(
      this._vboSwapDefinitions.map((vboDefinition) => vboDefinition.vbo1.buffer)
    );
    this._tf2 = this._createTransformFeedback(
      this._vboSwapDefinitions.map((vboDefinition) => vboDefinition.vbo2.buffer)
    );

    // create current / next ojects ready for swap
    this._current = {
      updateVAO: this._vao1,
      tf: this._tf2,
    };

    this._next = {
      updateVAO: this._vao2,
      tf: this._tf1,
    };
  }

  private _linkAttribs(vboDefinitions: VBOSwapDefinition[]) {
    this._vao1.bind();
    for (let i = vboDefinitions.length - 1; i >= 0; i--) {
      const vboDefinition = vboDefinitions[i];

      const { vbo1, attributeLocation, size } = vboDefinition;
      this._vao1.linkAttrib(
        vbo1,
        attributeLocation,
        size,
        FLOAT,
        size * Float32Array.BYTES_PER_ELEMENT,
        0
      );
    }

    this._vao1.unbind();

    this._vao2.bind();
    for (let i = vboDefinitions.length - 1; i >= 0; i--) {
      const vboDefinition = vboDefinitions[i];

      const { vbo2, attributeLocation, size } = vboDefinition;
      this._vao2.linkAttrib(
        vbo2,
        attributeLocation,
        size,
        FLOAT,
        size * Float32Array.BYTES_PER_ELEMENT,
        0
      );
    }

    this._vao2.unbind();
  }

  private _swapBuffers() {
    const temp = this._current;
    this._current = this._next;
    this._next = temp;
  }

  compute(program?: Program) {
    if (!program) return;
    program.activate();
    this._gl.bindVertexArray(this._current.updateVAO.arrayObject);
    this._gl.enable(this._gl.RASTERIZER_DISCARD);

    this._gl.bindTransformFeedback(
      this._gl.TRANSFORM_FEEDBACK,
      this._current.tf
    );
    this._gl.beginTransformFeedback(POINTS);
    this._gl.drawArrays(POINTS, 0, this._count);
    this._gl.endTransformFeedback();
    this._gl.bindTransformFeedback(this._gl.TRANSFORM_FEEDBACK, null);

    this._gl.bindVertexArray(null);
    this._gl.disable(this._gl.RASTERIZER_DISCARD);

    this._swapBuffers();
  }
}
