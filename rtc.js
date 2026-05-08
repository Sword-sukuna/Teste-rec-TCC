
// =============================
// 🌐 conexão global
// =============================
window.pc = null;


// =============================
// 🔧 criar conexão
// =============================
function criarPC() {

  // fecha conexão antiga
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

  // =========================
  // 📹 RECEBER STREAM NO PC
  // =========================
  window.pc.ontrack = (event) => {

    console.log("📹 stream recebido");

    const video = document.getElementById("video");

    if (!video) {
      console.error("❌ elemento #video não encontrado");
      return;
    }

    video.srcObject = event.streams[0];

    video.onloadedmetadata = async () => {
      try {
        await video.play();
        console.log("▶️ preview iniciado");
      } catch (err) {
        console.error("Erro play vídeo:", err);
      }
    };

  };

}


// =============================
// 📷 GERAR QR DA CAMERA
// =============================
async function gerarQRCodeCamera() {

  try {

    criarPC();

    const offer = await window.pc.createOffer();

    await window.pc.setLocalDescription(offer);

    await esperarICE();

    const link =
      window.location.href.split("?")[0] +
      "?camera=" +
      encodeURIComponent(
        JSON.stringify(window.pc.localDescription)
      );

    const qrcode = document.getElementById("qrcode");

    if (!qrcode) {
      console.error("❌ qrcode div não encontrada");
      return;
    }

    qrcode.innerHTML = "";

    QRCode.toCanvas(
      link,
      { width: 280 },
      (err, canvas) => {

        if (err) {
          console.error("Erro QR:", err);
          return;
        }

        qrcode.appendChild(canvas);

      }
    );

    console.log("✅ QR gerado");

  } catch (err) {
    console.error("Erro gerar QR:", err);
  }

}


// =============================
// 📱 CELULAR
// =============================
window.addEventListener("load", async () => {

  const params = new URLSearchParams(location.search);

  const camera = params.get("camera");

  if (!camera) return;

  try {

    console.log("📱 modo câmera");

    criarPC();

    const offer = JSON.parse(
      decodeURIComponent(camera)
    );

    await window.pc.setRemoteDescription(offer);

    // 📷 abrir câmera
    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

    // preview local no celular
    const localVideo =
      document.createElement("video");

    localVideo.srcObject = stream;
    localVideo.autoplay = true;
    localVideo.playsInline = true;

    localVideo.style.width = "100%";

    document.body.appendChild(localVideo);

    // enviar tracks
    stream.getTracks().forEach(track => {
      window.pc.addTrack(track, stream);
    });

    // criar ANSWER
    const answer =
      await window.pc.createAnswer();

    await window.pc.setLocalDescription(answer);

    await esperarICE();

    // =========================
    // 📡 mostrar ANSWER
    // =========================
    const textarea =
      document.createElement("textarea");

    textarea.value =
      JSON.stringify(window.pc.localDescription);

    textarea.style.width = "95%";
    textarea.style.height = "180px";

    document.body.appendChild(textarea);

    // botão copiar
    const btn =
      document.createElement("button");

    btn.innerText = "📋 Copiar Answer";

    btn.onclick = async () => {

      await navigator.clipboard.writeText(
        textarea.value
      );

      alert("Answer copiado");

    };

    document.body.appendChild(btn);

  } catch (err) {
    console.error("Erro mobile:", err);
  }

});


// =============================
// 💻 RECEBER ANSWER NO PC
// =============================
async function receberAnswer() {

  try {

    const txt =
      document.getElementById("answer").value;

    if (!txt) {
      alert("Cole o answer");
      return;
    }

    const answer = JSON.parse(txt);

    await window.pc.setRemoteDescription(answer);

    console.log("✅ conexão completa");

  } catch (err) {
    console.error("Erro answer:", err);
  }

}


// =============================
// ⏳ ICE
// =============================
function esperarICE() {

  return new Promise(resolve => {

    if (!window.pc) return resolve();

    if (
      window.pc.iceGatheringState ===
      "complete"
    ) {
      resolve();
    }

    window.pc.addEventListener(
      "icegatheringstatechange",
      () => {

        if (
          window.pc.iceGatheringState ===
          "complete"
        ) {
          resolve();
        }

      }
    );

    setTimeout(resolve, 3000);

  });

}