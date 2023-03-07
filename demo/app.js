/*
 * DEMO FILE
 * run 'build' script before attempting to run demo
 */

import { readerAccess, getEpubMetaData } from "../dist/index.js";

const selectReaderBtn = document.getElementById("select-reader");
const selectFileBtn = document.getElementById("select-file");
const sendFileBtn = document.getElementById("send-file");
const parseEpubBtn = document.getElementById("parse-epub");

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
    console.log(await getEpubMetaData(files[0]));
  } catch (error) {
    console.log(error);
  }
});
