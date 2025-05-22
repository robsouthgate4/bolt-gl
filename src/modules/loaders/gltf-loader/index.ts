/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { mat4, quat, vec3, vec4 } from "gl-matrix";

import {
  Bolt,
  DrawSet,
  CLAMP_TO_EDGE,
  FLOAT,
  LINEAR,
  Mesh,
  Node,
  Program,
  Texture2D,
  Transform,
  GeometryBuffers,
  BACK,
  BYTE,
  UNSIGNED_BYTE,
  SHORT,
  UNSIGNED_SHORT,
  INT,
  UNSIGNED_INT,
} from "../../../index";

import SkinMesh from "./SkinMesh";
import Skin from "./Skin";
import skinVertexShader from "./shaders/skin/skin.vert";
import skinFragmentShader from "./shaders/skin/skin.frag";
import vertexShader from "./shaders/color/color.vert";
import fragmentShader from "./shaders/color/color.frag";
import { DracoDecoder } from "./draco-decoder";

export type TypedArray =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor // gl.UNSIGNED_BYTE
  | Int16ArrayConstructor // gl.SHORT
  | Uint16ArrayConstructor // gl.UNSIGNED_SHORT
  | Int32ArrayConstructor // gl.INT
  | Uint32ArrayConstructor // gl.UNSIGNED_INT
  | Float32ArrayConstructor;

/* Generated from official JSON schema using `npm run generate-interface`
 * on 2018-02-24
 */

// tslint:disable:quotemark
// tslint:disable:max-line-length

export type GlTfId = number;
/**
 * Indices of those attributes that deviate from their initialization value.
 */
