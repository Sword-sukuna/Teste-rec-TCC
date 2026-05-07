let videoElement = document.createElement("video");
videoElement.autoplay = true;
videoElement.playsInline = true;
document.body.appendChild(videoElement);

let canvas = document.createElement("canvas");
document.body.appendChild(canvas);

let ctx = canvas.getContext("2d");

let socket;


// 🔥 conecta via WebRTC simples (data channel + frames)
function iniciarRecepcao(stream) {

  videoElement.srcObject = stream;

}


// 🔄 desenhar frames (fallback simples se quiser expandir)
function renderLoop() {

  ctx.drawImage(videoElement, 0, 0, 640, 480);

  requestAnimationFrame(renderLoop);

}