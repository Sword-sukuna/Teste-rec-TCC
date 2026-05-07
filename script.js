
// =============================
// 🧠 SEGURANÇA DOM
// =============================
function $(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn("⚠️ Elemento não encontrado:", id);
  }
  return el;
}


// =============================
// 📦 ESTADO GLOBAL
// =============================
let pc = null;


// =============================
// 🚀 INICIALIZAÇÃO SEGURA
// =============================
document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ Sistema iniciado com segurança");

  iniciarEventos();

});


// =============================
// 🎯 EVENTOS
// =============================
function iniciarEventos() {

  const btn = $("cadastrar");

  if (btn) {
    btn.addEventListener("click", cadastrarAluno);
  }

}


// =============================
// 👨‍🎓 CADASTRAR ALUNO (EXEMPLO)
// =============================
function cadastrarAluno() {

  const nomeInput = $("nome");
  const lista = $("lista");

  if (!nomeInput || !lista) return;

  const nome = nomeInput.value.trim();

  if (!nome) {
    alert("Digite um nome");
    return;
  }

  const div = document.createElement("div");
  div.innerText = nome;

  lista.appendChild(div);

  nomeInput.value = "";

  log("👨‍🎓 Aluno cadastrado: " + nome);

}


// =============================
// 📋 LOGS
// =============================
function log(msg) {

  const logs = $("logs");

  if (!logs) return;

  const div = document.createElement("div");
  div.innerText = msg;

  logs.prepend(div);

}


// =============================
// 📡 WEBRTC BASE SEGURA
// =============================
function criarPC() {

  pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  });

}


// =============================
// 📷 QR CAMERA (BLINDADO)
// =============================
async function gerarQRCodeCamera() {

  try {

    const qrcode = $("qrcode");

    if (!qrcode) return;

    criarPC();

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await esperarICE();

    const base = window.location.href.split("?")[0];

    const link = `${base}?camera=${encodeURIComponent(
      JSON.stringify(pc.localDescription)
    )}`;

    qrcode.innerHTML = "";

    if (typeof QRCode === "undefined") {
      console.error("❌ QRCode.js não carregou");
      return;
    }

    QRCode.toCanvas(link, { width: 280 }, (err, canvas) => {

      if (err) {
        console.error(err);
        return;
      }

      qrcode.appendChild(canvas);

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

  try {

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

    log("📱 Câmera conectada");

  } catch (err) {
    console.error("Erro câmera:", err);
  }

});


// =============================
// ⏳ ICE SAFE
// =============================
function esperarICE() {

  return new Promise(resolve => {

    if (!pc) return resolve();

    if (pc.iceGatheringState === "complete") {
      resolve();
    }

    pc.addEventListener("icegatheringstatechange", () => {
      if (pc.iceGatheringState === "complete") {
        resolve();
      }
    });

    setTimeout(resolve, 3000);

  });

}