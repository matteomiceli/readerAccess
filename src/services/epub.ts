import * as zip from "@zip.js/zip.js";

interface EpubMetaData {
  title?: string;
  author?: string;
  authorFileAs?: string;
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
    title: getXMLValueByTag(xmlData, "dc:title"),
    author: getXMLValueByTag(xmlData, "dc:creator"),
    authorFileAs: getXMLAttributeValueByName(
      xmlData,
      "dc:creator",
      "opf:file-as"
    ),
  };
}

function getXMLValueByTag(xml: Document, tagName: string) {
  return xml.getElementsByTagName(tagName)?.[0].innerHTML;
}

function getXMLAttributeValueByName(
  xml: Document,
  tagName: string,
  attributeName: string
) {
  return Object.values(xml.getElementsByTagName(tagName)?.[0].attributes).find(
    (attr) => attr.name === attributeName
  )?.value;
}
