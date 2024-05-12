/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import pMap from "p-map";

import parseHdr from "../hdr-parse";
import GLTFLoader from "../gltf-loader";
import { Bolt, FLOAT, RGBA, RGBA16F, Texture2D, TextureCube } from "bolt-gl";

interface QueueItem {
  url: string;
  type: string;
}

export enum AssetType {
  TEXTURE,
  TEXTURE_CUBE,
  GLTF,
  AUDIO,
  VIDEO,
  HDR,
}

export default class AssetCache {
  private static _instance: AssetCache;

  private _queueItems: QueueItem[] = [];
  // eslint-disable-next-line @typescript-eslint/ban-types
  private _cacheObj: {} = {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  private _onProgressListeners: Function[] = [];
  private _logs: any[] = [];
  private _debug = false;
  private _bolt = Bolt.getInstance();

  static getInstance() {
    if (!AssetCache._instance) AssetCache._instance = new AssetCache();
    return AssetCache._instance;
  }

  init(assets) {
    if (assets) {
      Object.values(assets).forEach((group) => {
        Object.entries(group).forEach(([key, value]) => {
          group[key] = this.queue({
            url: value.url,
            type: value.type,
            options: value.options,
          });
        });
      });
    }
  }

  addProgressListener(fn) {
    if (typeof fn !== "function") {
      throw new TypeError("onProgress must be a function");
    }

    this._onProgressListeners.push(fn);
  }

  // Add an asset to be queued, input: { url, type, ...options }
  queue({ url, type, options }) {
    if (!url)
      throw new TypeError(
        "Must specify a URL or opt.url for AssetCache.queue()"
      );
    if (!this._getQueued(url)) {
      const queueItem: QueueItem = {
        url,
        type: type || this._extractType(url),
        options: options || {},
      };

      this._queueItems.push(queueItem);
    }

    return url;
  }

  private _getQueued(url) {
    return this._queueItems.find((item) => item.url === url);
  }

  private _extractType(url) {
    const ext = url.slice(url.lastIndexOf("."));

    switch (true) {
      case /\.(gltf|glb)$/i.test(ext):
        return AssetType.GLTF;
      case /\.(jpe?g|png|webp)$/i.test(ext):
        return AssetType.TEXTURE;
      case /\.(wav|mp3)$/i.test(ext):
        return AssetType.AUDIO;
      case /\.(mp4|webm|ogg|ogv)$/i.test(ext):
        return AssetType.VIDEO;
      case /\.(hdr)$/i.test(ext):
        return AssetType.HDR;
      default:
        throw new Error(`Could not load ${url}, unknown file extension!`);
    }
  }

  // Fetch a loaded asset by URL
  get<T>(url): T {
    if (!url) throw new TypeError("Must specify an URL for AssetCache.get()");
    if (!(url in this._cacheObj)) {
      throw new Error(`The asset ${url} is not in the loaded files.`);
    }

    return this._cacheObj[url];
  }

  // Loads a single asset
  async loadSingle(item: { url: string; type: AssetType }) {
    const queueItem = this._getQueued(item);
    try {
      this._cacheObj[queueItem.url] = await this._loadItem({
        url: queueItem.url,
        type: queueItem.type,
        options: queueItem.options,
      });
      if (this._debug) {
        console.log(
          `ð¦ Loaded single asset ${queueItem.url}}`,
          "color:blue",
          "color:black"
        );
      }

      return queueItem.url;
    } catch (err) {
      delete this._cacheObj[queueItem.url];
      console.error(`ð¦  Could not load ${queueItem.url}:\n${err}`);
    }
  }

  // Loads all queued assets
  async load(concurrency = 5) {
    const queue = this._queueItems.slice();
    this._queueItems.length = 0; // clear queue

    const total = queue.length;
    if (total === 0) {
      // resolve first this functions and then call the progress listeners
      setTimeout(() => this._onProgressListeners.forEach((fn) => fn(1)), 0);
      return;
    }

    const loadingStart = Date.now();

    await pMap(
      queue,
      async (item, i) => {
        try {
          this._cacheObj[item.url] = await this._loadItem({ ...item });

          if (this._debug) {
            this._log(`Loaded ${item.url}}`, "color:blue", "color:black");
          }
        } catch (err) {
          this._logError(`Skipping ${item.url} from asset loading:\n${err}`);
        }

        const percent = (i + 1) / total;
        this._onProgressListeners.forEach((fn) => fn(percent));
      },
      { concurrency }
    );

    if (this._debug) {
      const errors = this._logs.filter((log) => log.type === "error");

      this._groupLog(
        `ð¦ Assets loaded in ${Date.now() - loadingStart} â± ${
          errors.length > 0
            ? `%c â ï¸ Skipped ${errors.length} asset${
                errors.length > 1 ? "s" : ""
              } `
            : ""
        }`,
        errors.length > 0 ? "color:white;background:red;" : ""
      );
    }
  }

  // Loads a single asset on demand, returning from
  // cache if it exists otherwise adding it to the cache
  // after loading.
  private async _loadItem({ url, type, options }) {
    if (url in this._cacheObj) {
      return this._cacheObj[url];
    }

    switch (type) {
      case AssetType.GLTF:
        const loader = new GLTFLoader(this._bolt, false);
        const gltfNode = await loader.load(url);
        return { scene: gltfNode, loader: loader };
      case AssetType.TEXTURE:
        const texture = new Texture2D({
          imagePath: url,
          flipY: options.flipY,
          minFilter: options.minFilter,
          magFilter: options.magFilter,
        });
        await texture.load();
        return texture;

      case AssetType.TEXTURE_CUBE:
        const textureCube = new TextureCube({ imagePath: url });
        await textureCube.load();
        return textureCube;

      case AssetType.AUDIO:
        return fetch(url).then((response) => response.arrayBuffer());

      case AssetType.VIDEO:
        return fetch(url).then((response) => response.blob());

      case AssetType.HDR:
        const hdrLoad = await fetch(url);
        const hdriBuffer = await hdrLoad.arrayBuffer();
        const hdrParsed = parseHdr(hdriBuffer);

        const hdrTexture = new Texture2D({
          internalFormat: RGBA16F,
          format: RGBA,
          type: FLOAT,
          generateMipmaps: false,
        });

        hdrTexture.setFromData(
          hdrParsed.data,
          hdrParsed.shape[0],
          hdrParsed.shape[1]
        );

        return hdrTexture;

      default:
        throw new Error(`Could not load ${url}, the type ${type} is unknown!`);
    }
  }

  private _log(...text) {
    this._logs.push({ type: "log", text });
  }

  private _logError(...text) {
    this._logs.push({ type: "error", text });
  }

  private _groupLog(...text) {
    console.groupCollapsed(...text);
    this._logs.forEach((log) => {
      console[log.type](...log.text);
    });
    console.groupEnd();

    this._logs.length = 0; // clear logs
  }

  public get queueItems(): QueueItem[] {
    return this._queueItems;
  }
}