export interface AccessorSparseIndices {
  /**
   * The index of the bufferView with sparse indices. Referenced bufferView can't have ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER target.
   */
  bufferView: GlTfId;
  /**
   * The offset relative to the start of the bufferView in bytes. Must be aligned.
   */
  byteOffset?: number;
  /**
   * The indices data type.
   */
  componentType: 5121 | 5123 | 5125 | number;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * Array of size `accessor.sparse.count` times number of components storing the displaced accessor attributes pointed by `accessor.sparse.indices`.
 */
export interface AccessorSparseValues {
  /**
   * The index of the bufferView with sparse values. Referenced bufferView can't have ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER target.
   */
  bufferView: GlTfId;
  /**
   * The offset relative to the start of the bufferView in bytes. Must be aligned.
   */
  byteOffset?: number;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * Sparse storage of attributes that deviate from their initialization value.
 */
export interface AccessorSparse {
  /**
   * Number of entries stored in the sparse array.
   */
  count: number;
  /**
   * Index array of size `count` that points to those accessor attributes that deviate from their initialization value. Indices must strictly increase.
   */
  indices: AccessorSparseIndices;
  /**
   * Array of size `count` times number of components, storing the displaced accessor attributes pointed by `indices`. Substituted values must have the same `componentType` and number of components as the base accessor.
   */
  values: AccessorSparseValues;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * A typed view into a bufferView.  A bufferView contains raw binary data.  An accessor provides a typed view into a bufferView or a subset of a bufferView similar to how WebGL's `vertexAttribPointer()` defines an attribute in a buffer.
 */
export interface Accessor {
  /**
   * The index of the bufferView.
   */
  bufferView?: GlTfId;
  /**
   * The offset relative to the start of the bufferView in bytes.
   */
  byteOffset?: number;
  /**
   * The datatype of components in the attribute.
   */
  componentType: 5120 | 5121 | 5122 | 5123 | 5125 | 5126 | number;
  /**
   * Specifies whether integer data values should be normalized.
   */
  normalized?: boolean;
  /**
   * The number of attributes referenced by this accessor.
   */
  count: number;
  /**
   * Specifies if the attribute is a scalar, vector, or matrix.
   */
  type: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4" | string;
  /**
   * Maximum value of each component in this attribute.
   */
  max?: number[];
  /**
   * Minimum value of each component in this attribute.
   */
  min?: number[];
  /**
   * Sparse storage of attributes that deviate from their initialization value.
   */
  sparse?: AccessorSparse;
  name?: any;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * The index of the node and TRS property that an animation channel targets.
 */
export interface AnimationChannelTarget {
  /**
   * The index of the node to target.
   */
  node?: GlTfId;
  /**
   * The name of the node's TRS property to modify, or the "weights" of the Morph Targets it instantiates. For the "translation" property, the values that are provided by the sampler are the translation along the x, y, and z axes. For the "rotation" property, the values are a quaternion in the order (x, y, z, w), where w is the scalar. For the "scale" property, the values are the scaling factors along the x, y, and z axes.
   */
  path: "translation" | "rotation" | "scale" | "weights" | string;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * Targets an animation's sampler at a node's property.
 */
export interface AnimationChannel {
  /**
   * The index of a sampler in this animation used to compute the value for the target.
   */
  sampler: GlTfId;
  /**
   * The index of the node and TRS property to target.
   */
  target: AnimationChannelTarget;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * Combines input and output accessors with an interpolation algorithm to define a keyframe graph (but not its target).
 */
export interface AnimationSampler {
  /**
   * The index of an accessor containing keyframe input values, e.g., time.
   */
  input: GlTfId;
  /**
   * Interpolation algorithm.
   */
  interpolation?: "LINEAR" | "STEP" | "CUBICSPLINE" | string;
  /**
   * The index of an accessor, containing keyframe output values.
   */
  output: GlTfId;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * A keyframe animation.
 */
export interface GLTFAnimation {
  /**
   * An array of channels, each of which targets an animation's sampler at a node's property. Different channels of the same animation can't have equal targets.
   */
  channels: AnimationChannel[];
  /**
   * An array of samplers that combines input and output accessors with an interpolation algorithm to define a keyframe graph (but not its target).
   */
  samplers: AnimationSampler[];
  name?: any;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * Metadata about the glTF asset.
 */
export interface Asset {
  /**
   * A copyright message suitable for display to credit the content creator.
   */
  copyright?: string;
  /**
   * Tool that generated this glTF model.  Useful for debugging.
   */
  generator?: string;
  /**
   * The glTF version that this asset targets.
   */
  version: string;
  /**
   * The minimum glTF version that this asset targets.
   */
  minVersion?: string;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * A buffer points to binary geometry, animation, or skins.
 */
export interface Buffer {
  /**
   * The uri of the buffer.
   */
  uri?: string;
  /**
   * The length of the buffer in bytes.
   */
  byteLength: number;
  name?: any;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * A view into a buffer generally representing a subset of the buffer.
 */
export interface BufferView {
  /**
   * The index of the buffer.
   */
  buffer: GlTfId;
  /**
   * The offset into the buffer in bytes.
   */
  byteOffset?: number;
  /**
   * The length of the bufferView in bytes.
   */
  byteLength: number;
  /**
   * The stride, in bytes.
   */
  byteStride?: number;
  /**
   * The target that the GPU buffer should be bound to.
   */
  target?: 34962 | 34963 | number;
  name?: any;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * An orthographic camera containing properties to create an orthographic projection matrix.
 */
export interface CameraOrthographic {
  /**
   * The floating-point horizontal magnification of the view. Must not be zero.
   */
  xmag: number;
  /**
   * The floating-point vertical magnification of the view. Must not be zero.
   */
  ymag: number;
  /**
   * The floating-point distance to the far clipping plane. `zfar` must be greater than `znear`.
   */
  zfar: number;
  /**
   * The floating-point distance to the near clipping plane.
   */
  znear: number;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * A perspective camera containing properties to create a perspective projection matrix.
 */
export interface CameraPerspective {
  /**
   * The floating-point aspect ratio of the field of view.
   */
  aspectRatio?: number;
  /**
   * The floating-point vertical field of view in radians.
   */
  yfov: number;
  /**
   * The floating-point distance to the far clipping plane.
   */
  zfar?: number;
  /**
   * The floating-point distance to the near clipping plane.
   */
  znear: number;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * A camera's projection.  A node can reference a camera to apply a transform to place the camera in the scene.
 */
export interface Camera {
  /**
   * An orthographic camera containing properties to create an orthographic projection matrix.
   */
  orthographic?: CameraOrthographic;
  /**
   * A perspective camera containing properties to create a perspective projection matrix.
   */
  perspective?: CameraPerspective;
  /**
   * Specifies if the camera uses a perspective or orthographic projection.
   */
  type: "perspective" | "orthographic" | string;
  name?: any;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * Image data used to create a texture. Image can be referenced by URI or `bufferView` index. `mimeType` is required in the latter case.
 */
export interface Image {
  /**
   * The uri of the image.
   */
  uri?: string;
  /**
   * The image's MIME type.
   */
  mimeType?: "image/jpeg" | "image/png" | string;
  /**
   * The index of the bufferView that contains the image. Use this instead of the image's uri property.
   */
  bufferView?: GlTfId;
  name?: any;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * Reference to a texture.
 */
export interface TextureInfo {
  /**
   * The index of the texture.
   */
  index: GlTfId;
  /**
   * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
   */
  texCoord?: number;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology.
 */
export interface MaterialPbrMetallicRoughness {
  /**
   * The material's base color factor.
   */
  baseColorFactor?: number[];
  /**
   * The base color texture.
   */
  baseColorTexture?: TextureInfo;
  /**
   * The metalness of the material.
   */
  metallicFactor?: number;
  /**
   * The roughness of the material.
   */
  roughnessFactor?: number;
  /**
   * The metallic-roughness texture.
   */
  metallicRoughnessTexture?: TextureInfo;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
export interface MaterialNormalTextureInfo {
  index?: any;
  texCoord?: any;
  /**
   * The scalar multiplier applied to each normal vector of the normal texture.
   */
  scale?: number;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
export interface MaterialOcclusionTextureInfo {
  index?: any;
  texCoord?: any;
  /**
   * A scalar multiplier controlling the amount of occlusion applied.
   */
  strength?: number;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * The material appearance of a primitive.
 */
export interface Material {
  name?: any;
  extensions?: any;
  extras?: any;
  /**
   * A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology. When not specified, all the default values of `pbrMetallicRoughness` apply.
   */
  pbrMetallicRoughness?: MaterialPbrMetallicRoughness;
  /**
   * The normal map texture.
   */
  normalTexture?: MaterialNormalTextureInfo;
  /**
   * The occlusion map texture.
   */
  occlusionTexture?: MaterialOcclusionTextureInfo;
  /**
   * The emissive map texture.
   */
  emissiveTexture?: TextureInfo;
  /**
   * The emissive color of the material.
   */
  emissiveFactor?: number[];
  /**
   * The alpha rendering mode of the material.
   */
  alphaMode?: "OPAQUE" | "MASK" | "BLEND" | string;
  /**
   * The alpha cutoff value of the material.
   */
  alphaCutoff?: number;
  /**
   * Specifies whether the material is double sided.
   */
  doubleSided?: boolean;
  [k: string]: any;
}
/**
 * Geometry to be rendered with the given material.
 */
export interface MeshPrimitive {
  /**
   * A dictionary object, where each key corresponds to mesh attribute semantic and each value is the index of the accessor containing attribute's data.
   */
  attributes: {
    [k: string]: GlTfId;
  };
  /**
   * The index of the accessor that contains the indices.
   */
  indices?: GlTfId;
  /**
   * The index of the material to apply to this primitive when rendering.
   */
  material?: GlTfId;
  /**
   * The type of primitives to render.
   */
  mode?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | number;
  /**
   * An array of Morph Targets, each  Morph Target is a dictionary mapping attributes (only `POSITION`, `NORMAL`, and `TANGENT` supported) to their deviations in the Morph Target.
   */
  targets?: {
    [k: string]: GlTfId;
  }[];
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * A set of primitives to be rendered.  A node can contain one mesh.  A node's transform places the mesh in the scene.
 */
export interface GLTFMesh {
  /**
   * An array of primitives, each defining geometry to be rendered with a material.
   */
  primitives: MeshPrimitive[];
  /**
   * Array of weights to be applied to the Morph Targets.
   */
  weights?: number[];
  name?: any;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * A node in the node hierarchy.  When the node contains `skin`, all `mesh.primitives` must contain `JOINTS_0` and `WEIGHTS_0` attributes.  A node can have either a `matrix` or any combination of `translation`/`rotation`/`scale` (TRS) properties. TRS properties are converted to matrices and postmultiplied in the `T * R * S` order to compose the transformation matrix; first the scale is applied to the vertices, then the rotation, and then the translation. If none are provided, the transform is the identity. When a node is targeted for animation (referenced by an animation.channel.target), only TRS properties may be present; `matrix` will not be present.
 */
export interface GLTFNode {
  /**
   * The index of the camera referenced by this node.
   */
  camera?: GlTfId;
  /**
   * The indices of this node's children.
   */
  children?: GlTfId[];
  /**
   * The index of the skin referenced by this node.
   */
  skin?: GlTfId;
  /**
   * A floating-point 4x4 transformation matrix stored in column-major order.
   */
  matrix?: number[];
  /**
   * The index of the mesh in this node.
   */
  mesh?: GlTfId;
  /**
   * The node's unit quaternion rotation in the order (x, y, z, w), where w is the scalar.
   */
  rotation?: number[];
  /**
   * The node's non-uniform scale, given as the scaling factors along the x, y, and z axes.
   */
  scale?: number[];
  /**
   * The node's translation along the x, y, and z axes.
   */
  translation?: number[];
  /**
   * The weights of the instantiated Morph Target. Number of elements must match number of Morph Targets of used mesh.
   */
  weights?: number[];
  name?: any;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * Texture sampler properties for filtering and wrapping modes.
 */
export interface Sampler {
  /**
   * Magnification filter.
   */
  magFilter?: 9728 | 9729 | number;
  /**
   * Minification filter.
   */
  minFilter?: 9728 | 9729 | 9984 | 9985 | 9986 | 9987 | number;
  /**
   * s wrapping mode.
   */
  wrapS?: 33071 | 33648 | 10497 | number;
  /**
   * t wrapping mode.
   */
  wrapT?: 33071 | 33648 | 10497 | number;
  name?: any;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * The root nodes of a scene.
 */
export interface Scene {
  /**
   * The indices of each root node.
   */
  nodes?: GlTfId[];
  name?: any;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * Joints and matrices defining a skin.
 */
export interface GLTFSkin {
  /**
   * The index of the accessor containing the floating-point 4x4 inverse-bind matrices.  The default is that each matrix is a 4x4 identity matrix, which implies that inverse-bind matrices were pre-applied.
   */
  inverseBindMatrices?: GlTfId;
  /**
   * The index of the node used as a skeleton root. When undefined, joints transforms resolve to scene root.
   */
  skeleton?: GlTfId;
  /**
   * Indices of skeleton nodes, used as joints in this skin.
   */
  joints: GlTfId[];
  name?: string | undefined;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * A texture and its sampler.
 */
export interface GLTFTexture {
  /**
   * The index of the sampler used by this texture. When undefined, a sampler with repeat wrapping and auto filtering should be used.
   */
  sampler?: GlTfId;
  /**
   * The index of the image used by this texture.
   */
  source?: GlTfId;
  name?: any;
  extensions?: any;
  extras?: any;
  [k: string]: any;
}
/**
 * The root object for a glTF asset.
 */
export interface GlTf {
  /**
   * Names of glTF extensions used somewhere in this asset.
   */
  extensionsUsed?: string[];
  /**
   * Names of glTF extensions required to properly load this asset.
   */
  extensionsRequired?: string[];
  /**
   * An array of accessors.
   */
  accessors?: Accessor[];
  /**
   * An array of keyframe animations.
   */
  animations?: Animation[];
  /**
   * Metadata about the glTF asset.
   */
  asset: Asset;
  /**
   * An array of buffers.
   */
  buffers?: Buffer[];
  /**
   * An array of bufferViews.
   */
  bufferViews?: BufferView[];
  /**
   * An array of cameras.
   */
  cameras?: Camera[];
  /**
   * An array of images.
   */
  images?: Image[];
  /**
   * An array of materials.
   */
  materials?: Material[];
  /**
   * An array of meshes.
   */
  meshes?: Mesh[];
  /**
   * An array of nodes.
   */
  nodes?: Node[];
  /**
   * An array of samplers.
   */
  samplers?: Sampler[];
  /**
   * The index of the default scene.
   */
  scene?: GlTfId;
  /**
   * An array of scenes.
   */
  scenes?: Scene[];
  /**
   * An array of skins.
   */
  skins?: Skin[];
  /**
   * An array of textures.
   */
  textures?: Texture2D[];
  extensions?: any;
  extras?: any;
  [k: string]: any;
}

/**
 * Root for each animation
 */
export interface Animation {
  [name: string]: Channel;
}

/**
 * List of keyframes for each animation
 */
export interface Channel {
  [key: number]: Transform;
}

/**
 * Animation keyFrames
 */
export interface GLTFTransform {
  translation: KeyFrame[];
  rotation: KeyFrame[];
  scale: KeyFrame[];
}

export interface GLTFScene {
  scene: Node;
  loader: GLTFLoader;
}

/**
 * Transform executed at specific time.
 */
export interface KeyFrame {
  time: number;
  transform: vec3 | quat;
  type: "translation" | "rotation" | "scale";
}

enum BufferType {
  Float = 5126,
  Short = 5123,
}

interface Buffer {
  data: Float32Array | Int16Array;
  size: number;
  type: string;
  componentType: BufferType;
  glBuffer: WebGLBuffer;
}

export default class GLTFLoader {
  private _accessorSize: { [key: string]: number } = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
  };

