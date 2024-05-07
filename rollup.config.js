import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import dts from "rollup-plugin-dts";
import glslify from 'rollup-plugin-glslify';

const packageJson = require("./package.json");

const glslifyOptions = {
	include: [
		'**/*.vs',
		'**/*.fs',
		'**/*.vert',
		'**/*.frag',
		'**/*.glsl'
	],
	exclude: 'node_modules/**',
	compress: false
};

export default [ {
	input: [
		"src/index.ts",
		"src/core/Bolt.ts",
		"src/core/Mesh.ts",
		"src/core/Camera.ts",
		"src/core/CameraPersp.ts",
		"src/core/CameraOrtho.ts",
		"src/core/FBO.ts",
		"src/core/Node.ts",
		"src/core/DrawSet.ts",
		"src/core/RBO.ts",
		"src/core/Program.ts",
		"src/core/Texture.ts",
		"src/core/Texture2D.ts",
		"src/core/TextureSampler.ts",
		"src/core/TextureCube.ts",
		"src/core/Transform.ts",
		"src/core/VAO.ts",
		"src/core/VBO.ts",
		"src/core/IBO.ts",
		"src/core/VBOInstanced.ts",
		"src/core/GLUtils.ts",
		"src/core/Constants.ts",
		"src/core/Types.ts",
		"src/modules/asset-cache/index.ts",
		"src/modules/clock/index.ts",
		"src/modules/draco-decoder/index.ts",
		"src/modules/gltf-loader/index.ts",
		"src/modules/gltf-loader/SkinMesh.ts",
		"src/modules/draw-sets/floor/index.ts",
		"src/modules/draw-state/index.ts",
		"src/modules/event-listeners/index.ts",
		"src/modules/event-listeners/constants.ts",
		"src/modules/fbo-sim/index.ts",
		"src/modules/transform-feedback/index.ts",
		"src/modules/gpu-picker/index.ts",
		"src/modules/hdr-parse/index.ts",
		"src/modules/orbit/index.ts",
		"src/modules/post/index.ts",
		"src/modules/post/passes/Pass.ts",
		"src/modules/post/passes/FastBlurPass.ts",
		"src/modules/post/passes/ShaderPass.ts",
		"src/modules/raycast/index.ts",
		"src/modules/raycast/AxisAlignedBox.ts",
		"src/modules/raycast/Ray.ts",
		"src/modules/primitives/Cube.ts",
		"src/modules/primitives/Plane.ts",
		"src/modules/primitives/Sphere.ts",
	],
	output: [
		{
			dir: "build/cjs",
			format: "cjs",
			sourcemap: false,
			exports: "auto"
		},
		{
			dir: "build/esm",
			format: "esm",
			sourcemap: false,
		},
	],
	plugins: [
		glslify( glslifyOptions ),
		peerDepsExternal(),
		resolve(),
		commonjs(),
		typescript( { tsconfig: './tsconfig.json' } ),
		terser()
	]
}, {
	input: 'build/esm/index.d.ts',
	output: [ { file: 'build/index.d.ts', format: "esm" } ],
	plugins: [ dts() ],
}, ];
