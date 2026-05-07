
window.pc = null;
let streamLocal = null;


// =============================
// 🔧 CRIAR PC (SEGURO)
// =============================
function criarPC() {

  // evita duplicar conexão (ERRO MUITO COMUM)
  if (window.pc) {
    try {
      window.pc.close();
    } catch {}
  }

  window.pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  });

  console.log("🧠 PC criado");

  // =========================
  // 📹 RECEBER VÍDEO (CRÍTICO)
  // =========================
  window.pc.ontrack = (event) => {

    console.log("📹 TRACK RECEBIDO");

    const video = document.getElementById("video");

    if (!video) {
      console.error("❌ video não existe no DOM");
      return;
    }

    const [stream] = event.streams;

    if (!stream) {
      console.error("❌ stream vazio");
      return;
    }

    video.srcObject = stream;

    video.onloadedmetadata = async () => {
      try {
        await video.play();
        console.log("▶️ vídeo rodando");
      } catch (err) {
        console.warn("⚠️ autoplay bloqueado:", err);
      }
    };

  };

}


// =============================
// 📷 GERAR QR CAMERA (PC)
// =============================
async function gerarQRCodeCamera() {

  try {

    criarPC();

    const offer = await window.pc.createOffer();
    await window.pc.setLocalDescription(offer);

    console.log("📡 offer criado");

    await esperarICE();

    const base = window.location.href.split("?")[0];

    const link = `${base}?camera=${encodeURIComponent(
      JSON.stringify(window.pc.localDescription)
    )}`;

    const box = document.getElementById("qrcode");

    if (!box) {
      console.error("❌ #qrcode não existe");
      return;
    }

    box.innerHTML = "";

    if (!window.QRCode) {
      console.error("❌ QRCode não carregou");
      return;
    }

    QRCode.toCanvas(link, { width: 280 }, (err, canvas) => {

      if (err) {
        console.error("❌ erro QR:", err);
        return;
      }

      box.appendChild(canvas);

      console.log("✅ QR gerado");

    });

  } catch (err) {
    console.error("❌ erro geral QR:", err);
  }

}


// =============================
// 📱 CELULAR (CÂMERA)
// =============================
window.addEventListener("load", async () => {

  const params = new URLSearchParams(location.search);
  const cam = params.get("camera");

  if (!cam) return;

  try {

    console.log("📱 modo câmera detectado");

    criarPC();

    const offer = JSON.parse(decodeURIComponent(cam));

    await window.pc.setRemoteDescription(offer);

    console.log("📡 offer recebido");

    // abre câmera com fallback
    streamLocal = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    if (!streamLocal) {
      console.error("❌ câmera não abriu");
      return;
    }

    streamLocal.getTracks().forEach(track => {
      window.pc.addTrack(track, streamLocal);
    });

    const answer = await window.pc.createAnswer();
    await window.pc.setLocalDescription(answer);

    console.log("📡 answer enviada");

  } catch (err) {
    console.error("❌ erro celular:", err);
  }

});


// =============================
// ⏳ ICE ROBUSTO
// =============================
function esperarICE() {

  return new Promise(resolve => {

    if (!window.pc) return resolve();

    if (window.pc.iceGatheringState === "complete") {
      console.log("ICE pronto");
      return resolve();
    }

    const timeout = setTimeout(() => {
      console.warn("⏳ ICE timeout (continuando mesmo assim)");
      resolve();
    }, 4000);

    window.pc.addEventListener("icegatheringstatechange", () => {

      console.log("ICE:", window.pc.iceGatheringState);

      if (window.pc.iceGatheringState === "complete") {
        clearTimeout(timeout);
        resolve();
      }

    });

  });

}