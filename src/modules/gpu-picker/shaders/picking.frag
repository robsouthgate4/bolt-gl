#version 300 es

precision highp float;

uniform vec4 id;

out vec4 outColor;

void main() {

    outColor = id;

}