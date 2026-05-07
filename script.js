let alunos = [];

try {

  alunos =
    JSON.parse(localStorage.getItem("alunos"))
    || [];

} catch {

  alunos = [];

}

const form =
document.getElementById("formAluno");

const lista =
document.getElementById("lista");

const buscar =
document.getElementById("buscar");

form.addEventListener(
"submit",
async (e)=>{

  e.preventDefault();

  const nome =
  document.getElementById("nome").value;

  const senha =
  document.getElementById("senha").value;

  const fotoInput =
  document.getElementById("foto");

  let foto = "";

  if(fotoInput.files[0]){

    foto =
    await converterBase64(
      fotoInput.files[0]
    );

  }

  alunos.push({

    id:Date.now(),

    nome,

    senha,

    foto,

    horaCadastro:
    new Date().toLocaleString()

  });

  localStorage.setItem(
    "alunos",
    JSON.stringify(alunos)
  );

  form.reset();

  renderizar();

  alert("Aluno cadastrado!");

});

buscar.addEventListener(
"input",
renderizar
);

function renderizar(){

  const termo =
  buscar.value.toLowerCase();

  const filtrados =
  alunos.filter(a=>

    a.nome
    .toLowerCase()
    .includes(termo)

  );

  lista.innerHTML =
  filtrados.map(aluno=>`

    <div class="card">

      ${
        aluno.foto
        ? `<img src="${aluno.foto}">`
        : ""
      }

      <div class="info">

        <h3>
          ${aluno.nome}
        </h3>

        <p class="senha">
          🔒 ${aluno.senha}
        </p>

        <p>
          🕒 ${aluno.horaCadastro}
        </p>

      </div>

    </div>

  `).join("");

}

function converterBase64(file){

  return new Promise(
    (resolve,reject)=>{

      const reader =
      new FileReader();

      reader.readAsDataURL(file);

      reader.onload=
      ()=>resolve(reader.result);

      reader.onerror=
      error=>reject(error);

    }
  );

}

renderizar();