  private _typedArrayMap: { [key: string]: TypedArray } = {
    "5120": Int8Array,
    "5121": Uint8Array,
    "5122": Int16Array,
    "5123": Uint16Array,
    "5124": Int32Array,
    "5125": Uint32Array,
    "5126": Float32Array,
  };

  private _path!: string;
  private _materials!: Program[];
  private _textures!: Texture2D[];
  private _scene!: Node;
  private _skins!: Skin[];
  private _nodes!: {
    id: number;
    node: Node;
    mesh: number | undefined;
    skin: number | undefined;
    localBindTransform: Transform;
    animatedTransform: mat4;
    children: number[];
  }[];
  private _drawSets!: (DrawSet | undefined)[][];
  private _skinNodes!: {
    nodeIndex: number;
    skinIndex: number;
    meshIndex?: number;
  }[];
  private _json!: GlTf;
  private _flattenHierarchy: boolean;
  private _drawSetsFlattened: DrawSet[];

  constructor(flattenHierarchy = false) {
    // this._irradianceMap = environmentMaps.irradianceMap || undefined;
    // this._radianceMap = environmentMaps.radianceMap || undefined;
    this._flattenHierarchy = flattenHierarchy;
    this._drawSetsFlattened = [];
  }

  async load(url: string) {
    const file = url.split("\\").pop().split("/").pop() || "";
    const path = url.split("/").slice(0, -1).join("/") + "/";

    this._path = path;

    if (!file.match(/\.glb/)) {
      this._json = await fetch(url).then((res) => res.json());
    } else {
      this._json = await fetch(url)
        .then((res) => res.arrayBuffer())
        .then((glb) => this._decodeGLB(glb));
    }

    if (
      this._json.extensionsRequired &&
      this._json.extensionsRequired.includes("KHR_draco_mesh_compression")
    ) {
      console.log("draco compression detected");
      const decoder = new DracoDecoder();
      await decoder.ready();
    }

    if (
      this._json.accessors === undefined ||
      this._json.accessors.length === 0
    ) {
      throw new Error("GLTF File is missing accessors");
    }

    // grab buffers
    const buffers = await Promise.all(
      this._json.buffers.map(
        async (buffer) => await this._fetchBuffer(url, buffer as BufferView)
      )
    );

    this._skinNodes = [];

    // arrange nodes with correct transforms
    this._nodes = this._json.nodes.map((node, index) =>
      this._parseNode(index, node)
    );

    this._animations = {} as Animation;

    this._json.animations &&
      this._json.animations.forEach((animation: GLTFAnimation) => {
        this._animations[animation.name as string] = this._parseAnimations(
          animation,
          this._json,
          buffers
        );
      });

    // map textures
    if (this._json.textures !== undefined) {
      this._textures = await Promise.all(
        this._json.textures.map(
          async (texture) => await this._parseTexture(this._json, texture)
        )
      );
    }

    // map skins
    if (this._json.skins !== undefined) {
      this._skins = this._json.skins.map((skin: GLTFSkin) =>
        this._parseSkin(this._json, skin, buffers)
      );
    }

    // map materials
    if (this._json.materials !== undefined) {
      this._materials = this._json.materials.map(
        (material: Material, index: number) =>
          this._parseMaterials(this._json, material, index)
      );
    }

    // map batches
    this._drawSets = this._json.meshes.map((mesh, index) =>
      this._parseDrawSet(this._json, mesh, buffers, index)
    );

    // arrange scene graph
    this._nodes.forEach((node: GLTFNode, i: number) => {
      const children = node.children;

      if (node.skin !== undefined) {
        if (node.mesh != undefined) {
          this._skinNodes.push({
            nodeIndex: i,
            skinIndex: node.skin,
            meshIndex: node.mesh,
          });
        } else {
          this._skinNodes.push({ nodeIndex: i, skinIndex: node.skin });
        }
      } else {
        if (node.mesh !== undefined) {
          const b = this._drawSets[node.mesh];

          b.forEach((drawset?: DrawSet) => {
            drawset?.setParent(this._nodes[i].node);
          });
        }
      }

      // set parent nodes
      if (children !== undefined && children.length > 0) {
        children.forEach((childIndex: number) => {
          const n = this._nodes[childIndex];

          n.node.setParent(this._nodes[i].node);
        });
      }
    });

    this._skinNodes.forEach(
      (skinNode: {
        nodeIndex: number;
        skinIndex: number;
        meshIndex?: number;
      }) => {
        const skin = this._skins[skinNode.skinIndex];

        const mesh = skinNode.meshIndex;
        const nodeIndex = skinNode.nodeIndex;

        if (mesh !== undefined) {
          const ds = this._drawSets[mesh];

          if (ds !== undefined) {
            ds.forEach((drawset?: DrawSet) => {
              const mesh = drawset!.mesh as SkinMesh;
              mesh.skin = skin;
              mesh.createTexture(skin);
              drawset?.setParent(this._nodes[nodeIndex].node);
            });
          }
        }
      }
    );

    this._scene = new Node();

    this._json.scenes.forEach((scene) => {
      this._scene.name = scene.name;

      //console.log(scene.nodes[0]);

      scene.nodes?.forEach((childNode) => {
        const child = this._nodes[childNode];
        child.node.setParent(this._scene);
      });
    });

    return this._scene;
  }

