/*
 * DEMO FILE
 * run 'build' script before attempting to run demo
 */

import { readerAccess, probeEpub } from "../dist/index.js";

const readerName = document.getElementById("device-name");
const selectReaderBtn = document.getElementById("select-reader");
const selectFileBtn = document.getElementById("select-file");
const sendFileBtn = document.getElementById("send-file");
const parseEpubBtn = document.getElementById("parse-epub");
const formatKobo = document.getElementById("format-kobo");
const coverImg = document.getElementById("cover-img");

let reader;
let files = [];
let epub;

selectReaderBtn.addEventListener("click", async () => {
  try {
    reader = await readerAccess();
    readerName.innerHTML = `${reader.name} | ${reader.type}`;
    console.log(await reader.getBooks());
  } catch (error) {
    console.log(error);
  }
});

selectFileBtn.addEventListener("change", (e) => {
  files = [...files, ...e.currentTarget.files];
});

sendFileBtn.addEventListener("click", async () => {
  files.forEach(async (file) => {
    try {
      await reader.addBook(file);
      console.log(`${file.name} added to ${reader.name}`);
    } catch (error) {
      console.error(error);
    }
  });
});

parseEpubBtn.addEventListener("click", async () => {
  files.forEach(async (file) => {
    try {
      epub = await probeEpub(file);
      await epub.buildCoverMeta();
      coverImg.src = epub.meta?.cover.url || "";
    } catch (error) {
      console.error(error);
    }
  });
});

formatKobo.addEventListener("click", async () => {
  const { url, file } = await epub.formatCoverForKobo();
  files = [file];

  // temporary for demo environment purposes
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", `${epub.fileName || "book"}`);
  a.innerHTML = "new zip";
  document.body.append(a);
});
