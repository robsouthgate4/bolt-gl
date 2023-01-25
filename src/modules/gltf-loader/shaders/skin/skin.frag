#version 300 es

precision highp float;

uniform vec4 baseColorFactor;

in vec3 Normal;
in vec2 Uv;

out vec4 FragColor;
void main() {

   vec3 color = baseColorFactor.rgb;

   FragColor = vec4( baseColorFactor.rgb, 1.0 );

}