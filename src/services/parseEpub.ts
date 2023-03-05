import * as zip from "@zip.js/zip.js";

export function parseEpub(file: File) {
  const zipReader = new zip.BlobReader(file);
  return zipReader;
}
