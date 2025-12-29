let mainMap;
let mainMarker;
let allReports = [];

const statusList = [
  "Uncollected on Schedule",
  "Overflowing Bin",
  "Scattered Waste",
  "Illegal Dumping",
  "Flooding Risk",
  "Other"
]

const garbageTypes = [
  "Unspecified",
  "Biodegradable",
  "Non-biodegradable",
  "Recyclable",
  "Residual",
  "Special Waste",
  "Mixed",
];

function getReportIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("report_id");
}

function showNotification(message, type = "info", duration = 3000) {
  const container = document.getElementById("notification-container");

  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  container.appendChild(notif);

  setTimeout(() => notif.classList.add("show"), 50);

  setTimeout(() => {
    notif.classList.remove("show");
    setTimeout(() => notif.remove(), 500);
  }, duration);
}

function customConfirm(message) {
  return new Promise((resolve) => {
    const container = document.getElementById("confirm-container");
    const msg = document.getElementById("confirm-message");
    const yesBtn = document.getElementById("confirm-yes");
    const noBtn = document.getElementById("confirm-no");

    msg.textContent = message;
    container.classList.remove("hidden");

    yesBtn.onclick = () => {
      container.classList.add("hidden");
      resolve(true);
    };

    noBtn.onclick = () => {
      container.classList.add("hidden");
      resolve(false);
    };
  });
}

// Load logs from backend
async function loadLogs() {
  try {
    const res = await fetch("Customs/dbase/LoadLogs.php");
    const reports = await res.json();

    allReports = Array.isArray(reports) ? reports : [];
    allReports.sort((a, b) => Number(b.id) - Number(a.id));
    displayFilteredLogs(allReports);

    const urlReport = getReportIdFromURL();
    if (!urlReport) return;

    const getReport = reports.find(r => String(r.report_id) === String(urlReport));
    if (getReport) {
      displayLogInfo(getReport);
    }
  } catch (err) {
    console.error("Error loading logs:", err);
    allReports = [];
    displayFilteredLogs([]);
  }
}

// Display log cards
function displayFilteredLogs(reports) {
  const container = document.getElementById("logContainer");
  container.innerHTML = "";

  if (!reports || reports.length === 0) {
    container.innerHTML = "<p>No matching logs found.</p>";
    return;
  }

  reports.forEach((r) => createCard(r, container));
}

// Create individual log card
function createCard(report, container) {
  const collected = Number(report.is_collected) === 1 ? "Yes" : "No";

  let searchType = garbageTypes[report.garbage_type - 1] || "Unknown";
  let searchStatus = statusList[report.garbage_status - 1] || "Unknown";

  const log = document.createElement("div");
  log.className = "logCard";

  const infoDiv = document.createElement("div");
  infoDiv.className = "logInfo";
  infoDiv.innerHTML = `
    <div><b>Report ID:</b> ${report.report_id}</div>
    <div><b>User ID:</b> ${report.user_id}</div>
    <div><b>Garbage Type:</b> ${searchType}</div>
    <div><b>Garbage Status:</b> ${searchStatus}</div>
    <div><b>Location:</b> ${report.location}</div>
    <div><b>Latitude:</b> ${report.latitude}</div>
    <div><b>Longitude:</b> ${report.longitude}</div>
    <div><b>Description:</b> ${report.description}</div>
    <div><b>Timestamp:</b> ${report.created_at}</div>
    <div><b>Mark as Collected:</b> ${collected}</div>
  `;

  const mapDiv = document.createElement("div");
  mapDiv.className = "miniMap";
  mapDiv.id = `miniMap-${report.report_id || report.id || Math.random()}`;

  const imgDiv = document.createElement("div");
  imgDiv.className = "logImages";

  (report.images || []).forEach(src => {
    if (src.trim()) {
      const img = document.createElement("img");
      img.src = encodeURI(src);
      img.alt = "Report Image";
      img.loading = "lazy";
      img.onclick = () => openViewer(src);
      imgDiv.appendChild(img);
    }
  });

  log.appendChild(mapDiv);
  log.appendChild(infoDiv);
  log.appendChild(imgDiv);
  container.appendChild(log);

  const lat = Number(report.latitude);
  const lng = Number(report.longitude);
  if (!isNaN(lat) && !isNaN(lng)) initMiniMap(mapDiv.id, lat, lng);
  else mapDiv.innerHTML = "<div style='padding:12px;font-size:12px;color:#666;'>No coordinates</div>";

  log.addEventListener("click", () => displayLogInfo(report));
}

