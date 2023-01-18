#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;

uniform mat4 projection;
uniform mat4 viewProjection;
uniform mat4 model;
uniform mat4 view;

void main() {

    gl_Position = viewProjection * model * vec4(aPosition, 1.0);

}