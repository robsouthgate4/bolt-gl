#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;

in vec4 aJoints;
in vec4 aWeights;

out vec3 Normal;
out vec2 Uv;
out vec3 Weights;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 normal;

uniform sampler2D jointTexture;
uniform mat4 jointTransforms[128];
uniform float jointCount;

mat4 getBoneMatrix(int jointIndex) {

  return mat4(texelFetch(jointTexture, ivec2(0, jointIndex), 0), texelFetch(jointTexture, ivec2(1, jointIndex), 0), texelFetch(jointTexture, ivec2(2, jointIndex), 0), texelFetch(jointTexture, ivec2(3, jointIndex), 0));

}

void main() {

  Uv = aUv;
  Normal = aNormal;
  //Normal = aJoints.xyz / ( jointCount - 1.0 );
  //Normal = aWeights.xyz;

  mat4 skinMatrix = mat4(1.0);

  vec4 weight = vec4( 0.0 );

  skinMatrix = jointTransforms[int(aJoints.x)] * weight.x +
    jointTransforms[int(aJoints.y)] * weight.y +
    jointTransforms[int(aJoints.z)] * weight.z +
    jointTransforms[int(aJoints.w)] * weight.w;

  mat4 combinedModel = model * skinMatrix;

  gl_Position = projection * view * combinedModel * vec4(aPosition, 1.0);
}