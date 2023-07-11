import { listAllFiles, writeFileToDir } from "../utils/file";
import { DeviceType } from "./types";

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

  async addBook(file: File, options?: { fileAs: string }) {
    if (!this.dirHandle) {
      console.warn("ReaderAccess: No directory handle selected");
      return;
    }
    if (!file) {
      console.warn("ReaderAccess: No file selected");
      return;
    }

    try {
      let authorDir: FileSystemDirectoryHandle;

      if (options?.fileAs) {
        authorDir = await this.dirHandle.getDirectoryHandle(options.fileAs, {
          create: true,
        });
      } else {
        authorDir = this.dirHandle;
      }

      await writeFileToDir(authorDir, file);
    } catch (error) {
      console.error(
        "ReaderAcccess: There was a problem copying a file to your device"
      );
    }
  }

  async getBooks(): Promise<Record<string, FileSystemFileHandle>> {
    if (!this.dirHandle?.values()) {
      return {};
    }

    const books: { [key: string]: FileSystemFileHandle } = {};
    await listAllFiles(this.dirHandle, books, ["epub"]);

    return books;
  }

  addDictionary() {
    console.log();
  }

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
