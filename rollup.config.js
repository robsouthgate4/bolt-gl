import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import glslify from "rollup-plugin-glslify";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "build/esm/index.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "build/cjs/index.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "build/index.min.js",
      format: "umd",
      name: "BoltGL",
      sourcemap: true,
    }
  ],
  onwarn: (warning, warn) => {
    // Suppress sourcemap warnings about missing source files
    if (warning.message && warning.message.includes("points to missing source files")) {
      return;
    }
    // Use default for everything else
    warn(warning);
  },
  plugins: [
    peerDepsExternal(), // Prevent bundling of peer dependencies
    resolve({
      browser: true, // Ensure browser-compatible imports
      extensions: [".mjs", ".js", ".json", ".node", ".ts"], // Resolve .ts files
    }),
    commonjs(), // Handle CommonJS modules
    glslify(), // Support GLSL shader files
    typescript({
      tsconfig: "./tsconfig.json",
      clean: true,
      useTsconfigDeclarationDir: true,
    }),
    terser({
      compress: {
        keep_fargs: true,
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    }), // Minify for production
  ],
  treeshake: {
    moduleSideEffects: false,
  },
};