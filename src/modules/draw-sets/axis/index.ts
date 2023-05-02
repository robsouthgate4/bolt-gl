import { vec3 } from "gl-matrix";

import vertexShader from "./shaders/axis.vert";
import fragmentShader from "./shaders/axis.frag";
import { Renderer } from "../../../core/Types";
import DrawSet from "../../../core/DrawSet";
import Mesh from "../../../core/Mesh";
import { LINES } from "../../../core/webgl/Constants";
import Program from "../../../core/Program";

export default class Axis extends DrawSet {
  constructor(bolt: Renderer) {
    const mesh = new Mesh(bolt, {
      positions: [
        -1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0, //x
        0.0,
        -1.0,
        0.0,
        0.0,
        1.0,
        0.0, //y
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        1.0, //z
      ],
    }).setDrawType(LINES);

    const colors = [
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
    ];

    mesh.setAttribute(new Float32Array(colors), 3, 3);

    const program = new Program(bolt, {
      vertexShaderSrc: vertexShader,
      fragmentShaderSrc: fragmentShader,
      uniforms: {},
    });

    super(mesh, program);

    this.transform.scale = vec3.fromValues(5, 5, 5);
  }
}