  _parseAnimations(
    animation: GLTFAnimation,
    json: GlTf,
    buffers: ArrayBufferLike[]
  ): Channel {
    const channels = animation.channels.map((channel) => {
      // get the sampler information for this channel
      const sampler = animation.samplers[channel.sampler];

      // get the time data for the animation
      const time = this._getBufferFromFile(
        json,
        buffers,
        json.accessors[sampler.input]
      );

      // get the buffer data for the animation
      const buffer = this._getBufferFromFile(
        json,
        buffers,
        json.accessors[sampler.output]
      );

      return {
        node: channel.target.node, // node to animate
        type: channel.target.path, // type of animation (translation, rotation, scale)
        time: time, // time data for the animation
        buffer, // buffer data for the animation
        interpolation: sampler.interpolation ? sampler.interpolation : "LINEAR", // interpolation type for the animation
      };
    });

    const c: Channel = {};

    // construct transform data for each node at each frame of animation
    channels.forEach((channel) => {
      if (c[channel.node] === undefined) {
        // store the jointnode that needs to be animated
        const jointNode = this._nodes[channel.node].node;

        c[channel.node] = {
          node: jointNode,
          translation: [],
          rotation: [],
          scale: [],
        };
      }

      // store the transform data for each frame of animation
      for (let i = 0; i < channel.time.data.length; i++) {
        const size =
          channel.interpolation === "CUBICSPLINE"
            ? channel.buffer.size * 3
            : channel.buffer.size;

        const offset =
          channel.interpolation === "CUBICSPLINE" ? channel.buffer.size : 0;

        const transform =
          channel.type === "rotation"
            ? quat.fromValues(
                channel.buffer.data[i * size + offset],
                channel.buffer.data[i * size + offset + 1],
                channel.buffer.data[i * size + offset + 2],
                channel.buffer.data[i * size + offset + 3]
              )
            : vec3.fromValues(
                channel.buffer.data[i * size + offset],
                channel.buffer.data[i * size + offset + 1],
                channel.buffer.data[i * size + offset + 2]
              );

        c[channel.node][channel.type].push({
          time: channel.time.data[i],
          transform,
          type: channel.type,
        } as Keyframe);
      }
    });

    return c;
  }

