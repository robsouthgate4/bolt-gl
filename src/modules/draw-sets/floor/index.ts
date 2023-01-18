import { DrawSet, LINES, Mesh, Program } from "../../../";
import vertexShader from "./shaders/axis.vert";
import fragmentShader from "./shaders/axis.frag";

export default class Floor extends DrawSet {
  constructor() {
    const dimensions = 20;
    const lines = (2 * dimensions) / 5;

    const inc = (2 * dimensions) / lines;
    const positions = [];
    const indices = [];

    for (let l = 0; l <= lines; l++) {
      positions[6 * l] = -dimensions;
      positions[6 * l + 1] = 0;
      positions[6 * l + 2] = -dimensions + l * inc;

      positions[6 * l + 3] = dimensions;
      positions[6 * l + 4] = 0;
      positions[6 * l + 5] = -dimensions + l * inc;

      positions[6 * (lines + 1) + 6 * l] = -dimensions + l * inc;
      positions[6 * (lines + 1) + 6 * l + 1] = 0;
      positions[6 * (lines + 1) + 6 * l + 2] = -dimensions;

      positions[6 * (lines + 1) + 6 * l + 3] = -dimensions + l * inc;
      positions[6 * (lines + 1) + 6 * l + 4] = 0;
      positions[6 * (lines + 1) + 6 * l + 5] = dimensions;

      indices[2 * l] = 2 * l;
      indices[2 * l + 1] = 2 * l + 1;
      indices[2 * (lines + 1) + 2 * l] = 2 * (lines + 1) + 2 * l;
      indices[2 * (lines + 1) + 2 * l + 1] = 2 * (lines + 1) + 2 * l + 1;
    }

    const mesh = new Mesh({
      positions,
      indices,
    }).setDrawType(LINES);

    const program = new Program(vertexShader, fragmentShader);

    super(mesh, program);
  }
}
