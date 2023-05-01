import * as zip from "@zip.js/zip.js";

export enum DeviceType {
  "kobo" = "Kobo",
  "kindle" = "Kindle",
  "generic" = "Generic",
}

/* Device will be the general interface through which the Kobo and Kindle controllers manipulate their respective devices */
export interface Device {
  addBook: () => void;
  addDictionary: () => void;
}

export type Books = {
  [key: string]: FileSystemDirectoryHandle | FileSystemFileHandle;
};

export interface Opf {
  file: zip.Entry;
  data: Document;
}
