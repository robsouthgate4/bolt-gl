import { vec3 } from "gl-matrix";

import { DrawSet, LINES, Mesh, Program } from "../../";
import vertexShader from "./shaders/axis.vert";
import fragmentShader from "./shaders/axis.frag";

export default class Axis extends DrawSet {
  constructor() {
    const mesh = new Mesh({
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

    const program = new Program(vertexShader, fragmentShader);

    super(mesh, program);

    this.transform.scale = vec3.fromValues(5, 5, 5);
  }
}
