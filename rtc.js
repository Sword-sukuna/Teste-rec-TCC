
let pc;


// =============================
// 🔑 iniciar conexão
// =============================
function criarPC() {
  pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  });
}


// =============================
// 📷 QR CAMERA (PC → celular)
// =============================
async function gerarQRCodeCamera() {

  criarPC();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await esperarICE();


  const link = window.location.href.split("?")[0] +
    "?camera=" + encodeURIComponent(JSON.stringify(pc.localDescription));


  QRCode.toCanvas(link, { width: 250 }, (err, canvas) => {
    if (!err) {
      const div = document.getElementById("qrcode");
      div.innerHTML = "";
      div.appendChild(canvas);
    }
  });

}


// =============================
// 📱 celular (envia câmera)
// =============================
async function iniciarCameraMobile(offer) {

  criarPC();

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

}


// =============================
// 💻 PC recebe vídeo
// =============================
function receberVideo() {

  pc.ontrack = (event) => {

    const video = document.getElementById("video");

    if (!video.srcObject) {
      video.srcObject = event.streams[0];
    }

  };

}


// =============================
// 📥 detectar modo URL
// =============================
window.addEventListener("load", async () => {

  const params = new URLSearchParams(location.search);

  const camera = params.get("camera");

  if (!camera) return;

  const offer = JSON.parse(decodeURIComponent(camera));

  await iniciarCameraMobile(offer);

});


// =============================
// ⏳ ICE helper
// =============================
function esperarICE() {

  return new Promise(resolve => {

    if (pc.iceGatheringState === "complete") resolve();

    else pc.addEventListener("icegatheringstatechange", () => {
      if (pc.iceGatheringState === "complete") resolve();
    });

  });

}