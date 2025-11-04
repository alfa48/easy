import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Configuração Firebase (substitui pelos teus dados)
const firebaseConfig = {
  apiKey: "AIzaSyBUEXx8P0rhHp8Qrj_LDnBUZa3YN-Dv5-w", // Obtenha esta chave após registrar seu app no Firebase Console
  authDomain: "easy-5027a.firebaseapp.com",
  projectId: "easy-5027a",
  storageBucket: "easy-5027a.firebasestorage.app",
  messagingSenderId: "284914046801", // Obtenha este ID após registrar seu app no Firebase Console
  appId: "1:284914046801:web:60a0f029f11cfa0e1f6570", // Obtenha este ID após registrar seu app no Firebase Console
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elementos
const notaInput = document.getElementById("notaInput");
const btnSalvar = document.getElementById("btnSalvar");
const listaNotas = document.getElementById("listaNotas");
const modalConfirm = document.getElementById("modalConfirm");
const btnConfirmar = document.getElementById("btnConfirmar");
const btnCancelar = document.getElementById("btnCancelar");
const loading = document.getElementById("loading");

let editandoId = null;
let apagarId = null;

// Função para carregar header/footer
async function carregarFragment(id, arquivo) {
  const response = await fetch(arquivo);
  const html = await response.text();
  document.getElementById(id).innerHTML = html;
}

// Carrega fragments
carregarFragment("header", "./src/public/static/fragments/header.html");
carregarFragment("footer", "./src/public/static/fragments/footer.html");

// Salvar ou atualizar nota
async function salvarNota() {
  const texto = notaInput.value.trim();
  loading.style.display = "inline-block";

  if (!texto) return;

  if (editandoId) {
    // Atualizar
    await updateDoc(doc(db, "notas", editandoId), { texto });
    editandoId = null;
    btnSalvar.textContent = "Salvar";
  } else {
    // Criar nova
    await addDoc(collection(db, "notas"), {
      texto,
      data: new Date().toISOString(),
    });
  }

  loading.style.display = "none";
  notaInput.value = "";
  carregarNotas();
}

// Carregar notas
async function carregarNotas() {
  listaNotas.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "notas"));

  querySnapshot.forEach((docSnap) => {
    const nota = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-icons">
        <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        <svg class="delete-icon" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
      </div>
      <p>${nota.texto}</p>
    `;

    // Editar
    card.querySelector(".edit-icon").addEventListener("click", () => {
      notaInput.value = nota.texto;
      editandoId = docSnap.id;
      btnSalvar.textContent = "Atualizar";
      notaInput.focus();
    });

    // 🗑️ Apagar (abre modal)
    card.querySelector(".delete-icon").addEventListener("click", () => {
      apagarId = docSnap.id;
      modalConfirm.classList.add("active");
    });

    listaNotas.appendChild(card);
  });
}

// Confirma exclusão
btnConfirmar.addEventListener("click", async () => {
  loading.style.display = "inline-block";
  if (apagarId) {
    await deleteDoc(doc(db, "notas", apagarId));
    apagarId = null;
    modalConfirm.classList.remove("active");
    carregarNotas();
    loading.style.display = "none";
  }
});

// Cancela exclusão
btnCancelar.addEventListener("click", () => {
  apagarId = null;
  modalConfirm.classList.remove("active");
});

// Eventos principais
btnSalvar.addEventListener("click", salvarNota);
carregarNotas();
