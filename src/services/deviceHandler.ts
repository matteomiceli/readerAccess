import { device } from "./types.js";

// file handler goes here
export class DeviceHandler {
  device: device | null = null;
  handle: null | FileSystemDirectoryHandle = null;

  async init() {
    this.handle = await this.pickDir();
    this.handle.requestPermission({ mode: "readwrite" });
    this.device = this.getDeviceType(this.handle.name);
  }

  async pickDir() {
    return window.showDirectoryPicker();
  }

  getDeviceType(name: string): device | null {
    if (name.toLowerCase().includes("kobo")) {
      return device.kobo;
    }
    if (name.toLowerCase().includes("kindle")) {
      return device.kindle;
    }
    return device.unknown;
  }
}
