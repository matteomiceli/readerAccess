/*
 * DEMO FILE
 * run 'build' script before attempting to run demo
 */

import { readerAccess, probeEpub } from "../dist/index.js";

const selectReaderBtn = document.getElementById("select-reader");
const selectFileBtn = document.getElementById("select-file");
const sendFileBtn = document.getElementById("send-file");
const parseEpubBtn = document.getElementById("parse-epub");
const coverImg = document.getElementById("cover-img");

let reader;
let files = [];

selectReaderBtn.addEventListener("click", async () => {
  try {
    reader = await readerAccess();
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
    } catch (error) {}
  });
});

parseEpubBtn.addEventListener("click", async () => {
  try {
    const epub = await probeEpub(files[0]);
    await epub.buildMeta();
    coverImg.src = epub.meta?.cover.url || "";
    console.log(epub);
  } catch (error) {
    console.log(error);
  }
});
