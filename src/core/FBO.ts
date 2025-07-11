import Texture2D from "./Texture2D";
import {
  COLOR_ATTACHMENT0,
  DEPTH_ATTACHMENT,
  DEPTH_COMPONENT32F,
  DEPTH_COMPONENT,
  FRAMEBUFFER,
  TEXTURE_2D,
  NEAREST,
  FLOAT,
  CLAMP_TO_EDGE,
  RENDERBUFFER,
  COLOR_BUFFER_BIT,
  LINEAR,
  DEPTH_COMPONENT24,
  UNSIGNED_BYTE,
  RGBA,
  UNSIGNED_INT,
  STENCIL_INDEX8,
  DEPTH_STENCIL_ATTACHMENT,
  DEPTH_STENCIL,
  DEPTH24_STENCIL8,
  UNSIGNED_INT_24_8,
} from "./Constants";
import Bolt from "./Bolt";
import RBO from "./RBO";

export default class FBO {
  private _width = 256;
  private _height = 256;
  private _targetTexture: Texture2D;
  private _frameBuffer!: WebGLFramebuffer;
  private _gl: WebGL2RenderingContext;
  private _depthTexture?: Texture2D;
  private _attachmentIds!: number[];
  private _attachmentTextures: Texture2D[] = [];
  private _bolt: Bolt;
  private _depth: boolean;
  private _stencil: boolean;
  private _MSAAFramebuffers: (WebGLFramebuffer | null)[] | null[] = [];
  private _samples: number;
  private _isMSAA = false;
  private _msaaBuffers = { RENDERBUFFER: 0, COLORBUFFER: 1 };
  private _msaaColorRenderBuffer!: WebGLRenderbuffer | null;
  private _msaaDepthBuffer!: WebGLRenderbuffer | null;
  private _name: string;
  private _rboDepth: RBO | undefined;
  private _rboStencil: RBO | undefined;
  private _msaaDepthTexture!: Texture2D;

  constructor({
    width = 256,
    height = 256,
    depth = false,
    stencil = false,
    samples = 0,
    type = UNSIGNED_BYTE,
    internalFormat = RGBA,
    format = RGBA,
    generateMipmaps = false,
    minFilter = LINEAR,
    magFilter = LINEAR,
    wrapS = CLAMP_TO_EDGE,
    wrapT = CLAMP_TO_EDGE,
    name = "",
  } = {}) {
    this._depth = depth;
    this._stencil = stencil;
    this._bolt = Bolt.getInstance();
    this._gl = this._bolt.getContext();

    this._width = width;
    this._height = height;
    this._name = name;
    this._samples = samples;
    this._isMSAA = samples > 0;

    this._targetTexture = new Texture2D({
      width,
      height,
      generateMipmaps,
      type,
      internalFormat,
      format,
      minFilter,
      magFilter,
      wrapS,
      wrapT,
    });

    // if sample count provided, create a multisampled framebuffer
    if (this._isMSAA) {
      this.initMSAA();
      /**
       * Attach depth buffer and setup texture if depth is true
       */
      if (!depth) {
        this.attachRBODepth();
      }

      this.unbind();
    } else {
      this._frameBuffer = <WebGLFramebuffer>this._gl.createFramebuffer();

      this.bind();

      this._gl.framebufferTexture2D(
        FRAMEBUFFER,
        COLOR_ATTACHMENT0,
        TEXTURE_2D,
        this._targetTexture.texture,
        0
      );

      this._attachmentIds = [COLOR_ATTACHMENT0];
      this._attachmentTextures = [];

      /**
       * Attach depth buffer and setup texture if depth is true
       */
      if (depth) {
        this.attachDepthTexture();
      } else {
        // if no depth texture, attach a render buffer by default
        this.attachRBODepth();

        // attach a stencil buffer if stencil is true
        if (stencil) {
          this.attachRBOSStencil();
        }
      }

      this.unbind();
    }
    this._gl.bindTexture(TEXTURE_2D, null);

    this.clear();
  }