  _parseSkin(gltf: GlTf, skin: GLTFSkin, buffers: ArrayBufferLike[]): Skin {
    const bindTransforms = this._getBufferFromFile(
      gltf,
      buffers,
      gltf.accessors[skin.inverseBindMatrices]
    );
    const joints = skin.joints.map((ndx) => {
      const jointNode = this._nodes[ndx].node;
      jointNode.isJoint = true;
      return jointNode;
    });
    return new Skin(joints, Float32Array.from(bindTransforms.data));
  }

  _parseNode(index: number, node: GLTFNode) {
    const { name, translation, rotation, scale, mesh, children, skin } = node;

    const trs = new Transform();
    trs.position = translation
      ? vec3.fromValues(translation[0], translation[1], translation[2])
      : vec3.fromValues(0, 0, 0);
    trs.quaternion = rotation
      ? quat.fromValues(rotation[0], rotation[1], rotation[2], rotation[3])
      : quat.fromValues(0, 0, 0, 1);
    trs.scale = scale
      ? vec3.fromValues(scale[0], scale[1], scale[2])
      : vec3.fromValues(1, 1, 1);

    const n = new Node();
    n.name = name;
    n.transform = trs;

    node.skin = skin;

    return {
      id: index,
      node: n,
      mesh,
      skin,
      localBindTransform: trs,
      animatedTransform: mat4.create(),
      children: children || [],
    };
  }

