let timelineData = [];
let currentIndex = 0;
let unitsVisible = true;

const elements = {
  mapImage: document.getElementById("battleMapImage"),
  mapFrame: document.getElementById("mapFrame"),
  unitsLayer: document.getElementById("unitsLayer"),
  mapTitle: document.getElementById("mapTitle"),
  timeline: document.getElementById("timeline"),
  stageDate: document.getElementById("stageDate"),
  stageTitle: document.getElementById("stageTitle"),
  stageDescription: document.getElementById("stageDescription"),
  unitsList: document.getElementById("unitsList"),
  prev: document.getElementById("prevStep"),
  next: document.getElementById("nextStep"),
  toggleUnits: document.getElementById("toggleUnits"),
};

function renderTimeline() {
  elements.timeline.innerHTML = "";

  timelineData.forEach((stage, index) => {
    const button = document.createElement("button");
    button.className = "timeline-button";
    button.type = "button";
    button.innerHTML = `
      <strong>${stage.date}</strong>
      <span>${stage.shortTitle || stage.title}</span>
    `;

    if (index === currentIndex) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      currentIndex = index;
      updateStage();
    });

    elements.timeline.appendChild(button);
  });
}

function removePopup() {
  const oldPopup = document.querySelector(".unit-popup");
  if (oldPopup) {
    oldPopup.remove();
  }
}

function showUnitPopup(unit) {
  removePopup();

  const popup = document.createElement("div");
  popup.className = "unit-popup";
  popup.style.left = `${unit.x}%`;
  popup.style.top = `${unit.y}%`;

  popup.innerHTML = `
    <button type="button" aria-label="Закрыть">×</button>
    <h4>${unit.name}</h4>
    <p>${unit.description || ""}</p>
  `;

  popup.querySelector("button").addEventListener("click", removePopup);
  elements.mapFrame.appendChild(popup);
}

function renderUnits(stage) {
  elements.unitsLayer.innerHTML = "";
  removePopup();

  const units = stage.units || [];

  units.forEach((unit) => {
    const point = document.createElement("button");
    point.type = "button";
    point.className = `unit-point ${unit.color || "blue"}`;
    point.style.left = `${unit.x}%`;
    point.style.top = `${unit.y}%`;
    point.textContent = unit.short || "Ч";
    point.title = unit.name;

    if (!unitsVisible) {
      point.classList.add("hidden");
    }

    point.addEventListener("click", () => showUnitPopup(unit));
    elements.unitsLayer.appendChild(point);
  });

  if (units.length === 0) {
    elements.unitsList.innerHTML = `<p class="empty-units">Для этого этапа военные части пока не добавлены.</p>`;
    return;
  }

  elements.unitsList.innerHTML = units.map((unit) => `
    <div class="unit-list-item ${unit.color || "blue"}">
      <strong>${unit.name}</strong>
      <p>${unit.description || ""}</p>
    </div>
  `).join("");
}

function updateUnitsVisibility() {
  document.querySelectorAll(".unit-point").forEach((point) => {
    point.classList.toggle("hidden", !unitsVisible);
  });

  elements.toggleUnits.textContent = unitsVisible
    ? "Скрыть военные части"
    : "Показать военные части";

  if (!unitsVisible) {
    removePopup();
  }
}

function updateStage() {
  const stage = timelineData[currentIndex];

  if (!stage) {
    return;
  }

  elements.mapImage.src = stage.mapImage;
  elements.mapImage.alt = stage.title;
  elements.mapTitle.textContent = stage.title;
  elements.stageDate.textContent = stage.date;
  elements.stageTitle.textContent = stage.title;
  elements.stageDescription.textContent = stage.description;

  renderTimeline();
  renderUnits(stage);
  updateUnitsVisibility();
}

function setupControls() {
  elements.prev.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateStage();
  });

  elements.next.addEventListener("click", () => {
    currentIndex = Math.min(timelineData.length - 1, currentIndex + 1);
    updateStage();
  });

  elements.toggleUnits.addEventListener("click", () => {
    unitsVisible = !unitsVisible;
    updateUnitsVisibility();
  });
}

async function loadTimeline() {
  try {
    const response = await fetch("/api/timeline");

    if (!response.ok) {
      throw new Error("Не удалось загрузить timeline.json");
    }

    timelineData = await response.json();

    if (!Array.isArray(timelineData) || timelineData.length === 0) {
      throw new Error("timeline.json пустой или имеет неправильный формат");
    }

    updateStage();
  } catch (error) {
    elements.mapTitle.textContent = "Ошибка загрузки";
    elements.stageTitle.textContent = "Ошибка загрузки";
    elements.stageDescription.textContent = error.message;
    console.error(error);
  }
}

setupControls();
loadTimeline();
