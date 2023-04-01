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
