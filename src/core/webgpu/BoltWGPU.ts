/*
Bolt renderer
*/

import { vec2, vec3 } from "gl-matrix";

import { BoltParams, RendererType, Viewport } from "../Types";
import Node from "../Node";
import DrawSet from "../DrawSet";
import Camera from "../Camera";

export default class BoltWGPU {
  private static _instance: BoltWGPU;
  private _context!: GPUCanvasContext;
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
  private _canvas!: HTMLCanvasElement;
  private _device: GPUDevice | undefined;

  public rendererType = RendererType.WEBGPU;
  private _presentationFormat!: GPUTextureFormat;
  private _renderPassDescriptor!: GPURenderPassDescriptor;
  private _renderTarget!: GPUTexture;
  private _depthTexture!: GPUTexture;
  private _renderTargetView!: GPUTextureView;
  private _depthTextureView!: GPUTextureView;
  private _nodeBindGroupLayout!: GPUBindGroupLayout;
  private _boltPipelineLayout!: GPUPipelineLayout;
  private _frameBingGroupLayout!: GPUBindGroupLayout;
  private _frameUniformBuffer!: GPUBuffer;
  private _frameBindGroup!: GPUBindGroup;
  private _programBindGroupLayout!: GPUBindGroupLayout;

  static getInstance(): BoltWGPU {
    if (!BoltWGPU._instance) BoltWGPU._instance = new BoltWGPU();
    return BoltWGPU._instance;
  }

  /**
   * Initialise a webgl context
   * @param  {HTMLCanvasElement} canvas html canvas element
   * @param  {BoltParams} {antialias} context params, antialias and DPI ( default 1 )
   */
  async init(
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
    this._canvas = canvas;
    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) throw new Error("WebGPU not supported in this browser");

    this._device = await adapter.requestDevice();
    this._context = <GPUCanvasContext>canvas.getContext("webgpu");

    this._presentationFormat = await navigator.gpu.getPreferredCanvasFormat();

    this._context.configure({
      device: this._device,
      format: this._presentationFormat,
      alphaMode: "opaque",
    });

    this._renderTarget = this._device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: 4,
      format: this._presentationFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this._renderTargetView = this._renderTarget.createView();

    this._depthTexture = this._device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: 4,
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.initBindGroupsAndPipeline();

    this._depthTextureView = this._depthTexture.createView();

    this.printBanner();
    this._dpi = dpi;

