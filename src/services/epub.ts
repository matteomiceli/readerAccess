import * as zip from "@zip.js/zip.js";
import * as xml from "../utils/parseXML";
import * as path from "../utils/path";

import { Opf } from "../controllers/types";
import { getZipFileBlob } from "../utils/file";
export default class Epub {
  unpacked: zip.Entry[];
  parser: DOMParser;
  opf: Opf;
  meta: EpubMetaData = { cover: {} };

  constructor(unpacked: zip.Entry[], opf: Opf, parser: DOMParser) {
    this.unpacked = unpacked;
    this.opf = opf;
    this.parser = parser;
    this.resolvePaths();
  }

  /* Separate this into simple meta and cover meta? */
  async buildMeta() {
    this.meta.title = xml.getContentByTag(this.opf.data, "dc:title");
    this.meta.author = xml.getContentByTag(this.opf.data, "dc:creator");
    this.meta.authorFileAs = xml.getAttributeValueByName(
      this.opf.data,
      "dc:creator",
      "opf:file-as"
    );
    this.meta.description = xml.getContentByTag(
      this.opf.data,
      "dc:description"
    );
    this.meta.isbn = xml.getElementByAttributeValue(
      this.opf.data,
      "dc:identifier",
      "ISBN"
    )?.innerHTML;
    this.meta.cover = {
      pagePath: await this.getCoverPagePath(),
      url: await this.getCoverImage(),
    };
  }

  async getMeta() {
    return this.meta;
  }

  resolvePaths() {
    this.meta.pathToOpf = path.getRelativeOpfDir(this.opf.file.filename);

    const coverImgPath = xml.getCoverImagePath(this.opf.data);
    this.meta.cover.imgPath =
      coverImgPath &&
      path.resolveRelativePath(coverImgPath, this.meta.pathToOpf);
  }

  private async getCoverPagePath() {
    // Early return since we can't confirm this is the cover page without the cover image path
    if (!this.meta.cover.imgPath) return;

    const maybeCoverPage = xml.getFirstSpineEntryPath(this.opf.data);
    if (!maybeCoverPage) return;

    const relPathToCoverPage = path.resolveRelativePath(
      maybeCoverPage,
      this.meta.pathToOpf
    );
    const coverPageContents = await (
      await getZipFileBlob(this.unpacked, relPathToCoverPage)
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

    return path.pathExistsInsideOtherPath(this.meta.cover.imgPath, coverImgSrc)
      ? relPathToCoverPage
      : undefined;
  }
  private async getCoverImage() {
    const path = this.meta.cover.imgPath;
    if (!path) return;

    const coverBlob = await getZipFileBlob(this.unpacked, path);
    if (!coverBlob) return;

    return URL.createObjectURL(coverBlob);
  }
}

interface EpubMetaData {
  title?: string;
  author?: string;
  description?: string;
  isbn?: string;
  /** Book cover. All paths are relative to the .opf directory. */
  cover: { imgPath?: string; pagePath?: string; url?: string };
  /** Path relative to the .opf file */
  pathToOpf?: string;
  /** Preferred name filing order (eg. last, first) */
  authorFileAs?: string;
}
