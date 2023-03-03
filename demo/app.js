/*
 * DEMO FILE
 * run 'build' script before attempting to run demo
 */

import { access } from "../dist/src/index.js";

const selectReaderBtn = document.getElementById("select-reader");
const selectFileBtn = document.getElementById("select-file");
const sendFileBtn = document.getElementById("send-file");

let reader;
let files = [];

selectReaderBtn.addEventListener("click", async () => {
  try {
    reader = await access();
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
    await reader.addBook(file);
  });
});