    this.resizeCanvasToDisplay();
  }

  private initBindGroupsAndPipeline() {
    if (!this._device) return;

    const matrixSizeBytes = 16 * Float32Array.BYTES_PER_ELEMENT;
    const bufferSize = 2 * matrixSizeBytes;

    this._frameUniformBuffer = this._device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this._frameBingGroupLayout = this._device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {},
        },
      ],
    });

    this._nodeBindGroupLayout = this._device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {},
        },
      ],
    });

    this._programBindGroupLayout = this._device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {},
        },
      ],
    });

    this._frameBindGroup = this._device.createBindGroup({
      layout: this._frameBingGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this._frameUniformBuffer,
          },
        },
      ],
    });

    this._boltPipelineLayout = this._device.createPipelineLayout({
      bindGroupLayouts: [
        this._programBindGroupLayout,
        this._nodeBindGroupLayout,
        this._frameBingGroupLayout,
      ],
    });
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
      `%c WebGPU rendered with Bolt by RS CREATIVE STUDIO \u26a1 \u26a1`,
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
    return;
  }

  scissor(x: number, y: number, w: number, h: number) {
    return;
  }

  /**
   * Set gl viewport offset and dimensions
   * @param  {number} x offset x
   * @param  {number} y offset y
   * @param  {number} width width of the viewport
   * @param  {number} height height of the viewport
   */
  setViewPort(x: number, y: number, width: number, height: number) {
    return;
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
    return;
  }

  disableAlpha() {
    return;
  }

  enableDepth() {
    return;
  }

  disableDepth() {
    return;
  }

  enableCullFace() {
    return;
  }

  disableCullFace() {
    return;
  }

  /**
   * @param  {number} face face to cull
   */
  cullFace(face: number) {
    return;
  }

  enableAlphaBlending() {
    return;
  }

  enableAdditiveBlending() {
    return;
  }

  /**
   * enable scissor test
   */
  enableScissor() {
    return;
  }

  /**
   * disable scissor test
   */
  disableScissor() {
    return;
  }

  /**
   * Returns gl context
   */
  getContext() {
    return this._context;
  }

  /**
   * Resizes the canvas to fit full screen
   * Updates the currently bound camera perspective
   */
  resizeCanvasToDisplay(canvas?: HTMLCanvasElement) {
    const c = canvas || (this._canvas as HTMLCanvasElement);

    const displayWidth = c.clientWidth * this._dpi;
    const displayHeight = c.clientHeight * this._dpi;

    // Check if the this.gl.canvas is not the same size.
    const needResize = c.width !== displayWidth || c.height !== displayHeight;

    if (
      needResize &&
      this._device &&
      this._presentationFormat &&
      this._renderTarget
    ) {
      c.width = displayWidth;
      c.height = displayHeight;
    }
  }

  resizeCanvasToSize(size: vec2) {
    if (!this._canvas) return;
    const dpi = this._dpi;
    this._canvas.width = size[0] * dpi;
    this._canvas.height = size[1] * dpi;
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

    if (!this._device) return;
    const commandEncoder = this._device.createCommandEncoder();

    const renderPassDescriptor = {
      colorAttachments: [
        {
          view: this._renderTarget.createView(),
          resolveTarget: this._context.getCurrentTexture().createView(),
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: this._depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    };

    this._renderPassDescriptor =
      renderPassDescriptor as GPURenderPassDescriptor;

    const passEncoder = commandEncoder.beginRenderPass(
      this._renderPassDescriptor
    );

    if (
      this._renderTarget?.width !== this._canvas.width ||
      this._renderTarget?.height !== this._canvas.height
    ) {
      this._renderTarget?.destroy();
      this._renderTarget = this._device.createTexture({
        size: [this._canvas.width, this._canvas.height],
        sampleCount: 4,
        format: this._presentationFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
      this._renderTargetView = this._renderTarget.createView();
    }

    if (
      this._depthTexture?.width !== this._canvas.width ||
      this._depthTexture?.height !== this._canvas.height
    ) {
      this._depthTexture?.destroy();
      this._depthTexture = this._device.createTexture({
        size: [this._canvas.width, this._canvas.height],
        sampleCount: 4,
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
      this._depthTextureView = this._depthTexture.createView();
    }

    // update frame uniform buffer
    this._device.queue.writeBuffer(
      this._frameUniformBuffer,
      0,
      this._camera.view as ArrayBuffer
    );

    this._device.queue.writeBuffer(
      this._frameUniformBuffer,
      64,
      this._camera.projection as ArrayBuffer
    );

    // set bind group 0 ( view, projection... ) per app frame data
    passEncoder.setBindGroup(0, this._frameBindGroup);

    const render = (node: Node) => {
      if (!this._device) return;

      if (!node.draw) return;
      if (node.parent && !node.parent.draw) return;

      // if node is a batch then render the mesh and update shader matrices
      if (node instanceof DrawSet) {
        const { program } = node;

        program.updateMatrices(node, this._camera);

        const mesh = node.mesh;

        // skin meshes require node reference to update skin matrices
        if (node.mesh.isSkinMesh) {
          mesh.draw(program, node!, passEncoder);
        } else {
          mesh.draw(program, node!, passEncoder);
        }
      }
    };

    {
      this._opaqueNodes = [];
      this._transparentNodes = [];

      if (drawables && !drawables.draw) return;

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

    passEncoder.end();
    this._device.queue.submit([commandEncoder.finish()]);
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

  public get device(): GPUDevice | undefined {
    return this._device;
  }

  public get context(): GPUCanvasContext {
    return this._context;
  }

  public get presentationFormat(): GPUTextureFormat | undefined {
    return this._presentationFormat;
  }

  public get frameUniformBuffer(): GPUBuffer {
    return this._frameUniformBuffer;
  }

  public get renderPassDescriptor(): GPURenderPassDescriptor | undefined {
    return this._renderPassDescriptor;
  }

  public get nodeBindGroupLayout(): GPUBindGroupLayout {
    return this._nodeBindGroupLayout;
  }

  public get boltPipelineLayout(): GPUPipelineLayout {
    return this._boltPipelineLayout;
  }

  public get programBindGroupLayout(): GPUBindGroupLayout {
    return this._programBindGroupLayout;
  }
}
