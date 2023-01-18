#version 300 es

precision highp float;

in vec2 Uv;

uniform sampler2D map;

out vec4 FragColor;

void main() {

  FragColor = vec4( texture( map, Uv ).rgb, 1.0 );

}