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
    generateRayFromCamera(x: number, y: number, camera: Camera): Ray;
}
