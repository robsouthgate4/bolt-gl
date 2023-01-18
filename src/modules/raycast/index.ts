import { mat4, vec3, vec4 } from "gl-matrix";

import { Camera } from "../../";
import Ray from "./Ray";

export default class Raycast {
  /**
   * Generates a ray to be cast from the screen click position
   * x and y coordinates must be normalized device coordinates ( ndc )
   * @param  {number} x normalized x coordinate
   * @param  {number} y normalized y coordinate
   * @param  {Camera} camera camera to generate ray from
   */
  generateRayFromCamera(x: number, y: number, camera: Camera): Ray {
    const clip = vec4.fromValues(x, y, -1.0, 1.0);
    const eye = vec4.fromValues(0, 0, 0, 0);

    const invProjection = mat4.create();

    mat4.invert(invProjection, camera.projection);
    vec4.transformMat4(eye, clip, invProjection);
    eye[2] = -1;
    eye[3] = 0;

    const world = vec4.fromValues(0, 0, 0, 0);
    const inverseView = mat4.create();

    mat4.invert(inverseView, camera.view);
    vec4.transformMat4(world, eye, inverseView);

    const rayDirection = vec3.fromValues(world[0], world[1], world[2]);
    vec3.normalize(rayDirection, rayDirection);

    const rayOrigin = vec3.create();
    mat4.getTranslation(rayOrigin, inverseView);

    const ray = new Ray(rayOrigin, rayDirection);

    return ray;
  }
}
