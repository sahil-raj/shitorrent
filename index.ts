"use strict";

import fs from "fs";
import bencode from "bencode";

class connectToPeer {
  constructor(private file: string) {
    this.file = file;
  }

  fetchAnnounceUrl() {
    const torrentFile = fs.readFileSync(this.file);
    const parsedFile = bencode.decode(torrentFile);

    if (parsedFile.announce) {
      const announceUrl = Buffer.from(parsedFile.announce).toString("utf8");
      console.log("Main announce:", announceUrl);
    }
  }
}