// Display selected log info in the main panel
async function displayLogInfo(log) {
  window.history.pushState({ report_id: log.report_id }, "", `?report_id=${log.report_id}`);

  document.getElementById("report_id").textContent = log.report_id;
  document.getElementById("user_id").textContent = log.user_id;
  document.getElementById("garbage_type").textContent = (garbageTypes[log.garbage_type - 1] || "Unknown");
  document.getElementById("garbage_status").textContent = (statusList[log.garbage_status - 1] || "Unknown");
  document.getElementById("location").textContent = log.location;
  document.getElementById("lat").textContent = log.latitude;
  document.getElementById("lng").textContent = log.longitude;
  document.getElementById("desc").textContent = log.description;
  document.getElementById("timestamp").textContent = log.created_at;
  document.getElementById("collected").textContent = Number(log.is_collected) === 1 ? "Yes" : "No";

  // Display images
  const imgsContainer = document.getElementById("logImages");
  imgsContainer.innerHTML = "";
  (log.images || []).forEach(src => {
    if (src.trim()) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Report image";
      img.onclick = () => openViewer(src);
      imgsContainer.appendChild(img);
    }
  });

  // Display videos
  const vidsContainer = document.getElementById("logVideos");
  vidsContainer.innerHTML = "";
  (log.videos || []).forEach(src => {
    if (src.trim()) {
      const vid = document.createElement("video");
      vid.src = src;
      vid.controls = true;
      vid.width = 200;
      vid.style.borderRadius = "10px";
      vid.style.marginTop = "8px";
      vidsContainer.appendChild(vid);
    }
  });

  // Display main map
  const lat = Number(log.latitude);
  const lng = Number(log.longitude);
  if (!isNaN(lat) && !isNaN(lng)) {
    if (!mainMap) {
      mainMap = L.map("mainmap", {
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        zoomControl: true,
      }).setView([lat, lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mainMap);
      mainMarker = L.marker([lat, lng]).addTo(mainMap);
    } else {
      mainMap.setView([lat, lng], 13);
      mainMarker.setLatLng([lat, lng]);
    }
    mainMap.dragging.disable();
    mainMap.touchZoom.disable();
    mainMap.scrollWheelZoom.disable();
    mainMap.doubleClickZoom.disable();
  }
  // Handle "Mark as Collected" button
  const btnContainer = document.getElementById("collectBtnContainer");
  btnContainer.innerHTML = ""; // clear any previous button

  try {
    const userRes = await fetch("Customs/dbase/GetUser.php");

    if (!userRes.ok) throw new Error("Failed to fetch user identity");

    const userData = await userRes.json();
    const isAdmin = userData.info.user_role && userData.info.user_role.trim().toLowerCase() === "admin";
    const isCollected = Number(log.is_collected) === 1;

    if (isAdmin && !isCollected) {
      const btn = document.createElement("button");
      btn.textContent = "Mark as Collected";
      btn.className = "collect-btn";
      btn.style.marginTop = "10px";
      btn.style.padding = "6px 12px";
      btn.style.border = "none";
      btn.style.backgroundColor = "#4CAF50";
      btn.style.color = "#fff";
      btn.style.borderRadius = "4px";
      btn.style.cursor = "pointer";
      btn.onclick = async () => {
        if (!customConfirm("Mark this as collected?")) return;

        try {
          const res = await fetch("Customs/dbase/UpdateCollected.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ report_id: log.report_id })
          });

          if (!res.ok) throw new Error("Network response was not ok");

          const data = await res.json();

          if (data.status === "success") {
            showNotification("Log marked as collected", "success");
            displayLogInfo({ ...log, is_collected: 1 });
            loadLogs();
          }
        } catch (err) {
          console.error("Error updating collected status:", err);
          showNotification("Failed to update collected status.", "error");
          return;
        };

        const message = `This is to notify you that your report (${log.report_id}) has been marked as collected!`

        try {
          const response = await fetch("Customs/api/SMSCode.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ number: log.user_phone, message: message }),
          });

          if (!response.ok) {
            throw new Error("Network response was not ok: " + response.status);
          }
          const data = await response.json();

          if (data.status !== "success") {
            throw new Error("Failed to message: " + (data.response || "Unknown error"));
          }
        } catch (err) {
          console.error("Error fetching user contact:", err);
          showNotification("Failed to fetch user contact.", "error");
          return;
        }
      }
      btnContainer.appendChild(btn);
    }
  } catch (err) {
    console.error("Error fetching user identity:", err);
  }

}

// Initialize mini map
function initMiniMap(mapId, lat, lng) {
  const el = document.getElementById(mapId);
  if (!el || el.dataset.mapInitialized) return;
  const map = L.map(mapId, {
    center: [lat, lng],
    zoom: 13,
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
  });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  L.marker([lat, lng]).addTo(map);
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  el.dataset.mapInitialized = "1";
}

// Filters
function applyFilters() {
  let filtered = [...allReports];
  const typeValue = document.getElementById("typeFilter").value;
  const dateValue = document.getElementById("dateFilter").value;
  const idValue = document.getElementById("idFilter")?.value.trim();

  if (typeValue === "Collected") filtered = filtered.filter(r => Number(r.is_collected) === 1);
  else if (typeValue === "Uncollected") filtered = filtered.filter(r => Number(r.is_collected) === 0);
  else if (typeValue === "ID" && idValue) filtered = filtered.filter(r => String(r.report_id) === idValue);

  if (dateValue) filtered = filtered.filter(r => r.created_at && new Date(r.created_at).toISOString().split("T")[0] === dateValue);

  displayFilteredLogs(filtered);
}

function resetFilters() {
  document.getElementById("typeFilter").value = "all";
  document.getElementById("idFilter").value = "";
  document.getElementById("dateFilter").value = "";
  document.getElementById("idFilterContainer").style.display = "none";
  displayFilteredLogs(allReports);
}

function handleTypeChange() {
  const type = document.getElementById("typeFilter").value;
  const idContainer = document.getElementById("idFilterContainer");
  const idInput = document.getElementById("idFilter");
  if (type === "ID") {
    idContainer.style.display = "inline-block";
    idInput.focus();
  } else {
    idContainer.style.display = "none";
    idInput.value = "";
  }
  applyFilters();
}

// Image viewer
function openViewer(src) {
  const viewer = document.getElementById("imageViewer");
  const img = document.getElementById("viewerImg");
  if (viewer && img) {
    img.src = src;
    viewer.style.display = "flex";
  }
}

function closeViewer() {
  const viewer = document.getElementById("imageViewer");
  if (viewer) viewer.style.display = "none";
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadLogs();
  handleTypeChange();
  document.getElementById("searchBtn").addEventListener("click", applyFilters);
  document.getElementById("resetBtn").addEventListener("click", resetFilters);
  document.getElementById("typeFilter").addEventListener("change", handleTypeChange);
});
