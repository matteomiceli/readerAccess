import { Device, deviceType } from "./types.js";

// file handler goes here
export class Reader {
  name: string = "";
  type: deviceType = deviceType.generic;
  device: Device | null = null;
  handle: null | FileSystemDirectoryHandle = null;
  files: { [key: string]: FileSystemDirectoryHandle | FileSystemFileHandle } =
    {};

  async access() {
    this.handle = await this.pickDir();
    this.handle.requestPermission({ mode: "readwrite" });
    this.name = this.handle.name;
    this.setDeviceType(this.handle.name);
    await this.setFiles();
  }

  async pickDir() {
    return window.showDirectoryPicker();
  }

  setDeviceType(name: string) {
    if (name.toLowerCase().includes("kobo")) {
      this.type = deviceType.kobo;
    }
    if (name.toLowerCase().includes("kindle")) {
      this.type = deviceType.kindle;
    }
  }

  async setFiles() {
    if (!this.handle?.values()) {
      return;
    }

    for await (const file of this.handle.values()) {
      this.files[file.name] = file;
    }
  }
}
