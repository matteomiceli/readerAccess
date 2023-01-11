import { device } from "./types.js";

// file handler goes here
export class DeviceHandler {
  device: device | null = null;
  name: string = "";
  handle: null | FileSystemDirectoryHandle = null;
  files: { [key: string]: FileSystemDirectoryHandle | FileSystemFileHandle } =
    {};

  async access() {
    this.handle = await this.pickDir();
    this.handle.requestPermission({ mode: "readwrite" });
    this.name = this.handle.name;
    this.device = this.getDeviceType(this.handle.name);
    await this.getFiles();
  }

  async pickDir() {
    return window.showDirectoryPicker();
  }

  getDeviceType(name: string) {
    if (name.toLowerCase().includes("kobo")) {
      return device.kobo;
    }
    if (name.toLowerCase().includes("kindle")) {
      return device.kindle;
    }
    return device.unknown;
  }

  async getFiles() {
    if (!this.handle?.values()) {
      return;
    }

    for await (const file of this.handle.values()) {
      this.files[file.name] = file;
    }
  }
}
