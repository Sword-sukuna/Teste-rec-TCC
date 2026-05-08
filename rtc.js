window.pc=null;

 window.pc=new RTCPeerConnection({
  iceServers:[{urls:"stun:stun.l.google.com:19302"}]
 });

 window.pc.ontrack=e=>{
  const v=document.getElementById("video");
  if(!v)return;
  v.srcObject=e.streams[0];
  v.play().catch(()=>{});
 };


async function gerarQRCodeCamera(){
 criarPC();
 const o=await window.pc.createOffer();
 await window.pc.setLocalDescription(o);
 await ice();

 const link=location.href.split("?")[0]+
 "?camera="+
 encodeURIComponent(JSON.stringify(window.pc.localDescription));

 document.getElementById("qrcode").innerHTML="";

 QRCode.toCanvas(link,{width:280},(e,c)=>{
  document.getElementById("qrcode").appendChild(c);
 });
}

window.addEventListener("load",async()=>{
 const p=new URLSearchParams(location.search);
 const cam=p.get("camera");
 if(!cam)return;

 criarPC();

 await window.pc.setRemoteDescription(
  JSON.parse(decodeURIComponent(cam))
 );

 const s=await navigator.mediaDevices.getUserMedia({video:true,audio:false});

 s.getTracks().forEach(t=>window.pc.addTrack(t,s));

 const a=await window.pc.createAnswer();
 await window.pc.setLocalDescription(a);
 await ice();

 const tx=document.createElement("textarea");
 tx.value=JSON.stringify(window.pc.localDescription);
 document.body.appendChild(tx);
});

async function receberAnswer(){
 const txt=document.getElementById("answer").value;
 if(!txt)return;
 await window.pc.setRemoteDescription(JSON.parse(txt));
}

function ice(){
 return new Promise(r=>{
  if(window.pc.iceGatheringState==="complete")r();
  window.pc.addEventListener("icegatheringstatechange",()=>{
   if(window.pc.iceGatheringState==="complete")r();
  });
  setTimeout(r,3000);
 });
}