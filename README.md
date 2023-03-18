# Reader Access

Reader access is a JavaScript library that exposes an e-reader-specific filesystem layer to the client-side.

## Quick Start

The `readerAccess` function returns a new instance of the `Reader` class, prompting the user to select their e-reader from a directory picker. Since it uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) under the hood, `readerAccess` can only be invoked from within a user-action, like a click event.

```js
import { readerAccess } from "<path_to_library>/index.js";

let reader;

const buttonElement = document.getElementByID("access-reader-button");

buttonElement.addEventListener("click", async () => {
  reader = await readerAccess();
});
```

### Reader

Write file to the selected reader.

```ts
await reader.addBook(file: File);
```

Get a list of files and directories on the reader.

```ts
await reader.getBooks();
```

### Epub

Get an epub's metadata.

```ts
await getEpubMetaData(file: File);

// returns EpubMetaData object.
interface EpubMetaData {
  title?: string;
  author?: string;
  authorFileAs?: string;
  description?: string;
  isbn?: string;
  cover?: { path?: string; url?: string };
  opfRealtiveDir?: string;
}
```
