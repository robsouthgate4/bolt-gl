#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;

layout(location = 5) in vec4 aJoints;
layout(location = 6) in vec4 aWeights;

out vec3 Normal;
out vec2 Uv;
out vec3 Weights;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 normal;

uniform sampler2D jointTexture;
uniform mat4 jointTransforms[64];
uniform float jointCount;


mat4 getBoneMatrix(int jointNdx) {
  return mat4(
    texelFetch(jointTexture, ivec2(0, jointNdx), 0),
    texelFetch(jointTexture, ivec2(1, jointNdx), 0),
    texelFetch(jointTexture, ivec2(2, jointNdx), 0),
    texelFetch(jointTexture, ivec2(3, jointNdx), 0));
}

void main() {

  Uv = aUv;
  Normal = aNormal;

  mat4 skinMatrix = mat4(1.0);

  skinMatrix =  getBoneMatrix(int(aJoints.x)) * aWeights.x +
                  getBoneMatrix(int(aJoints.y)) * aWeights.y +
                  getBoneMatrix(int(aJoints.z)) * aWeights.z +
                  getBoneMatrix(int(aJoints.w)) * aWeights.w;

  // skinMatrix = jointTransforms[int(aJoints.x)] * aWeights.x +
  //               jointTransforms[int(aJoints.y)] * aWeights.y +
  //               jointTransforms[int(aJoints.z)] * aWeights.z +
  //               jointTransforms[int(aJoints.w)] * aWeights.w;


  Normal = (model * skinMatrix * vec4(aNormal, 0.0)).xyz;

  mat4 combinedModel = model * skinMatrix;

  gl_Position = projection * view * combinedModel * vec4(aPosition, 1.0);
}