  _parseDrawSet(
    gltf: GlTf,
    mesh: GLTFMesh,
    buffers: ArrayBufferLike[],
    index: number
  ) {
    const node = this._nodes.find((n) => n.mesh === index);

    return mesh.primitives.map((primitive) => {
      if (
        primitive.extensions &&
        primitive.extensions.KHR_draco_mesh_compression
      ) {
        const dracoExtension = primitive.extensions.KHR_draco_mesh_compression;

        const dracoDecoder = new DracoDecoder();

        if (dracoDecoder !== undefined && Object.isFrozen(dracoDecoder)) {
          const dracoBufferViewIDX = dracoExtension.bufferView;

          const origGltfDrBufViewObj = gltf.bufferViews[dracoBufferViewIDX];
          const origGltfDracoBuffer = gltf.buffers[origGltfDrBufViewObj.buffer];

          const totalBuffer = new Int8Array(origGltfDracoBuffer.binary);

          const actualBuffer = totalBuffer.slice(
            origGltfDrBufViewObj.byteOffset,
            origGltfDrBufViewObj.byteOffset + origGltfDrBufViewObj.byteLength
          );

          // decode draco buffer to geometry intermediate
          const dracoDecoder = new DracoDecoder();
          const draco = dracoDecoder.module;

          const decoder = new draco.Decoder();
          const decoderBuffer = new draco.DecoderBuffer();
          decoderBuffer.Init(actualBuffer, origGltfDrBufViewObj.byteLength);

          const dracoGeometry = this._decodeGeometry(
            draco,
            decoder,
            decoderBuffer,
            dracoExtension.attributes,
            gltf,
            primitive
          );

          draco.destroy(decoderBuffer);

          const geometry: GeometryBuffers = {
            positions: dracoGeometry.attributes.POSITION.array as Float32Array,
            normals: dracoGeometry.attributes.NORMAL
              ? (dracoGeometry.attributes.NORMAL.array as Float32Array)
              : undefined,
            uvs: dracoGeometry.attributes.TEXCOORD_0
              ? (dracoGeometry.attributes.TEXCOORD_0.array as Float32Array)
              : undefined,
            uvs2: dracoGeometry.attributes.TEXCOORD_1
              ? (dracoGeometry.attributes.TEXCOORD_1.array as Float32Array)
              : undefined,
            indices: dracoGeometry.index
              ? (dracoGeometry.index.array as Uint16Array)
              : undefined,
          };

          // get joints from buffer
          const joints = dracoGeometry.attributes.JOINTS_0 || undefined;

          const weights = dracoGeometry.attributes.WEIGHTS_0 || undefined;

          let m: Mesh | SkinMesh;

          const prog =
            this._materials && primitive.material !== undefined
              ? this._materials[primitive.material as number]
              : new Program(vertexShader, fragmentShader);

          if (node && node.skin !== undefined) {
            console.log("skinned mesh detected");

            // form skinned mesh data if joints defined
            m = new SkinMesh(geometry);

            m.setAttribute(Float32Array.from(joints.array), joints.itemSize, 5);
            m.setAttribute(weights.array, weights.itemSize, 6);
          } else {
            m = new Mesh(geometry);
          }

          const ds = new DrawSet(m, prog);
          ds.name = mesh.name;

          this._drawSetsFlattened.push(ds);

          return ds;
        }
      } else {
        if (primitive.indices !== undefined) {
          // get index accessor
          const indexAccesor = gltf.accessors[primitive.indices];

          const uvs =
            this._getBufferByAttribute(
              gltf,
              buffers,
              mesh,
              primitive,
              "TEXCOORD_0"
            ) || undefined;

          const uvs2 =
            this._getBufferByAttribute(
              gltf,
              buffers,
              mesh,
              primitive,
              "TEXCOORD_1"
            ) || undefined;

          const normals =
            this._getBufferByAttribute(
              gltf,
              buffers,
              mesh,
              primitive,
              "NORMAL"
            ) || undefined;

          const indices =
            this._getBufferFromFile(gltf, buffers, indexAccesor) || undefined;

          const positions =
            this._getBufferByAttribute(
              gltf,
              buffers,
              mesh,
              primitive,
              "POSITION"
            ) || undefined;

          // form bolt default geo buffers
          const geometry: GeometryBuffers = {
            // every geometry should have position data by default
            positions: positions.data as Float32Array,
            normals: normals ? (normals.data as Float32Array) : undefined,
            uvs: uvs ? (uvs.data as Float32Array) : undefined,
            uvs2: uvs2 ? (uvs2.data as Float32Array) : undefined,
            indices: indices ? (indices.data as Int16Array) : undefined,
          };

          // get joints from buffer
          const joints =
            this._getBufferByAttribute(
              gltf,
              buffers,
              mesh,
              primitive,
              "JOINTS_0"
            ) || undefined;

          // get weights from buffer
          const weights =
            this._getBufferByAttribute(
              gltf,
              buffers,
              mesh,
              primitive,
              "WEIGHTS_0"
            ) || undefined;

          let m: Mesh | SkinMesh;

          const prog =
            this._materials && primitive.material !== undefined
              ? this._materials[primitive.material as number]
              : new Program(vertexShader, fragmentShader);

          if (node && node.skin !== undefined) {
            console.log("skinned mesh detected");
            // form skinned mesh data if joints defined
            m = new SkinMesh(geometry);

            m.setAttribute(Float32Array.from(joints.data), joints.size, 5);
            m.setAttribute(weights.data, weights.size, 6);
          } else {
            m = new Mesh(geometry);
          }

          const ds = new DrawSet(m, prog);
          ds.name = m.name;

          // for non-hierarchical gltf files
          this._drawSetsFlattened.push(ds);

          return ds;
        }
      }
    });
  }

  _parseMaterials(gltf: GlTf, material: Material, index: number): Program {
    //TODO:Full PBR program setup

    let hasSkin = false;

    // determine whether this material has skinning
    this._nodes.forEach((node) => {
      if (node.mesh !== undefined) {
        const mesh = gltf.meshes[node.mesh];
        mesh.primitives.forEach((primitive) => {
          if (primitive.material === index) {
            node.skin !== undefined ? (hasSkin = true) : (hasSkin = false);
          }
        });
      }
    });

    // get the program for this material
    const program = hasSkin
      ? new Program(skinVertexShader, skinFragmentShader)
      : new Program(vertexShader, fragmentShader);

    program.name = material.name;

    program.cullFace = BACK;

    if (material.extensions !== undefined) {
      if (
        material.extensions.KHR_materials_pbrSpecularGlossiness !== undefined
      ) {
        console.warn(
          "pbr specular glossiness not supported by Bolt, please use the metallic roughness workflow"
        );
      }
    }

    if (material.pbrMetallicRoughness !== undefined) {
      const { baseColorTexture, baseColorFactor, metallicRoughnessTexture } =
        material.pbrMetallicRoughness;

      // program.setTexture( "mapAlbedo", new Texture2D() );
      // program.setTexture( "mapRadiance", this._radianceMap );
      // program.setTexture( "mapIrradiance", this._irradianceMap );

      program.activate();
      //program.setTexture("jointTexture", t, 0);
      // if (baseColorTexture !== undefined) {
      //   program.setTexture("mapAlbedo", this._textures[baseColorTexture.index]);
      // }

      // if (metallicRoughnessTexture !== undefined) {
      //   program.setTexture(
      //     "mapMetallicRoughness",
      //     this._textures[metallicRoughnessTexture.index]
      //   );
      // }

      if (baseColorFactor !== undefined) {
        program.setVector4(
          "baseColorFactor",
          vec4.fromValues(
            baseColorFactor[0],
            baseColorFactor[1],
            baseColorFactor[2],
            baseColorFactor[3]
          )
        );
      }
    }

    // if (material.normalTexture !== undefined) {
    //   program.activate();
    //   program.setTexture(
    //     "mapNormal",
    //     this._textures[material.normalTexture.index]
    //   );
    // }

    return program;
  }