  private initMSAA() {
    this._MSAAFramebuffers = [
      this._gl.createFramebuffer(),
      this._gl.createFramebuffer(),
    ];

    // create a depth buffer
    this._msaaDepthBuffer = this._gl.createRenderbuffer();
    this._gl.bindRenderbuffer(RENDERBUFFER, this._msaaDepthBuffer);
    this._gl.renderbufferStorageMultisample(
      RENDERBUFFER,
      this._samples,
      DEPTH_COMPONENT24,
      this._width,
      this._height
    );

    // create a color buffer
    this._msaaColorRenderBuffer = this._gl.createRenderbuffer();
    this._gl.bindRenderbuffer(RENDERBUFFER, this._msaaColorRenderBuffer);
    this._gl.renderbufferStorageMultisample(
      RENDERBUFFER,
      this._samples,
      this._gl.RGBA8,
      this._width,
      this._height
    );

    // attach the depth buffer to the framebuffer
    this._gl.bindFramebuffer(
      FRAMEBUFFER,
      this._MSAAFramebuffers[this._msaaBuffers.RENDERBUFFER]
    );

    this._gl.framebufferRenderbuffer(
      FRAMEBUFFER,
      DEPTH_ATTACHMENT,
      RENDERBUFFER,
      this._msaaDepthBuffer
    );
    this._gl.bindFramebuffer(FRAMEBUFFER, null);

    // attach the  color buffer to the framebuffer
    this._gl.bindFramebuffer(
      FRAMEBUFFER,
      this._MSAAFramebuffers[this._msaaBuffers.RENDERBUFFER]
    );
    this._gl.framebufferRenderbuffer(
      FRAMEBUFFER,
      COLOR_ATTACHMENT0,
      RENDERBUFFER,
      this._msaaColorRenderBuffer
    );

    this._gl.bindFramebuffer(FRAMEBUFFER, null);

    this._gl.bindFramebuffer(
      FRAMEBUFFER,
      this._MSAAFramebuffers[this._msaaBuffers.COLORBUFFER]
    );

    this._gl.framebufferTexture2D(
      FRAMEBUFFER,
      COLOR_ATTACHMENT0,
      this._gl.TEXTURE_2D,
      this._targetTexture.texture,
      0
    );

    if (this._depth) {
      this._msaaDepthTexture = new Texture2D({
        width: this._width,
        height: this._height,
        generateMipmaps: false,
        internalFormat: DEPTH_COMPONENT24,
        format: DEPTH_COMPONENT,
        type: UNSIGNED_INT,
        minFilter: NEAREST,
        magFilter: NEAREST,
        wrapS: CLAMP_TO_EDGE,
        wrapT: CLAMP_TO_EDGE,
      });
      this._msaaDepthTexture.bind();
      this._gl.framebufferTexture2D(
        FRAMEBUFFER,
        DEPTH_ATTACHMENT,
        TEXTURE_2D,
        this._msaaDepthTexture.texture,
        0
      );
    }
  }

  private attachDepthTexture() {
    // combine the depth and stencil if both are required
    const internalFormat = this._stencil
      ? DEPTH24_STENCIL8
      : DEPTH_COMPONENT32F;

    const format = this._stencil ? DEPTH_STENCIL : DEPTH_COMPONENT;
    const type = this._stencil ? UNSIGNED_INT_24_8 : FLOAT;
    const attachment = this._stencil
      ? DEPTH_STENCIL_ATTACHMENT
      : DEPTH_ATTACHMENT;

    this._depthTexture = new Texture2D({
      width: this._width,
      height: this._height,
      generateMipmaps: false,
      internalFormat,
      format,
      type,
      minFilter: NEAREST,
      magFilter: NEAREST,
      wrapS: CLAMP_TO_EDGE,
      wrapT: CLAMP_TO_EDGE,
    });

    this._depthTexture.bind();

    this._gl.framebufferTexture2D(
      FRAMEBUFFER,
      attachment,
      TEXTURE_2D,
      this._depthTexture.texture,
      0
    );

    // Add error checking
    const status = this._gl.checkFramebufferStatus(FRAMEBUFFER);
    if (status !== this._gl.FRAMEBUFFER_COMPLETE) {
      console.error("Framebuffer is incomplete:", status);
    }
  }

  private attachRBODepth() {
    this._rboDepth = new RBO({
      width: this._width,
      height: this._height,
    });

    this.bind();
    this._rboDepth.bind();
    this.unbind();
    this._rboDepth.unbind();
  }

  private attachRBOSStencil() {
    this._rboStencil = new RBO({
      width: this._width,
      height: this._height,
      internalFormat: DEPTH_STENCIL,
      attachment: DEPTH_STENCIL_ATTACHMENT,
    });

    this.bind();
    this._rboStencil.bind();
    this.unbind();
    this._rboStencil.unbind();
  }

  clear(r = 0, g = 0, b = 0, a = 0) {
    this.bind();
    this._bolt.clear(r, g, b, a);
    this.unbind();
  }

