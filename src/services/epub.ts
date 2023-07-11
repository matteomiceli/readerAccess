import * as zip from "@zip.js/zip.js";
import * as xml from "../utils/parseXML";
import * as path from "../utils/path";

import { Opf } from "../controllers/types";
import { getZipFileBlob } from "../utils/file";

interface EpubMetaData {
  fileName?: string;
  title?: string;
  author?: string;
  description?: string;
  isbn?: string;
  /** Book cover. All paths are relative to the .opf directory. */
  cover?: { imgPath?: string; pagePath?: string; url?: string };
  /** Path relative to the .opf file */
  pathToOpf?: string;
  /** Preferred name filing order (eg. last, first) */
  authorFileAs?: string;
}

export default class Epub {
  private file: File;
  private unpacked: zip.Entry[];
  private opf: Opf;
  private meta: EpubMetaData = {};

  constructor(file: File, unpacked: zip.Entry[], opf: Opf) {
    this.file = file;
    this.unpacked = unpacked;
    this.opf = opf;
    this.resolvePaths();
    this.buildSimpleMeta();
  }

  getMeta() {
    return this.meta;
  }

  /** Returns epub file blob. */
  getFile() {
    return this.file;
  }

  buildSimpleMeta() {
    this.meta = {
      ...this.meta,
      fileName: this.file.name,
      title: xml.getContentByTag(this.opf.data, "dc:title"),
      author: xml.getContentByTag(this.opf.data, "dc:creator"),
      authorFileAs:
        xml.getAttributeValueByName(
          this.opf.data,
          "dc:creator",
          "opf:file-as"
        ) || this.fileAsFromAuthorName(),
      description: xml.getContentByTag(this.opf.data, "dc:description"),
      isbn: xml.getElementByAttributeValue(
        this.opf.data,
        "dc:identifier",
        "ISBN"
      )?.innerHTML,
    };

    return this;
  }

  async buildCoverMeta() {
    this.meta.cover = {
      ...this.meta.cover,
      pagePath: await this.getCoverPagePath(),
      url: await this.getCoverImage(),
    };
    return this;
  }

  private fileAsFromAuthorName(): string {
    const author = xml.getContentByTag(this.opf.data, "dc:creator");

    if (author) {
      const [first, last] = author.split(" ");
      return `${last}, ${first}`;
    }

    return "";
  }

  async formatCoverForKobo() {
    const coverImagePath = this.meta?.cover?.imgPath;
    const coverPagePath = this.meta?.cover?.pagePath;

    const coverPage = this.unpacked.find((f) => f.filename === coverPagePath);
    if (!coverPage || !coverPagePath || !coverImagePath)
      throw new Error("Cover not found");

    const imgSrc = path.getCoverImageSourcePath(coverPagePath, coverImagePath);
    const coverHtml = this.generateCoverHtml(imgSrc);

    // TODO - refactor out the rebuild zip functionality
    const writer = new zip.ZipWriter(new zip.BlobWriter("application/zip"));
    await Promise.all(
      this.unpacked.map(async (file) => {
        if (file.filename !== coverPagePath) {
          const blob = await file.getData(new zip.BlobWriter());
          return writer.add(file.filename, new zip.BlobReader(blob));
        }
      })
    );
    await writer.add(coverPagePath, new zip.TextReader(coverHtml));
    const fileBlob = await writer.close();
    const formattedEpub = new File([fileBlob], this.file.name, {
      type: "application/epub+zip",
    });
    const url = URL.createObjectURL(formattedEpub);

    this.file = formattedEpub;

    return { url, file: formattedEpub };
  }

  private resolvePaths() {
    this.meta.pathToOpf = path.getRelativeOpfDir(this.opf.file.filename);

    const coverImgPath = xml.getCoverImagePath(this.opf.data);
    this.meta.cover = {
      ...this.meta?.cover,
      imgPath:
        coverImgPath &&
        path.resolveRelativePath(coverImgPath, this.meta.pathToOpf),
    };
  }

  private async getCoverPagePath() {
    // Early return since we can't confirm this is the cover page without the cover image path
    if (!this.meta?.cover?.imgPath) return;

    const coverPage = xml.getFirstSpineEntryPath(this.opf.data);
    if (!coverPage) return;

    const relPathToCoverPage = path.resolveRelativePath(
      coverPage,
      this.meta.pathToOpf
    );
    const coverPageContents = await (
      await getZipFileBlob(this.unpacked, relPathToCoverPage)
    )?.text();

    const pageHtml = new DOMParser().parseFromString(
      coverPageContents || "",
      "text/html"
    );

    const coverImgSrc =
      xml.getAttributeValueByName(pageHtml, "img", "src") ||
      xml.getAttributeValueByName(pageHtml, "image", "xlink:href");

    if (!coverImgSrc) return;

    return path.pathExistsInsideOtherPath(this.meta.cover.imgPath, coverImgSrc)
      ? relPathToCoverPage
      : undefined;
  }

  private async getCoverImage() {
    const path = this.meta?.cover?.imgPath;
    if (!path) return;

    const coverBlob = await getZipFileBlob(this.unpacked, path);
    if (!coverBlob) return;

    return URL.createObjectURL(coverBlob);
  }

  private generateCoverHtml(imgSrc: string) {
    return `<?xml version='1.0' encoding='utf-8'?>
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
            <title>Cover</title>
            <style type="text/css" title="override_css">
                @page {padding: 0pt; margin:0pt}
                body { text-align: center; padding:0pt; margin: 0pt; }
                img { max-width: 100%; height: 100% }
            </style>
        </head>
        <body>
              <img src="${imgSrc}" alt="cover" />
        </body>
    </html>`;
  }
}
