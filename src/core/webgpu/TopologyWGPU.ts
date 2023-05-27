export default class TopologyWGPU {
  public static get POINTS(): GPUPrimitiveTopology {
    return "point-list";
  }
  public static get TRIANGLES(): GPUPrimitiveTopology {
    return "triangle-list";
  }
  public static get LINES(): GPUPrimitiveTopology {
    return "line-list";
  }
  public static get LINE_STRIP(): GPUPrimitiveTopology {
    return "line-strip";
  }
  public static get TRIANGLE_STRIP(): GPUPrimitiveTopology {
    return "triangle-strip";
  }
}
