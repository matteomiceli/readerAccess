/*
 * DEMO FILE
 * run 'build' script before attempting to run demo
 */

import { Reader } from "../dist/src/index.js";

const selectReaderBtn = document.getElementById("select-reader");
const selectFileBtn = document.getElementById("select-file");

let reader = new Reader();

selectReaderBtn.addEventListener("click", async () => {
  try {
    await reader.access();
    console.log(reader.books);
  } catch (error) {
    console.log(error);
  }
});

selectFileBtn.addEventListener("change", (e) => {
  const files = e.currentTarget.files;
  reader.addBook(files[0]);
});
