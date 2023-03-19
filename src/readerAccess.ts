import { Reader } from "./controllers/reader";

export const readerAccess = async () => {
  try {
    const dirHandle = await window.showDirectoryPicker();
    return new Reader(dirHandle);
  } catch (e) {
    throw new Error("ReaderAccess: User aborted device selection \n\n" + e);
  }
};
