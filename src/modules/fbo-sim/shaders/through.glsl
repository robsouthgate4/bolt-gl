#version 300 es

precision highp float;

in vec2 Uv;

uniform sampler2D map;

out vec4 FragColor;

void main() {

  FragColor = texture( map, Uv );

}