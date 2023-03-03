import { Device, deviceType } from "./types.js";

/**
 * TODO - set a specific ereader service based on the type of device connected with
 * device-specific behaviour
 */
export class Reader {
  name: string = "";

  type: deviceType = deviceType.generic;

  private handle: null | FileSystemDirectoryHandle = null;

  /**
   * This is a lose concept now, but in the future this will only be books on the device
   */
  books: { [key: string]: FileSystemDirectoryHandle | FileSystemFileHandle } =
    {};

  async access() {
    this.handle = await this.pickDir();
    if (!this.handle) {
      return null;
    }
    this.handle.requestPermission({ mode: "readwrite" });
    this.name = this.handle.name;
    this.setDeviceType(this.handle.name);
    await this.setFiles();
    return this;
  }

  addBook() {}

  addDictionary() {}

  private async pickDir() {
    try {
      return await window.showDirectoryPicker();
    } catch (e) {
      console.warn("ReaderAccess: User aborted device selection \n\n", e);
      return null;
    }
  }

  private setDeviceType(name: string) {
    if (name.toLowerCase().includes("kobo")) {
      this.type = deviceType.kobo;
    }
    if (name.toLowerCase().includes("kindle")) {
      this.type = deviceType.kindle;
    }
  }

  private async setFiles() {
    if (!this.handle?.values()) {
      return;
    }

    for await (const file of this.handle.values()) {
      this.books[file.name] = file;
    }
  }
}