  async _parseTexture(gltf: GlTf, texture: GLTFTexture) {
    const t = gltf.images[texture.source];
    const s = gltf.samplers[texture.sampler];

    let boltTexture = new Texture2D();

    if (t.bufferView !== undefined) {
      const bufferView = gltf.bufferViews[t.bufferView];

      const data = gltf.buffers[bufferView.buffer].binary;

      const blob = new Blob([
        new Uint8Array(data, bufferView.byteOffset, bufferView.byteLength),
      ]);

      const image = new Image();

      image.src = URL.createObjectURL(blob);

      await image.decode();

      boltTexture = new Texture2D({
        imagePath: image.src,
        wrapS: s.wrapS || CLAMP_TO_EDGE,
        wrapT: s.wrapT || CLAMP_TO_EDGE,
      });

      boltTexture.flipY = false;

      await boltTexture.load();
    }

    if (t.uri !== undefined) {
      boltTexture = new Texture2D({
        imagePath: this._path + t.uri,
        wrapS: s.wrapS || CLAMP_TO_EDGE,
        wrapT: s.wrapT || CLAMP_TO_EDGE,
      });

      boltTexture.flipY = false;

      boltTexture.minFilter = s.minFilter || LINEAR;
      boltTexture.magFilter = s.magFilter || LINEAR;

      await boltTexture.load();
    }

    return boltTexture;
  }

  /**
   * @param  {string} path
   * @param  {BufferView} buffer
   * Returns buffers from either a .bin file or the binary property from .glb
   */
  async _fetchBuffer(path: string, buffer: BufferView) {
    if (buffer.binary) return buffer.binary;

    const dir = path.split("/").slice(0, -1).join("/");
    const response = await fetch(`${dir}/${buffer.uri}`);

    return await response.arrayBuffer();
  }

  _getBufferFromFile(gltf: GlTf, buffers: ArrayBuffer[], accessor: Accessor) {
    const bufferView = gltf.bufferViews[<number>accessor.bufferView];

    const type = accessor.type;

    // size of each component in the buffer
    const size = this._accessorSize[type];

    // component type as number
    const componentType = accessor.componentType;

    // get the array buffer type from map and fetch relevant data
    const data = new this._typedArrayMap[componentType](
      buffers[bufferView.buffer],
      (accessor.byteOffset || 0) + (bufferView.byteOffset || 0),
      accessor.count * size
    ) as ArrayBuffer;

    return {
      size,
      data,
      componentType,
      type,
    } as Buffer;
  }

  _getBufferByAttribute(
    gltf: GlTf,
    buffers: ArrayBuffer[],
    mesh: GLTFMesh,
    primitive: MeshPrimitive,
    attributeName: string
  ) {
    if (primitive.attributes[attributeName] === undefined) return;

    const accessor = this._getAccessor(gltf, mesh, primitive, attributeName);

    const bufferData = this._getBufferFromFile(gltf, buffers, accessor);
    return bufferData;
  }

  _getAccessor = (
    gltf: GlTf,
    mesh: GLTFMesh,
    primitive: MeshPrimitive,
    attributeName: string
  ) => {
    const attribute = primitive.attributes[attributeName];
    return gltf.accessors[attribute];
  };

  _decodeGLB(glb: ArrayBufferLike) {
    // Decode and verify GLB header.
    const header = new Uint32Array(glb, 0, 3);
    if (header[0] !== 0x46546c67) {
      throw new Error("Invalid glTF asset.");
    } else if (header[1] !== 2) {
      throw new Error(`Unsupported glTF binary version, "${header[1]}".`);
    }

    // Decode and verify chunk headers.
    const jsonChunkHeader = new Uint32Array(glb, 12, 2);
    const jsonByteOffset = 20;
    const jsonByteLength = jsonChunkHeader[0];
    if (jsonChunkHeader[1] !== 0x4e4f534a) {
      throw new Error("Unexpected GLB layout.");
    }

    // Decode JSON.
    const jsonText = new TextDecoder().decode(
      glb.slice(jsonByteOffset, jsonByteOffset + jsonByteLength)
    );
    const json = JSON.parse(jsonText);
    // JSON only
    if (jsonByteOffset + jsonByteLength === glb.byteLength) return json;

    const binaryChunkHeader = new Uint32Array(
      glb,
      jsonByteOffset + jsonByteLength,
      2
    );
    if (binaryChunkHeader[1] !== 0x004e4942) {
      throw new Error("Unexpected GLB layout.");
    }

    // Decode content.
    const binaryByteOffset = jsonByteOffset + jsonByteLength + 8;
    const binaryByteLength = binaryChunkHeader[0];
    const binary = glb.slice(
      binaryByteOffset,
      binaryByteOffset + binaryByteLength
    );
    // Attach binary to buffer
    json.buffers[0].binary = binary;
    return json;
  }

