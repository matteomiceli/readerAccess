import { Reader } from "./controllers/deviceController";

export const readerAccess = async () => {
  try {
    const dirHandle = await window.showDirectoryPicker();
    return new Reader(dirHandle);
  } catch (e) {
    console.warn("ReaderAccess: User aborted device selection \n\n", e);
    return null;
  }
};
