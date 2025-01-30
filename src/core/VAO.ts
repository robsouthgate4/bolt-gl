import VBOInstanced from "./VBOInstanced";
import VBO from "./VBO";
import { AttribPointer } from "./Types";
import { FLOAT } from "./Constants";
import Bolt from "./Bolt";

export default class VAO {
  private _arrayObject: WebGLVertexArrayObject;
  private _gl: WebGL2RenderingContext;
  private _vbos: (VBO | VBOInstanced)[] = [];

  constructor() {
    this._gl = Bolt.getInstance().getContext();
    console.log(this._gl);
    this._arrayObject = <WebGLVertexArrayObject>this._gl.createVertexArray();
  }

  /**
   * Enable vetex attribute array, either with layout id or attribute name
   * @param  {VBO|VBOInstanced} vbo
   * @param  {number|AttribPointer} layoutID as either integer or attribute name ( requires program to be passed )
   * @param  {number} numComponents
   * @param  {number} type
   * @param  {number} stride=0
   * @param  {number} offset=0
   */
  linkAttrib(
    vbo: VBO | VBOInstanced,
    layoutID: number | AttribPointer,
    numComponents: number,
    type: number,
    stride = 0,
    offset = 0,
    divisor: number | undefined = undefined
  ) {
    vbo.bind();

    const pointerMethod =
      type === FLOAT ? "vertexAttribPointer" : "vertexAttribIPointer";

    // if a program and attribute name are passed, get attribute location by name
    if (this._isAttribPointer(layoutID as AttribPointer)) {
      const lID = <AttribPointer>layoutID;
      const location = this._gl.getAttribLocation(
        lID.program.program,
        lID.attributeName
      );

      if (location === -1) return;

      this._gl.enableVertexAttribArray(location);

      this._gl[pointerMethod](
        location,
        numComponents,
        type,
        false as never,
        stride,
        offset
      );

      divisor && this._gl.vertexAttribDivisor(location, divisor);
    } else {
      // use layout qualifier id to get attribute location
      const location = <number>layoutID;
      this._gl.enableVertexAttribArray(location);

      this._gl[pointerMethod](
        location,
        numComponents,
        type,
        false as never,
        stride,
        offset
      );

      divisor && this._gl.vertexAttribDivisor(location, divisor);
    }

    vbo.unbind();

    this._vbos.push(vbo);
  }

  _isAttribPointer(arg: AttribPointer): arg is AttribPointer {
    return arg.program !== undefined;
  }

  bind() {
    this._gl.bindVertexArray(this._arrayObject);
  }

  unbind() {
    this._gl.bindVertexArray(null);
  }

  delete() {
    this._vbos.forEach((vbo) => vbo.delete());
    this._gl.deleteVertexArray(this._arrayObject);
  }

  public get arrayObject(): WebGLVertexArrayObject {
    return this._arrayObject;
  }

  public set arrayObject(value: WebGLVertexArrayObject) {
    this._arrayObject = value;
  }

  public getVBO(id: string): VBO | VBOInstanced | undefined {
    return this._vbos.find((vbo) => vbo.id === id);
  }
}
