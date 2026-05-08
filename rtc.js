window.pc = null;
    video:true,
    audio:false
  });

  stream.getTracks().forEach(track=>{
    window.pc.addTrack(track, stream);
  });

  const answer = await window.pc.createAnswer();

  await window.pc.setLocalDescription(answer);

  await esperarICE();

  const textarea = document.createElement("textarea");

  textarea.value = JSON.stringify(window.pc.localDescription);

  textarea.style.width = "95%";
  textarea.style.height = "180px";

  document.body.appendChild(textarea);

});


async function receberAnswer(){

  const txt = document.getElementById("answer").value;

  if(!txt) return;

  const answer = JSON.parse(txt);

  await window.pc.setRemoteDescription(answer);

}


function esperarICE(){

  return new Promise(resolve=>{

    if(window.pc.iceGatheringState === "complete"){
      resolve();
    }

    window.pc.addEventListener(
      "icegatheringstatechange",
      ()=>{

        if(window.pc.iceGatheringState === "complete"){
          resolve();
        }

      }
    );

    setTimeout(resolve,3000);

  });

}