import { Reader } from "./controllers/reader";
import Epub from "./services/epub";
import { unpackEpub } from "./utils/unpack";

export const readerAccess = async () => {
  try {
    const dirHandle = await window.showDirectoryPicker();
    return new Reader(dirHandle);
  } catch (e) {
    throw new Error("ReaderAccess: User aborted device selection \n\n" + e);
  }
};

export const probeEpub = async (file: File) => {
  const parser = new DOMParser();
  const { unpacked, opf } = await unpackEpub(file, parser);

  return new Epub(unpacked, opf, parser);
};
