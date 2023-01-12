export enum deviceType {
  "kobo" = "Kobo",
  "kindle" = "Kindle",
  "generic" = "Generic",
}

/* Device will be the general interface through which the Kobo and Kindle controllers manipulate their respective devices */
export interface Device {
  addBook: () => void;
  addDictionary: () => void;
}
