
// 🔥 ÚNICO pc (corrigido)
window.pc = null;


// =============================
// 🔧 criar conexão
// =============================
function criarPC() {

  window.pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  });

  // 📹 RECEBER VÍDEO (CORREÇÃO DO PREVIEW)
  window.pc.ontrack = (event) => {

    const video = document.getElementById("video");

    if (!video) return;

    video.srcObject = event.streams[0];

    video.onloadedmetadata = () => {
      video.play().catch(e => console.log("autoplay bloqueado", e));
    };

  };

}


// =============================
// 📷 GERAR QR CÂMERA
// =============================
async function gerarQRCodeCamera() {

  criarPC();

  const offer = await window.pc.createOffer();
  await window.pc.setLocalDescription(offer);

  await esperarICE();

  const link = window.location.href.split("?")[0] +
    "?camera=" + encodeURIComponent(JSON.stringify(window.pc.localDescription));

  const box = document.getElementById("qrcode");

  if (!box) return;

  box.innerHTML = "";

  if (!window.QRCode) {
    alert("QRCode não carregou");
    return;
  }

  QRCode.toCanvas(link, { width: 280 }, (err, canvas) => {
    if (err) return console.error(err);
    box.appendChild(canvas);
  });

}


// =============================
// 📱 CELULAR
// =============================
window.addEventListener("load", async () => {

  const params = new URLSearchParams(location.search);
  const cam = params.get("camera");

  if (!cam) return;

  criarPC();

  const offer = JSON.parse(decodeURIComponent(cam));

  await window.pc.setRemoteDescription(offer);

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });

  stream.getTracks().forEach(track => {
    window.pc.addTrack(track, stream);
  });

  const answer = await window.pc.createAnswer();
  await window.pc.setLocalDescription(answer);

});


// =============================
// ⏳ ICE SAFE
// =============================
function esperarICE() {

  return new Promise(resolve => {

    if (!window.pc) return resolve();

    if (window.pc.iceGatheringState === "complete") return resolve();

    window.pc.addEventListener("icegatheringstatechange", () => {
      if (window.pc.iceGatheringState === "complete") resolve();
    });

    setTimeout(resolve, 3000);

  });

}