import * as zip from "@zip.js/zip.js";

export async function writeFileToDir(
  dir: FileSystemDirectoryHandle,
  file: File
) {
  const newFile = await dir.getFileHandle(file.name, {
    create: true,
  });
  const fs = await newFile.createWritable();
  await fs.write({ type: "write", data: await file.arrayBuffer() });
  await fs.close();
}

export async function listAllFiles(
  root: FileSystemDirectoryHandle,
  options: { extensions: string[] }
) {}

export async function getZipFileBlob(unpacked: zip.Entry[], path: string) {
  const file = unpacked.find((file) => file.filename === path);

  if (!file) {
    return undefined;
  }
  return await file.getData(new zip.BlobWriter());
}
