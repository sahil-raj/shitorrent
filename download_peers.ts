"use strict";

import net from "net";
import { Buffer } from "buffer";
import type { Peer } from "./types/peer";

const downloadFromPeers = (peer: Peer) => {
  const socket = new net.Socket();
  socket.on("error", console.log);

  socket.connect(peer.port, peer.ip, () => {});

  socket.on("data", () => {});
};

export default downloadFromPeers;
