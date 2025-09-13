import { exit } from "process";
import { connectToPeer } from "./controller";
import dgram from "dgram";


export const getPeerList = (cb:(res:any)=>void)=>{
  const peer = new connectToPeer("torrent1.torrent");
  const announceUrl = peer.fetchAnnounceUrl();
  const message = peer.buildConnectionReq()
  const socket = dgram.createSocket("udp4");
  if (!announceUrl) {
  exit(1)
  }
    peer.sendConnectionRequest(socket,announceUrl,message);
  
  socket.on('message',(res)=>{
  if(peer.resType(res)=='connect'){
    const connection = peer.parseConnResp(res)
    peer.sendConnectionRequest(socket,announceUrl,peer.buildAnnounceRequest(connection.connectionId,6681))
  }else if(peer.resType(res)=='announce'){
    const parsedResult = peer.parseAnnounceReq(res)
cb(parsedResult.peers)
  }
  })
  
}

getPeerList((res)=>{

  console.log(res)
})


