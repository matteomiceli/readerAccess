import * as zip from "@zip.js/zip.js";
import * as xml from "../utils/parseXML";
import {
  getRelativeOpfDir,
  resolveRelativePath,
  pathExistsInsideOtherPath,
  getCoverImageSourcePath,
} from "../utils/path";

interface EpubMetaData {
  title?: string;
  author?: string;
  description?: string;
  isbn?: string;
  /** Book cover. All paths are relative to the .opf directory. */
  cover?: { imgPath?: string; pagePath?: string; url?: string };
  /** Path relative to the .opf file */
  opfRelativePath?: string;
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

  /** abstract this all into the epub unpack function - or refactor the entire file into class */
  const parser = new DOMParser();
  const xmlData = parser.parseFromString(await opfBlob.text(), "text/xml");

  const opfRelativePath = getRelativeOpfDir(opfFile.filename);
  const coverPath = xml.getCoverImagePath(xmlData);
  const relCoverPath =
    coverPath && resolveRelativePath(coverPath, opfRelativePath);

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
      imgPath: relCoverPath,
      pagePath: await getCoverPagePath(
        unzipped,
        xmlData,
        relCoverPath,
        opfRelativePath
      ),
      url: await getCoverImage(unzipped, relCoverPath),
    },
    opfRelativePath,
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
  relativePath?: string
) {
  // Early return since we can't confirm this is the cover page without the cover image path
  if (!coverImagePath) return;

  const maybeCoverPage = xml.getFirstSpineEntryPath(xmlData);
  if (!maybeCoverPage) return;

  const relPathToCoverPage = resolveRelativePath(maybeCoverPage, relativePath);
  const coverPageContents = await (
    await getFileBlob(unpacked, relPathToCoverPage)
  )?.text();

  const pageHtml = new DOMParser().parseFromString(
    coverPageContents || "",
    "text/html"
  );

  /**
   * TODO - Checking if the first entry contains an image. There should be a better
   * way to confirm the existance of a cover page as other pages might contain
   * images that are not the cover itself (eg. titlepages, maps, etc.)
   */
  const coverImgSrc =
    xml.getAttributeValueByName(pageHtml, "img", "src") ||
    xml.getAttributeValueByName(pageHtml, "image", "xlink:href");

  if (!coverImgSrc) return;
  await formatCoverForKobo(unpacked, relPathToCoverPage, coverImagePath);

  return pathExistsInsideOtherPath(coverImagePath, coverImgSrc)
    ? relPathToCoverPage
    : undefined;
}

/**
 * Adds styling to make existing covers Kobo-friendly. Creates epub with new cover
 * and returns object url.
 */
async function formatCoverForKobo(
  unpacked: zip.Entry[],
  coverPagePath: string,
  coverImagePath: string
) {
  const coverPage = unpacked.find((f) => f.filename === coverPagePath);
  if (!coverPage) throw new Error("Cover page not found");

  /* 
  This all works, but rather than parse the existing file, we should rewrite the cover page. 
    - write a buildCoverPage function that uses a string template. 
    - do some path logic to determine the src for the img tag
    - also refactor out the rebuild zip functionality
  */

  const imgSrc = getCoverImageSourcePath(coverPagePath, coverImagePath);
  const coverHtml = generateCoverHtml(imgSrc);

  const writer = new zip.ZipWriter(new zip.BlobWriter("application/zip"));
  await Promise.all(
    unpacked.map(async (file) => {
      if (file.filename !== coverPagePath) {
        const blob = await file.getData(new zip.BlobWriter());
        return writer.add(file.filename, new zip.BlobReader(blob));
      }
    })
  );
  await writer.add(coverPagePath, new zip.TextReader(coverHtml));
  const url = URL.createObjectURL(await writer.close());

  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.innerHTML = "new zip";
  document.body.append(a);

  return url;
}

async function getFileBlob(unpacked: zip.Entry[], path: string) {
  const file = unpacked.find((file) => file.filename === path);

  if (!file) {
    return undefined;
  }
  return await file.getData(new zip.BlobWriter());
}

function generateCoverHtml(imgSrc: string) {
  return `<?xml version='1.0' encoding='utf-8'?>
  <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
          <title>Cover</title>
          <style type="text/css" title="override_css">
              @page {padding: 0pt; margin:0pt}
              body { text-align: center; padding:0pt; margin: 0pt; }
              img { width: 100%; max-height: 100% }
          </style>
      </head>
      <body>
          <div>
                <img src="${imgSrc}" alt="cover" />
          </div>
      </body>
  </html>`;
}
