
let pc;


// =============================
// 🔑 criar conexão
// =============================
function criarPC() {

  pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  });

}


// =============================
// 📷 GERAR QR DA CÂMERA (PC)
// =============================
async function gerarQRCodeCamera() {

  try {

    criarPC();

    // 🔥 cria offer primeiro
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // ⏳ espera ICE
    await new Promise(resolve => {

      if (pc.iceGatheringState === "complete") resolve();

      pc.addEventListener("icegatheringstatechange", () => {
        if (pc.iceGatheringState === "complete") resolve();
      });

      // fallback
      setTimeout(resolve, 2000);

    });


    // 🔥 monta link
    const base = window.location.href.split("?")[0];

    const link = `${base}?camera=${encodeURIComponent(
      JSON.stringify(pc.localDescription)
    )}`;


    console.log("QR LINK:", link);


    // 📱 gera QR
    const div = document.getElementById("qrcode");

    if (!div) {
      console.error("div #qrcode não encontrada");
      return;
    }

    div.innerHTML = "";


    if (typeof QRCode === "undefined") {
      alert("QRCode.js não carregou!");
      return;
    }

    QRCode.toCanvas(link, { width: 280 }, (err, canvas) => {

      if (err) {
        console.error("Erro QR:", err);
        return;
      }

      div.appendChild(canvas);

    });


  } catch (err) {
    console.error("Erro gerar QR câmera:", err);
  }

}


// =============================
// 📱 CELULAR (recebe câmera)
// =============================
window.addEventListener("load", async () => {

  const params = new URLSearchParams(location.search);
  const camera = params.get("camera");

  if (!camera) return;

  criarPC();

  const offer = JSON.parse(decodeURIComponent(camera));

  await pc.setRemoteDescription(offer);


  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });

  stream.getTracks().forEach(track => {
    pc.addTrack(track, stream);
  });


  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

});


// =============================
// 💻 PC recebe vídeo
// =============================
function iniciarRecepcao() {

  pc.ontrack = (event) => {

    const video = document.getElementById("video");

    if (video && !video.srcObject) {
      video.srcObject = event.streams[0];
    }

  };

}