import * as zip from "@zip.js/zip.js";
import * as xml from "../utils/parseXML";

interface EpubMetaData {
  title?: string;
  author?: string;
  description?: string;
  isbn?: string;
  cover?: { path?: string; url?: string };
  /** Path relative to the .opf file */
  opfRealtiveDir?: string;
  /** Preferred name filing order (eg. last, first) */
  authorFileAs?: string;
}

/** Pulls metadata out of an epub's *.opf file */
export async function getEpubMetaData(file: File): Promise<EpubMetaData> {
  const unzipped = await unpackEpub(file);

  const opfFile = unzipped.find((file) => file.filename.includes("opf"));
  const opf = await opfFile?.getData(new zip.TextWriter());

  if (!opf || !opfFile) {
    throw new Error("Invalid epub file");
  }

  const parser = new DOMParser();
  const xmlData = parser.parseFromString(opf, "text/xml");

  const opfRealtiveDir = getRelativeOpfDir(opfFile.filename);
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
    cover: {
      path: coverPath,
      url: await getCoverImage(unzipped, coverPath, opfRealtiveDir),
    },
    opfRealtiveDir,
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

async function getCoverImage(
  unpacked: zip.Entry[],
  path: string | undefined,
  relativeDir: string | undefined
) {
  if (!path) return;

  const relPath = resolveRelativePath(relativeDir, path);
  const coverFile = unpacked.find((entry) => entry.filename === relPath);

  if (!coverFile) {
    return undefined;
  }

  return URL.createObjectURL(await coverFile?.getData(new zip.BlobWriter()));
}

export function getRelativeOpfDir(opfPath: string) {
  const pathPieces = opfPath.split("/").filter((p) => !p.includes(".opf"));

  if (!pathPieces.length) return;

  return pathPieces.join("/").concat("/");
}

export function resolveRelativePath(
  relativeDir: string | undefined,
  path: string | undefined
) {
  if (!path) return;
  if (!relativeDir) return path;

  return relativeDir + path;
}
