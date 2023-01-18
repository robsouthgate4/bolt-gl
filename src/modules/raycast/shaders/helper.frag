#version 300 es

precision highp float;

uniform vec3 objectColor;
uniform vec3 lightColor;

out vec4 FragColor;

in vec3 Normal;

in vec3 Color;

void main() {
   FragColor = vec4(vec3(0.0, 0.0, 0.0), 1.0);
}