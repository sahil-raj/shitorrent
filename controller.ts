"use strict";

import fs from "fs";
import bencode from "bencode";
import dgram, { Socket } from "dgram";
import crypto from "crypto";
// Removed: import bignum from 'bignum'

export class connectToPeer {
  parsedFile: any;
  constructor(private file: string) {
    this.file = file;
  }

  fetchAnnounceUrl() {
    const torrentFile = fs.readFileSync(this.file);
    this.parsedFile = bencode.decode(torrentFile);
    if (this.parsedFile.announce) {
      const announceUrl = Buffer.from(this.parsedFile.announce).toString("utf8");

      return announceUrl;
    }
  }

  buildConnectionReq() {
    const buf = Buffer.alloc(16);
    buf.writeUint32BE(0x417, 0);
    buf.writeUint32BE(0x27101980, 4);
    buf.writeUint32BE(0, 8);
    crypto.randomBytes(4).copy(buf, 12);
    return buf
  }
   parseConnResp(res:any) {
    return {
      action: res.readUInt32BE(0),
      transactionId: res.readUInt32BE(4),
      connectionId: res.slice(8)
    }
  }
  sendConnectionRequest(socket:Socket,url: string,msg:Buffer) {
    const parsedUrl = new URL(url);
  
   
    socket.send(
      msg,
      Number(parsedUrl.port),
      parsedUrl.hostname,
      (error) => {
        console.log("sent message", error);
      }
    );
  }


  resType(res:Buffer){
const action = res.readUInt32BE(0)
if(action==0) return 'connect';
if(action==1) return 'announce';
}
genId(){
  const id = crypto.randomBytes(20)
  Buffer.from("-ST001-").copy(id,0)
  return id 
}
infoHash(parsedFile:any){
  const infoBuffer =bencode.encode(parsedFile.info)
  return crypto.createHash('sha1').update(infoBuffer).digest() 

}
size(parsedFile:any){
  const size = parsedFile.info.file? parsedFile.info.file.map((file:any)=>file.length).reduce((a:number,b:number)=>a+b):parsedFile.info.length

  // Replace bignum.toBuffer with native Buffer methods
  const buf = Buffer.allocUnsafe(8);
  const bigIntSize = BigInt(size);
  
  // Write as big-endian 64-bit integer
  buf.writeBigUInt64BE(bigIntSize, 0);
  
  return buf;
}
buildAnnounceRequest(connectionId:Buffer,port:number){
  const buf = Buffer.allocUnsafe(98);

  connectionId.copy(buf, 0);
  
  buf.writeUInt32BE(1, 8);
 
  crypto.randomBytes(4).copy(buf, 12);
 
  this.infoHash(this.parsedFile).copy(buf, 16);

  this.genId().copy(buf, 36);
 
  Buffer.alloc(8).copy(buf, 56);
  
  this.size(this.parsedFile).copy(buf, 64);
  
  Buffer.alloc(8).copy(buf, 72);
  
  buf.writeUInt32BE(0, 80);
  
  buf.writeUInt32BE(0, 80);
  
  crypto.randomBytes(4).copy(buf, 88);

  buf.writeInt32BE(-1, 92);

  buf.writeUInt16BE(port, 96);

  return buf;
}

parseAnnounceReq(res:Buffer){
  function groupAddress(add:Buffer,size:number){
    const group=[]
    for(let i = 0;i<add.length;i+=size){
      group.push(add.subarray(i,i+size))
    }
    return group
  }
  

  return {
    action:res.readUInt32BE(0),
    transactionId:res.readUint32BE(4),
    seeders:res.readUint32BE(12),
    peers:groupAddress(res.subarray(20),6).map(add=>{
      return {
        ip:add.subarray(0,4).join('.'),
        port:add.readUint16BE(4)
      }
    })

  }
}


}
