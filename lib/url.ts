// Url
// ===
//
// Url object used for tracking files in `file-list.js`

export class Url {

  isUrl = true

  constructor(public path) {
  }

  toString() {
    return this.path
  }
}