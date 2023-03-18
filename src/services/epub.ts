import * as zip from "@zip.js/zip.js";
import * as xml from "../utils/parseXML";

interface EpubMetaData {
  title?: string;
  author?: string;
  description?: string;
  isbn?: string;
  cover?: { path?: string; url?: string };
  /** Preferred name filing order (eg. last, first) */
  authorFileAs?: string;
}

/** Pulls metadata out of an epub's *.opf file */
export async function getEpubMetaData(file: File): Promise<EpubMetaData> {
  const unzipped = await unpackEpub(file);

  const opf = await unzipped
    .find((file) => {
      return file.filename.includes("opf");
    })
    ?.getData(new zip.TextWriter());

  if (!opf) {
    throw new Error("Epub does not contain opf metadata");
  }

  const parser = new DOMParser();
  const xmlData = parser.parseFromString(opf, "text/xml");

  const coverPath = xml.getEpubCoverPath(xmlData);

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
    cover: { path: coverPath, url: await getCoverImage(unzipped, coverPath) },
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

async function getCoverImage(unpacked: zip.Entry[], path?: string) {
  if (!path) return;

  const coverFile = unpacked.find((entry) => entry.filename === path);

  if (!coverFile) {
    return undefined;
  }

  return URL.createObjectURL(await coverFile?.getData(new zip.BlobWriter()));
}
