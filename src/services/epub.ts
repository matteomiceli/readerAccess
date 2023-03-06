import * as zip from "@zip.js/zip.js";

interface EpubMetaData {
  //
}

export async function parseEpub(file: File) {
  const zipReader = new zip.BlobReader(file);
  const unzipped = await new zip.ZipReader(zipReader).getEntries();
  const writer = new zip.TextWriter();

  const parsed: EpubMetaData = {};

  const opf = await unzipped
    .filter((file) => {
      return file.filename.includes("opf");
    })[0]
    .getData(writer);

  return opf;
}
