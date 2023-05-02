import {
  GeometryBuffers,
  MeshParams,
  Renderer,
  RendererType,
  UniformObject,
  UniformObjectWgpu,
} from "./Types";
import Bolt from "./webgl/Bolt";
import GeometryRendererWebgl from "./webgl/GeometryRendererWebgl";
import ProgramWebgl from "./webgl/ProgramWebgl";
import BoltWGPU from "./webgpu/BoltWGPU";
import GeometryRendererWebgpu from "./webgpu/GeometryRendererWebgpu";
import ProgramWebgpu from "./webgpu/ProgramWebgpu";

export default class Mediator {
  static _instance: Mediator;

  static getInstance() {
    if (!Mediator._instance) {
      Mediator._instance = new Mediator();
    }
    return Mediator._instance;
  }

  public geometryRenderer(
    renderer: Renderer,
    geometry: GeometryBuffers | undefined,
    params: MeshParams | undefined
  ): GeometryRendererWebgl | GeometryRendererWebgpu {
    switch (renderer.rendererType) {
      case RendererType.WEBGL:
        return new GeometryRendererWebgl(renderer as Bolt, geometry, params);
      case RendererType.WEBGPU:
        return new GeometryRendererWebgpu(
          renderer as BoltWGPU,
          geometry,
          params
        );
      default:
        throw new Error("No renderer found");
    }
  }

  public programType(
    renderer: Renderer,
    parameters: {
      shaderSrc?: string;
      vertexShaderSrc?: string;
      fragmentShaderSrc?: string | undefined;
      uniforms: UniformObject | UniformObjectWgpu;
      transformFeedbackVaryings?: string[];
    }
  ): ProgramWebgl | ProgramWebgpu {
    switch (renderer.rendererType) {
      case RendererType.WEBGL:
        return new ProgramWebgl(renderer as Bolt, {
          vertexShaderSrc: parameters.vertexShaderSrc!,
          fragmentShaderSrc: parameters.fragmentShaderSrc!,
          uniforms: parameters.uniforms as UniformObject,
          transformFeedbackVaryings: parameters.transformFeedbackVaryings,
        });
      case RendererType.WEBGPU:
        return new ProgramWebgpu(renderer as BoltWGPU, {
          shaderSrc: parameters.shaderSrc!,
          uniforms: parameters.uniforms as UniformObjectWgpu,
        });
      default:
        throw new Error("No renderer found");
    }
  }
}
