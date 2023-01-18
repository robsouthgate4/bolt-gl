#version 300 es

precision highp float;

uniform sampler2D map;

uniform vec2 resolution;
uniform vec2 direction;

in vec2 Uv;

out vec4 FragColor;

vec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3333333333333333) * direction;
  color += texture(image, uv) * 0.29411764705882354;
  color += texture(image, uv + (off1 / resolution)) * 0.35294117647058826;
  color += texture(image, uv - (off1 / resolution)) * 0.35294117647058826;
  return color;
}

void main() {

    vec3 outColor = blur5(map, Uv, resolution, direction).rgb;

    FragColor = vec4(outColor, 1.0);

}