import dts from "rollup-plugin-dts";

export default {
  input: "build/esm/index.d.ts",
  output: [{ file: "build/index.d.ts", format: "esm" }],
  plugins: [dts()],
};