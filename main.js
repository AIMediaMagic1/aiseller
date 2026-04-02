const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const fileInfo = document.getElementById("file-info");
const btnAnalyze = document.getElementById("btn-analyze");
const errorMsg = document.getElementById("error-msg");

let selectedFile = null;

const loadingMessages = [
  "Leyendo bases de licitación...",
  "Identificando requisitos técnicos...",
  "Detectando riesgos ocultos...",
  "Generando análisis SEMSA...",
];

dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const f = e.dataTransfer.files[0];
  if (f && f.type === "application/pdf") setFile(f);
  else showError("Solo se aceptan archivos PDF.");
});

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

document.getElementById("btn-reset").addEventListener("click", reset);

function setFile(f) {
  selectedFile = f;
  document.getElementById("file-name-text").textContent = f.name;
  document.getElementById("file-size-text").textContent = (f.size / 1024).toFixed(0) + " KB";
  fileInfo.classList.add("visible");
  btnAnalyze.disabled = false;
  hideError();
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add("visible");
}

function hideError() {
  errorMsg.classList.remove("visible");
}

btnAnalyze.addEventListener("click", async () => {
  if (!selectedFile) return;

  document.getElementById("upload-section").classList.add("hidden");
  const loadingSection = document.getElementById("loading-section");
  loadingSection.classList.remove("hidden");

  let msgIdx = 0;
  const loadingText = document.getElementById("loading-text");
  const interval = setInterval(() => {
    msgIdx = (msgIdx + 1) % loadingMessages.length;
    loadingText.textContent = loadingMessages[msgIdx];
  }, 2500);

  const formData = new FormData();
  formData.append("pdf", selectedFile);

  try {
    const response = await fetch("/analizar", { method: "POST", body: formData });
    const data = await response.json();

    clearInterval(interval);
    loadingSection.classList.add("hidden");

    if (data.error) {
      document.getElementById("upload-section").classList.remove("hidden");
      showError(data.error);
      return;
    }

    showResults(data);
  } catch (err) {
    clearInterval(interval);
    loadingSection.classList.add("hidden");
    document.getElementById("upload-section").classList.remove("hidden");
    showError("Error de conexión. Verifica tu internet e intenta de nuevo.");
  }
});

function showResults(data) {
  const verdictCard = document.getElementById("verdict-card");
  verdictCard.className = "verdict-card";

  if (data.veredicto === "SI") verdictCard.classList.add("verdict-si");
  else if (data.veredicto === "NO") verdictCard.classList.add("verdict-no");
  else verdictCard.classList.add("verdict-parcial");

  const emoji =
    data.veredicto === "SI" ? "✓ Viable para SEMSA" :
    data.veredicto === "NO" ? "✗ No recomendada" :
    "⚠ Viable con condiciones";

  document.getElementById("verdict-text").textContent = emoji + "\n\n" + (data.veredicto_razon || "");
  document.getElementById("resumen").textContent = data.resumen || "";
  document.getElementById("requisitos").textContent = data.requisitos || "";
  document.getElementById("riesgos").textContent = data.riesgos || "";
  document.getElementById("checklist").textContent = data.checklist || "";

  document.getElementById("results-section").classList.remove("hidden");
}

function reset() {
  selectedFile = null;
  fileInput.value = "";
  fileInfo.classList.remove("visible");
  btnAnalyze.disabled = true;
  document.getElementById("results-section").classList.add("hidden");
  document.getElementById("upload-section").classList.remove("hidden");
  hideError();
}
