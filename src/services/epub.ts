import * as zip from "@zip.js/zip.js";

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
  if (file.type !== "application/epub+zip") {
    throw new Error("File is not a valid epub");
  }

  const zipReader = new zip.ZipReader(new zip.BlobReader(file));
  const unzipped = await zipReader.getEntries();
  await zipReader.close();
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
    title: getContentByTag(xmlData, "dc:title"),
    author: getContentByTag(xmlData, "dc:creator"),
    authorFileAs: getAttributeValueByName(xmlData, "dc:creator", "opf:file-as"),
    isbn: getElementByAttributeValue(xmlData, "dc:identifier", "ISBN")
      ?.innerHTML,
    cover: getEpubCoverPath(xmlData),
  };
}

function getContentByTag(xml: Document, tagName: string) {
  return xml.getElementsByTagName(tagName)?.[0].innerHTML;
}

function getAttributeValueByName(
  xml: Document,
  tagName: string,
  attributeName: string
) {
  return Object.values(xml.getElementsByTagName(tagName)?.[0].attributes).find(
    (attr) => attr.name === attributeName
  )?.value;
}

function getEpubCoverPath(xml: Document) {
  const coverTag = xml.getElementsByName("cover")?.[0];

  if (!coverTag) {
    return;
  }

  // Manifest ID
  const coverId = Object.values(coverTag.attributes).find(
    (attr) => attr.name === "content"
  )?.value;

  // Get cover path from manifest
  return Object.values(
    xml.getElementById(coverId || "")?.attributes || []
  ).find((attr) => attr.name === "href")?.value;
}

function getElementByAttributeValue(xml: Document, tag: string, val: string) {
  return Object.values(xml.getElementsByTagName(tag)).find((t) =>
    Object.values(t.attributes).find((a) => a.value === val)
  );
}
