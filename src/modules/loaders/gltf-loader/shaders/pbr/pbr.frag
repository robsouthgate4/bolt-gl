#version 300 es

precision highp float;

uniform sampler2D 	mapAO;
uniform sampler2D 	mapAlbedo;

uniform samplerCube mapRadiance;
uniform samplerCube mapIrradiance;

uniform float		roughness;
uniform float		metallic;
uniform float		specular;

uniform float		exposure;
uniform float		gamma;

in vec3		Normal;
in vec3		Position;
in vec3		EyePosition;
in vec3		WorldPosition;
in vec2 	Uv;
in vec3 	WorldNormal;

out vec4 FragColor;

#define saturate(x) clamp(x, 0.0, 1.0)
#define PI 3.1415926535897932384626433832795


// Filmic tonemapping from
// http://filmicgames.com/archives/75

const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;

vec3 Uncharted2Tonemap( vec3 x )
{
	return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
vec3 EnvBRDFApprox( vec3 SpecularColor, float Roughness, float NoV )
{
	const vec4 c0 = vec4( -1, -0.0275, -0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, -0.04 );
	vec4 r = Roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;
	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;
	return SpecularColor * AB.x + AB.y;
}


// http://the-witness.net/news/2012/02/seamless-cube-map-filtering/
vec3 fix_cube_lookup( vec3 v, float cube_size, float lod ) {
	float M = max(max(abs(v.x), abs(v.y)), abs(v.z));
	float scale = 1.0 - exp2(lod) / cube_size;
	if (abs(v.x) != M) v.x *= scale;
	if (abs(v.y) != M) v.y *= scale;
	if (abs(v.z) != M) v.z *= scale;
	return v;
}

vec3 correctGamma(vec3 color, float g) {
	return pow(color, vec3(1.0/g));
}

vec3 getPbr(vec3 N, vec3 V, vec3 baseColor, float roughness, float metallic, float specular) {

	vec3 diffuseColor	= baseColor - baseColor * metallic;
	vec3 specularColor	= mix( vec3( 0.08 * specular ), baseColor, specular );

	vec3 color;

	float roughness4 = pow(roughness, 4.0);

	// // sample the pre-filtered cubemap at the corresponding mipmap level
	float numMips		= 6.0;
	float mip			= numMips - 1.0 + log2(roughness);
	vec3 lookup			= -reflect( V, N );
	lookup				= fix_cube_lookup( lookup, 512.0, mip );
	vec3 radiance		= pow( texture( mapRadiance, lookup, mip ).rgb, vec3( 2.2 ) );
	vec3 irradiance		= pow( texture( mapIrradiance, N ).rgb, vec3( 1. ) );

	// get the approximate reflectance
	float NoV			= saturate( dot( N, V ) );
	vec3 reflectance	= EnvBRDFApprox( specularColor, roughness4, NoV );

	// combine the specular IBL and the BRDF
    vec3 diffuse  		= diffuseColor * irradiance;
    vec3 _specular 		= radiance * reflectance;
	color				= diffuse + _specular;

	return color;

}

void main() {

vec3 N 				= normalize( WorldNormal );
vec3 V 				= normalize( Eye );

vec3 baseColor		= vec3(1.0, 0.0, 0.0);

vec3 color 			= getPbr(N, V, baseColor, roughness, metallic, specular );
// specular	vec3 ao 			= texture2D(mapAO, vTextureCoord).rgb;
// 	color 				*= ao;

//apply the tone-mapping
color				= Uncharted2Tonemap( color * 1.0 );
//white balance
color				= color * ( 1.0 / Uncharted2Tonemap( vec3( 20.0 ) ) );

//gamma correction
color				= pow( color, vec3( 1.0 / 2.2 ) );

// output the fragment color
FragColor		= vec4( color, 1.0 );

}




