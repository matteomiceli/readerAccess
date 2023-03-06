import * as zip from "@zip.js/zip.js";

interface EpubMetaData {
  //
}

export async function parseEpub(file: File) {
  const zipReader = new zip.ZipReader(new zip.BlobReader(file));
  const unzipped = await zipReader.getEntries();
  await zipReader.close();
  const writer = new zip.TextWriter();

  const opf = await unzipped
    .filter((file) => {
      return file.filename.includes("opf");
    })[0]
    .getData(writer);

  const parser = new DOMParser();
  const xmlMeta = parser
    .parseFromString(opf, "text/xml")
    .getElementsByTagName("metadata")[0];

  return {
    author: xmlMeta.getElementsByTagName("dc:creator")?.[0].innerHTML,
  };
}
