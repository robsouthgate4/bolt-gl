import { mat4, vec2, vec4 } from "gl-matrix";

import {
  Bolt,
  DrawSet,
  CameraPersp,
  FBO,
  Node,
  RBO,
  RGBA,
  Program,
  UNSIGNED_BYTE,
} from "../../";
import vertexShader from "./shaders/picking.vert";
import fragmentShader from "./shaders/picking.frag";

export interface PickingData {
  batch: DrawSet;
  id: number;
  initialShader: Program;
}

export default class GPUPicker {
  private _fbo: FBO;
  private _rbo: RBO;
  private _pickingProgram!: Program;
  private _bolt: Bolt;
  private _canvas: HTMLCanvasElement;
  private _pickingDataArray: PickingData[] = [];
  private _gl: WebGL2RenderingContext;
  private _currentPickingID = -1;
  private _camera: CameraPersp;
  private _nearPlane!: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
  };
  private _projectionMatrix = mat4.create();
  private _viewProjectionMatrix = mat4.create();

  constructor(bolt: Bolt) {
    this._bolt = bolt;
    this._gl = this._bolt.getContext();
    this._canvas = this._gl.canvas as HTMLCanvasElement;
    this._camera = <CameraPersp>this._bolt.camera;

    this._fbo = new FBO({ width: 1, height: 1 });
    this._fbo.bind();
    this._rbo = new RBO({ width: 1, height: 1 });
    this._fbo.unbind();
    this._rbo.unbind();

    this._pickingProgram = new Program(vertexShader, fragmentShader);
  }

  _getPickedID(mouse: vec2) {
    const pixelX = (mouse[0] * this._canvas.width) / this._canvas.clientWidth;
    const pixelY =
      this._canvas.height -
      (mouse[1] * this._canvas.height) / this._canvas.clientHeight -
      1;
    const data = new Uint8Array(4);

    const subLeft =
      this._nearPlane.left +
      (pixelX * this._nearPlane.width) / this._canvas.width;
    const subBottom =
      this._nearPlane.bottom +
      (pixelY * this._nearPlane.height) / this._canvas.height;
    const subWidth = this._nearPlane.width / this._canvas.width;
    const subHeight = this._nearPlane.height / this._canvas.height;

    mat4.frustum(
      this._projectionMatrix,
      subLeft,
      subLeft + subWidth,
      subBottom,
      subBottom + subHeight,
      this._camera.near,
      this._camera.far
    );

    // read pixel under mouse
    this._gl.readPixels(0, 0, 1, 1, RGBA, UNSIGNED_BYTE, data);

    // decodes vec4 back to integer ( 8 bits per channel )
    let id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

    // no picked item is equal to -1
    if (id < 0) id = -1;

    this._currentPickingID = id;
  }
  /**
   * @param  {vec2} mouse mouse coordinate relative to thre canvas
   * @returns number the id of the picked object
   */
  pick(mouse: vec2): number {
    this._generatePixelFrustum();

    this._drawPickingBuffer();
    this._getPickedID(mouse);

    this._fbo.unbind();

    this._restoreShaders();

    return this._currentPickingID;
  }

  /**
   * @param  {Node|Node[]} nodes nodes to check for picking
   */
  setNodes(nodes: Node | Node[]) {
    let id = 0;

    const createPickingData = (node: Node) => {
      node.traverse((childNode: Node) => {
        if (childNode instanceof DrawSet) {
          id++;

          this._pickingDataArray.push({
            batch: childNode,
            id,
            initialShader: childNode.program,
          });
        }
      });
    };

    if (Array.isArray(nodes)) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        createPickingData(node);
      }
    } else {
      createPickingData(nodes);
    }
  }

  resize() {
    this._generatePixelFrustum();
  }

  _generatePixelFrustum() {
    const aspect = this._canvas.clientWidth / this._canvas.clientHeight;

    const top = Math.tan(this._camera.fov * 0.5) * this._camera.near;
    const bottom = -top;
    const left = aspect * bottom;
    const right = aspect * top;
    const width = Math.abs(right - left);
    const height = Math.abs(top - bottom);

    this._nearPlane = {
      top,
      bottom,
      left,
      right,
      width,
      height,
    };
  }

  /**
   * Draws the picking objects to a framebuffer
   * Assigns picking program and passes ID as a uniform
   */
  _drawPickingBuffer() {
    this._fbo.bind();

    this._bolt.enableCullFace();
    this._bolt.enableDepth();

    this._bolt.setViewPort(0, 0, 1, 1);
    this._bolt.clear(0, 0, 0, 1);

    for (let i = 0; i < this._pickingDataArray.length; i++) {
      const pickingItem = this._pickingDataArray[i];

      const { batch, id } = pickingItem;
      batch.program = this._pickingProgram;
      batch.program.activate();

      mat4.multiply(
        this._viewProjectionMatrix,
        this._projectionMatrix,
        this._camera.view
      );

      // set the projection matrix to be the picking projection matrix ( 1 pixel frustum )
      batch.program.setMatrix4("viewProjection", this._viewProjectionMatrix);

      // adapted from https://webgl2fundamentals.org/webgl/lessons/webgl-picking.html
      batch.program.setVector4(
        "id",
        vec4.fromValues(
          ((id >> 0) & 0xff) / 0xff,
          ((id >> 8) & 0xff) / 0xff,
          ((id >> 16) & 0xff) / 0xff,
          ((id >> 24) & 0xff) / 0xff
        )
      );

      this._bolt.draw(batch);
    }
  }
  /**
   * reset batches program to initial program before picking draw
   */
  _restoreShaders() {
    for (let i = 0; i < this._pickingDataArray.length; i++) {
      const pickingItem = this._pickingDataArray[i];
      const { batch, initialShader } = pickingItem;
      batch.program = initialShader;
    }
  }

  public get currentPickingID(): number {
    return this._currentPickingID;
  }
  public set currentPickingID(value: number) {
    this._currentPickingID = value;
  }
}
