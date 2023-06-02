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

/**
 * Recursively walks through a directory tree, returning only files.
 *
 * @param root the root directory node.
 * @param collection store for files.
 * @param acceptedExtensions filter files of specific extensions.
 */
export async function listAllFiles(
  root: FileSystemDirectoryHandle,
  collection: { [key: string]: FileSystemFileHandle },
  acceptedExtensions?: string[]
) {
  for await (const file of root.values()) {
    if (file.kind === "file") {
      // filter against file extensions
      if (acceptedExtensions?.length) {
        for (let i = 0; i < acceptedExtensions.length; i++) {
          const ext = acceptedExtensions[i];
          if (file.name.includes(`.${ext}`)) {
            collection[file.name] = file;
          }
        }
      } else {
        collection[file.name] = file;
      }
    }
    // when handle is directory, recurse
    else {
      await listAllFiles(file, collection, acceptedExtensions);
    }
  }
  return collection;
}

export async function getZipFileBlob(unpacked: zip.Entry[], path: string) {
  const file = unpacked.find((file) => file.filename === path);

  if (!file) {
    return undefined;
  }
  return await file.getData(new zip.BlobWriter());
}
