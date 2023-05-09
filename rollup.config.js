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
		"src/core/webgpu/BoltWGPU.ts",
		"src/core/webgl/Bolt.ts",
		"src/core/webgl/FBO.ts",
		"src/core/webgl/RBO.ts",
		"src/core/Texture.ts",
		"src/core/Texture2D.ts",
		"src/core/TextureSampler.ts",
		"src/core/TextureCube.ts",
		"src/core/webgl/VAO.ts",
		"src/core/webgl/VBOWebgl.ts",
		"src/core/webgl/VBOInstancedWebgl.ts",
		"src/core/webgl/IBOWebgl.ts",
		"src/core/webgpu/ComputeProgram.ts",
		"src/core/webgpu/ComputeBuffer.ts",
		"src/core/Mesh.ts",
		"src/core/Camera.ts",
		"src/core/CameraPersp.ts",
		"src/core/CameraOrtho.ts",
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
		//terser()
	]
}, {
	input: 'build/esm/index.d.ts',
	output: [ { file: 'build/index.d.ts', format: "esm" } ],
	plugins: [ dts() ],
}, ];
