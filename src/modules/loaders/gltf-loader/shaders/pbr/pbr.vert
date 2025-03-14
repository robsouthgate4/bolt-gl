#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 normal;
uniform mat4 modelView;
uniform mat4 modelViewInverse;

uniform vec3 cameraPosition;

out vec2 Uv;

out vec3 Normal;
out vec3 ViewPosition;
out vec3 WorldPosition;
out vec3 Eye;
out vec3 WorldNormal;

uniform sampler2D jointTexture;
uniform mat4 jointTransforms[128];
uniform float jointCount;


mat4 getBoneMatrix(int jointNdx) {
  return mat4(
    texelFetch(jointTexture, ivec2(0, jointNdx), 0),
    texelFetch(jointTexture, ivec2(1, jointNdx), 0),
    texelFetch(jointTexture, ivec2(2, jointNdx), 0),
    texelFetch(jointTexture, ivec2(3, jointNdx), 0));
}


void main() {

	vec3 position 			= aPosition;
	vec4 worldSpacePosition	= model * vec4( position, 1.0 );
    vec4 viewSpacePosition	= view * worldSpacePosition;

	// get the world space normal
    Normal						= ( normal * vec4( aNormal, 0.0 ) ).xyz;
    ViewPosition				= viewSpacePosition.xyz;
		WorldPosition				= worldSpacePosition.xyz;

	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	Eye				= normalize( cameraPosition - worldSpacePosition.xyz );
	WorldNormal				= ( model * vec4( Normal, 0.0 ) ).xyz;

	mat4 skinMatrix = mat4(1.0);

  skinMatrix =  getBoneMatrix(int(aJoints.x)) * aWeights.x +
                  getBoneMatrix(int(aJoints.y)) * aWeights.y +
                  getBoneMatrix(int(aJoints.z)) * aWeights.z +
                  getBoneMatrix(int(aJoints.w)) * aWeights.w;

	mat4 combinedModelView = skinMatrix * model;

  gl_Position				= projection * view * combinedModel  * vec4( aPosition, 1.0 );

	Uv			= aUv;
}