/*
Bolt renderer
*/

import { vec2, vec3 } from "gl-matrix";

import { BoltParams, Viewport } from "./Types";
import Program from "./Program";
import Node from "./Node";
import DrawSet from "./DrawSet";
import {
  BACK,
  BLEND,
  CULL_FACE,
  DEPTH_TEST,
  NONE,
  ONE,
  ONE_MINUS_SRC_ALPHA,
  SRC_ALPHA,
} from "./Constants";
import Camera from "./Camera";

export default class Bolt {
  private static _instance: Bolt;
  private _gl!: WebGL2RenderingContext;
  private _camera!: Camera;
  private _dpi!: number;
  private _viewport!: Viewport;
  private _autoSort = true;
  private _sortVec3 = vec3.create();
  private _transparentNodes: DrawSet[] = [];
  private _opaqueNodes: DrawSet[] = [];
  private _activeProgram = -1;
  private _activeTextureUnit = -1;
  private _boundTexture = -1;

  static getInstance(): Bolt {
    if (!Bolt._instance) Bolt._instance = new Bolt();
    return Bolt._instance;
  }

  /**
   * Initialise a webgl context
   * @param  {HTMLCanvasElement} canvas html canvas element
   * @param  {BoltParams} {antialias} context params, antialias and DPI ( default 1 )
   */
  init(
    canvas: HTMLCanvasElement,
    {
      antialias = false,
      dpi = 1,
      powerPreference = "default",
      alpha = true,
      premultipliedAlpha = true,
      stencil = false,
      preserveDrawingBuffer = false,
    }: BoltParams
  ) {
    this._gl = <WebGL2RenderingContext>canvas.getContext("webgl2", {
      antialias,
      dpi,
      powerPreference,
      alpha,
      premultipliedAlpha,
      stencil,
      preserveDrawingBuffer,
    });

    this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);

    this.printBanner();

    this._dpi = dpi;

