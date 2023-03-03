import { DeviceType, Books } from "./types.js";

/**
 * TODO - set a specific ereader service based on the type of device connected with
 * device-specific behaviour
 */
export class Reader {
  name: string;

  type: DeviceType;

  private dirHandle: FileSystemDirectoryHandle;

  constructor(dirHandle: FileSystemDirectoryHandle) {
    this.dirHandle = dirHandle;
    this.dirHandle.requestPermission({ mode: "readwrite" });
    this.name = this.dirHandle.name;
    this.type = this.setDeviceType(this.dirHandle.name);
  }

  async addBook(file: File) {
    if (!this.dirHandle) {
      console.warn("ReaderAccess: No directory handle selected");
      return;
    }
    if (!file) {
      console.warn("No file selected");
      return;
    }
    try {
      const newFile = await this.dirHandle.getFileHandle(file.name, {
        create: true,
      });
      const fs = await newFile.createWritable();
      await fs.write({ type: "write", data: await file.arrayBuffer() });
      await fs.close();
    } catch (error) {
      console.error("There was a problem copying a file to your device");
    }
  }

  async getBooks(): Promise<Books | undefined> {
    if (!this.dirHandle?.values()) {
      return;
    }

    const books: Books = {};

    for await (const file of this.dirHandle.values()) {
      books[file.name] = file;
    }
    return books;
  }

  addDictionary() {}

  private setDeviceType(name: string): DeviceType {
    if (name.toLowerCase().includes("kobo")) {
      return DeviceType.kobo;
    }
    if (name.toLowerCase().includes("kindle")) {
      return DeviceType.kindle;
    }
    return DeviceType.generic;
  }
}