  _decodeGeometry(
    draco,
    decoder,
    decoderBuffer,
    gltfDracoAttributes,
    gltf,
    primitive
  ) {
    let dracoGeometry;
    let decodingStatus;

    // decode mesh in draco decoder
    const geometryType = decoder.GetEncodedGeometryType(decoderBuffer);
    if (geometryType === draco.TRIANGULAR_MESH) {
      dracoGeometry = new draco.Mesh();
      decodingStatus = decoder.DecodeBufferToMesh(decoderBuffer, dracoGeometry);
    } else {
      throw new Error("DRACOLoader: Unexpected geometry type.");
    }

    if (!decodingStatus.ok() || dracoGeometry.ptr === 0) {
      throw new Error(
        "DRACOLoader: Decoding failed: " + decodingStatus.error_msg()
      );
    }

    const geometry = { index: null, attributes: {} };
    const vertexCount = dracoGeometry.num_points();

    // Gather all vertex attributes.
    for (const dracoAttr in gltfDracoAttributes) {
      let componentType = "Int8Array"; // defualt
      let accessorVertexCount;

      // find gltf accessor for this draco attribute
      for (const [key, value] of Object.entries(primitive.attributes)) {
        if (key === dracoAttr) {
          componentType = gltf.accessors[value as number].componentType;
          accessorVertexCount = gltf.accessors[value as number].count;
          break;
        }
      }

      // check if vertex count matches
      if (vertexCount !== accessorVertexCount) {
        throw new Error(
          `DRACOLoader: Accessor vertex count ${accessorVertexCount} does not match draco decoder vertex count  ${vertexCount}`
        );
      }

      componentType = this._getDracoArrayTypeFromComponentType(componentType);

      const dracoAttribute = decoder.GetAttributeByUniqueId(
        dracoGeometry,
        gltfDracoAttributes[dracoAttr]
      );
      const tmpObj = this._decodeAttribute(
        draco,
        decoder,
        dracoGeometry,
        dracoAttr,
        dracoAttribute,
        componentType
      );
      geometry.attributes[tmpObj.name] = tmpObj;
    }

    // Add index buffer
    if (geometryType === draco.TRIANGULAR_MESH) {
      // Generate mesh faces.
      const numFaces = dracoGeometry.num_faces();
      const numIndices = numFaces * 3;
      const dataSize = numIndices * 4;
      const ptr = draco._malloc(dataSize);
      decoder.GetTrianglesUInt32Array(dracoGeometry, dataSize, ptr);
      const index = new Uint32Array(
        draco.HEAPU32.buffer,
        ptr,
        numIndices
      ).slice();
      draco._free(ptr);

      geometry.index = { array: index, itemSize: 1 };
    }

    draco.destroy(dracoGeometry);
    return geometry;
  }

  _getDracoArrayTypeFromComponentType(componentType): string {
    switch (componentType) {
      case BYTE:
        return "Int8Array";
      case UNSIGNED_BYTE:
        return "Uint8Array";
      case SHORT:
        return "Int16Array";
      case UNSIGNED_SHORT:
        return "Uint16Array";
      case INT:
        return "Int32Array";
      case UNSIGNED_INT:
        return "Uint32Array";
      case FLOAT:
        return "Float32Array";
      default:
        return "Float32Array";
    }
  }

  _decodeAttribute(
    draco,
    decoder,
    dracoGeometry,
    attributeName,
    attribute,
    attributeType
  ) {
    const numComponents = attribute.num_components();
    const numPoints = dracoGeometry.num_points();
    const numValues = numPoints * numComponents;

    let ptr;
    let array;

    let dataSize;
    switch (attributeType) {
      case "Float32Array":
        dataSize = numValues * 4;
        ptr = draco._malloc(dataSize);
        decoder.GetAttributeDataArrayForAllPoints(
          dracoGeometry,
          attribute,
          draco.DT_FLOAT32,
          dataSize,
          ptr
        );
        array = new Float32Array(draco.HEAPF32.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case "Int8Array":
        ptr = draco._malloc(numValues);
        decoder.GetAttributeDataArrayForAllPoints(
          dracoGeometry,
          attribute,
          draco.DT_INT8,
          numValues,
          ptr
        );
        array = new Int8Array(draco.HEAP8.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case "Int16Array":
        dataSize = numValues * 2;
        ptr = draco._malloc(dataSize);
        decoder.GetAttributeDataArrayForAllPoints(
          dracoGeometry,
          attribute,
          draco.DT_INT16,
          dataSize,
          ptr
        );
        array = new Int16Array(draco.HEAP16.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case "Int32Array":
        dataSize = numValues * 4;
        ptr = draco._malloc(dataSize);
        decoder.GetAttributeDataArrayForAllPoints(
          dracoGeometry,
          attribute,
          draco.DT_INT32,
          dataSize,
          ptr
        );
        array = new Int32Array(draco.HEAP32.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case "Uint8Array":
        ptr = draco._malloc(numValues);
        decoder.GetAttributeDataArrayForAllPoints(
          dracoGeometry,
          attribute,
          draco.DT_UINT8,
          numValues,
          ptr
        );
        array = new Uint8Array(draco.HEAPU8.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case "Uint16Array":
        dataSize = numValues * 2;
        ptr = draco._malloc(dataSize);
        decoder.GetAttributeDataArrayForAllPoints(
          dracoGeometry,
          attribute,
          draco.DT_UINT16,
          dataSize,
          ptr
        );
        array = new Uint16Array(draco.HEAPU16.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case "Uint32Array":
        dataSize = numValues * 4;
        ptr = draco._malloc(dataSize);
        decoder.GetAttributeDataArrayForAllPoints(
          dracoGeometry,
          attribute,
          draco.DT_UINT32,
          dataSize,
          ptr
        );
        array = new Uint32Array(draco.HEAPU32.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      default:
        throw new Error("DRACOLoader: Unexpected attribute type.");
    }

    return {
      name: attributeName,
      array: array,
      itemSize: numComponents,
      componentType: attributeType,
    };
  }

  public get drawSetsFlattened(): DrawSet[] {
    return this._drawSetsFlattened;
  }

  public set drawSetsFlattened(value: DrawSet[]) {
    this._drawSetsFlattened = value;
  }

  public get animations(): Channel {
    return this._animations;
  }
}
