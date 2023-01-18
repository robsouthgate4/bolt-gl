#version 300 es

precision highp float;

uniform vec3 viewPosition;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 FragPosition;
in vec3 Color;

uniform vec4 baseColor;
uniform sampler2D mapAlbedo;

void main() {

    vec4 color = texture(mapAlbedo, Uv);
    FragColor = color;

}