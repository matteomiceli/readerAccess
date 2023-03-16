import * as zip from "@zip.js/zip.js";
import * as xml from "../utils/parseXML";

interface EpubMetaData {
  title?: string;
  author?: string;
  authorFileAs?: string;
  description?: string;
  isbn?: string;
  cover?: string;
}

/** Pulls metadata out of an epub's *.opf file */
export async function getEpubMetaData(file: File): Promise<EpubMetaData> {
  const unzipped = await unpackEpub(file);
  const writer = new zip.TextWriter();

  const opf = await unzipped
    .find((file) => {
      return file.filename.includes("opf");
    })
    ?.getData(writer);

  if (!opf) {
    throw new Error("Epub does not contain opf metadata");
  }

  const parser = new DOMParser();
  const xmlData = parser.parseFromString(opf, "text/xml");

  return {
    title: xml.getContentByTag(xmlData, "dc:title"),
    author: xml.getContentByTag(xmlData, "dc:creator"),
    authorFileAs: xml.getAttributeValueByName(
      xmlData,
      "dc:creator",
      "opf:file-as"
    ),
    description: xml.getContentByTag(xmlData, "dc:description"),
    isbn: xml.getElementByAttributeValue(xmlData, "dc:identifier", "ISBN")
      ?.innerHTML,
    cover: xml.getEpubCoverPath(xmlData),
  };
}

async function unpackEpub(file: File) {
  if (file.type !== "application/epub+zip") {
    throw new Error("File is not a valid epub");
  }

  const zipReader = new zip.ZipReader(new zip.BlobReader(file));
  const unzipped = await zipReader.getEntries();
  await zipReader.close();

  return unzipped;
}
