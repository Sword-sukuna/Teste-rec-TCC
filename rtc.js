// =============================
// 🌐 conexão global
// =============================
window.pc = null;


// =============================
// 🔧 criar conexão
// =============================
function criarPC(){

  // fecha conexão antiga
  if(window.pc){

    try{
      window.pc.close();
    }catch(e){}

  }

  // cria nova conexão
  window.pc = new RTCPeerConnection({
    iceServers:[
      {
        urls:"stun:stun.l.google.com:19302"
      }
    ]
  });

  // receber vídeo
  window.pc.ontrack = e => {

    const v =
      document.getElementById("video");

    if(!v) return;

    v.srcObject = e.streams[0];

    v.play().catch(()=>{});

  };

}


// =============================
// 📷 GERAR QR
// =============================
async function gerarQRCodeCamera(){

  criarPC();

  const o =
    await window.pc.createOffer();

  await window.pc.setLocalDescription(o);

  await ice();

  const link =
    location.href.split("?")[0] +
    "?camera=" +
    encodeURIComponent(
      JSON.stringify(window.pc.localDescription)
    );

  const qr =
    document.getElementById("qrcode");

  if(!qr) return;

  qr.innerHTML = "";

  QRCode.toCanvas(
    link,
    { width:280 },
    (e,c)=>{

      if(e){
        console.error(e);
        return;
      }

      qr.appendChild(c);

    }
  );

}


// =============================
// 📱 CELULAR
// =============================
window.addEventListener(
  "load",
  async ()=>{

    const p =
      new URLSearchParams(location.search);

    const cam =
      p.get("camera");

    if(!cam) return;

    criarPC();

    await window.pc.setRemoteDescription(
      JSON.parse(
        decodeURIComponent(cam)
      )
    );

    const s =
      await navigator.mediaDevices
      .getUserMedia({
        video:true,
        audio:false
      });

    s.getTracks().forEach(t=>{
      window.pc.addTrack(t,s);
    });

    const a =
      await window.pc.createAnswer();

    await window.pc.setLocalDescription(a);

    await ice();

    // textarea answer
    const tx =
      document.createElement("textarea");

    tx.value =
      JSON.stringify(
        window.pc.localDescription
      );

    tx.style.width = "95%";
    tx.style.height = "180px";

    document.body.appendChild(tx);

  }
);


// =============================
// 💻 RECEBER ANSWER
// =============================
async function receberAnswer(){

  const txt =
    document.getElementById("answer")
    .value;

  if(!txt){

    alert("Cole o answer");

    return;

  }

  await window.pc.setRemoteDescription(
    JSON.parse(txt)
  );

}


// =============================
// ⏳ ICE
// =============================
function ice(){

  return new Promise(r=>{

    if(
      window.pc.iceGatheringState
      ===
      "complete"
    ){

      r();

    }

    window.pc.addEventListener(
      "icegatheringstatechange",
      ()=>{

        if(
          window.pc.iceGatheringState
          ===
          "complete"
        ){

          r();

        }

      }
    );

    setTimeout(r,3000);

  });

}