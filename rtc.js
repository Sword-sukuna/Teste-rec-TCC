
let pc;


// =============================
// 🔧 CRIAR CONEXÃO
// =============================
function criarPC() {

  pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  });

}


// =============================
// 📷 GERAR QR DA CÂMERA
// =============================
async function gerarQRCodeCamera() {

  try {

    criarPC();

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await esperarICE();

    const base = window.location.href.split("?")[0];

    const link = `${base}?camera=${encodeURIComponent(
      JSON.stringify(pc.localDescription)
    )}`;

    const box = document.getElementById("qrcode");

    if (!box) return;

    box.innerHTML = "";

    if (typeof QRCode === "undefined") {
      alert("QRCode não carregou!");
      return;
    }

    QRCode.toCanvas(link, { width: 280 }, (err, canvas) => {

      if (err) {
        console.error(err);
        return;
      }

      box.appendChild(canvas);

    });

  } catch (e) {
    console.error("Erro QR câmera:", e);
  }

}


// =============================
// 📱 CELULAR RECEBE CÂMERA
// =============================
window.addEventListener("load", async () => {

  const params = new URLSearchParams(location.search);
  const cam = params.get("camera");

  if (!cam) return;

  criarPC();

  const offer = JSON.parse(decodeURIComponent(cam));

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
// 📥 ICE SAFE
// =============================
function esperarICE() {

  return new Promise(resolve => {

    if (!pc) return resolve();

    if (pc.iceGatheringState === "complete") return resolve();

    pc.addEventListener("icegatheringstatechange", () => {
      if (pc.iceGatheringState === "complete") resolve();
    });

    setTimeout(resolve, 3000);

  });

}