    this.enableDepth();
    this.enableAlpha();
    this.enableCullFace();
    this.cullFace(BACK);
    this.resizeCanvasToDisplay();
  }

  private printBanner() {
    const style = [
      "font-size: 1em",
      "padding: 10px",
      "background-color: black",
      "color: yellow",
      "font-family: monospace",
    ].join(";");

    console.log(
      `%c WebGL rendered with Bolt by RS CREATIVE STUDIO \u26a1 \u26a1`,
      style
    );
  }

  /**
   * Clear canvas with rgba colour components
   * @param  {number} r red
   * @param  {number} g green
   * @param  {number} b blue
   * @param  {number} a alpha
   */
  clear(r: number, g: number, b: number, a: number) {
    this._gl.clearColor(r, g, b, a);
    //this._gl.colorMask( false, false, false, true );
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
  }

  scissor(x: number, y: number, w: number, h: number) {
    this._gl.scissor(x, y, w, h);
  }

  /**
   * Set gl viewport offset and dimensions
   * @param  {number} x offset x
   * @param  {number} y offset y
   * @param  {number} width width of the viewport
   * @param  {number} height height of the viewport
   */
  setViewPort(x: number, y: number, width: number, height: number) {
    this._gl.viewport(x, y, width, height);
    this._viewport = { offsetX: x, offsetY: y, width, height };
  }

  /**
   * Attach a camera instance to the renderer
   * @param  {Camera} camera
   */
  setCamera(camera: Camera) {
    this._camera = camera;
  }

  get camera(): Camera {
    return this._camera;
  }

  enableAlpha() {
    this._gl.enable(BLEND);
  }

  disableAlpha() {
    this._gl.disable(BLEND);
  }

  enableDepth() {
    this._gl.enable(DEPTH_TEST);
  }

  disableDepth() {
    this._gl.disable(DEPTH_TEST);
  }

  enableCullFace() {
    this._gl.enable(CULL_FACE);
  }

  disableCullFace() {
    this._gl.disable(CULL_FACE);
  }

  /**
   * @param  {number} face face to cull
   */
  cullFace(face: number) {
    this._gl.cullFace(face);
  }

  enableAlphaBlending() {
    this._gl.blendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA);
  }

  enableAdditiveBlending() {
    this._gl.blendFunc(ONE, ONE);
  }

  /**
   * enable scissor test
   */
  enableScissor() {
    this._gl.enable(this._gl.SCISSOR_TEST);
  }

  /**
   * disable scissor test
   */
  disableScissor() {
    this._gl.disable(this._gl.SCISSOR_TEST);
  }

  /**
   * Returns gl context
   */
  getContext() {
    return this._gl;
  }

  /**
   * Resizes the canvas to fit full screen
   * Updates the currently bound camera perspective
   */
  resizeCanvasToDisplay(canvas?: HTMLCanvasElement) {
    const c = canvas || (this._gl.canvas as HTMLCanvasElement);

    const displayWidth = c.clientWidth * this._dpi;
    const displayHeight = c.clientHeight * this._dpi;

    // Check if the this.gl.canvas is not the same size.
    const needResize = c.width !== displayWidth || c.height !== displayHeight;

    console.log("resizeCanvasToDisplay", displayWidth, displayHeight);

    if (needResize) {
      c.width = displayWidth;
      c.height = displayHeight;
    }
  }

  resizeCanvasToSize(size: vec2) {
    const dpi = this._dpi;

    this._gl.canvas.width = size[0] * dpi;
    this._gl.canvas.height = size[1] * dpi;
  }

  /**
   * @param  {DrawSet[]} nodes
   * calculate node depth from the currently bound camera
   */
  private sortByDepth(nodes: DrawSet[]) {
    nodes.forEach((node: Node) => {
      vec3.copy(this._sortVec3, node.worldPosition);
      vec3.transformMat4(
        this._sortVec3,
        this._sortVec3,
        this._camera.projectionView
      );
      node.cameraDepth = this._sortVec3[2];
    });

    nodes.sort((a: Node, b: Node) => {
      return b.cameraDepth - a.cameraDepth;
    });
  }

  /**
   * Trigger a depth sort of opaque and transparent nodes
   */
  public forceDepthSort() {
    this.sortByDepth(this._opaqueNodes);
    this.sortByDepth(this._transparentNodes);
  }

  /**
   * @param  {Node} drawables
   */
  draw(drawables: Node) {
    this._camera.update();

    const render = (node: Node) => {
      if (node.parent && !node.parent.draw) return;

      if (!node.draw) return;

      // if node is a batch then render the mesh and update shader matrices
      if (node instanceof DrawSet) {
        // only draw if mesh has a valid vao
        if (!node.mesh.vao) return;

        const { program } = node;

        program.activate();
        program.use();

        node.updateMatrices(program, this._camera);

        // set the current blend mode for bound shader

        if (program.transparent === true) {
          this.enableAlpha();
          this._gl.blendFunc(
            program.blendFunction.src,
            program.blendFunction.dst
          );
        } else {
          this.disableAlpha();
        }

        if (program.cullFace !== undefined) {
          if (program.cullFace === NONE) {
            this.disableCullFace();
          } else {
            this.enableCullFace();
            this.cullFace(program.cullFace);
          }
        }

        // skin meshes require node reference to update skin matrices
        if (node.mesh.isSkinMesh) {
          node.mesh.draw(program, node);
        } else {
          node.mesh.draw(program);
        }
      }
    };

    {
      this._opaqueNodes = [];
      this._transparentNodes = [];

      if (!drawables.draw) return;

      // traverse nodes and sort into transparent and opaque lists
      drawables.traverse((node: Node) => {
        drawables.updateModelMatrix();

        if (node instanceof DrawSet) {
          if (node.program.transparent) {
            this._transparentNodes.push(node);
          } else {
            this._opaqueNodes.push(node);
          }
        }
      });

      if (this._autoSort) {
        this.sortByDepth(this._opaqueNodes);
        this.sortByDepth(this._transparentNodes);
      }

      // draw opaque nodes first
      this._opaqueNodes.forEach((node: Node) => {
        render(node);
      });

      // draw transparent nodes last
      this._transparentNodes.forEach((node: Node) => {
        render(node);
      });
    }
  }

  public get dpi(): number {
    return this._dpi;
  }

  public set dpi(value: number) {
    this._dpi = value;
  }

  public get viewport(): Viewport {
    return this._viewport;
  }

  public get autoSort() {
    return this._autoSort;
  }

  public set autoSort(value) {
    this._autoSort = value;
  }

  public set activeProgram(id: number) {
    this._activeProgram = id;
  }

  public get activeProgram() {
    return this._activeProgram;
  }

  public get activeTextureUnit() {
    return this._activeTextureUnit;
  }

  public set activeTextureUnit(value) {
    this._activeTextureUnit = value;
  }

  public get boundTexture() {
    return this._boundTexture;
  }

  public set boundTexture(value) {
    this._boundTexture = value;
  }
}
