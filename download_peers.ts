"use strict";

import net from "net";
import { Buffer } from "buffer";
import type { Peer } from "./types/peer";
import * as message from "./utils/message";
import { connectToPeer } from "./controller";

function onWholeMsg(socket: any, callback: any) {
  let savedBuf = Buffer.alloc(0);
  let handshake = true;

  socket.on("data", (recvBuf: any) => {
    // msgLen calculates the length of a whole message
    const msgLen = () =>
      handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
    savedBuf = Buffer.concat([savedBuf, recvBuf]);

    while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
      callback(savedBuf.slice(0, msgLen()));
      savedBuf = savedBuf.slice(msgLen());
      handshake = false;
    }
  });
}

function msgHandler(msg: any, socket: any) {
  if (isHandshake(msg)) socket.write(message.buildInterested());
}

function isHandshake(msg: any) {
  return (
    msg.length === msg.readUInt8(0) + 49 &&
    msg.toString("utf8", 1) === "BitTorrent protocol"
  );
}

const peerClient = new connectToPeer("torrent1.torrent");

const downloadFromPeers = (peer: Peer) => {
  const socket = new net.Socket();
  socket.on("error", console.log);

  socket.connect(peer.port, peer.ip, () => {
    const handshake = message.buildHandshake(peerClient);
    socket.write(handshake);
  });

  onWholeMsg(socket, (msg: any) => msgHandler(msg, socket));
};

export default downloadFromPeers;