  /**
   * Add an attachment to the framebuffer ( multi render targets )
   * @param  {Texture2D} texture
   * @param  {number} id
   */
  addAttachment(texture: Texture2D, id: number) {
    const attachmentID = COLOR_ATTACHMENT0 + id;
    texture.bind();
    this._gl.bindFramebuffer(FRAMEBUFFER, this._frameBuffer);
    this._gl.framebufferTexture2D(
      FRAMEBUFFER,
      attachmentID,
      TEXTURE_2D,
      texture.texture,
      0
    );
    texture.unbind();
    this._attachmentIds.push(attachmentID);
    this._attachmentTextures.push(texture);
  }
  /**
   * Set draw buffers for the framebuffer
   */
  setDrawBuffers() {
    this._gl.drawBuffers(this._attachmentIds);
  }
  /**
   * resize the framebuffer and all attachments
   * @param  {number} width width of the framebuffer
   * @param  {number} height height of the framebuffer
   */
  resize(width: number, height: number) {
    this._targetTexture.resize(width, height);

    this._width = width;
    this._height = height;

    if (this._depth && this._depthTexture && !this._isMSAA) {
      this._depthTexture.resize(width, height);
    }

    if (this._rboDepth) {
      this._rboDepth.resize(width, height);
    }

    if (this._rboStencil) {
      this._rboStencil.resize(width, height);
    }

    this._attachmentTextures.forEach((attachment: Texture2D) => {
      attachment.resize(width, height);
    });

    if (this._isMSAA) {
      this._gl.bindRenderbuffer(RENDERBUFFER, this._msaaDepthBuffer);
      this._gl.renderbufferStorageMultisample(
        RENDERBUFFER,
        this._samples,
        DEPTH_COMPONENT24,
        this._width,
        this._height
      );
      this._gl.bindRenderbuffer(RENDERBUFFER, null);

      this._gl.bindRenderbuffer(RENDERBUFFER, this._msaaColorRenderBuffer);
      this._gl.renderbufferStorageMultisample(
        RENDERBUFFER,
        this._samples,
        this._gl.RGBA8,
        this._width,
        this._height
      );

      if (this._depth) {
        this._msaaDepthTexture.resize(width, height);
      }

      this._gl.bindRenderbuffer(RENDERBUFFER, null);
    }
  }
  /**
   * @param  {} updateViewPort=true if true, update the viewport to the size of the framebuffer
   */
  bind(updateViewPort = true) {
    // set viewport size to match fbo size
    if (updateViewPort) this._bolt.setViewPort(0, 0, this._width, this._height);

    if (this._isMSAA) {
      this._gl.bindFramebuffer(
        FRAMEBUFFER,
        this._MSAAFramebuffers[this._msaaBuffers.RENDERBUFFER]
      );

      if (this._depth) {
        this._gl.clearBufferfv(this._gl.DEPTH, 0, [1.0, 1.0, 1.0, 1.0]);
      }

      this._gl.clearBufferfv(this._gl.COLOR, 0, [1.0, 1.0, 1.0, 1.0]);
    } else {
      this._gl.bindFramebuffer(FRAMEBUFFER, this._frameBuffer);
    }
  }

  unbind(updateViewPort = true) {
    // reset viewport size
    if (updateViewPort)
      this._bolt.setViewPort(
        0,
        0,
        this._gl.drawingBufferWidth,
        this._gl.drawingBufferHeight
      );

    if (this._isMSAA) {
      // blit to multisample buffer

      this._gl.bindFramebuffer(
        this._gl.READ_FRAMEBUFFER,
        this._MSAAFramebuffers[this._msaaBuffers.RENDERBUFFER]
      );

      this._gl.bindFramebuffer(
        this._gl.DRAW_FRAMEBUFFER,
        this._MSAAFramebuffers[this._msaaBuffers.COLORBUFFER]
      );

      this._gl.clearBufferfv(this._gl.COLOR, 0, [1.0, 1.0, 1.0, 1.0]);

      // blit the color buffer
      this._gl.blitFramebuffer(
        0,
        0,
        this._width,
        this._height,
        0,
        0,
        this._width,
        this._height,
        COLOR_BUFFER_BIT,
        LINEAR
      );

      if (this._depth) {
        this._gl.clearBufferfv(this._gl.DEPTH, 0, [1.0, 1.0, 1.0, 1.0]);

        // Blit the depth buffer
        this._gl.blitFramebuffer(
          0,
          0,
          this._width,
          this._height,
          0,
          0,
          this._width,
          this._height,
          this._gl.DEPTH_BUFFER_BIT,
          this._gl.NEAREST
        );
      }

      this._gl.bindFramebuffer(FRAMEBUFFER, null);
    } else {
      this._gl.bindFramebuffer(FRAMEBUFFER, null);
    }
  }

  delete() {
    this._gl.deleteFramebuffer(this._frameBuffer);

    if (this._isMSAA) {
      this._gl.deleteRenderbuffer(this._msaaDepthBuffer);
      this._gl.deleteRenderbuffer(this._msaaColorRenderBuffer);
      this._gl.deleteFramebuffer(
        this._MSAAFramebuffers[this._msaaBuffers.RENDERBUFFER]
      );
      this._gl.deleteFramebuffer(
        this._MSAAFramebuffers[this._msaaBuffers.COLORBUFFER]
      );
    }
  }

  public get width() {
    return this._width;
  }

  public set width(value) {
    this._width = value;
  }

  public get height() {
    return this._height;
  }

  public set height(value) {
    this._height = value;
  }

  public get targetTexture(): Texture2D {
    return this._targetTexture;
  }

  public get frameBuffer(): WebGLFramebuffer {
    return this._frameBuffer;
  }

  public get attachments(): number[] {
    return this._attachmentIds;
  }

  public set attachments(value: number[]) {
    this._attachmentIds = value;
  }

  public get attachmentsTextures(): Texture2D[] {
    return this._attachmentTextures;
  }

  public get depthTexture(): Texture2D | undefined {
    return this._depthTexture || undefined;
  }

  public get msaaDepthTexture(): Texture2D | undefined {
    return this._msaaDepthTexture || undefined;
  }

  public get name(): string {
    return this._name;
  }
}
