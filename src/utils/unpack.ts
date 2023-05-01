/** Unzips epub into its individual elements. */
import * as zip from "@zip.js/zip.js";

export async function unpackEpub(file: File, parser: DOMParser) {
  if (file.type !== "application/epub+zip") {
    throw new Error("File is not a valid epub");
  }

  const zipReader = new zip.ZipReader(new zip.BlobReader(file));
  const unpacked = await zipReader.getEntries();
  await zipReader.close();

  const opfFile = unpacked.find((file) => file.filename.includes("opf"));
  if (!opfFile) {
    throw new Error("Invalid epub file");
  }
  const opfBlob = await opfFile.getData(new zip.BlobWriter());

  const opfData = parser.parseFromString(await opfBlob.text(), "text/xml");

  return { unpacked, opf: { data: opfData, file: opfFile } };
}
