import { getEpubMetaData } from "../services/epub2";
import { writeFileToDir } from "../utils/file";
import { DeviceType, Books } from "./types";

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
      const authorDir = await this.resolveAuthorDir(file);
      await writeFileToDir(authorDir, file);
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

  /**
   * Function that uses the file-as rule to find or create an author folder. If there is no file-as rule,
   * fall back on author `lastname, firstname`. If author doesn't exist, just return the reader dir handle.
   */
  private async resolveAuthorDir(file: File) {
    const { author, authorFileAs } = await getEpubMetaData(file);

    if (authorFileAs) {
      return await this.dirHandle.getDirectoryHandle(authorFileAs, {
        create: true,
      });
    }
    if (author) {
      const [first, last] = author.split(" ");
      return await this.dirHandle.getDirectoryHandle(`${last}, ${first}`, {
        create: true,
      });
    }

    return this.dirHandle;
  }
}
