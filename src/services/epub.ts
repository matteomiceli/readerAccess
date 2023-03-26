import * as zip from "@zip.js/zip.js";
import * as xml from "../utils/parseXML";

interface EpubMetaData {
  title?: string;
  author?: string;
  description?: string;
  isbn?: string;
  /** Book cover. All paths are relative to the .opf directory. */
  cover?: { path?: string; coverPagePath?: string; url?: string };
  /** Path relative to the .opf file */
  opfRelativeDir?: string;
  /** Preferred name filing order (eg. last, first) */
  authorFileAs?: string;
}

/** Pulls metadata out of an epub's *.opf file */
export async function getEpubMetaData(file: File): Promise<EpubMetaData> {
  const unzipped = await unpackEpub(file);

  const opfFile = unzipped.find((file) => file.filename.includes("opf"));

  if (!opfFile) {
    throw new Error("Invalid epub file");
  }

  const opfBlob = await opfFile.getData(new zip.BlobWriter());

  // abstract this all into the epub unpack function
  const parser = new DOMParser();
  const xmlData = parser.parseFromString(await opfBlob.text(), "text/xml");

  const opfRelativeDir = getRelativeOpfDir(opfFile.filename);
  console.log(opfRelativeDir);
  const coverPath = xml.getCoverImagePath(xmlData);
  const relCoverPath =
    coverPath && resolveRelativePath(coverPath, opfRelativeDir);

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
      path: relCoverPath,
      coverPagePath: await getCoverPagePath(
        unzipped,
        xmlData,
        relCoverPath,
        opfRelativeDir
      ),
      url: await getCoverImage(unzipped, relCoverPath),
    },
    opfRelativeDir,
  };
}

/** Unzips epub into its individual elements. */
async function unpackEpub(file: File) {
  if (file.type !== "application/epub+zip") {
    throw new Error("File is not a valid epub");
  }

  const zipReader = new zip.ZipReader(new zip.BlobReader(file));
  const unzipped = await zipReader.getEntries();
  await zipReader.close();

  return unzipped;
}

/** Retrieves cover image from unpacked epub and returns image URL. */
async function getCoverImage(unpacked: zip.Entry[], path: string | undefined) {
  if (!path) return;

  const coverBlob = await getFileBlob(unpacked, path);
  if (!coverBlob) return;

  return URL.createObjectURL(coverBlob);
}

/**
 * Returns cover page if exists.
 *
 * Here, cover page is defined as the first entry in the spine that contains
 * the cover image. Some epubs have a titlepage as the first entry, this does
 * not count as a cover page. Kobo readers display their cover as the first
 * page, so if this does not exist, a cover page has to be created.
 */
async function getCoverPagePath(
  unpacked: zip.Entry[],
  xmlData: Document,
  coverImagePath?: string,
  relativeDir?: string
) {
  // Early return since we can't confirm this is the cover page without the cover image path
  if (!coverImagePath) return;

  const maybeCoverPage = xml.getFirstSpineEntryPath(xmlData);
  if (!maybeCoverPage) return;

  const relPathToCoverPage = resolveRelativePath(maybeCoverPage, relativeDir);
  const coverPageContents = await (
    await getFileBlob(unpacked, relPathToCoverPage)
  )?.text();

  const pageHtml = new DOMParser().parseFromString(
    coverPageContents || "",
    "text/html"
  );

  const coverImgSrc = xml.getAttributeValueByName(pageHtml, "img", "src");

  if (!coverImgSrc) return;

  pathExistsInsideOtherPath(coverImagePath, coverImgSrc);

  // console.log(
  //   "image path rel to opf: " + coverImagePath + "\n",
  //   "from img src: " + coverImgSrc + "\n",
  //   "cover page path: " +
  //     resolveRelativePath(maybeCoverPage, relativeDir) +
  //     "\n"
  // );

  return relPathToCoverPage;
}

/** Returns the relative path to the .opf file. */
export function getRelativeOpfDir(opfPath: string) {
  const pathPieces = opfPath.split("/").filter((p) => !p.includes(".opf"));

  if (!pathPieces.length) return;

  return pathPieces.join("/").concat("/");
}

export function resolveRelativePath(
  path: string,
  relativeDir: string | undefined
) {
  if (!relativeDir) return path;

  return relativeDir + path;
}

async function getFileBlob(unpacked: zip.Entry[], path: string) {
  const file = unpacked.find((file) => file.filename === path);

  if (!file) {
    return undefined;
  }
  return await file.getData(new zip.BlobWriter());
}

export function pathExistsInsideOtherPath(outside: string, inside: string) {
  const outsidePieces = outside.split("/");
  const insidePieces = inside.split("/");

  if (insidePieces.length > outsidePieces.length) return false;
}
