# 🚀 Bolt WebGL Framework

Bolt is a modern, lightweight WebGL2 framework designed for high-performance graphics applications and creative coding. It provides a clean, intuitive API while maintaining low-level control over WebGL operations.

## ✨ Features

- **WebGL2 Support**: Full WebGL2 implementation with modern features
- **🏃 Performance Focused**: Optimized for high-performance graphics applications
- **🎨 Flexible Rendering Pipeline**: Easy-to-use abstractions for complex WebGL operations
- **🖼️ Advanced Texture Support**: 
  - 2D Textures
  - 3D Textures
  - Multiple Render Targets
  - Depth and Stencil Textures
- **🎯 Framebuffer Objects**: Comprehensive FBO support with MSAA
- **⚡ Transform Feedback simulations**
- **☁️ Point Cloud Rendering**: Efficient Houdini point cloud data handling and rendering
- **🌍 Scene Management**: Built-in Blender scene loading and management capabilities

## 📦 Installation

```bash
npm install bolt-gl
```

## 🚦 Quick Start

```javascript
import { Bolt, Program, DrawSet, Mesh } from 'bolt-gl';

// Initialize Bolt
const bolt = Bolt.getInstance();
const canvas = document.getElementById('canvas');

const dpi = 1;

bolt.init(canvas, {
    alpha: true,
    antialias: false,
    dpi,
    powerPreference: "high-performance",
})

bolt.resizeCanvasToDisplay();
bolt.setViewPort( 0, 0, canvas.width, canvas.height);

const clearColor = [1, 1, 1, 1];

// Create a simple triangle
const positions = new Float32Array([
  -0.5, -0.5, 0.0,
   0.5, -0.5, 0.0,
   0.0,  0.5, 0.0
]);

const mesh = new Mesh({ positions });

// Create and use a program
const program = new Program({
  vertex: `
    #version 300 es
    in vec3 position;
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragment: `
    #version 300 es
    precision highp float;
    out vec4 fragColor;
    void main() {
      fragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `
});

const drawSet = new DrawSet(mesh, program);

// Render loop
function render() {
  bolt.clear(...clearColor);
  bolt.setViewPort( 0, 0, canvas.width, canvas.height );
  bolt.draw(drawSet);
  requestAnimationFrame(render);
}

render();
```

## 🛠️ Advanced Features

### 🖼️ Framebuffer Objects (FBO)

```javascript
import { FBO } from 'bolt-gl';

const fbo = new FBO({
  width: 512,
  height: 512,
  depth: true,
  stencil: true
});
```

### 📦 3D Textures

```javascript
import { Texture3D } from 'bolt-gl';

const texture = new Texture3D({
  width: 256,
  height: 256,
  depth: 256
});
```

### ⚡ Transform Feedback

```javascript
const positionA =  new VBO(
    offset,
    DYNAMIC_DRAW
)

const positionB =  new VBO(
    offset,
    DYNAMIC_DRAW
)

const tf = new TransformFeedback({
    bolt,
    count
});

const tfProgram = new Program(simVertex, simFragment, {
    transformFeedbackVaryings: ['newPosition']
});

tf.bindVAOS([
    {
        attributeLocation: 0,
        requiresSwap: true,
        vbo1: positionA,
        vbo2: positionB,
        size: 3
    }
]);

tf.compute(tfProgram);
```

### ☁️ Houdini Point Cloud Loading

```javascript
const loader = new BoltPointCloudLoader();
await loader.load('path/to/pointcloud.boltpc');
const points = loader.points;
```

### 🌍 Blender Scene Loader

```javascript
const boltSceneLoader = new BoltSceneLoader();
await boltSceneLoader.load('/models');
const scene = boltSceneLoader;
```

## 📚 Documentation

For detailed documentation and examples, visit our [documentation site](link-to-docs).

## 🤝 Contributing

We welcome contributions! Please read our [contributing guidelines](link-to-contributing) before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape Bolt
- Inspired by modern WebGL practices and patterns

## 💬 Support

For questions and support:
- 🐛 [GitHub Issues](link-to-issues)
- 💭 [Discord Community](link-to-discord)
- 📖 [Documentation](link-to-docs)

<!--[![NPM version][npm-image]][npm-url]
[![Actions Status][ci-image]][ci-url]
[![PR Welcome][npm-downloads-image]][npm-downloads-url]-->

